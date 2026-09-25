/* ============ interactive circuit simulation ============
   Reachability from +12V sources and from grounds through the
   conducting contacts of fuses, connectors, switches, the ignition
   key and relays. Relay coils energize when 86/85 bridge the two
   sets, which can close further contacts — so iterate to a fixed
   point. Loads never conduct; they light up when they see both
   a supply and a ground.

   Split out from interactions.js so both it and render.js can call
   simulate() directly, without the late-bound state.hooks indirection
   that used to work around their circular import. */

import { IGN_CONDUCT, pinsOf } from './components.js';
import { state } from './state.js';

const SIM_LOADS = new Set(['motor','pump','lamp','injector','valve',
  'idleValve2','idleValve3','idleStepper','idleWax',
  'sensor2','sensor3','o2sensor3','o2sensor4','o2sensor5']);
export const SIM_SOURCES = new Set(['battery','relay','relay5','ignition']);

function key(compId,pinId){
  return `${compId}:${pinId}`;
}

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
    if((c.type==='ecu'||c.type==='schildknappe')&&c.pinStates){
      for(const [pid,st] of Object.entries(c.pinStates)){
        if(st==='12v') plusStarts.push(key(c.id,pid));
        if(st==='gnd') minusStarts.push(key(c.id,pid));
      }
    }
    // Schildknappe's GND is a hardwired protocol pin, not a general-purpose
    // one — it always sinks to ground, unlike its configurable IO pins
    if(c.type==='schildknappe') minusStarts.push(key(c.id,'gnd'));
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
        case 'ignAmp4':
          if(dyn.ampCh[c.id]&&dyn.ampCh[c.id].a) add(c.id,'1','31');
          if(dyn.ampCh[c.id]&&dyn.ampCh[c.id].b) add(c.id,'2','31');
          if(dyn.ampCh[c.id]&&dyn.ampCh[c.id].c) add(c.id,'3','31');
          if(dyn.ampCh[c.id]&&dyn.ampCh[c.id].d) add(c.id,'4','31');
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
  const amps=state.comps.filter(c=>c.type==='ignAmp1'||c.type==='ignAmp2'||c.type==='ignAmp4');
  const coils=state.comps.filter(c=>c.type==='coil'||c.type==='cop'||c.type==='coil2x2'||c.type==='copSmart');
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
      /* BIP373 is a bare transistor with no VCC pin — powered through the coil load */
      const isBip373 = a.type==='ignAmp1' && a.variant==='bip373';
      const powered = isBip373
        ? minus.seen[key(a.id,'31')]
        : plus.seen[key(a.id,'15')]&&minus.seen[key(a.id,'31')];
      const ch={};
      if(a.type==='ignAmp1'){
        if(powered&&plus.seen[key(a.id,'in')]) ch.a=true;
      } else if(a.type==='ignAmp4'){
        if(powered&&plus.seen[key(a.id,'in1')]) ch.a=true;
        if(powered&&plus.seen[key(a.id,'in2')]) ch.b=true;
        if(powered&&plus.seen[key(a.id,'in3')]) ch.c=true;
        if(powered&&plus.seen[key(a.id,'in4')]) ch.d=true;
      } else {
        if(powered&&plus.seen[key(a.id,'in1')]) ch.a=true;
        if(powered&&plus.seen[key(a.id,'in2')]) ch.b=true;
      }
      if(ch.a||ch.b||ch.c||ch.d) next.ampCh[a.id]=ch;
    }
    for(const t of coils){
      const ch={};
      if(t.type==='coil2x2'){
        if(plus.seen[key(t.id,'15')]&&minus.seen[key(t.id,'1a')]) ch.a=true;
        if(plus.seen[key(t.id,'15')]&&minus.seen[key(t.id,'1b')]) ch.b=true;
      } else if(t.type==='copSmart'){
        /* smart COP has integrated IGBT: fires when supply (15), GND (31),
           and logic signal (in) are all simultaneously present */
        if(plus.seen[key(t.id,'15')]&&minus.seen[key(t.id,'31')]&&plus.seen[key(t.id,'in')]) ch.a=true;
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
      const pins=pinsOf(c);
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
