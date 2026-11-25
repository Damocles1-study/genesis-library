/* ---------- 装置 25：你住的房子：一张时间表 ---------- */
dev('#yhFig', () => {
  /* [名字, 保护层 mm, 碳化系数倍数, 隐含碳 t/m²] */
  const ST = [['钢筋混凝土', 25, 1, 0.45], ['砖混（砖墙加预制板）', 20, 1.2, 0.35], ['钢结构', 0, 0, 0.55], ['木结构', 0, 0, 0.25]];
  const CARE = [['维护得好', 2.5, 30], ['一般', 3.5, 20], ['差：漏水、乱改', 5, 10]]; // [名, 碳化系数 mm/√年, 锈到开裂的年数]
  const NOW = 2026, PERCAP = 8; // 中国人均年排放约 8 吨，约数
  let st = 0, care = 1;
  btnRow($('#yhBtns'), ST.map(x => x[0]), st, i => { st = i; draw(); });
  btnRow($('#yhCare'), CARE.map(x => x[0]), care, i => { care = i; draw(); });
  const Y = slider('yhY', v => v + ' 年', () => draw());
  const A = slider('yhA', v => v + ' 平方米', () => draw());
  function draw(){
    const y = Y(), a = A(), s = ST[st], c = CARE[care];
    const age = NOW - y;
    const ev = [];
    ev.push([y, '建成', 'var(--ink)']);
    ev.push([y + 30, '很多房子在这个岁数被拆', 'var(--ink-3)']);
    ev.push([y + 50, '设计使用年限到', 'var(--main)']);
    const land = y >= 1992 ? y - 2 + 70 : null;
    if (land) ev.push([land, '土地使用权到期，自动续期', 'var(--kraft)']);
    let rust = null, crack = null;
    if (s[1]) { const k = c[1] * s[2]; rust = Math.round(y + Math.pow(s[1] / k, 2)); crack = rust + c[2]; ev.push([rust, '碳化到钢筋，开始有锈的风险', 'var(--och)']); ev.push([crack, '可能开裂、剥落', 'var(--red)']); }
    ev.push([NOW, '今天', 'var(--ter)']);
    const x0 = 1950, x1 = 2160, W = 600, L = 20, R = 20;
    const X = t => L + (t - x0) / (x1 - x0) * (W - L - R);
    const sorted = ev.slice().sort((p, q) => p[0] - q[0]);
    const H = 70 + sorted.length * 22;
    let g = '';
    for (let t = 1950; t <= 2150; t += 25) g += '<line x1="' + X(t) + '" x2="' + X(t) + '" y1="26" y2="' + (H - 4) + '" stroke="var(--rule)"/>' + txt(X(t), 18, t, {s: 10.5, c: 'var(--ink-3)', halo: false});
    g += '<rect x="' + X(y) + '" y="32" width="' + (X(Math.min(x1, Math.max(crack || 0, land || 0, y + 80))) - X(y)) + '" height="16" rx="3" fill="var(--main)" opacity=".12"/>';
    g += '<rect x="' + X(y) + '" y="32" width="' + Math.max(2, X(NOW) - X(y)) + '" height="16" rx="3" fill="var(--main)" opacity=".5"/>';
    sorted.forEach((e, i) => {
      const yy = 66 + i * 22, xx = X(Math.min(x1, e[0]));
      g += '<line x1="' + xx + '" x2="' + xx + '" y1="40" y2="' + (yy - 4) + '" stroke="' + e[2] + '" stroke-width="1.4" stroke-dasharray="' + (e[1] === '今天' ? '0' : '3 2') + '"/>';
      g += '<circle cx="' + xx + '" cy="40" r="4" fill="' + e[2] + '"/>';
      const right = xx < W * 0.62;
      g += txt(xx + (right ? 6 : -6), yy, e[0] + ' · ' + e[1], {s: 11.5, a: right ? 'start' : 'end', c: e[2]});
    });
    const svg = $('#yhSvg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const co2 = a * s[3];
    kv($('#yhKv'), [['楼龄', age + ' 年'], ['设计年限', age < 50 ? '还剩 ' + (50 - age) + ' 年' : '已过 ' + (age - 50) + ' 年'], ['你家盖出来约排放', co2.toFixed(0) + ' 吨 CO₂'], ['相当于中国人均', (co2 / PERCAP).toFixed(1) + ' 年的排放']]);
    const say = $('#yhSay');
    let t = '';
    if (st === 2) t = '钢结构不怕碳化，怕锈：外露的钢构件要定期重刷防腐涂料，大约十几二十年一次；防火涂层也要保持完好。<b>钢结构的寿命，基本就是它的油漆被照顾得怎么样</b>。';
    else if (st === 3) t = '木结构最怕水和白蚁。保持干燥、通风，木房子能用几百年，第一部第二章讲过的法隆寺已经一千三百多年；一旦长期漏水，几年就能烂掉一根梁。';
    else t = (rust <= NOW ? '按这个粗略的估算，钢筋那一层大约在 ' + rust + ' 年前后就已经被碳化走到了。' : '按这个粗略的估算，碳化大约要到 ' + rust + ' 年前后才走到钢筋。') +
      (care === 2 ? '漏水、乱凿保护层，会让一栋楼老得快得多。' : care === 0 ? '<b>维护得好，一栋钢筋混凝土楼过了五十年设计年限，照样可以安全地用下去</b>，只要定期检查、该修就修。' : '室内干燥的地方即使碳化到了钢筋，也锈得很慢；要盯紧的是阳台、外墙、卫生间和地下室。') +
      (st === 1 ? '砖混楼的预制板保护层薄，老楼里常见板底露筋。' : '');
    say.className = 'say' + (care === 2 ? ' bad' : care === 0 ? ' ok' : '');
    say.innerHTML = t + (land ? '' : ' 这栋楼建于九十年代以前，多半是公房或房改房，土地使用权的情况要看当时的政策，图上没画。');
  }
  draw();
});

/* 工牌总表：按章节 / 按年代 */
dev('#bgTable', tb => {
  const body = $('tbody', tb), rows = $$('tr', body);
  btnRow($('#bgBtns'), ['按章节排', '按年代排'], 0, i => {
    const list = i ? rows.slice().sort((a, b) => +a.dataset.y - +b.dataset.y) : rows;
    list.forEach(r => body.appendChild(r));
  });
});
