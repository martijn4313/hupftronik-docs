/* ============ IO, export, and modal layer ============ */

import { DIN, DIN_MERMAID } from './constants.js';
import { LIB, ecuHeight, IGN_POSITIONS } from './components.js';
import { state, esc, comp } from './state.js';
import { render, svg, wiresL, compsL, renderWires, renderComps, applyView } from './render.js';

let modalFile='export.txt';

/* shared by the file-load handler and the startup demo seed */
export function applyLoadedData(j){
  if(!Array.isArray(j.comps)||!Array.isArray(j.wires)) throw 0;
  state.comps=j.comps;state.wires=j.wires;state.counters=j.counters||{};state.nextId=j.nextId||1000;
  state.showWireLabels = j.showWireLabels !== false;
  state.wireDefaults = {
    color: j.wireDefaults?.color || state.wireDefaults.color,
    tracer: j.wireDefaults?.tracer || '',
    gauge: j.wireDefaults?.gauge || state.wireDefaults.gauge,
    lengthMm: j.wireDefaults?.lengthMm || ''
  };
  state.wires.forEach(w=>{w.wp=w.wp||[];w.lengthMm=w.lengthMm||'';});

  // Ensure ECU components have proper pins initialized
  state.comps.forEach(c=>{
    if(c.type==='ecu'){
      c.pinCount=c.pinCount||4;
      // regenerate pin geometry (older saves used off-grid spacing)
      // while keeping any customized labels
      const old=Array.isArray(c.pins)?c.pins:[];
      c.pins=LIB.ecu.getPins(c.pinCount);
      c.pins.forEach((p,i)=>{ if(old[i]&&old[i].label) p.label=old[i].label; });
      c.pinStates=c.pinStates&&typeof c.pinStates==='object'?c.pinStates:{};
    }
    if(c.type==='switch'){
      c.on=!!c.on;
    }
    if(c.type==='ignition'){
      c.keyPos=Math.max(0,Math.min(3,+c.keyPos||0));
    }
    if(c.type==='note'){
      c.noteText = c.noteText ?? 'Note';
      c.bgColor = c.bgColor || '#1e1a2e';
      c.textColor = c.textColor || '#b39ddb';
      c.hAlign = c.hAlign || 'center';
      c.vAlign = c.vAlign || 'middle';
      c.noteW = Math.max(80, +c.noteW || 200);
      c.noteH = Math.max(40, +c.noteH || 60);
      c.noteFont = c.noteFont || 'inherit';
      c.noteFontSize = Math.max(8, +c.noteFontSize || 11);
    }
    if(LIB[c.type]?.variants && !c.variant){
      // older saves predate the variant dropdown — treat their existing
      // freeform value text as a custom entry rather than silently
      // overwriting it with the first preset's name
      c.variant='custom';
    }
  });

  state.sel=null;state.pending=null;state.pendingWp=[];state.connectCandidate=null;state.trace=null;
}

export function download(name,text,mime){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([text],{type:mime}));
  a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),5000);
}

function openModal(title,text,fname){
  document.querySelector('#modalTitle').textContent=title;
  document.querySelector('#modalText').value=text;
  modalFile=fname;
  document.querySelector('#modal').classList.add('open');
}

export function setupIOButtons(){
  document.querySelector('#btnNew').onclick=()=>{
    if(state.comps.length&&!confirm('Clear the whole diagram?'))return;
    state.comps=[];state.wires=[];state.counters={};state.nextId=1;state.sel=null;state.pending=null;state.pendingWp=[];state.connectCandidate=null;state.trace=null;state.cascade=0;render();
  };
  
  document.querySelector('#btnFit').onclick=()=>{
    if(!state.comps.length)return;
    let x1=1e9,y1=1e9,x2=-1e9,y2=-1e9;
    for(const c of state.comps){
      const d=LIB[c.type];
      let h=d.h;
      if(c.type==='ecu'&&c.pins){
        h = ecuHeight(c.pins.length);
      }
      x1=Math.min(x1,c.x);y1=Math.min(y1,c.y);
      x2=Math.max(x2,c.x+d.w);y2=Math.max(y2,c.y+h);
    }
    const pad=80, r=svg.getBoundingClientRect(), ar=r.width/r.height;
    let w=x2-x1+pad*2,h=y2-y1+pad*2;
    if(w/h<ar) w=h*ar; else h=w/ar;
    state.view={x:(x1+x2)/2-w/2,y:(y1+y2)/2-h/2,w,h};
    applyView();
  };

  document.querySelector('#btnSave').onclick=()=>download('harness.json',
    JSON.stringify({version:1,...state},null,2),'application/json');

  document.querySelector('#btnLoad').onclick=()=>document.querySelector('#fileIn').click();

  document.querySelector('#fileIn').onchange=e=>{
    const f=e.target.files[0]; if(!f)return;
    f.text().then(t=>{
      try{
        applyLoadedData(JSON.parse(t));
        render();document.querySelector('#btnFit').click();
      }catch{ alert('That file is not a Harness Bench JSON export.'); }
    });
    e.target.value='';
  };

  document.querySelector('#btnSvg').onclick=()=>{
    const prevSel=state.sel, prevPend=state.pending, prevWp=state.pendingWp; state.sel=null;state.pending=null;state.pendingWp=[];render();
    const inner=wiresL.outerHTML+compsL.outerHTML;
    state.sel=prevSel;state.pending=prevPend;state.pendingWp=prevWp;render();
    let x1=1e9,y1=1e9,x2=-1e9,y2=-1e9;
    for(const c of state.comps){
      const d=LIB[c.type];
      let h=d.h;
      if(c.type==='ecu'&&c.pins){
        h = ecuHeight(c.pins.length);
      }
      x1=Math.min(x1,c.x-30);y1=Math.min(y1,c.y-30);
      x2=Math.max(x2,c.x+d.w+30);y2=Math.max(y2,c.y+h+30);
    }
    if(x1>x2){x1=0;y1=0;x2=800;y2=600;}
    const out=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x1} ${y1} ${x2-x1} ${y2-y1}"
  font-family="ui-monospace,Consolas,monospace">
  <rect x="${x1}" y="${y1}" width="${x2-x1}" height="${y2-y1}" fill="#15181b"/>
  ${inner}</svg>`;
    download('harness.svg',out,'image/svg+xml');
  };

  document.querySelector('#btnMermaid').onclick=()=>{
    openModal('Mermaid export — MkDocs-ready', buildMermaid(), 'harness.mermaid');
  };

  document.querySelector('#btnClose').onclick=()=>document.querySelector('#modal').classList.remove('open');
  document.querySelector('#btnCopy').onclick=async()=>{
    const t=document.querySelector('#modalText');
    try{await navigator.clipboard.writeText(t.value);document.querySelector('#btnCopy').textContent='Copied ✓';}
    catch{t.select();document.execCommand('copy');document.querySelector('#btnCopy').textContent='Copied ✓';}
    setTimeout(()=>document.querySelector('#btnCopy').textContent='Copy to clipboard',1500);
  };
  document.querySelector('#btnDlTxt').onclick=()=>download(modalFile,document.querySelector('#modalText').value,'text/plain');
  document.querySelector('#modal').addEventListener('click',e=>{if(e.target.id==='modal')document.querySelector('#modal').classList.remove('open');});
}

function mid(s){return String(s).replace(/[^A-Za-z0-9_]/g,'_');}

export function buildMermaid(){
  const L=[];
  L.push(`%%{init: {"theme":"base","themeVariables":{"primaryColor":"#f5f5f5","primaryBorderColor":"#616161","primaryTextColor":"#000000","lineColor":"#9e9e9e","edgeLabelBackground":"#ffffff","clusterBkg":"#fdf6ec","clusterBorder":"#8d6e63","titleColor":"#000000","fontSize":"14px"}}}%%`);
  L.push('flowchart LR');
  L.push('classDef power fill:#fff3c4,stroke:#b8860b,stroke-width:2px,color:#000');
  L.push('classDef battery fill:#263238,stroke:#f9a825,stroke-width:2.5px,color:#ffd600');
  L.push('classDef fuse fill:#ffe3e3,stroke:#c62828,stroke-width:2px,color:#000');
  L.push('classDef switch fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000');
  L.push('classDef load fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000');
  L.push('classDef ground fill:#eceff1,stroke:#37474f,stroke-width:2px,color:#000');
  L.push('classDef relay fill:#fdf6ec,stroke:#8d6e63,stroke-width:2px,color:#000');
  L.push('classDef conn fill:#f3e5f5,stroke:#6a1b9a,stroke-width:1.5px,color:#000');
  L.push('classDef module fill:#ede7f6,stroke:#4527a0,stroke-width:2px,color:#000');
  L.push('classDef pinCoil fill:#fff8e1,stroke:#ef6c00,stroke-width:1.5px,color:#000');
  L.push('classDef pinCom fill:#eceff1,stroke:#37474f,stroke-width:1.5px,color:#000');
  L.push('classDef pinNO fill:#e8f5e9,stroke:#2e7d32,stroke-width:1.5px,color:#000');
  L.push('classDef pinNC fill:#ffebee,stroke:#c62828,stroke-width:1.5px,color:#000');

  const edgeStyles=[]; let edgeIdx=0;
  const relays=state.comps.filter(c=>c.type==='relay'||c.type==='relay5');

  for(const r of relays){
    const D=mid(r.des), spdt=r.type==='relay5';
    L.push(`subgraph ${D}["${r.des}${r.label?' — '+r.label:''} (${spdt?'SPDT':'SPST'})"]`);
    L.push('  direction TB');
    L.push(`  ${D}_86(("86")):::pinCoil`);
    L.push(`  ${D}_85(("85")):::pinCoil`);
    L.push(`  ${D}_30(("30")):::pinCom`);
    L.push(`  ${D}_87(("87")):::pinNO`);
    if(spdt) L.push(`  ${D}_87a(("87a")):::pinNC`);
    L.push(`  ${D}_86 -.- ${D}_85`);
    edgeStyles.push({i:edgeIdx++,css:'stroke:#ef6c00,stroke-width:1.5px'});
    L.push(`  ${D}_30 === ${D}_87`);
    edgeStyles.push({i:edgeIdx++,css:'stroke:#455a64,stroke-width:2px'});
    if(spdt){L.push(`  ${D}_30 --- ${D}_87a`);
      edgeStyles.push({i:edgeIdx++,css:'stroke:#455a64,stroke-width:2px'});}
    L.push('end');
    L.push(`class ${D} relay`);
  }

  const nodeName=c=>{
    const D=mid(c.des), lbl=esc(c.label), val=esc(c.value||'');
    switch(c.type){
      case 'battery': return `${D}[("🔋 ${c.des} ${val}")]:::battery`;
      case 'fuse': return `${D}{{"${c.des} ${val}${lbl?'<br/>'+lbl:''}"}}:::fuse`;
      case 'switch': return `${D}(["${c.des}${lbl?'<br/>'+lbl:''}"]):::switch`;
      case 'ignition': return `${D}(["🔑 ${c.des} ${IGN_POSITIONS[Math.max(0,Math.min(3,+c.keyPos||0))]}${lbl?'<br/>'+lbl:''}"]):::switch`;
      case 'motor': case 'pump': return `${D}(("M${lbl?'<br/>'+lbl:''}")):::load`;
      case 'lamp': return `${D}(("✕ ${c.des}${lbl?'<br/>'+lbl:''}")):::load`;
      case 'ecu': return `${D}["${c.des} ECU${val?'<br/>'+val:''}${lbl?'<br/>'+lbl:''}"]:::module`;
      case 'connector': return `${D}>"${c.des}${lbl?' '+lbl:''}"]:::conn`;
      case 'ground': return `${D}[\\"⏚ ${c.des}${lbl?' '+lbl:''}"/]:::ground`;
      case 'splice': return `${D}(("${c.des}")):::conn`;
      case 'injector': case 'valve': return `${D}(("⚙️ ${c.des}${lbl?'<br/>'+lbl:''}")):::load`;
      case 'sensor2': case 'sensor3': case 'o2sensor3': case 'o2sensor4': case 'o2sensor5': return `${D}(["📶 ${c.des}${lbl?'<br/>'+lbl:''}"]):::module`;
      case 'idleValve2': case 'idleValve3': case 'idleStepper': case 'idleWax': return `${D}(("⚙️ ${c.des}${lbl?'<br/>'+lbl:''}")):::load`;
      case 'ublock': return `${D}["${c.des}${lbl?'<br/>'+lbl:''}"]:::module`;
      case 'ignAmp1': case 'ignAmp2': return `${D}["⚡ ${c.des}${val?' '+val:''}${lbl?'<br/>'+lbl:''}"]:::module`;
      case 'coil': case 'coil2x2': case 'cop': return `${D}["⚡ ${c.des}${val?' '+val:''}${lbl?'<br/>'+lbl:''}"]:::power`;
      case 'distributor': return `${D}["🔀 ${c.des}${lbl?'<br/>'+lbl:''}"]:::conn`;
      case 'sparkplug': return `${D}(("⚡ ${c.des}${lbl?'<br/>'+lbl:''}")):::load`;
      case 'resistor': return `${D}["${c.des} ${val}${lbl?'<br/>'+lbl:''}"]:::conn`;
      case 'diode': return `${D}{"${c.des}${lbl?'<br/>'+lbl:''}"}:::conn`;
      case 'capacitor': return `${D}["${c.des} ${val}${lbl?'<br/>'+lbl:''}"]:::conn`;
      case 'npn': case 'pnp': case 'nchannel': case 'pchannel': return `${D}["${c.des}${lbl?'<br/>'+lbl:''}"]:::module`;
    }
  };
  for(const c of state.comps){
    if(c.type==='relay'||c.type==='relay5') continue;
    L.push(nodeName(c));
  }

  const endName=(w,end)=>{
    const c=comp(end.comp);
    return (c.type==='relay'||c.type==='relay5') ? `${mid(c.des)}_${end.pin}` : mid(c.des);
  };
  for(const w of state.wires){
    const lenTxt = `${String(w.lengthMm||'').trim()}`;
    const lbl=`${w.gauge}mm²${lenTxt?` ${lenTxt}mm`:''} ${w.color}${w.tracer?'/'+w.tracer:''}`;
    L.push(`${endName(w,w.a)} ---|${lbl}| ${endName(w,w.b)}`);
    const width=parseFloat(w.gauge)>=2.5?'3px':'2px';
    edgeStyles.push({i:edgeIdx++,css:`stroke:${DIN_MERMAID[w.color]},stroke-width:${width}`});
  }

  const byCss={};
  for(const e of edgeStyles)(byCss[e.css]??=[]).push(e.i);
  for(const [css,idxs] of Object.entries(byCss))
    L.push(`linkStyle ${idxs.join(',')} ${css}`);

  return L.join('\n');
}
