const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const {makeModel,STEPS,DEFAULT}=TaskModel;
const {HOME,projectionFor,cameraTarget,nearestAzimuth,triangleCamera,VIEWS}=OrbitCamera;
const state={step:0,view:'front',planeVisible:true,current:{...DEFAULT},target:{...DEFAULT},camera:{...HOME},cameraTarget:{...HOME}};
let model=makeModel(),frame=0,last=0,visible=true,project=p=>p;
const stage=$('#orbit-stage');
const cameraMetrics={paints:0,totalMs:0,lastMs:0};
const still=matchMedia('(prefers-reduced-motion: reduce)');
const names=['A','B','C','D','M','K','H'];
const refs=Object.fromEntries(['scene','flat'].map(prefix=>[prefix,{
 paths:Object.fromEntries(['triangle','alpha','trap','ad','triangle-line','bc','kh','ticks-bm','ticks-mc','parallel'].map(n=>[n,$(`#${prefix}-${n}`)])),
 points:Object.fromEntries(names.map(n=>{const g=$(`#${prefix}-points [data-point="${n}"]`);return[n,{g,circle:g.querySelector('circle'),text:g.querySelector('text')}]})),
 length:$(`#${prefix}-length`),result:$(`#${prefix}-result`),planeName:$(`#${prefix}-plane-name`)
}]));
const n=v=>Math.round(v*100)/100;
const path=(points,closed=false)=>points.length?'M'+points.map(p=>p.map(n).join(' ')).join('L')+(closed?'Z':''):'';
const mid=(a,b)=>a.map((v,i)=>(v+b[i])/2);
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const hidden=(el,value)=>el.toggleAttribute('hidden',value);
function direction(a,b){const d=[b[0]-a[0],b[1]-a[1]],len=Math.hypot(...d);return d.map(x=>x/Math.max(len,1e-10));}
function normalToward(a,b,c){const u=direction(a,b),v=[-u[1],u[0]],m=mid(a,b);return v.map(x=>x*((c[0]-m[0])*v[0]+(c[1]-m[1])*v[1]>=0?1:-1));}
function at(el,p){el.setAttribute('x',n(p[0]));el.setAttribute('y',n(p[1]));}
function ticks(a,b,count){
 const u=direction(a,b),v=[-u[1],u[0]],segments=[];
 for(const t of [.25,.75])for(let i=0;i<count;i++){
  const p=lerp(a,b,t).map((x,j)=>x+u[j]*(i-(count-1)/2)*4.5);
  segments.push(path([p.map((x,j)=>x-v[j]*4),p.map((x,j)=>x+v[j]*4)]));
 }
 return segments.join('');
}
function parallel(a,b,t=.65){
 const u=direction(a,b),v=[-u[1],u[0]],p=lerp(a,b,t);
 return path([p.map((x,i)=>x-u[i]*4+v[i]*3.5),p.map((x,i)=>x+u[i]*2),p.map((x,i)=>x-u[i]*4-v[i]*3.5)]);
}
function drawView(prefix,p){
 const r=refs[prefix],flat=prefix==='flat',s=state.step;
 const show=(key,yes)=>hidden(r.paths[key],!yes);
 const set=(key,points,closed=false)=>r.paths[key].setAttribute('d',path(points,closed));
 set('triangle',[p.M,p.B,p.C],true);set('triangle-line',[p.B,p.M,p.C]);set('bc',[p.B,p.C]);set('kh',[p.K,p.H]);
 if(!flat){set('trap',[p.A,p.B,p.C,p.D],true);set('ad',[p.A,p.D]);set('alpha',model.patch.map(project),true);}
 show('triangle',s>=1);show('alpha',!flat&&s>=4&&state.planeVisible);show('trap',!flat);show('ad',!flat);show('kh',s>=2);
 show('ticks-bm',true);show('ticks-mc',s>=2);show('parallel',s>=3);
 r.paths['ticks-bm'].setAttribute('d',ticks(p.B,p.M,1));r.paths['ticks-mc'].setAttribute('d',ticks(p.M,p.C,2));
 r.paths.parallel.setAttribute('d',parallel(p.B,p.C,.7)+parallel(p.K,p.H,.7)+(!flat&&s>=4?parallel(p.A,p.D,.3):''));
 r.paths.bc.classList.toggle('highlight',s>=3);r.paths.ad.classList.toggle('highlight',s>=4);
 r.paths['triangle-line'].style.opacity=s===0?.65:1;
 for(const name of names){
  const q=r.points[name],point=p[name],hidePoint=!point||(name==='H'&&s<2);
  hidden(q.g,hidePoint);if(hidePoint)continue;
  const x=point[0],y=point[1];q.circle.setAttribute('cx',n(x));q.circle.setAttribute('cy',n(y));
  let offset,anchor='middle';
  if(name==='M')offset=[0,-14];
  else if(['K','H'].includes(name)){const left=x<mid(p.K,p.H)[0];offset=[left?-13:13,-3];anchor=left?'end':'start';}
  else{const center=['A','D'].includes(name)&&p.A?mid(p.A,p.D):mid(p.B,p.C),left=x<center[0];offset=[left?-10:10,17];anchor=left?'end':'start';}
  at(q.text,[x+offset[0],y+offset[1]]);q.text.setAttribute('text-anchor',anchor);
 }
 const norm=normalToward(p.B,p.C,p.M),bc=mid(p.B,p.C),kh=mid(p.K,p.H);
 at(r.length,bc.map((x,i)=>x-norm[i]*25));
 at(r.result,kh.map((x,i)=>x+norm[i]*20));hidden(r.result,s!==5);
 hidden(r.planeName,flat||s<4||!state.planeVisible);
 if(!flat){const label=project(lerp(model.patch[0],model.patch[3],.63));at(r.planeName,[label[0]+6,label[1]-7]);}
}
function draw(){
 model=makeModel(state.current);
 const projection=projectionFor(state.camera);
 project=p=>IsoKit.iso(p,projection);
 const start=performance.now();
 drawView('scene',Object.fromEntries(names.map(name=>[name,project(model[name])])));
 drawView('flat',Object.fromEntries(Object.entries(model.flat).map(([name,p])=>[name,[180+p[0]*15,260-p[1]*15]])));
 cameraMetrics.paints++;cameraMetrics.lastMs=performance.now()-start;cameraMetrics.totalMs+=cameraMetrics.lastMs;
 $('#scene-readout').textContent=state.step===5?`KH = ${model.kh.toFixed(0)} см`:state.step>=4?'KH ⊂ (ADK)':state.step>=3?'KH ∥ BC':state.step>=2?'MH = HC':'BK = KM';
 $('#zoom-value').textContent=`${Math.round(state.camera.zoom*100)}%`;
 const camera=IsoKit.cameraOf(projection),normal=[0,state.current.z,4-state.current.y],facing=Math.abs(normal[1]*camera.sinA*camera.cosE+normal[2]*camera.sinE)/Math.hypot(...normal);
 $('#scene-hint').textContent=facing<.12?'Треугольник виден с ребра · нажмите «Прямо на MBC»':'Вращайте перетаскиванием · масштаб колёсиком';
}
function setStep(step){
 state.step=Math.max(0,Math.min(STEPS.length-1,step));
 const s=STEPS[state.step];
 $$('.steps [data-step]').forEach(b=>{b.setAttribute('aria-pressed',String(+b.dataset.step===state.step));b.dataset.complete=String(+b.dataset.step<state.step);});
 $('#step-count').textContent=`ШАГ ${state.step+1} / 6`;$('#plate-step').textContent=`ШАГ ${state.step+1} / 6`;
 $('#step-title').textContent=s.title;$('#step-copy').textContent=s.copy;
 $('#step-formula').textContent=s.formula.replace(' · ','\n');$('#step-hint').textContent=s.hint;
 $('#step-category').textContent=['ДАНО','ПЛОСКИЙ ТРЕУГОЛЬНИК','ВСПОМОГАТЕЛЬНОЕ ПОСТРОЕНИЕ','ТЕОРЕМА О СРЕДНЕЙ ЛИНИИ','ПРИНАДЛЕЖНОСТЬ ПЛОСКОСТИ','ДОКАЗАНО'][state.step];
 $('#scene-desc').textContent=s.copy;
 $('#previous-step').disabled=state.step===0;$('#next-step').textContent=state.step===5?'Сначала ↺':'Дальше →';
 $('#plane-control').setAttribute('aria-disabled',String(state.step<4));$('#show-plane').disabled=state.step<4;
 const facts=['K — середина BM','△MBC: K ∈ MB','BK = KM · MH = HC','KH ∥ BC · KH = ½BC','KH ∥ BC ∥ AD','KH = ½ · 12 = 6 см'];
 const explanations=['У пространственной задачи есть плоская часть. Выделим её следующим шагом.','Положение M может быть любым вне плоскости трапеции. Треугольник не обязан быть равнобедренным.','H выбрана серединой MC. На этом шаге мы ещё не утверждаем, что она лежит в плоскости ADK.','Средняя линия соединяет середины двух сторон и равна половине третьей.','Средняя линия параллельна AD. Через K в плоскости ADK проходит именно эта прямая.','Ответ не зависит от положения M и длины второго основания AD.'];
 $('#flat-fact').textContent=facts[state.step];$('#flat-explanation').textContent=explanations[state.step];
 hidden($('#answer-box'),state.step!==5);$('#announcement').textContent=`Шаг ${state.step+1}. ${s.title}`;
 draw();
}
function setView(view){
 if(view!=='triangle'&&!VIEWS[view])return;
 const values=view==='triangle'?triangleCamera(state.target,state.camera):{...VIEWS[view],zoom:1};
 setCamera(values,false,view);
}
function tick(now){
 frame=0;if(!visible||document.hidden)return;
 const dt=last?Math.min((now-last)/1000,1/30):1/60;last=now;let moving=false;
 for(const name of ['x','y','z']){
  const gap=state.target[name]-state.current[name];
  if(still.matches||Math.abs(gap)<.0001)state.current[name]=state.target[name];
  else{state.current[name]+=gap*(1-Math.exp(-dt/.16));moving=true;}
 }
 for(const name of ['azimuth','elevation','zoom']){
  const gap=state.cameraTarget[name]-state.camera[name];
  if(still.matches||Math.abs(gap)<(name==='zoom'?.00005:.005))state.camera[name]=state.cameraTarget[name];
  else{state.camera[name]+=gap*(1-Math.exp(-dt/.105));moving=true;}
 }
 draw();if(moving)frame=requestAnimationFrame(tick);else last=0;
}
function run(){if(!frame&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}}
function stop(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;}
function setControls(values,instant=false){
 Object.assign(state.target,values);
 $('#mx').value=state.target.x;$('#mz').value=state.target.z;
 $('#mx-value').textContent=state.target.x.toLocaleString('ru-RU');$('#mz-value').textContent=state.target.z.toLocaleString('ru-RU');
 if(state.view==='triangle')state.cameraTarget.elevation=triangleCamera(state.target,state.camera).elevation;
 if(instant||still.matches||!visible||document.hidden){Object.assign(state.current,state.target);if(state.view==='triangle')Object.assign(state.camera,state.cameraTarget);draw();}else run();
}
function setCamera(values,instant=false,view='custom'){
 const next=cameraTarget(values,state.cameraTarget);
 if(values.azimuth!==undefined)next.azimuth=nearestAzimuth(values.azimuth,state.camera.azimuth);
 Object.assign(state.cameraTarget,next);state.view=view;
 $$('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
 if(instant||still.matches||!visible||document.hidden){Object.assign(state.camera,state.cameraTarget);draw();}else run();
}
const resetView=()=>setCamera(HOME,false,'front');
const zoom=factor=>setCamera({zoom:state.cameraTarget.zoom*factor},false,state.view);
$('#zoom-in').addEventListener('click',()=>zoom(1.15));
$('#zoom-out').addEventListener('click',()=>zoom(1/1.15));
$('#reset-view').addEventListener('click',resetView);
stage.addEventListener('dblclick',resetView);
stage.addEventListener('wheel',e=>{e.preventDefault();const dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?stage.clientHeight:1);zoom(Math.exp(-Math.max(-500,Math.min(500,dy))*.0015));},{passive:false});
const pointers=new Map();let gesture=null;
function rebaseGesture(){
 const p=[...pointers.values()];
 gesture=p.length>=2?{kind:'pinch',distance:Math.max(1,Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)),camera:{...state.cameraTarget}}:p.length?{kind:'orbit',start:{...p[0]},camera:{...state.cameraTarget}}:null;
 stage.classList.toggle('is-dragging',p.length>0);
}
stage.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button!==0)return;
 stage.focus({preventScroll:true});stage.setPointerCapture(e.pointerId);
 if(!pointers.size)Object.assign(state.cameraTarget,state.camera);
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});rebaseGesture();
 stage.classList.add('has-interacted');
});
document.addEventListener('pointermove',e=>{
 if(!pointers.has(e.pointerId)||!gesture)return;
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const p=[...pointers.values()];
 if(gesture.kind==='pinch'&&p.length>=2){
  const distance=Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y);
  setCamera({zoom:gesture.camera.zoom*distance/gesture.distance});
 }else if(gesture.kind==='orbit'&&p.length===1){
  const box=stage.getBoundingClientRect();
  setCamera({azimuth:gesture.camera.azimuth-(p[0].x-gesture.start.x)*320/box.width,elevation:gesture.camera.elevation+(p[0].y-gesture.start.y)*130/box.height});
 }
},true);
function releasePointer(e){
 if(!pointers.has(e.pointerId))return;
 pointers.delete(e.pointerId);if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);rebaseGesture();
}
document.addEventListener('pointerup',releasePointer,true);document.addEventListener('pointercancel',releasePointer,true);
stage.addEventListener('lostpointercapture',e=>{if(e.buttons===0)releasePointer(e);});
stage.addEventListener('dragstart',e=>e.preventDefault());
function releaseAllPointers(){for(const pointerId of [...pointers.keys()])releasePointer({pointerId});}
window.addEventListener('blur',releaseAllPointers);
stage.addEventListener('contextmenu',e=>e.preventDefault());
stage.addEventListener('keydown',e=>{
 const angles={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,8],ArrowDown:[0,-8]},amount=e.shiftKey?2:1;
 if(angles[e.key]){e.preventDefault();e.stopPropagation();setCamera({azimuth:state.cameraTarget.azimuth+angles[e.key][0]*amount,elevation:state.cameraTarget.elevation+angles[e.key][1]*amount});}
 else if(['+','=','-','_','Home'].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='Home')resetView();else zoom(['+','='].includes(e.key)?1.15:1/1.15);}
});
$$('[data-step]').forEach(b=>b.addEventListener('click',()=>setStep(+b.dataset.step)));
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
$('#previous-step').addEventListener('click',()=>setStep(state.step-1));
$('#next-step').addEventListener('click',()=>setStep(state.step===5?0:state.step+1));
$('#show-answer').addEventListener('click',()=>setStep(5));
$('#mx').addEventListener('input',e=>setControls({x:+e.target.value}));
$('#mz').addEventListener('input',e=>setControls({z:+e.target.value}));
$('#reset').addEventListener('click',()=>setControls(DEFAULT));
$('#show-plane').addEventListener('change',e=>{state.planeVisible=e.target.checked;draw();});
function themeLabel(){$('#theme').textContent=document.body.dataset.theme==='light'?'Тёмная тема ◐':'Светлая тема ◑';}
$('#theme').addEventListener('click',()=>{document.body.dataset.theme=document.body.dataset.theme==='light'?'dark':'light';themeLabel();});
document.addEventListener('keydown',e=>{
 if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.target.isContentEditable||e.ctrlKey||e.altKey||e.metaKey)return;
 if(e.key==='ArrowRight'){e.preventDefault();setStep(state.step+1);}else if(e.key==='ArrowLeft'){e.preventDefault();setStep(state.step-1);}
});
new IntersectionObserver(entries=>{visible=entries.at(-1).isIntersecting;if(visible)run();else stop();},{rootMargin:'120px 0px'}).observe($('#scene'));
document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseAllPointers();stop();}else run();});
still.addEventListener('change',()=>{if(still.matches){Object.assign(state.current,state.target);Object.assign(state.camera,state.cameraTarget);stop();draw();}else run();});
window.task29={state,get model(){return model;},setStep,setView,setControls,setCamera,get cameraMetrics(){return{...cameraMetrics,meanMs:cameraMetrics.totalMs/Math.max(1,cameraMetrics.paints)};},get activity(){return{visible,frame,reduced:still.matches,pointers:pointers.size};}};
themeLabel();setControls(DEFAULT,true);setStep(0);
