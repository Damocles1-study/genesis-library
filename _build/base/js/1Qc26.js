/* ---------- 第二十六章：调度模拟器 ---------- */
dev('#schedFig', fig => {
  const inBox = $('.scin', fig), gBox = $('.gantt', fig), oBox = $('.scout', fig), say = $('.say', fig), qIn = $('#scQ');
  const ALGS = ['先来先服务', '短作业优先', '最短剩余时间优先（第二层）', '高响应比优先（第二层）', '时间片轮转'];
  const EX1 = [[0, 7], [2, 4], [4, 1], [5, 4]], EX2 = [[0, 10], [1, 2], [2, 1], [3, 2]];
  let P = EX1.map(x => x.slice()), alg = 0;
  const COL = ['var(--on)', 'var(--l2)', 'var(--l1)', 'var(--l3)', 'var(--gold)'];
  function drawIn(){
    inBox.innerHTML = '<table class="t c" style="max-width:420px;margin:8px 0"><tr><th>进程</th><th>到达时间</th><th>要运行</th><th></th></tr>' + P.map((p, i) => '<tr><td style="color:' + COL[i] + ';font-weight:700">P' + (i + 1) + '</td><td><input type="number" min="0" max="30" value="' + p[0] + '" data-i="' + i + '" data-k="0" style="width:4em"></td><td><input type="number" min="1" max="20" value="' + p[1] + '" data-i="' + i + '" data-k="1" style="width:4em"></td><td>' + (P.length > 2 ? '<button class="btn" data-del="' + i + '">删</button>' : '') + '</td></tr>').join('') + '</table>' + (P.length < 5 ? '<button class="btn" data-add>加一个进程</button>' : '');
  }
  function run(){
    const n = P.length, rem = P.map(p => p[1]), done = Array(n).fill(null), first = Array(n).fill(null), seg = [];
    let t = 0, cur = -1, left = n, q = [], inQ = Array(n).fill(false), slice = 0;
    const Q = Math.max(1, parseInt(qIn.value, 10) || 2);
    const arrive = tt => P.forEach((p, i) => { if (p[0] === tt && !inQ[i]) { q.push(i); inQ[i] = true; } });
    if (alg === 4) arrive(0);
    let guard = 0;
    while (left && guard++ < 500) {
      let pick = -1;
      const ready = P.map((p, i) => i).filter(i => P[i][0] <= t && rem[i] > 0);
      if (alg === 4) {
        if (cur >= 0 && rem[cur] > 0 && slice < Q) pick = cur;
        else { if (cur >= 0 && rem[cur] > 0) q.push(cur); pick = q.length ? q.shift() : -1; slice = 0; }
      } else if (alg === 2) {
        if (ready.length) pick = ready.reduce((a, b) => rem[b] < rem[a] || (rem[b] === rem[a] && P[b][0] < P[a][0]) ? b : a);
      } else {
        if (cur >= 0 && rem[cur] > 0) pick = cur;
        else if (ready.length) {
          if (alg === 0) pick = ready.reduce((a, b) => P[b][0] < P[a][0] ? b : a);
          if (alg === 1) pick = ready.reduce((a, b) => P[b][1] < P[a][1] || (P[b][1] === P[a][1] && P[b][0] < P[a][0]) ? b : a);
          if (alg === 3) { const rr = i => (t - P[i][0] + P[i][1]) / P[i][1]; pick = ready.reduce((a, b) => rr(b) > rr(a) ? b : a); }
        }
      }
      if (pick >= 0 && first[pick] === null) first[pick] = t;
      seg.push(pick); if (pick >= 0) { rem[pick]--; slice++; }
      cur = pick; t++;
      if (alg === 4) arrive(t);
      if (pick >= 0 && rem[pick] === 0) { done[pick] = t; left--; cur = -1; slice = 0; }
    }
    return {seg, done, first};
  }
  function draw(){
    const {seg, done, first} = run();
    gBox.innerHTML = '<div class="gt">' + seg.map((p, t) => '<div class="gc" style="' + (p >= 0 ? 'background:color-mix(in srgb,' + COL[p] + ' 35%,var(--paper))' : '') + '"><b>' + (p >= 0 ? 'P' + (p + 1) : '·') + '</b><small>' + t + '</small></div>').join('') + '<div class="gc end"><small>' + seg.length + '</small></div></div>';
    const rows = P.map((p, i) => { const ta = done[i] - p[0]; return [i, done[i], ta, ta - p[1], ta / p[1], first[i] - p[0]]; });
    const avg = k => (rows.reduce((s, r) => s + r[k], 0) / rows.length).toFixed(2);
    oBox.innerHTML = '<table class="t c" style="max-width:560px;margin:8px 0"><tr><th>进程</th><th>完成</th><th>周转</th><th>等待</th><th>带权周转</th><th>响应</th></tr>' + rows.map(r => '<tr><td style="color:' + COL[r[0]] + ';font-weight:700">P' + (r[0] + 1) + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td><td>' + r[4].toFixed(2) + '</td><td>' + r[5] + '</td></tr>').join('') + '<tr style="font-weight:700"><td>平均</td><td></td><td>' + avg(2) + '</td><td>' + avg(3) + '</td><td>' + avg(4) + '</td><td>' + avg(5) + '</td></tr></table>';
    say.innerHTML = ['按到达顺序，一个做完再做下一个。', '处理器空出来时，在已经到达的进程里挑要运行时间最短的，挑中了就做完。', '随时比较：谁剩下的最少谁先做，新来的短作业可以抢占正在运行的。', '处理器空出来时，挑响应比 =（已等待 + 要运行）÷ 要运行 最大的，等得越久越占优势。', '每次最多做一个时间片，没做完排到队尾；同一时刻新到的进程排在刚用完时间片的前面。'][alg] + ' 一共用了 ' + seg.length + ' 个时间单位，“·”表示处理器空闲。';
  }
  inBox.addEventListener('input', e => { const x = e.target.closest('input[data-i]'); if (!x) return; const v = parseInt(x.value, 10); if (isNaN(v)) return; P[+x.dataset.i][+x.dataset.k] = Math.max(+x.dataset.k, Math.min(+x.dataset.k ? 20 : 30, v)); draw(); });
  inBox.addEventListener('click', e => { const d = e.target.closest('[data-del]'), a = e.target.closest('[data-add]'); if (d) { P.splice(+d.dataset.del, 1); drawIn(); draw(); } if (a) { P.push([P.length * 2, 3]); drawIn(); draw(); } });
  $('.row', fig).addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (!b) return; P = (b.dataset.x === 'ex1' ? EX1 : EX2).map(x => x.slice()); drawIn(); draw(); });
  qIn.addEventListener('input', draw);
  btnRow($('[data-m]', fig), ALGS, 0, i => { alg = i; draw(); });
  drawIn(); draw();
});
