import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import * as k from './kit/iso-kit.mjs';
import {STEPS} from './model.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const nodes=prefix=>`<path id="${prefix}-triangle" class="triangle-fill"/><path id="${prefix}-alpha" class="alpha-fill"/><path id="${prefix}-trap" class="trap-line"/><path id="${prefix}-ad" class="base-line"/><path id="${prefix}-triangle-line" class="triangle-line"/><path id="${prefix}-bc" class="base-line"/><path id="${prefix}-kh" class="midline"/><path id="${prefix}-ticks-bm" class="equal-mark"/><path id="${prefix}-ticks-mc" class="equal-mark"/><path id="${prefix}-parallel" class="parallel-mark"/><g id="${prefix}-points">${['A','B','C','D','M','K','H'].map(n=>`<g data-point="${n}"><circle r="3.7"/><text>${n}</text></g>`).join('')}</g><text id="${prefix}-length" class="length-label">BC = 12 см</text><text id="${prefix}-result" class="length-label answer-label">KH = 6 см</text><text id="${prefix}-plane-name" class="plane-label">(ADK)</text>`;
const body=`
<header class="masthead" id="top">
 <h1><span>Задача 29</span> Трапеция и плоскость</h1>
 <div class="header-actions"><a class="catalog-link" href="../">← Все задачи</a><button id="theme" type="button" class="quiet-button">Тёмная тема ◐</button></div>
</header>
<section class="problem" aria-label="Условие задачи">
 <p><i>AD ∥ BC</i>, <i>BC = 12 см</i>. <i>M</i> — вне плоскости трапеции <i>ABCD</i>, <i>K</i> — середина <i>BM</i>. Докажите, что плоскость <i>ADK</i> пересекает <i>MC</i> в точке <i>H</i>, и найдите <i>KH</i>.</p>
 <button type="button" id="show-answer">К ответу ↗</button>
</section>
<nav class="steps" aria-label="Шаги решения">${STEPS.map((s,i)=>`<button type="button" data-step="${i}" aria-pressed="${i===0}"><span>${i+1}</span>${s.short}</button>`).join('')}</nav>
<section class="workspace" aria-label="Визуальное решение">
 <div class="scene-column">
  <figure class="iso-plate" id="main-plate">
   <div class="plate-top"><span>Пространственная модель</span><span id="plate-step">ШАГ 1 / 6</span></div>
   <div id="orbit-stage" class="orbit-stage" tabindex="0" role="group" aria-label="Вращаемая трёхмерная модель. Перетаскивайте мышью или пальцем. Стрелки вращают, плюс и минус меняют масштаб, Home возвращает ракурс." aria-describedby="orbit-help">
    <svg id="scene" class="iso-svg" viewBox="0 0 800 560" role="img" aria-labelledby="scene-title scene-desc"><title id="scene-title">Трапеция ABCD и треугольник MBC</title><desc id="scene-desc">K — середина BM. Переходите по шагам решения кнопкой «Дальше».</desc>${nodes('scene')}</svg>
   </div>
   <figcaption class="plate-bottom"><span id="scene-hint">Вращайте перетаскиванием · масштаб колёсиком</span><span id="scene-readout" data-readout>BK = KM</span></figcaption>
  </figure>
  <div class="model-controls">
   <div class="view-toolbar">
    <div class="view-presets" role="group" aria-label="Точка наблюдения"><button type="button" data-view="front" aria-pressed="true">Объёмный</button><button type="button" data-view="reverse" aria-pressed="false">Другой ракурс</button><button type="button" data-view="triangle" aria-pressed="false">Прямо на MBC</button></div>
    <div class="camera-actions"><div class="zoom-controls" role="group" aria-label="Масштаб модели"><button type="button" id="zoom-out" aria-label="Отдалить модель">−</button><output id="zoom-value">100%</output><button type="button" id="zoom-in" aria-label="Приблизить модель">+</button></div><button type="button" id="reset-view" title="Вернуть исходный ракурс">↺ Ракурс</button></div>
   </div>
   <div class="experiment" aria-labelledby="experiment-heading">
    <div class="experiment-heading"><h2 id="experiment-heading">Положение M</h2><button type="button" id="reset" class="quiet-button">↺ Сбросить</button></div>
    <div class="sliders"><label for="mx"><span>Влево / вправо<output id="mx-value">1</output></span><input id="mx" type="range" min="-4" max="4" step=".1" value="1"></label><label for="mz"><span>Высота<output id="mz-value">11</output></span><input id="mz" type="range" min="4" max="14" step=".1" value="11"></label></div>
    <label id="plane-control"><input type="checkbox" id="show-plane" checked><i class="plane-key" aria-hidden="true"></i> Плоскость ADK</label>
   </div>
   <p id="orbit-help" class="sr-only">Вращение — перетаскиванием, масштаб — колёсиком или двумя пальцами. В фокусе модели стрелки вращают, Home возвращает ракурс; вне модели стрелки переключают шаги решения.</p>
  </div>
 </div>
 <div class="sidebar">
  <section class="explanation" aria-labelledby="step-title">
   <div class="step-heading"><p class="eyebrow" id="step-count">ШАГ 1 / 6</p><span id="step-category" class="sr-only">ДАНО</span><div class="navigation"><button type="button" id="previous-step" aria-label="Предыдущий шаг">←</button><button type="button" id="next-step">Дальше →</button></div></div>
   <h2 id="step-title"></h2><p id="step-copy"></p><div class="formula" id="step-formula"></div><p class="step-hint" id="step-hint"></p>
  </section>
  <aside class="flat-panel" aria-labelledby="flat-heading"><div class="flat-header"><h2 id="flat-heading">Треугольник MBC</h2><span>без искажения</span></div><svg id="flat" viewBox="0 0 360 290" role="img" aria-label="Треугольник MBC и его средняя линия KH">${nodes('flat')}</svg><div id="flat-fact" class="flat-fact">K — середина BM</div><p id="flat-explanation" class="sr-only"></p><div class="answer-box" id="answer-box" hidden>Ответ: <strong>KH = 6 см</strong></div></aside>
 </div>
</section>
<details class="written-solution" id="written-solution"><summary>Полное решение для тетради <span aria-hidden="true">＋</span></summary><div><p>Обозначим середину отрезка <i>MC</i> буквой <i>H</i>. В треугольнике <i>MBC</i> точки <i>K</i> и <i>H</i> — середины сторон <i>MB</i> и <i>MC</i>, поэтому <i>KH</i> — средняя линия. Следовательно, <i>KH ∥ BC</i> и <i>KH = ½BC</i>.</p><p>Так как <i>AD ∥ BC</i>, то <i>KH ∥ AD</i>. Плоскость <i>ADK</i> содержит прямую <i>AD</i> и точку <i>K</i>, поэтому содержит прямую, проходящую через <i>K</i> параллельно <i>AD</i>. Значит, <i>KH ⊂ (ADK)</i>, а <i>H ∈ (ADK)</i>.</p><p>По построению <i>H</i> лежит внутри <i>MC</i>. При этом <i>C ∉ (ADK)</i>: две различные плоскости <i>ABCD</i> и <i>ADK</i> пересекаются по <i>AD</i>, а <i>C ∉ AD</i>. Следовательно, <i>H</i> — единственная точка пересечения отрезка <i>MC</i> с плоскостью <i>ADK</i>.</p><p class="written-answer">Ответ: <i>KH = 12 : 2 = 6 см</i>.</p></div></details>
<p id="announcement" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p>`;
function inline(file,name,bindings=''){
 const source=readFileSync(join(here,file),'utf8'),names=[...source.matchAll(/^export\s+(?:const|function|class)\s+(\w+)/gm)].map(m=>m[1]);
 return `const ${name}=(()=>{${bindings}\n${source.replace(/^import[^\n]*\n/gm,'').replace(/^export\s+/gm,'')}\nreturn {${names.join(',')}};})();\n`;
}
const script=inline('kit/iso-kit.mjs','IsoKit')+inline('model.mjs','TaskModel')+inline('camera.mjs','OrbitCamera','const k=IsoKit;')+readFileSync(join(here,'live.mjs'),'utf8');
const css=readFileSync(join(here,'style.css'),'utf8');
for(const theme of ['light','dark'])writeFileSync(join(here,theme==='light'?'index.html':'dark.html'),k.pageHtml({title:'Задача 29 — трапеция, плоскость и средняя линия',theme,body,script,width:1480}).replace('<html lang="en">','<html lang="ru">').replace('</style>',css+'\n</style>').replace('</head>','<link rel="icon" type="image/svg+xml" href="../favicon.svg"></head>'));
console.log('Built task29: compact standalone light and dark pages, no stand');
