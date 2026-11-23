/* ---------- 装置 12：上山 ---------- */
dev('#hlFig', () => {
  let terr = 0;
  const S = slider('hlS', v => v + '°', () => draw());
  btnRow($('#hlT'), ['顺坡直接种', '先修梯田'], 0, i => { terr = i; draw(); });
  function draw(){
    const slope = S(), YRS = 20;
    const loss = 0.004 * slope * (terr ? 0.18 : 1);   // 每年表土流失比例
    let soil = 1, plots = 1, age = 0, total = 0, washed = 0;
    const pts = [], ages = [];
    for (let y = 1; y <= YRS; y++) {
      age++;
      let crop = soil * (terr && age <= 3 ? 0.6 : 1);
      total += crop; pts.push([y, crop * 100]);
      washed += soil * loss; soil *= 1 - loss;
      if (soil < 0.4) { ages.push(age); plots++; soil = 1; age = 0; }
    }
    lineChart($('#hlChart'), [{pts, color: 'var(--och)', w: 2.4, dots: true}], {xmin: 1, xmax: YRS, ymin: 0, ymax: 110, xt: [1, 5, 10, 15, 20], yt: [0, 40, 100], xf: v => '第 ' + v + ' 年', yf: v => v + '%', H: 210,
      marks: [[1, '']].slice(0, 0)});
    const life = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;
    kv($('#hlKv'), [['一块地能种', life ? '约 ' + life + ' 年' : '二十年以上'], ['二十年开了', plots + ' 块地'], ['平均收成', Math.round(total / YRS * 100) + '%'], ['冲走的表土', (washed).toFixed(1) + ' 块地的量']]);
    $('#hlSay').innerHTML = slope >= 20 && !terr ? '陡坡上顺坡种玉米，几年地就瘦了，只好扔下往深处走。二十年里这一户人要开 ' + plots + ' 块地，冲下去的土，最后都进了山下的河。这正是十八世纪秦巴山区和皖南山区发生的事。' :
      terr ? '修梯田前几年吃亏，往后收成稳得多，地也能一直种下去。可是修梯田要大量的人工和本钱，租山种地的棚民不知道明年还在不在这里，很少有人愿意下这个本。' :
      '坡缓一些，地能多种几年，但慢慢流失还在发生。';
  }
  draw();
});
