/* ---------- 装置 9：以材为祖 ---------- */
dev('#cfFig', () => {
  /* [等, 广寸, 厚寸, 用途]，《营造法式》卷四 */
  const C = [
    ['一等', 9, 6, '殿身九间至十一间'], ['二等', 8.25, 5.5, '殿身五间至七间'], ['三等', 7.5, 5, '殿身三间至五间，或厅堂七间'],
    ['四等', 7.2, 4.8, '殿三间，厅堂五间'], ['五等', 6.6, 4.4, '殿小三间，厅堂大三间'], ['六等', 6, 4, '亭榭或小厅堂'],
    ['七等', 5.25, 3.5, '小殿及亭榭'], ['八等', 4.5, 3, '殿内藻井，或小亭榭施铺作多者']
  ];
  const CUN = 3.1; // 宋一寸约 3.1 厘米
  let cur = 0;
  btnRow($('#cfBtns'), C.map(c => c[0] + '材'), cur, i => { cur = i; draw(); });
  /* 斗拱正立面，单位是“分”，原点在柱顶中线；[x, y(往上), 宽, 高, 名字] */
  const PARTS = [
    [-16, 0, 32, 20, '栌斗'],
    [-31, 12, 62, 15, '泥道拱'],
    [-38, 27, 14, 10, '散斗'], [-7, 27, 14, 10, ''], [24, 27, 14, 10, ''],
    [-46, 37, 92, 15, '慢拱'],
    [-53, 52, 14, 10, ''], [-7, 52, 14, 10, ''], [39, 52, 14, 10, ''],
    [-70, 62, 140, 15, '柱头枋']
  ];
  function draw(){
    const c = C[cur], fen = c[1] * CUN / 15; // 1 分 = 多少厘米
    const big = C[0][1] * CUN / 15, PX = 1.15 / big * 2.2; // 一等材时 1 分约 2.5 像素
    const k = fen * PX, base = 300, cx = 220;
    let g = '';
    // 柱子：直径约 42 分
    g += '<rect x="' + (cx - 21 * k) + '" y="' + base + '" width="' + 42 * k + '" height="' + (330 - base) + '" fill="var(--ter)" fill-opacity=".35" stroke="var(--ink-2)"/>';
    PARTS.forEach(p => {
      const x = cx + p[0] * k, y = base - (p[1] + p[3]) * k;
      const isGong = /拱/.test(p[4]);
      if (isGong) { const r = 4 * k; g += '<path d="M' + x + ',' + (y) + 'h' + p[2] * k + 'v' + (p[3] * k - r) + 'q0,' + r + ' -' + r + ',' + r + 'h-' + (p[2] * k - 2 * r) + 'q-' + r + ',0 -' + r + ',-' + r + 'z" fill="var(--kraft)" fill-opacity=".5" stroke="var(--ink-2)" stroke-width="1"/>'; }
      else g += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (p[2] * k).toFixed(1) + '" height="' + (p[3] * k).toFixed(1) + '" fill="var(--kraft)" fill-opacity="' + (p[4] === '柱头枋' ? .3 : .65) + '" stroke="var(--ink-2)" stroke-width="1"/>';
      if (p[4]) g += txt(cx + (p[0] + p[2]) * k + 6, y + p[3] * k / 2 + 4, p[4] + ' ' + p[2] + '×' + p[3] + '分', {s: 10.5, a: 'start', c: 'var(--ink-2)'});
    });
    // 一米七的人
    const hp = 170 * PX, hx = 545;
    g += '<circle cx="' + hx + '" cy="' + (330 - hp + hp * .07) + '" r="' + hp * .07 + '" fill="var(--ink-3)"/><rect x="' + (hx - hp * .09) + '" y="' + (330 - hp * .86) + '" width="' + hp * .18 + '" height="' + hp * .86 + '" rx="' + hp * .05 + '" fill="var(--ink-3)"/>';
    g += txt(hx, 344, '人 1.7 米', {s: 11, c: 'var(--ink-3)', halo: false});
    g += '<line x1="20" x2="580" y1="330" y2="330" stroke="var(--ink)" stroke-width="1"/>';
    const top = base - 77 * k;
    g += '<line x1="' + (cx - 90 * k) + '" x2="' + (cx - 90 * k) + '" y1="' + top + '" y2="' + base + '" stroke="var(--ink-3)"/>' + txt(cx - 90 * k - 4, (top + base) / 2, (77 * fen).toFixed(0) + ' 厘米', {s: 11, a: 'end', c: 'var(--ink-2)'});
    const svg = $('#cfSvg'); svg.setAttribute('viewBox', '0 0 600 350'); svg.innerHTML = g;
    kv($('#cfKv'), [['材', c[1] + '×' + c[2] + ' 寸 ≈ ' + (c[1] * CUN).toFixed(0) + '×' + (c[2] * CUN).toFixed(0) + ' 厘米'], ['一分', fen.toFixed(2) + ' 厘米'], ['这组斗拱高', (77 * fen / 100).toFixed(2) + ' 米'], ['用在', c[3]]]);
    $('#cfSay').innerHTML = c[0] + '材：一“分”约 ' + fen.toFixed(2) + ' 厘米，这组斗拱约 ' + (77 * fen / 100).toFixed(2) + ' 米高，' + (cur < 3 ? '比人还高，是大殿用的。' : cur < 6 ? '和人差不多高。' : '只有半人高，用在亭子和藻井里。') +
      ' 一等材和八等材的斗拱，<b>样子一模一样，只是整体缩放了 ' + (C[0][1] / C[7][1]).toFixed(0) + ' 倍</b>。工匠只要记住“泥道拱长六十二分”，不管拿到哪一等材，都能算出该锯多长。';
  }
  draw();
});
