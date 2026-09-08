/* ============ untrusted SVG fragment sanitizer ============
   Component symbols (c.customDraw) are user-authored SVG markup that
   ends up inserted into the live canvas via innerHTML (see renderComps
   in render.js) — either typed by hand in the Symbol Editor, or loaded
   verbatim from a shared/committed .json save file (applyLoadedData in
   io.js). Unlike inert <script> tags, event-handler attributes on
   elements inserted via innerHTML (onerror, onload, ...) DO fire as the
   markup is parsed, so a crafted fragment can run arbitrary JS the
   moment a diagram is opened. This strips that class of payload before
   a fragment is ever stored in c.customDraw.

   Parsing happens inside an inert <template>: template content is never
   part of the active document, so images don't load and nothing
   executes while we inspect and clean the tree. */

const FORBIDDEN_TAGS = new Set([
  'script','foreignobject','iframe','embed','object',
  'use','animate','animatetransform','animatemotion','set','style'
]);

const URL_ATTRS = new Set(['href','xlink:href']);

function isSafeUrl(value){
  const v = String(value ?? '').trim();
  // only same-document fragment references (e.g. "#some-gradient") are
  // allowed; everything else (http:, data:, javascript:, relative paths)
  // is rejected since these symbols are meant to be self-contained
  return v === '' || v.startsWith('#');
}

function clean(el){
  for(const child of [...el.children]){
    const tag = child.tagName.toLowerCase();
    if(FORBIDDEN_TAGS.has(tag)){
      child.remove();
      continue;
    }
    for(const attr of [...child.attributes]){
      const name = attr.name.toLowerCase();
      if(name.startsWith('on')){
        child.removeAttribute(attr.name);
      } else if(URL_ATTRS.has(name) && !isSafeUrl(attr.value)){
        child.removeAttribute(attr.name);
      }
    }
    clean(child);
  }
}

/**
 * Returns a cleaned copy of an inline-SVG fragment with scripting hooks
 * removed: <script>/<foreignObject>/<iframe>/... elements, "on*" event
 * handler attributes, and href/xlink:href values other than local
 * "#..." fragment references. Returns '' if the fragment doesn't parse.
 */
export function sanitizeSvgFragment(svgFragment){
  const template = document.createElement('template');
  template.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${svgFragment}</svg>`;
  const root = template.content.querySelector('svg');
  if(!root) return '';
  clean(root);
  return root.innerHTML;
}
