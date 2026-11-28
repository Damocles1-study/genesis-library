/* ---------- 第十五章：会劈开的 B 树 ---------- */
dev('#btreeFig', fig => {
  const svg = $('svg.bt', fig), kvb = $('.kv', fig), say = $('.say', fig), inp = $('#btIn');
  let M = 3, root, log, splits, hl = null;
  const MS = [3, 5, 7];
  btnRow($('[data-m]', fig), ['每页最多 2 个（3 阶）', '每页最多 4 个（5 阶）', '每页最多 6 个（7 阶）'], 0, i => { M = MS[i]; clear(); });
  const leaf = n => !n.kids.length;
  function ins(n, k){   // 返回 null 或 {mid, right}
    let i = 0; while (i < n.keys.length && n.keys[i] < k) i++;
    if (n.keys[i] === k) { log.push(k + ' 已经在树里了。'); return null; }
    if (leaf(n)) n.keys.splice(i, 0, k);
    else { const up = ins(n.kids[i], k); if (up) { n.keys.splice(i, 0, up.mid); n.kids.splice(i + 1, 0, up.right); } }
    if (n.keys.length > M - 1) {
      const c = Math.ceil(M / 2) - 1;   // 中间那个的下标
      const mid = n.keys[c], right = {keys: n.keys.slice(c + 1), kids: n.kids.slice(c + 1)};
      log.push('结点 [' + n.keys.join(' ') + '] 装了 ' + n.keys.length + ' 个，超过 ' + (M - 1) + ' 个：劈成 [' + n.keys.slice(0, c).join(' ') + '] 和 [' + right.keys.join(' ') + ']，中间的 ' + mid + ' 升到上一层。');
      n.keys = n.keys.slice(0, c); n.kids = n.kids.slice(0, c + 1); splits++;
      return {mid, right};
    }
    return null;
  }
  function insert(k){ log = []; const up = ins(root, k); if (up) { root = {keys: [up.mid], kids: [root, up.right]}; log.push('根也劈开了：上面长出一个新的根 [' + up.mid + ']，树高了一层。'); } }
  const height = n => leaf(n) ? 1 : 1 + height(n.kids[0]);
  const count = n => n.keys.length + n.kids.reduce((s, c) => s + count(c), 0);
  const nodesN = n => 1 + n.kids.reduce((s, c) => s + nodesN(c), 0);
  function draw(){
    // 叶子从左到右排，父结点放在孩子中间
    let W = 640; const levels = height(root), pos = new Map(); let x = 0;
    const kw = 22, pad = 6, gap = 12;
    const width = n => n.keys.length * kw + pad * 2;
    const place = (n, d) => { if (leaf(n)) { const w = Math.max(width(n), 26); pos.set(n, {x: x + w / 2, d, w}); x += w + gap; return; } n.kids.forEach(c => place(c, d + 1)); const a = pos.get(n.kids[0]).x, b = pos.get(n.kids[n.kids.length - 1]).x; pos.set(n, {x: (a + b) / 2, d, w: Math.max(width(n), 26)}); };
    place(root, 0);
    const totalW = x - gap; W = Math.min(640, Math.max(300, totalW + 30)); const scale = Math.min(1, (W - 20) / Math.max(1, totalW));
    const ox = (W - totalW * scale) / 2, dy = 58, H = 20 + (levels - 1) * dy + 40;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    let h = '';
    const P = n => { const p = pos.get(n); return {x: ox + p.x * scale, y: 16 + p.d * dy, w: p.w * scale}; };
    const walk = n => { const a = P(n); n.kids.forEach((c, i) => { const b = P(c); const sx = a.x - a.w / 2 + pad * scale + i * kw * scale; h += '<line x1="' + sx + '" y1="' + (a.y + 22) + '" x2="' + b.x + '" y2="' + b.y + '" stroke="var(--ink-3)" stroke-width="1.2"/>'; walk(c); }); };
    walk(root);
    const box = n => { const a = P(n), on = hl && hl.has(n); h += '<rect x="' + (a.x - a.w / 2) + '" y="' + a.y + '" width="' + a.w + '" height="22" rx="4" fill="' + (on ? 'color-mix(in srgb,var(--main) 22%,var(--card))' : 'var(--card)') + '" stroke="' + (leaf(n) ? 'var(--l1)' : 'var(--ter)') + '" stroke-width="1.5"/>'; n.keys.forEach((k, i) => { const cx = a.x - a.w / 2 + (pad + kw * i + kw / 2) * scale; h += txt(cx, a.y + 15.5, k, {s: Math.max(9, 12 * scale), halo: false, mono: 1}); if (i) h += '<line x1="' + (cx - kw * scale / 2) + '" y1="' + (a.y + 4) + '" x2="' + (cx - kw * scale / 2) + '" y2="' + (a.y + 18) + '" stroke="var(--rule)"/>'; }); n.kids.forEach(box); };
    box(root);
    if (!root.keys.length) h += txt(W / 2, 46, '（空树，插几个数试试）', {c: 'var(--ink-3)'});
    svg.innerHTML = h;
    kv(kvb, [['关键字', count(root)], ['结点（页）', nodesN(root)], ['树高（层）', root.keys.length ? height(root) : 0], ['一共劈开过', splits + ' 次']]);
  }
  function clear(){ root = {keys: [], kids: []}; splits = 0; hl = null; draw(); inp.value = 10; say.textContent = '空树。每页最多 ' + (M - 1) + ' 个数，装到 ' + M + ' 个就要劈开。'; }
  $('[data-x="ins"]', fig).addEventListener('click', () => { const v = parseInt(inp.value, 10); if (isNaN(v)) return; if (count(root) >= 40) { say.textContent = '树太大了，先清空。'; return; } hl = null; insert(v); draw(); say.textContent = '插入 ' + v + '。' + (log.length ? log.join(' ') : '放进最下面的一页，没有满，不用劈。'); inp.value = v + 5; });
  $('[data-x="find"]', fig).addEventListener('click', () => { const v = parseInt(inp.value, 10); if (isNaN(v)) return; hl = new Set(); let n = root, reads = 0, found = false; while (n) { reads++; hl.add(n); let i = 0; while (i < n.keys.length && n.keys[i] < v) i++; if (n.keys[i] === v) { found = true; break; } if (leaf(n)) break; n = n.kids[i]; } draw(); say.textContent = (found ? '找到了 ' + v : '没有 ' + v) + '：读了 ' + reads + ' 页（浅色的那几页）。每读一页，在页里对半猜出该往哪个孩子走。'; });
  $('[data-x="many"]', fig).addEventListener('click', () => { root = {keys: [], kids: []}; splits = 0; hl = null; for (let k = 1; k <= 20; k++) { log = []; insert(k); } draw(); say.textContent = '按顺序插了 1 到 20：树高 ' + height(root) + '，所有叶子都在同一层。和第十章歪成一根棍的搜索树比一比。'; });
  $('[data-x="clr"]', fig).addEventListener('click', clear);
  clear();
});
