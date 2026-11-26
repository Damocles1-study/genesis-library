
/* ---------- 第七章：一年有几个小时 ---------- */
dev('#yearFig', () => {
  const D = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  $('#yearCal').innerHTML = D.map((d, i) => '<div' + (i >= 4 ? ' class="ok"' : '') + '><b>' + d + '</b>' + (i >= 4 ? '20—21 时' : '不能玩') + '</div>').join('');
  const COL = ['var(--main)', 'var(--zhu)', 'var(--blu)'];
  let hours = 0;
  function split(){
    const a = +$('#yrA').value, b = +$('#yrB').value, c = +$('#yrC').value, s = a + b + c;
    if (!s) { $('#yearSplit').innerHTML = ''; $('#yearSay').textContent = '三样都拖到零了：这一年你打算一点都不玩？也可以。'; return; }
    const parts = [a, b, c].map(v => Math.round(hours * v / s));
    $('#yearSplit').innerHTML = parts.map((p, i) => '<i style="width:' + (p / hours * 100) + '%;background:' + COL[i] + '" title="' + p + ' 小时"></i>').join('');
    $('#yearSay').innerHTML = '盖房子和探险 <b>' + parts[0] + '</b> 小时，红石和命令 <b>' + parts[1] + '</b> 小时，和朋友一起 <b>' + parts[2] + '</b> 小时。' + (parts[1] >= 40 ? '四十个小时够你从一盏红石灯一路做到一台小小的加法器（第二部会讲）。' : '如果想学红石电路，可以多留一点时间给它。');
  }
  slider('yrHol', v => v + ' 天', v => {
    hours = 52 * 3 + v;
    kv($('#yearKv'), [['每个星期', '3 小时'], ['一年加起来', '约 ' + hours + ' 小时'], ['换成整天', '约 ' + (hours / 24).toFixed(1) + ' 天'], ['平均每天', '约 ' + Math.round(hours / 365 * 60) + ' 分钟']]);
    if ($('#yrA')) split();
  });
  ['yrA', 'yrB', 'yrC'].forEach(id => slider(id, v => v + ' 份', split));
});
