/* ---------- 第十章 ---------- */
dev('#adderFig', fig => {
  const svg = $('svg', fig), out = $('.kv', fig), say = $('.say', fig);
  let A = 0b0101, B = 0b0011, sub = false, shown = 4, timer = null;
  const BX = i => 470 - i * 140; // 第 i 位全加器的左上角 x
  function calc(){ const b = sub ? (~B) & 15 : B; const c = [sub ? 1 : 0], s = []; for (let i = 0; i < 4; i++) { const a = (A >> i) & 1, bb = (b >> i) & 1, t = a + bb + c[i]; s.push(t & 1); c.push(t >> 1); } return {b, c, s}; }
  function draw(){
    const {b, c, s} = calc();
    let h = '';
    for (let i = 0; i < 4; i++) {
      const x = BX(i), a = (A >> i) & 1, bo = (B >> i) & 1, bb = (b >> i) & 1, ready = i < shown;
      h += '<circle cx="' + (x + 30) + '" cy="28" r="14" data-a="' + i + '" fill="' + (a ? 'var(--on)' : 'var(--off)') + '" style="cursor:pointer"/>' + txt(x + 30, 33, a, {s: 14, w: true, c: '#fff', halo: false}) + txt(x + 30, 10, 'A' + i, {s: 11, c: 'var(--ink-3)'});
      h += '<circle cx="' + (x + 80) + '" cy="28" r="14" data-b="' + i + '" fill="' + (bo ? 'var(--on)' : 'var(--off)') + '" style="cursor:pointer"/>' + txt(x + 80, 33, bo, {s: 14, w: true, c: '#fff', halo: false}) + txt(x + 80, 10, 'B' + i, {s: 11, c: 'var(--ink-3)'});
      h += '<line x1="' + (x + 30) + '" y1="42" x2="' + (x + 30) + '" y2="110" stroke="var(--ink-3)" stroke-width="1.5"/>';
      if (sub) h += '<rect x="' + (x + 66) + '" y="56" width="28" height="22" rx="4" fill="var(--card)" stroke="var(--l2)"/>' + txt(x + 80, 71, '⊕', {s: 14, c: 'var(--l2)', halo: false}) + '<line x1="' + (x + 80) + '" y1="42" x2="' + (x + 80) + '" y2="56" stroke="var(--ink-3)" stroke-width="1.5"/><line x1="' + (x + 80) + '" y1="78" x2="' + (x + 80) + '" y2="110" stroke="var(--ink-3)" stroke-width="1.5"/>' + txt(x + 104, 96, bb, {s: 12, w: true, c: 'var(--l2)', halo: false});
      else h += '<line x1="' + (x + 80) + '" y1="42" x2="' + (x + 80) + '" y2="110" stroke="var(--ink-3)" stroke-width="1.5"/>';
      h += '<rect x="' + (x + 8) + '" y="110" width="94" height="62" rx="6" fill="var(--paper)" stroke="var(--ink-2)" stroke-width="1.5"/>' + txt(x + 55, 136, '全加器', {s: 13, w: true, halo: false}) + txt(x + 55, 156, '第 ' + i + ' 位', {s: 11, c: 'var(--ink-3)', halo: false});
      h += '<line x1="' + (x + 55) + '" y1="172" x2="' + (x + 55) + '" y2="206" stroke="var(--ink-3)" stroke-width="1.5"/><rect x="' + (x + 38) + '" y="206" width="34" height="34" rx="5" fill="' + (ready ? (s[i] ? 'var(--on)' : 'var(--off)') : 'var(--paper)') + '" stroke="var(--rule)"/>' + txt(x + 55, 229, ready ? s[i] : '?', {s: 16, w: true, c: ready ? '#fff' : 'var(--ink-3)', halo: false}) + txt(x + 55, 254, 'S' + i, {s: 11, c: 'var(--ink-3)'});
      const cin = c[i], hot = i <= shown && cin;
      const xr = x + 102, xn = x + 140;
      h += '<line x1="' + (xn + 8) + '" y1="141" x2="' + xr + '" y2="141" stroke="' + (i < shown + 1 && i > 0 ? (cin ? 'var(--on)' : 'var(--ink-3)') : i === 0 ? (cin ? 'var(--on)' : 'var(--ink-3)') : 'var(--rule)') + '" stroke-width="' + (cin && (i <= shown) ? 4 : 1.5) + '" marker-end="url(#arr)"/>';
      if (i === 0) h += txt(xn + 14, 132, 'C0=' + c[0], {s: 11, c: sub ? 'var(--l2)' : 'var(--ink-3)', a: 'start'});
    }
    const c4 = shown >= 4 ? c[4] : '?';
    h += '<line x1="' + (BX(3) + 8) + '" y1="141" x2="' + (BX(3) - 26) + '" y2="141" stroke="' + (shown >= 4 && c[4] ? 'var(--on)' : 'var(--ink-3)') + '" stroke-width="' + (shown >= 4 && c[4] ? 4 : 1.5) + '" marker-end="url(#arr)"/>' + txt(BX(3) - 12, 128, 'C4=' + c4, {s: 11, c: 'var(--ink-2)'});
    svg.innerHTML = '<defs><marker id="arr" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="var(--ink-3)"/></marker></defs>' + h;
    const r = s.reduce((v, x, i) => v | (x << i), 0), sv = v => v & 8 ? v - 16 : v;
    kv(out, [['A', bin(A, 4) + ' = ' + A + '（补码 ' + sv(A) + '）'], ['B', bin(B, 4) + ' = ' + B + '（补码 ' + sv(B) + '）'], [sub ? 'A − B 的结果' : 'A + B 的结果', shown >= 4 ? bin(r, 4) + ' = ' + r + '（补码 ' + sv(r) + '）' : '算到第 ' + shown + ' 位'], ['最高位进位 C4', c4]]);
    say.innerHTML = sub ? '做减法时，B 的每一位先经过一个异或门（另一端接“减法”信号 1），被取反；最右边的进位输入 C0 也接 1。于是算的是 A + (B 取反) + 1 = A − B。同一套全加器，加减法都能做。' : '进位从右往左传：第 i 位要等第 i − 1 位的进位到了，才能算出最终的和。位数越多，等得越久。';
  }
  svg.addEventListener('click', e => { const t = e.target.closest('[data-a],[data-b]'); if (!t) return; if (t.dataset.a !== undefined) A ^= 1 << +t.dataset.a; else B ^= 1 << +t.dataset.b; shown = 4; draw(); });
  $('.btns', fig).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.x === 'sub') { sub = !sub; b.textContent = '做减法：' + (sub ? '开' : '关'); b.classList.toggle('on', sub); shown = 4; draw(); }
    if (b.dataset.x === 'worst') { A = 0b1111; B = sub ? 0b0000 : 0b0001; shown = 4; draw(); }
    if (b.dataset.x === 'slow') { clearInterval(timer); shown = 0; draw(); timer = setInterval(() => { shown++; draw(); if (shown >= 4) clearInterval(timer); }, 700); }
  });
  draw();
});

dev('#kmapFig', fig => {
  const box = $('.kmap', fig), res = $('.kmres', fig);
  const G = [0, 1, 3, 2]; // 格雷码顺序
  let v = Array(16).fill(0);
  const EX = [['典型题（1）', [0, 2, 5, 7, 8, 10, 13, 15], []], ['A 异或 B', [4, 5, 6, 7, 8, 9, 10, 11], []], ['A、B、C 多数表决', [6, 7, 10, 11, 12, 13, 14, 15], []], ['BCD 码 ≥ 5（含无关项）', [5, 6, 7, 8, 9], [10, 11, 12, 13, 14, 15]], ['清空', [], []]];
  const COL = ['var(--on)', 'var(--l2)', 'var(--l1)', 'var(--l3)', 'var(--gold)', 'var(--ter)', 'var(--red)', 'var(--main)'];
  const exb = $('[data-ex]', fig); exb.innerHTML = EX.map((e, i) => '<button class="btn" data-i="' + i + '">' + e[0] + '</button>').join('');
  exb.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const x = EX[+b.dataset.i]; v = Array(16).fill(0); x[1].forEach(m => v[m] = 1); x[2].forEach(m => v[m] = 2); draw(); });
  const cubeMin = c => { let ms = [0]; for (let k = 0; k < 4; k++) { const bit = 1 << (3 - k); if (c[k] === 1) ms = ms.map(m => m | bit); else if (c[k] === 2) ms = ms.flatMap(m => [m, m | bit]); } return ms; };
  function solve(){
    const ones = v.map((x, i) => x === 1 ? i : -1).filter(i => i >= 0);
    if (!ones.length) return {terms: [], expr: '0'};
    const cubes = [];
    for (let i = 0; i < 81; i++) { const c = [Math.floor(i / 27) % 3, Math.floor(i / 9) % 3, Math.floor(i / 3) % 3, i % 3]; const ms = cubeMin(c); if (ms.every(m => v[m] !== 0) && ms.some(m => v[m] === 1)) cubes.push({c, ms}); }
    const primes = cubes.filter(a => !cubes.some(b => b !== a && b.ms.length > a.ms.length && a.ms.every(m => b.ms.includes(m))));
    if (primes.some(p => p.ms.length === 16)) return {terms: [primes.find(p => p.ms.length === 16)], expr: '1'};
    const lit = p => p.c.filter(x => x !== 2).length;
    let best = null; const n = primes.length;
    for (let mask = 1; mask < (1 << n) && n <= 16; mask++) {
      const pick = primes.filter((_, i) => (mask >> i) & 1);
      if (best && pick.length > best.length) continue;
      if (!ones.every(m => pick.some(p => p.ms.includes(m)))) continue;
      if (!best || pick.length < best.length || pick.reduce((s, p) => s + lit(p), 0) < best.reduce((s, p) => s + lit(p), 0)) best = pick;
    }
    const name = p => p.c.map((x, k) => x === 2 ? '' : 'ABCD'[k] + (x ? '' : '′')).join('') || '1';
    return {terms: best, expr: best.map(name).join(' + '), name};
  }
  function draw(){
    const sol = solve();
    let h = '<table class="km"><tr><th class="cn">AB＼CD</th>' + G.map(c => '<th>' + bin(c, 2) + '</th>').join('') + '</tr>';
    G.forEach(r => { h += '<tr><th>' + bin(r, 2) + '</th>' + G.map(c => { const m = r * 4 + c, x = v[m]; const dots = sol.terms.map((t, k) => t.ms.includes(m) ? '<i style="background:' + COL[k % COL.length] + '"></i>' : '').join(''); return '<td data-m="' + m + '" class="s' + x + '"><b>' + (x === 2 ? 'X' : x) + '</b><small>m' + m + '</small><span class="dots">' + dots + '</span></td>'; }).join('') + '</tr>'; });
    box.innerHTML = h + '</table>';
    res.innerHTML = '<div class="dim" style="font-size:13px">最简与或式</div><div class="kexpr">F = ' + (sol.terms.length && sol.expr !== '1' ? sol.terms.map((t, k) => '<span style="color:' + COL[k % COL.length] + '">' + sol.name(t) + '</span>').join(' + ') : sol.expr) + '</div>' +
      '<p class="dim" style="font-size:13px;margin:6px 0 0">1 的最小项：' + (v.map((x, i) => x === 1 ? i : -1).filter(i => i >= 0).join(', ') || '无') + (v.includes(2) ? '<br>无关项：' + v.map((x, i) => x === 2 ? i : -1).filter(i => i >= 0).join(', ') : '') + '</p><p class="dim" style="font-size:13px;margin:4px 0 0">格子里的小色点表示它被哪个圈圈住（颜色对应式子里的项）。最简式可能不止一种，这里给出其中一种。</p>';
  }
  box.addEventListener('click', e => { const td = e.target.closest('td[data-m]'); if (!td) return; const m = +td.dataset.m; v[m] = (v[m] + 1) % 3; draw(); });
  EX[0][1].forEach(m => v[m] = 1); draw();
});
