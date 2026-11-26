
/* ---------- 第十八章：方块数学课（地板在里面，墙围在地板外面一圈） ---------- */
dev('#mathFig', () => {
  const sv = $('#mathSvg'), s = 14;
  function draw(){
    const L = +$('#mL').value, W = +$('#mW').value, H = +$('#mH').value;
    const floor = L * W, per = 2 * (L + W) + 4, wall = per * H, vol = L * W * H;
    const ox = 13 * s * .866 + 12, oy = 7 * s + 18;
    const list = [];
    for (let x = 1; x <= L; x++) for (let z = 1; z <= W; z++) list.push([x, 0, z, 'stone']);
    for (let y = 0; y < H; y++) for (let x = 0; x <= L + 1; x++) for (let z = 0; z <= W + 1; z++) if (x === 0 || z === 0 || x === L + 1 || z === W + 1) {
      /* 朝着读者的两面墙只画最下面一层，看得见里面 */
      if ((x === L + 1 || z === W + 1) && y > 0) continue;
      const corner = (x === 0 || x === L + 1) && (z === 0 || z === W + 1);
      list.push([x, y, z, corner ? 'log' : 'plank']);
    }
    list.sort((a, b) => (a[0] + a[2]) - (b[0] + b[2]) || a[1] - b[1]);
    let g = '';
    list.forEach(b => { const q = isoXY(b[0], b[2], b[1], s, ox, oy); g += cube(q[0], q[1], s, b[3], b[0] * 3 + b[1] * 7 + b[2] * 11); });
    sv.setAttribute('viewBox', '0 0 ' + ox * 2 + ' ' + (oy + 26 * s * .5 + 6)); sv.innerHTML = g;
    kv($('#mathKv'), [['地板（面积）', floor + ' 块'], ['墙一圈', per + ' 块'], ['四面墙一共', wall + ' 块'], ['屋子里的空间', vol + ' 格']]);
    $('#mathSay').innerHTML = '地板是 ' + L + ' × ' + W + ' = <b>' + floor + '</b> 块，这就是“面积”。墙围在地板外面一圈：两条长边 ' + L + ' + ' + L + '，两条短边 ' + W + ' + ' + W + '，再加上四个角（深色的原木），一共 <b>' + per + '</b> 块。忘了四个角，是最常见的错。墙高 ' + H + ' 层，要 ' + per + ' × ' + H + ' = <b>' + wall + '</b> 块。屋子里能装 ' + L + ' × ' + W + ' × ' + H + ' = <b>' + vol + '</b> 格空气，这就是“体积”的意思（五年级会学）。';
  }
  ['mL', 'mW', 'mH'].forEach(id => slider(id, v => v + ' 格', () => { if ($('#mH')) draw(); }));
  draw();
});
