/* ---------- 第二十章：合成顺序（拓扑排序） ---------- */
dev('#topoFig', fig => {
  const svg = $('svg.topo', fig), ordEl = $('#tpOrd'), say = $('.say', fig);
  const XY = {'木': [50, 45], '沙': [50, 140], '石': [50, 235], '木板': [210, 45], '玻璃': [210, 140], '石砖': [210, 235], '木棍': [380, 75], '灯': [450, 175], '小屋': [585, 140]};
  const BASE = [['木', '木板'], ['沙', '玻璃'], ['石', '石砖'], ['木板', '木棍'], ['玻璃', '灯'], ['木棍', '灯'], ['石砖', '小屋'], ['木板', '小屋'], ['灯', '小屋']];
  let E, indeg, done, order, cyc;
  function reset(c){ cyc = !!c; E = BASE.slice(); if (cyc) E.push(['木棍', '木']); indeg = {}; Object.keys(XY).forEach(v => indeg[v] = 0); E.forEach(e => indeg[e[1]]++); done = {}; order = []; draw(); say.textContent = cyc ? '配方写错了：木头要用木棍造（木棍 → 木），木棍又要用木板、木板要用木头。现在从头试试。' : '每样东西上面是“还差几样”。虚线框的现在就能做。'; }
  const ready = () => Object.keys(XY).filter(v => !done[v] && indeg[v] === 0);
  function draw(hl){ const rd = ready(); drawGraph(svg, {xy: XY, edges: E.map(e => [e[0], e[1]]), directed: true, H: 280, mark: v => v === hl ? 'hl' : done[v] ? 'ok' : rd.includes(v) ? 'q' : '', emark: i => done[E[i][0]] ? 'dim' : '', label: v => done[v] ? '' : String(indeg[v])}); ordEl.innerHTML = order.map((v, k) => '<span>' + v + '<small>' + (k + 1) + '</small></span>').join(''); }
  function step(){
    const rd = ready();
    if (!rd.length) { const left = Object.keys(XY).filter(v => !done[v]); say.textContent = left.length ? '没有“还差 0 样”的了，可还剩 ' + left.join('、') + ' 没做：它们在一个圈里互相等。排不出来！' : '全部做完了：' + order.join(' → ') + '。'; return false; }
    const v = rd[0]; done[v] = true; order.push(v); const dec = [];
    E.forEach(e => { if (e[0] === v) { indeg[e[1]]--; dec.push(e[1] + '（还差 ' + indeg[e[1]] + '）'); } });
    draw(v); say.textContent = '做' + v + '。' + (dec.length ? '用它的东西少差一样：' + dec.join('、') + '。' : '没有东西用它。') + (Object.keys(done).length === Object.keys(XY).length ? ' 全部做完了！' : '');
    return true;
  }
  $('[data-x="s"]', fig).addEventListener('click', step);
  $('[data-x="all"]', fig).addEventListener('click', () => { let k = 0; while (step() && k++ < 20); });
  $('[data-x="cyc"]', fig).addEventListener('click', () => reset(true));
  $('[data-x="r"]', fig).addEventListener('click', () => reset(false));
  reset(false);
});
