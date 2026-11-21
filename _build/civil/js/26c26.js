
/* ---------- 装置 27：后付的工资 ---------- */
dev('#lzFig', fig => {
  const svg = $('#lzSvg'), Y = $('#lzY'), D = $('#lzD');
  const N = 38, RET = 20; // 工作三十八年，退休后领二十年
  function curves(d){
    const val = [], pay = [];
    for (let t = 0; t < N; t++) val.push(100 * (0.55 + 0.45 * (1 - Math.exp(-t / 9))));
    // 报酬：线性斜率 k，调整截距使工作期报酬 + 退休金 ≈ 价值总和
    const k = d * 0.22; // 每年多涨多少
    const pens = d * 4; // 退休后每年的养老金（相对单位）
    const totV = val.reduce((s, x) => s + x, 0);
    const need = totV - pens * RET * 0.6; // 退休金折算权重 0.6（时间价值）
    // pay(t) = c + k t，sum = N c + k N(N-1)/2 = need
    const c = (need - k * N * (N - 1) / 2) / N;
    for (let t = 0; t < N; t++) pay.push(c + k * t);
    return {val, pay, pens};
  }
  function draw(){
    const y = +Y.value, d = +D.value;
    $('#lzYO').textContent = '第 ' + y + ' 年'; $('#lzDO').textContent = ['不后付', '很少', '少', '少', '一些', '中等', '中等', '较多', '多', '很多', '极多'][d];
    const c = curves(d);
    const vp = c.val.map((v, t) => [t + 1, v]), pp = c.pay.map((v, t) => [t + 1, v]);
    for (let t = N; t < N + 12; t++) pp.push([t + 1, c.pens]);
    const ch = lineChart(svg, [{color: 'var(--main)', pts: vp, w: 2.6}, {color: 'var(--zhu)', pts: pp, dash: '5 4', w: 2.4}], {xmin: 1, xmax: N + 12, ymin: 0, ymax: 160, yt: [0, 50, 100, 150], xt: [1, 10, 20, 30, 38, 50], xf: v => v === 38 ? '退休' : v + ' 年', H: 230, marks: [[y, '离开']]});
    let cv = 0, cp = 0; for (let t = 0; t < y; t++) { cv += c.val[t]; cp += c.pay[t]; }
    const owed = Math.max(0, cv - cp);
    const avgPay = c.pay[Math.min(y - 1, N - 1)];
    kv($('#lzKv'), [['累计创造', Math.round(cv)], ['累计拿到', Math.round(cp)], ['没拿到的', Math.round(owed)], ['相当于几年的工资', (owed / avgPay).toFixed(1) + ' 年']]);
    const s = $('#lzSay');
    s.className = 'say ' + (owed / avgPay > 2 ? 'bad' : 'ok');
    s.innerHTML = d === 0 ? '报酬一直等于价值：什么时候走都不吃亏，单位也留不住人。这是很多私企的样子。' :
      owed / avgPay > 2 ? '在第 ' + y + ' 年离开，相当于把约 <b>' + (owed / avgPay).toFixed(1) + ' 年</b>的工资留在了单位里，再加上以后的养老金。<b>这就是金手铐</b>：走得越晚，手铐越紧，到了某一年以后又会慢慢松开。' :
      y > 30 ? '干到这么晚，“欠着的”已经基本拿回来了，后面拿的比创造的多。这也是为什么这种单位需要一个固定的退休年龄。' : '离开的代价还不算大。拖一拖滑块，看看哪一年手铐最紧。';
  }
  [Y, D].forEach(x => x.addEventListener('input', draw)); draw();
});
