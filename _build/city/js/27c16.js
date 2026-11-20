/* ---------- 装置 17：走到公园 ---------- */
dev('#parkFig', fig => {
  // 城市 3 公里 × 1.8 公里，画成 600 × 360，1 像素 = 5 米；500 米 = 100 像素
  const W = 600, H = 360, LIM = 100, AREA = W * H * 0.06;
  const WAYS = ['一个大公园', '四个中等公园', '十六个口袋公园', '一条沿河绿带'];
  let way = 0;
  btnRow($('#parkWay'), WAYS, 0, i => { way = i; go(); });
  const R = rng(1858), HOMES = [];
  for (let i = 0; i < 900; i++) HOMES.push([R() * W, R() * H]);
  function parks(){
    if (way === 0) { const s = Math.sqrt(AREA * 1.6), h = AREA / s; return [[W / 2 - s / 2, H / 2 - h / 2, s, h]]; }
    if (way === 1) { const s = Math.sqrt(AREA / 4); return [[150, 90], [450, 90], [150, 270], [450, 270]].map(p => [p[0] - s / 2, p[1] - s / 2, s, s]); }
    if (way === 2) { const s = Math.sqrt(AREA / 16), out = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) out.push([75 + i * 150 - s / 2, 45 + j * 90 - s / 2, s, s]); return out; }
    const h = AREA / W; return [[0, H * 0.62 - h / 2, W, h]];
  }
  const dist = (p, r) => { const dx = Math.max(r[0] - p[0], 0, p[0] - r[0] - r[2]), dy = Math.max(r[1] - p[1], 0, p[1] - r[1] - r[3]); return Math.hypot(dx, dy); };
  function go(){
    const P = parks();
    let s = '<rect width="600" height="360" fill="var(--paper)"/>';
    for (let x = 0; x <= W; x += 50) s += '<line x1="' + x + '" x2="' + x + '" y1="0" y2="' + H + '" stroke="var(--rule)" stroke-width=".6"/>';
    for (let y = 0; y <= H; y += 45) s += '<line y1="' + y + '" y2="' + y + '" x1="0" x2="' + W + '" stroke="var(--rule)" stroke-width=".6"/>';
    if (way === 3) s += '<path d="M0,' + (H * 0.62) + ' C150,' + (H * 0.62 - 10) + ' 450,' + (H * 0.62 + 10) + ' 600,' + (H * 0.62) + '" stroke="var(--wat)" stroke-width="6" fill="none"/>';
    P.forEach(r => s += '<rect x="' + (r[0] - LIM).toFixed(1) + '" y="' + (r[1] - LIM).toFixed(1) + '" width="' + (r[2] + 2 * LIM).toFixed(1) + '" height="' + (r[3] + 2 * LIM).toFixed(1) + '" rx="' + LIM + '" fill="var(--grn)" fill-opacity=".07" stroke="var(--grn)" stroke-width=".8" stroke-dasharray="4 3"/>');
    P.forEach(r => s += '<rect x="' + r[0].toFixed(1) + '" y="' + r[1].toFixed(1) + '" width="' + r[2].toFixed(1) + '" height="' + r[3].toFixed(1) + '" fill="var(--grn)" fill-opacity=".5" stroke="var(--grn)" stroke-width="1.5"/>');
    let ok = 0, sum = 0;
    HOMES.forEach(h => { const d = Math.min(...P.map(r => dist(h, r))); if (d <= LIM) ok++; sum += d; s += '<circle cx="' + h[0].toFixed(1) + '" cy="' + h[1].toFixed(1) + '" r="1.7" fill="' + (d <= LIM ? 'var(--grn)' : 'var(--red)') + '" opacity=".75"/>'; });
    s += '<line x1="10" x2="110" y1="350" y2="350" stroke="var(--ink)" stroke-width="2"/><text x="114" y="354" font-size="11" fill="var(--ink)" paint-order="stroke" stroke="var(--paper)" stroke-width="3">500 米</text>';
    $('#parkSvg').innerHTML = s;
    const big = Math.max(...P.map(r => r[2] * r[3])) * 25 / 1e4;
    kv($('#parkKV'), [['五百米内能走到公园', Math.round(ok / HOMES.length * 100) + '%'], ['平均要走', Math.round(sum / HOMES.length * 5) + ' 米'], ['最大的一座公园', big >= 100 ? f1(big / 100) + ' 平方公里' : Math.round(big) + ' 公顷'], ['公园个数', P.length]]);
    $('#parkSay').innerHTML = [
      '一个大公园：大到能装下湖和树林，可只有住在它周围的人能天天去，城角的人一年去不了几次。纽约中央公园、北京颐和园都是这样的“目的地公园”。',
      '四个中等公园：每一座都还够大，能跑步、能野餐，覆盖的人多了不少。',
      '十六个口袋公园：几乎人人出门几分钟就能走到一块绿地，可每一块都只有篮球场那么大，装不下湖、装不下树林，也很难给鸟留地方。',
      '沿河绿带：一条又长又窄的绿地，沿岸的人都能走到，还能连成一条跑步、骑车的长路。可离河远的人还是够不着。'
    ][way] + '<br>真实城市往往几样都要：一两座大公园，若干中等公园，再加上满城的小绿地和沿河绿带。';
  }
  go();
});
