
/* ---------- 装置 20：罗马城的粮船 ---------- */
dev('#grainFig', fig => {
  const SHIP = [['一万莫迪的船（约 70 吨）', 70], ['中型货船（约 150 吨）', 150], ['大粮船（约 400 吨）', 400], ['传说中的“伊西斯号”（上千吨）', 1100]];
  let ship = 1;
  const R = $('#grR');
  btnRow($('#grBtns'), SHIP.map(s => s[0]), ship, i => { ship = i; go(); });
  R.addEventListener('input', go);
  function go(){
    const pop = +R.value * 1e4, perKg = 200, season = 180;
    $('#grO').textContent = (pop / 1e4) + ' 万人';
    const tons = pop * perKg / 1000;                  // 一年要多少吨小麦
    const dole = 200000 * 5 * 6.5 * 12 / 1000;          // 二十万人、每月五莫迪（每莫迪约 6.5 公斤）
    const cap = SHIP[ship][1], trips = tons / cap, perDay = trips / season;
    kv($('#grKV'), [['一年要小麦', fmt(tons) + ' 吨'], ['其中免费发放', fmt(dole) + ' 吨'], ['船次', fmt(trips) + ' 船'], ['航海季每天进港', perDay.toFixed(1) + ' 船']]);
    const n = Math.min(300, Math.round(perDay));
    $('#grPx').innerHTML = Array.from({length: n}, (_, i) => '<span style="background:' + (i % 3 === 2 ? 'var(--main)' : 'var(--och)') + ';border-color:transparent"></span>').join('');
    const say = $('#grSay');
    say.innerHTML = '免费粮约占全城口粮的 <b>' + Math.round(dole / tons * 100) + '%</b>，剩下的要从市场上买，也几乎全靠海运。' +
      (perDay >= 10 ? '<br><small>每天要有十几二十条船进港卸货、转驳、沿着台伯河拖进城。船晚到半个月，城里的粮价就会飞涨，接着就是骚乱。</small>' : perDay < 2 ? '<br><small>大船少跑，看上去省事；可一条大船沉了，就是全城好几天的口粮。所以皇帝要替商人承担沉船的损失。</small>' : '') +
      (pop >= 1e6 ? '<br><small>一千七百年后，伦敦才长到一百万人，那时候的英国，也已经开始从海外进口粮食了。</small>' : '');
  }
  go();
});
