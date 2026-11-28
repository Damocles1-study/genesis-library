/* ---------- 第四章 ---------- */
/* 有理数 num/den（BigInt，den > 0）→ 科学计数法字符串，保留 dg 位有效数字 */
function ratSci(num, den, dg){
  dg = dg || 4; if (num === 0n) return '0';
  const neg = num < 0n; let n = neg ? -num : num;
  let e = n.toString().length - den.toString().length; // 粗估 10 的指数
  const sc = dg - 1 - e;
  let q = sc >= 0 ? n * 10n ** BigInt(sc) / den : n / (den * 10n ** BigInt(-sc));
  if (q.toString().length > dg) { e++; q /= 10n; } else if (q.toString().length < dg) { e--; q = sc + 1 >= 0 ? n * 10n ** BigInt(sc + 1) / den : n / (den * 10n ** BigInt(-sc - 1)); }
  const s = q.toString(); return (neg ? '−' : '') + s[0] + (s.length > 1 ? '.' + s.slice(1) : '') + (e ? ' × 10^' + e : '');
}
/* 有理数 → 完整的十进制小数（分母是 2 的幂时一定写得完），最多 maxd 位有效数字 */
function ratDec(num, den, maxd){
  const neg = num < 0n; let n = neg ? -num : num; const ip = n / den; let r = n % den, f = '';
  let sig = ip > 0n ? ip.toString().length : 0, cut = false;
  while (r && f.length < 2000) { r *= 10n; const d = r / den; f += d; r %= den; if (sig || d) sig++; if (maxd && sig >= maxd && r) { cut = true; break; } }
  return (neg ? '-' : '') + ip.toString() + (f ? '.' + f : '') + (cut ? '…' : '');
}
function decRat(s){ const m = String(s).trim().match(/^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i); if (!m || (!m[2] && !m[3])) return null; let num = BigInt((m[2] || '0') + (m[3] || '')), den = 10n ** BigInt((m[3] || '').length); const e = +(m[4] || 0); if (e > 0) num *= 10n ** BigInt(e); else if (e < 0) den *= 10n ** BigInt(-e); if (m[1] === '-') num = -num; return {num, den}; }

/* 把 0.1 加一万次 */
dev('#sumFig', fig => {
  const svg = $('svg', fig), out = $('.kv', fig), say = $('.say', fig);
  let kahan = false;
  const box = document.createElement('div'); box.className = 'btns'; fig.insertBefore(box, $('.lab', fig));
  btnRow(box, ['普通地加', '补偿求和（第三层）'], 0, i => { kahan = !!i; draw(); });
  function draw(){
    const k = +$('#smN').value, N = 10 ** k, f = Math.fround, step = Math.max(1, Math.floor(N / 160));
    let d = 0, s = 0, cd = 0, cs = 0; const pd = [], ps = [];
    const tenth = f(0.1);
    for (let i = 1; i <= N; i++) {
      if (kahan) { let y = 0.1 - cd, t = d + y; cd = (t - d) - y; d = t; let ys = f(tenth - cs), ts = f(s + ys); cs = f(f(ts - s) - ys); s = ts; }
      else { d += 0.1; s = f(s + tenth); }
      if (i % step === 0 || i === N) { const ex = i / 10; pd.push([i, Math.abs(d - ex)]); ps.push([i, Math.abs(s - ex)]); }
    }
    const ex = N / 10;
    kv(out, [['应该是', ex.toLocaleString()], ['双精度算出', d.toPrecision(17).replace(/0+$/, '').replace(/\.$/, '')], ['差', (d - ex).toExponential(2)], ['单精度算出', s.toPrecision(9)], ['差', (s - ex).toExponential(2)]]);
    const X = x => 50 + Math.log10(x) / Math.max(1, k) * 570, Y = v => v <= 0 ? null : 20 + (2 - Math.log10(v)) / 19 * 150;
    let h = '<rect x="50" y="20" width="570" height="150" fill="var(--paper)" stroke="var(--rule)"/>';
    for (let e = 2; e >= -17; e -= 3) { const y = Y(10 ** e); h += '<line x1="50" x2="620" y1="' + y + '" y2="' + y + '" stroke="var(--rule)" stroke-dasharray="2 3"/>' + txt(46, y + 4, '10^' + e, {s: 10, a: 'end', c: 'var(--ink-3)'}); }
    for (let e = 0; e <= k; e++) h += txt(X(10 ** e), 186, (10 ** e).toLocaleString(), {s: 10, c: 'var(--ink-3)'});
    const path = (pts, col) => { let p = '', pen = false; pts.forEach(([x, v]) => { const y = Y(v); if (y === null) { pen = false; return; } p += (pen ? 'L' : 'M') + X(x).toFixed(1) + ' ' + y.toFixed(1); pen = true; }); return '<path d="' + p + '" fill="none" stroke="' + col + '" stroke-width="2"/>'; };
    h += path(ps, 'var(--red)') + path(pd, 'var(--l2)');
    h += txt(615, 34, '红：单精度的误差', {s: 11, a: 'end', c: 'var(--red)'}) + txt(615, 50, '蓝：双精度的误差', {s: 11, a: 'end', c: 'var(--l2)'}) + txt(335, 199, '横轴：加了几次（对数刻度）　竖轴：误差有多大（对数刻度，越往上越大）', {s: 10, c: 'var(--ink-3)'});
    svg.innerHTML = h;
    say.innerHTML = kahan ? '补偿求和把每一步丢掉的零头记下来补回去，误差几乎不再随次数增长。' : '误差一直在长。单精度加一百万次，结果会差出好几百；双精度要好得多，但也不是 0。线断开的地方，是那一刻误差恰好为 0。';
  }
  slider('smN', v => (10 ** v).toLocaleString() + ' 次', draw);
});

/* IEEE 754 拆解器 */
dev('#fltFig', fig => {
  const inp = $('#flIn'), bitsBox = $('.fbits', fig), out = $('.kv', fig), say = $('.say', fig);
  let dbl = false, bytes = new Uint8Array(4), typed = '0.1';
  const W = () => dbl ? 64 : 32, EW = () => dbl ? 11 : 8, FW = () => dbl ? 52 : 23, BIAS = () => dbl ? 1023 : 127;
  const getBit = i => (bytes[bytes.length - 1 - (i >> 3)] >> (i & 7)) & 1;
  function fromNumber(x){ const dv = new DataView(new ArrayBuffer(8)); if (dbl) dv.setFloat64(0, x); else dv.setFloat32(0, x); bytes = new Uint8Array(dv.buffer.slice(0, dbl ? 8 : 4)); }
  function toNumber(){ const dv = new DataView(bytes.buffer.slice(0)); return dbl ? dv.getFloat64(0) : dv.getFloat32(0); }
  function setFromInput(){
    const s = inp.value.trim(); typed = s;
    if (/^0x[0-9a-f]+$/i.test(s)) { const h = s.slice(2).padStart(W() / 4, '0').slice(-W() / 4); bytes = new Uint8Array(W() / 8).map((_, i) => parseInt(h.slice(i * 2, i * 2 + 2), 16)); typed = null; return true; }
    const low = s.toLowerCase();
    if (/^[+-]?(inf|infinity|∞)$/.test(low)) { fromNumber(low[0] === '-' ? -Infinity : Infinity); typed = null; return true; }
    if (low === 'nan') { fromNumber(NaN); typed = null; return true; }
    if (!decRat(s)) return false;
    fromNumber(Number(s)); return true;
  }
  function draw(){
    const w = W(), ew = EW(), fw = FW();
    let h = '';
    for (let i = w - 1; i >= 0; i--) { const cls = i === w - 1 ? 'sg' : i >= fw ? 'ex' : 'fr'; h += '<button class="bit ' + cls + (getBit(i) ? ' on' : '') + '" data-i="' + i + '" style="width:' + (dbl ? 22 : 30) + 'px"><b style="font-size:' + (dbl ? 13 : 17) + 'px">' + getBit(i) + '</b></button>' + (i === w - 1 || i === fw ? '<span style="width:6px"></span>' : ''); }
    bitsBox.innerHTML = '<div class="bitrow" style="gap:2px">' + h + '</div>';
    let S = getBit(w - 1), e = 0, fB = 0n;
    for (let i = fw; i < w - 1; i++) e |= getBit(i) << (i - fw);
    for (let i = 0; i < fw; i++) if (getBit(i)) fB |= 1n << BigInt(i);
    const eS = pad(e.toString(2), ew), fS = pad(fB.toString(2), fw), hexS = [...bytes].map(b => hex2(b)).join('');
    const emax = (1 << ew) - 1, x = toNumber();
    let kind, M, E, desc;
    if (e === emax) { kind = fB ? 'NaN（不是一个数）' : (S ? '−∞' : '+∞'); }
    else if (e === 0) { kind = fB ? '非规格化数' : (S ? '−0' : '+0'); M = fB; E = 1 - BIAS() - fw; desc = '(−1)<sup>' + S + '</sup> × 0.f × 2<sup>' + (1 - BIAS()) + '</sup>'; }
    else { kind = '规格化数'; M = fB | (1n << BigInt(fw)); E = e - BIAS() - fw; desc = '(−1)<sup>' + S + '</sup> × 1.f × 2<sup>' + e + ' − ' + BIAS() + '</sup> = (−1)<sup>' + S + '</sup> × 1.f × 2<sup>' + (e - BIAS()) + '</sup>'; }
    const rows = [['十六进制', '0x' + hexS], ['符号 S', S + (S ? '（负）' : '（正）')], ['阶码 e', eS + ' = ' + e], ['尾数 f', fS.length > 23 ? fS.slice(0, 20) + '…' : fS], ['种类', kind]];
    kv(out, rows);
    let m = '';
    if (M !== undefined) {
      let num = M, den = 1n; if (E >= 0) num <<= BigInt(E); else den <<= BigInt(-E); if (S) num = -num;
      const exact = ratDec(num, den, 60);
      m += '公式：' + desc + '。<br>电脑里真正存的数（精确展开）：<br><code style="font-size:13px">' + exact + '</code>';
      if (typed !== null) { const t = decRat(typed); if (t) { const dn = num * t.den - t.num * den, dd = den * t.den; m += '<br>和你输入的 <code>' + esc(typed) + '</code> 相差约 <b>' + ratSci(dn, dd, 3) + '</b>' + (dn === 0n ? '，<b>一点不差</b>：这个数二进制写得完。' : '。'); } }
      if (e !== 0 || fB) { const ulpE = (e === 0 ? 1 - BIAS() : e - BIAS()) - fw; m += '<br>它和下一个能存的数之间隔着 2<sup>' + ulpE + '</sup> ≈ ' + ratSci(ulpE >= 0 ? 1n << BigInt(ulpE) : 1n, ulpE >= 0 ? 1n : 1n << BigInt(-ulpE), 3) + '，这之间的数一个也存不下。'; }
    } else m = kind === 'NaN（不是一个数）' ? '阶码全 1、尾数不全 0：NaN。0 ÷ 0、∞ − ∞ 都会得到它。NaN 和谁都不相等，连自己也不等：<code>x != x</code> 是判断 NaN 的老办法。' : '阶码全 1、尾数全 0：无穷大。1 ÷ 0 在浮点里得到它，而不是报错。';
    say.innerHTML = m;
  }
  bitsBox.addEventListener('click', e => { const b = e.target.closest('.bit'); if (!b) return; const i = +b.dataset.i; bytes[bytes.length - 1 - (i >> 3)] ^= 1 << (i & 7); typed = null; inp.value = String(toNumber()); typed = null; draw(); });
  btnRow($('[data-m]', fig), ['单精度 float（32 位）', '双精度 double（64 位）'], 0, i => { dbl = !!i; if (!setFromInput()) fromNumber(0); draw(); });
  inp.addEventListener('input', () => { if (setFromInput()) draw(); else say.textContent = '看不懂这个数。可以写 0.1、-12.5、3e8、inf、nan，或者 0x3DCCCCCD。'; });
  setFromInput(); draw();
});
