/* ---------- 装置 34：纺一百磅棉花要多少小时 ---------- */
dev('#spinFig', fig => {
  // 卡特林的估算（工时 / 100 磅棉花）
  const D = [
    ['印度手纺', '十八世纪', 50000, '印度的手纺工人技术极好，能纺出最细的纱，可一个人一年也纺不了多少。'],
    ['克朗普顿骡机', '1780 年', 2000, '一架手摇的骡机，几十个纺锭。工时一下子掉到印度手纺的二十五分之一。'],
    ['一百锭骡机', '1790 年', 1000, '纺锭越来越多，一个工人照看的锭子越来越多。'],
    ['动力骡机', '1795 年', 300, '用水力或者蒸汽带动，工人只需要接断头、换纱管。'],
    ['罗伯茨自动骡机', '1825 年', 135, '理查德·罗伯茨的“自动骡机”，连纱线卷绕都自动了。工厂主们用它来对付罢工的熟练纺纱工。'],
    ['二十世纪的环锭纺', '1990 年代', 40, '今天的数字。']
  ];
  let k = 1;
  const svg = $('#snSvg');
  btnRow($('#snBtns'), D.map(d => d[0]), k, i => { k = i; go(); });
  function go(){
    const W = 600, rowH = 30, H = D.length * rowH + 30, L = 130, R = 70;
    const lx = v => L + Math.log10(v / 20) / Math.log10(50000 / 20) * (W - L - R);
    let g = '';
    [100, 1000, 10000].forEach(v => g += '<line x1="' + lx(v) + '" x2="' + lx(v) + '" y1="4" y2="' + (H - 22) + '" stroke="var(--rule)"/>' + txt(lx(v), H - 6, v.toLocaleString() + ' 小时', {s: 10.5, c: 'var(--ink-3)', halo: false}));
    D.forEach((d, i) => {
      const y = 8 + i * rowH, on = i === k;
      g += txt(L - 8, y + 15, d[0], {s: 12.5, a: 'end', c: on ? 'var(--ink)' : 'var(--ink-2)', w: on});
      g += '<rect x="' + L + '" y="' + y + '" width="' + (lx(d[2]) - L) + '" height="20" rx="3" fill="' + (on ? 'var(--ter)' : i === 0 ? 'var(--och)' : 'var(--main)') + '" fill-opacity="' + (on ? 1 : .55) + '"/>';
      g += txt(lx(d[2]) + 6, y + 15, d[2].toLocaleString(), {s: 12, a: 'start', c: 'var(--ink-2)'});
    });
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const d = D[k], x = D[0][2] / d[2];
    // 工钱：印度手纺工一天约 0.5 便士（示意），兰开夏工人一天约 12—18 便士
    const costIn = D[0][2] / 10 * 0.5, costHere = k === 0 ? costIn : d[2] / 12 * 15;
    kv($('#snKV'), [['工时', d[2].toLocaleString() + ' 小时'], ['比印度手纺快', x < 1.5 ? '—' : Math.round(x) + ' 倍'], ['人工（示意）', Math.round(costHere / 12) + ' 先令'], ['印度手纺人工（示意）', Math.round(costIn / 12) + ' 先令']]);
    const say = $('#snSay');
    say.className = 'say' + (k >= 3 ? ' ok' : '');
    say.innerHTML = d[1] + '：' + d[3] + (k > 0 && k < 5 ? '<br><small>英国工人的日工资是印度纺纱工的二三十倍（示意）。' + (costHere < costIn ? '可工时少了这么多，英国纱的人工反而更便宜了：这就是兰开夏打败印度手工纺织业的算术。' : '工时虽然少了，可英国人的工钱太高，人工还是比印度贵：要再快一些，才能打败印度。') + '</small>' : '');
  }
  go();
});
