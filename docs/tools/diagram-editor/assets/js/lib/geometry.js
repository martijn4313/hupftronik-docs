/* ============ geometry and coordinate helpers ============ */

import { LIB } from './components.js';
import { state } from './state.js';

function compSize(c,d=LIB[c.type]){
  let w=d.w, h=d.h;
  if(c.type==='ecu'){
    const pinCount = (c.pins && c.pins.length) || c.pinCount || 4;
    h = Math.max(80, 20 + pinCount * 16 + 20);
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
    if(rot===90 || rot===270) return {x:size.w/2, y:size.h/2+3};
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
  const ty = p.y<size.h/2 ? p.y+3 : p.y+1;
  if(c && c.type==='ecu') return {x:8,y:ty,anchor:'end'};
  const nearLeft = p.x <= 4;
  const nearRight = p.x >= size.w - 4;
  if(nearRight) return {x:p.x-8,y:ty,anchor:'end'};
  if(nearLeft) return {x:p.x+8,y:ty,anchor:'start'};
  return {x:p.x,y:ty-6,anchor:'middle'};
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

export function routePoints(a,b,wps){
  /* orthogonal routing through user guide points.
     No guides: classic V-H-V elbow. With guides: the wire leaves
     each point vertically and arrives at the next horizontally,
     except the final hop which arrives at the pin vertically —
     so a guide point effectively drags the horizontal channel. */
  const pts=[a,...(wps||[]),b];
  const out=[pts[0]];
  for(let i=0;i<pts.length-1;i++){
    const p=pts[i],q=pts[i+1],last=i===pts.length-2;
    if(Math.abs(p.x-q.x)<0.5||Math.abs(p.y-q.y)<0.5){out.push(q);continue;}
    if(pts.length===2){
      const my=(p.y+q.y)/2;
      out.push({x:p.x,y:my},{x:q.x,y:my},q);
    } else if(last){
      out.push({x:q.x,y:p.y},q);   /* H then V: arrive vertically at pin */
    } else {
      out.push({x:p.x,y:q.y},q);   /* V then H: leave point vertically */
    }
  }
  return out;
}

export function wirePath(a,b,wps){
  const pts=routePoints(a,b,wps);
  return 'M'+pts.map(p=>`${p.x} ${p.y}`).join(' L');
}
