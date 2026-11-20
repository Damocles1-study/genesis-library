/* ---------- 装置 29：高铁通了以后（哈夫模型） ---------- */
dev('#huffFig', fig => {
  const T = $('#huffT'), OWN = $('#huffOwn');
  [T, OWN].forEach(e => e.addEventListener('input', go)); OWN.addEventListener('change', go);
  function go(){
    const t = +T.value, own = OWN.checked;
    $('#huffTO').textContent = t + ' 分钟';
    const AB = 60, AS = own ? 14 : 6, tS = 15, lam = 2;
    const uB = AB / Math.pow(t, lam), uS = AS / Math.pow(tS, lam);
    const pB = uB / (uB + uS);
    // 溢出：省城上班的人里，愿意住到柳渡的比例（通勤一小时以内才可能），房价差越大越多
    const spill = t > 75 ? 0 : (own ? .12 : .05) * (1 - t / 75) * 100;
    const local = (1 - pB) * 100;
    // 画
    const gap = 60 + (t - 20) / 180 * 380;
    const xs = 300 - gap / 2, xb = 300 + gap / 2;
    let s = '<line x1="' + xs + '" x2="' + xb + '" y1="75" y2="75" stroke="var(--ink-3)" stroke-width="3"' + (t <= 60 ? '' : ' stroke-dasharray="6 5"') + '/>';
    s += '<text x="300" y="66" font-size="11" text-anchor="middle" fill="var(--ink-3)">' + (t <= 60 ? '高铁 ' : '路上 ') + t + ' 分钟</text>';
    s += '<circle cx="' + xs + '" cy="75" r="24" fill="var(--och)" fill-opacity=".3" stroke="var(--och)" stroke-width="2"/><text x="' + xs + '" y="80" font-size="13" text-anchor="middle" fill="var(--ink)">柳渡</text>';
    s += '<circle cx="' + xb + '" cy="75" r="46" fill="var(--main)" fill-opacity=".2" stroke="var(--main)" stroke-width="2"/><text x="' + xb + '" y="80" font-size="14" text-anchor="middle" fill="var(--ink)">省城</text>';
    // 箭头：消费流向省城，人口溢出流向柳渡
    const w1 = 1 + pB * 10, w2 = 1 + spill * .8;
    s += '<path d="M' + (xs + 26) + ',58 Q300,' + (40 - pB * 20) + ' ' + (xb - 48) + ',58" fill="none" stroke="var(--red)" stroke-width="' + w1.toFixed(1) + '" opacity=".7"/><text x="300" y="' + (30 - pB * 20 + 6) + '" font-size="10" text-anchor="middle" fill="var(--red)">消费、看病被吸走</text>';
    if (spill > 0) s += '<path d="M' + (xb - 48) + ',94 Q300,' + (115 + spill) + ' ' + (xs + 26) + ',94" fill="none" stroke="var(--grn)" stroke-width="' + w2.toFixed(1) + '" opacity=".75"/><text x="300" y="' + Math.min(146, 128 + spill) + '" font-size="10" text-anchor="middle" fill="var(--grn)">搬来柳渡住</text>';
    $('#huffSvg').innerHTML = s;
    kv($('#huffKV'), [['柳渡人的大件消费在本地', Math.round(local) + '%'], ['被省城吸走', Math.round(pB * 100) + '%'], ['省城上班族搬来柳渡住', spill > 0 ? f1(spill) + '%' : '几乎没有']]);
    $('#huffSay').innerHTML = t > 120 ? '路远的时候，柳渡人去一趟省城要大半天，大部分东西就在本地买、病就在本地看。柳渡的商场和医院过得不错，只是选择少。'
      : t > 60 ? '路程缩短，越来越多的柳渡人周末去省城。本地的大商场开始冷清。'
      : '一小时以内：' + (pB > .6 ? '柳渡人的大件消费大半被省城吸走了，这就是“虹吸”。' : '') + '同时，开始有省城上班的人搬来柳渡住，这是“溢出”。' + (own ? '柳渡有了自己的长处，留住了更多的消费，吸引来更多的人。吸管和水管，方向取决于两头的压力。' : '勾上“柳渡有自己的长处”，看看会不会不一样。');
  }
  go();
});
