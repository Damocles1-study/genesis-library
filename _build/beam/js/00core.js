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
const READY = 1; // 已经写好的部数
const PURL = {1: './', 2: 'two.html', 3: 'three.html'};
const TOC = [
  {p: 1, t: '第一部 · 土木 —— 四样家当，三种站法'},
  {v: '序幕'},
  {id: 'c0', n: '窝', t: '人为什么要盖房子', s: '鸟窝、海狸坝和白蚁塚；四十七万年前的两根木头；一栋楼有多重', r: '约 47 万年前—今'},
  {v: '卷一 · 材 —— 四样家当'},
  {id: 'c1', n: '泥', t: '一捧土怎样站起来', s: '土坯和夯土；“筑之登登”；锥子扎进一寸就杀人的统万城；全城一起抹墙的杰内', r: '约前 9000—今'},
  {id: 'c2', n: '木', t: '榫卯和皇木', s: '河姆渡的榫头；二十年一拆的神宫；“入山一千，出山五百”；钉子便宜以后的气球框架', r: '约前 5000—今'},
  {id: 'c3', n: '石', t: '拉石头的人', s: '巨石阵、金字塔和梅勒的日记；往沙子上泼水；印加的石墙；两万人拉一块石头进京', r: '约前 9500—1600'},
  {id: 'c4', n: '砖', t: '砖上的名字', s: '烧透了的砖；巴别塔和伊什塔尔门；物勒工名；南京城墙砖上的名字；砖税', r: '约前 3500—1850'},
  {v: '卷二 · 力 —— 让它站住'},
  {id: 'c5', n: '梁', t: '石头怕弯', s: '柱子和横梁；神庙为什么是一片柱林；伽利略的悬臂梁；抬梁和穿斗', r: '约前 2500—1700'},
  {id: 'c6', n: '拱', t: '拱的道理', s: '楔石和拱架；罗马的水道；赵州桥；胡克的倒挂链子', r: '约前 1300—1700'},
  {id: 'c7', n: '穹', t: '盖一个天', s: '万神殿、圣索菲亚、佛罗伦萨大教堂；穹顶下半截为什么要箍铁链', r: '约前 1250—1750'},
  {id: 'c8', n: '斗', t: '斗拱和法式', s: '“以材为祖”；李诫的《营造法式》；应县木塔；梁思成骑骡子找到佛光寺', r: '782—1937'},
  {p: 2, t: '第二部 · 匠作 —— 谁来盖，怎样盖，塌了怎么办'},
  {v: '卷三 · 人 —— 图纸、尺子和搬砖的人'},
  {id: 'c9', n: '役', t: '谁在搬砖', s: '徭役、金字塔工人村、长城、罗马军团、奴隶和雇工、包工头', r: '前 2600—今'},
  {id: 'c10', n: '图', t: '图纸', s: '维特鲁威；《营造法式》的图样；样式雷的烫样；蓝图怎样晒出来；电脑画图', r: '前 30—今'},
  {id: 'c11', n: '尺', t: '一把尺子', s: '腕尺和鲁班尺；黄金比例的传说；模数；一块砖为什么是这个大小', r: '前 3000—今'},
  {id: 'c12', n: '吊', t: '往上搬', s: '滑轮、罗马人踩的大轮子、竹脚手架、塔吊', r: '前 500—今'},
  {v: '卷四 · 天 —— 风雨、冷热和地震'},
  {id: 'c13', n: '尖', t: '大教堂', s: '尖拱和飞扶壁；几代人盖一座；博韦塌了两次', r: '1140—1600'},
  {id: 'c14', n: '塌', t: '塌了以后', s: '汉谟拉比第 229 条；里斯本、旧金山、唐山、汶川；规范是用命写的', r: '前 1750—今'},
  {id: 'c15', n: '顶', t: '屋顶', s: '茅草、瓦和举折；屋顶为什么是弯的；防水这门手艺', r: '约前 8000—今'},
  {id: 'c16', n: '暖', t: '冷和热', s: '火炕、罗马的地暖、波斯的风塔、窑洞和冰屋：空调以前的房子', r: '约前 5000—1950'},
  {p: 3, t: '第三部 · 钢与玻璃 —— 新家当，往高处去'},
  {v: '卷五 · 新家当'},
  {id: 'c17', n: '铁', t: '铁桥和水晶宫', s: '1779 年的铁桥；九个月盖起来的水晶宫；埃菲尔铁塔', r: '1779—1889'},
  {id: 'c18', n: '灰', t: '水泥', s: '罗马混凝土为什么失传；斯米顿的灯塔；波特兰水泥；花匠发明的钢筋混凝土', r: '1756—1930'},
  {id: 'c19', n: '窗', t: '玻璃窗', s: '窗户纸、皇冠玻璃、窗户税、浮法玻璃和玻璃幕墙', r: '100—1960'},
  {id: 'c20', n: '管', t: '看不见的房子', s: '上下水、电灯、电梯、暖气和空调：墙里的东西', r: '1850—1960'},
  {v: '卷六 · 往高处去'},
  {id: 'c21', n: '楼', t: '摩天楼', s: '奥的斯砍断绳子；芝加哥的钢骨；纽约的竞高；风比重量更难对付', r: '1853—今'},
  {id: 'c22', n: '桥', t: '拉住的桥', s: '布鲁克林大桥、塔科马海峡桥、金门大桥、港珠澳大桥', r: '1883—今'},
  {id: 'c23', n: '快', t: '一天盖一层', s: '预制板、莱维敦、赫鲁晓夫楼、筒子楼、商品房和“中国速度”', r: '1945—今'},
  {v: '尾声'},
  {id: 'c24', n: '梁', t: '上梁', s: '拆和留、碳、三十年和一百年：你住的房子', r: '今—'}
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

/* 章首：六样家当 */
const MAT = [['土', '泥土'], ['木', '木头'], ['石', '石头'], ['火', '烧制'], ['力', '受力'], ['人', '人手']];
$$('.mat').forEach(w => { const on = (w.dataset.k || '').split(/\s+/); w.innerHTML = MAT.map(f => '<span' + (on.includes(f[0]) ? ' class="on"' : '') + '><b>' + f[0] + '</b>' + f[1] + '</span>').join(''); });
/* 年代条：五十万年前—今，越往近格子越细 */
const ERA = [['50万', -5e5, -5e4], ['5万', -5e4, -1.2e4], ['1.2万', -1.2e4, -5000], ['前5千', -5000, -2000], ['前2千', -2000, 0], ['公元', 0, 1000], ['1000', 1000, 1400], ['1400', 1400, 1700], ['1700', 1700, 1850], ['1850', 1850, 1950], ['1950', 1950, 2100]];
$$('.when').forEach(w => { const a = +w.dataset.a, b = +(w.dataset.b || w.dataset.a); w.innerHTML = ERA.map(e => '<span' + (b >= e[1] && a < e[2] ? ' class="on"' : '') + '>' + e[0] + '</span>').join(''); w.title = yr(a) + (b !== a ? ' — ' + yr(b) : ''); });
/* 卷首：一副梁架，正中挂红 */
$$('svg.frame').forEach(s => {
  s.setAttribute('viewBox', '0 0 150 100');
  s.innerHTML = '<path d="M8 52L75 10l67 42" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M26 44v52M124 44v52M26 60h98M46 60v-22M104 60v-22M46 38h58M75 38v-28" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<path d="M66 12h18l-3 12h-12z" fill="var(--ter)"/>' +
    '<text x="75" y="88" font-size="22" text-anchor="middle" fill="currentColor" font-family="var(--f-display)">' + (s.dataset.t || '梁') + '</text>';
});
/* 工牌上的人：data-h = helmet 安全帽 / wrap 头巾 / hat 斗笠 / cap 软帽 / veil 包头（女）/ bare 不戴 */
$$('.badge .ph').forEach(p => {
  const h = p.dataset.h || 'bare';
  const head = '<circle cx="39" cy="40" r="15" fill="currentColor" opacity=".35"/>';
  const body = '<path d="M10 96c2-22 14-30 29-30s27 8 29 30z" fill="currentColor" opacity=".35"/>';
  const hw = {
    helmet: '<path d="M22 38a17 15 0 0 1 34 0z" fill="var(--och)"/><rect x="18" y="36" width="42" height="4" rx="2" fill="var(--och)"/>',
    wrap: '<path d="M24 35q15-12 30 0" fill="none" stroke="var(--ter)" stroke-width="6"/><path d="M53 33l9 8" stroke="var(--ter)" stroke-width="3"/>',
    hat: '<path d="M8 34L39 15l31 19z" fill="var(--kraft)"/>',
    cap: '<path d="M24 34q2-14 15-14t16 12l-4 3q-10-6-27-1z" fill="var(--main)"/>',
    veil: '<path d="M22 42q-2-20 17-21t17 21v20h-4v-18q-2-14-13-14t-13 14v18h-4z" fill="var(--ter)" opacity=".85"/>',
    bare: ''
  }[h] || '';
  p.innerHTML = '<svg viewBox="0 0 78 96" aria-hidden="true">' + body + head + hw + '</svg>';
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

