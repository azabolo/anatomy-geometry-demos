import test from 'node:test';
import assert from 'node:assert/strict';
import {makeModel,DEFAULT,BASE,RATIO,sub,cross,dot,length} from './model.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('Условие с фотографии: обратное отношение 5/12 и длина 7,5 см',()=>{
 const m=makeModel();close(m.base,18);close(m.section,7.5);
 close(length(sub(m.M,m.P))/length(sub(m.M1,m.P)),12/5);
 assert.notEqual(length(sub(m.M,m.M1))/length(sub(m.M1,m.P)),12/5);
});
test('Пересечение, параллельность и подобие сохраняются при движении P и наклоне α',()=>{
 for(let x=-4;x<=4;x++)for(let z=8;z<=14;z++)for(let tilt=-30;tilt<=30;tilt+=10){
  const m=makeModel({x,z,tilt}),section=sub(m.K1,m.M1),base=sub(m.K,m.M);
  close(m.signedDistance(m.M1),0);close(m.signedDistance(m.K1),0);
  close(dot(m.plane.normal,base),0);assert.ok(Math.abs(m.signedDistance(m.M))>1);
  close(length(cross(section,base)),0);
  close(length(cross(sub(m.M1,m.P),sub(m.M,m.P))),0);
  close(length(cross(sub(m.K1,m.P),sub(m.K,m.P))),0);
  for(const [a,b]of [['P','M'],['P','K'],['M','K']]){
   const u=a==='P'?'P':a+'1',v=b+'1';close(length(sub(m[v],m[u]))/length(sub(m[b],m[a])),RATIO);
  }
  close(m.section,BASE*5/12);
  for(const p of m.patch)close(m.signedDistance(p),0);
  for(const p of m.trace){close(m.signedDistance(p),0);close(p[1],0);}
 }
});
test('Плоский вид сохраняет все расстояния',()=>{
 for(const values of [DEFAULT,{x:-4,z:8,tilt:-30},{x:4,z:14,tilt:30}]){
  const m=makeModel(values);for(const a of Object.keys(m.flat))for(const b of Object.keys(m.flat))close(length(sub(m[a],m[b])),length(sub(m.flat[a],m.flat[b])));
 }
});
test('Некорректная или вырожденная геометрия не принимается',()=>{
 for(const v of [{z:0},{z:-4},{x:NaN},{tilt:90}])assert.throws(()=>makeModel({...DEFAULT,...v}));
});
