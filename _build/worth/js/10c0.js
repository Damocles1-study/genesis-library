
/* ---------- 装置 1：道德代数 ---------- */
dev('#maFig', fig => {
  const DEF = {pro: [['工资高三成，每年多存下一笔', 4], ['新行业学东西快', 3], ['大城市机会多', 3]],
               con: [['离家远，一年回去两三次', 3], ['房租贵，涨的钱一半给了房东', 2], ['朋友都在这边', 2], ['工作强度大，传说常加班', 2]]};
  const say = $('#maSay');
  let data;
  const row = (side, t, w) => '<div class="ctl" style="grid-template-columns:minmax(0,1fr) 4.5em 1.6em"><input type="text" value="' + esc(t) + '" data-s="' + side + '" style="border:1px solid var(--rule);border-radius:5px;background:var(--paper);padding:2px 6px;min-width:0;width:100%"><select>' + [1, 2, 3, 4, 5].map(k => '<option' + (k === w ? ' selected' : '') + '>' + k + '</option>').join('') + '</select><button class="btn" style="padding:0 6px" title="删掉">×</button></div>';
  function draw(){
    $('#maPro').innerHTML = data.pro.map(r => row('pro', r[0], r[1])).join('');
    $('#maCon').innerHTML = data.con.map(r => row('con', r[0], r[1])).join('');
  }
  function read(){
    ['pro', 'con'].forEach(s => { data[s] = $$('#ma' + (s === 'pro' ? 'Pro' : 'Con') + ' .ctl').map(d => [$('input', d).value.trim(), +$('select', d).value]).filter(r => r[0]); });
  }
  function reset(){ data = JSON.parse(JSON.stringify(DEF)); draw(); say.className = 'say'; say.textContent = '改好以后按“抵消”。'; }
  fig.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { read(); data[add.dataset.add].push(['', 2]); draw(); const ins = $$('#ma' + (add.dataset.add === 'pro' ? 'Pro' : 'Con') + ' input'); ins[ins.length - 1].focus(); return; }
    const del = e.target.closest('.ctl .btn');
    if (del) { del.parentNode.remove(); return; }
  });
  $('#maReset').addEventListener('click', reset);
  $('#maGo').addEventListener('click', () => {
    read();
    let P = data.pro.map((r, i) => ({t: r[0], w: r[1], s: 'pro', id: 'p' + i})), C = data.con.map((r, i) => ({t: r[0], w: r[1], s: 'con', id: 'c' + i}));
    const struck = [];
    // 从最重的开始，在另一边找一条等重，或两条之和等重
    let changed = true;
    while (changed) {
      changed = false;
      const all = [...P, ...C].sort((a, b) => b.w - a.w);
      for (const x of all) {
        const other = x.s === 'pro' ? C : P;
        let m = other.find(o => o.w === x.w);
        let group = m ? [m] : null;
        if (!group) { outer: for (let i = 0; i < other.length; i++) for (let j = i + 1; j < other.length; j++) if (other[i].w + other[j].w === x.w) { group = [other[i], other[j]]; break outer; } }
        if (group) {
          struck.push([x, group]);
          const rm = new Set([x.id, ...group.map(g => g.id)]);
          P = P.filter(o => !rm.has(o.id)); C = C.filter(o => !rm.has(o.id));
          changed = true; break;
        }
      }
    }
    const sp = P.reduce((a, b) => a + b.w, 0), sc = C.reduce((a, b) => a + b.w, 0);
    const q = esc($('#maQ').value.trim() || '这件事');
    let h = '<b>' + q + '</b><br>';
    h += struck.length ? '划掉了 ' + struck.length + ' 组：' + struck.map(s => '“' + esc(s[0].t) + '”（' + s[0].w + '）抵 ' + s[1].map(g => '“' + esc(g.t) + '”（' + g.w + '）').join(' + ')).join('；') + '。<br>' : '没有能成对抵消的理由。<br>';
    h += '剩下：赞成 ' + (P.length ? P.map(o => esc(o.t) + '（' + o.w + '）').join('、') : '无') + '；反对 ' + (C.length ? C.map(o => esc(o.t) + '（' + o.w + '）').join('、') : '无') + '。<br>';
    h += sp > sc ? '赞成一边重 <b>' + (sp - sc) + '</b> 分。' : sc > sp ? '反对一边重 <b>' + (sc - sp) + '</b> 分。' : '两边一样重。';
    h += ' 富兰克林的提醒是：结果不是命令。如果算出来的结论让你心里一沉，那份“一沉”本身就是一条你还没写下来的理由，把它写上去，再算一遍。';
    say.className = 'say ok'; say.innerHTML = h;
  });
  reset();
});
