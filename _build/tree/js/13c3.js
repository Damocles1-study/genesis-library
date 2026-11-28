/* ---------- 第三章：鸭子队伍（链表操作台） ---------- */
dev('#listFig', fig => {
  const box = $('#lsChain'), kvb = $('.kv', fig), say = $('.say', fig);
  const NAMES = ['小灰', '小白', '小黄', '小花', '小新', '小豆', '小米', '小圆', '小方', '小尖'];
  let nodes, head, nk, steps, busy = false;
  // nodes: id → {name, next(id|null)}；画的时候从 head 顺着走
  function reset(){ nodes = {}; head = null; nk = 0; steps = 0; for (let i = 2; i >= 0; i--) { const id = 'n' + nk++; nodes[id] = {name: NAMES[i], next: head}; head = id; } draw(); say.textContent = '三只鸭子：小灰 → 小白 → 小黄。最后一只的纸条是空的（∅）。'; }
  function order(){ const out = []; let p = head, guard = 0; while (p && guard++ < 50) { out.push(p); p = nodes[p].next; } return out; }
  function draw(hl, rev){
    const ids = order();
    let h = '<span class="hd">头 →</span>';
    ids.forEach((id, k) => { h += '<span class="nd' + (hl === id ? ' hl' : '') + '"><b>' + nodes[id].name + '</b><i>→ ' + (nodes[id].next ? nodes[nodes[id].next].name : '∅') + '</i></span>'; if (k < ids.length - 1) h += '<span class="ar">→</span>'; });
    if (!ids.length) h += '<span class="hd">∅（空的）</span>';
    if (rev) h += rev;
    box.innerHTML = h;
    kv(kvb, [['鸭子数', ids.length], ['这次走了几步', steps]]);
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function walkTo(k){ // 从头走到第 k 个（0 起），返回 id
    let p = head; steps = 0;
    for (let i = 0; i < k && p; i++) { draw(p); say.textContent = '照着纸条走……第 ' + i + ' 个是 ' + nodes[p].name; await wait(320); p = nodes[p].next; steps++; }
    return p;
  }
  const OPS = ['头插一只', '尾插一只', '找第 3 只', '拿走最后一只', '倒过来', '重来'];
  const mb = $('[data-m]', fig);
  mb.innerHTML = OPS.map((t, i) => '<button class="btn" data-i="' + i + '">' + t + '</button>').join('');
  mb.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b || busy) return;
    const i = +b.dataset.i; busy = true;
    try {
      if (i === 5) { reset(); return; }
      const ids = order();
      if (i === 0) { if (ids.length >= 9) { say.textContent = '队伍太长了，先拿走几只。'; return; } const id = 'n' + nk++; nodes[id] = {name: NAMES[(nk + 2) % NAMES.length], next: head}; head = id; steps = 0; draw(id); say.textContent = '头插：新鸭子“' + nodes[id].name + '”的纸条写上原来的头，再把头改成它。走了 0 步，不管队伍多长。'; }
      if (i === 1) { if (ids.length >= 9) { say.textContent = '队伍太长了，先拿走几只。'; return; } const id = 'n' + nk++; nodes[id] = {name: NAMES[(nk + 2) % NAMES.length], next: null}; if (!head) { head = id; steps = 0; } else { const last = await walkTo(ids.length - 1); nodes[last].next = id; } draw(id); say.textContent = '尾插：先从头走到最后一只（走了 ' + steps + ' 步），再让它的纸条指着新鸭子“' + nodes[id].name + '”。队伍越长走得越多。（要是一直记着“尾”在哪儿，就不用走了。）'; }
      if (i === 2) { if (ids.length < 4) { say.textContent = '不到 4 只（第 3 只是从 0 数的第四只）。先头插几只。'; return; } const p = await walkTo(3); draw(p); say.textContent = '第 3 只（从 0 数）是“' + nodes[p].name + '”：从头走了 ' + steps + ' 步。数组一步就到。'; }
      if (i === 3) { if (!ids.length) { say.textContent = '一只也没有了。'; return; } if (ids.length === 1) { delete nodes[head]; head = null; steps = 0; draw(); say.textContent = '拿走了最后一只，队伍空了。'; return; } const prev = await walkTo(ids.length - 2); const gone = nodes[prev].next; nodes[prev].next = null; delete nodes[gone]; draw(prev); say.textContent = '要先走到倒数第二只（走了 ' + steps + ' 步），把它的纸条改成空的。'; }
      if (i === 4) {
        let prev = null, p = head; steps = 0;
        while (p) { const nx = nodes[p].next; nodes[p].next = prev; say.textContent = '让“' + nodes[p].name + '”的纸条掉头，指向' + (prev ? '“' + nodes[prev].name + '”' : '空') + '。'; prev = p; p = nx; steps++;
          // 画：已经掉头的部分 + 还没处理的部分
          const done = []; let q = prev; while (q) { done.push(q); q = nodes[q].next; }
          let h = '<span class="hd">新头 →</span>' + done.map((id, k) => '<span class="nd' + (k === 0 ? ' hl' : '') + '"><b>' + nodes[id].name + '</b><i>→ ' + (nodes[id].next ? nodes[nodes[id].next].name : '∅') + '</i></span>').join('<span class="ar">→</span>');
          const rest = []; q = p; while (q) { rest.push(q); q = nodes[q].next; }
          if (rest.length) h += '<span class="hd">　还没掉头：</span>' + rest.map(id => '<span class="nd"><b>' + nodes[id].name + '</b></span>').join('<span class="ar">→</span>');
          box.innerHTML = h; await wait(600); }
        head = prev; draw(); say.textContent = '倒过来了：每只鸭子的纸条都掉了头，头换成了原来的最后一只。走了一遍，' + steps + ' 步，没有搬动任何一只鸭子。';
      }
    } finally { busy = false; }
  });
  reset();
});
