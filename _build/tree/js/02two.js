/* ---------- 第二部封面：一棵树能装多少 ---------- */
/* 公用：画一棵二叉树。nodes：{id: {k, l, r}}，root；opt：{mark(id)->类名, sub(id)->小字, W, H} */
function treeLayout(nodes, root){
  const pos = {}; let col = 0; let maxd = 0;
  const walk = (id, d) => { if (id == null || !nodes[id]) return; walk(nodes[id].l, d + 1); pos[id] = {x: col++, d}; maxd = Math.max(maxd, d); walk(nodes[id].r, d + 1); };
  walk(root, 0);
  return {pos, n: col, depth: maxd + 1};
}
function drawBinTree(svg, nodes, root, opt){
  opt = opt || {};
  const W = opt.W || 640, Hh = opt.H || 220;
  const L = treeLayout(nodes, root);
  if (!L.n) { svg.setAttribute('viewBox', '0 0 ' + W + ' 60'); svg.innerHTML = txt(W / 2, 34, '（空树）', {c: 'var(--ink-3)'}); return L; }
  const dx = Math.min(56, (W - 40) / Math.max(1, L.n)), dy = Math.min(56, (Hh - 40) / Math.max(1, L.depth - 1 || 1));
  const H = 40 + (L.depth - 1) * dy + 16;
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  const ox = (W - (L.n - 1) * dx) / 2;
  const P = id => ({x: ox + L.pos[id].x * dx, y: 22 + L.pos[id].d * dy});
  const r = Math.min(15, dx * 0.42 + 4);
  let h = '';
  Object.keys(L.pos).forEach(id => { const a = P(id); ['l', 'r'].forEach(s => { const c = nodes[id][s]; if (c != null && L.pos[c]) { const b = P(c); h += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="var(--ink-3)" stroke-width="1.4"/>'; } }); });
  Object.keys(L.pos).forEach(id => {
    const a = P(id), m = opt.mark ? opt.mark(id) : '';
    const fill = m === 'hl' ? 'var(--main)' : m === 'ok' ? 'var(--l1)' : m === 'v' ? 'color-mix(in srgb,var(--ter) 30%,var(--card))' : m === 'red' ? 'var(--red)' : 'var(--card)';
    const ink = (m === 'hl' || m === 'ok' || m === 'red') ? 'var(--paper)' : 'var(--ink)';
    h += '<circle cx="' + a.x + '" cy="' + a.y + '" r="' + r + '" fill="' + fill + '" stroke="' + (m ? 'var(--main)' : 'var(--ter)') + '" stroke-width="1.6" data-id="' + id + '" style="cursor:' + (opt.click ? 'pointer' : 'default') + '"/>';
    h += txt(a.x, a.y + 4.5, nodes[id].k, {s: r > 12 ? 13 : 10, c: ink, w: 1, halo: false});
    if (opt.sub) { const s = opt.sub(id); if (s !== '' && s != null) h += txt(a.x, a.y + r + 11, s, {s: 10, c: 'var(--ink-3)'}); }
  });
  svg.innerHTML = h;
  if (opt.click && !svg._clk) { svg._clk = 1; svg.addEventListener('click', e => { const c = e.target.closest('[data-id]'); if (c) svg._onclick(c.dataset.id); }); }
  if (opt.click) svg._onclick = opt.click;
  return L;
}
dev('#treeCountFig', fig => {
  const svg = $('svg', fig), kvb = $('.kv', fig), say = $('.say', fig);
  slider('tcH', null, h => {
    const nodes = {}; const show = Math.min(h, 5);
    for (let i = 1; i < 2 ** show; i++) nodes[i] = {k: i < 100 ? String(i) : '', l: 2 * i < 2 ** show ? 2 * i : null, r: 2 * i + 1 < 2 ** show ? 2 * i + 1 : null};
    drawBinTree(svg, nodes, 1, {W: 640, H: 200});
    const total = 2 ** h - 1;
    const big = total >= 1e8 ? (total / 1e8).toFixed(1) + ' 亿' : total >= 1e4 ? (total / 1e4).toFixed(1) + ' 万' : String(total);
    kv(kvb, [['层数', h], ['最下面一层', (2 ** (h - 1)).toLocaleString('en-US') + ' 个'], ['一共能装', big + ' 个'], ['找一个最多走', h + ' 步']]);
    say.textContent = h > 5 ? '图里只画了前 5 层。' + h + ' 层的树能装 ' + big + ' 个结点，可从根走到最下面只要 ' + h + ' 步。' : '每多一层，能装的结点就差不多翻一倍。';
  });
});
