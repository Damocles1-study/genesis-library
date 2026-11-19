(function(){
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
const pad = n => String(n).padStart(2, '0');
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const ZHI = '子丑寅卯辰巳午未申酉戌亥';
const CHAP = ['接缝', '更漏', '星钟', '点卯', '钟声', '打卡', '日影', '铁轨', '经度', '闰月', '十天', '纪元'];
const NS = 'http://www.w3.org/2000/svg';
const btnRow = (box, items, cur, cb) => {
  box.innerHTML = items.map((t, i) => '<button class="btn' + (i === cur ? ' on' : '') + '" data-i="' + i + '">' + t + '</button>').join('');
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', box).forEach(x => x.classList.toggle('on', x === b)); cb(+b.dataset.i); });
};
// 只在看得见时跑动画
function onVisible(el, start, stop){
  if (!('IntersectionObserver' in window)) { start(); return; }
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), {rootMargin: '80px'}).observe(el);
}
// 天文近似
const decl = N => 23.44 * Math.sin(2 * Math.PI * (284 + N) / 365);              // 太阳赤纬（度），N = 1..365
function hourAngle(lat, N, alt){                                                    // 太阳到达某高度时的时角（度）
  const p = rad(lat), d = rad(decl(N));
  const c = (Math.sin(rad(alt)) - Math.sin(p) * Math.sin(d)) / (Math.cos(p) * Math.cos(d));
  return deg(Math.acos(clamp(c, -1, 1)));
}
const dayLen = (lat, N) => 2 * hourAngle(lat, N, -0.833) / 15;                        // 白昼长（小时）
const eot = N => { const B = 2 * Math.PI * (N - 81) / 364; return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); }; // 均时差（分），正 = 太阳比钟快
const dateLabel = N => { const d = new Date(2025, 0, N); return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日'; };
const hm = h => { h = ((h % 24) + 24) % 24; let H = Math.floor(h), M = Math.round((h - H) * 60); if (M === 60) { H = (H + 1) % 24; M = 0; } return pad(H) + ':' + pad(M); };
const pol = (cx, cy, r, a) => [cx + r * Math.sin(rad(a)), cy - r * Math.cos(rad(a))];
function sector(cx, cy, r0, r1, a0, a1){
  const [x0, y0] = pol(cx, cy, r1, a0), [x1, y1] = pol(cx, cy, r1, a1), [x2, y2] = pol(cx, cy, r0, a1), [x3, y3] = pol(cx, cy, r0, a0);
  const lg = (a1 - a0) > 180 ? 1 : 0;
  return 'M' + x0.toFixed(2) + ',' + y0.toFixed(2) + ' A' + r1 + ',' + r1 + ' 0 ' + lg + ' 1 ' + x1.toFixed(2) + ',' + y1.toFixed(2) + ' L' + x2.toFixed(2) + ',' + y2.toFixed(2) + ' A' + r0 + ',' + r0 + ' 0 ' + lg + ' 0 ' + x3.toFixed(2) + ',' + y3.toFixed(2) + ' Z';
}

/* ---------- 页眉：卷名、进度、目录 ---------- */
const barVol = $('#barVol'), prog = $('#prog');
const vols = $$('[data-vol]');
let tick = false;
function onScroll(){
  tick = false;
  const lim = innerHeight * 0.35; let cur = null;
  for (const e of vols) { if (e.getBoundingClientRect().top < lim) cur = e; else break; }
  barVol.textContent = cur ? cur.dataset.vol : '序';
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

/* ---------- 钟面 ---------- */
function dialMarkup(S, h, opt){
  opt = opt || {};
  const c = S / 2, r1 = S * 0.46, r0 = S * (opt.big ? 0.27 : 0.25);
  let s = '<circle cx="' + c + '" cy="' + c + '" r="' + (r1 + S * 0.02) + '" fill="var(--card)" stroke="var(--ink-3)" stroke-width="' + (S / 120) + '"/>';
  for (let i = 0; i < 12; i++) {
    const on = opt.all || i === h;
    s += '<path class="sec" data-h="' + i + '" d="' + sector(c, c, r0, r1, i * 30 - 15, i * 30 + 15) + '" fill="' + (on ? 'var(--vermil)' : 'transparent') + '" fill-opacity="' + (opt.all ? 0.12 : on ? 0.85 : 0) + '" stroke="var(--rule)" stroke-width="' + (S / 200) + '"' + (opt.big ? ' style="cursor:pointer"' : '') + '><title>' + ZHI[i] + '时 · ' + CHAP[i] + '</title></path>';
    const [x, y] = pol(c, c, (r0 + r1) / 2, i * 30);
    s += '<text x="' + x.toFixed(1) + '" y="' + (y + S * 0.035).toFixed(1) + '" text-anchor="middle" font-size="' + (S * (opt.big ? 0.085 : 0.1)) + '" fill="' + (i === h && !opt.all ? 'var(--paper)' : 'var(--ink)') + '" style="font-family:var(--f-display);pointer-events:none">' + ZHI[i] + '</text>';
  }
  if (opt.big) {
    for (let i = 0; i < 24; i++) {
      const [x0, y0] = pol(c, c, r0 - S * 0.015, i * 15), [x1, y1] = pol(c, c, r0 - S * (i % 6 ? 0.035 : 0.06), i * 15);
      s += '<line x1="' + x0.toFixed(1) + '" y1="' + y0.toFixed(1) + '" x2="' + x1.toFixed(1) + '" y2="' + y1.toFixed(1) + '" stroke="var(--ink-3)" stroke-width="1.2"/>';
      if (i % 3 === 0) { const [x, y] = pol(c, c, r0 - S * 0.1, i * 15); s += '<text x="' + x.toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="middle" font-size="11" fill="var(--ink-3)" class="mono" style="font-family:var(--f-mono)">' + i + '</text>'; }
    }
  }
  if (opt.hand != null) {
    const [x, y] = pol(c, c, r1 - S * 0.02, opt.hand * 15);
    s += '<line x1="' + c + '" y1="' + c + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="var(--night)" stroke-width="' + (S / 60) + '" stroke-linecap="round"/><circle cx="' + c + '" cy="' + c + '" r="' + (S / 40) + '" fill="var(--night)"/>';
  }
  return s;
}
$$('svg.dial').forEach(svg => {
  const h = +svg.dataset.h, full = !!svg.dataset.full;
  svg.innerHTML = dialMarkup(120, h, full ? {all: true, hand: 23} : {hand: (23 + h * 2 + 1) % 24});
});

// 装置 0：封面的钟
(function(){
  const svg = $('#dial0'); if (!svg) return;
  const T = $('#dial0T'), R = $('#dial0R');
  const KE = ['初刻', '一刻', '二刻', '三刻'];
  const GENG = {19: '一更', 20: '一更', 21: '二更', 22: '二更', 23: '三更', 0: '三更', 1: '四更', 2: '四更', 3: '五更', 4: '五更'};
  function draw(){
    const d = new Date(), H = d.getHours(), M = d.getMinutes();
    const h = Math.floor(((H + 1) % 24) / 2);
    svg.innerHTML = dialMarkup(300, h, {big: true, hand: H + M / 60});
    T.textContent = pad(H) + ':' + pad(M);
    const bk = Math.floor((H * 60 + M) / 14.4) + 1;
    R.innerHTML = '现在是<b>' + ZHI[h] + (H % 2 ? '初' : '正') + KE[Math.floor(M / 15)] + '</b>' + (GENG[H] ? '，' + GENG[H] : '') + '；按汉代的百刻制，是一天里的第 ' + bk + ' 刻。<br>正好读第 ' + (h + 1) + ' 章 <a href="#c' + (h + 1) + '">' + ZHI[h] + ' · ' + CHAP[h] + '</a>。点钟面上任何一个时辰，也能跳过去。';
  }
  draw(); setInterval(draw, 20000);
  svg.addEventListener('click', e => { const p = e.target.closest('.sec'); if (p) location.hash = '#c' + (+p.dataset.h + 1); });
})();

// 卷首小画
$$('svg.arc').forEach(svg => {
  const v = +svg.dataset.v;
  let s = '<path d="M10,100 H190" stroke="var(--ink-3)" stroke-width="1.5"/>';
  const star = (x, y, r) => '<path d="M' + x + ',' + (y - r) + ' L' + (x + r * .3) + ',' + (y - r * .3) + ' L' + (x + r) + ',' + y + ' L' + (x + r * .3) + ',' + (y + r * .3) + ' L' + x + ',' + (y + r) + ' L' + (x - r * .3) + ',' + (y + r * .3) + ' L' + (x - r) + ',' + y + ' L' + (x - r * .3) + ',' + (y - r * .3) + ' Z" fill="var(--brass)"/>';
  if (v === 0) s += '<path d="M120,22 a24,24 0 1,0 22,34 a19,19 0 1,1 -22,-34 Z" fill="var(--night)" opacity=".85"/>' + star(40, 30, 5) + star(70, 60, 3.5) + star(160, 40, 4) + star(178, 78, 3) + star(30, 76, 3);
  if (v === 1) { s += '<path d="M60,100 a40,40 0 0,1 80,0 Z" fill="var(--brass)" opacity=".75"/>'; for (let i = 0; i < 7; i++) { const a = -90 + i * 30, [x0, y0] = [100 + 48 * Math.cos(rad(a)), 100 + 48 * Math.sin(rad(a))], [x1, y1] = [100 + 62 * Math.cos(rad(a)), 100 + 62 * Math.sin(rad(a))]; if (y1 < 100) s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="var(--brass)" stroke-width="3" stroke-linecap="round"/>'; } }
  if (v === 2) s += '<circle cx="100" cy="28" r="18" fill="var(--brass)" opacity=".8"/><path d="M70,100 V64" stroke="var(--ink-2)" stroke-width="4"/><path d="M70,100 H82" stroke="var(--ink-2)" stroke-width="6" opacity=".4"/>';
  if (v === 3) s += '<path d="M128,100 a26,26 0 0,1 52,0 Z" fill="var(--vermil)" opacity=".7"/><path d="M52,26 a20,20 0 1,0 18,28 a16,16 0 1,1 -18,-28 Z" fill="var(--night)" opacity=".8"/>' + star(100, 40, 3.5);
  svg.innerHTML = s;
});

/* ---------- 装置 1：今天是星期几 ---------- */
(function(){
  const rng = $('#dayT'); if (!rng) return;
  const NAMES = ['周六', '周日', '周一', '周二', '周三', '周四'];
  const C = [
    {n: '半夜', s: '罗马官方 · 今天', b: 0, k: 0},
    {n: '日出', s: '巴比伦', b: 6, k: 0},
    {n: '日落', s: '雅典 · 犹太 · 伊斯兰', b: 18, k: 1},
    {n: '正午', s: '1925 年前的天文学家', b: 12, k: 0},
    {n: '子初', s: '中国古代（子时为一日之始）', b: 23, k: 1}
  ];
  const nm = i => NAMES[i + 2];
  $('#dayRows').innerHTML = C.map((c, j) => {
    let seg = '';
    for (let q = -1; q <= 2; q++) {
      const a = c.b + 24 * q, z = a + 24, x0 = clamp(a, 0, 48), x1 = clamp(z, 0, 48);
      if (x1 <= x0) continue;
      seg += '<i data-q="' + q + '" style="left:' + (x0 / 48 * 100) + '%;width:' + ((x1 - x0) / 48 * 100) + '%">' + nm(q + c.k) + '</i>';
    }
    return '<div class="dayrow"><div class="nm">' + c.n + '<small>' + c.s + '</small></div><div class="st">' + seg + '<span class="hand"></span></div><div class="d" id="dayD' + j + '"></div></div>';
  }).join('');
  function upd(){
    const t = +rng.value / 60, d = Math.floor(t / 24), hh = t - 24 * d;
    $('#dayO').textContent = nm(Math.min(d, 2)) + ' ' + hm(hh);
    const res = C.map((c, j) => {
      const q = Math.floor((t - c.b) / 24), name = nm(q + c.k);
      const row = $$('.dayrow')[j];
      $$('.st i', row).forEach(i => i.classList.toggle('cur', +i.dataset.q === q));
      $('.hand', row).style.left = 'calc(' + (t / 48 * 100) + '% - 1px)';
      $('#dayD' + j).textContent = name;
      return name;
    });
    const civil = res[0], diff = C.filter((c, j) => res[j] !== civil).map((c, j) => c);
    const others = C.map((c, j) => res[j] !== civil ? c.n + '派说是' + res[j] : '').filter(Boolean);
    $('#daySay').innerHTML = others.length ? '手机上是<b>' + civil + '</b>，可是' + others.join('，') + '。同一个时刻，五把刀切出了 ' + new Set(res).size + ' 个不同的“今天”。' : '此刻五种切法难得意见一致：都是<b>' + civil + '</b>。再拖一拖试试傍晚和深夜。';
  }
  rng.addEventListener('input', upd); upd();
})();

/* ---------- 装置 2：漏壶 ---------- */
(function(){
  const fig = $('#clepFig'); if (!fig) return;
  const MODES = ['单壶', '斜壁壶（古埃及）', '三级漏壶', '莲花漏（溢流）'];
  let mode = 0, R = 2, res = null, anim = 0, raf = 0;
  const svg = $('#clepSvg'), plot = $('#clepPlot'), say = $('#clepSay'), rf = $('#clepRefill');
  btnRow($('#clepMode'), MODES, 0, i => { mode = i; rf.style.display = i >= 2 ? '' : 'none'; sim(); show(0); });
  rf.style.display = 'none';
  $('#clepR').addEventListener('input', e => { R = +e.target.value; $('#clepRO').textContent = '每 ' + R + ' 小时'; sim(); show(0); });
  $('#clepRO').textContent = '每 2 小时';
  // 模拟：dt = 0.01 小时，返回 120 个时间点的读数与水位
  function sim(){
    const dt = 0.01, N = 1200; const out = {t: [], read: [], lv: []};
    let h = [1, 1, 1], top = 1, sup = 1, F = 0, rate0 = null, nextRefill = R;
    for (let s = 0; s <= N; s++) {
      const t = s * dt;
      if (s % 10 === 0) out.lv.push(mode === 3 ? [top, sup, F] : mode === 2 ? [h[0], h[1], h[2], F] : [h[0], F]);
      let dF = 0;
      if (mode === 0) { const k = 0.114, q = k * Math.sqrt(Math.max(h[0], 0)); h[0] -= q * dt; dF = q * dt; }
      else if (mode === 1) { const k = 0.083, A = 0.4 + 0.8 * Math.max(h[0], 0), q = k * Math.sqrt(Math.max(h[0], 0)); const dh = q / A * dt; h[0] -= dh; dF = dh; }
      else if (mode === 2) {
        const k = 0.25, q1 = k * Math.sqrt(Math.max(h[0], 0)), q2 = k * Math.sqrt(Math.max(h[1], 0)), q3 = k * Math.sqrt(Math.max(h[2], 0));
        h[0] -= q1 * dt; h[1] += (q1 - q2) * dt; h[2] += (q2 - q3) * dt; dF = q3 * dt;
        if (t >= nextRefill - 1e-9) { h[0] = 1; nextRefill += R; }
      } else {
        const kin = 0.5, k = 0.25, qin = kin * Math.sqrt(Math.max(top, 0)), q = k * Math.sqrt(Math.max(sup, 0));
        top -= qin * dt; sup = Math.min(1, sup + (qin - q) * dt); dF = q * dt;
        if (t >= nextRefill - 1e-9) { top = 1; nextRefill += R; }
      }
      if (s === 0) rate0 = dF / dt;
      F += dF;
      if (s % 10 === 0) { out.t.push(t); out.read.push(F / rate0); }
    }
    res = out;
  }
  function vessel(x, y, w, hgt, lv, opt){
    opt = opt || {};
    let s = '';
    const wl = clamp(lv, 0, 1) * hgt;
    if (opt.slope) {
      const b = w * 0.45; // 底窄口宽
      const wAt = yy => b + (w - b) * (yy / hgt);
      const ww = wAt(wl);
      s += '<path d="M' + (x + (w - ww) / 2) + ',' + (y + hgt - wl) + ' L' + (x + (w + ww) / 2) + ',' + (y + hgt - wl) + ' L' + (x + (w + b) / 2) + ',' + (y + hgt) + ' L' + (x + (w - b) / 2) + ',' + (y + hgt) + ' Z" fill="var(--night)" opacity=".35"/>';
      s += '<path d="M' + x + ',' + y + ' L' + (x + (w - b) / 2) + ',' + (y + hgt) + ' L' + (x + (w + b) / 2) + ',' + (y + hgt) + ' L' + (x + w) + ',' + y + '" fill="none" stroke="var(--ink-2)" stroke-width="2"/>';
      for (let i = 1; i < 12; i++) { const yy = y + hgt * i / 12, ww2 = wAt(hgt - hgt * i / 12); s += '<line x1="' + (x + (w - ww2) / 2 + 2) + '" y1="' + yy + '" x2="' + (x + (w - ww2) / 2 + 8) + '" y2="' + yy + '" stroke="var(--brass)" stroke-width="1"/>'; }
    } else {
      s += '<rect x="' + x + '" y="' + (y + hgt - wl) + '" width="' + w + '" height="' + wl + '" fill="var(--night)" opacity=".35"/>';
      s += '<path d="M' + x + ',' + y + ' V' + (y + hgt) + ' H' + (x + w) + ' V' + y + '" fill="none" stroke="var(--ink-2)" stroke-width="2"/>';
    }
    if (opt.label) s += '<text x="' + (x + w / 2) + '" y="' + (y - 5) + '" text-anchor="middle" font-size="10" fill="var(--ink-3)">' + opt.label + '</text>';
    return s;
  }
  const drip = (x, y1, y2) => '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '" stroke="var(--night)" stroke-width="1.6" stroke-dasharray="2 4" opacity=".8"/>';
  function receiver(x, y, w, hgt, frac){
    const wl = clamp(frac, 0, 1) * hgt;
    let s = '<rect x="' + x + '" y="' + (y + hgt - wl) + '" width="' + w + '" height="' + wl + '" fill="var(--night)" opacity=".35"/>';
    s += '<path d="M' + x + ',' + y + ' V' + (y + hgt) + ' H' + (x + w) + ' V' + y + '" fill="none" stroke="var(--ink-2)" stroke-width="2"/>';
    const top = y + hgt - wl - 6; // 浮舟 + 箭
    s += '<rect x="' + (x + 6) + '" y="' + top + '" width="' + (w - 12) + '" height="6" rx="2" fill="var(--brass)"/>';
    s += '<line x1="' + (x + w / 2) + '" y1="' + top + '" x2="' + (x + w / 2) + '" y2="' + (top - 70) + '" stroke="var(--brass)" stroke-width="3"/>';
    for (let i = 0; i <= 7; i++) s += '<line x1="' + (x + w / 2 - 4) + '" y1="' + (top - 10 * i) + '" x2="' + (x + w / 2 + 4) + '" y2="' + (top - 10 * i) + '" stroke="var(--vermil)" stroke-width="1"/>';
    s += '<text x="' + (x + w / 2) + '" y="' + (y + hgt + 14) + '" text-anchor="middle" font-size="10" fill="var(--ink-3)">接水壶 · 箭</text>';
    return s;
  }
  function drawV(i){
    const lv = res.lv[i], fr = lv[lv.length - 1] / (res.lv[res.lv.length - 1][lv.length - 1] || 1);
    let s = '';
    if (mode === 0) s = vessel(30, 40, 90, 110, lv[0], {label: '漏壶'}) + drip(75, 150, 200) + receiver(160, 120, 70, 100, fr * 0.9);
    else if (mode === 1) s = vessel(80, 40, 140, 150, lv[0], {slope: 1, label: '斜壁壶：看壶内水位'}) + drip(150, 190, 225);
    else if (mode === 2) s = vessel(10, 20, 60, 60, lv[0], {label: '第一级'}) + drip(40, 80, 95) + vessel(60, 95, 60, 50, lv[1] * 0.85, {label: '第二级'}) + drip(90, 145, 160) + vessel(110, 160, 60, 40, lv[2] * 0.8, {label: '第三级'}) + drip(140, 200, 215) + receiver(200, 110, 70, 100, fr * 0.9);
    else s = vessel(10, 20, 70, 60, lv[0], {label: '储水壶'}) + drip(45, 80, 105) + vessel(70, 105, 70, 50, lv[1] * 0.8, {label: '供水壶'}) + '<path d="M140,115 h18 v80" fill="none" stroke="var(--ink-2)" stroke-width="2"/><text x="160" y="110" font-size="10" fill="var(--ink-3)">溢流口</text>' + drip(105, 155, 210) + receiver(200, 110, 70, 100, fr * 0.9);
    svg.innerHTML = s;
  }
  function drawP(n){
    const X = t => 30 + t / 12 * 255, Y = h => 180 - clamp(h, 0, 14) / 14 * 165;
    let s = '<rect x="30" y="15" width="255" height="165" fill="none" stroke="var(--rule)"/>';
    for (let h = 0; h <= 12; h += 3) s += '<text x="' + X(h) + '" y="194" text-anchor="middle" font-size="10" fill="var(--ink-3)">' + h + 'h</text><text x="24" y="' + (Y(h) + 3) + '" text-anchor="end" font-size="10" fill="var(--ink-3)">' + h + '</text>';
    s += '<text x="158" y="12" text-anchor="middle" font-size="10" fill="var(--ink-3)">横轴：真实过了几小时　纵轴：漏上读出几小时</text>';
    s += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(12) + '" y2="' + Y(12) + '" stroke="var(--ink-3)" stroke-dasharray="4 4"/>';
    let d = '';
    for (let i = 0; i <= n; i++) d += (i ? 'L' : 'M') + X(res.t[i]).toFixed(1) + ',' + Y(res.read[i]).toFixed(1);
    s += '<path d="' + d + '" fill="none" stroke="var(--vermil)" stroke-width="2.2"/>';
    plot.innerHTML = s;
  }
  function show(n){
    cancelAnimationFrame(raf);
    drawV(n); drawP(n);
    if (n >= 120) {
      const err = (res.read[120] - 12) * 60;
      let mx = 0; for (let i = 0; i <= 120; i++) mx = Math.max(mx, Math.abs(res.read[i] - res.t[i]) * 60);
      const late = err < 0;
      const good = mx < (mode === 2 ? 25 : 15);
      say.className = 'say ' + (good || mode === 1 ? 'ok' : 'bad');
      say.innerHTML = '天亮了（真实过了 12 小时），漏上读出的是 <b>' + res.read[120].toFixed(1) + ' 小时</b>，' + (Math.abs(err) < 3 ? '几乎分毫不差' : (late ? '慢了 ' : '快了 ') + '<b>' + Math.abs(err).toFixed(0) + ' 分钟</b>') + '；这一夜最大偏差 ' + mx.toFixed(0) + ' 分钟。' + [
        '水越少漏得越慢，后半夜的“一个时辰”被拉得很长。这正是古人头疼的毛病。',
        '斜壁让上面的水降得慢、下面的水降得快，抵消了大半水压的变化。',
        good ? '中间几级壶互相缓冲，加上勤快地往顶上添水，最下一级的水位稳多了。' : '添水间隔太长，顶上的壶漏空了，整串壶都跟着慢下来。试试把添水间隔调短。',
        good ? '供水壶的水位被溢流口卡死，漏得始终一样快：这就是“恒定水头”。' : '储水壶漏空以后，溢流就失效了，供水壶的水位开始下降。添水要勤。'
      ][mode];
    } else { say.className = 'say'; say.innerHTML = '守夜中……真实时间 <b>' + res.t[n].toFixed(1) + '</b> 小时，漏上读出 <b>' + res.read[n].toFixed(1) + '</b> 小时。'; }
  }
  $('#clepGo').addEventListener('click', () => { let i = 0; cancelAnimationFrame(raf); const step = () => { show(i); if (i < 120) { i++; raf = requestAnimationFrame(() => setTimeout(step, 30)); } }; step(); });
  $('#clepFast').addEventListener('click', () => show(120));
  sim(); show(0);
})();

/* ---------- 装置 3：旬星 ---------- */
(function(){
  const rng = $('#decD'); if (!rng) return;
  const LAT = 25.7, svg = $('#decSvg');
  function upd(){
    const N = +rng.value + 1;
    const H0 = hourAngle(LAT, N, -0.833) / 15, H18 = hourAngle(LAT, N, -18) / 15;
    const set = 12 + H0, rise = 36 - H0, dk0 = 12 + H18, dk1 = 36 - H18;
    const X = t => 20 + (t - set) / (rise - set) * 600;
    let s = '<rect x="20" y="40" width="600" height="56" fill="var(--sky)"/><rect x="' + X(dk0) + '" y="40" width="' + (X(dk1) - X(dk0)) + '" height="56" fill="var(--night)" opacity=".85"/>';
    const phase = (N * 3.94) % 40 / 60; let cnt = 0, k = 0;
    for (let t = set + phase; t < rise; t += 40 / 60) {
      const dark = t > dk0 && t < dk1; if (dark) cnt++;
      const x = X(t);
      s += '<path d="M' + x + ',' + 58 + ' l2.5,6 l6,2.5 l-6,2.5 l-2.5,6 l-2.5,-6 l-6,-2.5 l6,-2.5 Z" fill="' + (dark ? 'var(--brass)' : 'var(--ink-3)') + '" opacity="' + (dark ? 1 : 0.35) + '"/>';
      if (dark) s += '<text x="' + x + '" y="88" text-anchor="middle" font-size="10" fill="var(--paper)" style="font-family:var(--f-mono)">' + cnt + '</text>';
      k++;
    }
    for (let h = Math.ceil(set); h <= Math.floor(rise); h++) s += '<line x1="' + X(h) + '" y1="96" x2="' + X(h) + '" y2="102" stroke="var(--ink-3)"/><text x="' + X(h) + '" y="114" text-anchor="middle" font-size="10" fill="var(--ink-3)" style="font-family:var(--f-mono)">' + (h % 24) + '</text>';
    s += '<text x="20" y="30" font-size="11" fill="var(--ink-2)">日落 ' + hm(set) + '</text><text x="620" y="30" text-anchor="end" font-size="11" fill="var(--ink-2)">日出 ' + hm(rise) + '</text>';
    s += '<text x="' + ((X(dk0) + X(dk1)) / 2) + '" y="30" text-anchor="middle" font-size="11" fill="var(--night)">天完全黑透：' + hm(dk0) + '—' + hm(dk1) + '</text>';
    s += '<text x="320" y="138" text-anchor="middle" font-size="11" fill="var(--ink-3)">每一颗星是一颗旬星从东方升起的时刻（约每 40 分钟一颗；当地太阳时）</text>';
    svg.innerHTML = s;
    $('#decO').textContent = dateLabel(N);
    $('#decKv').innerHTML = '<div><b>' + (rise - set).toFixed(1) + ' 时</b>从日落到日出</div><div><b>' + (dk1 - dk0).toFixed(1) + ' 时</b>完全黑透</div><div><b>' + cnt + ' 颗</b>能看见升起的旬星</div>';
    const summer = N > 165 && N < 225;
    $('#decSay').innerHTML = cnt <= 12 ? '这一夜只能数出 <b>' + cnt + '</b> 颗。' + (summer ? '这正是天狼星在黎明前重新出现、尼罗河开始涨水的季节。照这样的夜来分，一夜就是十二个时辰。' : '') : '这一夜能数出 <b>' + cnt + '</b> 颗，比十二颗多。冬夜长，看得见的旬星也多。拖到七月前后试试。';
  }
  rng.addEventListener('input', upd); upd();
})();

/* ---------- 装置 4：会伸缩的小时 ---------- */
(function(){
  const rng = $('#romD'); if (!rng) return;
  const CITY = [['罗马', 41.9], ['亚历山大', 31.2], ['北京', 39.9], ['江户', 35.7], ['伦敦', 51.5], ['斯德哥尔摩', 59.3]];
  let ci = 0;
  btnRow($('#romCity'), CITY.map(c => c[0]), 0, i => { ci = i; upd(); });
  const RN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  function upd(){
    const N = +rng.value + 1, D = dayLen(CITY[ci][1], N), sr = 12 - D / 2, ss = 12 + D / 2, nh = (24 - D) / 12;
    const X = t => 20 + t / 24 * 600;
    let s = '';
    // 夜：日落到午夜（第 1—6 夜时），午夜到日出（第 7—12 夜时）
    for (let i = 0; i < 12; i++) {
      let a = ss + i * nh, b = a + nh; if (a >= 24) { a -= 24; b -= 24; }
      const parts = b > 24 ? [[a, 24], [0, b - 24]] : [[a, b]];
      parts.forEach(p => { s += '<rect x="' + X(p[0]) + '" y="78" width="' + (X(p[1]) - X(p[0])) + '" height="30" fill="var(--night)" opacity="' + (i % 2 ? 0.55 : 0.75) + '" stroke="var(--card)" stroke-width="1"/>'; });
      const mid = ((a + nh / 2) % 24); s += '<text x="' + X(mid) + '" y="97" text-anchor="middle" font-size="9.5" fill="var(--paper)">' + RN[i] + '</text>';
    }
    for (let i = 0; i < 12; i++) {
      const a = sr + i * D / 12;
      s += '<rect x="' + X(a) + '" y="30" width="' + (X(a + D / 12) - X(a)) + '" height="38" fill="var(--brass)" opacity="' + (i % 2 ? 0.45 : 0.7) + '" stroke="var(--card)" stroke-width="1"/>';
      s += '<text x="' + X(a + D / 24) + '" y="47" text-anchor="middle" font-size="10" fill="var(--ink)">' + RN[i] + '</text><text x="' + X(a + D / 24) + '" y="61" text-anchor="middle" font-size="8.5" fill="var(--ink-2)" style="font-family:var(--f-mono)">' + hm(a) + '</text>';
    }
    for (let h = 0; h <= 24; h += 3) s += '<line x1="' + X(h) + '" y1="110" x2="' + X(h) + '" y2="116" stroke="var(--ink-3)"/><text x="' + X(h) + '" y="128" text-anchor="middle" font-size="10" fill="var(--ink-3)" style="font-family:var(--f-mono)">' + h + ':00</text>';
    s += '<text x="20" y="22" font-size="11" fill="var(--ink-2)">白天的十二个“时”（格子里是开始的钟点，按当地太阳时）</text><text x="20" y="145" font-size="11" fill="var(--ink-2)">下面深色是夜里的十二个“时”</text>';
    $('#romSvg').innerHTML = s;
    $('#romO').textContent = dateLabel(N);
    $('#romKv').innerHTML = '<div><b>' + D.toFixed(1) + ' 小时</b>白天长</div><div><b>' + (D * 5).toFixed(0) + ' 分钟</b>白天的一“时”</div><div><b>' + (nh * 60).toFixed(0) + ' 分钟</b>夜里的一“时”</div><div><b>' + hm(sr) + '</b>第一时开始（日出）</div>';
    const dm = D * 5;
    $('#romSay').innerHTML = '在' + CITY[ci][0] + '，这一天白天的一“时”是 <b>' + dm.toFixed(0) + ' 分钟</b>，' + (Math.abs(dm - 60) < 3 ? '差不多正好一个钟头：这是春分秋分前后，昼夜等长。' : dm > 60 ? '比我们的一小时长 ' + (dm - 60).toFixed(0) + ' 分钟。约人“第三时见”，得早早出门。' : '比我们的一小时短 ' + (60 - dm).toFixed(0) + ' 分钟。冬天的白天，一“时”一晃就过去了。') + (ci === 5 ? ' 越往北，冬夏差得越离谱。' : '');
  }
  rng.addEventListener('input', upd); upd();
})();

/* ---------- 装置 5：调钟 ---------- */
(function(){
  const fig = $('#vergeFig'); if (!fig) return;
  const svg = $('#vergeSvg'), P = $('#vergeP'), say = $('#vergeSay');
  let mode = 0, p0, day, errs, th = 0, wheel = 0, last = 0, raf = 0, dir = 1;
  const MODES = ['机轴摆杆（14 世纪）', '钟摆（1656）'];
  btnRow($('#vergeMode'), MODES, 0, i => { mode = i; $('#vergeLab').textContent = i ? '摆锤高低' : '重块位置'; reset(); });
  function reset(){ p0 = 30 + Math.random() * 40; day = 0; errs = []; P.value = 50; out(); kv(); say.className = 'say'; say.textContent = mode ? '钟摆来了。挪一挪摆锤，按“走一天”。' : '挪好重块，按“走一天”。'; }
  function out(){ const v = +P.value; $('#vergePO').textContent = mode ? (v < 50 ? '偏高 ' : v > 50 ? '偏低 ' : '居中 ') + Math.abs(v - 50) : (v < 50 ? '偏里 ' : v > 50 ? '偏外 ' : '居中 ') + Math.abs(v - 50); }
  P.addEventListener('input', out);
  const fmt = m => { const s = Math.abs(m) * 60; return s < 90 ? s.toFixed(0) + ' 秒' : (Math.abs(m)).toFixed(1) + ' 分钟'; };
  function kv(){
    const avg = errs.length ? errs.reduce((a, b) => a + Math.abs(b), 0) / errs.length : 0;
    $('#vergeKv').innerHTML = '<div><b>' + day + ' / 7</b>第几天</div><div><b>' + (errs.length ? (errs[errs.length - 1] > 0 ? '快 ' : '慢 ') + fmt(errs[errs.length - 1]) : '—') + '</b>今天比日晷</div><div><b>' + (errs.length ? fmt(avg) : '—') + '</b>平均每天差</div>';
  }
  $('#vergeGo').addEventListener('click', () => {
    if (day >= 7) { reset(); return; }
    const v = +P.value, k = mode ? 0.02 : 0.5, sd = mode ? 0.2 : 9;
    const e = -(v - p0) * k + gauss() * sd; // 正 = 快
    errs.push(e); day++; kv();
    const hint = mode ? (v > p0 + 4 ? '（摆锤偏低，摆得慢）' : v < p0 - 4 ? '（摆锤偏高，摆得快）' : '') : '';
    if (day < 7) { say.className = 'say'; say.innerHTML = '第 ' + day + ' 天中午，对着日晷一看：钟<b>' + (e > 0 ? '快了' : '慢了') + fmt(e) + '</b>。' + (e > 0 ? '往外挪一点，让它慢些。' : '往里挪一点，让它快些。') + hint + (mode ? '' : ' 不过别太当真：天冷油稠、绳子松紧，每天都会乱跳。'); }
    else {
      const avg = errs.reduce((a, b) => a + Math.abs(b), 0) / 7;
      say.className = 'say ' + (avg < 2 ? 'ok' : 'bad');
      say.innerHTML = '七天过去，平均每天差 <b>' + fmt(avg) + '</b>。' + (mode ? '同样的手艺，换上钟摆，误差从“分钟”降到了“秒”。这就是惠更斯 1656 年那一下的分量，钟从此值得装分针了。' : '调得再用心，中世纪的钟一天也常要差上好几分钟、甚至一刻钟，因为摆杆没有自己固定的节奏。换成钟摆再试一次。') + ' 再按一次“走一天”重来。';
    }
  });
  $('#vergeReset').addEventListener('click', reset);
  function frame(ts){
    const dt = Math.min(0.05, (ts - (last || ts)) / 1000); last = ts;
    const v = +P.value, period = mode ? 1.6 + (v - 50) / 120 : 1.0 + (v - 50) / 80;
    th += dt * 2 * Math.PI / period;
    const a = Math.sin(th);
    if (Math.sign(Math.cos(th)) !== dir) { dir = Math.sign(Math.cos(th)); wheel += 360 / 15 / 2; }
    let s = '';
    const cx = 130;
    // 冠状轮（侧视，一圈齿）
    const wy = 175, wr = 46;
    s += '<circle cx="' + cx + '" cy="' + wy + '" r="' + wr + '" fill="none" stroke="var(--brass)" stroke-width="3"/>';
    for (let i = 0; i < 15; i++) { const ang = wheel + i * 24; const [x0, y0] = pol(cx, wy, wr, ang), [x1, y1] = pol(cx, wy, wr + 10, ang + 8), [x2, y2] = pol(cx, wy, wr, ang + 16); s += '<path d="M' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' L' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' L' + x2.toFixed(1) + ',' + y2.toFixed(1) + '" fill="var(--brass)" opacity=".8"/>'; }
    s += '<circle cx="' + cx + '" cy="' + wy + '" r="5" fill="var(--ink-2)"/>';
    s += '<path d="M' + (cx + 50) + ',' + (wy + 6) + ' v40" stroke="var(--ink-3)" stroke-width="1.5"/><rect x="' + (cx + 42) + '" y="' + (wy + 44) + '" width="16" height="14" fill="var(--ink-3)"/><text x="' + (cx + 64) + '" y="' + (wy + 56) + '" font-size="10" fill="var(--ink-3)">重锤</text>';
    if (!mode) {
      // 机轴 + 摆杆（从正面看，转动表现为两端伸缩）
      s += '<line x1="' + cx + '" y1="40" x2="' + cx + '" y2="' + (wy - wr - 8) + '" stroke="var(--ink-2)" stroke-width="4"/>';
      const L = 100 * Math.cos(a * 0.9), off = 25 + (v / 100) * 70, wo = off * Math.cos(a * 0.9), depth = Math.sin(a * 0.9);
      s += '<line x1="' + (cx - L) + '" y1="40" x2="' + (cx + L) + '" y2="40" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/>';
      s += '<circle cx="' + (cx - wo) + '" cy="40" r="' + (9 - depth * 2) + '" fill="var(--vermil)"/><circle cx="' + (cx + wo) + '" cy="40" r="' + (9 + depth * 2) + '" fill="var(--vermil)"/>';
      s += '<rect x="' + (cx - 10) + '" y="' + (wy - wr - 22 + (a > 0 ? -3 : 3)) + '" width="8" height="10" fill="var(--ink-2)" transform="rotate(' + (a * 25) + ' ' + cx + ' ' + (wy - wr - 16) + ')"/>';
      s += '<text x="' + cx + '" y="22" text-anchor="middle" font-size="10" fill="var(--ink-3)">摆杆来回转，红色小重块越靠外摆得越慢</text>';
    } else {
      const L = 120 + (v - 50) * 0.6, ang = a * 14;
      const [bx, by] = pol(cx, 20, L, 180 - ang);
      s += '<line x1="' + cx + '" y1="20" x2="' + bx.toFixed(1) + '" y2="' + by.toFixed(1) + '" stroke="var(--ink-2)" stroke-width="3"/><circle cx="' + bx.toFixed(1) + '" cy="' + by.toFixed(1) + '" r="13" fill="var(--vermil)"/>';
      s += '<path d="M' + (cx - 22) + ',' + (wy - wr - 2) + ' L' + cx + ',' + (wy - wr - 20) + ' L' + (cx + 22) + ',' + (wy - wr - 2) + '" fill="none" stroke="var(--ink)" stroke-width="3" transform="rotate(' + (a * 8) + ' ' + cx + ' ' + (wy - wr - 20) + ')"/>';
      s += '<text x="' + (cx + 70) + '" y="40" font-size="10" fill="var(--ink-3)">摆长决定节奏</text>';
    }
    svg.innerHTML = s;
    raf = requestAnimationFrame(frame);
  }
  onVisible(fig, () => { cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(frame); }, () => cancelAnimationFrame(raf));
  reset();
})();

/* ---------- 装置 6：二十四小时 ---------- */
(function(){
  const fig = $('#ringFig'); if (!fig) return;
  const CAT = [['干活 / 学习', 'var(--night)'], ['睡觉', 'var(--ink-3)'], ['吃饭', 'var(--brass)'], ['路上', 'var(--vermil)'], ['杂事', 'var(--rule)'], ['自己支配', 'var(--jade)']];
  const PRE = [
    {n: '1833 年英国纺织厂（13—18 岁）', v: [12, 7, 1.5, 1.5, 1], say: '1833 年的《工厂法》规定，十三到十八岁的孩子一天最多干十二个小时，这在当时已经算是“保护”。剩下的时间，除了睡觉和走路，所剩无几。'},
    {n: '1817 年欧文的口号', v: [8, 8, 0, 0, 0], say: '“八小时劳动，八小时休息，八小时自己支配。”这个口号整整喊了一百年，才在很多国家变成法律。'},
    {n: '今天的一个上班日', v: [8, 7.5, 2, 1.5, 2], say: '法定八小时，可加上通勤、吃饭和家务，真正“自己支配”的往往只剩两三个小时。八小时工作制争来的时间，又被路上和杂事分走了一大块。'},
    {n: '你自己', v: [10, 7.5, 2, 1, 1.5], say: ''}
  ];
  let pi = 0, mine = PRE[3].v.slice();
  btnRow($('#ringPre'), PRE.map(p => p.n), 0, i => { pi = i; draw(); });
  $('#ringLeg').innerHTML = CAT.map(c => '<span><i style="background:' + c[1] + '"></i>' + c[0] + '</span>').join('');
  const ctl = $('#ringCtl');
  ctl.innerHTML = CAT.slice(0, 5).map((c, i) => '<div class="ctl"><span>' + c[0] + '</span><input type="range" min="0" max="16" step="0.5" value="' + mine[i] + '" data-i="' + i + '"><output></output></div>').join('');
  ctl.addEventListener('input', e => { const i = +e.target.dataset.i; if (isNaN(i)) return; mine[i] = +e.target.value; draw(); });
  function draw(){
    const v = (pi === 3 ? mine : PRE[pi].v).slice();
    const used = v.reduce((a, b) => a + b, 0), own = Math.max(0, 24 - used);
    const all = v.concat([own]);
    let s = '', a = 0;
    const tot = Math.max(24, used);
    all.forEach((h, i) => { if (h <= 0) return; const a1 = a + h / tot * 360; s += '<path d="' + sector(120, 120, 62, 108, a, a1 - 0.01 + (a1 - a >= 359.9 ? -0.1 : 0)) + '" fill="' + CAT[i][1] + '" opacity="' + (i === 5 ? 0.55 : 0.85) + '"/>'; a = a1; });
    s += '<text x="120" y="114" text-anchor="middle" font-size="13" fill="var(--ink-2)">自己支配</text><text x="120" y="140" text-anchor="middle" font-size="24" fill="var(--jade)" style="font-family:var(--f-mono)">' + own.toFixed(1) + 'h</text>';
    $('#ringSvg').innerHTML = s;
    ctl.style.display = pi === 3 ? '' : 'none';
    $$('.ctl', ctl).forEach((d, i) => { $('output', d).textContent = mine[i] + ' 小时'; });
    const say = $('#ringSay');
    if (pi < 3) { say.className = 'say'; say.textContent = PRE[pi].say; }
    else if (used > 24) { say.className = 'say bad'; say.innerHTML = '你排了 <b>' + used + '</b> 个小时，一天只有二十四个。总得有一样要让，通常最先被偷走的是睡觉。'; }
    else { say.className = 'say ' + (own >= 2 ? 'ok' : ''); say.innerHTML = '你一天有 <b>' + own.toFixed(1) + ' 小时</b>归自己。' + (own < 1 ? '几乎为零。干活的时间再长，也不一定等于干得多，试着把“坐着的时长”换成“干完的活”。' : own < 3 ? '和今天一个普通上班族差不多。这点时间值得好好挑：用来做一件真正想做的事，或者见一个想见的人。' : '比欧文时代的工人宽裕多了。别忘了，这是一百多年的工人运动替你争来的。'); }
  }
  draw();
})();

/* ---------- 装置 7：日晷与手表 ---------- */
(function(){
  const rng = $('#eotD'); if (!rng) return;
  const CITY = [['北京', 116.4, 39.9], ['上海', 121.5, 31.2], ['哈尔滨', 126.6, 45.8], ['拉萨', 91.1, 29.7], ['乌鲁木齐', 87.6, 43.8], ['喀什', 76.0, 39.5]];
  let ci = 0;
  btnRow($('#eotCity'), CITY.map(c => c[0]), 0, i => { ci = i; upd(); });
  const X = e => 130 + e * 6, Y = d => 130 - d * 4.6;
  let base = '<line x1="130" y1="14" x2="130" y2="246" stroke="var(--rule)"/><line x1="20" y1="130" x2="240" y2="130" stroke="var(--rule)"/>';
  let d = '';
  for (let N = 1; N <= 365; N++) d += (N > 1 ? 'L' : 'M') + X(eot(N)).toFixed(1) + ',' + Y(decl(N)).toFixed(1);
  base += '<path d="' + d + 'Z" fill="none" stroke="var(--brass)" stroke-width="2"/>';
  base += '<text x="236" y="146" text-anchor="end" font-size="10" fill="var(--ink-3)">太阳比钟快 →</text><text x="24" y="146" font-size="10" fill="var(--ink-3)">← 比钟慢</text><text x="136" y="22" font-size="10" fill="var(--ink-3)">夏至（高）</text><text x="136" y="244" font-size="10" fill="var(--ink-3)">冬至（低）</text>';
  [[1, '1月'], [105, '4月'], [196, '7月'], [288, '10月']].forEach(m => { base += '<text x="' + (X(eot(m[0])) + (eot(m[0]) > 0 ? 8 : -8)) + '" y="' + (Y(decl(m[0])) + 4) + '" font-size="9.5" fill="var(--ink-3)" text-anchor="' + (eot(m[0]) > 0 ? 'start' : 'end') + '">' + m[1] + '</text>'; });
  function upd(){
    const N = +rng.value + 1, E = eot(N), c = CITY[ci];
    const lonMin = (120 - c[1]) * 4, noon = 12 + (lonMin - E) / 60;
    $('#eotSvg').innerHTML = base + '<circle cx="' + X(E).toFixed(1) + '" cy="' + Y(decl(N)).toFixed(1) + '" r="6" fill="var(--vermil)"/>';
    $('#eotO').textContent = dateLabel(N);
    $('#eotKv').innerHTML = '<div><b>' + hm(noon) + '</b>太阳最高（北京时间）</div><div><b>' + (lonMin >= 0 ? '+' : '') + lonMin.toFixed(0) + ' 分</b>经度造成的</div><div><b>' + (E >= 0 ? '快 ' : '慢 ') + Math.abs(E).toFixed(1) + ' 分</b>今天太阳比平均</div><div><b>' + (90 - Math.abs(c[2] - decl(N))).toFixed(0) + '°</b>正午太阳高度</div>';
    $('#eotSay').innerHTML = '这一天在' + c[0] + '，日晷指十二点的时候，手表是 <b>' + hm(noon) + '</b>。其中 ' + Math.abs(lonMin).toFixed(0) + ' 分钟是因为' + c[0] + (lonMin >= 0 ? '在东经 120 度以西' : '在东经 120 度以东') + '，另外 ' + Math.abs(E).toFixed(0) + ' 分钟是太阳今天自己' + (E >= 0 ? '跑快了' : '跑慢了') + '。';
  }
  rng.addEventListener('input', upd); upd();
})();

/* ---------- 装置 8：各地的钟 ---------- */
(function(){
  const fig = $('#tzFig'); if (!fig) return;
  const SETS = [
    {n: '英国 · 1840 年代', z: c => 0, std: '伦敦（格林尼治）时间', c: [['伦敦', -0.13], ['牛津', -1.26], ['布里斯托尔', -2.59], ['普利茅斯', -4.14], ['爱丁堡', -3.19]]},
    {n: '北美 · 1883 年', z: lon => -Math.round(-lon / 15) * 15, std: '标准时区', c: [['波士顿', -71.06], ['纽约', -74.0], ['华盛顿', -77.04], ['芝加哥', -87.63], ['圣路易斯', -90.2], ['丹佛', -104.99], ['旧金山', -122.42]]},
    {n: '中国 · 今天', z: lon => 120, std: '北京时间', c: [['哈尔滨', 126.6], ['上海', 121.5], ['北京', 116.4], ['重庆', 106.5], ['拉萨', 91.1], ['乌鲁木齐', 87.6], ['喀什', 76.0]]}
  ];
  let si = 0, md = 0;
  btnRow($('#tzSet'), SETS.map(s => s.n), 0, i => { si = i; draw(); });
  btnRow($('#tzMode'), ['各用各的地方时', '统一用标准时'], 0, i => { md = i; draw(); });
  function face(h){
    let s = '<circle cx="40" cy="40" r="36" fill="var(--card)" stroke="var(--ink-2)" stroke-width="2"/>';
    for (let i = 0; i < 12; i++) { const [x0, y0] = pol(40, 40, 32, i * 30), [x1, y1] = pol(40, 40, i % 3 ? 29 : 26, i * 30); s += '<line x1="' + x0.toFixed(1) + '" y1="' + y0.toFixed(1) + '" x2="' + x1.toFixed(1) + '" y2="' + y1.toFixed(1) + '" stroke="var(--ink-3)" stroke-width="1.5"/>'; }
    const hh = ((h % 12) + 12) % 12, mm = (h - Math.floor(h)) * 60;
    const [hx, hy] = pol(40, 40, 18, hh * 30), [mx, my] = pol(40, 40, 28, mm * 6);
    s += '<line x1="40" y1="40" x2="' + hx.toFixed(1) + '" y2="' + hy.toFixed(1) + '" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/><line x1="40" y1="40" x2="' + mx.toFixed(1) + '" y2="' + my.toFixed(1) + '" stroke="var(--vermil)" stroke-width="2" stroke-linecap="round"/><circle cx="40" cy="40" r="2.5" fill="var(--ink)"/>';
    return '<svg viewBox="0 0 80 80" aria-hidden="true">' + s + '</svg>';
  }
  function draw(){
    const S = SETS[si], z0 = S.z(S.c[0][1]);
    const U = 12 - z0 / 15; // 世界时：第一座城的标准时 = 12:00
    $('#tzCities').innerHTML = S.c.map(c => {
      const z = S.z(c[1]), lmt = U + c[1] / 15, zt = U + z / 15, t = md ? zt : lmt;
      const df = (c[1] - z) * 4;
      return '<div class="city"><b>' + c[0] + '</b>' + face(t) + '<div class="t2">' + hm(t) + '</div><div class="df">' + (md ? '太阳正午' + (df >= 0 ? '早 ' : '晚 ') + Math.abs(df).toFixed(0) + ' 分' : '比' + S.std.replace('时间', '') + (df >= 0 ? '快 ' : '慢 ') + Math.abs(df).toFixed(0) + ' 分') + '</div>' + (md && si === 1 ? '<div style="font-size:11px;color:var(--ink-3)">' + ({'-75': '东部时区', '-90': '中部时区', '-105': '山地时区', '-120': '太平洋时区'})[z] + '</div>' : '') + '</div>';
    }).join('');
    const say = $('#tzSay');
    if (!md) say.innerHTML = si === 0 ? '各用各的太阳：伦敦正午的时候，布里斯托尔的钟才十一点四十九分左右。一趟火车从伦敦开到普利茅斯，要“倒退”十几分钟。' : si === 1 ? '1883 年以前，美国大大小小的城市都用自己的时间，铁路公司又各有一套，加起来几十种。' : '要是中国各地用各自的地方时，喀什和哈尔滨之间要差三个多小时。';
    else say.innerHTML = si === 0 ? '全国统一用格林尼治时间后，火车时刻表好排了，代价是西边的城镇，钟点和太阳差了十几分钟。' : si === 1 ? '1883 年 11 月 18 日以后：几十种时间被压成了四个时区，每个时区之间正好差一个整小时。' : '北京时间：全国同一个钟点。东北的太阳比钟早到半个小时，喀什的太阳要晚将近三个小时。所以新疆的作息普遍比内地晚两个钟头。';
  }
  draw();
})();

/* ---------- 装置 9：经度 ---------- */
(function(){
  const fig = $('#lonFig'); if (!fig) return;
  const CL = [
    {n: '船上的摆钟（17 世纪）', b: 120, s: 200},
    {n: 'H4（1761）', b: 0, s: 0.5},
    {n: '19 世纪航海钟', b: 1, s: 1.5},
    {n: '今天的石英表', b: 0.5, s: 0.1},
    {n: '原子钟', b: 0, s: 0.000001}
  ];
  let ci = 1;
  btnRow($('#lonClock'), CL.map(c => c.n), 1, i => { ci = i; });
  const D = $('#lonDays'); const dO = () => { $('#lonDO').textContent = D.value + ' 天'; }; D.addEventListener('input', dO); dO();
  const svg = $('#lonSvg');
  function draw(km, show){
    const span = Math.max(60, Math.abs(km) * 1.3), X = k => 320 + k / span * 280;
    let s = '<rect x="20" y="20" width="600" height="80" fill="var(--sky)" opacity=".6" rx="6"/>';
    s += '<path d="M300,64 q10,-14 22,-6 q12,-6 18,4 q-4,10 -18,9 q-14,4 -22,-7 Z" fill="var(--jade)" opacity=".8"/><text x="320" y="92" text-anchor="middle" font-size="11" fill="var(--ink-2)">牙买加（真实位置）</text>';
    if (show) {
      const x = X(km);
      s += '<line x1="320" y1="44" x2="' + x.toFixed(1) + '" y2="44" stroke="var(--vermil)" stroke-dasharray="4 3"/>';
      s += '<path d="M' + (x - 10) + ',40 h20 l-4,7 h-12 Z M' + x + ',40 v-14 l9,10 h-9" fill="var(--vermil)"/><text x="' + x.toFixed(1) + '" y="18" text-anchor="middle" font-size="11" fill="var(--vermil)">你以为船在这里</text>';
    }
    const bar = span > 300 ? 100 : span > 120 ? 50 : 20;
    s += '<line x1="30" y1="114" x2="' + (30 + bar / span * 280) + '" y2="114" stroke="var(--ink-2)" stroke-width="2"/><text x="' + (36 + bar / span * 280) + '" y="118" font-size="10" fill="var(--ink-3)">' + bar + ' 公里</text>';
    s += '<text x="610" y="118" text-anchor="end" font-size="10" fill="var(--ink-3)">← 西　东 →</text>';
    svg.innerHTML = s;
  }
  $('#lonGo').addEventListener('click', () => {
    const c = CL[ci], days = +D.value, bias = c.b * gauss();
    let e = 0; for (let i = 0; i < days; i++) e += bias + c.s * gauss();
    const degE = e / 240, km = degE * 111.32 * Math.cos(rad(18));
    draw(-km, true);
    const ad = Math.abs(degE);
    const prize = ad <= 0.5 ? '两万英镑大奖' : ad <= 2 / 3 ? '一万五千英镑' : ad <= 1 ? '一万英镑' : null;
    const es = Math.abs(e) < 120 ? Math.abs(e).toFixed(Math.abs(e) < 1 ? 3 : 1) + ' 秒' : (Math.abs(e) / 60).toFixed(1) + ' 分钟';
    $('#lonKv').innerHTML = '<div><b>' + (e >= 0 ? '快 ' : '慢 ') + es + '</b>表的累计误差</div><div><b>' + ad.toFixed(ad < 0.01 ? 5 : 2) + '°</b>经度误差</div><div><b>' + Math.abs(km).toFixed(Math.abs(km) < 1 ? 3 : 0) + ' 公里</b>位置误差</div>';
    const say = $('#lonSay');
    say.className = 'say ' + (prize ? 'ok' : 'bad');
    say.innerHTML = prize ? '按 1714 年的《经度法案》，这个精度够拿 <b>' + prize + '</b>。' + (ci === 1 ? '这就是哈里森那块表做到的事；至于委员会肯不肯给钱，是另一回事。' : ci >= 3 ? '今天这样的精度已经稀松平常，三百年前却能换一大笔钱。' : '') : '差了 ' + Math.abs(km).toFixed(0) + ' 公里，一分奖金也拿不到。' + (ci === 0 ? '船一摇，摆就乱了，摆钟在海上几乎没用。这就是牛顿不看好钟表的原因。' : '航程越长，误差越积越多。');
  });
  draw(0, false);
})();

/* ---------- 装置 10：置闰 ---------- */
(function(){
  const box = $('#leapYears'); if (!box) return;
  const SHORT = 365.2422 - 12 * 29.5306, MON = 29.5306, START = 57, LO = 29.5, HI = 60;
  const META = [3, 6, 8, 11, 14, 17, 19];
  let leap = new Set();
  box.innerHTML = Array.from({length: 19}, (_, i) => '<button data-y="' + (i + 1) + '">' + (i + 1) + '</button>').join('');
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const y = +b.dataset.y; leap.has(y) ? leap.delete(y) : leap.add(y); draw(); });
  $('#leapMeton').addEventListener('click', () => { leap = new Set(META); draw(true); });
  $('#leapClear').addEventListener('click', () => { leap = new Set(); draw(); });
  const dlab = d => { const dt = new Date(2024, 11, 22 + Math.round(d)); return (dt.getMonth() + 1) + '/' + dt.getDate(); };
  function draw(meton){
    const pts = [START];
    for (let y = 1; y <= 19; y++) pts.push(pts[y - 1] - SHORT + (leap.has(y) ? MON : 0));
    const X = i => 50 + i * 30, Y = d => 20 + (100 - clamp(d, -160, 100)) / 260 * 165;
    let s = '<rect x="50" y="' + Y(HI) + '" width="570" height="' + (Y(LO) - Y(HI)) + '" fill="var(--brass)" opacity=".18"/>';
    [-150, -90, -30, 0, 30, 60, 90].forEach(d => { s += '<line x1="50" y1="' + Y(d) + '" x2="620" y2="' + Y(d) + '" stroke="var(--rule)"/><text x="44" y="' + (Y(d) + 4) + '" text-anchor="end" font-size="10" fill="var(--ink-3)" style="font-family:var(--f-mono)">' + dlab(d) + '</text>'; });
    s += '<text x="56" y="' + (Y(HI) + 12) + '" font-size="10" fill="var(--brass)">正月初一应该落在这条带子里（约公历 1 月下旬到 2 月下旬）</text>';
    let out = 0, d = '';
    pts.forEach((p, i) => { d += (i ? 'L' : 'M') + X(i) + ',' + Y(p).toFixed(1); });
    s += '<path d="' + d + '" fill="none" stroke="var(--night)" stroke-width="2"/>';
    pts.forEach((p, i) => { const bad = p < LO || p > HI; if (bad && i > 0) out++; s += '<circle cx="' + X(i) + '" cy="' + Y(p).toFixed(1) + '" r="4.5" fill="' + (bad ? 'var(--vermil)' : 'var(--night)') + '"/>'; if (i < 19 && leap.has(i + 1)) s += '<text x="' + (X(i) + 15) + '" y="' + (Y(Math.max(p, pts[i + 1])) - 8).toFixed(1) + '" text-anchor="middle" font-size="10" fill="var(--night)">闰</text>'; });
    for (let i = 0; i <= 19; i++) s += '<text x="' + X(i) + '" y="200" text-anchor="middle" font-size="9.5" fill="var(--ink-3)" style="font-family:var(--f-mono)">' + (i + 1) + '</text>';
    s += '<text x="620" y="12" text-anchor="end" font-size="10" fill="var(--ink-3)">横轴：第几年的正月初一　纵轴：公历日期</text>';
    $('#leapSvg').innerHTML = s;
    $$('button', box).forEach(b => b.classList.toggle('leap', leap.has(+b.dataset.y)));
    const say = $('#leapSay'), n = leap.size;
    if (meton) { say.className = 'say ok'; say.innerHTML = '第 3、6、8、11、14、17、19 年各插一个闰月：<b>十九年七闰</b>。十九年后，正月初一回到了出发时的位置附近，前后只差两个多小时。'; }
    else if (!n) { say.className = 'say'; say.innerHTML = '一个闰月都不插，正月初一每年往前跑十一天左右，不到三年就跑出了冬天的尾巴，十九年后跑到了前一年的盛夏。点年份格子插闰月。'; }
    else { say.className = 'say ' + (out ? 'bad' : 'ok'); say.innerHTML = '你插了 <b>' + n + '</b> 个闰月，' + (out ? '有 ' + out + ' 年的正月初一跑出了带子（红点）。' : '十九年里正月初一一直待在带子里！') + (n === 7 && !out ? '而且正好是七个，和古人的答案一样。' : n > 7 ? '闰月插多了，日子会往后挤。' : n < 7 ? '十九年至少要七个闰月才够。' : ''); }
  }
  draw();
})();

/* ---------- 装置 11：历法漂移 ---------- */
(function(){
  const rng = $('#calY'); if (!rng) return;
  const RULES = ['只有 365 天（不闰）', '儒略历（四年一闰）', '格里高利历（1582 年起）', '伊斯兰历（只看月亮）'];
  let ri = 2;
  btnRow($('#calRule'), RULES, 2, i => { ri = i; upd(); });
  const MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const bar = $('#calBar');
  bar.innerHTML = MD.map((_, i) => '<span>' + (i + 1) + '月</span>').join('') + '<i class="mk2" style="left:calc(' + ((59 + 20) / 365 * 100) + '% - 1px)" title="3 月 21 日"></i><i class="mk" id="calMk"></i>';
  const doy2 = d => { d = ((d % 365) + 365) % 365; let m = 0; while (m < 11 && d >= MD[m]) { d -= MD[m]; m++; } return (m + 1) + ' 月 ' + (Math.floor(d) + 1) + ' 日'; };
  const yl = y => y <= 0 ? '公元前 ' + (1 - y) + ' 年' : y + ' 年';
  function upd(){
    const y = +rng.value, mk = $('#calMk'), say = $('#calSay');
    $('#calYO').textContent = yl(y);
    let d, txt;
    const jul = 59 + 22.4 - (y + 45) * (365.25 - 365.2422);
    if (ri === 0) { d = 59 + 22.4 + (y + 45) * (365.2422 - 365); txt = '春分落在 <b>' + doy2(d) + '</b>。一年少算四分之一天，春分每四年往后挪一天，大约一千五百年绕日历一整圈。古埃及的历法就是这样，节日会在四季里慢慢走。'; }
    else if (ri === 1) { d = jul; const off = 59 + 20 - d; txt = '春分落在 <b>' + doy2(d) + '</b>。' + (y < 400 ? '恺撒改历之后，春分大致在 3 月下旬。' : '每年多算十一分钟，春分一点点往前爬，已经比 3 月 21 日早了约 <b>' + off.toFixed(0) + '</b> 天。') + (y > 1582 ? '（信东正教的地方一直用到 20 世纪，今天东正教会的教历仍然用它。）' : ''); }
    else if (ri === 2) { d = y < 1582 ? jul : 59 + 20.2 - (y - 1582) * (365.2425 - 365.2422); txt = y < 1582 ? '1582 年以前，这里用的还是儒略历：春分落在 <b>' + doy2(d) + '</b>。拖过 1582 年看看。' : '剪掉十天、改了闰年规则以后，春分落在 <b>' + doy2(d) + '</b> 前后。' + (y > 2500 ? '再跑上千年，也只多出不到一天，大约三千多年才差一天。' : '四百年来它几乎一动不动。'); }
    else { if (y < 622) { mk.style.display = 'none'; say.innerHTML = '伊斯兰历从公元 622 年（穆罕默德从麦加迁往麦地那那一年）算起。拖到 622 年以后看看。'; return; } d = 48 - (y - 2026) * (365.2422 - 354.367); txt = '这一年的斋月大约从 <b>' + doy2(d) + '</b> 开始（红线）。它每年往前挪十一天左右，三十三年走完一整圈四季。'; }
    mk.style.display = ''; mk.style.left = 'calc(' + ((((d % 365) + 365) % 365) / 365 * 100) + '% - 1px)';
    say.innerHTML = txt;
  }
  rng.addEventListener('input', upd); upd();
  // 1582 年 10 月（10 月 1 日是星期一）
  let c = '一二三四五六日'.split('').map(x => '<span class="h">' + x + '</span>').join('');
  for (let d = 1; d <= 31; d++) { if (d >= 5 && d <= 14) continue; c += '<span class="' + (d === 4 || d === 15 ? 'x' : '') + '">' + d + '</span>'; }
  $('#cal1582').innerHTML = c;
  $('#calNote').innerHTML = '星期四是 <b>4 日</b>，第二天星期五就是 <b>15 日</b>：星期照常往下排，只有日期跳了十天。5 日到 14 日在西班牙、葡萄牙、意大利、波兰根本不存在。<br>圣特蕾莎在 4 日夜里去世，15 日下葬。';
})();

/* ---------- 装置 12：Unix 时间 ---------- */
(function(){
  const fig = $('#unixFig'); if (!fig) return;
  const MAX = 2147483647;
  let offset = 0, timer = 0;
  const bj = s => { const d = new Date(s * 1000 + 8 * 3600e3); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()); };
  const grp = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const to32 = n => { const m = ((n + 2147483648) % 4294967296 + 4294967296) % 4294967296; return m - 2147483648; };
  const bitsBox = $('#unixBits');
  bitsBox.innerHTML = Array.from({length: 32}, (_, i) => '<span' + (i ? '' : ' class="sg"') + '></span>').join('');
  function render(n){
    const w = to32(n), u = (w >>> 0);
    $('#unixN').textContent = grp(n);
    $$('span', bitsBox).forEach((b, i) => b.classList.toggle('on', !!((u >>> (31 - i)) & 1)));
    const over = w !== n;
    $('#unixD').innerHTML = '北京时间 <b>' + bj(n) + '</b>' + (over ? '　<span style="color:var(--vermil)">32 位电脑以为是 ' + bj(w) + '</span>' : '');
    const left = MAX - n;
    $('#unixKv').innerHTML = '<div><b>' + (left > 0 ? grp(Math.floor(left / 86400)) + ' 天' : '已溢出') + '</b>离 32 位溢出还有</div><div><b>' + grp(MAX) + '</b>32 位能存的最大秒数</div><div><b>约 2920 亿年</b>64 位能用到</div>';
    const say = $('#unixSay');
    if (over) { say.className = 'say bad'; say.innerHTML = '溢出了！数字的最高位（红格）被进位顶成了 1，32 位电脑把它读成一个负数：<b>' + grp(w) + '</b>，以为现在是 1901 年 12 月 13 日。这就是“2038 年问题”。'; }
    else if (left < 30) { say.className = 'say'; say.innerHTML = '只剩 <b>' + left + '</b> 秒。看最左边那个红格。'; }
  }
  function run(){ clearInterval(timer); const t0 = Date.now(); const s0 = offset; timer = setInterval(() => { render(Math.floor(Date.now() / 1000) + s0); }, 250); render(Math.floor(Date.now() / 1000) + s0); }
  $('#unixNow').addEventListener('click', () => { offset = 0; $('#unixSay').className = 'say'; $('#unixSay').textContent = '回到此刻。'; run(); });
  $('#unixJump').addEventListener('click', () => { offset = (MAX - 12) - Math.floor(Date.now() / 1000); $('#unixSay').className = 'say'; $('#unixSay').textContent = '快进到 2038 年 1 月 19 日 11:13:55（北京时间）……'; run(); });
  $('#unixCalc').addEventListener('click', () => {
    const v = $('#unixIn').value, say = $('#unixSay');
    const m = /^(\d{4,})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d))?/.exec(v);
    if (!m) { say.className = 'say bad'; say.textContent = '先选一个日期和时间。'; return; }
    const ms = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)) - 8 * 3600e3, s = Math.floor(ms / 1000);
    const fits = s >= -2147483648 && s <= MAX;
    say.className = 'say ' + (fits ? 'ok' : 'bad');
    say.innerHTML = '北京时间 ' + bj(s) + ' 是 Unix 时间 <b>' + grp(s) + '</b>。' + (s < 0 ? '负数：它在 1970 年以前。' : '') + (fits ? '32 位存得下。' : '32 位存不下，必须用 64 位。');
  });
  onVisible(fig, run, () => clearInterval(timer));
  $('#unixSay').textContent = '这个数每秒加一。';
})();

})();
