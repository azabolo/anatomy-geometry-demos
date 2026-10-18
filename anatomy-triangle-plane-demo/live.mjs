const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const {makeModel,STEPS,DEFAULT}=TaskModel;
const {HOME,projectionFor,cameraTarget,nearestAzimuth,triangleCamera,VIEWS}=OrbitCamera;
const state={step:0,view:'front',planeVisible:true,current:{...DEFAULT},target:{...DEFAULT},camera:{...HOME},cameraTarget:{...HOME}};
let model=makeModel(),frame=0,last=0,visible=true,project=p=>p;
const stage=$('#orbit-stage'),still=matchMedia('(prefers-reduced-motion: reduce)');
const cameraMetrics={paints:0,totalMs:0,lastMs:0};
const names=['P','M','K','M1','K1'];
const refs=Object.fromEntries(['scene','flat'].map(prefix=>[prefix,{
 paths:Object.fromEntries(['whole','alpha','small','sides','base','trace','upper-side','section','ratio-ticks','parallel','angles'].map(n=>[n,$(`#${prefix}-${n}`)])),
 points:Object.fromEntries(names.map(name=>{const g=$(`#${prefix}-points [data-point="${name}"]`);return[name,{g,circle:g.querySelector('circle'),text:g.querySelector('text')}]})),
 length:$(`#${prefix}-length`),result:$(`#${prefix}-result`),planeName:$(`#${prefix}-plane-name`)
}]));
const n=v=>Math.round(v*100)/100;
const path=(points,closed=false)=>points.length?'M'+points.map(p=>p.map(n).join(' ')).join('L')+(closed?'Z':''):'';
const mid=(a,b)=>a.map((v,i)=>(v+b[i])/2),lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const hidden=(el,value)=>el.toggleAttribute('hidden',value);
function direction(a,b){const d=[b[0]-a[0],b[1]-a[1]],len=Math.hypot(...d);return d.map(x=>x/Math.max(len,1e-10));}
function normalToward(a,b,c){const u=direction(a,b),v=[-u[1],u[0]],m=mid(a,b),sign=(c[0]-m[0])*v[0]+(c[1]-m[1])*v[1]>=0?1:-1;return v.map(x=>x*sign);}
function at(el,p){el.setAttribute('x',n(p[0]));el.setAttribute('y',n(p[1]));}
function parallel(a,b,t=.65){const u=direction(a,b),v=[-u[1],u[0]],p=lerp(a,b,t);return path([p.map((x,i)=>x-u[i]*4+v[i]*3.5),p.map((x,i)=>x+u[i]*2),p.map((x,i)=>x-u[i]*4-v[i]*3.5)]);}
function divisions(a,b){const u=direction(a,b),v=[-u[1],u[0]];return Array.from({length:11},(_,i)=>{const p=lerp(a,b,(i+1)/12);return path([p.map((x,j)=>x-v[j]*3),p.map((x,j)=>x+v[j]*3)]);}).join('');}
function angle(vertex,a,b,count=1){
 const u=direction(vertex,a),v=direction(vertex,b);let start=Math.atan2(u[1],u[0]),end=Math.atan2(v[1],v[0]);
 const delta=((end-start+Math.PI*3)%(Math.PI*2))-Math.PI;
 return Array.from({length:count},(_,i)=>path(Array.from({length:15},(_,j)=>{const t=start+delta*j/14,r=12+i*4;return[vertex[0]+Math.cos(t)*r,vertex[1]+Math.sin(t)*r];}))).join('');
}
function drawView(prefix,p){
 const r=refs[prefix],flat=prefix==='flat',s=state.step;
 const show=(key,yes)=>hidden(r.paths[key],!yes),set=(key,points,closed=false)=>r.paths[key].setAttribute('d',path(points,closed));
 set('whole',[p.P,p.M,p.K],true);set('small',[p.P,p.M1,p.K1],true);set('sides',[p.M,p.P,p.K]);set('base',[p.M,p.K]);set('section',[p.M1,p.K1]);set('upper-side',[p.P,p.M1]);
 if(!flat){set('alpha',model.patch.map(project),true);set('trace',model.trace.map(project));}
 show('alpha',!flat&&state.planeVisible);show('trace',!flat&&s>=1&&state.planeVisible);show('small',s>=3);show('upper-side',s>=4);show('ratio-ticks',s>=4);show('parallel',s>=2);show('angles',s>=3);
 r.paths['ratio-ticks'].setAttribute('d',divisions(p.P,p.M));
 r.paths.parallel.setAttribute('d',parallel(p.M,p.K,.72)+parallel(p.M1,p.K1,.72));
 r.paths.angles.setAttribute('d',angle(p.M,p.P,p.K)+angle(p.M1,p.P,p.K1)+angle(p.K,p.M,p.P,2)+angle(p.K1,p.M1,p.P,2));
 r.paths.base.classList.toggle('highlight',s>=2);r.paths.section.classList.toggle('highlight',s>=1);
 for(const name of names){
  const q=r.points[name],point=p[name];q.circle.setAttribute('cx',n(point[0]));q.circle.setAttribute('cy',n(point[1]));
  let offset,anchor='middle';
  if(name==='P')offset=[0,-14];
  else{const center=name.endsWith('1')?mid(p.M1,p.K1):mid(p.M,p.K),left=point[0]<center[0];offset=[left?-12:12,name.endsWith('1')?-3:18];anchor=left?'end':'start';}
  at(q.text,point.map((v,i)=>v+offset[i]));q.text.setAttribute('text-anchor',anchor);
 }
 r.length.textContent=`MK = ${model.base.toLocaleString('ru-RU')} см`;r.result.textContent=`M₁K₁ = ${model.section.toLocaleString('ru-RU',{maximumFractionDigits:1})} см`;
 const norm=normalToward(p.M,p.K,p.P),bc=mid(p.M,p.K),section=mid(p.M1,p.K1);
 at(r.length,bc.map((v,i)=>v-norm[i]*25));at(r.result,section.map((v,i)=>v+norm[i]*20));hidden(r.result,s!==5);
 hidden(r.planeName,flat||!state.planeVisible);if(!flat)at(r.planeName,project([10.7,3.5,model.M1[2]+3.5*Math.tan(state.current.tilt*Math.PI/180)]));
}
function draw(){
 model=makeModel(state.current);const projection=projectionFor(state.camera);project=p=>IsoKit.iso(p,projection);const start=performance.now();
 drawView('scene',Object.fromEntries(names.map(name=>[name,project(model[name])])));
 drawView('flat',Object.fromEntries(Object.entries(model.flat).map(([name,p])=>[name,[180+p[0]*14,247-p[1]*14]])));
 cameraMetrics.paints++;cameraMetrics.lastMs=performance.now()-start;cameraMetrics.totalMs+=cameraMetrics.lastMs;
 $('#scene-readout').textContent=['MK ∥ α','α ∩ β = (M₁K₁)','M₁K₁ ∥ MK','△PM₁K₁ ∼ △PMK','k = 5/12',`M₁K₁ = ${model.section.toLocaleString('ru-RU',{maximumFractionDigits:1})} см`][state.step];
 $('#zoom-value').textContent=`${Math.round(state.camera.zoom*100)}%`;
 const camera=IsoKit.cameraOf(projection),facing=Math.abs(camera.sinA*camera.cosE);
 $('#scene-hint').textContent=facing<.12?'Треугольник виден с ребра · нажмите «Прямо на △»':'Вращайте перетаскиванием · масштаб колёсиком';
}
function setStep(step){
 state.step=Math.max(0,Math.min(STEPS.length-1,step));const s=STEPS[state.step];
 $$('.steps [data-step]').forEach(b=>{b.setAttribute('aria-pressed',String(+b.dataset.step===state.step));b.dataset.complete=String(+b.dataset.step<state.step);});
 $('#step-count').textContent=`ШАГ ${state.step+1} / 6`;$('#plate-step').textContent=`ШАГ ${state.step+1} / 6`;
 $('#step-title').textContent=s.title;$('#step-copy').textContent=s.copy;$('#step-formula').textContent=s.formula;$('#step-hint').textContent=s.hint;
 $('#step-category').textContent=s.short;$('#scene-desc').textContent=s.copy;
 $('#previous-step').disabled=state.step===0;$('#next-step').textContent=state.step===5?'Сначала ↺':'Дальше →';
 $('#flat-fact').textContent=s.fact;$('#flat-explanation').textContent=s.hint;
 hidden($('#ratio-strip'),state.step<4);hidden($('#step-hint'),state.step>=4);hidden($('#answer-box'),state.step!==5);
 $('#announcement').textContent=`Шаг ${state.step+1}. ${s.title}`;draw();
}
function setView(view){
 if(view!=='triangle'&&!VIEWS[view])return;
 const values=view==='triangle'?triangleCamera(state.camera):{...VIEWS[view],zoom:1};
 setCamera(values,false,view);
}
function tick(now){
 frame=0;if(!visible||document.hidden)return;
 const dt=last?Math.min((now-last)/1000,1/30):1/60;last=now;let moving=false;
 for(const name of Object.keys(DEFAULT)){
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
 const next={...state.target,...values};makeModel(next);Object.assign(state.target,next);
 for(const [id,key] of [['px','x'],['pz','z'],['tilt','tilt']]){
  $('#'+id).value=state.target[key];$('#'+id+'-value').textContent=state.target[key].toLocaleString('ru-RU')+(key==='tilt'?'°':'');
 }
 if(instant||still.matches||!visible||document.hidden){Object.assign(state.current,state.target);draw();}else run();
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
$('#px').addEventListener('input',e=>setControls({x:+e.target.value}));
$('#pz').addEventListener('input',e=>setControls({z:+e.target.value}));
$('#tilt').addEventListener('input',e=>setControls({tilt:+e.target.value}));
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
window.trianglePlane={state,get model(){return model;},setStep,setView,setControls,setCamera,get cameraMetrics(){return{...cameraMetrics,meanMs:cameraMetrics.totalMs/Math.max(1,cameraMetrics.paints)};},get activity(){return{visible,frame,reduced:still.matches,pointers:pointers.size};}};
themeLabel();setControls(DEFAULT,true);setStep(0);
