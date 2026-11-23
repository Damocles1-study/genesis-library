/* ---------- 装置 20：船上的日子 ---------- */
dev('#vcFig', () => {
  const SUP = [['什么都没有', 0], ['青柠汁（长途运来的）', 2], ['新鲜柠檬汁一份', 12], ['酸菜一碗', 12], ['豆芽一把', 13], ['一个橘子', 50]];
  const VOY = [['横渡大西洋（哥伦布，约 35 天）', 35], ['不见陆地的印度洋（达·伽马，约 93 天）', 93], ['横渡太平洋（麦哲伦，约 98 天）', 98], ['沿岸航行、常靠岸', 20]];
  let s = 0, v = 2;
  btnRow($('#vcS'), SUP.map(x => x[0]), 0, i => { s = i; draw(); });
  btnRow($('#vcV'), VOY.map(x => x[0]), 2, i => { v = i; draw(); });
  const P0 = 1500, K = 0.03, TH = 300, ABS = 0.8;
  function draw(){
    const I = SUP[s][1], days = 160, pts = []; let P = P0, sick = null;
    for (let d = 0; d <= days; d++) { pts.push([d, P]); if (sick == null && P < TH) sick = d; P += ABS * I - K * P; }
    const vd = VOY[v][1];
    lineChart($('#vcChart'), [{pts, color: 'var(--grn)', w: 2.6}, {pts: [[0, TH], [days, TH]], color: 'var(--red)', w: 1.4, dash: '4 4'}], {xmin: 0, xmax: days, ymin: 0, ymax: 1600, xt: [0, 30, 60, 90, 120, 150], yt: [0, 300, 800, 1500], xf: v => v + ' 天', yf: v => v + ' 毫克', H: 220, L: 64,
      marks: [[vd, '这次航行'], ...(sick != null ? [[sick, '开始发病']] : [])]});
    const eq = ABS * I / K;
    $('#vcSay').innerHTML = sick == null ? '每天这一点点，就让储备稳在约 ' + Math.round(eq) + ' 毫克，始终没跌破发病线。' + (I <= 13 ? '<b>一天十来毫克就够防住坏血病</b>，差不多是半个柠檬的量；可是没有它，几个月就会要命。' : '') :
      '大约第 <b>' + sick + ' 天</b>开始出现症状。' + (sick < vd ? '这次航行要 ' + vd + ' 天，船上会有很多人病倒，这就是麦哲伦和安森的船队遇到的事。' : '这次航行 ' + vd + ' 天，靠岸补给来得及，所以短途和沿岸航行的人很少得坏血病。') +
      (s === 1 ? '青柠汁看着和柠檬汁差不多，加工和长途运输后几乎没剩下维生素 C：十九世纪的英国海军就是这样又把坏血病请了回来。' : '');
  }
  draw();
});
