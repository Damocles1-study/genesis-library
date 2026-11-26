
/* ---------- 第二十章：方块变模型 ---------- */
dev('#modelFig', () => {
  const sv = $('#modelSvg'), s = 16;
  const B = {
    house: () => { const r = []; for (let x = 0; x < 5; x++) for (let z = 0; z < 4; z++) { r.push([x, 0, z, 'stone']); } for (let y = 1; y <= 3; y++) for (let x = 0; x < 5; x++) for (let z = 0; z < 4; z++) if (x === 0 || z === 0 || x === 4 || z === 3) r.push([x, y, z, (y === 2 && (x === 2 || z === 2) && x !== 0 && z !== 0) ? 'glass' : 'plank']); for (let x = 0; x < 5; x++) for (let z = 0; z < 4; z++) r.push([x, 4, z, 'log']); return r; },
    tree: () => { const r = []; for (let y = 0; y < 4; y++) r.push([2, y, 2, 'log']); for (let x = 0; x < 5; x++) for (let z = 0; z < 5; z++) for (let y = 3; y < 5; y++) if (!(x === 2 && z === 2 && y === 3) && !((x === 0 || x === 4) && (z === 0 || z === 4))) r.push([x, y, z, 'leaf']); for (let x = 1; x < 4; x++) for (let z = 1; z < 4; z++) r.push([x, 5, z, 'leaf']); return r; },
    tower: () => { const r = []; for (let y = 0; y < 7; y++) for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) if (x !== 1 || z !== 1) r.push([x, y, z, 'stone']); [[0, 0], [2, 0], [0, 2], [2, 2]].forEach(c => r.push([c[0], 7, c[1], 'stone'])); return r; }
  };
  const N = {house: '小房子', tree: '一棵树', tower: '石头塔'};
  let k = 'house', sc = 1;
  function draw(){
    const list = B[k]().sort((a, b) => (a[0] + a[2]) - (b[0] + b[2]) || a[1] - b[1]);
    const ox = 8 * s * .866 + 10, oy = 8 * s + 14;
    let g = ''; list.forEach(b => { const q = isoXY(b[0], b[2], b[1], s, ox, oy); g += cube(q[0], q[1], s, b[3], b[0] * 5 + b[1] * 3 + b[2] * 7); });
    sv.setAttribute('viewBox', '0 0 ' + ox * 2 + ' ' + (oy + 10 * s * .5 + 8)); sv.innerHTML = g;
    const n = list.length, xs = list.map(b => b[0]), ys = list.map(b => b[1]), zs = list.map(b => b[2]);
    const dim = [Math.max(...xs) + 1, Math.max(...zs) + 1, Math.max(...ys) + 1].map(v => v * sc);
    const cm3 = n * sc * sc * sc, gram = cm3 * 1.24 * 0.3;
    kv($('#modelKv'), [['一共', n + ' 块'], ['做出来的大小', dim.join(' × ') + ' 厘米'], ['折纸方块要剪', n + ' 张展开图'], ['3D 打印大约用料', Math.round(gram) + ' 克']]);
    $('#modelSay').innerHTML = N[k] + '有 <b>' + n + '</b> 块。按 1 格 = ' + sc + ' 厘米做模型，' + (sc === 1 ? '只有手掌那么大，最适合 3D 打印。' : sc === 2 ? '大概和一本书差不多高。' : '已经有一个小书架那么大了，用纸方块做要剪很久。') + '3D 打印的用料按“外壳实心、里面三成”的常见设置粗算，真实情况看打印机和设置。';
  }
  btnRow($('#modelK'), Object.keys(B).map(x => N[x]), 0, i => { k = Object.keys(B)[i]; draw(); });
  btnRow($('#modelS'), ['1 格 = 1 厘米', '1 格 = 2 厘米', '1 格 = 5 厘米'], 0, i => { sc = [1, 2, 5][i]; draw(); });
  draw();
});
