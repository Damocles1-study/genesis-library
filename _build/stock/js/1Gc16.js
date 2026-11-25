
/* ---------- 装置 17：本金、存钱和收益率 ---------- */
dev('#learnFig', fig => {
  const svg = $('#lnSvg'), kvb = $('#lnKv'), say = $('#lnSay');
  let ready = false;
  const fv = (P, S, r, Y) => { const m = r / 12; let v = P; const pts = [[0, v]]; for (let k = 1; k <= Y * 12; k++) { v = v * (1 + m) + S; if (k % 12 === 0) pts.push([k / 12, v]); } return pts; };
  function go(){
    if (!ready) return;
    const P = gP() * 1e4, S = gS(), r = gR() / 100, Y = gY();
    const base = fv(P, S, r, Y), hi = fv(P, S, r + 0.02, Y), more = fv(P, S + 1000, r, Y);
    const B = base[Y][1], H = hi[Y][1], M = more[Y][1], put = P + S * 12 * Y;
    const ymax = Math.max(H, M) * 1.08;
    lineChart(svg, [
      {name: '基准', color: 'var(--ink-2)', pts: base},
      {name: '收益率+2点', color: 'var(--och)', pts: hi, dash: '5 3'},
      {name: '每月多存一千', color: 'var(--up)', pts: more}
    ], {xmin: 0, xmax: Y, ymin: 0, ymax, xt: [0, Math.round(Y / 2), Y], xf: x => x + '年', yt: [0, ymax / 2, ymax], yf: v => fmt(v), H: 220, L: 52});
    kv(kvb, [['自己投进去的', yuan(put)], ['基准：' + Y + ' 年后', yuan(B)], ['收益率多 2 个点', '+' + yuan(H - B)], ['每月多存一千', '+' + yuan(M - B)]]);
    const win = (M - B) > (H - B) ? '每月多存一千块' : '收益率多两个点';
    let s = Y + ' 年后，' + win + '多出来的更多。';
    s += ' 基准情况下，最后的 ' + yuan(B) + ' 里，' + Math.round(put / B * 100) + '% 是你自己存进去的，只有 ' + Math.round((B - put) / B * 100) + '% 是收益。';
    s += (M - B) > (H - B) ? ' 本金小、时间短的时候，钱主要是“存”出来的，不是“赚”出来的；而多存一千块是你能做主的，多两个点收益率不是。' : ' 本金大、时间长以后，收益率的作用开始超过存钱：复利需要时间和本金一起才能发力。';
    say.textContent = s;
  }
  const gP = slider('lnP', v => v + ' 万', go), gS = slider('lnS', v => v.toLocaleString() + ' 元', go), gR = slider('lnR', v => v + '%', go), gY = slider('lnY', v => v + ' 年', go);
  ready = true; go();
});
