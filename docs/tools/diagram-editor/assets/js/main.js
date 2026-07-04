/* ============ Harness Bench bootstrap ============ */

import { buildPalette, setupSVGHandlers } from './lib/interactions.js';
import { seed } from './lib/seed.js';
import { render, initRenderRefs, applyView } from './lib/render.js';
import { setupIOButtons } from './lib/io.js';

// Initialize
function boot(){
  // Set up render DOM references
  initRenderRefs();
  
  // Initialize UI
  buildPalette();
  setupSVGHandlers();
  setupIOButtons();
  
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
