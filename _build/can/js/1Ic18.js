
/* ---------- 装置 19：两样倒在一起 ---------- */
dev('#abFig', fig => {
  const svg = $('#abSvg'), say = $('#abSay'), rx = $('#abX'), ry = $('#abY'), rz = $('#abZ'), row3 = $('#abRow3');
  let tab = 0, X = 100, Y = 30, Z = 300;
  const CFG = [
    {l1: '白醋', l2: '小苏打', x: [0, 200, 5, 100], y: [0, 30, 1, 10], fx: v => v + ' 毫升', fy: v => v + ' 克'},
    {l1: '碱性疏通剂', l2: '强酸疏通剂', x: [0, 200, 5, 100], y: [0, 100, 1, 30], fx: v => v + ' 毫升', fy: v => v + ' 毫升'}
  ];
  function setTab(t){
    tab = t; const c = CFG[t];
    $('#abL1').textContent = c.l1; $('#abL2').textContent = c.l2;
    [[rx, c.x], [ry, c.y]].forEach(p => { p[0].min = p[1][0]; p[0].max = p[1][1]; p[0].step = p[1][2]; p[0].value = p[1][3]; });
    row3.style.display = t ? '' : 'none';
    rx.dispatchEvent(new Event('input')); ry.dispatchEvent(new Event('input'));
  }
  function bar(x, y, w, h, frac, col, label, val){
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="var(--paper-2)"/><rect x="' + x + '" y="' + y + '" width="' + (w * Math.max(0, Math.min(1, frac))).toFixed(1) + '" height="' + h + '" rx="4" fill="' + col + '" opacity=".8"/>' +
      txt(x, y - 6, label, {s: 12, a: 'start', c: 'var(--ink-2)', halo: false}) + txt(x + w, y - 6, val, {s: 12, a: 'end', c: 'var(--ink)', halo: false});
  }
  function draw(){
    let g = '', s = '';
    const W = 600;
    if (tab === 0) {
      const ac = X * 0.00067, ba = Y / 84, re = Math.min(ac, ba), co2 = re * 24.5;
      const left = ac - re, leftB = ba - re, mx = Math.max(ac, ba, 0.01);
      g += txt(20, 22, '倒之前', {s: 13, a: 'start', c: 'var(--ink-3)', w: 1}) + txt(310, 22, '倒在一起以后', {s: 13, a: 'start', c: 'var(--ink-3)', w: 1});
      g += bar(20, 50, 250, 16, ac / mx, 'var(--main)', '去水垢的酸（醋酸）', Math.round(ac * 1000) + ' 毫摩尔');
      g += bar(20, 100, 250, 16, ba / mx, 'var(--ter)', '去油的碱（小苏打）', Math.round(ba * 1000) + ' 毫摩尔');
      g += bar(310, 50, 270, 16, left / mx, 'var(--main)', '还剩的酸', Math.round(left * 1000) + ' 毫摩尔');
      g += bar(310, 100, 270, 16, leftB / mx, 'var(--ter)', '还剩的碱', Math.round(leftB * 1000) + ' 毫摩尔');
      const r = Math.sqrt(co2) * 22;
      g += '<circle cx="440" cy="' + (175 + Math.min(r, 40)) + '" r="' + Math.min(r, 60).toFixed(1) + '" fill="var(--grn)" opacity=".18" stroke="var(--grn)"/>' + txt(440, 180 + Math.min(r, 40), '二氧化碳约 ' + co2.toFixed(1) + ' 升', {s: 12.5, c: 'var(--grn)', w: 1});
      g += txt(20, 170, '冒泡冒走的，是两样东西互相抵消掉的那部分。', {s: 12, a: 'start', c: 'var(--ink-3)', halo: false});
      g += txt(20, 190, '剩下的是醋酸钠水，去污的本事比单独一样都弱。', {s: 12, a: 'start', c: 'var(--ink-3)', halo: false});
      svg.setAttribute('viewBox', '0 0 ' + W + ' 260');
      if (!X || !Y) s = '只有一样，就没有反应。单独的白醋能对付水垢，单独的小苏打水能对付一点油污，各有各的用处。';
      else s = '冒了约 ' + co2.toFixed(1) + ' 升气泡。' + (left > 0.002 ? '小苏打用完了，剩下一些醋。' : leftB > 0.002 ? '醋用完了，剩下一些小苏打。' : '两样差不多正好抵消，剩下的几乎只有醋酸钠和水。') + '泡沫看着很猛，可它是酸和碱“同归于尽”的声音。要是倒在一个拧紧了盖子的瓶子里，这些气没处去，瓶子就会被顶开。';
    } else {
      const nb = X * 1.1 * 0.10 / 40, na = Y * 1.83 * 0.93 / 98;
      const Qn = 57 * Math.min(nb, 2 * na), Qd = 70 * na;
      const mC = X * 1.1 + Y * 1.83, mA = Z + Y * 1.83, mM = Z + mC;
      const tC = mC ? 20 + (Qn + Qd) * 1000 / (mC * 4) : 20, tA = mA ? 20 + Qd * 1000 / (mA * 4) : 20, tM = mM ? 20 + (Qn + Qd) * 1000 / (mM * 4) : 20;
      const rows = [['只倒强酸，混进积水里', tA], ['两瓶刚碰上的那一层（只有两瓶自己的水）', tC], ['两瓶加积水，全部搅匀', tM]];
      const X0 = 20, bw = 520, sc = t => (Math.min(t, 160) - 0) / 160 * bw;
      g += txt(X0, 18, '温度（摄氏度）', {s: 12, a: 'start', c: 'var(--ink-3)'});
      rows.forEach((r, k) => {
        const y = 52 + k * 58;
        g += '<rect x="' + X0 + '" y="' + y + '" width="' + bw + '" height="18" rx="9" fill="var(--paper-2)"/><rect x="' + X0 + '" y="' + y + '" width="' + sc(r[1]).toFixed(1) + '" height="18" rx="9" fill="' + (r[1] >= 100 ? 'var(--red)' : r[1] >= 60 ? 'var(--main)' : 'var(--ter)') + '" opacity=".8"/>';
        g += txt(X0, y - 7, r[0], {s: 12, a: 'start', c: 'var(--ink-2)', halo: false}) + txt(X0 + sc(r[1]) + 6, y + 14, r[1] >= 100 ? '沸腾' : Math.round(r[1]) + '°', {s: 12.5, a: 'start', c: r[1] >= 100 ? 'var(--red)' : 'var(--ink)', w: 1});
      });
      g += '<line x1="' + (X0 + sc(100)) + '" x2="' + (X0 + sc(100)) + '" y1="36" y2="220" stroke="var(--red)" stroke-dasharray="4 3"/>' + txt(X0 + sc(100), 236, '100 度：开始沸腾、喷溅', {s: 11.5, c: 'var(--red)'});
      svg.setAttribute('viewBox', '0 0 ' + W + ' 250');
      if (!X && !Y) s = '什么都没倒。';
      else if (!Y) s = '只有碱性疏通剂，按说明书等够时间、用水冲，它不会自己发烫。';
      else if (!X) s = '强酸疏通剂自己遇水就会放热，这就是说明书要你慢慢倒、别凑近的原因，也是“酸入水”那条口诀的道理。';
      else s = (tC >= 100 ? '<b>两瓶刚碰上的那一层冲过了一百度</b>：那里的水会瞬间沸腾，把还没反应完的酸和碱一起顶出下水口。' : '刚碰上的那一层已经到了 ' + Math.round(tC) + ' 度，再多倒一点就会沸腾。') + '全部搅匀以后的平均温度（' + Math.round(tM) + ' 度）看起来没那么吓人，可管子堵着，偏偏搅不匀，人又常常正弯着腰往下看。';
    }
    svg.innerHTML = g; say.innerHTML = s;
  }
  slider('abX', v => { X = v; return CFG[tab].fx(v); }, draw);
  slider('abY', v => { Y = v; return CFG[tab].fy(v); }, draw);
  slider('abZ', v => { Z = v; return v + ' 毫升'; }, draw);
  btnRow($('#abTab'), ['醋配小苏打', '两瓶疏通剂'], 0, setTab);
  setTab(0);
});
