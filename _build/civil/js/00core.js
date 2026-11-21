(function(){
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const fmt = n => n >= 1e8 ? (n / 1e8).toFixed(1) + ' 亿' : n >= 1e4 ? (Math.round(n / 1e3) / 10).toLocaleString() + ' 万' : Math.round(n).toLocaleString();
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const yr = y => y < 0 ? '前 ' + (-y) : String(y);
const btnRow = (box, items, cur, cb) => {
  box.innerHTML = items.map((t, i) => '<button class="btn' + (i === cur ? ' on' : '') + '" data-i="' + i + '">' + t + '</button>').join('');
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', box).forEach(x => x.classList.toggle('on', x === b)); cb(+b.dataset.i); });
};
const dev = (sel, fn) => { const el = $(sel); if (el) { try { fn(el); } catch (err) { console.error(sel, err); } } };
const kv = (box, rows) => { box.innerHTML = rows.map(r => '<div>' + r[0] + '<b>' + r[1] + '</b></div>').join(''); };
function svgPt(svg, e){
  const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
  const s = Math.max(vb.width / r.width, vb.height / r.height);
  const ox = (r.width * s - vb.width) / 2, oy = (r.height * s - vb.height) / 2;
  return {x: (e.clientX - r.left) * s - ox + vb.x, y: (e.clientY - r.top) * s - oy + vb.y};
}
function txt(x, y, t, o){ o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.s || 13) + '" fill="' + (o.c || 'var(--ink)') + '" text-anchor="' + (o.a || 'middle') + '"' + (o.w ? ' font-weight="700"' : '') + (o.halo === false ? '' : ' paint-order="stroke" stroke="' + (o.hc || 'var(--card)') + '" stroke-width="3.5" stroke-linejoin="round"') + '>' + t + '</text>'; }
/* 滑块：绑定 input 与 output，返回读数函数 */
function slider(id, f, cb){ const r = $('#' + id), o = $('#' + id + 'O'); const go = () => { if (o) o.textContent = f ? f(+r.value) : r.value; if (cb) cb(+r.value); }; r.addEventListener('input', go); go(); return () => +r.value; }

/* ---------- 全书目录（三个网页共用） ---------- */
const PAGE = /three\.html/.test(location.pathname) ? 3 : /two\.html/.test(location.pathname) ? 2 : 1;
const READY = 1; // 已经写好的部数；后面的章节在目录里显示“写作中”
const PURL = {1: './', 2: 'two.html', 3: 'three.html'};
const TOC = [
  {p: 1, t: '第一部 · 刀笔 —— 从书吏到师爷'},
  {v: '序幕'},
  {id: 'c0', n: '泥', t: '泥板上的欠账', s: '书吏学堂、工日账、“去当书吏吧”：第一批坐办公室的人', r: '前 3200—前 1000'},
  {v: '卷一 · 吏 —— 秦汉魏晋'},
  {id: 'c1', n: '简', t: '以吏为师', s: '秦：文书行政、睡虎地和里耶的竹简、刀笔吏', r: '前 359—前 207'},
  {id: 'c2', n: '举', t: '举孝廉', s: '汉：察举、从二千石到斗食、一个郡的两千个吏', r: '前 206—220'},
  {id: 'c3', n: '品', t: '上品无寒门', s: '九品中正、门阀、清官和浊官', r: '220—589'},
  {v: '卷二 · 考 —— 隋唐到明清'},
  {id: 'c4', n: '考', t: '一张考卷', s: '科举：隋唐的开头、宋朝的糊名、明清的八股和漏斗', r: '587—1905'},
  {id: 'c5', n: '胥', t: '官无封建，吏有封建', s: '胥吏：不拿俸禄的人怎样管着天下', r: '960—1911'},
  {id: 'c6', n: '幕', t: '知县的账本', s: '幕友、长随、门丁：一个县衙到底靠谁运转', r: '1644—1911'},
  {v: '卷三 · 替身 —— 别处的办法'},
  {id: 'c7', n: '奴', t: '苏丹的孩子', s: '奥斯曼的“征集”、马穆鲁克、宦官：为什么用没有家的人', r: '1380—1826'},
  {id: 'c8', n: '买', t: '明码标价', s: '西园卖官、法国的官职买卖、捐纳、包税人', r: '178—1905'},
  {id: 'c9', n: '符', t: '国库里的木棍', s: '教士当文书、财政署的方格布和符木、一把火烧了议会', r: '1066—1834'},
  {p: 2, t: '第二部 · 机器 —— 现代文官怎样造出来'},
  {v: '卷四 · 图纸'},
  {id: 'c10', n: '普', t: '国王的第一仆人', s: '普鲁士：官房学、三道考试、不领工资的见习', r: '1713—1871'},
  {id: 'c11', n: '韦', t: '铁笼与帕金森', s: '韦伯的官僚制、帕金森定律、彼得原理', r: '1900—1971'},
  {id: 'c12', n: '白', t: '一份二十页的报告', s: '英国：恩庇、诺思科特-特里维廉、白厅、通才', r: '1780—1968'},
  {id: 'c13', n: '相', t: '首相与常任秘书', s: '撒切尔、下一步机构、特别顾问、沙发上的政府、后来的拔河', r: '1964—2024'},
  {id: 'c14', n: '赃', t: '胜利者的战利品', s: '美国：分赃制、加菲尔德、彭德尔顿法、哈奇法、附表 F', r: '1829—2025'},
  {v: '卷五 · 各家'},
  {id: 'c15', n: '校', t: '毕业名次', s: '法国：省长、大团、国立行政学院和它的关门', r: '1800—2022'},
  {id: 'c16', n: '降', t: '从天上下来', s: '日本：大藏省、通产省、同期和“天降”', r: '1868—2017'},
  {id: 'c17', n: '单', t: '名单上的人', s: '苏联：干部名单、新阶级、“干部稳定”', r: '1920—1991'},
  {id: 'c18', n: '薪', t: '高薪养廉？', s: '新加坡的部长工资、香港廉署，和清朝的养廉银', r: '1724—2012'},
  {id: 'c19', n: '编', t: '编制', s: '当代中国：从分配到考试、编制、职级', r: '1978—2025'},
  {p: 3, t: '第三部 · 心法 —— 营盘里的人怎样想事情'},
  {v: '卷六 · 性子'},
  {id: 'c20', n: '稳', t: '不求有功', s: '风险厌恶：为什么做错比不做更可怕', r: '心法'},
  {id: 'c21', n: '慢', t: '留痕', s: '程序、会签、文件：慢为什么常常是理性的', r: '心法'},
  {id: 'c22', n: '听', t: '听话听音', s: '文件里的词、信号、信息怎样上下走', r: '心法'},
  {id: 'c23', n: '婉', t: '不说不', s: '为什么很少直接拒绝，以及“研究研究”的十种意思', r: '心法'},
  {v: '卷七 · 算盘'},
  {id: 'c24', n: '房', t: '房子', s: '福利分房、房改、公积金：营盘里的人怎样看房子', r: '心法'},
  {id: 'c25', n: '车', t: '一笔总账', s: '公车、车改，和体制内外的总账', r: '心法'},
  {id: 'c26', n: '老', t: '后付的工资', s: '养老、年资、金手铐', r: '心法'},
  {id: 'c27', n: '时', t: '年龄线', s: '时机：稳和快，什么时候动', r: '心法'},
  {v: '卷八 · 代价与带走'},
  {id: 'c28', n: '价', t: '围城', s: '代价：约束、无聊、背锅、慢', r: '心法'},
  {id: 'c29', n: '带', t: '带走什么', s: '尾声：外面的人能从营盘里学走什么', r: '尾声'}
];
const chapPage = {}; { let p = 1; TOC.forEach(x => { if (x.p) p = x.p; if (x.id) chapPage[x.id] = p; }); }
const href = id => (chapPage[id] === PAGE ? '' : PURL[chapPage[id]]) + '#' + id;
$$('.bar .parts a').forEach(a => { const p = +a.dataset.p; a.classList.toggle('on', p === PAGE); if (p > READY) { a.removeAttribute('href'); a.style.opacity = .4; a.title = '写作中'; } });
$('#drawerList').innerHTML = TOC.map(x => x.p ? '<li class="ph">' + x.t + '</li>' : x.v ? '<li class="vh">' + x.v + '</li>' :
  chapPage[x.id] > READY ? '<li><a style="opacity:.5;pointer-events:none"><span class="n">' + x.n + '</span><span>' + x.t + '<small>写作中</small></span></a></li>' :
  '<li><a href="' + href(x.id) + '"' + (chapPage[x.id] === PAGE ? ' class="here"' : '') + '><span class="n">' + x.n + '</span><span>' + x.t + '<small>' + x.s + '</small></span></a></li>').join('');
dev('#toc', ul => {
  ul.innerHTML = TOC.map(x => x.p ? '<li class="vh" style="color:var(--zhu)">' + x.t + '</li>' : x.v ? '<li class="vh">' + x.v + '</li>' :
    chapPage[x.id] > READY ? '<li class="soon"><div><span class="n">' + x.n + '</span><span class="t">' + x.t + '<small>' + x.s + '</small></span><span class="r">' + x.r + '</span></div></li>' :
    '<li' + (chapPage[x.id] === PAGE ? '' : ' class="away"') + '><a href="' + href(x.id) + '"><span class="n">' + x.n + '</span><span class="t">' + x.t + '<small>' + x.s + '</small></span><span class="r">' + x.r + '</span></a></li>').join('');
});
/* 页面里写 <a data-c="c12">…</a>，自动拼出跨页链接 */
$$('a[data-c]').forEach(a => { const id = a.dataset.c; if (chapPage[id] > READY) { a.removeAttribute('href'); a.title = '写作中'; a.style.textDecorationStyle = 'dotted'; } else a.href = href(id); });

/* ---------- 页眉：卷名、进度、目录抽屉 ---------- */
const barVol = $('#barVol'), prog = $('#prog');
const vols = $$('[data-vol]');
let ticking = false;
function onScroll(){
  ticking = false;
  const lim = innerHeight * 0.35; let cur = null;
  for (const e of vols) { if (e.getBoundingClientRect().top < lim) cur = e; else break; }
  barVol.textContent = cur ? cur.dataset.vol : '序';
  const H = document.documentElement.scrollHeight - innerHeight;
  prog.style.width = (H > 0 ? scrollY / H * 100 : 0) + '%';
}
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, {passive: true});
onScroll();
const drawer = $('#drawer');
function openD(on){ drawer.classList.toggle('on', on); drawer.setAttribute('aria-hidden', on ? 'false' : 'true'); }
$('#tocBtn').addEventListener('click', () => openD(true));
drawer.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target.closest('a')) openD(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') openD(false); });
$$('.toTop').forEach(a => a.addEventListener('click', e => { e.preventDefault(); scrollTo({top: 0, behavior: 'smooth'}); }));

/* 章首：入仕的六扇门 */
const GATES = [['生', '出身'], ['荐', '推荐'], ['考', '考试'], ['买', '花钱'], ['宠', '君主的私人'], ['任', '政治任命']];
$$('.gate').forEach(w => { const on = (w.dataset.g || '').split(/\s+/); w.innerHTML = GATES.map(f => '<span' + (on.includes(f[0]) ? ' class="on"' : '') + '><b>' + f[0] + '</b>' + f[1] + '</span>').join(''); });

/* 年代条：前 3200 到 2030，这一章占哪一段（前 3200—前 600 压缩成左边的一小截） */
const tp = y => y < -600 ? (y + 3200) / 2600 * 18 : 18 + (y + 600) / 2630 * 82;
$$('.when').forEach(w => {
  const a = +w.dataset.a, b = +w.dataset.b;
  w.innerHTML = [-3000, -1000, 1, 500, 1000, 1500, 2000].map(y => '<span style="left:' + Math.max(3, tp(y)) + '%">' + (y === 1 ? '公元' : yr(y)) + '</span>').join('') +
    '<i style="left:' + tp(a) + '%;width:' + Math.max(.6, tp(b) - tp(a)) + '%"></i>';
  w.title = yr(a) + ' — ' + yr(b);
});

/* 卷首的方印 */
$$('svg.yin').forEach(s => {
  const t = (s.dataset.t || '营盘').split('');
  s.setAttribute('viewBox', '0 0 100 100');
  let g = '<rect x="6" y="6" width="88" height="88" rx="6" fill="none" stroke="currentColor" stroke-width="4"/><rect x="12" y="12" width="76" height="76" rx="3" fill="none" stroke="currentColor" stroke-width="1.2"/>';
  if (t.length === 4) g += [[67, 42], [67, 78], [33, 42], [33, 78]].map((p, i) => '<text x="' + p[0] + '" y="' + p[1] + '" font-size="34" text-anchor="middle" fill="currentColor" font-family="var(--f-display)">' + t[i] + '</text>').join('');
  else g += t.map((c, i) => '<text x="50" y="' + (44 + i * 36 - (t.length - 1) * 12) + '" font-size="34" text-anchor="middle" fill="currentColor" font-family="var(--f-display)">' + c + '</text>').join('');
  s.innerHTML = g;
});

/* 通用小折线图：series=[{name,color,pts:[[x,y]...],dash}]，opt={xmin,xmax,ymin,ymax,xt,yt,xf,yf,marks:[[x,label]],H} */
function lineChart(svg, series, opt){
  const W = 600, H = opt.H || 260, L = opt.L || 46, R = 14, T = 14, B = 30;
  const X = x => L + (x - opt.xmin) / (opt.xmax - opt.xmin) * (W - L - R);
  const Y = y => T + (1 - (y - opt.ymin) / (opt.ymax - opt.ymin)) * (H - T - B);
  let g = '';
  (opt.yt || []).forEach(v => g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--rule)"/>' + txt(L - 6, Y(v) + 4, opt.yf ? opt.yf(v) : v, {s: 11, a: 'end', c: 'var(--ink-3)', halo: false}));
  (opt.xt || []).forEach(v => g += txt(X(v), H - 10, opt.xf ? opt.xf(v) : v, {s: 11, c: 'var(--ink-3)', halo: false}));
  (opt.marks || []).forEach((m, i) => g += '<line x1="' + X(m[0]) + '" x2="' + X(m[0]) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--ink-3)" stroke-dasharray="2 3"/>' + txt(X(m[0]) + 3, T + 12 + (i % 3) * 14, m[1], {s: 11, a: 'start', c: 'var(--ink-2)'}));
  series.forEach(s => {
    const pts = s.pts.filter(p => p[1] != null);
    g += '<path d="M' + pts.map(p => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join('L') + '" fill="none" stroke="' + s.color + '" stroke-width="' + (s.w || 2.4) + '"' + (s.dash ? ' stroke-dasharray="' + s.dash + '"' : '') + ' stroke-linejoin="round"/>';
    if (s.dots) pts.forEach(p => g += '<circle cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="3" fill="' + s.color + '"/>');
  });
  g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '" stroke="var(--ink)" stroke-width="1.2"/>';
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
  return {X, Y, W, H, L, R, T, B};
}
/* 横条：rows=[[名字, 数值, 小字, 颜色]] */
function bars(box, rows, max, f){
  box.innerHTML = rows.map(r => '<div class="row"><span class="nm">' + r[0] + (r[2] ? '<small>' + r[2] + '</small>' : '') + '</span><span class="tr"><i style="width:' + clamp(r[1] / max * 100, 0, 100) + '%;' + (r[3] ? 'background:' + r[3] : '') + '"></i></span><span class="v">' + (f ? f(r[1]) : r[1]) + '</span></div>').join('');
}
