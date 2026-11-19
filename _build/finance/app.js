(function(){
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const fmt = (x, d) => Number(x).toLocaleString('zh-CN', {maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: d == null ? 0 : d});
const pct = (x, d) => fmt(x * 100, d == null ? 0 : d) + '%';
const kv = (el, items) => { el.innerHTML = items.map(([v, l, c]) => '<div' + (c ? ' class="' + c + '"' : '') + '><b>' + v + '</b><span>' + l + '</span></div>').join(''); };
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

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

/* 小折线图：series = [{c:颜色, p:[数值...]}]，可带水平参考线 */
function lineChart(svg, series, opt){
  opt = opt || {};
  const kk = Math.min(1.8, Math.max(1, 600 / (svg.clientWidth || 600))), FS = (11 * kk).toFixed(1);
  const W = 600, H = (opt.h || 220) + Math.round(18 * (kk - 1)), L = Math.round(30 + 16 * kk), R = 14, T = 12, B = Math.round(14 + 12 * kk);
  let mx = opt.max != null ? opt.max : -Infinity, mn = opt.min != null ? opt.min : Infinity;
  if (opt.max == null || opt.min == null) series.forEach(s => s.p.forEach(v => { if (opt.max == null) mx = Math.max(mx, v); if (opt.min == null) mn = Math.min(mn, v); }));
  if (opt.lines) opt.lines.forEach(l => { if (opt.max == null) mx = Math.max(mx, l.v); if (opt.min == null) mn = Math.min(mn, l.v); });
  if (mx === mn) mx = mn + 1;
  const n = Math.max(...series.map(s => s.p.length)) - 1 || 1;
  const X = i => L + (W - L - R) * i / n, Y = v => T + (H - T - B) * (1 - (v - mn) / (mx - mn));
  let g = '';
  for (let k = 0; k <= 4; k++) { const v = mn + (mx - mn) * k / 4, y = Y(v); g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" stroke="var(--rule)" stroke-width="1"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" font-size="' + FS + '" fill="var(--ink-3)" font-family="var(--f-mono)">' + (opt.fy ? opt.fy(v) : fmt(v)) + '</text>'; }
  (opt.xl || []).forEach(([i, t]) => { g += '<text x="' + X(i) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="' + FS + '" fill="var(--ink-3)" font-family="var(--f-mono)">' + t + '</text>'; });
  (opt.lines || []).forEach(l => { g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(l.v) + '" y2="' + Y(l.v) + '" stroke="' + l.c + '" stroke-dasharray="4 4" stroke-width="1.5"/>' + (l.t ? '<text x="' + (W - R) + '" y="' + (Y(l.v) - 5) + '" text-anchor="end" font-size="' + FS + '" fill="' + l.c + '">' + l.t + '</text>' : ''); });
  series.forEach(s => { g += '<polyline fill="none" stroke="' + s.c + '" stroke-width="' + (s.w || 2.2) + '" stroke-linejoin="round" points="' + s.p.map((v, i) => X(i).toFixed(1) + ',' + Y(clamp(v, mn, mx)).toFixed(1)).join(' ') + '"/>'; });
  (opt.dots || []).forEach(d => { g += '<circle cx="' + X(d.i) + '" cy="' + Y(clamp(d.v, mn, mx)) + '" r="4" fill="' + d.c + '"/>'; });
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.innerHTML = g;
}

/* ---------- 封面：柜台里外 ---------- */
(function(){
  const svg = $('#heroSvg'), btn = $('#heroBtn'), cap = $('#heroCap');
  if (!svg) return;
  let inside = false;
  function person(x, y, s, c){ return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><circle cx="0" cy="-34" r="13" fill="none" stroke="' + c + '" stroke-width="3"/><path d="M-22,24 Q-22,-14 0,-16 Q22,-14 22,24" fill="none" stroke="' + c + '" stroke-width="3" stroke-linejoin="round"/></g>'; }
  function note(x, y, t, on){ return '<g opacity="' + (on ? 1 : 0) + '" style="transition:opacity .4s"><rect x="' + (x - 4) + '" y="' + (y - 15) + '" width="' + (t.length * 13 + 8) + '" height="21" rx="4" fill="var(--paper)" stroke="var(--gold)"/><text x="' + x + '" y="' + y + '" font-size="12.5" fill="var(--ink)">' + t + '</text></g>'; }
  function draw(){
    let g = '';
    g += '<rect x="0" y="0" width="400" height="250" fill="var(--paper)"/>';
    g += person(300, 92, 1, 'var(--ink-2)');           // 朝奉，坐得高
    g += '<rect x="196" y="112" width="200" height="14" fill="var(--wood)"/>';
    g += '<rect x="206" y="126" width="180" height="124" fill="var(--wood-2)" opacity=".85"/>';
    for (let i = 0; i < 7; i++) g += '<line x1="' + (212 + i * 28) + '" y1="20" x2="' + (212 + i * 28) + '" y2="112" stroke="var(--wood)" stroke-width="4" opacity=".75"/>';
    g += '<line x1="200" y1="20" x2="392" y2="20" stroke="var(--wood)" stroke-width="5"/>';
    g += '<text x="296" y="196" text-anchor="middle" font-size="34" fill="var(--paper)" font-family="var(--f-display)" opacity=".9">当</text>';
    g += person(118, 196, 1, 'var(--zhu)');             // 柜台外的人
    g += '<path d="M140,170 L196,128" stroke="var(--zhu)" stroke-width="3" stroke-linecap="round"/><rect x="176" y="108" width="34" height="22" rx="3" fill="none" stroke="var(--zhu)" stroke-width="2.5" transform="rotate(-18 193 119)"/>';
    g += note(16, 30, '今天要四百文，买种子', !inside);
    g += note(16, 58, '这件袄是新絮的棉花', !inside);
    g += note(214, 152, '对门当铺给四百五', inside);
    g += note(214, 178, '这袄转手卖一千二', inside);
    g += note(214, 204, '十八个月不赎就归我', inside);
    g += note(214, 230, '他看不懂当票上的字', inside);
    svg.innerHTML = g;
  }
  btn.addEventListener('click', () => {
    inside = !inside; draw();
    btn.textContent = inside ? '回到柜台外面' : '走进柜台里面看看';
    btn.setAttribute('aria-pressed', inside ? 'true' : 'false');
    cap.textContent = inside ? '你在柜台里面。你知道行情、知道别家的价、知道东西的去处，还知道对方今天非借不可。' : '你在柜台外面。你只知道自己需要钱，而且今天就要。';
  });
  draw();
})();

/* ---------- 装置 1：十年农家 ---------- */
(function(){
  const box = $('#d1'); if (!box) return;
  const K = [['g', '存粮'], ['m', '铜钱'], ['s', '银镯'], ['L', '买地'], ['f', '借给邻居']];
  const w = {g: 2, m: 2, s: 2, L: 2, f: 2};
  const HV = [{n: '丰年', p: .27, h: 1.3, pr: .7}, {n: '平年', p: .43, h: 1, pr: 1}, {n: '歉年', p: .22, h: .65, pr: 1.7}, {n: '大旱', p: .08, h: .3, pr: 3.2}];
  const alloc = $('#d1alloc');
  alloc.innerHTML = K.map(([k, n]) => '<div class="sl"><span>' + n + '</span><input type="range" min="0" max="10" step="1" value="' + w[k] + '" data-k="' + k + '" aria-label="' + n + '"><output id="d1o' + k + '"></output></div>').join('');
  function shares(){ const t = K.reduce((a, [k]) => a + w[k], 0); const o = {}; K.forEach(([k]) => o[k] = t ? w[k] / t : 0.2); return o; }
  function show(){ const sh = shares(); K.forEach(([k]) => $('#d1o' + k).textContent = fmt(sh[k] * 10, 1) + ' 份'); }
  function setW(o){ K.forEach(([k]) => { w[k] = o[k] || 0; $('input[data-k="' + k + '"]', alloc).value = w[k]; }); show(); }
  alloc.addEventListener('input', e => { const k = e.target.dataset.k; if (k) { w[k] = +e.target.value; show(); } });
  $$('[data-pre]', box).forEach(b => b.addEventListener('click', () => {
    const p = b.dataset.pre;
    setW(p === 'mix' ? {g: 3, m: 1, s: 2, L: 3, f: 1} : {[p]: 10});
  }));
  function pick(){ let x = Math.random(), a = 0; for (const h of HV) { a += h.p; if (x < a) return h; } return HV[HV.length - 1]; }
  const NM = {g: '存粮', m: '铜钱', s: '银镯', L: '地', f: '邻居的人情'};
  function life(sh, log){
    const st = {}; K.forEach(([k]) => st[k] = 10 * sh[k]);
    for (let y = 1; y <= 10; y++) {
      const hv = pick(), war = Math.random() < .07, coin = Math.random() < .06;
      const ev = [];
      if (war) { st.g *= .4; st.s *= .5; st.m *= .7; st.f *= .5; ev.push('兵乱，粮被抢、银镯被抢走一半，邻居逃散'); }
      if (coin) { st.m *= .6; ev.push('朝廷改钱，旧钱缩水四成'); }
      const prod = (14 * hv.h + st.L * .15 * hv.h) * (war ? .5 : 1);
      let tax = 1.5; const pm = Math.min(st.m, tax); st.m -= pm; tax -= pm;
      const net = prod - 10 - tax / hv.pr;
      let fail = null;
      if (net >= 0) {
        st.g += net * sh.g; st.m += net * sh.m * hv.pr; st.s += net * sh.s * hv.pr; st.L += net * sh.L * hv.pr; st.f += net * sh.f;
        if (log) ev.push('收成' + fmt(prod, 1) + '，吃饭交税后余 ' + fmt(net, 1) + ' 份，照比例存下');
      } else {
        let d = -net; const used = [];
        let u = Math.min(st.g, d); if (u > .01) used.push('吃存粮 ' + fmt(u, 1)); st.g -= u; d -= u;
        const fac = hv.h >= 1 ? 1 : hv.h >= .6 ? .5 : .15;
        u = Math.min(st.f * fac, d); if (u > .01) used.push('邻居还来 ' + fmt(u, 1) + (fac < 1 ? '（邻居自己也难）' : '')); st.f -= u; d -= u;
        for (const k of ['m', 's']) { const gr = st[k] / hv.pr; u = Math.min(gr, d); if (u > .01) used.push((k === 'm' ? '花钱' : '卖银镯') + '买粮 ' + fmt(u, 1) + (hv.pr > 1.5 ? '（粮价贵，钱不经花）' : '')); st[k] -= u * hv.pr; d -= u; }
        const gr = st.L * .4 / hv.pr; u = Math.min(gr, d); if (u > .01) used.push('贱卖地换粮 ' + fmt(u, 1)); st.L -= u * hv.pr / .4; d -= u;
        if (log) ev.push('收成只有 ' + fmt(prod, 1) + '，缺 ' + fmt(-net, 1) + ' 份：' + (used.join('；') || '无处可补'));
        if (d > 1e-6) fail = hv.n === '大旱' ? '大旱' : war ? '兵乱' : hv.n;
      }
      if (log) log.push([y, hv.n, ev.join('；'), fail]);
      if (fail) return {ok: false, y, why: fail};
      st.g *= .88;
    }
    return {ok: true, y: 10, wealth: K.reduce((a, [k]) => a + st[k], 0), st};
  }
  const kvel = $('#d1kv'), logel = $('#d1log');
  $('#d1one').addEventListener('click', () => {
    const lg = [], r = life(shares(), lg);
    logel.hidden = false;
    logel.innerHTML = lg.map(([y, n, t, f]) => '<div><span class="y">第' + y + '年 · ' + n + '</span><span class="' + (f ? 'bad' : '') + '">' + t + (f ? '。存的东西都补不上，只好逃荒。' : '') + '</span></div>').join('') + (r.ok ? '<div class="ok">十年挺过来了。家底折合约 ' + fmt(r.wealth, 1) + ' 份（开头是 10 份）。</div>' : '');
    kv(kvel, r.ok ? [['挺过来了', '十年', 'ok'], [fmt(r.wealth, 1) + ' 份', '十年后的家底']] : [['第 ' + r.y + ' 年', '没挺过去', 'bad'], [r.why, '倒在']]);
  });
  $('#d1many').addEventListener('click', () => {
    const sh = shares(); let ok = 0; const ws = [], why = {};
    for (let i = 0; i < 500; i++) { const r = life(sh); if (r.ok) { ok++; ws.push(r.wealth); } else why[r.why] = (why[r.why] || 0) + 1; }
    ws.sort((a, b) => a - b);
    const top = Object.entries(why).sort((a, b) => b[1] - a[1])[0];
    logel.hidden = true;
    kv(kvel, [[pct(ok / 500), '五百户里挺过十年的', ok / 500 > .55 ? 'ok' : 'bad'], [ws.length ? fmt(ws[ws.length >> 1], 1) + ' 份' : '—', '挺过来的人家底中位数'], [top ? top[0] : '—', '最常见的倒下原因']]);
  });
  show();
})();

/* ---------- 装置 2：找零铺 ---------- */
(function(){
  const box = $('#d2'); if (!box) return;
  const WT = 0.62, RATE = 1350, PRICE = 380;
  const I = {w: $('#d2w'), f: $('#d2f'), r: $('#d2r'), s: $('#d2s')};
  const COL = ['var(--zhu)', 'var(--gold)', 'var(--lan)', 'var(--wood-2)', 'var(--jade)'];
  function upd(){
    const w = +I.w.value / 100, f = +I.f.value / 100, r = +I.r.value / 100, s = +I.s.value;
    $('#d2wo').textContent = '−' + fmt(+I.w.value, 1) + '%'; $('#d2fo').textContent = '−' + fmt(+I.f.value, 1) + '%';
    $('#d2ro').textContent = fmt(RATE * (1 - r)) + '文'; $('#d2so').textContent = s + ' 枚';
    const fair = WT * RATE;                       // 公道价下这块银子值多少文
    const v1 = fair * (1 - w), v2 = v1 * (1 - f), v3 = v2 * (1 - r);
    const changeNom = Math.round(v3 - PRICE);     // 店家说找多少
    const coins = Math.round(changeNom * s / 100);
    const fairChange = Math.round(fair - PRICE);
    const cuts = [fair - v1, v1 - v2, v2 - v3, changeNom - coins];
    const lost = fairChange - coins;
    kv($('#d2kv'), [[fmt(fair) + ' 文', '公道价下银子值'], [fmt(fairChange) + ' 文', '本该找回'], [fmt(changeNom) + ' 文', '店家说找你'], [fmt(coins) + ' 枚', '实际数出来的铜钱'], [fmt(lost) + ' 文', '老周少拿', lost > 0 ? 'bad' : 'ok']]);
    const tot = fair;
    const parts = [cuts[0], cuts[1], cuts[2], cuts[3], Math.max(coins, 0)];
    $('#d2stack').innerHTML = parts.map((p, i) => '<i style="width:' + (Math.max(p, 0) / tot * 100) + '%;background:' + COL[i] + '"></i>').join('') + '<i style="width:' + (PRICE / tot * 100) + '%;background:var(--ink-3)"></i>';
    $('#d2leg').innerHTML = ['戥子', '成色', '银价', '短陌', '找回的钱', '买的东西'].map((t, i) => '<span><i style="background:' + (i < 5 ? COL[i] : 'var(--ink-3)') + '"></i>' + t + (i < 4 ? ' ' + fmt(cuts[i]) : '') + '</span>').join('');
    const say = $('#d2say');
    if (lost <= 0) { say.className = 'say ok'; say.innerHTML = '<b>老实店</b>银子按实称、按足色算、按钱铺的价折，一串一百枚。老周拿回 ' + fmt(coins) + ' 文，一文不少。'; }
    else { say.className = 'say bad'; say.innerHTML = '<b>四道手一共抽走 ' + fmt(lost) + ' 文</b>约占这块银子价值的 ' + pct(lost / fair, 1) + '，占该找回的钱的 ' + pct(lost / fairChange) + '。单看每一道都只是“一两个点”。'; }
  }
  Object.values(I).forEach(i => i.addEventListener('input', upd));
  function set(a){ I.w.value = a[0]; I.f.value = a[1]; I.r.value = a[2]; I.s.value = a[3]; upd(); }
  $('#d2fair').addEventListener('click', () => set([0, 0, 0, 100]));
  $('#d2sly').addEventListener('click', () => set([1.5, 1.5, 3, 98]));
  upd();
})();

/* ---------- 装置 3：摇一回会 ---------- */
(function(){
  const box = $('#d3'); if (!box) return;
  const N = 10, C = 100;
  let runRound = 0;
  function bids(mx){ const b = [0, 0]; for (let r = 2; r <= N; r++) b[r] = r === N ? 0 : Math.round(mx * (N - r) / (N - 2)); return b; }
  function calc(mx){
    const b = bids(mx), paid = Array(N + 1).fill(0), got = Array(N + 1).fill(0);
    for (let r = 1; r <= N; r++) {
      for (let k = 1; k <= N; k++) {
        if (k === r) continue;
        const dead = k < r;               // 已经拿过
        let pay = (r === 1 || dead) ? C : C - b[r];
        if (runRound && k === runRound && r > runRound) pay = 0;  // 卷款的人不再交
        paid[k] += pay; got[r] += pay;
      }
    }
    return {b, paid, got};
  }
  function upd(){
    const mx = +$('#d3b').value, me = +$('#d3me').value;
    $('#d3bo').textContent = '让利 ' + mx; $('#d3meo').textContent = '第 ' + me + ' 位';
    const {b, paid, got} = calc(mx);
    let h = '<tr><th>位置</th><th>第几个月拿</th><th class="num">出价让利</th><th class="num">拿到</th><th class="num">总共交出</th><th class="num">净得</th><th>相当于</th></tr>';
    for (let k = 1; k <= N; k++) {
      const net = got[k] - paid[k];
      const role = runRound === k ? '拿了钱，不再交' : k === 1 ? '会头：无息借钱' : net < -1 ? '借钱的人，付了利' : net > 1 ? '存钱的人，赚了利' : '差不多两清';
      const cls = k === me ? 'me' : '';
      h += '<tr class="' + cls + '"><td>' + (k === me ? '你 · ' : '') + k + (runRound === k ? '（卷款跑了）' : '') + '</td><td>第 ' + k + ' 月</td><td class="num">' + (k === 1 ? '—' : b[k]) + '</td><td class="num">' + fmt(got[k]) + '</td><td class="num">' + fmt(paid[k]) + '</td><td class="num" style="color:' + (net < 0 ? 'var(--zhu)' : 'var(--jade)') + '">' + (net > 0 ? '+' : '') + fmt(net) + '</td><td>' + role + '</td></tr>';
    }
    $('#d3t').innerHTML = h;
    const net = got[me] - paid[me], say = $('#d3say');
    if (runRound) {
      const victims = []; for (let k = runRound + 1; k <= N; k++) victims.push(k);
      say.className = 'say bad';
      say.innerHTML = '<b>倒会了</b>第 ' + runRound + ' 个月拿钱的人揣着 ' + fmt(got[runRound]) + ' 文走了，以后每个月少收他一份。吃亏的全是后面还没拿钱的人（第 ' + victims[0] + '—' + N + ' 位），越靠后的人，先交得越多、最后拿回的越少。你坐第 ' + me + ' 位，净得 ' + (net > 0 ? '+' : '') + fmt(net) + ' 文。现实里通常是会头先垫付或者大家散伙，可垫不起的时候，就是一串邻里官司。';
    } else {
      say.className = 'say ' + (net >= 0 ? 'ok' : '');
      say.innerHTML = '<b>你坐第 ' + me + ' 位，净得 ' + (net > 0 ? '+' : '') + fmt(net) + ' 文</b>' + (me === 1 ? '会头第一个月白拿九百文，不付利，代价是张罗、催款、垫付，倒会时第一个被找上门。' : net < 0 ? '你早早拿到一大笔钱，代价是以后月月交足一百，比别人多交了些：这就是你付的利息。' : '你一直让别人先用钱，自己每月少交一点，最后拿一整笔：这就是你赚的利息。') + ' 大家越急、出价越高，坐后面的人赚得越多。';
    }
  }
  $('#d3b').addEventListener('input', upd); $('#d3me').addEventListener('input', upd);
  $('#d3run').addEventListener('click', () => { runRound = 3; upd(); });
  $('#d3ok').addEventListener('click', () => { runRound = 0; upd(); });
  upd();
})();

/* ---------- 装置 4：凑零钱 ---------- */
(function(){
  const box = $('#d4'); if (!box) return;
  const SYS = [
    ['一二五', [1, 2, 5, 10, 20, 50], '人民币、欧元的排法（一到九十九）'],
    ['美国硬币', [1, 5, 10, 25], '一、五、十、二十五美分'],
    ['英国老币', [1, 3, 6, 12, 24, 30], '便士、三便士、六便士、先令、两先令、半克朗（以便士计）'],
    ['只有一和十', [1, 10], '两种面值']
  ];
  let cur = SYS[0][1], curName = SYS[0][0], curNote = SYS[0][2];
  const seg = $('#d4sys');
  seg.innerHTML = SYS.map((s, i) => '<button data-i="' + i + '"' + (i === 0 ? ' class="on"' : '') + '>' + s[0] + '</button>').join('');
  seg.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', seg).forEach(x => x.classList.toggle('on', x === b)); const s = SYS[+b.dataset.i]; cur = s[1]; curName = s[0]; curNote = s[2]; upd(); });
  function dp(den){
    const best = Array(100).fill(Infinity), from = Array(100).fill(0); best[0] = 0;
    for (let n = 1; n < 100; n++) for (const d of den) if (d <= n && best[n - d] + 1 < best[n]) { best[n] = best[n - d] + 1; from[n] = d; }
    return {best, from};
  }
  function greedy(den, n){ let c = 0; const ds = den.slice().sort((a, b) => b - a); for (const d of ds) { c += Math.floor(n / d); n %= d; } return n ? Infinity : c; }
  function upd(){
    const den = cur.slice().sort((a, b) => a - b);
    const sayEl = $('#d4say');
    if (!den.includes(1)) { kv($('#d4kv'), [['凑不齐', '没有“1”，有些数付不出来', 'bad']]); $('#d4tiles').innerHTML = ''; sayEl.className = 'say bad'; sayEl.innerHTML = '<b>少了最小的那一枚</b>没有面值 1，总有些数凑不出来。现实里就要靠“抹零”或“欠着”。'; return; }
    const {best, from} = dp(den);
    let sum = 0, mx = 0, mxn = 1, gfail = 0, gex = 0;
    for (let n = 1; n < 100; n++) { sum += best[n]; if (best[n] > mx) { mx = best[n]; mxn = n; } if (greedy(den, n) > best[n]) { gfail++; if (!gex) gex = n; } }
    kv($('#d4kv'), [[fmt(sum / 99, 2), '平均要几枚'], [mx + ' 枚', '最多要几枚（如 ' + mxn + '）'], [den.length + ' 种', '面值种类'], [gfail ? gfail + ' 个数' : '没有', '“先拿最大的”会多拿', gfail ? 'bad' : 'ok']]);
    let n = clamp(Math.round(+$('#d4n').value || 1), 1, 99); const parts = [];
    let m = n; while (m > 0) { parts.push(from[m]); m -= from[m]; }
    $('#d4tiles').innerHTML = parts.sort((a, b) => b - a).map(d => '<span class="' + (d >= 10 ? 'n' : '') + '">' + d + '</span>').join('') + '<span style="border:0">= ' + n + '，共 ' + parts.length + ' 枚</span>';
    sayEl.className = 'say';
    sayEl.innerHTML = '<b>' + curName + '：' + den.join('、') + '</b>' + curNote + '。' + (gfail ? '有 ' + gfail + ' 个数，收银员习惯的“先拿最大的”会多拿，比如 ' + gex + '：先拿大的要 ' + greedy(den, gex) + ' 枚，最省只要 ' + best[gex] + ' 枚。这种币制让找零的人得动脑子。' : '任何数都可以“先拿最大的”，一路拿下去就是最省的，收银员不用动脑子。这也是一二五受欢迎的原因之一。');
  }
  $('#d4go').addEventListener('click', () => {
    const v = $('#d4c').value.split(/[,，\s、]+/).map(x => Math.round(+x)).filter(x => x > 0 && x < 100);
    cur = [...new Set(v)].slice(0, 6); curName = '你的设计'; curNote = '自定义'; $$('button', seg).forEach(x => x.classList.remove('on')); upd();
  });
  $('#d4n').addEventListener('input', upd);
  upd();
})();

/* ---------- 装置 5：物换物集市 ---------- */
(function(){
  const box = $('#d5'); if (!box) return;
  const G = [['麦', '🌾'], ['陶罐', '🏺'], ['盐', '🧂'], ['布', '🧵'], ['鱼', '🐟'], ['铜刀', '🔪']];
  const P = ['你 · 农夫', '陶匠', '盐商', '织女', '渔夫', '铁匠'];
  let mode = 'b', w, has, seen, got, hold, steps, done;
  function deal(){
    do { w = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - .5); } while (w[0] !== 1 || w.some((x, i) => i > 0 && x === i));
    has = [0, 1, 2, 3, 4, 5]; seen = [true, false, false, false, false, false]; got = Array(6).fill(false);
    hold = 0; steps = 0; done = false; draw();
    say('', '<b>开集了</b>' + (mode === 'b' ? '你手里是麦子，想要陶罐。点一个人，问他换不换。' : '集市上有人吆喝着收麦子。点一个人，卖麦子换银子，再拿银子买陶罐。'));
  }
  function say(c, h){ const s = $('#d5say'); s.className = 'say ' + c; s.innerHTML = h; }
  function draw(){
    $('#d5mkt').innerHTML = P.map((p, i) => {
      const g = i === 0 ? (hold === 's' ? ['银子', '🪙'] : G[hold]) : G[has[i]];
      const want = i === 0 ? G[1][0] : (seen[i] || mode === 's' ? G[w[i]][0] : '？');
      return '<button data-i="' + i + '" class="' + (i === 0 ? 'on' : got[i] ? 'got' : '') + '"' + (i === 0 ? ' disabled' : '') + '><span class="e">' + g[1] + '</span>' + p + '<small>手里：' + g[0] + ' · 想要：' + (got[i] ? '已换到' : want) + '</small></button>';
    }).join('');
    kv($('#d5kv'), [[steps + ' 次', '问了几个人'], [done ? '换到了' : '还没换到', '陶罐', done ? 'ok' : '']]);
  }
  $('#d5mkt').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || done) return;
    const i = +b.dataset.i; if (i === 0) return;
    if (got[i]) { say('', '<b>' + P[i] + '</b>他已经换到想要的了，不再换。'); return; }
    steps++; seen[i] = true;
    if (mode === 'b') {
      if (w[i] === hold) {
        const give = has[i], prev = hold; has[i] = hold; got[i] = true; hold = give;
        if (hold === 1) { done = true; say('ok', '<b>换到陶罐了，问了 ' + steps + ' 个人</b>' + (steps === 1 ? '运气好，陶匠正好想要麦子：这就是“需求的双重巧合”。多开几次集，看看这种运气有多少见。' : '你绕了一圈：拿麦子换来自己不要的东西，再拿它去换别人要的……每一步都得碰上一个正好想要你手里东西的人。'));
        } else say('', '<b>' + P[i] + '正好要' + G[prev][0] + '，换成了</b>你现在手里是' + G[hold][0] + '。可你要的是陶罐，得再找想要' + G[hold][0] + '的人。');
      } else say('bad', '<b>' + P[i] + '摇头</b>他不要' + G[hold][0] + '，他想要' + G[w[i]][0] + '。');
    } else {
      if (hold === 0 && w[i] === 0) { hold = 's'; got[i] = true; has[i] = 0; say('', '<b>' + P[i] + '收了你的麦子，给你一块银子</b>现在拿银子去找有陶罐的人。'); }
      else if (hold === 's' && has[i] === 1) { hold = 1; done = true; say('ok', '<b>买到陶罐了，问了 ' + steps + ' 个人</b>有了银子，谁想要你的麦子、谁有你要的陶罐，是两件分开的事，不用碰巧凑在同一个人身上。'); }
      else if (hold === 0) say('bad', '<b>' + P[i] + '</b>他不收麦子（他想要' + G[w[i]][0] + '）。看看谁在吆喝收麦。');
      else say('bad', '<b>' + P[i] + '</b>他卖的是' + G[has[i]][0] + '，不是陶罐。');
    }
    draw();
  });
  $('#d5mode').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; mode = b.dataset.m; $$('button', $('#d5mode')).forEach(x => x.classList.toggle('on', x === b)); deal(); });
  $('#d5new').addEventListener('click', deal);
  deal();
})();

/* ---------- 装置 6：称出汇率 ---------- */
(function(){
  const box = $('#d6'); if (!box) return;
  const C = [['本洋（西班牙八里亚尔）', 27.07, .896, 's'], ['鹰洋（墨西哥银元）', 27.07, .9027, 's'], ['库平纹银一两', 37.3, .935, 's'], ['美国一元银币', 26.73, .9, 's'], ['威尼斯杜卡特金币', 3.5, .997, 'g'], ['英国金镑', 7.988, .9167, 'g']];
  const A = $('#d6a'), B = $('#d6b');
  [A, B].forEach(s => s.innerHTML = C.map((c, i) => '<option value="' + i + '">' + c[0] + '</option>').join(''));
  A.value = 0; B.value = 2;
  function upd(){
    const a = C[+A.value], b = C[+B.value], r = +$('#d6r').value, d = +$('#d6d').value / 100, s = +$('#d6s').value / 100;
    $('#d6ro').textContent = '1 : ' + r; $('#d6do').textContent = d ? '−' + Math.round(d * 100) + '%' : '不降'; $('#d6so').textContent = fmt(s * 100, 1) + '%';
    const fineA = a[1] * a[2] * (1 - d), fineB = b[1] * b[2];
    const eqA = fineA * (a[3] === 'g' ? r : 1), eqB = fineB * (b[3] === 'g' ? r : 1);
    const rate = eqA / eqB;
    const nm = x => x[0].replace(/（.*）/, '');
    kv($('#d6kv'), [[fmt(fineA, 2) + ' 克', '甲含纯' + (a[3] === 'g' ? '金' : '银')], [fmt(fineB, 2) + ' 克', '乙含纯' + (b[3] === 'g' ? '金' : '银')], [fmt(rate, rate < 10 ? 4 : 2), '1 甲按分量换几个乙'], [fmt(rate * (1 - s), rate < 10 ? 4 : 2) + ' / ' + fmt(rate * (1 + s), rate < 10 ? 4 : 2), '换钱的人：收 / 卖']]);
    let h;
    if (A.value === B.value) h = '<b>同一种钱</b>换来换去，只给换钱的人白送差价。';
    else if (d > 0) h = '<b>甲变薄了 ' + Math.round(d * 100) + '%</b>按分量，现在 1 甲只值 ' + fmt(rate, 4) + ' 乙。可如果国王下令新旧甲一律按原价流通，聪明人就会把成色足的旧甲藏起来、熔掉或者运到外国，只拿新甲出来花。市面上很快只剩薄的：这就是“劣币驱逐良币”，《点石成金》<a href="../money/#v4">卷四「剪」</a>讲过。';
    else if (+A.value === 0 && +B.value === 2) h = '<b>按含银量，一枚本洋约合 ' + fmt(rate, 3) + ' 两纹银</b>可清代江南的习惯价是“每元七钱二分”上下，比含银量还高一点：多出来的那部分，是大家认这枚钱的“牌子”。';
    else if (a[3] !== b[3]) h = '<b>金币换银币，看金银比价</b>比价从 1:15 拉到 1:8，同一枚金币能换的银币就少了将近一半。明代中国的比价比欧洲低得多，于是白银向中国流、黄金向外流。';
    else h = '<b>按分量换</b>两种钱都实打实，汇率就是含' + (a[3] === 'g' ? '金' : '银') + '量之比，再加上换钱的人那道差价。';
    $('#d6say').innerHTML = h;
  }
  [A, B].forEach(s => s.addEventListener('change', upd));
  ['#d6r', '#d6d', '#d6s'].forEach(id => $(id).addEventListener('input', upd));
  upd();
})();

/* ---------- 装置 7：轧差 ---------- */
(function(){
  const box = $('#d7'); if (!box) return;
  const CT = ['平遥', '汉口', '苏州'], POS = [[300, 46], [110, 196], [490, 196]];
  const START = [[0, 1, 800], [1, 0, 500], [2, 0, 600], [0, 2, 300], [1, 2, 400], [2, 1, 700]];
  let L = START.map(x => x.slice());
  function upd(){
    $('#d7t').innerHTML = '<tr><th>#</th><th>从</th><th>到</th><th class="num">银两</th></tr>' + L.map((x, i) => '<tr><td>' + (i + 1) + '</td><td>' + CT[x[0]] + '</td><td>' + CT[x[1]] + '</td><td class="num">' + fmt(x[2]) + '</td></tr>').join('');
    const gross = L.reduce((a, x) => a + x[2], 0);
    const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; L.forEach(([a, b, v]) => M[a][b] += v);
    const pairs = []; let bil = 0;
    for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) { const n = M[a][b] - M[b][a]; if (n) pairs.push(n > 0 ? [a, b, n] : [b, a, -n]); bil += Math.abs(n); }
    const pos = [0, 0, 0]; L.forEach(([a, b, v]) => { pos[a] -= v; pos[b] += v; });
    const multi = pos.filter(x => x > 0).reduce((a, x) => a + x, 0);
    const mx = Math.max(...pairs.map(p => p[2]), 1);
    let g = '<defs><marker id="d7ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="var(--zhu)"/></marker></defs>';
    for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) g += '<line x1="' + POS[a][0] + '" y1="' + POS[a][1] + '" x2="' + POS[b][0] + '" y2="' + POS[b][1] + '" stroke="var(--rule)" stroke-width="' + (2 + (M[a][b] + M[b][a]) / 120) + '" stroke-linecap="round"/>';
    pairs.forEach(([a, b, v]) => {
      const [x1, y1] = POS[a], [x2, y2] = POS[b], dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      const sx = x1 + ux * 46, sy = y1 + uy * 30, ex = x2 - ux * 46, ey = y2 - uy * 30;
      g += '<line x1="' + sx + '" y1="' + sy + '" x2="' + ex + '" y2="' + ey + '" stroke="var(--zhu)" stroke-width="' + (2 + 6 * v / mx) + '" marker-end="url(#d7ar)"/>';
      g += '<text x="' + ((sx + ex) / 2 - uy * 16) + '" y="' + ((sy + ey) / 2 + ux * 16 + 4) + '" text-anchor="middle" font-size="14" font-family="var(--f-mono)" fill="var(--zhu)">' + fmt(v) + '</text>';
    });
    POS.forEach(([x, y], i) => { g += '<rect x="' + (x - 40) + '" y="' + (y - 18) + '" width="80" height="36" rx="6" fill="var(--card)" stroke="var(--wood)" stroke-width="2"/><text x="' + x + '" y="' + (y + 6) + '" text-anchor="middle" font-size="17" fill="var(--ink)" font-family="var(--f-display)">' + CT[i] + '</text>'; });
    $('#d7svg').innerHTML = g;
    kv($('#d7kv'), [[fmt(gross) + ' 两', '各运各的：总共押运'], [fmt(bil) + ' 两', '两两相抵后要运（图中红箭头）'], [fmt(multi) + ' 两', '三地一起轧差后只需运', 'ok'], [fmt(gross * .02) + ' → ' + fmt(multi * .02), '押运费（两）']]);
    $('#d7say').innerHTML = '<b>' + L.length + ' 笔汇款，真正要动的银子只有 ' + pct(multi / gross) + '</b>灰线是全部往来，红箭头是两城之间相抵后剩下的差额。如果三地的票号连成一张网、一起结算，' + CT.map((c, i) => c + (pos[i] > 0 ? '净收 ' + fmt(pos[i]) : pos[i] < 0 ? '净付 ' + fmt(-pos[i]) : '收付相抵')).join('，') + '。往来越多、方向越乱，轧差省得越多。';
  }
  $('#d7add').addEventListener('click', () => { if (L.length >= 14) L.shift(); let a = Math.floor(Math.random() * 3), b = (a + 1 + Math.floor(Math.random() * 2)) % 3; L.push([a, b, 100 * (2 + Math.floor(Math.random() * 8))]); upd(); });
  $('#d7reset').addEventListener('click', () => { L = START.map(x => x.slice()); upd(); });
  upd();
})();

/* ---------- 装置 8：四柱清册 ---------- */
(function(){
  const box = $('#d8'); if (!box) return;
  const OLD = 1000;
  const E = [['收', '卖茶三十担', 420], ['收', '收回汉口欠款', 260], ['收', '收铺面租金', 36], ['支', '买进新茶', 310], ['支', '伙计工钱', 54], ['支', '运费与关税', 78], ['支', '修仓房', 45], ['支', '县衙规费', 30]];
  let rows, bad, opened, found;
  function deal(){
    bad = Math.floor(Math.random() * E.length);
    const delta = 10 * (2 + Math.floor(Math.random() * 5));
    rows = E.map((e, i) => ({t: e[0], d: e[1], v: e[2], rec: i === bad ? (e[0] === '收' ? e[2] + delta : e[2] - delta) : e[2]}));
    opened = new Set(); found = false; draw();
    $('#d8say').className = 'say'; $('#d8say').innerHTML = '<b>银柜里少了 ' + delta + ' 两</b>账上的“实在”比你亲手点的多 ' + delta + ' 两。是哪一笔？点开看单据。';
  }
  function draw(){
    const inc = rows.filter(r => r.t === '收').reduce((a, r) => a + r.rec, 0), out = rows.filter(r => r.t === '支').reduce((a, r) => a + r.rec, 0);
    const cash = OLD + rows.reduce((a, r) => a + (r.t === '收' ? r.v : -r.v), 0);
    $('#d8four').innerHTML = [['旧管', OLD], ['新收', inc], ['开除', out], ['实在', OLD + inc - out]].map(([n, v]) => '<div><b>' + fmt(v) + '</b><span>' + n + '</span></div>').join('') + '';
    $('#d8rows').innerHTML = rows.map((r, i) => '<div class="row' + (opened.has(i) ? (i === bad ? ' right' : ' picked') : '') + '" data-i="' + i + '" role="button" tabindex="0"><span>' + r.t + '</span><span class="d">' + r.d + (opened.has(i) ? '　<small style="color:var(--ink-3)">单据：' + fmt(r.v) + ' 两' + (i === bad ? '，账上写 ' + fmt(r.rec) : '，相符') + '</small>' : '') + '</span><span style="text-align:right">' + fmt(r.rec) + ' 两</span></div>').join('') + '<div class="row" style="cursor:default"><span></span><span class="d">你亲手点的银柜</span><span style="text-align:right;color:var(--zhu)">' + fmt(cash) + ' 两</span></div>';
  }
  function open(i){
    if (found || opened.has(i)) return; opened.add(i); draw();
    if (i === bad) {
      found = true; const r = rows[i];
      $('#d8say').className = 'say ok';
      $('#d8say').innerHTML = '<b>找到了，查了 ' + opened.size + ' 笔</b>“' + r.d + '”单据上是 ' + fmt(r.v) + ' 两，账上写成了 ' + fmt(r.rec) + ' 两。四柱的那条铁律只能告诉你“有错”，单据才能告诉你“错在哪”。更麻烦的是另一种情况：账房若是把开支写多、再配一张假单据，把钱揣进自己口袋，账和银柜就是对得上的。所以光会算平还不够，后来才有了复式记账、盘点存货、东家亲自查柜、外请的人来审账。';
    }
  }
  $('#d8rows').addEventListener('click', e => { const r = e.target.closest('.row[data-i]'); if (r) open(+r.dataset.i); });
  $('#d8rows').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const r = e.target.closest('.row[data-i]'); if (r) { e.preventDefault(); open(+r.dataset.i); } } });
  $('#d8new').addEventListener('click', deal);
  deal();
})();

/* ---------- 装置 9：一张永远不到期的债 ---------- */
(function(){
  const box = $('#d9'); if (!box) return;
  const CP = 25, Y0 = 1648, Y1 = 2025, N = Y1 - Y0;
  function upd(){
    const r = +$('#d9r').value / 100, i = +$('#d9i').value / 100;
    $('#d9ro').textContent = fmt(r * 100, 1) + '%'; $('#d9io').textContent = fmt(i * 100, 2) + '%';
    const price = CP / r, real = CP / Math.pow(1 + i, N);
    const comp = 1000 * Math.pow(1.05, N);
    kv($('#d9kv'), [[fmt(price) + ' 盾', '这张债今天能卖'], [fmt(real, real < 1 ? 3 : 2) + ' 盾', '今天的 25 盾，按 1648 年的购买力只值', 'bad'], [comp > 1e8 ? fmt(comp / 1e8, 0) + ' 亿盾' : fmt(comp) + ' 盾', '若 1000 盾按 5% 复利滚 ' + N + ' 年']]);
    const pts = []; for (let t = 0; t <= N; t += 3) pts.push(CP / Math.pow(1 + i, t));
    lineChart($('#d9svg'), [{c: 'var(--zhu)', p: pts}], {min: 0, max: CP, h: 200, fy: v => fmt(v), xl: [[0, '1648'], [Math.round(100 / 3), '1748'], [Math.round(200 / 3), '1848'], [100, '1948'], [pts.length - 1, '2025']]});
    $('#d9say').innerHTML = '<b>利率 ' + fmt(r * 100, 1) + '%，这张债值 ' + fmt(price) + ' 盾</b>' + (r < .025 ? '利率比它的票面利息还低，它就比面值贵。' : r > .025 ? '市场利率比它的利息高，谁也不愿按面值买它。' : '市场利率正好等于它的利息，它就值面值。') + ' 至于持有它三百多年的人：每年准时领到 25 盾，一次都没被赖账，可按年均 ' + fmt(i * 100, 2) + '% 的通胀算，这 25 盾的购买力只剩当年的 ' + pct(real / CP, real / CP < .01 ? 2 : 1) + '。不违约，也会被时间慢慢吃掉。复利那一格是另一面：如果利息真能一直利滚利，水务局今天早就破产了，这也是为什么现实里的复利神话总会撞上墙。';
  }
  ['#d9r', '#d9i'].forEach(id => $(id).addEventListener('input', upd));
  upd();
})();

/* ---------- 装置 10：十条船 ---------- */
(function(){
  const box = $('#d10'); if (!box) return;
  let lazy = 0;
  function sim(){
    const T = 20, OWN = 1000, G = 10, pSolo = .1, pIns = lazy ? .15 : .1;
    let soloDead = 0, poolDead = 0, soloSum = 0, poolSum = 0, soloPath = null, poolPath = null;
    for (let o = 0; o < OWN; o++) {
      let w = 100, dead = false; const path = [w];
      for (let t = 0; t < T; t++) { if (!dead) { if (Math.random() < pSolo) { w -= 100; dead = true; } else w += 20; } path.push(w); }
      if (dead) soloDead++; soloSum += w; if (o === 0) soloPath = path;
    }
    for (let g = 0; g < OWN / G; g++) {
      const W = Array(G).fill(100), dead = Array(G).fill(false), path = [100];
      for (let t = 0; t < T; t++) {
        const sunk = W.map(() => Math.random() < pIns);
        const k = sunk.filter(Boolean).length, share = k * 100 / G;
        for (let j = 0; j < G; j++) { if (dead[j]) continue; W[j] += (sunk[j] ? 0 : 20) - share; if (W[j] <= 0) dead[j] = true; }
        path.push(W[0]);
      }
      dead.forEach(d => { if (d) poolDead++; }); W.forEach(x => poolSum += x); if (g === 0) poolPath = path;
    }
    kv($('#d10kv'), [[pct(soloDead / OWN), '自己扛：破产的船东', 'bad'], [pct(poolDead / OWN, 1), '十家互保：破产的船东', poolDead / OWN < .05 ? 'ok' : 'bad'], [fmt(soloSum / OWN) + ' / ' + fmt(poolSum / OWN), '二十趟后平均身家（自己扛 / 互保）']]);
    lineChart($('#d10svg'), [{c: 'var(--zhu)', p: soloPath}, {c: 'var(--jade)', p: poolPath}], {h: 200, lines: [{v: 0, c: 'var(--ink-3)', t: '破产线'}], xl: [[0, '出发'], [10, '第 10 趟'], [20, '第 20 趟']]});
    $('#d10say').innerHTML = lazy
      ? '<b>有人偷懒以后</b>互保的船东沉船机会从一成升到一成五，大家平摊的损失也跟着变大，平均身家明显缩水，破产的也多了。自己扛的船东不受影响：没人替他兜底，他自然会好好修船。这就是道德风险，保险公司后来发明了免赔额、查验船只、按记录定保费，都是为了对付它。'
      : '<b>平均赚的一样，命运完全不同</b>两种船东每趟的“平均收益”其实相同，都是赚 20 的九成减去赔 100 的一成。差别在于：自己扛的人只要碰上一次沉船就出局，跑满二十趟还活着的只有一成多；十家互保把一次致命的大损失，摊成了十份可以承受的小损失。保险不会让沉船变少，它让沉船不再要人的命。';
  }
  $('#d10mode').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; lazy = +b.dataset.m; $$('button', $('#d10mode')).forEach(x => x.classList.toggle('on', x === b)); sim(); });
  $('#d10go').addEventListener('click', sim);
  sim();
})();

/* ---------- 装置 11：杠杆 ---------- */
(function(){
  const box = $('#d11'); if (!box) return;
  let path = null;
  function gauss(){ let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function newPath(){ const p = [100]; for (let d = 1; d <= 250; d++) { let r = .0004 + .011 * gauss(); if (Math.random() < .006) r -= .06 + .04 * Math.random(); p.push(p[d - 1] * (1 + r)); } return p; }
  function run(){
    if (!path) path = newPath();
    const L = +$('#d11l').value; $('#d11lo').textContent = L + ' 倍';
    const eq = [100]; let liq = -1;
    for (let d = 1; d < path.length; d++) {
      if (liq >= 0) { eq.push(eq[d - 1]); continue; }
      const e = L * 100 * path[d] / path[0] - (L - 1) * 100;
      eq.push(e); if (e < 25) liq = d;
    }
    let peak = path[0], mdd = 0; path.forEach(v => { peak = Math.max(peak, v); mdd = Math.max(mdd, 1 - v / peak); });
    const fin = eq[eq.length - 1];
    kv($('#d11kv'), [[fmt(path[path.length - 1] - 100, 1) + '%', '这一年价格涨跌'], [pct(mdd, 1), '中途最大跌幅'], [fmt(fin, 1), '你的本钱（开头 100）', fin < 100 ? 'bad' : 'ok'], [liq >= 0 ? '第 ' + liq + ' 天' : '没有', '爆仓', liq >= 0 ? 'bad' : '']]);
    const mx = Math.max(...path, ...eq, 120), mn = Math.min(0, ...eq, ...path);
    lineChart($('#d11svg'), [{c: 'var(--ink-3)', p: path, w: 1.6}, {c: 'var(--zhu)', p: eq}], {h: 220, max: mx, min: mn, lines: [{v: 25, c: 'var(--zhu)', t: '强行平仓线'}], dots: liq >= 0 ? [{i: liq, v: eq[liq], c: 'var(--zhu)'}] : [], xl: [[0, '年初'], [125, '年中'], [250, '年末']]});
    const say = $('#d11say');
    if (liq >= 0) { say.className = 'say bad'; say.innerHTML = '<b>' + L + ' 倍杠杆，第 ' + liq + ' 天爆仓</b>那一天价格' + (path[liq] < 100 ? '比年初跌了 ' + fmt(100 - path[liq], 1) + '%' : '还比年初高一点，但比你买入后的高点跌了不少') + '。' + (fin < 0 ? '跳空下跌太快，平仓时连本钱都不够还，你还倒欠债主 ' + fmt(-fin, 1) + '。' : '剩下的本钱被强行收走。') + (path[path.length - 1] > path[liq] ? ' 讽刺的是，价格后来又涨回去了，可你已经不在场上了。' : '') + ' 杠杆不改变你看对还是看错，只决定你能不能熬到看对的那一天。'; }
    else { say.className = 'say ' + (fin >= 100 ? 'ok' : ''); say.innerHTML = '<b>' + L + ' 倍杠杆，活过了这一年</b>价格涨跌 ' + fmt(path[path.length - 1] - 100, 1) + '%，你的本钱变成 ' + fmt(fin, 1) + '。换成更高的倍数，用“同一段行情”再看一遍。'; }
  }
  $('#d11go').addEventListener('click', () => { path = newPath(); run(); });
  $('#d11same').addEventListener('click', run);
  $('#d11l').addEventListener('input', run);
  run();
})();

/* ---------- 装置 12：你来当庞氏 ---------- */
(function(){
  const box = $('#d12'); if (!box) return;
  function run(){
    const r = +$('#d12r').value / 100; $('#d12ro').textContent = fmt(r * 100) + '% / 月';
    const M = 10000, q = .6, w = .02, sd = .002, s = .25 * Math.sqrt(r);
    let A = 0, C = 0, B = 0, R = 0, P = 0, end = 0; const sR = [0], sB = [0], sC = [0], newHist = [];
    for (let t = 1; t <= 360; t++) {
      const nw = s * (A / M + sd) * (M - A); A += nw; R += nw; newHist.push(nw);
      const pay = q * r * B + w * B; C += nw;
      if (C < pay) { end = t; break; }
      C -= pay; P += pay; B = B * (1 + r) - pay + nw;
      sR.push(R); sB.push(B); sC.push(C);
    }
    const months = end || 360, loss = Math.max(B - C, 0);
    const last3 = newHist.slice(-3).reduce((a, x) => a + x, 0);
    kv($('#d12kv'), [[months >= 360 ? '30 年还没倒' : months + ' 个月', '撑了多久'], [fmt(R) + ' 万', '一共收进来'], [fmt(P) + ' 万', '付出去的“收益”和提款'], [fmt(loss) + ' 万', '崩盘时欠投资人', 'bad']]);
    lineChart($('#d12svg'), [{c: 'var(--jade)', p: sR}, {c: 'var(--zhu)', p: sB}, {c: 'var(--gold)', p: sC}], {h: 210, min: 0, fy: v => fmt(v), xl: [[0, '开张'], [sR.length - 1, end ? '第 ' + end + ' 月崩盘' : '第 360 月']]});
    const yr = months / 12;
    const like = r >= .3 ? '这是米勒、庞兹的速度：许诺吓人，人潮涌来，不到一年就倒。' : r >= .08 ? '许诺高得显眼，两三年内就撑不住。' : r >= .03 ? '许诺不算离谱，能撑好几年，骗走的钱多得多。' : '这是麦道夫的路子：许诺平平无奇、年年稳定，没人起疑，撑了二三十年，卷走的钱最多。';
    $('#d12say').innerHTML = '<b>许诺每月 ' + fmt(r * 100) + '%，撑了 ' + (months >= 360 ? '三十年以上' : (yr >= 2 ? fmt(yr, 1) + ' 年' : months + ' 个月')) + '</b>' + like + ' 注意那条金色的线：手里的现金一直远远小于红线（账面上欠投资人的钱）。从第一天起，这个窟窿就在，只是每个月都被新来的钱盖住了。最后三个月进来的人，投了约 ' + fmt(last3) + ' 万，几乎一分也拿不回来。';
  }
  $('#d12r').addEventListener('input', run); $('#d12go').addEventListener('click', run);
  run();
})();

/* ---------- 装置 13：驴打滚与一本一利 ---------- */
(function(){
  const box = $('#d13'); if (!box) return;
  const P = 10;
  function upd(){
    const r = +$('#d13r').value / 100, Y = +$('#d13y').value, M = Y * 12;
    $('#d13ro').textContent = fmt(r * 100, 1) + '%（' + (r * 10 % 1 ? fmt(r * 10, 2) : fmt(r * 10, 0)) + ' 分）'; $('#d13yo').textContent = Y + ' 年';
    const ming = m => P + Math.min(P * Math.min(r, .03) * m, P), roll = m => P * Math.pow(1 + r, m);
    const a = [], b = []; for (let m = 0; m <= M; m++) { a.push(ming(m)); b.push(roll(m)); }
    const dbl = Math.ceil(Math.log(2) / Math.log(1 + r)), ten = Math.ceil(Math.log(10) / Math.log(1 + r));
    const ym = m => m >= 12 ? fmt(m / 12, 1) + ' 年' : m + ' 个月';
    kv($('#d13kv'), [[fmt(ming(M), 1) + ' 两', '按大明律，' + Y + ' 年后最多', 'ok'], [fmt(roll(M), 1) + ' 两', '驴打滚，' + Y + ' 年后', 'bad'], [ym(dbl), '驴打滚翻一倍'], [ym(ten), '驴打滚变十倍']]);
    lineChart($('#d13svg'), [{c: 'var(--jade)', p: a}, {c: 'var(--zhu)', p: b}], {h: 210, min: 0, fy: v => fmt(v), lines: [{v: 20, c: 'var(--jade)', t: '一本一利的顶'}], xl: [[0, '借时'], [M, Y + ' 年后']]});
    $('#d13say').innerHTML = '<b>同样借十两，' + Y + ' 年后：律法上的顶是 ' + fmt(ming(M), 1) + ' 两，驴打滚是 ' + fmt(roll(M), 1) + ' 两</b>' + (r > .03 ? '你选的月息 ' + fmt(r * 100, 1) + '% 已经超过律法的三分上限，按大明律只能按三分算，超出部分是违法的。' : '') + '“一本一利”把总账压在本金的两倍以内，等于给穷人的债务装了一道闸；驴打滚没有闸，' + ym(dbl) + '翻一倍，' + ym(ten) + '变十倍。晁错说的“卖田宅鬻子孙以偿责”（第一章），多半就发生在这条红线往上翘的地方。';
  }
  ['#d13r', '#d13y'].forEach(id => $(id).addEventListener('input', upd));
  upd();
})();

/* ---------- 装置 14：守住汇率 ---------- */
(function(){
  const box = $('#d14'); if (!box) return;
  let S;
  function reset(){ S = {R: 360, c: .55, E: 100, ip: 0, t: 0, over: false, rate: 25}; $('#d14log').innerHTML = ''; show('', '<b>市场开盘</b>挂钩汇率 25 兑 1 美元，储备 360 亿美元。市场上有人开始抛售本币。'); }
  function show(cls, h){
    kv($('#d14kv'), [[S.t + ' / 8', '回合'], [fmt(Math.max(S.R, 0)) + ' 亿', '外汇储备', S.R < 80 ? 'bad' : ''], [pct(S.c), '市场信心', S.c < .35 ? 'bad' : ''], [fmt(S.E), '经济指数（开头 100）', S.E < 70 ? 'bad' : ''], [fmt(S.rate, 1), '汇率（本币兑 1 美元）', S.rate > 25 ? 'bad' : '']]);
    const s = $('#d14say'); s.className = 'say ' + cls; s.innerHTML = h;
  }
  function log(t, cls){ const d = document.createElement('div'); d.innerHTML = '<span class="y">第 ' + S.t + ' 回合</span><span class="' + (cls || '') + '">' + t + '</span>'; $('#d14log').prepend(d); }
  function float(forced){
    const d = .2 + .7 * (1 - S.c);
    S.rate = 25 * (1 + d); S.E = Math.max(0, S.E - 12 - 30 * (1 - S.c)); S.over = true;
    log((forced ? '储备耗尽，被迫' : '主动') + '放弃挂钩，本币一夜跌到 ' + fmt(S.rate, 1) + ' 兑 1 美元。', 'bad');
    show('bad', '<b>' + (forced ? '守不住了' : '你放弃了挂钩') + '：本币贬值 ' + pct(d) + '</b>企业欠的每一美元外债，按本币算都变成了原来的 ' + fmt(1 + d, 2) + ' 倍，大批借了美元的企业会撑不下去，经济指数跌到 ' + fmt(S.E) + '。' + (forced ? '这是 1997 年泰国的路：储备打光才放手，代价最大。' : (S.t <= 2 ? '早放手，损失的储备少，信心还没彻底垮；1992 年英国加息两次后当晚退出，事后看反而恢复得快。' : '拖到中途才放手，储备已经花掉不少。')));
  }
  function act(a){
    if (S.over) return;
    if (a === 'float') { S.t++; float(false); return; }
    S.t++;
    let press = 20 + 60 * (1 - S.c) + 15 * Math.random();
    let note = '';
    if (a === 'rate' || a === 'both') { press *= .5; S.ip += 3; S.E -= 4; S.c += a === 'both' ? .12 : .05; note = '加息到 +' + S.ip + ' 个点，做空变贵了，抛压减半；'; }
    const spend = press + (a === 'both' ? 10 : 0);
    S.R -= spend; S.E -= Math.min(S.ip, 12) * .3;
    S.c -= .03 + Math.max(0, (360 - S.R) / 3000) - (a === 'sell' ? 0 : .02);
    S.c = clamp(S.c, .05, .95); S.E = Math.max(0, S.E);
    if (S.R <= 0) { log(note + '市场抛出约 ' + fmt(press) + ' 亿，储备不够接了。', 'bad'); float(true); return; }
    log(note + '市场抛出约 ' + fmt(press) + ' 亿，你动用储备 ' + fmt(spend) + ' 亿接住。');
    if (S.t >= 8) {
      S.over = true;
      show(S.E >= 70 ? 'ok' : '', '<b>守住了，八个回合，汇率没动</b>还剩储备 ' + fmt(S.R) + ' 亿，经济指数 ' + fmt(S.E) + '。' + (S.ip >= 9 ? '代价是利率加了 ' + S.ip + ' 个点，企业和买房的人借钱贵得多，经济被压得不轻：1998 年香港守住联系汇率时，同业拆借利率一度飙得很高，楼市股市都吃了大苦头。' : '储备够厚、信心没垮，投机者会转身去找更弱的目标。') + ' 守汇率从来没有免费的办法：花储备、伤经济、或者贬值，三选一，最多挑两样。');
    } else show('', '<b>第 ' + S.t + ' 回合过去了</b>储备还剩 ' + fmt(S.R) + ' 亿。储备越少，市场越不信你守得住，下一回合抛得越凶。');
  }
  $$('[data-a]', box).forEach(b => b.addEventListener('click', () => { const a = b.dataset.a; if (a === 'reset') reset(); else act(a); }));
  reset();
})();

/* ---------- 装置 15：积累莫返 ---------- */
(function(){
  const box = $('#d15'); if (!box) return;
  const NAMES = ['辽饷', '加耗', '摊派', '杂役折银', '厘金', '附加', '规费', '捐输', '车马费', '门摊', '差徭', '练饷', '火耗', '契税附加'];
  let stages, cur, reforms;
  function reset(){ cur = {base: 70, extra: [['火耗', 10], ['摊派', 8], ['杂役折银', 12]]}; stages = [{label: '起初', base: cur.base, extra: cur.extra.slice()}]; reforms = 0; draw('<b>起初</b>正税之外，已经有几项杂派。总负担记为 100。'); }
  const tot = s => s.base + s.extra.reduce((a, x) => a + x[1], 0);
  function push(label){ stages.push({label, base: cur.base, extra: cur.extra.map(x => x.slice())}); if (stages.length > 9) stages.splice(1, 1); }
  function draw(msg){
    const kk = Math.min(1.8, Math.max(1, 600 / ($('#d15svg').clientWidth || 600))), FS = (11 * kk).toFixed(1);
    const W = 600, H = 220 + Math.round(30 * (kk - 1)), L = Math.round(26 + 16 * kk), B = Math.round(18 + 16 * kk), T = 14;
    const mx = Math.max(160, ...stages.map(tot)) * 1.08;
    const bw = (W - L - 10) / stages.length;
    const Y = v => T + (H - T - B) * (1 - v / mx);
    let g = '';
    for (let k = 0; k <= 4; k++) { const v = mx * k / 4; g += '<line x1="' + L + '" x2="' + W + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--rule)"/><text x="' + (L - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end" font-size="' + FS + '" fill="var(--ink-3)" font-family="var(--f-mono)">' + fmt(v) + '</text>'; }
    g += '<line x1="' + L + '" x2="' + W + '" y1="' + Y(100) + '" y2="' + Y(100) + '" stroke="var(--jade)" stroke-dasharray="4 4"/>';
    const cols = ['var(--gold)', 'var(--zhu)', 'var(--lan)', 'var(--wood-2)', 'var(--silver)'];
    stages.forEach((s, i) => {
      const x = L + i * bw + bw * .15, w = bw * .7; let y0 = 0;
      g += '<rect x="' + x + '" y="' + Y(s.base) + '" width="' + w + '" height="' + (Y(0) - Y(s.base)) + '" fill="var(--ink-2)" opacity=".85"/>'; y0 = s.base;
      s.extra.forEach((e, j) => { g += '<rect x="' + x + '" y="' + Y(y0 + e[1]) + '" width="' + w + '" height="' + (Y(y0) - Y(y0 + e[1])) + '" fill="' + cols[j % cols.length] + '" opacity=".85"><title>' + e[0] + ' ' + fmt(e[1]) + '</title></rect>'; y0 += e[1]; });
      g += '<text x="' + (x + w / 2) + '" y="' + (Y(y0) - 4) + '" text-anchor="middle" font-size="' + FS + '" fill="var(--ink)" font-family="var(--f-mono)">' + fmt(y0) + '</text>';
      g += '<text x="' + (x + w / 2) + '" y="' + (H - 12) + '" text-anchor="middle" font-size="' + FS + '" fill="var(--ink-3)">' + s.label + '</text>';
    });
    $('#d15svg').setAttribute('viewBox', '0 0 ' + W + ' ' + H); $('#d15svg').innerHTML = g;
    kv($('#d15kv'), [[fmt(tot(cur)), '现在的总负担（起初 100）', tot(cur) > 130 ? 'bad' : ''], [reforms + ' 次', '并税改革'], [cur.extra.length + ' 项', '正税外的杂派']]);
    $('#d15say').innerHTML = msg;
  }
  $('#d15add').addEventListener('click', () => {
    const k = 1 + Math.floor(Math.random() * 2), got = [];
    for (let i = 0; i < k; i++) { const n = NAMES[Math.floor(Math.random() * NAMES.length)], v = 5 + Math.floor(Math.random() * 10); cur.extra.push([n, v]); got.push(n + ' ' + v); }
    push('过几年'); draw('<b>过了几年，冒出了新名目：' + got.join('、') + '</b>每一项都“事出有因”：打仗、修河、衙门经费不够。正税没动，总负担已经是 ' + fmt(tot(cur)) + '。');
  });
  $('#d15merge').addEventListener('click', () => {
    if (!cur.extra.length) { draw('<b>账面已经很干净了</b>没有杂派可并。点“过几年”看看它们怎么回来。'); return; }
    const before = tot(cur); cur.base = Math.round((cur.base + cur.extra.reduce((a, x) => a + x[1], 0)) * .92); cur.extra = []; reforms++;
    push('并税' + reforms); draw('<b>并税改革：所有杂派并进正税，还顺手减了一点</b>总负担从 ' + fmt(before) + ' 降到 ' + fmt(tot(cur)) + '，账面上只剩一项，百姓称便。可注意新的“正税”比上一次改革前的正税高出了一截：旧杂派被合法化了。' + (reforms >= 2 ? '再点“过几年”，新的杂派会在这条更高的底线上重新长出来。这就是黄宗羲说的“积累莫返”。' : ''));
  });
  $('#d15reset').addEventListener('click', reset);
  reset();
})();

/* ---------- 装置 16：养老金的算术 ---------- */
(function(){
  const box = $('#d16'); if (!box) return;
  let late = false, cut = false;
  function upd(){
    const s0 = +$('#d16s').value, b0 = +$('#d16b').value / 100;
    const s = s0 * (late ? 1.3 : 1), b = b0 * (cut ? .9 : 1);
    $('#d16so').textContent = fmt(s0, 1) + ' 人'; $('#d16bo').textContent = Math.round(b0 * 100) + '%';
    $('#d16late').classList.toggle('on', late); $('#d16cut').classList.toggle('on', cut);
    const c = b / s, cap = .25, gap = Math.max(0, c - cap);
    kv($('#d16kv'), [[pct(c, 1), '在职者要交出工资的', c > cap ? 'bad' : 'ok'], [fmt(s, 1) + ' 人', '实际几人养一人'], [pct(b), '实际养老金/工资'], [gap ? pct(gap, 1) : '无', '超出 25% 的部分要靠财政或借债', gap ? 'bad' : '']]);
    const mk = (n, v, max, col) => '<div class="r"><span>' + n + '</span><div class="tr"><i style="width:' + clamp(v / max * 100, 0, 100) + '%;background:' + col + '"></i></div><span class="v">' + pct(v, 1) + '</span></div>';
    $('#d16bars').innerHTML = mk('要交的', c, .8, c > cap ? 'var(--zhu)' : 'var(--jade)') + mk('示意上限', cap, .8, 'var(--ink-3)');
    $('#d16say').innerHTML = '<b>' + fmt(s, 1) + ' 个人养 1 个老人，养老金是工资的 ' + pct(b) + '，每人要交 ' + pct(c, 1) + '</b>' + (s >= 4 ? '人口年轻的时候，这笔账轻松得很，制度刚建立时人人觉得慷慨。' : s >= 2 ? '比例降到两三个人，缴费率就翻了一倍多。' : '一点几个人养一个，账就很难靠缴费撑住了。') + ' 改账只有几条路：多交（缴费率上去）、少领（降待遇）、晚领（延迟退休）、别人替你交（财政补贴，也就是税和国债）。' + (late || cut ? '你刚才用了' + [late ? '延迟退休' : '', cut ? '降待遇' : ''].filter(Boolean).join('和') + '，每一样都有人要付代价。' : '');
  }
  ['#d16s', '#d16b'].forEach(id => $(id).addEventListener('input', upd));
  $$('[data-p]', box).forEach(b => b.addEventListener('click', () => { $('#d16s').value = b.dataset.p; upd(); }));
  $('#d16late').addEventListener('click', () => { late = !late; upd(); });
  $('#d16cut').addEventListener('click', () => { cut = !cut; upd(); });
  upd();
})();

/* ---------- 装置 17：轮回表 ---------- */
(function(){
  const list = $('#d17list'); if (!list) return;
  function key(y){
    if (!y) return 99999; if (/今天/.test(y)) return 9999; if (/明清/.test(y)) return 1500;
    const m = y.match(/(前)?\s*(\d+)/); if (!m) return 99999;
    return m[1] ? -(+m[2]) : +m[2];
  }
  const items = $$('.echo').map((e, i) => {
    if (!e.id) e.id = 'echo' + (i + 1);
    const chap = e.closest('section.chap');
    const p = $('p', e) ? $('p', e).textContent : '';
    return {id: e.id, k: e.dataset.k, y: e.dataset.year || '', t: ($('.rh', e) || {}).textContent || e.dataset.title, s: p.length > 64 ? p.slice(0, 62) + '……' : p, ch: chap ? (chap.dataset.vol || '').replace(/^.*· /, '') : '', key: key(e.dataset.year)};
  }).sort((a, b) => a.key - b.key);
  const kinds = ['全部', ...new Set(items.map(x => x.k))];
  let cur = '全部';
  $('#d17f').innerHTML = kinds.map(k => '<button class="btn' + (k === cur ? ' pri' : '') + '" data-k="' + k + '">' + k + (k === '全部' ? ' ' + items.length : ' ' + items.filter(x => x.k === k).length) + '</button>').join('');
  function draw(){
    list.innerHTML = items.filter(x => cur === '全部' || x.k === cur).map(x => '<li><span class="y">' + x.y + '</span><a href="#' + x.id + '"><span class="k ' + x.k + '">' + x.k + '</span><b>' + x.t + '</b>　<span style="color:var(--ink-3);font-size:13px">' + x.ch + '</span><br><span style="color:var(--ink-2)">' + x.s + '</span></a></li>').join('');
  }
  $('#d17f').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = b.dataset.k; $$('button', $('#d17f')).forEach(x => x.classList.toggle('pri', x === b)); draw(); });
  draw();
})();



})();
