/* ---------- 装置 1：选址 ---------- */
dev('#siteFig', fig => {
  const svg = $('#siteMap'), C = 25, NX = 24, NY = 14;
  const ry = x => 120 + 140 * (x / 600) + 35 * Math.sin(x / 95);             // 大河中线
  const CONF = {x: 400, y: ry(400)}, FORD = {x: 210, y: ry(210)};
  // 支流：从 (430,0) 流到汇口
  const tribD = (x, y) => { const ax = 430, ay = 0, bx = CONF.x, by = CONF.y, dx = bx - ax, dy = by - ay, t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), 0, 1); return Math.hypot(x - ax - t * dx, y - ay - t * dy); };
  const riverD = (x, y) => { let m = 1e9; for (let xx = -20; xx <= 620; xx += 6) m = Math.min(m, Math.hypot(x - xx, y - ry(xx))); return m; };
  const elev = (x, y) => {
    const d = riverD(x, y);
    let e = 10 + Math.min(d, 160) * 0.055 + 34 * Math.exp(-((x - 110) ** 2 + (y - 60) ** 2) / (2 * 75 * 75)) - 5 * Math.exp(-((x - 430) ** 2 + (y - 310) ** 2) / (2 * 70 * 70));
    if (y > ry(x)) e -= 2.2;                     // 南岸偏低
    e += 1.2 * Math.sin(x / 37) * Math.cos(y / 41); // 一点起伏
    return e;
  };
  const FLOOD = 12.6;
  const cells = [];
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const x = i * C + C / 2, y = j * C + C / 2; cells.push({i, j, x, y, e: elev(x, y), rd: riverD(x, y), td: tribD(x, y)}); }
  const at = (i, j) => cells[j * NX + i];
  cells.forEach(c => { c.water = c.rd < 14 || c.td < 8; });
  function score(c){
    const d = Math.min(c.rd, c.td);
    const W = c.water ? 0 : d < 75 ? 100 : Math.max(0, 100 - (d - 75) * 0.7);
    const F = c.water ? 0 : clamp((c.e - FLOOD) * 30, 0, 100);
    let sum = 0, n = 0, farm = 0, m = 0;
    cells.forEach(o => { const r = Math.hypot(o.x - c.x, o.y - c.y); if (r < 55 && !o.water) { sum += o.e; n++; } if (r < 110 && !o.water) { m++; if (o.e > 10.4 && o.e < 17.5) farm++; } });
    const D = c.water ? 0 : clamp(45 + (c.e - sum / n) * 22 + (c.rd < 60 && c.td < 60 ? 25 : 0), 0, 100);
    const A = c.water ? 0 : clamp(farm / m * 150, 0, 100);
    const T = c.water ? 0 : clamp(Math.max(100 - Math.hypot(c.x - FORD.x, c.y - FORD.y) * 0.75, 100 - Math.hypot(c.x - CONF.x, c.y - CONF.y) * 0.75, 0), 0, 100);
    const tot = c.water ? 0 : (W * .2 + F * .25 + D * .15 + A * .2 + T * .2) * (F < 5 ? .55 : 1);
    return {W, F, D, A, T, tot};
  }
  cells.forEach(c => c.s = score(c));
  const best = cells.filter(c => !c.water).sort((a, b) => b.s.tot - a.s.tot).slice(0, 3);
  let pick = null, flood = false, showBest = false;
  function draw(){
    let g = '';
    cells.forEach(c => {
      const t = clamp((c.e - 10) / 30, 0, 1);
      g += '<rect x="' + c.i * C + '" y="' + c.j * C + '" width="' + C + '" height="' + C + '" fill="var(--och)" fill-opacity="' + (0.04 + t * 0.42).toFixed(3) + '"/>';
    });
    // 等高线示意：每 4 米一圈的格子边
    cells.forEach(c => { if (c.i < NX - 1 && Math.floor(c.e / 4) !== Math.floor(at(c.i + 1, c.j).e / 4)) g += '<line x1="' + (c.i + 1) * C + '" x2="' + (c.i + 1) * C + '" y1="' + c.j * C + '" y2="' + (c.j + 1) * C + '" stroke="var(--och)" stroke-width=".8" opacity=".6"/>'; if (c.j < NY - 1 && Math.floor(c.e / 4) !== Math.floor(at(c.i, c.j + 1).e / 4)) g += '<line x1="' + c.i * C + '" x2="' + (c.i + 1) * C + '" y1="' + (c.j + 1) * C + '" y2="' + (c.j + 1) * C + '" stroke="var(--och)" stroke-width=".8" opacity=".6"/>'; });
    if (flood) cells.forEach(c => { if (c.e < FLOOD) g += '<rect x="' + c.i * C + '" y="' + c.j * C + '" width="' + C + '" height="' + C + '" fill="var(--wat)" opacity=".85"/>'; });
    let d = 'M-20,' + ry(-20).toFixed(1); for (let x = -14; x <= 620; x += 6) d += ' L' + x + ',' + ry(x).toFixed(1);
    g += '<path d="' + d + '" fill="none" stroke="var(--wat)" stroke-width="22" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="var(--ink)" stroke-width=".8" opacity=".5"/>';
    g += '<path d="M430,0 L' + CONF.x + ',' + CONF.y.toFixed(1) + '" stroke="var(--wat)" stroke-width="11" stroke-linecap="round"/>';
    g += '<path d="M' + (FORD.x - 10) + ',' + (FORD.y - 16) + ' L' + (FORD.x + 10) + ',' + (FORD.y + 16) + '" stroke="var(--ink)" stroke-width="2.4" stroke-dasharray="2 3"/>';
    const L = (x, y, t, s) => '<text x="' + x + '" y="' + y + '" font-size="' + (s || 15) + '" text-anchor="middle" fill="var(--ink)" paint-order="stroke" stroke="var(--card)" stroke-width="4">' + t + '</text>';
    g += L(FORD.x - 22, FORD.y + 30, '渡') + L(CONF.x + 26, CONF.y - 8, '汇') + L(110, 64, '山') + L(450, 330, '洼地', 13) + L(560, 252, '大河', 13);
    if (showBest) best.forEach((c, k) => g += '<circle cx="' + c.x + '" cy="' + c.y + '" r="11" fill="none" stroke="var(--grn)" stroke-width="2.4"/>' + L(c.x, c.y + 5, k + 1, 13));
    if (pick) g += '<rect x="' + (pick.i * C + 2) + '" y="' + (pick.j * C + 2) + '" width="' + (C - 4) + '" height="' + (C - 4) + '" fill="none" stroke="var(--red)" stroke-width="3"/>' + (flood && pick.e < FLOOD ? L(pick.x, pick.y - 16, '淹了', 14) : '');
    svg.innerHTML = g;
  }
  function report(){
    if (!pick) return;
    const s = pick.s, rows = [['水', '离水近', s.W], ['不淹', '洪水够不着', s.F], ['好守', '比四周高、有水护着', s.D], ['能种', '附近有平地好田', s.A], ['过路', '靠近渡口或河口', s.T]];
    $('#siteBars').innerHTML = rows.map(r => '<div class="row"><span class="nm">' + r[0] + '<small>' + r[1] + '</small></span><span class="tr"><i style="width:' + r[2].toFixed(0) + '%;background:' + (r[2] < 30 ? 'var(--red)' : r[2] < 65 ? 'var(--och)' : 'var(--grn)') + '"></i></span><span class="v">' + r[2].toFixed(0) + '</span></div>').join('') +
      '<div class="row"><span class="nm"><b>总分</b></span><span class="tr"><i style="width:' + s.tot.toFixed(0) + '%"></i></span><span class="v"><b>' + s.tot.toFixed(0) + '</b></span></div>';
    const say = $('#siteSay');
    if (pick.water) { say.className = 'say bad'; say.textContent = '这一格在水里。除非你是威尼斯人，打算往泥里砸几百万根木桩。'; return; }
    const low = rows.slice().sort((a, b) => a[2] - b[2])[0];
    const tips = {
      '水': '离水太远。古代城市的命根子是水，打井打不到、挑水要走半天的地方，长不大。',
      '不淹': '洪水够得着这里。河边低地土最肥、离渡口最近，但每隔几年就要泡一回——宋家选的就是这种地方。',
      '好守': '这里四面平平，没有高处可守，也没有河水护着。太平年月无所谓，乱世就要多花钱修墙。',
      '能种': '周围好田太少。一座城得靠四周的乡下喂饭，第三章会细算这笔账。',
      '过路': '离渡口和河口都远。这块地能住人，但没有人非经过这里不可，大概会一直是个村子。'
    };
    say.className = 'say' + (s.tot >= 70 ? ' ok' : s.tot < 45 ? ' bad' : '');
    say.innerHTML = (s.tot >= 70 ? '<b>好地方。</b>' : s.tot >= 55 ? '<b>还行。</b>' : '<b>不太理想。</b>') + '最弱的一项是“' + low[0] + '”：' + tips[low[0]] + (flood ? (pick.e < FLOOD ? '<br>刚才那场大水，这里泡在了水里。' : '<br>刚才那场大水，这里没事。') : '');
  }
  svg.addEventListener('click', e => {
    const p = svgPt(svg, e), i = clamp(Math.floor(p.x / C), 0, NX - 1), j = clamp(Math.floor(p.y / C), 0, NY - 1);
    pick = at(i, j); draw(); report();
  });
  $('#siteFlood').addEventListener('click', e => { flood = !flood; e.target.classList.toggle('on', flood); e.target.textContent = flood ? '水退了' : '发一次大水'; draw(); report(); });
  $('#siteBest').addEventListener('click', e => {
    showBest = !showBest; e.target.classList.toggle('on', showBest); draw();
    if (showBest) { const say = $('#siteSay'); say.className = 'say ok'; say.innerHTML = '绿圈是按这五笔账算出来的前三名。它们大多挤在<b>渡口或河口旁边、又比洪水线高一截</b>的地方：既算了“地点”的账，也算了“位置”的账。真实世界里最老的城区，常常就在这样的地方。'; }
  });
  draw();
});
