/* ---------- 第六章 ---------- */
dev('#pixFig', fig => {
  const grid = $('.pixgrid', fig), dump = $('.pixdump', fig), out = $('.kv', fig), sw = $('.swatch', fig), hx = $('.pixhex', fig);
  const BG = [236, 228, 208];
  let px = Array.from({length: 64}, () => BG.slice());
  const SMILE = ['..YYYY..', '.YYYYYY.', 'YYKYYKYY', 'YYYYYYYY', 'YKYYYYKY', 'YYKKKKYY', '.YYYYYY.', '..YYYY..'];
  const smile = () => { const C = {Y: [248, 198, 39], K: [40, 30, 20]}; px = SMILE.join('').split('').map(c => C[c] ? C[c].slice() : BG.slice()); };
  smile();
  grid.innerHTML = Array.from({length: 64}, (_, i) => '<i data-i="' + i + '"></i>').join('');
  const cells = $$('i', grid);
  const hex = c => c.map(v => hex2(v)).join('');
  let cur = [224, 96, 32];
  function draw(){
    cells.forEach((el, i) => el.style.background = 'rgb(' + px[i].join(',') + ')');
    const lines = []; for (let r = 0; r < 8; r++) lines.push('<span class="a">第' + (r + 1) + '行</span> ' + px.slice(r * 8, r * 8 + 8).map(hex).join(' '));
    dump.innerHTML = lines.join('\n');
    let runs = 0; for (let i = 0; i < 64; i++) if (i % 8 === 0 || hex(px[i]) !== hex(px[i - 1])) runs++;
    const colors = new Set(px.map(hex)).size;
    kv(out, [['像素', '8 × 8 = 64'], ['不压缩', '64 × 3 = 192 字节'], ['用了几种颜色', colors], ['游程编码后', runs + ' 段 × 4 = ' + runs * 4 + ' 字节'], ['压缩比', (192 / (runs * 4)).toFixed(2)]]);
  }
  const setCur = () => { cur = [+$('#pxR').value, +$('#pxG').value, +$('#pxB').value]; sw.style.background = 'rgb(' + cur.join(',') + ')'; hx.textContent = '#' + hex(cur) + '  (' + cur.join(', ') + ')'; };
  ['pxR', 'pxG', 'pxB'].forEach(id => slider(id, null, setCur));
  let painting = false;
  const paintAt = (x, y) => { const el = document.elementFromPoint(x, y); if (el && el.parentNode === grid && el.dataset.i) { const i = +el.dataset.i; if (hex(px[i]) !== hex(cur)) { px[i] = cur.slice(); draw(); } } };
  grid.addEventListener('pointerdown', e => { painting = true; grid.setPointerCapture(e.pointerId); paintAt(e.clientX, e.clientY); });
  grid.addEventListener('pointermove', e => { if (painting) paintAt(e.clientX, e.clientY); });
  ['pointerup', 'pointercancel'].forEach(t => grid.addEventListener(t, () => painting = false));
  $('.btns', fig).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const x = b.dataset.x; if (x === 'clear') px = px.map(() => BG.slice()); if (x === 'smile') smile(); if (x === 'fill') px = px.map(() => cur.slice()); draw(); });
  draw();
});

dev('#sampFig', fig => {
  const svg = $('svg', fig), say = $('.say', fig);
  const SR = [3, 5, 8, 12, 20, 32, 50, 100];
  let f = 3, n = 32, b = 3;
  function draw(){
    const L = 2 ** b, W = 600, H = 160, x0 = 20, y0 = 30;
    const X = t => x0 + t * W, Y = v => y0 + H / 2 - v * (H / 2 - 6);
    let h = '<rect x="' + x0 + '" y="' + y0 + '" width="' + W + '" height="' + H + '" fill="var(--paper)" stroke="var(--rule)"/>';
    for (let k = 0; k < L && L <= 32; k++) { const v = -1 + 2 * k / (L - 1); h += '<line x1="' + x0 + '" x2="' + (x0 + W) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--rule)" stroke-dasharray="2 3"/>'; }
    let p = ''; for (let i = 0; i <= 600; i++) { const t = i / 600; p += (i ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(Math.sin(2 * Math.PI * f * t)).toFixed(1); }
    h += '<path d="' + p + '" fill="none" stroke="var(--ink-3)" stroke-width="2"/>';
    const q = v => -1 + 2 * Math.round((v + 1) / 2 * (L - 1)) / (L - 1);
    let st = '', dots = '';
    for (let k = 0; k < n; k++) { const t = k / n, v = q(Math.sin(2 * Math.PI * f * t)); st += (k ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(v).toFixed(1) + 'L' + X((k + 1) / n).toFixed(1) + ' ' + Y(v).toFixed(1); dots += '<circle cx="' + X(t).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="3" fill="var(--red)"/>'; }
    h += '<path d="' + st + '" fill="none" stroke="var(--red)" stroke-width="1.6" stroke-opacity=".8"/>' + dots;
    h += txt(x0, 20, '一小段时间（1/110 秒）', {s: 11, a: 'start', c: 'var(--ink-3)'}) + txt(x0 + W, 20, L <= 32 ? '虚线：' + L + ' 档' : L + ' 档（太密，不画了）', {s: 11, a: 'end', c: 'var(--ink-3)'});
    svg.innerHTML = h;
    let m = '每秒采样 ' + (n * 110).toLocaleString() + ' 次，声音的频率 ' + f * 110 + ' Hz，每次用 ' + b + ' 位（' + L + ' 档）。';
    if (n <= 2 * f) m += ' <b style="color:var(--red)">采样太慢了</b>：红台阶看上去像一个更慢的波（或者干脆是一条直线），这叫<b>混叠</b>。要采到这个声音，每秒至少要采 ' + (2 * f * 110) + ' 次以上（第二层）。';
    else if (b <= 2) m += ' 档太少，台阶很粗，听起来会“沙沙”的，这种误差叫量化噪声。';
    else m += ' 采得够快、档也够多时，红台阶就紧贴着灰线。';
    say.innerHTML = m;
  }
  slider('spF', v => (v * 110) + ' Hz', v => { f = v; draw(); });
  slider('spS', v => (SR[v] * 110).toLocaleString() + ' 次', v => { n = SR[v]; draw(); });
  slider('spB', v => v + ' 位（' + 2 ** v + ' 档）', v => { b = v; draw(); });
  let ctx = null, src = null;
  $('.btns', fig).addEventListener('click', e => {
    const bt = e.target.closest('button'); if (!bt) return;
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); } catch (err) { say.textContent = '这个浏览器不能放声音。'; return; }
    if (src) try { src.stop(); } catch (err) {}
    const sr = ctx.sampleRate, N = Math.floor(sr * 1.2), buf = ctx.createBuffer(1, N, sr), d = buf.getChannelData(0), F = f * 110, R = n * 110, L = 2 ** b;
    for (let i = 0; i < N; i++) { const t = i / sr; let v; if (bt.dataset.p === 'orig') v = Math.sin(2 * Math.PI * F * t); else { const ts = Math.floor(t * R) / R; v = Math.sin(2 * Math.PI * F * ts); v = -1 + 2 * Math.round((v + 1) / 2 * (L - 1)) / (L - 1); } const env = Math.min(1, i / 800, (N - i) / 800); d[i] = v * .12 * env; }
    src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination); src.start();
  });
});
