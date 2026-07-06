/* ============ Mermaid flowchart export ============
   Kept free of DOM dependencies (unlike io.js) so the generator can be
   exercised headlessly against the real mermaid parser. */

import { DIN_MERMAID } from './constants.js';
import { LIB, IGN_POSITIONS } from './components.js';
import { state, esc, comp } from './state.js';

/* words the flowchart parser treats specially when they appear as a bare
   node id — a designator like "end" would otherwise kill the whole chart */
const RESERVED = new Set(['end','graph','flowchart','subgraph','direction',
  'style','linkstyle','classdef','class','click','default','o','x']);

/* designators are free text: sanitize to mermaid-safe ids, dodge reserved
   words, and keep colliding designators ("S 1" vs "S-1") as distinct nodes */
function mermaidIds(){
  const ids=new Map(), used=new Set();
  for(const c of state.comps){
    if(c.type==='note') continue;
    let base=String(c.des||'').replace(/[^A-Za-z0-9_]/g,'_');
    if(!base||RESERVED.has(base.toLowerCase())) base+='_'+c.id;
    let id=base,n=2;
    while(used.has(id)) id=base+'_'+(n++);
    used.add(id);ids.set(c.id,id);
  }
  return ids;
}

function pinsOf(c){
  const d=LIB[c.type];
  return (Array.isArray(c.pins)&&c.pins.length)?c.pins:(d?.pins||[]);
}

/* "A1:5" pin reference for a wire end, so multi-pin parts keep their
   pinout in the export; single-pin parts (ground, splice…) stay clean
   and relay ends are skipped because they target a dedicated pin node */
function pinRef(c,pinId,ids){
  if(c.type==='relay'||c.type==='relay5') return '';
  const pins=pinsOf(c);
  if(pins.length<2) return '';
  const p=pins.find(p=>p.id===pinId);
  return `${esc(c.des)||ids.get(c.id)}:${esc(p?.label||pinId)}`;
}

export function buildMermaid(){
  const L=[];
  L.push(`%%{init: {"theme":"base","themeVariables":{"primaryColor":"#f5f5f5","primaryBorderColor":"#616161","primaryTextColor":"#000000","lineColor":"#9e9e9e","edgeLabelBackground":"#ffffff","clusterBkg":"#fdf6ec","clusterBorder":"#8d6e63","titleColor":"#000000","fontSize":"14px"},"flowchart":{"curve":"linear","rankSpacing":80,"nodeSpacing":40}}}%%`);
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

  const ids=mermaidIds();
  const edgeStyles=[]; let edgeIdx=0;
  const relays=state.comps.filter(c=>c.type==='relay'||c.type==='relay5');

  for(const r of relays){
    const D=ids.get(r.id), spdt=r.type==='relay5';
    L.push(`subgraph ${D}["${esc(r.des)}${r.label?' — '+esc(r.label):''} (${spdt?'SPDT':'SPST'})"]`);
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
    const D=ids.get(c.id), des=esc(c.des)||D, lbl=esc(c.label), val=esc(c.value||'');
    switch(c.type){
      case 'battery': return `${D}[("🔋 ${des} ${val}")]:::battery`;
      case 'fuse': return `${D}{{"${des} ${val}${lbl?'<br/>'+lbl:''}"}}:::fuse`;
      case 'switch': return `${D}(["${des}${lbl?'<br/>'+lbl:''}"]):::switch`;
      case 'ignition': return `${D}(["🔑 ${des} ${IGN_POSITIONS[Math.max(0,Math.min(3,+c.keyPos||0))]}${lbl?'<br/>'+lbl:''}"]):::switch`;
      case 'motor': case 'pump': return `${D}(("M ${des}${lbl?'<br/>'+lbl:''}")):::load`;
      case 'lamp': return `${D}(("✕ ${des}${lbl?'<br/>'+lbl:''}")):::load`;
      case 'ecu': return `${D}["${des} ECU${val?'<br/>'+val:''}${lbl?'<br/>'+lbl:''}"]:::module`;
      case 'schildknappe': return `${D}["🔗 ${des} CAN Node${val?'<br/>'+val:''}${lbl?'<br/>'+lbl:''}"]:::module`;
      case 'connector': return `${D}>"${des}${lbl?' '+lbl:''}"]:::conn`;
      case 'ground': return `${D}[\\"⏚ ${des}${lbl?' '+lbl:''}"/]:::ground`;
      case 'splice': return `${D}(("${des}")):::conn`;
      case 'injector': case 'valve': return `${D}(("⚙️ ${des}${lbl?'<br/>'+lbl:''}")):::load`;
      case 'sensor2': case 'sensor3': case 'o2sensor3': case 'o2sensor4': case 'o2sensor5': return `${D}(["📶 ${des}${lbl?'<br/>'+lbl:''}"]):::module`;
      case 'idleValve2': case 'idleValve3': case 'idleStepper': case 'idleWax': return `${D}(("⚙️ ${des}${lbl?'<br/>'+lbl:''}")):::load`;
      case 'ublock': return `${D}["${des}${lbl?'<br/>'+lbl:''}"]:::module`;
      case 'ignAmp1': case 'ignAmp2': case 'ignAmp4': return `${D}["⚡ ${des}${val?' '+val:''}${lbl?'<br/>'+lbl:''}"]:::module`;
      case 'coil': case 'coil2x2': case 'cop': case 'copSmart': return `${D}["⚡ ${des}${val?' '+val:''}${lbl?'<br/>'+lbl:''}"]:::power`;
      case 'distributor': return `${D}["🔀 ${des}${lbl?'<br/>'+lbl:''}"]:::conn`;
      case 'sparkplug': return `${D}(("⚡ ${des}${lbl?'<br/>'+lbl:''}")):::load`;
      case 'resistor': return `${D}["${des} ${val}${lbl?'<br/>'+lbl:''}"]:::conn`;
      case 'diode': return `${D}{"${des}${lbl?'<br/>'+lbl:''}"}:::conn`;
      case 'capacitor': return `${D}["${des} ${val}${lbl?'<br/>'+lbl:''}"]:::conn`;
      case 'npn': case 'pnp': case 'nchannel': case 'pchannel': return `${D}["${des}${lbl?'<br/>'+lbl:''}"]:::module`;
      /* parts added to the library later still export as a plain box
         instead of a literal "undefined" line */
      default: return `${D}["${des}${val?' '+val:''}${lbl?'<br/>'+lbl:''}"]:::conn`;
    }
  };
  for(const c of state.comps){
    if(c.type==='relay'||c.type==='relay5'||c.type==='note') continue;
    L.push(nodeName(c));
  }

  const endName=(c,end)=>
    (c.type==='relay'||c.type==='relay5')
      ? `${ids.get(c.id)}_${String(end.pin).replace(/[^A-Za-z0-9_]/g,'_')}`
      : ids.get(c.id);
  for(const w of state.wires){
    const ca=comp(w.a.comp), cb=comp(w.b.comp);
    if(!ca||!cb) continue;
    const lenTxt=String(w.lengthMm||'').trim();
    const refs=[pinRef(ca,w.a.pin,ids),pinRef(cb,w.b.pin,ids)].filter(Boolean);
    const lbl=`${esc(w.gauge)}mm²${lenTxt?` ${esc(lenTxt)}mm`:''} ${esc(w.color)}${w.tracer?'/'+esc(w.tracer):''}${refs.length?'<br/>'+refs.join(' ⇄ '):''}`;
    L.push(`${endName(ca,w.a)} ---|"${lbl}"| ${endName(cb,w.b)}`);
    const width=parseFloat(w.gauge)>=2.5?'3px':'2px';
    edgeStyles.push({i:edgeIdx++,css:`stroke:${DIN_MERMAID[w.color]||'#9e9e9e'},stroke-width:${width}`});
  }

  const byCss={};
  for(const e of edgeStyles)(byCss[e.css]??=[]).push(e.i);
  for(const [css,idxs] of Object.entries(byCss))
    L.push(`linkStyle ${idxs.join(',')} ${css}`);

  return L.join('\n');
}
