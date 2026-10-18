import test from 'node:test';
import assert from 'node:assert/strict';
import {makeModel,sub,cross,dot,length,midpoint,add,mul} from './model.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const point=(a,b)=>a.forEach((v,i)=>close(v,b[i]));
test('Данные задачи и ответ',()=>{const m=makeModel();close(m.bc,12);close(m.kh,6);point(m.K,midpoint(m.B,m.M));point(m.H,midpoint(m.C,m.M));});
test('Доказательство пересечения для произвольных M, в том числе под трапецией и в вертикальной ADK',()=>{
 for(let i=0;i<360;i++){
  const m=makeModel({x:Math.sin(i*1.91)*17,y:i%7===0?-12:Math.cos(i*.47)*22,z:(i%2?-1:1)*(.2+i%23)});
  close(length(cross(sub(m.D,m.A),sub(m.H,m.K))),0);
  for(const p of [m.A,m.D,m.K,m.H,...m.patch])close(m.signedDistance(p),0);
  assert.ok(Math.abs(m.signedDistance(m.C))>1e-6);
  const direction=sub(m.C,m.M),t=(m.plane.d-dot(m.plane.normal,m.M))/dot(m.plane.normal,direction);
  close(t,.5);point(add(m.M,mul(direction,t)),m.H);close(m.kh,6);
 }
});
test('Развёртка сохраняет все расстояния треугольника и средней линии',()=>{
 for(const v of [{x:1,y:-1,z:11},{x:-4,y:-2,z:4},{x:4,y:6,z:14},{x:-3,y:-12,z:-8}]){
  const m=makeModel(v);
  for(const [a,b] of [['B','M'],['M','C'],['B','C'],['K','H'],['M','H'],['H','C']])close(length(sub(m[a],m[b])),length(sub(m.flat[a],m.flat[b])));
 }
});
test('M в плоскости трапеции запрещена',()=>assert.throws(()=>makeModel({x:0,y:0,z:0})));
