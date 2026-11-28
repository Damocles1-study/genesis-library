/* ---------- 第二十九章 ---------- */
dev('#raceFig', fig => {
  const box = $('.race', fig), out = $('.kv', fig), say = $('.say', fig), lockC = $('#rcLock');
  const STEPS = ['读 count 到寄存器', '寄存器加 1', '把寄存器写回 count'];
  let S;
  const reset = () => { S = {count: 0, A: {pc: 0, r: null}, B: {pc: 0, r: null}, lock: null, log: []}; };
  function step(who){
    const T = S[who], other = who === 'A' ? 'B' : 'A';
    if (T.pc >= 3) return '线程 ' + who + ' 已经做完了。';
    if (lockC.checked && T.pc === 0 && S.lock && S.lock !== who) return '线程 ' + who + ' 想进临界区，但锁在线程 ' + other + ' 手里，只好等着（点另一个线程）。';
    if (lockC.checked && T.pc === 0) S.lock = who;
    if (T.pc === 0) T.r = S.count; else if (T.pc === 1) T.r++; else { S.count = T.r; if (lockC.checked) S.lock = null; }
    S.log.push(who + '：' + STEPS[T.pc] + (T.pc === 0 ? '（读到 ' + T.r + '）' : T.pc === 1 ? '（变成 ' + T.r + '）' : '（count = ' + S.count + '）'));
    T.pc++;
    return null;
  }
  function draw(msg){
    const col = who => { const T = S[who]; return '<div class="rc"><b>线程 ' + who + (S.lock === who ? ' 🔒' : '') + '</b>' + STEPS.map((s, i) => '<div class="' + (i < T.pc ? 'dn' : i === T.pc ? 'nx' : '') + '">' + (i + 1) + '. ' + s + '</div>').join('') + '<small>寄存器：' + (T.r === null ? '—' : T.r) + '</small></div>'; };
    box.innerHTML = '<div class="rcw">' + col('A') + '<div class="rcm"><span>内存</span><b>count = ' + S.count + '</b></div>' + col('B') + '</div><div class="rclog">' + (S.log.map((l, i) => (i + 1) + '. ' + l).join('<br>') || '<span class="dim">（还没开始）</span>') + '</div>';
    const fin = S.A.pc === 3 && S.B.pc === 3;
    if (msg) say.innerHTML = msg;
    else if (fin) say.innerHTML = S.count === 2 ? '<b>count = 2</b>，这次顺序碰巧没出问题：一个线程完整做完三步，另一个才开始读。' : '<b style="color:var(--red)">count = 1，丢了一次！</b>两个线程都在对方写回之前读到了旧值，各自加一后写回，后写的盖掉了先写的。';
    else say.innerHTML = '点按钮让某个线程执行下一步。' + (lockC.checked ? '加了锁：一个线程读之前先拿锁，写完才放。' : '');
  }
  $('.btns', fig).addEventListener('click', e => {
    const b = e.target.closest('button[data-x]'); if (!b) return; const x = b.dataset.x;
    if (x === 'reset') { reset(); draw(); return; }
    if (x === 'many') {
      const tally = {1: 0, 2: 0};
      for (let k = 0; k < 1000; k++) { reset(); let g = 0; while ((S.A.pc < 3 || S.B.pc < 3) && g++ < 50) { const who = S.A.pc >= 3 ? 'B' : S.B.pc >= 3 ? 'A' : Math.random() < .5 ? 'A' : 'B'; step(who); } tally[S.count]++; }
      kv(out, [['count = 2', tally[2] + ' 次'], ['count = 1（丢数）', tally[1] + ' 次']]);
      reset(); draw(lockC.checked ? '加锁以后，一千次全部是 2。' : '随机交错一千次，有相当一部分丢了数。真实的程序里两个线程各加一百万次，丢掉的就成千上万。');
      return;
    }
    const m = step(x); draw(m);
  });
  lockC.addEventListener('change', () => { reset(); out.innerHTML = ''; draw(); });
  reset(); draw();
});

dev('#bankFig', fig => {
  const box = $('.bank', fig), say = $('.say', fig), selP = $('#bkP'), reqIn = $('#bkR');
  const INIT = {alloc: [[1, 0, 1], [2, 1, 0], [1, 1, 2], [0, 2, 1], [1, 0, 0]], max: [[4, 2, 3], [3, 2, 2], [5, 3, 3], [2, 3, 2], [2, 2, 1]], avail: [2, 2, 1]};
  let S = JSON.parse(JSON.stringify(INIT));
  selP.innerHTML = [0, 1, 2, 3, 4].map(i => '<option value="' + i + '"' + (i === 1 ? ' selected' : '') + '>P' + i + '</option>').join('');
  const need = st => st.max.map((m, i) => m.map((x, j) => x - st.alloc[i][j]));
  function safe(st){
    const N = need(st), work = st.avail.slice(), fin = Array(5).fill(false), seq = [], trace = [];
    let moved = true;
    while (moved) { moved = false; for (let i = 0; i < 5; i++) if (!fin[i] && N[i].every((x, j) => x <= work[j])) { const before = work.join(', '); st.alloc[i].forEach((x, j) => work[j] += x); fin[i] = true; seq.push('P' + i); trace.push('P' + i + ' 的剩余需求 (' + N[i].join(', ') + ') ≤ 可用 (' + before + ')，让它做完并归还，可用变为 (' + work.join(', ') + ')'); moved = true; } }
    return {ok: fin.every(Boolean), seq, trace};
  }
  function draw(){
    const N = need(S);
    const cell = (m, i, k) => m[i].map((x, j) => '<input type="number" min="0" max="9" value="' + x + '" data-m="' + k + '" data-i="' + i + '" data-j="' + j + '">').join('');
    box.innerHTML = '<table class="t c bk"><tr><th></th><th>已分配 A B C</th><th>最大需求 A B C</th><th>还需要 A B C</th></tr>' + [0, 1, 2, 3, 4].map(i => '<tr><th>P' + i + '</th><td>' + cell(S.alloc, i, 'alloc') + '</td><td>' + cell(S.max, i, 'max') + '</td><td class="m">' + N[i].join(' ') + '</td></tr>').join('') + '<tr><th>可用</th><td>' + S.avail.map((x, j) => '<input type="number" min="0" max="9" value="' + x + '" data-m="avail" data-j="' + j + '">').join('') + '</td><td></td><td></td></tr></table>';
  }
  box.addEventListener('input', e => { const x = e.target.closest('input'); if (!x) return; const v = Math.max(0, parseInt(x.value, 10) || 0); if (x.dataset.m === 'avail') S.avail[+x.dataset.j] = v; else S[x.dataset.m][+x.dataset.i][+x.dataset.j] = v; draw(); });
  $('.row', fig).addEventListener('click', e => {
    const b = e.target.closest('button[data-x]'); if (!b) return; const x = b.dataset.x;
    if (x === 'reset') { S = JSON.parse(JSON.stringify(INIT)); draw(); say.textContent = '恢复了原来的表。'; return; }
    if (need(S).some(r => r.some(v => v < 0))) { say.textContent = '有进程的“已分配”超过了“最大需求”，先改正表。'; return; }
    if (x === 'safe') { const r = safe(JSON.parse(JSON.stringify(S))); say.innerHTML = (r.ok ? '<b>安全</b>，安全序列之一：' + r.seq.join(' → ') + '。' : '<b style="color:var(--red)">不安全</b>：' + (r.seq.length ? '只有 ' + r.seq.join('、') + ' 能做完，剩下的谁也满足不了。' : '一个进程的剩余需求都满足不了。')) + '<br><span class="dim" style="font-size:13px">' + r.trace.join('；') + '</span>'; return; }
    const i = +selP.value, req = reqIn.value.trim().split(/[\s,]+/).map(Number);
    if (req.length !== 3 || req.some(v => isNaN(v) || v < 0)) { say.textContent = '请求写成三个数，比如 1 0 1。'; return; }
    const N = need(S);
    if (req.some((v, j) => v > N[i][j])) { say.innerHTML = '<b style="color:var(--red)">出错</b>：P' + i + ' 请求的比它声明的剩余需求 (' + N[i].join(', ') + ') 还多。'; return; }
    if (req.some((v, j) => v > S.avail[j])) { say.innerHTML = '可用资源 (' + S.avail.join(', ') + ') 不够，P' + i + ' 只能等。'; return; }
    const T = JSON.parse(JSON.stringify(S)); req.forEach((v, j) => { T.avail[j] -= v; T.alloc[i][j] += v; });
    const r = safe(JSON.parse(JSON.stringify(T)));
    if (r.ok) { S = T; draw(); say.innerHTML = '假装分配后可用变为 (' + T.avail.join(', ') + ')，仍然<b>安全</b>（' + r.seq.join(' → ') + '），所以<b>真的分配</b>了。'; }
    else say.innerHTML = '假装分配后可用变为 (' + T.avail.join(', ') + ')，<b style="color:var(--red)">不安全</b>' + (r.seq.length ? '（只有 ' + r.seq.join('、') + ' 能做完）' : '（没有一个进程能做完）') + '。虽然资源够，系统也<b>拒绝</b>这次分配，让 P' + i + ' 等着。这就是“避免”：宁可慢一点，也不走进可能死锁的状态。';
  });
  draw();
});
