/* ---------- 装置 21：工厂放哪儿 ---------- */
dev('#windFig', fig => {
  const svg = $('#windSvg'), C = 20, NX = 30, NY = 17;
  const DIRS = [['西北风', [1, 1]], ['东南风', [-1, -1]], ['西风', [1, 0]]]; // 风往哪个方向吹
  let di = 0, fac = null;
  btnRow($('#windDir'), DIRS.map(d => d[0]), 0, i => { di = i; draw(); });
  const ry = x => 210 + 60 * Math.sin(x / 160) + x * 0.12;  // 河（从西往东流）
  const R = rng(20), POP = [];
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const x = i * C + C / 2, y = j * C + C / 2;
    const water = Math.abs(y - ry(x)) < 12;
    const d = Math.hypot(x - 260, y - 140);
    POP.push(water ? 0 : Math.round(Math.max(0, 9 * Math.exp(-d * d / (2 * 95 * 95)) + (R() < .08 ? 2 : 0))));
  }
  const homes = () => POP.reduce((a, b) => a + b, 0);
  function smoke(fx, fy, x, y){
    const w = DIRS[di][1], n = Math.hypot(w[0], w[1]), wx = w[0] / n, wy = w[1] / n;
    const dx = x - fx, dy = y - fy, along = dx * wx + dy * wy, cross = Math.abs(dx * wy - dy * wx);
    if (along < -10) return Math.exp(-Math.hypot(dx, dy) / 25) * .3;
    return Math.exp(-along / 220) * Math.exp(-cross * cross / (2 * Math.pow(18 + along * .35, 2)));
  }
  function score(f){
    let hit = 0, exp = 0, walk = 0;
    POP.forEach((p, k) => { if (!p) return; const x = (k % NX) * C + C / 2, y = Math.floor(k / NX) * C + C / 2, s = smoke(f.x, f.y, x, y); exp += s * p; if (s > .25) hit += p; walk += p * Math.hypot(x - f.x, y - f.y); });
    return {hit, exp, walk: walk / homes() * 15}; // 1 像素 ≈ 15 米
  }
  function draw(){
    let s = '<rect width="600" height="340" fill="var(--paper)"/>';
    if (fac) for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const v = smoke(fac.x, fac.y, i * C + C / 2, j * C + C / 2); if (v > .06) s += '<rect x="' + i * C + '" y="' + j * C + '" width="' + C + '" height="' + C + '" fill="var(--ink)" opacity="' + Math.min(.45, v * .5).toFixed(2) + '"/>'; }
    let d = 'M0,' + ry(0).toFixed(1); for (let x = 10; x <= 600; x += 10) d += ' L' + x + ',' + ry(x).toFixed(1);
    s += '<path d="' + d + '" stroke="var(--wat)" stroke-width="18" fill="none"/>';
    POP.forEach((p, k) => { if (!p) return; const x = (k % NX) * C + C / 2, y = Math.floor(k / NX) * C + C / 2; for (let q = 0; q < Math.min(p, 4); q++) s += '<rect x="' + (x - 6 + (q % 2) * 7) + '" y="' + (y - 6 + Math.floor(q / 2) * 7) + '" width="5" height="5" fill="' + (fac && smoke(fac.x, fac.y, x, y) > .25 ? 'var(--red)' : 'var(--och)') + '" opacity=".75"/>'; });
    // 风向箭头
    const w = DIRS[di][1], n = Math.hypot(w[0], w[1]);
    s += '<g transform="translate(560,40) rotate(' + (Math.atan2(w[1], w[0]) * 180 / Math.PI) + ')"><line x1="-22" x2="16" y1="0" y2="0" stroke="var(--ink)" stroke-width="3"/><path d="M18,0 l-10,-7 v14 Z" fill="var(--ink)"/></g><text x="560" y="78" font-size="11" text-anchor="middle" fill="var(--ink)" paint-order="stroke" stroke="var(--paper)" stroke-width="3">' + DIRS[di][0] + '</text>';
    s += '<text x="500" y="' + (ry(500) + 28).toFixed(0) + '" font-size="11" fill="var(--ink-3)">下游 →</text>';
    if (fac) s += '<g transform="translate(' + fac.x + ',' + fac.y + ')"><path d="M-12,10 v-10 l8,-6 v6 l8,-6 v6 l8,-6 v16 Z" fill="var(--card)" stroke="var(--ink)" stroke-width="1.6"/><rect x="-10" y="-14" width="4" height="14" fill="var(--ink)"/></g>';
    svg.innerHTML = s;
    if (!fac) { kv($('#windKV'), [['住户', homes() + ' 户'], ['被熏到的', '—'], ['工人平均上班路', '—']]); return; }
    const r = score(fac);
    kv($('#windKV'), [['住户', homes() + ' 户'], ['被熏到的', r.hit + ' 户'], ['工人平均上班路', f1(r.walk / 1000) + ' 公里']]);
    const S = $('#windSay');
    S.className = 'say' + (r.hit > homes() * .2 ? ' bad' : r.hit < homes() * .03 ? ' ok' : '');
    S.innerHTML = r.hit > homes() * .2 ? '烟正好顺着风灌进了城里，几百户人家天天闻着味道。工人上班倒是近。' : r.hit < homes() * .03 ? '几乎没有人被熏到：工厂在城的下风处。代价是工人上班要走 ' + f1(r.walk / 1000) + ' 公里。这就是“职住分离”的起点。' : '有一部分人家在烟的下风处。往城的下风方向、再远一点挪挪试试。';
  }
  svg.addEventListener('click', e => { const p = svgPt(svg, e); fac = {x: clamp(p.x, 12, 588), y: clamp(p.y, 12, 328)}; if (Math.abs(fac.y - ry(fac.x)) < 14) fac.y += 20; draw(); });
  $('#windBest').addEventListener('click', () => {
    let best = null, bv = 1e18;
    for (let x = 20; x < 600; x += 20) for (let y = 20; y < 330; y += 20) { if (Math.abs(y - ry(x)) < 16) continue; const r = score({x, y}); const v = r.exp * 6 + r.walk * .02; if (v < bv) { bv = v; best = {x, y}; } }
    fac = best; draw();
    $('#windSay').innerHTML += '<br>墨的算法：被熏到的人越少越好，工人上班路越短越好，两者折中。他把工厂放在了<b>城的下风处、不太远的地方</b>。换个风向，再让他算一次。';
  });
  draw();
});
