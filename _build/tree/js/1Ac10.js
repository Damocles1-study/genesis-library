/* ---------- 第十章：搜索树游乐场 ---------- */
/* 公用：用 {id: {k, l, r}} 存的二叉搜索树。BT.insert 返回经过的 id 列表 */
const BT = {
  mk(){ return {n: {}, root: null, next: 1}; },
  insert(t, key){ const path = []; let p = t.root, par = null, side = null; while (p != null) { path.push(p); if (key === t.n[p].k) return {path, dup: true}; par = p; side = key < t.n[p].k ? 'l' : 'r'; p = t.n[p][side]; } const id = 'b' + t.next++; t.n[id] = {k: key, l: null, r: null}; if (par == null) t.root = id; else t.n[par][side] = id; path.push(id); return {path, id}; },
  find(t, key){ const path = []; let p = t.root; while (p != null) { path.push(p); if (key === t.n[p].k) return {path, id: p}; p = key < t.n[p].k ? t.n[p].l : t.n[p].r; } return {path, id: null}; },
  height(t, id){ id = id === undefined ? t.root : id; return id == null ? 0 : 1 + Math.max(BT.height(t, t.n[id].l), BT.height(t, t.n[id].r)); },
  ino(t, id, out){ out = out || []; id = id === undefined ? t.root : id; if (id != null) { BT.ino(t, t.n[id].l, out); out.push(t.n[id].k); BT.ino(t, t.n[id].r, out); } return out; },
  depthSum(t, id, d){ id = id === undefined ? t.root : id; d = d || 1; return id == null ? 0 : d + BT.depthSum(t, t.n[id].l, d + 1) + BT.depthSum(t, t.n[id].r, d + 1); },
  del(t, key){ let p = t.root, par = null, side = null; while (p != null && t.n[p].k !== key) { par = p; side = key < t.n[p].k ? 'l' : 'r'; p = t.n[p][side]; } if (p == null) return null; const nd = t.n[p]; let msg;
    const replace = c => { if (par == null) t.root = c; else t.n[par][side] = c; };
    if (nd.l == null && nd.r == null) { replace(null); msg = '它是叶子，直接删掉。'; }
    else if (nd.l == null || nd.r == null) { replace(nd.l != null ? nd.l : nd.r); msg = '它只有一棵子树，让子树顶上来。'; }
    else { let sp = p, s = nd.r; while (t.n[s].l != null) { sp = s; s = t.n[s].l; } nd.k = t.n[s].k; if (sp === p) t.n[sp].r = t.n[s].r; else t.n[sp].l = t.n[s].r; delete t.n[s]; msg = '它有两棵子树：用中序后继 ' + nd.k + '（右子树最左下的）顶替它，再删掉原来那个后继。'; return msg; }
    delete t.n[p]; return msg; }
};
dev('#bstFig', fig => {
  const svg = $('svg.bst', fig), ino = $('#bsIno'), kvb = $('.kv', fig), say = $('.say', fig), inp = $('#bsIn');
  let t = BT.mk(), mark = {};
  const r = rng(10);
  function draw(){
    drawBinTree(svg, t.n, t.root, {W: 640, H: 240, mark: id => mark[id] || ''});
    const arr = BT.ino(t); const n = arr.length;
    ino.innerHTML = n ? '<span class="dim" style="border:0">中序：</span>' + arr.map(v => '<span>' + v + '</span>').join('') : '';
    kv(kvb, [['结点数', n], ['树高', BT.height(t)], ['平均查找长度（成功）', n ? (BT.depthSum(t) / n).toFixed(2) : '—'], ['匀称的树最矮能到', n ? Math.ceil(Math.log2(n + 1)) : '—']]);
  }
  const val = () => { const v = parseInt(inp.value, 10); return isNaN(v) ? null : v; };
  $('[data-x="ins"]', fig).addEventListener('click', () => { const v = val(); if (v === null) return; if (Object.keys(t.n).length >= 31) { say.textContent = '树太大了，先清空。'; return; } const res = BT.insert(t, v); mark = {}; res.path.forEach(id => mark[id] = 'v'); if (!res.dup) mark[res.id] = 'hl'; draw(); say.textContent = res.dup ? v + ' 已经在树里了。' : '一路比下去：' + res.path.slice(0, -1).map(id => t.n[id].k + (v < t.n[id].k ? ' 往左' : ' 往右')).join('，') + (res.path.length > 1 ? '，' : '') + '走到空位，挂上 ' + v + '。'; });
  $('[data-x="find"]', fig).addEventListener('click', () => { const v = val(); if (v === null) return; const res = BT.find(t, v); mark = {}; res.path.forEach(id => mark[id] = 'v'); if (res.id) mark[res.id] = 'ok'; draw(); say.textContent = (res.id ? '找到了 ' + v : '没有 ' + v) + '，比了 ' + res.path.length + ' 次：' + res.path.map(id => t.n[id].k).join(' → ') + '。'; });
  $('[data-x="del"]', fig).addEventListener('click', () => { const v = val(); if (v === null) return; const m = BT.del(t, v); mark = {}; draw(); say.textContent = m === null ? '树里没有 ' + v + '。' : '删掉 ' + v + '：' + m; });
  $('[data-x="rand"]', fig).addEventListener('click', () => { t = BT.mk(); const pool = []; while (pool.length < 10) { const x = 1 + Math.floor(r() * 99); if (!pool.includes(x)) pool.push(x); } pool.forEach(x => BT.insert(t, x)); mark = {}; draw(); say.textContent = '按这个顺序插的：' + pool.join(' ') + '。树高 ' + BT.height(t) + '。'; });
  $('[data-x="sorted"]', fig).addEventListener('click', () => { t = BT.mk(); for (let x = 10; x <= 100; x += 10) BT.insert(t, x); mark = {}; draw(); say.textContent = '按 10、20、……100 的顺序插：树歪成了一根棍，高 10。找 100 要比 10 次。'; });
  $('[data-x="clr"]', fig).addEventListener('click', () => { t = BT.mk(); mark = {}; draw(); say.textContent = '空树。插几个数试试。'; });
  [50, 30, 70, 20, 40, 60, 80].forEach(x => BT.insert(t, x));
  draw(); say.textContent = '这棵树是依次插入 50 30 70 20 40 60 80 得到的。';
});
