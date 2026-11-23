/* ---------- 装置 15：共振 ---------- */
dev('#gzFig', () => {
  const G = [['硬岩', 0.2], ['一般土层', 0.5], ['软土', 1.0], ['墨西哥城湖底黏土', 2.0]];
  btnRow($('#gzBtns'), G.map(x => x[0]), 3, i => { $('#gzT').value = G[i][1]; $('#gzT').dispatchEvent(new Event('input')); });
  const T = slider('gzT', v => v.toFixed(2) + ' 秒', () => draw());
  const Z = slider('gzZ', v => Math.round(v * 100) + '%', () => draw());
  function amp(n, tg, z){ const r = 0.1 * n / tg; return 1 / Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2); }
  function draw(){
    const tg = T(), z = Z(), W = 600, base = 200, N = 40;
    let g = '<line x1="10" x2="590" y1="' + base + '" y2="' + base + '" stroke="var(--ink)" stroke-width="1.2"/>';
    let best = 1, bestN = 1;
    for (let n = 1; n <= N; n++) {
      const a = amp(n, tg, z); if (a > best) { best = a; bestN = n; }
      const t = clamp((a - 1) / 6, 0, 1), x = 14 + (n - 1) * 14.4, h = n * 4.4;
      const col = 'color-mix(in srgb,var(--red) ' + Math.round(t * 100) + '%,var(--ink-3))';
      g += '<rect x="' + x + '" y="' + (base - h) + '" width="10.5" height="' + h + '" fill="' + col + '" fill-opacity="' + (0.35 + t * 0.6) + '"/>';
      if (n % 5 === 0 || n === 1) g += txt(x + 5, base + 13, n + '层', {s: 9.5, c: 'var(--ink-3)', halo: false});
    }
    g += txt(300, 16, '颜色越红，被放大得越厉害', {s: 11, c: 'var(--ink-2)', halo: false});
    const svg = $('#gzSvg'); svg.setAttribute('viewBox', '0 0 ' + W + ' 222'); svg.innerHTML = g;
    const band = []; for (let n = 1; n <= N; n++) if (amp(n, tg, z) > best * 0.5) band.push(n);
    $('#gzSay').className = 'say' + (best > 4 ? ' bad' : '');
    $('#gzSay').innerHTML = '地面约每 ' + tg.toFixed(2) + ' 秒来回一次。和它合拍的是 <b>' + band[0] + '—' + band[band.length - 1] + ' 层</b>的楼，最厉害的 ' + bestN + ' 层楼被放大约 ' + best.toFixed(1) + ' 倍。' +
      (tg >= 1.6 ? ' 这就是 1985 年墨西哥城的情形：和地面合拍的中高层楼最倒霉，矮房子反而好些。真实的楼一旦开裂就会变“软”、晃得更慢，所以那次受害最重的是本来周期稍短一点的六到十五层楼。' : tg <= 0.3 ? ' 硬岩上的地震动又快又短，最危险的是矮房子，比如唐山那样的砖石平房和多层楼。' : '') +
      (z >= 0.15 ? ' 阻尼加大以后，共振的尖峰被削平了：这就是今天高楼里装阻尼器、在基础下加隔震垫的道理。' : ' 试着把阻尼往上调。');
  }
  draw();
});
