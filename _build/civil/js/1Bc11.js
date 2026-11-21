
/* ---------- 装置 12：帕金森定律 ---------- */
dev('#pkFig', fig => {
  const svg = $('#pkSvg'), R = $('#pkR'), M = $('#pkM');
  const fr = () => { $('#pkRO').textContent = (+R.value > 0 ? '+' : '') + R.value + '%'; $('#pkMO').textContent = (+M.value / 10).toFixed(1); };
  R.addEventListener('input', fr); M.addEventListener('input', fr); fr();
  function run(){
    const rate = +R.value / 100, mu = +M.value / 10, r = rng(1955 + +M.value * 7 + +R.value);
    // 起初十个人、一千份真活，人均一百份。帕金森：活会膨胀到填满时间，所以人人都“觉得忙”；
    // 每年每人有一定概率申请一个下属（内耗越大、真活增长越快，概率越高），而且从不裁员。
    let real = 1000, n = 10;
    const sR = [], sN = [], sT = [];
    for (let y = 0; y <= 20; y++) {
      const internal = mu * 6 * n * Math.log2(n);           // 传阅、会签、开会：随人数和层级增长
      sR.push([y, real]); sN.push([y, n * 100]); sT.push([y, real + internal]);
      const p = clamp(0.015 + mu * 0.012 + Math.max(0, rate) * 0.8, 0, 0.5);
      let add = 0; for (let i = 0; i < n; i++) if (r() < p) add++;
      n += add;
      real = Math.max(100, real * (1 + rate));
    }
    const mx = Math.max(...sT.map(p => p[1]), ...sN.map(p => p[1]), 1500);
    const top = Math.ceil(mx / 1000) * 1000;
    lineChart(svg, [{color: 'var(--main)', pts: sR}, {color: 'var(--zhu)', pts: sN, w: 2.8}, {color: 'var(--kraft)', pts: sT, dash: '5 4'}], {xmin: 0, xmax: 20, ymin: 0, ymax: top, yt: [0, top / 2, top], xt: [0, 5, 10, 15, 20], xf: v => v + ' 年', H: 230, L: 52});
    const n20 = sN[20][1] / 100, r20 = sR[20][1];
    const g = Math.pow(n20 / 10, 1 / 20) - 1;
    const s = $('#pkSay');
    s.className = 'say ' + (n20 > 15 ? 'bad' : 'ok');
    s.innerHTML = '二十年后：真正要办的事从 1000 份变成 <b>' + Math.round(r20) + '</b> 份，科室从 10 人变成 <b>' + n20 + '</b> 人，人数平均每年增长约 ' + (g * 100).toFixed(1) + '%（帕金森估计的是 5%—6%），人均真活从 100 份变成 ' + Math.round(r20 / n20) + ' 份。' +
      (mu === 0 ? '没有内耗，人几乎不增加。可惜现实里没有零内耗的科室。' :
       rate < 0 ? '<b>真活在减少，人却在增加</b>：这就是海军部的那两条线。每个人都觉得自己很忙，因为虚线和蓝线之间那一大块，是科室自己给自己造的活。' : '真活增加时人手跟着增加，这很正常；注意看虚线和蓝线之间的距离：那是科室自己给自己造的活。');
  }
  $('#pkGo').addEventListener('click', run); run();
});
