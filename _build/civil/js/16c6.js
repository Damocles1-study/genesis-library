
/* ---------- 装置 7：知县的账本 ---------- */
dev('#zxFig', fig => {
  const TYPES = [['简缺', 600, 150, 120], ['中缺', 1000, 260, 220], ['繁缺', 1800, 450, 400]]; // 名字, 养廉, 摊捐, 过境招待
  let ty = 0;
  btnRow($('#zxType'), TYPES.map(t => t[0]), 0, i => { ty = i; calc(); });
  const M = $('#zxM'), S = $('#zxS'), G = $('#zxG'), L = $('#zxL');
  const MN = ['只请刑名', '刑名、钱谷', '加一位书启', '再加账房', '再加征比'];
  const MF = [360, 330, 120, 100, 100]; // 每位束脩（两）
  const GN = ['不送（危险）', '照常', '厚一点', '很厚'];
  [M, S, G].forEach(x => x.addEventListener('input', calc)); L.addEventListener('change', calc);
  function calc(){
    const t = TYPES[ty], m = +M.value, s = +S.value, g = +G.value;
    $('#zxMO').textContent = MN[m - 1]; $('#zxSO').textContent = s + ' 人'; $('#zxGO').textContent = GN[g];
    const mufee = MF.slice(0, m).reduce((a, b) => a + b, 0) * (ty === 2 ? 1.5 : ty === 1 ? 1.2 : 1);
    const inc = [['正俸', 45], ['养廉银', t[1]], ['公费', 60]];
    const lou = Math.round(t[1] * 1.3 + 300);
    if (L.checked) inc.push(['陋规', lou]);
    const out = [['师爷束脩', Math.round(mufee)], ['长随工食', s * 24], ['三节两寿', [40, 220, 420, 700][g] * (1 + ty * 0.5)], ['摊捐', t[2]], ['过境招待', t[3]], ['家用', 150]];
    const I = inc.reduce((a, b) => a + b[1], 0), O = out.reduce((a, b) => a + b[1], 0);
    const mx = Math.max(I, O, 1);
    bars($('#zxIn'), inc.map(r => [r[0], r[1], '', r[0] === '陋规' ? 'var(--red)' : 'var(--grn)']), mx * 0.6, v => Math.round(v) + ' 两');
    bars($('#zxOut'), out.map(r => [r[0], r[1], '', 'var(--zhu)']), mx * 0.6, v => Math.round(v) + ' 两');
    const d = I - O, say = $('#zxSay');
    let warn = '';
    if (m === 1) warn += '只请一位师爷，钱粮账交给书吏去算，等于把账房钥匙交给了最想动它的人。';
    if (s < 8) warn += '长随太少，门上、签押、管班都排不开，书吏差役没人盯着。';
    if (g === 0) warn += '一份节礼都不送，下次考核“卓异”还是“不及”，你心里有数。';
    say.className = 'say ' + (d >= 0 ? 'ok' : 'bad');
    say.innerHTML = '一年入 <b>' + Math.round(I) + '</b> 两，出 <b>' + Math.round(O) + '</b> 两，' + (d >= 0 ? '结余 ' + Math.round(d) + ' 两。' : '<b>亏 ' + Math.round(-d) + ' 两</b>。') +
      (L.checked ? (d >= 0 ? '账平了。代价是这 ' + lou + ' 两银子每一文都从百姓身上来，而且没有任何账本记着。' : '收了陋规还亏，你的排场大概太大了。') :
        (d < 0 ? '不收陋规的话，这个窟窿只能借钱填。三年下来，你会欠一屁股债离任。' : '不收陋规也能平账？那多半是你把师爷、长随、节礼都压到了危险的程度。')) + (warn ? '<br>' + warn : '');
  }
  calc();
});
