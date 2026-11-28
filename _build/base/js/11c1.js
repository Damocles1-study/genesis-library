/* ---------- 第一章 ---------- */
function gaussFrom(r){ let u = 0, v = 0; while (u === 0) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

/* 两档还是十档 */
dev('#levelFig', fig => {
  const svg = $('svg', fig), out = $('.kv', fig);
  const MODES = [2, 4, 10]; let L = 2;
  const N = 200, r = rng(7), sym = [], nz = [], jy = [];
  for (let i = 0; i < N; i++) { sym.push(r()); nz.push(gaussFrom(r)); jy.push(r()); }
  const X = v => 40 + v * 560;
  function draw(sig){
    let h = '', err = 0;
    h += '<rect x="40" y="20" width="560" height="160" fill="var(--paper)" stroke="var(--rule)"/>';
    for (let k = 0; k < L; k++) { const v = k / (L - 1); h += '<line x1="' + X(v) + '" y1="20" x2="' + X(v) + '" y2="180" stroke="var(--ter)" stroke-opacity=".35" stroke-width="2"/>' + txt(X(v), 196, L === 10 ? k : k, {s: 12, c: 'var(--ter)'}); }
    for (let k = 1; k < L; k++) { const v = (k - .5) / (L - 1); h += '<line x1="' + X(v) + '" y1="20" x2="' + X(v) + '" y2="180" stroke="var(--ink-3)" stroke-dasharray="4 3"/>'; }
    for (let i = 0; i < N; i++) {
      const k = Math.min(L - 1, Math.floor(sym[i] * L)), v = k / (L - 1) + nz[i] * sig;
      const got = clamp(Math.round(v * (L - 1)), 0, L - 1), ok = got === k; if (!ok) err++;
      h += '<circle cx="' + X(clamp(v, -.06, 1.06)) + '" cy="' + (28 + jy[i] * 144) + '" r="' + (ok ? 2.6 : 3.4) + '" fill="' + (ok ? 'var(--l1)' : 'var(--red)') + '" fill-opacity="' + (ok ? .55 : .9) + '"/>';
    }
    h += txt(40, 214, '0 伏', {s: 11, a: 'start', c: 'var(--ink-3)'}) + txt(600, 214, '满电压', {s: 11, a: 'end', c: 'var(--ink-3)'}) + txt(320, 214, '竖实线：送出的那一档　虚线：接收方的分界', {s: 11, c: 'var(--ink-3)'});
    svg.innerHTML = h;
    kv(out, [['分几档', L + ' 档'], ['每个信号带', (Math.log2(L)).toFixed(2).replace(/\.00$/, '') + ' 比特'], ['认错的', err + ' / ' + N], ['错误率', (err / N * 100).toFixed(1) + '%']]);
  }
  btnRow($('[data-m]', fig), ['两档（二进制）', '四档', '十档（十进制）'], 0, i => { L = MODES[i]; draw(get() / 100); });
  const get = slider('lvN', v => (v / 100).toFixed(2) + ' × 满电压', v => draw(v / 100));
});

/* 八个开关 */
dev('#bitsFig', fig => {
  const out = $('.kv', fig), say = $('.say', fig); let target = null;
  const show = v => {
    const parts = []; for (let i = 7; i >= 0; i--) if ((v >> i) & 1) parts.push(1 << i);
    kv(out, [['十进制', v], ['二进制', bin(v, 8)], ['加起来', parts.length ? parts.join(' + ') : '0']]);
    if (target !== null) say.innerHTML = v === target ? '<b>对了！</b>' + target + ' = ' + bin(target, 8) + '。再点“出题”来一道。' : '题目：把开关拨成 <b>' + target + '</b>。提示：从 128 开始，一个一个问“放得下吗？”';
  };
  const row = bitRow($('.bits8', fig), {n: 8, val: 13, labels: i => 1 << i, onChange: show});
  $('.btns', fig).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const x = b.dataset.x;
    if (x === 'q') { target = 1 + Math.floor(Math.random() * 255); row.set(0); }
    else if (x === 'inc') { row.set((row.get() + 1) & 255); if (row.get() === 0) say.innerHTML = '255 再加一，八个开关全变成 0：<b>溢出</b>了。'; }
    else row.set(+x);
    show(row.get()); });
  show(row.get());
});

/* 进制转换台 */
dev('#baseFig', fig => {
  const inp = $('#bfIn'), fromS = $('#bfFrom'), toS = $('#bfTo'), out = $('.kv', fig), st = $('.steps2', fig);
  const DIG = '0123456789ABCDEF';
  function parse(s, r){
    s = s.trim().toUpperCase().replace(/^0[BXO]/, ''); if (!s) return null;
    const m = s.match(/^([0-9A-F]*)(?:\.([0-9A-F]*))?$/); if (!m) return null;
    const ip = m[1] || '0', fp = m[2] || ''; const R = BigInt(r);
    let I = 0n; for (const c of ip) { const d = DIG.indexOf(c); if (d < 0 || d >= r) return null; I = I * R + BigInt(d); }
    let num = 0n, den = 1n; for (const c of fp) { const d = DIG.indexOf(c); if (d < 0 || d >= r) return null; num = num * R + BigInt(d); den *= R; }
    return {I, num, den};
  }
  function fracDigits(num, den, t, max){ const T = BigInt(t); let s = '', k = 0; while (num && k < max) { num *= T; s += DIG[Number(num / den)]; num %= den; k++; } return {s, more: num !== 0n}; }
  function fmt(v, t){ const f = fracDigits(v.num, v.den, t, 12); return v.I.toString(t).toUpperCase() + (f.s ? '.' + f.s + (f.more ? '…' : '') : ''); }
  function go(){
    const r = +fromS.value, t = +toS.value, v = parse(inp.value, r);
    if (!v) { out.innerHTML = '<div>出错了<b>看看数字对不对</b></div>'; st.innerHTML = '<p class="dim">这个数里有 ' + r + ' 进制不该有的数码（' + r + ' 进制只能用 ' + DIG.slice(0, r).split('').join(' ') + '），或者多了符号。</p>'; return; }
    kv(out, [['二进制', fmt(v, 2)], ['八进制', fmt(v, 8)], ['十进制', fmt(v, 10)], ['十六进制', fmt(v, 16)]]);
    let h = '<table class="t" style="min-width:300px"><tr><th colspan="3">整数部分 ' + v.I.toString(10) + '：除 ' + t + ' 取余，从下往上读</th></tr>';
    let n = v.I; const T = BigInt(t); const rows = [];
    if (n === 0n) rows.push('<tr><td class="m">0</td><td></td><td></td></tr>');
    let guard = 0; while (n > 0n && guard++ < 64) { rows.push('<tr><td class="m">' + n + ' ÷ ' + t + ' = ' + (n / T) + '</td><td>余</td><td class="m"><b>' + DIG[Number(n % T)] + '</b></td></tr>'); n /= T; }
    h += rows.join('') + '<tr><td colspan="3">读出：<b class="mono">' + v.I.toString(t).toUpperCase() + '</b></td></tr></table>';
    if (v.num) {
      h += '<table class="t" style="min-width:300px;margin-top:10px"><tr><th colspan="3">小数部分：乘 ' + t + ' 取整，从上往下读</th></tr>';
      let num = v.num, k = 0, digs = '';
      const dec = (a, b) => (Number(a * 10n ** 12n / b) / 1e12).toFixed(6).replace(/0+$/, '').replace(/\.$/, '.0');
      while (num && k < 12) { const prod = num * T; const d = prod / v.den; h += '<tr><td class="m">' + dec(num, v.den) + ' × ' + t + ' = ' + dec(prod, v.den) + '</td><td>取</td><td class="m"><b>' + DIG[Number(d)] + '</b></td></tr>'; digs += DIG[Number(d)]; num = prod % v.den; k++; }
      h += '<tr><td colspan="3">读出：<b class="mono">0.' + digs + (num ? '…' : '') + '</b>' + (num ? '　（12 位还没乘完，这个小数在 ' + t + ' 进制里可能写不尽）' : '　（乘到 0 了，正好写完）') + '</td></tr></table>';
    }
    st.innerHTML = h;
  }
  [inp, fromS, toS].forEach(el => el.addEventListener('input', go));
  go();
});
