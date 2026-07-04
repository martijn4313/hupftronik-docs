/* ============ rendering layer ============ */

import { DIN, GAUGES } from './constants.js';
import { LIB, ecuHeight, IGN_POSITIONS } from './components.js';
import { state, esc, comp, uid, hooks } from './state.js';
import { pinPos, pinAxis, textAnchor, textOffset, wirePath, routePoints, pinTextAnchor, pinTextOffset } from './geometry.js';

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
  const labelPoint = (pts)=>{
    if(!pts.length) return {x:0,y:0};
    if(pts.length===1) return pts[0];
    let total=0;
    for(let i=0;i<pts.length-1;i++) total+=Math.hypot(pts[i+1].x-pts[i].x,pts[i+1].y-pts[i].y);
    if(total<1) return pts[Math.floor(pts.length/2)];
    let run=0, half=total/2;
    for(let i=0;i<pts.length-1;i++){
      const a=pts[i],b=pts[i+1];
      const seg=Math.hypot(b.x-a.x,b.y-a.y);
      if(run+seg>=half){
        const t=(half-run)/seg;
        return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
      }
      run+=seg;
    }
    return pts[pts.length-1];
  };
  wiresL.innerHTML = state.wires.map(w=>{
    const ca=state.comps.find(c=>c.id===w.a.comp), cb=state.comps.find(c=>c.id===w.b.comp);
    const a=pinPos(ca,w.a.pin), b=pinPos(cb,w.b.pin);
    const pts=routePoints(a,b,w.wp,pinAxis(ca,w.a.pin),pinAxis(cb,w.b.pin));
    const d='M'+pts.map(p=>`${p.x} ${p.y}`).join(' L');
    const base=DIN[w.color]||'#fff';
    const width = parseFloat(w.gauge)>=2.5?5:3.5;
    const dark = (w.color==='BK'||w.color==='BN');
    const halo = dark?'rgba(255,255,255,.5)':'rgba(0,0,0,.45)';
    const traceOn = !!state.trace;
    const hot = traceOn && !!state.trace.wireIds[w.id];
    const gnd = traceOn && state.trace.gndWireIds && !!state.trace.gndWireIds[w.id];
    const traced = !traceOn || hot || gnd;
    const dimOpacity = traceOn && !traced ? 0.14 : 1;
    const traceGlow = hot
      ? `<path d="${d}" fill="none" stroke="#66bb6a" stroke-width="${width+6}" opacity=".25"/>`
      : (gnd ? `<path d="${d}" fill="none" stroke="#4dd0e1" stroke-width="${width+6}" opacity=".16"/>` : '');
    const selHalo = (state.sel&&state.sel.kind==='wire'&&state.sel.id===w.id)
      ? `<path d="${d}" fill="none" stroke="#f9a825" stroke-width="${width+5}" opacity=".55"/>`:'';
    const tracer = w.tracer
      ? `<path d="${d}" fill="none" stroke="${DIN[w.tracer]}" stroke-width="${Math.max(width-1.8,1.2)}" stroke-dasharray="9 9" stroke-linecap="butt"/>`:'';
    const lenTxt = `${String(w.lengthMm||'').trim()}`;
    const parts = [`${w.gauge} mm²`];
    if(lenTxt) parts.push(`${esc(lenTxt)} mm`);
    const labelTxt = parts.join(' · ');
    const p = labelPoint(pts);
    const lblW = Math.max(56, Math.round(labelTxt.length * 6.2 + 12));
    const wireLabel = state.showWireLabels
      ? `<g class="wire-label" opacity="${traceOn&&!traced?0.3:1}">
          <rect x="${p.x-lblW/2}" y="${p.y-9}" width="${lblW}" height="16" rx="3" fill="rgba(21,24,27,0.9)" stroke="rgba(138,147,156,0.5)" stroke-width="1"/>
          <text x="${p.x}" y="${p.y+2.8}" fill="#d7dde3" font-size="9" text-anchor="middle" font-family="inherit">${labelTxt}</text>
        </g>`
      : '';
    return `<g opacity="${dimOpacity}">${traceGlow}${selHalo}
      <path d="${d}" fill="none" stroke="${halo}" stroke-width="${width+2}"/>
      <path d="${d}" fill="none" stroke="${base}" stroke-width="${width}" stroke-linecap="round"/>
      ${tracer}
      ${wireLabel}
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
      compH = ecuHeight(c.pins.length);
    }
    if(c.type==='note'){
      compW = Math.max(80, +c.noteW || d.w);
      compH = Math.max(40, +c.noteH || d.h);
    }

    const isSel = state.sel&&state.sel.kind==='comp'&&state.sel.id===c.id;
    const traceOn = !!state.trace;
    const traced = !traceOn || !!state.trace.compIds[c.id];
    const lit = traceOn && state.trace.litCompIds && state.trace.litCompIds[c.id];
    const energized = traceOn && state.trace.energized && state.trace.energized[c.id];
    const sourceMark = traceOn && state.trace.sourceCompId===c.id
      ? `<rect x="-10" y="-10" width="${compW+20}" height="${compH+20}" rx="8" fill="none" stroke="#66bb6a" stroke-width="1.8" stroke-dasharray="6 4"/>`
      : '';
    const litMark = lit
      ? `<rect x="-6" y="-6" width="${compW+12}" height="${compH+12}" rx="6" fill="rgba(253,216,53,0.10)" stroke="#fdd835" stroke-width="1.6"/>`
      : '';
    const energizedMark = energized
      ? `<circle cx="${compW-4}" cy="4" r="4" fill="#66bb6a" pointer-events="none"/>`
      : '';
    const selRect = isSel
      ? `<rect x="-8" y="-8" width="${compW+16}" height="${compH+16}" rx="6" fill="none"
              stroke="#f9a825" stroke-width="1.4" stroke-dasharray="4 4"/>`:'';
    const invR = -(c.r || 0);
    const desBase = textAnchor('des',d,c);
    const desOff = textOffset(c,'des');
    const labelBase = textAnchor('label',d,c);
    const labelOff = textOffset(c,'label');
    const valBase = textAnchor('value',d,c);
    const valOff = textOffset(c,'value');
        const rot = ((c.r||0)%360 + 360) % 360;
        const valAlign = c.type==='fuse' && (rot===90||rot===270) ? 'middle' : (d.valAlign||'middle');
    const valNode = ('value' in c && c.value)
      ? `<text class="comp-text" data-comp="${c.id}" data-role="value" transform="rotate(${invR}, ${valBase.x+valOff.x}, ${valBase.y+valOff.y})"
        x="${valBase.x+valOff.x}" y="${valBase.y+valOff.y}" fill="${d.valColor||'#8a939c'}" font-size="${d.valSize||10}" text-anchor="${valAlign}"
            font-family="inherit" pointer-events="all">${esc(c.value)}</text>`
      : '';
    
    const pins = (c.pins||d.pins).map(p=>{
      const pinBase = pinTextAnchor(d, p, c);
      const pinOff = pinTextOffset(c, p.id);
      const pinCandidate = !!(
        state.pending &&
        state.connectCandidate &&
        state.connectCandidate.compId === c.id &&
        state.connectCandidate.pinId === p.id
      );
      const drive = c.type==='ecu' && c.pinStates ? c.pinStates[p.id] : null;
      const pinStroke = pinCandidate ? '#66bb6a' : (drive==='12v' ? '#ef5350' : (drive==='gnd' ? '#90a4ae' : '#f9a825'));
      const pinFill = drive==='12v' ? '#3a1d1d' : (drive==='gnd' ? '#20262b' : '#15181b');
      return `<g>
        <circle class="pin" data-comp="${c.id}" data-pin="${p.id}" cx="${p.x}" cy="${p.y}"
                r="16" fill="rgba(0,0,0,0)" stroke="rgba(0,0,0,0)" stroke-width="0" pointer-events="all"/>
        <circle class="pin" data-comp="${c.id}" data-pin="${p.id}" cx="${p.x}" cy="${p.y}"
                r="${pinCandidate?7:(state.pending?6:4.5)}" fill="${pinFill}" stroke="${pinStroke}" stroke-width="${pinCandidate?2.2:(drive?2.2:1.6)}" pointer-events="none"/>
        ${p.label?`<text class="comp-text" data-comp="${c.id}" data-role="pin" data-pinid="${p.id}" transform="rotate(${invR}, ${pinBase.x+pinOff.x}, ${pinBase.y+pinOff.y})" x="${pinBase.x+pinOff.x}" y="${pinBase.y+pinOff.y}" fill="#8a939c" font-size="8" text-anchor="${pinBase.anchor||'start'}"
              font-family="inherit" pointer-events="all">${esc(p.label)}</text>`:''}
      </g>`;
    }).join('');
    const noteResizeHandle = isSel && c.type==='note'
      ? `<rect class="note-resize-handle" data-comp="${c.id}" data-handle="se" x="${compW-6}" y="${compH-6}" width="12" height="12" rx="2"
          fill="#15181b" stroke="#66bb6a" stroke-width="1.8"/>`
      : '';
    const primaryPin = (c.pins||d.pins)[0];
    const orientDot = primaryPin
      ? `<circle cx="${primaryPin.x}" cy="${primaryPin.y-6}" r="2" fill="#f9a825" opacity="0.95" pointer-events="none"/>`
      : '';
    return `<g transform="translate(${c.x},${c.y}) rotate(${c.r||0}, ${compW/2}, ${compH/2})" opacity="${traceOn&&!traced?0.2:1}">
      ${sourceMark}
      ${litMark}
      ${energizedMark}
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
      ${noteResizeHandle}
    </g>`;
  }).join('');
}

export function renderTemp(mouse){
  if(!state.pending){tempL.innerHTML='';return;}
  const c = state.comps.find(c=>c.id===state.pending.compId);
  const a=pinPos(c,state.pending.pinId);
  const b=mouse||a;
  let endAxis=null;
  if(state.connectCandidate){
    const cc=comp(state.connectCandidate.compId);
    if(cc) endAxis=pinAxis(cc,state.connectCandidate.pinId);
  }
  const markers=(state.pendingWp||[]).map(p=>
    `<rect x="${p.x-4}" y="${p.y-4}" width="8" height="8" rx="2" fill="#15181b" stroke="#f9a825" stroke-width="1.6" pointer-events="none"/>`).join('');
  tempL.innerHTML=`<path d="${wirePath(a,b,state.pendingWp||[],pinAxis(c,state.pending.pinId),endAxis)}" fill="none" stroke="${DIN[state.wireDefaults.color]}"
    stroke-width="3" stroke-dasharray="6 6" opacity=".8"/>${markers}`;
}

export function renderStatus(){
  document.querySelector('#stCounts').textContent =
    `${state.comps.length} components · ${state.wires.length} wires`;
  document.querySelector('#stHint').textContent = state.pending
    ? 'Click canvas to drop guide points (Backspace removes the last one), then click a destination pin — Esc cancels'
    : (state.trace
      ? 'Interactive: click switches / ignition key to toggle · click ECU pins to cycle +12V / ground / off · click empty canvas to exit'
      : 'Click a palette part to place it · pin → pin runs a wire · click battery/relay for interactive power mode · arrows nudge selection');
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
  state.trace=null;
}

export function renderProps(){
  const el=document.querySelector('#props');
  if(state.sel&&state.sel.kind==='comp'){
    const c=comp(state.sel.id), d=LIB[c.type];
    
    let ecuControls='';
    if(c.type==='ecu'){
      const pinRows=(c.pins||[]).map(p=>{
        const drive=(c.pinStates&&c.pinStates[p.id])||'';
        return `<div class="pin-row">
          <input type="text" class="ecu-pin-label" data-pin="${p.id}" value="${esc(p.label)}" title="pin label">
          <select class="ecu-pin-drive" data-pin="${p.id}" title="drive this pin in interactive mode">
            <option value="" ${drive===''?'selected':''}>off</option>
            <option value="12v" ${drive==='12v'?'selected':''}>+12V</option>
            <option value="gnd" ${drive==='gnd'?'selected':''}>GND</option>
          </select>
        </div>`;
      }).join('');
      ecuControls=`
      <div class="field"><label for="fPinCount">Number of pins</label>
        <input type="number" id="fPinCount" min="1" max="32" value="${c.pinCount||4}"></div>
      <div class="field"><label>Pinout — label · output drive</label>${pinRows}</div>`;
    }

    let switchControls='';
    if(c.type==='switch'){
      switchControls=`
      <div class="field"><label><input type="checkbox" id="fSwOn" ${c.on?'checked':''}> Contact closed (ON)</label></div>`;
    }

    let ignControls='';
    if(c.type==='ignition'){
      ignControls=`
      <div class="field"><label for="fKeyPos">Key position</label>
        <select id="fKeyPos">${IGN_POSITIONS.map((pos,i)=>
          `<option value="${i}" ${(c.keyPos||0)===i?'selected':''}>${pos}</option>`).join('')}</select></div>`;
    }
    
    let noteControls='';
    if(c.type==='note'){
      noteControls=`
      <div class="field"><label for="fNoteText">Text</label>
        <textarea id="fNoteText" rows="5">${esc(c.noteText||'Note')}</textarea></div>
      <div class="field"><label for="fNoteW">Width</label>
        <input type="number" id="fNoteW" min="80" max="1200" step="10" value="${Math.max(80,+c.noteW||200)}"></div>
      <div class="field"><label for="fNoteH">Height</label>
        <input type="number" id="fNoteH" min="40" max="800" step="10" value="${Math.max(40,+c.noteH||60)}"></div>
      <div class="field"><label for="fNoteFont">Font family</label>
        <select id="fNoteFont">
          <option value="inherit" ${(c.noteFont||'inherit')==='inherit'?'selected':''}>Editor default</option>
          <option value="ui-monospace, 'Cascadia Code', 'JetBrains Mono', Consolas, monospace" ${c.noteFont==="ui-monospace, 'Cascadia Code', 'JetBrains Mono', Consolas, monospace"?'selected':''}>Monospace</option>
          <option value="'Segoe UI', 'Noto Sans', Arial, sans-serif" ${c.noteFont==="'Segoe UI', 'Noto Sans', Arial, sans-serif"?'selected':''}>Sans</option>
          <option value="Georgia, 'Times New Roman', serif" ${c.noteFont==="Georgia, 'Times New Roman', serif"?'selected':''}>Serif</option>
        </select></div>
      <div class="field"><label for="fNoteFontSize">Font size</label>
        <input type="number" id="fNoteFontSize" min="8" max="72" step="1" value="${Math.max(8,+c.noteFontSize||11)}"></div>
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
      ${switchControls}
      ${ignControls}
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
        const old=c.pins||[];
        c.pins=d.getPins(c.pinCount);
        c.pins.forEach((p,i)=>{ if(old[i]&&old[i].label) p.label=old[i].label; });
        if(c.pinStates) for(const k of Object.keys(c.pinStates))
          if(!c.pins.some(p=>p.id===k)) delete c.pinStates[k];
        if(state.trace&&hooks.simulate) hooks.simulate();
        render();
      };
    }
    el.querySelectorAll('.ecu-pin-label').forEach(inp=>{
      inp.oninput=e=>{
        const p=(c.pins||[]).find(p=>p.id===inp.dataset.pin);
        if(p){p.label=e.target.value;renderComps();}
      };
    });
    el.querySelectorAll('.ecu-pin-drive').forEach(sel=>{
      sel.onchange=e=>{
        c.pinStates=c.pinStates||{};
        if(e.target.value) c.pinStates[sel.dataset.pin]=e.target.value;
        else delete c.pinStates[sel.dataset.pin];
        if(state.trace&&hooks.simulate) hooks.simulate();
        renderWires();renderComps();
      };
    });
    const fsw=document.querySelector('#fSwOn');
    if(fsw){
      fsw.onchange=e=>{
        c.on=!!e.target.checked;
        if(state.trace&&hooks.simulate) hooks.simulate();
        renderWires();renderComps();
      };
    }
    const fkp=document.querySelector('#fKeyPos');
    if(fkp){
      fkp.onchange=e=>{
        c.keyPos=Math.max(0,Math.min(3,+e.target.value||0));
        if(state.trace&&hooks.simulate) hooks.simulate();
        renderWires();renderComps();
      };
    }
    // Note component properties
    const fnt=document.querySelector('#fNoteText');
    if(fnt){
      fnt.oninput=e=>{c.noteText=e.target.value;renderComps();};
    }
    const fnw=document.querySelector('#fNoteW');
    if(fnw){
      fnw.oninput=e=>{c.noteW=Math.max(80,Math.min(1200,+e.target.value||200));renderComps();};
    }
    const fnh=document.querySelector('#fNoteH');
    if(fnh){
      fnh.oninput=e=>{c.noteH=Math.max(40,Math.min(800,+e.target.value||60));renderComps();};
    }
    const fnf=document.querySelector('#fNoteFont');
    if(fnf){
      fnf.onchange=e=>{c.noteFont=e.target.value||'inherit';renderComps();};
    }
    const fnfs=document.querySelector('#fNoteFontSize');
    if(fnfs){
      fnfs.oninput=e=>{c.noteFontSize=Math.max(8,Math.min(72,+e.target.value||11));renderComps();};
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
      <div class="field"><label for="fLengthMm">Length (mm)</label>
        <input type="number" id="fLengthMm" min="0" step="1" value="${esc(w.lengthMm||'')}"></div>
      <div class="field"><label><input type="checkbox" id="fShowWireLabels" ${state.showWireLabels?'checked':''}> Show wire labels in schematic</label></div>
      <button id="btnStraight" ${w.wp&&w.wp.length?'':'disabled'}>Straighten (${(w.wp||[]).length} guide pts)</button>
      <button id="btnDel" class="danger">Delete wire</button>
      <p class="hint"><b>Routing:</b> double-click the wire to add a guide point, drag the amber squares to steer it around parts, double-click a square to remove it.</p>`;
    el.querySelectorAll('[data-wc]').forEach(b=>b.onclick=()=>{w.color=b.dataset.wc;render();});
    el.querySelectorAll('[data-wt]').forEach(b=>b.onclick=()=>{w.tracer=b.dataset.wt;render();});
    document.querySelector('#fGauge').onchange=e=>{w.gauge=e.target.value;render();};
    document.querySelector('#fLengthMm').oninput=e=>{w.lengthMm=e.target.value;renderWires();};
    document.querySelector('#fShowWireLabels').onchange=e=>{state.showWireLabels=!!e.target.checked;renderWires();};
    document.querySelector('#btnStraight').onclick=()=>{w.wp=[];render();};
    document.querySelector('#btnDel').onclick=()=>{deleteSelection();render();};
  } else {
    el.innerHTML=`<h2>Next wire</h2>
      <div class="field"><label>Base color</label>${swatches(state.wireDefaults.color,'dc',false)}</div>
      <div class="field"><label>Tracer stripe</label>${swatches(state.wireDefaults.tracer,'dt',true)}</div>
      <div class="field"><label for="fGauge">Gauge</label>
        <select id="fGauge">${GAUGES.map(g=>`<option ${g===state.wireDefaults.gauge?'selected':''}>${g}</option>`).join('')}</select></div>
      <div class="field"><label for="fLengthMm">Length (mm)</label>
        <input type="number" id="fLengthMm" min="0" step="1" value="${esc(state.wireDefaults.lengthMm||'')}"></div>
      <div class="field"><label><input type="checkbox" id="fShowWireLabels" ${state.showWireLabels?'checked':''}> Show wire labels in schematic</label></div>
      <p class="hint"><b>How to wire:</b> click a pin, then click canvas to add guide points, then click destination pin. New wires use these settings; select any wire later to change it.<br><br><b>Routing:</b> double-click a wire to add a draggable guide point.<br><br><b>Keys:</b> Del removes selection · Esc cancels a pending wire · arrow keys nudge the selected part (Shift for 1px steps).</p>`;
    el.querySelectorAll('[data-dc]').forEach(b=>b.onclick=()=>{state.wireDefaults.color=b.dataset.dc;renderProps();});
    el.querySelectorAll('[data-dt]').forEach(b=>b.onclick=()=>{state.wireDefaults.tracer=b.dataset.dt;renderProps();});
    document.querySelector('#fGauge').onchange=e=>{state.wireDefaults.gauge=e.target.value;};
    document.querySelector('#fLengthMm').oninput=e=>{state.wireDefaults.lengthMm=e.target.value;};
    document.querySelector('#fShowWireLabels').onchange=e=>{state.showWireLabels=!!e.target.checked;renderWires();};
  }
  const toolbarToggle = document.querySelector('#chkWireLabels');
  if(toolbarToggle){
    toolbarToggle.checked = !!state.showWireLabels;
    toolbarToggle.onchange = ()=>{state.showWireLabels=toolbarToggle.checked;renderWires();renderProps();};
  }
}
