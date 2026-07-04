/* ============ component library and relay drawing ============
   draw() returns inner SVG (inline attributes only, so the
   SVG export is self-contained). Local origin = top-left.   */

function relayArt(spdt){
  const w = spdt?140:120;
  const noX = 90, comX = 90;
  let s = `
    <rect x="10" y="10" width="${w-20}" height="70" rx="4" fill="#26221c"
          stroke="#8d6e63" stroke-width="1.6" stroke-dasharray="5 4"/>
    <line x1="30" y1="0" x2="30" y2="20" stroke="#f9a825" stroke-width="2"/>
    <line x1="30" y1="70" x2="30" y2="90" stroke="#f9a825" stroke-width="2"/>
    <rect x="20" y="20" width="20" height="50" fill="#1c2024" stroke="#f9a825" stroke-width="2"/>
    <line x1="20" y1="20" x2="40" y2="70" stroke="#f9a825" stroke-width="1.2"/>
    <line x1="${comX}" y1="0" x2="${comX}" y2="24" stroke="#d7dde3" stroke-width="2"/>
    <circle cx="${comX}" cy="26" r="3" fill="#1c2024" stroke="#d7dde3" stroke-width="2"/>
    <line x1="${noX}" y1="90" x2="${noX}" y2="66" stroke="#d7dde3" stroke-width="2"/>
    <circle cx="${noX}" cy="62" r="3" fill="#1c2024" stroke="#d7dde3" stroke-width="2"/>
    <line x1="${comX-1}" y1="29" x2="${noX-6}" y2="58" stroke="#d7dde3" stroke-width="2"/>`;
  if(spdt) s += `
    <line x1="130" y1="90" x2="130" y2="66" stroke="#d7dde3" stroke-width="2"/>
    <circle cx="130" cy="62" r="3" fill="#1c2024" stroke="#d7dde3" stroke-width="2"/>`;
  return s;
}

export const LIB = {
  battery:{name:'Battery',prefix:'BAT',w:80,h:60,
    pins:[{id:'plus',label:'+',x:20,y:0},{id:'minus',label:'−',x:60,y:0}],
    valBase:{x:40,y:58}, valColor:'#8a939c', valSize:8,
    draw:c=>`
      <rect x="0" y="10" width="80" height="50" rx="4" fill="#262b30" stroke="#f9a825" stroke-width="2"/>
      <line x1="20" y1="0" x2="20" y2="10" stroke="#f9a825" stroke-width="2"/>
      <line x1="60" y1="0" x2="60" y2="10" stroke="#9e9e9e" stroke-width="2"/>
      <text transform="rotate(${-(c.r||0)}, 20, 24)" x="20" y="24" fill="#f9a825" font-size="13" text-anchor="middle" font-family="inherit">+</text>
      <text transform="rotate(${-(c.r||0)}, 60, 24)" x="60" y="24" fill="#9e9e9e" font-size="13" text-anchor="middle" font-family="inherit">−</text>
      <line x1="30" y1="34" x2="30" y2="52" stroke="#f9a825" stroke-width="2.4"/>
      <line x1="38" y1="39" x2="38" y2="47" stroke="#f9a825" stroke-width="2.4"/>
      <line x1="48" y1="34" x2="48" y2="52" stroke="#f9a825" stroke-width="2.4"/>
      <line x1="56" y1="39" x2="56" y2="47" stroke="#f9a825" stroke-width="2.4"/>`,
    value:'12V'},
  fuse:{name:'Fuse',prefix:'F',w:40,h:60,
    pins:[{id:'1',label:'1',x:20,y:0},{id:'2',label:'2',x:20,y:60}],
    valBase:{x:35,y:34}, valColor:'#ef5350', valSize:10, valAlign:'start',
    draw:c=>`
      <line x1="20" y1="0" x2="20" y2="60" stroke="#d7dde3" stroke-width="2"/>
      <rect x="10" y="12" width="20" height="36" fill="#1c2024" stroke="#ef5350" stroke-width="2"/>`,
    value:'15A'},
  relay:{name:'Relay SPST',prefix:'K',w:120,h:90,
    pins:[{id:'86',label:'86',x:30,y:0},{id:'85',label:'85',x:30,y:90},
          {id:'30',label:'30',x:90,y:0},{id:'87',label:'87',x:90,y:90}],
    draw:()=>relayArt(false)},
  relay5:{name:'Relay SPDT',prefix:'K',w:140,h:90,
    pins:[{id:'86',label:'86',x:30,y:0},{id:'85',label:'85',x:30,y:90},
          {id:'30',label:'30',x:90,y:0},{id:'87',label:'87',x:90,y:90},{id:'87a',label:'87a',x:130,y:90}],
    draw:()=>relayArt(true)},
  switch:{name:'Switch',prefix:'S',w:60,h:40,
    pins:[{id:'1',label:'1',x:0,y:20},{id:'2',label:'2',x:60,y:20}],
    draw:()=>`
      <line x1="0" y1="20" x2="14" y2="20" stroke="#d7dde3" stroke-width="2"/>
      <line x1="46" y1="20" x2="60" y2="20" stroke="#d7dde3" stroke-width="2"/>
      <circle cx="14" cy="20" r="3" fill="#1c2024" stroke="#d7dde3" stroke-width="2"/>
      <circle cx="46" cy="20" r="3" fill="#1c2024" stroke="#d7dde3" stroke-width="2"/>
      <line x1="16" y1="19" x2="43" y2="4" stroke="#d7dde3" stroke-width="2"/>`},
  motor:{name:'Motor / fan',prefix:'M',w:60,h:60,
    pins:[{id:'1',label:'+',x:30,y:0},{id:'2',label:'−',x:30,y:60}],
    draw:c=>`
      <line x1="30" y1="0" x2="30" y2="10" stroke="#d7dde3" stroke-width="2"/>
      <line x1="30" y1="50" x2="30" y2="60" stroke="#d7dde3" stroke-width="2"/>
      <circle cx="30" cy="30" r="20" fill="#1e2b21" stroke="#66bb6a" stroke-width="2"/>
      <text transform="rotate(${-(c.r||0)}, 30, 35)" x="30" y="35" fill="#66bb6a" font-size="14" text-anchor="middle" font-family="inherit">M</text>`},
  pump:{name:'Fuel pump',prefix:'M',w:60,h:60,
    pins:[{id:'1',label:'+',x:30,y:0},{id:'2',label:'−',x:30,y:60}],
    draw:c=>`
      <line x1="30" y1="0" x2="30" y2="10" stroke="#d7dde3" stroke-width="2"/>
      <line x1="30" y1="50" x2="30" y2="60" stroke="#d7dde3" stroke-width="2"/>
      <circle cx="30" cy="30" r="20" fill="#1e2b21" stroke="#66bb6a" stroke-width="2"/>
      <path d="M30 18 L40 36 L20 36 Z" fill="none" stroke="#66bb6a" stroke-width="2"/>`},
  lamp:{name:'Lamp',prefix:'E',w:60,h:60,
    pins:[{id:'1',label:'+',x:30,y:0},{id:'2',label:'−',x:30,y:60}],
    draw:()=>`
      <line x1="30" y1="0" x2="30" y2="10" stroke="#d7dde3" stroke-width="2"/>
      <line x1="30" y1="50" x2="30" y2="60" stroke="#d7dde3" stroke-width="2"/>
      <circle cx="30" cy="30" r="20" fill="#2b2620" stroke="#fdd835" stroke-width="2"/>
      <line x1="16" y1="16" x2="44" y2="44" stroke="#fdd835" stroke-width="2"/>
      <line x1="44" y1="16" x2="16" y2="44" stroke="#fdd835" stroke-width="2"/>`},
  ecu:{name:'ECU Block',prefix:'A',w:120,h:60,
    pins:[], // pins will be generated dynamically based on pinCount
    getPin:(idx)=>({id:'p'+idx,label:''+idx,x:0,y:20}),
    getHeight:(pinCount=4)=>{
      return Math.max(80, 20 + pinCount * 16 + 20);
    },
    getPins:(pinCount=4)=>{
      const h = Math.max(80, 20 + pinCount * 16 + 20);
      const pins=[];
      if(pinCount===0) return pins;
      if(pinCount===1){
        pins.push({id:'p0',label:'1',x:0,y:h/2});
      } else {
        const spacing = (h - 40) / (pinCount - 1);
        for(let i=0;i<pinCount;i++){
          pins.push({id:'p'+i,label:''+(i+1),x:0,y:20+i*spacing});
        }
      }
      return pins;
    },
    draw:c=>{
      const pinCount=c.pinCount||4;
      const h=Math.max(80, 20 + pinCount * 16 + 20);
      return `
        <rect x="10" y="0" width="110" height="${h}" rx="3" fill="#241f30" stroke="#9575cd" stroke-width="2"/>
        <g transform="rotate(${-(c.r||0)}, 65, ${h/2})">
          <text x="65" y="${h/2+4}" fill="#b39ddb" font-size="12" text-anchor="middle" font-family="inherit">ECU</text>
        </g>`;
    },
    value:''},
  connector:{name:'Connector',prefix:'C',w:40,h:20,
    pins:[{id:'a',label:'a',x:0,y:10},{id:'b',label:'b',x:40,y:10}],
    draw:()=>`
      <line x1="0" y1="10" x2="10" y2="10" stroke="#ce93d8" stroke-width="2"/>
      <line x1="30" y1="10" x2="40" y2="10" stroke="#ce93d8" stroke-width="2"/>
      <path d="M10 0 h20 l6 10 l-6 10 h-20 Z" fill="#2a2130" stroke="#ce93d8" stroke-width="2"/>`},
  ground:{name:'Ground',prefix:'G',w:40,h:30,
    pins:[{id:'g',label:'⏚',x:20,y:0}],
    draw:()=>`
      <line x1="20" y1="0" x2="20" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="6" y1="14" x2="34" y2="14" stroke="#d7dde3" stroke-width="2.4"/>
      <line x1="10" y1="20" x2="30" y2="20" stroke="#d7dde3" stroke-width="2.4"/>
      <line x1="16" y1="26" x2="24" y2="26" stroke="#d7dde3" stroke-width="2.4"/>`},
  splice:{name:'Splice',prefix:'X',w:20,h:20,
    pins:[{id:'x',label:'',x:10,y:10}],
    draw:()=>`<circle cx="10" cy="10" r="5" fill="#d7dde3"/>`},
  injector:{name:'Fuel Injector',prefix:'Y',w:40,h:60,
    pins:[{id:'1',label:'+',x:20,y:0},{id:'2',label:'−',x:20,y:60}],
    draw:()=>`
      <line x1="20" y1="0" x2="20" y2="10" stroke="#d7dde3" stroke-width="2"/>
      <line x1="20" y1="50" x2="20" y2="60" stroke="#d7dde3" stroke-width="2"/>
      <rect x="10" y="10" width="20" height="26" fill="#2e1a1a" stroke="#ef5350" stroke-width="2"/>
      <path d="M14 36 L26 36 L20 50 Z" fill="#2e1a1a" stroke="#ef5350" stroke-width="2"/>
      <line x1="10" y1="18" x2="30" y2="18" stroke="#ef5350" stroke-width="1.5"/>
      <line x1="10" y1="26" x2="30" y2="26" stroke="#ef5350" stroke-width="1.5"/>`},
  sensor2:{name:'Sensor (2-pin)',prefix:'B',w:40,h:40,
    pins:[{id:'1',label:'1',x:10,y:0},{id:'2',label:'2',x:30,y:0}],
    draw:()=>`
      <line x1="10" y1="0" x2="10" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="30" y1="0" x2="30" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <circle cx="20" cy="24" r="14" fill="#182529" stroke="#4dd0e1" stroke-width="2"/>
      <path d="M12 26 Q16 20 20 26 T28 26" fill="none" stroke="#4dd0e1" stroke-width="1.5"/>`},
  sensor3:{name:'Sensor (3-pin)',prefix:'B',w:60,h:40,
    pins:[{id:'5v',label:'5V',x:10,y:0},{id:'sig',label:'S',x:30,y:0},{id:'gnd',label:'G',x:50,y:0}],
    draw:()=>`
      <line x1="10" y1="0" x2="10" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="30" y1="0" x2="30" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="50" y1="0" x2="50" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <path d="M4 14 h52 v14 a10 10 0 0 1 -10 10 h-32 a10 10 0 0 1 -10 -10 z" fill="#182529" stroke="#4dd0e1" stroke-width="2"/>
      <circle cx="30" cy="26" r="4" fill="none" stroke="#4dd0e1" stroke-width="1.5"/>`},
  valve:{name:'Solenoid Valve',prefix:'Y',w:60,h:40,
    pins:[{id:'1',label:'1',x:0,y:20},{id:'2',label:'2',x:60,y:20}],
    draw:()=>`
      <line x1="0" y1="20" x2="12" y2="20" stroke="#d7dde3" stroke-width="2"/>
      <line x1="48" y1="20" x2="60" y2="20" stroke="#d7dde3" stroke-width="2"/>
      <path d="M12 10 L26 30 L26 10 L12 30 Z" fill="#2b2620" stroke="#fdd835" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M48 10 L34 30 L34 10 L48 30 Z" fill="#2b2620" stroke="#fdd835" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="22" y="2" width="16" height="16" fill="#1c2024" stroke="#fdd835" stroke-width="1.5"/>
      <line x1="22" y1="18" x2="38" y2="2" stroke="#fdd835" stroke-width="1.5"/>`},
  ublock:{name:'Universal Block',prefix:'U',w:80,h:80,
    pins:[{id:'1',label:'1',x:0,y:20},{id:'2',label:'2',x:0,y:60},
          {id:'3',label:'3',x:80,y:20},{id:'4',label:'4',x:80,y:60}],
    draw:()=>`
      <line x1="0" y1="20" x2="10" y2="20" stroke="#d7dde3" stroke-width="2"/>
      <line x1="0" y1="60" x2="10" y2="60" stroke="#d7dde3" stroke-width="2"/>
      <line x1="70" y1="20" x2="80" y2="20" stroke="#d7dde3" stroke-width="2"/>
      <line x1="70" y1="60" x2="80" y2="60" stroke="#d7dde3" stroke-width="2"/>
      <rect x="10" y="0" width="60" height="80" rx="4" fill="#24282e" stroke="#8a939c" stroke-width="2" stroke-dasharray="6 3"/>`},
  note:{name:'Text Note',prefix:'N',w:200,h:60,
    pins:[],
    draw:c=>{
      const text = c.noteText||'Note';
      const bgColor = c.bgColor||'#1e1a2e';
      const textColor = c.textColor||'#b39ddb';
      const hAlign = c.hAlign||'center';
      const vAlign = c.vAlign||'middle';
      const textX = hAlign==='left'?10:(hAlign==='right'?190:100);
      const textY = vAlign==='top'?16:(vAlign==='bottom'?52:32);
      const textAnchor = hAlign==='left'?'start':(hAlign==='right'?'end':'middle');
      return `
      <rect x="0" y="0" width="200" height="60" rx="3" fill="${bgColor}" stroke="#9575cd" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="${textX}" y="${textY}" fill="${textColor}" font-size="11" text-anchor="${textAnchor}" font-family="inherit" pointer-events="none">${c.noteText||'Note'}</text>`;
    }}
};
