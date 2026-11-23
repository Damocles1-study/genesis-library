/* ---------- 装置 16：举折 ---------- */
dev('#jzFig', () => {
  const R = slider('jzR', v => '约 1/' + (1 / v).toFixed(1), () => draw());
  const N = slider('jzN', v => v + ' 步', () => draw());
  function fold(H, n){
    const half = 6, xs = [], ys = [];
    for (let k = 0; k <= n; k++) xs.push(k * half / n);
    ys[0] = H; ys[n] = 0;
    let drop = H / 10;
    for (let j = 1; j < n; j++) {
      const x0 = xs[j - 1], y0 = ys[j - 1], lin = y0 + (0 - y0) * (xs[j] - x0) / (half - x0);
      ys[j] = lin - drop; drop /= 2;
    }
    return xs.map((x, i) => [x, ys[i]]);
  }
  function throwDist(H, theta, h){
    const v = Math.sqrt(2 * 9.8 * H), vs = v * Math.sin(theta), vc = v * Math.cos(theta);
    const t = (-vs + Math.sqrt(vs * vs + 2 * 9.8 * h)) / 9.8;
    return vc * t;
  }
  function draw(){
    const H = 12 * R(), n = N(), P = fold(H, n), eave = 5;
    const k = 27, cx = 220, base = 30 + (H + eave) * k;
    const X = x => cx + x * k, Y = y => base - (y + eave) * k;
    let g = '<line x1="20" x2="580" y1="' + base + '" y2="' + base + '" stroke="var(--ink)"/>';
    g += '<rect x="' + X(-6) + '" y="' + Y(0) + '" width="6" height="' + eave * k + '" fill="var(--ink-3)" fill-opacity=".4"/><rect x="' + (X(6) - 6) + '" y="' + Y(0) + '" width="6" height="' + eave * k + '" fill="var(--ink-3)" fill-opacity=".4"/>';
    g += '<path d="M' + X(-6) + ',' + Y(0) + 'L' + X(0) + ',' + Y(H) + 'L' + X(6) + ',' + Y(0) + '" fill="none" stroke="var(--ink-3)" stroke-dasharray="5 4"/>';
    const full = [...P.slice().reverse().map(p => [-p[0], p[1]]), ...P.slice(1)];
    g += '<path d="M' + full.map(p => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join('L') + '" fill="none" stroke="var(--ter)" stroke-width="3" stroke-linejoin="round"/>';
    full.forEach(p => g += '<circle cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="3.5" fill="var(--card)" stroke="var(--ter)" stroke-width="2"/>');
    // 雨水甩出去的轨迹（右边）
    const thS = Math.atan(H / 6), thC = Math.atan((P[n - 1][1] - P[n][1]) / (6 / n)), thTop = Math.atan((P[0][1] - P[1][1]) / (6 / n));
    const dS = throwDist(H, thS, eave), dC = throwDist(H, thC, eave);
    const traj = (th, col, dash) => { const v = Math.sqrt(2 * 9.8 * H), pts = []; for (let t = 0; t < 3; t += 0.02) { const x = 6 + v * Math.cos(th) * t, y = -v * Math.sin(th) * t - 4.9 * t * t; if (y < -eave) break; pts.push([x, y]); } return '<path d="M' + pts.map(p => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join('L') + '" fill="none" stroke="' + col + '" stroke-width="1.6"' + (dash ? ' stroke-dasharray="4 3"' : '') + '/>'; };
    g += traj(thS, 'var(--ink-3)', true) + traj(thC, 'var(--blu)', false);
    g += txt(X(6 + dC) , base + 14, '弯屋面：' + dC.toFixed(1) + ' 米', {s: 10.5, a: 'end', c: 'var(--blu)'});
    const svg = $('#jzSvg'); svg.setAttribute('viewBox', '0 0 600 ' + Math.ceil(base + 22)); svg.innerHTML = g;
    const deg = r => (r * 180 / Math.PI).toFixed(0) + '°';
    kv($('#jzKv'), [['屋脊高出檐口', H.toFixed(1) + ' 米'], ['直坡', deg(thS)], ['弯屋面：脊下 / 檐口', deg(thTop) + ' / ' + deg(thC)], ['雨水落地：直坡 / 弯面', '离檐 ' + dS.toFixed(1) + ' / ' + dC.toFixed(1) + ' 米']]);
    $('#jzSay').innerHTML = '按“每尺折一寸，每架递减半”折下来，脊下的坡陡到 ' + deg(thTop) + '，檐口缓到 ' + deg(thC) + '。雨水在上面加速，到了檐口方向更平，被甩出去约 ' + dC.toFixed(1) + ' 米，比直坡的 ' + dS.toFixed(1) + ' 米远' + (dC > dS ? '：<b>“吐水疾而霤远”</b>。' : '。') + ' 檐口缓下来，还让屋檐能挑得更远、冬天的阳光照得更深（下一章）。';
  }
  draw();
});
