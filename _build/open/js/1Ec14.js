/* ---------- 装置 15：三无的底线账 ---------- */
dev('#nilFig', fig => {
  const kvb = $('#nlKv'), say = $('#nlSay');
  const g = {}; let ready = false;
  const FREE = 70; // 一周可用小时
  function draw(){
    if (!ready) return;
    const need = g.h + g.f + g.m + g.p + g.x;
    const gap = Math.max(0, need - g.j);
    const hrsMonth = gap / g.w, hrsWeek = hrsMonth / 4.33;
    const left = FREE - hrsWeek;
    kv(kvb, [['每月最少要', yuan(need)], ['接活能补', yuan(g.j)], ['还差', yuan(gap)], ['每周要打零工', hrsWeek.toFixed(1) + ' 小时'], ['留给手艺和考试', '<span class="' + (left >= 30 ? 'pos' : 'neg') + '">' + Math.max(0, left).toFixed(1) + ' 小时 / 周</span>']]);
    let s;
    if (left < 20) s = '零工吃掉了大部分时间，留给手艺和考试的不到二十小时。最大的一项通常是房租：试着把“住”拖到零，看看差多少。';
    else if (g.h === 0) s = '住在家里，一个月最少 ' + yuan(need) + '，每周打 ' + hrsWeek.toFixed(0) + ' 小时零工就能打平，还剩 ' + left.toFixed(0) + ' 小时。面子上不好看，可它买到的是时间：一门手艺、一次更好的考试。';
    else s = '一个月最少 ' + yuan(need) + '，每周要打 ' + hrsWeek.toFixed(0) + ' 小时零工，还剩 ' + left.toFixed(0) + ' 小时。接活的收入每多一千，每周就能少打约 ' + (1000 / g.w / 4.33).toFixed(0) + ' 小时零工：这就是一门手艺在三无时的价值。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('nlH', v => { g.h = v; return v ? yuan(v) : '住家里'; }, go);
  slider('nlF', v => { g.f = v; return yuan(v); }, go);
  slider('nlM', v => { g.m = v; return yuan(v); }, go);
  slider('nlP', v => { g.p = v; return v ? yuan(v) : '先不交'; }, go);
  slider('nlX', v => { g.x = v; return yuan(v); }, go);
  slider('nlW', v => { g.w = v; return v + ' 元 / 小时'; }, go);
  slider('nlJ', v => { g.j = v; return yuan(v); }, go);
  ready = true; draw();
});
