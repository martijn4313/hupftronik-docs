/* ============ interactions layer ============ */

import { LIB } from './components.js';
import { GAUGES, DIN } from './constants.js';
import { state, uid, comp, esc } from './state.js';
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
    ['Control', ['relay','relay5','switch','ecu']],
    ['Engine Management', ['injector', 'sensor2', 'sensor3', 'valve']],
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
  const ecuProps=type==='ecu'?{pinCount:4}:{};
  
  // Initialize Note with default properties
  const noteProps=type==='note'?{noteText:'Note',bgColor:'#1e1a2e',textColor:'#b39ddb',hAlign:'center',vAlign:'middle'}:{};
  
  const c={
    id:uid(), type,
    des:prefix+state.counters[prefix],
    label:'', value:d.value||'', r:0,
    textOffsets:{des:{x:0,y:0},label:{x:0,y:0}},
    pinTextOffsets:{},
    x:snap(state.view.x+state.view.w/2-d.w/2+(state.cascade%5)*24),
    y:snap(state.view.y+state.view.h/2-d.h/2+(state.cascade%5)*24),
    ...ecuProps,
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

let drag=null;
let lastClick = { time: 0, wireId: null, handleIdx: null };

export function setupSVGHandlers(){
  svg.addEventListener('pointerdown',e=>{
  const handle=e.target.closest('.wp-handle');
  const pin=e.target.closest('.pin');
  const text=e.target.closest('.comp-text');
  const body=e.target.closest('.comp-body');
  const wire=e.target.closest('.wire-hit');
  const p=worldPt(e);
  const now = Date.now();

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
    if(!state.pending){ state.pending={compId,pinId}; }
    else{
      if(!(state.pending.compId===compId&&state.pending.pinId===pinId)){
        state.wires.push({id:uid(),
          a:{comp:state.pending.compId,pin:state.pending.pinId},
          b:{comp:compId,pin:pinId},
          color:state.wireDefaults.color,tracer:state.wireDefaults.tracer,gauge:state.wireDefaults.gauge,
          wp:[]});
        state.sel={kind:'wire',id:state.nextId-1};
      }
      state.pending=null;
    }
    render();
    return;
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
  /* background: pan; click clears selection */
  drag={mode:'pan',sx:e.clientX,sy:e.clientY,vx:state.view.x,vy:state.view.y,moved:false};
  svg.setPointerCapture(e.pointerId);
});

svg.addEventListener('pointermove',e=>{
  if(state.pending){renderTemp(worldPt(e));}
  if(!drag) return;
  if(drag.mode==='wp'){
    const p=worldPt(e);
    drag.w.wp[drag.idx]={x:snap(p.x),y:snap(p.y)};
    renderWires();renderHandles();
  } else if(drag.mode==='comp'){
    const p=worldPt(e);
    drag.c.x=snap(p.x-drag.dx); drag.c.y=snap(p.y-drag.dy);
    drag.moved=true;
    renderWires();renderComps();
  } else if(drag.mode==='text'){
    const p=worldPt(e);
    const local=localPointFromWorld(drag.c,p);
    if(drag.role==='pin'){
      const d=LIB[drag.c.type];
      const pin=d.pins.find(pin=>pin.id===drag.pinId);
      const base=pinTextAnchor(d,pin);
      drag.c.pinTextOffsets = drag.c.pinTextOffsets || {};
      drag.c.pinTextOffsets[drag.pinId]={
        x:snap(local.x-base.x),
        y:snap(local.y-base.y)
      };
    } else {
      const base=textAnchor(drag.role,LIB[drag.c.type]);
      drag.c.textOffsets = drag.c.textOffsets || {des:{x:0,y:0},label:{x:0,y:0}};
      drag.c.textOffsets[drag.role]={
        x:snap(local.x-base.x),
        y:snap(local.y-base.y)
      };
    }
    drag.moved=true;
    renderComps();
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
  if(drag&&drag.mode==='pan'&&!drag.moved){ state.sel=null; state.pending=null; render(); }
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
  if(e.key==='Escape'){state.pending=null;render();}
  if(e.key==='Delete'||e.key==='Backspace'){deleteSelection();render();}
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
