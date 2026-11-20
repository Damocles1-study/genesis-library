/* ---------- 装置 6：谁从你门口过 ---------- */
dev('#laneFig', fig => {
  const N = 13, C = 20, GX = 6, GY = 12; // 13×13 格；偶数坐标是路口，城门在底边正中
  const NETS = ['方格', '主街 + 死胡同', '自己长出来的弯巷'];
  const svg = $('#laneSvg');
  let net = 0, street, houses, dist, cnt, pick = null;
  const key = (x, y) => y * N + x;
  function build(){
    street = new Uint8Array(N * N);
    const node = (x, y) => street[key(x, y)] = 1;
    const edge = (x1, y1, x2, y2) => { node(x1, y1); node(x2, y2); street[key((x1 + x2) / 2, (y1 + y2) / 2)] = 1; };
    if (net === 0) { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (x % 2 === 0 || y % 2 === 0) street[key(x, y)] = 1; }
    else if (net === 1) {
      for (let y = 0; y < N - 2; y += 2) edge(GX, y, GX, y + 2);          // 一条南北主街
      [2, 6, 10].forEach(y => { for (let x = 0; x < N - 2; x += 2) edge(x, y, x + 2, y); }); // 两边伸出去的死胡同
    } else {
      const R = rng(41), seen = new Set(), stack = [[GX, GY]]; seen.add(key(GX, GY)); node(GX, GY);
      while (stack.length) {
        const [x, y] = stack[stack.length - 1];
        const nb = [[2, 0], [-2, 0], [0, 2], [0, -2]].map(d => [x + d[0], y + d[1]]).filter(p => p[0] >= 0 && p[1] >= 0 && p[0] < N && p[1] < N && !seen.has(key(p[0], p[1])));
        if (!nb.length) { stack.pop(); continue; }
        const p = nb[Math.floor(R() * nb.length)]; seen.add(key(p[0], p[1])); edge(x, y, p[0], p[1]); stack.push(p);
      }
      for (let k = 0; k < 4; k++) { const x = 2 * Math.floor(R() * 6), y = 2 * Math.floor(R() * 6); edge(x, y, x + 2, y); }
    }
    // 从城门做广度优先搜索
    dist = new Int16Array(N * N).fill(-1); const par = new Int16Array(N * N).fill(-1);
    const q = [key(GX, GY)]; dist[q[0]] = 0;
    for (let h = 0; h < q.length; h++) { const c = q[h], x = c % N, y = (c / N) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const nx = x + d[0], ny = y + d[1]; if (nx < 0 || ny < 0 || nx >= N || ny >= N) return; const k = key(nx, ny); if (street[k] && dist[k] < 0) { dist[k] = dist[c] + 1; par[k] = c; q.push(k); } }); }
    // 人家：奇数坐标的格子；门开在离城门最近的那条路上
    houses = []; cnt = new Int16Array(N * N);
    for (let y = 1; y < N; y += 2) for (let x = 1; x < N; x += 2) {
      let best = -1;
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(d => { const nx = x + d[0], ny = y + d[1]; if (nx < 0 || ny < 0 || nx >= N || ny >= N) return; const k = key(nx, ny); if (street[k] && dist[k] >= 0 && (best < 0 || dist[k] < dist[best])) best = k; });
      if (best >= 0) houses.push({x, y, door: best});
    }
    houses.forEach(h => { let c = h.door; while (c >= 0) { cnt[c]++; c = par[c]; } });
    houses.forEach(h => { h.pass = cnt[h.door] - houses.filter(o => o.door === h.door).length; h.d = dist[h.door] + 1; });
  }
  function draw(){
    const maxc = Math.max(...cnt);
    let s = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const k = key(x, y);
      if (street[k]) s += '<rect x="' + x * C + '" y="' + y * C + '" width="' + C + '" height="' + C + '" fill="var(--och)" fill-opacity="' + (0.08 + 0.55 * cnt[k] / maxc).toFixed(2) + '"/>';
    }
    const mp = Math.max(1, ...houses.map(h => h.pass));
    houses.forEach(h => {
      const t = h.pass / mp;
      s += '<rect data-h="' + h.x + ',' + h.y + '" x="' + (h.x * C + 2) + '" y="' + (h.y * C + 2) + '" width="' + (C - 4) + '" height="' + (C - 4) + '" rx="2" fill="var(--red)" fill-opacity="' + (0.06 + t * 0.7).toFixed(2) + '" stroke="var(--ink)" stroke-width="' + (pick === h ? 2.6 : 1) + '" style="cursor:pointer"/>';
      const dx = (h.door % N) - h.x, dy = ((h.door / N) | 0) - h.y;
      s += '<line x1="' + (h.x * C + C / 2 + dx * 7) + '" y1="' + (h.y * C + C / 2 + dy * 7) + '" x2="' + (h.x * C + C / 2 + dx * 9.5) + '" y2="' + (h.y * C + C / 2 + dy * 9.5) + '" stroke="var(--ink)" stroke-width="3"/>';
    });
    if (pick) { let c = pick.door; const pts = []; while (c >= 0) { pts.push([(c % N) * C + C / 2, ((c / N) | 0) * C + C / 2]); const x = c % N, y = (c / N) | 0; let nxt = -1; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const nx = x + d[0], ny = y + d[1]; if (nx < 0 || ny < 0 || nx >= N || ny >= N) return; const k = key(nx, ny); if (street[k] && dist[k] === dist[c] - 1 && nxt < 0) nxt = k; }); c = dist[c] === 0 ? -1 : nxt; } s += '<polyline points="' + pts.map(p => p.join(',')).join(' ') + ' ' + (GX * C + C / 2) + ',' + (N * C + 10) + '" fill="none" stroke="var(--main)" stroke-width="2.5" stroke-dasharray="4 3"/>'; }
    s += '<rect x="' + (GX * C) + '" y="' + (N * C) + '" width="' + C + '" height="14" fill="var(--brk)"/><text x="' + (GX * C + C / 2) + '" y="' + (N * C + 24) + '" font-size="11" text-anchor="middle" fill="var(--ink)">城门</text>';
    svg.innerHTML = s;
  }
  function stats(){
    const avgD = houses.reduce((a, h) => a + h.d, 0) / houses.length;
    const avgP = houses.reduce((a, h) => a + h.pass, 0) / houses.length;
    const quiet = houses.filter(h => h.pass <= 2).length;
    kv($('#laneKV'), [['到城门平均', f1(avgD) + ' 步'], ['最远一户', Math.max(...houses.map(h => h.d)) + ' 步'], ['门口平均过路', f1(avgP) + ' 人/天'], ['门前清静的户数', quiet + ' / ' + houses.length]]);
  }
  const NOTE = [
    '方格：哪儿都通，路最短，可几乎每户门口都有人过，越靠近城门的街越挤。',
    '主街加死胡同：死胡同里的人家非常清静，可人人都得先走到主街上，再一起挤向城门；胡同尽头那几户离城门最远。',
    '自己长出来的弯巷：有的人家藏在很深的弯里，几乎没人经过；有的人家正好在几条巷子汇合的地方，门口天天像赶集。要绕的路也最多。'
  ];
  btnRow($('#laneNet'), NETS, 0, i => { net = i; pick = null; build(); draw(); stats(); $('#laneSay').innerHTML = NOTE[i] + '<br>点一户人家看看。'; });
  svg.addEventListener('click', e => {
    const t = e.target.closest('[data-h]'); if (!t) return;
    const [x, y] = t.dataset.h.split(',').map(Number); pick = houses.find(h => h.x === x && h.y === y); draw();
    const S = $('#laneSay');
    S.className = 'say' + (pick.pass > 15 ? ' bad' : pick.pass <= 2 ? ' ok' : '');
    S.innerHTML = '这户人家走到城门要 <b>' + pick.d + ' 步</b>，每天有 <b>' + pick.pass + '</b> 户别人家的人从它门口经过。' + (pick.pass > 15 ? '门口是一条大路：开店不错，住着嫌吵。' : pick.pass <= 2 ? '几乎没有外人经过，清静，但' + (pick.d > 14 ? '出门要绕很远。' : '出门也不算远，挺划算。') : '不算吵，也不算静。');
  });
  build(); draw(); stats(); $('#laneSay').innerHTML = NOTE[0] + '<br>点一户人家看看。';
});
