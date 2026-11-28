/* ---------- 第十九章：修路（克鲁斯卡尔、普里姆） ---------- */
dev('#mstFig', fig => {
  const svg = $('svg.mst', fig), kvb = $('.kv', fig), say = $('.say', fig);
  let mode = 0, state;
  btnRow($('[data-m]', fig), ['克鲁斯卡尔', '普里姆（从家开始）'], 0, i => { mode = i; reset(); });
  function reset(){
    const order = ROADS.map((e, i) => i).sort((a, b) => ROADS[a][2] - ROADS[b][2] || a - b);
    const P = {}; PLACES.forEach(p => P[p] = p);
    state = {order, k: 0, P, take: {}, skip: {}, inT: {'家': true}, total: 0, n: 0};
    draw(); kv(kvb, [['修了几条', 0], ['总长', 0]]);
    say.textContent = mode === 0 ? '所有路按长短排好：' + order.map(i => ROADS[i][0][0] + ROADS[i][1][0] + ROADS[i][2]).join('、') + '。点“下一步”。' : '从“家”开始。每一步在“连上的”和“没连上的”之间挑最短的路。';
  }
  const find = a => { while (state.P[a] !== a) a = state.P[a]; return a; };
  function draw(hl){ drawGraph(svg, {mark: v => mode === 1 ? (state.inT[v] ? 'ok' : '') : '', emark: i => i === hl ? 'hl' : state.take[i] ? 'ok' : state.skip[i] ? 'dim' : '', label: v => mode === 0 && state.n ? find(v)[0] : ''}); }
  function step(){
    if (state.n >= PLACES.length - 1) { say.textContent = '已经修了 ' + state.n + ' 条，所有地方都连上了。总长 ' + state.total + '。'; return; }
    if (mode === 0) {
      const i = state.order[state.k++], [a, b, w] = ROADS[i];
      if (find(a) === find(b)) { state.skip[i] = 1; draw(i); say.textContent = a + '—' + b + '（' + w + '）：两头已经连着了（队长都是' + find(a) + '），修了会成圈，跳过。'; return; }
      state.P[find(a)] = find(b); state.take[i] = 1; state.n++; state.total += w; draw(i);
      say.textContent = a + '—' + b + '（' + w + '）：两头还不连着，修！' + (state.n === PLACES.length - 1 ? '修够 5 条了，停。总长 ' + state.total + '。' : '');
    } else {
      let best = -1; ROADS.forEach((e, i) => { if (state.inT[e[0]] !== state.inT[e[1]] && (best < 0 || e[2] < ROADS[best][2])) best = i; });
      const [a, b, w] = ROADS[best], nw = state.inT[a] ? b : a;
      const cands = ROADS.filter(e => state.inT[e[0]] !== state.inT[e[1]]).map(e => e[0][0] + e[1][0] + e[2]).join('、');
      state.inT[nw] = true; state.take[best] = 1; state.n++; state.total += w; draw(best);
      say.textContent = '跨在两边的路有：' + cands + '。最短的是 ' + a + '—' + b + '（' + w + '），把' + nw + '拉进来。' + (state.n === PLACES.length - 1 ? '所有地方都连上了，总长 ' + state.total + '。' : '');
    }
    kv(kvb, [['修了几条', state.n], ['总长', state.total]]);
  }
  $('[data-x="s"]', fig).addEventListener('click', step);
  $('[data-x="r"]', fig).addEventListener('click', reset);
  reset();
});
