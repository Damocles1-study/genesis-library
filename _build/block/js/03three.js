
/* ---------- 第三部封面：一周一百六十八小时 ---------- */
dev('#weekFig', () => {
  const CAT = [['睡觉', 'var(--blu)'], ['上学', 'var(--ter)'], ['作业', 'var(--pur)'], ['吃饭洗漱', 'var(--stone)'], ['户外运动', 'var(--main)'], ['玩方块游戏', 'var(--zhu)'], ['别的屏幕', 'var(--gold)'], ['自由', 'var(--paper-2)']];
  const D = ['一', '二', '三', '四', '五', '六', '日'];
  const g = id => +$('#' + id).value;
  function draw(){
    const sleep = g('wkSleep'), hw = g('wkHw'), out = g('wkOut') / 60, gd = g('wkGd') / 60, ge = g('wkGe'), scr = g('wkScr') / 60;
    const tot = Array(8).fill(0);
    let h = '';
    D.forEach((d, i) => {
      const we = i >= 5;
      const v = [sleep, we ? 0 : 7.5, we ? hw / 2 : hw, 2.5, out, we ? ge : gd, scr];
      let used = v.reduce((a, b) => a + b, 0); const free = Math.max(0, 24 - used); v.push(free);
      const k = used > 24 ? 24 / used : 1;
      v.forEach((x, j) => tot[j] += x * (j < 7 ? k : 1));
      h += '<div class="wkrow"><b>周' + d + '</b><span class="wkbar">' + v.map((x, j) => x > 0 ? '<i style="width:' + (x * (j < 7 ? k : 1) / 24 * 100).toFixed(2) + '%;background:' + CAT[j][1] + '" title="' + CAT[j][0] + ' ' + x.toFixed(1) + ' 小时"></i>' : '').join('') + '</span></div>';
    });
    $('#wkGrid').innerHTML = h + '<div class="legend">' + CAT.map(c => '<span><i style="background:' + c[1] + '"></i>' + c[0] + '</span>').join('') + '</div>';
    const game = tot[5], free = tot[7];
    kv($('#wkKv'), [['一周玩方块游戏', game.toFixed(1) + ' 小时'], ['一周户外运动', tot[4].toFixed(1) + ' 小时'], ['一周完全自由的时间', free.toFixed(1) + ' 小时']]);
    const tips = [];
    tips.push(sleep < 9 ? '每晚睡 ' + sleep + ' 小时，少了：六到十二岁的孩子，医生建议每天睡 9 到 12 小时。' : sleep > 12 ? '睡得比建议的还多，周末补觉也别太多。' : '睡眠在 9 到 12 小时之间，很好。');
    tips.push(out < 1 ? '户外运动每天不到一小时。世界卫生组织建议，孩子平均每天至少活动 60 分钟，最好是跑跑跳跳的那种。' : '每天运动够一小时了。');
    if (free < 7) tips.push('一周的自由时间不到 7 小时，太满了：人也需要发呆、看闲书、什么都不干的时间。');
    if (gd > 1) tips.push('平日每天玩超过一小时，作业和睡觉的时间就容易被挤掉。');
    $('#wkSay').innerHTML = tips.join(' ');
  }
  [['wkSleep', v => v + ' 小时'], ['wkHw', v => v + ' 小时'], ['wkOut', v => v + ' 分钟'], ['wkGd', v => v + ' 分钟'], ['wkGe', v => v + ' 小时'], ['wkScr', v => v + ' 分钟']].forEach(s => slider(s[0], s[1], () => { if ($('#wkScr')) draw(); }));
  draw();
});
