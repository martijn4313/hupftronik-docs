/* ============ rendering layer ============ */

import { DIN, GAUGES } from './constants.js';
import { LIB } from './components.js';
import { state, esc, comp, uid } from './state.js';
import { pinPos, textAnchor, textOffset, wirePath, pinTextAnchor, pinTextOffset } from './geometry.js';

// DOM references
export let svg, wiresL, compsL, tempL, handleL;

export function initRenderRefs(){
  svg = document.querySelector('#canvas');
  wiresL = document.querySelector('#wiresLayer');
  compsL = document.querySelector('#compsLayer');
  tempL = document.querySelector('#tempLayer');
  handleL = document.querySelector('#handleLayer');
}

export function applyView(){
  /* keep the viewBox aspect ratio locked to the element's — otherwise
     preserveAspectRatio letterboxing makes one axis map at the wrong
     scale, which is why dragging lagged behind the pointer */
  const rect = svg.getBoundingClientRect();
  if(rect.width>0&&rect.height>0){
    const ar=rect.width/rect.height;
    const cy=state.view.y+state.view.h/2;
    state.view.h=state.view.w/ar;
    state.view.y=cy-state.view.h/2;
  }
  svg.setAttribute('viewBox',`${state.view.x} ${state.view.y} ${state.view.w} ${state.view.h}`);
  document.querySelector('#stZoom').textContent = Math.round(rect.width/state.view.w*100)+'%';
}

export function renderWires(){
  wiresL.innerHTML = state.wires.map(w=>{
    const a=pinPos(state.comps.find(c=>c.id===w.a.comp),w.a.pin), b=pinPos(state.comps.find(c=>c.id===w.b.comp),w.b.pin);
    const d=wirePath(a,b,w.wp);
    const base=DIN[w.color]||'#fff';
    const width = parseFloat(w.gauge)>=2.5?5:3.5;
    const dark = (w.color==='BK'||w.color==='BN');
    const halo = dark?'rgba(255,255,255,.5)':'rgba(0,0,0,.45)';
    const selHalo = (state.sel&&state.sel.kind==='wire'&&state.sel.id===w.id)
      ? `<path d="${d}" fill="none" stroke="#f9a825" stroke-width="${width+5}" opacity=".55"/>`:'';
    const tracer = w.tracer
      ? `<path d="${d}" fill="none" stroke="${DIN[w.tracer]}" stroke-width="${Math.max(width-1.8,1.2)}" stroke-dasharray="9 9" stroke-linecap="butt"/>`:'';
    return `<g>${selHalo}
      <path d="${d}" fill="none" stroke="${halo}" stroke-width="${width+2}"/>
      <path d="${d}" fill="none" stroke="${base}" stroke-width="${width}" stroke-linecap="round"/>
      ${tracer}
      <path class="wire-hit" data-wire="${w.id}" d="${d}" fill="none" stroke="rgba(0,0,0,0)" stroke-width="14"/>
    </g>`;
  }).join('');
}

export function renderComps(){
  compsL.innerHTML = state.comps.map(c=>{
    const d=LIB[c.type];
    
    // For ECU, ensure pins are generated
    if(c.type==='ecu'){
      if(!c.pins||!Array.isArray(c.pins)){
        c.pins=d.getPins(c.pinCount||4);
      }
    }
    
    // Calculate component dimensions
    let compW = d.w;
    let compH = d.h;
    if(c.type==='ecu'&&c.pins){
      compH = Math.max(80, 20 + c.pins.length * 16 + 20);
    }
    
    const isSel = state.sel&&state.sel.kind==='comp'&&state.sel.id===c.id;
    const selRect = isSel
      ? `<rect x="-8" y="-8" width="${compW+16}" height="${compH+16}" rx="6" fill="none"
              stroke="#f9a825" stroke-width="1.4" stroke-dasharray="4 4"/>`:'';
    const invR = -(c.r || 0);
    const desBase = textAnchor('des',d);
    const desOff = textOffset(c,'des');
    const labelBase = textAnchor('label',d);
    const labelOff = textOffset(c,'label');
    const valBase = textAnchor('value',d);
    const valOff = textOffset(c,'value');
    const valNode = ('value' in c && c.value)
      ? `<text class="comp-text" data-comp="${c.id}" data-role="value" transform="rotate(${invR}, ${valBase.x+valOff.x}, ${valBase.y+valOff.y})"
            x="${valBase.x+valOff.x}" y="${valBase.y+valOff.y}" fill="${d.valColor||'#8a939c'}" font-size="${d.valSize||10}" text-anchor="${d.valAlign||'middle'}"
            font-family="inherit" pointer-events="all">${esc(c.value)}</text>`
      : '';
    
    const pins = (c.pins||d.pins).map(p=>{
      const pinBase = pinTextAnchor(d, p);
      const pinOff = pinTextOffset(c, p.id);
      return `<g>
        <circle class="pin" data-comp="${c.id}" data-pin="${p.id}" cx="${p.x}" cy="${p.y}"
                r="14" fill="rgba(0,0,0,0)" stroke="rgba(0,0,0,0)" stroke-width="0" pointer-events="all"/>
        <circle class="pin" data-comp="${c.id}" data-pin="${p.id}" cx="${p.x}" cy="${p.y}"
                r="${state.pending?6:4.5}" fill="#15181b" stroke="#f9a825" stroke-width="1.6" pointer-events="none"/>
        ${p.label?`<text class="comp-text" data-comp="${c.id}" data-role="pin" data-pinid="${p.id}" transform="rotate(${invR}, ${pinBase.x+pinOff.x}, ${pinBase.y+pinOff.y})" x="${pinBase.x+pinOff.x}" y="${pinBase.y+pinOff.y}" fill="#8a939c" font-size="8"
              font-family="inherit" pointer-events="all">${esc(p.label)}</text>`:''}
      </g>`;
    }).join('');
    const primaryPin = (c.pins||d.pins)[0];
    const orientDot = primaryPin
      ? `<circle cx="${primaryPin.x}" cy="${primaryPin.y-6}" r="2" fill="#f9a825" opacity="0.95" pointer-events="none"/>`
      : '';
    return `<g transform="translate(${c.x},${c.y}) rotate(${c.r||0}, ${compW/2}, ${compH/2})">
      ${selRect}
      <g class="comp-body" data-comp="${c.id}">
        <rect x="-6" y="-6" width="${compW+12}" height="${compH+12}" fill="rgba(0,0,0,0)"/>
        ${d.draw(c)}
      </g>
      <text class="comp-text" data-comp="${c.id}" data-role="des" transform="rotate(${invR}, ${desBase.x+desOff.x}, ${desBase.y+desOff.y})"
            x="${desBase.x+desOff.x}" y="${desBase.y+desOff.y}" fill="#f9a825" font-size="11" text-anchor="middle"
            font-family="inherit" pointer-events="all">${esc(c.des)}</text>
      ${c.label?`<text class="comp-text" data-comp="${c.id}" data-role="label" transform="rotate(${invR}, ${labelBase.x+labelOff.x}, ${labelBase.y+labelOff.y})"
            x="${labelBase.x+labelOff.x}" y="${labelBase.y+labelOff.y}" fill="#8a939c" font-size="9" text-anchor="middle"
            font-family="inherit" pointer-events="all">${esc(c.label)}</text>`:''}
      ${valNode}
      ${orientDot}
      ${pins}
    </g>`;
  }).join('');
}

export function renderTemp(mouse){
  if(!state.pending){tempL.innerHTML='';return;}
  const c = state.comps.find(c=>c.id===state.pending.compId);
  const a=pinPos(c,state.pending.pinId);
  const b=mouse||a;
  tempL.innerHTML=`<path d="${wirePath(a,b)}" fill="none" stroke="${DIN[state.wireDefaults.color]}"
    stroke-width="3" stroke-dasharray="6 6" opacity=".8"/>`;
}

export function renderStatus(){
  document.querySelector('#stCounts').textContent =
    `${state.comps.length} components · ${state.wires.length} wires`;
  document.querySelector('#stHint').textContent = state.pending
    ? 'Click a second pin to finish the wire — Esc cancels'
    : 'Click a palette part to place it · pin → pin runs a wire · double-click a wire to add a guide point · arrows nudge selection';
}

export function renderHandles(){
  /* guide-point handles for the selected wire */
  if(!(state.sel&&state.sel.kind==='wire')){handleL.innerHTML='';return;}
  const w=state.wires.find(w=>w.id===state.sel.id);
  if(!w){handleL.innerHTML='';return;}
  handleL.innerHTML=(w.wp||[]).map((p,i)=>`
    <rect class="wp-handle" data-wire="${w.id}" data-idx="${i}"
      x="${p.x-5}" y="${p.y-5}" width="10" height="10" rx="2"
      fill="#15181b" stroke="#f9a825" stroke-width="1.8" cursor="move"/>`).join('');
}

export function render(){
  renderWires();
  renderComps();
  renderHandles();
  renderTemp();
  renderProps();
  renderStatus();
}

// properties panel  
function swatches(current,attr,allowNone){
  let s = allowNone
    ? `<button class="swatch ${current===''?'on':''}" data-${attr}="" title="none"
        style="background:repeating-linear-gradient(45deg,#333 0 4px,#555 4px 8px)"></button>`:'';
  for(const [code,hex] of Object.entries(DIN)){
    s+=`<button class="swatch ${current===code?'on':''}" data-${attr}="${code}"
         title="${code}" style="background:${hex}"></button>`;
  }
  return `<div class="swatchbar">${s}</div>`;
}

export function deleteSelection(){
  if(!state.sel) return;
  if(state.sel.kind==='comp'){
    state.wires=state.wires.filter(w=>w.a.comp!==state.sel.id&&w.b.comp!==state.sel.id);
    state.comps=state.comps.filter(c=>c.id!==state.sel.id);
  } else {
    state.wires=state.wires.filter(w=>w.id!==state.sel.id);
  }
  state.sel=null;
}

export function renderProps(){
  const el=document.querySelector('#props');
  if(state.sel&&state.sel.kind==='comp'){
    const c=comp(state.sel.id), d=LIB[c.type];
    
    let ecuControls='';
    if(c.type==='ecu'){
      ecuControls=`
      <div class="field"><label for="fPinCount">Number of pins</label>
        <input type="number" id="fPinCount" min="1" max="32" value="${c.pinCount||4}"></div>`;
    }
    
    let noteControls='';
    if(c.type==='note'){
      noteControls=`
      <div class="field"><label for="fNoteText">Text</label>
        <input type="text" id="fNoteText" value="${esc(c.noteText||'Note')}"></div>
      <div class="field"><label for="fNoteBg">Background color</label>
        <input type="color" id="fNoteBg" value="${c.bgColor||'#1e1a2e'}"></div>
      <div class="field"><label for="fNoteTxt">Text color</label>
        <input type="color" id="fNoteTxt" value="${c.textColor||'#b39ddb'}"></div>
      <div class="field"><label for="fNoteHAlign">Horizontal align</label>
        <select id="fNoteHAlign">
          <option value="left" ${c.hAlign==='left'?'selected':''}>Left</option>
          <option value="center" ${(c.hAlign||'center')==='center'?'selected':''}>Center</option>
          <option value="right" ${c.hAlign==='right'?'selected':''}>Right</option>
        </select></div>
      <div class="field"><label for="fNoteVAlign">Vertical align</label>
        <select id="fNoteVAlign">
          <option value="top" ${c.vAlign==='top'?'selected':''}>Top</option>
          <option value="middle" ${(c.vAlign||'middle')==='middle'?'selected':''}>Middle</option>
          <option value="bottom" ${c.vAlign==='bottom'?'selected':''}>Bottom</option>
        </select></div>`;
    }
    
    el.innerHTML=`<h2>Component</h2>
      <div class="desig">${esc(c.des)} <span style="color:var(--ink-dim);font-size:11px">${d.name}</span></div>
      ${c.type!=='note'?`<div class="field"><label for="fLabel">Label</label>
        <input type="text" id="fLabel" value="${esc(c.label)}" placeholder="cooling fan relay"></div>`:''}
      ${'value' in c && d.value!==undefined?`<div class="field"><label for="fValue">Value / rating</label>
        <input type="text" id="fValue" value="${esc(c.value)}"></div>`:''}
      ${ecuControls}
      ${noteControls}
      <div class="field"><label for="fDes">Designator</label>
        <input type="text" id="fDes" value="${esc(c.des)}"></div>
      <button id="btnRot">Rotate 90° (R)</button>
      <button id="btnDel" class="danger">Delete component</button>
      <p class="hint">Wires attached to this part are deleted with it.</p>`;
    if(c.type!=='note') document.querySelector('#fLabel').oninput=e=>{c.label=e.target.value;renderComps();};
    const fv=document.querySelector('#fValue'); if(fv) fv.oninput=e=>{c.value=e.target.value;renderComps();};
    const fpc=document.querySelector('#fPinCount');
    if(fpc){
      fpc.oninput=e=>{
        c.pinCount=Math.max(1,Math.min(32,+e.target.value||4));
        c.pins=d.getPins(c.pinCount);
        render();
      };
    }
    // Note component properties
    const fnt=document.querySelector('#fNoteText');
    if(fnt){
      fnt.oninput=e=>{c.noteText=e.target.value;renderComps();};
    }
    const fnb=document.querySelector('#fNoteBg');
    if(fnb){
      fnb.oninput=e=>{c.bgColor=e.target.value;renderComps();};
    }
    const fntc=document.querySelector('#fNoteTxt');
    if(fntc){
      fntc.oninput=e=>{c.textColor=e.target.value;renderComps();};
    }
    const fnha=document.querySelector('#fNoteHAlign');
    if(fnha){
      fnha.onchange=e=>{c.hAlign=e.target.value;renderComps();};
    }
    const fnva=document.querySelector('#fNoteVAlign');
    if(fnva){
      fnva.onchange=e=>{c.vAlign=e.target.value;renderComps();};
    }
    document.querySelector('#fDes').oninput=e=>{c.des=e.target.value;renderComps();};
    document.querySelector('#btnRot').onclick=()=>{c.r=((c.r||0)+90)%360;render();};
    document.querySelector('#btnDel').onclick=()=>{deleteSelection();render();};
  } else if(state.sel&&state.sel.kind==='wire'){
    const w=state.wires.find(w=>w.id===state.sel.id);
    el.innerHTML=`<h2>Wire</h2>
      <div class="desig">${esc(w.gauge)} mm² ${esc(w.color)}${w.tracer?'/'+esc(w.tracer):''}</div>
      <div class="field"><label>Base color</label>${swatches(w.color,'wc',false)}</div>
      <div class="field"><label>Tracer stripe</label>${swatches(w.tracer,'wt',true)}</div>
      <div class="field"><label for="fGauge">Gauge</label>
        <select id="fGauge">${GAUGES.map(g=>`<option ${g===w.gauge?'selected':''}>${g}</option>`).join('')}</select></div>
      <button id="btnStraight" ${w.wp&&w.wp.length?'':'disabled'}>Straighten (${(w.wp||[]).length} guide pts)</button>
      <button id="btnDel" class="danger">Delete wire</button>
      <p class="hint"><b>Routing:</b> double-click the wire to add a guide point, drag the amber squares to steer it around parts, double-click a square to remove it.</p>`;
    el.querySelectorAll('[data-wc]').forEach(b=>b.onclick=()=>{w.color=b.dataset.wc;render();});
    el.querySelectorAll('[data-wt]').forEach(b=>b.onclick=()=>{w.tracer=b.dataset.wt;render();});
    document.querySelector('#fGauge').onchange=e=>{w.gauge=e.target.value;render();};
    document.querySelector('#btnStraight').onclick=()=>{w.wp=[];render();};
    document.querySelector('#btnDel').onclick=()=>{deleteSelection();render();};
  } else {
    el.innerHTML=`<h2>Next wire</h2>
      <div class="field"><label>Base color</label>${swatches(state.wireDefaults.color,'dc',false)}</div>
      <div class="field"><label>Tracer stripe</label>${swatches(state.wireDefaults.tracer,'dt',true)}</div>
      <div class="field"><label for="fGauge">Gauge</label>
        <select id="fGauge">${GAUGES.map(g=>`<option ${g===state.wireDefaults.gauge?'selected':''}>${g}</option>`).join('')}</select></div>
      <p class="hint"><b>How to wire:</b> click a pin, then click another pin. New wires use these settings; select any wire later to change it.<br><br><b>Routing:</b> double-click a wire to add a draggable guide point.<br><br><b>Keys:</b> Del removes selection · Esc cancels a pending wire · arrow keys nudge the selected part (Shift for 1px steps).</p>`;
    el.querySelectorAll('[data-dc]').forEach(b=>b.onclick=()=>{state.wireDefaults.color=b.dataset.dc;renderProps();});
    el.querySelectorAll('[data-dt]').forEach(b=>b.onclick=()=>{state.wireDefaults.tracer=b.dataset.dt;renderProps();});
    document.querySelector('#fGauge').onchange=e=>{state.wireDefaults.gauge=e.target.value;};
  }
}
