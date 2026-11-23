/* ---------- 装置 10：徭役撞上农忙 ---------- */
dev('#yyFig', () => {
  const NEED = [8, 12, 45, 62, 55, 76, 45, 40, 68, 76, 30, 10]; // 每月地里要的工（人日）
  const MN = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
  const NOTE = {2: '春播', 5: '麦收、夏种', 9: '秋收', 8: '秋收'};
  const AV = 78; // 三个大人 × 每月 26 天
  /* [名字, 天数, 人数] */
  const K = [['不服役', 0, 0], ['更卒：一人一个月', 30, 1], ['两人各一个月', 30, 2], ['大工程：一人三个月', 90, 1], ['戍边：一人一年', 365, 1]];
  let k = 1;
  btnRow($('#yyBtns'), K.map(x => x[0]), k, i => { k = i; draw(); });
  const M = slider('yyM', v => MN[v - 1], () => draw());
  function draw(){
    const [, days, men] = K[k], start = M() - 1;
    const away = new Array(12).fill(0);
    let left = days;
    for (let m = 0; m < 12 && left > 0; m++) { const idx = (start + m) % 12, d = Math.min(26, left * 26 / 30); away[idx] = d * men; left -= 30; }
    let short = 0, wshort = 0;
    const total = NEED.reduce((a, b) => a + b, 0);
    const rows = NEED.map((n, i) => { const av = Math.max(0, AV - away[i]), s = Math.max(0, n - av); short += s; wshort += s * n / 50; return [n, av, s]; });
    $('#yyBars').innerHTML = rows.map((r, i) => '<div class="row"><span class="nm">' + MN[i] + (NOTE[i] ? '<small>' + NOTE[i] + '</small>' : '') + '</span><span class="tr">' +
      '<i style="width:' + (r[0] / 90 * 100) + '%;background:var(--ink-3);opacity:.45"></i>' +
      '<i style="width:' + (Math.min(r[1], r[0]) / 90 * 100) + '%;background:var(--blu)"></i>' +
      (r[2] ? '<i style="left:' + ((r[0] - r[2]) / 90 * 100) + '%;width:' + (r[2] / 90 * 100) + '%;background:var(--red)"></i>' : '') +
      '</span><span class="v">' + (r[2] ? '缺 ' + Math.round(r[2]) : '够') + '</span></div>').join('');
    const loss = Math.min(90, wshort / total * 100 * 1.2);
    kv($('#yyKv'), [['离家的工', Math.round(away.reduce((a, b) => a + b, 0)) + ' 个'], ['地里缺的工', Math.round(short) + ' 个'], ['收成大约少', Math.round(loss) + '%']]);
    $('#yySay').className = 'say' + (loss > 15 ? ' bad' : loss < 1 ? ' ok' : '');
    $('#yySay').innerHTML = k === 0 ? '不服役：一年里家里的人手只在麦收和秋收时紧一点，勉强够用。' :
      loss < 1 ? '落在农闲：人走了，地里的活还顾得过来。古人说“使民以时”“不违农时”，说的就是把役派在这几个月。' :
      '撞上了' + (NOTE[rows.findIndex(r => r[2] > 0)] || '忙月') + '：地里缺 ' + Math.round(short) + ' 个工，收成大约要少 ' + Math.round(loss) + '%。' + (loss > 25 ? '<b>一家人第二年的口粮就悬了</b>。秦朝的役重，重在时间长，也重在不挑时候。' : '少的这一块，常常就是交完租税后剩下的那一点。');
  }
  draw();
});
