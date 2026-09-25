/* ============ geometry.js tests ============
   Pure/DOM-free, so these run headlessly. Run from the repo root with:
     node --test tests/diagram-editor/*.test.mjs
   (also run in CI by .github/workflows/test.yml) */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { snap, routePoints, wirePath } from '../../docs/tools/diagram-editor/assets/js/lib/geometry.js';

test('snap rounds to the nearest 10px grid line', () => {
  assert.equal(snap(4), 0);
  assert.equal(snap(5), 10);
  assert.equal(snap(14), 10);
  assert.equal(snap(-6), -10);
  assert.equal(snap(-14), -10);
});

test('routePoints draws a direct segment when start and end share an axis', () => {
  const a = {x:0,y:0}, b = {x:100,y:0};
  const pts = routePoints(a,b,[],'h','h');
  assert.deepEqual(pts, [a,b]);
});

test('routePoints inserts a mid-channel double elbow when exit and arrival axes clash', () => {
  // both pins face "vertically" (e.g. top-of-part to bottom-of-part) but
  // aren't x-aligned, so a single elbow can't satisfy both pin axes
  const a = {x:0,y:0}, b = {x:100,y:50};
  const pts = routePoints(a,b,[],'v','v');
  assert.equal(pts[0].x, a.x);
  assert.equal(pts[pts.length-1].x, b.x);
  const midY = (a.y+b.y)/2;
  assert.ok(pts.some(p=>p.y===midY), 'expected a vertex at the vertical midpoint');
});

test('routePoints treats guide points as exact vertices of the run', () => {
  const a = {x:0,y:0}, b = {x:100,y:100};
  const wp = [{x:50,y:0},{x:50,y:100}];
  const pts = routePoints(a,b,wp,'h','v');
  for(const p of wp){
    assert.ok(pts.some(q=>q.x===p.x && q.y===p.y), `missing guide point ${JSON.stringify(p)}`);
  }
});

test('wirePath renders an SVG path string starting at the first point', () => {
  const a = {x:0,y:0}, b = {x:20,y:0};
  const d = wirePath(a,b,[],'h','h');
  assert.match(d, /^M0 0/);
  assert.match(d, /L20 0$/);
});
