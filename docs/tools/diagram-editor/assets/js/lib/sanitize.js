/* ============ untrusted SVG fragment sanitizer ============
   Component symbols (c.customDraw) are user-authored SVG markup that
   ends up inserted into the live canvas via innerHTML (see renderComps
   in render.js) — either typed by hand in the Symbol Editor, or loaded
   verbatim from a shared/committed .json save file (applyLoadedData in
   io.js). Unlike inert <script> tags, event-handler attributes on
   elements inserted via innerHTML (onerror, onload, ...) DO fire as the
   markup is parsed, so a crafted fragment can run arbitrary JS the
   moment a diagram is opened.

   This is an allowlist, not a blocklist: only plain SVG drawing elements
   in the SVG namespace survive. That matters because <title> and <desc>
   are HTML integration points — their content is parsed as HTML, so a
   blocklist lets e.g. <desc><meta http-equiv="refresh" …></desc> through,
   which navigates the page when inserted. Requiring the SVG namespace
   drops any HTML element nested that way.

   Parsing happens inside an inert <template>: template content is never
   part of the active document, so images don't load and nothing
   executes while we inspect and clean the tree. */

const SVG_NS = 'http://www.w3.org/2000/svg';

/* lowercased localName; everything else (script, foreignObject, use,
   image, a, animate*, set, style, …) is removed together with its
   content */
const ALLOWED_TAGS = new Set([
  'g','path','rect','circle','ellipse','line','polyline','polygon',
  'text','tspan','title','desc','defs','symbol','marker','clippath','mask',
  'lineargradient','radialgradient','stop','pattern'
]);

const URL_ATTRS = new Set(['href','xlink:href']);

/* url(...) references other than same-document "#id" ones would let a
   symbol fetch external resources (tracking) via fill/style/etc. */
const EXTERNAL_URL_REF = /url\s*\(\s*(?!['"]?\s*#)/i;

function isSafeHref(value){
  const v = String(value ?? '').trim();
  // only same-document fragment references (e.g. "#some-gradient")
  return v === '' || v.startsWith('#');
}

function clean(el){
  for(const child of [...el.children]){
    if(child.namespaceURI !== SVG_NS || !ALLOWED_TAGS.has(child.localName.toLowerCase())){
      child.remove();
      continue;
    }
    for(const attr of [...child.attributes]){
      const name = attr.name.toLowerCase();
      if(name.startsWith('on')
        || (URL_ATTRS.has(name) && !isSafeHref(attr.value))
        || EXTERNAL_URL_REF.test(attr.value)){
        child.removeAttribute(attr.name);
      }
    }
    clean(child);
  }
}

/**
 * Returns a cleaned copy of an inline-SVG fragment: only allowlisted SVG
 * drawing elements are kept, with "on*" event handlers, non-"#" hrefs
 * and external url(...) references removed. Returns '' if nothing
 * usable remains.
 */
export function sanitizeSvgFragment(svgFragment){
  const template = document.createElement('template');
  template.innerHTML = `<svg xmlns="${SVG_NS}">${svgFragment}</svg>`;
  const root = template.content.querySelector('svg');
  if(!root) return '';
  clean(root);
  return root.innerHTML;
}
