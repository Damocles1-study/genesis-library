/* ---------- 装置 40：大陆币还值多少钱 ---------- */
dev('#contFig', fig => {
  // [月份序号（0 = 1775 年 6 月）, 多少大陆元换一银元]（示意，粗略取整）
  const D = [[0, 1], [12, 1.1], [19, 1.5], [25, 3], [31, 4], [37, 5], [43, 8], [49, 19], [55, 40], [61, 60], [67, 100], [70, 167], [72, 500]];
  // 累计发行（百万元面额，约）
  const ISS = [[0, 2], [7, 6], [19, 25], [31, 38], [43, 102], [54, 241]];
  const at = (T, m) => { let i = 0; while (i < T.length - 2 && T[i + 1][0] <= m) i++; const a = T[i], b = T[i + 1], t = clamp((m - a[0]) / (b[0] - a[0]), 0, 1); return T === D ? Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), t)) : lerp(a[1], b[1], t); };
  const mname = m => { const y = 1775 + Math.floor((m + 5) / 12), mo = (m + 5) % 12 + 1; return y + ' 年 ' + mo + ' 月'; };
  const Y = $('#ctY'), svg = $('#ctSvg');
  const W = 600, H = 220, L = 50, R = 12, T = 12, B = 28;
  const X = m => L + m / 72 * (W - L - R), LY = v => T + (1 - Math.log10(v) / Math.log10(600)) * (H - T - B);
  const EV = [[13, '独立宣言'], [28, '萨拉托加'], [33, '法国结盟'], [57, '国会定价 40:1'], [76, '约克镇']];
  Y.addEventListener('input', go);
  function go(){
    const m = +Y.value, r = at(D, m), iss = at(ISS, Math.min(m, 54));
    $('#ctYo').textContent = mname(m);
    let g = '';
    [1, 10, 100, 500].forEach(v => g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + LY(v) + '" y2="' + LY(v) + '" stroke="var(--rule)"/>' + txt(L - 6, LY(v) + 4, v + ' : 1', {s: 10.5, a: 'end', c: 'var(--ink-3)', halo: false}));
    [0, 12, 24, 36, 48, 60, 72].forEach(k => g += txt(X(k), H - 9, mname(k).slice(0, 5), {s: 10.5, c: 'var(--ink-3)', halo: false}));
    EV.filter(e => e[0] <= 72).forEach((e, i) => g += '<line x1="' + X(e[0]) + '" x2="' + X(e[0]) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--ink-3)" stroke-dasharray="2 3"/>' + txt(X(e[0]) + 3, T + 12 + (i % 2) * 14, e[1], {s: 10.5, a: 'start', c: 'var(--ink-2)'}));
    let d = ''; for (let k = 0; k <= 72; k++) d += (k ? 'L' : 'M') + X(k).toFixed(1) + ',' + LY(at(D, k)).toFixed(1);
    let d2 = ''; for (let k = 0; k <= m; k++) d2 += (k ? 'L' : 'M') + X(k).toFixed(1) + ',' + LY(at(D, k)).toFixed(1);
    g += '<path d="' + d + '" fill="none" stroke="var(--rule)" stroke-width="1.5" stroke-dasharray="3 3"/><path d="' + d2 + '" fill="none" stroke="var(--och)" stroke-width="3"/>';
    g += '<circle cx="' + X(m) + '" cy="' + LY(r) + '" r="5" fill="var(--och)"/>';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const pay = 6.67 / r;
    kv($('#ctKV'), [['一枚银元换', r < 10 ? r.toFixed(1) + ' 大陆元' : Math.round(r) + ' 大陆元'], ['列兵月饷，折成银子', pay >= 1 ? pay.toFixed(2) + ' 银元' : Math.round(pay * 100) + ' 美分'], ['累计印了（面额）', '约 ' + Math.round(iss) + ' 百万元']]);
    const say = $('#ctSay');
    say.className = 'say' + (r > 20 ? ' bad' : r < 2 ? ' ok' : '');
    say.innerHTML = r < 2 ? '<b>刚开始，纸币还算值钱。</b>大陆会议承诺以后由各州收税来兑现。爱国的人收它，不收的人可能被当成效忠派。'
      : r < 10 ? '<b>纸币印得太快了。</b>各州也在印自己的纸币，英国人还故意大量伪造大陆币来捣乱。农民开始不愿意把粮食卖给拿纸币的军队，军需官只好打白条“征用”。'
      : r < 100 ? '<b>“一文不值，像一张大陆币。”</b>这句话成了美国人的口头禅。1780 年 3 月，国会宣布按四十比一回收旧币，等于赖掉了九成多的债。士兵们拿着一个月的饷买不到一双鞋，1781 年初宾夕法尼亚和新泽西的部队先后哗变。'
      : '<b>到 1781 年夏天，大陆币基本不再流通了。</b>战争的后半段靠的是法国和荷兰的贷款、各州的实物税，和一个叫罗伯特·莫里斯的费城商人以个人信用担保发行的票据。<em>一个没有收税权的政府，只能用通货膨胀来收税</em>：这笔账，下一章由汉密尔顿来算。';
  }
  go();
});
