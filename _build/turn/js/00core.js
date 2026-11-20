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

/* ---------- 全书目录（四个网页共用） ---------- */
const PAGE = /four\.html/.test(location.pathname) ? 4 : /three\.html/.test(location.pathname) ? 3 : /two\.html/.test(location.pathname) ? 2 : 1;
const READY = 1; // 已经写好的部数；后面的章节在目录里显示“写作中”
const PURL = {1: './', 2: 'two.html', 3: 'three.html', 4: 'four.html'};
const TOC = [
  {p: 1, t: '第一部 · 希腊 —— 一群吵架的城'},
  {v: '序幕'},
  {id: 'c0', n: '岛', t: '池塘边的青蛙', s: '山、海、借来的字母：一千个城邦是怎么来的', r: '前 1200—前 700'},
  {v: '卷一 · 城邦 —— 自己管自己'},
  {id: 'c1', n: '盾', t: '盾牌靠右', s: '方阵、殖民、僭主：拿盾牌的人要说话', r: '前 750—前 500'},
  {id: 'c2', n: '斯', t: '斯巴达俱乐部', s: '来库古、希洛人、铁钱：一座兵营怎样把自己越关越小', r: '前 700—前 371'},
  {id: 'c3', n: '签', t: '陶片与十个部落', s: '梭伦、庇西特拉图、克里斯提尼：雅典学会自己管自己', r: '前 594—前 487'},
  {v: '卷二 · 霸 —— 从盟主到帝国'},
  {id: 'c4', n: '船', t: '木墙', s: '波斯来了：马拉松、温泉关、萨拉米斯；地米斯托克利的银子', r: '前 499—前 479'},
  {id: 'c5', n: '盟', t: '提洛的金库', s: '同盟怎样变成帝国：盟金、帕特农、不许退群', r: '前 478—前 431'},
  {id: 'c6', n: '民', t: '伯里克利的城', s: '民主到底怎么运转：抽签、津贴、谁才算公民', r: '前 461—前 429'},
  {id: 'c7', n: '疫', t: '强者为所能为', s: '伯罗奔尼撒战争：瘟疫、米洛斯、西西里、亚西比德', r: '前 431—前 403'},
  {v: '卷三 · 灯 —— 思想、马其顿、交棒'},
  {id: 'c8', n: '问', t: '一杯毒芹', s: '智者、苏格拉底、柏拉图、亚里士多德，和骂人的喜剧', r: '前 450—前 322'},
  {id: 'c9', n: '马', t: '三十二岁', s: '腓力和亚历山大：从山里的小王国到半个世界', r: '前 359—前 323'},
  {id: 'c10', n: '书', t: '被俘的希腊', s: '继业者、图书馆、量地球；罗马人来了', r: '前 323—前 146'},
  {p: 2, t: '第二部 · 罗马 —— 条条大路'},
  {v: '卷四 · 共和'},
  {id: 'c11', n: '狼', t: '母狼和七个王', s: '建城传说、王政、赶走国王', r: '前 753—前 509'},
  {id: 'c12', n: '柱', t: '共和的机器', s: '执政官、元老院、保民官、十二铜表法、官职阶梯', r: '前 509—前 264'},
  {id: 'c13', n: '迦', t: '迦太基必须毁灭', s: '布匿战争、汉尼拔、地中海归一家', r: '前 264—前 146'},
  {id: 'c14', n: '田', t: '兄弟俩', s: '格拉古兄弟、土地、马略的兵', r: '前 133—前 100'},
  {v: '卷五 · 内战'},
  {id: 'c15', n: '单', t: '苏拉的名单', s: '军队认将军不认国家', r: '前 91—前 78'},
  {id: 'c16', n: '河', t: '渡河', s: '恺撒：债、高卢、卢比孔河、三月十五', r: '前 60—前 44'},
  {id: 'c17', n: '冠', t: '假装共和的皇帝', s: '奥古斯都怎样把独裁做成“恢复共和”', r: '前 44—14'},
  {v: '卷六 · 帝国'},
  {id: 'c18', n: '省', t: '管住天下', s: '行省、包税人、道路、公民权', r: '前 27—212'},
  {id: 'c19', n: '场', t: '面包和竞技场', s: '皇帝们、近卫军、城里的百万人', r: '14—192'},
  {id: 'c20', n: '十', t: '十字架', s: '一个小教派怎样成了国教', r: '30—392'},
  {id: 'c21', n: '裂', t: '五十年二十六个皇帝', s: '三世纪危机、戴克里先、君士坦丁', r: '235—337'},
  {id: 'c22', n: '落', t: '没人注意到的灭亡', s: '西罗马怎样一点点没了', r: '378—476'},
  {id: 'c23', n: '城', t: '还有一千年', s: '拜占庭、查士丁尼、1453', r: '476—1453'},
  {p: 3, t: '第三部 · 欧洲与英国 —— 日不落'},
  {v: '卷七 · 碎片'},
  {id: 'c24', n: '堡', t: '城堡与教堂', s: '封建、教会、十字军', r: '800—1300'},
  {id: 'c25', n: '章', t: '一张羊皮纸', s: '大宪章、议会、黑死病', r: '1215—1400'},
  {id: 'c26', n: '印', t: '印刷机和九十五条', s: '文艺复兴、宗教改革', r: '1450—1648'},
  {id: 'c27', n: '帆', t: '先到的人', s: '葡萄牙、西班牙、荷兰的海', r: '1415—1670'},
  {v: '卷八 · 岛'},
  {id: 'c28', n: '盗', t: '女王的海盗', s: '伊丽莎白、德雷克、无敌舰队', r: '1558—1603'},
  {id: 'c29', n: '债', t: '会借钱的国家', s: '内战、光荣革命、英格兰银行与国债', r: '1642—1720'},
  {id: 'c30', n: '机', t: '煤与蒸汽', s: '工业革命', r: '1750—1850'},
  {id: 'c31', n: '司', t: '一家公司统治一个国家', s: '东印度公司', r: '1600—1858'},
  {v: '卷九 · 日不落'},
  {id: 'c32', n: '茶', t: '丢了美洲', s: '七年战争、印花税、波士顿', r: '1756—1783'},
  {id: 'c33', n: '烟', t: '鸦片', s: '自由贸易的另一面', r: '1793—1860'},
  {id: 'c34', n: '饥', t: '饥荒的账', s: '爱尔兰、印度', r: '1845—1900'},
  {id: 'c35', n: '官', t: '考出来的文官', s: '诺思科特-特里维廉报告', r: '1854—1900'},
  {id: 'c36', n: '瓜', t: '切蛋糕', s: '瓜分非洲', r: '1884—1914'},
  {id: 'c37', n: '暮', t: '日落', s: '两次大战、印度独立、苏伊士', r: '1914—1956'},
  {p: 4, t: '第四部 · 美国 —— 山巅之城'},
  {v: '卷十 · 新'},
  {id: 'c38', n: '约', t: '船上签的约', s: '殖民地、清教徒、烟草与奴隶', r: '1607—1750'},
  {id: 'c39', n: '独', t: '无代表不纳税', s: '独立战争', r: '1765—1783'},
  {id: 'c40', n: '宪', t: '防着所有人', s: '宪法、分权、联邦', r: '1787—1803'},
  {id: 'c41', n: '西', t: '昭昭天命', s: '西进、印第安人迁移、美墨战争', r: '1803—1890'},
  {v: '卷十一 · 裂'},
  {id: 'c42', n: '奴', t: '分裂之家', s: '奴隶制与内战', r: '1820—1877'},
  {id: 'c43', n: '金', t: '镀金时代', s: '铁路大王、托拉斯、移民', r: '1870—1914'},
  {id: 'c44', n: '门', t: '后院', s: '门罗主义、美西战争、巴拿马', r: '1823—1918'},
  {v: '卷十二 · 霸'},
  {id: 'c45', n: '萧', t: '新政', s: '大萧条与罗斯福', r: '1929—1941'},
  {id: 'c46', n: '战', t: '民主的兵工厂', s: '二战、布雷顿森林、马歇尔计划', r: '1941—1949'},
  {id: 'c47', n: '冷', t: '冷战', s: '遏制、代理人战争、越南', r: '1947—1975'},
  {id: 'c48', n: '元', t: '我们的货币，你们的问题', s: '1971、石油美元', r: '1971—1990'},
  {id: 'c49', n: '一', t: '一个人的山顶', s: '单极、9·11、2008', r: '1991—2010s'},
  {v: '尾声'},
  {id: 'c50', n: '轮', t: '轮到谁了', s: '四个霸主的押韵，和盐屿的最后一页账', r: '今'}
];
const chapPage = {}; { let p = 1; TOC.forEach(x => { if (x.p) p = x.p; if (x.id) chapPage[x.id] = p; }); }
const href = id => (chapPage[id] === PAGE ? '' : PURL[chapPage[id]]) + '#' + id;
$$('.bar .parts a').forEach(a => { const p = +a.dataset.p; a.classList.toggle('on', p === PAGE); if (p > READY) { a.removeAttribute('href'); a.style.opacity = .4; a.title = '写作中'; } });
$('#drawerList').innerHTML = TOC.map(x => x.p ? '<li class="ph">' + x.t + '</li>' : x.v ? '<li class="vh">' + x.v + '</li>' :
  chapPage[x.id] > READY ? '<li><a style="opacity:.5;pointer-events:none"><span class="n">' + x.n + '</span><span>' + x.t + '<small>写作中</small></span></a></li>' :
  '<li><a href="' + href(x.id) + '"' + (chapPage[x.id] === PAGE ? ' class="here"' : '') + '><span class="n">' + x.n + '</span><span>' + x.t + '<small>' + x.s + '</small></span></a></li>').join('');
dev('#toc', ul => {
  ul.innerHTML = TOC.map(x => x.p ? '<li class="vh" style="color:var(--ter)">' + x.t + '</li>' : x.v ? '<li class="vh">' + x.v + '</li>' :
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

/* 章首四个镜头：内 外 钱 人 */
const LENS = [['内', '怎么管自己'], ['外', '怎么对别人'], ['钱', '钱从哪来'], ['人', '灵魂人物']];
$$('.lens').forEach(w => { const on = (w.dataset.l || '').split(/\s+/); w.innerHTML = LENS.map(f => '<span' + (on.includes(f[0]) ? ' class="on"' : '') + '><b>' + f[0] + '</b>' + f[1] + '</span>').join(''); });

/* 年代条：前 1200 到 2030，这一章占哪一段 */
const T0 = -1200, T1 = 2030, tp = y => (y - T0) / (T1 - T0) * 100;
$$('.when').forEach(w => {
  const a = +w.dataset.a, b = +w.dataset.b;
  w.innerHTML = [-1000, -500, 1, 500, 1000, 1500, 2000].map(y => '<span style="left:' + tp(y) + '%">' + (y === 1 ? '公元' : yr(y)) + '</span>').join('') +
    '<i style="left:' + tp(a) + '%;width:' + Math.max(.4, tp(b) - tp(a)) + '%"></i>';
  w.title = yr(a) + ' — ' + yr(b);
});

/* 回纹 */
$$('svg.meander').forEach(s => {
  let d = ''; for (let x = 0; x < 600; x += 14) d += 'M' + x + ',13 V1 H' + (x + 12) + ' V10 H' + (x + 4) + ' V5 H' + (x + 8) + ' ';
  s.setAttribute('viewBox', '0 0 600 14'); s.setAttribute('preserveAspectRatio', 'none');
  s.innerHTML = '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke"/>';
});
/* 卷首的陶瓶剪影 */
$$('svg.vase').forEach(s => {
  const n = +s.dataset.n || 1;
  s.setAttribute('viewBox', '0 0 120 150');
  const body = n === 1 ? 'M44,8 h32 v8 c0,6 -8,8 -8,16 c0,14 34,22 34,60 c0,30 -20,44 -26,48 h-32 c-6,-4 -26,-18 -26,-48 c0,-38 34,-46 34,-60 c0,-8 -8,-10 -8,-16 Z'
    : n === 2 ? 'M40,6 h40 v6 h-6 c0,10 30,18 30,56 c0,40 -22,60 -30,72 h-28 c-8,-12 -30,-32 -30,-72 c0,-38 30,-46 30,-56 h-6 Z'
    : 'M50,6 h20 v20 c22,8 36,30 36,62 c0,30 -16,48 -26,54 h-40 c-10,-6 -26,-24 -26,-54 c0,-32 14,-54 36,-62 Z';
  s.innerHTML = '<path d="' + body + '" fill="currentColor" fill-opacity=".14" stroke="currentColor" stroke-width="2"/>' +
    '<path d="M20,78 H100 M22,98 H98" stroke="currentColor" stroke-width="1.2"/>' +
    (() => { let d = ''; for (let x = 24; x < 96; x += 8) d += 'M' + x + ',96 V82 H' + (x + 6) + ' V91 H' + (x + 2) + ' '; return '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1"/>'; })() +
    '<path d="M14,58 c-8,-4 -8,-16 2,-18 M106,58 c8,-4 8,-16 -2,-18" fill="none" stroke="currentColor" stroke-width="2"/>';
});

/* ================= 地中海与西亚：示意地图 =================
   经纬度粗描（几十个点一条海岸线），只为看清方位和距离，不是精确地图。
   画法：先铺一整块陆地，再把海“挖”出来，再把岛放回去。 */
const SEAS = {
  med: [[-6, 36], [-5.6, 36.05], [-4.4, 36.7], [-2.1, 36.7], [-1, 37.6], [0.2, 38.7], [-0.3, 39.5], [0.9, 40.7], [2.2, 41.4], [3.3, 42.3], [3.1, 43.1], [4.5, 43.4], [5.4, 43.3], [7.3, 43.7], [8.9, 44.4], [9.8, 44.1], [10.5, 42.9], [11.2, 42.4], [12.3, 41.7], [13.6, 41.2], [14.2, 40.8], [15, 40.2], [15.7, 39.4], [16.1, 38.7], [15.7, 38], [16.1, 38], [16.6, 38.5], [17.1, 39], [16.5, 39.6], [17.2, 40.4], [18.5, 40.1], [18.4, 40.4], [16.9, 41.1], [16, 41.4], [16.2, 41.9], [15.1, 42], [13.5, 43.6], [12.6, 44.1], [12.3, 45.4], [13.8, 45.6], [13.6, 44.8], [14.4, 45.1], [15.2, 44.1], [16.4, 43.5], [18.1, 42.6], [19.4, 41.9], [19.4, 41.3], [19.4, 40.5], [20, 39.7], [20.7, 39], [21.1, 38.4], [21.7, 38.3], [22.9, 38], [22.2, 38.1], [21.4, 37.7], [21.7, 36.9], [22.5, 36.4], [22.6, 36.9], [23.2, 36.4], [23.1, 36.8], [22.8, 37.6], [23.5, 37.6], [23.6, 37.95], [24, 37.65], [24.1, 38.2], [23.6, 38.4], [23, 38.9], [22.9, 39.3], [23.3, 39.2], [22.6, 40], [22.9, 40.6], [23.4, 40.2], [23.8, 40], [24.4, 40.9], [25.9, 40.8], [26.2, 40.6], [26.4, 40.2], [26.2, 39.9], [26.1, 39.5], [26.9, 39.3], [26.7, 38.7], [27.1, 38.4], [26.3, 38.3], [27.3, 37.9], [27.2, 37.5], [27.4, 37.0], [27.4, 36.7], [28.2, 36.6], [29.1, 36.6], [30.4, 36.2], [30.7, 36.9], [32, 36.5], [32.8, 36], [34, 36.3], [34.6, 36.8], [36.2, 36.6], [35.9, 36.0], [35.8, 35.5], [35.9, 34.6], [35.5, 33.9], [35.2, 33.3], [35, 32.8], [34.75, 32.05], [34.4, 31.5], [33.1, 31.1], [32.3, 31.2], [31.8, 31.5], [30.4, 31.5], [29.9, 31.2], [28.9, 30.9], [27.2, 31.35], [25.2, 31.6], [24, 32.1], [22.6, 32.8], [21.5, 32.9], [20.1, 32.1], [19.6, 30.6], [18.5, 30.4], [16.6, 31.2], [15.1, 32.4], [13.2, 32.9], [11.5, 33.2], [10.1, 33.9], [10.8, 34.7], [11.1, 35.2], [10.6, 36.4], [11.05, 37.05], [10.3, 36.85], [9.9, 37.3], [7.8, 36.9], [5.1, 36.7], [3.05, 36.8], [1.2, 36.5], [-0.6, 35.7], [-2.9, 35.3], [-5.3, 35.9], [-6, 35.9]],
  black: [[29, 41.2], [28, 41.6], [27.5, 42.5], [27.9, 43.2], [28.6, 44.2], [29.7, 45.2], [30.7, 46.5], [31.8, 46.3], [32.5, 45.4], [33.5, 44.6], [34.5, 44.6], [36.5, 45.3], [37.8, 44.7], [39.7, 43.6], [41.6, 41.6], [39.7, 41], [37.5, 41.1], [36.3, 41.3], [35.1, 42], [33.3, 42], [31.8, 41.5], [30, 41.2]],
  marm: [[26.6, 40.35], [27.5, 40.95], [28.9, 41.05], [29.4, 40.75], [28.2, 40.4], [27, 40.25]],
  casp: [[47, 44.5], [49, 46.8], [51.5, 47], [53, 45.3], [51.3, 44.5], [52.8, 41.5], [54, 40], [53.9, 37.3], [51.5, 36.8], [49, 37.6], [49.3, 40.4], [47.5, 42.5]],
  gulf: [[48, 30], [50.3, 29.3], [51.5, 27.9], [54, 26.6], [56.3, 27.2], [56.4, 26.4], [57, 25.6], [61.6, 25.2], [66.6, 25.4], [67.4, 24], [68.8, 22.5], [69, 18], [52, 16], [56, 22.5], [56, 24.9], [54.4, 24.3], [51.6, 24.6], [51.2, 26.1], [50.2, 26.6], [49.6, 27.1], [48.4, 28.5]],
  red: [[32.6, 29.9], [33.4, 28.2], [34.3, 27.9], [34.9, 29.5], [35.1, 28], [37.5, 24.5], [39.2, 21.5], [41, 18], [43, 14], [41, 14], [39.3, 15.6], [37.2, 19], [35.6, 23.9], [33.9, 26.9]],
  atl: [[-6, 36], [-6, 35.9], [-6.5, 34], [-10, 30], [-10, 48], [-1.5, 48], [-1.5, 46.5], [-1.2, 44.5], [-1.8, 43.4], [-8.2, 43.4], [-9, 42.8], [-8.8, 41.8], [-9.5, 38.8], [-8.9, 37], [-7.5, 37.2], [-6.3, 36.8]]
};
const ISLES = {
  sic: [[12.4, 37.8], [13.4, 38.2], [15.6, 38.3], [15.1, 37.5], [15.1, 36.7], [14.3, 36.9], [12.6, 37.6]],
  sar: [[8.4, 40.9], [9.2, 41.2], [9.8, 40.9], [9.6, 39.2], [9, 39.1], [8.4, 39], [8.4, 40]],
  cor: [[9.4, 43], [9.5, 42], [9.2, 41.4], [8.6, 41.7], [8.6, 42.5]],
  cre: [[23.5, 35.5], [24.5, 35.55], [25.5, 35.3], [26.3, 35.25], [26.1, 35], [24.7, 35], [23.5, 35.25]],
  cyp: [[32.3, 34.8], [33, 35.4], [34.6, 35.7], [34, 35], [33, 34.6]],
  rho: [[27.7, 36.2], [28.2, 36.45], [28.1, 35.9]],
  eub: [[22.8, 38.95], [23.6, 38.7], [24.6, 38.1], [24.2, 37.95], [23.2, 38.5]],
  les: [[25.9, 39.3], [26.4, 39.4], [26.6, 39.05], [26.1, 39.0]],
  chi: [[25.9, 38.55], [26.15, 38.55], [26.1, 38.2], [25.9, 38.3]],
  sam: [[26.6, 37.8], [27, 37.75], [26.85, 37.65]],
  nax: [[25.35, 37.15], [25.55, 37.15], [25.5, 36.95], [25.35, 37]],
  cor2: [[19.7, 39.8], [20.1, 39.65], [19.9, 39.4]],
  bal: [[2.4, 39.6], [3.3, 39.9], [3.4, 39.4], [2.7, 39.4]]
};
const RIVERS = [
  [[31, 30.1], [31.2, 27.2], [32.9, 24.1], [32.5, 22]],
  [[38, 37], [38.5, 35.9], [40.1, 34.4], [43, 32.8], [44.4, 32.5], [46.4, 31], [47.5, 30.5], [48, 30]],
  [[40.2, 37.9], [43.1, 36.3], [44.4, 33.3], [46.1, 32.3], [47.5, 30.5]],
  [[73, 34.5], [72.1, 32.5], [71.2, 29.5], [68.4, 26.2], [67.6, 24.2]],
  [[73.7, 33.4], [73.5, 32.3], [72.3, 31.2], [71.2, 29.5]],
  [[28.5, 48], [29.7, 45.2]],
  [[12.8, 43.5], [12.3, 41.75]]
];
/* proj({lon0, lon1, lat0, lat1, W}) → 把经纬度投影到 SVG 坐标（等距圆柱，按中纬度压缩经度） */
function proj(o){
  const k = Math.cos(((o.lat0 + o.lat1) / 2) * Math.PI / 180);
  const sx = o.W / ((o.lon1 - o.lon0) * k), H = Math.round((o.lat1 - o.lat0) * sx);
  const P = (lon, lat) => [(lon - o.lon0) * k * sx, (o.lat1 - lat) * sx];
  return {P, W: o.W, H, sx, k};
}
function medMap(o){
  const pr = proj(o), P = pr.P;
  const poly = pts => 'M' + pts.map(p => P(p[0], p[1]).map(v => v.toFixed(1)).join(',')).join('L') + 'Z';
  const line = pts => 'M' + pts.map(p => P(p[0], p[1]).map(v => v.toFixed(1)).join(',')).join('L');
  let g = '<rect width="' + pr.W + '" height="' + pr.H + '" fill="var(--land)"/>';
  Object.values(SEAS).forEach(s => g += '<path d="' + poly(s) + '" fill="var(--sea)" stroke="var(--ink-3)" stroke-width=".7" stroke-linejoin="round"/>');
  g += '<path d="' + line([[26.2, 40.1], [26.6, 40.35]]) + line([[29, 41.05], [29, 41.2]]) + '" stroke="var(--sea)" stroke-width="3"/>';
  Object.values(ISLES).forEach(s => g += '<path d="' + poly(s) + '" fill="var(--land)" stroke="var(--ink-3)" stroke-width=".7" stroke-linejoin="round"/>');
  RIVERS.forEach(r => g += '<path d="' + line(r) + '" fill="none" stroke="var(--sea)" stroke-width="1.8" stroke-linecap="round"/>');
  return {svg: g, P, W: pr.W, H: pr.H, line, poly, sx: pr.sx};
}
function hav(a, b){ const R = 6371, t = Math.PI / 180; const dl = (b[1] - a[1]) * t, dn = (b[0] - a[0]) * t; const h = Math.sin(dl / 2) ** 2 + Math.cos(a[1] * t) * Math.cos(b[1] * t) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }

/* 通用小折线图：series=[{name,color,pts:[[x,y]...],dash}]，opt={xmin,xmax,ymin,ymax,xl,yl,marks:[[x,label]]} */
function lineChart(svg, series, opt){
  const W = 600, H = opt.H || 260, L = 46, R = 14, T = 14, B = 30;
  const X = x => L + (x - opt.xmin) / (opt.xmax - opt.xmin) * (W - L - R);
  const Y = y => T + (1 - (y - opt.ymin) / (opt.ymax - opt.ymin)) * (H - T - B);
  let g = '';
  (opt.yt || []).forEach(v => g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--rule)"/>' + txt(L - 6, Y(v) + 4, opt.yf ? opt.yf(v) : v, {s: 11, a: 'end', c: 'var(--ink-3)', halo: false}));
  (opt.xt || []).forEach(v => g += txt(X(v), H - 10, opt.xf ? opt.xf(v) : v, {s: 11, c: 'var(--ink-3)', halo: false}));
  (opt.marks || []).forEach((m, i) => g += '<line x1="' + X(m[0]) + '" x2="' + X(m[0]) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--ink-3)" stroke-dasharray="2 3"/>' + txt(X(m[0]) + 3, T + 12 + (i % 3) * 14, m[1], {s: 11, a: 'start', c: 'var(--ink-2)'}));
  series.forEach(s => {
    g += '<path d="M' + s.pts.map(p => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join('L') + '" fill="none" stroke="' + s.color + '" stroke-width="' + (s.w || 2.4) + '"' + (s.dash ? ' stroke-dasharray="' + s.dash + '"' : '') + ' stroke-linejoin="round"/>';
  });
  g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '" stroke="var(--ink)" stroke-width="1.2"/>';
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
  return {X, Y};
}
