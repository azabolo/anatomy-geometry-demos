import test from 'node:test';
import assert from 'node:assert/strict';
import * as k from './kit/iso-kit.mjs';
import {HOME,LIMITS,projectionFor,cameraTarget,nearestAzimuth,triangleCamera} from './camera.mjs';
import {makeModel,sub,length} from './model.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('Орбита сохраняет центр и масштаб',()=>{
 for(let a=-360;a<=720;a+=15)for(const e of [-75,0,24,85]){
  const P=projectionFor({...HOME,azimuth:a,elevation:e}),q=k.iso([0,0,6],P);close(q[0],400);close(q[1],280);close(P.scale,21);
 }
});
test('Прямой ракурс даёт неискажённый треугольник и горизонтальные основания',()=>{
 for(const x of [-4,1,4])for(const z of [8,11,14]){
  const m=makeModel({x,z,tilt:0}),P=projectionFor(triangleCamera()),screen=n=>k.iso(m[n],P),scale=k.cameraOf(P).k;
  close(screen('M')[1],screen('K')[1]);close(screen('M1')[1],screen('K1')[1]);
  for(const [a,b]of [['P','M'],['P','K1'],['M1','K1'],['M','K']])close(length(sub(screen(a),screen(b)))/scale,length(sub(m[a],m[b])));
 }
});
test('Границы камеры и короткий путь через 360°',()=>{
 assert.equal(cameraTarget({elevation:-200,zoom:99}).elevation,LIMITS.minElevation);
 assert.equal(cameraTarget({zoom:99}).zoom,LIMITS.maxZoom);
 close(nearestAzimuth(1,359),361);close(nearestAzimuth(359,1),-1);assert.throws(()=>cameraTarget({zoom:NaN}));
});
