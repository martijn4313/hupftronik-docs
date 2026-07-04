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

/* ECU pin layout: fixed 20px pitch so every pin lands on the snap grid */
export function ecuHeight(pinCount=4){
  return Math.max(80, (pinCount-1)*20 + 40);
}
function ecuPins(pinCount=4){
  const h=ecuHeight(pinCount);
  const pins=[];
  if(pinCount<=0) return pins;
  if(pinCount===1) return [{id:'p0',label:'1',x:0,y:h/2}];
  const start=(h-(pinCount-1)*20)/2;
  for(let i=0;i<pinCount;i++){
    pins.push({id:'p'+i,label:''+(i+1),x:0,y:start+i*20});
  }
  return pins;
}

function clonePins(pins){
  return pins.map(pin=>({ ...pin }));
}

export function hasPins(pins){
  return Array.isArray(pins) && pins.length>0;
}

export function shouldApplyPresetPins(c,d){
  return !!d?.getPins && (!hasPins(c.pins) || c.variant!=='custom');
}

/* ignition key positions and which terminals conduct in each */
export const IGN_POSITIONS = ['OFF','ACC','ON','START'];
export const IGN_CONDUCT = [
  [],
  [['30','acc']],
  [['30','acc'],['30','15']],
  [['30','15'],['30','50']]
];

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
    draw:c=>`
      <line x1="0" y1="20" x2="14" y2="20" stroke="#d7dde3" stroke-width="2"/>
      <line x1="46" y1="20" x2="60" y2="20" stroke="#d7dde3" stroke-width="2"/>
      <circle cx="14" cy="20" r="3" fill="#1c2024" stroke="#d7dde3" stroke-width="2"/>
      <circle cx="46" cy="20" r="3" fill="#1c2024" stroke="#d7dde3" stroke-width="2"/>
      ${c.on
        ? `<line x1="17" y1="20" x2="43" y2="20" stroke="#66bb6a" stroke-width="2.4"/>`
        : `<line x1="16" y1="19" x2="43" y2="4" stroke="#d7dde3" stroke-width="2"/>`}`},
  ignition:{name:'Ignition Switch',prefix:'S',w:80,h:60,
    pins:[{id:'acc',label:'ACC',x:10,y:0},{id:'15',label:'15',x:40,y:0},{id:'50',label:'50',x:70,y:0},
          {id:'30',label:'30',x:40,y:60}],
    draw:c=>{
      const pos=Math.max(0,Math.min(3,+c.keyPos||0));
      const ang=[-50,-17,17,50][pos]*Math.PI/180;
      const kx=40+Math.sin(ang)*8.5, ky=30-Math.cos(ang)*8.5;
      return `
      <line x1="10" y1="0" x2="10" y2="10" stroke="#d7dde3" stroke-width="2"/>
      <line x1="40" y1="0" x2="40" y2="10" stroke="#d7dde3" stroke-width="2"/>
      <line x1="70" y1="0" x2="70" y2="10" stroke="#d7dde3" stroke-width="2"/>
      <line x1="40" y1="50" x2="40" y2="60" stroke="#f9a825" stroke-width="2"/>
      <rect x="0" y="10" width="80" height="40" rx="5" fill="#2b2620" stroke="#fdd835" stroke-width="2"/>
      <circle cx="40" cy="30" r="11" fill="#1c2024" stroke="#fdd835" stroke-width="1.6"/>
      <line x1="40" y1="30" x2="${kx.toFixed(1)}" y2="${ky.toFixed(1)}" stroke="#fdd835" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="40" cy="30" r="2" fill="#fdd835"/>
      <g transform="rotate(${-(c.r||0)}, 65, 30)">
        <text x="65" y="33" fill="#fdd835" font-size="7" text-anchor="middle" font-family="inherit">${IGN_POSITIONS[pos]}</text>
      </g>`;
    }},
  ignAmp1:{name:'Power Stage (1-ch)',prefix:'V',w:80,h:60,
    pins:[{id:'in',label:'IN',x:0,y:30},{id:'15',label:'15',x:40,y:0},
          {id:'31',label:'31',x:40,y:60},{id:'1',label:'1',x:80,y:30}],
    getPins:(variant='generic')=>{
      if(variant==='bosch-0227100124')
        return clonePins([{id:'in',label:'7',x:0,y:30},{id:'15',label:'15',x:40,y:0},
                          {id:'31',label:'31',x:40,y:60},{id:'1',label:'1',x:80,y:30}]);
      if(variant==='st-vb921sp')
        /* VB921SP SIP-4: 1=GND, 2=IN, 3=OUT, 4=VCC */
        return clonePins([{id:'in',label:'2',x:0,y:30},{id:'15',label:'4',x:40,y:0},
                          {id:'31',label:'1',x:40,y:60},{id:'1',label:'3',x:80,y:30}]);
      if(variant==='bip373')
        /* BIP373 TO-220: 1=Base/IN, 2=Emitter/GND, 3=Collector/OUT (no VCC pin) */
        return clonePins([{id:'in',label:'1',x:0,y:30},
                          {id:'31',label:'2',x:40,y:60},{id:'1',label:'3',x:80,y:30}]);
      return clonePins([{id:'in',label:'IN',x:0,y:30},{id:'15',label:'15',x:40,y:0},
                        {id:'31',label:'31',x:40,y:60},{id:'1',label:'1',x:80,y:30}]);
    },
    variants:[
      {id:'generic',name:'Generic single-channel'},
      {id:'bosch-0227100124',name:'Bosch 0 227 100 124'},
      {id:'st-vb921sp',name:'ST VB921SP'},
      {id:'bip373',name:'BIP373 (IGBT)'},
      {id:'custom',name:'Custom…'}],
    valBase:{x:88,y:34}, valColor:'#ff8a65', valSize:8, valAlign:'start',
    value:'Generic single-channel',
    draw:()=>`
      <line x1="0" y1="30" x2="10" y2="30" stroke="#d7dde3" stroke-width="2"/>
      <line x1="40" y1="0" x2="40" y2="10" stroke="#f9a825" stroke-width="2"/>
      <line x1="40" y1="50" x2="40" y2="60" stroke="#9e9e9e" stroke-width="2"/>
      <line x1="70" y1="30" x2="80" y2="30" stroke="#d7dde3" stroke-width="2"/>
      <rect x="10" y="10" width="60" height="40" rx="4" fill="#2e2018" stroke="#ff8a65" stroke-width="2"/>
      <line x1="16" y1="30" x2="24" y2="30" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="24" y1="22" x2="24" y2="38" stroke="#ff8a65" stroke-width="2"/>
      <line x1="24" y1="26" x2="34" y2="18" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="24" y1="34" x2="34" y2="42" stroke="#ff8a65" stroke-width="1.5"/>
      <path d="M44 34 h5 v-8 h5 v8 h5" fill="none" stroke="#ff8a65" stroke-width="1.5"/>`},
  ignAmp2:{name:'Power Stage (2-ch)',prefix:'V',w:80,h:80,
    pins:[{id:'in1',label:'IN1',x:0,y:30},{id:'in2',label:'IN2',x:0,y:50},
          {id:'15',label:'15',x:40,y:0},{id:'31',label:'31',x:40,y:80},
          {id:'1a',label:'1a',x:80,y:30},{id:'1b',label:'1b',x:80,y:50}],
    getPins:(variant='generic')=>clonePins(
      variant==='bosch-0227100200'
        ? [{id:'in1',label:'7',x:0,y:30},{id:'in2',label:'6',x:0,y:50},
           {id:'15',label:'15',x:40,y:0},{id:'31',label:'31',x:40,y:80},
           {id:'1a',label:'1',x:80,y:30},{id:'1b',label:'2',x:80,y:50}]
        : [{id:'in1',label:'IN1',x:0,y:30},{id:'in2',label:'IN2',x:0,y:50},
           {id:'15',label:'15',x:40,y:0},{id:'31',label:'31',x:40,y:80},
           {id:'1a',label:'1a',x:80,y:30},{id:'1b',label:'1b',x:80,y:50}]
    ),
    variants:[
      {id:'generic',name:'Generic twin-channel'},
      {id:'bosch-0227100200',name:'Bosch 0 227 100 200'},
      {id:'custom',name:'Custom…'}],
    valBase:{x:88,y:44}, valColor:'#ff8a65', valSize:8, valAlign:'start',
    value:'Generic twin-channel',
    draw:()=>`
      <line x1="0" y1="30" x2="10" y2="30" stroke="#d7dde3" stroke-width="2"/>
      <line x1="0" y1="50" x2="10" y2="50" stroke="#d7dde3" stroke-width="2"/>
      <line x1="40" y1="0" x2="40" y2="10" stroke="#f9a825" stroke-width="2"/>
      <line x1="40" y1="70" x2="40" y2="80" stroke="#9e9e9e" stroke-width="2"/>
      <line x1="70" y1="30" x2="80" y2="30" stroke="#d7dde3" stroke-width="2"/>
      <line x1="70" y1="50" x2="80" y2="50" stroke="#d7dde3" stroke-width="2"/>
      <rect x="10" y="10" width="60" height="60" rx="4" fill="#2e2018" stroke="#ff8a65" stroke-width="2"/>
      <line x1="16" y1="30" x2="22" y2="30" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="22" y1="24" x2="22" y2="36" stroke="#ff8a65" stroke-width="2"/>
      <line x1="22" y1="27" x2="30" y2="21" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="22" y1="33" x2="30" y2="39" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="16" y1="50" x2="22" y2="50" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="22" y1="44" x2="22" y2="56" stroke="#ff8a65" stroke-width="2"/>
      <line x1="22" y1="47" x2="30" y2="41" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="22" y1="53" x2="30" y2="59" stroke="#ff8a65" stroke-width="1.5"/>
      <path d="M42 60 h5 v-8 h5 v8 h5" fill="none" stroke="#ff8a65" stroke-width="1.5"/>`},
  ignAmp4:{name:'Power Stage (4-ch)',prefix:'V',w:100,h:120,
    pins:[{id:'in1',label:'IN1',x:0,y:20},{id:'in2',label:'IN2',x:0,y:40},
          {id:'in3',label:'IN3',x:0,y:60},{id:'in4',label:'IN4',x:0,y:80},
          {id:'15',label:'15',x:50,y:0},{id:'31',label:'31',x:50,y:120},
          {id:'1',label:'1',x:100,y:20},{id:'2',label:'2',x:100,y:40},
          {id:'3',label:'3',x:100,y:60},{id:'4',label:'4',x:100,y:80}],
    getPins:(variant='generic')=>{
      if(variant==='bosch-0227100211')
        /* Bosch 0 227 100 211: trigger pins labelled per module connector */
        return clonePins([{id:'in1',label:'3',x:0,y:20},{id:'in2',label:'4',x:0,y:40},
                          {id:'in3',label:'5',x:0,y:60},{id:'in4',label:'6',x:0,y:80},
                          {id:'15',label:'15',x:50,y:0},{id:'31',label:'31',x:50,y:120},
                          {id:'1',label:'7',x:100,y:20},{id:'2',label:'8',x:100,y:40},
                          {id:'3',label:'9',x:100,y:60},{id:'4',label:'10',x:100,y:80}]);
      return clonePins([{id:'in1',label:'IN1',x:0,y:20},{id:'in2',label:'IN2',x:0,y:40},
                        {id:'in3',label:'IN3',x:0,y:60},{id:'in4',label:'IN4',x:0,y:80},
                        {id:'15',label:'15',x:50,y:0},{id:'31',label:'31',x:50,y:120},
                        {id:'1',label:'1',x:100,y:20},{id:'2',label:'2',x:100,y:40},
                        {id:'3',label:'3',x:100,y:60},{id:'4',label:'4',x:100,y:80}]);
    },
    variants:[
      {id:'generic',name:'Generic 4-channel'},
      {id:'bosch-0227100211',name:'Bosch 0 227 100 211'},
      {id:'custom',name:'Custom…'}],
    valBase:{x:108,y:64}, valColor:'#ff8a65', valSize:8, valAlign:'start',
    value:'Generic 4-channel',
    draw:()=>`
      <line x1="0" y1="20" x2="10" y2="20" stroke="#d7dde3" stroke-width="2"/>
      <line x1="0" y1="40" x2="10" y2="40" stroke="#d7dde3" stroke-width="2"/>
      <line x1="0" y1="60" x2="10" y2="60" stroke="#d7dde3" stroke-width="2"/>
      <line x1="0" y1="80" x2="10" y2="80" stroke="#d7dde3" stroke-width="2"/>
      <line x1="50" y1="0" x2="50" y2="10" stroke="#f9a825" stroke-width="2"/>
      <line x1="50" y1="110" x2="50" y2="120" stroke="#9e9e9e" stroke-width="2"/>
      <line x1="90" y1="20" x2="100" y2="20" stroke="#d7dde3" stroke-width="2"/>
      <line x1="90" y1="40" x2="100" y2="40" stroke="#d7dde3" stroke-width="2"/>
      <line x1="90" y1="60" x2="100" y2="60" stroke="#d7dde3" stroke-width="2"/>
      <line x1="90" y1="80" x2="100" y2="80" stroke="#d7dde3" stroke-width="2"/>
      <rect x="10" y="10" width="80" height="100" rx="4" fill="#2e2018" stroke="#ff8a65" stroke-width="2"/>
      <line x1="16" y1="20" x2="22" y2="20" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="22" y1="14" x2="22" y2="26" stroke="#ff8a65" stroke-width="2"/>
      <line x1="22" y1="17" x2="30" y2="11" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="22" y1="23" x2="30" y2="29" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="16" y1="40" x2="22" y2="40" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="22" y1="34" x2="22" y2="46" stroke="#ff8a65" stroke-width="2"/>
      <line x1="22" y1="37" x2="30" y2="31" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="22" y1="43" x2="30" y2="49" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="16" y1="60" x2="22" y2="60" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="22" y1="54" x2="22" y2="66" stroke="#ff8a65" stroke-width="2"/>
      <line x1="22" y1="57" x2="30" y2="51" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="22" y1="63" x2="30" y2="69" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="16" y1="80" x2="22" y2="80" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="22" y1="74" x2="22" y2="86" stroke="#ff8a65" stroke-width="2"/>
      <line x1="22" y1="77" x2="30" y2="71" stroke="#ff8a65" stroke-width="1.5"/>
      <line x1="22" y1="83" x2="30" y2="89" stroke="#ff8a65" stroke-width="1.5"/>
      <path d="M54 80 h5 v-8 h5 v8 h5" fill="none" stroke="#ff8a65" stroke-width="1.5"/>`},
  coil:{name:'Ignition Coil',prefix:'T',w:40,h:60,
    pins:[{id:'15',label:'15',x:10,y:0},{id:'1',label:'1',x:30,y:0},{id:'4',label:'4',x:20,y:60}],
    getPins:(variant='generic')=>clonePins(
      [{id:'15',label:'15',x:10,y:0},{id:'1',label:'1',x:30,y:0},{id:'4',label:'4',x:20,y:60}]
    ),
    variants:[
      {id:'generic',name:'Generic 12V canister'},
      {id:'bosch-0221119027',name:'Bosch 0 221 119 027'},
      {id:'bosch-0221122406',name:'Bosch 0 221 122 406'},
      {id:'beru-zs109',name:'BERU ZS109'},
      {id:'custom',name:'Custom…'}],
    valBase:{x:38,y:30}, valColor:'#ff8a65', valSize:8, valAlign:'start',
    value:'Generic 12V canister',
    draw:()=>`
      <line x1="10" y1="0" x2="10" y2="10" stroke="#f9a825" stroke-width="2"/>
      <line x1="30" y1="0" x2="30" y2="10" stroke="#d7dde3" stroke-width="2"/>
      <line x1="20" y1="50" x2="20" y2="60" stroke="#e0e0e0" stroke-width="2.6"/>
      <rect x="6" y="10" width="28" height="34" rx="6" fill="#2e2018" stroke="#ff8a65" stroke-width="2"/>
      <path d="M13 16 a3 3 0 0 1 0 6 a3 3 0 0 1 0 6 a3 3 0 0 1 0 6" fill="none" stroke="#ff8a65" stroke-width="1.4"/>
      <path d="M27 16 a3 3 0 0 0 0 6 a3 3 0 0 0 0 6 a3 3 0 0 0 0 6" fill="none" stroke="#ff8a65" stroke-width="1.4"/>
      <line x1="20" y1="15" x2="20" y2="39" stroke="#ff8a65" stroke-width="1.2"/>
      <path d="M15 44 h10 l-2 6 h-6 z" fill="#2e2018" stroke="#ff8a65" stroke-width="1.4"/>`},
  coil2x2:{name:'Coil Pack 2×2',prefix:'T',w:80,h:60,
    pins:[{id:'1a',label:'1a',x:10,y:0},{id:'15',label:'15',x:40,y:0},{id:'1b',label:'1b',x:70,y:0},
          {id:'ht1',label:'1',x:10,y:60},{id:'ht2',label:'2',x:30,y:60},
          {id:'ht3',label:'3',x:50,y:60},{id:'ht4',label:'4',x:70,y:60}],
    getPins:(variant='generic')=>clonePins(
      variant==='bosch-0221503407'
        ? [{id:'1a',label:'1',x:10,y:0},{id:'15',label:'15',x:40,y:0},{id:'1b',label:'2',x:70,y:0},
           {id:'ht1',label:'4',x:10,y:60},{id:'ht2',label:'1',x:30,y:60},
           {id:'ht3',label:'2',x:50,y:60},{id:'ht4',label:'3',x:70,y:60}]
        : [{id:'1a',label:'1a',x:10,y:0},{id:'15',label:'15',x:40,y:0},{id:'1b',label:'1b',x:70,y:0},
           {id:'ht1',label:'1',x:10,y:60},{id:'ht2',label:'2',x:30,y:60},
           {id:'ht3',label:'3',x:50,y:60},{id:'ht4',label:'4',x:70,y:60}]
    ),
    variants:[
      {id:'generic',name:'Generic 2×2 wasted-spark'},
      {id:'bosch-0221503407',name:'Bosch 0 221 503 407'},
      {id:'custom',name:'Custom…'}],
    valBase:{x:82,y:34}, valColor:'#ff8a65', valSize:8, valAlign:'start',
    value:'Generic 2×2 wasted-spark',
    draw:()=>`
      <line x1="10" y1="0" x2="10" y2="10" stroke="#d7dde3" stroke-width="2"/>
      <line x1="40" y1="0" x2="40" y2="10" stroke="#f9a825" stroke-width="2"/>
      <line x1="70" y1="0" x2="70" y2="10" stroke="#d7dde3" stroke-width="2"/>
      <line x1="10" y1="50" x2="10" y2="60" stroke="#e0e0e0" stroke-width="2.6"/>
      <line x1="30" y1="50" x2="30" y2="60" stroke="#e0e0e0" stroke-width="2.6"/>
      <line x1="50" y1="50" x2="50" y2="60" stroke="#e0e0e0" stroke-width="2.6"/>
      <line x1="70" y1="50" x2="70" y2="60" stroke="#e0e0e0" stroke-width="2.6"/>
      <rect x="4" y="10" width="72" height="40" rx="5" fill="#2e2018" stroke="#ff8a65" stroke-width="2"/>
      <path d="M17 20 a3 3 0 0 1 0 6 a3 3 0 0 1 0 6" fill="none" stroke="#ff8a65" stroke-width="1.4"/>
      <path d="M25 20 a3 3 0 0 0 0 6 a3 3 0 0 0 0 6" fill="none" stroke="#ff8a65" stroke-width="1.4"/>
      <line x1="21" y1="19" x2="21" y2="33" stroke="#ff8a65" stroke-width="1.2"/>
      <path d="M55 20 a3 3 0 0 1 0 6 a3 3 0 0 1 0 6" fill="none" stroke="#ff8a65" stroke-width="1.4"/>
      <path d="M63 20 a3 3 0 0 0 0 6 a3 3 0 0 0 0 6" fill="none" stroke="#ff8a65" stroke-width="1.4"/>
      <line x1="59" y1="19" x2="59" y2="33" stroke="#ff8a65" stroke-width="1.2"/>
      <line x1="40" y1="14" x2="40" y2="46" stroke="#ff8a65" stroke-width="1" stroke-dasharray="3 3"/>`},
  cop:{name:'COP Coil',prefix:'T',w:40,h:60,
    pins:[{id:'15',label:'15',x:10,y:0},{id:'1',label:'1',x:30,y:0},{id:'4',label:'4',x:20,y:60}],
    getPins:(variant='generic')=>clonePins(
      [{id:'15',label:'15',x:10,y:0},{id:'1',label:'1',x:30,y:0},{id:'4',label:'4',x:20,y:60}]
    ),
    variants:[
      {id:'generic',name:'Generic 2-pin pencil coil'},
      {id:'beru-zs052',name:'BERU ZS052'},
      {id:'custom',name:'Custom…'}],
    valBase:{x:38,y:30}, valColor:'#ff8a65', valSize:8, valAlign:'start',
    value:'Generic 2-pin pencil coil',
    draw:()=>`
      <line x1="10" y1="0" x2="10" y2="10" stroke="#f9a825" stroke-width="2"/>
      <line x1="30" y1="0" x2="30" y2="10" stroke="#d7dde3" stroke-width="2"/>
      <line x1="20" y1="52" x2="20" y2="60" stroke="#e0e0e0" stroke-width="2.6"/>
      <rect x="8" y="10" width="24" height="14" rx="4" fill="#2e2018" stroke="#ff8a65" stroke-width="2"/>
      <rect x="16" y="24" width="8" height="20" fill="#2e2018" stroke="#ff8a65" stroke-width="1.6"/>
      <path d="M14 44 h12 v5 a4 4 0 0 1 -4 3 h-4 a4 4 0 0 1 -4 -3 z" fill="#2e2018" stroke="#ff8a65" stroke-width="1.6"/>
      <line x1="18" y1="28" x2="18" y2="40" stroke="#ff8a65" stroke-width="1"/>
      <line x1="22" y1="28" x2="22" y2="40" stroke="#ff8a65" stroke-width="1"/>`},
  copSmart:{name:'Smart COP',prefix:'T',w:40,h:60,
    /* 3-pin connector (supply + signal + GND) + HV output — integrated IGBT driver */
    pins:[{id:'15',label:'15',x:5,y:0},{id:'in',label:'IN',x:20,y:0},
          {id:'31',label:'31',x:35,y:0},{id:'4',label:'4',x:20,y:60}],
    getPins:(variant='generic')=>{
      if(variant==='gm-ls-d585')
        /* GM LS D585 / Delphi 12570616: Metripack A=GND, B=+12V, C=Signal */
        return clonePins([{id:'15',label:'B',x:5,y:0},{id:'in',label:'C',x:20,y:0},
                          {id:'31',label:'A',x:35,y:0},{id:'4',label:'4',x:20,y:60}]);
      if(variant==='ford-dg508')
        /* Ford DG508 / DG512: 1=+12V, 2=Signal, 3=GND */
        return clonePins([{id:'15',label:'1',x:5,y:0},{id:'in',label:'2',x:20,y:0},
                          {id:'31',label:'3',x:35,y:0},{id:'4',label:'4',x:20,y:60}]);
      if(variant==='bosch-0221504100')
        /* Bosch 0 221 504 100: DIN 15=supply, 1=signal, 31=GND */
        return clonePins([{id:'15',label:'15',x:5,y:0},{id:'in',label:'1',x:20,y:0},
                          {id:'31',label:'31',x:35,y:0},{id:'4',label:'4',x:20,y:60}]);
      return clonePins([{id:'15',label:'15',x:5,y:0},{id:'in',label:'IN',x:20,y:0},
                        {id:'31',label:'31',x:35,y:0},{id:'4',label:'4',x:20,y:60}]);
    },
    variants:[
      {id:'generic',name:'Generic smart COP'},
      {id:'gm-ls-d585',name:'GM LS D585 / Delphi 12570616'},
      {id:'ford-dg508',name:'Ford DG508 / DG512'},
      {id:'bosch-0221504100',name:'Bosch 0 221 504 100'},
      {id:'ngk-u5055',name:'NGK U5055'},
      {id:'custom',name:'Custom…'}],
    valBase:{x:38,y:30}, valColor:'#ff8a65', valSize:8, valAlign:'start',
    value:'Generic smart COP',
    draw:()=>`
      <line x1="5" y1="0" x2="5" y2="10" stroke="#f9a825" stroke-width="2"/>
      <line x1="20" y1="0" x2="20" y2="10" stroke="#d7dde3" stroke-width="2"/>
      <line x1="35" y1="0" x2="35" y2="10" stroke="#9e9e9e" stroke-width="2"/>
      <line x1="20" y1="52" x2="20" y2="60" stroke="#e0e0e0" stroke-width="2.6"/>
      <rect x="2" y="10" width="36" height="14" rx="4" fill="#2e2018" stroke="#ff8a65" stroke-width="2"/>
      <line x1="6" y1="17" x2="12" y2="17" stroke="#ff8a65" stroke-width="1.4"/>
      <line x1="12" y1="13" x2="12" y2="21" stroke="#ff8a65" stroke-width="1.4"/>
      <line x1="12" y1="14" x2="17" y2="12" stroke="#ff8a65" stroke-width="1.2"/>
      <line x1="12" y1="20" x2="17" y2="22" stroke="#ff8a65" stroke-width="1.2"/>
      <text x="21" y="20" fill="#ff8a65" font-size="5" font-family="inherit" pointer-events="none">IGN</text>
      <rect x="16" y="24" width="8" height="20" fill="#2e2018" stroke="#ff8a65" stroke-width="1.6"/>
      <path d="M14 44 h12 v5 a4 4 0 0 1 -4 3 h-4 a4 4 0 0 1 -4 -3 z" fill="#2e2018" stroke="#ff8a65" stroke-width="1.6"/>
      <line x1="18" y1="28" x2="18" y2="40" stroke="#ff8a65" stroke-width="1"/>
      <line x1="22" y1="28" x2="22" y2="40" stroke="#ff8a65" stroke-width="1"/>`},
  distributor:{name:'HT Distributor',prefix:'O',w:80,h:60,
    pins:[{id:'in',label:'4',x:40,y:0},
          {id:'ht1',label:'1',x:10,y:60},{id:'ht2',label:'2',x:30,y:60},
          {id:'ht3',label:'3',x:50,y:60},{id:'ht4',label:'4',x:70,y:60}],
    draw:()=>`
      <line x1="40" y1="0" x2="40" y2="10" stroke="#e0e0e0" stroke-width="2.6"/>
      <line x1="10" y1="50" x2="10" y2="60" stroke="#e0e0e0" stroke-width="2.6"/>
      <line x1="30" y1="50" x2="30" y2="60" stroke="#e0e0e0" stroke-width="2.6"/>
      <line x1="50" y1="50" x2="50" y2="60" stroke="#e0e0e0" stroke-width="2.6"/>
      <line x1="70" y1="50" x2="70" y2="60" stroke="#e0e0e0" stroke-width="2.6"/>
      <path d="M4 50 v-24 a36 18 0 0 1 72 0 v24 z" fill="#2e2018" stroke="#ff8a65" stroke-width="2"/>
      <circle cx="40" cy="22" r="3" fill="none" stroke="#ff8a65" stroke-width="1.4"/>
      <line x1="40" y1="25" x2="40" y2="34" stroke="#ff8a65" stroke-width="1.4"/>
      <circle cx="40" cy="36" r="2.4" fill="#ff8a65"/>
      <line x1="40" y1="36" x2="14" y2="44" stroke="#ff8a65" stroke-width="2"/>
      <circle cx="10" cy="46" r="2" fill="none" stroke="#ff8a65" stroke-width="1.2"/>
      <circle cx="30" cy="46" r="2" fill="none" stroke="#ff8a65" stroke-width="1.2"/>
      <circle cx="50" cy="46" r="2" fill="none" stroke="#ff8a65" stroke-width="1.2"/>
      <circle cx="70" cy="46" r="2" fill="none" stroke="#ff8a65" stroke-width="1.2"/>`},
  sparkplug:{name:'Spark Plug',prefix:'Q',w:40,h:50,
    pins:[{id:'ht',label:'',x:20,y:0}],
    draw:()=>`
      <line x1="20" y1="0" x2="20" y2="8" stroke="#e0e0e0" stroke-width="2.6"/>
      <rect x="14" y="8" width="12" height="12" rx="2" fill="#2e2624" stroke="#eceff1" stroke-width="1.6"/>
      <line x1="14" y1="12" x2="26" y2="12" stroke="#eceff1" stroke-width="1"/>
      <line x1="14" y1="16" x2="26" y2="16" stroke="#eceff1" stroke-width="1"/>
      <rect x="10" y="20" width="20" height="8" fill="#23282e" stroke="#eceff1" stroke-width="1.6"/>
      <line x1="20" y1="28" x2="20" y2="38" stroke="#eceff1" stroke-width="2"/>
      <line x1="28" y1="28" x2="28" y2="42" stroke="#eceff1" stroke-width="1.6"/>
      <line x1="28" y1="42" x2="21" y2="42" stroke="#eceff1" stroke-width="1.6"/>
      <line x1="12" y1="47" x2="28" y2="47" stroke="#8a939c" stroke-width="1.6"/>
      <line x1="16" y1="50" x2="24" y2="50" stroke="#8a939c" stroke-width="1.6"/>`},
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
    getHeight:ecuHeight,
    getPins:ecuPins,
    draw:c=>{
      const pinCount=c.pinCount||4;
      const h=ecuHeight(pinCount);
      const pins=(c.pins&&c.pins.length)?c.pins:ecuPins(pinCount);
      const stubs=pins.map(p=>
        `<line x1="0" y1="${p.y}" x2="10" y2="${p.y}" stroke="#d7dde3" stroke-width="2"/>`).join('');
      return `
        ${stubs}
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
  o2sensor3:{name:'Oxygen Sensor (3-pin)',prefix:'B',w:60,h:52,
    pins:[{id:'ht+',label:'HT+',x:12,y:0},{id:'sig',label:'S',x:30,y:0},{id:'gnd',label:'G',x:48,y:0}],
    draw:()=>`
      <line x1="12" y1="0" x2="12" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="30" y1="0" x2="30" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="48" y1="0" x2="48" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <rect x="8" y="14" width="44" height="28" rx="8" fill="#202620" stroke="#a5d6a7" stroke-width="2"/>
      <path d="M18 30 h24" stroke="#a5d6a7" stroke-width="1.4"/>
      <circle cx="30" cy="48" r="3.5" fill="#202620" stroke="#a5d6a7" stroke-width="1.4"/>`},
  o2sensor4:{name:'Oxygen Sensor (4-pin)',prefix:'B',w:74,h:52,
    pins:[{id:'ht1',label:'H1',x:10,y:0},{id:'ht2',label:'H2',x:28,y:0},{id:'sig',label:'S',x:46,y:0},{id:'gnd',label:'G',x:64,y:0}],
    draw:()=>`
      <line x1="10" y1="0" x2="10" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="28" y1="0" x2="28" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="46" y1="0" x2="46" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="64" y1="0" x2="64" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <rect x="6" y="14" width="62" height="28" rx="8" fill="#202620" stroke="#a5d6a7" stroke-width="2"/>
      <path d="M18 30 h38" stroke="#a5d6a7" stroke-width="1.4"/>
      <circle cx="37" cy="48" r="3.5" fill="#202620" stroke="#a5d6a7" stroke-width="1.4"/>`},
  o2sensor5:{name:'Oxygen Sensor (5-pin)',prefix:'B',w:90,h:52,
    pins:[{id:'ip+',label:'IP+',x:9,y:0},{id:'ip-',label:'IP-',x:27,y:0},{id:'vm',label:'VM',x:45,y:0},{id:'rc',label:'RC',x:63,y:0},{id:'ht',label:'HT',x:81,y:0}],
    draw:()=>`
      <line x1="9" y1="0" x2="9" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="27" y1="0" x2="27" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="45" y1="0" x2="45" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="63" y1="0" x2="63" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="81" y1="0" x2="81" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <rect x="5" y="14" width="80" height="28" rx="8" fill="#202620" stroke="#a5d6a7" stroke-width="2"/>
      <path d="M18 30 h54" stroke="#a5d6a7" stroke-width="1.4"/>
      <circle cx="45" cy="48" r="3.5" fill="#202620" stroke="#a5d6a7" stroke-width="1.4"/>`},
  valve:{name:'Solenoid Valve',prefix:'Y',w:60,h:40,
    pins:[{id:'1',label:'1',x:0,y:20},{id:'2',label:'2',x:60,y:20}],
    draw:()=>`
      <line x1="0" y1="20" x2="12" y2="20" stroke="#d7dde3" stroke-width="2"/>
      <line x1="48" y1="20" x2="60" y2="20" stroke="#d7dde3" stroke-width="2"/>
      <path d="M12 10 L26 30 L26 10 L12 30 Z" fill="#2b2620" stroke="#fdd835" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M48 10 L34 30 L34 10 L48 30 Z" fill="#2b2620" stroke="#fdd835" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="22" y="2" width="16" height="16" fill="#1c2024" stroke="#fdd835" stroke-width="1.5"/>
      <line x1="22" y1="18" x2="38" y2="2" stroke="#fdd835" stroke-width="1.5"/>`},
  idleValve2:{name:'Idle Valve Bosch (2-pin)',prefix:'Y',w:70,h:44,
    pins:[{id:'1',label:'1',x:0,y:22},{id:'2',label:'2',x:70,y:22}],
    draw:()=>`
      <line x1="0" y1="22" x2="14" y2="22" stroke="#d7dde3" stroke-width="2"/>
      <line x1="56" y1="22" x2="70" y2="22" stroke="#d7dde3" stroke-width="2"/>
      <rect x="14" y="8" width="42" height="28" rx="7" fill="#2a2220" stroke="#ffb74d" stroke-width="2"/>
      <line x1="22" y1="22" x2="48" y2="22" stroke="#ffb74d" stroke-width="1.6"/>
      <rect x="28" y="12" width="14" height="20" fill="#1c2024" stroke="#ffb74d" stroke-width="1.2"/>`},
  idleValve3:{name:'Idle Valve Bosch (3-pin)',prefix:'Y',w:74,h:52,
    pins:[{id:'1',label:'1',x:12,y:0},{id:'2',label:'2',x:37,y:0},{id:'3',label:'3',x:62,y:0}],
    draw:()=>`
      <line x1="12" y1="0" x2="12" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="37" y1="0" x2="37" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="62" y1="0" x2="62" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <rect x="12" y="14" width="50" height="28" rx="7" fill="#2a2220" stroke="#ffb74d" stroke-width="2"/>
      <line x1="22" y1="22" x2="52" y2="22" stroke="#ffb74d" stroke-width="1.6"/>
      <line x1="22" y1="30" x2="52" y2="30" stroke="#ffb74d" stroke-width="1.6"/>`},
  idleStepper:{name:'Idle Valve Stepper',prefix:'Y',w:84,h:54,
    pins:[{id:'a+',label:'A+',x:8,y:0},{id:'a-',label:'A-',x:28,y:0},{id:'b+',label:'B+',x:56,y:0},{id:'b-',label:'B-',x:76,y:0}],
    draw:()=>`
      <line x1="8" y1="0" x2="8" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="28" y1="0" x2="28" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="56" y1="0" x2="56" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <line x1="76" y1="0" x2="76" y2="14" stroke="#d7dde3" stroke-width="2"/>
      <rect x="8" y="14" width="68" height="32" rx="8" fill="#2a2220" stroke="#ffb74d" stroke-width="2"/>
      <circle cx="42" cy="30" r="10" fill="none" stroke="#ffb74d" stroke-width="1.6"/>
      <path d="M36 30 L42 24 L48 30 L42 36 Z" fill="none" stroke="#ffb74d" stroke-width="1.4"/>`},
  idleWax:{name:'Idle Warm-Up Valve (Wax)',prefix:'Y',w:84,h:46,
    pins:[{id:'1',label:'IN',x:0,y:23},{id:'2',label:'OUT',x:84,y:23}],
    draw:()=>`
      <line x1="0" y1="23" x2="18" y2="23" stroke="#d7dde3" stroke-width="2"/>
      <line x1="66" y1="23" x2="84" y2="23" stroke="#d7dde3" stroke-width="2"/>
      <rect x="18" y="9" width="48" height="28" rx="8" fill="#2a2220" stroke="#ffb74d" stroke-width="2"/>
      <circle cx="34" cy="23" r="6" fill="none" stroke="#ffb74d" stroke-width="1.4"/>
      <path d="M44 16 Q52 23 44 30" fill="none" stroke="#ffb74d" stroke-width="1.4"/>
      <path d="M52 16 Q60 23 52 30" fill="none" stroke="#ffb74d" stroke-width="1.4"/>`},
  ublock:{name:'Universal Block',prefix:'U',w:80,h:80,
    pins:[{id:'1',label:'1',x:0,y:20},{id:'2',label:'2',x:0,y:60},
          {id:'3',label:'3',x:80,y:20},{id:'4',label:'4',x:80,y:60}],
    draw:()=>`
      <line x1="0" y1="20" x2="10" y2="20" stroke="#d7dde3" stroke-width="2"/>
      <line x1="0" y1="60" x2="10" y2="60" stroke="#d7dde3" stroke-width="2"/>
      <line x1="70" y1="20" x2="80" y2="20" stroke="#d7dde3" stroke-width="2"/>
      <line x1="70" y1="60" x2="80" y2="60" stroke="#d7dde3" stroke-width="2"/>
      <rect x="10" y="0" width="60" height="80" rx="4" fill="#24282e" stroke="#8a939c" stroke-width="2" stroke-dasharray="6 3"/>`},
  resistor:{name:'Resistor',prefix:'R',w:60,h:24,
    pins:[{id:'1',label:'1',x:0,y:12},{id:'2',label:'2',x:60,y:12}],
    valBase:{x:30,y:38}, valColor:'#4fc3f7', valSize:9,
    draw:()=>`
      <line x1="0" y1="12" x2="14" y2="12" stroke="#d7dde3" stroke-width="2"/>
      <line x1="46" y1="12" x2="60" y2="12" stroke="#d7dde3" stroke-width="2"/>
      <rect x="14" y="4" width="32" height="16" rx="2" fill="#132029" stroke="#4fc3f7" stroke-width="2"/>`,
    value:'220Ω'},
  diode:{name:'Diode',prefix:'D',w:50,h:24,
    pins:[{id:'a',label:'A',x:0,y:12},{id:'k',label:'K',x:50,y:12}],
    draw:()=>`
      <line x1="0" y1="12" x2="15" y2="12" stroke="#d7dde3" stroke-width="2"/>
      <line x1="35" y1="12" x2="50" y2="12" stroke="#d7dde3" stroke-width="2"/>
      <path d="M15 4 L15 20 L33 12 Z" fill="none" stroke="#4fc3f7" stroke-width="2" stroke-linejoin="round"/>
      <line x1="33" y1="4" x2="33" y2="20" stroke="#4fc3f7" stroke-width="2.4"/>`},
  capacitor:{name:'Capacitor',prefix:'CAP',w:40,h:30,
    pins:[{id:'1',label:'1',x:0,y:15},{id:'2',label:'2',x:40,y:15}],
    valBase:{x:20,y:38}, valColor:'#4fc3f7', valSize:9,
    draw:()=>`
      <line x1="0" y1="15" x2="17" y2="15" stroke="#d7dde3" stroke-width="2"/>
      <line x1="23" y1="15" x2="40" y2="15" stroke="#d7dde3" stroke-width="2"/>
      <line x1="17" y1="5" x2="17" y2="25" stroke="#4fc3f7" stroke-width="2.6"/>
      <line x1="23" y1="5" x2="23" y2="25" stroke="#4fc3f7" stroke-width="2.6"/>`,
    value:'100nF'},
  npn:{name:'Transistor NPN',prefix:'V',w:60,h:60,
    pins:[{id:'b',label:'B',x:0,y:30},{id:'c',label:'C',x:60,y:0},{id:'e',label:'E',x:60,y:60}],
    draw:()=>`
      <circle cx="30" cy="30" r="27" fill="none" stroke="#f06292" stroke-width="1" stroke-dasharray="4 3"/>
      <line x1="0" y1="30" x2="20" y2="30" stroke="#f06292" stroke-width="2"/>
      <line x1="20" y1="12" x2="20" y2="48" stroke="#f06292" stroke-width="2.6"/>
      <line x1="20" y1="18" x2="60" y2="0" stroke="#f06292" stroke-width="2"/>
      <line x1="20" y1="42" x2="60" y2="60" stroke="#f06292" stroke-width="2"/>
      <path d="M50 56 L42 57.5 L46 48.5 Z" fill="#f06292"/>`},
  pnp:{name:'Transistor PNP',prefix:'V',w:60,h:60,
    pins:[{id:'b',label:'B',x:0,y:30},{id:'c',label:'C',x:60,y:0},{id:'e',label:'E',x:60,y:60}],
    draw:()=>`
      <circle cx="30" cy="30" r="27" fill="none" stroke="#f06292" stroke-width="1" stroke-dasharray="4 3"/>
      <line x1="0" y1="30" x2="20" y2="30" stroke="#f06292" stroke-width="2"/>
      <line x1="20" y1="12" x2="20" y2="48" stroke="#f06292" stroke-width="2.6"/>
      <line x1="20" y1="18" x2="60" y2="0" stroke="#f06292" stroke-width="2"/>
      <line x1="20" y1="42" x2="60" y2="60" stroke="#f06292" stroke-width="2"/>
      <path d="M38 50 L42 57.5 L46 48.5 Z" fill="#f06292"/>`},
  nchannel:{name:'MOSFET N-Channel',prefix:'V',w:60,h:70,
    pins:[{id:'g',label:'G',x:0,y:35},{id:'d',label:'D',x:40,y:0},{id:'s',label:'S',x:40,y:70}],
    draw:()=>`
      <circle cx="28" cy="35" r="30" fill="none" stroke="#ba68c8" stroke-width="1" stroke-dasharray="4 3"/>
      <line x1="0" y1="35" x2="16" y2="35" stroke="#ba68c8" stroke-width="2"/>
      <line x1="16" y1="20" x2="16" y2="50" stroke="#ba68c8" stroke-width="2.6"/>
      <line x1="24" y1="14" x2="24" y2="56" stroke="#ba68c8" stroke-width="2"/>
      <line x1="24" y1="14" x2="40" y2="14" stroke="#ba68c8" stroke-width="2"/>
      <line x1="40" y1="14" x2="40" y2="0" stroke="#ba68c8" stroke-width="2"/>
      <line x1="24" y1="56" x2="40" y2="56" stroke="#ba68c8" stroke-width="2"/>
      <line x1="40" y1="56" x2="40" y2="70" stroke="#ba68c8" stroke-width="2"/>
      <path d="M20 31 L20 39 L28 35 Z" fill="#ba68c8"/>`},
  pchannel:{name:'MOSFET P-Channel',prefix:'V',w:60,h:70,
    pins:[{id:'g',label:'G',x:0,y:35},{id:'d',label:'D',x:40,y:0},{id:'s',label:'S',x:40,y:70}],
    draw:()=>`
      <circle cx="28" cy="35" r="30" fill="none" stroke="#ba68c8" stroke-width="1" stroke-dasharray="4 3"/>
      <line x1="0" y1="35" x2="16" y2="35" stroke="#ba68c8" stroke-width="2"/>
      <line x1="16" y1="20" x2="16" y2="50" stroke="#ba68c8" stroke-width="2.6"/>
      <line x1="24" y1="14" x2="24" y2="56" stroke="#ba68c8" stroke-width="2"/>
      <line x1="24" y1="14" x2="40" y2="14" stroke="#ba68c8" stroke-width="2"/>
      <line x1="40" y1="14" x2="40" y2="0" stroke="#ba68c8" stroke-width="2"/>
      <line x1="24" y1="56" x2="40" y2="56" stroke="#ba68c8" stroke-width="2"/>
      <line x1="40" y1="56" x2="40" y2="70" stroke="#ba68c8" stroke-width="2"/>
      <path d="M28 31 L28 39 L20 35 Z" fill="#ba68c8"/>`},
  note:{name:'Text Note',prefix:'N',w:200,h:60,
    pins:[],
    draw:c=>{
      const escXml = s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
      const noteW = Math.max(80, +c.noteW || 200);
      const noteH = Math.max(40, +c.noteH || 60);
      const fontFamily = c.noteFont || 'inherit';
      const fontSize = Math.max(8, +c.noteFontSize || 11);
      const text = String(c.noteText||'Note');
      const bgColor = c.bgColor||'#1e1a2e';
      const textColor = c.textColor||'#b39ddb';
      const hAlign = c.hAlign||'center';
      const vAlign = c.vAlign||'middle';
      const pad = 10;
      const textX = hAlign==='left'?pad:(hAlign==='right'?(noteW-pad):(noteW/2));
      const textAnchor = hAlign==='left'?'start':(hAlign==='right'?'end':'middle');
      const lines = text.split(/\r?\n/);
      const lineHeight = Math.max(10, Math.round(fontSize * 1.25 * 10) / 10);
      const blockHeight = (lines.length - 1) * lineHeight;
      const textY = vAlign==='top'
        ? (pad + fontSize)
        : (vAlign==='bottom' ? (noteH - pad - blockHeight) : ((noteH - blockHeight) / 2));
      const spans = lines.map((line, i)=>`<tspan x="${textX}" y="${textY + i * lineHeight}">${escXml(line)}</tspan>`).join('');
      return `
      <rect x="0" y="0" width="${noteW}" height="${noteH}" rx="3" fill="${bgColor}" stroke="#9575cd" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="${textX}" y="${textY}" fill="${textColor}" font-size="${fontSize}" text-anchor="${textAnchor}" font-family="${escXml(fontFamily)}" pointer-events="none">${spans}</text>`;
    }}
};
