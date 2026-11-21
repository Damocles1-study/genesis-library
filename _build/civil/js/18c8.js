
/* ---------- 装置 9：买一个法国的官 ---------- */
dev('#venFig', fig => {
  const TY = [
    {n: '国王秘书', yld: 0.012, noble: 20, d: '几乎不用干活，收入很少，任满二十年全家成为世袭贵族。'},
    {n: '高等法院推事', yld: 0.03, noble: 40, d: '体面的法官，收入一般，有“诉讼礼金”；两代人任职后家族可得贵族身份（这里简化为四十年）。'},
    {n: '收税官', yld: 0.07, noble: 0, d: '要干活，收入高（按征收额抽成），不给贵族头衔。'}
  ];
  let ty = 0, seed = 1;
  btnRow($('#venType'), TY.map(t => t.n), 0, i => { ty = i; });
  const Y = $('#venY'); const yo = () => $('#venYO').textContent = Y.value + ' 年'; Y.addEventListener('input', yo); yo();
  $('#venGo').addEventListener('click', () => {
    const t = TY[ty], r = rng(seed++ * 31 + ty), paul = $('#venP').checked;
    let nobleY = 0, y = +Y.value, age = 30, holder = 1, got = 0, paid = 0, noble = false, held = 0, lines = [], lost = false;
    const P = 10000;
    lines.push(y + '：' + age + ' 岁，买下「' + t.n + '」，付 10,000。' + t.d);
    while (y < 1790) {
      y++; age++; held++;
      got += P * t.yld;
      if (paul) paid += P / 60;
      if (t.noble && !noble && held >= t.noble) { noble = true; nobleY = y; lines.push(y + '：任满 ' + t.noble + ' 年，全家成为世袭贵族，免交达伊税。'); }
      const pd = age < 50 ? 0.012 : age < 65 ? 0.03 : 0.08;
      if (r() < pd) {
        if (!paul && r() < 0.85) { lines.push(y + '：第 ' + holder + ' 代持有人突然去世，没交保莱特税，又没来得及在死前四十天办转让。官位收归国王。'); lost = true; break; }
        holder++; lines.push(y + '：持有人去世，' + (paul ? '因为年年交了保莱特税，' : '幸好提前办了转让，') + '官位传给儿子（第 ' + holder + ' 代）。'); age = 30 + Math.floor(r() * 5); if (t.noble && !noble) held = Math.floor(held * 0.5);
      }
    }
    let back = 0;
    if (!lost) {
      lines.push('1789：八月四日夜，国民议会宣布废除特权和卖官制度。官位按价赎回。');
      // 以指券赎回；假设在 1791—1796 年间逐步花掉，实际价值平均只剩约三成
      back = P * 0.3;
      lines.push('1791—1796：拿到指券面值 10,000，可指券一路贬值，最后实际能买到的东西约合 ' + Math.round(back).toLocaleString() + '。' + (noble ? '贵族头衔也一起废了。' : ''));
    }
    const net = got + back - P - paid;
    $('#venLog').textContent = lines.join('\n');
    kv($('#venKv'), [['持有', (lost ? '中途失去' : '到 1789 年') + ' · ' + holder + ' 代'], ['官位收入', Math.round(got).toLocaleString()], ['保莱特税', Math.round(paid).toLocaleString()], ['赎金实值', Math.round(back).toLocaleString()], ['净账', (net >= 0 ? '+' : '') + Math.round(net).toLocaleString()]]);
    const say = $('#venSay');
    say.className = 'say ' + (net >= 0 ? 'ok' : 'bad');
    say.innerHTML = (lost ? '<b>一场急病，几十年的积蓄归了国王。</b>这就是保莱特税存在的理由：每年交一点钱，买的是“死得不凑巧”的保险。' :
      net >= 0 ? '这笔买卖赚了。' + (ty === 2 ? '收税官收益高，可也最招人恨：大革命里，收税的人是第一批被清算的。' : '你买得早，吃到了几十年的收益。') :
      '账面上亏了。' + (ty === 0 ? (noble ? '可你本来就不是为了钱：你买的是“贵族”两个字，它在你家挂了 ' + (1789 - nobleY) + ' 年。' : '二十年还没满，贵族没当上，革命先来了。') : '买得越晚，离 1789 年越近，回本的时间越少。'));
  });
});
