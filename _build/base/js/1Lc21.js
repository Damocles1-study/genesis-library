/* ---------- 第二十一章：分配器 ---------- */
dev('#heapFig', fig => {
  const bar = $('.heapbar', fig), ptrs = $('.heapptrs', fig), out = $('.kv', fig), say = $('.say', fig), inp = $('#hpN'), coal = $('#hpC');
  const U = 32, ALGS = ['首次适应', '邻近适应（第二层）', '最佳适应（第二层）', '最坏适应（第二层）'];
  const COLS = ['var(--on)', 'var(--l2)', 'var(--l1)', 'var(--l3)', 'var(--gold)', 'var(--ter)'];
  let blocks, nid, alg = 0, rover = 0;
  const reset = () => { blocks = [{s: 0, n: U, used: false}]; nid = 1; rover = 0; };
  function malloc(bytes){
    const need = Math.max(2, Math.ceil(bytes / 8) + 1);
    const free = blocks.filter(b => !b.used && b.n >= need);
    let pick = null;
    if (!free.length) return {ok: false, need};
    if (alg === 0) pick = free[0];
    if (alg === 1) pick = free.find(b => b.s >= rover) || free[0];
    if (alg === 2) pick = free.reduce((a, b) => b.n < a.n ? b : a);
    if (alg === 3) pick = free.reduce((a, b) => b.n > a.n ? b : a);
    const i = blocks.indexOf(pick), id = nid++;
    if (pick.n - need >= 2) { blocks.splice(i, 1, {s: pick.s, n: need, used: true, id, req: bytes}, {s: pick.s + need, n: pick.n - need, used: false}); }
    else { pick.used = true; pick.id = id; pick.req = bytes; }
    rover = pick.s + need;
    return {ok: true, id, need, at: pick.s};
  }
  function free(id){
    const i = blocks.findIndex(b => b.id === id); if (i < 0) return;
    const b = blocks[i]; b.used = false; delete b.id; delete b.req;
    if (coal.checked) {
      if (blocks[i + 1] && !blocks[i + 1].used) { b.n += blocks[i + 1].n; blocks.splice(i + 1, 1); }
      if (blocks[i - 1] && !blocks[i - 1].used) { blocks[i - 1].n += b.n; blocks.splice(i, 1); }
    }
  }
  function draw(msg){
    let h = '';
    blocks.forEach(b => { for (let k = 0; k < b.n; k++) { const head = k === 0, col = b.used ? COLS[(b.id - 1) % COLS.length] : null; h += '<div class="hc' + (b.used ? ' u' : ' f') + (head ? ' hd' : '') + '" style="' + (col ? '--c:' + col : '') + '" title="' + ahex(0x600000004000 + (b.s + k) * 8) + '">' + (head ? (b.used ? 'p' + b.id : b.n) : '') + '</div>'; } });
    bar.innerHTML = h;
    const used = blocks.filter(b => b.used);
    ptrs.innerHTML = used.length ? used.map(b => '<button class="btn" data-f="' + b.id + '" style="border-color:' + COLS[(b.id - 1) % COLS.length] + '">free(p' + b.id + ')　' + b.req + ' 字节</button>').join('') : '<span class="dim" style="font-size:13px">（还没有借出去的内存）</span>';
    const req = used.reduce((a, b) => a + b.req, 0), occ = used.reduce((a, b) => a + b.n * 8, 0), freeB = blocks.filter(b => !b.used), ft = freeB.reduce((a, b) => a + b.n * 8, 0), fmax = Math.max(0, ...freeB.map(b => (b.n - 1) * 8));
    kv(out, [['程序要的', req + ' 字节'], ['实际占用', occ + ' 字节'], ['内部碎片', (occ - req) + ' 字节'], ['空闲总共', ft + ' 字节，' + freeB.length + ' 块'], ['最大一次能借', fmax + ' 字节']]);
    if (msg) say.innerHTML = msg;
  }
  btnRow($('[data-alg]', fig), ALGS, 0, i => { alg = i; draw('换成了“' + ALGS[i] + '”，接着借试试。'); });
  ptrs.addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; free(+b.dataset.f); draw('还回了 p' + b.dataset.f + '。' + (coal.checked ? '如果它旁边也是空地，就合并成一大块。' : '没有合并：相邻的空地仍然各算各的，碎片更多。')); });
  $('.row', fig).addEventListener('click', e => { const b = e.target.closest('button[data-x]'); if (!b) return; const x = b.dataset.x;
    if (x === 'reset') { reset(); draw('清空了，整块 256 字节都是空地（第一格是它的账本）。'); }
    if (x === 'm') { const n = Math.max(1, Math.min(240, parseInt(inp.value, 10) || 1)); const r = malloc(n); draw(r.ok ? 'malloc(' + n + ')：要 ' + Math.ceil(n / 8) + ' 格放数据、1 格放账本，按“' + ALGS[alg] + '”找到从第 ' + r.at + ' 格开始的空地，借给 p' + r.id + '。' + (n % 8 ? ' 因为按 8 字节一格分，多给的 ' + (Math.ceil(n / 8) * 8 - n) + ' 字节就是内部碎片。' : '') : '<b style="color:var(--red)">malloc(' + n + ') 失败，返回 NULL。</b>要 ' + r.need + ' 格连续的空地，可是没有一块够大' + (blocks.filter(b => !b.used).reduce((a, b) => a + b.n, 0) >= r.need ? '——虽然空地加起来是够的。这就是<b>外部碎片</b>。' : '。')); }
    if (x === 'demo') { reset(); alg = 0; $$('[data-alg] button', fig).forEach((bb, i) => bb.classList.toggle('on', i === 0)); coal.checked = true; [40, 40, 40, 40, 40].forEach(n => malloc(n)); free(2); free(4); const r = malloc(64); draw('演示：连借 5 块各 40 字节，再还掉 p2 和 p4。现在空地一共 ' + blocks.filter(b => !b.used).reduce((a, b) => a + b.n * 8, 0) + ' 字节，可是 malloc(64) ' + (r.ok ? '成功了' : '<b style="color:var(--red)">失败</b>') + '：空地被切成了不相邻的几小块，没有一块够 64 字节。这就是外部碎片。'); }
  });
  reset(); draw('点 malloc 借一块。悬停在格子上能看到它的地址。');
});
