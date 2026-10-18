export const add = (a,b) => a.map((v,i)=>v+b[i]);
export const sub = (a,b) => a.map((v,i)=>v-b[i]);
export const mul = (a,k) => a.map(v=>v*k);
export const dot = (a,b) => a.reduce((s,v,i)=>s+v*b[i],0);
export const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const length = a => Math.hypot(...a);
export const midpoint = (a,b) => mul(add(a,b),.5);
export const DEFAULT = Object.freeze({x:1,y:-1,z:11});
export const STEPS = Object.freeze([
 {short:'Условие',title:'Что дано в пространстве',copy:'ABCD — трапеция: AD ∥ BC, BC = 12 см. Точка M находится вне плоскости трапеции, K — середина BM. Нужно доказать, что плоскость ADK пересекает MC, и найти KH.',formula:'BK = KM · AD ∥ BC',hint:'Начните с треугольника, содержащего K и MC.'},
 {short:'Треугольник',title:'Выделим треугольник MBC',copy:'Отрезки MB и MC вместе с основанием BC образуют треугольник. K уже лежит на его стороне MB. Справа тот же треугольник показан прямо, без искажения формы.',formula:'K ∈ MB · BK = KM',hint:'Точка K — середина одной из сторон треугольника.'},
 {short:'Построение H',title:'Возьмём середину MC',copy:'Обозначим середину MC буквой H и соединим её с K. Пока это вспомогательное построение: принадлежность H плоскости ADK ещё предстоит доказать.',formula:'MH = HC',hint:'Одинарные и двойные засечки отмечают две пары равных отрезков.'},
 {short:'Средняя линия',title:'KH — средняя линия',copy:'K и H — середины двух сторон треугольника MBC. По теореме о средней линии KH параллелен третьей стороне BC и равен половине её длины.',formula:'KH ∥ BC · KH = ½BC',hint:'Этот вывод получен целиком в плоскости треугольника MBC.'},
 {short:'Плоскость ADK',title:'Почему H лежит в плоскости ADK',copy:'Основания трапеции параллельны: AD ∥ BC. Значит, KH ∥ AD. Плоскость, содержащая прямую AD и точку K, содержит и прямую через K, параллельную AD. Следовательно, вся прямая KH, включая H, лежит в плоскости ADK.',formula:'KH ∥ AD ⇒ H ∈ (ADK)',hint:'Показан только фрагмент бесконечной плоскости ADK.'},
 {short:'Ответ',title:'Пересечение найдено. KH = 6 см',copy:'H находится внутри MC и принадлежит плоскости ADK — требуемое пересечение существует. Оно единственно: плоскости ABCD и ADK пересекаются по AD, поэтому C не лежит в ADK. Длина средней линии KH равна 12 : 2 = 6 см.',formula:'(ADK) ∩ [MC] = {H} · KH = 6 см',hint:'Двигайте M: середины остаются серединами, а KH — половиной BC.'}
]);

export function makeModel(values=DEFAULT){
 const M=[values.x,values.y,values.z];
 if(!M.every(Number.isFinite)||Math.abs(M[2])<1e-9)throw new Error('M должна находиться вне плоскости трапеции');
 const A=[-9,-4,0],B=[-6,4,0],C=[6,4,0],D=[10,-4,0];
 const K=midpoint(B,M),H=midpoint(C,M);
 const n0=cross(sub(D,A),sub(K,A)),normal=mul(n0,1/length(n0));
 const plane={normal,d:dot(normal,A)};
 // A rectangular fragment spanned by AD and the component of AK normal to AD.
 const patch=[[-12.5,0],[12.5,0],[12.5,1.25],[-12.5,1.25]].map(([x,t])=>[x,A[1]+t*(K[1]-A[1]),t*K[2]]);
 // Coordinates in an orthonormal basis of (MBC): BC is horizontal, altitude is positive.
 const altitude=Math.hypot(M[1]-B[1],M[2]);
 const flat={B:[-6,0],C:[6,0],M:[M[0],altitude],K:[K[0],altitude/2],H:[H[0],altitude/2]};
 return{A,B,C,D,M,K,H,plane,patch,flat,bc:length(sub(C,B)),kh:length(sub(H,K)),
   intersectionT:.5,signedDistance:p=>dot(normal,p)-plane.d};
}
