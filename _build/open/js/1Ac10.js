/* ---------- 装置 11：订阅的天花板 ---------- */
dev('#subFig', fig => {
  const svg = $('#sbSvg'), kvb = $('#sbKv'), say = $('#sbSay');
  const g = {}; let ready = false;
  function draw(){
    if (!ready) return;
    const c = g.c / 100, net = g.p * (1 - g.k / 100);
    let u = 0; const pts = [[0, 0]];
    for (let m = 1; m <= 36; m++) { u = u * (1 - c) + g.n; pts.push([m, u]); }
    const cap = g.n / c;
    const ymax = Math.max(cap, u) * 1.1;
    const step = ymax > 2000 ? 1000 : ymax > 800 ? 200 : ymax > 200 ? 100 : 20;
    const yt = []; for (let v = 0; v <= ymax; v += step) yt.push(v);
    const ch = lineChart(svg, [{pts: pts, color: 'var(--ter)', w: 2.6}], {xmin: 0, xmax: 36, ymin: 0, ymax: ymax, xt: [0, 6, 12, 18, 24, 30, 36], xf: v => v + ' 月', yt: yt, yf: v => v + ' 人', H: 240, L: 54});
    svg.insertAdjacentHTML('beforeend', '<line x1="' + ch.L + '" x2="' + (ch.W - ch.R) + '" y1="' + ch.Y(cap) + '" y2="' + ch.Y(cap) + '" stroke="var(--main)" stroke-dasharray="5 4" stroke-width="1.5"/>' + txt(ch.W - ch.R - 4, ch.Y(cap) - 6, '天花板 ' + Math.round(cap) + ' 人', {s: 12, a: 'end', c: 'var(--main)'}));
    const u12 = pts[12][1], u36 = pts[36][1];
    kv(kvb, [['第 12 个月', Math.round(u12) + ' 人 · ' + yuan(u12 * net) + ' / 月'], ['第 36 个月', Math.round(u36) + ' 人 · ' + yuan(u36 * net) + ' / 月'], ['天花板', Math.round(cap) + ' 人 · ' + yuan(cap * net) + ' / 月'], ['用户平均待', (1 / c).toFixed(1) + ' 个月']]);
    let s = '每月新来 ' + g.n + ' 人、走掉 ' + g.c + '%，付费用户最后会停在约 ' + Math.round(cap) + ' 人，月收入约 ' + yuan(cap * net) + '。';
    s += c >= 0.15 ? ' 流失这么快，说明很多人试了就走：先别急着拉新，弄清楚他们为什么走。' : ' 把流失率从 ' + g.c + '% 降到一半，天花板就翻一倍，这常常比多拉一倍新用户便宜。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('sbN', v => { g.n = v; return v + ' 人'; }, go);
  slider('sbC', v => { g.c = v; return v + '%'; }, go);
  slider('sbP', v => { g.p = v; return v + ' 元'; }, go);
  slider('sbK', v => { g.k = v; return v + '%'; }, go);
  ready = true; draw();
});
