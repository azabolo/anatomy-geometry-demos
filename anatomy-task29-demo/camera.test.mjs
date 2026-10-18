import test from 'node:test';
import assert from 'node:assert/strict';
import * as k from './kit/iso-kit.mjs';
import {HOME,LIMITS,projectionFor,cameraTarget,nearestAzimuth,triangleCamera} from './camera.mjs';
import {makeModel} from './model.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const world=p=>p;
test('Орбита держит одну точку в центре и не меняет масштаб при вращении',()=>{
 for(let a=-360;a<=720;a+=15)for(const e of [8,24,50,82]){
  const P=projectionFor({...HOME,azimuth:a,elevation:e});
  const q=k.iso([0,0,6],P);close(q[0],400);close(q[1],280);close(P.scale,21);
 }
});
test('Ракурс MBC сохраняет длины и располагает BC горизонтально',()=>{
 for(const z of [4,7,11,14])for(const x of [-4,1,4]){
  const m=makeModel({x,y:-1,z}),P=projectionFor(triangleCamera({x,y:-1,z}));
  const screen=name=>k.iso(world(m[name]),P),scale=k.cameraOf(P).k;
  close(screen('B')[1],screen('C')[1]);
  for(const [a,b]of [['B','M'],['M','C'],['K','H']])close(Math.hypot(...screen(a).map((v,i)=>v-screen(b)[i]))/scale,Math.hypot(...m[a].map((v,i)=>v-m[b][i])));
 }
});
test('Камера ограничивает наклон и приближение; выбирает короткий путь через 360°',()=>{
 assert.deepEqual(cameraTarget({elevation:-100,zoom:999}),{...HOME,elevation:LIMITS.minElevation,zoom:LIMITS.maxZoom});
 close(nearestAzimuth(1,359),361);close(nearestAzimuth(359,1),-1);
 assert.throws(()=>cameraTarget({zoom:NaN}));
});
