/* ============ Harness Bench bootstrap ============ */

import { buildPalette, setupSVGHandlers } from './lib/interactions.js';
import { seed } from './lib/seed.js';
import { render, initRenderRefs, applyView } from './lib/render.js';
import { setupIOButtons } from './lib/io.js';

/* palette/properties panels can be hidden via their edge tabs to
   reclaim canvas width — most useful on narrow (phone) screens,
   where they default to collapsed on first load */
function setupPanelToggles(){
  const palette = document.querySelector('#palette');
  const props = document.querySelector('#props');
  const paletteHandle = document.querySelector('#paletteHandle');
  const propsHandle = document.querySelector('#propsHandle');

  const sync = ()=>{
    const paletteOpen = !palette.classList.contains('collapsed');
    const propsOpen = !props.classList.contains('collapsed');
    paletteHandle.textContent = paletteOpen ? '‹' : '›';
    paletteHandle.setAttribute('aria-expanded', String(paletteOpen));
    paletteHandle.title = paletteOpen ? 'Hide parts panel' : 'Show parts panel';
    propsHandle.textContent = propsOpen ? '›' : '‹';
    propsHandle.setAttribute('aria-expanded', String(propsOpen));
    propsHandle.title = propsOpen ? 'Hide properties panel' : 'Show properties panel';
  };

  paletteHandle.onclick=()=>{
    palette.classList.toggle('collapsed');
    sync();
    requestAnimationFrame(applyView);
  };
  propsHandle.onclick=()=>{
    props.classList.toggle('collapsed');
    sync();
    requestAnimationFrame(applyView);
  };

  // start collapsed on phone-sized screens so the canvas is usable at first paint
  if(window.matchMedia('(max-width:760px)').matches){
    palette.classList.add('collapsed');
    props.classList.add('collapsed');
  }
  sync();
}

// Initialize
function boot(){
  // Set up render DOM references
  initRenderRefs();

  // Initialize UI
  buildPalette();
  setupSVGHandlers();
  setupIOButtons();
  setupPanelToggles();

  // Load and render demo circuit
  seed();
  render();
  applyView();
  document.querySelector('#btnFit').click();

  // Handle window resize
  window.addEventListener('resize',applyView);
}

// Start when DOM is ready
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
