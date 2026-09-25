/* ============ save-file validation ============
   Coerces a loaded .json diagram (untrusted: shared between people and
   committed into the docs repo) into the shapes the renderer assumes.
   Rendering builds SVG/HTML strings and assigns them via innerHTML, and
   many fields land inside attributes unescaped (translate(${c.x},…),
   fill="${bgColor}", data-pin="${p.id}", …). Forcing every such field to
   a number, a known enum value or a safe id here closes that whole class
   of attribute-breakout injection in one place, instead of escaping each
   output site. Free-text fields (des/label/value/noteText/pin labels/
   lengthMm) stay strings: they are escaped where they are rendered.

   DOM-free so it can be tested headlessly. customDraw is NOT handled here
   — it needs the DOM-based sanitizer in sanitize.js (see io.js). */

import { LIB } from './components.js';
import { DIN, GAUGES } from './constants.js';

const HEX_COLOR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
/* pin ids in the library look like "plus", "87a", "ht+", "ip-", "io3" */
const PIN_ID = /^[A-Za-z0-9_+\-.]{1,32}$/;
const RESERVED_KEYS = new Set(['__proto__','constructor','prototype']);
const NUMERIC = /^\d*(?:\.\d+)?$/;

const num = (v, fallback=0) => { const n = +v; return Number.isFinite(n) ? n : fallback; };
const int = v => { const n = +v; return Number.isSafeInteger(n) ? n : null; };
const clampInt = (v, lo, hi, fallback) => { const n = int(v); return n === null ? fallback : Math.max(lo, Math.min(hi, n)); };
const str = v => (v === undefined || v === null) ? '' : String(v);
const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const pinId = v => { const s = str(v); return PIN_ID.test(s) && !RESERVED_KEYS.has(s) ? s : null; };
const point = p => isObj(p) ? {x:num(p.x), y:num(p.y)} : null;
const color = (v, fallback) => HEX_COLOR.test(str(v)) ? str(v) : fallback;
const oneOf = (v, allowed, fallback) => allowed.includes(v) ? v : fallback;
const dinCode = (v, fallback) => Object.hasOwn(DIN, str(v)) ? str(v) : fallback;
const gauge = (v, fallback) => GAUGES.includes(str(v)) ? str(v) : fallback;
const lengthMm = v => { const s = str(v).trim(); return NUMERIC.test(s) ? s : ''; };

/* rotation is only ever changed in 90° steps by the UI */
const rotation = v => ((Math.round(num(v) / 90) * 90) % 360 + 360) % 360;

function normalizePin(p){
  if(!isObj(p)) return null;
  const id = pinId(p.id);
  if(id === null) return null;
  const out = {id, label: str(p.label), x: num(p.x), y: num(p.y)};
  if(p.io) out.io = true;
  return out;
}

function offsetMap(obj, keyOk){
  if(!isObj(obj)) return {};
  return Object.fromEntries(Object.entries(obj)
    .filter(([k, v]) => keyOk(k) && isObj(v))
    .map(([k, v]) => [k, point(v)]));
}

export function normalizeComp(c){
  if(!isObj(c) || typeof c.type !== 'string' || !Object.hasOwn(LIB, c.type)) return null;
  const id = int(c.id);
  if(id === null) return null;

  /* spread keeps unknown extra fields (never rendered) — every field the
     renderer does use is overwritten below with a validated value */
  const out = {...c, id,
    des: str(c.des), label: str(c.label), value: str(c.value),
    x: num(c.x), y: num(c.y), r: rotation(c.r),
    textOffsets: offsetMap(c.textOffsets, k => k === 'des' || k === 'label' || k === 'value'),
    pinTextOffsets: offsetMap(c.pinTextOffsets, k => pinId(k) !== null)
  };
  if(!('value' in c)) delete out.value;

  if(Array.isArray(c.pins)) out.pins = c.pins.map(normalizePin).filter(Boolean);
  else delete out.pins;

  if('pinCount' in c) out.pinCount = clampInt(c.pinCount, 1, 32, 4);
  if('ioCount' in c) out.ioCount = clampInt(c.ioCount, 1, 32, 4);
  if(isObj(c.pinStates)){
    out.pinStates = Object.fromEntries(Object.entries(c.pinStates)
      .filter(([k, v]) => pinId(k) !== null && (v === '12v' || v === 'gnd')));
  } else delete out.pinStates;

  if('variant' in c){
    const ids = LIB[c.type].variants?.map(v => v.id) || [];
    out.variant = oneOf(str(c.variant), ids, 'custom');
  }
  if('on' in c) out.on = !!c.on;
  if('keyPos' in c) out.keyPos = clampInt(c.keyPos, 0, 3, 0);
  if('customDraw' in c) out.customDraw = typeof c.customDraw === 'string' ? c.customDraw : null;

  if(c.type === 'note'){
    out.noteText = str(c.noteText ?? 'Note');
    out.bgColor = color(c.bgColor, '#1e1a2e');
    out.textColor = color(c.textColor, '#b39ddb');
    out.hAlign = oneOf(c.hAlign, ['left','center','right'], 'center');
    out.vAlign = oneOf(c.vAlign, ['top','middle','bottom'], 'middle');
    out.noteW = Math.max(80, num(c.noteW, 200) || 200);
    out.noteH = Math.max(40, num(c.noteH, 60) || 60);
    out.noteFont = str(c.noteFont) || 'inherit';
    out.noteFontSize = Math.max(8, num(c.noteFontSize, 11) || 11);
  }
  return out;
}

export function normalizeWire(w, defaults){
  if(!isObj(w) || !isObj(w.a) || !isObj(w.b)) return null;
  const id = int(w.id), ac = int(w.a.comp), bc = int(w.b.comp);
  const ap = pinId(w.a.pin), bp = pinId(w.b.pin);
  if(id === null || ac === null || bc === null || ap === null || bp === null) return null;
  return {...w, id,
    a: {comp: ac, pin: ap},
    b: {comp: bc, pin: bp},
    color: dinCode(w.color, defaults.color),
    tracer: dinCode(w.tracer, ''),
    gauge: gauge(w.gauge, defaults.gauge),
    lengthMm: lengthMm(w.lengthMm),
    wp: Array.isArray(w.wp) ? w.wp.map(point).filter(Boolean) : []
  };
}

export function normalizeWireDefaults(d, fallback){
  const src = isObj(d) ? d : {};
  return {
    color: dinCode(src.color, fallback.color),
    tracer: dinCode(src.tracer, ''),
    gauge: gauge(src.gauge, fallback.gauge),
    lengthMm: lengthMm(src.lengthMm)
  };
}

/**
 * Validates a parsed save file. Throws if it isn't a diagram at all;
 * otherwise drops components of unknown type, duplicate ids, and wires
 * whose ends don't reference a surviving component, and coerces every
 * rendered field to a safe type.
 */
export function normalizeDiagram(j, wireDefaultsFallback){
  if(!isObj(j) || !Array.isArray(j.comps) || !Array.isArray(j.wires))
    throw new Error('not a Harness Bench diagram');

  const wireDefaults = normalizeWireDefaults(j.wireDefaults, wireDefaultsFallback);

  const seen = new Set();
  const comps = [];
  for(const raw of j.comps){
    const c = normalizeComp(raw);
    if(!c || seen.has(c.id)) continue;
    seen.add(c.id);
    comps.push(c);
  }

  const wireIds = new Set();
  const wires = [];
  for(const raw of j.wires){
    const w = normalizeWire(raw, wireDefaults);
    if(!w || wireIds.has(w.id) || !seen.has(w.a.comp) || !seen.has(w.b.comp)) continue;
    wireIds.add(w.id);
    wires.push(w);
  }

  const counters = isObj(j.counters)
    ? Object.fromEntries(Object.entries(j.counters)
        .filter(([k, v]) => !RESERVED_KEYS.has(k) && int(v) !== null)
        .map(([k, v]) => [k, int(v)]))
    : {};

  /* ids come from a single counter shared by comps and wires — never let
     a loaded nextId hand out an id that is already in use */
  const maxId = Math.max(0, ...seen, ...wireIds);
  const nextId = Math.max(int(j.nextId) ?? 1000, maxId + 1);

  return {comps, wires, counters, nextId, wireDefaults, showWireLabels: j.showWireLabels !== false};
}
