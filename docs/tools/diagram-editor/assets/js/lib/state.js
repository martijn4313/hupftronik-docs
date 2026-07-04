/* ============ shared editor state and helpers ============ */

export function freshState(){
  return {comps:[], wires:[], counters:{}, nextId:1};
}

export let state = {
  ...freshState(),
  sel: null,
  pending: null,
  wireDefaults: {color:'RD', tracer:'', gauge:'1.5'},
  view: {x:-60,y:-40,w:1200,h:800},
  cascade: 0
};

export function comp(id){
  return state.comps.find(c=>c.id===id);
}

export function uid(){
  return state.nextId++;
}

export function esc(s){
  return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
