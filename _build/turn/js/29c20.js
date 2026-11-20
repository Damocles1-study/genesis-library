
/* ---------- 装置 21：一个小教派怎样长大 ---------- */
dev('#growFig', fig => {
  const R = $('#gwR'), svg = $('#gwSvg'), POP = 6e7;
  const MK = [[64, '尼禄'], [112, '小普林尼'], [250, '德西乌斯'], [303, '大迫害'], [312, '君士坦丁'], [380, '国教']];
  R.addEventListener('input', go);
  function go(){
    const g = +R.value / 100;
    $('#gwO').textContent = '+' + R.value + '% / 十年';
    const pts = []; let first = {};
    for (let y = 40; y <= 400; y += 5) {
      const n = Math.min(POP * 0.9, 1000 * Math.pow(1 + g, (y - 40) / 10));
      pts.push([y, Math.log10(n)]);
      [[0.01, '1%'], [0.1, '10%'], [0.5, '50%']].forEach(t => { if (!first[t[1]] && n >= POP * t[0]) first[t[1]] = y; });
    }
    lineChart(svg, [
      {color: 'var(--ink-3)', pts: [[40, Math.log10(POP)], [400, Math.log10(POP)]], dash: '3 4', w: 1.4},
      {color: 'var(--ink-3)', pts: [[40, Math.log10(POP / 10)], [400, Math.log10(POP / 10)]], dash: '1 5', w: 1.2},
      {color: 'var(--pur)', pts, w: 3}
    ], {xmin: 40, xmax: 400, ymin: 3, ymax: 8, xt: [40, 100, 200, 300, 400], xf: v => v + ' 年', yt: [3, 4, 5, 6, 7, 8], yf: v => ['千', '万', '十万', '百万', '千万', '亿'][v - 3], marks: MK});
    const at = y => 1000 * Math.pow(1 + g, (y - 40) / 10);
    kv($('#gwKV'), [['112 年（小普林尼）', fmt(at(112))], ['250 年（德西乌斯）', fmt(at(250))], ['312 年（君士坦丁）', fmt(Math.min(at(312), POP * .9))], ['跨过一成人口', first['10%'] ? first['10%'] + ' 年' : '400 年前没有']]);
    const s312 = Math.min(at(312), POP) / POP;
    const say = $('#gwSay');
    say.className = 'say';
    say.innerHTML = '按这个速度，君士坦丁皈依的时候，基督徒约占帝国人口的 <b>' + (s312 >= .9 ? '绝大多数' : (s312 * 100 < 1 ? s312 * 100 > .1 ? (s312 * 100).toFixed(1) : '不到 0.1' : Math.round(s312 * 100)) + '%') + '</b>。' +
      (g < .3 ? '<br><small>长得太慢了：到 312 年还是一个没人注意的小团体，君士坦丁没有理由把赌注押在它身上。</small>'
        : g > .5 ? '<br><small>长得太快了：一百多年前它就该占了半个帝国，那样的话，小普林尼也不会对它那么陌生。</small>'
        : '<br><small>前两百年几乎看不见，三世纪突然冒出来，四世纪初到了十分之一上下：一个皇帝开始认真考虑的数目。</small>');
  }
  go();
});
