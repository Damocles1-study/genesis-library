/* ---------- 装置 4：拉石头 ---------- */
dev('#hlFig', () => {
  const STONES = [['金字塔平均一块', 2.5], ['巨石阵砂岩', 25], ['杰胡蒂霍特普雕像', 58], ['故宫大石料', 250], ['巴勒贝克三巨石之一', 800], ['阿斯旺方尖碑', 1090]];
  const SURF = [['干沙', 0.45], ['湿沙', 0.2], ['木轨抹泥', 0.12], ['冰面', 0.03]];
  let s = 1;
  btnRow($('#hlBtns'), STONES.map(x => x[0]), 2, i => { $('#hlM').value = STONES[i][1]; $('#hlM').dispatchEvent(new Event('input')); });
  btnRow($('#hlSurf'), SURF.map(x => x[0]), s, i => { s = i; draw(); });
  const M = slider('hlM', v => v + ' 吨', () => draw());
  const A = slider('hlA', v => v + '°', () => draw());
  const F = slider('hlF', v => v + ' 牛', () => draw());
  function draw(){
    const m = M() * 1000, a = A() * Math.PI / 180, mu = SURF[s][1];
    const force = m * 9.8 * (mu * Math.cos(a) + Math.sin(a));
    const n = Math.ceil(force / F());
    const svg = $('#hlSvg'), W = 600, H = 150;
    const tilt = -A() * 2; // 画面上夸张一点
    let g = '<g transform="rotate(' + tilt + ' 300 120)">';
    g += '<line x1="0" x2="600" y1="122" y2="122" stroke="' + (s === 3 ? 'var(--blu)' : 'var(--kraft)') + '" stroke-width="4"/>';
    const sz = 16 + Math.cbrt(M()) * 6;
    g += '<rect x="' + (520 - sz) + '" y="' + (114 - sz) + '" width="' + sz + '" height="' + sz + '" fill="var(--ink-3)" fill-opacity=".5" stroke="var(--ink-2)"/><rect x="' + (516 - sz) + '" y="114" width="' + (sz + 8) + '" height="6" fill="var(--kraft)"/>';
    const show = Math.min(n, 160), cols = Math.ceil(show / 4), gap = Math.min(10, (500 - sz - 30) / Math.max(cols, 1));
    g += '<line x1="' + (510 - sz - cols * gap) + '" x2="' + (516 - sz) + '" y1="104" y2="104" stroke="var(--ink-2)" stroke-width="1.2"/>';
    for (let i = 0; i < show; i++) { const c = Math.floor(i / 4), r = i % 4, x = 506 - sz - c * gap, y = 98 + (r - 1.5) * 7; g += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.6" fill="var(--ter)"/>'; }
    if (s === 1) g += '<path d="M' + (512 - sz) + ',100l6 14" stroke="var(--blu)" stroke-width="2" stroke-dasharray="2 2"/>';
    g += '</g>';
    if (n > show) g += txt(80, 30, '（只画了 ' + show + ' 个人，实际要 ' + fmt(n) + ' 人）', {s: 12, a: 'start', c: 'var(--ink-2)'});
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    kv($('#hlKv'), [['要的拉力', (force / 1000).toFixed(force < 1e4 ? 1 : 0) + ' 千牛'], ['最少人数', fmt(n) + ' 人'], ['摩擦系数', mu]]);
    const dry = Math.ceil(m * 9.8 * (0.45 * Math.cos(a) + Math.sin(a)) / F());
    $('#hlSay').innerHTML = '拉动 ' + M() + ' 吨的石头，在' + SURF[s][0] + '上' + (A() ? '、' + A() + '° 的坡上' : '') + '，至少要 <b>' + fmt(n) + '</b> 人一起使劲。' +
      (s > 0 && dry > n ? '换成干沙要 ' + fmt(dry) + ' 人：那个泼水（或泼冰）的人，一个人顶 ' + fmt(dry - n) + ' 个拉绳子的。' : '') +
      (Math.abs(M() - 58) < 1 && s === 2 ? ' 壁画上画了约一百七十个人，和这个数字差不多。' : '') +
      (A() >= 8 ? ' 坡一陡，重量本身往下溜的那部分很快超过了摩擦：修坡道和拉石头一样费人。' : '');
  }
  draw();
});
