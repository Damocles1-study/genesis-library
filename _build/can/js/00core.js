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
const READY = 1; // 已经写好的部数
const PURL = {1: './', 2: 'two.html', 3: 'three.html'};
const TOC = [
  {p: 1, t: '第一部 · 一起 —— 什么不能一起吃、一起服'},
  {v: '序幕'},
  {id: 'c0', n: '量', t: '剂量决定毒性', s: '一位瑞士医生的辩护、一瓶补铁片上的警告、为一台游戏机喝水的人、蚕豆和一种基因；要吃多少才出事', r: '1538—今'},
  {v: '卷一 · 桌上 —— 一起吃'},
  {id: 'c1', n: '克', t: '食物相克', s: '古书里的禁忌、饭店墙上的挂图、一位营养学家把相克的东西吃了一遍、一百个志愿者；两样放一起', r: '约 200—2008'},
  {id: 'c2', n: '石', t: '在胃里相遇的', s: '能解毒的石头和一个厨子、柿子和胃石、菠菜配豆腐、茶和铁；草酸遇到钙', r: '1575—今'},
  {id: 'c3', n: '生', t: '生的和熟的', s: '洗手的医生、伤寒玛丽的桃子冰激凌、别洗生鸡、芥末和白酒杀不了的东西；厨房里的一粒菌', r: '1847—2014'},
  {v: '卷二 · 药箱 —— 一起服'},
  {id: 'c4', n: '酒', t: '头孢配酒', s: '橡胶厂的工人和两个丹麦人的派对、乙醛和脸红、藏在药水里的酒；酒精走到哪一步', r: '1937—今'},
  {id: 'c5', n: '柚', t: '西柚和药', s: '为了遮住酒味的一杯果汁、肠壁上的一种酶、一杯管一天、柚子也算；一杯西柚汁之后', r: '1989—2012'},
  {id: 'c6', n: '奶', t: '拿什么送药', s: '一代人的四环素牙、钙铁镁铝、空腹和饭后、咖啡和甲状腺素；药盒上的时间表', r: '1948—今'},
  {id: 'c7', n: '叠', t: '一种成分，两盒药', s: '被冷落了几十年的退烧药、一盒十六片、名字不同成分相同、芝加哥的七个人；药箱里的对乙酰氨基酚', r: '1878—2011'},
  {id: 'c8', n: '怪', t: '看人的相克', s: '暴风雪里的一头死牛、奶酪和抗抑郁药、一个吃甘草糖的人、低钠盐；华法林的菠菜', r: '1921—2021'},
  {p: 2, t: '第二部 · 接着 —— 做完什么不能马上做什么'},
  {v: '卷三 · 饭后酒后'},
  {id: 'c9', n: '饭', t: '吃完以后', s: '饭后游泳会抽筋吗、吃完就躺、饭后百步走', r: '1908—今'},
  {id: 'c10', n: '醉', t: '喝完以后', s: '泡澡和桑拿、几个小时以后能开车、醉了侧着睡', r: '1874—今'},
  {id: 'c11', n: '跑', t: '跑完以后', s: '一停下就晕、大口灌冰水、横纹肌溶解和热射病', r: '1896—今'},
  {id: 'c12', n: '夜', t: '熬完以后', s: '困了开车像醉了开车、一下子站起来、洗完头就睡', r: '1960—今'},
  {v: '卷四 · 放多久'},
  {id: 'c13', n: '剩', t: '剩菜剩饭', s: '危险温度区、炒饭综合征、隔夜菜里的亚硝酸盐', r: '1970—今'},
  {id: 'c14', n: '泡', t: '泡发', s: '一锅酸汤子、泡了两天的木耳、米酵菌酸', r: '1895—2024'},
  {id: 'c15', n: '冻', t: '冻和化', s: '反复冻、台面上化一下午、冰箱里能放多久', r: '1924—今'},
  {id: 'c16', n: '后', t: '做完这件事以后', s: '吃了药能不能开车、潜水以后坐飞机、献完血、拔完牙', r: '1950—今'},
  {p: 3, t: '第三部 · 混用 —— 什么和什么不能混'},
  {v: '卷五 · 瓶子'},
  {id: 'c17', n: '氯', t: '八四和洁厕灵', s: '伊普尔的绿雾、1984 年的一瓶消毒液、漂白水和氨水', r: '1789—今'},
  {id: 'c18', n: '碱', t: '酸和碱', s: '两瓶疏通剂、醋配小苏打、双氧水和醋', r: '1900—今'},
  {id: 'c19', n: '锅', t: '锅碗和炉子', s: '微波炉里的勺子和鸡蛋、空烧的不粘锅和一只鸟、塑料盒', r: '1945—今'},
  {v: '卷六 · 电与火'},
  {id: 'c20', n: '电', t: '插座和电池', s: '插排串插排、湿手、楼道里充电的电动车', r: '1880—今'},
  {id: 'c21', n: '火', t: '着火的时候', s: '油锅泼水、灭火器的字母、别坐电梯、要命的是烟', r: '1666—今'},
  {id: 'c22', n: '气', t: '看不见的气', s: '一所学校的爆炸和煤气的臭味、一氧化碳、漏气了别开灯', r: '1937—今'},
  {id: 'c23', n: '救', t: '急救的错招', s: '流鼻血仰头、烫伤抹牙膏、鱼刺吞饭团、拍背还是抱腹', r: '1974—今'},
  {v: '尾声'},
  {id: 'c24', n: '贴', t: '一张冰箱贴', s: '常识怎样变成常识、全书判词、写一张自己的冰箱贴', r: '今'}
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

/* 章首：六样 + 三个方向 */
const DOM = [['吃', '食物'], ['药', '药品'], ['酒', '喝酒'], ['身', '身体'], ['洗', '清洁'], ['火', '火电气']];
$$('.acc').forEach(w => { const on = (w.dataset.a || '').split(/\s+/); w.innerHTML = DOM.map(f => '<span' + (on.includes(f[0]) ? ' class="on"' : '') + '><b>' + f[0] + '</b>' + f[1] + '</span>').join(''); });
$$('.ax').forEach(w => { const on = (w.dataset.x || '').split(/\s+/); w.innerHTML = ['一起', '接着', '混用'].map(f => '<span' + (on.includes(f) ? ' class="on"' : '') + '>' + f + '</span>').join(''); });
/* 年代条：古代—今，十一格 */
const ERA = [[-3000, 1500, '古代'], [1500, 1800, '1500'], [1800, 1900, '1800'], [1900, 1930, '1900'], [1930, 1950, '1930'], [1950, 1970, '1950'], [1970, 1990, '1970'], [1990, 2000, '1990'], [2000, 2010, '2000'], [2010, 2020, '2010'], [2020, 2100, '今']];
$$('.yrs').forEach(w => { const a = +w.dataset.a, b = +(w.dataset.b || w.dataset.a); w.innerHTML = ERA.map(e => '<span' + (b >= e[0] && a < e[1] ? ' class="on"' : '') + '>' + e[2] + '</span>').join(''); w.title = yr(a) + (b !== a ? '—' + yr(b) : ''); });
/* 来电记录的小电话、警示标签的三角 */
const PHONE = '<svg class="ring" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z" fill="currentColor"/></svg>';
$$('.call .hd').forEach(h => h.insertAdjacentHTML('afterbegin', PHONE));
const TRI = '<svg viewBox="0 0 54 48" aria-hidden="true"><path d="M27 3L51 45H3z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><rect x="24.6" y="16" width="4.8" height="16" rx="1.6" fill="currentColor"/><circle cx="27" cy="38.5" r="2.8" fill="currentColor"/></svg>';
$$('.label .in').forEach(h => h.insertAdjacentHTML('afterbegin', TRI));
/* 卷首：一个警示三角，旁边一样东西 */
$$('svg.vhd').forEach((s, k) => {
  s.setAttribute('viewBox', '0 0 170 110');
  let g = '<path d="M60 8L108 96H12z" fill="var(--warn)" stroke="var(--warn-ink)" stroke-width="4" stroke-linejoin="round"/><rect x="56" y="38" width="8" height="32" rx="2.5" fill="var(--warn-ink)"/><circle cx="60" cy="81" r="4.6" fill="var(--warn-ink)"/>';
  if (k % 2) g += '<g transform="rotate(-30 140 60)"><rect x="122" y="48" width="38" height="18" rx="9" fill="var(--ter)"/><rect x="141" y="49" width="18" height="16" fill="var(--card)"/><rect x="122" y="48" width="38" height="18" rx="9" fill="none" stroke="var(--ter)" stroke-width="2"/></g>';
  else g += '<path d="M128 40h22l-3 54h-16z" fill="none" stroke="var(--ter)" stroke-width="2.6"/><path d="M131 58h16" stroke="var(--ter)" stroke-width="2"/><circle cx="139" cy="30" r="5" fill="var(--main)"/><circle cx="148" cy="24" r="3.6" fill="var(--main)" opacity=".7"/>';
  s.innerHTML = g;
});
/* 判词：数一数这一页每种章各盖了几个 */
const STV = ['真', '看量', '看人', '半真', '假'];
/* 正态随机数、分位数、元 */
function gauss(r){ let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const pct = (arr, p) => { const s = [...arr].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))]; };
const yuan = n => (n < 0 ? '−' : '') + fmt(Math.abs(n)) + (Math.abs(n) >= 1e4 ? '元' : ' 元');
const wan = n => (n < 0 ? '−' : '') + String(+(Math.abs(n) / 1e4).toFixed(Math.abs(n) >= 1e5 ? 1 : 2)) + ' 万';
const pc = (x, d) => (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x * 100).toFixed(d == null ? 1 : d) + '%';

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
