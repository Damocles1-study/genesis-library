
/* ---------- 第五章：世界变高了 ---------- */
dev('#heightFig', () => {
  const YEARS = [['2010 年', 0, 128, 64], ['2012 年', 0, 256, 64], ['2021 年以后', -64, 320, 63]];
  const BLD = [['教学楼', 20], ['祈年殿', 38], ['大雁塔', 64], ['应县木塔', 66], ['自由女神像', 93], ['胡夫金字塔', 146], ['埃菲尔铁塔', 330], ['上海中心', 632]];
  let yi = 2, base = 0;
  const sv = $('#heightSvg');
  function draw(){
    const y = YEARS[yi], bot = y[1], top = y[2], sea = y[3];
    const start = base ? bot : sea, room = top - start;
    const W = 600, H = 340, T = 16, B = 30, lo = -64, hi = 700;
    const Y = v => T + (hi - v) / (hi - lo) * (H - T - B);
    let g = '';
    /* 世界的柱子 */
    g += '<rect x="20" y="' + Y(top) + '" width="56" height="' + (Y(bot) - Y(top)) + '" fill="var(--sky)" stroke="var(--ink-3)"/>';
    g += '<rect x="20" y="' + Y(sea) + '" width="56" height="' + (Y(bot) - Y(sea)) + '" fill="var(--stn)" opacity=".75"/>';
    g += '<line x1="14" x2="' + (W - 6) + '" y1="' + Y(top) + '" y2="' + Y(top) + '" stroke="var(--zhu)" stroke-dasharray="5 4"/>' + txt(W - 8, Y(top) - 5, '天花板 ' + top, {s: 11, a: 'end', c: 'var(--zhu)'});
    g += '<line x1="14" x2="' + (W - 6) + '" y1="' + Y(sea) + '" y2="' + Y(sea) + '" stroke="var(--water)" stroke-width="1.5"/>' + txt(W - 8, Y(sea) + 13, '海平面 ' + sea, {s: 11, a: 'end', c: 'var(--blu)'});
    g += '<line x1="14" x2="' + (W - 6) + '" y1="' + Y(bot) + '" y2="' + Y(bot) + '" stroke="var(--ink-3)"/>' + txt(48, Y(bot) + 14, '最底下 ' + bot, {s: 11, c: 'var(--ink-3)'});
    g += txt(48, Y(top) - 5, y[0], {s: 12, w: true});
    /* 建筑 */
    let fits = [], no = [];
    BLD.forEach((b, i) => {
      const x = 100 + i * 61, hgt = b[1], ok = hgt <= room;
      const yTop = Y(Math.min(start + hgt, hi)), yBase = Y(start);
      (ok ? fits : no).push(b[0]);
      g += '<rect x="' + (x) + '" y="' + yTop + '" width="40" height="' + (yBase - yTop) + '" fill="' + (ok ? 'var(--main)' : 'var(--zhu)') + '" opacity="' + (ok ? .85 : .55) + '"/>';
      g += txt(x + 20, yTop - 16, b[0], {s: 10.5}) + txt(x + 20, yTop - 4, hgt + ' 米', {s: 10, c: 'var(--ink-3)'});
      if (!ok && start + hgt > top) g += '<line x1="' + x + '" x2="' + (x + 40) + '" y1="' + Y(top) + '" y2="' + Y(top) + '" stroke="var(--zhu)" stroke-width="3"/>';
    });
    sv.setAttribute('viewBox', '0 0 ' + W + ' ' + H); sv.innerHTML = g;
    $('#heightSay').innerHTML = y[0] + '，世界从 ' + bot + ' 到 ' + top + '。' + (base ? '从最底下' : '从海边') + '开始盖，能用的高度是 <b>' + room + ' 格</b>。放得下：' + (fits.join('、') || '一个也没有') + '。' + (no.length ? '放不下：' + no.join('、') + '。' : '全都放得下！');
  }
  btnRow($('#hYear'), YEARS.map(y => y[0]), 2, i => { yi = i; draw(); });
  btnRow($('#hBase'), ['从海边的地面盖', '从世界最底下盖'], 0, i => { base = i; draw(); });
  draw();
});
