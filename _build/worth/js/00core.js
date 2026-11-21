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

/* ---------- 全书目录（两个网页共用） ---------- */
const PAGE = /two\.html/.test(location.pathname) ? 2 : 1;
const READY = 1; // 已经写好的部数
const PURL = {1: './', 2: 'two.html'};
const TOC = [
  {p: 1, t: '第一部 · 算 —— 账面上的事'},
  {v: '序幕'},
  {id: 'c0', n: '账', t: '十年账', s: '一封聚会邀请、七个人、一页纸：最值的、最不值的、白忙活的', r: '2026'},
  {v: '卷一 · 价 —— 每样东西都有价钱'},
  {id: 'c1', n: '时', t: '一小时值多少钱', s: '机会成本：选了一样，就放弃了别的；时间是唯一不能攒的钱', r: '2016'},
  {id: 'c2', n: '沉', t: '已经花掉的', s: '沉没成本、协和式飞机、什么时候该放手，什么时候该破釜沉舟', r: '2017—2021'},
  {id: 'c3', n: '复', t: '利滚利', s: '复利：技能、身体、名声、钱都会滚，也都有天花板和断档', r: '2016—2026'},
  {id: 'c4', n: '险', t: '活下来', s: '风险、方差、杠杆、破产：为什么活下来比赚最多更重要', r: '2018—2023'},
  {v: '卷二 · 欲 —— 想要的和需要的'},
  {id: 'c5', n: '比', t: '隔壁的琼斯家', s: '欲望、攀比、享乐适应，以及几个被重新检查过的著名实验', r: '2019'},
  {id: 'c6', n: '忙', t: '白忙活', s: '忙和产出不是一回事：考核、留痕、假装工作，以及怎样分辨', r: '2020—2023'},
  {id: 'c7', n: '钱', t: '钱的基本功', s: '预算、应急金、债、保险，以及“保本高收益”为什么是红灯', r: '2022'},
  {p: 2, t: '第二部 · 人 —— 账面外的事'},
  {v: '卷三 · 人 —— 和别人、和世界打交道'},
  {id: 'c8', n: '情', t: '人情账', s: '人情、信用、名声：重复博弈里的老实人为什么不吃亏', r: '2018—2026'},
  {id: 'c9', n: '城', t: '去哪儿', s: '选城市、选行业、选单位；稳的路和快的路', r: '2016—2026'},
  {id: 'c10', n: '话', t: '话术', s: '信息、广告、骗局：怎样不被人说动', r: '2018'},
  {v: '卷四 · 身与运'},
  {id: 'c11', n: '身', t: '身体这个账户', s: '健康和关系是资产，而且是最难补仓的那种', r: '2021'},
  {id: 'c12', n: '运', t: '运气', s: '失败、运气、幸存者偏差：赢家讲的故事为什么不能全信', r: '2020'},
  {v: '尾声'},
  {id: 'c13', n: '账', t: '自己的账本', s: '十年聚会那一晚；以及怎样给自己做一本账', r: '2026'}
];
const chapPage = {}; { let p = 1; TOC.forEach(x => { if (x.p) p = x.p; if (x.id) chapPage[x.id] = p; }); }
const href = id => (chapPage[id] === PAGE ? '' : PURL[chapPage[id]]) + '#' + id;
$$('.bar .parts a').forEach(a => { const p = +a.dataset.p; a.classList.toggle('on', p === PAGE); if (p > READY) { a.removeAttribute('href'); a.style.opacity = .4; a.title = '写作中'; } });
$('#drawerList').innerHTML = TOC.map(x => x.p ? '<li class="ph">' + x.t + '</li>' : x.v ? '<li class="vh">' + x.v + '</li>' :
  chapPage[x.id] > READY ? '<li><a style="opacity:.5;pointer-events:none"><span class="n">' + x.n + '</span><span>' + x.t + '<small>写作中</small></span></a></li>' :
  '<li><a href="' + href(x.id) + '"' + (chapPage[x.id] === PAGE ? ' class="here"' : '') + '><span class="n">' + x.n + '</span><span>' + x.t + '<small>' + x.s + '</small></span></a></li>').join('');
dev('#toc', ul => {
  ul.innerHTML = TOC.map(x => x.p ? '<li class="vh" style="color:var(--main)">' + x.t + '</li>' : x.v ? '<li class="vh">' + x.v + '</li>' :
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

/* 章首：五个账户 */
const ACC = [['时', '时间'], ['钱', '钱'], ['身', '身体'], ['人', '人情与关系'], ['心', '心思']];
$$('.acc').forEach(w => { const on = (w.dataset.a || '').split(/\s+/); w.innerHTML = ACC.map(f => '<span' + (on.includes(f[0]) ? ' class="on"' : '') + '><b>' + f[0] + '</b>' + f[1] + '</span>').join(''); });
/* 年代条：2016—2026 */
$$('.yrs').forEach(w => { const a = +w.dataset.a, b = +(w.dataset.b || w.dataset.a); let h = ''; for (let y = 2016; y <= 2026; y++) h += '<span' + (y >= a && y <= b ? ' class="on"' : '') + '>' + String(y).slice(2) + '</span>'; w.innerHTML = h; w.title = a + (b !== a ? '—' + b : ''); });
/* 卷首：一页账簿 */
$$('svg.ledg').forEach(s => {
  s.setAttribute('viewBox', '0 0 120 90');
  let g = '<rect x="2" y="2" width="116" height="86" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>';
  for (let i = 1; i < 7; i++) g += '<line x1="2" x2="118" y1="' + (2 + i * 12.3) + '" y2="' + (2 + i * 12.3) + '" stroke="currentColor" stroke-width=".7"/>';
  g += '<line x1="30" x2="30" y1="2" y2="88" stroke="currentColor" stroke-width="1.2"/><line x1="82" x2="82" y1="2" y2="88" stroke="currentColor" stroke-width="1.2"/><line x1="100" x2="100" y1="2" y2="88" stroke="currentColor" stroke-width=".7"/>';
  g += '<text x="60" y="58" font-size="34" text-anchor="middle" fill="currentColor" font-family="var(--f-display)">' + (s.dataset.t || '账') + '</text>';
  s.innerHTML = g;
});
/* 正态随机数、分位数、元 */
function gauss(r){ let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const pct = (arr, p) => { const s = [...arr].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))]; };
const yuan = n => (n < 0 ? '−' : '') + fmt(Math.abs(n)) + (Math.abs(n) >= 1e4 ? '元' : ' 元');

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
