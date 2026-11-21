/* ---------- 装置 30：利息吃掉多少税 ---------- */
dev('#debtFig3', fig => {
  const PRE = [
    ['查理二世，1672', 10, 30, '国王的信用：赖过账的国王，借钱要一成以上的利息。同样拿出三成的税付利息，只借得到三年的税收。然后他宣布“国库停付”，信用更差了。'],
    ['英格兰银行，1694', 8, 35, '有了议会担保，利息降到八厘。九年战争靠这样的借款撑了下来。'],
    ['沃波尔时代，1730', 4, 40, '南海泡沫以后，利率继续往下走。'],
    ['统一公债，1752', 3, 45, '三厘的永续国债。同样的税，能借到的钱是查理二世时代的好几倍。七年战争（第三十一章）就是这样打的。'],
    ['法国，1788', 7, 50, '法国国王的税收比英国多，可借钱的利息高得多（终身年金实际要付得更多）。到 1788 年，利息已经吃掉了一半左右的税收，国库撑不下去，只好召开一百七十五年没开过的三级会议。']
  ];
  const R = $('#dbR3'), S = $('#dbS3'), svg = $('#dbSvg3');
  let note = '';
  btnRow($('#dbBtns3'), PRE.map(p => p[0]), -1, i => { R.value = PRE[i][1]; S.value = PRE[i][2]; note = PRE[i][3]; go(true); });
  R.addEventListener('input', () => { note = ''; go(); }); S.addEventListener('input', () => { note = ''; go(); });
  function go(){
    const r = +R.value / 100, s = +S.value / 100, years = s / r;
    $('#dbR3o').textContent = (+R.value).toFixed(1) + '%'; $('#dbS3o').textContent = Math.round(s * 100) + '%';
    // 曲线：利率 → 能借到几年的税收
    const pts = []; for (let x = 2; x <= 14; x += .25) pts.push([x, s / (x / 100)]);
    const c = lineChart(svg, [{color: 'var(--main)', pts, w: 2.6}], {H: 220, xmin: 2, xmax: 14, ymin: 0, ymax: 35, xt: [2, 4, 6, 8, 10, 12, 14], xf: v => v + '%', yt: [0, 10, 20, 30], yf: v => v + ' 年'});
    svg.innerHTML += '<circle cx="' + c.X(r * 100) + '" cy="' + c.Y(Math.min(35, years)) + '" r="6" fill="var(--ter)"/>' + txt(c.X(r * 100) + 10, c.Y(Math.min(35, years)) - 8, years.toFixed(1) + ' 年的税', {s: 12.5, a: 'start', w: true});
    kv($('#dbKV3'), [['利率', (r * 100).toFixed(1) + '%'], ['付利息的税', Math.round(s * 100) + '%'], ['能借到', years.toFixed(1) + ' 年的税收'], ['每借 100 镑，每年付', (r * 100).toFixed(1) + ' 镑']]);
    const say = $('#dbSay3');
    say.className = 'say' + (years >= 12 ? ' ok' : years < 4 ? ' bad' : '');
    say.innerHTML = (note ? note + '<br>' : '') + '<small>打一场大仗，常常要花掉好几年的税收。利率从 10% 降到 3%，同样一份税能撑起的债，大了 ' + (10 / 3).toFixed(1) + ' 倍。十八世纪英国的国债总额，常常是一年税收的十几倍，法国的国债没那么多，却先撑不住了。</small>';
  }
  go();
});
