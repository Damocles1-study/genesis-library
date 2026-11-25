
/* ---------- 第二部封面装置：一年的收益是怎样被拆掉的 ---------- */
dev('#gapFig', fig => {
  const svg = $('#gpSvg'), say = $('#gpSay');
  let ready = false;
  function go(){
    if (!ready) return;
    const M = gM(), T = gT(), C = gC(), B = gB();
    const fee = T * C, beh = B * 0.5, pick = T * 0.15; // 选股：换手越多，与更快的对手交易越多，平均越吃亏（示意）
    const steps = [['市场涨', M, 'm'], ['交易费用', -fee, 'd'], ['追涨杀跌', -beh, 'd'], ['选股（平均）', -pick, 'd'], ['你拿到', M - fee - beh - pick, 'm']];
    const W = 600, H = 250, L = 40, R = 10, T0 = 16, B0 = 40;
    const vals = [0, M, M - fee, M - fee - beh, M - fee - beh - pick];
    const lo = Math.min(0, ...vals) - 2, hi = Math.max(0, ...vals) + 2;
    const Y = v => T0 + (1 - (v - lo) / (hi - lo)) * (H - T0 - B0), bw = (W - L - R) / steps.length;
    let g = '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="var(--ink)" stroke-width="1.2"/>';
    let run = 0;
    steps.forEach((s, i) => {
      const x = L + i * bw + bw * 0.15, w = bw * 0.7;
      let a, b;
      if (s[2] === 'm') { a = 0; b = s[1]; run = s[1]; } else { a = run; b = run + s[1]; run = b; }
      const col = s[2] === 'm' ? (s[1] >= 0 ? 'var(--up)' : 'var(--dn)') : 'var(--ink-3)';
      g += '<rect x="' + x + '" y="' + Math.min(Y(a), Y(b)) + '" width="' + w + '" height="' + Math.max(1.5, Math.abs(Y(a) - Y(b))) + '" fill="' + col + '" opacity="' + (s[2] === 'm' ? 1 : .55) + '"/>';
      g += txt(x + w / 2, Math.min(Y(a), Y(b)) - 6, (s[1] > 0 ? '+' : '') + s[1].toFixed(1) + '%', {s: 12, w: true});
      g += txt(x + w / 2, H - 18, s[0], {s: 12, c: 'var(--ink-2)', halo: false});
    });
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const net = M - fee - beh - pick;
    let t = '市场涨了 ' + M + '%，你拿到 ' + net.toFixed(1) + '%。';
    t += ' 差出来的 ' + (M - net).toFixed(1) + ' 个百分点里，交易费用 ' + fee.toFixed(1) + '，追涨杀跌 ' + beh.toFixed(1) + '，选股平均 ' + pick.toFixed(1) + '。';
    if (net < 0 && M > 0) t += ' 市场在涨，你却在亏：这正是很多人说的“赚了指数不赚钱”。';
    if (T === 0 && B === 0) t += ' 一年不动、也不追涨杀跌，你几乎拿到了市场的全部收益：这是买下整个市场的思路（第十一章）。';
    if (M < 0) t += ' 市场跌的年份，费用和情绪照样在扣，不会因为行情不好就打折。';
    say.textContent = t;
  }
  const gM = slider('gpM', v => (v > 0 ? '+' : '') + v + '%', go), gT = slider('gpT', v => v + ' 遍', go), gC = slider('gpC', v => v.toFixed(2) + '%', go), gB = slider('gpB', v => ['不追', '很少', '偶尔', '有时', '常常', '经常', '很常', '非常', '极常', '每天', '上头'][v], go);
  ready = true; go();
});
