/* ---------- 装置 21：借钱扩张，最后欠不欠（蒙特卡洛） ---------- */
dev('#loanFig', fig => {
  const box = $('#lnBars'), kvb = $('#lnKv'), say = $('#lnSay');
  const g = {}; let ready = false;
  function draw(){
    if (!ready) return;
    const L = g.l, i = g.i / 100 / 12, T = g.t;
    const pay = L ? (i ? L * i / (1 - Math.pow(1 + i, -T)) : L / T) : 0;
    const r = rng(2029), N = 1000, M = 24, ends = [];
    for (let k = 0; k < N; k++) {
      const ok = r() < g.p / 100;
      let cash = L; // 借来的钱先进账
      for (let m = 1; m <= M; m++) {
        cash += g.b;                               // 原来的利润
        if (m <= T) cash -= pay;                    // 还贷
        if (ok || m <= g.r) cash -= g.c;            // 扩张的花费；失败的在“见效”时停掉
        if (ok && m > g.r) cash += g.g * (0.7 + 0.6 * r());
      }
      if (T > M) { const q = 1 + i; cash -= i ? L * Math.pow(q, M) - pay * (Math.pow(q, M) - 1) / i : L - pay * M; } // 两年后还没还完的本金
      ends.push(cash - g.b * M);                    // 只看这次扩张带来的变化
    }
    ends.sort((a, b) => a - b);
    const lose = ends.filter(x => x < 0).length / N, worst = ends[Math.floor(N * 0.05)], med = ends[Math.floor(N / 2)];
    let debt = 0; // 两年后总现金（含原来的利润）仍为负
    for (let k = 0; k < N; k++) { if (ends[k] + g.b * M < 0) debt++; }
    bars(box, [['比不借不扩张更差', lose * 100, '', 'var(--main)'], ['两年后还欠着（原利润也填不上）', debt / N * 100, '', 'var(--och)'], ['比不借更好', (1 - lose) * 100, '', 'var(--ter)']], 100, v => Math.round(v) + '%');
    kv(kvb, [['每月还款', yuan(pay)], ['每月要掏', yuan(pay + g.c)], ['中间情况', (med >= 0 ? '多赚 ' : '少了 ') + yuan(Math.abs(med))], ['最差的二十分之一', (worst >= 0 ? '多赚 ' : '少了 ') + yuan(Math.abs(worst))]]);
    let s;
    if (pay + g.c > g.b * 2 && debt / N > 0.2) s = '每月要掏的 ' + yuan(pay + g.c) + '，是现在每月利润的 ' + ((pay + g.c) / Math.max(1, g.b)).toFixed(1) + ' 倍。一千次里有 ' + Math.round(debt / N * 100) + '% 两年后还欠着，要靠个人或家里来还：这就是“失败了还不上”的样子。';
    else if (lose > 0.5) s = '比不借更差的可能超过一半。成功的可能和见效的时间，是你自己估的：创业的人估这两个数，通常偏乐观。';
    else s = '在这组假设下，多数情况比不借更好。再试试把“多久见效”往右拖几个月，或者把“成的可能”往左拖一点：看看结论有多脆。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('lnL', v => { g.l = v; return v ? yuan(v) : '不借'; }, go);
  slider('lnI', v => { g.i = v; return v + '%'; }, go);
  slider('lnT', v => { g.t = v; return v + ' 个月'; }, go);
  slider('lnC', v => { g.c = v; return yuan(v); }, go);
  slider('lnG', v => { g.g = v; return yuan(v); }, go);
  slider('lnR', v => { g.r = v; return '第 ' + v + ' 个月'; }, go);
  slider('lnP', v => { g.p = v; return v + '%'; }, go);
  slider('lnB', v => { g.b = v; return yuan(v); }, go);
  ready = true; draw();
});
