/* ---------- 装置 8：开一家奶茶店 ---------- */
dev('#shopFig', fig => {
  const svg = $('#shSvg'), kvb = $('#shKv'), say = $('#shSay');
  const g = {}; let ready = false;
  const MISC = 1500, M = 36;
  function draw(){
    if (!ready) return;
    const margin = g.p * (1 - g.c / 100);            // 每杯扣掉变动成本
    const fixed = g.rent + g.wage + MISC;            // 每月固定成本
    const be = Math.ceil(fixed / 30 / margin);        // 盈亏平衡：每天多少杯
    const cupsAt = m => m <= 3 ? g.n : g.n * (1 - g.drop / 100);
    let cash = -g.up; const pts = [[0, cash]]; let endCash = null;
    for (let m = 1; m <= M; m++) {
      const prof = cupsAt(m) * 30 * margin - fixed;
      cash += prof; pts.push([m, cash]);
      if (m === g.end) endCash = cash + g.up * g.back / 100;
    }
    const ys = pts.map(p => p[1]).concat([0, endCash]);
    let lo = Math.min(...ys), hi = Math.max(...ys, 10000); const pad = (hi - lo) * .08; lo -= pad; hi += pad;
    const step = (hi - lo) > 6e5 ? 200000 : (hi - lo) > 2.5e5 ? 100000 : 50000;
    const yt = []; for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) yt.push(v);
    const c = lineChart(svg, [{pts: pts.slice(0, g.end + 1), color: 'var(--ter)', w: 2.6}, {pts: pts.slice(g.end), color: 'var(--ink-3)', dash: '3 4', w: 1.6}], {xmin: 0, xmax: M, ymin: lo, ymax: hi, xt: [0, 6, 12, 18, 24, 30, 36], xf: v => v + ' 月', yt: yt, yf: v => (v / 1e4) + ' 万', H: 250, L: 50});
    let ex = '<line x1="' + c.L + '" x2="' + (c.W - c.R) + '" y1="' + c.Y(0) + '" y2="' + c.Y(0) + '" stroke="var(--ink)" stroke-width="1"/>' + txt(c.L + 4, c.Y(0) - 6, '回本线', {s: 11, a: 'start', c: 'var(--ink-2)'});
    ex += '<line x1="' + c.X(g.end) + '" x2="' + c.X(g.end) + '" y1="' + c.T + '" y2="' + (c.H - c.B) + '" stroke="var(--main)" stroke-dasharray="4 3"/>';
    ex += '<circle cx="' + c.X(g.end) + '" cy="' + c.Y(endCash) + '" r="5" fill="var(--main)"/>' + txt(c.X(g.end), c.Y(endCash) + (endCash < 0 ? 20 : -10), '关店：' + wan(endCash), {s: 12, c: 'var(--main)', w: 1});
    svg.insertAdjacentHTML('beforeend', ex);
    const later = cupsAt(4);
    const payback = pts.findIndex(p => p[1] >= 0);
    kv(kvb, [['每杯扣掉原料剩', margin.toFixed(1) + ' 元'], ['每月固定成本', yuan(fixed)], ['每天要卖', '<b>' + be + ' 杯</b>才不亏'], ['三个月后每天卖', Math.round(later) + ' 杯'], ['回本', payback > 0 ? '第 ' + payback + ' 个月' : '三年内回不了本'], ['关店时一共', '<span class="' + (endCash >= 0 ? 'pos' : 'neg') + '">' + (endCash >= 0 ? '赚 ' : '亏 ') + yuan(Math.abs(endCash)) + '</span>']]);
    let s;
    if (later < be) s = '新鲜劲过去以后，每天只卖 ' + Math.round(later) + ' 杯，比不亏的 ' + be + ' 杯还少：从第四个月起，店每开一天都在亏。头三个月的排队，是最容易让人看错的东西。';
    else if (payback < 0) s = '每个月是赚的，可赚得太少，三年都填不平开张前花掉的 ' + yuan(g.up) + '。开张前那笔钱越大，回本越远。';
    else s = '这组假设下，第 ' + payback + ' 个月回本。注意“三个月回本”的说法需要什么条件：试着把开张前的钱往右拖，或者把客流掉的比例调高一点。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('shUp', v => { g.up = v; return yuan(v); }, go);
  slider('shRent', v => { g.rent = v; return yuan(v); }, go);
  slider('shWage', v => { g.wage = v; return v ? yuan(v) : '只有自己干'; }, go);
  slider('shP', v => { g.p = v; return v + ' 元'; }, go);
  slider('shC', v => { g.c = v; return v + '%'; }, go);
  slider('shN', v => { g.n = v; return v + ' 杯'; }, go);
  slider('shDrop', v => { g.drop = v; return v + '%'; }, go);
  slider('shEnd', v => { g.end = v; return '第 ' + v + ' 个月'; }, go);
  slider('shBack', v => { g.back = v; return v + '%'; }, go);
  ready = true; draw();
});
