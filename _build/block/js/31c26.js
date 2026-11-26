
/* ---------- 第二十六章：Python 生成命令 ---------- */
dev('#pyFig', () => {
  const sv = $('#pySvg');
  const S = [
    {n: '空心球', mat: 'glass', gen: r => { const o = []; for (let x = -r; x <= r; x++) for (let y = -r; y <= r; y++) for (let z = -r; z <= r; z++) { const d = x * x + y * y + z * z; if (d <= r * r && d > (r - 1) * (r - 1)) o.push([x, y + r, z]); } return o; },
      py: r => 'r = ' + r + '\nlines = []\nfor x in range(-r, r + 1):\n    for y in range(-r, r + 1):\n        for z in range(-r, r + 1):\n            d = x*x + y*y + z*z      # 离球心多远（的平方）\n            if (r-1)*(r-1) < d <= r*r:   # 只要最外面一层\n                lines.append(f"setblock ~{x} ~{y + r} ~{z} minecraft:glass")'},
    {n: '实心球', mat: 'stone', gen: r => { const o = []; for (let x = -r; x <= r; x++) for (let y = -r; y <= r; y++) for (let z = -r; z <= r; z++) if (x * x + y * y + z * z <= r * r) o.push([x, y + r, z]); return o; },
      py: r => 'r = ' + r + '\nlines = []\nfor x in range(-r, r + 1):\n    for y in range(-r, r + 1):\n        for z in range(-r, r + 1):\n            if x*x + y*y + z*z <= r*r:   # 勾股定理：在球里面吗？\n                lines.append(f"setblock ~{x} ~{y + r} ~{z} minecraft:stone")'},
    {n: '圆柱', mat: 'plank', gen: r => { const o = []; for (let y = 0; y < 2 * r; y++) for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) { const d = x * x + z * z; if (d <= r * r && d > (r - 1) * (r - 1)) o.push([x, y, z]); } return o; },
      py: r => 'r = ' + r + '\nlines = []\nfor y in range(2 * r):                 # 一层一层往上\n    for x in range(-r, r + 1):\n        for z in range(-r, r + 1):\n            d = x*x + z*z                 # 只看平面上离中心多远\n            if (r-1)*(r-1) < d <= r*r:\n                lines.append(f"setblock ~{x} ~{y} ~{z} minecraft:oak_planks")'},
    {n: '螺旋楼梯', mat: 'sand', gen: r => { const o = [], n = r * 6; for (let i = 0; i < n; i++) { const a = i / 8 * Math.PI * 2 / 2; o.push([Math.round(r * Math.cos(a)), i, Math.round(r * Math.sin(a))]); } return o; },
      py: r => 'import math\nr = ' + r + '\nlines = []\nfor i in range(' + r * 6 + '):          # 每一级楼梯\n    a = i * math.pi / 8               # 每级转一个小角度\n    x = round(r * math.cos(a))\n    z = round(r * math.sin(a))\n    lines.append(f"setblock ~{x} ~{i} ~{z} minecraft:sandstone")'}
  ];
  const TAIL = '\n\nwith open("shape.mcfunction", "w", encoding="utf-8") as f:\n    f.write("\\n".join(lines))\nprint("一共写了", len(lines), "行命令")';
  let si = 0;
  function draw(){
    const r = +$('#pyR').value, sh = S[si], pts = sh.gen(r);
    $('#pyCode').textContent = sh.py(r) + TAIL;
    const name = {glass: 'glass', stone: 'stone', plank: 'oak_planks', sand: 'sandstone'}[sh.mat];
    $('#pyOut').textContent = pts.slice(0, 5).map(p => 'setblock ~' + p[0] + ' ~' + p[1] + ' ~' + p[2] + ' minecraft:' + name).join('\n') + '\n……（一共 ' + pts.length + ' 行）';
    /* 预览：平移到正坐标再画 */
    const s = Math.max(5, 13 - r), mx = Math.min(...pts.map(p => p[0])), mz = Math.min(...pts.map(p => p[2]));
    const L = pts.map(p => [p[0] - mx, p[1], p[2] - mz]);
    const span = Math.max(...L.map(p => p[0])) + Math.max(...L.map(p => p[2])) + 2, top = Math.max(...L.map(p => p[1])) + 2;
    const ox = (Math.max(...L.map(p => p[2])) + 1) * s * .866 + 10, oy = top * s + 10;
    const set = new Set(L.map(p => p.join(',')));
    const has = (x, y, z) => sh.mat !== 'glass' && set.has(x + ',' + y + ',' + z);
    L.sort((a, b) => (a[0] + a[2]) - (b[0] + b[2]) || a[1] - b[1]);
    let g = '';
    L.forEach(b => { const q = isoXY(b[0], b[2], b[1], s, ox, oy); g += cube(q[0], q[1], s, sh.mat, b[0] * 5 + b[1] * 3 + b[2] * 7, {top: !has(b[0], b[1] + 1, b[2]), left: !has(b[0], b[1], b[2] + 1), right: !has(b[0] + 1, b[1], b[2])}); });
    const W = span * s * .866 + 20;
    sv.setAttribute('viewBox', '0 0 ' + W + ' ' + (oy + span * s * .5 + 10)); sv.innerHTML = g;
    $('#pySay').innerHTML = '这个程序只有十来行，却写出了 <b>' + pts.length + '</b> 行命令。' + (pts.length > 100 ? '要是手写，一行十秒，也要写 ' + Math.round(pts.length * 10 / 60) + ' 分钟，还很容易写错。' : '把半径改大一点试试，程序一个字都不用改。');
  }
  btnRow($('#pyS'), S.map(x => x.n), 0, i => { si = i; draw(); });
  slider('pyR', v => '半径 ' + v, () => { if ($('#pyCode')) draw(); });
  draw();
});
