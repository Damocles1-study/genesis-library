
/* ================= 第二部 · 电路沙盘 =================
   这本书自己设计的简化规则，不完全等于游戏里的红石：
   · 线（红石粉）挨着电源的一格是 15，每走一格少 1，到 0 就没电了；
   · 拉杆、按钮是电源；按钮按一下亮 1 秒；
   · 火把是“非”：左边（输入，画了小三角）有电它就灭，没电它就亮；亮的时候往右、上、下三面送电，不往左送；
   · 灯：上下左右任何一面有电就亮；
   · 每 0.1 秒算一步，火把要一步才反应过来。 */
const RS = {E: 0, W: 1, L: 2, B: 3, T: 4, P: 5};
const RS_CH = {'.': [0, 0], '-': [1, 0], 'L': [2, 0], 'K': [2, 1], 'B': [3, 0], 'T': [4, 1], 't': [4, 0], 'O': [5, 0]};
const RS_PRESET = {
  lamp: {n: '一盏灯', rows: ['............', '............', '............', '.K---------O', '............', '............', '............'],
    say: '拉杆拉开，线一格一格传过去，最后一格旁边的灯就亮了。打开“显示数字”，看看电每走一格少多少。'},
  not: {n: '非', rows: ['............', '............', '..L-T-O.....', '............', '............'], ins: [[2, 2]], out: [6, 2],
    say: '拉杆关着，火把的左边没电，它就亮，灯也亮；拉杆一开，火把灭了，灯也灭了。火把把“有”变成“没有”，这就是“非”。'},
  and: {n: '与', rows: ['............', '.L-T-.......', '....-T-O....', '.L-T-.......', '............'], ins: [[1, 1], [1, 3]], out: [7, 2],
    say: '两个拉杆都开，灯才亮。它用了三根火把：先把两个输入各“非”一次，合到一根线上，再“非”一次。'},
  nand: {n: '与非', rows: ['............', '.L-T-.......', '....-O......', '.L-T-.......', '............'], ins: [[1, 1], [1, 3]], out: [5, 2],
    say: '和“与”正好相反：只有两个拉杆都开的时候，灯才灭。“与非”很厉害，光用它就能拼出别的所有门。'},
  or: {n: '或', rows: ['............', '.L---.......', '....--O.....', '.L---.......', '............'], ins: [[1, 1], [1, 3]], out: [6, 2],
    say: '两根线接到一起：随便哪个拉杆开着，灯都亮。“或”是最简单的门，连火把都不用。'},
  nor: {n: '或非', rows: ['............', '.L---.......', '....-T-O....', '.L---.......', '............'], ins: [[1, 1], [1, 3]], out: [7, 2],
    say: '先“或”，再接一根火把“非”一下：两个拉杆都关着，灯才亮。'},
  clock: {n: '时钟', rows: ['............', '............', '..--........', '..-T-O......', '............', '............', '............'],
    say: '火把亮了，电顺着线绕回来，送到它自己的左边，它就灭了；它一灭，线没电了，它又亮了……它会一直这样闪下去，像一颗心在跳。点“慢放”看清楚一点。'},
  latch: {n: '记忆', rows: ['.....B......', '.B-T--t-O...', '..-...-.....', '..-----.....'], labels: [[1, 1, '记'], [5, 0, '忘'], [8, 1, '灯']],
    say: '按一下“记”，灯亮了，手松开它还亮着；按一下“忘”，灯才灭。两根火把互相管着对方：这一根亮，那一根就灭，谁也不肯变。这就是电路的“记忆”。'}
};
function Board(svg, o){
  o = o || {};
  const C = 40;
  let W = 12, H = 7, ty = [], on = [], pw = [], lit = [], labels = [], sig = '', speed = 100, tool = 0, nums = !!o.nums, timer = null, visible = true, paint = false;
  const idx = (x, y) => y * W + x;
  const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  /* (sx,sy) 这一格往 (tx,ty) 送电吗？ */
  function feeds(sx, sy, tx, tY){
    const k = idx(sx, sy), t = ty[k];
    if (t === RS.L || t === RS.B) return on[k] > 0;
    if (t === RS.T) return on[k] > 0 && !(tx === sx - 1 && tY === sy);
    return false;
  }
  function wires(){
    pw.fill(0); const q = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (ty[idx(x, y)] !== RS.W) continue;
      for (const d of NB) { const nx = x + d[0], ny = y + d[1]; if (inb(nx, ny) && feeds(nx, ny, x, y)) { pw[idx(x, y)] = 15; q.push(idx(x, y)); break; } }
    }
    while (q.length) {
      const k = q.shift(), x = k % W, y = (k / W) | 0, v = pw[k] - 1;
      if (v <= 0) continue;
      for (const d of NB) { const nx = x + d[0], ny = y + d[1]; if (!inb(nx, ny)) continue; const j = idx(nx, ny); if (ty[j] === RS.W && pw[j] < v) { pw[j] = v; q.push(j); } }
    }
  }
  function powered(x, y){
    if (!inb(x, y)) return false; const k = idx(x, y);
    if (ty[k] === RS.W) return pw[k] > 0;
    return feeds(x, y, x + 1, y);
  }
  /* 每一步把每根火把检查一遍；passes>1 时（人刚动过手）多算几遍，让电路先稳下来 */
  function settle(passes){
    wires();
    for (let n = 0; n < (passes || 1); n++) {
      let changed = false;
      for (let k = 0; k < W * H; k++) if (ty[k] === RS.T) {
        const x = k % W, y = (k / W) | 0, want = powered(x - 1, y) ? 0 : 1;
        if (want !== on[k]) { on[k] = want; wires(); changed = true; }
      }
      if (!changed) break;
    }
    for (let k = 0; k < W * H; k++) {
      lit[k] = 0; if (ty[k] !== RS.P) continue;
      const x = k % W, y = (k / W) | 0;
      for (const d of NB) { const nx = x + d[0], ny = y + d[1]; if (!inb(nx, ny)) continue; const j = idx(nx, ny); if ((ty[j] === RS.W && pw[j] > 0) || feeds(nx, ny, x, y)) { lit[k] = 1; break; } }
    }
  }
  function conn(x, y){ return NB.filter(d => inb(x + d[0], y + d[1]) && ty[idx(x + d[0], y + d[1])] !== RS.E); }
  function draw(force){
    const s = ty.join('') + on.join('') + pw.join(',') + nums;
    if (s === sig && !force) return; sig = s;
    let g = '';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = idx(x, y), X = x * C, Y = y * C, cx = X + C / 2, cy = Y + C / 2, t = ty[k];
      g += '<rect x="' + X + '" y="' + Y + '" width="' + C + '" height="' + C + '" fill="var(--paper)" stroke="var(--rule)" stroke-width=".6"/>';
      if (t === RS.W) {
        const p = pw[k], col = p > 0 ? 'var(--rs)' : 'var(--zhu)', op = p > 0 ? (.45 + .55 * p / 15).toFixed(2) : .22;
        conn(x, y).forEach(d => g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + d[0] * C / 2) + '" y2="' + (cy + d[1] * C / 2) + '" stroke="' + col + '" stroke-opacity="' + op + '" stroke-width="7" stroke-linecap="round"/>');
        g += '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="' + col + '" fill-opacity="' + op + '"/>';
        if (nums && p > 0) g += txt(cx, cy + 4, p, {s: 11, w: true});
      } else if (t === RS.L) {
        g += '<rect x="' + (cx - 12) + '" y="' + (cy + 4) + '" width="24" height="9" rx="2" fill="var(--stn)" stroke="var(--ink-3)" stroke-width=".8"/>';
        const a = on[k] ? 1 : -1;
        g += '<line x1="' + cx + '" y1="' + (cy + 6) + '" x2="' + (cx + a * 9) + '" y2="' + (cy - 11) + '" stroke="var(--wood-2)" stroke-width="4" stroke-linecap="round"/>';
        g += '<circle cx="' + (cx + a * 9) + '" cy="' + (cy - 11) + '" r="3.5" fill="' + (on[k] ? 'var(--rs)' : 'var(--wood)') + '"/>';
      } else if (t === RS.B) {
        g += '<rect x="' + (cx - 9) + '" y="' + (cy - 9) + '" width="18" height="18" rx="3" fill="' + (on[k] ? 'var(--rs)' : 'var(--stn)') + '" stroke="var(--ink-3)"/>';
        g += '<rect x="' + (cx - 5) + '" y="' + (cy - 5) + '" width="10" height="10" rx="2" fill="#000" fill-opacity="' + (on[k] ? .25 : .1) + '"/>';
      } else if (t === RS.T) {
        g += '<path d="M' + (X + 2) + ',' + (cy - 6) + 'L' + (X + 9) + ',' + cy + 'L' + (X + 2) + ',' + (cy + 6) + 'Z" fill="var(--ink-3)"/>';
        if (on[k]) g += '<circle cx="' + cx + '" cy="' + (cy - 7) + '" r="13" fill="var(--rs)" fill-opacity=".2"/>';
        g += '<rect x="' + (cx - 2.5) + '" y="' + (cy - 4) + '" width="5" height="17" fill="var(--wood-2)"/>';
        g += '<circle cx="' + cx + '" cy="' + (cy - 7) + '" r="6" fill="' + (on[k] ? 'var(--rs)' : 'var(--stn-2)') + '" stroke="var(--ink-3)" stroke-width=".8"/>';
      } else if (t === RS.P) {
        if (lit[k]) g += '<rect x="' + (cx - 18) + '" y="' + (cy - 18) + '" width="36" height="36" rx="6" fill="#f4c94a" fill-opacity=".3"/>';
        g += '<rect x="' + (cx - 13) + '" y="' + (cy - 13) + '" width="26" height="26" rx="3" fill="' + (lit[k] ? '#f4c94a' : 'var(--stn-2)') + '" stroke="' + (lit[k] ? '#a8730c' : 'var(--ink-3)') + '"/>';
        g += '<path d="M' + cx + ',' + (cy - 13) + 'V' + (cy + 13) + 'M' + (cx - 13) + ',' + cy + 'H' + (cx + 13) + '" stroke="' + (lit[k] ? '#c8901a' : '#000') + '" stroke-opacity="' + (lit[k] ? .7 : .2) + '"/>';
      }
    }
    labels.forEach(l => g += txt(l[0] * C + C / 2, l[1] * C + C - 3, l[2], {s: 11, w: true, c: 'var(--main)'}));
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g += '<rect class="hit" data-x="' + x + '" data-y="' + y + '" x="' + x * C + '" y="' + y * C + '" width="' + C + '" height="' + C + '" fill="transparent"/>';
    svg.setAttribute('viewBox', '0 0 ' + W * C + ' ' + H * C); svg.innerHTML = g;
    if (o.onChange) o.onChange(api);
  }
  function step(){
    for (let k = 0; k < W * H; k++) if (ty[k] === RS.B && on[k] > 0) on[k]--;
    settle(); draw();
  }
  function use(x, y){
    const k = idx(x, y);
    if (tool === 0) {
      if (ty[k] === RS.L) on[k] ^= 1; else if (ty[k] === RS.B) on[k] = 10; else return;
    } else {
      const nt = [0, RS.W, RS.L, RS.B, RS.T, RS.P, RS.E][tool];
      if (ty[k] === nt) return;
      ty[k] = nt; on[k] = nt === RS.T ? 1 : 0;
      labels = labels.filter(l => !(l[0] === x && l[1] === y));
    }
    settle(6); draw();
  }
  function cellAt(e){ const r = e.target.closest('.hit'); return r ? [+r.dataset.x, +r.dataset.y] : null; }
  svg.addEventListener('pointerdown', e => { const c = cellAt(e); if (!c) return; paint = tool === 1 || tool === 6; use(c[0], c[1]); });
  svg.addEventListener('pointermove', e => { if (!paint) return; const el = document.elementFromPoint(e.clientX, e.clientY); if (!el || !el.classList.contains('hit')) return; use(+el.dataset.x, +el.dataset.y); });
  window.addEventListener('pointerup', () => { paint = false; });
  function run(){ clearInterval(timer); timer = setInterval(() => { if (visible) step(); }, speed); }
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(svg);
  const api = {
    load(p){ const rows = p.rows; H = rows.length; W = Math.max(...rows.map(r => r.length));
      ty = new Array(W * H).fill(0); on = ty.slice(); pw = ty.slice(); lit = ty.slice();
      rows.forEach((r, y) => [...r].forEach((ch, x) => { const v = RS_CH[ch] || [0, 0]; ty[idx(x, y)] = v[0]; on[idx(x, y)] = v[1]; }));
      labels = (p.labels || []).slice(); settle(6); draw(true); },
    tool(i){ tool = i; svg.style.touchAction = (i === 1 || i === 6) ? 'none' : 'manipulation'; },
    speed(ms){ speed = ms; run(); },
    nums(b){ nums = b; draw(true); },
    cell(x, y){ const k = idx(x, y); return {t: ty[k], on: on[k], p: pw[k], lit: lit[k]}; },
    flip(x, y){ const t = tool; tool = 0; use(x, y); tool = t; },
    count(){ const c = {}; ty.forEach(t => { if (t) c[t] = (c[t] || 0) + 1; }); return c; }
  };
  run();
  return api;
}

/* ---------- 第二部封面：电路沙盘 ---------- */
dev('#rsFig', () => {
  const bd = Board($('#rsSvg'), {onChange: b => {
    const c = b.count(), n = (c[RS.W] || 0) + (c[RS.L] || 0) + (c[RS.B] || 0) + (c[RS.T] || 0) + (c[RS.P] || 0);
    $('#rsCount').textContent = n ? '用了 ' + n + ' 格：线 ' + (c[RS.W] || 0) + '、拉杆 ' + (c[RS.L] || 0) + '、按钮 ' + (c[RS.B] || 0) + '、火把 ' + (c[RS.T] || 0) + '、灯 ' + (c[RS.P] || 0) + '。' : '板子是空的。';
  }});
  const keys = ['lamp', 'not', 'and', 'or', 'clock', 'latch'];
  const pad = rows => { const r = rows.map(s => (s + '............').slice(0, 12)); while (r.length < 7) r.push('............'); return r; };
  function pick(i){
    if (i === keys.length) { bd.load({rows: pad([])}); $('#rsSay').textContent = '一块空板子。先在下面选“线”“拉杆”“火把”“灯”，在格子上点一点（线和擦可以按住拖），再选“手”去拨拉杆、按按钮。'; return; }
    const p = RS_PRESET[keys[i]]; bd.load({rows: pad(p.rows), labels: p.labels}); $('#rsSay').textContent = p.say;
  }
  btnRow($('#rsPre'), keys.map(k => RS_PRESET[k].n).concat('空白'), 0, pick);
  btnRow($('#rsTool'), ['手：拨、按', '线', '拉杆', '按钮', '火把（非）', '灯', '擦'], 0, i => bd.tool(i));
  let slow = false, num = false;
  $('#rsSlow').addEventListener('click', e => { slow = !slow; e.target.classList.toggle('on', slow); bd.speed(slow ? 600 : 100); });
  $('#rsNum').addEventListener('click', e => { num = !num; e.target.classList.toggle('on', num); bd.nums(num); });
  pick(0);
});
