/* ---------- 装置 46：挤兑 ---------- */
dev('#runFig', fig => {
  const FAIL = [[1925, 618], [1926, 976], [1927, 669], [1928, 499], [1929, 659], [1930, 1350], [1931, 2293], [1932, 1453], [1933, 4000], [1934, 61], [1935, 32], [1936, 72], [1937, 84]];
  const Rr = $('#rnR'), Pp = $('#rnP');
  let ins = 0;
  btnRow($('#rnIns'), ['没有存款保险（1933 年以前）', '有存款保险（1934 年以后）'], 0, i => { ins = i; go(); });
  [Rr, Pp].forEach(e => e.addEventListener('input', go));
  $('#rnBars').innerHTML = FAIL.map(f => '<div class="row"><span class="nm">' + f[0] + (f[0] === 1933 ? '<small>含银行假日后没能重开的</small>' : f[0] === 1934 ? '<small>存款保险开始</small>' : '') + '</span><span class="tr"><i style="width:' + (f[1] / 4000 * 100) + '%;background:' + (f[0] >= 1934 ? 'var(--grn)' : f[0] >= 1930 ? 'var(--red)' : 'var(--och)') + '"></i></span><span class="v">' + f[1].toLocaleString() + '</span></div>').join('');
  function sim(r, p, ins){
    let D = 100, R = r, L = 100 - r, day = 0, failed = -1;
    const pts = [[0, R + 0.6 * L]], dep = [[0, D]];
    for (day = 1; day <= 30; day++) {
      // 每天取钱的比例：平常 1%；慌乱程度 p，再加上“看到排队”的传染（现金越少，越慌）
      let w = ins ? 0.004 + p * 0.0003 : 0.01 + p * 0.006 + 0.25 * Math.max(0, 1 - R / Math.max(r, 1)) * p / 12;
      const W = D * w; D -= W;
      if (R >= W) R -= W; else { let need = W - R; R = 0; const sell = need / 0.6; if (sell > L) { L = 0; failed = day; pts.push([day, 0]); dep.push([day, D]); break; } L -= sell; }
      // 有存款保险时，现金低于一成会向联邦借钱补足（示意）
      if (ins && R < 5) { R += 5; }
      pts.push([day, R + 0.6 * L]); dep.push([day, D]);
    }
    return {pts, dep, failed, D, R, L};
  }
  function go(){
    const r = +Rr.value, p = +Pp.value;
    $('#rnRo').textContent = r + '%'; $('#rnPo').textContent = ['', '很平静', '平静', '有点传言', '有点传言', '传言四起', '人心惶惶', '人心惶惶', '隔壁镇的银行倒了', '隔壁镇的银行倒了', '报上说要倒', '报上说要倒', '全国都在排队'][p];
    const s = sim(r, p, ins);
    const svg = $('#rnSvg');
    const c = lineChart(svg, [{color: 'var(--main)', pts: s.dep, w: 2}, {color: s.failed > 0 ? 'var(--red)' : 'var(--grn)', pts: s.pts, w: 3}],
      {H: 210, xmin: 0, xmax: 30, ymin: 0, ymax: 100, xt: [0, 5, 10, 15, 20, 25, 30], xf: v => '第 ' + v + ' 天', yt: [0, 25, 50, 75, 100], yf: v => v + ' 万', marks: s.failed > 0 ? [[s.failed, '倒闭']] : []});
    svg.innerHTML += txt(c.X(29), c.Y(s.dep[s.dep.length - 1][1]) - 8, '存户的存款', {s: 11, a: 'end', c: 'var(--main)'}) + txt(c.X(1), c.Y(s.pts[0][1]) + 16, '能拿出来的钱（现金 + 贷款六折）', {s: 11, a: 'start', c: 'var(--ink-2)'});
    kv($('#rnKV'), [['结局', s.failed > 0 ? '第 ' + s.failed + ' 天倒闭' : '撑过了三十天'], ['还剩存款', Math.round(s.D) + ' 万'], ['被取走', Math.round(100 - s.D) + ' 万']]);
    const say = $('#rnSay');
    say.className = 'say' + (s.failed > 0 ? ' bad' : ' ok');
    say.innerHTML = ins
      ? '<b>有了存款保险，存户不慌了。</b>他们知道就算银行倒了，政府也会赔（最初每户最多两千五百美元，当时绝大多数人的存款都不到这个数）。只有真正需要用钱的人才来取。<em>保险几乎不用赔钱，因为它让挤兑根本不会发生</em>。1934 年，倒闭的银行从几千家降到了几十家。'
      : s.failed > 0 ? '<b>银行倒了。</b>它的贷款也许都是好贷款，农场和商店都在按时还钱，可是贷款不能一天之内变成现金，急卖只能打折。排队的人越多，现金越少；现金越少，排队的人越多。<em>一家健康的银行，也可能被一个谣言挤垮</em>。' + (r > 25 ? '<br><small>留了这么多现金都没用：银行越安全，赚的利息越少；可是在全国恐慌的时候，留多少都不够。</small>' : '')
      : '<b>撑过去了。</b>可是这家银行为了攒现金，不敢放新的贷款，还催着农场提前还钱，农场只好便宜卖掉牲口和粮食。<em>银行保住了自己，镇上的经济却跟着缩了一圈</em>：1930 年代，全国几千家银行都在这样做。';
  }
  go();
});
