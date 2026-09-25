/* ============ save-file validation tests ============
   Covers validate.js (the untrusted-.json normalization) and the
   load-time pin regeneration in io.js's applyLoadedData. Both are
   DOM-free for inputs without customDraw, so they run headlessly.
   Run from the repo root with:
     node --test tests/diagram-editor/*.test.mjs
   (also run in CI by .github/workflows/test.yml) */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDiagram } from '../../docs/tools/diagram-editor/assets/js/lib/validate.js';
import { applyLoadedData } from '../../docs/tools/diagram-editor/assets/js/lib/io.js';
import { state } from '../../docs/tools/diagram-editor/assets/js/lib/state.js';
import { pinsOf } from '../../docs/tools/diagram-editor/assets/js/lib/components.js';

const DEFAULTS = {color:'RD', tracer:'', gauge:'1.5', lengthMm:''};
const INJECT = '"/><image href="x" onerror="alert(1)"/><g a="';
const load = j => normalizeDiagram(j, DEFAULTS);

test('rejects input that is not a diagram', () => {
  assert.throws(() => load(null));
  assert.throws(() => load({comps: {}, wires: []}));
});

test('attribute-breakout payloads are coerced away from every rendered field', () => {
  const d = load({
    comps: [
      {id:1, type:'note', x:'0)'+INJECT, y:INJECT, r:INJECT,
        bgColor:INJECT, textColor:INJECT, hAlign:INJECT,
        textOffsets:{des:{x:INJECT, y:1}},
        pinTextOffsets:{[INJECT]:{x:1,y:1}, ok:{x:INJECT,y:2}}},
      {id:2, type:'battery', pins:[{id:'p', label:'<b>', x:INJECT, y:3}, {id:INJECT, x:0, y:0}]},
      {id:3, type:'ecu', pinCount:INJECT}
    ],
    wires: [{id:4, a:{comp:1,pin:'p'}, b:{comp:2,pin:'p'},
      color:INJECT, tracer:INJECT, gauge:INJECT, lengthMm:INJECT, wp:[{x:INJECT,y:5}]}],
    wireDefaults: {color:INJECT, gauge:INJECT}
  });
  const [note, bat, ecu] = d.comps;
  assert.deepEqual([note.x, note.y, note.r], [0, 0, 0]);
  assert.equal(note.bgColor, '#1e1a2e');
  assert.equal(note.textColor, '#b39ddb');
  assert.equal(note.hAlign, 'center');
  assert.deepEqual(note.textOffsets, {des:{x:0, y:1}});
  assert.deepEqual(note.pinTextOffsets, {ok:{x:0, y:2}});
  // bad pin id dropped; label stays free text (escaped at render time)
  assert.deepEqual(bat.pins, [{id:'p', label:'<b>', x:0, y:3}]);
  assert.equal(ecu.pinCount, 4);
  const [w] = d.wires;
  assert.deepEqual([w.color, w.tracer, w.gauge, w.lengthMm], ['RD', '', '1.5', '']);
  assert.deepEqual(w.wp, [{x:0, y:5}]);
  assert.deepEqual(d.wireDefaults, DEFAULTS);
});

test('drops unknown component types, including prototype keys', () => {
  const d = load({comps: [
    {id:1, type:'constructor'}, {id:2, type:'__proto__'}, {id:3, type:'nope'}, {id:4, type:'fuse'}
  ], wires: []});
  assert.deepEqual(d.comps.map(c => c.id), [4]);
});

test('drops duplicate ids and wires whose ends reference no surviving component', () => {
  const d = load({
    comps: [{id:1, type:'fuse'}, {id:1, type:'lamp'}, {id:2, type:'ground'}],
    wires: [
      {id:10, a:{comp:1,pin:'1'}, b:{comp:2,pin:'g'}},
      {id:11, a:{comp:1,pin:'1'}, b:{comp:99,pin:'g'}}
    ]
  });
  assert.deepEqual(d.comps.map(c => c.type), ['fuse', 'ground']);
  assert.deepEqual(d.wires.map(w => w.id), [10]);
});

test('nextId never hands out an id that is already in use', () => {
  const d = load({nextId:2, comps:[{id:5, type:'fuse'}], wires:[]});
  assert.equal(d.nextId, 6);
});

test('a legitimate save survives normalization unchanged', () => {
  const comp = {id:1, type:'fuse', des:'F1', label:'fan fuse', value:'30A', r:270,
    textOffsets:{des:{x:30,y:40}}, pinTextOffsets:{}, x:440, y:20};
  const wire = {id:2, a:{comp:1,pin:'1'}, b:{comp:1,pin:'2'}, color:'BN', tracer:'YE',
    gauge:'6.0', lengthMm:'200', wp:[{x:390,y:120}]};
  const d = load({comps:[comp], wires:[wire], nextId:30, counters:{F:1}});
  assert.deepEqual(d.comps[0], comp);
  assert.deepEqual(d.wires[0], wire);
  assert.deepEqual(d.counters, {F:1});
  assert.equal(d.nextId, 30);
});

test('loading keeps a Schildknappe\'s IO pins and an ECU\'s pin count (regression)', () => {
  // before the fix, a second preset-pins pass called getPins(c.variant)
  // on these count-based parts: Schildknappe lost every IO pin and ECUs
  // were reset to 4 pins on every load
  applyLoadedData({comps: [
    {id:1, type:'schildknappe', ioCount:8, variant:'generic'},
    {id:2, type:'ecu', pinCount:6}
  ], wires: []});
  const [skn, ecu] = state.comps;
  assert.equal(skn.pins.filter(p => p.io).length, 8);
  assert.equal(skn.pins.length, 12);
  assert.equal(ecu.pins.length, 6);
});

test('pinsOf falls back to the preset for the instance\'s count, never mutating it', () => {
  const c = {type:'schildknappe', ioCount:3};
  assert.equal(pinsOf(c).filter(p => p.io).length, 3);
  assert.equal('pins' in c, false);
  assert.deepEqual(pinsOf({type:'fuse'}).map(p => p.id), ['1', '2']);
});
