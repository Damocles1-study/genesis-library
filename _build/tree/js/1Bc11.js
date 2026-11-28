/* ---------- 第十一章：会自己转的树（AVL） ---------- */
dev('#avlFig', fig => {
  const svg = $('svg.avl', fig), kvb = $('.kv', fig), say = $('.say', fig), inp = $('#avIn');
  let n = {}, root = null, next = 1, log = [], plain = BT.mk();
  const H = id => id == null ? 0 : n[id].h;
  const upd = id => { n[id].h = 1 + Math.max(H(n[id].l), H(n[id].r)); };
  const rotR = a => { const b = n[a].l; n[a].l = n[b].r; n[b].r = a; upd(a); upd(b); return b; };
  const rotL = a => { const b = n[a].r; n[a].r = n[b].l; n[b].l = a; upd(a); upd(b); return b; };
  function ins(p, k){
    if (p == null) { const id = 'v' + next++; n[id] = {k, l: null, r: null, h: 1}; return id; }
    if (k < n[p].k) n[p].l = ins(n[p].l, k); else if (k > n[p].k) n[p].r = ins(n[p].r, k); else return p;
    upd(p); const bf = H(n[p].l) - H(n[p].r);
    if (bf === 2) { if (k > n[n[p].l].k) { log.push('结点 ' + n[p].k + ' 左边重了 2，新数在它左孩子的右边：LR，先把左孩子左旋，再把 ' + n[p].k + ' 右旋。'); n[p].l = rotL(n[p].l); } else log.push('结点 ' + n[p].k + ' 左边重了 2，新数在它左孩子的左边：LL，把 ' + n[p].k + ' 右旋，它的左孩子 ' + n[n[p].l].k + ' 升上来。'); return rotR(p); }
    if (bf === -2) { if (k < n[n[p].r].k) { log.push('结点 ' + n[p].k + ' 右边重了 2，新数在它右孩子的左边：RL，先把右孩子右旋，再把 ' + n[p].k + ' 左旋。'); n[p].r = rotR(n[p].r); } else log.push('结点 ' + n[p].k + ' 右边重了 2，新数在它右孩子的右边：RR，把 ' + n[p].k + ' 左旋，它的右孩子 ' + n[n[p].r].k + ' 升上来。'); return rotL(p); }
    return p;
  }
  function draw(hl){
    drawBinTree(svg, n, root, {W: 640, H: 240, mark: id => n[id].k === hl ? 'hl' : '', sub: id => String(H(n[id].l) - H(n[id].r))});
    kv(kvb, [['结点数', Object.keys(n).length], ['AVL 树高', H(root)], ['同样的数插进普通搜索树，高', BT.height(plain)]]);
  }
  function insert(k){ if (Object.keys(n).length >= 31) { say.textContent = '树太大了，先清空。'; return; } log = []; root = ins(root, k); BT.insert(plain, k); draw(k); say.textContent = '插入 ' + k + '。' + (log.length ? log[log.length - 1] : '没有哪个结点歪到 2，不用转。'); }
  $('[data-x="ins"]', fig).addEventListener('click', () => { const v = parseInt(inp.value, 10); if (!isNaN(v)) { insert(v); inp.value = v + 1; } });
  $('[data-x="seq"]', fig).addEventListener('click', () => { n = {}; root = null; plain = BT.mk(); let rot = 0; for (let k = 1; k <= 15; k++) { log = []; root = ins(root, k); BT.insert(plain, k); rot += log.length; } draw(); say.textContent = '按顺序插了 1 到 15，一共转了 ' + rot + ' 次。AVL 树高 ' + H(root) + '，普通搜索树高 15。'; });
  $('[data-x="clr"]', fig).addEventListener('click', () => { n = {}; root = null; plain = BT.mk(); draw(); inp.value = 1; say.textContent = '空树。从 1 开始一个一个插，看什么时候第一次转。'; });
  draw(); say.textContent = '空树。从 1 开始一个一个插，看什么时候第一次转。';
});
