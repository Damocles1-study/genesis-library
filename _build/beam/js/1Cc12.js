/* ---------- 装置 13：滑轮和踩轮 ---------- */
dev('#dcFig', () => {
  const LOAD = [['希腊神庙一块石头', 1000], ['教堂墙上一块石头', 500], ['纪功柱一块鼓石', 32000], ['纪功柱的柱头', 53000], ['一根大木梁', 2500]];
  /* [名字, 每人出力 N, 放大倍数, 一台最多几个人] */
  const WAY = [['直接拉绳', 300, 1, 20], ['推绞盘', 200, 4, 8], ['踩轮', 200, 8, 6]];
  let m = 1000, w = 2;
  btnRow($('#dcBtns'), LOAD.map(l => l[0]), 0, i => { m = LOAD[i][1]; draw(); });
  btnRow($('#dcW'), WAY.map(x => x[0]), w, i => { w = i; draw(); });
  const Nn = slider('dcN', v => v + ' 段', () => draw());
  const Hh = slider('dcH', v => v + ' 米', () => draw());
  function draw(){
    const n = Nn(), [nm, f, adv, cap] = WAY[w];
    const ma = n * Math.pow(0.96, n);
    const people = Math.ceil(m * 9.8 / ma / (f * adv));
    const machines = Math.ceil(people / cap);
    const walk = n * adv;              // 吊升 1 米，人要走（拉）多少米
    const time = Hh() * walk / 0.5 / machines * Math.max(1, machines) / Math.max(1, machines); // 几台同时拉，速度不变
    const mins = Hh() * walk / 0.5 / 60;
    kv($('#dcKv'), [['要几个人', fmt(people) + ' 人'], ['要几台' + (w === 2 ? '踩轮' : w === 1 ? '绞盘' : '组'), machines + ' 台'], ['每升一米要走 / 拉', walk + ' 米'], ['吊到顶要', mins < 60 ? Math.round(mins) + ' 分钟' : (mins / 60).toFixed(1) + ' 小时']]);
    $('#dcSay').innerHTML = '用' + nm + '、' + n + ' 段绳子的滑车组吊 ' + (m / 1000) + ' 吨：' + (people <= cap ? '<b>' + people + ' 个人</b>就够了' : '要 ' + fmt(people) + ' 个人，得 ' + machines + ' 台同时拉') +
      '，可是每升高一米，他们要' + (w === 2 ? '在轮子里走' : '拉') + ' ' + walk + ' 米。吊到 ' + Hh() + ' 米高，要 ' + (mins < 60 ? Math.round(mins) + ' 分钟' : (mins / 60).toFixed(1) + ' 小时') + '。' +
      (n >= 8 ? ' 绳子段数再多，滑轮的摩擦也越吃越多，省下来的力有限。' : '') + (m >= 30000 ? ' 罗马人吊纪功柱的柱头，大概就是几台这样的机器围着一座木塔一起拉。' : '');
  }
  draw();
});
