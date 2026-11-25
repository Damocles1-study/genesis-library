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
  {p: 1, t: '第一部 · 摊 —— 普通人怎样做生意'},
  {v: '序幕'},
  {id: 'c0', n: '底', t: '先算最多亏多少', s: '一个没有积蓄、不想欠债的毕业生；一亿多户个体户；五种开法；能撑几个月', r: '今'},
  {v: '卷一 · 市 —— 古今的小买卖'},
  {id: 'c1', n: '担', t: '一副担子', s: '倚市门、货郎图、市籍和七科谪、牙行和牙帖；本钱少的人靠周转', r: '前 500—1900'},
  {id: 'c2', n: '证', t: '第一张执照', s: '温州一个十九岁的姑娘、雇工八人的算术、傻子瓜子、从个体户到私营企业', r: '1979—2022'},
  {id: 'c3', n: '网', t: '平台上的小店', s: '免费开店、双十一、网约车和外卖骑手、二选一和封号；抽成之后还剩多少', r: '2003—2026'},
  {v: '卷二 · 法 —— 五种开法'},
  {id: 'c4', n: '星', t: '天才的那条路', s: '八个叛徒和一张一百多万美元的支票、幂律、小黄车的押金；风投要的和你要的不一样', r: '1946—2023'},
  {id: 'c5', n: '攒', t: '先上班', s: '印刷学徒富兰克林、四十三岁的两万一千块、卖凉粉的饭店；创业者的平均年龄', r: '1718—2020'},
  {id: 'c6', n: '艺', t: '一门手艺', s: '一个人做了四年多的游戏、副业做成的一百二十亿美元、一千个铁杆粉丝；手艺归谁', r: '2001—2024'},
  {id: 'c7', n: '铺', t: '拿家底开店', s: '卓文君当垆、两店一年、快招公司、固定成本；开一家奶茶店', r: '前 130—2026'},
  {id: 'c8', n: '伙', t: '几个人凑钱', s: '富兰克林的酒鬼合伙人和一位寡妇、无限连带、五五开的僵局、肉夹馍；分股权', r: '1728—2014'},
  {p: 2, t: '第二部 · 路 —— AI 时代一个毕业生的岔路'},
  {v: '卷三 · 器 —— 新工具'},
  {id: 'c9', n: '器', t: '一个人干一个组的活', s: '印刷机、电子表格和会计；AI 改变了什么、没改变什么', r: '1450—2026'},
  {id: 'c10', n: '单', t: '一个人的公司', s: '十二个月十二个项目、六个月卖掉的一人公司、不拿风投的公司；超级个体的另一面', r: '2009—2026'},
  {id: 'c11', n: '卖', t: '第一个付钱的人', s: '拍鞋店的照片、一段演示视频、做不能规模化的事；有人付钱之前什么都不算', r: '1999—2026'},
  {id: 'c12', n: '坑', t: 'AI 时代的坑', s: '卖课、套壳、刷单、爬数据、借卡；不碰的清单', r: '2016—2026'},
  {v: '卷四 · 岔 —— 都没上怎么办'},
  {id: 'c13', n: '岔', t: '读研、考编、上岸', s: '应届生身份和择业期、年龄线、在编的人能不能做生意', r: '今'},
  {id: 'c14', n: '无', t: '三无的时候', s: '没工作、没积蓄、没门路：灵活就业、自己交社保、回家乡、学一门手艺', r: '今'},
  {id: 'c15', n: '步', t: '第一步', s: '不辞职、零库存、先卖后做、止损线；一张第一步的计划', r: '今'},
  {id: 'c16', n: '身', t: '一个人扛', s: '孤独、家人、身体和面子；什么时候回去上班', r: '今'},
  {p: 3, t: '第三部 · 账 —— 和钱搭上边'},
  {v: '卷五 · 钱'},
  {id: 'c17', n: '流', t: '赚钱了，钱呢', s: '利润和现金流、账期、库存；公私分开', r: '1494—2026'},
  {id: 'c18', n: '形', t: '个体户还是公司', s: '有限责任的边界、一人公司、合伙企业、个人担保', r: '1855—2024'},
  {id: 'c19', n: '税', t: '发票和税', s: '小规模纳税人、经营所得、记账；为什么要开发票', r: '今'},
  {id: 'c20', n: '借', t: '借钱的边界', s: '创业担保贷款、网贷、信用卡和夫妻共同债务；一个人背了两亿', r: '2013—2026'},
  {v: '卷六 · 大与退'},
  {id: 'c21', n: '股', t: '拿别人的钱', s: '天使、风投、对赌和控制权；一家餐厅的故事', r: '2008—2024'},
  {id: 'c22', n: '大', t: '做大', s: '雇第一个人、利润滚利润、把自己从流程里拿出来', r: '今'},
  {id: 'c23', n: '退', t: '收摊', s: '卖掉、关掉、转身；一个下架的游戏和一场还债的直播', r: '2014—2026'},
  {v: '尾声'},
  {id: 'c24', n: '张', t: '开张', s: '五年以后的沈舟；全书最多亏多少', r: '2032'}
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

/* 章首：五样本钱 */
const ACC = [['钱', '本钱'], ['时', '时间'], ['手', '手艺'], ['人', '人脉'], ['信', '信用']];
$$('.acc').forEach(w => { const on = (w.dataset.a || '').split(/\s+/); w.innerHTML = ACC.map(f => '<span' + (on.includes(f[0]) ? ' class="on"' : '') + '><b>' + f[0] + '</b>' + f[1] + '</span>').join(''); });
/* 年代条：前 600—今，十一格 */
const ERA = [[-600, 0, '先秦'], [0, 1000, '汉唐'], [1000, 1500, '宋明'], [1500, 1800, '近世'], [1800, 1950, '19世纪'], [1950, 1978, '1950'], [1978, 1992, '1978'], [1992, 2003, '1992'], [2003, 2014, '2003'], [2014, 2022, '2014'], [2022, 2100, '今']];
$$('.yrs').forEach(w => { const a = +w.dataset.a, b = +(w.dataset.b || w.dataset.a); w.innerHTML = ERA.map(e => '<span' + (b >= e[0] && a < e[1] ? ' class="on"' : '') + '>' + e[2] + '</span>').join(''); w.title = yr(a) + (b !== a ? '—' + yr(b) : ''); });
/* 卷首：一块遮阳棚和一间门面 */
$$('svg.awn').forEach((s, k) => {
  s.setAttribute('viewBox', '0 0 180 110');
  const n = 6, w = 150 / n, w2 = 134 / n;
  let g = '';
  for (let i = 0; i < n; i++) {
    const x0 = 15 + i * w, x1 = x0 + w, b0 = 23 + i * w2, b1 = b0 + w2, f = i % 2 ? 'var(--card)' : 'var(--main)';
    g += '<path d="M' + x0 + ' 20H' + x1 + 'L' + b1 + ' 46H' + b0 + 'Z" fill="' + f + '" stroke="var(--main)" stroke-width=".8"/>';
    g += '<path d="M' + b0 + ' 46Q' + (b0 + w2 / 2) + ' 56 ' + b1 + ' 46Z" fill="' + f + '" stroke="var(--main)" stroke-width=".8"/>';
  }
  g += '<rect x="30" y="58" width="120" height="48" fill="none" stroke="var(--ink-2)" stroke-width="1.5"/><rect x="78" y="70" width="24" height="36" fill="var(--ter)" opacity=".8"/><rect x="40" y="68" width="28" height="22" fill="none" stroke="var(--ink-3)"/><rect x="112" y="68" width="28" height="22" fill="none" stroke="var(--ink-3)"/>';
  g += '<rect x="64" y="3" width="52" height="15" rx="2" fill="var(--card)" stroke="var(--ink-2)"/>' + txt(90, 14.5, k % 2 ? '营业中' : '开 张', {s: 10, c: 'var(--main)', halo: false});
  s.innerHTML = g;
});
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
