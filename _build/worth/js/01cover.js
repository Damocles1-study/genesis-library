
/* ---------- 封面装置：十年，五百二十个格子 ---------- */
dev('#wkFig', fig => {
  const grid = $('#wkGrid'), say = $('#wkSay');
  grid.innerHTML = '<i></i>'.repeat(520);
  const cells = $$('i', grid);
  const COL = [['睡觉', 'var(--blu)'], ['上班', 'var(--ink-2)'], ['通勤', 'var(--och)'], ['吃饭家务', 'var(--kraft)'], ['刷手机', 'var(--red)'], ['自己支配', 'var(--grn)']];
  const v = {};
  const go = () => {
    const day = [v.s, v.w / 7, v.c / 60 * 5 / 7, v.e, v.p];
    const used = day.reduce((a, b) => a + b, 0);
    const free = Math.max(0, 24 - used);
    const parts = [...day, free].map(h => h / Math.max(24, used));
    const wk = parts.map(p => p * 520);
    let acc = 0, idx = 0; const bounds = wk.map(w => (acc += w));
    cells.forEach((c, i) => { while (idx < 5 && i + 0.5 > bounds[idx]) idx++; c.style.background = COL[idx][1]; c.style.opacity = idx === 5 ? 1 : .78; });
    $('#wkLeg').innerHTML = COL.map((c, i) => '<span><i style="background:' + c[1] + '"></i>' + c[0] + ' ' + Math.round(wk[i]) + ' 周</span>').join('');
    const phoneH = v.p * 3652;
    say.className = 'say' + (used > 24 ? ' bad' : '');
    say.innerHTML = used > 24 ? '这样排，一天要 <b>' + used.toFixed(1) + '</b> 个小时，已经超过 24 了：多出来的部分，实际上是从睡觉里偷的。' :
      '十年里真正由你自己支配的时间，大约是 <b>' + Math.round(wk[5]) + ' 周</b>，也就是每天 <b>' + free.toFixed(1) + '</b> 小时。刷手机这一块是 <b>' + Math.round(wk[4]) + ' 周</b>，约 ' + fmt(phoneH) + ' 小时。' +
      (v.p >= 1 ? '每天少刷一小时，十年能多出约 <b>' + Math.round(3652 / 24 / 7) + ' 周</b>醒着的时间，够学会一门外语的入门，或者从头读完二三十本厚书。' : '') +
      (v.c >= 90 ? ' 通勤占了 ' + Math.round(wk[2]) + ' 周：搬家、换工作时，这一项常常被低估。' : '');
  };
  [['wkS', 's', x => x + ' 小时'], ['wkW', 'w', x => x + ' 小时'], ['wkC', 'c', x => x + ' 分钟'], ['wkE', 'e', x => x + ' 小时'], ['wkP', 'p', x => x + ' 小时']].forEach(a => slider(a[0], a[2], x => { v[a[1]] = x; if (Object.keys(v).length === 5) go(); }));
});
