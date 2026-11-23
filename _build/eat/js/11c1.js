/* ---------- 装置 2：嚼 ---------- */
dev('#chFig', () => {
  const svg = $('#chDay');
  const RR = 12.6, RC = 2.4; // 每 100 千卡要嚼几分钟：生 / 熟
  const c = slider('chC', v => v + '%', () => draw());
  const e = slider('chE', v => v + ' 千卡', () => draw());
  function draw(){
    const k = c() / 100, need = e();
    const eff = 0.7 + 0.3 * k;              // 能量吸收率
    const intake = need / eff;               // 要吃下去的“生重能量”
    const chew = intake * ((1 - k) * RR + k * RC) / 100 / 60; // 小时
    const find = 1.5 + intake / 1000 * 1.2;  // 找吃的、搬回来（示意）
    const cook = k * 1.2;                    // 拾柴、看火
    const sleep = 9;
    const free = Math.max(0, 24 - sleep - chew - find - cook);
    const segs = [['睡觉', sleep, 'var(--ink-3)'], ['嚼', chew, 'var(--red)'], ['找吃的', find, 'var(--och)'], ['拾柴看火', cook, 'var(--main)'], ['剩下', free, 'var(--grn)']];
    let x = 10, g = '';
    segs.forEach(s => { const w = s[1] / 24 * 580; if (w > 0.5) { g += '<rect x="' + x.toFixed(1) + '" y="10" width="' + w.toFixed(1) + '" height="34" fill="' + s[2] + '" fill-opacity=".85"/>'; if (w > 34) g += txt(x + w / 2, 32, s[0], {s: 12, c: 'var(--paper)', halo: false}); } x += w; });
    for (let h = 0; h <= 24; h += 6) g += txt(10 + h / 24 * 580, 62, h + '时', {s: 11, c: 'var(--ink-3)', halo: false});
    svg.setAttribute('viewBox', '0 0 600 70'); svg.innerHTML = g;
    kv($('#chKv'), [['一天咀嚼', chew.toFixed(1) + ' 小时'], ['要吃下去', Math.round(intake) + ' 千卡'], ['吸收率', Math.round(eff * 100) + '%'], ['剩下的时间', free.toFixed(1) + ' 小时']]);
    $('#chSay').innerHTML = k === 0 ? '全吃生的：每天要嚼 ' + chew.toFixed(1) + ' 小时，和黑猩猩差不多；醒着的时候，一大半在吃和找吃的。没有多余的时间，也没有多余的能量去养一个大脑袋。' :
      k < 0.6 ? '一部分熟食：嚼的时间已经明显少了，但还离不开整天找吃的。' :
      '大部分吃熟的：每天嚼不到 ' + Math.ceil(chew) + ' 小时，吃得也少了三成。多出来的 ' + free.toFixed(1) + ' 小时可以打猎、做工具、带孩子，以及在火堆旁讲故事。代价是：每天得有人去拾柴、看火，火种不能灭。';
  }
  draw();
});
