/* ---------- 第二十七章 ---------- */
dev('#vmFig', fig => {
  const inp = $('#vmIn'), st = $('.vmsteps', fig), pt = $('.vmpt', fig), say = $('.say', fig);
  const PT = [5, 2, null, 9, 12, 7, null, 0, 3, null, 14, 1, null, 6, 11, null];
  function go(){
    const s = inp.value.trim().replace(/^0x/i, '');
    if (!/^[0-9a-f]{1,4}$/i.test(s)) { st.innerHTML = ''; say.textContent = '请输入 1 到 4 位十六进制数（0000—FFFF）。'; return; }
    const va = parseInt(s, 16), vpn = va >> 12, off = va & 0xFFF, f = PT[vpn];
    pt.innerHTML = '<table class="t c" style="font-size:12.5px"><tr><th>页号</th><th>页框号</th><th>有效</th></tr>' + PT.map((x, i) => '<tr' + (i === vpn ? ' style="background:var(--hl);font-weight:700"' : '') + '><td class="m">' + i + '</td><td class="m">' + (x === null ? '—' : x) + '</td><td>' + (x === null ? 0 : 1) + '</td></tr>').join('') + '</table>';
    const b = bin(va, 16);
    let h = '<div class="vmrow"><span>虚拟地址</span><code>0x' + pad(s.toUpperCase(), 4) + '</code><code><b style="color:var(--l2)">' + b.slice(0, 4) + '</b> ' + grp(b.slice(4)) + '</code></div>';
    h += '<div class="vmrow"><span>拆开</span><code>页号 ' + vpn + '</code><code>偏移 0x' + pad(off.toString(16).toUpperCase(), 3) + '</code></div>';
    if (f === null) { h += '<div class="vmrow"><span>查页表</span><code style="color:var(--red)">第 ' + vpn + ' 项无效</code></div>'; say.innerHTML = '<b style="color:var(--red)">缺页！</b>第 ' + vpn + ' 页不在内存里。MMU 产生缺页异常，内核找一个页框、把这一页从硬盘读进来、填好页表，再让这条指令重新执行（第二层）。'; }
    else { const pa = (f << 12) | off; h += '<div class="vmrow"><span>查页表</span><code>页框 ' + f + '</code></div><div class="vmrow"><span>物理地址</span><code>0x' + pad(pa.toString(16).toUpperCase(), 4) + '</code><code><b style="color:var(--on)">' + bin(f, 4) + '</b> ' + grp(b.slice(4)) + '</code></div>'; say.innerHTML = '高 4 位的页号 ' + vpn + ' 换成了页框号 ' + f + '，低 12 位的偏移原样照抄。'; }
    st.innerHTML = h;
  }
  inp.addEventListener('input', go);
  $$('[data-v]', fig).forEach(b => b.addEventListener('click', () => { inp.value = b.dataset.v; go(); }));
  go();
});

dev('#replFig', fig => {
  const seqIn = $('#rpSeq'), nIn = $('#rpN'), box = $('.repl', fig), out = $('.kv', fig), say = $('.say', fig);
  const ALGS = ['FIFO', 'LRU', 'OPT', 'CLOCK'];
  let alg = 0;
  function sim(seq, n, a){
    let fr = [], meta = [], ptr = 0, faults = 0; const cols = [];
    seq.forEach((p, t) => {
      let hit = fr.indexOf(p), victim = null;
      if (hit >= 0) { if (a === 1) meta[hit] = t; if (a === 3) meta[hit] = 1; }
      else {
        faults++;
        if (fr.length < n) { fr.push(p); meta.push(a === 3 ? 1 : t); if (a === 3) ptr = fr.length % n; }
        else {
          let k;
          if (a === 0) { k = meta.indexOf(Math.min(...meta)); }
          if (a === 1) { k = meta.indexOf(Math.min(...meta)); }
          if (a === 2) { let far = -1; fr.forEach((q, i) => { const nx = seq.indexOf(q, t + 1), d = nx < 0 ? Infinity : nx; if (d > far) { far = d; k = i; } }); }
          if (a === 3) { while (meta[ptr] === 1) { meta[ptr] = 0; ptr = (ptr + 1) % n; } k = ptr; ptr = (ptr + 1) % n; }
          victim = fr[k]; fr[k] = p; meta[k] = a === 3 ? 1 : t;
        }
      }
      cols.push({p, fr: fr.slice(), bits: a === 3 ? meta.slice() : null, fault: hit < 0, victim});
    });
    return {faults, cols};
  }
  function draw(){
    const seq = seqIn.value.trim().split(/[\s,]+/).filter(Boolean), n = Math.max(1, Math.min(6, parseInt(nIn.value, 10) || 3));
    if (!seq.length) return;
    const r = sim(seq, n, alg);
    let h = '<table class="t c rp"><tr><th>访问</th>' + r.cols.map(c => '<th class="m">' + esc(c.p) + '</th>').join('') + '</tr>';
    for (let k = 0; k < n; k++) h += '<tr><th>框 ' + k + '</th>' + r.cols.map(c => '<td class="m' + (c.fault && c.fr[k] === c.p ? ' nw' : '') + '">' + (c.fr[k] !== undefined ? esc(c.fr[k]) + (c.bits ? '<sup>' + c.bits[k] + '</sup>' : '') : '') + '</td>').join('') + '</tr>';
    h += '<tr><th>缺页</th>' + r.cols.map(c => '<td>' + (c.fault ? '<b style="color:var(--red)">✗</b>' : '') + '</td>').join('') + '</tr></table>';
    box.innerHTML = h;
    const all = ALGS.map((_, a) => sim(seq, n, a).faults);
    kv(out, [['缺页次数', r.faults + ' / ' + seq.length], ['缺页率', (r.faults / seq.length * 100).toFixed(0) + '%'], ['四种算法', ALGS.map((x, a) => x + ' ' + all[a]).join('　')]]);
    say.innerHTML = ['FIFO：换出最早进来的那一页。', 'LRU：换出最久没被访问的那一页。', 'OPT：往后看，换出最晚才会再用到（或再也用不到）的那一页。它要预知未来，只用来做比较的标准。', 'CLOCK：上标是访问位。指针转圈，遇到 1 就清成 0 跳过，遇到 0 就换出。'][alg] + ' 红色的叉表示这一步缺页，浅色底是刚换进来的页。';
  }
  btnRow($('[data-m]', fig), ALGS, 0, i => { alg = i; draw(); });
  $('[data-x="bel"]', fig).addEventListener('click', () => {
    seqIn.value = '1 2 3 4 1 2 5 1 2 3 4 5'; alg = 0; $$('[data-m] button', fig).forEach((b, i) => b.classList.toggle('on', i === 0));
    const f3 = sim(seqIn.value.split(' '), 3, 0).faults, f4 = sim(seqIn.value.split(' '), 4, 0).faults;
    nIn.value = 4; draw(); say.innerHTML += '<br><b>Belady 异常</b>：同一串访问，FIFO 用 3 个页框缺页 ' + f3 + ' 次，用 4 个页框反而缺页 ' + f4 + ' 次。';
  });
  [seqIn, nIn].forEach(el => el.addEventListener('input', draw));
  draw();
});
