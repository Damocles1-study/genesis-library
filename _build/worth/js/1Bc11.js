
/* ---------- 装置 14：身体这个账户 ---------- */
dev('#hcFig', fig => {
  const A0 = 22, A1 = 75, LINE = 35;
  function path(h){ // h(age) -> {s, e, w, f}
    let H = 100, scar = 0; const pts = [];
    for (let a = A0; a <= A1; a++) {
      const x = h(a);
      const deficit = Math.max(0, 7 - x.s), over = Math.max(0, x.w - 45);
      let dep = .006 * Math.pow(1.055, a - A0);              // 随年龄上升的折旧
      dep *= 1 + deficit * .3 + over * .013 - Math.min(x.f, 4) * .05;
      const scarAdd = (deficit * .2 + over * .012) * (a < 40 ? 1 : 1.6); // 不可逆的损耗
      scar += scarAdd;
      const inv = Math.min(x.e, 300) / 150 * 1.1 * Math.pow(.97, a - A0); // 运动：越老效果越小
      H = H - dep * H - scarAdd * .4 + inv * (1 - H / 105);
      H = clamp(H, 0, 100 - scar * .5);
      pts.push([a, H]);
    }
    return pts;
  }
  const cross = pts => { const p = pts.find(q => q[1] < LINE); return p ? p[0] : null; };
  function draw(){
    const s = +$('#hcS').value, e = +$('#hcE').value, w = +$('#hcW').value, f = +$('#hcF').value, fix = $('#hcFix').checked;
    const me = path(a => fix && a < 32 ? {s: 5.5, e: 0, w: 65, f} : {s, e, w, f});
    const ref = path(() => ({s: 7.5, e: 150, w: 40, f: 3}));
    const never = fix ? path(() => ({s: 5.5, e: 0, w: 65, f})) : null;
    const ax = lineChart($('#hcSvg'), [{color: 'var(--rule)', pts: [[A0, LINE], [A1, LINE]], w: 1.5, dash: '5 4'}, {color: 'var(--ink-3)', pts: ref, w: 2, dash: '4 3'}, ...(fix ? [{color: 'var(--red)', pts: never, w: 2, dash: '2 3'}] : []), {color: 'var(--main)', pts: me, w: 2.8}],
      {xmin: A0, xmax: A1, ymin: 0, ymax: 105, xt: [22, 30, 40, 50, 60, 70], xf: v => v + ' 岁', yt: [0, 35, 70, 100]});
    $('#hcSvg').innerHTML += txt(ax.X(A1) - 4, ax.Y(LINE) - 6, '日常生活开始需要人帮忙', {s: 11, a: 'end', c: 'var(--ink-3)'});
    const cm = cross(me), cr = cross(ref);
    const at = a => me.find(p => p[0] === a)[1];
    $('#hcSay').innerHTML = (cm ? '你的账户在 <b>' + cm + ' 岁</b>跌破那条线' : '到七十五岁，你的账户还在那条线以上') + '，参照作息' + (cr ? '是 ' + cr + ' 岁' : '到七十五岁也没有跌破') + '。四十岁时你的账户是 <b>' + at(40).toFixed(0) + '</b>，五十岁是 <b>' + at(50).toFixed(0) + '</b>。' +
      (fix ? ' 红色虚线是一直不改的样子' + (cross(never) ? '（' + cross(never) + ' 岁跌破）' : '') + '。三十二岁以后补救：补救有用，曲线会被拉回来一截，但<b>前十年留下的那部分不可逆的损耗补不回来</b>，而且同样的运动，三十多岁时的效果已经比二十出头时小了。' :
        s < 6.5 ? ' 睡眠不足在这个模型里是最大的漏洞：它同时加快折旧、留下损耗。' : w >= 60 ? ' 长时间工作让折旧加快，还挤掉了睡觉和运动的时间（这一点模型没算，现实中更糟）。' : e >= 150 ? ' 运动是这个账户里少有的“正利息”，越早开始越值。' : '') +
      ' 再说一遍：这是示意，不是医学预测。';
  }
  slider('hcS', x => x + ' 小时', draw); slider('hcE', x => x + ' 分钟', draw); slider('hcW', x => x + ' 小时', draw); slider('hcF', x => x + ' 个', draw);
  $('#hcFix').addEventListener('change', draw);
});
