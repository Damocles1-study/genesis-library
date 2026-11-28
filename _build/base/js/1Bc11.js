/* ---------- 第十一章 ---------- */
dev('#srFig', fig => {
  const svg = $('svg', fig), say = $('.say', fig);
  let S = 0, R = 0, q = 0, qn = 1, osc = null;
  const NOR = (a, b) => 1 - (a | b);
  const settle = () => { for (let k = 0; k < 6; k++) { q = NOR(R, qn); qn = NOR(S, q); } };
  const col = v => v ? 'var(--on)' : 'var(--ink-3)', w = v => v ? 4 : 1.6;
  const line = (pts, v) => '<polyline points="' + pts.map(p => p.join(',')).join(' ') + '" fill="none" stroke="' + col(v) + '" stroke-width="' + w(v) + '" stroke-linejoin="round"/>';
  function gate(x, y, label){ return '<path d="M' + x + ' ' + (y - 30) + ' Q' + (x + 30) + ' ' + y + ' ' + x + ' ' + (y + 30) + ' Q' + (x + 70) + ' ' + (y + 30) + ' ' + (x + 95) + ' ' + y + ' Q' + (x + 70) + ' ' + (y - 30) + ' ' + x + ' ' + (y - 30) + 'Z" fill="var(--paper)" stroke="var(--ink-2)" stroke-width="1.6"/><circle cx="' + (x + 101) + '" cy="' + y + '" r="6" fill="var(--paper)" stroke="var(--ink-2)" stroke-width="1.6"/>' + txt(x + 45, y + 5, label, {s: 13, halo: false}); }
  function draw(msg){
    let h = '';
    h += line([[40, 50], [200, 50]], R) + line([[40, 190], [200, 190]], S);
    h += line([[307, 70], [380, 70]], q) + line([[307, 170], [380, 170]], qn);
    h += line([[340, 70], [340, 110], [180, 140], [180, 160], [208, 160]], q);
    h += line([[340, 170], [340, 130], [180, 100], [180, 80], [208, 80]], qn);
    h += gate(200, 70, '或非') + gate(200, 170, '或非');
    h += txt(28, 55, 'R', {s: 16, w: true, c: col(R)}) + txt(28, 195, 'S', {s: 16, w: true, c: col(S)});
    h += '<rect x="384" y="50" width="64" height="40" rx="6" fill="' + (q ? 'var(--on)' : 'var(--off)') + '"/>' + txt(416, 76, 'Q = ' + q, {s: 15, w: true, c: '#fff', halo: false});
    h += '<rect x="384" y="150" width="64" height="40" rx="6" fill="' + (qn ? 'var(--on)' : 'var(--off)') + '"/>' + txt(416, 176, 'Q̄ = ' + qn, {s: 15, w: true, c: '#fff', halo: false});
    h += txt(470, 124, '交叉的两根线', {s: 11, c: 'var(--ink-3)', a: 'middle'}) + txt(470, 138, '就是“绕回来”', {s: 11, c: 'var(--ink-3)', a: 'middle'});
    svg.innerHTML = h;
    say.innerHTML = msg || (S && R ? 'S、R 都是 1：两个门都被逼着输出 0，Q 和 Q̄ 不再一个 1 一个 0。这是“禁止状态”。' : S ? '按着 S：Q 被设置成 1。' : R ? '按着 R：Q 被复位成 0。' : 'S、R 都没按：电路靠两根交叉的线自己撑着，<b>记得</b> Q = ' + q + '。');
  }
  const hold = (k, v) => { clearInterval(osc); if (k === 'S') S = v; else R = v; settle(); draw(); };
  $$('[data-k="S"],[data-k="R"]', fig).forEach(b => {
    b.addEventListener('pointerdown', e => { e.preventDefault(); b.setPointerCapture(e.pointerId); hold(b.dataset.k, 1); });
    ['pointerup', 'pointercancel'].forEach(t => b.addEventListener(t, () => hold(b.dataset.k, 0)));
    b.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); hold(b.dataset.k, 1); setTimeout(() => hold(b.dataset.k, 0), 500); } });
  });
  $('[data-k="both"]', fig).addEventListener('click', () => {
    clearInterval(osc); S = R = 1; settle(); draw();
    setTimeout(() => {
      S = R = 0; let k = 0, n = 4 + Math.floor(Math.random() * 6);
      osc = setInterval(() => {
        if (k < n) { const nq = NOR(R, qn), nqn = NOR(S, q); q = nq; qn = nqn; draw('同时松开：两个门“一样快”，一起变成 1，又一起变回 0……在来回振荡（第 ' + (k + 1) + ' 下）。'); k++; }
        else { clearInterval(osc); if (Math.random() < .5) { q = 1; qn = 0; } else { q = 0; qn = 1; } draw('真实的门不会完全一样快，振荡几下后总有一个先赢。这一次停在 Q = ' + q + '，下一次可能是另一个。<b>结果不确定</b>，所以 S = R = 1 是禁止的。'); }
      }, 260);
    }, 700);
  });
  draw();
});

dev('#cntFig', fig => {
  const svg = $('svg', fig), bitsEl = $('.cntbits', fig), say = $('.say', fig);
  let n = 0, hist = [], timer = null;
  function draw(){
    const N = 12, x0 = 20, dx = (600) / N;
    let p = 'M' + x0 + ' 70', h = '';
    const ticks = hist.slice(-N);
    for (let i = 0; i < N; i++) { const x = x0 + i * dx; if (i < ticks.length) { p += 'L' + x + ' 70L' + x + ' 20L' + (x + dx / 2) + ' 20L' + (x + dx / 2) + ' 70'; h += '<path d="M' + (x - 5) + ' 34L' + x + ' 24L' + (x + 5) + ' 34" fill="none" stroke="var(--main)" stroke-width="2"/>' + txt(x + dx / 4, 100, ticks[i], {s: 13, w: true, c: 'var(--main)'}) + txt(x + dx / 4, 118, bin(ticks[i], 4), {s: 10, mono: true, c: 'var(--ink-3)'}); } else p += 'L' + (x + dx) + ' 70'; }
    svg.innerHTML = '<path d="' + p + '" fill="none" stroke="var(--ink-2)" stroke-width="2"/>' + h + txt(20, 142, '时钟每往上跳一次（小箭头），计数器就把“现在的值 + 1”记进 4 个触发器', {s: 11, a: 'start', c: 'var(--ink-3)'});
    bitsEl.innerHTML = [3, 2, 1, 0].map(i => '<span class="bit' + ((n >> i) & 1 ? ' on' : '') + '" style="cursor:default"><b>' + ((n >> i) & 1) + '</b><small>Q' + i + '</small></span>').join('') + '<span style="align-self:center;margin-left:10px;font-family:var(--f-mono);font-size:22px">= ' + n + '</span>';
  }
  const tick = () => { n = (n + 1) & 15; hist.push(n); draw(); say.innerHTML = n === 0 ? '15 + 1 = 16 = 1 0000，第五位放不下，计数器回到 0。' : '时钟又往上跳了一下，计数器 = ' + n + '。看最右边的 Q0：每拍翻一次；Q1 每两拍翻一次；Q2 每四拍……一位比一位慢一半，这也是“分频”。'; };
  $('.btns', fig).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const k = b.dataset.k;
    if (k === 'tick') tick();
    if (k === 'reset') { n = 0; hist = []; draw(); say.textContent = '清零了。'; }
    if (k === 'run') { if (timer) { clearInterval(timer); timer = null; b.textContent = '自己跑'; b.classList.remove('on'); } else { timer = setInterval(tick, 500); b.textContent = '停'; b.classList.add('on'); } } });
  new IntersectionObserver(es => { if (!es[0].isIntersecting && timer) { clearInterval(timer); timer = null; const b = $('[data-k="run"]', fig); b.textContent = '自己跑'; b.classList.remove('on'); } }).observe(fig);
  draw(); say.textContent = '点“打一下拍子”。';
});

dev('#fsmFig', fig => {
  const svg = $('svg', fig), say = $('.say', fig);
  const ST = [['S0', '什么都还没对上'], ['S1', '刚看到 1'], ['S2', '看到 1 0'], ['S3', '看到 1 0 1，输出 1']];
  const NX = [[0, 1], [2, 1], [0, 3], [2, 1]];
  let s = 0, seq = '', outs = '', last = null;
  const X = [80, 240, 400, 560], Y = 100;
  function arrow(a, b, bit, dy){
    const x1 = X[a], x2 = X[b], hot = last && last[0] === a && last[1] === bit;
    const c = hot ? 'var(--on)' : 'var(--ink-3)', sw = hot ? 3 : 1.4;
    if (a === b) return '<path d="M' + (x1 - 14) + ' ' + (Y - 34) + ' C' + (x1 - 40) + ' ' + (Y - 90) + ' ' + (x1 + 40) + ' ' + (Y - 90) + ' ' + (x1 + 14) + ' ' + (Y - 34) + '" fill="none" stroke="' + c + '" stroke-width="' + sw + '" marker-end="url(#fa)"/>' + txt(x1, Y - 76, bit, {s: 13, w: true, c});
    const dir = x2 > x1 ? 1 : -1, sx = x1 + dir * 36, ex = x2 - dir * 36, my = Y + dy;
    return '<path d="M' + sx + ' ' + (Y + dy / 3) + ' Q' + ((sx + ex) / 2) + ' ' + my + ' ' + ex + ' ' + (Y + dy / 3) + '" fill="none" stroke="' + c + '" stroke-width="' + sw + '" marker-end="url(#fa)"/>' + txt((sx + ex) / 2, my + (dy > 0 ? 6 : -4), bit, {s: 13, w: true, c});
  }
  function draw(){
    let h = '<defs><marker id="fa" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="var(--ink-3)"/></marker></defs>';
    h += arrow(0, 0, 0, 0) + arrow(1, 1, 1, 0) + arrow(0, 1, 1, -36) + arrow(1, 2, 0, -36) + arrow(2, 3, 1, -36) + arrow(2, 0, 0, 90) + arrow(3, 2, 0, 50) + arrow(3, 1, 1, 110);
    ST.forEach((t, i) => { const on = i === s; h += '<circle cx="' + X[i] + '" cy="' + Y + '" r="34" fill="' + (on ? 'var(--on)' : 'var(--paper)') + '" stroke="var(--ink-2)" stroke-width="' + (i === 3 ? 4 : 1.6) + '"/>' + txt(X[i], Y + 2, t[0], {s: 15, w: true, c: on ? '#fff' : 'var(--ink)', halo: false}) + txt(X[i], Y + 18, '输出 ' + (i === 3 ? 1 : 0), {s: 10, c: on ? '#fff' : 'var(--ink-3)', halo: false}); });
    svg.innerHTML = h;
    say.innerHTML = '现在在 <b>' + ST[s][0] + '</b>（' + ST[s][1] + '）。已送入：<code>' + (seq || '（空）') + '</code><br>每一步的输出：<code>' + (outs || '（空）') + '</code>' + (s === 3 ? '　<b style="color:var(--on)">找到一个 101！</b>' : '');
  }
  $('.btns', fig).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.b === 'r') { s = 0; seq = ''; outs = ''; last = null; } else { const bit = +b.dataset.b; last = [s, bit]; s = NX[s][bit]; seq += bit; outs += s === 3 ? 1 : 0; } draw(); });
  draw();
});
