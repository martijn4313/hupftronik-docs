(function () {
  const overlayId = 'mermaid-fullscreen-overlay';
  const overlayClass = 'mermaid-fullscreen-overlay';

  function ensureOverlay() {
    if (document.getElementById(overlayId)) {
      return document.getElementById(overlayId);
    }

    const overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.className = overlayClass;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = [
      '<div class="mermaid-fullscreen-dialog">',
      '  <button class="mermaid-fullscreen-close" type="button" aria-label="Close fullscreen diagram">×</button>',
      '  <div class="mermaid-fullscreen-body"></div>',
      '</div>'
    ].join('');

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        closeOverlay();
      }
    });

    overlay.querySelector('.mermaid-fullscreen-close').addEventListener('click', closeOverlay);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', handleEscKey);
    return overlay;
  }

  function handleEscKey(event) {
    if (event.key === 'Escape') {
      closeOverlay();
    }
  }

  function closeOverlay() {
    const overlay = document.getElementById(overlayId);
    if (!overlay) {
      return;
    }

    overlay.classList.remove('is-open');
    const body = overlay.querySelector('.mermaid-fullscreen-body');
    if (body) {
      body.innerHTML = '';
    }
  }

  function openOverlay(source) {
    const overlay = ensureOverlay();
    const body = overlay.querySelector('.mermaid-fullscreen-body');
    const clone = source.cloneNode(true);

    clone.classList.add('is-fullscreen');
    body.innerHTML = '';
    body.appendChild(clone);
    overlay.classList.add('is-open');
  }

  function renderMermaidBlocks() {
    if (typeof mermaid === 'undefined') {
      return;
    }

    if (typeof mermaid.initialize === 'function') {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'base'
      });
    }

    const renderFn = mermaid.render || (mermaid.mermaidAPI && mermaid.mermaidAPI.render);
    if (!renderFn) {
      console.warn('Mermaid render function not found.');
      return;
    }

    document.querySelectorAll('pre.mermaid').forEach((pre) => {
      if (pre.dataset.mermaidRendered === 'true') {
        return;
      }

      const code = pre.textContent || '';
      const trimmed = code.trim();
      if (!trimmed) {
        pre.dataset.mermaidRendered = 'true';
        return;
      }

      const targetId = 'mermaid-' + Math.random().toString(36).slice(2);
      const container = document.createElement('div');
      container.className = 'mermaid';
      container.dataset.mermaidRendered = 'true';

      const renderResult = (() => {
        try {
          return renderFn(targetId, trimmed);
        } catch (error) {
          return error;
        }
      })();

      const finishRender = (svg) => {
        if (typeof svg === 'object' && svg !== null && typeof svg.svg === 'string') {
          svg = svg.svg;
        }
        if (typeof svg === 'string') {
          container.innerHTML = svg;
          if (container.firstElementChild) {
            container.firstElementChild.setAttribute('data-mermaid-id', targetId);
          }
          pre.parentNode.replaceChild(container, pre);
        } else {
          console.warn('Mermaid render returned unexpected result:', svg);
          container.textContent = trimmed;
          pre.parentNode.replaceChild(container, pre);
        }
      };

      if (renderResult instanceof Promise) {
        renderResult.then(finishRender).catch((error) => {
          console.warn('Mermaid render promise failed:', error);
          container.textContent = trimmed;
          pre.parentNode.replaceChild(container, pre);
        });
      } else if (renderResult instanceof Error) {
        console.warn('Mermaid render exception:', renderResult);
        container.textContent = trimmed;
        pre.parentNode.replaceChild(container, pre);
      } else if (typeof renderResult === 'string') {
        finishRender(renderResult);
      } else {
        // Older Mermaid API: use callback form
        try {
          renderFn(targetId, trimmed, (svg) => finishRender(svg));
        } catch (error) {
          console.warn('Mermaid callback render failed:', error);
          container.textContent = trimmed;
          pre.parentNode.replaceChild(container, pre);
        }
      }
    });
  }

  function attachFullscreenBehavior(element) {
    if (element.dataset.mermaidFullscreenBound === 'true') {
      return;
    }

    element.dataset.mermaidFullscreenBound = 'true';
    element.style.cursor = 'zoom-in';
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');

    element.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        return;
      }
      openOverlay(element);
    });

    element.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openOverlay(element);
      }
    });
  }

  function scanMermaidBlocks() {
    renderMermaidBlocks();
    document.querySelectorAll('div.mermaid').forEach(attachFullscreenBehavior);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanMermaidBlocks);
  } else {
    scanMermaidBlocks();
  }

  const observer = new MutationObserver(scanMermaidBlocks);
  observer.observe(document.body, { childList: true, subtree: true });
})();
