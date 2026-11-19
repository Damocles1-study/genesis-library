(function(){
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const CN = n => { // 阿拉伯数字转中文读法（< 1000）
  const d = '零一二三四五六七八九';
  if (n < 10) return d[n];
  if (n < 20) return '十' + (n % 10 ? d[n % 10] : '');
  if (n < 100) return d[Math.floor(n / 10)] + '十' + (n % 10 ? d[n % 10] : '');
  const h = Math.floor(n / 100), r = n % 100;
  return d[h] + '百' + (r === 0 ? '' : r < 10 ? '零' + d[r] : (r < 20 ? '一' : '') + CN(r));
};

/* ---------- 页眉：卷名、进度、目录 ---------- */
const barVol = $('#barVol'), prog = $('#prog');
const vols = $$('[data-vol]');
let tick = false;
function onScroll(){
  tick = false;
  const lim = innerHeight * 0.35; let cur = null;
  for (const e of vols) { if (e.getBoundingClientRect().top < lim) cur = e; else break; }
  barVol.textContent = cur ? cur.dataset.vol : '序';
  const H = document.documentElement.scrollHeight - innerHeight;
  prog.style.width = (H > 0 ? scrollY / H * 100 : 0) + '%';
}
window.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, {passive: true});
onScroll();
const drawer = $('#drawer');
$('#drawerList').innerHTML = $$('#toc a').map(a => '<li><a href="' + a.getAttribute('href') + '"><span class="n">' + $('.n', a).textContent + '</span><span>' + $('.t', a).innerHTML + '</span></a></li>').join('');
function openD(on){ drawer.classList.toggle('on', on); drawer.setAttribute('aria-hidden', on ? 'false' : 'true'); }
$('#tocBtn').addEventListener('click', () => openD(true));
drawer.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target.closest('a')) openD(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') openD(false); });
const toTop = $('#toTop'); if (toTop) toTop.addEventListener('click', e => { e.preventDefault(); scrollTo({top: 0, behavior: 'smooth'}); });

/* ---------- 苇城符号：每个画在 40×40 的格子里 ----------
   压出来的（数字、印章）用深泥色填充；刻出来的（图形）用墨线。 */
const IMP = ' fill="var(--clay-d)" opacity=".88"';
const INC = (w) => ' fill="none" stroke="var(--ink-2)" stroke-width="' + (w || 2.4) + '" stroke-linecap="round" stroke-linejoin="round"';
const SIG = {
  n1: '<path d="M20,9 q4.5,0 4.5,6 v10 q0,6 -4.5,6 q-4.5,0 -4.5,-6 v-10 q0,-6 4.5,-6 Z"' + IMP + '/>',
  n10: '<circle cx="20" cy="20" r="7"' + IMP + '/>',
  n60: '<path d="M20,4 q8,0 8,9 v14 q0,9 -8,9 q-8,0 -8,-9 v-14 q0,-9 8,-9 Z"' + IMP + '/><path d="M20,9 q3,0 3,5 v12 q0,5 -3,5" fill="none" stroke="var(--paper)" stroke-width="1.2" opacity=".35"/>',
  sheep: '<circle cx="20" cy="20" r="12"' + INC() + '/><path d="M20,8 V32 M8,20 H32"' + INC() + '/>',
  barley: '<path d="M20,35 V6 M20,11 l-6,-4 M20,11 l6,-4 M20,18 l-7,-4 M20,18 l7,-4 M20,25 l-7,-4 M20,25 l7,-4"' + INC() + '/>',
  beer: '<path d="M13,7 H27 L25,12 Q31,20 25,29 L20,35 L15,29 Q9,20 15,12 Z"' + INC() + '/><path d="M14,17 H26 M13.5,22 H26.5"' + INC(1.6) + '/>',
  oil: '<path d="M16,6 H24 V11 Q32,15 30,24 Q28,33 20,33 Q12,33 10,24 Q8,15 16,11 Z"' + INC() + '/><path d="M12,21 H28"' + INC(1.6) + '/>',
  bread: '<path d="M7,13 H33 L27,30 H13 Z"' + INC() + '/><path d="M9,17 H31"' + INC(1.4) + '/>',
  cloth: '<path d="M9,9 H31 V27 H9 Z"' + INC() + '/><path d="M12,27 v6 M17,27 v6 M22,27 v6 M27,27 v6 M9,15 H31 M9,21 H31"' + INC(1.5) + '/>',
  person: '<circle cx="20" cy="9" r="4"' + INC(2) + '/><path d="M20,13 V25 M13,18 H27 M20,25 L14,34 M20,25 L26,34"' + INC(2) + '/>',
  water: '<path d="M6,15 q3.5,-5 7,0 t7,0 t7,0 t7,0 M6,25 q3.5,-5 7,0 t7,0 t7,0 t7,0"' + INC() + '/>',
  sprout: '<path d="M20,35 V14 M20,22 Q10,20 9,10 Q18,11 20,20 M20,18 Q29,15 31,6 Q22,7 20,16"' + INC(2.1) + '/>',
  star: '<path d="M20,6 V34 M6,20 H34 M10,10 L30,30 M30,10 L10,30"' + INC(2.2) + '/>'
};
// 印章：滚出来的一条带子
function seal(motif){ return '<rect x="3" y="9" width="34" height="22" rx="2" fill="var(--clay)" opacity=".35"/><path d="M3,11 H37 M3,29 H37"' + INC(1.2) + '/><g transform="translate(6,13) scale(.35)">' + SIG[motif] + '</g><g transform="translate(20,13) scale(.35)">' + SIG[motif] + '</g>'; }
SIG.sAmu = seal('sheep'); SIG.sMai = seal('beer'); SIG.sTemple = seal('star');
const sv = (k, cls) => '<svg viewBox="0 0 40 40" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : '') + '>' + SIG[k] + '</svg>';
const tile = (k, x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' + SIG[k] + '</g>';
function tabletBg(w, h){ return '<rect x="4" y="4" width="' + (w - 8) + '" height="' + (h - 8) + '" rx="34" fill="var(--clay-2)" stroke="var(--clay)" stroke-width="2"/><rect x="10" y="' + (h - 18) + '" width="' + (w - 20) + '" height="8" rx="4" fill="var(--clay)" opacity=".18"/>'; }

/* ---------- 封面泥板 ---------- */
(function(){
  const s = $('#coverTab'); if (!s) return;
  let h = tabletBg(300, 230);
  h += '<path d="M60,30 H240 M60,104 H240 M60,160 H240" stroke="var(--clay)" stroke-width="1.2" opacity=".6"/>';
  h += tile('n10', 64, 50, 1.3); for (let i = 0; i < 5; i++) h += tile('n1', 112 + i * 26, 50, 1.3);
  h += tile('sheep', 120, 106, 1.3);
  h += tile('person', 84, 164, 1.2) + tile('water', 128, 164, 1.2) + tile('sprout', 172, 164, 1.2);
  h += '<path d="M248,40 l10,22 l-6,10 M40,150 l14,8" stroke="var(--clay)" stroke-width="1.4" fill="none" opacity=".7"/>';
  s.innerHTML = h;
})();

/* ---------- 装置 1：封一只泥球 ---------- */
(function(){
  const svg = $('#bullaSvg'); if (!svg) return;
  const ctl = $('#bullaCtl'), stepsEl = $('#bullaSteps');
  const TOK = {
    sheep: {n: '羊（扁圆片带十字）', g: (x, y, imp) => imp ? '<circle cx="' + x + '" cy="' + y + '" r="9" fill="var(--clay-d)" opacity=".8"/><path d="M' + x + ',' + (y - 7) + ' v14 M' + (x - 7) + ',' + y + ' h14" stroke="var(--clay-2)" stroke-width="2"/>' : '<circle cx="' + x + '" cy="' + y + '" r="9" fill="var(--card)" stroke="var(--ink-2)" stroke-width="2"/><path d="M' + x + ',' + (y - 7) + ' v14 M' + (x - 7) + ',' + y + ' h14" stroke="var(--ink-2)" stroke-width="1.8"/>'},
    oil: {n: '油（卵形带刻线）', g: (x, y, imp) => imp ? '<ellipse cx="' + x + '" cy="' + y + '" rx="6.5" ry="9.5" fill="var(--clay-d)" opacity=".8"/><path d="M' + (x - 6) + ',' + y + ' h12" stroke="var(--clay-2)" stroke-width="2"/>' : '<ellipse cx="' + x + '" cy="' + y + '" rx="6.5" ry="9.5" fill="var(--card)" stroke="var(--ink-2)" stroke-width="2"/><path d="M' + (x - 6) + ',' + y + ' h12" stroke="var(--ink-2)" stroke-width="1.8"/>'},
    cone: {n: '一小筐麦（圆锥）', g: (x, y, imp) => '<path d="M' + x + ',' + (y - 10) + ' l8,18 h-16 Z" fill="' + (imp ? 'var(--clay-d)' : 'var(--card)') + '" ' + (imp ? 'opacity=".8"' : 'stroke="var(--ink-2)" stroke-width="2" stroke-linejoin="round"') + '/>'},
    ball: {n: '一大筐麦（圆球）', g: (x, y, imp) => '<circle cx="' + x + '" cy="' + y + '" r="8" fill="' + (imp ? 'var(--clay-d)' : 'var(--card)') + '" ' + (imp ? 'opacity=".8"' : 'stroke="var(--ink-2)" stroke-width="2"') + '/>' + (imp ? '' : '<circle cx="' + (x - 3) + '" cy="' + (y - 3) + '" r="2" fill="var(--ink-3)" opacity=".4"/>')}
  };
  const STEPS = ['放泥丸', '封口', '上路', '到神庙', '压扁'];
  let st;
  function reset(){ st = {sheep: ri(5, 9), oil: ri(1, 3), inside: [], stage: 0, marked: false, broken: false, flat: false, tries: (st ? st.tries : 0)}; draw(); }
  function cnt(k){ return st.inside.filter(t => t === k).length; }
  function steps(){ stepsEl.innerHTML = STEPS.map((s, i) => '<span class="' + (i < st.stage ? 'done' : i === st.stage ? 'on' : '') + '">' + s + '</span>').join(''); }
  function drawSvg(){
    const cx = 160, cy = 150, R = 110;
    let h = '';
    const pos = st.inside.map((t, i) => { const a = i * 2.4, r = 18 + 10 * Math.sqrt(i); return [cx + Math.cos(a) * r * 1.15, cy + Math.sin(a) * r]; });
    if (st.flat) {
      h += '<rect x="30" y="70" width="260" height="160" rx="40" fill="var(--clay-2)" stroke="var(--clay)" stroke-width="2"/>';
      st.inside.forEach((t, i) => { const x = 66 + (i % 8) * 27, y = 110 + Math.floor(i / 8) * 34; h += TOK[t].g(x, y, true); });
      h += '<text x="160" y="258" text-anchor="middle" font-size="13" fill="var(--ink-3)">没有球，没有里面，只有印子：一块泥板</text>';
    } else if (st.broken) {
      const zz = ' L' + (cx + 8) + ',' + (cy + 66) + ' L' + (cx - 7) + ',' + (cy + 22) + ' L' + (cx + 9) + ',' + (cy - 18) + ' L' + (cx - 6) + ',' + (cy - 62) + ' Z';
      h += '<path d="M' + cx + ',' + (cy - R) + ' A' + R + ',' + R + ' 0 0 0 ' + cx + ',' + (cy + R) + zz + '" fill="var(--clay-2)" stroke="var(--clay)" stroke-width="2" transform="translate(-20,-14) rotate(-6 ' + cx + ' ' + cy + ')"/>';
      h += '<path d="M' + cx + ',' + (cy - R) + ' A' + R + ',' + R + ' 0 0 1 ' + cx + ',' + (cy + R) + zz + '" fill="var(--clay-2)" stroke="var(--clay)" stroke-width="2" transform="translate(20,-14) rotate(6 ' + cx + ' ' + cy + ')"/>';
      st.inside.forEach((t, i) => h += TOK[t].g(70 + (i % 9) * 22, 272 - Math.floor(i / 9) * 22, false));
    } else {
      const sealed = st.stage >= 1;
      h += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="' + (sealed ? 'var(--clay-2)' : 'var(--paper-2)') + '" stroke="var(--clay)" stroke-width="' + (sealed ? 3 : 2) + '"' + (sealed ? '' : ' stroke-dasharray="8 6"') + '/>';
      if (!sealed) {
        st.inside.forEach((t, i) => h += TOK[t].g(pos[i][0], pos[i][1], false));
        if (!st.inside.length) h += '<text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="14" fill="var(--ink-3)">空心泥球（还没封口）</text>';
      } else {
        // 滚印的带子
        h += '<path d="M' + (cx - R + 8) + ',' + (cy - 20) + ' Q' + cx + ',' + (cy - 34) + ' ' + (cx + R - 8) + ',' + (cy - 20) + ' M' + (cx - R + 8) + ',' + (cy + 4) + ' Q' + cx + ',' + (cy - 10) + ' ' + (cx + R - 8) + ',' + (cy + 4) + '" fill="none" stroke="var(--clay)" stroke-width="1.5"/>';
        for (let i = 0; i < 7; i++) { const x = cx - 78 + i * 26; h += '<path d="M' + x + ',' + (cy - 4) + ' l5,-14 l5,14 M' + (x + 14) + ',' + (cy - 14) + ' a3,3 0 1 0 0.1,0" fill="none" stroke="var(--clay-d)" stroke-width="1.6" opacity=".7"/>'; }
        h += '<text x="' + cx + '" y="' + (cy - 42) + '" text-anchor="middle" font-size="12" fill="var(--ink-3)">阿穆的印</text>';
        if (st.marked) {
          const cap = [7, 6, 4], rows = []; let rest = st.inside.slice();
          cap.forEach(c => { if (rest.length) { rows.push(rest.slice(0, c)); rest = rest.slice(c); } });
          rows.forEach((row, r) => row.forEach((t, i) => h += TOK[t].g(cx + (i - (row.length - 1) / 2) * 24, cy + 36 + r * 25, true)));
        }
        else h += '<text x="' + cx + '" y="' + (cy + 56) + '" text-anchor="middle" font-size="13" fill="var(--ink-3)">外面什么也看不出来</text>';
      }
    }
    svg.innerHTML = h;
  }
  function say(who, txt, cls){ return '<div class="say' + (cls ? ' ' + cls : '') + '"><b>' + who + '</b>' + txt + '</div>'; }
  function draw(){
    steps(); drawSvg();
    let h = '';
    if (st.stage === 0) {
      h += '<p class="readout">这回要交：<b>羊 ' + st.sheep + ' 只、油 ' + st.oil + ' 罐</b>。每样东西放一个对应的泥丸。</p>';
      h += '<div class="tokbar">' + Object.keys(TOK).map(k => '<button data-t="' + k + '"><svg viewBox="0 0 30 30">' + TOK[k].g(15, 15, false) + '</svg>' + TOK[k].n.split('（')[0] + '</button>').join('') + '</div>';
      h += '<p class="readout">球里：羊 <b>' + cnt('sheep') + '</b> · 油 <b>' + cnt('oil') + '</b>' + (cnt('cone') + cnt('ball') ? ' · 麦 <b>' + (cnt('cone') + cnt('ball')) + '</b>' : '') + '</p>';
      h += '<div class="btns"><button class="btn" data-a="undo">拿出一个</button><button class="btn pri" data-a="seal0">直接封口</button><button class="btn red" data-a="seal1">先在外面按印，再封口</button></div>';
      h += '<div id="bMsg"></div>';
    } else if (st.stage === 1) {
      h += say('阿穆', st.marked ? '外面按了' + st.inside.length + '个印，里面封了' + st.inside.length + '个泥丸。滚上我的印，晾干了。' : '封好了，滚上我的印，晾干了。里面装了什么，现在谁也看不见了。');
      h += '<div class="btns"><button class="btn pri" data-a="go">交给伙计，上路</button></div>';
    } else if (st.stage === 2) {
      h += say('旁白', '三天的路。伙计赶着' + st.sheep + '只羊、背着' + st.oil + '罐油，揣着泥球。路过一个村子时，他在一户人家门口停了很久。');
      h += '<div class="btns"><button class="btn pri" data-a="arrive">三天后，神庙</button></div>';
    } else if (st.stage === 3 && !st.broken && !st.looked) {
      h += say('老秤', '羊圈里数了，' + (st.sheep - 1) + '只羊，' + st.oil + '罐油。泥球呢？', 'bad');
      h += '<div class="btns">' + (st.marked ? '<button class="btn pri" data-a="look">先看外面的印</button>' : '') + '<button class="btn' + (st.marked ? '' : ' pri') + '" data-a="break">敲开泥球</button></div>';
    } else if (st.stage === 3) {
      if (st.looked && !st.broken) {
        h += say('老秤', '外面印着' + cnt('sheep') + '只羊、' + cnt('oil') + '罐油，人人都看见了。羊少一只。', 'ok');
        h += say('伙计', '……我赔。');
        h += '<p class="readout">泥球不用敲，原封不动放进库房，当凭证存着。以后谁有疑问，再当众敲开对一对。</p>';
        h += '<div class="btns"><button class="btn red" data-a="flatq">这时，小芦开口了……</button></div>';
      } else if (st.broken && !st.marked) {
        h += say('老秤', '里面' + cnt('sheep') + '个羊片，' + cnt('oil') + '个油丸。羊少了一只。', 'bad');
        h += say('伙计', '谁知道是不是你们神庙的人敲开以后又塞进去一个？');
        h += '<p class="readout">泥球已经碎了，谁也证明不了它碎之前装着几个片。这就是苇城那场架。<b>再试一次，这回封口之前先在外面按印。</b></p>';
        h += '<div class="btns"><button class="btn pri" data-a="reset">再封一只</button></div>';
      } else {
        h += say('老秤', '外面' + cnt('sheep') + '个印，里面' + cnt('sheep') + '个片，一模一样。羊少一只，伙计赔。', 'ok');
        h += '<p class="readout">对得上。不过，其实外面的印已经够说明问题了，这一敲，凭证也没了。</p>';
        h += '<div class="btns"><button class="btn red" data-a="flatq">这时，小芦开口了……</button></div>';
      }
    } else if (st.stage === 4 && !st.flat) {
      h += say('小芦', '外面都按上了，里面那些泥丸子还有什么用？你们每回看的都是外面的印啊。那还捏个球干嘛？捏块饼不就行了。');
      h += '<div class="btns"><button class="btn red" data-a="flat">把泥球压扁</button></div>';
    } else {
      h += say('林记', '那孩子刚刚做了一块泥板。', 'ok');
      h += '<p class="readout">在我们的世界，这一步大约发生在公元前 3500 到前 3300 年之间：先是外面按了印的空心泥球，然后是只有压印、没有里面的扁平泥板。</p>';
      h += '<div class="btns"><button class="btn" data-a="reset">从头再来</button></div>';
    }
    ctl.innerHTML = h;
  }
  ctl.addEventListener('click', e => {
    const t = e.target.closest('[data-t]'), a = e.target.closest('[data-a]');
    if (t && st.stage === 0) { if (st.inside.length < 16) st.inside.push(t.dataset.t); draw(); return; }
    if (!a) return;
    const k = a.dataset.a;
    if (k === 'undo') { st.inside.pop(); draw(); }
    else if (k === 'seal0' || k === 'seal1') {
      if (cnt('sheep') !== st.sheep || cnt('oil') !== st.oil || cnt('cone') + cnt('ball')) {
        $('#bMsg').innerHTML = say('阿穆', (cnt('cone') + cnt('ball') ? '这回不交麦，把麦丸拿出来。' : '不对。我要交' + st.sheep + '只羊、' + st.oil + '罐油，你放了' + cnt('sheep') + '个羊片、' + cnt('oil') + '个油丸。'), 'bad');
        return;
      }
      st.marked = k === 'seal1'; st.stage = 1; draw();
    }
    else if (k === 'go') { st.stage = 2; draw(); }
    else if (k === 'arrive') { st.stage = 3; draw(); }
    else if (k === 'look') { st.looked = true; draw(); }
    else if (k === 'break') { st.broken = true; draw(); }
    else if (k === 'flatq') { st.stage = 4; st.broken = false; draw(); }
    else if (k === 'flat') { st.flat = true; draw(); }
    else if (k === 'reset') reset();
  });
  reset();
})();

/* ---------- 装置 2：写一张收据 ---------- */
(function(){
  const tab = $('#rcptTab'); if (!tab) return;
  const THING = {sheep: ['羊', '只'], barley: ['麦', '筐'], beer: ['酒', '罐'], oil: ['油', '罐'], bread: ['口粮', '份'], cloth: ['布', '匹']};
  const WHO = {sAmu: '阿穆', sMai: '麦娘', sTemple: '神庙'};
  const ORD = [['sAmu', 'sheep', 20, 179, '交来'], ['sMai', 'beer', 4, 48, '交来'], ['sTemple', 'bread', 30, 200, '发出'], ['sAmu', 'cloth', 3, 25, '交来'], ['sMai', 'barley', 10, 90, '交来'], ['sTemple', 'oil', 5, 70, '发出'], ['sAmu', 'sheep', 60, 179, '交来']];
  let ord, on = [], oi = -1, done = false;
  const pads = {rcptNum: ['n1', 'n10', 'n60'], rcptThing: Object.keys(THING), rcptWho: Object.keys(WHO)};
  const label = {n1: '1', n10: '10', n60: '60', sAmu: '阿穆的印', sMai: '麦娘的印', sTemple: '神庙的印'};
  Object.entries(pads).forEach(([id, ks]) => { $('#' + id).innerHTML = ks.map(k => '<button data-k="' + k + '" aria-label="' + (label[k] || THING[k][0]) + '">' + sv(k) + '<span>' + (label[k] || THING[k][0]) + '</span></button>').join(''); });
  function next(){
    oi = (oi + 1) % ORD.length; const o = ORD[oi];
    ord = {who: o[0], thing: o[1], n: ri(o[2], o[3]), verb: o[4]}; on = []; done = false;
    $('#rcptOrder').innerHTML = '今天的账：<b>' + WHO[ord.who] + '</b>' + ord.verb + '<b>' + THING[ord.thing][0] + ' ' + ord.n + ' ' + THING[ord.thing][1] + '</b>。';
    $('#rcptSay').innerHTML = '<b>老秤</b>写好了拿来。'; $('#rcptSay').className = 'say';
    draw();
  }
  function draw(){
    tab.innerHTML = on.length ? on.map(k => sv(k)).join('') : '<span style="color:var(--ink-3);font-size:14px;padding:8px">一块湿泥板。点下面的符号往上写。</span>';
    $('#rcptStat').textContent = '已写 ' + on.length + ' 个符号';
  }
  function minN(n){ return Math.floor(n / 60) + Math.floor(n % 60 / 10) + n % 10; }
  function read(){
    const n = on.reduce((s, k) => s + (k === 'n1' ? 1 : k === 'n10' ? 10 : k === 'n60' ? 60 : 0), 0);
    const th = [...new Set(on.filter(k => THING[k]))], wh = [...new Set(on.filter(k => WHO[k]))];
    const S = $('#rcptSay'); let t, ok = false;
    if (!on.length) t = '空的。你让我念什么？';
    else if (th.length > 1) t = '这是' + th.map(k => THING[k][0]).join('还是') + '？一块泥板，记一笔账。';
    else if (!th.length) t = n ? CN(n % 1000) + '……什么？你见过一个光秃秃的“' + CN(n % 1000) + '”吗？' : '只有一个印，没写东西也没写数。';
    else if (!n) t = '你画了' + THING[th[0]][0] + '，可没写几' + THING[th[0]][1] + '。一' + THING[th[0]][1] + '？';
    else if (!wh.length) t = THING[th[0]][0] + '，' + CN(n) + THING[th[0]][1] + '。谁的？没写谁，到年底谁也不认。';
    else if (wh.length > 1) t = '到底是' + wh.map(k => WHO[k]).join('还是') + '？一笔账只能有一个户头。';
    else {
      const rd = '我念：<b>' + THING[th[0]][0] + '，' + CN(n) + THING[th[0]][1] + '，' + WHO[wh[0]] + '</b>。';
      if (n !== ord.n || th[0] !== ord.thing || wh[0] !== ord.who) t = rd + '跟账对不上。';
      else {
        ok = true;
        const m = minN(n), used = on.filter(k => k[0] === 'n').length;
        t = rd + '对上了。' + (used > m ? '不过你压了' + used + '个数字印，其实' + m + '个就够：十个小竖印换一个小圆印，六个小圆印换一个大竖印。' : '');
        if (ord.thing === 'barley') t += '（麦子按理该用量麦的那一套数法，今天先饶了你。）';
        t += '<br><span style="font-size:13.5px;color:var(--ink-3)">你用了 ' + on.length + ' 个符号。老办法一' + THING[ord.thing][1] + '按一个印，要按 ' + ord.n + ' 下。</span>';
      }
    }
    S.innerHTML = '<b>老秤</b>' + t; S.className = 'say ' + (ok ? 'ok' : 'bad'); done = ok;
  }
  $('#rcptFig').addEventListener('click', e => {
    const b = e.target.closest('.pad button');
    if (b) { if (done) { on = []; done = false; } if (on.length < 36) on.push(b.dataset.k); draw(); }
  });
  $('#rcptUndo').addEventListener('click', () => { on.pop(); draw(); });
  $('#rcptRead').addEventListener('click', read);
  $('#rcptNext').addEventListener('click', next);
  $('#rcptOld').addEventListener('click', () => {
    const k = ord.thing, show = Math.min(ord.n, 36);
    tab.innerHTML = Array(show).fill(sv(k)).join('') + (ord.n > show ? '<span style="align-self:center;font-size:14px;color:var(--ink-2);padding:0 6px">……还差 ' + (ord.n - show) + ' 个，泥板满了</span>' : '');
    $('#rcptStat').textContent = '老办法：' + ord.n + ' 个印，还没写是谁的';
    const S = $('#rcptSay'); S.className = 'say bad'; S.innerHTML = '<b>小芦</b>这就是我新年祭那天干的事。大拇指磨出了泡。';
    on = []; done = true;
  });
  next();
})();

/* ---------- 装置 3：谐音画谜 ---------- */
(function(){
  const box = $('#rebusBox'); if (!box) return;
  const Q = [
    {p: [['🦇', '蝙蝠'], ['🦌', '鹿'], ['🍑', '寿桃']], o: ['福禄寿', '飞来横财', '长命百岁', '金玉满堂'], a: 0, x: '蝠＝福，鹿＝禄，都是借音。寿桃不是谐音，是“长寿”的象征，画谜里常常借音和象征混着用。'},
    {p: [['🪷', '莲花'], ['🐟', '鱼']], o: ['如鱼得水', '连年有余', '出淤泥而不染', '鱼跃龙门'], a: 1, x: '莲＝连，鱼＝余：连年有余。年画里抱着鲤鱼和莲花的胖娃娃，说的就是这一句。'},
    {p: [['🐒', '猴子'], ['🐎', '骑在马上']], o: ['马到成功', '心猿意马', '马上封侯', '千里马'], a: 2, x: '猴＝侯，骑在马上＝马上：马上封侯，祝人很快升官。'},
    {p: [['🐦', '喜鹊'], ['🌸', '站在梅花枝梢']], o: ['鹊桥相会', '喜上眉梢', '花好月圆', '梅开二度'], a: 1, x: '喜鹊＝喜，梅＝眉，枝梢＝梢：喜上眉梢。'},
    {p: [['🌾', '稻穗'], ['🏺', '花瓶'], ['🐦', '鹌鹑']], o: ['五谷丰登', '平步青云', '安居乐业', '岁岁平安'], a: 3, x: '穗＝岁，瓶＝平，鹌＝安：岁岁平安。三样东西，借了三个音。'},
    {p: [['🐓', '公鸡'], ['🌺', '鸡冠花']], o: ['闻鸡起舞', '官上加官', '金鸡报晓', '一鸣惊人'], a: 1, x: '公鸡头上有冠，旁边再画一丛鸡冠花：冠上加冠＝官上加官。'},
    {p: [['🐘', '大象'], ['🏺', '背上驮着宝瓶']], o: ['万象更新', '盲人摸象', '太平有象', '象牙之塔'], a: 2, x: '瓶＝平，象＝象（景象）：太平有象，清代宫廷里很常见的摆件。'}
  ];
  let i = 0, score = 0, answered = false;
  function show(){
    const q = Q[i]; answered = false;
    box.innerHTML = '<div class="qn">第 ' + (i + 1) + ' / ' + Q.length + ' 幅 · 答对 ' + score + '</div><div class="pic">' + q.p.map(p => '<div><span>' + p[0] + '</span>' + p[1] + '</div>').join('<div style="align-self:center;font-size:24px;color:var(--ink-3)">＋</div>') + '</div><div class="opts">' + q.o.map((o, k) => '<button data-k="' + k + '">' + o + '</button>').join('') + '</div><div class="readout" id="rbEx" style="margin-top:10px"></div>';
  }
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-k]'), nx = e.target.closest('[data-next]');
    if (nx) { i = (i + 1) % Q.length; if (i === 0) score = 0; show(); return; }
    if (!b || answered) return;
    answered = true; const q = Q[i], k = +b.dataset.k;
    if (k === q.a) score++;
    $$('[data-k]', box).forEach(x => { const kk = +x.dataset.k; if (kk === q.a) x.classList.add('ok'); else if (kk === k) x.classList.add('bad'); x.disabled = true; });
    $('#rbEx').innerHTML = (k === q.a ? '<b>对。</b>' : '<b>是“' + q.o[q.a] + '”。</b>') + q.x + '<div class="btns" style="margin-top:8px"><button class="btn pri" data-next>' + (i === Q.length - 1 ? '答对 ' + score + ' / ' + Q.length + '，再来一遍' : '下一幅') + '</button></div>';
  });
  show();
})();

/* ---------- 装置 4：形声拼字 ---------- */
(function(){
  const sEl = $('#xsSnd'); if (!sEl) return;
  const D = {
    '青': ['qīng', {'氵': ['清', 'qīng', '水清，干净'], '日': ['晴', 'qíng', '天晴，没有云'], '目': ['睛', 'jīng', '眼珠'], '讠': ['请', 'qǐng', '开口请求'], '忄': ['情', 'qíng', '心里的感情'], '虫': ['蜻', 'qīng', '蜻蜓'], '米': ['精', 'jīng', '挑出来的好米，引申为精华'], '亻': ['倩', 'qiàn', '美好，多用于人']}],
    '包': ['bāo', {'饣': ['饱', 'bǎo', '吃饱'], '扌': ['抱', 'bào', '用手臂围住'], '足': ['跑', 'pǎo', '用脚跑'], '火': ['炮', 'pào', '最早指用火烧烤，后来指火器'], '衤': ['袍', 'páo', '长衣'], '氵': ['泡', 'pào', '水泡'], '月': ['胞', 'bāo', '胎衣，同胞（这个“月”其实是“肉”）'], '艹': ['苞', 'bāo', '花苞'], '口': ['咆', 'páo', '咆哮']}],
    '马': ['mǎ', {'女': ['妈', 'mā', '母亲'], '口': ['吗', 'ma', '问话的语气'], '石': ['码', 'mǎ', '砝码、号码'], '虫': ['蚂', 'mǎ', '蚂蚁'], '王': ['玛', 'mǎ', '玛瑙（这个“王”其实是“玉”）']}],
    '方': ['fāng', {'讠': ['访', 'fǎng', '拜访，打听'], '纟': ['纺', 'fǎng', '纺线'], '艹': ['芳', 'fāng', '花草的香气'], '亻': ['仿', 'fǎng', '仿照'], '女': ['妨', 'fáng', '妨碍'], '土': ['坊', 'fāng', '街坊、作坊'], '月': ['肪', 'fáng', '脂肪（这个“月”其实是“肉”）']}],
    '皮': ['pí', {'衤': ['被', 'bèi', '被子'], '氵': ['波', 'bō', '水波'], '扌': ['披', 'pī', '披在身上'], '土': ['坡', 'pō', '山坡'], '石': ['破', 'pò', '石头碎裂'], '足': ['跛', 'bǒ', '瘸腿'], '王': ['玻', 'bō', '玻璃']}],
    '工': ['gōng', {'氵': ['江', 'jiāng', '大江。今天念 jiāng，和“工”差得远，但上古音两者很近'], '纟': ['红', 'hóng', '红色的丝帛'], '虫': ['虹', 'hóng', '彩虹（古人以为虹是一种虫）'], '木': ['杠', 'gàng', '木杠'], '扌': ['扛', 'káng', '用肩扛'], '讠': ['讧', 'hòng', '内讧，争吵']}],
    '巴': ['bā', {'口': ['吧', 'ba', '语气词'], '扌': ['把', 'bǎ', '握住'], '艹': ['芭', 'bā', '芭蕉'], '米': ['粑', 'bā', '糍粑、粑粑'], '疒': ['疤', 'bā', '伤疤']}]
  };
  const SHP = ['氵', '日', '目', '讠', '忄', '虫', '饣', '扌', '足', '火', '衤', '女', '口', '石', '王', '艹', '纟', '亻', '土', '月', '木', '米', '疒'];
  const NAME = {'氵': '水', '日': '太阳', '目': '眼睛', '讠': '说话', '忄': '心', '虫': '虫', '饣': '吃', '扌': '手', '足': '脚', '火': '火', '衤': '衣服', '女': '女人', '口': '嘴', '石': '石头', '王': '玉', '艹': '草', '纟': '丝', '亻': '人', '土': '土', '月': '肉', '木': '木头', '米': '米', '疒': '病'};
  const total = Object.values(D).reduce((s, v) => s + Object.keys(v[1]).length, 0);
  const found = new Set();
  let cs = null;
  sEl.innerHTML = Object.keys(D).map(k => '<button data-s="' + k + '" aria-label="声旁 ' + k + '">' + k + '</button>').join('');
  $('#xsShp').innerHTML = SHP.map(k => '<button data-h="' + k + '" title="' + NAME[k] + '" aria-label="形旁 ' + k + '，' + NAME[k] + '">' + k + '</button>').join('');
  const big = $('#xsBig'), info = $('#xsInfo');
  function mark(){
    $$('[data-s]', sEl).forEach(b => b.classList.toggle('on', b.dataset.s === cs));
    $$('[data-h]').forEach(b => { b.classList.remove('on'); b.classList.toggle('hit', !!(cs && D[cs][1][b.dataset.h])); });
    $('#xsFound').textContent = '已拼出 ' + found.size + ' / ' + total + ' 个字' + (found.size === total ? '。全部找到了！' : '');
  }
  sEl.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (!b) return; cs = b.dataset.s; big.textContent = cs; big.className = 'big'; info.innerHTML = '声旁“' + cs + '”，念 <b>' + D[cs][0] + '</b>。绿边的形旁能和它拼成字，点一个试试；也可以点别的，看拼不拼得出来。'; mark(); });
  $('#xsShp').addEventListener('click', e => {
    const b = e.target.closest('[data-h]'); if (!b) return;
    if (!cs) { info.textContent = '先在上面点一个声旁。'; return; }
    const h = b.dataset.h, r = D[cs][1][h];
    mark(); b.classList.add('on');
    if (r) {
      found.add(r[0]); big.textContent = r[0]; big.className = 'big';
      info.innerHTML = '<b style="font-size:17px">' + r[0] + '</b> ' + r[1] + '：' + r[2] + '<br><span style="font-size:13.5px;color:var(--ink-3)">“' + h + '”提醒它和' + NAME[h] + '有关，“' + cs + '”（' + D[cs][0] + '）提示读音。</span>';
      mark(); b.classList.add('on');
    } else { big.textContent = '×'; big.className = 'big none'; info.innerHTML = '“' + h + '” 加 “' + cs + '”拼不出常用字。<span style="font-size:13.5px;color:var(--ink-3)">（字典里也许有这么个生僻字。）</span>'; }
  });
  mark();
})();

/* ---------- 装置 5：一个字怎样变成楔子 ----------
   每个符号是若干笔，每笔是一串点（在 100×100 的框里，直立的图画）。
   变化分三步：笔画拉直 → 整体左转 90° → 每笔变成一个楔形印（头朝左或朝上）。 */
(function(){
  const box = $('#evoSigns'); if (!box) return;
  const arc = (cx, cy, r, a0, a1, n) => { const p = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; };
  const wave = (x0, x1, y, amp, n) => { const p = []; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; p.push([x, y + amp * Math.sin(i / n * Math.PI * 4)]); } return p; };
  const S = [
    {n: '羊 · udu', s: [arc(50, 50, 28, -135, -45, 6), arc(50, 50, 28, -45, 45, 6), arc(50, 50, 28, 45, 135, 6), arc(50, 50, 28, 135, 225, 6), [[50, 22], [50, 78]], [[22, 50], [78, 50]]]},
    {n: '牛 · gu₄', s: [[[28, 30], [18, 22], [16, 12], [24, 8]], [[72, 30], [82, 22], [84, 12], [76, 8]], [[28, 30], [34, 60], [44, 86]], [[72, 30], [66, 60], [56, 86]], [[28, 30], [72, 30]], [[44, 86], [56, 86]]]},
    {n: '大麦 · še', s: [[[50, 92], [50, 50], [50, 10]], [[50, 22], [40, 14], [34, 12]], [[50, 22], [60, 14], [66, 12]], [[50, 40], [38, 32], [32, 30]], [[50, 40], [62, 32], [68, 30]], [[50, 58], [38, 50], [32, 48]], [[50, 58], [62, 50], [68, 48]]]},
    {n: '鱼 · ku₆', s: [[[14, 50], [24, 38], [38, 32]], [[38, 32], [58, 34], [74, 50]], [[14, 50], [24, 62], [38, 68]], [[38, 68], [58, 66], [74, 50]], [[74, 50], [88, 36]], [[74, 50], [88, 64]], [[88, 36], [88, 64]]]},
    {n: '神、天 · dingir', s: [[[50, 12], [50, 88]], [[12, 50], [88, 50]], [[23, 23], [77, 77]], [[77, 23], [23, 77]]]},
    {n: '水 · a', s: [wave(14, 86, 38, 7, 16), wave(14, 86, 62, 7, 16)]},
    {n: '山、外邦 · kur', s: [[[10, 78], [18, 60], [26, 42]], [[26, 42], [34, 60], [42, 78]], [[34, 60], [42, 42], [50, 24]], [[50, 24], [58, 42], [66, 60]], [[58, 78], [66, 60], [74, 42]], [[74, 42], [82, 60], [90, 78]]]},
    {n: '头 · sag', s: [[[36, 14], [56, 10], [70, 18]], [[70, 18], [74, 34], [82, 44]], [[82, 44], [74, 52], [72, 64]], [[72, 64], [62, 74], [48, 76]], [[36, 14], [26, 30], [24, 50], [30, 70], [48, 76]], [[60, 34], [64, 36]]]}
  ];
  box.innerHTML = S.map((s, i) => '<div><svg viewBox="0 0 100 100" id="evo' + i + '" aria-hidden="true"></svg>' + s.n + '</div>').join('');
  const L = (a, b, t) => a + (b - a) * t;
  function render(t){
    const s1 = clamp(t / .35, 0, 1);              // 拉直
    const s2 = clamp((t - .3) / .3, 0, 1);        // 转向
    const s3 = clamp((t - .62) / .3, 0, 1);       // 楔子
    const ang = -90 * s2 * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang);
    const rot = ([x, y]) => [50 + (x - 50) * ca - (y - 50) * sa, 50 + (x - 50) * sa + (y - 50) * ca];
    S.forEach((sg, i) => {
      let h = '';
      sg.s.forEach(st => {
        const a = st[0], b = st[st.length - 1], n = st.length - 1;
        const pts = st.map((p, k) => rot([L(p[0], L(a[0], b[0], k / n), s1), L(p[1], L(a[1], b[1], k / n), s1)]));
        if (s3 < 1) h += '<path d="M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + '" fill="none" stroke="var(--ink-2)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" opacity="' + (1 - s3).toFixed(2) + '"/>';
        if (s3 > 0) {
          let p = rot(a), q = rot(b);
          // 楔子的头朝左（横）或朝上（竖）
          if (Math.abs(q[0] - p[0]) >= Math.abs(q[1] - p[1]) ? q[0] < p[0] : q[1] < p[1]) [p, q] = [q, p];
          let dx = q[0] - p[0], dy = q[1] - p[1]; const len = Math.hypot(dx, dy) || 1;
          // 方向向 45° 的倍数靠拢
          const a0 = Math.atan2(dy, dx), snap = Math.round(a0 / (Math.PI / 4)) * Math.PI / 4, aa = L(a0, snap, s3);
          dx = Math.cos(aa); dy = Math.sin(aa);
          const ll = Math.max(len, 16), hw = 6.5, hl = 12;
          const ex = p[0] + dx * ll, ey = p[1] + dy * ll, nx = -dy, ny = dx, f = v => v.toFixed(1);
          h += '<g opacity="' + s3.toFixed(2) + '"><path d="M' + f(p[0] + nx * hw) + ',' + f(p[1] + ny * hw) + ' L' + f(p[0] - nx * hw) + ',' + f(p[1] - ny * hw) + ' L' + f(p[0] + dx * hl) + ',' + f(p[1] + dy * hl) + ' Z" fill="var(--clay-d)"/><path d="M' + f(p[0] + dx * hl * .5) + ',' + f(p[1] + dy * hl * .5) + ' L' + f(ex) + ',' + f(ey) + '" stroke="var(--clay-d)" stroke-width="2.4" stroke-linecap="round"/></g>';
        }
      });
      $('#evo' + i).innerHTML = h;
    });
    $('#evoTxt').innerHTML = t < .3 ? '<b>画。</b>约公元前 3200 年前后，用削尖的芦苇在湿泥上刻图形，圆就是圆，弯就是弯。' : t < .62 ? '<b>拉直、躺倒。</b>泥里画弧线太慢，线条越来越直；后来整个符号向左转了九十度（何时转、为什么转，学界说法不一）。' : '<b>楔子。</b>每一笔都改成用三角形芦苇笔“按”出来：头大尾细，头朝左或朝上。到公元前一千纪的亚述、巴比伦，大多数符号已看不出原来的画了。';
  }
  const r = $('#evoR');
  r.addEventListener('input', () => render(r.value / 100));
  render(0);
})();

/* ---------- 装置 6：你名字的祖先 ---------- */
(function(){
  const inp = $('#ancIn'); if (!inp) return;
  const W = ' fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
  const P = {
    ox: '<path d="M12,14 Q5,10 7,3 M28,14 Q35,10 33,3 M12,13 H28 L24,32 Q20,35 16,32 Z"' + W + '/><circle cx="16" cy="19" r="1.4" fill="var(--ink)"/><circle cx="24" cy="19" r="1.4" fill="var(--ink)"/>',
    house: '<path d="M8,8 H32 V32 H23 V24 H17 V32 H8 Z"' + W + '/>',
    stick: '<path d="M9,33 L19,7 L32,15"' + W + '/>',
    door: '<path d="M10,6 H30 V34 H10 Z M15,11 H25 V29 H15 Z"' + W + '/><circle cx="23" cy="20" r="1.3" fill="var(--ink)"/>',
    man: '<circle cx="20" cy="9" r="4"' + W + '/><path d="M20,13 V25 M20,25 L14,35 M20,25 L26,35 M20,17 L11,9 M20,17 L29,9"' + W + '/>',
    hook: '<path d="M20,36 V14 M20,14 Q20,5 27,6 Q33,8 30,14"' + W + '/>',
    weapon: '<path d="M20,5 V35 M12,7 H28 M12,33 H28"' + W + '/>',
    fence: '<path d="M10,5 V35 M30,5 V35 M10,13 H30 M10,21 H30 M10,29 H30"' + W + '/>',
    arm: '<path d="M6,30 L20,26 L26,14 M26,14 L22,8 M26,14 L30,8 M26,14 L34,12"' + W + '/>',
    palm: '<path d="M14,34 V20 M26,34 V20 M14,20 L8,8 M17,19 L16,5 M20,19 L22,5 M23,19 L28,7 M26,20 L33,13 M14,34 H26"' + W + '/>',
    goad: '<path d="M16,35 V14 Q16,5 24,6 Q31,8 28,15"' + W + '/>',
    water: '<path d="M4,16 L10,10 L16,16 L22,10 L28,16 L34,10 M4,28 L10,22 L16,28 L22,22 L28,28 L34,22"' + W + '/>',
    snake: '<path d="M8,32 Q14,24 20,30 Q27,36 30,26 Q33,16 24,14 Q16,12 20,6 L26,5"' + W + '/><circle cx="25" cy="5.5" r="1.5" fill="var(--ink)"/>',
    eye: '<path d="M4,20 Q20,6 36,20 Q20,34 4,20 Z"' + W + '/><circle cx="20" cy="20" r="5" fill="var(--ink)"/>',
    mouth: '<path d="M6,16 Q20,8 34,16 Q20,34 6,16 Z M8,17 Q20,22 32,17"' + W + '/>',
    knot: '<circle cx="20" cy="15" r="8"' + W + '/><path d="M20,23 V36 M20,7 V23"' + W + '/>',
    head: '<path d="M14,8 Q26,4 30,12 L33,18 L29,20 L30,26 Q26,32 18,30 L18,36 M14,8 Q8,16 12,26 Q14,30 18,30"' + W + '/><circle cx="25" cy="15" r="1.4" fill="var(--ink)"/>',
    tooth: '<path d="M5,12 Q8,30 13,30 Q17,30 20,18 Q23,30 27,30 Q32,30 35,12"' + W + '/>',
    mark: '<path d="M8,8 L32,32 M32,8 L8,32"' + W + '/>',
    unk: '<text x="20" y="28" text-anchor="middle" font-size="24" fill="var(--ink-3)" font-family="serif">?</text>'
  };
  const A = {
    A: ['ox', 'ʾalp', '牛', '希腊 Alpha。牛头倒过来、躺倒，就是 A'],
    B: ['house', 'bayt', '房子', '希腊 Beta'],
    C: ['stick', 'gaml', '投掷棒（一说骆驼）', '希腊 Gamma；拉丁语里 C 起初兼管 g、k 两个音'],
    D: ['door', 'dalt', '门', '希腊 Delta'],
    E: ['man', 'hē', '欢呼的人？', '希腊 Epsilon，由辅音改成了元音。原形含义有争议', 1],
    F: ['hook', 'waw', '钩子、木钉', '希腊早期的 Digamma，后来希腊语不用了，拉丁语留下了 F'],
    G: ['stick', 'gaml', '投掷棒', '罗马人约在公元前 3 世纪给 C 加了一笔，造出 G'],
    H: ['fence', 'ḥēt', '篱笆、院子？', '希腊 Eta。原形含义有争议', 1],
    I: ['arm', 'yad', '手臂', '希腊 Iota，由辅音改成了元音'],
    J: ['arm', 'yad', '手臂', '中世纪以后才从 I 分出来'],
    K: ['palm', 'kap', '手掌', '希腊 Kappa'],
    L: ['goad', 'lamd', '赶牛的棍子', '希腊 Lambda'],
    M: ['water', 'maym', '水', '希腊 Mu。波浪变成了 M'],
    N: ['snake', 'naḥš', '蛇', '希腊 Nu。后来腓尼基人管这个字母叫 nun，意思是鱼'],
    O: ['eye', 'ʿayn', '眼睛', '希腊 Omicron。眼睛的辅音被希腊人改成了元音 o'],
    P: ['mouth', 'pē', '嘴', '希腊 Pi'],
    Q: ['knot', 'qōp', '猴子？绳结？', '希腊早期的 Qoppa。原形是什么一直有争议', 1],
    R: ['head', 'raʾš', '人头', '希腊 Rho'],
    S: ['tooth', 'šin', '牙齿？', '希腊 Sigma。也有人认为原形是弓', 1],
    T: ['mark', 'taw', '记号', '希腊 Tau。原来就是一个十字记号'],
    U: ['hook', 'waw', '钩子', '希腊 Upsilon；U 和 V 到中世纪才分成两个字母'],
    V: ['hook', 'waw', '钩子', '希腊 Upsilon；拉丁语里 V 兼管 u 和 v'],
    W: ['hook', 'waw', '钩子', '中世纪把两个 V（或 U）连起来写，所以英语叫它 double-u'],
    X: ['unk', '？', '来历不明', '来自希腊字母 Chi 或 Xi，再往上追不清楚', 1],
    Y: ['hook', 'waw', '钩子', '罗马人为了写希腊借词，又借了一次 Upsilon'],
    Z: ['weapon', 'zayn', '武器？', '希腊 Zeta。原形含义有争议', 1]
  };
  const cards = $('#ancCards'), chain = $('#ancChain');
  function run(){
    const s = inp.value.toUpperCase().replace(/[^A-Z ]/g, '').slice(0, 32);
    const ls = s.replace(/ /g, '').split('');
    cards.innerHTML = ls.map(c => { const a = A[c]; return '<div class="cd' + (a[4] ? ' q' : '') + '" title="' + a[3] + '"><svg viewBox="0 0 40 40" aria-hidden="true">' + P[a[0]] + '</svg><div class="L">' + c + '</div><div class="nm">' + a[1] + '</div>' + a[2] + '</div>'; }).join('') || '<p class="readout">输入几个拉丁字母试试。</p>';
    chain.innerHTML = s.trim() ? s.trim().split(/ +/).map(w => '<b style="color:var(--ink)">' + w + '</b> ← ' + w.split('').map(c => A[c][2].replace(/[？（].*$/, '')).join(' · ')).join('<br>') + '<br><span style="font-size:12px">把鼠标放在卡片上（或长按）可以看到这个字母在希腊、罗马的经历。</span>' : '';
  }
  inp.addEventListener('input', run);
  $('#ancFig').addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (!b) return; inp.value = b.dataset.w; run(); });
  cards.addEventListener('click', e => { const c = e.target.closest('.cd'); if (c) chain.innerHTML = '<b style="color:var(--ink)">' + $('.L', c).textContent + '</b>：' + c.title; });
  run();
})();

/* ---------- 装置 7：人类发明文字的家谱 ---------- */
(function(){
  const svg = $('#tlSvg'); if (!svg) return;
  const B = [[-3500, 60], [-1500, 340], [-500, 480], [500, 610], [1500, 770], [2000, 870]];
  const X = y => { for (let i = 1; i < B.length; i++) if (y <= B[i][0]) { const [a, xa] = B[i - 1], [b, xb] = B[i]; return xa + (y - a) / (b - a) * (xb - xa); } return 870; };
  const ROWS = ['西亚', '埃及 · 地中海 · 欧洲', '南亚', '东亚', '美洲 · 太平洋'];
  const RY = r => 46 + r * 62;
  const TY = {o: ['从零发明', 'var(--terra)'], d: ['借来改来', 'var(--lapis)'], s: ['受启发自造', 'var(--gold)'], u: ['至今未破译', 'var(--ink-3)']};
  // [id, 名, 年, 行, 类, 标签位置, 说明]
  const N = [
    ['cun', '原始楔形文字', -3300, 0, 'o', 'r', '约公元前 3300 年，乌鲁克。从账目开始，后来演变成楔形文字，被十几种语言借用，一直用到公元一世纪。本书第一到第四章。'],
    ['egy', '埃及圣书字', -3200, 1, 'o', 'r', '约公元前 3200 年前后，阿拜多斯 U-j 墓的骨牌、象牙牌上已有符号。它是独立发明，还是听说了两河“有文字”而受到启发，至今有争论。'],
    ['ind', '印度河符号', -2600, 2, 'u', 'r', '约公元前 2600—前 1900 年，出现在几千枚小印章上，每段很短。至今没有破译，连它是不是记录语言的完整文字都有争论。卷二再讲。'],
    ['sin', '原始西奈字母', -1850, 0, 'd', 'a', '约公元前 1850 年（一说更晚），埃及矿上说闪米特语的人，从圣书字里借了图形，只取头一个音。几乎所有字母文字的祖先。本书第五章。'],
    ['lin', '线形文字 A', -1800, 1, 'u', 'b', '约公元前 1800—前 1450 年，克里特岛的米诺斯文明。它的后代线形文字 B 在 1952 年被破译，它自己至今读不懂。卷二再讲。'],
    ['ora', '甲骨文', -1250, 3, 'o', 'r', '约公元前 1250 年起，商王武丁时代已很成熟。出土单字四千多个，释读约三分之一。汉字是今天仍在使用的、最古老的文字系统之一。'],
    ['phn', '腓尼基字母', -1050, 0, 'd', 'r', '约公元前 1050 年定型，22 个字母，只记辅音。随着腓尼基商船传遍地中海。阿拉米字母等都从它分出。'],
    ['grk', '希腊字母', -800, 1, 'd', 'a', '约公元前 800 年前后借自腓尼基字母，把几个用不上的辅音字母改成元音，第一次做到辅音元音都写。'],
    ['lat', '拉丁字母', -600, 1, 'd', 'b', '约公元前 7—前 6 世纪，经伊特鲁里亚人从希腊字母改来。今天汉语拼音、英文、越南文都用它。'],
    ['mes', '中美洲文字', -500, 4, 'o', 'r', '奥尔梅克、萨波特克、玛雅等。最早的可信材料约在公元前一千纪中期，具体年代和归属有争议。玛雅文字在 20 世纪后半叶被大体破译。'],
    ['bra', '婆罗米文', -250, 2, 'd', 'r', '公元前 3 世纪阿育王的石刻已用它。今天印度、东南亚、中国藏文等许多文字都出自它。它是否出自阿拉米字母有争论。'],
    ['arb', '阿拉伯字母', 400, 0, 'd', 'r', '约公元 4—5 世纪，从阿拉米字母经纳巴泰文演变而来。'],
    ['kan', '日本假名', 900, 3, 'd', 'a', '9 世纪前后，由借汉字记音的“万叶假名”简化而来。第三章讲过。'],
    ['cyr', '西里尔字母', 900, 1, 'd', 'r', '9—10 世纪，以希腊字母为基础，为斯拉夫语创制。今天俄文等使用。'],
    ['hgl', '训民正音', 1443, 3, 's', 'a', '1443 年朝鲜世宗创制，1446 年颁布。字母形状照着发音器官画，是少有的有明确作者和设计思路的文字。设计时参考过哪些已有文字，学界有不同看法。'],
    ['mnc', '满文', 1599, 3, 'd', 'b', '1599 年照蒙古文创制，往上可以追到回鹘文、粟特文、阿拉米字母，最终是腓尼基字母。'],
    ['rng', '朗格朗格', 1700, 4, 'u', 'a', '复活节岛的木板刻符，没人能读。它是本地独立发明，还是 1770 年西班牙人来过之后受启发产生的，有争论。'],
    ['chk', '切罗基音节文字', 1821, 4, 's', 'b', '约 1821 年，不识英文的塞阔雅为切罗基语创制，86 个符号（后为 85）。“刺激传播”的经典例子。']
  ];
  const E = [['egy', 'sin'], ['sin', 'phn'], ['phn', 'grk'], ['grk', 'lat'], ['grk', 'cyr'], ['phn', 'arb'], ['phn', 'bra', 1], ['phn', 'mnc', 1], ['ora', 'kan'], ['ora', 'hgl', 1], ['lat', 'chk', 1]];
  const F = $('#tlF'), card = $('#tlCard');
  let cur = 'all', sel = null;
  F.innerHTML = '<button class="btn on" data-f="all">全部</button>' + Object.entries(TY).map(([k, v]) => '<button class="btn" data-f="' + k + '">' + v[0] + '</button>').join('');
  const P = {}; N.forEach(n => P[n[0]] = [X(n[2]), RY(n[3])]);
  function draw(){
    let h = '';
    ROWS.forEach((r, i) => h += '<line x1="20" y1="' + RY(i) + '" x2="890" y2="' + RY(i) + '" stroke="var(--rule)" stroke-dasharray="2 5"/><text x="20" y="' + (RY(i) - 18) + '" font-size="11" fill="var(--ink-3)">' + r + '</text>');
    h += '<line x1="20" y1="340" x2="890" y2="340" stroke="var(--ink-3)"/>';
    [-3000, -2000, -1000, 0, 1000, 2000].forEach(y => { const x = X(y); h += '<line x1="' + x + '" y1="336" x2="' + x + '" y2="344" stroke="var(--ink-3)"/><text x="' + x + '" y="356" text-anchor="middle" font-size="11" fill="var(--ink-3)" font-family="IBM Plex Mono,monospace">' + (y < 0 ? '前' + (-y) : y) + '</text>'; });
    E.forEach(([a, b, dash]) => { const [x1, y1] = P[a], [x2, y2] = P[b]; const vis = cur === 'all'; h += '<path d="M' + x1 + ',' + y1 + ' C' + ((x1 + x2) / 2) + ',' + y1 + ' ' + ((x1 + x2) / 2) + ',' + y2 + ' ' + x2 + ',' + y2 + '" fill="none" stroke="var(--ink-3)" stroke-width="1.2"' + (dash ? ' stroke-dasharray="4 4"' : '') + ' opacity="' + (vis ? .55 : .12) + '"/>'; });
    N.forEach((n, k) => {
      const [x, y] = P[n[0]], t = TY[n[4]], on = cur === 'all' || cur === n[4];
      const lx = n[5] === 'r' ? x + 11 : x, ly = n[5] === 'r' ? y + 4 : n[5] === 'a' ? y - 12 : y + 21, an = n[5] === 'r' ? 'start' : 'middle';
      h += '<g class="tlnode' + (sel === k ? ' on' : '') + '" data-k="' + k + '" tabindex="0" role="button" aria-label="' + n[1] + '" opacity="' + (on ? 1 : .18) + '"><rect x="' + (x - 6) + '" y="' + (y - 6) + '" width="12" height="12" rx="2" fill="' + (n[4] === 'o' ? t[1] : 'var(--card)') + '" stroke="' + t[1] + '" stroke-width="2"' + (n[4] === 'u' ? ' stroke-dasharray="3 2"' : '') + '/><text x="' + lx + '" y="' + ly + '" text-anchor="' + an + '" font-size="12" fill="var(--ink)">' + n[1] + '</text><rect x="' + (x - 14) + '" y="' + (y - 14) + '" width="28" height="28" fill="transparent"/></g>';
    });
    svg.innerHTML = h;
  }
  function pick(k){
    sel = k; const n = N[k], t = TY[n[4]];
    card.innerHTML = '<p class="k">' + (n[2] < 0 ? '约公元前 ' + (-n[2]) : '约公元 ' + n[2]) + ' 年 · ' + ROWS[n[3]] + ' · <span style="color:' + t[1] + '">' + t[0] + '</span></p><h5>' + n[1] + '</h5><p>' + n[6] + '</p>';
    draw();
  }
  svg.addEventListener('click', e => { const g = e.target.closest('.tlnode'); if (g) pick(+g.dataset.k); });
  svg.addEventListener('keydown', e => { const g = e.target.closest('.tlnode'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(+g.dataset.k); } });
  F.addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; cur = b.dataset.f; $$('[data-f]', F).forEach(x => x.classList.toggle('on', x === b)); draw(); });
  draw();
})();

})();
