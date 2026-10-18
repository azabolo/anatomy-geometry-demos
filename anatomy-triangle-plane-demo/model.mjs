export const add=(a,b)=>a.map((v,i)=>v+b[i]);
export const sub=(a,b)=>a.map((v,i)=>v-b[i]);
export const mul=(a,k)=>a.map(v=>v*k);
export const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const length=a=>Math.hypot(...a);
export const RATIO=5/12;
export const BASE=18;
export const DEFAULT=Object.freeze({x:1,z:11,tilt:0});
export const STEPS=Object.freeze([
 {short:'Условие',title:'Треугольник пересечён плоскостью',copy:'Плоскость α параллельна прямой MK и пересекает стороны MP и PK в точках M₁ и K₁. Известны основание MK = 18 см и отношение MP : M₁P = 12 : 5. Найдём M₁K₁.',formula:'MK ∥ α\nMP : M₁P = 12 : 5',hint:'Отношение задано для всей стороны MP и её верхней части M₁P.',fact:'MK = 18 см'},
 {short:'Пересечение',title:'Одна прямая в двух плоскостях',copy:'Обозначим плоскость треугольника буквой β. Точки M₁ и K₁ принадлежат и α, и β. Поэтому прямая M₁K₁ — линия пересечения этих плоскостей.',formula:'α ∩ β = (M₁K₁)',hint:'Штриховая линия продолжается за пределами треугольника.',fact:'M₁, K₁ ∈ α ∩ β'},
 {short:'Параллельность',title:'Почему M₁K₁ параллелен MK',copy:'MK лежит в β и параллельна α. Если бы MK пересекала линию M₁K₁, точка пересечения лежала бы в α. Это противоречит MK ∥ α. Значит, эти прямые в плоскости β параллельны.',formula:'M₁K₁ ∥ MK',hint:'Так пространственное условие превращается в плоскую задачу.',fact:'M₁K₁ ∥ MK'},
 {short:'Подобие',title:'Малый треугольник подобен большому',copy:'При параллельных M₁K₁ и MK соответствующие углы равны. Угол при P — общий. Поэтому треугольники PM₁K₁ и PMK подобны по двум углам.',formula:'△PM₁K₁ ∼ △PMK',hint:'Соответствуют вершины P ↔ P, M₁ ↔ M, K₁ ↔ K.',fact:'PM₁ / PM = M₁K₁ / MK'},
 {short:'Отношение',title:'Берём 5 долей из 12',copy:'В условии MP : M₁P = 12 : 5. Значит, PM₁ / PM = 5/12. Это отношение верхнего отрезка ко всей стороне, а не к нижней части MM₁. По подобию так же относятся M₁K₁ и MK.',formula:'k = PM₁ / PM = 5/12\nM₁K₁ / MK = 5/12',hint:'Шкала делит всю сторону на 12 равных долей; верхних — 5.',fact:'Верхняя часть: 5 из 12 долей'},
 {short:'Ответ',title:'M₁K₁ = 7,5 см',copy:'Соответствующая сторона малого треугольника составляет 5/12 основания большого. Умножаем 18 см на коэффициент подобия. Положение вершины P и наклон плоскости α не влияют на ответ.',formula:'M₁K₁ = 18 · 5/12\nM₁K₁ = 7,5 см',hint:'Двигайте P и наклоняйте α: условия и найденная длина сохраняются.',fact:'18 · 5/12 = 7,5 см'}
]);

export function makeModel(values=DEFAULT){
 const {x,z,tilt}=values;
 if(![x,z,tilt].every(Number.isFinite)||z<=0||Math.abs(tilt)>=80)throw new Error('Некорректные параметры треугольника или плоскости');
 const P=[x,0,z],M=[-BASE/2,0,0],K=[BASE/2,0,0];
 const M1=add(P,mul(sub(M,P),RATIO)),K1=add(P,mul(sub(K,P),RATIO));
 const slope=Math.tan(tilt*Math.PI/180),height=M1[2];
 const n=[0,-slope,1],normal=mul(n,1/length(n)),d=height/length(n);
 const patch=[[-12,-4.5],[12,-4.5],[12,4.5],[-12,4.5]].map(([px,y])=>[px,y,height+y*slope]);
 const points={P,M,K,M1,K1};
 const flat=Object.fromEntries(Object.entries(points).map(([name,p])=>[name,[p[0],p[2]]]));
 return{...points,flat,patch,plane:{normal,d},trace:[[-12,0,height],[12,0,height]],ratio:RATIO,base:length(sub(K,M)),section:length(sub(K1,M1)),
  signedDistance:p=>dot(normal,p)-d};
}
