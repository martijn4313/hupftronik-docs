/* ============ undo / redo history ============
   Stores deep-cloned snapshots of {comps, wires, nextId, counters}.
   Transient UI state (sel, pending, trace, view) is intentionally
   excluded so undo only affects diagram content, not viewport. */

import { state } from './state.js';

const MAX_HISTORY = 80;

let stack = [];   // array of JSON strings (serialised snapshots)
let ptr   = -1;   // current position within stack

/* Capture just the diagram-content fields as a deep clone.
   structuredClone avoids JSON round-trips and handles all data types. */
function snapshot(){
  return structuredClone({
    comps:    state.comps,
    wires:    state.wires,
    nextId:   state.nextId,
    counters: state.counters
  });
}

/* Restore diagram content from a snapshot */
function restore(snap){
  state.comps    = structuredClone(snap.comps);
  state.wires    = structuredClone(snap.wires);
  state.nextId   = snap.nextId;
  state.counters = structuredClone(snap.counters);
  /* clear transient selection/pending so we don't reference stale IDs */
  state.sel  = null;
  state.pending   = null;
  state.pendingWp = [];
  state.connectCandidate = null;
  state.trace = null;
}

/**
 * Call this after every diagram mutation to record a new undo step.
 * During a drag we push only on drag-end (not on every move), so
 * callers must decide when to push.
 */
export function historyPush(){
  /* discard any redo future */
  if(ptr < stack.length - 1) stack.splice(ptr + 1);
  stack.push(snapshot());
  if(stack.length > MAX_HISTORY) stack.shift();
  ptr = stack.length - 1;
}

export function historyUndo(renderFn){
  if(ptr <= 0) return false;   // nothing to undo past the initial snapshot
  ptr--;
  restore(stack[ptr]);
  renderFn();
  return true;
}

export function historyRedo(renderFn){
  if(ptr >= stack.length - 1) return false;
  ptr++;
  restore(stack[ptr]);
  renderFn();
  return true;
}

/** Reset history (called on New / Load) */
export function historyClear(){
  stack = [];
  ptr   = -1;
}

/** Seed the very first entry so Ctrl+Z can reach the initial state */
export function historyInit(){
  historyClear();
  historyPush();
}
