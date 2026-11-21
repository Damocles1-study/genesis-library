
/* ---------- 装置 7：考核表 ---------- */
dev('#gdFig', fig => {
  // [名字, 可钻空子程度, 测量成本, 钻空子能把报表抬高多少倍, 说明]
  const M = [
    ['不考核', 0, 0, 0, '没有指标，也就没人钻空子；可也没人知道谁干得好，一部分人会慢慢松下来（模型里真实产出缓慢下降一成多）。'],
    ['完成件数', .6, .02, 1.6, '件数好刷：把一件大事拆成几件小事，挑容易的先做，难的拖着。'],
    ['工作时长', .8, .02, 1.3, '时长最好刷：人坐在那里就算数。晚上八点的灯亮着，不代表事在做。'],
    ['留痕材料', .9, .15, 2.0, '留痕材料最会膨胀：做事的时间越来越多地拿去写“做了事”的证明。'],
    ['抽查用户满意度', .2, .08, 1.2, '直接去问用的人，最难糊弄；但它慢、贵、有噪音，要占用人手去做。']
  ];
  let cur = 1;
  btnRow($('#gdBtns'), M.map(m => m[0]), 1, i => { cur = i; draw(); });
  slider('gdA', x => x + '%', () => draw());
  function draw(){
    const m = M[cur], a = +$('#gdA').value / 100, T = 26;
    const audit = cur === 0 ? 0 : a;
    const auditCost = audit * .25;
    const real = [], rep = [];
    for (let t = 0; t <= T; t++) {
      const s = .7 * m[1] * (1 - audit) * (1 - Math.exp(-t / 6));
      const slack = cur === 0 ? .12 * (1 - Math.exp(-t / 8)) : 0;
      const base = 100 * (1 - m[2]) * (1 - auditCost) * (1 - slack);
      const r = base * (1 - s);
      real.push([t, r]);
      if (cur) rep.push([t, r + base * s * m[3]]);
    }
    const ymax = Math.max(140, ...rep.map(p => p[1])) * 1.05;
    lineChart($('#gdSvg'), [{color: 'var(--rule)', pts: [[0, 100], [T, 100]], w: 1.2, dash: '4 4'}, ...(cur ? [{color: 'var(--och)', pts: rep, w: 2.6}] : []), {color: 'var(--main)', pts: real, w: 2.6}],
      {xmin: 0, xmax: T, ymin: 0, ymax, xt: [0, 4, 8, 13, 17, 21, 26], xf: v => '第 ' + v + ' 周', yt: [0, 50, 100, 150].filter(v => v < ymax)});
    const rT = real[T][1], pT = cur ? rep[T][1] : null;
    $('#gdSay').innerHTML = (cur ? '半年后，报表上的成绩是 <b>' + pT.toFixed(0) + '</b>，真实的产出是 <b>' + rT.toFixed(0) + '</b>。' : '半年后，真实的产出是 <b>' + rT.toFixed(0) + '</b>。') + m[4] +
      (cur && cur !== 4 && a < .3 ? ' 把抽查调严一些，看看两条线怎样靠拢，以及真实产出为什么也会因为抽查本身占人手而降一点。' : '') +
      (a >= .6 && cur ? ' 抽查已经很严了：空子少了，可抽查本身也成了一份要人做的工作。没有免费的考核。' : '');
  }
  draw();
});
