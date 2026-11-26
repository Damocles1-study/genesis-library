
/* ---------- 第一章：从像素到方块 ---------- */
dev('#voxFig', () => {
  const N = 8, grid = $('#voxGrid'), sv = $('#voxSvg');
  const EX = [
    ['爱心', ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...', '........']],
    ['笑脸', ['..####..', '.#....#.', '#.#..#.#', '#......#', '#.#..#.#', '#..##..#', '.#....#.', '..####..']],
    ['小房子', ['...##...', '..####..', '.######.', '########', '.#....#.', '.#.##.#.', '.#.##.#.', '.######.']],
    ['一棵树', ['..###...', '.#####..', '#######.', '.#####..', '...#....', '...#....', '...#....', '..###...']],
    ['字母 M', ['#......#', '##....##', '#.#..#.#', '#..##..#', '#......#', '#......#', '#......#', '#......#']]
  ];
  let on = [], ex = 0, painting = false, paintVal = true;
  const load = k => { on = EX[k][1].map(r => r.split('').map(c => c === '#')); };
  grid.innerHTML = Array.from({length: N * N}, (_, i) => '<span data-i="' + i + '"></span>').join('');
  const cells = $$('span', grid);
  function draw(){
    cells.forEach((c, i) => c.classList.toggle('on', on[Math.floor(i / N)][i % N]));
    const H = +$('#voxH').value, s = 13;
    const list = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (on[r][c]) for (let z = 0; z < H; z++) list.push([c, r, z]);
    list.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[2] - b[2]);
    let g = '';
    /* 一块灰色底板 */
    const corner = (x, y) => isoXY(x, y, 0, s, 140, 92);
    const p0 = corner(0, 0), p1 = corner(N, 0), p2 = corner(N, N), p3 = corner(0, N);
    g += '<path d="M' + [p0, p1, p2, p3].map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + 'Z" fill="var(--paper-2)" stroke="var(--rule)"/>';
    list.forEach(q => { const p = isoXY(q[0], q[1], q[2], s, 140, 92); g += cube(p[0], p[1], s, q[2] === H - 1 ? 'grass' : 'dirt', q[0] * 31 + q[1] * 7 + q[2]); });
    sv.setAttribute('viewBox', '0 0 280 300'); sv.innerHTML = g;
    const n = on.flat().filter(Boolean).length;
    $('#voxSay').innerHTML = n ? '平面上用了 <b>' + n + '</b> 个像素；加到 ' + H + ' 格厚，就是 <b>' + (n * H) + '</b> 个体素（方块）。厚度每加一格，方块就多 ' + n + ' 块。' : '方格是空的，点几下画点什么。';
  }
  slider('voxH', v => v + ' 格', () => { if (on.length) draw(); });
  const setCell = (el, v) => { const i = +el.dataset.i; on[Math.floor(i / N)][i % N] = v; draw(); };
  grid.addEventListener('pointerdown', e => { const c = e.target.closest('span'); if (!c) return; e.preventDefault(); const i = +c.dataset.i; paintVal = !on[Math.floor(i / N)][i % N]; painting = true; setCell(c, paintVal); });
  grid.addEventListener('pointermove', e => { if (!painting) return; const el = document.elementFromPoint(e.clientX, e.clientY); if (el && el.parentNode === grid) setCell(el, paintVal); });
  window.addEventListener('pointerup', () => { painting = false; });
  $('#voxEx').addEventListener('click', () => { ex = (ex + 1) % EX.length; load(ex); draw(); });
  $('#voxClr').addEventListener('click', () => { on = on.map(r => r.map(() => false)); draw(); });
  load(0); draw();
});
