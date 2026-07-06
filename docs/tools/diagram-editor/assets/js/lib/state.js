/* ============ shared editor state and helpers ============ */

export function freshState(){
  return {comps:[], wires:[], counters:{}, nextId:1};
}

export let state = {
  ...freshState(),
  sel: null,
  pending: null,
  pendingWp: [],
  connectCandidate: null,
  wireDefaults: {color:'RD', tracer:'', gauge:'1.5', lengthMm:''},
  showWireLabels: true,
  trace: null,
  view: {x:-60,y:-40,w:1200,h:800},
  cascade: 0
};

/* late-bound callbacks, set by the interactions layer, so the render
   layer can trigger a re-simulation without a circular import */
export const hooks = { simulate:null };

/* in-memory copy/paste clipboard — holds {comps:[…], wires:[…]} */
export let clipboard = null;
export function setClipboard(val){ clipboard = val; }

export function comp(id){
  return state.comps.find(c=>c.id===id);
}

export function uid(){
  return state.nextId++;
}

export function esc(s){
  return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
