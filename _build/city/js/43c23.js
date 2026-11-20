/* ---------- 装置 24：开一条大道 ---------- */
dev('#cutFig', fig => {
  const svg = $('#cutSvg'), PX = 5; // 1 像素 = 5 米
  const A = [20, 160], B = [580, 120];
  // 老街：弯弯曲曲
  const OLD = [A, [80, 150], [120, 190], [170, 200], [210, 160], [250, 130], [300, 150], [340, 190], [390, 180], [430, 140], [470, 100], [520, 110], B];
  const R = rng(1853), H = [];
  for (let i = 0; i < 1400 && H.length < 520; i++) { const x = 30 + R() * 540, y = 30 + R() * 245; const d = segDist(OLD, x, y); if (d > 9) H.push([x, y, R() * 40 - 20]); }
  function segDist(P, x, y){ let m = 1e9; for (let i = 0; i < P.length - 1; i++) { const [ax, ay] = P[i], [bx, by] = P[i + 1], dx = bx - ax, dy = by - ay, t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), 0, 1); m = Math.min(m, Math.hypot(x - ax - t * dx, y - ay - t * dy)); } return m; }
  const len = P => P.reduce((s, p, i) => i ? s + Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]) : 0, 0);
  const W = $('#cutW'), S = $('#cutS');
  [W, S].forEach(e => e.addEventListener('input', go));
  function go(){
    const w = +W.value, st = +S.value / 100;
    $('#cutWO').textContent = w + ' 米'; $('#cutSO').textContent = st < .05 ? '沿老街' : st > .95 ? '直线' : Math.round(st * 100) + '%';
    const L0 = len(OLD);
    const NEW = OLD.map((p, i) => { const t = (p[0] - A[0]) / (B[0] - A[0]); const q = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]; return [lerp(p[0], q[0], st), lerp(p[1], q[1], st)]; });
    const half = w / PX / 2;
    let gone = 0, s = '<rect width="600" height="300" fill="var(--paper)"/>';
    s += '<polyline points="' + OLD.map(p => p.join(',')).join(' ') + '" fill="none" stroke="var(--ink-3)" stroke-width="3" stroke-dasharray="4 3" opacity=".6"/>';
    s += '<polyline points="' + NEW.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ') + '" fill="none" stroke="var(--och)" stroke-width="' + (half * 2).toFixed(1) + '" stroke-linejoin="round" opacity=".35"/>';
    H.forEach(h => { const cut = segDist(NEW, h[0], h[1]) < half + 3; if (cut) gone++; s += '<rect x="' + (h[0] - 4) + '" y="' + (h[1] - 3) + '" width="8" height="6" transform="rotate(' + h[2].toFixed(0) + ' ' + h[0].toFixed(0) + ' ' + h[1].toFixed(0) + ')" fill="' + (cut ? 'var(--red)' : 'var(--card)') + '" stroke="var(--ink)" stroke-width=".7" opacity="' + (cut ? .85 : 1) + '"/>'; });
    s += '<rect x="6" y="150" width="16" height="20" fill="var(--brk)"/><text x="14" y="186" font-size="11" text-anchor="middle" fill="var(--ink)">城门</text><rect x="574" y="110" width="20" height="20" fill="var(--ink)" opacity=".7"/><text x="584" y="146" font-size="11" text-anchor="middle" fill="var(--ink)">车站</text>';
    svg.innerHTML = s;
    const L1 = len(NEW);
    kv($('#cutKV'), [['要拆的房子', gone + ' 栋'], ['要搬走的人（约）', fmt(gone * 12) + ' 人'], ['城门到车站', f1(L1 * PX / 1000) + ' 公里（原来 ' + f1(L0 * PX / 1000) + '）'], ['开车省下', Math.max(0, Math.round(L0 * PX / 1000 / 15 * 60 - L1 * PX / 1000 / (15 + (w - 10) / 70 * 25) * 60)) + ' 分钟']]);
    const Sy = $('#cutSay');
    Sy.innerHTML = st < .2 ? '沿着老街拓宽：路还是弯的，可拆的房子少，老街两边的店铺和邻里大多保得住。' + (w > 50 ? '只是这么宽的路硬塞进老街，两边的房子还是要拆掉一大片。' : '')
      : st > .8 ? '一刀直线切过去：路程最短、最气派，可直线不管原来那里是什么，切到哪家拆哪家。奥斯曼的大道大多是这么开的。'
      : '折中的路线：比老街直，比直线拆得少。真实的规划常常在这两者之间吵上好几年。';
    if (w >= 60) Sy.innerHTML += '<br>六十米以上的大道，过一次马路要走一分钟。第十七章讲过，宽马路对车是好事，对人是一道坎。';
  }
  go();
});
