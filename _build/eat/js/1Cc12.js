/* ---------- 装置 13：今天这一杯 ---------- */
dev('#cfFig', () => {
  /* [名字, 小注, 咖啡因毫克, 添加糖克] */
  const I = [
    ['美式咖啡', '大杯', 225, 0], ['加糖拿铁', '大杯，加一泵糖浆', 150, 20], ['奶茶', '500 毫升，全糖', 150, 50], ['可乐', '一罐 330 毫升', 34, 35],
    ['能量饮料', '一罐 250 毫升', 80, 27], ['瓶装冰红茶', '500 毫升', 20, 45], ['绿茶', '一杯，自己泡', 30, 0], ['红茶', '一杯，自己泡', 47, 0],
    ['黑巧克力', '50 克', 40, 15], ['牛奶巧克力', '50 克', 10, 25], ['一块奶油蛋糕', '', 0, 30]
  ];
  const n = I.map(() => 0);
  const box = $('#cfList');
  function list(){ box.innerHTML = I.map((x, i) => '<div class="cd' + (n[i] ? ' on' : '') + '" data-i="' + i + '" role="button" tabindex="0" style="cursor:pointer"><b>' + x[0] + (n[i] ? ' ×' + n[i] : '') + '</b><small>' + (x[1] ? x[1] + ' · ' : '') + '咖啡因约 ' + x[2] + ' 毫克 · 糖约 ' + x[3] + ' 克</small></div>').join(''); }
  box.addEventListener('click', e => { const c = e.target.closest('.cd'); if (!c) return; n[+c.dataset.i] = (n[+c.dataset.i] + 1) % 5; draw(); });
  box.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const c = e.target.closest('.cd'); if (c) { e.preventDefault(); n[+c.dataset.i] = (n[+c.dataset.i] + 1) % 5; draw(); } } });
  $('#cfClear').addEventListener('click', () => { n.fill(0); draw(); });
  n[2] = 1;
  function draw(){
    list();
    const caf = I.reduce((a, x, i) => a + x[2] * n[i], 0), sug = I.reduce((a, x, i) => a + x[3] * n[i], 0);
    bars($('#cfBars'), [['咖啡因', caf, '参考上限 400 毫克', caf > 400 ? 'var(--red)' : 'var(--main)'], ['添加糖', sug, '建议少于 50 克，最好少于 25', sug > 50 ? 'var(--red)' : sug > 25 ? 'var(--och)' : 'var(--grn)']], Math.max(400, caf, sug * 8) , v => Math.round(v));
    $$('#cfBars .row')[1].querySelector('i').style.width = clamp(sug / 50 * 50, 0, 100) + '%';
    $$('#cfBars .row')[0].querySelector('i').style.width = clamp(caf / 400 * 50, 0, 100) + '%';
    $$('#cfBars .row .v')[0].textContent = caf + ' 毫克'; $$('#cfBars .row .v')[1].textContent = sug + ' 克';
    const tsp = sug / 4;
    $('#cfSay').innerHTML = !caf && !sug ? '点上面的卡片，记下今天喝了什么。' :
      '一共约 <b>' + caf + ' 毫克咖啡因</b>、<b>' + sug + ' 克添加糖</b>（约 ' + tsp.toFixed(0) + ' 小勺）。' +
      (sug >= 50 ? '糖已经到了一天的建议上限。十八世纪初一个英国人平均一年只吃几磅糖，一天不到五克；你今天这些，够他吃' + Math.round(sug / 5) + ' 天。' : sug > 25 ? '糖在“最好少于 25 克”和“少于 50 克”之间。' : '') +
      (caf > 400 ? '咖啡因超过了健康成年人的一般参考上限，可能心慌、睡不着。' : caf > 200 ? '咖啡因不算少，下午三四点以后再喝，可能影响晚上的睡眠。' : '') +
      '（条的中点是参考上限。）';
  }
  draw();
});
