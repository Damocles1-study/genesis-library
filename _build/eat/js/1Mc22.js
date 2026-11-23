/* ---------- 装置 23：多一杯奶茶 ---------- */
dev('#ktFig', () => {
  const PRE = [['每天多一杯全糖奶茶', 300], ['每天多一罐可乐', 140], ['每天少吃半碗饭', -120], ['每天少吃五百', -500]];
  const E = slider('ktE', v => (v > 0 ? '+' : '') + v + ' 千卡', () => draw());
  btnRow($('#ktP'), PRE.map(p => p[0]), -1, i => { $('#ktE').value = PRE[i][1]; $('#ktEO').textContent = (PRE[i][1] > 0 ? '+' : '') + PRE[i][1] + ' 千卡'; draw(); });
  const TAU = 1.3;   // 年
  function draw(){
    const e = E(), fin = e / 22;
    const dyn = [], naive = [];
    for (let m = 0; m <= 36; m++) { const t = m / 12; dyn.push([m, fin * (1 - Math.exp(-t / TAU))]); naive.push([m, e * t * 365 / 7700]); }
    const lim = Math.max(25, Math.abs(naive[36][1]) * 1.05);
    lineChart($('#ktChart'), [{pts: naive, color: 'var(--ink-3)', w: 1.8, dash: '5 4'}, {pts: dyn, color: 'var(--main)', w: 2.8}], {xmin: 0, xmax: 36, ymin: e >= 0 ? 0 : -lim, ymax: e >= 0 ? lim : 0, xt: [0, 6, 12, 18, 24, 30, 36], yt: e >= 0 ? [0, 10, 20, 40, 60, 80].filter(v => v <= lim) : [0, -10, -20, -40, -60, -80].filter(v => v >= -lim), xf: v => v ? v + ' 月' : '0', yf: v => (v > 0 ? '+' : '') + v + 'kg', H: 230, L: 52});
    kv($('#ktKv'), [['一年后（流行算法）', (naive[12][1] > 0 ? '+' : '') + naive[12][1].toFixed(1) + ' kg'], ['一年后（动态）', (dyn[12][1] > 0 ? '+' : '') + dyn[12][1].toFixed(1) + ' kg'], ['三年后（动态）', (dyn[36][1] > 0 ? '+' : '') + dyn[36][1].toFixed(1) + ' kg'], ['最终停在', (fin > 0 ? '+' : '') + fin.toFixed(1) + ' kg']]);
    $('#ktSay').innerHTML = !e ? '吃的和消耗的一样多，体重不变。' :
      e > 0 ? '流行算法说三年会胖 ' + naive[36][1].toFixed(0) + ' 公斤，一直胖下去；动态算法说会慢慢多出约 <b>' + fin.toFixed(1) + ' 公斤</b>，然后停住。少了吓人的数字，但一杯一杯的小账，几年下来是实打实的几公斤。' :
      '流行算法说三年能瘦 ' + (-naive[36][1]).toFixed(0) + ' 公斤；动态算法说大约瘦 <b>' + (-fin).toFixed(1) + ' 公斤</b>就停住了，而且越往后越慢。很多人在第二三个月觉得“没效果了”而放弃，其实只是身体在找新的平衡。';
  }
  draw();
});
