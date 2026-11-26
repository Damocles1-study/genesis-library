
/* ---------- 序幕：一格有多大 ---------- */
dev('#sizeFig', () => {
  const PRE = [
    ['你的卧室', 4, 3, 3, '大约 3.5 × 3 米，高 2.8 米'],
    ['一间教室', 9, 7, 4, '大约 9 × 7 米，高 3.5 米'],
    ['篮球场', 28, 15, 1, '28 × 15 米，地面只算一格厚'],
    ['六层住宅楼', 40, 12, 18, '一层大约 3 米'],
    ['天坛祈年殿', 32, 32, 38, '圆形的殿，直径约 32 米，高约 38 米'],
    ['太和殿', 64, 37, 35, '故宫最大的殿，连台基高约 35 米'],
    ['埃菲尔铁塔', 125, 125, 330, '底座约 125 米见方，高约 330 米；它是镂空的，真要盖用不了这么多块']
  ];
  const sv = $('#sizeSvg');
  let note = PRE[0][4], busy = false;
  const time = sec => sec < 60 ? Math.round(sec) + ' 秒' : sec < 3600 ? Math.round(sec / 60) + ' 分钟' : sec < 86400 ? (sec / 3600).toFixed(1) + ' 小时' : (sec / 86400).toFixed(1) + ' 天';
  function draw(){
    if (busy) return;
    const l = +$('#szL').value, w = +$('#szW').value, hh = +$('#szH').value;
    const solid = l * w * hh, shell = solid - Math.max(0, l - 2) * Math.max(0, w - 2) * Math.max(0, hh - 2);
    kv($('#sizeKv'), [['长 × 宽 × 高', l + ' × ' + w + ' × ' + hh + ' 格'], ['实心要用', fmt(solid) + ' 块'], ['只盖墙和顶', fmt(shell) + ' 块'], ['一秒放一块，盖墙和顶要', time(shell)]]);
    /* 正面图：长 × 高，每格一米，旁边站一个两格高的小人 */
    const W = 600, H = 280, cols = l + 3, cell = Math.min(24, (W - 20) / cols, (H - 30) / (hh + 1));
    const x0 = 10 + 2.2 * cell, y0 = H - 18;
    let g = '<rect x="' + x0 + '" y="' + (y0 - hh * cell) + '" width="' + (l * cell) + '" height="' + (hh * cell) + '" fill="color-mix(in srgb,var(--ter) 22%,var(--card))" stroke="var(--ter)" stroke-width="1.5"/>';
    if (cell >= 4) {
      for (let i = 1; i < l; i++) g += '<line x1="' + (x0 + i * cell) + '" x2="' + (x0 + i * cell) + '" y1="' + (y0 - hh * cell) + '" y2="' + y0 + '" stroke="var(--ter)" stroke-opacity=".35"/>';
      for (let j = 1; j < hh; j++) g += '<line x1="' + x0 + '" x2="' + (x0 + l * cell) + '" y1="' + (y0 - j * cell) + '" y2="' + (y0 - j * cell) + '" stroke="var(--ter)" stroke-opacity=".35"/>';
    }
    /* 小人：1.8 格高 */
    const px = 10 + cell, ph = 1.8 * cell, pw = Math.max(2, .6 * cell);
    g += '<rect x="' + (px - pw / 2) + '" y="' + (y0 - ph) + '" width="' + pw + '" height="' + (ph * .62) + '" fill="var(--blu)"/><rect x="' + (px - pw / 2) + '" y="' + (y0 - ph * .38) + '" width="' + pw + '" height="' + (ph * .38) + '" fill="var(--ink-2)"/><rect x="' + (px - pw / 2) + '" y="' + (y0 - ph - pw * .1) + '" width="' + pw + '" height="' + (pw) + '" fill="#c99a6b"/>';
    g += '<line x1="0" x2="' + W + '" y1="' + y0 + '" y2="' + y0 + '" stroke="var(--grass)" stroke-width="3"/>';
    g += txt(x0 + l * cell / 2, y0 + 14, l + ' 格', {s: 12, c: 'var(--ink-2)'}) + txt(x0 + l * cell + 6, y0 - hh * cell / 2, hh + ' 格', {s: 12, c: 'var(--ink-2)', a: 'start'});
    if (cell < 4) g += txt(W - 8, 16, '格子太小画不出来了：每一小格都是一米', {s: 11, a: 'end', c: 'var(--ink-3)'});
    sv.setAttribute('viewBox', '0 0 ' + W + ' ' + H); sv.innerHTML = g;
    const fit = hh <= 257 ? '从海边的地面往上盖，现在的世界放得下它（海边往上还有大约 257 格）。' : hh <= 384 ? '从海边盖放不下了；要从世界最底下（大约 −64 格）开始盖才行。' : '';
    $('#sizeSay').innerHTML = (note ? note + '。' : '') + fit + (shell > 86400 ? '一秒一块不停手，也要盖好几天：难怪很多人在服务器上一群人一起盖大建筑。' : '');
  }
  slider('szL', v => v + ' 米', () => { note = ''; draw(); });
  slider('szW', v => v + ' 米', () => { note = ''; draw(); });
  slider('szH', v => v + ' 米', () => { note = ''; draw(); });
  btnRow($('#sizePre'), PRE.map(p => p[0]), 0, i => {
    const p = PRE[i]; busy = true;
    $('#szL').value = p[1]; $('#szW').value = p[2]; $('#szH').value = p[3];
    ['szL', 'szW', 'szH'].forEach(id => $('#' + id).dispatchEvent(new Event('input')));
    busy = false; note = p[0] + '：' + p[4]; draw();
  });
  note = PRE[0][0] + '：' + PRE[0][4]; draw();
});
