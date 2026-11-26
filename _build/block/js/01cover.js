
/* ---------- 封面装置：放一块 ----------
   occ[x][y][z] 是方块种类或 null。点顶面在上面放，点左面放在 y+1，点右面放在 x+1；挖模式点哪块挖哪块。 */
dev('#buildFig', () => {
  const N = 8, MZ = 7, s = 20, w = s * 0.866, h = s * 0.5, OX = 150, OY = 150;
  const svg = $('#bldSvg');
  svg.setAttribute('viewBox', '0 0 300 330');
  const TYPES = ['grass', 'dirt', 'stone', 'log', 'plank', 'leaf', 'sand', 'glass', 'water'];
  let occ, cur = 'plank', mode = 0;
  const empty = () => { occ = []; for (let x = 0; x < N; x++) { occ[x] = []; for (let y = 0; y < N; y++) { occ[x][y] = []; for (let z = 0; z < MZ; z++) occ[x][y][z] = null; occ[x][y][0] = 'grass'; } } };
  const inside = (x, y, z) => x >= 0 && y >= 0 && z >= 0 && x < N && y < N && z < MZ;
  function put(x, y, z, t){ if (inside(x, y, z)) occ[x][y][z] = t; }
  function house(){
    empty();
    for (let x = 1; x <= 5; x++) for (let y = 1; y <= 5; y++) {
      const edge = x === 1 || x === 5 || y === 1 || y === 5;
      if (edge) for (let z = 1; z <= 3; z++) put(x, y, z, (x === 1 || x === 5) && (y === 1 || y === 5) ? 'log' : 'plank');
      put(x, y, 4, 'stone');
      if (x > 1 && x < 5 && y > 1 && y < 5) put(x, y, 5, 'stone');
    }
    put(3, 5, 1, null); put(3, 5, 2, null);
    put(5, 3, 2, 'glass'); put(1, 3, 2, 'glass'); put(3, 1, 2, 'glass');
    put(3, 3, 6, 'stone');
    for (let z = 1; z <= 3; z++) put(7, 1, z, 'log');
    [[6, 0], [7, 0], [6, 1], [6, 2], [7, 2]].forEach(p => { put(p[0], p[1], 3, 'leaf'); });
    put(7, 1, 4, 'leaf'); put(6, 1, 4, 'leaf');
    put(6, 6, 0, 'water'); put(7, 6, 0, 'water'); put(6, 7, 0, 'water'); put(7, 7, 0, 'sand'); put(5, 7, 0, 'sand');
  }
  /* 带标记的方块：每个面都知道自己是谁 */
  function tagged(x, y, z, t){
    const p = isoXY(x, y, z, s, OX, OY), ox = p[0], oy = p[1];
    const T = [ox, oy - s], L = [ox - w, oy - s + h], R = [ox + w, oy - s + h], B = [ox, oy - s + 2 * h];
    const Lb = [ox - w, oy + h], Rb = [ox + w, oy + h], Bb = [ox, oy + 2 * h];
    const poly = (pts, f) => '<path class="cell" data-x="' + x + '" data-y="' + y + '" data-z="' + z + '" data-f="' + f + '" d="M' + pts.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join('L') + 'Z" fill="transparent"/>';
    return cube(ox, oy, s, t, x * 131 + y * 17 + z * 7 + 3) + poly([L, B, Bb, Lb], 'l') + poly([B, R, Rb, Bb], 'r') + poly([T, R, B, L], 't');
  }
  function draw(){
    let g = '';
    /* 地面格子：只在最底层空着的地方画 */
    for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) if (!occ[x][y][0]) {
      const p = isoXY(x, y, 0, s, OX, OY), ox = p[0], oy = p[1];
      g += '<path class="cell" data-x="' + x + '" data-y="' + y + '" data-z="-1" data-f="t" d="M' + ox + ',' + oy + 'L' + (ox + w) + ',' + (oy + h) + 'L' + ox + ',' + (oy + 2 * h) + 'L' + (ox - w) + ',' + (oy + h) + 'Z" fill="var(--paper-2)" stroke="var(--rule)" stroke-dasharray="2 2"/>';
    }
    const list = [];
    for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) for (let z = 0; z < MZ; z++) if (occ[x][y][z]) list.push([x, y, z]);
    list.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[2] - b[2] || a[0] - b[0]);
    list.forEach(q => g += tagged(q[0], q[1], q[2], occ[q[0]][q[1]][q[2]]));
    svg.innerHTML = g;
    const n = list.length, top = list.reduce((m, q) => Math.max(m, q[2] + 1), 0);
    const kinds = {}; list.forEach(q => { const t = occ[q[0]][q[1]][q[2]]; kinds[t] = (kinds[t] || 0) + 1; });
    const most = Object.keys(kinds).sort((a, b) => kinds[b] - kinds[a]).slice(0, 3).map(k => BT[k].n + ' ' + kinds[k]).join('、');
    $('#bldSay').innerHTML = n ? '一共 <b>' + n + '</b> 块，也就是 ' + n + ' 立方米；最高 ' + top + ' 格（' + top + ' 米）。用得最多的：' + most + '。' + (n > 29 ? '小格的卧室大约 29 立方米，你这块地已经能装下 ' + (n / 29.4).toFixed(1) + ' 间卧室。' : '') : '地上什么都没有了。点虚线格子放第一块。';
  }
  svg.addEventListener('click', e => {
    const c = e.target.closest('.cell'); if (!c) return;
    let x = +c.dataset.x, y = +c.dataset.y, z = +c.dataset.z; const f = c.dataset.f;
    if (mode === 1) { if (z >= 0) occ[x][y][z] = null; draw(); return; }
    if (f === 't') z += 1; else if (f === 'l') y += 1; else x += 1;
    if (!inside(x, y, z)) { $('#bldSay').textContent = '这里放不下了：小地只有八乘八，最多七层高。'; return; }
    if (occ[x][y][z]) return;
    occ[x][y][z] = cur; draw();
  });
  const pal = $('#bldPal');
  pal.innerHTML = TYPES.map(t => '<button data-t="' + t + '"' + (t === cur ? ' class="on"' : '') + '>' + blockIcon(t, 24) + BT[t].n + '</button>').join('');
  pal.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = b.dataset.t; $$('button', pal).forEach(x => x.classList.toggle('on', x === b)); if (mode === 1) { mode = 0; $$('#bldMode .btn').forEach((x, i) => x.classList.toggle('on', i === 0)); } });
  btnRow($('#bldMode'), ['放', '挖'], 0, i => { mode = i; });
  $('#bldHouse').addEventListener('click', () => { house(); draw(); });
  $('#bldClear').addEventListener('click', () => { empty(); draw(); });
  house(); draw();
});
