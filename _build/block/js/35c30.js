
/* ---------- 第三十章：掉下去要多久（游戏里的规则 vs 真实世界） ---------- */
dev('#fallFig', () => {
  /* 游戏（Java 版玩家，据社区资料）：每刻先按速度移动，再让速度减 0.08、乘 0.98；单位：格/刻，一刻 0.05 秒 */
  function game(h){ let y = 0, v = 0, t = 0; const pts = [[0, 0]]; while (y < h && t < 400) { y += v; v = (v + 0.08) * 0.98; t++; pts.push([t * 0.05, Math.min(y, h)]); } return {t: t * 0.05, pts, vmax: v * 20}; }
  function real(h){ const T = Math.sqrt(2 * h / 9.8), pts = []; for (let i = 0; i <= 40; i++) { const t = T * i / 40; pts.push([t, 4.9 * t * t]); } return {t: T, pts, v: 9.8 * T}; }
  slider('fallH', v => v + ' 格（米）', h => {
    const g = game(h), r = real(h), tmax = Math.max(g.t, r.t) * 1.05;
    lineChart($('#fallSvg'), [{color: 'var(--zhu)', pts: g.pts}, {color: 'var(--blu)', pts: r.pts, dash: '6 4'}], {xmin: 0, xmax: tmax, ymin: 0, ymax: h, xt: [0, tmax / 2, tmax].map(x => +x.toFixed(1)), xf: x => x + ' 秒', yt: [0, h / 2, h].map(x => Math.round(x)), yf: y => '下落 ' + y, L: 70, H: 220});
    const dmg = Math.max(0, h - 3);
    kv($('#fallKv'), [['游戏里的你', g.t.toFixed(2) + ' 秒'], ['真实世界的石头', r.t.toFixed(2) + ' 秒'], ['游戏里落地时的速度', (g.vmax).toFixed(1) + ' 格/秒'], ['游戏里会掉几颗心', dmg ? (dmg / 2).toFixed(1) + ' 颗' + (dmg >= 20 ? '（满血也扛不住）' : '') : '不掉']]);
    $('#fallSay').innerHTML = '红线是游戏里的规则，蓝色虚线是真实世界（不算空气阻力的石头）。' + (g.t > r.t ? '游戏里比真的<b>慢</b>一点：' : '游戏里比真的<b>快</b>一点：') + '游戏用的是一条简单的“每一刻怎么变”的规则，加了“空气阻力”，所以掉得越久，越接近一个最大速度（大约每秒 78 格）。真实的物体也有最大速度，人跳伞时大约每秒五十多米。';
  });
});

dev('#netherFig', () => {
  const go = () => {
    const x = +$('#nxIn').value || 0, z = +$('#nzIn').value || 0;
    $('#netherSay').innerHTML = '主世界的 (' + x + ', ' + z + ') → 下界的 (<b>' + Math.floor(x / 8) + '</b>, <b>' + Math.floor(z / 8) + '</b>)。在下界走 1 格，等于在主世界走 8 格：从家到 ' + Math.round(Math.hypot(x, z)) + ' 格外的地方，下界只要走 ' + Math.round(Math.hypot(x, z) / 8) + ' 格。高度 y 不用除。';
  };
  ['nxIn', 'nzIn'].forEach(id => $('#' + id).addEventListener('input', go)); go();
});
