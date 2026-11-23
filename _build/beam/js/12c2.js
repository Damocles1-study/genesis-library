/* ---------- 装置 3：隔多少年重建一次，手艺才传得下去 ---------- */
dev('#sgFig', () => {
  const T = slider('sgT', v => v + ' 年', () => draw());
  const SPAN = 45, Y0 = 0, Y1 = 240;
  function draw(){
    const t = T(), builds = [];
    for (let y = 0; y <= Y1; y += t) builds.push(y);
    const starts = []; for (let s = -45; s <= Y1; s += 4) starts.push(s);
    // 每次重建时：在场的人，各自以前干过几次
    let withExp = 0, withMaster = 0, counted = 0;
    builds.forEach(y => {
      if (y < 60) return; // 跳过开头的“冷启动”
      counted++;
      let e = 0, m = 0;
      starts.forEach(s => { if (y >= s && y <= s + SPAN) { const prior = builds.filter(b => b >= s && b < y).length; if (prior >= 1) e = 1; if (prior >= 2) m = 1; } });
      withExp += e; withMaster += m;
    });
    // 画图：显示 60—220 年这一段，挑 12 个木匠
    const svg = $('#sgSvg'), W = 600, X = y => 70 + (y - 60) / 160 * 510;
    const show = starts.filter(s => s >= 20 && s <= 190).filter((s, i) => i % 3 === 0).slice(0, 12);
    let g = '';
    builds.filter(b => b >= 60 && b <= 220).forEach(b => g += '<line x1="' + X(b) + '" x2="' + X(b) + '" y1="8" y2="' + (16 + show.length * 18) + '" stroke="var(--ter)" stroke-opacity=".5" stroke-dasharray="3 3"/>');
    show.forEach((s, i) => {
      const yy = 20 + i * 18, a = Math.max(s, 60), b = Math.min(s + SPAN, 220);
      if (b > a) g += '<line x1="' + X(a) + '" x2="' + X(b) + '" y1="' + yy + '" y2="' + yy + '" stroke="var(--ink-3)" stroke-width="5" stroke-linecap="round" stroke-opacity=".35"/>';
      let k = 0;
      builds.forEach(bd => { if (bd >= s && bd <= s + SPAN) { k++; if (bd >= 60 && bd <= 220) g += '<circle cx="' + X(bd) + '" cy="' + yy + '" r="5.5" fill="var(--main)" fill-opacity="' + (k === 1 ? .3 : k === 2 ? .65 : 1) + '" stroke="var(--main)"/>'; } });
      g += txt(62, yy + 4, '木匠' + (i + 1), {s: 10.5, a: 'end', c: 'var(--ink-3)', halo: false});
    });
    const H = 30 + show.length * 18;
    [60, 100, 140, 180, 220].forEach(y => g += txt(X(y), H, '第 ' + y + ' 年', {s: 10.5, c: 'var(--ink-3)', halo: false}));
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + (H + 6)); svg.innerHTML = g;
    const per = Math.floor(SPAN / t) + (SPAN % t ? 1 : 1);
    const pe = counted ? withExp / counted : 0, pm = counted ? withMaster / counted : 0;
    kv($('#sgKv'), [['一辈子赶上', (SPAN / t).toFixed(1) + ' 次左右'], ['现场有人干过', Math.round(pe * 100) + '%'], ['现场有“师傅”', Math.round(pm * 100) + '%']]);
    $('#sgSay').innerHTML = pm >= 0.99 ? '每 ' + t + ' 年一次：每次重建，现场都有干过两次以上的老师傅，还有干过一次的骨干和第一次来的学徒。<b>三代人同时在一个工地上</b>，手艺能一直传下去。伊势神宫的二十年就落在这一段。' :
      pe >= 0.99 ? '每 ' + t + ' 年一次：每次都有人干过，但很多时候找不到干过两次的人。手艺还在，只是一代比一代薄，要靠记录和口传补。' :
      pe > 0 ? '每 ' + t + ' 年一次：有些重建现场一个干过的人都没有，只能翻旧图纸、看旧房子去猜当年是怎么做的。' :
      '每 ' + t + ' 年一次：间隔超过了一个木匠的职业生涯，<b>每一次都是从头再来</b>。这就是很多古建筑“大修”时遇到的难题：上一次修它的人，早就不在了。';
  }
  draw();
});
