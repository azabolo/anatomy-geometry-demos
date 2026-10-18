import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import * as k from './kit/iso-kit.mjs';
import {STEPS} from './model.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const pointLabels={P:'P',M:'M',K:'K',M1:'M₁',K1:'K₁'};
const nodes=prefix=>`<path id="${prefix}-whole" class="triangle-fill"/><path id="${prefix}-alpha" class="alpha-fill"/><path id="${prefix}-small" class="small-fill"/><path id="${prefix}-sides" class="triangle-line"/><path id="${prefix}-base" class="base-line"/><path id="${prefix}-trace" class="trace-line"/><path id="${prefix}-upper-side" class="upper-side"/><path id="${prefix}-section" class="section-line"/><path id="${prefix}-ratio-ticks" class="ratio-ticks"/><path id="${prefix}-parallel" class="parallel-mark"/><path id="${prefix}-angles" class="angle-mark"/><g id="${prefix}-points">${Object.entries(pointLabels).map(([name,label])=>`<g data-point="${name}"><circle r="3.7"/><text>${label}</text></g>`).join('')}</g><text id="${prefix}-length" class="length-label">MK = 18 см</text><text id="${prefix}-result" class="length-label answer-label">M₁K₁ = 7,5 см</text><text id="${prefix}-plane-name" class="plane-label">α</text>`;
const body=`
<header class="masthead" id="top">
 <h1><span>Подобие</span> Треугольник и плоскость</h1>
 <div class="header-actions"><a class="catalog-link" href="../">← Все задачи</a><button id="theme" type="button" class="quiet-button">Тёмная тема ◐</button></div>
</header>
<section class="problem" aria-label="Условие задачи">
 <p>Плоскость <i>α ∥ MK</i> пересекает стороны <i>MP</i> и <i>PK</i> треугольника <i>MKP</i> в точках <i>M₁</i> и <i>K₁</i>. Найдите <i>M₁K₁</i>, если <i>MP : M₁P = 12 : 5</i>, <i>MK = 18 см</i>.</p>
 <button type="button" id="show-answer">К ответу ↗</button>
</section>
<nav class="steps" aria-label="Шаги решения">${STEPS.map((s,i)=>`<button type="button" data-step="${i}" aria-pressed="${i===0}"><span>${i+1}</span>${s.short}</button>`).join('')}</nav>
<section class="workspace" aria-label="Визуальное решение">
 <div class="scene-column">
  <figure class="iso-plate" id="main-plate">
   <div class="plate-top"><span>Пространственная модель</span><span id="plate-step">ШАГ 1 / 6</span></div>
   <div id="orbit-stage" class="orbit-stage" tabindex="0" role="group" aria-label="Вращаемая трёхмерная модель. Перетаскивайте мышью или пальцем. Стрелки вращают, плюс и минус меняют масштаб, Home возвращает ракурс." aria-describedby="orbit-help">
    <svg id="scene" class="iso-svg" viewBox="0 0 800 560" role="img" aria-labelledby="scene-title scene-desc"><title id="scene-title">Треугольник PMK и плоскость α</title><desc id="scene-desc">M₁ и K₁ — точки пересечения сторон с плоскостью α. Переходите по шагам решения кнопкой «Дальше».</desc>${nodes('scene')}</svg>
   </div>
   <figcaption class="plate-bottom"><span id="scene-hint">Вращайте перетаскиванием · масштаб колёсиком</span><span id="scene-readout" data-readout>MK ∥ α</span></figcaption>
  </figure>
  <div class="model-controls">
   <div class="view-toolbar">
    <div class="view-presets" role="group" aria-label="Точка наблюдения"><button type="button" data-view="front" aria-pressed="true">Объёмный</button><button type="button" data-view="reverse" aria-pressed="false">Другой ракурс</button><button type="button" data-view="triangle" aria-pressed="false">Прямо на △</button></div>
    <div class="camera-actions"><div class="zoom-controls" role="group" aria-label="Масштаб модели"><button type="button" id="zoom-out" aria-label="Отдалить модель">−</button><output id="zoom-value">100%</output><button type="button" id="zoom-in" aria-label="Приблизить модель">+</button></div><button type="button" id="reset-view" title="Вернуть исходный ракурс">↺ Ракурс</button></div>
   </div>
   <div class="experiment" aria-labelledby="experiment-heading">
    <div class="experiment-heading"><h2 id="experiment-heading">Форма и плоскость</h2><button type="button" id="reset" class="quiet-button">↺ Сбросить</button></div>
    <div class="sliders"><label for="px"><span>Сдвиг P<output id="px-value">1</output></span><input id="px" type="range" min="-4" max="4" step=".1" value="1"></label><label for="pz"><span>Высота P<output id="pz-value">11</output></span><input id="pz" type="range" min="8" max="14" step=".1" value="11"></label><label for="tilt"><span>Наклон α<output id="tilt-value">0°</output></span><input id="tilt" type="range" min="-30" max="30" step="1" value="0"></label></div>
    <label id="plane-control"><input type="checkbox" id="show-plane" checked><i class="plane-key" aria-hidden="true"></i> Плоскость α</label>
   </div>
   <p id="orbit-help" class="sr-only">Вращение — перетаскиванием, масштаб — колёсиком или двумя пальцами. В фокусе модели стрелки вращают, Home возвращает ракурс; вне модели стрелки переключают шаги решения.</p>
  </div>
 </div>
 <div class="sidebar">
  <section class="explanation" aria-labelledby="step-title">
   <div class="step-heading"><p class="eyebrow" id="step-count">ШАГ 1 / 6</p><span id="step-category" class="sr-only">ДАНО</span><div class="navigation"><button type="button" id="previous-step" aria-label="Предыдущий шаг">←</button><button type="button" id="next-step">Дальше →</button></div></div>
   <h2 id="step-title"></h2><p id="step-copy"></p><div class="formula" id="step-formula"></div><div class="ratio-strip" id="ratio-strip" hidden><div class="ratio-caption"><span>PM₁ — 5 долей</span><span>PM — 12 долей</span></div><div class="ratio-bar" role="img" aria-label="Весь отрезок PM разделён на 12 равных долей. PM₁ занимает первые пять долей от P.">${Array.from({length:12},(_,i)=>`<i${i<5?' class="selected"':''}></i>`).join('')}</div></div><p class="step-hint" id="step-hint"></p>
  </section>
  <aside class="flat-panel" aria-labelledby="flat-heading"><div class="flat-header"><h2 id="flat-heading">Треугольник PMK</h2><span>без искажения</span></div><svg id="flat" viewBox="0 0 360 290" role="img" aria-label="Треугольники PMK и PM₁K₁">${nodes('flat')}</svg><div id="flat-fact" class="flat-fact">MK = 18 см</div><p id="flat-explanation" class="sr-only"></p><div class="answer-box" id="answer-box" hidden>Ответ: <strong>M₁K₁ = 7,5 см</strong></div></aside>
 </div>
</section>
<details class="written-solution" id="written-solution"><summary>Полное решение для тетради <span aria-hidden="true">＋</span></summary><div><p>Пусть <i>β</i> — плоскость треугольника <i>PMK</i>. Поскольку точки <i>M₁</i> и <i>K₁</i> лежат в обеих плоскостях, прямая <i>M₁K₁</i> является линией пересечения <i>α</i> и <i>β</i>. При этом <i>MK ⊂ β</i> и <i>MK ∥ α</i>, поэтому <i>M₁K₁ ∥ MK</i>. Действительно, иначе их общая точка была бы точкой пересечения <i>MK</i> с плоскостью <i>α</i>, что невозможно.</p><p>Из параллельности <i>M₁K₁</i> и <i>MK</i> следуют равенства соответствующих углов. Значит, <i>△PM₁K₁ ∼ △PMK</i> по двум углам. Соответственно, <i>M₁K₁ / MK = PM₁ / PM</i>.</p><p>По условию <i>MP : M₁P = 12 : 5</i>. Следовательно, <i>PM₁ / PM = 5/12</i>, и <i>M₁K₁ = 18 · 5/12 = 7,5 см</i>. Числа 12 и 5 задают отношение длин, а не сами длины в сантиметрах.</p><p class="written-answer">Ответ: <i>7,5 см</i>.</p></div></details>
<p id="announcement" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p>`;
function inline(file,name,bindings=''){
 const source=readFileSync(join(here,file),'utf8'),names=[...source.matchAll(/^export\s+(?:const|function|class)\s+(\w+)/gm)].map(m=>m[1]);
 return `const ${name}=(()=>{${bindings}\n${source.replace(/^import[^\n]*\n/gm,'').replace(/^export\s+/gm,'')}\nreturn {${names.join(',')}};})();\n`;
}
const script=inline('kit/iso-kit.mjs','IsoKit')+inline('model.mjs','TaskModel')+inline('camera.mjs','OrbitCamera','const k=IsoKit;')+readFileSync(join(here,'live.mjs'),'utf8');
const css=readFileSync(join(here,'style.css'),'utf8');
for(const theme of ['light','dark'])writeFileSync(join(here,theme==='light'?'index.html':'dark.html'),k.pageHtml({title:'Треугольник и параллельная плоскость — подобие',theme,body,script,width:1480}).replace('<html lang="en">','<html lang="ru">').replace('</style>',css+'\n</style>'));
console.log('Built triangle-plane: compact standalone light and dark pages, no stand');
