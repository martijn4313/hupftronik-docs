/* ============ demo seed: the fan circuit from the library ============ */

import { state, uid, comp } from './state.js';
import { addComp } from './interactions.js';

export function seed(){
  addComp('battery');addComp('fuse');addComp('relay');addComp('switch');addComp('motor');addComp('ground');addComp('ground');addComp('fuse');
  const [bat,f1,k1,s1,m1,g1,g2,f3]=state.comps;
  Object.assign(bat,{x:60,y:300,label:'main battery'});
  Object.assign(f1,{x:240,y:120,value:'30A',label:'fan'});
  Object.assign(f3,{x:240,y:320,value:'7.5A',label:'coil'});
  Object.assign(k1,{x:420,y:100,label:'cooling fan'});
  Object.assign(s1,{x:420,y:330,label:'temp switch 92°C'});
  Object.assign(m1,{x:640,y:100,label:'cooling fan'});
  Object.assign(g1,{x:646,y:230,label:'body'});
  Object.assign(g2,{x:560,y:400,label:'engine'});
  const W=(a,ap,b,bp,color,tracer,gauge)=>state.wires.push(
    {id:uid(),a:{comp:a.id,pin:ap},b:{comp:b.id,pin:bp},color,tracer,gauge,wp:[]});
  W(bat,'plus',f1,'1','RD','','4.0');
  W(f1,'2',k1,'30','RD','BU','4.0');
  W(k1,'87',m1,'1','BU','','4.0');
  W(m1,'2',g1,'g','BN','','4.0');
  W(bat,'plus',f3,'1','GN','','0.75');
  W(f3,'2',k1,'86','GN','RD','0.75');
  W(k1,'85',s1,'1','BN','','0.75');
  W(s1,'2',g2,'g','BN','','0.75');
  state.sel=null;
}
