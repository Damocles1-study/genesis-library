
/* ---------- 装置 10：一千个散户的一年 ---------- */
dev('#crowdFig', fig => {
  const svg = $('#crSvg'), kvb = $('#crKv'), say = $('#crSay');
  let seed = 2027, ready = false;
  function go(){
    if (!ready) return;
    const M = gM() / 100, K = gK(), C = gC() / 100, r = rng(seed), N = 1000, vals = [];
    for (let i = 0; i < N; i++) {
      // 不交易的人拿到市场收益加一点个股差异；每次交易带来一个独立的随机“运气”
      let x = M + gauss(r) * 0.12;
      const luck = Math.sqrt(K) * 0.03 * gauss(r);
      x += luck - K * C;
      vals.push(Math.max(-0.95, x));
    }
    vals.sort((a, b) => a - b);
    const beat = vals.filter(v => v > M).length, top = vals[N - 1], med = vals[N / 2], loss = vals.filter(v => v < 0).length;
    const lo = Math.max(-1, Math.min(...vals, M) - 0.05), hi = Math.max(...vals, M) + 0.05, bins = 30, cnt = new Array(bins).fill(0);
    vals.forEach(v => cnt[clamp(Math.floor((v - lo) / (hi - lo) * bins), 0, bins - 1)]++);
    const W = 600, H = 220, L = 30, B = 28, mx = Math.max(...cnt), X = v => L + (v - lo) / (hi - lo) * (W - L - 10), bw = (W - L - 10) / bins;
    let g = '';
    cnt.forEach((c, i) => { const v = lo + (i + 0.5) / bins * (hi - lo); g += '<rect x="' + (L + i * bw + 1) + '" y="' + (H - B - c / mx * (H - B - 14)) + '" width="' + (bw - 2) + '" height="' + (c / mx * (H - B - 14)) + '" fill="' + (v >= M ? 'var(--up)' : 'var(--dn)') + '" opacity=".75"/>'; });
    g += '<line x1="' + X(M) + '" x2="' + X(M) + '" y1="8" y2="' + (H - B) + '" stroke="var(--main)" stroke-width="2"/>' + txt(X(M) + 4, 18, '市场 ' + pc(M, 0), {s: 12, a: 'start', c: 'var(--main)', w: true});
    g += '<line x1="' + L + '" x2="' + (W - 10) + '" y1="' + (H - B) + '" y2="' + (H - B) + '" stroke="var(--ink)"/>';
    [lo, (lo + hi) / 2, hi].forEach(v => g += txt(X(v), H - 9, pc(v, 0), {s: 11, c: 'var(--ink-3)', halo: false}));
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    kv(kvb, [['跑赢市场', beat + ' 人'], ['亏钱', loss + ' 人'], ['中位数', pc(med)], ['最好的那个人', '<span class="up">' + pc(top) + '</span>']]);
    let s = '一千个毫无本事的人，' + beat + ' 个跑赢了市场。';
    s += K > 0 ? ' 交易费用平均扣掉了 ' + (K * C * 100).toFixed(1) + ' 个百分点，所以中位数比市场低。' : ' 一次都不交易，大家只是拿着各自的股票，中位数接近市场。';
    s += ' 最好的那个人赚了 ' + pc(top) + '：' + (K >= 40 ? '他交易得越多，运气的波动越大，第一名就越耀眼，可他和最后一名一样没有本事。' : '如果他去开一个直播间，会有很多人跟。');
    say.textContent = s;
  }
  const gM = slider('crM', v => (v > 0 ? '+' : '') + v + '%', go), gK = slider('crK', v => v + ' 次', go), gC = slider('crC', v => v.toFixed(2) + '%', go);
  $('#crRe').addEventListener('click', () => { seed += 17; go(); });
  ready = true; go();
});
