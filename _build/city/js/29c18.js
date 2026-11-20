/* ---------- 装置 19：半小时能到哪儿 ---------- */
dev('#isoFig', fig => {
  const W = 600, H = 360, KM = 20, CX = 300, CY = 180; // 20 像素 = 1 公里，地图 30 × 18 公里
  const MODES = ['步行', '马车', '有轨电车', '地铁', '小汽车'];
  let mode = 0;
  const jam = $('#isoJam');
  btnRow($('#isoMode'), MODES, 0, i => { mode = i; go(); });
  jam.addEventListener('input', go);
  const LINES = [[1, 0], [-1, 0], [0.5, 0.866], [-0.5, -0.866], [0.5, -0.866], [-0.5, 0.866]].map(d => [d[0], d[1]]);
  const WALK = 5;
  function reach(px, py){
    const dx = (px - CX) / KM, dy = (py - CY) / KM, d = Math.hypot(dx, dy); // 公里
    if (mode === 0) return d <= WALK * .5;
    if (mode === 1) return d <= 9 * .5 * .9;                // 马车约 9 公里/时，考虑街道曲折
    if (mode === 4) { const v = 45 * (1 - +jam.value / 100); return d * 1.25 <= v * ((30 - 6) / 60); } // 找车位 6 分钟，路网绕 1.25 倍
    // 轨道：沿线行驶，再步行
    const v = mode === 2 ? 14 : 35, wait = mode === 2 ? 4 : 5, gap = mode === 2 ? 0.4 : 1.3;
    let ok = d <= WALK * .5;
    LINES.forEach(L => {
      const along = dx * L[0] + dy * L[1]; if (along < 0) return;
      const perp = Math.abs(dx * L[1] - dy * L[0]);
      const st = Math.round(along / gap) * gap;             // 最近的车站
      const off = Math.hypot(along - st, perp);
      const t = wait + st / v * 60 + off / WALK * 60 + 3;     // 进站 3 分钟
      if (t <= 30) ok = true;
    });
    return ok;
  }
  function go(){
    $('#isoJamRow').style.display = mode === 4 ? '' : 'none';
    $('#isoJamO').textContent = jam.value + '%';
    let s = '<rect width="600" height="360" fill="var(--paper)"/>', n = 0, tot = 0;
    for (let x = 0; x < W; x += 6) for (let y = 0; y < H; y += 6) { tot++; if (reach(x + 3, y + 3)) { n++; s += '<rect x="' + x + '" y="' + y + '" width="6" height="6" fill="var(--main)" fill-opacity=".45"/>'; } }
    if (mode === 2 || mode === 3) LINES.forEach(L => { s += '<line x1="' + CX + '" y1="' + CY + '" x2="' + (CX + L[0] * 400) + '" y2="' + (CY + L[1] * 400) + '" stroke="' + (mode === 3 ? 'var(--red)' : 'var(--och)') + '" stroke-width="2"/>'; if (mode === 3) for (let k = 1.3; k < 20; k += 1.3) s += '<circle cx="' + (CX + L[0] * k * KM).toFixed(1) + '" cy="' + (CY + L[1] * k * KM).toFixed(1) + '" r="2.4" fill="var(--card)" stroke="var(--red)" stroke-width="1.3"/>'; });
    s += '<circle cx="' + CX + '" cy="' + CY + '" r="5" fill="var(--ink)"/><text x="' + (CX + 8) + '" y="' + (CY - 8) + '" font-size="12" fill="var(--ink)" paint-order="stroke" stroke="var(--paper)" stroke-width="3">市中心</text>';
    s += '<line x1="10" x2="' + (10 + 5 * KM) + '" y1="350" y2="350" stroke="var(--ink)" stroke-width="2"/><text x="' + (14 + 5 * KM) + '" y="354" font-size="11" fill="var(--ink)" paint-order="stroke" stroke="var(--paper)" stroke-width="3">5 公里</text>';
    $('#isoSvg').innerHTML = s;
    const area = n / tot * (W / KM) * (H / KM), walkA = Math.PI * 2.5 * 2.5;
    kv($('#isoKV'), [['半小时能到', f1(area) + ' 平方公里'], ['是步行的', (area / walkA).toFixed(1) + ' 倍'], ['形状', ['圆', '圆', '星形', '一串珠子', '圆（看堵不堵）'][mode]]]);
    $('#isoSay').innerHTML = [
      '步行：半小时两公里多一点。工业时代以前，大多数城市的半径就在这个范围里：从城中心走到城门，不超过半个钟头。',
      '马车：快不了多少，而且贵，只有有钱人坐得起。普通人的城还是步行的城。',
      '有轨电车：沿着几条线伸出去，站很密，城变成了一颗星星。“电车郊区”就长在这些星芒上。',
      '地铁：跑得快，能到的范围沿着线路伸得很远，越往外越像一串珠子，珠子之间、线路之间反而走不到。这就是为什么地铁站附近的房子贵：离开车站一公里，地铁就帮不上忙了。',
      '小汽车：哪儿都能去，不堵车的时候，半小时能到的面积是步行的几十倍；越堵，这个圈缩得越快。下一章讲为什么路修得越多，圈反而不一定变大。'
    ][mode];
  }
  go();
});
