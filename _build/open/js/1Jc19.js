/* ---------- 装置 20：同样赚一年，交多少税（写作时政策的极简示意） ---------- */
dev('#taxFig', fig => {
  const box = $('#txBars'), kvb = $('#txKv'), say = $('#txSay');
  const g = {}; let ready = false;
  const prog = (x, B) => { if (x <= 0) return 0; for (const b of B) if (x <= b[0]) return x * b[1] - b[2]; return 0; };
  const BIZ = [[30000, .05, 0], [90000, .10, 1500], [300000, .20, 10500], [500000, .30, 40500], [Infinity, .35, 65500]];
  const COMP = [[36000, .03, 0], [144000, .10, 2520], [300000, .20, 16920], [420000, .25, 31920], [660000, .30, 52920], [960000, .35, 85920], [Infinity, .45, 181920]];
  function draw(){
    if (!ready) return;
    const R = g.r, cost = R * g.c / 100;
    const vat = R / 12 <= 100000 ? 0 : R / 1.01 * 0.01;
    // 劳务报酬：收入八成并入综合所得，减六万
    const lw = prog(R * 0.8 - 60000, COMP), lwNet = R - cost - lw;
    // 个体户：经营所得，减六万，二百万以内部分减半
    const ti = R - vat - cost - 60000;
    const t0 = prog(ti, BIZ), t = ti > 0 ? t0 - t0 * Math.min(1, 2e6 / ti) * 0.5 : 0, bizNet = R - vat - cost - t;
    // 一人公司：利润全分红
    const pr = R - vat - cost, cit = pr <= 0 ? 0 : pr <= 3e6 ? pr * 0.05 : pr * 0.25, div = Math.max(0, pr - cit) * 0.2, coNet = pr - cit - div;
    const rows = [['没执照，按劳务报酬', lw, '到手 ' + yuan(lwNet) + '（成本不能扣）', 'var(--och)'], ['个体户', vat + t, '增值税 ' + yuan(vat) + ' + 个税 ' + yuan(t) + '，到手 ' + yuan(bizNet), 'var(--ter)'], ['一人公司，全部分红', vat + cit + div, '增值税 ' + yuan(vat) + ' + 企业所得税 ' + yuan(cit) + ' + 分红个税 ' + yuan(div) + '，到手 ' + yuan(coNet), 'var(--main)']];
    bars(box, rows, Math.max(1, ...rows.map(r => r[1])), v => yuan(v));
    kv(kvb, [['利润', yuan(R - cost)], ['月均收入', yuan(R / 12)], ['增值税', vat ? '超过月十万，按 1%' : '月十万以下，免']]);
    const best = [[lwNet, '按劳务报酬'], [bizNet, '个体户'], [coNet, '一人公司']].sort((a, b) => b[0] - a[0])[0][1];
    let s = '这组数字下，到手最多的是“' + best + '”。';
    if (g.c >= 30 && R < 200000) s += ' 成本占得多的时候，按劳务报酬不能扣成本，就显得吃亏：这是有了稳定生意以后办个体户的一个理由。';
    else if (R - cost > 1e6) s += ' 利润很高时，公司那百分之五看着低，可分红还有一道百分之二十；个体户超过二百万的部分不再减半。高收入的税务安排，一定要找专业的人。';
    else s += ' 小生意在写作时的税负普遍不高。比起选哪种形式省几千块，按时申报、账目清楚更重要。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('txR', v => { g.r = v; return yuan(v); }, go);
  slider('txC', v => { g.c = v; return v + '%'; }, go);
  ready = true; draw();
});
