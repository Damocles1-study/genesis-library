
/* ---------- 装置 23：存钱率和自由的年份 ---------- */
dev('#fireFig', fig => {
  const svg = $('#frSvg'), kvb = $('#frKv'), say = $('#frSay');
  let ready = false;
  const years = (s, r, w) => {
    if (s <= 0) return Infinity;
    const target = (1 - s) / w; let v = 0;
    for (let y = 1; y <= 80; y++) { v = v * (1 + r) + s; if (v >= target) return y; }
    return Infinity;
  };
  function go(){
    if (!ready) return;
    const S = gS() / 100, r = gR() / 100, w = gW() / 100;
    const pts = []; for (let k = 5; k <= 90; k += 5) { const y = years(k / 100, r, w); pts.push([k, isFinite(y) ? Math.min(y, 60) : 60]); }
    const my = years(S, r, w);
    const g = lineChart(svg, [{name: '要工作的年数', color: 'var(--up)', pts, dots: true}], {xmin: 5, xmax: 90, ymin: 0, ymax: 62, xt: [10, 30, 50, 70, 90], xf: x => x + '%', yt: [0, 15, 30, 45, 60], yf: v => v + '年', H: 220});
    if (isFinite(my) && my <= 60) svg.insertAdjacentHTML('beforeend', '<circle cx="' + g.X(S * 100) + '" cy="' + g.Y(my) + '" r="7" fill="none" stroke="var(--main)" stroke-width="2.5"/>' + txt(g.X(S * 100), g.Y(my) - 13, '你', {s: 13, w: true, c: 'var(--main)'}));
    kv(kvb, [['你的存钱率', Math.round(S * 100) + '%'], ['要攒够', (1 / w).toFixed(0) + ' 倍年开销'], ['要工作', isFinite(my) ? my + ' 年' : '六十年以上'], ['每年开销占收入', Math.round((1 - S) * 100) + '%']]);
    let s = '存下 ' + Math.round(S * 100) + '% 的收入，按实际年收益 ' + (r * 100).toFixed(1) + '%、取款率 ' + (w * 100).toFixed(1) + '%，' + (isFinite(my) ? '大约要工作 ' + my + ' 年才算“够了”。' : '六十年也攒不够。');
    s += ' 曲线左边很陡：存钱率从一成提到三成，省下的年数比从五成提到七成多得多。';
    if (w >= 0.04) s += ' 取款率 ' + (w * 100).toFixed(1) + '% 来自美国二十世纪的历史数据，在回报更低的地方未必稳妥，可以试试 3%。';
    s += ' 这张图回答的是“能不能”，不回答“值不值”：后者取决于你在这些年里放弃了什么、换来了什么。';
    say.textContent = s;
  }
  const gS = slider('frS', v => v + '%', go), gR = slider('frR', v => v + '%', go), gW = slider('frW', v => v + '%', go);
  ready = true; go();
});
