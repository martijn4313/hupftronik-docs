/* ============ interactions layer ============ */

import { LIB, IGN_CONDUCT } from './components.js';
import { GAUGES, DIN } from './constants.js';
import { state, uid, comp, esc, hooks } from './state.js';
import { snap, pinPos, localPointFromWorld, textAnchor, pinTextAnchor, pinTextOffset } from './geometry.js';
import { render, renderWires, renderComps, renderHandles, renderStatus, renderTemp, svg, applyView, deleteSelection, renderProps } from './render.js';

// palette rendering
export function paletteIcon(type){
  const d=LIB[type];
  const c={value:d.value||'',label:'',des:''};
  
  // Target dimensions for the thumbnail
  const thumbW = 52;
  const thumbH = 38;
  const padding = 2;
  
  // Calculate scale to fit within padding area
  const maxW = thumbW - padding * 2;
  const maxH = thumbH - padding * 2;
  const scale = Math.min(maxW / d.w, maxH / d.h, 1);
  
  // Calculate scaled dimensions
  const scaledW = d.w * scale;
  const scaledH = d.h * scale;
  
  // Calculate offsets to center content
  const offsetX = (thumbW - scaledW) / 2;
  const offsetY = (thumbH - scaledH) / 2;
  
  return `<svg width="${thumbW}" height="${thumbH}" viewBox="0 0 ${thumbW} ${thumbH}"
    style="max-width:${thumbW}px;max-height:${thumbH}px"><g transform="translate(${offsetX},${offsetY}) scale(${scale})">${d.draw(c)}</g></svg>`;
}

export function buildPalette(){
  const groups=[
    ['Power', ['battery','fuse','ground','splice']],
    ['Control', ['relay','relay5','switch','ignition','ecu']],
    ['Ignition', ['ignAmp1','ignAmp2','coil','coil2x2','cop','distributor','sparkplug']],
    ['Electronics', ['resistor','diode','capacitor','npn','pnp','nchannel','pchannel']],
    ['Engine Management', ['injector', 'sensor2', 'sensor3', 'o2sensor3', 'o2sensor4', 'o2sensor5', 'valve', 'idleValve2', 'idleValve3', 'idleStepper', 'idleWax']],
    ['Loads', ['motor','pump','lamp']],
    ['Harness', ['connector', 'ublock']],
    ['Annotations', ['note']]
  ];
  document.querySelector('#palette').innerHTML = groups.map(([g,items])=>
    `<h2>${g}</h2>`+items.map(t=>
      `<button class="pal-item" data-add="${t}">${paletteIcon(t)}<span>${LIB[t].name}</span></button>`
    ).join('')).join('');
}

export function addComp(type){
  const d=LIB[type];
  const prefix=d.prefix;
  state.counters[prefix]=(state.counters[prefix]||0)+1;
  
  // Initialize ECU with default pinCount
  const ecuProps=type==='ecu'?{pinCount:4,pinStates:{}}:{};

  // Interactive-mode defaults
  const switchProps=type==='switch'?{on:false}:{};
  const ignProps=type==='ignition'?{keyPos:0}:{};

  // Initialize Note with default properties
  const noteProps=type==='note'
    ? {noteText:'Note',bgColor:'#1e1a2e',textColor:'#b39ddb',hAlign:'center',vAlign:'middle',noteW:200,noteH:60,noteFont:'inherit',noteFontSize:11}
    : {};
  
  const c={
    id:uid(), type,
    des:prefix+state.counters[prefix],
    label:'', value:d.value||'', r:0,
    textOffsets:{des:{x:0,y:0},label:{x:0,y:0}},
    pinTextOffsets:{},
    x:snap(state.view.x+state.view.w/2-d.w/2+(state.cascade%5)*24),
    y:snap(state.view.y+state.view.h/2-d.h/2+(state.cascade%5)*24),
    ...ecuProps,
    ...switchProps,
    ...ignProps,
    ...noteProps
  };
  
  // Generate pins for ECU
  if(type==='ecu'){
    c.pins=d.getPins(c.pinCount);
  }
  
  state.cascade++;
  state.comps.push(c);
  state.sel={kind:'comp',id:c.id};
  render();
}

// pointer interaction helpers
function worldPt(e){
  /* exact screen→world mapping via the SVG's own transform matrix */
  const m=svg.getScreenCTM();
  if(!m){const r=svg.getBoundingClientRect();
    return {x:state.view.x+(e.clientX-r.left)/r.width*state.view.w,
            y:state.view.y+(e.clientY-r.top)/r.height*state.view.h};}
  const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());
  return {x:p.x,y:p.y};
}

function nearestPinCandidate(p,exclude){
  const maxDist = 20;
  let best = null;
  let bestDist = maxDist;
  for(const c of state.comps){
    const d = LIB[c.type];
    const pins = c.pins || d.pins;
    for(const pin of pins){
      if(exclude && exclude.compId===c.id && exclude.pinId===pin.id) continue;
      const pp = pinPos(c,pin.id);
      const dist = Math.hypot(pp.x-p.x, pp.y-p.y);
      if(dist < bestDist){
        bestDist = dist;
        best = {compId:c.id,pinId:pin.id};
      }
    }
  }
  return best;
}

function clearTrace(){
  if(!state.trace) return;
  state.trace = null;
}

function key(compId,pinId){
  return `${compId}:${pinId}`;
}

/* ============ interactive circuit simulation ============
   Reachability from +12V sources and from grounds through the
   conducting contacts of fuses, connectors, switches, the ignition
   key and relays. Relay coils energize when 86/85 bridge the two
   sets, which can close further contacts — so iterate to a fixed
   point. Loads never conduct; they light up when they see both
   a supply and a ground. */

const SIM_LOADS = new Set(['motor','pump','lamp','injector','valve',
  'idleValve2','idleValve3','idleStepper','idleWax',
  'sensor2','sensor3','o2sensor3','o2sensor4','o2sensor5']);
const SIM_SOURCES = new Set(['battery','relay','relay5','ignition']);

export function simulate(){
  const graph={};
  for(const w of state.wires){
    const a=key(w.a.comp,w.a.pin), b=key(w.b.comp,w.b.pin);
    (graph[a] ||= []).push({to:b,wireId:w.id});
    (graph[b] ||= []).push({to:a,wireId:w.id});
  }

  const plusStarts=[], minusStarts=[];
  for(const c of state.comps){
    if(c.type==='battery'){ plusStarts.push(key(c.id,'plus')); minusStarts.push(key(c.id,'minus')); }
    if(c.type==='ground') minusStarts.push(key(c.id,'g'));
    if(c.type==='ecu'&&c.pinStates){
      for(const [pid,st] of Object.entries(c.pinStates)){
        if(st==='12v') plusStarts.push(key(c.id,pid));
        if(st==='gnd') minusStarts.push(key(c.id,pid));
      }
    }
  }

  const pairEdges=dyn=>{
    const pe={};
    const add=(cid,x,y)=>{
      (pe[key(cid,x)] ||= []).push(key(cid,y));
      (pe[key(cid,y)] ||= []).push(key(cid,x));
    };
    for(const c of state.comps){
      switch(c.type){
        case 'fuse': add(c.id,'1','2'); break;
        case 'connector': add(c.id,'a','b'); break;
        case 'resistor': add(c.id,'1','2'); break;
        case 'switch': if(c.on) add(c.id,'1','2'); break;
        case 'ignition':
          for(const [x,y] of IGN_CONDUCT[Math.max(0,Math.min(3,+c.keyPos||0))]) add(c.id,x,y);
          break;
        case 'relay': if(dyn.energized[c.id]) add(c.id,'30','87'); break;
        case 'relay5': if(dyn.energized[c.id]) add(c.id,'30','87'); else add(c.id,'30','87a'); break;
        /* a triggered power stage channel pulls its coil output to ground */
        case 'ignAmp1': if(dyn.ampCh[c.id]&&dyn.ampCh[c.id].a) add(c.id,'1','31'); break;
        case 'ignAmp2':
          if(dyn.ampCh[c.id]&&dyn.ampCh[c.id].a) add(c.id,'1a','31');
          if(dyn.ampCh[c.id]&&dyn.ampCh[c.id].b) add(c.id,'1b','31');
          break;
        /* rotor sweeps all towers — bridge them for visualization */
        case 'distributor': add(c.id,'in','ht1'); add(c.id,'in','ht2'); add(c.id,'in','ht3'); add(c.id,'in','ht4'); break;
      }
    }
    return pe;
  };

  const bfs=(starts,pe)=>{
    const seen={}, wires={};
    const q=[...starts];
    while(q.length){
      const n=q.shift();
      if(seen[n]) continue;
      seen[n]=true;
      for(const e of (graph[n]||[])){
        wires[e.wireId]=true;
        if(!seen[e.to]) q.push(e.to);
      }
      for(const t of (pe[n]||[])) if(!seen[t]) q.push(t);
    }
    return {seen,wires};
  };

  const relays=state.comps.filter(c=>c.type==='relay'||c.type==='relay5');
  const amps=state.comps.filter(c=>c.type==='ignAmp1'||c.type==='ignAmp2');
  const coils=state.comps.filter(c=>c.type==='coil'||c.type==='cop'||c.type==='coil2x2');
  let dyn={energized:{},ampCh:{},coilCh:{}};
  let plus,minus;
  for(let i=0;i<12;i++){
    const pe=pairEdges(dyn);
    /* a firing coil channel makes its HT terminal(s) hot */
    const plusS=plusStarts.slice();
    for(const t of coils){
      const ch=dyn.coilCh[t.id];
      if(!ch) continue;
      if(t.type==='coil2x2'){
        if(ch.a) plusS.push(key(t.id,'ht1'),key(t.id,'ht4'));
        if(ch.b) plusS.push(key(t.id,'ht2'),key(t.id,'ht3'));
      } else if(ch.a) plusS.push(key(t.id,'4'));
    }
    plus=bfs(plusS,pe);
    minus=bfs(minusStarts,pe);
    const next={energized:{},ampCh:{},coilCh:{}};
    for(const r of relays){
      const on = (plus.seen[key(r.id,'86')]&&minus.seen[key(r.id,'85')])
              || (plus.seen[key(r.id,'85')]&&minus.seen[key(r.id,'86')]);
      if(on) next.energized[r.id]=true;
    }
    for(const a of amps){
      const powered = plus.seen[key(a.id,'15')]&&minus.seen[key(a.id,'31')];
      const ch={};
      if(a.type==='ignAmp1'){
        if(powered&&plus.seen[key(a.id,'in')]) ch.a=true;
      } else {
        if(powered&&plus.seen[key(a.id,'in1')]) ch.a=true;
        if(powered&&plus.seen[key(a.id,'in2')]) ch.b=true;
      }
      if(ch.a||ch.b) next.ampCh[a.id]=ch;
    }
    for(const t of coils){
      const ch={};
      if(t.type==='coil2x2'){
        if(plus.seen[key(t.id,'15')]&&minus.seen[key(t.id,'1a')]) ch.a=true;
        if(plus.seen[key(t.id,'15')]&&minus.seen[key(t.id,'1b')]) ch.b=true;
      } else {
        if(plus.seen[key(t.id,'15')]&&minus.seen[key(t.id,'1')]) ch.a=true;
      }
      if(ch.a||ch.b) next.coilCh[t.id]=ch;
    }
    const stable=JSON.stringify(next)===JSON.stringify(dyn);
    dyn=next;
    if(stable) break;
  }

  const compIds={}, litCompIds={};
  for(const set of [plus.seen,minus.seen]){
    for(const n of Object.keys(set)){
      const cid=+String(n).split(':')[0];
      if(Number.isFinite(cid)) compIds[cid]=true;
    }
  }
  for(const c of state.comps){
    if(SIM_LOADS.has(c.type)){
      const pins=c.pins||LIB[c.type].pins;
      const hasPlus=pins.some(p=>plus.seen[key(c.id,p.id)]);
      const hasMinus=pins.some(p=>minus.seen[key(c.id,p.id)]);
      if(hasPlus&&hasMinus) litCompIds[c.id]=true;
    }
    if(dyn.coilCh[c.id]||dyn.ampCh[c.id]) litCompIds[c.id]=true;
    /* spark plugs ground through the engine block */
    if(c.type==='sparkplug'&&plus.seen[key(c.id,'ht')]) litCompIds[c.id]=true;
  }

  const src=state.trace?state.trace.sourceCompId:null;
  if(src!=null) compIds[src]=true;
  state.trace={sourceCompId:src,wireIds:plus.wires,gndWireIds:minus.wires,compIds,litCompIds,energized:dyn.energized};
}
hooks.simulate=simulate;

function startSim(c){
  if(!SIM_SOURCES.has(c.type)) return false;
  state.trace={sourceCompId:c.id,wireIds:{},gndWireIds:{},compIds:{},litCompIds:{},energized:{}};
  simulate();
  return true;
}

let drag=null;
let lastClick = { time: 0, wireId: null, handleIdx: null };

export function setupSVGHandlers(){
  svg.addEventListener('pointerdown',e=>{
  const handle=e.target.closest('.wp-handle');
  const pin=e.target.closest('.pin');
  const noteHandle=e.target.closest('.note-resize-handle');
  const text=e.target.closest('.comp-text');
  const body=e.target.closest('.comp-body');
  const wire=e.target.closest('.wire-hit');
  const p=worldPt(e);
  const now = Date.now();

  if(state.pending && pin){
    const compId = +pin.dataset.comp;
    const pinId = pin.dataset.pin;
    if(!(state.pending.compId===compId&&state.pending.pinId===pinId)){
      state.wires.push({id:uid(),
        a:{comp:state.pending.compId,pin:state.pending.pinId},
        b:{comp:compId,pin:pinId},
        color:state.wireDefaults.color,tracer:state.wireDefaults.tracer,gauge:state.wireDefaults.gauge,lengthMm:state.wireDefaults.lengthMm||'',
        wp:[...(state.pendingWp||[])]});
      state.sel={kind:'wire',id:state.nextId-1};
    }
    state.pending=null;
    state.pendingWp=[];
    state.connectCandidate=null;
    render();
    return;
  }

  if(handle){
    const w=state.wires.find(w=>w.id===+handle.dataset.wire);
    const idx = +handle.dataset.idx;

    if (now - lastClick.time < 300 && lastClick.handleIdx === idx && lastClick.wireId === w.id) {
      w.wp.splice(idx,1);
      render();
      lastClick.time = 0;
      return;
    }

    lastClick = { time: now, wireId: w.id, handleIdx: idx };
    drag={mode:'wp',w,idx};
    svg.setPointerCapture(e.pointerId);
    return;
  }
  if(pin){
    const compId=+pin.dataset.comp, pinId=pin.dataset.pin;
    if(!state.pending && state.trace){
      const c=comp(compId);
      if(c && c.type==='ecu'){
        /* interactive mode: clicking an ECU pin cycles off → +12V → GND */
        c.pinStates=c.pinStates||{};
        const cur=c.pinStates[pinId]||'';
        const next=cur===''?'12v':(cur==='12v'?'gnd':'');
        if(next) c.pinStates[pinId]=next; else delete c.pinStates[pinId];
        simulate();
        render();
        return;
      }
    }
    if(!state.pending){ state.pending={compId,pinId}; state.pendingWp=[]; state.connectCandidate=null; clearTrace(); }
    else{
      if(!(state.pending.compId===compId&&state.pending.pinId===pinId)){
        state.wires.push({id:uid(),
          a:{comp:state.pending.compId,pin:state.pending.pinId},
          b:{comp:compId,pin:pinId},
          color:state.wireDefaults.color,tracer:state.wireDefaults.tracer,gauge:state.wireDefaults.gauge,lengthMm:state.wireDefaults.lengthMm||'',
          wp:[...(state.pendingWp||[])]});
        state.sel={kind:'wire',id:state.nextId-1};
      }
      state.pending=null;
      state.pendingWp=[];
      state.connectCandidate=null;
    }
    render();
    return;
  }
  if(noteHandle){
    const c=comp(+noteHandle.dataset.comp);
    if(c&&c.type==='note'){
      state.sel={kind:'comp',id:c.id};
      drag={mode:'note-resize',c,moved:false};
      svg.setPointerCapture(e.pointerId);
      render();
      return;
    }
  }
  if(text){
    const c=comp(+text.dataset.comp);
    state.sel={kind:'comp',id:c.id};
    drag={mode:'text',c,role:text.dataset.role,pinId:text.dataset.pinid,moved:false};
    svg.setPointerCapture(e.pointerId);
    render();
    return;
  }
  if(body){
    const c=comp(+body.dataset.comp);
    state.sel={kind:'comp',id:c.id};
    drag={mode:'comp',c,dx:p.x-c.x,dy:p.y-c.y,moved:false};
    svg.setPointerCapture(e.pointerId);
    render();
    return;
  }
  if(wire){
    const wireId = +wire.dataset.wire;

    if (now - lastClick.time < 300 && lastClick.wireId === wireId) {
      const w=state.wires.find(w=>w.id===wireId);
      w.wp=w.wp||[];
      const snapP={x:snap(p.x),y:snap(p.y)};
      const a=pinPos(comp(w.a.comp),w.a.pin), b=pinPos(comp(w.b.comp),w.b.pin);
      const pts=[a,...w.wp,b];
      const dist=(u,v)=>Math.hypot(u.x-v.x,u.y-v.y);
      let best=0,bestCost=Infinity;
      for(let i=0;i<pts.length-1;i++){
        const cost=dist(pts[i],snapP)+dist(snapP,pts[i+1])-dist(pts[i],pts[i+1]);
        if(cost<bestCost){bestCost=cost;best=i;}
      }
      w.wp.splice(best,0,snapP);
      state.sel={kind:'wire',id:w.id};
      render();
      lastClick.time = 0;
      return;
    }

    lastClick = { time: now, wireId: wireId, handleIdx: null };

    if (!state.sel || state.sel.kind !== 'wire' || state.sel.id !== wireId) {
      state.sel={kind:'wire',id:wireId};
      render();
    }
    return;
  }
  if(state.pending){
    state.pendingWp = [...(state.pendingWp||[]), {x:snap(p.x), y:snap(p.y)}];
    state.connectCandidate = nearestPinCandidate(p, state.pending);
    render();
    renderTemp(p); /* keep the preview under the cursor, not collapsed to the pin */
    return;
  }
  /* background: pan; click clears selection */
  drag={mode:'pan',sx:e.clientX,sy:e.clientY,vx:state.view.x,vy:state.view.y,moved:false};
  svg.setPointerCapture(e.pointerId);
});

svg.addEventListener('pointermove',e=>{
  const pWorld=worldPt(e);
  if(state.pending){
    state.connectCandidate = nearestPinCandidate(pWorld, state.pending);
    if(state.connectCandidate){
      const c=comp(state.connectCandidate.compId);
      renderTemp(pinPos(c,state.connectCandidate.pinId));
    } else {
      renderTemp(pWorld);
    }
    renderComps();
  }
  if(!drag) return;
  if(drag.mode==='wp'){
    const p=pWorld;
    drag.w.wp[drag.idx]={x:snap(p.x),y:snap(p.y)};
    renderWires();renderHandles();
  } else if(drag.mode==='comp'){
    const p=pWorld;
    drag.c.x=snap(p.x-drag.dx); drag.c.y=snap(p.y-drag.dy);
    drag.moved=true;
    renderWires();renderComps();
  } else if(drag.mode==='text'){
    const p=pWorld;
    const local=localPointFromWorld(drag.c,p);
    if(drag.role==='pin'){
      const d=LIB[drag.c.type];
      const pin=(drag.c.pins||d.pins).find(pin=>pin.id===drag.pinId);
      const base=pinTextAnchor(d,pin,drag.c);
      drag.c.pinTextOffsets = drag.c.pinTextOffsets || {};
      drag.c.pinTextOffsets[drag.pinId]={
        x:snap(local.x-base.x),
        y:snap(local.y-base.y)
      };
    } else {
      const base=textAnchor(drag.role,LIB[drag.c.type],drag.c);
      drag.c.textOffsets = drag.c.textOffsets || {des:{x:0,y:0},label:{x:0,y:0}};
      drag.c.textOffsets[drag.role]={
        x:snap(local.x-base.x),
        y:snap(local.y-base.y)
      };
    }
    drag.moved=true;
    renderComps();
  } else if(drag.mode==='note-resize'){
    const local=localPointFromWorld(drag.c,pWorld);
    drag.c.noteW=Math.max(80,snap(local.x));
    drag.c.noteH=Math.max(40,snap(local.y));
    drag.moved=true;
    renderComps();
    renderProps();
  } else {
    const r=svg.getBoundingClientRect();
    const dx=(e.clientX-drag.sx)/r.width*state.view.w;
    const dy=(e.clientY-drag.sy)/r.height*state.view.h;
    if(Math.abs(dx)+Math.abs(dy)>1) drag.moved=true;
    state.view.x=drag.vx-dx; state.view.y=drag.vy-dy;
    applyView();
  }
});

svg.addEventListener('pointerup',e=>{
  if(drag&&drag.mode==='comp'&&!drag.moved){
    const c=drag.c;
    if(state.trace && c.type==='switch'){
      c.on=!c.on;
      simulate();
      render();
      drag=null;
      return;
    }
    if(state.trace && c.type==='ignition'){
      c.keyPos=((+c.keyPos||0)+1)%4;
      simulate();
      render();
      drag=null;
      return;
    }
    if(!state.pending && startSim(c)){
      render();
      drag=null;
      return;
    }
    if(state.trace){ clearTrace(); render(); }
  }
  if(drag&&drag.mode==='pan'&&!drag.moved){ state.sel=null; state.pending=null; state.pendingWp=[]; state.connectCandidate=null; clearTrace(); render(); }
  drag=null;
});

svg.addEventListener('wheel',e=>{
  e.preventDefault();
  const p=worldPt(e);
  const f=e.deltaY>0?1.12:1/1.12;
  state.view.w*=f; state.view.h*=f;
  state.view.x=p.x-(p.x-state.view.x)*f;
  state.view.y=p.y-(p.y-state.view.y)*f;
  applyView();
},{passive:false});

window.addEventListener('keydown',e=>{
  if(e.target.matches('input,select,textarea')) return;
  if(e.key==='Escape'){state.pending=null;state.pendingWp=[];state.connectCandidate=null;clearTrace();render();}
  if(e.key==='Delete'||e.key==='Backspace'){
    if(state.pending){
      /* while routing a wire: undo the last guide point */
      e.preventDefault();
      if(state.pendingWp&&state.pendingWp.length) state.pendingWp.pop();
      render();
      return;
    }
    deleteSelection();render();
  }
  if(state.sel&&state.sel.kind==='comp'&&e.key.startsWith('Arrow')){
    e.preventDefault();
    const c=comp(state.sel.id), step=e.shiftKey?1:10;
    if(e.key==='ArrowLeft')c.x-=step;
    if(e.key==='ArrowRight')c.x+=step;
    if(e.key==='ArrowUp')c.y-=step;
    if(e.key==='ArrowDown')c.y+=step;
    renderWires();renderComps();
  }
  if(state.sel&&state.sel.kind==='comp'&&e.key.toLowerCase()==='r'){
    e.preventDefault();
    const c=comp(state.sel.id);
    c.r = ((c.r||0)+90)%360;
    render();
  }
});
}

document.querySelector('#palette').addEventListener('click',e=>{
  const b=e.target.closest('[data-add]');
  if(b) addComp(b.dataset.add);
});

export function setupInteractionHandlers(){
  // Set up UI
  buildPalette();
  setupSVGHandlers();
}
