
/* ---------- 装置 26：体制内外的总账 ---------- */
dev('#totFig', fig => {
  const A = $('#toA'), B = $('#toB'), G = $('#toG'), R = $('#toR');
  const RN = ['几乎没有', '很低', '低', '偏低', '中等', '中等', '偏高', '高', '很高', '极高', '赌一把'];
  const f = () => { $('#toAO').textContent = (+A.value).toLocaleString() + ' 元/月'; $('#toBO').textContent = (+B.value).toLocaleString() + ' 元/月'; $('#toGO').textContent = '每年 ' + G.value + '%'; $('#toRO').textContent = RN[+R.value]; };
  [A, B, G, R].forEach(x => x.addEventListener('input', f)); f();
  const disc = y => Math.pow(1.03, -y);
  function run(){
    const a = +A.value, b = +B.value, g = +G.value / 100, risk = +R.value;
    // 体制内：确定路径
    let pvA = 0, w = a * 12;
    for (let y = 0; y < 30; y++) { pvA += w * (1 + 0.12 + 0.24) * disc(y); w *= 1.035; }
    // 私企：一千条路径
    const r = rng(b + g * 1000 + risk * 7), out = [];
    for (let k = 0; k < 1000; k++) {
      let pv = 0, wb = b * 12, age = 23, cut = false;
      for (let y = 0; y < 30; y++, age++) {
        const shock = r() < 0.02 + risk * 0.012;          // 失业或大幅降薪
        const gr = (age >= 35 ? g * (1 - risk * 0.07) : g) + (r() - 0.5) * 0.12;
        let earn = wb;
        if (shock) { earn = wb * (0.3 + r() * 0.4); wb *= 0.85 + r() * 0.1; }
        if (!cut && age >= 38 && r() < risk * 0.006) { cut = true; wb *= 0.6; }   // 中年以后转行或长期降薪
        pv += earn * (1 + 0.07 + 0.16) * disc(y);
        wb = Math.max(b * 12 * 0.5, wb * (1 + gr));
      }
      out.push(pv);
    }
    out.sort((x, y) => x - y);
    const p10 = out[100], p50 = out[500], p90 = out[900];
    const beat = out.filter(x => x > pvA).length / 10;
    const mx = Math.max(pvA, p90) * 1.05 / 1e4;
    bars($('#toBars'), [['体制内', pvA / 1e4, '几乎确定', 'var(--main)'], ['私企 · 差', p10 / 1e4, '运气差的十分之一', 'var(--kraft)'], ['私企 · 中', p50 / 1e4, '一半人在这以上', 'var(--kraft)'], ['私企 · 好', p90 / 1e4, '运气好的十分之一', 'var(--kraft)']], mx, v => '约 ' + Math.round(v) + ' 万');
    const s = $('#toSay');
    s.innerHTML = '折成今天的钱，三十年总报酬：体制内约 <b>' + Math.round(pvA / 1e4) + ' 万</b>；私企中间情况约 <b>' + Math.round(p50 / 1e4) + ' 万</b>，范围从约 ' + Math.round(p10 / 1e4) + ' 万到约 ' + Math.round(p90 / 1e4) + ' 万。一千种人生里，私企有 <b>' + beat.toFixed(0) + '%</b> 超过了体制内。' +
      (beat > 85 ? '<br>在这组设定下，私企大概率更多。体制内那条线的价值主要在“确定”二字上。' : beat < 40 ? '<br>在这组设定下，算上单位缴费和风险，体制内反而大概率不吃亏。<b>月薪差距在总账里被吃掉了一大块</b>。' : '<br>两边势均力敌。这时候，真正该比的是右边那栏：时间、成长、自由和你喜欢做什么。');
  }
  $('#toGo').addEventListener('click', run); run();
});
