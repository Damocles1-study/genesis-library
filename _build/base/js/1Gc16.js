/* ---------- 第十六章 ---------- */
dev('#cacheFig', fig => {
  const arr = $('.cArr', fig), cc = $('.cCache', fig), out = $('.kv', fig), say = $('.say', fig);
  const PATS = ['按行遍历', '按列遍历', '随机跳着读'], MAPS = ['直接映射', '2 路组相联（第二层）', '全相联（第二层）'];
  let pat = 0, map = 0, seq = [], k = 0, lines, hist, timer = null, tick = 0;
  const blockOf = (r, c) => Math.floor((r * 8 + c) / 4);
  function makeSeq(){ seq = []; if (pat === 0) for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) seq.push([r, c]); else if (pat === 1) for (let c = 0; c < 8; c++) for (let r = 0; r < 8; r++) seq.push([r, c]); else { const g = rng(3); for (let i = 0; i < 64; i++) seq.push([Math.floor(g() * 8), Math.floor(g() * 8)]); } }
  function reset(){ clearInterval(timer); timer = null; const b = $('[data-x="run"]', fig); if (b) { b.textContent = '一直走'; b.classList.remove('on'); } makeSeq(); k = 0; tick = 0; lines = Array.from({length: 4}, () => ({v: 0, blk: -1, t: 0})); hist = {}; draw(); }
  function access(){
    if (k >= seq.length) return false;
    const [r, c] = seq[k], b = blockOf(r, c); tick++;
    const ways = map === 0 ? 1 : map === 1 ? 2 : 4, sets = 4 / ways, set = b % sets, idx = [];
    for (let w = 0; w < ways; w++) idx.push(set * ways + w);
    let hit = idx.find(i => lines[i].v && lines[i].blk === b);
    let msg;
    if (hit !== undefined) { lines[hit].t = tick; msg = '访问 a[' + r + '][' + c + ']：它所在的块 ' + b + ' 已经在缓存里，<b style="color:var(--l1)">命中</b>。'; hist[r * 8 + c] = 'h'; }
    else { let v = idx.find(i => !lines[i].v); if (v === undefined) v = idx.reduce((a, i) => lines[i].t < lines[a].t ? i : a, idx[0]); const old = lines[v].blk; lines[v] = {v: 1, blk: b, t: tick}; msg = '访问 a[' + r + '][' + c + ']：块 ' + b + ' 不在缓存里，<b style="color:var(--red)">缺失</b>，从内存搬进第 ' + v + ' 行' + (old >= 0 ? '，挤掉了原来的块 ' + old : '') + '。' + (map === 0 ? '（直接映射：块 ' + b + ' 只能放在 ' + b + ' mod 4 = ' + (b % 4) + ' 行）' : map === 1 ? '（2 路组相联：块 ' + b + ' 放在第 ' + set + ' 组的两行之一，满了就扔最久没用的）' : '（全相联：哪一行都行，满了扔最久没用的）'); hist[r * 8 + c] = 'm'; }
    k++; draw(msg); return k < seq.length;
  }
  function draw(msg){
    const cached = new Set(lines.filter(l => l.v).map(l => l.blk)), cur = k > 0 ? seq[k - 1] : null;
    let h = '<div class="dim" style="font-size:12px;margin-bottom:4px">数组 a[8][8]（每 4 个 int 一块，同色的竖线分开块）</div><table class="carr">';
    for (let r = 0; r < 8; r++) { h += '<tr>'; for (let c = 0; c < 8; c++) { const s = hist[r * 8 + c], isCur = cur && cur[0] === r && cur[1] === c; h += '<td class="' + (cached.has(blockOf(r, c)) ? 'in ' : '') + (s === 'h' ? 'h ' : s === 'm' ? 'm ' : '') + (isCur ? 'cur ' : '') + (c === 3 ? 'bd' : '') + '">' + r + ',' + c + '</td>'; } h += '</tr>'; }
    arr.innerHTML = h + '</table>';
    const ways = map === 0 ? 1 : map === 1 ? 2 : 4;
    cc.innerHTML = '<div class="dim" style="font-size:12px;margin-bottom:4px">缓存（4 行 × 16 字节）</div><table class="t" style="font-size:12.5px"><tr><th>行</th>' + (ways < 4 ? '<th>组</th>' : '') + '<th>有效</th><th>装着</th></tr>' + lines.map((l, i) => '<tr><td>' + i + '</td>' + (ways < 4 ? '<td>' + Math.floor(i / ways) + '</td>' : '') + '<td>' + l.v + '</td><td class="m">' + (l.v ? '块 ' + l.blk + '：a[' + Math.floor(l.blk / 2) + '][' + (l.blk % 2) * 4 + '..' + ((l.blk % 2) * 4 + 3) + ']' : '—') + '</td></tr>').join('') + '</table>';
    kv(out, [['已访问', k + ' / 64'], ['命中', stats.h], ['缺失', stats.m], ['命中率', k ? (stats.h / k * 100).toFixed(1) + '%' : '—']]);
    if (msg) say.innerHTML = msg; else if (!k) say.innerHTML = '红色是缺失，绿色是命中，浅色底的格子表示它所在的块现在在缓存里。';
    if (k >= 64) say.innerHTML += '<br><b>走完了。</b>' + (pat === 0 ? '按行：每块 4 个 int，1 次缺失换来 3 次命中，命中率 75%。' : pat === 1 ? '按列：一列的 8 个元素在 8 个不同的块里，缓存只有 4 行，等到下一列再用到同一块时，它早就被挤掉了。' : '随机访问几乎没有空间局部性，全靠运气。');
  }
  const stats = {h: 0, m: 0};
  const origAccess = access;
  function step(){ const before = k; const r = origAccess(); if (k > before) { if (hist[seq[k - 1][0] * 8 + seq[k - 1][1]] === 'h') stats.h++; else stats.m++; draw(); } return r; }
  function fullReset(){ stats.h = 0; stats.m = 0; reset(); }
  btnRow($('[data-pat]', fig), PATS, 0, i => { pat = i; fullReset(); });
  btnRow($('[data-map]', fig), MAPS, 0, i => { map = i; fullReset(); });
  $$('.btns', fig)[2].addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const x = b.dataset.x;
    if (x === 'step') step();
    if (x === 'all') { while (step()); }
    if (x === 'reset') fullReset();
    if (x === 'run') { if (timer) { clearInterval(timer); timer = null; b.textContent = '一直走'; b.classList.remove('on'); } else { b.textContent = '停'; b.classList.add('on'); timer = setInterval(() => { if (!step()) { clearInterval(timer); timer = null; b.textContent = '一直走'; b.classList.remove('on'); } }, 180); } } });
  new IntersectionObserver(es => { if (!es[0].isIntersecting && timer) { clearInterval(timer); timer = null; const b = $('[data-x="run"]', fig); b.textContent = '一直走'; b.classList.remove('on'); } }).observe(fig);
  fullReset();
});

dev('#splitFig', fig => {
  const bar = $('.spbar', fig), out = $('.kv', fig), say = $('.say', fig);
  const fill = (id, arr, f, def) => { const s = $('#' + id); s.innerHTML = arr.map(x => '<option value="' + x + '"' + (x === def ? ' selected' : '') + '>' + f(x) + '</option>').join(''); s.style.width = 'auto'; return s; };
  const sA = fill('spA', [16, 20, 24, 32, 36, 48], x => x + ' 位', 32), sC = fill('spC', [1, 2, 4, 8, 16, 32, 64, 128, 256, 1024], x => x >= 1024 ? x / 1024 + ' MB' : x + ' KB', 32), sB = fill('spB', [16, 32, 64, 128], x => x + ' B', 64), sW = fill('spW', [1, 2, 4, 8, 16, 0], x => x === 0 ? '全相联' : x === 1 ? '直接映射' : x + ' 路', 4);
  const sD = $('#spD'), sX = $('#spX');
  function go(){
    const A = +sA.value, C = +sC.value * 1024, B = +sB.value, Wv = +sW.value, L = C / B, W = Wv === 0 ? L : Wv, S = L / W;
    const off = Math.log2(B), idx = Math.log2(S), tag = A - idx - off;
    if (tag <= 0) { bar.innerHTML = ''; out.innerHTML = ''; say.textContent = '缓存比整个主存还大了，调小一点。'; return; }
    const lru = W > 1 ? Math.ceil(Math.log2(W)) : 0, ctl = 1 + (sD.checked ? 1 : 0) + lru;
    const seg = (n, lab, col) => n ? '<div style="flex:' + n + ' 1 0;background:' + col + '"><b>' + lab + '</b><small>' + n + ' 位</small></div>' : '';
    bar.innerHTML = '<div class="spseg">' + seg(tag, '标记', 'color-mix(in srgb,var(--l3) 30%,var(--card))') + seg(idx, Wv === 1 ? '行号' : '组号', 'color-mix(in srgb,var(--l2) 30%,var(--card))') + seg(off, '块内地址', 'color-mix(in srgb,var(--l1) 30%,var(--card))') + '</div>';
    const perLine = B * 8 + tag + ctl, total = L * perLine;
    kv(out, [['行数', L.toLocaleString()], ['组数', S.toLocaleString() + '（每组 ' + W + ' 行）'], ['每行控制位', '有效 1' + (sD.checked ? ' + 脏 1' : '') + (lru ? ' + 替换 ' + lru : '') + ' = ' + ctl], ['每行共', perLine.toLocaleString() + ' 位'], ['缓存总共', total.toLocaleString() + ' 位 ≈ ' + (total / 8 / 1024).toFixed(1) + ' KB']]);
    let x = sX.value.trim().replace(/^0x/i, '');
    if (/^[0-9a-f]+$/i.test(x)) {
      let v = BigInt('0x' + x) & ((1n << BigInt(A)) - 1n);
      const o = v & ((1n << BigInt(off)) - 1n), s = (v >> BigInt(off)) & ((1n << BigInt(idx)) - 1n), t = v >> BigInt(off + idx);
      say.innerHTML = '地址 0x' + v.toString(16).toUpperCase() + '：标记 = 0x' + t.toString(16).toUpperCase() + '，' + (Wv === 1 ? '行号' : '组号') + ' = ' + s + '，块内地址 = ' + o + '。查缓存时先用' + (Wv === 0 ? '（全相联没有组号，要和所有 ' + L + ' 行比较）' : (Wv === 1 ? '行号' : '组号') + '找到那一' + (Wv === 1 ? '行' : '组') + '，再把' + (W > 1 ? '组里 ' + W + ' 行的' : '') + '标记和 0x' + t.toString(16).toUpperCase() + ' 比较') + '，相同且有效位为 1 就是命中。';
    } else say.textContent = '地址请写成十六进制。';
  }
  [sA, sC, sB, sW, sD, sX].forEach(el => el.addEventListener('input', go));
  go();
});
