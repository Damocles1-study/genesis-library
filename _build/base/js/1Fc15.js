/* ---------- 第十五章：流水线时空图 ---------- */
dev('#pipeFig', fig => {
  const box = $('.pipe', fig), prog = $('.pipeprog', fig), out = $('.kv', fig), say = $('.say', fig);
  /* [汇编, 写哪个寄存器, 读哪些寄存器, 是不是 load, 是不是跳转] */
  const P = [['ldr  x1, [x0]', 'x1', ['x0'], 1, 0], ['add  x2, x1, x1', 'x2', ['x1'], 0, 0], ['sub  x3, x4, x5', 'x3', ['x4', 'x5'], 0, 0], ['b    L（跳转，跳）', null, [], 0, 1], ['L: add x6, x2, x3', 'x6', ['x2', 'x3'], 0, 0], ['str  x6, [x0, #8]', null, ['x6', 'x0'], 0, 0]];
  const ST = ['IF', 'ID', 'EX', 'MEM', 'WB'];
  const MODES = ['不用流水线', '理想流水线', '只会停顿（第二层）', '加上旁路（第二层）', '旁路 + 分支猜错（第二层）'];
  let mode = 1;
  prog.innerHTML = '<pre class="out" style="font-size:12.5px">' + P.map((p, i) => 'I' + (i + 1) + '  ' + esc(p[0])).join('\n') + '</pre>';
  function schedule(){
    const s = [];
    if (mode === 0) { P.forEach((_, i) => s.push(ST.map((_, k) => 1 + i * 5 + k))); return s; }
    P.forEach((p, i) => {
      const t = [];
      for (let k = 0; k < 5; k++) {
        let lo = k === 0 ? 1 : t[k - 1] + 1;
        if (i > 0) lo = Math.max(lo, k < 4 ? s[i - 1][k + 1] : s[i - 1][4] + 1);
        if (mode >= 2) {
          for (let j = 0; j < i; j++) {
            const q = P[j]; if (!q[1] || !p[2].includes(q[1])) continue;
            if (mode === 2 && k === 1) lo = Math.max(lo, s[j][4]);
            if (mode >= 3 && k === 2) lo = Math.max(lo, s[j][q[3] ? 3 : 2] + 1);
          }
          if (mode === 4 && k === 0 && i > 0 && P[i - 1][4]) lo = Math.max(lo, s[i - 1][2] + 1);
        }
        t.push(lo);
      }
      s.push(t);
    });
    return s;
  }
  function draw(){
    const s = schedule(), T = s[s.length - 1][4];
    let h = '<table class="t c pt"><tr><th></th>' + Array.from({length: T}, (_, c) => '<th>' + (c + 1) + '</th>').join('') + '</tr>';
    s.forEach((t, i) => {
      const cells = Array(T).fill('');
      t.forEach((c, k) => { cells[c - 1] = '<td class="st s' + k + '">' + ST[k] + '</td>'; if (k > 0) for (let x = t[k - 1] + 1; x < c; x++) cells[x - 1] = '<td class="st stall">停</td>'; });
      h += '<tr><th>I' + (i + 1) + '</th>' + cells.map(c => c || '<td></td>').join('') + '</tr>';
    });
    box.innerHTML = h + '</table>';
    const ideal = 5 + P.length - 1;
    kv(out, [['总共', T + ' 个周期'], ['平均每条指令', (T / P.length).toFixed(2) + ' 个周期'], ['比理想流水线多', mode === 0 ? '—' : (T - ideal) + ' 个周期']]);
    say.innerHTML = [
      '一条做完再做下一条：6 × 5 = 30 个周期。每个时刻只有一段在忙，其余四段闲着。',
      '理想情况：每个周期进一条，5 + 5 = 10 个周期。可是这里假装 I2 不用等 I1 的 x1，这是不对的。',
      '没有旁路时，用到前面结果的指令要在 ID 段等，直到前一条在 WB 段写回寄存器（同一周期先写后读）。I2 等 I1，I5 等 I2 和 I3，I6 等 I5，停了好多拍；后面的指令也被堵在后面。',
      '有旁路：结果算出来就直接送给后面的 EX 段，大部分等待消失了。只剩 I2 紧跟在 ldr 后面，ldr 的数据要到 MEM 结束才有，必须停 1 拍（load-use 冒险）。',
      'I4 是一条跳转。如果处理器猜“不跳”而它其实跳了，要等 I4 在 EX 段算出结果，才知道该取 I5，前面取错的指令被清掉，又多出两拍。分支预测猜得准，就能省掉这些。'][mode];
  }
  btnRow($('[data-m]', fig), MODES, 1, i => { mode = i; draw(); });
  draw();
});
