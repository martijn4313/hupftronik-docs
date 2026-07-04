/* ============ geometry and coordinate helpers ============ */

import { LIB, ecuHeight } from './components.js';
import { state } from './state.js';

function compSize(c,d=LIB[c.type]){
  let w=d.w, h=d.h;
  if(c.type==='ecu'){
    const pinCount = (c.pins && c.pins.length) || c.pinCount || 4;
    h = ecuHeight(pinCount);
  }
  if(c.type==='note'){
    w = Math.max(80, +c.noteW || d.w);
    h = Math.max(40, +c.noteH || d.h);
  }
  return {w,h};
}

export function comp(id){
  return state.comps.find(c=>c.id===id);
}

export function pinPos(c,pinId){
  const d=LIB[c.type];
  const size = compSize(c,d);
  // For ECU and other components with dynamic pins, use instance pins
  const pins = c.pins || d.pins;
  const p=pins.find(p=>p.id===pinId);
  if(!p) return {x: c.x, y: c.y}; // fallback if pin not found
  let px=p.x, py=p.y;
  const r = c.r || 0;
  if(r !== 0){
    const cx=size.w/2, cy=size.h/2;
    const dx=px-cx, dy=py-cy;
    const rad=r*Math.PI/180;
    px = cx + (dx * Math.cos(rad) - dy * Math.sin(rad));
    py = cy + (dx * Math.sin(rad) + dy * Math.cos(rad));
  }
  return {x: Math.round(c.x+px), y: Math.round(c.y+py)};
}

export function snap(v){
  return Math.round(v/10)*10;
}

export function textAnchor(kind,d,c){
  const size = c ? compSize(c,d) : {w:d.w,h:d.h};
  if(kind==='value' && c && c.type==='fuse'){
    const rot = ((c.r||0)%360 + 360) % 360;
    /* the text is counter-rotated around its anchor, so the baseline
       correction must be applied along the axis that maps to world-Y */
    if(rot===90)  return {x:size.w/2+3.5, y:size.h/2};
    if(rot===270) return {x:size.w/2-3.5, y:size.h/2};
  }
  if(kind==='value') return d.valBase || {x:size.w/2,y:size.h/2};
  return kind==='des' ? {x:size.w/2,y:-12} : {x:size.w/2,y:size.h+18};
}

export function textOffset(c,kind){
  const offs = c.textOffsets && c.textOffsets[kind];
  return offs ? {x:offs.x||0,y:offs.y||0} : {x:0,y:0};
}

export function pinTextAnchor(d,p,c){
  const size = c ? compSize(c,d) : {w:d.w,h:d.h};
  /* keep labels clear of the pin ring (r≈4.5) and the wire stub:
     side pins sit above the stub, top/bottom pins sit beside it */
  if(c && c.type==='ecu') return {x:16,y:p.y+3,anchor:'start'};
  const nearLeft = p.x <= 4;
  const nearRight = p.x >= size.w - 4;
  const nearTop = p.y <= 4;
  const nearBottom = p.y >= size.h - 4;
  if(nearLeft)   return {x:p.x+2,y:p.y-8,anchor:'start'};
  if(nearRight)  return {x:p.x-2,y:p.y-8,anchor:'end'};
  if(nearTop)    return {x:p.x+7,y:p.y-2,anchor:'start'};
  if(nearBottom) return {x:p.x+7,y:p.y+6,anchor:'start'};
  return {x:p.x,y:p.y-8,anchor:'middle'};
}

export function pinTextOffset(c,pinId){
  const offs = c.pinTextOffsets && c.pinTextOffsets[pinId];
  return offs ? {x:offs.x||0,y:offs.y||0} : {x:0,y:0};
}

export function localPointFromWorld(c,p){
  const d=LIB[c.type];
  const size = compSize(c,d);
  let x=p.x-c.x, y=p.y-c.y;
  const cx=size.w/2, cy=size.h/2;
  const rad=-(c.r||0)*Math.PI/180;
  const dx=x-cx, dy=y-cy;
  return {
    x: cx + (dx*Math.cos(rad) - dy*Math.sin(rad)),
    y: cy + (dx*Math.sin(rad) + dy*Math.cos(rad))
  };
}

export function pinAxis(c,pinId){
  /* natural wire axis of a pin: pins on the top/bottom edge of a part
     connect vertically, pins on the left/right edge horizontally */
  if(!c) return null;
  const d=LIB[c.type];
  const size=compSize(c,d);
  const pins=c.pins||d.pins;
  const p=pins.find(p=>p.id===pinId);
  if(!p) return 'v';
  let axis;
  if(p.y<=4||p.y>=size.h-4) axis='v';
  else if(p.x<=4||p.x>=size.w-4) axis='h';
  else axis='v';
  const rot=(((c.r||0)%180)+180)%180;
  if(rot===90) axis = axis==='v'?'h':'v';
  return axis;
}

export function routePoints(a,b,wps,startAxis,endAxis){
  /* orthogonal routing through user guide points.
     The wire leaves the start pin along the pin's natural axis,
     continues its direction of travel through each guide point,
     and arrives at the destination pin along that pin's axis
     (with a mid-channel double elbow when exit and arrival axes
     clash). Guide points are exact vertices of the run. */
  const pts=[a,...(wps||[]),b];
  const out=[pts[0]];
  let dir=startAxis||null;
  for(let i=0;i<pts.length-1;i++){
    const p=out[out.length-1], q=pts[i+1], last=i===pts.length-2;
    const dx=Math.abs(p.x-q.x), dy=Math.abs(p.y-q.y);
    if(dx<0.5||dy<0.5){
      out.push(q);
      if(dx>=0.5) dir='h'; else if(dy>=0.5) dir='v';
      continue;
    }
    const arrive = last ? endAxis : null;
    let exit = dir || (arrive ? (arrive==='v'?'h':'v') : 'v');
    if(arrive && exit===arrive){
      if(exit==='v'){
        const my=(p.y+q.y)/2;
        out.push({x:p.x,y:my},{x:q.x,y:my},q);
      } else {
        const mx=(p.x+q.x)/2;
        out.push({x:mx,y:p.y},{x:mx,y:q.y},q);
      }
      dir=arrive;
    } else {
      if(exit==='v') out.push({x:p.x,y:q.y},q);
      else out.push({x:q.x,y:p.y},q);
      dir = exit==='v'?'h':'v';
    }
  }
  return out;
}

export function wirePath(a,b,wps,startAxis,endAxis){
  const pts=routePoints(a,b,wps,startAxis,endAxis);
  return 'M'+pts.map(p=>`${p.x} ${p.y}`).join(' L');
}
