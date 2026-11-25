/* ---------- 装置 21：水能送到几楼 ---------- */
dev('#gsFig', () => {
  const FH = 3, LOSS = 0.002, G = 0.0098, PMIN = 0.05, PMAX = 0.35;
  const MODE = ['只靠城市管网', '加水泵分区', '加屋顶水箱'];
  let k = 0;
  btnRow($('#gsBtns'), MODE, k, i => { k = i; draw(); });
  const P = slider('gsP', v => v.toFixed(2) + ' 兆帕', () => draw());
  const N = slider('gsN', v => v + ' 层', () => draw());
  function draw(){
    const p0 = P(), n = N();
    const tapH = i => (i - 1) * FH + 1; // 第 i 层龙头离地高度
    const city = i => p0 - (G + LOSS) * tapH(i);
    const pr = [], src = [];
    let direct = 0; for (let i = 1; i <= n; i++) if (city(i) >= PMIN) direct = i;
    for (let i = 1; i <= n; i++) {
      if (k === 0 || i <= direct) { pr.push(city(i)); src.push(0); continue; }
      if (k === 1) { // 每 10 层一个区，区顶压力 0.10
        const z = Math.floor((i - direct - 1) / 10), top = Math.min(n, direct + (z + 1) * 10);
        pr.push(0.10 + G * (tapH(top) - tapH(i))); src.push(1 + z);
      } else { // 屋顶水箱，水面高出屋面 3 米
        const ht = n * FH + 3;
        pr.push((G - LOSS) * (ht - tapH(i))); src.push(9);
      }
    }
    const W = 440, rowH = Math.max(4, Math.min(12, 330 / n)), H = 40 + n * rowH;
    const bx = 150, sc = 250 / 0.6;
    let g = '';
    [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].forEach(v => g += '<line x1="' + (bx + v * sc) + '" x2="' + (bx + v * sc) + '" y1="16" y2="' + (H - 18) + '" stroke="var(--rule)"/>' + txt(bx + v * sc, 12, v.toFixed(1), {s: 10, c: 'var(--ink-3)', halo: false}));
    g += '<rect x="' + (bx + PMIN * sc) + '" y="16" width="' + ((PMAX - PMIN) * sc) + '" height="' + (H - 34) + '" fill="var(--grn)" opacity=".08"/>';
    let low = 0, high = 0;
    for (let i = 1; i <= n; i++) {
      const y = H - 18 - i * rowH, p = pr[i - 1];
      const col = p < PMIN ? 'var(--red)' : p > PMAX ? 'var(--och)' : 'var(--grn)';
      if (p < PMIN) low++; if (p > PMAX) high++;
      g += '<rect x="20" y="' + y + '" width="90" height="' + (rowH - 1) + '" fill="' + (src[i - 1] === 0 ? 'var(--main)' : src[i - 1] === 9 ? 'var(--kraft)' : 'var(--ter)') + '" opacity="' + (0.25 + (src[i - 1] % 2) * 0.2) + '"/>';
      g += '<rect x="' + bx + '" y="' + y + '" width="' + Math.max(1, Math.max(0, p) * sc) + '" height="' + (rowH - 1) + '" fill="' + col + '"/>';
      if (n <= 20 || i % 5 === 0 || i === 1) g += txt(116, y + rowH - 2, i + '', {s: 9.5, a: 'start', c: 'var(--ink-3)', halo: false});
    }
    if (k === 2) g += '<rect x="40" y="' + (H - 18 - n * rowH - 12) + '" width="40" height="10" fill="var(--kraft)"/>' + txt(60, H - 18 - n * rowH - 14, '水箱', {s: 10, c: 'var(--ink-2)'});
    g += txt(65, H - 4, '楼（颜色是水从哪来）', {s: 10, c: 'var(--ink-3)', halo: false}) + txt(bx + 125, H - 4, '各层龙头的水压（兆帕），绿底是好用的范围', {s: 10, c: 'var(--ink-3)', halo: false});
    const svg = $('#gsSvg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const pumps = k === 1 ? Math.max(0, Math.ceil((n - direct) / 10)) : k === 2 ? (n > direct ? 1 : 0) : 0;
    kv($('#gsKv'), [['管网直接送到', direct + ' 层'], ['水压不够的楼层', low + ' 层'], ['水压太大的楼层', high + ' 层'], ['要几套水泵', pumps + ' 套']]);
    const s = $('#gsSay');
    s.className = 'say' + (low > 0 ? ' bad' : high > 0 ? '' : ' ok');
    s.innerHTML = k === 0 ? (low ? '城市管网只能把水送到 ' + direct + ' 层，再往上龙头就没水了。<b>所以老城区五六层的楼不用水泵，再高就不行</b>。' : '这栋楼不高，城市管网的压力足够，每层都有水。') + (high ? '低层的压力偏大，要装减压阀，不然龙头一开就“炸”。' : '') :
      k === 1 ? '低层直接用管网，往上每十层一个区，各有一套水泵，区顶留一点余压。<b>中国的高层住宅大多这样做</b>，地下室的泵房一停电，高区就没水。' + (high ? '区里最低的几层压力偏大，要靠减压阀。' : '') :
      '水泵把水打到楼顶的水箱，再靠重力往下流：' + (low ? '<b>最上面几层离水面太近，水压不够</b>，纽约的老楼常常给顶层再加一台小泵。' : '每层都有水。') + (high ? '最底下的楼层压力太大，要减压。' : '') + '水箱的好处是停电了还能撑一阵。';
  }
  draw();
});
