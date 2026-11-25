/* ---------- 装置 9：分股权 ---------- */
dev('#eqFig', fig => {
  const box = $('#eqBars'), kvb = $('#eqKv'), say = $('#eqSay'), vest = $('#eqV');
  const NM = ['周畅', '老韩', '沈舟'], LAB = [1, 1, 0.3], COL = ['var(--ter)', 'var(--och)', 'var(--main)'];
  const g = {who: 2}; let ready = false;
  function draw(){
    if (!ready) return;
    const money = [g.a, g.b, g.c], mt = money.reduce((x, y) => x + y, 0) || 1, lt = LAB.reduce((x, y) => x + y, 0), w = g.w / 100;
    const mPart = money.map(m => m / mt * (1 - w)), lPart = LAB.map(l => l / lt * w);
    const share = mPart.map((m, i) => m + lPart[i]);
    // 离开的人
    const k = g.who, t = g.t;
    const vf = vest.checked ? (t < 12 ? 0 : Math.min(1, t / 48)) : 1;
    const keep = mPart[k] + lPart[k] * vf, back = share[k] - keep;
    const after = share.map((s, i) => i === k ? keep : s + back * s / (1 - share[k]));
    const rows = [];
    NM.forEach((n, i) => rows.push([n, share[i] * 100, '开张时 · ' + (LAB[i] === 1 ? '全职' : '兼职') + '，出 ' + yuan(money[i]), COL[i]]));
    NM.forEach((n, i) => rows.push([n + (i === k ? '（离开）' : ''), after[i] * 100, '第 ' + t + ' 个月以后', i === k ? 'var(--ink-3)' : COL[i]]));
    bars(box, rows, 100, v => v.toFixed(1) + '%');
    const others = after.reduce((x, y, i) => i === k ? x : x + y, 0);
    kv(kvb, [['离开的人开张时', (share[k] * 100).toFixed(1) + '%'], ['出力部分已成熟', Math.round(vf * 100) + '%'], ['离开后还握着', '<b>' + (keep * 100).toFixed(1) + '%</b>'], ['留下的两人合计', (others * 100).toFixed(1) + '%']]);
    let s;
    if (!vest.checked) s = NM[k] + '第 ' + t + ' 个月就走了，却带走了开张时的全部 ' + (share[k] * 100).toFixed(1) + '%。以后这家工作室赚的每一块钱，都有这么多要分给一个不再干活的人。勾上“股权成熟”看看区别。';
    else if (t < 12) s = '还没干满一年就走，出力的那部分一点没成熟，' + NM[k] + '只保留了出钱买的 ' + (keep * 100).toFixed(1) + '%。没成熟的股份按比例回到了留下的人手里。';
    else s = NM[k] + '干了 ' + t + ' 个月，出力的部分成熟了 ' + Math.round(vf * 100) + '%，带走 ' + (keep * 100).toFixed(1) + '%。干得越久，带走越多：这比一开始平分、然后为“谁干得多”吵架要公平。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('eqA', v => { g.a = v; return yuan(v); }, go);
  slider('eqB', v => { g.b = v; return yuan(v); }, go);
  slider('eqC', v => { g.c = v; return yuan(v); }, go);
  slider('eqW', v => { g.w = v; return v + '%'; }, go);
  slider('eqT', v => { g.t = v; return '第 ' + v + ' 个月'; }, go);
  btnRow($('#eqWho'), NM.map(n => n + '离开'), 2, i => { g.who = i; draw(); });
  vest.addEventListener('change', go);
  ready = true; draw();
});
