/* ============ mermaid.js tests ============
   mermaid.js is deliberately kept free of DOM dependencies (see its own
   header comment) so it can be exercised headlessly, against a plain
   in-memory diagram, without a browser. Run from the repo root with:
     node --test tests/diagram-editor/*.test.mjs
   (also run in CI by .github/workflows/test.yml) */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { state, freshState } from '../../docs/tools/diagram-editor/assets/js/lib/state.js';
import { buildMermaid } from '../../docs/tools/diagram-editor/assets/js/lib/mermaid.js';

function reset(){
  Object.assign(state, freshState());
  state.sel = null;
  state.trace = null;
}

test('buildMermaid renders components as flowchart nodes and wires as labeled edges', () => {
  reset();
  state.comps.push(
    {id:1, type:'battery', des:'BAT1', label:'', value:'12V',
      pins:[{id:'plus',label:'+'},{id:'minus',label:'-'}]},
    {id:2, type:'fuse', des:'F1', label:'', value:'15A',
      pins:[{id:'1',label:'1'},{id:'2',label:'2'}]}
  );
  state.wires.push({id:1, a:{comp:1,pin:'plus'}, b:{comp:2,pin:'1'},
    color:'RD', tracer:'', gauge:'1.5', lengthMm:''});

  const out = buildMermaid();
  assert.match(out, /^flowchart LR/m);
  assert.match(out, /BAT1\[\("🔋 BAT1 12V"\)\]/);
  assert.match(out, /F1\{\{"F1 15A"\}\}/);
  assert.match(out, /BAT1 ---\|/);
});

test('buildMermaid keeps colliding designators as distinct nodes', () => {
  reset();
  state.comps.push(
    {id:1, type:'ground', des:'S 1', label:'', value:'', pins:[{id:'g',label:'⏚'}]},
    {id:2, type:'ground', des:'S-1', label:'', value:'', pins:[{id:'g',label:'⏚'}]}
  );
  const out = buildMermaid();
  // "S 1" and "S-1" both sanitize to "S_1" — the second must not silently
  // collide with (and overwrite) the first node
  assert.match(out, /\bS_1\[/);
  assert.match(out, /\bS_1_2\[/);
});

test('buildMermaid dodges reserved flowchart keywords used as a designator', () => {
  reset();
  state.comps.push({id:7, type:'ground', des:'end', label:'', value:'', pins:[{id:'g',label:'⏚'}]});
  const out = buildMermaid();
  assert.doesNotMatch(out, /\bend\[/, 'a bare "end[...]" node line would break the flowchart parser');
  assert.match(out, /\bend_7\[/);
});
