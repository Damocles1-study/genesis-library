/* ---------- 第九章：CMOS 门电路 ---------- */
dev('#cmosFig', fig => {
  const svg = $('svg', fig), tt = $('.tt', fig), say = $('.say', fig);
  let g = 1, A = 0, B = 0;
  const GATES = [['非门 NOT', a => 1 - a], ['与非门 NAND', (a, b) => 1 - (a & b)], ['或非门 NOR', (a, b) => 1 - (a | b)]];
  const ON = 'var(--l1)', OFF = 'var(--off)', HOT = 'var(--on)';
  function tr(x, y, type, name, on){
    return '<rect x="' + (x - 34) + '" y="' + (y - 17) + '" width="68" height="34" rx="5" fill="' + (on ? 'color-mix(in srgb,var(--l1) 30%,var(--card))' : 'var(--paper)') + '" stroke="' + (on ? ON : 'var(--ink-3)') + '" stroke-width="' + (on ? 2.5 : 1.2) + '"/>' +
      txt(x, y - 1, type + ' 管', {s: 12, w: true, c: on ? 'var(--ink)' : 'var(--ink-3)', halo: false}) + txt(x, y + 12, '栅极 ' + name + ' = ' + (name === 'A' ? A : B), {s: 9.5, c: 'var(--ink-3)', halo: false}) +
      (type === 'P' ? '<circle cx="' + (x - 40) + '" cy="' + y + '" r="4" fill="var(--card)" stroke="var(--ink-3)"/>' : '');
  }
  const wire = (pts, hot) => '<polyline points="' + pts.map(p => p.join(',')).join(' ') + '" fill="none" stroke="' + (hot ? HOT : 'var(--ink-3)') + '" stroke-width="' + (hot ? 3.5 : 1.5) + '"/>';
  function draw(){
    const pOn = v => v === 0, nOn = v => v === 1;
    let h = '', upOK, dnOK;
    const VDD = 34, GND = 300, OUT = 167, cx = 150;
    if (g === 0) {
      upOK = pOn(A); dnOK = nOn(A);
      h += wire([[cx, VDD], [cx, 70]], upOK) + tr(cx, 87, 'P', 'A', pOn(A)) + wire([[cx, 104], [cx, OUT]], upOK);
      h += wire([[cx, OUT], [cx, 230]], dnOK) + tr(cx, 247, 'N', 'A', nOn(A)) + wire([[cx, 264], [cx, GND]], dnOK);
    } else if (g === 1) {
      upOK = pOn(A) || pOn(B); dnOK = nOn(A) && nOn(B);
      h += wire([[95, VDD], [95, 70]], pOn(A)) + wire([[205, VDD], [205, 70]], pOn(B)) + tr(95, 87, 'P', 'A', pOn(A)) + tr(205, 87, 'P', 'B', pOn(B)) + wire([[95, 104], [95, 130], [cx, 130]], pOn(A)) + wire([[205, 104], [205, 130], [cx, 130]], pOn(B)) + wire([[cx, 130], [cx, OUT]], upOK);
      h += wire([[cx, OUT], [cx, 185]], dnOK) + tr(cx, 202, 'N', 'A', nOn(A)) + wire([[cx, 219], [cx, 237]], dnOK) + tr(cx, 254, 'N', 'B', nOn(B)) + wire([[cx, 271], [cx, GND]], dnOK);
    } else {
      upOK = pOn(A) && pOn(B); dnOK = nOn(A) || nOn(B);
      h += wire([[cx, VDD], [cx, 52]], upOK) + tr(cx, 69, 'P', 'A', pOn(A)) + wire([[cx, 86], [cx, 104]], upOK) + tr(cx, 121, 'P', 'B', pOn(B)) + wire([[cx, 138], [cx, OUT]], upOK);
      h += wire([[cx, OUT], [cx, 205], [95, 205], [95, 230]], nOn(A)) + wire([[cx, 205], [205, 205], [205, 230]], nOn(B)) + tr(95, 247, 'N', 'A', nOn(A)) + tr(205, 247, 'N', 'B', nOn(B)) + wire([[95, 264], [95, GND]], nOn(A)) + wire([[205, 264], [205, GND]], nOn(B));
    }
    const out = GATES[g][1](A, B);
    h = '<line x1="40" x2="260" y1="' + VDD + '" y2="' + VDD + '" stroke="var(--red)" stroke-width="4"/>' + txt(40, 24, '电源（1）', {s: 12, a: 'start', c: 'var(--red)', halo: false}) +
      '<line x1="40" x2="260" y1="' + GND + '" y2="' + GND + '" stroke="var(--ink-2)" stroke-width="4"/>' + txt(40, 318, '地（0）', {s: 12, a: 'start', c: 'var(--ink-2)', halo: false}) + h +
      wire([[cx, OUT], [300, OUT]], true) + '<circle cx="' + cx + '" cy="' + OUT + '" r="5" fill="var(--ink)"/>' +
      '<rect x="292" y="' + (OUT - 22) + '" width="60" height="44" rx="6" fill="' + (out ? 'var(--on)' : 'var(--off)') + '"/>' + txt(322, OUT - 4, '输出', {s: 11, c: '#fff', halo: false}) + txt(322, OUT + 14, out, {s: 18, w: true, c: '#fff', halo: false});
    svg.innerHTML = h;
    const rows = g === 0 ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
    tt.innerHTML = '<table class="t c"><tr><th>A</th>' + (g ? '<th>B</th>' : '') + '<th>输出</th></tr>' + rows.map(r => { const cur = r[0] === A && (g === 0 || r[1] === B); return '<tr' + (cur ? ' style="background:var(--hl);font-weight:700"' : '') + '><td>' + r[0] + '</td>' + (g ? '<td>' + r[1] + '</td>' : '') + '<td>' + GATES[g][1](r[0], r[1]) + '</td></tr>'; }).join('') + '</table>';
    say.innerHTML = (upOK ? '上半部分（P 管）有一条通路把输出接到<b>电源</b>，输出是 1。' : '上半部分（P 管）不通。') + (dnOK ? '下半部分（N 管）有一条通路把输出接到<b>地</b>，输出是 0。' : '下半部分（N 管）不通。') + ' 两边永远一通一断，不会同时通（那样就短路了），也不会同时断（输出悬空）。' + (g === 1 ? ' 与非门：N 管串联，要 A、B 都是 1 才能接地。' : g === 2 ? ' 或非门：P 管串联，要 A、B 都是 0 才能接电源。' : '');
    $$('[data-in]', fig).forEach(b => { const v = b.dataset.in === 'A' ? A : B; b.textContent = b.dataset.in + ' = ' + v; b.classList.toggle('on', !!v); b.style.display = b.dataset.in === 'B' && g === 0 ? 'none' : ''; });
  }
  btnRow($('[data-m]', fig), GATES.map(x => x[0]), 1, i => { g = i; draw(); });
  $$('[data-in]', fig).forEach(b => b.addEventListener('click', () => { if (b.dataset.in === 'A') A ^= 1; else B ^= 1; draw(); }));
  draw();
});
