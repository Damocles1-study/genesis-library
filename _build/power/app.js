(function(){
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const fmt = n => n >= 1e8 ? (n / 1e8).toFixed(n >= 1e9 ? 0 : 1) + ' 亿' : n >= 1e4 ? Math.round(n / 1e4).toLocaleString() + ' 万' : Math.round(n).toLocaleString();
const yr = y => y < 0 ? '前 ' + (-y).toLocaleString() : y === 0 ? '公元元年' : String(y);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const btnRow = (box, items, cur, cb) => {
  box.innerHTML = items.map((t, i) => '<button class="btn' + (i === cur ? ' on' : '') + '" data-i="' + i + '">' + t + '</button>').join('');
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', box).forEach(x => x.classList.toggle('on', x === b)); cb(+b.dataset.i); });
};
const dev = (sel, fn) => { const el = $(sel); if (el) { try { fn(el); } catch (err) { console.error(sel, err); } } };
function onVisible(el, start, stop){
  if (!('IntersectionObserver' in window)) { start(); return; }
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : (stop && stop())), {rootMargin: '80px'}).observe(el);
}

/* ---------- 全书目录（三个网页共用） ---------- */
const PAGE = /three\.html/.test(location.pathname) ? 3 : /two\.html/.test(location.pathname) ? 2 : 1;
const PURL = {1: './', 2: 'two.html', 3: 'three.html'};
const TOC = [
  {p: 1, t: '第一部 · 篝火到王座'},
  {v: '序幕'},
  {id: 'c0', n: '序', t: '吃肉', s: '篝火边的三十个人 · 采集者为什么那么讲平等', r: '约前 12000'},
  {v: '卷一 · 分 —— 人怎样分出高低'},
  {id: 'c1', n: '仓', t: '能存住的东西', s: '定居、储藏、继承：贫富差距的发动机', r: '前 12000—前 6000'},
  {id: 'c2', n: '宴', t: '请客的人', s: '大人物、礼物、夸富宴、酋长', r: '前 8000—1900'},
  {id: 'c3', n: '家', t: '屋檐下的高低', s: '男女、长幼、俘虏：另外几条等级线', r: '前 7000—1900'},
  {id: 'c4', n: '城', t: '走不掉的地方', s: '第一批城、走开的人、被圈住的山谷', r: '前 4500—前 1500'},
  {v: '卷二 · 神与刀 —— 让人服气的两种办法'},
  {id: 'c5', n: '祭', t: '神要什么', s: '祭司、神庙、王权神授、人祭', r: '前 9500—1500'},
  {id: 'c6', n: '道', t: '一小撮人的想法', s: '先知、学派、教团怎样从十几个人变成千万人', r: '前 800—700'},
  {id: 'c7', n: '兵', t: '拿刀的人', s: '从偷袭到常备军；当兵的人和政治权利', r: '前 8000—1800'},
  {id: 'c8', n: '符', t: '刀把子', s: '统治者怎样攥住军权：虎符、禁军、杯酒、奴隶兵', r: '前 300—1900'},
  {id: 'c9', n: '碑', t: '写下来的规矩', s: '血仇、赔命价、汉谟拉比、铸刑书、十二铜表', r: '前 2100—前 400'},
  {p: 2, t: '第二部 · 管住天下'},
  {v: '卷三 · 机关 —— 国家的零件'},
  {id: 'c10', n: '籍', t: '数人头', s: '户口、赋税、徭役、度量衡；国家为什么偏爱谷子', r: '前 3000—1900'},
  {id: 'c11', n: '驿', t: '比马跑得快的消息', s: '御道、驰道、印加信使、站赤、驿卒李自成', r: '前 500—1900'},
  {id: 'c12', n: '榜', t: '学堂与考场', s: '泥板学校、私学、科举、文官考试', r: '前 2000—1905'},
  {id: 'c13', n: '场', t: '面包与竞技场', s: '奥林匹亚、斗兽场、蓝绿党、蹴鞠和球赛', r: '前 776—今'},
  {v: '卷四 · 天高皇帝远 —— 远处的地盘怎样管'},
  {id: 'c14', n: '封', t: '分出去的地', s: '分封与郡县、推恩令、总督与封臣', r: '前 1046—1600'},
  {id: 'c15', n: '眼', t: '耳目与回避', s: '刺史、御史、国王之眼、轮换、人质与回避', r: '前 500—1900'},
  {id: 'c16', n: '宫', t: '离王座最近的人', s: '外戚、宦官、宫相、权臣、挟天子', r: '前 200—1900'},
  {id: 'c17', n: '朝', t: '朝代的寿命', s: '兴亡循环、伊本·赫勒敦、复杂的代价', r: '前 1200—1900'},
  {v: '卷五 · 法与信'},
  {id: 'c18', n: '衡', t: '分权与集权', s: '抽签的雅典、两个执政官、威尼斯选总督、三省、议会', r: '前 600—1800'},
  {id: 'c19', n: '律', t: '法的立、守、破', s: '罗马法、唐律、王在法下、指鹿为马、非常时期', r: '前 450—今'},
  {id: 'c20', n: '信', t: '大家真的信吗', s: '台前的话与台下的话、弱者的武器、一夜之间的倒塌', r: '古今'},
  {id: 'c21', n: '局', t: '为什么不合伙分红', s: '承诺难题、流寇与坐寇、合纵连横、同盟的寿命', r: '前 400—今'},
  {p: 3, t: '第三部 · 人间与世界'},
  {v: '卷六 · 一天 —— 各阶层的日子'},
  {id: 'c22', n: '食', t: '吃什么，谁先吃', s: '变矮的农民、啤酒口粮、粮票、餐桌上的阶级', r: '前 10000—今'},
  {id: 'c23', n: '衣', t: '穿什么，住哪里', s: '衣冠禁令、紫色、棉花、塌掉的公寓', r: '前 3000—今'},
  {id: 'c24', n: '行', t: '出门与玩', s: '路引与过所、朝圣、瓦子勾栏、节假日', r: '前 500—今'},
  {id: 'c25', n: '日', t: '同一天', s: '十个时代、三个阶层，各自的二十四小时', r: '前 10000—今'},
  {v: '卷七 · 相遇 —— 地区与地区'},
  {id: 'c26', n: '战', t: '硬仗', s: '补给、马、火药与总体战', r: '前 3000—1945'},
  {id: 'c27', n: '和', t: '软仗', s: '和亲、朝贡、互市、传教与文化', r: '前 200—1900'},
  {id: 'c28', n: '融', t: '交融', s: '商路、作物大交换、基因与语言的迁移', r: '前 3000—1800'},
  {id: 'c29', n: '亡', t: '灭绝与消失', s: '瘟疫、屠城、同化、改名换姓', r: '前 146—1900'},
  {v: '卷八 · 压与养'},
  {id: 'c30', n: '役', t: '压迫的制度', s: '奴隶、农奴、种姓、债役、徭役，以及它们怎样被废', r: '前 2000—1900'},
  {id: 'c31', n: '赈', t: '福利从哪来', s: '常平仓、罗马粮券、居养院、济贫法、俾斯麦', r: '前 2000—今'},
  {v: '尾声'},
  {id: 'c32', n: '今', t: '河湾 · 今天', s: '六张老面孔的现代装束；轮回表；哪些是真的；出处', r: '今'}
];
const chapPage = {}; { let p = 1; TOC.forEach(x => { if (x.p) p = x.p; if (x.id) chapPage[x.id] = p; }); }
const href = id => (chapPage[id] === PAGE ? '' : PURL[chapPage[id]]) + '#' + id;
$$('.bar .parts a').forEach(a => a.classList.toggle('on', +a.dataset.p === PAGE));
$('#drawerList').innerHTML = TOC.map(x => x.p ? '<li class="ph">' + x.t + '</li>' : x.v ? '<li class="vh">' + x.v + '</li>' :
  '<li><a href="' + href(x.id) + '"' + (chapPage[x.id] === PAGE ? ' class="here"' : '') + '><span class="n">' + x.n + '</span><span>' + x.t + '<small>' + x.s + '</small></span></a></li>').join('');
dev('#toc', ul => {
  ul.innerHTML = TOC.map(x => x.p ? '<li class="vh" style="color:var(--pur)">' + x.t + '</li>' : x.v ? '<li class="vh">' + x.v + '</li>' :
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

/* 章首“地球上的哪些地方” */
const REGIONS = ['西亚', '埃及', '南亚', '东亚', '草原', '欧洲', '非洲', '美洲', '大洋洲'];
$$('.where').forEach(w => { const on = (w.dataset.r || '').split(/\s+/); w.innerHTML = REGIONS.map(r => '<span' + (on.includes(r) ? ' class="on"' : '') + '>' + r + '</span>').join(''); });

/* 卷首的小金字塔：卷数越大，垒得越高 */
$$('svg.pyr').forEach(s => {
  const n = +s.dataset.n || 1; let g = '';
  for (let i = 0; i < 8; i++) {
    const w = 180 - i * 21, y = 110 - i * 13, on = i < n;
    g += '<rect x="' + (100 - w / 2) + '" y="' + y + '" width="' + w + '" height="11" rx="1.5" fill="' + (on ? 'var(--pur)' : 'none') + '" fill-opacity="' + (on ? .14 + i * .07 : 0) + '" stroke="var(--pur)" stroke-opacity="' + (on ? .9 : .3) + '" stroke-width="1.2"/>';
  }
  s.setAttribute('viewBox', '0 0 200 124'); s.innerHTML = g;
});

/* ================= 六张脸：漫画人物 =================
   who(种类, {x, y, s, flip, e, era}) 返回一段 SVG，人物画在 100×120 的半身框里。
   种类：da 老大、dao 阿刀、wu 阿巫、suan 阿算、he 阿禾、bei 阿贝；另有 kid、man、woman 路人。
   era：0 石器 1 古国 2 帝国 3 中世 4 近代 5 现代。
   表情 e：n happy shock angry sly worry smug sad shout。 */
const I = 'currentColor', P = 'var(--c-paper)';
const ST = w => ' fill="none" stroke="' + I + '" stroke-width="' + (w || 2.2) + '" stroke-linecap="round" stroke-linejoin="round"';
const FP = ' fill="' + P + '" stroke="' + I + '" stroke-width="2.2" stroke-linejoin="round"';
const FI = ' fill="' + I + '"';
const SHADE = {da: .22, dao: .34, wu: .1, suan: .06, he: 0, bei: .16, kid: 0, man: .08, woman: 0};
function body(kind, era){
  const B = 'M12,121 C14,86 30,72 50,72 C70,72 86,86 88,121 Z';
  let g = '<path d="' + B + '"' + FP + '/>';
  const sh = SHADE[kind] || 0;
  if (sh) g += '<path d="' + B + '" fill="' + I + '" fill-opacity="' + sh + '"/>';
  g += '<path d="M44,57 L44,73 M56,57 L56,73"' + ST() + '/>';
  if (era === 0) g += '<path d="M24,84 l5,6 l4,-6 l5,6 l4,-6 l4,6 l4,-6 l4,6 l4,-6 l5,6 l5,-6 l4,6 l4,-6"' + ST(1.6) + '/><path d="M30,100 l3,4 M58,96 l3,4 M44,106 l3,4 M70,104 l3,4"' + ST(1.3) + '/>';
  else if (era === 1) g += '<path d="M30,80 L72,121 M38,76 L80,117"' + ST(1.7) + '/>';
  else if (era === 2) g += '<path d="M41,73 L59,108 M59,73 L49,90"' + ST(1.9) + '/><path d="M22,96 L22,121 M78,96 L78,121"' + ST(1.2) + '/>';
  else if (era === 3) g += '<path d="M38,74 Q50,86 62,74"' + ST(1.8) + '/><circle cx="50" cy="94" r="1.8"' + FI + '/><circle cx="50" cy="104" r="1.8"' + FI + '/><circle cx="50" cy="114" r="1.8"' + FI + '/>';
  else if (era === 4) g += '<path d="M41,73 L50,100 L59,73 M41,73 L34,92 L46,96 M59,73 L66,92 L54,96"' + ST(1.8) + '/><path d="M45,75 q5,4 10,0 l-5,7 Z"' + FI + '/>';
  else {
    if (kind === 'he' || kind === 'kid') g += '<path d="M38,74 Q50,82 62,74"' + ST(1.8) + '/><path d="M40,100 l20,0"' + ST(1.4) + '/>';
    else if (kind === 'wu') g += '<path d="M40,72 Q50,80 60,72 L60,77 Q50,85 40,77 Z"' + FP + '/>';
    else if (kind === 'dao') g += '<path d="M41,73 L50,92 L59,73"' + ST(1.8) + '/><path d="M24,82 L36,80 M64,80 L76,82"' + ST(3) + '/><circle cx="66" cy="96" r="3"' + FP + '/>';
    else g += '<path d="M42,73 L50,96 L58,73"' + FP + '/><path d="M48,78 L52,78 L54,98 L50,104 L46,98 Z"' + FI + '/><path d="M41,73 L33,96 L45,99 M59,73 L67,96 L55,99"' + ST(1.7) + '/>';
  }
  return g;
}
function face(kind, e){
  let g = '';
  const eye = (x, y) => '<ellipse cx="' + x + '" cy="' + y + '" rx="2.3" ry="2.9"' + FI + '/><circle cx="' + (x + .8) + '" cy="' + (y - 1) + '" r=".8" fill="' + P + '"/>';
  const y = 43;
  if (e === 'happy') g += '<path d="M39.5,44 q3.5,-4.5 7,0 M53.5,44 q3.5,-4.5 7,0"' + ST() + '/><path d="M44,50.5 q6,7.5 12,0 Z"' + FI + '/>';
  else if (e === 'shock') g += '<circle cx="43" cy="' + y + '" r="4"' + FP + '/><circle cx="57" cy="' + y + '" r="4"' + FP + '/><circle cx="43" cy="' + y + '" r="1.4"' + FI + '/><circle cx="57" cy="' + y + '" r="1.4"' + FI + '/><path d="M38,34 q5,-3 9,-.5 M53,33.5 q4,-2.5 9,.5"' + ST() + '/><ellipse cx="50" cy="53" rx="3.2" ry="4"' + FI + '/>';
  else if (e === 'angry' || e === 'shout') g += '<circle cx="43" cy="' + (y + .5) + '" r="2"' + FI + '/><circle cx="57" cy="' + (y + .5) + '" r="2"' + FI + '/><path d="M37.5,35.5 L47,39 M62.5,35.5 L53,39"' + ST(2.8) + '/>' + (e === 'shout' ? '<path d="M43.5,50 q6.5,10 13,0 Z"' + FI + '/>' : '<path d="M44,53 L56,53"' + ST() + '/><path d="M45.5,51 l0,4 M50,51 l0,4 M54.5,51 l0,4"' + ST(1) + '/>');
  else if (e === 'sly') g += '<path d="M39,44 q4,-3 8,0"' + ST() + '/>' + eye(57, y) + '<path d="M37,37.5 q5,-2 10,0 M52.5,35 q5,-3 10,0"' + ST(2) + '/><path d="M45,52 q6,3 11,-2"' + ST() + '/>';
  else if (e === 'worry') g += eye(43, y) + eye(57, y) + '<path d="M38,37 L47,34.5 M62,37 L53,34.5"' + ST() + '/><path d="M44.5,53.5 q2.75,-2.2 5.5,0 q2.75,2.2 5.5,0"' + ST(1.9) + '/><path d="M71,30 q-3.5,6 0,8 q3.5,-2 0,-8 Z"' + FP + '/>';
  else if (e === 'smug') g += eye(43, y + .5) + eye(57, y + .5) + '<path d="M39.5,41.5 L47,41.5 M53,41.5 L60.5,41.5"' + ST(2.6) + '/><path d="M38.5,36 q4,-2 8,0 M53.5,36 q4,-2 8,0"' + ST(1.8) + '/><path d="M43,51 q7,5 14,0"' + ST() + '/>';
  else if (e === 'sad') g += eye(43, y + 1) + eye(57, y + 1) + '<path d="M38,37.5 L47,35 M62,37.5 L53,35"' + ST() + '/><path d="M45,55 q5,-4 10,0"' + ST() + '/>';
  else if (e === 'calm') g += '<path d="M39.5,43 q3.5,3 7,0 M53.5,43 q3.5,3 7,0"' + ST() + '/><path d="M39,37 q4,-1.6 8,0 M53,37 q4,-1.6 8,0"' + ST(1.6) + '/><path d="M46,52 q4,2.5 8,0"' + ST() + '/>';
  else g += eye(43, y) + eye(57, y) + '<path d="M39,37 q4,-2 8,0 M53,37 q4,-2 8,0"' + ST(1.8) + '/><path d="M46,52 q4,2.6 8,0"' + ST() + '/>';
  return g;
}
const HAT = {
  da: [
    '<path d="M32,32 Q50,26 68,32 L68,36 Q50,30 32,36 Z"' + FI + '/><path d="M62,31 q6,-14 2,-24 q-6,8 -5,23"' + FP + '/><path d="M61.5,29 q2,-10 2.5,-20"' + ST(1) + '/>',
    '<path d="M34,33 L36,12 L64,12 L66,33 Z"' + FP + '/><path d="M35,26 L65,26 M35.5,19 L64.5,19"' + ST(1.6) + '/><path d="M34,33 Q50,29 66,33"' + ST(2.4) + '/>',
    '<path d="M33,32 L33,17 L41,24 L50,11 L59,24 L67,17 L67,32 Z"' + FP + '/><path d="M33,32 L33,17 L41,24 L50,11 L59,24 L67,17 L67,32 Z" fill="' + I + '" fill-opacity=".25"/><circle cx="50" cy="26" r="2.2"' + FI + '/>',
    '<path d="M31,33 L29,13 L38,22 L44,9 L50,19 L56,9 L62,22 L71,13 L69,33 Z"' + FP + '/><path d="M31,33 L69,33 L69,28 L31,28 Z"' + FI + '/><circle cx="44" cy="9" r="2"' + FI + '/><circle cx="56" cy="9" r="2"' + FI + '/><circle cx="50" cy="22" r="2.6"' + FP + '/>',
    '<path d="M22,30 Q50,6 78,30 Q50,22 22,30 Z"' + FI + '/><circle cx="50" cy="20" r="3" fill="' + P + '"/>',
    '<path d="M33,36 C30,20 44,21 50,23 C58,20 70,22 67,36 C64,28 56,27 50,29 C44,27 37,28 33,36 Z"' + FI + '/>'
  ],
  dao: [
    '<path d="M33,33 L33,26 L67,26 L67,33 Q50,29 33,33 Z"' + FI + '/>',
    '<path d="M31,36 Q31,14 50,10 Q69,14 69,36 Q50,30 31,36 Z"' + FP + '/><path d="M31,36 Q31,14 50,10 Q69,14 69,36 Q50,30 31,36 Z" fill="' + I + '" fill-opacity=".3"/><path d="M50,10 L50,30"' + ST(1.4) + '/>',
    '<path d="M31,37 Q31,15 50,14 Q69,15 69,37 L64,37 L64,30 L36,30 L36,37 Z"' + FP + '/><path d="M40,15 Q50,-6 64,6 Q58,10 60,16 Q50,10 40,15 Z"' + FI + '/>',
    '<path d="M30,35 Q30,13 50,12 Q70,13 70,35 Z"' + FP + '/><path d="M30,35 Q30,13 50,12 Q70,13 70,35 Z" fill="' + I + '" fill-opacity=".45"/><path d="M48,35 L48,47 L52,47 L52,35"' + FP + '/>',
    '<path d="M35,33 L37,17 L63,17 L65,33 Z"' + FP + '/><path d="M33,33 Q50,29 70,35 L68,38 Q50,33 33,36 Z"' + FI + '/><circle cx="50" cy="25" r="2.4"' + FI + '/>',
    '<path d="M31,31 Q34,16 50,15 Q68,16 70,28 L72,31 Z"' + FI + '/><path d="M30,31 L72,31 Q66,37 50,35 Q36,35 30,31 Z"' + FI + '/><path d="M50,19 l1.5,3.2 3.4,.4 -2.5,2.3 .7,3.3 -3.1,-1.7 -3.1,1.7 .7,-3.3 -2.5,-2.3 3.4,-.4 Z" fill="' + P + '"/>'
  ],
  wu: [
    '<path d="M36,28 Q32,14 24,8 M30,17 L22,18 M42,27 Q42,15 36,6 M64,28 Q68,14 76,8 M70,17 L78,18 M58,27 Q58,15 64,6"' + ST(2.4) + '/>',
    '<path d="M34,32 L50,0 L66,32 Z"' + FP + '/><circle cx="50" cy="16" r="2"' + FI + '/><path d="M44,24 l2,0 M54,24 l2,0"' + ST(1.6) + '/>',
    '<path d="M28,60 Q24,20 50,18 Q76,20 72,60 L66,60 Q68,30 50,29 Q32,30 34,60 Z"' + FP + '/><path d="M28,60 Q24,20 50,18 Q76,20 72,60 L66,60 Q68,30 50,29 Q32,30 34,60 Z" fill="' + I + '" fill-opacity=".25"/>',
    '<path d="M36,30 L38,6 L50,14 L62,6 L64,30 Z"' + FP + '/><circle cx="50" cy="22" r="3.6"' + ST(1.6) + '/>',
    '<path d="M28,24 L50,16 L72,24 L50,32 Z"' + FI + '/><path d="M38,28 L38,33 Q50,37 62,33 L62,28"' + FI + '/><path d="M72,24 L72,36"' + ST(1.4) + '/>',
    '<path d="M66,38 Q74,48 62,56"' + ST(1.8) + '/><circle cx="60" cy="56" r="2.2"' + FI + '/><path d="M37,42 h9 M54,42 h9"' + ST(.1) + '/>'
  ],
  suan: [
    '<circle cx="50" cy="21" r="5.5"' + FI + '/><path d="M64,46 L76,24"' + ST(2) + '/><path d="M76,24 l1.5,-3"' + ST(1) + '/>',
    '<path d="M34,31 Q34,20 50,20 Q66,20 66,31 Q50,27 34,31 Z"' + FI + '/><path d="M64,46 L76,26"' + ST(2) + '/>',
    '<path d="M35,31 Q35,18 50,18 Q65,18 65,31 Z"' + FI + '/><path d="M64,26 Q78,24 82,32 M36,26 Q22,24 18,32"' + ST(2.4) + '/>',
    '<path d="M33,30 Q34,14 50,14 Q66,14 67,30 Q50,26 33,30 Z"' + FP + '/><path d="M33,30 Q34,14 50,14 Q66,14 67,30 Q50,26 33,30 Z" fill="' + I + '" fill-opacity=".3"/><path d="M64,46 L78,28"' + ST(2) + '/>',
    '<path d="M30,33 Q50,25 70,33 L74,40 Q50,30 26,40 Z"' + FP + '/><path d="M30,33 Q50,25 70,33 L74,40 Q50,30 26,40 Z" fill="' + I + '" fill-opacity=".35"/><path d="M34,31 Q36,24 50,24 Q64,24 66,31"' + ST(1.8) + '/>',
    '<path d="M35,31 Q36,22 50,22 Q64,22 65,31 Q50,27 35,31 Z"' + FI + '/><path d="M44,73 L50,96 L56,73"' + ST(1.2) + '/><rect x="45" y="96" width="10" height="13" rx="1.5"' + FP + '/>'
  ],
  he: [
    '<path d="M42,26 L44,18 L48,25 L51,16 L54,25 L58,19 L58,27"' + ST(2.2) + '/><path d="M33,46 Q26,60 30,74 M31,58 l-3,0 M30,66 l-3,0"' + ST(2.4) + '/>',
    '<path d="M31,40 Q30,20 50,19 Q70,20 69,40 Q62,30 50,30 Q38,30 31,40 Z"' + FP + '/><path d="M31,40 Q30,20 50,19 Q70,20 69,40 Q62,30 50,30 Q38,30 31,40 Z" fill="' + I + '" fill-opacity=".18"/><path d="M68,38 l8,10 l-6,2 Z"' + FP + '/>',
    '<path d="M16,33 L50,9 L84,33 Q50,29 16,33 Z"' + FP + '/><path d="M28,27 L50,12 L72,27 M38,30 L50,12 L62,30"' + ST(1) + '/>',
    '<path d="M31,38 Q30,19 50,18 Q70,19 69,38 Q60,29 50,29 Q40,29 31,38 Z"' + FP + '/><path d="M31,38 Q30,19 50,18 Q70,19 69,38 Q60,29 50,29 Q40,29 31,38 Z" fill="' + I + '" fill-opacity=".3"/><path d="M33,46 Q26,60 30,74"' + ST(2.4) + '/>',
    '<path d="M32,32 Q32,18 52,19 Q70,20 70,30 L76,33 Q60,33 32,32 Z"' + FP + '/><path d="M32,32 Q32,18 52,19 Q70,20 70,30 L76,33 Q60,33 32,32 Z" fill="' + I + '" fill-opacity=".2"/><path d="M33,46 Q26,60 30,74"' + ST(2.4) + '/>',
    '<path d="M33,32 Q33,17 50,17 Q67,17 67,32 Z"' + FP + '/><path d="M33,32 Q33,17 50,17 Q67,17 67,32 Z" fill="' + I + '" fill-opacity=".35"/><path d="M60,31 L80,33 L66,35 Z"' + FI + '/><path d="M33,46 Q26,60 30,74"' + ST(2.4) + '/>'
  ],
  bei: [
    '<path d="M32,32 Q50,26 68,32"' + ST(3) + '/><circle cx="40" cy="80" r="2.6"' + FP + '/><circle cx="47" cy="83" r="2.6"' + FP + '/><circle cx="54" cy="83" r="2.6"' + FP + '/><circle cx="61" cy="80" r="2.6"' + FP + '/>',
    '<path d="M33,32 Q32,16 50,16 Q68,16 67,32 Q50,27 33,32 Z"' + FP + '/><path d="M33,32 Q32,16 50,16 Q68,16 67,32 Q50,27 33,32 Z" fill="' + I + '" fill-opacity=".22"/>',
    '<path d="M31,32 Q28,14 50,12 Q72,14 69,32 Q50,26 31,32 Z"' + FP + '/><path d="M33,26 Q50,18 67,26 M32,20 Q50,12 68,22"' + ST(1.4) + '/>',
    '<path d="M35,30 L32,8 Q50,2 68,8 L65,30 Z"' + FP + '/><path d="M35,30 L32,8 Q50,2 68,8 L65,30 Z" fill="' + I + '" fill-opacity=".3"/><path d="M28,30 L72,30"' + ST(3) + '/>',
    '<path d="M36,30 Q36,14 50,14 Q64,14 64,30 Z"' + FI + '/><path d="M28,31 Q50,26 72,31"' + ST(3.2) + '/>',
    '<path d="M33,34 C33,18 66,16 67,32 C60,25 50,25 44,27 C40,28 36,30 33,34 Z"' + FI + '/><rect x="68" y="88" width="10" height="17" rx="2"' + FP + '/>'
  ]
};
function who(kind, o){
  o = o || {};
  const era = o.era == null ? 0 : o.era, e = o.e || (kind === 'wu' ? 'calm' : kind === 'bei' ? 'happy' : 'n');
  let g = body(kind, era);
  // 头
  if (kind === 'dao') g += '<path d="M33,32 Q33,24 41,24 L59,24 Q67,24 67,32 L67,49 Q66,60 50,61 Q34,60 33,49 Z"' + FP + '/>';
  else if (kind === 'wu') g += '<path d="M32,40 Q30,26 50,24 Q70,26 68,40 L71,72 L63,70 L64,44 Q50,40 36,44 L37,70 L29,72 Z"' + FI + '/><ellipse cx="50" cy="44" rx="15.5" ry="18.5"' + FP + '/>';
  else if (kind === 'kid') g += '<circle cx="50" cy="46" r="15"' + FP + '/>';
  else g += '<circle cx="50" cy="42" r="17.5"' + FP + '/>';
  if (kind !== 'wu') g += '<path d="M33,40 q-5,0 -3.5,7 q1,2.5 4,1.5 M67,40 q5,0 3.5,7 q-1,2.5 -4,1.5"' + FP + '/>';
  if (kind === 'woman') g += '<path d="M32.5,40 Q31,24 50,24 Q69,24 67.5,40 Q60,30 50,30 Q40,30 32.5,40 Z"' + FI + '/><path d="M33,44 Q27,58 32,70 M67,44 Q73,58 68,70"' + ST(2.6) + '/>';
  if (kind === 'man') g += '<path d="M33,38 Q33,24 50,24 Q67,24 67,38 Q60,31 50,31 Q40,31 33,38 Z"' + FI + '/>';
  if (kind === 'kid') g += '<path d="M40,33 q10,-8 20,0"' + ST(2.4) + '/>';
  g += face(kind, e);
  // 各人记号
  if (kind === 'da') g += '<path d="M40,56 Q50,72 60,56 Q55,60 50,60 Q45,60 40,56 Z"' + FI + '/><path d="M37,35.5 L47,36.5 M53,36.5 L63,35.5"' + ST(3.2) + '/>';
  if (kind === 'dao') g += '<path d="M36,44 L40,53 M36,47 l3,-1 M37,50 l3,-1"' + ST(1.4) + '/><path d="M36,35 L47,36 M53,36 L64,35"' + ST(3) + '/>';
  if (kind === 'suan') g += '<circle cx="61" cy="51" r="1.3"' + FI + '/>' + (era >= 4 ? '<circle cx="43" cy="43" r="5.2"' + ST(1.6) + '/><circle cx="57" cy="43" r="5.2"' + ST(1.6) + '/><path d="M48.2,43 L51.8,43"' + ST(1.4) + '/>' : '');
  if (kind === 'he') g += '<path d="M37,48 l.1,0 M39.5,50 l.1,0 M36.5,51.5 l.1,0 M63,48 l.1,0 M60.5,50 l.1,0 M63.5,51.5 l.1,0"' + ST(1.8) + '/>';
  if (kind === 'bei') g += '<path d="M50,49 Q44,46 40,50 Q38,52 36,50 M50,49 Q56,46 60,50 Q62,52 64,50"' + ST(2.4) + '/>';
  if (kind === 'wu' && era === 5) g += '<circle cx="43" cy="43" r="5.4"' + ST(1.6) + '/><circle cx="57" cy="43" r="5.4"' + ST(1.6) + '/><path d="M48.4,43 L51.6,43"' + ST(1.4) + '/>';
  if (HAT[kind]) g += HAT[kind][era] || '';
  if (o.sweat) g += '<path d="M72,28 q-3.5,6 0,8 q3.5,-2 0,-8 Z"' + FP + '/>';
  const s = o.s || 1, x = o.x || 0, y = o.y || 0;
  const tf = o.flip ? 'translate(' + x + ',' + y + ') scale(' + (-s) + ',' + s + ') translate(-100,0)' : 'translate(' + x + ',' + y + ') scale(' + s + ')';
  return '<g transform="' + tf + '">' + g + '</g>';
}
const CAST = [
  {k: 'da', n: '老大', r: '坐上面的'}, {k: 'dao', n: '阿刀', r: '拿刀的'}, {k: 'wu', n: '阿巫', r: '跟神说话的'},
  {k: 'suan', n: '阿算', r: '记账的'}, {k: 'he', n: '阿禾', r: '种地的'}, {k: 'bei', n: '阿贝', r: '做买卖的'}
];
const ERAS = ['石器', '古国', '帝国', '中世', '近代', '现代'];

/* ---------- 道具与布景（都画在面板坐标里） ---------- */
const PR = {
  ground: (W, y) => '<path d="M0,' + y + ' L' + W + ',' + y + '"' + ST(2) + '/>',
  hill: (x, y, w, h) => '<path d="M' + x + ',' + y + ' Q' + (x + w / 2) + ',' + (y - h) + ' ' + (x + w) + ',' + y + '"' + ST(1.6) + '/>',
  fire: (x, y, s) => { s = s || 1; return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-16,0 L16,-6 M-16,-6 L16,0"' + ST(3) + '/><path d="M0,-6 C-12,-14 -8,-26 -2,-36 C-2,-26 6,-26 4,-40 C14,-28 14,-14 0,-6 Z"' + FP + '/><path d="M0,-9 C-5,-14 -3,-20 0,-24 C2,-18 6,-16 0,-9 Z"' + FI + '/></g>'; },
  meat: (x, y, s, r) => '<g transform="translate(' + x + ',' + y + ') rotate(' + (r || 0) + ') scale(' + (s || 1) + ')"><path d="M-22,-8 Q-26,-22 -8,-20 Q8,-24 18,-12 Q26,0 14,8 Q-2,14 -14,6 Q-24,2 -22,-8 Z"' + FP + '/><path d="M-12,-10 Q0,-14 10,-6"' + ST(1.4) + '/><path d="M18,-2 L32,4"' + ST(5) + '/><circle cx="33" cy="1" r="3.4"' + FP + '/><circle cx="34" cy="8" r="3.4"' + FP + '/></g>',
  spear: (x, y, h, r) => '<g transform="translate(' + x + ',' + y + ') rotate(' + (r || 0) + ')"><path d="M0,0 L0,' + (-h) + '"' + ST(2.6) + '/><path d="M-5,' + (-h + 2) + ' L0,' + (-h - 16) + ' L5,' + (-h + 2) + ' Z"' + FP + '/></g>',
  sack: (x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><path d="M-16,0 Q-20,-24 -8,-32 L-10,-38 L10,-38 L8,-32 Q20,-24 16,0 Z"' + FP + '/><path d="M-9,-32 L9,-32"' + ST(2) + '/><path d="M-5,-14 q5,-6 10,0 q-5,6 -10,0 Z M0,-20 L0,-8"' + ST(1.2) + '/></g>',
  tablet: (x, y, s, r) => '<g transform="translate(' + x + ',' + y + ') rotate(' + (r || 0) + ') scale(' + (s || 1) + ')"><rect x="-14" y="-18" width="28" height="36" rx="5"' + FP + '/><path d="M-8,-10 l4,0 M0,-10 l6,0 M-8,-3 l9,0 M4,-3 l3,0 M-8,4 l5,0 M0,4 l7,0 M-8,11 l12,0"' + ST(1.6) + '/></g>',
  scroll: (x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><rect x="-20" y="-12" width="40" height="24"' + FP + '/><rect x="-24" y="-15" width="5" height="30" rx="2"' + FP + '/><rect x="19" y="-15" width="5" height="30" rx="2"' + FP + '/><path d="M-14,-5 l28,0 M-14,1 l22,0 M-14,7 l26,0"' + ST(1.2) + '/></g>',
  hut: (x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><path d="M-34,0 L-34,-24 L0,-46 L34,-24 L34,0 Z"' + FP + '/><path d="M-40,-22 L0,-50 L40,-22"' + ST(3) + '/><path d="M-9,0 L-9,-20 Q0,-26 9,-20 L9,0"' + FI + '/></g>',
  granary: (x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><path d="M-24,0 L-24,-40 Q0,-52 24,-40 L24,0 Z"' + FP + '/><path d="M-30,-38 Q0,-70 30,-38 Z"' + FP + '/><path d="M-30,-38 Q0,-70 30,-38 Z" fill="' + I + '" fill-opacity=".25"/><path d="M-24,-14 L24,-14 M-24,-27 L24,-27"' + ST(1.2) + '/><rect x="-6" y="-24" width="12" height="16"' + FI + '/></g>',
  temple: (x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><path d="M-60,0 L-60,-18 L60,-18 L60,0 Z M-44,-18 L-44,-36 L44,-36 L44,-18 M-28,-36 L-28,-54 L28,-54 L28,-36"' + FP + '/><path d="M-10,-54 L-10,-70 L10,-70 L10,-54"' + FP + '/><path d="M-6,0 L-6,-54 M6,0 L6,-54"' + ST(1.2) + '/><path d="M-4,-3 l8,0 M-4,-9 l8,0 M-4,-15 l8,0 M-4,-21 l8,0 M-4,-27 l8,0 M-4,-33 l8,0 M-4,-39 l8,0 M-4,-45 l8,0 M-4,-51 l8,0"' + ST(1) + '/></g>',
  stele: (x, y, s, lines) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><path d="M-20,0 L-20,-70 Q0,-84 20,-70 L20,0 Z"' + FP + '/><path d="M-20,0 L-20,-70 Q0,-84 20,-70 L20,0 Z" fill="' + I + '" fill-opacity=".14"/>' + Array.from({length: lines || 7}, (_, i) => '<path d="M-13,' + (-58 + i * 8) + ' l' + (16 + (i * 7) % 10) + ',0"' + ST(1.4) + '/>').join('') + '</g>',
  wall: (x, y, w, h) => { let g = '<rect x="' + x + '" y="' + (y - h) + '" width="' + w + '" height="' + h + '"' + FP + '/>'; for (let i = x; i < x + w - 6; i += 16) g += '<rect x="' + i + '" y="' + (y - h - 8) + '" width="9" height="8"' + FP + '/>'; for (let r = y - h + 10; r < y; r += 10) g += '<path d="M' + x + ',' + r + ' l' + w + ',0"' + ST(.8) + '/>'; return g; },
  throne: (x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><path d="M-26,0 L-26,-80 Q0,-96 26,-80 L26,0 Z"' + FP + '/><path d="M-26,0 L-26,-80 Q0,-96 26,-80 L26,0 Z" fill="' + I + '" fill-opacity=".3"/><path d="M-34,0 L-34,-30 L34,-30 L34,0"' + ST(3) + '/></g>',
  coin: (x, y, r) => '<g transform="translate(' + x + ',' + y + ')"><circle r="' + (r || 8) + '"' + FP + '/><rect x="' + (-(r || 8) * .32) + '" y="' + (-(r || 8) * .32) + '" width="' + ((r || 8) * .64) + '" height="' + ((r || 8) * .64) + '" fill="none" stroke="' + I + '" stroke-width="1.4"/></g>',
  pig: (x, y, s, f) => '<g transform="translate(' + x + ',' + y + ') scale(' + ((f ? -1 : 1) * (s || 1)) + ',' + (s || 1) + ')"><ellipse cx="0" cy="-16" rx="24" ry="15"' + FP + '/><circle cx="22" cy="-20" r="9"' + FP + '/><ellipse cx="30" cy="-19" rx="3.2" ry="4"' + FP + '/><circle cx="23" cy="-23" r="1.4"' + FI + '/><path d="M16,-30 l3,-6 l4,5 M-24,-18 q-8,-4 -4,-10"' + ST(1.8) + '/><path d="M-14,-3 L-14,4 M-4,-2 L-4,4 M8,-2 L8,4 M16,-4 L16,3"' + ST(3) + '/></g>',
  tiger: (x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><path d="M-30,0 Q-32,-16 -16,-18 L18,-18 Q26,-30 34,-22 Q38,-14 30,-10 L30,0 Z"' + FP + '/><path d="M-30,0 Q-32,-16 -16,-18 L18,-18 Q26,-30 34,-22 Q38,-14 30,-10 L30,0 Z" fill="' + I + '" fill-opacity=".2"/><path d="M-18,-18 l-3,8 M-8,-18 l-3,8 M2,-18 l-3,8 M12,-18 l-3,8"' + ST(2) + '/><path d="M0,-18 L0,0"' + ST(1.2) + '/><path d="M-30,-8 q-10,-2 -12,-12"' + ST(2.2) + '/><circle cx="30" cy="-18" r="1.4"' + FI + '/></g>',
  flag: (x, y, h, t) => '<g transform="translate(' + x + ',' + y + ')"><path d="M0,0 L0,' + (-h) + '"' + ST(2.4) + '/><path d="M0,' + (-h) + ' L34,' + (-h + 8) + ' L0,' + (-h + 18) + ' Z"' + FP + '/>' + (t ? '<text x="10" y="' + (-h + 12) + '" font-size="9" fill="' + I + '" font-family="var(--f-sans)">' + t + '</text>' : '') + '</g>',
  crowd: (x, y, n, s, seed) => { const R = rng(seed || 7); let g = ''; for (let i = 0; i < n; i++) { const cx = x + i * 16 * (s || 1) + (R() - .5) * 6, cy = y + (R() - .5) * 6, r = (6 + R() * 2) * (s || 1); g += '<path d="M' + (cx - r * 1.6) + ',' + (cy + r * 3) + ' Q' + cx + ',' + (cy + r * .4) + ' ' + (cx + r * 1.6) + ',' + (cy + r * 3) + ' Z"' + FP + '/><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"' + FP + '/>'; } return g; },
  star: (x, y, r) => '<path d="M' + x + ',' + (y - r) + ' L' + (x + r * .3) + ',' + (y - r * .3) + ' L' + (x + r) + ',' + y + ' L' + (x + r * .3) + ',' + (y + r * .3) + ' L' + x + ',' + (y + r) + ' L' + (x - r * .3) + ',' + (y + r * .3) + ' L' + (x - r) + ',' + y + ' L' + (x - r * .3) + ',' + (y - r * .3) + ' Z"' + FI + '/>',
  tone: (x, y, w, h, gap, seed) => { gap = gap || 6; let g = '<g fill="' + I + '" opacity=".28">'; for (let j = y + gap / 2; j < y + h; j += gap) for (let i = x + ((j / gap) % 2 ? gap / 2 : 0); i < x + w; i += gap) g += '<circle cx="' + i.toFixed(1) + '" cy="' + j.toFixed(1) + '" r="1.05"/>'; return g + '</g>'; },
  speed: (cx, cy, L, n, r0, seed) => { const R = rng(seed || 3); let p = ''; for (let i = 0; i < n; i++) { const a = R() * Math.PI * 2, r = r0 + R() * r0 * .6; p += 'M' + (cx + Math.cos(a) * L).toFixed(1) + ',' + (cy + Math.sin(a) * L).toFixed(1) + ' L' + (cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1) + ' '; } return '<path d="' + p + '"' + ST(1.2) + '/>'; },
  drops: (x, y, n) => { let g = ''; for (let i = 0; i < n; i++) g += '<path d="M' + (x + i * 9) + ',' + y + ' q-3,5 0,7 q3,-2 0,-7 Z"' + FP + '/>'; return g; }
};
/* 漫画面板注册表：章节文件里写 <svg data-panel="名字">，这里给出画法 */
const PANELS = {};
const W1 = 300, H1 = 230, W2 = 600, H2 = 250;

/* 封面与卷首：六张脸 */
dev('#cast', box => {
  let era = 0;
  const draw = () => {
    box.innerHTML = CAST.map(c => '<figure><svg viewBox="0 0 100 122" aria-hidden="true">' + who(c.k, {era: era}) + '</svg><b>' + c.n + '</b><small>' + c.r + '</small></figure>').join('');
  };
  draw();
  dev('#castEra', b => btnRow(b, ERAS, 0, i => { era = i; draw(); }));
});

/* ---------- 封面装置：一万二千年 ---------- */
dev('#eraFig', fig => {
  const D = [
    [-10000, '约 400 万', '几百人的营地', '没有国家', '采集狩猎：几十人一群，跟着季节走', ['大家'], '三十个人围着火堆分一头鹿。打到鹿的那个人，被大家笑话了一晚上。'],
    [-7000, '约 700 万', '几千人 · 杰里科一类的大村', '没有国家', '农业刚出现：定居的村子和流动的采集者并存', ['长老 · 能人', '各家'], '有人在岸边盖了不走的房子，地窖里存着橡子和野麦。'],
    [-5000, '约 1,500 万', '几千到一万人', '没有国家；最大的酋邦几千平方公里', '农业村落，冒出了酋长和“大人物”', ['大人物', '亲族', '各家'], '阿贝的爷爷请全村吃了三天猪肉，从此他说话有人听。'],
    [-3000, '约 3,000 万', '约 4 万 · 乌鲁克', '约 10 万 km² · 刚统一的埃及', '城邦与神庙；有了文字、书吏和税', ['王 · 大祭司', '书吏 · 官', '工匠 · 兵', '农民', '奴隶'], '神庙里的阿巫说，神要每家交上收成的一份。阿算在泥板上记下了。'],
    [-2300, '约 4,000 万', '约 5–6 万 · 乌尔、乌鲁克', '约 65 万 km² · 阿卡德', '第一批“帝国”：一个王把几十座城捏在一起', ['王中之王', '各城的王', '书吏 · 祭司 · 将', '工匠 · 兵', '农民', '奴隶'], '上游来了一个自称“天下四方之王”的人，河湾的王成了他的下属。'],
    [-1000, '约 6,000 万', '约 5–10 万 · 底比斯、殷墟等（存疑）', '百万 km² 量级 · 埃及、赫梯已过巅峰', '青铜王国，驾战车的贵族', ['王', '战车贵族', '书吏 · 祭司', '工匠 · 兵', '农民', '奴隶'], '阿刀有了一辆马拉的战车。养一辆车，要好几户农民一年的收成。'],
    [-500, '约 1 亿', '约 15 万 · 巴比伦', '约 550 万 km² · 波斯阿契美尼德', '轴心时代：大帝国、新思想、铸币', ['大王', '总督 · 贵族', '官 · 祭司 · 将', '商 · 工', '农民', '奴隶'], '一个游方的先生路过河湾，说人人心里都有一样东西比王还大。阿巫皱起了眉头。'],
    [1, '约 2 亿', '约 50–100 万 · 罗马；长安也是大城', '约 600 万 km² · 汉；罗马约 400–500 万', '汉与罗马，两头大帝国隔着欧亚大陆', ['皇帝', '贵族 · 元老', '官 · 将', '商 · 工 · 兵', '农民', '奴隶'], '河湾成了一个郡的郡治。从京城来的官三年一换，谁也不认识谁。'],
    [500, '约 2.1 亿', '约 40–50 万 · 君士坦丁堡', '约 350 万 km² · 萨珊波斯、东罗马', '大帝国崩裂，草原骑手南下西进，宗教传遍', ['皇帝 · 教会', '贵族', '官 · 僧侣', '兵 · 商', '农民', '奴隶 · 依附民'], '北边来的骑马人占了河湾。三代以后，他们的孙子说着河湾话，拜河湾的神。'],
    [1000, '约 3 亿', '约 45 万 · 科尔多瓦、开封', '约 400 万 km² 量级 · 宋、辽、法蒂玛', '宋、阿拔斯、拜占庭；欧洲的领主与农奴', ['皇帝', '士大夫 · 领主', '官 · 僧侣', '商 · 工', '农民', '佃户 · 农奴'], '阿禾的孙子考中了，成了全族几百年来第一个当官的。'],
    [1270, '约 4 亿', '约 50 万以上 · 杭州（有说过百万，存疑）', '约 2,400 万 km² · 蒙古（尚未分裂时）', '蒙古把欧亚连成一片', ['大汗', '诸王', '官', '商 · 工', '农民', '奴'], '驿站的马一天跑出几百里。阿贝从河湾出发，一年后到了海那边的城。'],
    [1500, '约 4.6 亿', '约 67 万 · 北京', '约 650 万 km² · 明；奥斯曼正在扩张', '火药帝国，航海者抵达美洲', ['皇帝 · 苏丹', '贵族', '官 · 教士', '商 · 工', '农民', '农奴 · 奴隶'], '一种从海那边来的作物，在河湾的山坡上长得比麦子还好。'],
    [1700, '约 6 亿', '约 70–100 万 · 伊斯坦布尔、北京、江户', '约 1,500 万 km² · 俄国', '殖民与奴隶贸易，官僚帝国的鼎盛', ['君主', '贵族', '官 · 教士', '商 · 工', '农民', '农奴 · 奴隶'], '阿算一辈子没离开过衙门，他管的户口册比他爷爷那时厚了三倍。'],
    [1800, '约 10 亿', '约 110 万 · 北京', '约 1,700 万 km² · 俄国；清和大英帝国紧随', '工业革命前夜，民族国家与革命', ['君主', '贵族', '官 · 资本家', '商 · 工 · 兵', '农民 · 工人', '奴隶 · 农奴'], '河湾第一座烟囱冒烟了。阿禾的女儿去了纺纱厂，一天站十四个钟头。'],
    [1900, '约 16.5 亿', '约 650 万 · 伦敦', '约 3,000 万 km² · 大英帝国', '工业、殖民帝国、全民征兵', ['元首', '资本家 · 贵族', '官 · 职员', '工人', '农民', '殖民地臣民'], '每个年满二十岁的男人都要去当兵，阿刀手下忽然有了几十万人。'],
    [1950, '约 25 亿', '约 1,200 万 · 纽约', '约 2,240 万 km² · 苏联', '帝国瓦解，几十个新国家诞生', ['政府', '官 · 企业', '中产', '工人', '农民'], '河湾所在的地方升起了一面新旗子。老人们说，这是他们这辈子见到的第三面。'],
    [2025, '约 82 亿', '约 3,000–4,000 万 · 东京、雅加达（口径不同）', '约 1,710 万 km² · 俄罗斯（最大的国反而变小了）', '两百来个国家，大多数人住在城里', ['政府', '官 · 企业', '中产', '工人 · 农民', '底层'], '河湾通了地铁。三十个人围着火堆分肉的那块地方，现在是一家烧烤店。']
  ];
  const R = $('#eraR'), O = $('#eraO'), KV = $('#eraKV'), T = $('#eraT'), S = $('#eraPyr'), RV = $('#eraRiver');
  R.max = D.length - 1;
  function draw(){
    const d = D[+R.value];
    O.textContent = yr(d[0]) + ' 年';
    KV.innerHTML = '<div>世界人口<b>' + d[1] + '</b></div><div>最大的城<b style="font-size:14px;line-height:1.5">' + d[2] + '</b></div><div>最大的国<b style="font-size:14px;line-height:1.5">' + d[3] + '</b></div>';
    T.innerHTML = '<b>最常见的活法：</b>' + d[4];
    const L = d[5], n = L.length, h = 26, top = 184 - n * h;
    let g = '<text x="120" y="12" text-anchor="middle" font-size="10.5" fill="var(--ink-3)">典型的大社会，大致分几层（示意）</text>';
    L.forEach((t, i) => {
      const y0 = top + i * h, y1 = y0 + h - 3;
      const wa = n === 1 ? 190 : 46 + i * 29, wb = n === 1 ? 220 : 46 + (i + 1) * 29;
      g += '<path d="M' + (120 - wa / 2) + ',' + y0 + ' L' + (120 + wa / 2) + ',' + y0 + ' L' + (120 + wb / 2) + ',' + y1 + ' L' + (120 - wb / 2) + ',' + y1 + ' Z" fill="var(--pur)" fill-opacity="' + (n === 1 ? .3 : (0.5 - i * 0.07).toFixed(2)) + '"/>';
      g += '<text x="120" y="' + (y0 + h / 2 + 3) + '" text-anchor="middle" font-size="' + (i === 0 && n > 1 ? 10 : 11) + '" fill="var(--ink)">' + t + '</text>';
    });
    S.innerHTML = g;
    RV.innerHTML = '<b style="color:var(--och)">这时的河湾（虚构）：</b>' + d[6];
  }
  R.addEventListener('input', draw); draw();
});

/* ---------- 序幕：漫画《笑话那块肉》 ---------- */
PR.deer = (x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><path d="M-46,-10 Q-50,-30 -24,-32 L24,-30 Q44,-28 44,-12 Q40,0 20,-2 L-30,-2 Q-44,-2 -46,-10 Z"' + FP + '/><path d="M40,-22 Q56,-30 64,-22 Q66,-14 56,-12 Q48,-12 42,-16"' + FP + '/><circle cx="58" cy="-21" r="1.6"' + FI + '/><path d="M56,-28 Q56,-44 48,-52 M60,-28 Q64,-44 72,-50 M52,-40 l-6,-2 M62,-40 l6,-3"' + ST(2) + '/><path d="M-30,-2 L-40,10 M-18,-2 L-14,12 M10,-2 L4,12 M22,-2 L30,10"' + ST(2.4) + '/><path d="M-46,-14 q-8,-4 -6,-10"' + ST(2) + '/><path d="M-30,-14 Q0,-20 30,-16"' + ST(1.2) + '/></g>';
PANELS.c0a = () => PR.ground(W2, 226) + PR.hill(330, 226, 280, 60) + PR.hut(560, 226, .8) + PR.fire(440, 224, 1.1) +
  who('dao', {x: 30, y: 72, s: 1.27, e: 'happy'}) + PR.deer(250, 222, 1.2) + PR.speed(250, 190, 120, 14, 78, 5) +
  who('bei', {x: 330, y: 112, s: .95, e: 'n', flip: true}) + who('he', {x: 470, y: 112, s: .95, e: 'n', flip: true});
PANELS.c0b = () => PR.tone(0, 0, 300, 230, 7) + who('he', {x: 10, y: 48, s: 1.62, e: 'smug'}) + PR.meat(230, 200, .9, -10);
PANELS.c0c = () => who('wu', {x: 4, y: 92, s: 1.12, e: 'happy'}) + who('bei', {x: 120, y: 52, s: 1.52, e: 'happy', flip: true}) + '<path d="M118,64 l-10,-8 M114,78 l-12,-2 M262,62 l10,-8"' + ST(2) + '/>';
PANELS.c0d = () => PR.tone(0, 0, 300, 230, 6) + '<rect x="60" y="40" width="190" height="190" fill="' + P + '"/>' + who('dao', {x: 70, y: 46, s: 1.55, e: 'sad', sweat: true}) + '<path d="M40,30 q4,8 0,16 M262,40 q-4,8 0,16"' + ST(1.4) + '/>';
PANELS.c0e = () => PR.ground(W1, 226) + PR.fire(150, 226, .7) + who('da', {x: 0, y: 60, s: 1.42, e: 'calm'}) + who('dao', {x: 196, y: 120, s: .9, e: 'worry', flip: true});
PANELS.c0f = () => {
  let g = PR.ground(W2, 230) + PR.star(60, 30, 5) + PR.star(150, 18, 3) + PR.star(470, 26, 4) + PR.star(560, 46, 3) + PR.star(330, 14, 3);
  g += who('da', {x: 245, y: 112, s: .82, e: 'calm'});
  g += PR.fire(300, 230, 1.15);
  const F = [['dao', 20, 'happy', 0], ['he', 112, 'happy', 0], ['wu', 395, 'calm', 1], ['bei', 482, 'happy', 1], ['suan', 160, 'n', 0]];
  F.forEach((f, i) => { if (i === 4) return; g += who(f[0], {x: f[1], y: 112, s: .98, e: f[2], flip: !!f[3]}) + PR.meat(f[1] + (f[3] ? 30 : 74), 210, .45, f[3] ? 160 : 20); });
  return g;
};

/* ---------- 装置 1：分肉 ---------- */
dev('#shareFig', fig => {
  const FAM = ['阿刀家', '阿禾家', '阿贝家', '阿巫家', '阿算家', '老大家'], D = 60, P0 = 0.2, KILL = 6, KEEP = 3;
  const MODES = ['各吃各的', '只分给本家族（三家一伙）', '全营地一起分'];
  let mode = 0;
  btnRow($('#shareMode'), MODES, 0, i => { mode = i; });
  const grid = $('#shareGrid');
  function run(){
    const kills = FAM.map(() => Array.from({length: D}, () => Math.random() < P0));
    const fed = FAM.map(() => Array(D).fill(false));
    const groups = mode === 0 ? [[0], [1], [2], [3], [4], [5]] : mode === 1 ? [[0, 1, 2], [3, 4, 5]] : [[0, 1, 2, 3, 4, 5]];
    groups.forEach(gp => {
      let store = []; // {units, exp}
      const last = {}; gp.forEach(f => last[f] = -99);
      for (let d = 0; d < D; d++) {
        gp.forEach(f => { if (kills[f][d]) store.push({u: KILL, exp: d + KEEP - 1}); });
        store = store.filter(s => s.exp >= d && s.u > 0);
        const order = gp.slice().sort((a, b) => last[a] - last[b]);
        order.forEach(f => {
          const s = store.find(z => z.u > 0);
          if (s) { s.u--; fed[f][d] = true; last[f] = d; }
        });
        if (gp.length === 1) store.forEach(s => { s.u = Math.min(s.u, KEEP); }); // 一家吃不完，坏掉
      }
    });
    grid.innerHTML = FAM.map((n, f) => '<div style="display:grid;grid-template-columns:4.2em minmax(0,1fr);gap:6px;align-items:center;font-size:12.5px;margin:2px 0"><span style="color:var(--ink-2)">' + n + '</span><div style="display:grid;grid-template-columns:repeat(' + D + ',minmax(0,1fr));gap:1px">' +
      fed[f].map((ok, d) => '<span title="第 ' + (d + 1) + ' 天" style="height:16px;border-radius:2px;background:' + (ok ? 'var(--pur)' : 'color-mix(in srgb,var(--och) 22%,var(--paper))') + ';position:relative">' + (kills[f][d] ? '<i style="position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px;border-radius:50%;background:var(--och)"></i>' : '') + '</span>').join('') + '</div></div>').join('') +
      '<div class="legend"><span><i style="background:var(--pur)"></i>有肉吃</span><span><i style="background:color-mix(in srgb,var(--och) 22%,var(--paper))"></i>只有野菜</span><span><i style="background:var(--och);border-radius:50%"></i>这天打中了猎物</span></div>';
    const days = fed.map(r => r.filter(Boolean).length);
    const streak = fed.map(r => { let m = 0, c = 0; r.forEach(ok => { c = ok ? 0 : c + 1; m = Math.max(m, c); }); return m; });
    const tot = kills.flat().filter(Boolean).length;
    $('#shareKV').innerHTML = '<div>六十天一共打中<b>' + tot + ' 头</b></div><div>平均每家有肉的天数<b>' + (days.reduce((a, b) => a + b, 0) / 6).toFixed(1) + '</b></div><div>最惨的一家<b>' + Math.min(...days) + ' 天</b></div><div>最长连续没肉<b>' + Math.max(...streak) + ' 天</b></div>';
    const say = $('#shareSay');
    say.className = 'say ' + (mode === 2 ? 'ok' : 'bad');
    say.innerHTML = mode === 0 ? '各吃各的：打中的那几天吃不完，肉放坏了；运气差的人家能连着十几天见不到肉。<b>打得一样多，挨饿的日子却多得多</b>——多出来的肉都烂掉了。' :
      mode === 1 ? '只在本家族里分：好了不少，可两伙之间运气还是会差很远。人类学家记录的很多采集群体，会刻意把分享的圈子扩大到远亲、甚至远方的“伙伴”，就是为了把这份保险做大。' :
      '全营地一起分：肉几乎没浪费，绝大多数日子人人有肉。这就是采集者那么讲究“分”的硬道理：在没有冰箱也没有银行的地方，<b>别人的肚子就是你的储藏室</b>。';
  }
  $('#shareGo').addEventListener('click', run);
  run();
});

/* ---------- 装置 2：贫富发动机 ---------- */
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const gini = a => { const x = a.map(v => Math.max(0, v)).sort((p, q) => p - q), n = x.length, s = x.reduce((p, q) => p + q, 0); if (!s) return 0; let c = 0; x.forEach((v, i) => c += (2 * (i + 1) - n - 1) * v); return c / (n * s); };
dev('#giniFig', fig => {
  const N = 30, svg = $('#giniSvg');
  let st, timer = null;
  const opt = () => ({S: $('#gS').checked, I: $('#gI').checked, L: $('#gL').checked, R: $('#gR').checked, X: $('#gX').checked});
  function reset(){ st = {y: 0, w: Array(N).fill(1), land: Array(N).fill(1), debt: Array(N).fill(0), lender: Array(N).fill(-1), hist: [], hunger: 0}; }
  const worth = i => 1 + Math.max(0, st.w[i] + (opt().R ? st.land[i] * 2 : 0) - st.debt[i]);
  function year(){
    const o = opt();
    for (let i = 0; i < N; i++) {
      const h = (o.R ? st.land[i] : 1) * 1.04 * Math.exp(0.35 * gauss() - 0.06);
      const cap = o.S ? Math.max(0, st.w[i]) * (0.03 + 0.07 * gauss()) : 0; // 存下来的粮能变成种子和牲口，有赚有赔
      st.w[i] += h + cap - 1 - 0.02 * Math.max(0, st.w[i]);
      if (!o.S) st.w[i] = Math.min(st.w[i], 0.15);
    }
    // 还债
    if (o.L) for (let i = 0; i < N; i++) if (st.debt[i] > 0 && st.w[i] > 0) {
      const r = Math.min(st.debt[i], st.w[i] * 0.5); st.w[i] -= r; st.debt[i] -= r; if (st.lender[i] >= 0) st.w[st.lender[i]] += r;
      if (st.debt[i] < 1e-6) { st.debt[i] = 0; st.lender[i] = -1; }
    }
    // 歉收
    for (let i = 0; i < N; i++) if (st.w[i] < 0) {
      const need = -st.w[i];
      if (o.L) {
        let j = 0; for (let k = 1; k < N; k++) if (st.w[k] > st.w[j]) j = k;
        if (j !== i && st.w[j] > need) { st.w[j] -= need; st.w[i] = 0; st.debt[i] += need * 1.5; st.lender[i] = j; }
        else { st.w[i] = 0; st.hunger++; }
      } else { st.w[i] = 0; st.hunger++; }
      if (o.R && o.L && st.debt[i] > 1.2 && st.land[i] > 0.2 && st.lender[i] >= 0) { st.land[i] -= 0.2; st.land[st.lender[i]] += 0.2; st.debt[i] = Math.max(0, st.debt[i] - 1); }
    }
    // 分享
    if (o.X) { const m = st.w.reduce((a, b) => a + b, 0) / N; let pool = 0; for (let i = 0; i < N; i++) if (st.w[i] > m) { const g = (st.w[i] - m) * 0.3; st.w[i] -= g; pool += g; } for (let i = 0; i < N; i++) st.w[i] += pool / N; }
    st.y++;
    // 换代
    if (st.y % 25 === 12 && !o.I) { const m = st.w.reduce((a, b) => a + b, 0) / N; st.w.fill(m); st.land.fill(1); st.debt.fill(0); st.lender.fill(-1); }
    st.hist.push(gini(Array.from({length: N}, (_, i) => worth(i))));
  }
  function draw(){
    const v = Array.from({length: N}, (_, i) => worth(i)).sort((a, b) => a - b), mx = Math.max(1, ...v);
    let g = '<text x="10" y="16" font-size="11" fill="var(--ink-3)">三十户的家底（从穷到富）· 第 ' + st.y + ' 年</text>';
    v.forEach((x, i) => { const h = x / mx * 180; g += '<rect x="' + (10 + i * 13.5) + '" y="' + (210 - h) + '" width="11" height="' + Math.max(.5, h) + '" rx="1.5" fill="var(--pur)" fill-opacity="' + (.35 + .65 * i / N) + '"/>'; });
    g += '<line x1="8" y1="210" x2="418" y2="210" stroke="var(--rule)"/>';
    // 基尼曲线
    const X0 = 450, X1 = 630, Y0 = 200, Y1 = 40;
    g += '<text x="' + X0 + '" y="16" font-size="11" fill="var(--ink-3)">基尼系数的变化</text>';
    g += '<rect x="' + X0 + '" y="' + Y1 + '" width="' + (X1 - X0) + '" height="' + (Y0 - Y1) + '" fill="var(--paper)" rx="4"/>';
    [0.25, 0.5, 0.75].forEach(t => { const y = Y0 - t * (Y0 - Y1); g += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + y + '" y2="' + y + '" stroke="var(--rule)" stroke-dasharray="2 3"/><text x="' + (X0 - 4) + '" y="' + (y + 3) + '" font-size="9.5" text-anchor="end" fill="var(--ink-3)">' + t + '</text>'; });
    if (st.hist.length > 1) {
      const n = Math.max(200, st.hist.length);
      g += '<path d="' + st.hist.map((q, i) => (i ? 'L' : 'M') + (X0 + i / n * (X1 - X0)).toFixed(1) + ',' + (Y0 - q * (Y0 - Y1)).toFixed(1)).join(' ') + '" fill="none" stroke="var(--pur)" stroke-width="2"/>';
    }
    const G = st.hist.length ? st.hist[st.hist.length - 1] : 0;
    g += '<text x="' + X1 + '" y="34" font-size="22" text-anchor="end" fill="var(--pur)" font-family="var(--f-mono)">' + G.toFixed(2) + '</text>';
    g += '<text x="' + X0 + '" y="218" font-size="9.5" fill="var(--ink-3)">0 年</text><text x="' + X1 + '" y="218" font-size="9.5" text-anchor="end" fill="var(--ink-3)">' + Math.max(200, st.y) + ' 年</text>';
    svg.innerHTML = g;
    const tot = v.reduce((a, b) => a + b, 0) || 1, top3 = v.slice(-3).reduce((a, b) => a + b, 0);
    const o = opt(), indebted = st.debt.filter(d => d > 0.01).length, landless = st.land.filter(l => l < 0.5).length;
    $('#giniKV').innerHTML = '<div>基尼系数<b>' + G.toFixed(2) + '</b></div><div>最富三户占全村家底<b>' + Math.round(top3 / tot * 100) + '%</b></div><div>欠着债的人家<b>' + (o.L ? indebted + ' 户' : '—') + '</b></div><div>地不到半份的人家<b>' + (o.R ? landless + ' 户' : '—') + '</b></div>';
    const say = $('#giniSay');
    if (st.y < 25) return;
    let t;
    if (!o.S) t = '不能存的时候，好年景吃不完也只能烂掉，坏年景就挨饿，谁也攒不下家底，差距很小——这正是采集者的处境。';
    else if (!o.I) t = '能存但不能传：一代人里会拉开差距，可每过二十五年换一代人，家底重新拉平。很多采集和园圃社会就是这样，个人可以出名、可以富，但很难变成“世家”。';
    else if (o.X) t = '分享的规矩像一个刹车：差距还在，但被压住了。人类学家在许多小社会里看到的那些“请客”“送礼”“笑话那块肉”，都在干这件事。规矩一松，发动机马上提速。';
    else if (o.L && o.R) t = '能存、能传、能借、地有限，四样一齐：欠债的人家拿地抵债，地越少收成越少，越要借债；有地的人家越滚越大。几代以后，村里出现了地主和佃户。这几乎是每一个古代农业社会都演过的戏。';
    else if (o.L) t = '加上借贷：歉收的人家借一还一点五，利息源源不断流向富户。差距比只靠运气时大得多，而且很少有人能翻身。';
    else t = '能存又能传：光凭运气，差距就会一代比一代大，因为好运气攒下的家底会留给孩子，坏运气的窟窿也一样。再打开“能借”试试。';
    say.innerHTML = t;
  }
  function run(years){
    clearInterval(timer); let left = years;
    timer = setInterval(() => { for (let k = 0; k < 3 && left > 0; k++, left--) year(); draw(); if (left <= 0) clearInterval(timer); }, 30);
  }
  $('#giniGo').addEventListener('click', () => { reset(); run(200); });
  $('#giniStep').addEventListener('click', () => { if (!st) reset(); run(25); });
  reset(); draw();
});

/* ---------- 第二章：漫画《三天的猪肉》 ---------- */
PR.house = (x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><path d="M-60,0 L-60,-40 L60,-40 L60,0 Z"' + FP + '/><path d="M-72,-38 L0,-84 L72,-38 Z"' + FP + '/><path d="M-72,-38 L0,-84 L72,-38 Z" fill="' + I + '" fill-opacity=".2"/><path d="M-12,0 L-12,-26 L12,-26 L12,0"' + FI + '/><path d="M-50,-50 L50,-50 M-36,-60 L36,-60 M-20,-70 L20,-70"' + ST(1) + '/></g>';
PR.log = (x, y, w, r) => '<g transform="translate(' + x + ',' + y + ') rotate(' + (r || 0) + ')"><rect x="' + (-w / 2) + '" y="-7" width="' + w + '" height="14" rx="7"' + FP + '/><ellipse cx="' + (w / 2 - 3) + '" cy="0" rx="4" ry="7"' + FP + '/><path d="M' + (-w / 3) + ',-2 l' + (w / 4) + ',0"' + ST(1) + '/></g>';
PANELS.c2a = () => PR.ground(W2, 228) + PR.pig(70, 226, .9) + PR.pig(140, 226, .8, true) + PR.fire(300, 228, 1.3) +
  who('bei', {x: 190, y: 92, s: 1.08, e: 'happy'}) + PR.crowd(360, 150, 13, 1.05, 11) + PR.meat(480, 200, .7, 15);
PANELS.c2b = () => who('he', {x: -8, y: 76, s: 1.3, e: 'happy'}) + PR.meat(118, 196, .7, -20) + who('suan', {x: 160, y: 96, s: 1.15, e: 'sly', flip: true});
PANELS.c2c = () => '<rect width="300" height="230" fill="' + I + '" fill-opacity=".12"/>' + PR.star(30, 60, 4) + PR.star(70, 40, 3) +
  who('bei', {x: 10, y: 74, s: 1.32, e: 'sly'}) + '<g transform="translate(200,190)">' + [0, 1, 2, 3, 4, 5].map(i => '<path d="M' + (i * 12) + ',0 L' + (i * 12 + 4) + ',-44"' + ST(3) + '/><path d="M' + (i * 12 - 2) + ',-12 l8,0 M' + (i * 12 - 1) + ',-24 l8,0"' + ST(1.4) + '/>').join('') + '</g>';
PANELS.c2d = () => PR.ground(W1, 226) + who('bei', {x: -6, y: 86, s: 1.18, e: 'happy'}) + who('he', {x: 150, y: 96, s: 1.05, e: 'worry', flip: true}) + who('dao', {x: 214, y: 120, s: .85, e: 'n', flip: true});
PANELS.c2e = () => PR.ground(W1, 226) + PR.house(220, 226, .95) + who('dao', {x: 6, y: 112, s: .9, e: 'angry'}) + who('he', {x: 96, y: 118, s: .85, e: 'worry'}) + PR.log(90, 120, 170, -8);
PANELS.c2f = () => PR.ground(W2, 230) + PR.house(470, 230, 1.1) + '<g opacity=".55">' + who('bei', {x: 20, y: 120, s: .8, e: 'calm'}) + '</g>' +
  who('bei', {x: 150, y: 80, s: 1.2, e: 'smug', era: 1}) + PR.crowd(330, 168, 6, .85, 4) + PR.pig(330, 228, .7) + PR.pig(390, 228, .6, true);

/* ---------- 装置 3：请客 ---------- */
dev('#feastFig', fig => {
  let S;
  const KV = $('#feastKV'), B = $('#feastBtns'), SAY = $('#feastSay');
  function reset(){ S = {y: 1, pig: 5, face: 0, owed: 0, debt: 0, rule: false, over: false, log: []}; draw('你继承了五头猪。邻村的大人物阿黑已经很有名了。第一年，做点什么？'); }
  const A = [
    {k: 'eat', t: '自家吃', ok: () => true},
    {k: 'small', t: '小请客（3 头猪）', ok: () => S.pig >= 3},
    {k: 'big', t: '大宴（8 头，不够就借）', ok: () => true},
    {k: 'ask', t: '讨人情', ok: () => S.owed > 0},
    {k: 'rule', t: '把请客定成规矩', ok: () => S.face >= 24 && !S.rule}
  ];
  function draw(msg){
    KV.innerHTML = '<div>第几年<b>' + Math.min(S.y, 12) + ' / 12</b></div><div>自家的猪<b>' + S.pig + ' 头</b></div><div>面子<b>' + S.face + '</b></div><div>别人欠你<b>' + S.owed + ' 头</b></div><div>你欠别人<b>' + S.debt + ' 头</b></div><div>身份<b style="font-size:15px">' + (S.rule ? '酋长' : S.face >= 24 ? '大人物（可以定规矩了）' : S.face >= 12 ? '大人物' : S.face >= 5 ? '有点名气' : '普通人') + '</b></div>';
    B.innerHTML = S.over ? '' : A.map(a => '<button class="btn" data-k="' + a.k + '"' + (a.ok() ? '' : ' disabled') + '>' + a.t + '</button>').join('');
    SAY.innerHTML = msg;
  }
  B.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || S.over) return;
    const k = b.dataset.k; let m = '';
    if (k === 'eat') { S.pig += 1; m = '你家吃得不错。村里人说：阿贝家日子过得挺好，就是有点抠。'; S.face = Math.max(0, S.face - 1); }
    if (k === 'small') { S.pig -= 3; S.face += 3; S.owed += 3; m = '亲戚邻居吃得高兴。几个人拍着你的肩膀说：下回我家办事，一定请你。'; }
    if (k === 'big') { const need = Math.max(0, 8 - S.pig); S.pig = Math.max(0, S.pig - 8); S.debt += Math.ceil(need * 1.5); S.face += 9; S.owed += 6; m = '三天三夜的大宴！连邻村的人都来了。' + (need ? '你借了 ' + need + ' 头猪，要还 ' + Math.ceil(need * 1.5) + ' 头。' : '') + '有人开始叫你“大人物”。'; }
    if (k === 'ask') { const g = Math.min(S.owed, 4); S.owed -= g; S.pig += g; S.face = Math.max(0, S.face - 2); m = '你挨家去讨，收回 ' + g + ' 头猪。大家给了，但背后有人说：原来他请客是为了这个。'; }
    if (k === 'rule') { S.rule = true; m = '你宣布：从今往后，每家每年秋天送一头猪来，用来祭祖、办宴。大家看了看彼此——你请过所有人，所有人都欠你。没人反对。<b>请客变成了上贡。</b>'; }
    // 年终结算
    S.pig += Math.floor(S.pig / 3);
    if (S.rule) S.pig += 6;
    if (S.owed > 0 && Math.random() < .5) { S.pig++; S.owed--; m += ' 有一家主动还了你一头猪。'; }
    if (S.debt > 0) {
      const r = Math.min(S.debt, Math.max(0, S.pig - 2)); S.pig -= r; S.debt -= r;
      if (S.debt > 0) { S.face = Math.max(0, S.face - 4); m += ' 你还欠着 ' + S.debt + ' 头猪没还上，债主在村里到处说，你的面子掉了一截。'; }
    }
    if (!S.rule && Math.random() < .3) {
      if (k === 'big') m += ' 邻村的阿黑也办了宴，可没你的大。他的人有一半跑来跟你了。';
      else { S.face = Math.max(0, S.face - 3); m += ' 这一年，邻村的阿黑办了一场大宴，村里好些年轻人跑去吃了，回来都说阿黑的好。'; }
    }
    if (Math.random() < .12) { const d = Math.ceil(S.pig * .4); S.pig -= d; m += ' 猪瘟！死了 ' + d + ' 头。'; }
    S.y++;
    if (S.y > 12) {
      S.over = true;
      let end;
      if (S.rule) end = '<b>十二年到了，你死了。</b>你的儿子坐到了你的位置上，每年秋天照样有人送猪来。没人记得当初那几场宴，大家只知道“他们家一直是管事的”。<b>你成了第一代酋长。</b>';
      else if (S.debt > 4) end = '<b>十二年到了，你死了。</b>留下一屁股债。儿子要先替你还猪，才能抬头做人。美拉尼西亚的大人物常常这样收场：请得太猛，垮得也快。';
      else if (S.face >= 12) end = '<b>十二年到了，你死了。</b>全村都来给你送葬，说你是最大方的人。可是第二年，大家就开始去吃阿黑家的宴了。<b>你的威望跟你一起下葬了</b>，儿子得从头请起。这就是萨林斯说的“大人物”的天花板。';
      else end = '<b>十二年到了，你死了。</b>你是个过得不错的普通人。河湾的大事，还是别人说了算。';
      draw(m + '<br><br>' + end);
      return;
    }
    draw(m);
  });
  $('#feastReset').addEventListener('click', reset);
  reset();
});

/* ---------- 装置 4：一个家里谁说了算 ---------- */
dev('#homeFig', fig => {
  const F = ['东西传给谁', '婚后住哪儿', '孩子算谁家的', '谁能提出离婚', '一件那里特有的事'];
  const D = [
    ['朱/霍安西人', ['值钱的东西本来就少，个人用品多半送人或者随葬，谈不上“家产”。', '常常先住到女方家，过几年再决定跟谁家的亲戚一起住。', '两边的亲戚都管，孩子在整个营地里长大。', '很常见，双方都可以，散了也不至于结仇。', '新郎要先给岳父母打好几年猎，证明自己养得起家。']],
    ['古巴比伦（汉谟拉比时代）', ['儿子分家产；女儿出嫁时拿一份嫁妆，算是提前分走的那一份。', '住到夫家。男方送聘礼，女方带嫁妆。', '属于父亲的家。', '丈夫可以休妻，但要退还嫁妆；法典也规定，妻子若被丈夫冷落、自己没有过错，可以带着嫁妆回娘家。', '法典规定，欠债的人可以把妻子儿女抵给债主做工，但三年以后必须放回。']],
    ['罗马共和晚期', ['父亲死后，没立遗嘱的话，儿子和女儿都有份。', '住到夫家。', '属于父亲的家族，离婚后孩子通常跟父亲。', '共和晚期，夫妻双方都可以离婚，手续很简单，贵族之间为了政治联姻离了又结很常见。', '法律上，“家父”对子女有生杀大权；新生儿要父亲抱起来承认，才算进了家门。']],
    ['汉代中国', ['儿子们平分家产；女儿出嫁时带走嫁妆。', '住到夫家。', '属于父亲的宗族，随父姓。', '丈夫可以“出妻”；女方主动求去也不是没有，《汉书》里就记着朱买臣的妻子嫌他穷，自己要求离开。', '比起后世，汉代寡妇再嫁相当常见，连公主也再嫁。“从一而终”被抬得那么高，是后来很久的事。']],
    ['米南佳保人', ['祖传的田和大屋由母亲传给女儿；男人自己挣的钱可以按伊斯兰教法传给子女。', '传统上男人婚后到妻子的母家去。', '属于母亲的氏族，舅舅是孩子的管教人。', '按伊斯兰教法，男方可以休妻；但房子和田地留在女方家，男人走的时候常常只带走自己的衣服。', '年轻男人要出远门闯荡，叫“默兰涛”，闯出名堂再回来。']],
    ['摩梭人', ['家产属于整个母系大家庭，不分给个人。', '不住一起：“走婚”，男人夜里去，早上回自己母亲家。', '属于母亲的家，舅舅像父亲一样抚养外甥。', '走婚关系任何一方都可以随时结束，没有财产纠纷。', '家里管事的“达布”，常常是最能干的年长女性。']],
    ['易洛魁人', ['长屋和田地属于母系氏族，女人管农事和粮食。', '男人婚后住进妻子家族的长屋。', '属于母亲的氏族。', '双方都可以离开，男人离婚时常常是自己搬出长屋。', '“氏族母亲”提名代表氏族的男性首领，首领失职，她们可以把他罢免。']]
  ];
  const cards = $('#homeCards');
  const show = i => { cards.innerHTML = F.map((f, k) => '<div class="cd"><small>' + f + '</small><div>' + D[i][1][k] + '</div></div>').join(''); };
  btnRow($('#homeBtns'), D.map(d => d[0]), 0, show); show(0);
});

/* ---------- 第四章：漫画《往哪儿走》 ---------- */
PR.dune = (x, y, w, h) => '<path d="M' + x + ',' + y + ' q' + (w * .25) + ',' + (-h) + ' ' + (w * .5) + ',' + (-h * .4) + ' q' + (w * .25) + ',' + (h * .5) + ' ' + (w * .5) + ',' + (h * .4) + '"' + ST(1.6) + '/>';
PR.bricks = (x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' + [[-20, 0], [0, 0], [-10, -10]].map(p => '<rect x="' + p[0] + '" y="' + (p[1] - 10) + '" width="20" height="10"' + FP + '/>').join('') + '</g>';
PANELS.c4a = () => PR.ground(W1, 228) + '<rect x="0" y="160" width="120" height="68"' + FP + '/>' + who('da', {x: 6, y: 62, s: 1, e: 'shout', era: 1}) + PR.crowd(150, 178, 8, .9, 21);
PANELS.c4b = () => PR.ground(W1, 226) + PR.hill(150, 226, 200, 120) + PR.hill(210, 226, 120, 60) +
  who('he', {x: 30, y: 96, s: 1.1, e: 'happy', era: 1}) + PR.sack(70, 168, .7) + '<path d="M150,210 l40,-2 M196,206 l14,-4"' + ST(1.4) + '/>';
PANELS.c4c = () => PR.ground(W1, 226) + PR.dune(0, 226, 120, 50) + PR.dune(200, 226, 120, 60) + PR.dune(-30, 190, 100, 30) + PR.dune(230, 190, 90, 30) +
  '<path d="M110,226 Q130,170 150,226 M140,226 Q160,180 175,226" fill="none" stroke="' + I + '" stroke-width="1.2" stroke-dasharray="3 3"/>' + '<circle cx="250" cy="40" r="16"' + FP + '/>' +
  who('he', {x: 80, y: 100, s: 1.05, e: 'worry', era: 2});
PANELS.c4d = () => PR.ground(W1, 228) + PR.wall(150, 228, 150, 90) + who('he', {x: 10, y: 110, s: .95, e: 'sad', era: 2}) + PR.bricks(70, 190, .9) + who('dao', {x: 196, y: 40, s: .85, e: 'n', era: 2, flip: true}) + PR.spear(186, 140, 110, 0);

/* ---------- 装置 5：九条河 ---------- */
dev('#riverFig', fig => {
  const T = [
    ['西亚', [['f', -9500, '新月沃地：小麦、大麦、山羊绵羊相继驯化，约前 9500 年起。'], ['c', -4000, '乌鲁克等城在前 4000 年后迅速长大，前 3100 年前后可能有几万人。'], ['s', -3200, '乌鲁克晚期，神庙和王宫管着大批劳力，城邦国家成形。'], ['w', -3200, '楔形文字：最早是记账的符号，约前 3200 年。']]],
    ['埃及', [['f', -5500, '小麦大麦和牛羊从西亚传入尼罗河谷，约前 5500—前 5000 年。'], ['c', -3500, '涅伽达、希拉孔波利斯等大聚落，出现了明显更大的墓。'], ['s', -3100, '上下埃及统一，法老成为神王。'], ['w', -3200, '圣书字：阿拜多斯一座早期墓里出土的骨牌标签，约前 3200 年。']]],
    ['印度河', [['f', -7000, '梅赫尔格尔：种大麦、养牛，约前 7000 年。'], ['c', -2600, '摩亨佐-达罗、哈拉帕等城，约前 2600—前 1900 年。'], ['w', -2600, '印度河印章上的文字，至今没有破译。（这一条没有标“国家”：统治者是谁，至今说不清。）']]],
    ['黄河长江', [['f', -7500, '北方的粟黍、南方的稻，约前 8000—前 7000 年先后驯化。'], ['c', -3300, '良渚古城：城墙、水坝、大墓、玉器，约前 3300—前 2300 年。'], ['s', -1900, '二里头：宫殿区、青铜礼器作坊。它是不是文献里的“夏”，有争议。'], ['w', -1250, '殷墟甲骨文，约前 1250 年，已经是成熟的文字。']]],
    ['中美洲', [['f', -7000, '玉米的驯化约始于前 7000 年，但定居村落要晚到前 2000 年前后才普遍。'], ['c', -1200, '奥尔梅克的圣洛伦索，巨石头像。'], ['s', -500, '瓦哈卡谷地的蒙特阿尔万。'], ['w', -500, '萨波特克文字，约前 500 年（有更早的说法，存疑）。']]],
    ['安第斯', [['f', -6000, '马铃薯、藜麦、豆类，羊驼和豚鼠。'], ['c', -2600, '秘鲁海岸的卡拉尔：美洲已知最早的城，那时还没有陶器。'], ['s', 600, '瓦里帝国（约 600—1000 年）；也有学者认为海岸的莫切更早就是国家。（安第斯一直没有发展出文字，用结绳“奇普”记账。）']]],
    ['非洲（撒哈拉以南）', [['f', -3000, '萨赫勒的高粱、珍珠粟、非洲稻；放牧牛群还要更早。'], ['c', -250, '尼日尔河边的杰内-杰诺，没有明显的王宫，像是许多专业社区的联合体。'], ['s', 100, '东非的阿克苏姆王国，铸币、立方尖碑、做红海贸易。'], ['w', 100, '阿克苏姆使用吉兹字母，源自南阿拉伯的字母，属于借来的文字。']]],
    ['欧洲', [['f', -6500, '农业从安纳托利亚传入希腊，再一路向西北传播。'], ['c', -2000, '克里特岛的克诺索斯宫殿。'], ['s', -1600, '希腊本土的迈锡尼诸王国。'], ['w', -1800, '克里特的线形文字 A，未破译；迈锡尼人后来改造出线形文字 B。']]],
    ['夏威夷', [['f', 1000, '波利尼西亚航海者带着芋头、甘薯、猪登岛，约 1000—1200 年。'], ['s', 1600, '考古学家基尔希认为，约 1600 年前后夏威夷出现了神王和“原始国家”。（存疑）']]]
  ];
  const TL = $('#riverTL'), SAY = $('#riverSay');
  let align = false;
  const NAME = {f: '农业', c: '城', s: '国家', w: '文字'};
  function draw(){
    const x0 = align ? 0 : -10000, x1 = align ? 9500 : 1700;
    const pos = (v, f) => ((align ? v - f : v) - x0) / (x1 - x0) * 100;
    let h = '';
    T.forEach((t, ti) => {
      const f = t[1][0][1];
      h += '<div class="track"><span class="nm">' + t[0] + '</span><div class="lane">' + t[1].map((m, mi) => '<i class="' + m[0] + '" data-t="' + ti + '" data-m="' + mi + '" style="left:' + pos(m[1], f).toFixed(2) + '%;cursor:pointer" title="' + NAME[m[0]] + '"></i>').join('') + '</div></div>';
    });
    const ticks = align ? [0, 2000, 4000, 6000, 8000] : [-10000, -8000, -6000, -4000, -2000, 0];
    h += '<div class="axis"><span></span><div>' + ticks.map(v => '<span style="left:' + ((v - x0) / (x1 - x0) * 100) + '%">' + (align ? '+' + v + ' 年' : yr(v)) + '</span>').join('') + '</div></div>';
    TL.innerHTML = h;
  }
  TL.addEventListener('click', e => {
    const i = e.target.closest('i'); if (!i) return;
    const t = T[+i.dataset.t], m = t[1][+i.dataset.m], f = t[1][0][1];
    SAY.innerHTML = '<b>' + t[0] + ' · ' + NAME[m[0]] + ' · ' + yr(m[1]) + ' 年</b>' + (align && m[0] !== 'f' ? '（种地以后约 ' + (m[1] - f).toLocaleString() + ' 年）' : '') + '<br>' + m[2];
  });
  btnRow($('#riverMode'), ['按真实年代', '从第一块田算起'], 0, i => { align = !!i; draw(); SAY.innerHTML = align ? '对齐以后看得清楚：西亚从种地到建国走了六千多年，中美洲和安第斯也要好几千年，夏威夷却只用了几百年——波利尼西亚人登岛时，已经带着一整套酋长制度的“种子”。<b>国家不是种地的必然结果，而是很多条件慢慢凑齐的结果。</b>' : '点一个点。'; });
  draw();
});

/* ---------- 装置 6：王与祭司的天平 ---------- */
dev('#scaleFig', fig => {
  const D = [
    ['乌鲁克', '约前 3300', -.6, 1, '神庙是城里最大的机构：田地、作坊、仓库、成百上千的劳力，都归“恩”（大祭司）管。'],
    ['拉格什', '约前 2350', .3, 1, '乌鲁卡基纳以“改革”之名指责前任和祭司贪婪。卢伽尔（王）的王宫越来越大，神庙渐渐退到第二位。'],
    ['埃及古王国', '约前 2500', .85, 1, '法老本人就是神，全国的祭祀名义上都以他的名义进行。天平几乎合成了一根柱子。'],
    ['底比斯', '约前 1070', -.5, 1, '新王国末年，阿蒙神庙的大祭司在底比斯一带自成一统，和北方的法老分庭抗礼。神庙太富，就会自己长出一个朝廷。'],
    ['商', '约前 1250', .7, 1, '商王是最大的巫，亲自主持占卜、解读卜兆。贞人（占卜官）很重要，但最后的“王占曰”由王说了算。'],
    ['吠陀印度', '约前 1000', -.6, 1, '“原人歌”把婆罗门排在刹帝利之上。王要请婆罗门举行大祭来确认自己的地位，例如持续一年的马祭。'],
    ['罗马帝国', '前 12', .8, 2, '奥古斯都当上大祭司长。此后历代皇帝都兼任此职，死后还常被元老院宣布为神。'],
    ['卡诺莎', '1077', -.7, 3, '神圣罗马皇帝亨利四世和教皇争夺主教任命权，被开除教籍，诸侯趁机反他。他冒着大雪在卡诺莎城堡外等了三天，求教皇宽恕。'],
    ['宋', '1008', .65, 3, '宋真宗搞“天书”、泰山封禅。朝廷给各路神灵加封号，僧道要领官府发的度牒，度牒还能拿来卖钱充军费。'],
    ['英格兰', '1534', .9, 3, '《至尊法案》：亨利八世宣布自己是英格兰教会的最高首脑，随后解散修道院，把它们的土地收归王室、卖给贵族。'],
    ['江户日本', '1640 年代', .8, 3, '幕府推行“寺请制度”：每户人家必须登记在一座佛寺名下，由寺院证明不是基督徒。寺院成了替幕府管户口的机构。'],
    ['罗马城', '1870', .5, 4, '意大利王国的军队开进罗马，教皇失去了统治一千多年的世俗领土，退居梵蒂冈，自称“梵蒂冈的囚徒”。'],
    ['伊朗', '1979', -.8, 5, '革命后实行“法学家监护”制度：最高领袖由伊斯兰教法学家担任，位在民选的总统和议会之上。']
  ];
  const svg = $('#scaleSvg'), SAY = $('#scaleSay');
  function draw(i){
    const d = D[i], a = d[2] * 16, cx = 240, cy = 52, L = 170;
    const r = a * Math.PI / 180, lx = cx - L * Math.cos(r), ly = cy - L * Math.sin(r), rx = cx + L * Math.cos(r), ry = cy + L * Math.sin(r);
    const pan = (x, y, k, lab) => '<path d="M' + x + ',' + y + ' L' + (x - 34) + ',' + (y + 62) + ' M' + x + ',' + y + ' L' + (x + 34) + ',' + (y + 62) + '" stroke="var(--ink-3)" stroke-width="1.2"/>' +
      '<g color="var(--ink)">' + who(k, {x: x - 24, y: y + 6, s: .48, era: d[3], e: k === 'da' ? 'smug' : 'calm'}) + '</g>' +
      '<path d="M' + (x - 44) + ',' + (y + 62) + ' Q' + x + ',' + (y + 84) + ' ' + (x + 44) + ',' + (y + 62) + ' Z" fill="var(--card)" stroke="var(--ink)" stroke-width="1.6"/>' +
      '<text x="' + x + '" y="' + (y + 100) + '" text-anchor="middle" font-size="12.5" fill="var(--ink-2)">' + lab + '</text>';
    svg.innerHTML = '<path d="M' + cx + ',' + cy + ' L' + (cx - 30) + ',206 L' + (cx + 30) + ',206 Z" fill="var(--pur)" fill-opacity=".14" stroke="var(--pur)" stroke-width="1.4"/>' +
      '<line x1="' + lx + '" y1="' + ly + '" x2="' + rx + '" y2="' + ry + '" stroke="var(--ink)" stroke-width="3.2" stroke-linecap="round"/><circle cx="' + cx + '" cy="' + cy + '" r="5" fill="var(--pur)"/>' +
      pan(lx, ly, 'wu', '神庙 · 祭司 · 教会') + pan(rx, ry, 'da', '王 · 皇帝 · 国家');
    SAY.innerHTML = '<b>' + d[0] + ' · ' + d[1] + '</b>　' + (d[2] > .2 ? '王这边重' : d[2] < -.2 ? '神职这边重' : '差不多') + '<br>' + d[4];
  }
  btnRow($('#scaleBtns'), D.map(d => d[0]), 0, draw); draw(0);
});

/* ---------- 装置 7：一传十 ---------- */
dev('#growFig', fig => {
  const svg = $('#growSvg'), P = 6e7;
  function run(){
    const r = +$('#gwR').value / 100, per = $('#gwP').checked, emp = $('#gwK').checked;
    $('#gwRo').textContent = '+' + Math.round(r * 100) + '% / 十年';
    const yr1 = Math.pow(1 + r, .1) - 1;
    let N = 1000; const pts = [[40, N]]; let y10 = null, y50 = null, at300 = null;
    for (let y = 41; y <= 450; y++) {
      let g = yr1;
      if (per && y >= 250 && y <= 310) g /= 2;
      if (emp && y >= 312) g *= 2;
      N = N + N * g * (1 - N / P);
      if (!y10 && N >= P * .1) y10 = y;
      if (!y50 && N >= P * .5) y50 = y;
      if (y === 300) at300 = N;
      pts.push([y, N]);
    }
    const X = y => 50 + (y - 40) / 410 * 570, Y = n => 190 - n / P * 165;
    let g = '';
    [0, .1, .5, 1].forEach(t => { g += '<line x1="50" x2="620" y1="' + Y(P * t) + '" y2="' + Y(P * t) + '" stroke="var(--rule)" stroke-dasharray="' + (t ? '2 3' : '') + '"/><text x="44" y="' + (Y(P * t) + 4) + '" text-anchor="end" font-size="10" fill="var(--ink-3)">' + (t ? Math.round(t * 100) + '%' : '0') + '</text>'; });
    [100, 200, 300, 400].forEach(y => { g += '<text x="' + X(y) + '" y="206" text-anchor="middle" font-size="10" fill="var(--ink-3)">' + y + ' 年</text>'; });
    if (per) g += '<rect x="' + X(250) + '" y="25" width="' + (X(310) - X(250)) + '" height="165" fill="var(--red)" fill-opacity=".08"/><text x="' + X(280) + '" y="20" text-anchor="middle" font-size="10" fill="var(--red)">迫害</text>';
    if (emp) g += '<line x1="' + X(312) + '" x2="' + X(312) + '" y1="25" y2="190" stroke="var(--pur)" stroke-dasharray="3 3"/><text x="' + (X(312) + 4) + '" y="34" font-size="10" fill="var(--pur)">皇帝皈依</text>';
    g += '<path d="' + pts.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join(' ') + '" fill="none" stroke="var(--pur)" stroke-width="2.4"/>';
    if (y10) g += '<circle cx="' + X(y10) + '" cy="' + Y(P * .1) + '" r="4" fill="var(--och)"/>';
    if (y50) g += '<circle cx="' + X(y50) + '" cy="' + Y(P * .5) + '" r="4" fill="var(--och)"/>';
    svg.innerHTML = g;
    $('#growKV').innerHTML = '<div>公元 300 年的信徒<b>' + fmt(at300) + '</b></div><div>占到一成<b>' + (y10 ? y10 + ' 年' : '450 年内没有') + '</b></div><div>占到一半<b>' + (y50 ? y50 + ' 年' : '450 年内没有') + '</b></div><div>换算成每年<b>+' + (yr1 * 100).toFixed(1) + '%</b></div>';
    $('#growSay').innerHTML = '前两百年，曲线几乎贴着地面：一千人变成一万人、十万人，在六千万人的帝国里根本看不见，官府也懒得管。然后，它好像突然一下子“冒”了出来。<b>指数增长最骗人的地方，是它前面那段漫长的“不起眼”。</b>' + (emp ? '皇帝一皈依，曲线立刻变陡：当信仰和仕途绑在一起，入教的理由就不只是信仰了。' : '');
  }
  ['gwR', 'gwP', 'gwK'].forEach(id => $('#' + id).addEventListener('input', run));
  run();
});

/* ---------- 装置 8：军功爵 ---------- */
dev('#rankFig', fig => {
  // [爵名, 田（顷）, 宅（宅）]，据张家山汉简《二年律令·户律》；0 级为士伍
  const R = [['士伍', 1, 1], ['公士', 1.5, 1.5], ['上造', 2, 2], ['簪袅', 3, 3], ['不更', 4, 4], ['大夫', 5, 5], ['官大夫', 7, 7], ['公大夫', 9, 9], ['公乘', 20, 20], ['五大夫', 25, 25],
    ['左庶长', 74, 74], ['右庶长', 76, 76], ['左更', 78, 78], ['中更', 80, 80], ['右更', 82, 82], ['少上造', 84, 84], ['大上造', 86, 86], ['驷车庶长', 88, 88], ['大庶长', 90, 90], ['关内侯', 95, 95], ['彻侯', '食邑', 105]];
  let S;
  const need = k => k < 4 ? 1 : k < 8 ? 2 : k < 9 ? 3 : 99; // 升到下一级要几个首级；公乘以上靠立功斩首几乎上不去
  function reset(){ S = {rank: 0, heads: 0, bank: 0, battle: 0, dead: false, wound: 0}; draw('你十七岁，名下一顷田、一处宅。征兵的文书到了。'); }
  function draw(msg){
    $('#rkLadder').innerHTML = R.map((r, i) => '<span style="font-size:12px;text-align:center;padding:3px 0;border-radius:4px;line-height:1.35;' + (i === S.rank ? 'background:var(--pur);color:var(--paper)' : i < S.rank ? 'background:color-mix(in srgb,var(--pur) 22%,var(--paper))' : 'background:var(--paper);color:var(--ink-3)') + (i === 9 ? ';outline:1.5px dashed var(--och)' : '') + '">' + (i ? i + '·' : '') + r[0] + '</span>').join('');
    const r = R[S.rank];
    $('#rkKV').innerHTML = '<div>爵位<b>' + r[0] + '</b></div><div>田<b>' + (typeof r[1] === 'number' ? r[1] + ' 顷' : r[1]) + '</b></div><div>宅<b>' + r[2] + ' 宅</b></div><div>累计斩首<b>' + S.heads + '</b></div><div>打了几场<b>' + S.battle + ' / 10</b></div>';
    $('#rkSay').innerHTML = msg;
    $('#rkGo').disabled = $('#rkSafe').disabled = S.dead || S.battle >= 10;
  }
  function fight(bold){
    if (S.dead || S.battle >= 10) return;
    S.battle++;
    const pd = bold ? .14 : .05, pk = bold ? .6 : .22;
    if (Math.random() < pd + S.wound * .03) { S.dead = true; draw('<b>第 ' + S.battle + ' 场：你战死了。</b>按秦律，爵位可以由儿子继承（会降级）。你的名字被写进了县里的簿册，田宅归了家里。' + summary()); return; }
    let m = '第 ' + S.battle + ' 场：';
    let k = 0; if (Math.random() < pk) { k = 1 + (bold && Math.random() < .3 ? 1 : 0); }
    if (!k) { m += bold ? '你冲在前面，没砍到人，挨了一刀。' : '你跟着队伍，平安回来了，什么也没捞着。'; if (bold) S.wound++; }
    else {
      S.heads += k; S.bank += k; m += '斩首 ' + k + ' 级！';
      let up = 0; while (S.rank < 20 && S.bank >= need(S.rank)) { S.bank -= need(S.rank); S.rank++; up++; }
      m += up ? '升了 ' + up + ' 级，现在是“' + R[S.rank][0] + '”。' : '还差一点才能升级。';
      if (S.rank === 8) m += '<br>到“公乘”就差不多到头了：再往上的“五大夫”以上，多半要靠当军官、立大功，普通士兵很难爬上去。';
    }
    if (S.battle >= 10) m += '<br><b>十场仗打完，你活着回到了家乡。</b>' + summary();
    draw(m);
  }
  function summary(){
    const r = R[S.rank];
    return '<br>最后的爵位：<b>' + r[0] + '</b>（第 ' + S.rank + ' 级），田 ' + (typeof r[1] === 'number' ? r[1] + ' 顷' : r[1]) + '。' +
      (S.rank >= 4 ? '“不更”以上可以免除更役（轮流服的徭役），这是很多农民最想要的东西。' : '') +
      ' 注意第 9 级和第 10 级之间那道虚线：“五大夫”25 顷，“左庶长”一下子跳到 74 顷——那是军官和贵族的门槛。';
  }
  $('#rkGo').addEventListener('click', () => fight(true));
  $('#rkSafe').addEventListener('click', () => fight(false));
  $('#rkReset').addEventListener('click', reset);
  reset();
});

/* ---------- 第八章：漫画《两半老虎》 ---------- */
PR.halfTiger = (x, y, s, side) => '<g transform="translate(' + x + ',' + y + ') scale(' + (side ? -1 : 1) * (s || 1) + ',' + (s || 1) + ')">' + PR.tiger(0, 0, 1).replace(/^<g transform="translate\(0,0\) scale\(1\)">/, '<g>') + '<path d="M0,-18 L0,0"' + ST(2.4) + '/></g>';
PR.cup = (x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><path d="M-9,-14 L9,-14 L6,-2 Q0,2 -6,-2 Z"' + FP + '/><path d="M0,0 L0,8 M-6,8 L6,8"' + ST(2) + '/></g>';
PR.tent = (x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><path d="M-40,0 L0,-50 L40,0 Z"' + FP + '/><path d="M0,-50 L0,0 M-8,0 L0,-30 L8,0"' + ST(1.6) + '/><path d="M0,-50 L0,-66 L18,-60 L0,-54"' + FP + '/></g>';
PR.horse = (x, y, s, f) => '<g transform="translate(' + x + ',' + y + ') scale(' + ((f ? -1 : 1) * (s || 1)) + ',' + (s || 1) + ')"><path d="M-30,-30 Q-32,-44 -16,-44 L18,-44 Q24,-60 34,-66 L44,-60 Q40,-54 34,-50 L30,-30 Q20,-24 -20,-26 Z"' + FP + '/><path d="M-24,-26 L-28,0 M-12,-26 L-10,0 M14,-28 L10,0 M26,-30 L30,0"' + ST(2.6) + '/><path d="M-30,-38 Q-44,-34 -42,-18"' + ST(2.4) + '/><path d="M24,-56 Q30,-64 22,-62"' + ST(1.6) + '/></g>';
PANELS.c8a = () => PR.ground(W2, 230) + PR.throne(150, 230, 1.1) + who('da', {x: 92, y: 66, s: 1.12, e: 'smug', era: 2}) + PR.halfTiger(250, 168, .7, 0) +
  who('dao', {x: 360, y: 96, s: 1.08, e: 'n', era: 2, flip: true}) + PR.halfTiger(352, 196, .7, 1);
PANELS.c8b = () => PR.ground(W1, 226) + PR.tent(240, 226, 1) + PR.flag(200, 226, 120, '河') + who('dao', {x: 0, y: 72, s: 1.25, e: 'worry', era: 2}) + PR.halfTiger(140, 200, .8, 1);
PANELS.c8c = () => PR.speed(150, 120, 220, 26, 48, 9) + PR.halfTiger(150, 140, 1.4, 0) + PR.halfTiger(150, 140, 1.4, 1) + who('suan', {x: 4, y: 120, s: .9, e: 'n', era: 2}) + who('dao', {x: 214, y: 120, s: .9, e: 'shock', era: 2, flip: true});
PANELS.c8d = () => who('dao', {x: 150, y: 56, s: 1.3, e: 'sly', era: 2, flip: true}) + who('suan', {x: 24, y: 120, s: 1, e: 'sly', era: 2});
PANELS.c8e = () => PR.ground(W1, 226) + '<rect x="40" y="170" width="220" height="14" rx="3"' + FP + '/>' + PR.cup(110, 168, 1) + PR.cup(190, 168, 1) +
  who('da', {x: 0, y: 92, s: 1.05, e: 'sly', era: 3}) + who('dao', {x: 170, y: 92, s: 1.05, e: 'worry', era: 3, flip: true, sweat: true});
PANELS.c8f = () => PR.ground(W2, 230) + PR.house(110, 230, .8) + who('dao', {x: 170, y: 120, s: .9, e: 'happy', era: 3}) +
  '<path d="M300,10 L300,240"' + ST(2.5) + '/>' + PR.horse(420, 230, .9) + PR.horse(510, 226, .8, true) + PR.crowd(330, 186, 3, .8, 2) + PR.flag(560, 230, 130, '');

/* ---------- 装置 9：坐稳 ---------- */
dev('#coupFig', fig => {
  const n = () => +$('#cpN').value, on = id => $('#' + id).checked;
  function factors(){
    const N = n();
    let E = [1, .9, .78, .66][N - 1], C = [.1, .036, .02, .013][N - 1];
    if (on('cpF')) { E *= .93; C *= .55; }
    if (on('cpR')) { E *= .8; C *= .45; }
    if (on('cpH')) { E *= .98; C *= .6; }
    if (on('cpE')) { E *= .86; C *= .7; }
    return {E, C};
  }
  function show(){
    const f = factors();
    $('#cpNo').textContent = n() + ' 支';
    $('#cpKV').innerHTML = '<div>军队战斗力<b>' + Math.round(f.E * 100) + '</b></div><div>大将每年造反的机会<b>约 ' + (f.C * 100).toFixed(1) + '%</b></div>';
  }
  ['cpN', 'cpF', 'cpR', 'cpH', 'cpE'].forEach(id => $('#' + id).addEventListener('input', show));
  show();
  $('#cpGo').addEventListener('click', () => {
    const f = factors(); let E = f.E, city = 12, wins = 0, log = [], end = null, eun = false;
    for (let y = 1; y <= 20; y++) {
      const big = Math.random() < .2, T = big ? 105 + Math.random() * 45 : 40 + Math.random() * 50;
      const D = 100 * E * (0.85 + Math.random() * .3);
      if (D < T) { const lost = Math.ceil((T - D) / 22); city -= lost; wins = 0; log.push('第 ' + y + ' 年：' + (big ? '北边大举入侵，' : '北边来犯，') + '你的军队' + (n() > 1 ? '几支人马互相等着别人先上，' : '') + '丢了 ' + lost + ' 座城。'); }
      else { wins++; if (D > T + 35 && Math.random() < .3) { city++; log.push('第 ' + y + ' 年：大胜，还夺回一座城。'); } }
      const C = f.C * (1 + (n() === 1 ? wins * .25 : wins * .08));
      if (Math.random() < C) { end = '第 ' + y + ' 年：' + (n() === 1 ? '连战连胜的大将' : '一位手握重兵的将军') + '带兵回到京城，“为了国家”请你退位。<b>你被推翻了。</b>'; break; }
      if (on('cpE') && !eun && Math.random() < .06) { eun = true; E *= .9; log.push('第 ' + y + ' 年：监军的宦官和将军不和，屡屡掣肘，还在宫里结成了一派。'); }
      if (eun && Math.random() < .02) { end = '第 ' + y + ' 年：宫里的宦官和禁军勾结，换了一位更听话的君主。<b>你被自己派去监视别人的人推翻了。</b>'; break; }
      if (city <= 0) { end = '第 ' + y + ' 年：最后一座城也丢了。<b>你的国家亡了。</b>'; break; }
    }
    const tail = log.slice(-4).join('<br>');
    let verdict;
    if (end) verdict = end;
    else if (city >= 10) verdict = '<b>二十年过去，你坐稳了，地盘也基本守住了（' + city + ' 座城）。</b>运气不错。';
    else verdict = '<b>二十年过去，你坐稳了，但只剩下 ' + city + ' 座城。</b>';
    const N = n(), cnt = ['cpF', 'cpR', 'cpH', 'cpE'].filter(on).length;
    let note = '';
    if (N === 1 && !cnt) note = '一位大将统领全军，什么防范也没有：仗打得最好，可大将的威望也最高。这是唐玄宗交给安禄山的局面。';
    else if (N >= 3 && on('cpR')) note = '拆成几支、兵将轮换：将军很难造反，可军队也很难打仗。这就是宋朝的局面：坐得稳，常打败仗。';
    else if (on('cpE')) note = '派宦官监军：防住了将军，却在宫里养出了另一股势力。唐朝后期的神策军、明朝的监军太监，都走到了这一步。';
    else if (on('cpH')) note = '人质很便宜，几乎不伤战斗力，所以历史上用得极多。只是它管得住有家有业的将军，管不住豁得出去的人。';
    else note = '没有完美的配置，只有不同的运气和不同的代价。';
    $('#cpSay').className = 'say ' + (end ? 'bad' : 'ok');
    $('#cpSay').innerHTML = (tail ? tail + '<br>' : '') + verdict + '<br>' + note;
  });
});

/* ---------- 装置 10：同罪不同罚 ---------- */
dev('#lawFig', fig => {
  const CASES = ['打瞎一只眼', '打断骨头', '打掉牙', '杀了人', '偷东西', '儿子打父亲'];
  const CODES = ['乌尔纳姆 · 约前 2100', '汉谟拉比 · 约前 1754', '十二铜表 · 前 450', '萨利克法 · 约 500', '唐律 · 653'];
  const D = [
    [ // 眼
      [['任何人', '赔半米那银子（据部分译本）。1 米那约等于 60 舍客勒。']],
      [['贵人打瞎贵人', '打瞎他的眼（第 196 条）。'], ['贵人打瞎平民', '赔 1 米那银子（第 198 条）。'], ['贵人打瞎别人家的奴隶', '赔这个奴隶身价的一半（第 199 条）。']],
      [['毁伤别人肢体', '如果双方不能和解，受害者可以“同态复仇”。']],
      [['任何自由人', '赔 100 索里迪金币（大意）。']],
      [['良人之间', '“瞎其一目”，徒刑三年。'], ['良人打瞎别人家的奴婢', '比照良人之间减等处罚。'], ['奴婢打瞎良人', '比照良人之间加等处罚。']]
    ],
    [ // 骨
      [['用棍子打断别人的骨头', '赔 1 米那银子。']],
      [['贵人打断贵人的骨头', '打断他的骨头（第 197 条）。'], ['贵人打断平民的骨头', '赔 1 米那银子（第 198 条）。'], ['打断别人家奴隶的骨头', '赔身价的一半（第 199 条）。']],
      [['打断自由人的骨头', '罚 300 阿斯。'], ['打断奴隶的骨头', '罚 150 阿斯，正好一半。']],
      [['任何自由人', '按伤势分档赔金币，各个抄本的数额不太一样。']],
      [['良人之间', '打破骨头，徒一年；打折手脚以致残废，徒三年。']]
    ],
    [ // 牙
      [['任何人', '赔 2 舍客勒银子。']],
      [['同一阶层之间', '打掉他的牙（第 200 条）。'], ['贵人打掉平民的牙', '赔三分之一米那银子（第 201 条）。']],
      [['一般的伤害', '比如打一拳、打掉牙这类，罚 25 阿斯（古罗马的铜币单位）。']],
      [['任何自由人', '赔一笔金币，数额各抄本不一。']],
      [['良人之间', '打掉一颗牙，徒一年；两颗以上，徒一年半。']]
    ],
    [ // 杀人
      [['任何人', '杀人者处死（第 1 条）。']],
      [['没有一般的杀人条款', '但诬告别人杀人、又拿不出证据的，处死（第 1 条）。'], ['房子塌了压死房主', '处死造房子的人（第 229 条）。'], ['压死的是房主的儿子', '处死造房子的人的儿子（第 230 条）。“以子还子”。']],
      [['故意杀人', '处死（现存条文残缺，靠后人引述复原）。'], ['夜里来偷东西的贼', '当场杀死，杀人者无罪。']],
      [['杀一个自由的法兰克人', '赔 200 索里迪。'], ['杀一个罗马人（自由的有产者）', '赔 100 索里迪。'], ['杀国王的亲随', '赔 600 索里迪。']],
      [['斗殴中杀人', '绞刑。'], ['故意杀人', '斩首。'], ['主人杀了犯错的奴婢，没报官', '杖一百。'], ['主人杀了没犯错的奴婢', '徒一年。']]
    ],
    [ // 偷
      [['抢劫', '处死（第 2 条）。']],
      [['偷神庙或王宫的财物', '处死（第 6 条）。'], ['偷牛羊驴猪或船，属于神庙或王宫的', '赔 30 倍（第 8 条）。'], ['同样的东西，属于平民的', '赔 10 倍；赔不起，处死。']],
      [['当场抓住的小偷（白天）', '鞭打，然后交给失主处置。'], ['不是当场抓住的', '赔两倍。']],
      [['偷猪、偷牛、偷马', '按牲口的种类、数量和价值分档赔钱，另外还要归还原物或赔价。']],
      [['窃盗', '按赃物计价：没偷到手，笞五十；偷到值一尺绢的，杖六十；每多一匹加一等；值五匹，徒一年；值五十匹，加役流。']]
    ],
    [ // 打父亲
      [['', '现存的条文里没有找到。']],
      [['儿子打了父亲', '砍掉他的手（第 195 条）。']],
      [['', '十二铜表里没有专门条款。但“家父”在法律上可以惩罚甚至处死儿子；后来的罗马法对弑父者处以“皮袋刑”：和几种动物一起缝进皮袋，扔进水里。']],
      [['', '没有专门条款。']],
      [['子孙打了祖父母、父母', '斩首。这是“十恶”中的“恶逆”，遇大赦也不赦。'], ['子孙不听教令，父母把他打死', '徒一年半。'], ['另外', '唐律有“八议”：皇亲、功臣、高官等八类人犯罪，要奏请皇帝特别议处，常可减免。']]
    ]
  ];
  let c = 0, k = 1;
  const out = $('#lawOut');
  const show = () => { out.innerHTML = D[c][k].map(r => '<div class="cd">' + (r[0] ? '<small>' + r[0] + '</small>' : '') + '<div>' + r[1] + '</div></div>').join(''); };
  btnRow($('#lawCase'), CASES, 0, i => { c = i; show(); });
  btnRow($('#lawCode'), CODES, 1, i => { k = i; show(); });
  show();
});

/* ---------- 装置 11：税官的眼睛 ---------- */
dev('#cropFig', fig => {
  const K = ['长在地上，看得见', '同一时间成熟', '能存好几年', '好量、好分', '人和东西跑不了'];
  const D = [
    ['小麦 · 大麦 · 粟', [5, 5, 5, 5, 4], '税官的最爱。一眼估产，按季来收，收上来能进仓、能运走、能按升斗发放。最早的国家几乎全是谷子国家。'],
    ['水稻', [5, 5, 4, 5, 5], '同样透明，而且水田要修渠、要固定，农民几乎搬不走。东亚和东南亚的大王朝都建在稻田上。'],
    ['芋头 · 木薯', [1, 1, 2, 2, 3], '长在地底下，什么时候挖、挖多少，税官说不清；木薯可以在地里放一两年，饿了才挖。斯科特说，这是“逃避国家的庄稼”。'],
    ['马铃薯', [1, 3, 3, 3, 3], '一样埋在土里。它在近代欧洲普及时，有些地方的官员和地主很头疼：农民在小块地上种土豆，就能养活一家，不太需要领主的麦田了。'],
    ['牛羊（游牧）', [4, 2, 3, 3, 1], '看得见，也数得清，可它们会走。牧人一个月能跑几百里，国家的税官追不上。所以草原上的“税”常常是反过来的：农耕国家给草原送钱送布。'],
    ['渔猎采集', [2, 1, 1, 1, 1], '收获全看运气，东西存不住，人随时可以走。国家几乎无从下手，采集者因此常常被说成“没开化”。'],
    ['商铺 · 银钱', [3, 4, 5, 5, 2], '账本可以做假，银子可以藏，商人可以走。古代国家常常干脆抽关税、卖专营权，或者干脆把商人压在最低一等，让他们不敢跑。']
  ];
  const show = i => {
    const d = D[i];
    $('#cropBars').innerHTML = K.map((k, j) => '<div class="row"><span class="nm">' + k + '</span><div class="tr"><i style="width:' + d[1][j] * 20 + '%"></i></div><span class="v">' + '●'.repeat(d[1][j]) + '</span></div>').join('');
    const t = d[1].reduce((a, b) => a + b, 0);
    $('#cropSay').innerHTML = '<b>透明度 ' + t + ' / 25</b>　' + d[2];
  };
  btnRow($('#cropBtns'), D.map(d => d[0]), 0, show); show(0);
});

/* ---------- 装置 12：消息跑多快 ---------- */
dev('#postFig', fig => {
  const D = [
    ['波斯御道', '萨迪斯 → 苏萨，约 2,500 公里', [['普通人步行', 90], ['王家信使接力', 9]], '希罗多德说普通人要走九十天。信使日夜接力，大约一个多星期。大流士的命令传到帝国另一头，比任何叛乱的消息都快——这正是修御道的目的。'],
    ['罗马大道', '罗马 → 伦迪尼乌姆（伦敦），约 1,900 公里', [['普通旅行', 55], ['公共驿传', 26], ['十万火急的信使', 12]], '公元 68 年，尼禄自杀的消息从罗马传到西班牙的加尔巴那里，据记载用了大约一个星期。帝国的边缘永远比中心晚知道“皇帝换了”。'],
    ['唐代驿道', '长安 → 敦煌，约 1,800 公里', [['步行（日行五十里）', 67], ['驿马（常规）', 19], ['急递（日行五百里）', 7]], '唐代规定了不同的日行里程。边关的军情可以“日行五百里”，可一来一回仍要两周以上。所以边将常常不得不先斩后奏。'],
    ['印加山路', '库斯科 → 基多，约 2,000 公里', [['普通人步行', 80], ['查斯基接力', 8]], '没有马，没有轮子，靠的是每隔几公里一站的年轻跑者，一边跑一边把口信背熟。在山路上，人跑得比骡子还快。'],
    ['元代急递铺', '大都 → 杭州，约 1,500 公里', [['商旅', 38], ['驿马', 12], ['急递铺接力', 7]], '元代除了骑马的站赤，还有步行接力的“急递铺”，每十里或十五里一铺，铺兵带着铃铛和文书跑。'],
    ['跨越大西洋', '伦敦 → 纽约，约 5,600 公里', [['帆船（18 世纪）', 40], ['蒸汽船（1850 年代）', 11], ['海底电报（1866 年后）', 0.01]], '1858 年第一条电缆接通，只用了不到一个月就坏了；1866 年才稳定下来。从此，一条消息从几个星期缩短到几分钟。']
  ];
  const show = i => {
    const d = D[i], mx = Math.max(...d[2].map(m => m[1]));
    $('#postBars').innerHTML = '<div class="lab">' + d[1] + '</div>' + d[2].map(m => '<div class="row"><span class="nm">' + m[0] + '</span><div class="tr"><i style="width:' + Math.max(1, m[1] / mx * 100) + '%"></i></div><span class="v">' + (m[1] < 1 ? '几分钟' : '约 ' + m[1] + ' 天') + '</span></div>').join('');
    $('#postSay').innerHTML = d[3];
  };
  btnRow($('#postBtns'), D.map(d => d[0]), 0, show); show(0);
});

/* ---------- 装置 13：金榜 ---------- */
dev('#examFig', fig => {
  const P = [0.015, 0.015, 0.05], NAME = ['童生', '生员（秀才）', '举人', '进士'];
  let S;
  function reset(){ S = {age: 15, lv: 0, tries: [0, 0, 0], done: false, log: []}; draw('你十五岁，背完了四书五经。去考吧。'); }
  function draw(msg){
    $('#exKV').innerHTML = '<div>年纪<b>' + S.age + ' 岁</b></div><div>身份<b style="font-size:15px">' + NAME[S.lv] + '</b></div><div>考过几次<b>' + (S.tries[0] + S.tries[1] + S.tries[2]) + '</b></div>';
    $('#exSay').innerHTML = msg;
    $('#exGo').disabled = S.done;
  }
  $('#exGo').addEventListener('click', () => {
    if (S.done) return;
    const lv = S.lv; S.tries[lv]++;
    let m;
    if (Math.random() < P[lv]) {
      S.lv++;
      m = ['<b>中了！你成了生员（秀才）。</b>见了县官可以不跪，免了自家的徭役，可以开馆教书了。可这只是第一步。', '<b>中了！你成了举人。</b>报喜的锣敲进了村。从此有资格做官，乡里的人纷纷把田地“投献”到你名下避税。', '<b>中了！你成了进士。</b>金榜题名，天子门生。全国三年才取两三百人，你是其中之一。'][lv];
      if (S.lv === 3) { S.done = true; m += '<br>你今年 ' + S.age + ' 岁。'; }
    } else {
      m = ['童试没过。', '乡试落榜。', '会试落榜。'][lv] + '　' + (Math.random() < .5 ? '回家接着读。' : '三年以后再来。');
    }
    S.age += 3;
    if (!S.done && S.age > 60) { S.done = true; m += '<br><b>你六十岁了。</b>最后的身份是“' + NAME[S.lv] + '”。' + (S.lv === 0 ? '和绝大多数读书人一样，你一辈子是个“老童生”。也许你会去开个私塾，教别人的孩子考试。' : S.lv === 1 ? '秀才是读书人里的“中产”：不富，但体面。大多数有功名的人，一辈子就停在这里。' : '举人已经是地方上的头面人物了，可以候补做个小官。'); }
    draw(m);
  });
  $('#exAll').addEventListener('click', () => {
    const N = 100000, reach = [N, 0, 0, 0], age = [0, 0, 0, 0];
    for (let i = 0; i < N; i++) {
      let lv = 0, a = 15;
      while (a <= 60 && lv < 3) { if (Math.random() < P[lv]) { lv++; reach[lv]++; age[lv] += a; } a += 3; }
    }
    $('#exFunnel').innerHTML = '<div class="bars">' + NAME.map((n, k) => '<div class="row"><span class="nm">' + n + (k ? '<small>平均 ' + Math.round(age[k] / Math.max(1, reach[k])) + ' 岁考中</small>' : '<small>起步</small>') + '</span><div class="tr"><i style="width:' + Math.max(.4, Math.sqrt(reach[k] / N) * 100) + '%"></i></div><span class="v">' + reach[k].toLocaleString() + '</span></div>').join('') + '</div><p class="figcap">条形长度按平方根缩放，否则后两行细得看不见。</p>';
    $('#exSay').innerHTML = '十万个十五岁的读书人，一路考到六十岁：大约 <b>' + Math.round(reach[1] / N * 100) + '%</b> 能成为秀才，<b>' + (reach[2] / N * 100).toFixed(1) + '%</b> 能成为举人，进士只有大约 <b>' + reach[3] + '</b> 人，也就是' + (reach[3] ? '每 ' + Math.round(N / reach[3]).toLocaleString() + ' 人里一个' : '几乎没有') + '。剩下的绝大多数人，把一生最好的时间交给了这张卷子。';
  });
  $('#exReset').addEventListener('click', reset);
  reset();
});

/* ---------- 装置 14：竞技场的座次 ---------- */
dev('#seatFig', fig => {
  const BANDS = ['场地', '前排看台（大理石）', '第一层', '第二层下部', '第二层上部', '顶层木看台', '最顶上的站席'];
  const W = [
    ['皇帝', 1, '前排中央的包厢，正对场地，所有人都看得见他，他也看得见所有人。'],
    ['元老', 1, '前排看台，离场子最近，带着刻名字的专座。奥古斯都还规定，任何地方举办公共赛会，前排都要留给元老。'],
    ['维斯塔贞女', 1, '女人里唯一坐在前排的：守护圣火的贞女们有专门的座位，正对着皇帝的包厢。'],
    ['骑士', 2, '紧挨着元老的那几层。早在前 67 年，一部法律就把剧场前十四排留给了骑士阶层。'],
    ['已婚平民男子', 3, '第二层的下部。奥古斯都为了鼓励结婚生子，给已婚的平民男子单独划了区域。'],
    ['士兵', 3, '和平民分开坐。奥古斯都规定士兵不得和平民混坐。'],
    ['少年', 3, '还穿着镶边童袍的少年有专区，他们的家庭教师（多是奴隶）坐在旁边的区域，就近看管。'],
    ['穷人', 4, '据苏埃托尼乌斯说，穿深色破旧衣服的人不许坐在中间的区域，只能坐到后面去。'],
    ['女人', 5, '最上面的木头看台，离场子最远。奥古斯都规定女人只能在高处观看角斗。'],
    ['奴隶', 6, '最顶上，站着看——如果主人带他们来、而且还有地方的话。'],
    ['角斗士', 0, '在场地里，替所有人表演生死。大多数角斗士是奴隶、战俘或罪犯，也有自愿签约、为钱和名声上场的自由人。']
  ];
  const svg = $('#seatSvg'), cx = 260, cy = 262;
  function draw(i){
    const b = W[i][1]; let g = '';
    for (let k = 6; k >= 0; k--) {
      const rx = 60 + k * 30, ry = 34 + k * 30;
      g += '<path d="M' + (cx - rx) + ',' + cy + ' A' + rx + ',' + ry + ' 0 0 1 ' + (cx + rx) + ',' + cy + ' Z" fill="' + (k === b ? 'var(--pur)' : k === 0 ? 'color-mix(in srgb,var(--och) 30%,var(--paper))' : 'var(--paper)') + '" fill-opacity="' + (k === b ? .75 : 1) + '" stroke="var(--rule)" stroke-width="1.2"/>';
    }
    for (let k = 0; k <= 6; k++) { const ry = 34 + k * 30; g += '<text x="' + cx + '" y="' + (cy - ry + 19) + '" text-anchor="middle" font-size="11" fill="' + (k === b ? 'var(--paper)' : 'var(--ink-3)') + '">' + BANDS[k] + '</text>'; }
    svg.innerHTML = g;
    $('#seatSay').innerHTML = '<b>' + W[i][0] + ' · ' + BANDS[b] + '</b><br>' + W[i][2];
  }
  btnRow($('#seatBtns'), W.map(w => w[0]), 4, draw); draw(4);
});

/* ---------- 推恩：切地的函数（漫画和装置共用） ---------- */
function splitTree(gens, seed){
  const R = rng(seed);
  let cells = [{x: 0, y: 0, w: 1, h: 1, d: 0}];
  for (let g = 0; g < gens; g++) {
    const next = [];
    cells.forEach(c => {
      const n = 2 + Math.floor(R() * 4), horiz = c.w >= c.h;
      const ws = Array.from({length: n}, () => .6 + R() * .8), sum = ws.reduce((a, b) => a + b, 0);
      let o = 0;
      ws.forEach(w => { const f = w / sum; next.push(horiz ? {x: c.x + o * c.w, y: c.y, w: c.w * f, h: c.h, d: g + 1} : {x: c.x, y: c.y + o * c.h, w: c.w, h: c.h * f, d: g + 1}); o += f; });
    });
    cells = next;
  }
  return cells;
}
const cellsSvg = (cells, X, Y, W, H, fill) => cells.map(c => '<rect x="' + (X + c.x * W).toFixed(1) + '" y="' + (Y + c.y * H).toFixed(1) + '" width="' + (c.w * W).toFixed(1) + '" height="' + (c.h * H).toFixed(1) + '" fill="' + (fill || P) + '" stroke="' + I + '" stroke-width="' + (cells.length > 40 ? .8 : 1.8) + '"/>').join('');

/* ---------- 第十四章：漫画《推恩》 ---------- */
PANELS.c14a = () => PR.ground(W2, 230) + PR.throne(110, 230, 1) + who('da', {x: 52, y: 70, s: 1.08, e: 'worry', era: 2}) +
  '<g transform="translate(250,70)">' + '<rect x="0" y="0" width="200" height="140"' + FP + '/><path d="M0,0 L120,0 L120,140 L0,140 Z" fill="' + I + '" fill-opacity=".12"/><text x="60" y="76" text-anchor="middle" font-size="14" fill="' + I + '">朝廷</text><text x="160" y="76" text-anchor="middle" font-size="14" fill="' + I + '">东王</text><path d="M120,0 L120,140"' + ST(2.4) + '/></g>';
PANELS.c14b = () => who('suan', {x: 0, y: 70, s: 1.32, e: 'sly', era: 2}) + PR.scroll(220, 190, 1.1);
PANELS.c14c = () => PR.ground(W1, 228) + who('bei', {x: 120, y: 54, s: 1.1, e: 'happy', era: 2}) + [0, 1, 2, 3, 4].map(i => who('kid', {x: 6 + i * 56, y: 150, s: .62, e: 'happy'})).join('');
PANELS.c14d = () => cellsSvg(splitTree(1, 21), 40, 30, 220, 180);
PANELS.c14e = () => cellsSvg(splitTree(2, 21), 40, 30, 220, 180) + who('kid', {x: 70, y: 120, s: .55, e: 'angry'}) + who('kid', {x: 120, y: 120, s: .55, e: 'angry', flip: true});
PANELS.c14f = () => PR.ground(W2, 230) + PR.throne(90, 230, .9) + who('da', {x: 38, y: 82, s: 1, e: 'smug', era: 2}) + who('suan', {x: 170, y: 104, s: .9, e: 'happy', era: 2}) +
  '<g transform="translate(330,40)"><rect x="0" y="0" width="230" height="170"' + FP + '/>' + cellsSvg(splitTree(3, 21), 0, 0, 230, 170) + '</g>';

/* ---------- 装置 15：推恩 ---------- */
dev('#splitFig', fig => {
  let seed = 7;
  function draw(){
    const g = +$('#spG').value;
    $('#spGo').textContent = g === 0 ? '刚受封' : '第 ' + g + ' 代以后';
    const cells = splitTree(g, seed);
    $('#spA').innerHTML = '<g color="var(--ink)">' + cellsSvg(cells, 4, 4, 232, 172, 'var(--paper)') + '</g>';
    $('#spB').innerHTML = '<rect x="4" y="4" width="232" height="172" fill="var(--pur)" fill-opacity=".18" stroke="var(--ink)" stroke-width="1.8"/><text x="120" y="96" text-anchor="middle" font-size="13" fill="var(--ink-2)">' + (g ? '第 ' + g + ' 代长子，独占全部' : '一位诸侯王') + '</text>';
    const big = Math.max(...cells.map(c => c.w * c.h));
    $('#spKV').innerHTML = '<div>推恩之后的侯国<b>' + cells.length + ' 个</b></div><div>其中最大的一块<b>' + (big * 100).toFixed(big < .1 ? 1 : 0) + '%</b></div><div>嫡长子继承<b>1 个 · 100%</b></div>';
    $('#spSay').innerHTML = g === 0 ? '拖动滑块，传几代看看。' : g < 3 ? '才两三代，一个王国已经变成了一片小侯国，每个侯都忙着守自己那一小块，谁也没本钱和朝廷较劲。' : '再往下，有的侯国小得只剩几个村子。汉武帝后来还常找理由（比如祭祀献金成色不足）削夺列侯的爵位，一次就废了一百多个。<b>欧洲的长子继承制正好相反：一整块封地传一个人，大领主可以世世代代坐大。</b>';
  }
  $('#spG').addEventListener('input', draw);
  $('#spNew').addEventListener('click', () => { seed = Math.floor(Math.random() * 1e6); draw(); });
  draw();
});

/* ---------- 装置 16：派谁去 ---------- */
dev('#govFig', fig => {
  let local = 1, term = 1, watch = 1;
  btnRow($('#gvLocal'), ['本地人', '外地人（回避本籍）'], 1, i => local = i);
  btnRow($('#gvTerm'), ['一年', '三年', '九年', '终身世袭'], 1, i => term = i);
  btnRow($('#gvWatch'), ['不派人盯', '巡按御史', '御史 + 密折'], 1, i => watch = i);
  const on = id => $('#' + id).checked;
  $('#gvGo').addEventListener('click', () => {
    const troop = on('gvTroop'), tax = on('gvTax'), host = on('gvHost');
    let r = 0.0025 * (troop ? 5 : 1) * (tax ? 2.5 : 1) * [0.3, 0.6, 1.2, 3][term] * (local === 0 ? 2 : 1) * (host ? 0.5 : 1) * [1, 0.7, 0.5][watch];
    const C = clamp(50 + (local === 0 ? 15 : 0) + [15, 5, 0, -5][term] - [0, 10, 18][watch] + (tax ? 10 : 0), 5, 95);
    const E = clamp(45 + (troop ? 15 : 0) + (tax ? 10 : 0) + (local === 0 ? 15 : 0) + [-15, 0, 10, 10][term] - [0, 0, 5][watch], 5, 95);
    let g = '', events = 0;
    for (let p = 0; p < 10; p++) {
      const y = 12 + p * 15;
      g += '<text x="4" y="' + (y + 4) + '" font-size="9.5" fill="var(--ink-3)">' + (p + 1) + '省</text><line x1="34" x2="634" y1="' + y + '" y2="' + y + '" stroke="var(--rule)"/>';
      let down = 0;
      for (let t = 0; t < 100; t++) {
        if (down > 0) { down--; continue; }
        if (Math.random() < r) { events++; down = 8; g += '<circle cx="' + (34 + t * 6) + '" cy="' + y + '" r="4.5" fill="var(--red)"/>'; }
      }
    }
    g += '<text x="34" y="166" font-size="9.5" fill="var(--ink-3)">第 1 年</text><text x="634" y="166" font-size="9.5" text-anchor="end" fill="var(--ink-3)">第 100 年</text>';
    $('#gvSvg').innerHTML = g;
    $('#gvKV').innerHTML = '<div>自立或叛乱<b>' + events + ' 次</b></div><div>贪腐程度<b>' + C + ' / 100</b></div><div>办事能力<b>' + E + ' / 100</b></div>';
    let t;
    if (term === 3 && troop) t = '世袭、有兵：这就是唐后期的藩镇，或者欧洲的大领主。事情办得不错，可他们迟早只听自己的。';
    else if (troop && tax) t = '兵、钱都在总督手里：能办事，也能造反。东汉末的州牧、唐中期的节度使，都是被这样“养大”的。';
    else if (local === 1 && term <= 1 && watch >= 1 && !troop && !tax) t = '外地人、任期短、有人盯、不给兵和钱：这差不多是明清的配方。几百年里几乎没有总督能割据一方，代价是地方官既不熟悉情况，也没什么实权，真正办事的是当地的书吏和士绅。';
    else if (term === 0) t = '一年一换：谁也来不及扎根，可也谁都想在一年里“捞一把就走”。罗马共和国的行省总督就是这样把行省刮干净的。';
    else if (watch === 0) t = '没人盯：贪腐和叛乱都会多起来。每一个大帝国最后都会发明自己的“国王之眼”。';
    else t = '每一种规矩都在“防坐大”和“能办事”之间换来换去。多试几种组合。';
    $('#gvSay').innerHTML = t;
  });
});

/* ---------- 装置 17：离王座多近 ---------- */
dev('#nearFig', fig => {
  const RING = [
    ['卧榻', '后妃 · 外戚', [['吕后', '汉初', '刘邦死后临朝称制十五年，大封吕氏为王。她死后，吕氏被功臣集团诛灭。'], ['王莽', '公元 9 年', '外戚，从大司马到“假皇帝”，最后接受“禅让”建立新朝。'], ['武则天', '690 年', '从皇后到太后，最后自己称帝，改国号为周。中国唯一的女皇帝。'], ['藤原氏', '9—11 世纪', '把女儿嫁给天皇，以外祖父身份当摄政、关白，掌控朝政两百年。'], ['慈禧', '1861—1908', '辛酉政变后与慈安两宫垂帘听政，后来实际掌握清朝最高权力近半个世纪。']]],
    ['内廷', '宦官 · 近侍 · 秘书', [['十常侍', '东汉末', '宦官集团把持朝政，与外戚何进互相残杀，引来董卓入京。'], ['唐后期宦官', '9 世纪', '统领禁军神策军，拥立皇帝，甘露之变后更是挟制天子。'], ['魏忠贤', '1620 年代', '司礼监秉笔太监，代皇帝批红，号称“九千岁”，各地为他立生祠。'], ['赵高', '前 210—前 207', '秦始皇的近臣，篡改遗诏立胡亥，指鹿为马，后来逼死胡亥。（他是否宦官，学界有争论）']]],
    ['禁卫', '贴身卫队', [['罗马近卫军', '41—312', '刺杀卡利古拉、拥立克劳狄乌斯，193 年公开拍卖皇位。'], ['萨迈拉的突厥卫队', '861', '刺杀哈里发穆塔瓦基勒，此后近十年里随意废立哈里发。'], ['马穆鲁克', '1250', '奴隶兵出身的将领杀死苏丹，自建王朝，统治埃及两百六十多年。'], ['赵匡胤', '960', '后周禁军统帅，在陈桥驿被部下黄袍加身。']]],
    ['朝堂', '宰相 · 权臣 · 宫相', [['丕平', '751', '法兰克宫相，问教皇“有权的和有名的谁该当王”，然后废掉了墨洛温国王。'], ['曹操', '196—220', '迎汉献帝到许县，挟天子以令诸侯；儿子曹丕代汉。'], ['司马懿', '249', '高平陵之变诛曹爽，司马氏掌权；孙子司马炎代魏建晋。'], ['北条氏', '13 世纪', '将军的外戚，世袭“执权”，将军成了傀儡，天皇更是傀儡的傀儡。']]],
    ['地方', '总督 · 节度使 · 将军', [['安禄山', '755', '一人兼三镇节度使，起兵叛唐，自称大燕皇帝。'], ['朱温', '907', '宣武节度使，挟持唐昭宗迁都洛阳，后来废唐建梁。'], ['源赖朝', '1192', '关东武士首领，建立镰仓幕府，从此日本的实权在将军手里六百多年。'], ['州牧们', '190 年代', '东汉末刺史改州牧，袁绍、刘表、刘焉等割据一方。']]]
  ];
  const svg = $('#nearSvg'), cx = 260, cy = 150;
  let cur = 1;
  function draw(){
    let g = '';
    for (let k = 4; k >= 0; k--) {
      const r = 30 + (k + 1) * 24;
      g += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (k === cur ? 'var(--pur)' : 'var(--paper)') + '" fill-opacity="' + (k === cur ? .7 : 1) + '" stroke="var(--rule)" stroke-width="1.2" data-k="' + k + '" style="cursor:pointer"/>';
    }
    g += '<circle cx="' + cx + '" cy="' + cy + '" r="30" fill="var(--och)"/><text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="13" fill="var(--paper)">王座</text>';
    for (let k = 0; k < 5; k++) {
      const r = 30 + k * 24 + 15;
      g += '<text x="' + cx + '" y="' + (cy - r + 4) + '" text-anchor="middle" font-size="11" fill="' + (k === cur ? 'var(--paper)' : 'var(--ink-2)') + '" style="pointer-events:none">' + RING[k][0] + '</text>';
      g += '<text x="' + (cx + r + 4) + '" y="' + (cy + 4) + '" font-size="0" fill="none"></text>';
    }
    svg.innerHTML = g;
    $('#nearCards').innerHTML = '<div class="cd" style="grid-column:1/-1;background:transparent;padding:0"><b>' + RING[cur][0] + ' · ' + RING[cur][1] + '</b></div>' + RING[cur][2].map(c => '<div class="cd"><b>' + c[0] + '</b><small>' + c[1] + '</small><div>' + c[2] + '</div></div>').join('');
  }
  svg.addEventListener('click', e => {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse()), d = Math.hypot(p.x - cx, p.y - cy);
    if (d < 30 || d > 150) return;
    cur = clamp(Math.floor((d - 30) / 24), 0, 4); draw();
  });
  draw();
});

/* ---------- 装置 18：朝代的寿命 ---------- */
dev('#dynFig', fig => {
  const REG = {'东亚': 'var(--red)', '西亚北非': 'var(--och)', '欧洲': 'var(--blu)', '南亚': 'var(--grn)', '美洲非洲': 'var(--pur)'};
  const D = [
    ['阿卡德', -2334, -2154, '西亚北非'], ['乌尔第三王朝', -2112, -2004, '西亚北非'], ['新亚述', -911, -609, '西亚北非'], ['阿契美尼德', -550, -330, '西亚北非'], ['塞琉古', -312, -63, '西亚北非'],
    ['帕提亚', -247, 224, '西亚北非'], ['萨珊', 224, 651, '西亚北非'], ['倭马亚', 661, 750, '西亚北非'], ['阿拔斯', 750, 1258, '西亚北非'], ['法蒂玛', 909, 1171, '西亚北非'], ['马穆鲁克', 1250, 1517, '西亚北非'], ['奥斯曼', 1299, 1922, '西亚北非'], ['萨法维', 1501, 1736, '西亚北非'],
    ['秦', -221, -207, '东亚'], ['西汉', -202, 8, '东亚'], ['东汉', 25, 220, '东亚'], ['西晋', 266, 316, '东亚'], ['北魏', 386, 534, '东亚'], ['隋', 581, 618, '东亚'], ['唐', 618, 907, '东亚'], ['北宋', 960, 1127, '东亚'], ['南宋', 1127, 1279, '东亚'], ['辽', 916, 1125, '东亚'], ['元', 1271, 1368, '东亚'], ['明', 1368, 1644, '东亚'], ['清', 1644, 1912, '东亚'], ['镰仓幕府', 1185, 1333, '东亚'], ['江户幕府', 1603, 1868, '东亚'],
    ['西罗马帝国', -27, 476, '欧洲'], ['加洛林', 751, 987, '欧洲'], ['东罗马马其顿王朝', 867, 1056, '欧洲'], ['西班牙哈布斯堡', 1516, 1700, '欧洲'], ['罗曼诺夫', 1613, 1917, '欧洲'],
    ['孔雀', -322, -185, '南亚'], ['笈多', 320, 550, '南亚'], ['德里苏丹国（诸朝）', 1206, 1526, '南亚'], ['莫卧儿', 1526, 1857, '南亚'],
    ['阿兹特克三方同盟', 1428, 1521, '美洲非洲'], ['印加', 1438, 1533, '美洲非洲'], ['桑海', 1464, 1591, '美洲非洲']
  ];
  let mode = 0;
  $('#dynLeg').innerHTML = Object.keys(REG).map(k => '<span><i style="background:' + REG[k] + '"></i>' + k + '</span>').join('');
  function draw(){
    const L = D.map(d => ({n: d[0], a: d[1], b: d[2], r: d[3], len: d[2] - d[1]}));
    if (mode === 0) L.sort((p, q) => p.a - q.a); else L.sort((p, q) => q.len - p.len);
    const mx = 650;
    $('#dynBars').innerHTML = L.map(x => '<div class="row"><span class="nm">' + x.n + '<small>' + yr(x.a) + '—' + yr(x.b) + '</small></span><div class="tr"><i style="width:' + (x.len / mx * 100) + '%;background:' + REG[x.r] + '"></i><span style="position:absolute;left:' + (120 / mx * 100) + '%;top:-2px;bottom:-2px;border-left:1.5px dashed var(--ink-3)"></span></div><span class="v">' + x.len + ' 年</span></div>').join('');
    const s = L.map(x => x.len).sort((p, q) => p - q), med = s[Math.floor(s.length / 2)];
    const under = s.filter(v => v <= 120).length;
    $('#dynKV').innerHTML = '<div>中位数<b>' + med + ' 年</b></div><div>不到一百二十年的<b>' + under + ' / ' + s.length + '</b></div><div>最长<b>' + s[s.length - 1] + ' 年</b></div><div>最短<b>' + s[0] + ' 年</b></div>';
  }
  btnRow($('#dynSort'), ['按开始时间', '按长短'], 0, i => { mode = i; draw(); });
  draw();
});

/* ---------- 装置 19：选总督 ---------- */
dev('#dogeFig', fig => {
  const S = [
    [480, '', '大议会：所有三十岁以上的贵族议员（人数逐年变化，这里取约 480 人）。'],
    [30, 'lot', '第 1 轮 · 抽签：用球抽出 30 人。摸球的是从广场上随便找来的一个男孩。'],
    [9, 'lot', '第 2 轮 · 抽签：30 人里再抽出 9 人。'],
    [40, 'vote', '第 3 轮 · 选举：这 9 人提名 40 人，每个名字至少要得到 9 人中 7 人的同意。'],
    [12, 'lot', '第 4 轮 · 抽签：40 人里抽出 12 人。'],
    [25, 'vote', '第 5 轮 · 选举：这 12 人选出 25 人，每人至少 9 票。'],
    [9, 'lot', '第 6 轮 · 抽签：25 人里抽出 9 人。'],
    [45, 'vote', '第 7 轮 · 选举：这 9 人选出 45 人，每人至少 7 票。'],
    [11, 'lot', '第 8 轮 · 抽签：45 人里抽出 11 人。'],
    [41, 'vote', '第 9 轮 · 选举：这 11 人选出 41 人，每人至少 9 票。这 41 人就是真正的选举团。'],
    [1, 'vote', '第 10 轮 · 选举：41 人投票选出总督，需要至少 25 票。']
  ];
  let k = 0;
  const svg = $('#dgSvg');
  function draw(){
    $('#dgSteps').innerHTML = S.map((s, i) => '<span style="font-size:12px;text-align:center;padding:3px 0;border-radius:4px;line-height:1.35;background:' + (i > k ? 'var(--paper)' : s[1] === 'lot' ? 'var(--pur)' : s[1] === 'vote' ? 'var(--och)' : 'var(--ink-3)') + ';color:' + (i > k ? 'var(--ink-3)' : 'var(--paper)') + '">' + (i ? i + ' ' + (s[1] === 'lot' ? '抽' : '选') : '起') + '<br>' + s[0] + '</span>').join('');
    const n = S[k][0], cols = n > 200 ? 40 : n > 40 ? 20 : n > 10 ? 15 : n, r = n > 200 ? 3.4 : n > 40 ? 5 : n > 1 ? 7 : 22;
    const step = n > 200 ? 9.5 : n > 40 ? 16 : n > 1 ? 24 : 0, rows = Math.ceil(n / cols), w = (cols - 1) * step, h = (rows - 1) * step;
    let g = '';
    for (let i = 0; i < n; i++) {
      const x = 320 - w / 2 + (i % cols) * step, y = 85 - h / 2 + Math.floor(i / cols) * step;
      g += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '" fill="' + (S[k][1] === 'lot' ? 'var(--pur)' : S[k][1] === 'vote' ? 'var(--och)' : 'var(--ink-3)') + '" fill-opacity="' + (n === 1 ? 1 : .75) + '"/>';
    }
    if (n === 1) g += '<text x="320" y="91" text-anchor="middle" font-size="16" fill="var(--paper)">总督</text>';
    svg.innerHTML = g;
    $('#dgSay').innerHTML = S[k][2] + (k === S.length - 1 ? '<br><b>为什么这么麻烦？</b>抽签让谁也没法提前知道谁会进下一轮，收买和拉帮结派就很难；选举又保证最后选出的人有足够的威望。威尼斯人还规定，被选为总督的人不许拒绝，就任后不许接受外国礼物、不许私下会见外国使节，他的家人也不许担任某些要职。这套程序一直用到 1797 年共和国灭亡。' : '');
    $('#dgNext').disabled = k === S.length - 1;
  }
  $('#dgNext').addEventListener('click', () => { if (k < S.length - 1) { k++; draw(); } });
  $('#dgReset').addEventListener('click', () => { k = 0; draw(); });
  draw();
});

/* ---------- 装置 20：法条有多长 ---------- */
dev('#codeFig', fig => {
  const A = [
    ['乌尔纳姆法典', '约前 2100', 40, '现存约四十条，原文残缺。'],
    ['汉谟拉比法典', '约前 1754', 282, '条号是后人编的，碑上有一段被磨掉了。'],
    ['唐律疏议', '653', 502, '十二篇。每条律文后附官方解释“疏议”，篇幅比律文本身大得多。'],
    ['大明律', '1397', 460, '朱元璋定下后要求子孙“不许擅改”，于是后来的变化都只能写进“例”里。'],
    ['大清律例 · 律', '1740', 436, '律文基本照抄明律，乾隆五年定本以后就不再改了。'],
    ['拿破仑民法典', '1804', 2281, '只管民事（人、财产、契约、继承），刑法另有法典。'],
    ['德国民法典', '1900', 2385, '以精密著称，影响了日本、中华民国等的民法。'],
    ['中国民法典', '2020', 1260, '中华人民共和国第一部以“法典”命名的法律。']
  ];
  const B = [['乾隆五年定本', '1740', 1049], ['同治九年', '1870', 1892]];
  function show(i){
    if (i === 0) {
      const mx = 2400;
      $('#codeBars').innerHTML = A.map(a => '<div class="row"><span class="nm">' + a[0] + '<small>' + a[1] + '</small></span><div class="tr"><i style="width:' + (a[2] / mx * 100) + '%"></i></div><span class="v">' + a[2].toLocaleString() + '</span></div>').join('');
      $('#codeSay').innerHTML = '条数不能直接比较：汉谟拉比一条只有一两句，现代法典一条也可能只有一句，唐律一条连同疏议可能有上千字。但大趋势很清楚：<b>社会越复杂，要写下来的规矩越多</b>。';
    } else {
      $('#codeBars').innerHTML = '<div class="lab">清代的“律”一直是 436 条左右，“例”却越来越多（约数）</div>' + B.map(b => '<div class="row"><span class="nm">' + b[0] + '<small>' + b[1] + '</small></span><div class="tr"><i style="width:' + (b[2] / 2000 * 100) + '%;background:var(--och)"></i></div><span class="v">约 ' + b[2].toLocaleString() + '</span></div>').join('');
      $('#codeSay').innerHTML = '律是祖宗定的，不能改；新情况怎么办？就由皇帝批准一条条“例”。到了清末，例的数量是律的四倍多，而且例和律、例和例之间常常互相矛盾。审案的官员只好依赖熟悉例案的“刑名师爷”。法条越多，<b>真正说了算的，反而是能在法条之间找到路的人</b>。';
    }
  }
  btnRow($('#codeBtns'), ['各部法典', '清代的例'], 0, show); show(0);
});

/* ---------- 装置 21：门槛 ---------- */
dev('#cascFig', fig => {
  let T = [], on = [], timer = null, label = '';
  const grid = $('#csGrid'), say = $('#csSay');
  function render(){
    grid.innerHTML = T.map((t, i) => '<span style="aspect-ratio:1;border-radius:50%;display:grid;place-items:center;font-family:var(--f-mono);font-size:10.5px;line-height:1;' + (on[i] ? 'background:var(--red);color:var(--paper)' : 'background:var(--paper);color:var(--ink-3);border:1px solid var(--rule)') + '">' + t + '</span>').join('');
  }
  function set(arr, lab){ clearInterval(timer); T = arr; on = arr.map(() => false); label = lab; render(); say.innerHTML = lab + '　点“开始”。'; }
  $('#csG').addEventListener('click', () => set(Array.from({length: 100}, (_, i) => i), '格兰诺维特的一百人：门槛从 0 到 99，每人各不相同。'));
  $('#csG2').addEventListener('click', () => set(Array.from({length: 100}, (_, i) => i === 1 ? 2 : i), '只改了一个人：原来门槛是 1 的那个人，现在要看到 2 个人才肯动。其余九十九人一模一样。'));
  const mo = () => { $('#csMo').textContent = $('#csM').value + ' 人'; $('#csSo').textContent = '±' + $('#csS').value; };
  ['csM', 'csS'].forEach(id => $('#' + id).addEventListener('input', mo)); mo();
  $('#csR').addEventListener('click', () => {
    const m = +$('#csM').value, s = +$('#csS').value;
    const arr = Array.from({length: 100}, () => clamp(Math.round(m + s * gauss()), 0, 99));
    set(arr, '随机人群：平均门槛 ' + m + '，分散 ±' + s + '。其中门槛为 0 的“带头人”有 ' + arr.filter(t => t === 0).length + ' 个。');
  });
  $('#csGo').addEventListener('click', () => {
    if (!T.length) return;
    clearInterval(timer); on = T.map(() => false); render();
    let round = 0;
    timer = setInterval(() => {
      const n = on.filter(Boolean).length;
      let changed = false;
      T.forEach((t, i) => { if (!on[i] && t <= n) { on[i] = true; changed = true; } });
      round++; render();
      const m = on.filter(Boolean).length;
      if (!changed) {
        clearInterval(timer);
        say.className = 'say ' + (m > 50 ? 'bad' : 'ok');
        say.innerHTML = label + '<br><b>' + round + ' 轮后停下：一共 ' + m + ' 人站了出来。</b>' + (m === 100 && label.indexOf('格兰') === 0 ? '门槛一个挨一个，每多一个人站出来，就刚好够下一个人跨过门槛。一个零门槛的人，就带动了所有人。' : m === 0 ? '没有一个门槛为零的人：谁都不满，可谁也不想第一个站出来。表面上，一片平静。' : m <= 3 && label.indexOf('随机') === 0 ? '几个带头的人站出来了，可是没有足够多的人门槛低到跟上，连锁反应在开头就断了。' : m <= 1 ? '一个人站出来了，可是没有人的门槛是 1，于是连锁反应在第一步就断了。<b>两群人的“不满程度”几乎一样，结果却天差地别。</b>第二天的报纸会写：“一个闹事分子被带走，秩序井然。”' : m > 50 ? '多数人都动了起来。看看那些门槛很高的人，他们也许原本并不想参加，只是“大家都去了”。' : '连锁反应走了一段就停了：门槛分布中间出现了一道“缺口”。这正是很多骚动的样子——闹了一阵，平息了。');
      }
    }, 60);
  });
});

/* ---------- 第二十一章：漫画《合纵》 ---------- */
PR.table = (x, y, w) => '<rect x="' + (x - w / 2) + '" y="' + y + '" width="' + w + '" height="12" rx="3"' + FP + '/><path d="M' + (x - w / 2 + 14) + ',' + (y + 12) + ' l0,30 M' + (x + w / 2 - 14) + ',' + (y + 12) + ' l0,30"' + ST(3) + '/>';
PR.box = (x, y, s) => '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><rect x="-18" y="-24" width="36" height="24" rx="2"' + FP + '/><path d="M-18,-16 L18,-16 M0,-24 L0,0"' + ST(1.6) + '/><path d="M-6,-24 q6,-10 12,0"' + ST(1.6) + '/></g>';
const SIX = (y, s, e, sh) => [['da', 2], ['dao', 2], ['bei', 2], ['suan', 2], ['man', 2], ['he', 2]].map((k, i) => who(k[0], {x: 6 + i * 98, y: y + (i % 2) * 6, s: s, e: Array.isArray(e) ? e[i] : e, era: k[1], flip: i >= 3})).join('');
PANELS.c21a = () => PR.ground(W2, 232) + SIX(118, .86, ['n', 'n', 'happy', 'n', 'n', 'n']) + PR.table(300, 200, 520);
PANELS.c21b = () => PR.speed(150, 110, 200, 22, 60, 6) + PR.cup(90, 150, 2) + PR.cup(150, 140, 2) + PR.cup(210, 150, 2) + who('da', {x: 0, y: 140, s: .8, e: 'shout', era: 2}) + who('dao', {x: 200, y: 140, s: .8, e: 'shout', era: 2, flip: true});
PANELS.c21c = () => '<rect width="300" height="230" fill="' + I + '" fill-opacity=".14"/>' + PR.star(260, 30, 4) + who('dao', {x: 0, y: 70, s: 1.2, e: 'sly', era: 2}) + who('suan', {x: 160, y: 110, s: .95, e: 'sly', era: 2, flip: true}) + PR.box(170, 222, 1.2);
PANELS.c21d = () => PR.tone(0, 0, 300, 230, 7) + '<rect x="40" y="60" width="220" height="170" fill="' + P + '"/>' + who('dao', {x: 60, y: 74, s: 1.3, e: 'worry', era: 2, sweat: true});
PANELS.c21e = () => PR.ground(W1, 228) + PR.wall(150, 228, 150, 80) + PR.flag(180, 148, 50, '') + PR.horse(70, 228, .7) + PR.crowd(10, 168, 4, .8, 13) + who('he', {x: 200, y: 40, s: .7, e: 'shout', era: 2, flip: true});
PANELS.c21f = () => PR.ground(W2, 232) + SIX(118, .86, 'angry') + '<path d="M80,120 l40,-20 M180,120 l-40,-20 M280,118 l40,-22 M420,118 l-40,-22 M480,120 l40,-18"' + ST(2.4) + '/>';

/* ---------- 装置 22：坐寇与流寇 · 未来的影子 ---------- */
dev('#banditFig', fig => {
  const P = t => 100 * Math.pow(1 - t, 1.2);
  const total = (t, H) => t * 100 + (H - 1) * t * P(t);
  function bandit(){
    const t = +$('#bdT').value / 100, H = +$('#bdH').value;
    $('#bdTo').textContent = Math.round(t * 100) + '%'; $('#bdHo').textContent = H + ' 年';
    let best = 0, bt = 0; const pts = [];
    for (let k = 0; k <= 100; k++) { const v = total(k / 100, H); pts.push(v); if (v > best) { best = v; bt = k / 100; } }
    const mx = Math.max(...pts), X = k => 30 + k * 2.6, Y = v => 160 - v / mx * 135;
    let g = '<line x1="30" y1="160" x2="290" y2="160" stroke="var(--rule)"/><text x="30" y="175" font-size="9.5" fill="var(--ink-3)">0%</text><text x="290" y="175" font-size="9.5" text-anchor="end" fill="var(--ink-3)">拿走 100%</text>';
    g += '<path d="' + pts.map((v, k) => (k ? 'L' : 'M') + X(k).toFixed(1) + ',' + Y(v).toFixed(1)).join(' ') + '" fill="none" stroke="var(--och)" stroke-width="2.2"/>';
    g += '<line x1="' + X(bt * 100) + '" x2="' + X(bt * 100) + '" y1="20" y2="160" stroke="var(--grn)" stroke-dasharray="3 3"/><text x="' + X(bt * 100) + '" y="16" text-anchor="middle" font-size="9.5" fill="var(--grn)">最划算</text>';
    g += '<circle cx="' + X(t * 100) + '" cy="' + Y(total(t, H)) + '" r="5" fill="var(--red)"/>';
    g += '<text x="32" y="30" font-size="10" fill="var(--ink-3)">你 ' + H + ' 年里的总收入</text>';
    $('#bdSvg').innerHTML = g;
    $('#bdKV').innerHTML = '<div>你的总收入<b>' + Math.round(total(t, H)) + '</b></div><div>最划算的税率<b>' + Math.round(bt * 100) + '%</b></div><div>村子明年的收成<b>' + Math.round(P(t)) + '%</b></div>';
    return {t, H, bt};
  }
  const R = 3, S = 0, T = 5, Pp = 1;
  function pd(){
    const d = +$('#pdD').value / 100, j = +$('#pdJ').value;
    $('#pdDo').textContent = Math.round(d * 100) + '%'; $('#pdJo').textContent = j ? '罚 ' + j : '没有裁判';
    const A = [[R, R, S], [R, R, S * (1 - d) + d * (Pp - j)], [T - j, (T - j) * (1 - d) + d * (Pp - j), Pp - j]];
    let x = [.4, .2, .4]; const hist = [x.slice()];
    for (let g = 0; g < 80; g++) {
      const f = A.map(row => row[0] * x[0] + row[1] * x[1] + row[2] * x[2]), c = 10;
      const fb = f[0] * x[0] + f[1] * x[1] + f[2] * x[2];
      x = x.map((xi, i) => xi * (f[i] + c) / (fb + c));
      x = x.map(xi => xi * .98 + .02 / 3);
      hist.push(x.slice());
    }
    const X = g => 10 + g * (280 / 80), Y = v => 170 - v * 160;
    const col = ['var(--grn)', 'var(--blu)', 'var(--red)'];
    let g = '', base = hist.map(() => 0);
    [2, 1, 0].forEach(s => {
      const top = hist.map((h, i) => base[i] + h[s]);
      g += '<path d="M' + hist.map((h, i) => X(i).toFixed(1) + ',' + Y(top[i]).toFixed(1)).join(' L') + ' L' + hist.map((h, i) => X(hist.length - 1 - i).toFixed(1) + ',' + Y(base[hist.length - 1 - i]).toFixed(1)).join(' L') + ' Z" fill="' + col[s] + '" fill-opacity=".75"/>';
      base = top;
    });
    g += '<text x="10" y="8" font-size="9.5" fill="var(--ink-3)">第 0 代</text><text x="290" y="8" font-size="9.5" text-anchor="end" fill="var(--ink-3)">第 80 代</text>';
    $('#pdSvg').innerHTML = g;
    return hist[hist.length - 1];
  }
  function all(){
    const b = bandit(), e = pd();
    const win = e.indexOf(Math.max(...e));
    let t = (b.H === 1 ? '<b>只待一年</b>：最划算的就是全拿走——收成已经在那儿了，明年的事与你无关。这就是流寇。' : b.H < 5 ? '<b>待几年</b>：开始舍不得全拿了，因为明年还要靠这个村子。' : '<b>待很多年</b>：最划算的税率掉到一半以下。你开始关心村子的收成，甚至想帮它修水渠、赶走别的土匪——你成了坐寇，也就是一个最原始的“国家”。') + '<br>';
    t += win === 2 ? '右边：背约的人占了上风。未来的影子太短、又没有裁判时，守信的人只会被一次次占便宜。' : win === 1 ? '右边：“以牙还牙”的人占了多数——你守约我就守约，你背约我就背约。只要大家知道还会再见面，守信就是划算的。这是政治学家阿克塞尔罗德 1980 年代用电脑比赛得出的著名结论。' : '右边：大家都守约。有了一个肯罚、罚得够重的裁判，连“一直守约”的老实人也能活得好好的。';
    $('#bdSay').innerHTML = t;
  }
  ['bdT', 'bdH', 'pdD', 'pdJ'].forEach(id => $('#' + id).addEventListener('input', all));
  all();
});

/* @@DEVICES */

/* ---------- 漫画渲染（放在最后，等 PANELS 填满） ---------- */
$$('svg[data-panel]').forEach(s => { const f = PANELS[s.dataset.panel]; if (f) s.innerHTML = f(); });
})();
