
/* ---------- 装置 6：消息到你手上之前 ---------- */
dev('#newsFig', fig => {
  const svg = $('#nwSvg'), kvb = $('#nwKv'), say = $('#nwSay');
  const WHO = [['读新闻稿的程序', 0.002], ['机构交易员', 20], ['盯盘的人', 180], ['手机推送', 900], ['公众号和群聊', 7200], ['晚间新闻', 36000], ['亲戚聚会', 172800]];
  let who = 3, ready = false;
  const P0 = 10, P1 = 10.8;
  // t 单位秒
  function price(t, ov){
    const reach = 1 - Math.exp(-t / 120); // 两分钟左右走完大半
    const over = ov * (P1 - P0) * Math.exp(-t / 40000) * (1 - Math.exp(-t / 300));
    return P0 + (P1 - P0) * reach + over;
  }
  function go(){
    if (!ready) return;
    const ov = gOv() / 100, pts = [];
    for (let k = -3; k <= 5.4; k += 0.05) { const t = Math.pow(10, k); pts.push([k, price(t, ov)]); }
    const t = WHO[who][1], my = price(t, ov), lx = Math.log10(t);
    const ymax = Math.max(...pts.map(p => p[1])) + 0.1;
    const g = lineChart(svg, [{name: '价格', color: 'var(--up)', pts}, {name: '合理价', color: 'var(--ink-3)', pts: [[-3, P1], [5.4, P1]], dash: '4 4', w: 1.2}], {xmin: -3, xmax: 5.4, ymin: 9.9, ymax, xt: [-3, 0, 1, 2, 3, 4, 5], xf: x => ({'-3': '1毫秒', 0: '1秒', 1: '10秒', 2: '1.7分', 3: '17分', 4: '2.8时', 5: '1.2天'})[x], yt: [10, 10.4, 10.8, +(ymax).toFixed(1)], yf: y => y.toFixed(1), H: 220});
    svg.insertAdjacentHTML('beforeend', '<circle cx="' + g.X(lx) + '" cy="' + g.Y(my) + '" r="6" fill="var(--main)" stroke="var(--card)" stroke-width="2"/>' + txt(g.X(lx), g.Y(my) - 12, '你', {s: 13, w: true, c: 'var(--main)'}));
    const left = (P1 - my) / my;
    kv(kvb, [['你知道的时候', WHO[who][0]], ['你买进的价', my.toFixed(2) + ' 元'], ['消息总涨幅', '8.0%'], ['你还能赚', '<span class="' + (left >= 0 ? 'up' : 'dn') + '">' + pc(left) + '</span>']]);
    let s = '';
    if (who === 0) s = '你是第一排，几乎拿到了全部涨幅。可这一排坐的是花几亿美元买光缆、在交易所机房旁边租机位的公司。';
    else if (left > 0.04) s = '你还能分到大半涨幅，但这一排坐的是专业交易员，他们以此为生。';
    else if (left > 0) s = '剩下的涨幅只有 ' + (left * 100).toFixed(1) + '%，扣掉交易费所剩无几。';
    else s = '你买在了“冲过头”的地方，等价格回落到合理价，你反而亏 ' + (-left * 100).toFixed(1) + '%。热门消息最常见的结局就是这样：最后一批听说的人，替前面的人接了货。';
    if (ov === 0) s += '（你把过度反应调成了零：价格走到合理价就停，后来的人不亏，但也什么都赚不到。）';
    say.textContent = s;
  }
  btnRow($('#nwWho'), WHO.map(w => w[0]), who, i => { who = i; go(); });
  const gOv = slider('nwOv', v => v + '%', go);
  ready = true; go();
});
