/* ---------- 装置 41：代表怎么分（1790 年普查） ---------- */
dev('#seatFig', fig => {
  // [州, 自由人（千）, 被奴役者（千）, 南方?]（1790 年普查，取整）
  const S = [['弗吉尼亚', 455, 293, 1], ['宾夕法尼亚', 431, 4, 0], ['马萨诸塞', 379, 0, 0], ['北卡罗来纳', 293, 101, 1], ['纽约', 319, 21, 0], ['马里兰', 217, 103, 1],
    ['南卡罗来纳', 142, 107, 1], ['康涅狄格', 235, 3, 0], ['新泽西', 173, 11, 0], ['新罕布什尔', 142, 0, 0], ['佛蒙特', 86, 0, 0], ['佐治亚', 53, 29, 1],
    ['肯塔基', 61, 12, 1], ['罗得岛', 68, 1, 0], ['特拉华', 50, 9, 1]];
  const N = 105;
  const MODES = [['只算自由人', s => s[1]], ['奴隶算五分之三（宪法）', s => s[1] + s[2] * 3 / 5], ['奴隶全算（南方想要的）', s => s[1] + s[2]], ['每州一样（参议院）', s => 1]];
  function apportion(f){
    const pop = S.map(f), tot = pop.reduce((a, b) => a + b, 0);
    const q = pop.map(p => p / tot * N); let seat = q.map(x => Math.max(1, Math.floor(x)));
    let left = N - seat.reduce((a, b) => a + b, 0);
    const order = q.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]);
    for (let k = 0; left > 0; k = (k + 1) % order.length) { seat[order[k][1]]++; left--; }
    while (left < 0) { const i = seat.indexOf(Math.max(...seat)); seat[i]--; left++; }
    return seat;
  }
  const base = apportion(MODES[0][1]);
  let mode = 1;
  btnRow($('#stMode'), MODES.map(m => m[0]), mode, i => { mode = i; go(); });
  function go(){
    const seat = mode === 3 ? (() => { const s = S.map(() => 7); return s; })() : apportion(MODES[mode][1]);
    const tot = seat.reduce((a, b) => a + b, 0);
    const south = seat.reduce((a, v, i) => a + (S[i][3] ? v : 0), 0);
    const ev = seat.map(v => v + 2), evS = ev.reduce((a, v, i) => a + (S[i][3] ? v : 0), 0), evT = ev.reduce((a, b) => a + b, 0);
    const mx = Math.max(...seat);
    $('#stBars').innerHTML = S.map((s, i) => '<div class="row"><span class="nm">' + s[0] + '<small>' + (s[2] >= 10 ? '被奴役者 ' + s[2] + ' 千' : '自由人 ' + s[1] + ' 千') + '</small></span><span class="tr"><i style="width:' + (seat[i] / Math.max(mx, 1) * 100) + '%;background:' + (s[3] ? 'var(--red)' : 'var(--main)') + '"></i></span><span class="v">' + seat[i] + (mode !== 3 && seat[i] !== base[i] ? ' <small>(' + (seat[i] > base[i] ? '+' : '') + (seat[i] - base[i]) + ')</small>' : '') + '</span></div>').join('');
    kv($('#stKV'), [[mode === 3 ? '参议院式：每州相同（示意）' : '众议院席位', tot + ' 席'], ['南方的份额', Math.round(south / tot * 100) + '%'], ['南方的总统选举人票', evS + ' / ' + evT]]);
    const say = $('#stSay');
    say.className = 'say' + (mode === 1 || mode === 2 ? ' bad' : '');
    say.innerHTML = [
      '<b>只按能投票的“自由人”算</b>，南方的席位约占四成。这是北方的一些代表想要的算法：既然你们说奴隶是财产，财产就不该有代表。括号里的数字，是和这种算法相比多出来的席位。',
      '<b>宪法的算法</b>：每五个被奴役的人算三个人。被奴役的人自己没有一票，<em>可他们的人数让他们的主人多得了席位</em>。在总数不变的情况下，南方因此从北方手里拿走了好几个席位（如果像实际那样按比例增加总席位，多出来的就有十几个），选总统时也多了同样多的选举人票。1800 年杰斐逊赢得大选，靠的正是这多出来的票。',
      '<b>南方代表最初想要的是全算</b>：既然奴隶是南方财富和劳动的主要部分，就应该全部计入。如果这样，南方会占将近一半的席位。北方不肯，于是有了“五分之三”这个讨价还价的数字。',
      '<b>参议院</b>：每州两席，不论大小。这里为了和众议院对比，按每州七席示意。人口七万多的特拉华和七十多万的弗吉尼亚，在参议院里一样大。<em>小州守住了参议院，南方守住了五分之三</em>：费城那个夏天的两个大妥协，都写在这张表里。'][mode];
  }
  go();
});
