
/* ---------- 装置 9：假账侦探 ---------- */
dev('#fraudFig', fig => {
  const tab = $('#frTab'), say = $('#frSay');
  // [科目, 三年数字, 是否红灯, 解释]
  const R = [
    ['营业收入', '20 / 26 / 34', 0, '每年涨三成，单看是好事，本身不是红灯。'],
    ['净利润', '3.0 / 4.2 / 5.9', 0, '利润涨得比收入还快，要结合下面几行看。'],
    ['经营活动现金流净额', '2.8 / 1.5 / 0.6', 1, '利润从 3 亿涨到 5.9 亿，收进来的现金却从 2.8 亿掉到 0.6 亿：赚的“钱”没有变成现金。这是最重要的红灯。'],
    ['应收账款', '4 / 8 / 15', 1, '收入涨了七成，应收账款涨了将近三倍：货“卖”出去了，钱没收回来。'],
    ['存货', '5.0 / 5.5 / 6.0', 0, '随收入温和增长，正常。'],
    ['货币资金 / 有息借款', '30·25 / 42·35 / 55·48', 1, '账上现金越来越多，借的钱也越来越多：“存贷双高”。真有五十五亿现金，为什么要借四十八亿付利息？康美的破绽就在这里。'],
    ['毛利率（同行约 25%）', '46% / 48% / 51%', 1, '卖食品的同行毛利两成五，它五成，而且越卖越高：要么有独门绝技，要么数字有问题。'],
    ['销售费用率', '8% / 8% / 8%', 0, '稳定，没什么可说的。'],
    ['现金分红', '0.9 / 1.2 / 1.6', 0, '分红本身是好事，不是红灯；不过现金流这么少还分这么多，钱从哪来，值得再问一句。'],
    ['会计师事务所', '甲所 / 乙所 / 丙所', 1, '三年换了三家审计机构，常见的原因是前一家不愿意签“标准无保留意见”。'],
    ['大股东股权质押比例', '30% / 60% / 85%', 1, '大股东把八成五的股票押给了别人借钱：他很缺钱，股价一跌就可能被强平，有强烈的动机“维护”股价和利润。']
  ];
  function draw(show){
    tab.innerHTML = '<thead><tr><th>可疑？</th><th>科目</th><th>三年（亿元）</th>' + (show ? '<th>揭晓</th>' : '') + '</tr></thead><tbody>' + R.map((r, i) => {
      const ck = $('#fr' + i) ? $('#fr' + i).checked : false;
      const mark = show ? (r[2] ? (ck ? '✔ 抓到了' : '✘ 漏了') : (ck ? '△ 冤枉了' : '')) : '';
      return '<tr' + (show && r[2] ? ' style="background:var(--hl)"' : '') + '><td><input type="checkbox" id="fr' + i + '"' + (ck ? ' checked' : '') + (show ? ' disabled' : '') + '></td><td>' + r[0] + '</td><td style="font-family:var(--f-mono);white-space:nowrap">' + r[1] + '</td>' + (show ? '<td style="font-size:13.5px;line-height:1.6;min-width:14em"><b>' + mark + '</b> ' + r[3] + '</td>' : '') + '</tr>';
    }).join('') + '</tbody>';
  }
  draw(false);
  $('#frGo').addEventListener('click', () => {
    const picks = R.map((r, i) => $('#fr' + i).checked);
    const hit = R.filter((r, i) => r[2] && picks[i]).length, miss = R.filter((r, i) => r[2] && !picks[i]).length, fp = R.filter((r, i) => !r[2] && picks[i]).length, tot = R.filter(r => r[2]).length;
    draw(true);
    say.className = 'say ' + (hit >= 5 && fp <= 1 ? 'ok' : 'bad');
    say.textContent = '六个红灯，你抓到 ' + hit + ' 个，漏了 ' + miss + ' 个，冤枉了 ' + fp + ' 个正常的科目。' + (hit === tot && fp === 0 ? '全对。真实的年报里，这些数字分散在几十页里，要自己去找、去对。' : '最关键的一行是“经营活动现金流”：利润可以做，现金很难做。') + ' 这家公司的所有数字放在一起，像极了几起真实的造假案；可单看利润表，它是一只完美的成长股。';
  });
  $('#frRe').addEventListener('click', () => { R.forEach((r, i) => { const c = $('#fr' + i); if (c) c.checked = false; }); draw(false); say.className = 'say'; say.textContent = ''; });
});
