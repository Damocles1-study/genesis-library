
/* ---------- 装置 20：买还是租 ---------- */
dev('#rentFig', fig => {
  const svg = $('#rtSvg'), kvb = $('#rtKv'), say = $('#rtSay');
  let ready = false;
  function sim(P, dp, ir, yld, g, rg, r, N){
    const L = P * (1 - dp), mi = ir / 12, n = 360;
    const pay = L > 0 ? (mi > 0 ? L * mi / (1 - Math.pow(1 + mi, -n)) : L / n) : 0;
    let bal = L, price = P, rent = P * yld / 12, inv = P * dp + P * 0.03; // 租房者把首付和买入成本拿去投资
    let buyerInv = 0; const rm = r / 12; const ptsB = [[0, P - L - P * 0.03]], ptsR = [[0, inv]];
    for (let m = 1; m <= N * 12; m++) {
      const interest = bal * mi; bal = Math.max(0, bal - (pay - interest));
      price *= Math.pow(1 + g, 1 / 12);
      const own = pay + price * 0.008 / 12;
      inv *= 1 + rm; buyerInv *= 1 + rm;
      const diff = own - rent;
      if (diff > 0) inv += diff; else buyerInv += -diff;
      if (m % 12 === 0) { rent *= 1 + rg; const y = m / 12; ptsB.push([y, price - bal + buyerInv - (y === N ? price * 0.03 : 0)]); ptsR.push([y, inv]); }
    }
    return {buy: ptsB[ptsB.length - 1][1], rent: ptsR[ptsR.length - 1][1], ptsB, ptsR, pay};
  }
  function go(){
    if (!ready) return;
    const P = gP() * 1e4, dp = gD() / 100, ir = gI() / 100, yld = gY() / 100, g = gG() / 100, rg = gRg() / 100, r = gR() / 100, N = gN();
    const s0 = sim(P, dp, ir, yld, g, rg, r, N);
    let lo = -0.1, hi = 0.2; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2, t = sim(P, dp, ir, yld, m, rg, r, N); (t.buy > t.rent) ? hi = m : lo = m; }
    const all = s0.ptsB.concat(s0.ptsR).map(p => p[1]), ymin = Math.min(0, ...all), ymax = Math.max(...all) * 1.08;
    lineChart(svg, [{name: '买', color: 'var(--up)', pts: s0.ptsB}, {name: '租', color: 'var(--blu)', pts: s0.ptsR}], {xmin: 0, xmax: N, ymin, ymax, xt: [0, Math.round(N / 2), N], xf: x => x + '年', yt: [ymin, (ymin + ymax) / 2, ymax].map(v => Math.round(v / 1e4) * 1e4), yf: v => fmt(v), H: 220, L: 56});
    const d = s0.buy - s0.rent;
    kv(kvb, [['月供', Math.round(s0.pay).toLocaleString() + ' 元'], ['买：' + N + ' 年后净资产', yuan(s0.buy)], ['租：' + N + ' 年后净资产', yuan(s0.rent)], ['房价每年要涨', (hi * 100).toFixed(1) + '% 才打平']]);
    let s = '住 ' + N + ' 年，' + (d >= 0 ? '买房的一边多出 ' + yuan(d) : '租房的一边多出 ' + yuan(-d)) + '（只算钱）。';
    s += ' 按这组假设，房价要每年涨约 ' + (hi * 100).toFixed(1) + '%，买房才和租房打平。';
    if (yld < ir) s += ' 租金回报率 ' + (yld * 100).toFixed(1) + '% 低于房贷利率 ' + (ir * 100).toFixed(1) + '%，买房的人每年都在多付一截，要靠涨价补回来。';
    if (N <= 4) s += ' 住得越短，买卖两头的交易成本越吃亏。';
    s += ' 这张账里没有户口、学区、安稳和搬家的麻烦，它们要你自己加上去。';
    say.textContent = s;
  }
  const gP = slider('rtP', v => v + ' 万', go), gD = slider('rtD', v => v + '%', go), gI = slider('rtI', v => v.toFixed(1) + '%', go), gY = slider('rtY', v => v.toFixed(1) + '%', go), gG = slider('rtG', v => (v > 0 ? '+' : '') + v + '%', go), gRg = slider('rtRg', v => (v > 0 ? '+' : '') + v + '%', go), gR = slider('rtR', v => v + '%', go), gN = slider('rtN', v => v + ' 年', go);
  ready = true; go();
});
