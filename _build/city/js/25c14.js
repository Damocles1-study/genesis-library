/* ---------- 装置 15：拥堵费定多少 ---------- */
dev('#tollFig', fig => {
  const N = 10000, VMAX = 80, CAP = 4000, T0 = 20, VOT = 0.6, KM = 15; // 人数、最高意愿（元）、通行能力、畅通时间（分钟）、每分钟时间价值、路程
  const time = n => T0 * (1 + 0.15 * Math.pow(n / CAP, 4));
  const val = n => VMAX * (1 - n / N);                   // 第 n 个最想开车的人，开车值多少钱
  function eq(toll){ let a = 0, b = N; for (let k = 0; k < 50; k++) { const m = (a + b) / 2; if (val(m) > toll + VOT * time(m)) a = m; else b = m; } return a; }
  // 社会总收益：开车的人得到的价值 - 所有人花在路上的时间（拥堵费只是转移，不算损失）
  const welfare = n => VMAX * n - VMAX * n * n / (2 * N) - n * VOT * time(n);
  let best = 0, bw = -1e18; for (let t = 0; t <= 60; t += 0.5) { const w = welfare(eq(t)); if (w > bw) { bw = w; best = t; } }
  const T = $('#tollT');
  T.addEventListener('input', () => go());
  $('#tollBest').addEventListener('click', () => { T.value = Math.round(best); go(true); });
  function go(isBest){
    const toll = +T.value, n = eq(toll), t = time(n);
    $('#tollTO').textContent = toll + ' 元';
    // 画路：车的密度
    const cars = Math.round(n / 160);
    let s = '<rect x="0" y="40" width="600" height="44" fill="var(--ink)" fill-opacity=".12"/><line x1="0" x2="600" y1="62" y2="62" stroke="var(--card)" stroke-width="2" stroke-dasharray="14 10"/>';
    for (let i = 0; i < cars; i++) { const x = (i * 600 / Math.max(cars, 1) + (i % 2) * 6) % 590, y = i % 2 ? 46 : 68; s += '<rect x="' + x.toFixed(1) + '" y="' + y + '" width="10" height="11" rx="2" fill="var(--red)" opacity=".8"/>'; }
    if (toll > 0) s += '<rect x="2" y="30" width="6" height="64" fill="var(--och)"/><text x="12" y="26" font-size="12" fill="var(--och)">收费线</text>';
    s += '<text x="300" y="112" font-size="12" text-anchor="middle" fill="var(--ink-3)">进城的路 · ' + KM + ' 公里</text>';
    $('#tollSvg').innerHTML = s;
    kv($('#tollKV'), [['开车进城', fmt(n) + ' 辆'], ['改坐地铁', fmt(N - n) + ' 人'], ['单程', Math.round(t) + ' 分钟 · ' + Math.round(KM / t * 60) + ' 公里/时'], ['每天收上来', fmt(n * toll) + ' 元']]);
    const S = $('#tollSay');
    let m;
    if (toll === 0) m = '不收钱的时候，只要开车“值”的人都会开，路被挤到每小时二十公里上下。每个司机只算了自己堵掉的时间，没算他让后面所有人多堵的那一点。';
    else if (Math.abs(toll - best) <= 2) m = '这大约就是<b>维克里的价钱</b>：每个开车的人交的钱，差不多等于他给别人添的堵。路上少了一些车，剩下的人省下的时间，加上收上来的钱，比不收费时整体更划算。';
    else if (toll > best) m = '收得太狠了：路很空，车速很快，可很多本来值得开车的人也被挤去坐地铁了。收上来的钱可能不少，但整体是亏的。';
    else m = '收了一点，路上少了一些车，车速快了一点。还可以再收高一些。';
    S.innerHTML = m + (isBest ? '<br>真实城市的拥堵费会随路段和时段变化，新加坡的电子收费每隔一段时间就根据实测车速调一次价。' : '');
  }
  go();
});
