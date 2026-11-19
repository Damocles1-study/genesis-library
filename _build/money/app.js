(function(){
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const cv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const NS = 'http://www.w3.org/2000/svg';
const fmtN = n => Math.round(n).toLocaleString('en-US');
const redraws = [];
function onRedraw(f){ redraws.push(f); f(); }
let rzT; window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => redraws.forEach(f => f()), 120); });
const mq = window.matchMedia('(prefers-color-scheme: dark)');
if (mq.addEventListener) mq.addEventListener('change', () => redraws.forEach(f => f()));

/* ---------- 画布与折线图 ---------- */
function setup(c){
  const w = c.clientWidth || c.parentNode.clientWidth || 300;
  const h = c.clientHeight || 220;
  const d = window.devicePixelRatio || 1;
  c.width = Math.round(w * d); c.height = Math.round(h * d);
  const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0);
  return {x, w, h};
}
function chart(c, o){
  const {x, w, h} = setup(c);
  const P = {l: o.padL || 46, r: 12, t: 14, b: 26};
  const ink = cv('--ink'), ink3 = cv('--ink-3'), rule = cv('--rule');
  x.clearRect(0, 0, w, h);
  const ty = v => o.log ? Math.log10(Math.max(v, 1e-12)) : v;
  const y0 = ty(o.y0), y1 = ty(o.y1);
  const X = v => P.l + (v - o.x0) / (o.x1 - o.x0) * (w - P.l - P.r);
  const Y = v => P.t + (1 - (ty(v) - y0) / (y1 - y0)) * (h - P.t - P.b);
  x.font = '11px ' + cv('--f-mono'); x.textBaseline = 'middle';
  x.strokeStyle = rule; x.fillStyle = ink3; x.lineWidth = 1;
  (o.yticks || []).forEach(([v, lab]) => { const yy = Math.round(Y(v)) + .5; x.beginPath(); x.moveTo(P.l, yy); x.lineTo(w - P.r, yy); x.stroke(); x.textAlign = 'right'; x.fillText(lab, P.l - 6, yy); });
  x.textAlign = 'center'; x.textBaseline = 'top';
  (o.xticks || []).forEach(([v, lab]) => x.fillText(lab, X(v), h - P.b + 7));
  (o.bands || []).forEach(b => { x.globalAlpha = b.alpha || 1; x.fillStyle = b.color; x.fillRect(P.l, Y(b.to), w - P.l - P.r, Y(b.from) - Y(b.to)); x.globalAlpha = 1; });
  (o.series || []).forEach(s => {
    if (!s.pts.length) return;
    x.strokeStyle = s.color || ink; x.lineWidth = s.width || 2; x.setLineDash(s.dash || []);
    x.beginPath(); s.pts.forEach(([a, b], i) => i ? x.lineTo(X(a), Y(b)) : x.moveTo(X(a), Y(b))); x.stroke(); x.setLineDash([]);
    if (s.dots) { x.fillStyle = s.color || ink; s.pts.forEach(([a, b]) => { x.beginPath(); x.arc(X(a), Y(b), 2.6, 0, 7); x.fill(); }); }
  });
  (o.marks || []).forEach(m => { x.fillStyle = m.color || cv('--seal'); x.beginPath(); x.arc(X(m.x), Y(m.y), m.r || 5, 0, 7); x.fill(); if (m.label) { x.font = '12px ' + cv('--f-body'); x.textAlign = m.align || 'left'; x.textBaseline = 'bottom'; x.fillStyle = ink; x.fillText(m.label, X(m.x) + (m.align === 'right' ? -8 : 8), Y(m.y) - 6); } });
  (o.legend || []).forEach((l, i) => { x.font = '12px ' + cv('--f-body'); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = l.color; x.fillRect(P.l + 8 + i * 110, P.t + 6, 14, 3); x.fillStyle = ink; x.fillText(l.label, P.l + 26 + i * 110, P.t + 7); });
}

/* ---------- 钞票纹 ---------- */
function rose(svg, cx, cy, R, layers, color, op){
  let h = '';
  layers.forEach(([r, d, k, sw]) => {
    let p = '';
    const N = 900, T = Math.PI * 2 * k;
    for (let i = 0; i <= N; i++) {
      const t = T * i / N;
      const x = cx + (R - r) * Math.cos(t) + d * Math.cos((R - r) / r * t);
      const y = cy + (R - r) * Math.sin(t) - d * Math.sin((R - r) / r * t);
      p += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
    }
    h += '<path d="' + p + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '" opacity="' + op + '"/>';
  });
  svg.insertAdjacentHTML('beforeend', h);
}
$$('svg[data-gl]').forEach(s => {
  if (s.dataset.gl === 'hero') {
    rose(s, 210, 100, 92, [[23, 31, 23, .5], [17, 26, 17, .4], [29, 20, 29, .35]], 'var(--intag)', .55);
    let w = ''; for (let k = 0; k < 7; k++) { let p = ''; for (let x = 0; x <= 420; x += 4) { const y = 22 + k * 2.2 + Math.sin(x / 13 + k) * 4; p += (x ? 'L' : 'M') + x + ',' + y.toFixed(1); } w += '<path d="' + p + '" fill="none" stroke="var(--intag)" stroke-width=".4" opacity=".5"/>'; }
    for (let k = 0; k < 7; k++) { let p = ''; for (let x = 0; x <= 420; x += 4) { const y = 170 + k * 2.2 + Math.sin(x / 13 - k) * 4; p += (x ? 'L' : 'M') + x + ',' + y.toFixed(1); } w += '<path d="' + p + '" fill="none" stroke="var(--intag)" stroke-width=".4" opacity=".5"/>'; }
    s.insertAdjacentHTML('afterbegin', w);
  } else {
    const n = +((s.closest('section') || {}).id || 'v1').replace(/\D/g, '') || 1;
    rose(s, 150, 150, 140, [[37 + n % 5, 45 + n % 7, 37 + n % 5, .5], [23 + n % 4, 30, 23 + n % 4, .4]], 'var(--intag)', .6);
  }
});

/* ---------- 页眉：年份、卷名、进度、目录 ---------- */
const yEls = $$('[data-y]');
const barYr = $('#barYr'), barVol = $('#barVol'), prog = $('#prog');
let tick = false;
function yLab(y){ y = +y; return y < 0 ? '前 ' + (-y) : String(y); }
function onScroll(){
  tick = false;
  const lim = innerHeight * 0.4; let cur = null;
  for (const e of yEls) { if (e.getBoundingClientRect().top < lim) cur = e; else break; }
  if (cur) { barYr.textContent = yLab(cur.dataset.y); const v = cur.closest('[data-vol]'); if (v) barVol.textContent = v.dataset.vol; }
  const H = document.documentElement.scrollHeight - innerHeight;
  prog.style.width = (H > 0 ? scrollY / H * 100 : 0) + '%';
}
window.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, {passive: true});
onScroll();
const drawer = $('#drawer');
$('#drawerList').innerHTML = $$('#toc a').map(a => '<li><a href="' + a.getAttribute('href') + '"><span class="n">' + $('.n', a).textContent + '</span><span>' + $('.t', a).innerHTML + '</span></a></li>').join('');
function openD(on){ drawer.classList.toggle('on', on); drawer.setAttribute('aria-hidden', on ? 'false' : 'true'); }
$('#tocBtn').addEventListener('click', () => openD(true));
drawer.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target.closest('a')) openD(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') openD(false); });
const toTop = $('#toTop'); if (toTop) toTop.addEventListener('click', e => { e.preventDefault(); scrollTo({top: 0, behavior: 'smooth'}); });

/* ---------- 序：钞票 ---------- */
(function(){
  const b = $('#heroBill'), btn = $('#billBtn'), cap = $('#billCap');
  btn.addEventListener('click', () => {
    const d = !b.classList.contains('doubt');
    b.classList.toggle('doubt', d); btn.setAttribute('aria-pressed', d);
    btn.textContent = d ? '大家又信了' : '假如大家都不信了';
    cap.textContent = d ? '纸还是那张纸，油墨一点没少。它只是失去了唯一支撑它的东西。' : '现在，所有人都相信它值一百。所以它值一百。';
  });
})();

/* ---------- 装置 1：集市 ---------- */
(function(){
  const IC = {'鱼': '🐟', '鞋': '👞', '麦': '🌾', '盐': '🧂', '布': '🧵', '陶罐': '🏺', '贝': '🐚'};
  const V0 = [
    {name: '鞋匠', ic: '👞', has: '鞋', want: '麦'},
    {name: '农夫', ic: '🧑‍🌾', has: '麦', want: '盐'},
    {name: '盐贩', ic: '🧂', has: '盐', want: '布'},
    {name: '织女', ic: '🧵', has: '布', want: '鱼'},
    {name: '陶匠', ic: '🏺', has: '陶罐', want: '鞋'}
  ];
  let mode = 'barter', hand, fresh, steps, seen, done, V;
  const vill = $('#bVill'), msg = $('#bMsg'), handEl = $('#bHand'), fr = $('#bFresh');
  function reset(){
    V = V0.slice().sort(() => Math.random() - .5);
    hand = '鱼'; fresh = 7; steps = 0; seen = {}; done = false;
    msg.textContent = mode === 'barter' ? '先想一想：谁想要鱼？你不知道别人想要什么，只能一个个去问。' : mode === 'credit' ? '在熟人村子里，你可以直接去找鞋匠。' : '村里人都认贝壳。先把鱼卖给随便哪个人。';
    render();
  }
  function render(){
    handEl.textContent = IC[hand] || hand; fr.style.width = (fresh / 7 * 100) + '%';
    vill.innerHTML = V.map((v, i) => '<button data-i="' + i + '"><span class="ic">' + v.ic + '</span>' + v.name + '<small>有' + v.has + ' · 想要' + (mode !== 'barter' || seen[v.name] ? v.want : '？') + '</small></button>').join('');
  }
  function bump(btn, ok){ btn.classList.remove('hit', 'miss'); void btn.offsetWidth; btn.classList.add(ok ? 'hit' : 'miss'); }
  vill.addEventListener('click', e => {
    const btn = e.target.closest('button'); if (!btn || done) return;
    const v = V[+btn.dataset.i]; steps++;
    if (mode === 'barter') {
      fresh--; seen[v.name] = 1;
      if (v.want === hand) { msg.textContent = v.name + '收下你的' + hand + '，给了你' + v.has + '。'; hand = v.has; render(); bump($('[data-i="' + V.indexOf(v) + '"]', vill), true); }
      else { msg.textContent = v.name + '摇头：“我不要' + hand + '，我想要' + v.want + '。”'; render(); bump($('[data-i="' + V.indexOf(v) + '"]', vill), false); }
      if (hand === '鞋') { done = true; msg.textContent = '终于换到鞋了！你跑了 ' + steps + ' 趟。最少也要 4 趟：鱼→布→盐→麦→鞋。这就是“需求的双重巧合”。'; }
      else if (fresh <= 0) { done = true; handEl.textContent = '🦴'; msg.textContent = '天黑了，鱼臭了。你跑了 ' + steps + ' 趟，还是光着脚。'; }
    } else if (mode === 'credit') {
      if (v.has === '鞋') { hand = '鞋'; done = true; render(); msg.textContent = '鞋匠给了你一双鞋：“先穿着，回头有鱼了给我送两条。”他在心里记了一笔。你只跑了 1 趟。人类学家说，熟人之间大多是这样过日子的。'; }
      else { fresh--; render(); msg.textContent = v.name + '：“我这儿没鞋啊，你去找鞋匠，跟他说回头还他就行。”'; }
    } else {
      if (hand === '鱼') { hand = '贝'; render(); msg.textContent = v.name + '用几枚贝壳买下了你的鱼。现在去找有鞋的人。'; }
      else if (hand === '贝' && v.has === '鞋') { hand = '鞋'; done = true; render(); msg.textContent = '用贝壳买到了鞋。一共 ' + steps + ' 趟。一个大家都认的中间物，把一条长链剪成了两段。'; }
      else { fresh--; render(); msg.textContent = v.name + '没有鞋卖。'; }
    }
    fr.style.width = (Math.max(fresh, 0) / 7 * 100) + '%';
  });
  $$('[data-bm]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.bm; $$('[data-bm]').forEach(x => x.classList.toggle('on', x === b)); reset(); }));
  $('#bReset').addEventListener('click', reset);
  const n = $('#bN'), no = $('#bNo'), cnt = $('#bCount');
  function upd(){ const k = +n.value; no.textContent = k + ' 种货'; cnt.innerHTML = '没有钱：每两种货之间都要一个兑换比例，一共 <b>' + fmtN(k * (k - 1) / 2) + '</b> 个，“一双鞋换几斤盐”“一斤盐换几尺布”都得记住。有了钱：每种货只要一个价格，<b>' + k + '</b> 个就够了。'; }
  n.addEventListener('input', upd); upd(); reset();
})();

/* ---------- 装置 2：雅浦账本 ---------- */
(function(){
  const svg = $('#yapSvg');
  const owners = ['甲家', '乙家', '丙家'];
  const stones = [{n: '门口的大石币', o: 0, x: 70, y: 150, r: 26}, {n: '路边的中石币', o: 1, x: 210, y: 158, r: 18}, {n: '海底那块巨石', o: 2, x: 350, y: 212, r: 30, sea: 1}];
  let doubt = false; const hist = [];
  function draw(){
    let h = '<rect x="0" y="186" width="420" height="44" fill="var(--sea)" opacity=".22"/>';
    for (let k = 0; k < 3; k++) { let p = ''; for (let x = 0; x <= 420; x += 6) p += (x ? 'L' : 'M') + x + ',' + (190 + k * 12 + Math.sin(x / 14 + k) * 2.5).toFixed(1); h += '<path d="' + p + '" fill="none" stroke="var(--sea)" stroke-width="1" opacity=".6"/>'; }
    owners.forEach((o, i) => { const x = 70 + i * 140; h += '<g transform="translate(' + (x - 30) + ',40)"><polygon points="0,30 30,4 60,30" fill="var(--paper-2)" stroke="var(--ink-2)"/><rect x="8" y="30" width="44" height="34" fill="var(--paper-2)" stroke="var(--ink-2)"/><rect x="24" y="44" width="12" height="20" fill="var(--ink-3)"/></g><text x="' + x + '" y="30" text-anchor="middle" font-size="14" fill="var(--ink)">' + o + '</text>'; });
    stones.forEach((s, i) => {
      h += '<g opacity="' + (doubt ? .35 : 1) + '"><circle cx="' + s.x + '" cy="' + s.y + '" r="' + s.r + '" fill="var(--paper-2)" stroke="var(--ink-2)" stroke-width="1.5"/><circle cx="' + s.x + '" cy="' + s.y + '" r="' + (s.r * .3) + '" fill="' + (s.sea ? 'var(--sea)' : 'var(--paper)') + '" stroke="var(--ink-2)"/></g>';
      h += '<text x="' + s.x + '" y="' + (s.sea ? s.y - s.r - 4 : s.y + s.r + 15) + '" text-anchor="middle" font-size="12" fill="' + (doubt ? 'var(--ink-3)' : 'var(--seal)') + '">' + (doubt ? '归谁？' : '归' + owners[s.o]) + '</text>';
    });
    svg.innerHTML = h;
    $('#yapLedger').innerHTML = stones.map(s => '<div' + (doubt ? ' style="text-decoration:line-through;color:var(--ink-3)"' : '') + '>' + s.n + ' → <b>' + owners[s.o] + '</b></div>').join('') + hist.slice(-3).map(t => '<div style="font-size:12.5px;color:var(--ink-3)">' + t + '</div>').join('');
  }
  $('#yapStone').innerHTML = stones.map((s, i) => '<option value="' + i + '">' + s.n + '</option>').join('');
  $('#yapTo').innerHTML = owners.map((o, i) => '<option value="' + i + '">' + o + '</option>').join('');
  $('#yapTo').value = 1;
  $('#yapGo').addEventListener('click', () => {
    if (doubt) { $('#yapMsg').textContent = '大家都不认账了，过户给谁也没有意义。'; return; }
    const s = stones[+$('#yapStone').value], to = +$('#yapTo').value;
    if (s.o === to) { $('#yapMsg').textContent = '它已经是' + owners[to] + '的了。'; return; }
    hist.push(owners[s.o] + ' → ' + owners[to] + '：' + s.n + '，原地未动'); s.o = to; draw();
    $('#yapMsg').textContent = s.sea ? '海底那块石头换了主人。没有人潜下去看过它，可全村都改口了：它现在是' + owners[to] + '的。' : '石头一寸没挪，全村人都知道它现在归' + owners[to] + '了。';
  });
  $('#yapDoubt').addEventListener('click', () => {
    doubt = !doubt; draw();
    $('#yapDoubt').textContent = doubt ? '大家又认账了' : '有人不信了';
    $('#yapMsg').textContent = doubt ? '假如有一天，大家不再承认这本账：海底那块石头只是海底的一块石头，门口的大石头只是一块挡路的石头。所有的财富同时消失了，而没有一块石头挪过窝。' : '账又回来了。石头还是那几块石头。';
  });
  draw();
})();

/* ---------- 装置 3：一枚铜钱的账 ---------- */
(function(){
  const r = $('#coinR'), o = $('#coinO'), svg = $('#coinSvg'), rd = $('#coinRead'), pin = $('#coinPin'), note = $('#coinNote');
  const P = {
    banliang: [100, '秦半两：钱上铸“半两”，实重也是半两，重如其文。铜料与面值大致相当，盗铸没什么赚头，朝廷铸钱也几乎不赚钱。（位置为示意）'],
    jia: [30, '汉初荚钱：轻如榆荚，铸一枚就赚一大半，人人想铸，钱越来越多，《史记》说米一石卖到一万钱。（位置为示意）'],
    baijin: [15, '武帝“白金三品”：面值远高于用料。据《史记·平准书》，几年之间因盗铸被判死罪、后来遇赦的吏民有数十万人。（位置为示意）'],
    wuzhu: [85, '汉五铢：用料足、做工精，又只许中央铸造，民间盗铸无利可图，于是用了七百年。（位置为示意）'],
    song: [125, '宋代“钱荒”：铜价上涨，把铜钱熔了铸铜器、或者运去日本，比拿它当钱花更划算。朝廷铸得越多，市面上越缺钱。（位置为示意）']
  };
  function draw(){
    const v = +r.value / 100; o.textContent = v.toFixed(2) + ' 文';
    pin.style.left = clamp((v - .1) / 1.5 * 100, 0, 100) + '%';
    const R1 = 62, rr = R1 * Math.sqrt(Math.min(v, 1.6) / 1.6) * 1.26;
    svg.innerHTML = '<circle cx="80" cy="80" r="' + Math.min(rr, 78).toFixed(1) + '" fill="var(--copper)" opacity=".85"/>' +
      '<circle cx="80" cy="80" r="' + R1 + '" fill="none" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="4 3"/>' +
      '<rect x="68" y="68" width="24" height="24" fill="var(--card)" stroke="var(--ink)" stroke-width="1.5"/>' +
      '<text x="80" y="35" text-anchor="middle" font-size="13" fill="var(--ink)">面值 1 文</text>' +
      '<text x="80" y="134" text-anchor="middle" font-size="12" fill="var(--ink)">铜料 ' + v.toFixed(2) + '</text>';
    const gov = 1 - v - .1, priv = 1 - v - .25;
    let z, t;
    if (v < .6) { z = '<b style="color:var(--seal)">盗铸区</b>'; t = '私铸一枚能净赚约 ' + priv.toFixed(2) + ' 文。只要有利可图，杀头也拦不住，假钱会淹没市场，物价上涨。'; }
    else if (v <= 1.0) { z = '<b style="color:var(--intag)">安全区</b>'; t = priv > 0 ? '私铸还有一点点利润（' + priv.toFixed(2) + ' 文），但扣掉被抓的风险就不划算了。' : '私铸不赚钱。钱能安安稳稳地流通。'; }
    else { z = '<b style="color:var(--copper)">熔毁区</b>'; t = '一枚钱的铜比它的面值还值钱：熔一枚赚 ' + (v - 1).toFixed(2) + ' 文。钱会被熔掉、被运走，市面上闹“钱荒”。'; }
    rd.innerHTML = z + ' · 官府每铸一枚，铸币税 <b>' + gov.toFixed(2) + '</b> 文' + (gov < 0 ? '（亏本）' : '') + '<br>' + t;
  }
  r.addEventListener('input', () => { note.textContent = ''; draw(); });
  $$('[data-coin]').forEach(b => b.addEventListener('click', () => { const p = P[b.dataset.coin]; r.value = p[0]; draw(); note.textContent = p[1]; }));
  draw();
})();

/* ---------- 装置 4：罗马银币 ---------- */
(function(){
  const D = [
    ['共和时期', -211, 97, '第纳尔诞生，几乎是纯银。'],
    ['奥古斯都', 14, 97, '帝国初年，成色依旧。'],
    ['尼禄', 64, 93, '罗马大火之后减重降色，开了头。'],
    ['图拉真', 117, 89, '征服达契亚，打仗要钱。'],
    ['马可·奥勒留', 180, 75, '抗击日耳曼人，又一次稀释。'],
    ['塞维鲁', 211, 50, '给军队大幅涨饷，含银跌到一半上下。他据说给儿子们的遗言是：让士兵发财，别的都别管。'],
    ['卡拉卡拉', 215, 48, '推出新银币“安东尼尼安”，面值两枚第纳尔，含银却只有约一枚半。'],
    ['加里恩努斯', 268, 4, '三世纪危机最深处，“银币”只剩一层银皮。'],
    ['奥勒良', 274, 5, '改革币制，在钱上标明含银约 5%，算是诚实地承认了现实。']
  ];
  const r = $('#romeR'), o = $('#romeO'), coin = $('#romeCoin'), note = $('#romeNote'), c = $('#romeChart');
  function mix(p){ const a = [201, 208, 214], b = [176, 106, 59], t = 1 - p / 100; return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',') + ')'; }
  function draw(){
    const i = +r.value, d = D[i];
    o.textContent = d[1] < 0 ? '前' + (-d[1]) : d[1];
    coin.innerHTML = '<circle cx="80" cy="80" r="64" fill="' + mix(d[2]) + '" stroke="var(--ink-2)" stroke-width="1.5"/><circle cx="80" cy="80" r="56" fill="none" stroke="rgba(0,0,0,.25)" stroke-dasharray="2 3"/>' +
      '<path d="M62 98 Q60 70 76 58 Q92 50 98 64 Q104 76 96 84 L100 96 Q90 104 78 104 Z" fill="rgba(0,0,0,.18)"/>' +
      '<text x="80" y="150" text-anchor="middle" font-size="13" fill="var(--ink)">含银约 ' + d[2] + '%</text>';
    note.innerHTML = '<b>' + d[0] + '</b>（' + (d[1] < 0 ? '前 ' + (-d[1]) : d[1]) + ' 年前后）：' + d[3];
    chart(c, {x0: -230, x1: 290, y0: 0, y1: 100, padL: 40,
      yticks: [[0, '0%'], [25, '25%'], [50, '50%'], [75, '75%'], [100, '100%']],
      xticks: [[-200, '前200'], [0, '0'], [100, '100'], [200, '200'], [274, '274']],
      series: [{pts: D.map(d => [d[1], d[2]]), color: cv('--silver'), width: 2.5, dots: true}],
      marks: [{x: d[1], y: d[2], color: cv('--seal'), r: 6, label: d[0], align: d[1] > 150 ? 'right' : 'left'}]});
  }
  r.addEventListener('input', draw); onRedraw(draw);
})();

/* ---------- 装置 5：格雷欣 ---------- */
(function(){
  const box = $('#gDots'), rd = $('#gRead');
  let S, yr;
  function reset(){ S = []; for (let i = 0; i < 200; i++) S.push(i < 80 ? 'g' : i < 160 ? 'b' : 'e'); S.sort(() => Math.random() - .5); yr = 0; draw(); }
  function draw(){
    box.innerHTML = S.map(s => '<i class="' + (s === 'b' ? 'bad' : s === 'h' ? 'gone' : s === 'e' ? 'gone bad' : '') + '"' + (s === 'e' ? ' style="opacity:0"' : '') + '></i>').join('');
    const g = S.filter(s => s === 'g').length, b = S.filter(s => s === 'b').length, h = S.filter(s => s === 'h').length;
    rd.innerHTML = '第 <b>' + yr + '</b> 年 · 市面流通：好钱 <b>' + g + '</b> 枚，劣钱 <b>' + b + '</b> 枚 · 藏在箱底的好钱 <b>' + h + '</b> 枚（淡色）' + (yr && g === 0 ? '<br>好钱一枚都不流通了。它们没有消失，只是被藏了起来、被熔掉了、被运到了只认重量的外国。' : '');
  }
  $('#gStep').addEventListener('click', () => {
    yr++;
    S = S.map(s => s === 'g' && Math.random() < .4 ? 'h' : s);
    let add = 8; S = S.map(s => (s === 'e' && add-- > 0) ? 'b' : s);
    draw();
  });
  $('#gReset').addEventListener('click', reset); reset();
})();

/* ---------- 装置 6：印钞局 ---------- */
(function(){
  const g = $('#pGrow'), go = $('#pGrowO'), rs = $('#pRes'), ro = $('#pResO'), c = $('#pChart'), rd = $('#pRead');
  let pts = [], timer = null;
  function sim(){
    const gr = +g.value / 100, res = +rs.value / 100;
    let M = 100, G = 100, t = 1; const out = [[0, 100]];
    for (let y = 1; y <= 30; y++) {
      M *= 1 + gr; G *= 1.03;
      const cov = res * 100 / M;
      const ex = (gr - .03) * 100;
      t -= Math.max(0, ex) * .002 + (cov < .1 ? .012 : 0) + (cov < .02 ? .012 : 0);
      if (cov > .2 && ex <= 1) t += .02;
      t = clamp(t, .15, 1);
      const price = (M / G) / Math.pow(t, 1.5);
      out.push([y, 100 / price]);
    }
    return out;
  }
  function draw(){
    chart(c, {x0: 0, x1: 30, y0: .01, y1: 300, log: true, padL: 48,
      yticks: [[.01, '0.01%'], [.1, '0.1%'], [1, '1%'], [10, '10%'], [100, '100%']],
      xticks: [[0, '第0年'], [10, '10'], [20, '20'], [30, '30年']],
      legend: [{label: '一贯纸币的购买力', color: cv('--seal')}],
      series: [{pts: [[0, 100], [30, 100]], color: cv('--rule'), width: 1, dash: [4, 4]}, {pts, color: cv('--seal'), width: 2.5}]});
  }
  function lab(){ go.textContent = g.value + '%'; ro.textContent = rs.value + '%'; }
  function run(){
    clearInterval(timer); const all = sim(); pts = []; let k = 0;
    timer = setInterval(() => {
      pts.push(all[k++]); draw();
      if (k >= all.length) {
        clearInterval(timer); const last = all[all.length - 1][1];
        let v = last > 95 ? '纸币稳稳当当，甚至更值钱了一点。这大概就是交子头几十年的样子。' : last > 50 ? '慢慢在贬值，但还撑得住。很多朝代的纸币都是这样一点点松下去的。' : last > 5 ? '购买力跌去了一大半。拿俸禄和存钱的人最吃亏。' : '纸币几乎成了废纸。大家会想尽办法用别的东西交易，比如白银。';
        rd.innerHTML = '三十年后，一贯纸币的购买力还剩 <b>' + (last < 1 ? last.toPrecision(2) : last.toFixed(0)) + '%</b>，相当于开头的 <b>' + (last * 10 < 10 ? (last * 10).toPrecision(2) : (last * 10).toFixed(0)) + '</b> 文。' + v;
      }
    }, 60);
  }
  [g, rs].forEach(e => e.addEventListener('input', lab));
  $$('[data-press]').forEach(b => b.addEventListener('click', () => { const p = {jiaozi: [3, 28], baochao: [12, 0], war: [8, 28]}[b.dataset.press]; g.value = p[0]; rs.value = p[1]; lab(); run(); }));
  $('#pRun').addEventListener('click', run);
  lab(); onRedraw(draw);
})();

/* ---------- 装置 7：白银之路 ---------- */
(function(){
  const svg = $('#silverMap'), info = $('#smInfo');
  const N = {
    potosi: [230, 300, '波托西', '1545 年发现的“富山”，十六、十七世纪全球白银最重要的产地之一。被强征的印第安矿工在这里付出了巨大的代价。'],
    aca: [150, 190, '阿卡普尔科', '墨西哥太平洋岸的港口，马尼拉大帆船的美洲端。每年一两趟，船上装满白银出发，横渡太平洋。'],
    manila: [800, 248, '马尼拉', '1571 年西班牙人在此建城。美洲白银在这里换中国的丝绸和瓷器，福建商人是最大的贸易伙伴。'],
    china: [762, 182, '月港 · 广州', '1567 年隆庆开关后，月港成为民间出海贸易的合法港口。这里是白银之链的终点：一条鞭法让每个交税的农民都要用银子。'],
    japan: [842, 128, '石见 · 长崎', '日本石见银山在十六、十七世纪之交产量极高。葡萄牙商人把日本白银运到澳门换中国生丝，再卖回日本。'],
    seville: [448, 158, '塞维利亚', '西班牙的白银入口。银子在这里往往停不久：还热那亚银行家的债，付荷兰、英国的货款，给欧洲各地的军队发饷。'],
    ams: [470, 96, '阿姆斯特丹 · 伦敦', '荷兰和英国东印度公司的总部。他们拿美洲白银去亚洲买香料、棉布和茶叶，因为亚洲人对欧洲的货不感兴趣，只认银子。'],
    india: [640, 222, '印度', '莫卧儿帝国是另一个吸收白银的大户。欧洲人拿银子换印度的棉布，再运往非洲、欧洲和美洲。']
  };
  const R = [
    'M230,300 C200,280 160,250 150,190',
    'M150,190 C110,205 50,220 0,230',
    'M900,262 C860,258 830,252 800,248',
    'M800,248 C790,225 778,200 762,182',
    'M230,300 C300,250 380,190 448,158',
    'M448,158 C455,130 462,112 470,96',
    'M470,96 C420,200 470,360 520,368 C580,372 610,300 640,222',
    'M640,222 C690,205 730,190 762,182',
    'M842,128 C815,145 790,165 762,182'
  ];
  let h = '<rect x="0" y="0" width="900" height="430" fill="var(--sea)" opacity=".08"/>';
  for (let x = 0; x <= 900; x += 75) h += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="430" stroke="var(--sea)" stroke-width=".5" opacity=".35"/>';
  for (let y = 0; y <= 430; y += 72) h += '<line x1="0" y1="' + y + '" x2="900" y2="' + y + '" stroke="var(--sea)" stroke-width=".5" opacity=".35"/>';
  [[200, 120, '美 洲'], [470, 55, '欧 洲'], [500, 280, '非 洲'], [700, 110, '亚 洲'], [330, 380, '大 西 洋'], [640, 395, '印 度 洋'], [60, 330, '太平洋 →'], [850, 330, '← 太平洋']].forEach(([x, y, t]) => h += '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="18" fill="var(--ink-3)" opacity=".55" letter-spacing="4">' + t + '</text>');
  h += '<text x="450" y="418" text-anchor="middle" font-size="11.5" fill="var(--ink-3)">地图左右两端在太平洋上相连：大帆船从左边驶出，从右边驶入马尼拉。</text>';
  R.forEach((d, i) => h += '<path id="sr' + i + '" d="' + d + '" fill="none" stroke="var(--silver)" stroke-width="2.4" stroke-dasharray="1 5" stroke-linecap="round"/>');
  h += '<g id="smDots"></g>';
  Object.entries(N).forEach(([k, [x, y, n]]) => h += '<g class="mapnode" data-k="' + k + '" tabindex="0" role="button" aria-label="' + n + '"><circle cx="' + x + '" cy="' + y + '" r="8" fill="var(--card)" stroke="var(--ink)" stroke-width="1.5"/><text x="' + x + '" y="' + (y - 14) + '" text-anchor="middle" font-size="13.5" fill="var(--ink)">' + n + '</text></g>');
  svg.innerHTML = h;
  const paths = R.map((_, i) => $('#sr' + i, svg)), dotsG = $('#smDots', svg);
  let dots = '';
  paths.forEach((p, i) => { for (let k = 0; k < 3; k++) dots += '<circle r="4" data-p="' + i + '" data-o="' + (k / 3) + '" fill="var(--silver)" stroke="var(--ink-2)" stroke-width=".8"/>'; });
  dotsG.innerHTML = dots;
  const dEls = $$('circle', dotsG); const lens = paths.map(p => p.getTotalLength());
  let rev = false, t0 = performance.now(), vis = true;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) requestAnimationFrame(step); }) : null;
  if (io) io.observe(svg);
  function step(now){
    const T = (now - t0) / 4200;
    dEls.forEach(d => { const i = +d.dataset.p; let u = (T + +d.dataset.o) % 1; if (rev) u = 1 - u; const pt = paths[i].getPointAtLength(u * lens[i]); d.setAttribute('cx', pt.x.toFixed(1)); d.setAttribute('cy', pt.y.toFixed(1)); });
    if (vis && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
  function pick(k){ $$('.mapnode', svg).forEach(g => g.classList.toggle('on', g.dataset.k === k)); const n = N[k]; info.innerHTML = '<h5>' + n[2] + '</h5><p>' + n[3] + '</p>'; }
  $$('.mapnode', svg).forEach(g => { g.addEventListener('click', () => pick(g.dataset.k)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(g.dataset.k); } }); });
  function setMode(r){
    rev = r; $('#smSilver').classList.toggle('on', !r); $('#smGoods').classList.toggle('on', r);
    dEls.forEach(d => { d.setAttribute('fill', r ? 'var(--gold)' : 'var(--silver)'); d.setAttribute('r', r ? 5 : 4); });
    paths.forEach(p => p.setAttribute('stroke', r ? 'var(--gold)' : 'var(--silver)'));
    info.innerHTML = r ? '<h5>反方向流动的是货</h5><p>中国的丝绸、瓷器、茶叶，印度的棉布，东南亚的香料，一路往西、往美洲和欧洲去。银子越往东走，换回的货越往西走。</p>' : '<h5>银往东流</h5><p>从玻利维亚的高原出发，两条路最后都通向中国。点一个地点看看。</p>';
  }
  $('#smSilver').addEventListener('click', () => setMode(false));
  $('#smGoods').addEventListener('click', () => setMode(true));
})();

/* ---------- 装置 8：金匠铺 ---------- */
(function(){
  const r = $('#rr'), o = $('#rrO'), svg = $('#rrSvg'), rd = $('#rrRead');
  function draw(){
    const k = +r.value / 100; o.textContent = r.value + '%';
    let h = '', d = 100, tot = 0;
    for (let i = 0; i < 14; i++) {
      const x = 20 + i * 38, bh = d * 1.3, res = d * k * 1.3;
      h += '<rect x="' + x + '" y="' + (150 - bh) + '" width="28" height="' + bh + '" fill="var(--intag)" opacity=".35"/><rect x="' + x + '" y="' + (150 - res) + '" width="28" height="' + res + '" fill="var(--gold)"/>';
      h += '<text x="' + (x + 14) + '" y="165" text-anchor="middle" font-size="10" fill="var(--ink-3)">' + (i + 1) + '</text>';
      tot += d; d *= (1 - k);
    }
    h += '<rect x="400" y="6" width="10" height="10" fill="var(--gold)"/><text x="414" y="15" font-size="11" fill="var(--ink-2)">留作准备金</text><rect x="400" y="22" width="10" height="10" fill="var(--intag)" opacity=".35"/><text x="414" y="31" font-size="11" fill="var(--ink-2)">贷出去，又被存进来</text><text x="20" y="15" font-size="11" fill="var(--ink-3)">第几轮存款 →</text>';
    svg.innerHTML = h;
    const T = 100 / k;
    rd.innerHTML = '最初只有 <b>100</b> 两真金子。一轮轮存了又贷、贷了又存，体系里的存款最终约 <b>' + fmtN(T) + '</b> 两，其中 <b>' + fmtN(T - 100) + '</b> 两是贷款“创造”出来的。准备金比例越低，凭空多出来的钱越多，柜子里的金子相对也越少。';
  }
  r.addEventListener('input', draw); draw();

  const vEl = $('#vault'), bar = $('#vaultBar'), pEl = $('#panicV'), q = $('#queue'), log = $('#runLog');
  const bS = $('#runStart'), bN = $('#runNotice'), bW = $('#runSlow'), bL = $('#runLolr');
  let st = null, tm = null;
  function L(t){ log.insertAdjacentHTML('afterbegin', '<div>' + t + '</div>'); }
  function show(){
    vEl.textContent = st.vault + ' 两'; bar.style.width = clamp(st.vault / st.v0 * 100, 0, 100) + '%';
    bar.style.background = st.vault < 20 ? 'var(--seal)' : 'var(--intag)';
    pEl.textContent = Math.round(st.panic);
    q.innerHTML = '🧍'.repeat(st.line) + '<span style="opacity:.35">' + '🧍'.repeat(Math.max(st.left - st.line, 0)) + '</span>';
  }
  function init(){
    clearInterval(tm); log.innerHTML = '';
    const v = Math.max(10, Math.round(200 * +r.value / 100 / 10) * 10);
    st = {vault: v, v0: v, panic: 0, left: 20, line: 0, slow: 0, lolr: false, quiet: 0, on: false};
    [bN, bW, bL].forEach(b => b.disabled = true); bS.disabled = false; show();
    L('二十位储户，每人存了 10 两，共 200 两。按 ' + r.value + '% 的准备金，柜子里实际只有 ' + v + ' 两，其余都借出去了。');
  }
  function end(t){ clearInterval(tm); st.on = false; [bN, bW, bL].forEach(b => b.disabled = true); L('<b>' + t + '</b>'); }
  function tickRun(){
    let n = 0;
    for (let i = 0; i < st.left; i++) if (Math.random() < st.panic / 100 * .22) n++;
    if (st.slow > 0) { n = Math.min(n, 1); st.slow--; }
    st.line = n;
    for (let i = 0; i < n; i++) {
      if (st.vault < 10) { show(); end('柜子空了，还有人没取到钱。铺子倒了。' + (st.lolr ? '' : '没有人能借钱给你。')); return; }
      st.vault -= 10; st.left--;
    }
    if (n > 0) { st.panic = clamp(st.panic + 4 + n * 2, 0, 100); st.quiet = 0; L('有 ' + n + ' 人取走了钱。门口的队伍让更多人紧张起来。'); }
    else { st.panic = clamp(st.panic - 12, 0, 100); st.quiet++; }
    show();
    if (st.left === 0) { end('所有储户都把钱取走了，而你居然一直兑付到最后。你的准备金够多。可这也意味着你几乎没放出多少贷款，没赚到什么钱。'); return; }
    if (st.panic <= 0 && st.quiet >= 2) end('风波平息了。大家发现钱确实取得出来，就不急着取了。挤兑的解药，从来就是“随时都能取”。');
  }
  bS.addEventListener('click', () => {
    if (st.on) return; st.on = true; st.panic = 35; bS.disabled = true; [bN, bW, bL].forEach(b => b.disabled = false);
    L('街上有人说你的铺子要倒了。恐慌程度 35。'); show(); tm = setInterval(tickRun, 1500);
  });
  bN.addEventListener('click', () => { st.panic = clamp(st.panic + 22, 0, 100); bN.disabled = true; L('你贴出告示：“本号一切正常，请勿听信谣言。”本来没听说的人，现在也都听说了。恐慌 +22。'); show(); });
  bW.addEventListener('click', () => { st.slow = 3; st.panic = clamp(st.panic + 8, 0, 100); bW.disabled = true; L('你只开一个窗口，慢慢数钱，拖住了三轮。队伍排得更长，看着更吓人。这是历史上银行家常用的拖延术。'); show(); });
  bL.addEventListener('click', () => { st.vault += 120; st.v0 = Math.max(st.v0, st.vault); st.panic = clamp(st.panic - 40, 0, 100); st.lolr = true; bL.disabled = true; L('中央银行以你的贷款作抵押，借给你 120 两。英格兰银行在十九世纪逐渐担起了这个“最后贷款人”的角色：看见柜台上堆着钱，大家就不急着取了。恐慌 −40。'); show(); });
  $('#runReset').addEventListener('click', init);
  r.addEventListener('change', () => { if (!st.on) init(); });
  init();
})();

/* ---------- 装置 9：交易所 ---------- */
(function(){
  const c = $('#bChart'), news = $('#bNews'), pE = $('#bPrice'), cE = $('#bCash'), wE = $('#bWorth'), res = $('#bResult');
  const bO = $('#bOpen'), bB = $('#bBuy'), bS = $('#bSell');
  const NEWS = {
    calm: ['好望角公司拿到了一纸王家特许状。', '有人说远洋那边遍地是香料。', '咖啡馆里有几位商人在谈这家公司。'],
    rise: ['股价又涨了，咖啡馆里人人在谈。', '公司宣布再发新股，认购的人排到了街角。', '据说连某位大科学家也买了。', '银行愿意借钱给你买股票，用股票本身作抵押。'],
    mania: ['你的鞋匠告诉你，他把铺子抵押了去买股。', '报上说：这一次不一样，新航线将永远改变世界。', '有人成立了一家新公司，用途保密，半天募满。', '马车夫在问哪天还能再发新股。'],
    pre: ['几位董事悄悄卖出了一些股票。', '公司的船还没回来。', '股价涨得慢了一点。'],
    crash: ['有人想卖，没人接。', '银行要求追加抵押，否则强行平仓。', '议会宣布成立调查委员会。', '咖啡馆里没人说话。'],
    after: ['街上安静了。', '公司的船回来了，舱里没什么货。', '报上开始讨论“人性的贪婪”。']
  };
  let S = null, tm = null;
  function pickN(k){ const a = NEWS[k]; return a[Math.floor(Math.random() * a.length)]; }
  function draw(){
    const pts = S ? S.hist.map((p, i) => [i, p]) : [[0, 100]];
    const mx = Math.max(200, ...pts.map(p => p[1])) * 1.1;
    const marks = S ? S.trades.map(t => ({x: t.i, y: t.p, color: t.buy ? cv('--intag') : cv('--seal'), r: 5})) : [];
    chart(c, {x0: 0, x1: 40, y0: 0, y1: mx, padL: 44,
      yticks: [0, .25, .5, .75, 1].map(f => [mx * f / 1.1, fmtN(mx * f / 1.1)]),
      xticks: [[0, '开市'], [20, '20'], [40, '收市']],
      series: [{pts, color: cv('--ink'), width: 2}], marks});
  }
  function upd(){ const w = S.cash + S.sh * S.p; pE.textContent = fmtN(S.p); cE.textContent = fmtN(S.cash); wE.textContent = fmtN(w); bB.disabled = !S.on || S.cash < 1; bS.disabled = !S.on || S.sh <= 0; }
  function step(){
    const t = ++S.t;
    if (t < S.crash) {
      const ph = t / S.crash, dr = ph < .2 ? .01 : ph < .55 ? .045 : .085;
      S.p *= 1 + dr + rnd(-.035, .035);
      if (t === S.crash - 2 || t === S.crash - 1) { S.p *= rnd(.97, 1.01); news.textContent = pickN('pre'); }
      else news.textContent = pickN(ph < .2 ? 'calm' : ph < .55 ? 'rise' : 'mania');
    } else if (t < S.crash + 4) { S.p *= rnd(.58, .75); news.textContent = pickN('crash'); }
    else { S.p *= rnd(.94, 1.04); news.textContent = pickN('after'); }
    S.p = Math.max(S.p, 8); S.peak = Math.max(S.peak, S.p); S.hist.push(S.p); upd(); draw();
    if (t >= 40) finish();
  }
  function finish(){
    clearInterval(tm); S.on = false; upd();
    const w = S.cash + S.sh * S.p, best = 1000 * S.peak / 100;
    let v;
    if (!S.trades.length) v = '你一直没进场。看着别人赚钱的那几十秒很难熬，但你的 1000 两原封不动。在一场泡沫里，这已经胜过了大多数人。';
    else if (w > 3000) v = '你先跑了，赚了 ' + (w / 1000).toFixed(1) + ' 倍。请诚实地回答自己：是因为判断，还是因为运气？下一局再试一次看看。';
    else if (w >= 1000) v = '赚了一点，但离最高点很远。这很正常：在泡沫里，最后一块钱永远留给别人赚。';
    else v = '你亏了。你和 1720 年的很多人一样，在别人都在买的时候买，在别人都在卖的时候卖不掉。';
    res.innerHTML = '收市。你的总值 <b>' + fmtN(w) + '</b> 两。如果在开盘买进、恰好在最高点卖出，能有 <b>' + fmtN(best) + '</b> 两，可惜没人知道哪一刻是最高点。<br>' + v;
    bO.disabled = false; bO.textContent = '再来一局';
  }
  bO.addEventListener('click', () => {
    clearInterval(tm);
    S = {t: 0, p: 100, cash: 1000, sh: 0, hist: [100], trades: [], crash: Math.floor(rnd(20, 33)), peak: 100, on: true};
    res.textContent = ''; bO.disabled = true; news.textContent = '开市了。'; upd(); draw();
    tm = setInterval(step, 600);
  });
  bB.addEventListener('click', () => { if (!S || !S.on || S.cash < 1) return; S.sh += S.cash / S.p; S.cash = 0; S.trades.push({i: S.t, p: S.p, buy: true}); upd(); draw(); });
  bS.addEventListener('click', () => { if (!S || !S.on || S.sh <= 0) return; S.cash += S.sh * S.p; S.sh = 0; S.trades.push({i: S.t, p: S.p, buy: false}); upd(); draw(); });
  onRedraw(draw);
})();

/* ---------- 装置 10：马克 ---------- */
(function(){
  const D = [
    ['1914.7', 4.2, '一战爆发前，一美元约换 4.2 马克。'],
    ['1919.1', 8.9, '战败。'],
    ['1919.12', 47, '《凡尔赛和约》签订之后。'],
    ['1920.6', 39, '一度回稳，很多人以为最坏的时候过去了。'],
    ['1921.6', 75, '赔款开始支付。'],
    ['1921.12', 190, ''],
    ['1922.6', 320, '外交部长拉特瑙遇刺，人们对政府的信心开始崩塌。'],
    ['1922.8', 1135, ''],
    ['1922.12', 7600, '柏林一个面包约 160 马克。'],
    ['1923.1', 17972, '法国和比利时出兵占领鲁尔区，政府印钱给罢工工人发工资。'],
    ['1923.4', 24457, ''],
    ['1923.6', 109996, ''],
    ['1923.7', 353412, '工资开始一天发两次。'],
    ['1923.8', 4620455, ''],
    ['1923.9', 98860000, '一个面包约 150 万马克。'],
    ['1923.11', 4.2e12, '一个面包约 2000 亿马克。11 月 15 日起发行地租马克，一换一万亿，通胀几乎立刻止住。']
  ];
  const r = $('#wR'), o = $('#wO'), num = $('#wNum'), lab = $('#wLabel'), note = $('#wNote'), c = $('#wChart');
  function cn(n){ if (n >= 1e12) return (n / 1e12).toFixed(1) + ' 万亿'; if (n >= 1e8) return (n / 1e8).toFixed(1) + ' 亿'; if (n >= 1e4) return (n / 1e4).toFixed(1) + ' 万'; return String(n); }
  function draw(){
    const i = +r.value, d = D[i];
    o.textContent = d[0];
    num.textContent = d[1] < 100 ? String(d[1]) : fmtN(d[1]);
    lab.innerHTML = '一美元 = <b>' + cn(d[1]) + '</b> 纸马克 · 数字长度 <b>' + String(Math.round(d[1])).length + '</b> 位';
    note.textContent = d[2];
    chart(c, {x0: 0, x1: 15, y0: 1, y1: 1e13, log: true, padL: 52,
      yticks: [[1, '1'], [1e3, '千'], [1e6, '百万'], [1e9, '十亿'], [1e12, '万亿']],
      xticks: [[0, '1914'], [2, '1919'], [5, '1921'], [8, '1922'], [12, '1923.7'], [15, '1923.11']],
      series: [{pts: D.slice(0, i + 1).map((d, k) => [k, d[1]]), color: cv('--seal'), width: 2.5, dots: true}, {pts: D.slice(i).map((d, k) => [k + i, d[1]]), color: cv('--rule'), width: 1, dash: [3, 4]}],
      marks: [{x: i, y: d[1], color: cv('--seal'), r: 6}]});
  }
  let tm = null;
  $('#wPlay').addEventListener('click', () => { clearInterval(tm); r.value = 0; draw(); tm = setInterval(() => { if (+r.value >= 15) { clearInterval(tm); return; } r.value = +r.value + 1; draw(); }, 700); });
  r.addEventListener('input', () => { clearInterval(tm); draw(); });
  onRedraw(draw);
})();

/* ---------- 装置 11：央行行长 ---------- */
(function(){
  const EV = [
    {y: 1973, t: '石油危机：中东战争爆发，油价翻了几番。', dpi: 4, dg: -1},
    {y: 1979, t: '通胀已经成了习惯，工会要求涨工资，商家年年提价，大家都预期明年还会涨。', dpi: 2, dg: 0},
    {y: 1987, t: '“黑色星期一”：股市一天暴跌两成。', dpi: 0, dg: -1.5},
    {y: 1999, t: '互联网热潮，股市和投资都很火，人人都在谈“新经济”。', dpi: .5, dg: 2},
    {y: 2001, t: '互联网泡沫破裂，科技股跌去大半。', dpi: -.5, dg: -2.5},
    {y: 2008, t: '雷曼兄弟倒闭，全球金融危机。利率降到零也许还不够。', dpi: -1, dg: -5, qe: 1},
    {y: 2020, t: '疫情来了，整个经济突然停摆。', dpi: -1, dg: -6, qe: 1},
    {y: 2021, t: '大规模补贴之后，需求回来了，供应链却还堵着。', dpi: 4, dg: 2}
  ];
  const rate = $('#cbRate'), ro = $('#cbRateO'), ev = $('#cbEvent'), log = $('#cbLog'), c = $('#cbChart');
  const bS = $('#cbStart'), bN = $('#cbNext'), bQ = $('#cbQE');
  let S = null;
  function draw(){
    const pi = S ? S.hist.map((h, i) => [i, h[0]]) : [[0, 2]], un = S ? S.hist.map((h, i) => [i, h[1]]) : [[0, 5]];
    chart(c, {x0: 0, x1: 8, y0: -4, y1: 16, padL: 40,
      yticks: [[-4, '-4%'], [0, '0%'], [2, '2%'], [5, '5%'], [10, '10%'], [15, '15%']],
      xticks: [[0, '上任'], ...EV.map((e, i) => [i + 1, String(e.y)])],
      bands: [{from: 1.5, to: 2.5, color: cv('--seal'), alpha: .12}],
      legend: [{label: '通胀率', color: cv('--seal')}, {label: '失业率', color: cv('--intag')}],
      series: [{pts: pi, color: cv('--seal'), width: 2.5, dots: true}, {pts: un, color: cv('--intag'), width: 2.5, dots: true}]});
  }
  function stat(){ $('#cbInf').textContent = S.pi.toFixed(1) + '%'; $('#cbUne').textContent = S.u.toFixed(1) + '%'; }
  function showEv(){ const e = EV[S.k]; ev.innerHTML = '<b>' + e.y + '</b> · ' + e.t; bQ.disabled = !e.qe; S.qe = false; bQ.classList.remove('on'); }
  rate.addEventListener('input', () => ro.textContent = (+rate.value).toFixed(1) + '%');
  bS.addEventListener('click', () => {
    S = {pi: 2, u: 5, k: 0, hist: [[2, 5]], pen: 0, qe: false}; log.innerHTML = ''; rate.disabled = false; bN.disabled = false; bS.disabled = true;
    $('#cbScore').textContent = '—'; stat(); showEv(); draw();
  });
  bQ.addEventListener('click', () => { S.qe = !S.qe; bQ.classList.toggle('on', S.qe); });
  bN.addEventListener('click', () => {
    const e = EV[S.k], i = +rate.value;
    const gap = clamp(-0.6 * ((i - S.pi) - 1.5) + e.dg + (S.qe ? 2 : 0), -8, 6);
    S.pi = clamp(S.pi + 0.35 * gap + e.dpi + (S.qe ? .3 : 0), -3, 18);
    S.u = clamp(5 - 0.55 * gap, 2.5, 15);
    S.hist.push([S.pi, S.u]);
    const pen = Math.abs(S.pi - 2) + 0.7 * Math.abs(S.u - 5); S.pen += pen;
    let cm = pen < 1.5 ? '不错，两头都照顾到了。' : S.pi > 6 ? '物价涨得厉害，拿工资和存款的人在骂你。' : S.u > 8 ? '失业的人太多了，街上有人在游行。' : S.pi < 0 ? '物价在跌，听起来是好事，其实大家都不敢花钱了。' : '还过得去，但不算理想。';
    log.insertAdjacentHTML('afterbegin', '<div><b>' + e.y + '</b> 利率 ' + i.toFixed(1) + '%' + (S.qe ? ' + 量化宽松' : '') + ' → 通胀 ' + S.pi.toFixed(1) + '%，失业 ' + S.u.toFixed(1) + '%。' + cm + '</div>');
    stat(); draw(); S.k++;
    if (S.k >= EV.length) {
      const sc = Math.max(0, Math.round(100 - S.pen * 3)); $('#cbScore').textContent = sc;
      const v = sc >= 75 ? '钱师爷：“大人，您可以考虑连任了。不过请记住，真实世界里您看不到下一年发生什么。”' : sc >= 45 ? '钱师爷：“大人表现稳健。报纸会批评您，但历史会说您尽力了。”' : '钱师爷：“大人，我们可以说这八年‘充满挑战’。另外，沃尔克当年也被骂得很惨。”';
      ev.innerHTML = '任期结束，得分 <b>' + sc + '</b>。' + v; rate.disabled = true; bN.disabled = true; bQ.disabled = true; bS.disabled = false; bS.textContent = '再干一任';
    } else showEv();
  });
  onRedraw(draw);
})();

/* ---------- 装置 12：复利 ---------- */
(function(){
  const I = {m: $('#cMon'), n: $('#cYrs'), r: $('#cRet'), f: $('#cInf')}, c = $('#cChart'), rd = $('#cRead');
  function draw(){
    const m = +I.m.value, n = +I.n.value, r = +I.r.value / 100, f = +I.f.value / 100;
    $('#cMonO').textContent = m + ' 元'; $('#cYrsO').textContent = n + ' 年'; $('#cRetO').textContent = I.r.value + '%'; $('#cInfO').textContent = I.f.value + '%';
    let b = 0; const nom = [[0, 0]], real = [[0, 0]], pr = [[0, 0]];
    for (let mo = 1; mo <= n * 12; mo++) { b = b * (1 + r / 12) + m; if (mo % 12 === 0) { const y = mo / 12; nom.push([y, b]); real.push([y, b / Math.pow(1 + f, y)]); pr.push([y, m * 12 * y]); } }
    const mx = Math.max(b, 1) * 1.08, w = v => v >= 1e4 ? (v / 1e4).toFixed(v >= 1e6 ? 0 : 1) + '万' : fmtN(v);
    chart(c, {x0: 0, x1: n, y0: 0, y1: mx, padL: 52,
      yticks: [0, .25, .5, .75, 1].map(k => [mx / 1.08 * k, w(mx / 1.08 * k)]),
      xticks: [[0, '0'], [Math.round(n / 2), Math.round(n / 2) + '年'], [n, n + '年']],
      legend: [{label: '账面', color: cv('--ink')}, {label: '折合今天', color: cv('--intag')}, {label: '本金', color: cv('--ink-3')}],
      series: [{pts: pr, color: cv('--ink-3'), width: 1.5, dash: [4, 4]}, {pts: real, color: cv('--intag'), width: 2.5}, {pts: nom, color: cv('--ink'), width: 2.5}]});
    const P = m * 12 * n, R = b / Math.pow(1 + f, n);
    rd.innerHTML = n + ' 年后，账面上有 <b>' + fmtN(b) + '</b> 元，你一共存进去 <b>' + fmtN(P) + '</b> 元，其中 <b>' + fmtN(b - P) + '</b> 元是利息生的。扣掉通胀，它大约相当于今天的 <b>' + fmtN(R) + '</b> 元。' +
      (r > 0 ? '按 72 法则，年收益 ' + I.r.value + '% 时钱大约每 ' + (72 / (r * 100)).toFixed(0) + ' 年翻一倍' : '没有收益，钱只会被通胀慢慢吃掉') + (f > 0 ? '；年通胀 ' + I.f.value + '% 时，床底下的现金大约每 ' + (72 / (f * 100)).toFixed(0) + ' 年购买力减半。' : '。');
  }
  Object.values(I).forEach(e => e.addEventListener('input', draw)); onRedraw(draw);
})();

/* ---------- 装置 13：小测试 ---------- */
(function(){
  const Q = [
    {t: '第一题：你可以选——', a: 'A. 直接拿走 500 元。', b: 'B. 抛一枚硬币：正面拿 1000 元，反面什么也拿不到。'},
    {t: '第二题：你先拿到了 1000 元。然后你必须选——', a: 'A. 直接退回 500 元。', b: 'B. 抛一枚硬币：正面要退回全部 1000 元，反面一分不用退。'}
  ];
  const box = $('#qBox'), rd = $('#qRead'), ans = [null, null];
  box.innerHTML = Q.map((q, i) => '<p class="ni" style="margin:10px 0 4px">' + q.t + '</p><button class="opt" data-q="' + i + '" data-v="a">' + q.a + '</button><button class="opt" data-q="' + i + '" data-v="b">' + q.b + '</button>').join('');
  box.addEventListener('click', e => {
    const b = e.target.closest('.opt'); if (!b) return;
    const i = +b.dataset.q; ans[i] = b.dataset.v;
    $$('.opt[data-q="' + i + '"]', box).forEach(x => x.classList.toggle('pick', x === b));
    if (ans[0] && ans[1]) {
      const typ = ans[0] === 'a' && ans[1] === 'b';
      rd.innerHTML = '仔细看：两道题的<b>最终结果完全一样</b>。选 A，你最后都确定拿到 500 元；选 B，你最后都是一半机会拿 1000 元、一半机会拿 0 元。' +
        (typ ? '<br>你第一题选了稳的 A，第二题选了赌一把的 B。大多数人都和你一样：<b>面对收益时求稳，面对损失时冒险</b>。同一件事，换个说法，人就变了。这就是前景理论。' : ans[0] === ans[1] ? '<br>你两题选得一致，说明你没被说法带着走，这比大多数人强。很多人会第一题选 A、第二题选 B：面对收益求稳，面对损失冒险。' : '<br>你第一题赌、第二题求稳，和大多数人恰好相反。很多人会第一题选 A、第二题选 B：面对收益求稳，面对损失冒险。');
    }
  });
})();

/* ---------- 装置 14：押韵的历史 ---------- */
(function(){
  const E = $$('.echo').map((el, k) => { el.id = el.id || 'echo-' + k; const ps = $$('p', el); const PM = {'印钞': '稀释', '剪边': '稀释', '限价': '限价', '泡沫': '泡沫', '挤兑': '挤兑', '赦债': '赦免', '债': '赦免', '白银': '白银之链'}; return {id: el.id, y: +el.dataset.year, pat: PM[el.dataset.pat] || '钱的形态', kind: el.dataset.k, place: el.dataset.place, title: el.dataset.title, ry: ($('.ry', el) || {}).textContent || '', text: ps.slice(1).map(p => p.textContent).join(' ')}; }).sort((a, b) => a.y - b.y);
  const B = [[-3000, 40], [0, 250], [1000, 380], [1500, 470], [1800, 640], [1950, 780], [2026, 870]];
  const X = y => { for (let i = 1; i < B.length; i++) if (y <= B[i][0]) { const [a, xa] = B[i - 1], [b, xb] = B[i]; return xa + (y - a) / (b - a) * (xb - xa); } return 870; };
  const col = {'轮回': 'var(--seal)', '讽刺': 'var(--intag)', '存疑': 'var(--ink-3)', '联系': 'var(--sea)', '生活': 'var(--gold)'};
  const svg = $('#tlSvg'), card = $('#tlCard'), F = $('#tlF');
  const pats = [...new Set(E.map(e => e.pat))];
  let cur = 'all';
  F.innerHTML = '<button class="btn on" data-f="all">全部 ' + E.length + '</button>' + pats.map(p => '<button class="btn" data-f="' + p + '">' + p + ' ' + E.filter(e => e.pat === p).length + '</button>').join('');
  function draw(){
    let h = '<line x1="30" y1="150" x2="880" y2="150" stroke="var(--rule)" stroke-width="1.5"/>';
    B.forEach(([y, x]) => h += '<line x1="' + x + '" y1="146" x2="' + x + '" y2="154" stroke="var(--ink-3)"/><text x="' + x + '" y="172" text-anchor="middle" font-size="11" fill="var(--ink-3)" font-family="IBM Plex Mono,monospace">' + (y < 0 ? '前' + (-y) : y) + '</text>');
    const used = [];
    E.forEach((e, k) => {
      const x = X(e.y); let lv = 0; while (used.some(u => u.lv === lv && Math.abs(u.x - x) < 15)) lv++; used.push({x, lv});
      const on = cur === 'all' || e.pat === cur, yy = 132 - lv * 17;
      h += '<g class="mapnode" data-k="' + k + '" tabindex="0" role="button" aria-label="' + e.title + '" opacity="' + (on ? 1 : .12) + '"><line x1="' + x + '" y1="150" x2="' + x + '" y2="' + yy + '" stroke="var(--rule)"/><circle cx="' + x + '" cy="' + yy + '" r="6.5" fill="' + col[e.kind] + '" stroke="var(--card)" stroke-width="1.5"/></g>';
    });
    Object.entries(col).forEach(([k, c], i) => h += '<circle cx="' + (40 + i * 70) + '" cy="14" r="5" fill="' + c + '"/><text x="' + (49 + i * 70) + '" y="18" font-size="12" fill="var(--ink-2)">' + k + '</text>');
    svg.innerHTML = h;
    $$('.mapnode', svg).forEach(g => { const f = () => pick(+g.dataset.k); g.addEventListener('click', f); g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); f(); } }); });
  }
  function pick(k){
    const e = E[k];
    card.innerHTML = '<p class="k">' + e.ry + ' · <span style="color:' + col[e.kind] + '">' + e.kind + '</span> · 韵脚「' + e.pat + '」</p><p><b>' + e.title + '</b></p><p style="font-size:14.5px;color:var(--ink-2)">' + e.text + '</p><p><a href="#' + e.id + '">跳过去 →</a></p>';
  }
  F.addEventListener('click', ev => { const b = ev.target.closest('[data-f]'); if (!b) return; cur = b.dataset.f; $$('[data-f]', F).forEach(x => x.classList.toggle('on', x === b)); draw(); const first = E.findIndex(e => cur === 'all' || e.pat === cur); if (first >= 0) pick(first); });
  draw();
})();

})();
