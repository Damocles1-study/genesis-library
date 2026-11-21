/* ---------- 装置 45：运河省下多少海路 ---------- */
dev('#canalFig', fig => {
  // [名称, 绕道海里, 运河海里, 绕道路径, 运河路径]（经纬度粗描）
  const NY = [-74, 40.4], SF = [-122.5, 37.7], LV = [-3.2, 53.4], VP = [-71.7, -33];
  const HORN = [[-65, 30], [-48, 8], [-34.5, -6], [-39, -20], [-50, -34], [-64, -47], [-66, -56.3], [-74, -54], [-76, -46], [-73, -36]];
  const PAC_N = [[-80, -5], [-88, 6], [-106, 16], [-119, 30]];
  // 世界示意图的北美西海岸太粗，这里补一块（墨西哥西岸、下加利福尼亚、加州到阿拉斯加南部）
  const WEST = [[-105, 20], [-106, 23], [-110, 24], [-109.5, 23], [-112, 26.5], [-114.5, 30], [-117, 32.5], [-120.5, 34.5], [-122.5, 37.7], [-124, 40.5], [-124.5, 43], [-124, 46.5], [-124.7, 48.4], [-123, 49], [-127, 51], [-130, 55], [-130, 56], [-105, 56]];
  const CANAL = [[-75, 28], [-77, 18], [-79.9, 9.4], [-79.5, 8.8]];
  const R = [
    ['纽约 → 旧金山', 13135, 5262, [NY].concat(HORN, PAC_N, [SF]), [NY].concat(CANAL, [[-88, 11], [-106, 17], [-119, 30], SF])],
    ['利物浦 → 旧金山', 13502, 7836, [LV, [-12, 45], [-20, 25]].concat(HORN.slice(1), PAC_N, [SF]), [LV, [-15, 45], [-40, 30], [-62, 18]].concat(CANAL.slice(2), [[-88, 11], [-106, 17], [-119, 30], SF])],
    ['纽约 → 瓦尔帕莱索（智利）', 8380, 4633, [NY].concat(HORN.slice(0, 9), [VP]), [NY].concat(CANAL, [[-81, 0], [-78, -15], VP])]
  ];
  const m = worldMap({lon0: -130, lon1: 5, lat0: -58, lat1: 56, W: 600});
  let route = 0;
  btnRow($('#cnRoute'), R.map(r => r[0]), 0, i => { route = i; go(); });
  const K = $('#cnK'); K.addEventListener('input', go);
  const path = pts => 'M' + pts.map(p => m.P(p[0], p[1]).map(v => v.toFixed(1)).join(',')).join('L');
  function go(){
    const r = R[route], k = +K.value;
    $('#cnKo').textContent = k + ' 节';
    let g = m.svg + '<path d="' + m.poly(WEST) + '" fill="var(--land)" stroke="var(--ink-3)" stroke-width=".6" stroke-linejoin="round"/>';
    g += '<path d="' + path(r[3]) + '" fill="none" stroke="var(--red)" stroke-width="2.4" stroke-dasharray="6 4" stroke-linejoin="round"/>';
    g += '<path d="' + path(r[4]) + '" fill="none" stroke="var(--main)" stroke-width="3" stroke-linejoin="round"/>';
    const pan = m.P(-79.7, 9.1); g += '<circle cx="' + pan[0] + '" cy="' + pan[1] + '" r="5" fill="var(--och)" stroke="var(--ink)"/>' + txt(pan[0] + 8, pan[1] + 14, '巴拿马', {s: 12, a: 'start', w: 1});
    const hn = m.P(-67, -56); g += txt(hn[0] + 6, hn[1] + 4, '合恩角', {s: 12, a: 'start'});
    [[r[3][0], 'start'], [r[3][r[3].length - 1], 'end']].forEach(q => { const p = m.P(q[0][0], q[0][1]); g += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="var(--ink)"/>'; });
    const a = m.P(r[3][0][0], r[3][0][1]), b = m.P(r[3][r[3].length - 1][0], r[3][r[3].length - 1][1]);
    const nm = r[0].split(' → ');
    g += txt(a[0] + (route === 1 ? -6 : 6), a[1] - 8, nm[0], {s: 12, a: route === 1 ? 'end' : 'start', w: 1}) + txt(b[0] + 6, b[1] - 8, nm[1].replace('（智利）', ''), {s: 12, a: 'start', w: 1});
    g += '<rect x="8" y="' + (m.H - 44) + '" width="12" height="3" fill="var(--red)"/>' + txt(26, m.H - 39, '绕过合恩角', {s: 11.5, a: 'start'}) + '<rect x="8" y="' + (m.H - 24) + '" width="12" height="3" fill="var(--main)"/>' + txt(26, m.H - 19, '穿过巴拿马运河', {s: 11.5, a: 'start'});
    const svg = $('#cnSvg'); svg.setAttribute('viewBox', '0 0 ' + m.W + ' ' + m.H); svg.innerHTML = g;
    const d1 = r[1] / (k * 24), d2 = r[2] / (k * 24);
    kv($('#cnKV'), [['绕道', r[1].toLocaleString() + ' 海里 · ' + d1.toFixed(0) + ' 天'], ['走运河', r[2].toLocaleString() + ' 海里 · ' + d2.toFixed(0) + ' 天'], ['省下', Math.round((1 - r[2] / r[1]) * 100) + '% · ' + (d1 - d2).toFixed(0) + ' 天']]);
    const say = $('#cnSay');
    say.className = 'say ok';
    say.innerHTML = [
      '<b>美国自己的东西两岸，绕道要走一万三千多海里。</b>1898 年美西战争爆发时，战列舰“俄勒冈号”从旧金山出发去古巴参战，绕过南美洲走了六十七天，赶到的时候仗差不多打完了。这件事让国会下定了修运河的决心：<em>一支海军，不能每次都要用两个月才从一个大洋赶到另一个大洋</em>。',
      '<b>运河也是给全世界修的。</b>欧洲到北美西海岸、到南美西海岸的航程都缩短了将近一半。美国按船的吨位收过路费（1914 年每净吨一美元多），1999 年运河交给巴拿马以后，过路费成了巴拿马政府最大的收入之一。',
      '<b>智利的硝石和铜，原来要绕过麦哲伦海峡运到纽约。</b>运河一通，南美洲的西海岸离美国东部的工厂一下子近了一半，美国的商品、银行和投资也一起近了一半。运河修在“后院”的正中间，<em>门罗主义从此有了一根实实在在的门闩</em>。'][route];
  }
  go();
});
