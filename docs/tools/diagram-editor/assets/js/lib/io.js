/* ============ IO, export, and modal layer ============ */

import { LIB, shouldApplyPresetPins } from './components.js';
import { state } from './state.js';
import { render, svg, wiresL, compsL, renderWires, renderComps, applyView } from './render.js';
import { historyInit, historyUndo, historyRedo } from './history.js';
import { buildMermaid } from './mermaid.js';

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
    if(c.type==='schildknappe'){
      c.ioCount=c.ioCount||4;
      const old=Array.isArray(c.pins)?c.pins.filter(p=>p.io):[];
      c.pins=LIB.schildknappe.getPins(c.ioCount);
      c.pins.filter(p=>p.io).forEach((p,i)=>{ if(old[i]&&old[i].label) p.label=old[i].label; });
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
    if(shouldApplyPresetPins(c,LIB[c.type])){
      c.pins=LIB[c.type].getPins(c.variant);
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
    state.comps=[];state.wires=[];state.counters={};state.nextId=1;state.sel=null;state.pending=null;state.pendingWp=[];state.connectCandidate=null;state.trace=null;state.cascade=0;
    historyInit();
    render();
  };

  document.querySelector('#btnUndo').onclick=()=>historyUndo(render);
  document.querySelector('#btnRedo').onclick=()=>historyRedo(render);
  
  document.querySelector('#btnFit').onclick=()=>{
    if(!state.comps.length)return;
    let x1=1e9,y1=1e9,x2=-1e9,y2=-1e9;
    for(const c of state.comps){
      const d=LIB[c.type];
      let h=d.h;
      if(d.getHeight){
        h = d.getHeight(c.ioCount ?? c.pinCount ?? 4);
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
        historyInit();
        render();document.querySelector('#btnFit').click();
      }catch{ alert('That file is not a Harness Bench JSON export.'); }
    });
    e.target.value='';
  };

  document.querySelector('#btnSvg').onclick=()=>{
    const prevSel=state.sel, prevPend=state.pending, prevWp=state.pendingWp; state.sel=null;state.pending=null;state.pendingWp=[];render();
    const inner=wiresL.outerHTML+compsL.outerHTML;
    state.sel=prevSel;state.pending=prevPend;state.pendingWp=prevWp;render();

    // Measure the actual rendered content so labels, pin text and wire
    // routes are included in the export bounds (the old component-box
    // approximation cropped some of them).
    let x1,y1,x2,y2;
    const measureG=document.createElementNS('http://www.w3.org/2000/svg','g');
    try{
      measureG.innerHTML=inner;
      svg.appendChild(measureG);
      const bbox=measureG.getBBox();
      svg.removeChild(measureG);
      const pad=20;
      x1=bbox.x-pad; y1=bbox.y-pad;
      x2=bbox.x+bbox.width+pad; y2=bbox.y+bbox.height+pad;
    }catch(e){
      if(measureG.parentNode) svg.removeChild(measureG);
      x1=0;y1=0;x2=800;y2=600;
    }
    if(x1>=x2||y1>=y2||!isFinite(x1)){x1=0;y1=0;x2=800;y2=600;}

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

