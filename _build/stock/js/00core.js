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
const READY = 2; // 已经写好的部数
const PURL = {1: './', 2: 'two.html', 3: 'three.html'};
const TOC = [
  {p: 1, t: '第一部 · 盘 —— 市场是怎么回事'},
  {v: '序幕'},
  {id: 'c0', n: '袋', t: '外公的牛皮纸袋', s: '一张认购证、一本硬面抄、两万块学费；红涨绿跌；一手是多少，开户要多少钱', r: '1992 / 2026'},
  {v: '卷一 · 起 —— 股票和交易所是怎么来的'},
  {id: 'c1', n: '股', t: '一家公司切成一万份', s: '合伙、份额、有限责任；轮船招商局和 1883 年的股灾；分红、增发和“高送转”', r: '1553—2024'},
  {id: 'c2', n: '所', t: '梧桐树下', s: '咖啡馆里的价目表、二十四个经纪人、静安的小柜台、浦江饭店、深圳的排队；价格是怎样撮合出来的', r: '1698—1992'},
  {id: 'c3', n: '价', t: '一张纸凭什么值钱', s: '未来的钱折回今天；市场先生；市盈率；互联网泡沫和四十八块的中石油', r: '1934—2007'},
  {id: 'c4', n: '波', t: '醉汉的脚步', s: '随机游走、有效市场、肥尾和黑色星期一；K 线里看见的形状', r: '1900—2016'},
  {v: '卷二 · 声 —— 消息、政策和嘴'},
  {id: 'c5', n: '信', t: '消息跑得有多快', s: '信鸽、电报、十三毫秒的光缆；挑战者号那天的股价；你看到推送的时候', r: '1850—2010'},
  {id: 'c6', n: '策', t: '政策市', s: '三大救市政策、一篇评论员文章、半夜鸡叫、熔断四天、九二四；还有美联储主席的嘴', r: '1994—2025'},
  {id: 'c7', n: '嘴', t: '专家、黑嘴和大 V', s: '预测的成绩单、研报为什么不说卖、抢帽子、一条推文和一个“好时机”；巴尔的摩的来信', r: '1933—2025'},
  {id: 'c8', n: '局', t: '庄家、内幕和假账', s: '坐庄四步、乌龙指、账上消失的现金；真正值得深挖的是什么', r: '1998—2021'},
  {p: 2, t: '第二部 · 手 —— 自己下场'},
  {v: '卷三 · 场 —— 你坐在牌桌的哪个位置'},
  {id: 'c9', n: '散', t: '谁在赚谁的钱', s: '两亿五千万个账户；交易越多越亏；负和的那一截', r: '1990—2026'},
  {id: 'c10', n: '费', t: '看不见的费', s: '佣金、印花税、管理费、滑点；一个赌了十年的赌局', r: '1975—2017'},
  {id: 'c11', n: '指', t: '买下整个市场', s: '博格的“傻瓜基金”、指数和定投；为什么上证指数不等于 A 股', r: '1976—2026'},
  {id: 'c12', n: '心', t: '脑子里的坑', s: '损失厌恶、拿着亏的卖掉赚的、过度自信、锚和羊群', r: '1979—2020'},
  {v: '卷四 · 路 —— 怎样下场'},
  {id: 'c13', n: '杠', t: '借来的钱', s: '融资、配资、期货期权；2015 年夏天的强平', r: '1929—2015'},
  {id: 'c14', n: '外', t: '港卡和美股', s: '外汇额度、港股通、QDII 的溢价、跨境券商整治、税和遗产税、汇率', r: '2006—2026'},
  {id: 'c15', n: '币', t: '币圈', s: '一块披萨、交易所跑路、九二四通知、稳定币；它在中国是什么', r: '2008—2026'},
  {id: 'c16', n: '学', t: '交学费', s: '模拟盘还是真钱、多少钱起步、交易日记、读年报；第一年该做什么', r: '今'},
  {p: 3, t: '第三部 · 花 —— 钱拿来干什么'},
  {v: '卷五 · 序 —— 先后'},
  {id: 'c17', n: '先', t: '先后', s: '应急金、保险、高息债、自己、体验、投资：一笔钱该先填哪个坑', r: '今'},
  {id: 'c18', n: '病', t: '老了一场大病', s: '省一辈子、一病花光：医保、大病保险和预防性储蓄', r: '1951—2026'},
  {id: 'c19', n: '房', t: '买房还是租房', s: '“智商税”的说法、租售比、杠杆和七十年；房子是消费品、投资品还是户口本', r: '1998—2026'},
  {id: 'c20', n: '车', t: '买车还是打车', s: '折旧、停车费和自由；一辆车一年真正花多少', r: '1908—2026'},
  {v: '卷六 · 苦与乐'},
  {id: 'c21', n: '游', t: '旅游还是显卡', s: '体验和东西、记忆的利息、什么时候花最值', r: '今'},
  {id: 'c22', n: '省', t: '他们这么苦图什么', s: '提前退休运动、百分之四、戒糖健身狂攒钱：苦行的人在买什么', r: '1992—2026'},
  {id: 'c23', n: '享', t: '老一辈的存折', s: '高储蓄率是怎么来的；省钱一生和享福一生之间', r: '1978—2026'},
  {v: '尾声'},
  {id: 'c24', n: '收', t: '收盘', s: '外公的最后一页硬面抄；红与绿', r: '2027'}
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

/* 章首：五样 */
const ACC = [['价', '价格'], ['信', '消息'], ['本', '本钱'], ['心', '人心'], ['时', '时间']];
$$('.acc').forEach(w => { const on = (w.dataset.a || '').split(/\s+/); w.innerHTML = ACC.map(f => '<span' + (on.includes(f[0]) ? ' class="on"' : '') + '><b>' + f[0] + '</b>' + f[1] + '</span>').join(''); });
/* 年代条：1550—今，十一格 */
const ERA = [[1550, 1700, '17世纪'], [1700, 1800, '18'], [1800, 1900, '19'], [1900, 1946, '1900'], [1946, 1990, '1950'], [1990, 2000, '1990'], [2000, 2007, '2000'], [2007, 2015, '2007'], [2015, 2020, '2015'], [2020, 2026, '2020'], [2026, 2100, '今']];
$$('.yrs').forEach(w => { const a = +w.dataset.a, b = +(w.dataset.b || w.dataset.a); w.innerHTML = ERA.map(e => '<span' + (b >= e[0] && a < e[1] ? ' class="on"' : '') + '>' + e[2] + '</span>').join(''); w.title = a + (b !== a ? '—' + b : ''); });
/* 卷首：几根 K 线 */
$$('svg.kl').forEach((s, k) => {
  s.setAttribute('viewBox', '0 0 180 110'); const r = rng(7 + k * 13); let p = 60, g = '';
  for (let i = 0; i < 14; i++) {
    const o = p, c = clamp(o + (r() - .48) * 22, 14, 96), hi = Math.min(o, c) - r() * 9, lo = Math.max(o, c) + r() * 9, x = 8 + i * 12.2, up = c < o, col = up ? 'var(--up)' : 'var(--dn)';
    g += '<line x1="' + (x + 4) + '" x2="' + (x + 4) + '" y1="' + hi.toFixed(1) + '" y2="' + lo.toFixed(1) + '" stroke="' + col + '" stroke-width="1.2"/><rect x="' + x + '" y="' + Math.min(o, c).toFixed(1) + '" width="8" height="' + Math.max(1.5, Math.abs(c - o)).toFixed(1) + '" fill="' + col + '"/>';
    p = c;
  }
  s.innerHTML = g;
});
/* 红涨 / 绿涨：只换颜色，不换数据 */
const UDK = 'genesis-stock-ud';
function setUD(v){
  if (v === 'us') document.documentElement.dataset.ud = 'us'; else delete document.documentElement.dataset.ud;
  const b = $('#udBtn'); if (b) b.innerHTML = v === 'us' ? '<i>绿</i>涨' : '<i>红</i>涨';
}
try { setUD(localStorage.getItem(UDK) || 'cn'); } catch (e) { setUD('cn'); }
$('#udBtn').addEventListener('click', () => { const v = document.documentElement.dataset.ud === 'us' ? 'cn' : 'us'; setUD(v); try { localStorage.setItem(UDK, v); } catch (e) {} });
/* 上证综指年末收盘（取两位小数，来自公开行情；2025 年为 3968.84）与标普 500 年末收盘（美元） */
const SH = {1990: 127.61, 1991: 292.75, 1992: 780.39, 1993: 833.80, 1994: 647.87, 1995: 555.29, 1996: 917.02, 1997: 1194.10, 1998: 1146.70, 1999: 1366.58, 2000: 2073.48, 2001: 1645.97, 2002: 1357.65, 2003: 1497.04, 2004: 1266.50, 2005: 1161.06, 2006: 2675.47, 2007: 5261.56, 2008: 1820.81, 2009: 3277.14, 2010: 2808.08, 2011: 2199.42, 2012: 2269.13, 2013: 2115.98, 2014: 3234.68, 2015: 3539.18, 2016: 3103.64, 2017: 3307.17, 2018: 2493.90, 2019: 3050.12, 2020: 3473.07, 2021: 3639.78, 2022: 3089.26, 2023: 2974.93, 2024: 3351.76, 2025: 3968.84};
const SP = {1990: 330.22, 1991: 417.09, 1992: 435.71, 1993: 466.45, 1994: 459.27, 1995: 615.93, 1996: 740.74, 1997: 970.43, 1998: 1229.23, 1999: 1469.25, 2000: 1320.28, 2001: 1148.08, 2002: 879.82, 2003: 1111.92, 2004: 1211.92, 2005: 1248.29, 2006: 1418.30, 2007: 1468.36, 2008: 903.25, 2009: 1115.10, 2010: 1257.64, 2011: 1257.60, 2012: 1426.19, 2013: 1848.36, 2014: 2058.90, 2015: 2043.94, 2016: 2238.83, 2017: 2673.61, 2018: 2506.85, 2019: 3230.78, 2020: 3756.07, 2021: 4766.18, 2022: 3839.50, 2023: 4769.83, 2024: 5881.63, 2025: 6845.50};
/* K 线：bars=[{o,h,l,c}]，画进 svg */
function candles(svg, bars, o){
  o = o || {}; const W = o.W || 300, H = o.H || 150, P = 6;
  let lo = Infinity, hi = -Infinity; bars.forEach(b => { lo = Math.min(lo, b.l); hi = Math.max(hi, b.h); });
  const Y = v => P + (1 - (v - lo) / (hi - lo || 1)) * (H - 2 * P), dx = (W - 2 * P) / bars.length, bw = Math.max(1.5, dx * .62);
  let g = '';
  bars.forEach((b, i) => { const x = P + i * dx + dx / 2, col = b.c >= b.o ? 'var(--up)' : 'var(--dn)';
    g += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + Y(b.h).toFixed(1) + '" y2="' + Y(b.l).toFixed(1) + '" stroke="' + col + '" stroke-width="1"/>';
    g += '<rect x="' + (x - bw / 2).toFixed(1) + '" y="' + Y(Math.max(b.o, b.c)).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(1, Math.abs(Y(b.o) - Y(b.c))).toFixed(1) + '" fill="' + col + '"/>'; });
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
}
/* 正态随机数、分位数、元 */
function gauss(r){ let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const pct = (arr, p) => { const s = [...arr].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))]; };
const yuan = n => (n < 0 ? '−' : '') + fmt(Math.abs(n)) + (Math.abs(n) >= 1e4 ? '元' : ' 元');
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
