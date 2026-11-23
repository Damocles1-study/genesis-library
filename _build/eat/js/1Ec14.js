/* ---------- 装置 15：夹得住吗 ---------- */
dev('#csFig', () => {
  const MAT = [['竹木', 0.45], ['塑料', 0.3], ['光面不锈钢', 0.16], ['带纹的不锈钢', 0.28]];
  /* [食物, 克, 滑度系数, 最多受得了的力（牛），无上限记 0] */
  const FOOD = [['花生米', 1, 0.9, 0], ['红烧肉', 30, 0.7, 0], ['鹌鹑蛋', 10, 0.45, 0], ['一筷子粉丝', 20, 0.4, 0], ['嫩豆腐', 15, 0.7, 0.35]];
  let m = 0, f = 2;
  const G = slider('csG', v => v + '% 处', () => draw());
  btnRow($('#csM'), MAT.map(x => x[0]), 0, i => { m = i; draw(); });
  btnRow($('#csF'), FOOD.map(x => x[0]), 2, i => { f = i; draw(); });
  function draw(){
    const d = G() / 100, food = FOOD[f], mu = MAT[m][1] * food[2];
    const W = food[1] / 1000 * 9.8, tip = W / (2 * mu), finger = tip / d;
    const svg = $('#csSvg');
    const x0 = 40, x1 = 560, y0 = 70, yt = 46;
    const fx = x0 + (x1 - x0) * d;
    let g = '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + yt + '" stroke="var(--kraft)" stroke-width="6" stroke-linecap="round"/>' +
      '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + (y0 + 28) + '" stroke="var(--kraft)" stroke-width="6" stroke-linecap="round"/>' +
      '<circle cx="' + x0 + '" cy="' + y0 + '" r="9" fill="none" stroke="var(--ink)" stroke-width="2"/>' + txt(x0, y0 + 30, '虎口（支点）', {s: 12}) +
      '<path d="M' + fx + ',' + (yt + (y0 - yt) * (1 - d) - 26) + 'l0,18" stroke="var(--red)" stroke-width="3" marker-end="url(#csA)"/>' + txt(fx, yt + (y0 - yt) * (1 - d) - 32, '手指 ' + finger.toFixed(1) + ' 牛', {s: 12, c: 'var(--red)'}) +
      '<circle cx="' + (x1 + 4) + '" cy="' + ((yt + y0 + 28) / 2) + '" r="' + (6 + Math.sqrt(food[1]) * 2) + '" fill="var(--och)" fill-opacity=".8"/>' + txt(x1 - 10, (yt + y0 + 28) / 2 + 40, food[0], {s: 12, a: 'end'});
    svg.setAttribute('viewBox', '0 0 600 130');
    svg.innerHTML = '<defs><marker id="csA" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--red)"/></marker></defs>' + g;
    kv($('#csKv'), [['尖端要夹的力', tip.toFixed(2) + ' 牛'], ['手指要用的力', finger.toFixed(2) + ' 牛'], ['相当于提起', Math.round(finger / 9.8 * 1000) + ' 克的东西']]);
    const fragile = food[3] && tip > food[3];
    $('#csSay').innerHTML = fragile ? '夹豆腐要的力已经超过了豆腐受得了的力：<b>一夹就碎</b>。这时候该换勺子，或者把筷子平着伸到底下托。' :
      finger > 1.5 ? '手指要用很大的力，夹久了手会酸，稍一松就掉。试试换双竹木筷子，或者握得离尖端近一点（滑块往右）。' :
      finger > 0.6 ? '夹得住，但要用点力。光滑的金属筷子配上滑溜的东西，是很多人到了韩国餐馆才发现的难题。' :
      '轻轻一夹就住了。握得越靠前，越省力，但能张开的口子越小；握得靠后，口子大，但费力。会用筷子的人，会随手调整位置。';
  }
  draw();
});
