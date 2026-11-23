(function(){
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const fmt = n => n >= 1e8 ? (n / 1e8).toFixed(1) + ' 亿' : n >= 1e4 ? (Math.round(n / 1e3) / 10).toLocaleString() + ' 万' : Math.round(n).toLocaleString();
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
/* 年份：负数是公元前；一万年以前写成“约 N 万年前” */
const yr = y => y <= -10000 ? '约 ' + fmt(-y + 2000).replace(' ', '') + '年前' : y < 0 ? '前 ' + (-y) : String(y);
const btnRow = (box, items, cur, cb) => {
  box.innerHTML = items.map((t, i) => '<button class="btn' + (i === cur ? ' on' : '') + '" data-i="' + i + '">' + t + '</button>').join('');
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', box).forEach(x => x.classList.toggle('on', x === b)); cb(+b.dataset.i); });
};
const dev = (sel, fn) => { const el = $(sel); if (el) { try { fn(el); } catch (err) { console.error(sel, err); } } };
const kv = (box, rows) => { box.innerHTML = rows.map(r => '<div>' + r[0] + '<b>' + r[1] + '</b></div>').join(''); };
function txt(x, y, t, o){ o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.s || 13) + '" fill="' + (o.c || 'var(--ink)') + '" text-anchor="' + (o.a || 'middle') + '"' + (o.w ? ' font-weight="700"' : '') + (o.halo === false ? '' : ' paint-order="stroke" stroke="' + (o.hc || 'var(--card)') + '" stroke-width="3.5" stroke-linejoin="round"') + '>' + t + '</text>'; }
/* 滑块：绑定 input 与 output，返回读数函数 */
/* 初始化时只写读数，不调回调（回调里常用到还没赋值的读数函数），装置自己再调一次 draw() */
function slider(id, f, cb){ const r = $('#' + id), o = $('#' + id + 'O'); const go = init => { if (o) o.textContent = f ? f(+r.value) : r.value; if (cb && !init) cb(+r.value); }; r.addEventListener('input', () => go(false)); go(true); return () => +r.value; }

/* ---------- 全书目录（三个网页共用） ---------- */
const PAGE = /three\.html/.test(location.pathname) ? 3 : /two\.html/.test(location.pathname) ? 2 : 1;
const READY = 3; // 已经写好的部数
const PURL = {1: './', 2: 'two.html', 3: 'three.html'};
const TOC = [
  {p: 1, t: '第一部 · 火与种 —— 两百万年到三千年前'},
  {v: '序幕'},
  {id: 'c0', n: '饭', t: '吃了吗', s: '一句问候的来历；人一辈子吃掉多少；一天里有几个钟头是在给嘴干活', r: '古今'},
  {v: '卷一 · 生 —— 从生到熟'},
  {id: 'c1', n: '火', t: '第一口熟食', s: '烹饪假说：火怎样替人嚼、替人消化，换来一个大脑袋', r: '约 200 万—40 万年前'},
  {id: 'c2', n: '猎', t: '打猎的和挖块茎的', s: '骨髓、蜂蜜、块茎；分肉为什么比打到肉要紧；没有一种“原始人饮食”', r: '约 260 万—1 万年前'},
  {v: '卷二 · 种 —— 把野草和野兽留在身边'},
  {id: 'c3', n: '麦', t: '一株不掉粒的麦子', s: '新月沃地、先有面包后有农业、驯化慢得出奇；农民为什么变矮了', r: '约 1.4 万—5000 年前'},
  {id: 'c4', n: '稻', t: '粟、稻和社稷', s: '北方的小米、南方的稻、西边来的麦；面条、石磨、占城稻；葵怎样被白菜挤下了桌', r: '约 1 万年前—宋'},
  {id: 'c5', n: '畜', t: '六畜', s: '狗、羊、猪、牛、鸡、马；鸡起初不是养来吃的；喝奶的基因怎样在几千年里传开', r: '约 1.5 万—3000 年前'},
  {v: '卷三 · 变 —— 让食物变个样子'},
  {id: 'c6', n: '酵', t: '看不见的厨子', s: '啤酒和面包、酒曲、酱、奶酪、鱼露：人类和微生物合伙做饭', r: '约 9000 年前—今'},
  {id: 'c7', n: '盐', t: '白色的税', s: '离不开的盐、煮海和凿井、盐铁专卖、私盐贩子造反、甘地走到海边', r: '前 2000—1930'},
  {id: 'c8', n: '灶', t: '锅、灶和最早的菜谱', s: '两万年前的陶罐、鼎和甑、巴比伦泥板上的炖菜、炒菜为什么晚、灶里烧什么', r: '约 2 万年前—宋'},
  {p: 2, t: '第二部 · 路与桌 —— 食物跨海翻山，摆上餐桌'},
  {v: '卷四 · 路 —— 走远路的食物'},
  {id: 'c9', n: '香', t: '胡椒的价钱', s: '香料之路、肉豆蔻和战争、为什么中世纪欧洲人那么爱香料', r: '前 1000—1700'},
  {id: 'c10', n: '换', t: '大交换', s: '土豆、玉米、番茄、辣椒、可可去了旧大陆，小麦、牛、马、糖和病菌去了新大陆', r: '1492—1800'},
  {id: 'c11', n: '薯', t: '番薯、玉米和辣椒进中国', s: '一个福建商人藏在船里的藤；山地被开垦；辣椒怎样替贵州人省下盐', r: '1550—1850'},
  {id: 'c12', n: '瘾', t: '糖、茶、咖啡和巧克力', s: '提神的、上瘾的、让工人熬夜的：四样饮料怎样改变世界', r: '1600—1900'},
  {v: '卷五 · 桌 —— 怎样吃，和谁吃，不吃什么'},
  {id: 'c13', n: '馆', t: '饭馆和菜单', s: '汴京的夜市、杭州的酒楼、巴黎的“恢复元气的汤”，以及菜系是怎样被发明的', r: '960—1900'},
  {id: 'c14', n: '筷', t: '筷子、刀叉和手', s: '三种吃法、一把叉子引起的丑闻、餐桌礼仪怎样一层一层加上去', r: '前 1200—今'},
  {id: 'c15', n: '忌', t: '不吃什么', s: '猪、牛、狗、马、虫子：禁忌的来历，和“恶心”是怎样学会的', r: '古今'},
  {id: 'c16', n: '饥', t: '饥荒', s: '饥荒很少只是因为没粮食：爱尔兰、孟加拉、中国的几次大饥荒和阿马蒂亚·森', r: '1590—1960'},
  {p: 3, t: '第三部 · 厂与秤 —— 工厂、实验室和体重秤'},
  {v: '卷六 · 存 —— 让食物不坏，让地里长出更多'},
  {id: 'c17', n: '罐', t: '罐头、冰和冷链', s: '拿破仑的悬赏、卖冰的人、冰箱、冷链：一年四季吃同样的东西', r: '1795—1990'},
  {id: 'c18', n: '氮', t: '从空气里拿面包', s: '鸟粪战争、哈伯—博施法、绿色革命、杂交水稻：化肥养活了多少人', r: '1840—2000'},
  {id: 'c19', n: '维', t: '少了一点点', s: '坏血病、脚气病、糙皮病：人类花了几百年才明白，有些病是“缺”出来的', r: '1747—1940'},
  {v: '卷七 · 秤 —— 吃得太多的时代'},
  {id: 'c20', n: '脂', t: '脂肪和糖的官司', s: '一场打了半个世纪的营养学官司，以及“膳食指南”是怎样写出来的', r: '1950—2020'},
  {id: 'c21', n: '快', t: '快餐、方便面和外卖', s: '流水线搬进厨房：汉堡、方便面、超市和骑手', r: '1920—今'},
  {id: 'c22', n: '胖', t: '第一次吃得太多', s: '人类历史上第一次，胖的人比饿的人多：为什么，怎么办', r: '1970—今'},
  {id: 'c23', n: '票', t: '粮票到外卖', s: '一个国家七十年的饭桌：统购统销、粮票、菜篮子、吃饱、吃好', r: '1949—今'},
  {v: '尾声'},
  {id: 'c24', n: '明', t: '明天吃什么', s: '人造肉、虫子、气候和一碗米饭的将来', r: '今—'}
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
$$('a[data-c]').forEach(a => { const id = a.dataset.c; if (chapPage[id] > READY) { a.removeAttribute('href'); a.title = '写作中'; a.style.textDecorationStyle = 'dotted'; a.style.opacity = .6; } else a.href = href(id); });
$$('.partnav a[data-c]').forEach(a => { if (!a.hasAttribute('href')) a.style.opacity = .55; });

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

/* 章首：饭桌上的六样 */
const PLATE = [['火', '火候'], ['粮', '主食'], ['肉', '肉奶'], ['味', '滋味'], ['器', '锅碗'], ['身', '身体']];
$$('.plate').forEach(w => { const on = (w.dataset.k || '').split(/\s+/); w.innerHTML = PLATE.map(f => '<span' + (on.includes(f[0]) ? ' class="on"' : '') + '><b>' + f[0] + '</b>' + f[1] + '</span>').join(''); });
/* 年代条：两百万年前—今，越往近格子越细 */
const ERA = [['200万', -2e6, -5e5], ['50万', -5e5, -1e5], ['10万', -1e5, -2e4], ['2万', -2e4, -1e4], ['1万', -1e4, -3000], ['前3千', -3000, 0], ['公元', 0, 1000], ['1000', 1000, 1500], ['1500', 1500, 1800], ['1800', 1800, 1900], ['1900', 1900, 2100]];
$$('.when').forEach(w => { const a = +w.dataset.a, b = +(w.dataset.b || w.dataset.a); w.innerHTML = ERA.map(e => '<span' + (b >= e[1] && a < e[2] ? ' class="on"' : '') + '>' + e[0] + '</span>').join(''); w.title = yr(a) + (b !== a ? ' — ' + yr(b) : ''); });
/* 卷首：一只碗 */
$$('svg.bowl').forEach(s => {
  s.setAttribute('viewBox', '0 0 130 96');
  s.innerHTML = '<path d="M10 44h110a55 44 0 0 1-110 0z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M48 88h34" stroke="currentColor" stroke-width="2.4"/>' +
    '<path d="M86 6l-14 34M104 10l-20 30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M40 40q4-10 8 0q4-10 8 0q4-10 8 0q4-10 8 0" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
    '<text x="65" y="74" font-size="26" text-anchor="middle" fill="currentColor" font-family="var(--f-display)">' + (s.dataset.t || '食') + '</text>';
});
/* 正态随机数、分位数 */
function gauss(r){ let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const pct = (arr, p) => { const s = [...arr].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))]; };

/* 通用小折线图：series=[{name,color,pts:[[x,y]...],dash,dots,w}]，opt={xmin,xmax,ymin,ymax,xt,yt,xf,yf,marks:[[x,label]],H,L} */
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
    if (!pts.length) return;
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

/* ---------- 极简世界示意地图（从《轮到谁了》搬来，只为看清方位） ---------- */
const WORLD = {
  na: [[-110, 60], [-80, 60], [-77, 45], [-70, 42], [-76, 35], [-81, 31], [-80, 25.5], [-82, 28], [-84, 30], [-90, 29.5], [-97, 28], [-97, 22], [-95, 18.5], [-91, 19], [-87, 21], [-88, 16], [-83, 15], [-83, 10], [-79.5, 9.3], [-77, 8], [-78, 7.5], [-80, 7.5], [-85, 10], [-87, 13], [-92, 14.5], [-96, 15.8], [-100, 17], [-105, 20], [-106, 23], [-110, 24]],
  sa: [[-77, 8], [-72, 12], [-63, 10.5], [-52, 4], [-50, 0], [-44, -2.5], [-35, -5.5], [-39, -13], [-41, -22], [-48, -26], [-49, -32], [-71.5, -32], [-71, -18], [-76, -14], [-81, -6], [-80, -1], [-78, 2]],
  cuba: [[-85, 22], [-80, 23.2], [-74.2, 20.2], [-77.5, 19.9], [-82, 22]],
  afr: [[-6, 35.8], [-17, 21], [-17, 14.7], [-12, 7], [-8, 4.5], [0, 5.5], [9, 4], [9.5, 1], [13, -6], [12, -17], [15, -27], [16, -32], [29, -32], [33, -26], [35, -22], [40, -15], [40, -10], [39, -5], [42, -1], [51, 11.5], [44, 11], [39, 17], [34, 27], [32.5, 30], [29, 31], [20, 32], [20, 30.5], [15, 32], [10, 34], [11, 37], [0, 35.8]],
  eur: [[-9, 43], [-9, 37], [-6, 36.8], [-2, 36.7], [3, 42], [6, 43.3], [9, 44.4], [12.3, 41.7], [16, 38], [18.5, 40.2], [13, 45.6], [19.5, 41.5], [24, 37.8], [26, 40.5], [29, 41], [36, 36.5], [35.5, 33.5], [34.5, 31.5], [32.5, 30], [34.5, 28], [39, 21], [43, 13], [45, 13], [52, 16], [56, 22.5], [59, 22.5], [56, 26], [50, 30], [48, 30], [51, 27], [56.5, 27], [61, 25], [67, 24.5], [73, 19], [77, 8], [80, 10], [80, 15], [86, 20], [90, 22], [94, 17], [98, 16], [98, 8], [100.5, 4], [103.5, 1.3], [101, 6.5], [100, 13], [104, 10.5], [106, 9], [109, 12], [106.5, 20], [110, 21], [113, 22.3], [117, 23.5], [119.5, 26], [122, 30], [121, 32], [120, 35], [122.5, 37], [118, 38], [117.5, 39], [121, 40.5], [122, 39], [125, 39.8], [127.5, 38], [129, 35], [127, 34.5], [126, 37], [125, 40], [130, 42.5], [131, 60], [30, 60], [10, 60], [5, 58], [8, 57], [9, 54], [4.5, 52.5], [2, 51], [-1.5, 49.6], [-4.6, 48.4], [-1.2, 46], [-1.8, 43.4]],
  jp: [[130, 31], [131.5, 33.5], [135, 34], [140, 35.5], [141, 38], [141.5, 41], [140, 40], [139, 38], [136, 36.8], [133, 35.5], [130.5, 33.8]],
  ph: [[120, 18.5], [122, 18.5], [121.5, 14], [124, 13], [125.5, 9.5], [124, 6.5], [122, 7], [123, 10], [120.5, 14.5]],
  bor: [[109, 1.5], [111, 2.8], [116, 7], [119, 5], [117.5, 1], [116, -3.5], [111, -3], [109.5, -1]],
  sum: [[95.5, 5.5], [98.5, 3.5], [103.5, -1], [106, -5.8], [104, -5.5], [100, -1], [95.5, 3]],
  jav: [[105.5, -6], [114.5, -7.7], [114, -8.6], [106, -7]],
  mad: [[49.5, -12], [50.5, -16], [47, -25], [44, -23], [44, -16]],
  aus: [[114, -22], [122, -18], [130, -12], [136, -12], [136, -15], [141, -12.5], [143, -14], [146, -19], [150, -22.5], [153, -28], [153, -32], [115, -32]],
  ire: [[-6.0, 52.2], [-6.1, 53.4], [-5.9, 54.6], [-7.3, 55.3], [-8.3, 55.2], [-10.0, 54.2], [-9.6, 53.2], [-10.3, 52.0], [-9.4, 51.5], [-8.0, 51.8]],
  ceyl: [[80, 9.8], [81.8, 7.5], [81, 6], [80, 6.2]]
};
WORLD.brit = [[-5.7, 50.05], [-3.5, 50.2], [-1.0, 50.75], [1.4, 51.15], [1.75, 52.5], [0.3, 53.4], [-0.2, 54.5], [-1.6, 55.6], [-2.0, 57.6], [-3.3, 58.6], [-5.0, 58.6], [-6.2, 56.7], [-5.6, 55.3], [-4.9, 54.8], [-3.0, 54.0], [-3.1, 53.3], [-4.6, 53.3], [-4.1, 52.3], [-5.3, 51.7], [-3.2, 51.4], [-4.5, 51.0]];
WORLD.west = [[-105, 20], [-106, 23], [-110, 24], [-109.5, 23], [-112, 26.5], [-114.5, 30], [-117, 32.5], [-120.5, 34.5], [-122.5, 37.7], [-124, 40.5], [-124.5, 43], [-124, 46.5], [-124.7, 48.4], [-123, 49], [-127, 51], [-130, 55], [-130, 56], [-105, 56]];
WORLD.ng = [[131, -1.5], [141, -2.6], [147.5, -6], [150, -10.5], [146, -8.5], [141, -9.2], [137.5, -5], [132, -4]];
/* worldMap({lon0, lon1, lat0, lat1, W}) → {svg, P}：等距圆柱，海是底色 */
function worldMap(o){
  const sx = o.W / (o.lon1 - o.lon0), H = Math.round((o.lat1 - o.lat0) * sx);
  const P = (lon, lat) => [(lon - o.lon0) * sx, (o.lat1 - lat) * sx];
  const poly = pts => 'M' + pts.map(p => P(p[0], p[1]).map(v => v.toFixed(1)).join(',')).join('L') + 'Z';
  let g = '<rect width="' + o.W + '" height="' + H + '" fill="var(--sea)"/>';
  for (let lat = Math.ceil(o.lat0 / 30) * 30; lat < o.lat1; lat += 30) g += '<line y1="' + P(0, lat)[1] + '" y2="' + P(0, lat)[1] + '" x1="0" x2="' + o.W + '" stroke="var(--ink-3)" stroke-opacity="' + (lat ? .15 : .35) + '"/>';
  Object.values(WORLD).forEach(s => g += '<path d="' + poly(s) + '" fill="var(--land)" stroke="var(--ink-3)" stroke-width=".6" stroke-linejoin="round"/>');
  return {svg: g, P, W: o.W, H, poly};
}
