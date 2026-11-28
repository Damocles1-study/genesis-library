/* ---------- 第十三章：造一棵哈夫曼树 ---------- */
dev('#huffFig', fig => {
  const svg = $('svg.huff', fig), inp = $('#hfIn'), codesEl = $('#hfCodes'), kvb = $('.kv', fig), say = $('.say', fig);
  let forest, text, nk, last;
  const show = c => c === ' ' ? '␣' : c;
  function reset(){
    text = inp.value || 'A'; const cnt = {};
    [...text].forEach(c => cnt[c] = (cnt[c] || 0) + 1);
    nk = 0; last = null;
    forest = Object.keys(cnt).sort((a, b) => cnt[a] - cnt[b] || (a < b ? -1 : 1)).map(c => ({id: 'h' + nk++, w: cnt[c], ch: c, l: null, r: null}));
    draw(); codesEl.innerHTML = ''; kv(kvb, [['不同的字', forest.length], ['一共几个字', text.length], ['每个字 8 位要', text.length * 8 + ' 位']]);
    say.textContent = '每个字是一棵小树，数字是出现的次数。点“合并一次”。';
  }
  function draw(){
    // 把森林里每棵树画成一排；用 drawBinTree 需要一棵树，这里拼一个看不见的根
    const nodes = {};
    const add = t => { nodes[t.id] = {k: t.ch !== undefined && t.ch !== null ? show(t.ch) + t.w : String(t.w), l: t.l ? t.l.id : null, r: t.r ? t.r.id : null}; if (t.l) add(t.l); if (t.r) add(t.r); };
    forest.forEach(add);
    // 森林串成一条“右链”画：每棵树并排
    const W = 640; let h = ''; const widths = forest.map(t => { const L = treeLayout(nodes, t.id); return Math.max(1, L.n); });
    const total = widths.reduce((a, b) => a + b, 0), depth = Math.max(...forest.map(t => treeLayout(nodes, t.id).depth));
    const dx = Math.min(52, (W - 30) / Math.max(1, total)), dy = Math.min(46, 180 / Math.max(1, depth - 1 || 1));
    const H = 36 + (depth - 1) * dy + 24; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    let col = (W - (total - 1) * dx) / 2 - 0;
    forest.forEach((t, k) => {
      const L = treeLayout(nodes, t.id), P = id => ({x: col + L.pos[id].x * dx, y: 22 + L.pos[id].d * dy});
      Object.keys(L.pos).forEach(id => { const a = P(id); ['l', 'r'].forEach((s, si) => { const c = nodes[id][s]; if (c) { const b = P(c); h += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="var(--ink-3)" stroke-width="1.3"/>' + txt((a.x + b.x) / 2 + (si ? 7 : -7), (a.y + b.y) / 2, si ? '1' : '0', {s: 10.5, c: 'var(--main)', w: 1}); } }); });
      Object.keys(L.pos).forEach(id => { const a = P(id), leaf = !nodes[id].l; const isNew = last && id === last; h += '<circle cx="' + a.x + '" cy="' + a.y + '" r="14" fill="' + (isNew ? 'var(--main)' : 'var(--card)') + '" stroke="' + (leaf ? 'var(--l1)' : 'var(--ter)') + '" stroke-width="1.6"/>' + txt(a.x, a.y + 4, nodes[id].k, {s: 11, c: isNew ? 'var(--paper)' : 'var(--ink)', halo: false, w: leaf ? 1 : 0}); });
      col += widths[k] * dx;
    });
    svg.innerHTML = h;
  }
  function codes(){ const out = {}; const walk = (t, c) => { if (!t.l) { out[t.ch] = c || '0'; return; } walk(t.l, c + '0'); walk(t.r, c + '1'); }; walk(forest[0], ''); return out; }
  function step(){
    if (forest.length <= 1) return false;
    forest.sort((a, b) => a.w - b.w);
    const a = forest.shift(), b = forest.shift();
    const t = {id: 'h' + nk++, w: a.w + b.w, ch: null, l: a, r: b}; last = t.id;
    let i = 0; while (i < forest.length && forest[i].w <= t.w) i++; forest.splice(i, 0, t);
    draw();
    say.textContent = '最少的两棵是 ' + a.w + ' 和 ' + b.w + '：合成一棵，根上写 ' + t.w + '。' + (forest.length === 1 ? '只剩一棵树了！' : '还剩 ' + forest.length + ' 棵。');
    if (forest.length === 1) {
      const cs = codes(); const cnt = {}; [...text].forEach(c => cnt[c] = (cnt[c] || 0) + 1);
      const keys = Object.keys(cs).sort((x, y) => cnt[y] - cnt[x]);
      codesEl.innerHTML = keys.map(c => '<span>' + show(c) + ' → ' + cs[c] + '<small>' + cnt[c] + ' 次 × ' + cs[c].length + ' 位</small></span>').join('');
      const bits = [...text].reduce((s, c) => s + cs[c].length, 0);
      kv(kvb, [['每个字 8 位要', text.length * 8 + ' 位'], ['哈夫曼要', bits + ' 位'], ['省了', Math.round(100 - bits / text.length / 8 * 100) + '%'], ['平均每个字', (bits / text.length).toFixed(2) + ' 位']]);
      say.textContent += ' 往左是 0、往右是 1，出现得多的字码最短。';
    }
    return true;
  }
  $('[data-x="s"]', fig).addEventListener('click', step);
  $('[data-x="all"]', fig).addEventListener('click', () => { while (step()); });
  $('[data-x="r"]', fig).addEventListener('click', reset);
  $('[data-x="map"]', fig).addEventListener('click', () => { inp.value = ISLAND.join(''); reset(); });
  inp.addEventListener('change', reset);
  reset();
});
