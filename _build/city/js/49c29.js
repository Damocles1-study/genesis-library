/* ---------- 装置 30：一万年，三十层 ---------- */
dev('#allFig', fig => {
  const R = $('#allR');
  const YEARS = ['约前 7000', '约前 3200', '约前 2000', '约前 500', '约 100', '约 800', '约 1100', '约 1500', '约 1700', '约 1860', '约 1870', '约 1880', '约 1900', '约 1910', '约 1920', '约 1930', '约 1930', '约 1950', '约 1960', '约 1990', '约 1995', '约 2000', '约 2003', '约 2005', '约 2008', '约 2012', '约 2015', '约 2018', '约 2021', '今天'];
  function show(i){
    const ch = TOC.find(x => x.id === 'c' + i);
    $('#allO').textContent = YEARS[i];
    drawTown($('#allTown'), i);
    $('#allSay').innerHTML = '<b>第 ' + (i + 1) + ' 层 · ' + ch.n + ' · ' + ch.t + '</b>　' + ch.s + '<br><a href="' + href(ch.id) + '">回到这一章 →</a>';
  }
  R.addEventListener('input', () => show(+R.value));
  show(29);
});
