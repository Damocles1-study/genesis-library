(function(){
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const fmt = n => n >= 1e8 ? (n / 1e8).toFixed(n >= 1e9 ? 0 : 1) + ' 亿' : n >= 1e4 ? Math.round(n / 1e4).toLocaleString() + ' 万' : Math.round(n).toLocaleString();
const f1 = x => (Math.round(x * 10) / 10).toLocaleString();
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const btnRow = (box, items, cur, cb) => {
  box.innerHTML = items.map((t, i) => '<button class="btn' + (i === cur ? ' on' : '') + '" data-i="' + i + '">' + t + '</button>').join('');
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', box).forEach(x => x.classList.toggle('on', x === b)); cb(+b.dataset.i); });
};
const dev = (sel, fn) => { const el = $(sel); if (el) { try { fn(el); } catch (err) { console.error(sel, err); } } };
const kv = (box, rows) => { box.innerHTML = rows.map(r => '<div>' + r[0] + '<b>' + r[1] + '</b></div>').join(''); };
/* 把 SVG 里的点击坐标换成 viewBox 坐标 */
function svgPt(svg, e){
  const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
  const sx = vb.width / r.width, sy = vb.height / r.height, s = Math.max(sx, sy);
  // preserveAspectRatio 默认 xMidYMid meet：按较大的比例缩放并居中
  const ox = (r.width * s - vb.width) / 2, oy = (r.height * s - vb.height) / 2;
  return {x: (e.clientX - r.left) * s - ox + vb.x, y: (e.clientY - r.top) * s - oy + vb.y};
}

/* ---------- 全书目录（三个网页共用） ---------- */
const PAGE = /three\.html/.test(location.pathname) ? 3 : /two\.html/.test(location.pathname) ? 2 : 1;
const READY = 3; // 已经写好的部数；后面的章节在目录里显示“写作中”
const PURL = {1: './', 2: 'two.html', 3: 'three.html'};
const TOC = [
  {p: 1, t: '第一部 · 立城 —— 城为什么在这儿，长成什么样'},
  {v: '序幕'},
  {id: 'c0', n: '渡', t: '过河的地方', s: '选址：脚下的地，和四周的路', r: '约前 8000—今'},
  {v: '卷一 · 地 —— 先看老天给了什么'},
  {id: 'c1', n: '水', t: '靠水，怕水', s: '井、渠、堤；悬在头顶的河，摞起来的城', r: '前 7000—今'},
  {id: 'c2', n: '天', t: '朝南开门', s: '气候、地形、建材、地震；楼间距是太阳定的', r: '前 3000—今'},
  {id: 'c3', n: '粮', t: '城得有人喂', s: '腹地、漕运、罗马的面包、屠能的圈', r: '前 3000—今'},
  {v: '卷二 · 骨 —— 城的形状'},
  {id: 'c4', n: '格', t: '画方格的人', s: '匠人营国、希波丹姆、罗马营寨、长安里坊、纽约 1811', r: '前 2500—1900'},
  {id: 'c5', n: '巷', t: '自己长出来的城', s: '中世纪的弯巷、死胡同与邻里官司、窄门面', r: '800—今'},
  {id: 'c6', n: '墙', t: '城里和城外', s: '城与郭、城门、棱堡；墙拆了变成环路', r: '前 8000—今'},
  {id: 'c7', n: '市', t: '做买卖的地方', s: '广场、坊市与宵禁、宋代的街、赶集的间距', r: '前 600—今'},
  {id: 'c8', n: '轴', t: '中间那条线', s: '左祖右社、面朝后市；宫殿、神庙与城的中心', r: '前 1500—今'},
  {p: 2, t: '第二部 · 城里 —— 一座城的五脏六腑'},
  {v: '卷三 · 脏 —— 水、病、火'},
  {id: 'c9', n: '沟', t: '往哪儿冲', s: '罗马大下水道、伦敦大恶臭、北京的明沟、马粪危机', r: '前 600—今'},
  {id: 'c10', n: '疫', t: '病从哪口井来', s: '隔离、霍乱地图、医院的诞生和它该放在哪', r: '前 400—今'},
  {id: 'c11', n: '火', t: '一把火改了城', s: '罗马、伦敦、江户、芝加哥；消防队与防火巷', r: '64—今'},
  {v: '卷四 · 公家的房子 —— 一样样功能是怎么来的'},
  {id: 'c12', n: '巡', t: '谁在夜里走街', s: '更夫、坊正、伦敦警察、派出所、监狱放哪儿', r: '前 500—今'},
  {id: 'c13', n: '学', t: '上学的路', s: '学堂、图书馆、公立学校、学区', r: '前 2000—今'},
  {id: 'c14', n: '卡', t: '过路要交钱', s: '城门税、关卡、收费公路、拥堵费', r: '前 500—今'},
  {id: 'c15', n: '墓', t: '死人住哪儿', s: '城外的坟、迁坟、公墓与火葬场', r: '前 450—今'},
  {id: 'c16', n: '园', t: '城市的肺', s: '皇家园林开放、公园、广场、绿带', r: '1600—今'},
  {v: '卷五 · 走 —— 路、轨、车'},
  {id: 'c17', n: '路', t: '路为什么这么宽', s: '车辙、石板、人行道、路灯', r: '前 300—今'},
  {id: 'c18', n: '轨', t: '跟着铁轨长', s: '火车站、电车、地铁与郊区', r: '1830—今'},
  {id: 'c19', n: '车', t: '越修越堵', s: '汽车、高速穿城、停车、诱导需求', r: '1900—今'},
  {p: 3, t: '第三部 · 城外 —— 搬家、大手笔、地与时间'},
  {v: '卷六 · 搬家 —— 功能区的迁徙'},
  {id: 'c20', n: '风', t: '臭的往下风', s: '屠宰场、皮坊、工厂被赶出城；分区法', r: '1300—今'},
  {id: 'c21', n: '厂', t: '烟囱与码头', s: '工业城、港口、码头搬走、老厂房变咖啡馆', r: '1780—今'},
  {id: 'c22', n: '住', t: '挤在一起', s: '大杂院、廉租公寓、棚户、城中村、塔楼', r: '100—今'},
  {v: '卷七 · 大手笔 —— 规划师和它的反面'},
  {id: 'c23', n: '拆', t: '给城开膛', s: '奥斯曼的巴黎和它的模仿者', r: '1853—今'},
  {id: 'c24', n: '梦', t: '理想城', s: '田园城市、光辉城市、巴西利亚、堪培拉', r: '1898—今'},
  {id: 'c25', n: '街', t: '街道的眼睛', s: '雅各布斯和摩西；谁有资格画图', r: '1930—今'},
  {v: '卷八 · 地与时 —— 一亩三分地和时间差'},
  {id: 'c26', n: '地', t: '一亩三分地', s: '产权、钉子户、补偿、土地财政、邻避', r: '古今'},
  {id: 'c27', n: '时', t: '规划赶不上变化', s: '路径依赖、预测落空、鬼城、收缩城市、任期', r: '古今'},
  {id: 'c28', n: '外', t: '城与城外', s: '城乡、卫星城、城市群、迁都、特区', r: '古今'},
  {v: '尾声'},
  {id: 'c29', n: '今', t: '回到柳渡', s: '一张一万年的规划图，和你楼下', r: '今'}
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

/* 章首“四种力”：天 外 内 时 */
const FORCES = [['天', '自然'], ['外', '外来需求'], ['内', '内部需求'], ['时', '时间差']];
$$('.force').forEach(w => { const on = (w.dataset.f || '').split(/\s+/); w.innerHTML = FORCES.map(f => '<span' + (on.includes(f[0]) ? ' class="on"' : '') + '><b>' + f[0] + '</b>' + f[1] + '</span>').join(''); });

/* 卷首天际线：卷数越大，楼越高越密 */
$$('svg.sky').forEach(s => {
  const n = +s.dataset.n || 1, R = rng(n * 97 + 3); let g = '', x = 4;
  while (x < 236) {
    const w = 8 + R() * (n > 4 ? 14 : 22), h = 10 + R() * (8 + n * 9), y = 120 - h;
    g += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" fill="currentColor" fill-opacity="' + (.08 + R() * .14).toFixed(2) + '" stroke="currentColor" stroke-width="1"/>';
    if (n >= 3 && h > 30) for (let yy = y + 5; yy < 116; yy += 7) g += '<line x1="' + (x + 2).toFixed(1) + '" x2="' + (x + w - 2).toFixed(1) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="currentColor" stroke-width=".5" stroke-dasharray="1.5 2.5" opacity=".7"/>';
    x += w + 1 + R() * 4;
  }
  s.setAttribute('viewBox', '0 0 240 124'); s.innerHTML = g + '<line x1="0" x2="240" y1="120.5" y2="120.5" stroke="currentColor" stroke-width="1.4"/>';
});

/* ================= 柳渡：一座虚构小城的地图 =================
   town(stage) 一层层往上画：0 渡口 → 1 堤与井 → 2 朝南的房子 → 3 四周的田 → 4 方格新城
   → 5 城门外的弯巷 → 6 外郭 → 7 市 → 8 中轴。第二、三部会接着往上加。
   宋家那块“一亩三分地”永远在渡口北岸同一个位置。 */
const TW = 600, TH = 340;
const INK = 'currentColor';
const RIVER = 'M-10,118 C70,118 150,150 205,196 S320,268 420,262 S560,232 612,250';
const SONG = {x: 246, y: 176};
function lab(x, y, t, o){ o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.s || 15) + '" fill="' + (o.c || INK) + '" text-anchor="' + (o.a || 'middle') + '"' + (o.w ? ' font-weight="700"' : '') + ' paint-order="stroke" stroke="var(--card)" stroke-width="4" stroke-linejoin="round">' + t + '</text>'; }
function hut(x, y){ return '<circle cx="' + x + '" cy="' + y + '" r="5" fill="var(--card)" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + (x - 6) + ',' + (y - 2) + ' L' + x + ',' + (y - 9) + ' L' + (x + 6) + ',' + (y - 2) + '" fill="none" stroke="' + INK + '" stroke-width="1.4"/>'; }
function house(x, y, w, h){ w = w || 12; h = h || 8; return '<rect x="' + (x - w / 2) + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h + '" fill="var(--card)" stroke="' + INK + '" stroke-width="1.3"/><line x1="' + (x - 2) + '" x2="' + (x + 2) + '" y1="' + (y + h / 2) + '" y2="' + (y + h / 2) + '" stroke="var(--card)" stroke-width="2"/>'; }
function town(stage, o){
  o = o || {};
  const s = stage; let g = '';
  // 底：北山、低洼地
  g += '<g opacity=".55">' + [62, 46, 30, 15].map((r, i) => '<ellipse cx="110" cy="58" rx="' + (r * 1.6) + '" ry="' + r + '" fill="none" stroke="' + INK + '" stroke-width=".9"/>').join('') + '</g>' + lab(110, 63, '北山', {s: 14});
  g += '<g opacity=".5" stroke="' + INK + '" stroke-width="1">' + [[360, 312], [392, 300], [430, 318], [470, 306], [330, 326]].map(p => '<path d="M' + (p[0] - 8) + ',' + p[1] + ' h16 M' + (p[0] - 4) + ',' + (p[1] - 5) + ' v5 M' + (p[0] + 3) + ',' + (p[1] - 6) + ' v6"/>').join('') + '</g>' + lab(400, 334, '低洼地', {s: 13});
  // 田（1 起）
  if (s >= 1) {
    g += '<g fill="var(--fld)" stroke="' + INK + '" stroke-width=".7" opacity=".9">';
    [[120, 250, 70, 40], [195, 268, 60, 36], [470, 200, 70, 34], [520, 150, 60, 40], [60, 190, 60, 36]].forEach(r => { if (s >= 4 && r[0] > 400 && r[1] < 220) return; g += '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '"/>'; });
    g += '</g>';
  }
  // 屠能圈（只在 3 出现）
  if (s === 3) {
    const C = [300, 160];
    [[60, '菜'], [105, '柴'], [165, '粮'], [235, '牧']].forEach((r, i) => { g += '<circle cx="' + C[0] + '" cy="' + C[1] + '" r="' + r[0] + '" fill="none" stroke="var(--och)" stroke-width="1.5" stroke-dasharray="5 4"/>' + lab(C[0] + r[0] * .72, C[1] - r[0] * .7 + 6, r[1], {c: 'var(--och)', s: 15, w: 1}); });
  }
  // 河
  g += '<path d="' + RIVER + '" fill="none" stroke="' + INK + '" stroke-width="30" stroke-linecap="round" opacity=".55"/>';
  g += '<path d="' + RIVER + '" fill="none" stroke="var(--wat)" stroke-width="27" stroke-linecap="round"/>';
  g += lab(560, 222, '大河', {s: 14});
  // 堤（1 起）
  if (s >= 1) g += '<path d="M150,140 C185,160 210,184 240,206 S330,250 420,244 S530,220 590,228" fill="none" stroke="var(--brk)" stroke-width="3" stroke-dasharray="1 0"/>' + (o.levee ? lab(470, 230, '堤', {c: 'var(--brk)', s: 14}) : '');
  // 渠（1 起）
  if (s >= 1) g += '<path d="M300,252 C305,220 318,190 330,150 S340,110 350,92" fill="none" stroke="var(--wat)" stroke-width="5"/><path d="M300,252 C305,220 318,190 330,150 S340,110 350,92" fill="none" stroke="' + INK + '" stroke-width=".6" stroke-dasharray="3 3"/>';
  // 路：从北山下来，过渡口往南
  g += '<path d="M150,10 C170,70 205,130 222,190 L238,236 C250,270 260,300 270,340" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-dasharray="6 4"/>';
  g += '<path d="M214,188 L246,236" stroke="' + INK + '" stroke-width="2" stroke-dasharray="2 3"/>' + lab(196, 230, '渡', {s: 16, w: 1});
  // 窝棚（0）/ 朝南的房子（2 起）
  if (s < 2) [[226, 160], [268, 150], [284, 190], [210, 140], [300, 168]].forEach(p => g += hut(p[0], p[1]));
  if (s >= 1) g += '<circle cx="292" cy="196" r="5" fill="var(--wat)" stroke="' + INK + '" stroke-width="1.4"/><path d="M288,196 h8 M292,192 v8" stroke="' + INK + '" stroke-width="1"/>' + (s < 4 ? lab(292, 216, '井', {s: 12}) : '');
  if (s >= 2) { const R = rng(7); for (let i = 0; i < 16; i++) { const x = 255 + (i % 4) * 20 + R() * 6, y = 128 + Math.floor(i / 4) * 17 + R() * 4; if (Math.hypot(x - SONG.x, y - SONG.y) > 16 && !(s >= 4 && x > 322)) g += house(x, y); } }
  // 方格新城（4 起）
  if (s >= 4) {
    const X = 330, Y = 34, W = 170, H = 160;
    g += '<rect x="' + X + '" y="' + Y + '" width="' + W + '" height="' + H + '" fill="var(--card)" stroke="var(--brk)" stroke-width="3.2"/>';
    for (let i = 1; i < 4; i++) g += '<line x1="' + (X + W * i / 4) + '" x2="' + (X + W * i / 4) + '" y1="' + Y + '" y2="' + (Y + H) + '" stroke="' + INK + '" stroke-width="' + (i === 2 ? 2.4 : 1.1) + '"/><line y1="' + (Y + H * i / 4) + '" y2="' + (Y + H * i / 4) + '" x1="' + X + '" x2="' + (X + W) + '" stroke="' + INK + '" stroke-width="' + (i === 2 ? 2.4 : 1.1) + '"/>';
    // 坊里的房子
    const R = rng(11);
    for (let bx = 0; bx < 4; bx++) for (let by = 0; by < 4; by++) for (let k = 0; k < 3; k++) { const x = X + W * bx / 4 + 9 + (k % 2) * 18 + R() * 3, y = Y + H * by / 4 + 10 + Math.floor(k / 2) * 15 + R() * 3; if (s >= 7 && bx === 2 && by === 2) continue; if (s >= 8 && (bx === 1 || bx === 2) && by === 0) continue; g += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="10" height="7" fill="none" stroke="' + INK + '" stroke-width=".8" opacity=".7"/>'; }
    [[X, Y + H / 2], [X + W / 2, Y + H], [X + W, Y + H / 2], [X + W / 2, Y]].forEach(p => g += '<rect x="' + (p[0] - 6) + '" y="' + (p[1] - 6) + '" width="12" height="12" fill="var(--card)" stroke="var(--brk)" stroke-width="2"/>');
    if (s < 6) g += lab(X + W / 2, Y - 8 > 12 ? Y - 8 : Y + 14, '新城', {s: 14, w: 1});
  }
  // 城门外的弯巷（5 起）
  if (s >= 5) {
    const lanes = ['M330,114 C305,118 292,132 280,150 S258,170 240,186', 'M280,150 C270,140 258,132 246,126', 'M292,170 C300,186 312,200 322,214', 'M262,165 C250,160 236,154 226,146', 'M300,135 C310,150 316,162 330,170', 'M250,180 C258,196 270,206 284,214'];
    lanes.forEach((d, i) => g += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + (i ? 1.2 : 2) + '"/>');
    const R = rng(23);
    for (let i = 0; i < 26; i++) { const x = 226 + R() * 100, y = 120 + R() * 100; if (Math.hypot(x - SONG.x, y - SONG.y) > 14 && x < 326 && y < 0.55 * x + 92) g += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="8" height="6" fill="var(--card)" stroke="' + INK + '" stroke-width=".9" transform="rotate(' + (R() * 40 - 20).toFixed(0) + ' ' + x.toFixed(0) + ' ' + y.toFixed(0) + ')"/>'; }
  }
  // 外郭（6 起；19 起拆墙变环路）
  if (s >= 6 && s < 19) {
    const d = 'M200,140 L232,104 L330,22 L512,22 L512,206 L420,236 L300,232 L236,212 Z';
    g += '<path d="' + d + '" fill="none" stroke="var(--wat)" stroke-width="9" stroke-linejoin="round" opacity=".9"/>';
    g += '<path d="' + d + '" fill="none" stroke="var(--brk)" stroke-width="4" stroke-linejoin="round"/>';
    [[216, 122], [222, 196], [512, 120], [410, 22]].forEach(p => g += '<rect x="' + (p[0] - 7) + '" y="' + (p[1] - 7) + '" width="14" height="14" fill="var(--brk)" stroke="var(--card)" stroke-width="1.5"/>');
    g += lab(258, 60, '郭', {s: 16, c: 'var(--brk)', w: 1}) + lab(415, 72, '城', {s: 16, c: 'var(--brk)', w: 1});
  }
  // 市（7 起）
  if (s >= 7) {
    g += '<rect x="417" y="116" width="40" height="36" fill="var(--hl)" stroke="var(--och)" stroke-width="2.2"/>' + lab(437, 140, '市', {s: 16, c: 'var(--och)', w: 1});
    for (let i = 0; i < 7; i++) g += '<rect x="' + (262 + i * 9) + '" y="' + (196 - i * 1) + '" width="7" height="6" fill="var(--och)" opacity=".75"/>';
  }
  // 中轴（8 起）
  if (s >= 8) {
    g += '<line x1="415" x2="415" y1="22" y2="242" stroke="var(--main)" stroke-width="2" stroke-dasharray="8 4"/>';
    g += '<rect x="383" y="40" width="64" height="30" fill="var(--card)" stroke="var(--main)" stroke-width="2.4"/>' + lab(415, 61, '宫', {s: 15, c: 'var(--main)', w: 1});
    g += '<rect x="352" y="84" width="22" height="16" fill="none" stroke="var(--main)" stroke-width="1.5"/><rect x="456" y="84" width="22" height="16" fill="none" stroke="var(--main)" stroke-width="1.5"/>';
    g += lab(363, 113, '祖', {s: 12, c: 'var(--main)'}) + lab(467, 113, '社', {s: 12, c: 'var(--main)'});
  }

  // ===== 第二部的层 =====
  // 9 沟：下水道排进下游
  if (s >= 9) {
    g += '<g fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-dasharray="2 3" opacity=".8"><path d="M415,194 L415,250"/><path d="M512,114 L545,114 L560,236"/><path d="M250,186 L262,226"/></g>';
    g += '<path d="M556,228 l4,10 l4,-10" fill="none" stroke="var(--ink)" stroke-width="1.6"/>' + (s < 16 ? lab(552, 170, '下水', {s: 12}) : '');
  }
  // 10 医：城外东边的医院
  if (s >= 10) g += '<rect x="535" y="42" width="28" height="22" fill="var(--card)" stroke="var(--red)" stroke-width="2"/><path d="M549,46 v14 M542,53 h14" stroke="var(--red)" stroke-width="3"/>' + lab(549, 80, '医', {s: 13, c: 'var(--red)'});
  // 11 火：望火楼和防火巷
  if (s >= 11) {
    g += '<path d="M236,150 L330,150" stroke="var(--paper)" stroke-width="9"/><path d="M236,145.5 L330,145.5 M236,154.5 L330,154.5" stroke="var(--brk)" stroke-width="1" stroke-dasharray="4 2"/>';
    g += '<rect x="296" y="122" width="8" height="18" fill="var(--card)" stroke="var(--ink)" stroke-width="1.3"/><path d="M304,122 l10,4 l-10,4" fill="var(--red)"/>' + lab(300, 118, '火', {s: 12, c: 'var(--red)'});
  }
  // 12 巡：派出所和城外的监狱
  if (s >= 12) {
    [[372, 156], [470, 72], [266, 204]].forEach(p => g += '<path d="M' + (p[0] - 6) + ',' + (p[1] - 6) + ' h12 v6 c0,5 -6,8 -6,8 c0,0 -6,-3 -6,-8 Z" fill="var(--blu)" stroke="var(--card)" stroke-width="1"/>');
    g += '<rect x="22" y="140" width="34" height="26" fill="var(--card)" stroke="var(--ink)" stroke-width="2"/>' + [0, 1, 2, 3].map(i => '<line x1="' + (28 + i * 7) + '" x2="' + (28 + i * 7) + '" y1="142" y2="164" stroke="var(--ink)" stroke-width="1.2"/>').join('') + lab(39, 182, '狱', {s: 13});
  }
  // 13 学：学校和学区线
  if (s >= 13) g += '<circle cx="470" cy="170" r="46" fill="none" stroke="var(--grn)" stroke-width="1.4" stroke-dasharray="5 3"/><rect x="460" y="164" width="20" height="13" fill="var(--card)" stroke="var(--grn)" stroke-width="1.8"/><path d="M470,164 v-10 l9,3 l-9,3" fill="var(--grn)" stroke="var(--grn)" stroke-width="1"/>' + lab(470, 192, '学', {s: 12, c: 'var(--grn)'});
  // 14 卡：渡口修了桥，桥头收钱
  if (s >= 14) g += '<path d="M214,188 L246,236" stroke="var(--ink)" stroke-width="7"/><path d="M214,188 L246,236" stroke="var(--card)" stroke-width="4"/><rect x="205" y="176" width="14" height="10" fill="var(--och)" stroke="var(--ink)" stroke-width="1"/>' + lab(196, 172, '卡', {s: 12, c: 'var(--och)'});
  // 15 墓：北山坡上的墓地
  if (s >= 15) { for (let i = 0; i < 12; i++) { const x = 28 + (i % 6) * 11, y = 14 + Math.floor(i / 6) * 12; g += '<path d="M' + x + ',' + (y + 6) + ' v-6 a3,3 0 0 1 6,0 v6 Z" fill="var(--card)" stroke="var(--ink)" stroke-width=".9"/>'; } g += lab(60, 50, '墓', {s: 12}); }
  // 16 园：城东的公园和河边绿地
  if (s >= 16) g += '<ellipse cx="562" cy="146" rx="26" ry="40" fill="var(--grn)" fill-opacity=".28" stroke="var(--grn)" stroke-width="1.5"/>' + lab(562, 150, '园', {s: 13, c: 'var(--grn)'}) + '<path d="M300,236 C340,246 380,250 420,246" fill="none" stroke="var(--grn)" stroke-width="5" opacity=".45"/>';
  // 17 路：一条笔直的新马路穿过弯巷，两边路灯
  if (s >= 17) { g += '<path d="M236,206 L330,116" stroke="var(--ink)" stroke-width="8"/><path d="M236,206 L330,116" stroke="var(--card)" stroke-width="5.5"/>'; for (let i = 1; i < 6; i++) g += '<circle cx="' + (236 + i * 15.7 + 5) + '" cy="' + (206 - i * 15 + 5) + '" r="1.8" fill="var(--och)"/>'; }
  // 18 轨：南岸的铁路和车站，城里的电车
  if (s >= 18) {
    g += '<path d="M0,300 L600,300" stroke="var(--ink)" stroke-width="2.5"/>'; for (let x = 4; x < 600; x += 9) g += '<line x1="' + x + '" x2="' + x + '" y1="296" y2="304" stroke="var(--ink)" stroke-width="1"/>';
    g += '<rect x="282" y="284" width="40" height="14" fill="var(--card)" stroke="var(--ink)" stroke-width="1.8"/>' + lab(302, 280, '站', {s: 13, w: 1});
    g += '<path d="M330,114 L512,114" stroke="var(--main)" stroke-width="2" stroke-dasharray="7 3"/>';
  }
  // 19 车：城墙拆成环路，河边架起高架
  if (s >= 19) {
    const d = 'M200,140 L232,104 L330,22 L512,22 L512,206 L420,236 L300,232 L236,212 Z';
    g += '<path d="' + d + '" fill="none" stroke="var(--ink-3)" stroke-width="9" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="var(--card)" stroke-width="1.2" stroke-dasharray="6 5"/>' + lab(258, 60, '环路', {s: 13, c: 'var(--ink-3)'});
    const h = 'M140,150 C190,186 232,210 300,226 S430,244 600,214';
    g += '<path d="' + h + '" fill="none" stroke="var(--ink-3)" stroke-width="6" opacity=".85"/>' + lab(560, 205, '高架', {s: 12, c: 'var(--ink-3)'});
  }

  // ===== 第三部的层 =====
  // 20 风：下风处、河下游南岸的工业区
  if (s >= 20) { for (let i = 0; i < 5; i++) { const x = 446 + i * 26, y = 272; g += '<path d="M' + x + ',' + (y + 16) + ' v-10 l7,-5 v5 l7,-5 v5 l7,-5 v15 Z" fill="var(--card)" stroke="var(--ink)" stroke-width="1.2"/><rect x="' + (x + 2) + '" y="' + (y - 8) + '" width="3" height="10" fill="var(--ink)"/>'; } g += lab(510, 266, '厂区', {s: 12}); }
  // 21 厂：南岸的旧码头改成了文创园
  if (s >= 21) g += '<rect x="150" y="238" width="42" height="18" fill="var(--hl)" stroke="var(--och)" stroke-width="1.6"/><path d="M158,238 v-14 h18 M176,224 v6" fill="none" stroke="var(--ink)" stroke-width="1.5"/>' + lab(171, 272, '文创园', {s: 11, c: 'var(--och)'});
  // 22 住：城中村和新的塔楼
  if (s >= 22) { const R = rng(5); for (let i = 0; i < 30; i++) g += '<rect x="' + (88 + (i % 6) * 10 + R() * 2).toFixed(1) + '" y="' + (176 + Math.floor(i / 6) * 8 + R() * 2).toFixed(1) + '" width="8" height="6" fill="var(--card)" stroke="var(--ink)" stroke-width=".8"/>'; g += lab(118, 226, '城中村', {s: 11}); }
  // 23 拆：一条斜穿方格城的大道
  if (s >= 23) g += '<path d="M498,38 L344,190" stroke="var(--ink)" stroke-width="9"/><path d="M498,38 L344,190" stroke="var(--card)" stroke-width="6"/>';
  // 24 梦：南岸西边的新区，大街区、宽马路、中轴
  if (s >= 24) { g += '<rect x="22" y="262" width="118" height="70" fill="none" stroke="var(--main)" stroke-width="1.6"/>'; for (let i = 1; i < 3; i++) g += '<line x1="' + (22 + i * 39.3) + '" x2="' + (22 + i * 39.3) + '" y1="262" y2="332" stroke="var(--main)" stroke-width="3"/>'; g += '<line x1="22" x2="140" y1="297" y2="297" stroke="var(--main)" stroke-width="3"/><rect x="72" y="270" width="18" height="12" fill="var(--main)" opacity=".6"/>' + lab(81, 326, '新区', {s: 11, c: 'var(--main)'}); }
  // 25 街：弯巷划成历史街区
  if (s >= 25) g += '<path d="M222,120 L300,112 L328,128 L328,214 L282,222 L234,206 Z" fill="none" stroke="var(--grn)" stroke-width="2" stroke-dasharray="6 3"/>' + lab(282, 108, '历史街区', {s: 11, c: 'var(--grn)'});
  // 26 地：宋家四周成了工地（29 起盖成了楼）
  if (s >= 26 && s < 29) { g += '<path d="M226,158 h40 v36 h-40 Z" fill="none" stroke="var(--och)" stroke-width="1.5" stroke-dasharray="3 2"/>'; for (let k = 0; k < 8; k++) g += '<line x1="' + (226 + k * 5) + '" y1="158" x2="' + (226 + k * 5 - 6) + '" y2="194" stroke="var(--och)" stroke-width=".7" opacity=".7"/>'; g += lab(246, 206, '工地', {s: 10, c: 'var(--och)'}); }
  // 27 时：规划了三十年的地铁终于通了
  if (s >= 27) { g += '<path d="M302,290 C310,250 360,200 415,114" fill="none" stroke="var(--red)" stroke-width="2.5"/>'; [[302, 290], [326, 236], [372, 172], [415, 114]].forEach(p => g += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="var(--card)" stroke="var(--red)" stroke-width="2"/>'); g += lab(352, 210, '地铁', {s: 11, c: 'var(--red)'}); }
  // 28 外：通往别的城的高铁和高速
  if (s >= 28) g += '<path d="M590,300 l-14,-6 v12 Z" fill="var(--ink)"/>' + lab(560, 322, '去省城 · 港口', {s: 10}) + '<path d="M10,300 l14,-6 v12 Z" fill="var(--ink)"/>' + lab(36, 254, '去邻市', {s: 10});
  // 29 今：宋家四周盖起了楼，宋家的老房子还在
  if (s >= 29) [[224, 160, 14, 30], [264, 158, 12, 34], [230, 192, 30, 10]].forEach(r => g += '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" fill="var(--main)" fill-opacity=".25" stroke="var(--main)" stroke-width="1.2"/>');
  // 宋家的地
  g += '<rect x="' + (SONG.x - 9) + '" y="' + (SONG.y - 7) + '" width="18" height="14" fill="var(--red)" fill-opacity=".22" stroke="var(--red)" stroke-width="2"/>' + lab(SONG.x, SONG.y - 12, '宋', {s: 14, c: 'var(--red)', w: 1});
  // 指南针
  g += '<g transform="translate(572,34)"><circle r="15" fill="none" stroke="' + INK + '" stroke-width="1"/><path d="M0,-12 L4,2 L0,0 L-4,2 Z" fill="' + INK + '"/>' + lab(0, 12, '北', {s: 10}) + '</g>';
  return g;
}
function drawTown(svg, stage, o){ svg.setAttribute('viewBox', '0 0 ' + TW + ' ' + TH); svg.innerHTML = town(stage, o); }
$$('svg[data-town]').forEach(s => drawTown(s, +s.dataset.town, {levee: s.dataset.levee}));
