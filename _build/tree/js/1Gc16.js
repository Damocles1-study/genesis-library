/* ---------- 第十六章：岛上的地点和路 ---------- */
/* 公用：六个地方的图（第十六—二十章都用） */
const PLACES = ['家', '湖边', '石山', '沙滩', '树林', '码头'];
const PLACE_XY = {'家': [90, 70], '湖边': [90, 210], '石山': [300, 45], '沙滩': [330, 220], '树林': [320, 132], '码头': [550, 150]};
const ROADS = [['家', '湖边', 4], ['家', '石山', 3], ['家', '树林', 5], ['湖边', '沙滩', 6], ['石山', '树林', 2], ['树林', '沙滩', 4], ['沙滩', '码头', 2], ['石山', '码头', 9]];
/* 画一张小图：opt {edges, directed, mark(v)->类名, emark(i)->类名, label(v)->小字, click(v), H} */
function drawGraph(svg, opt){
  const H = opt.H || 260; svg.setAttribute('viewBox', '0 0 640 ' + H);
  const xy = opt.xy || PLACE_XY, edges = opt.edges || ROADS; let h = '<defs><marker id="arrowG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)"/></marker></defs>';
  edges.forEach((e, i) => { const a = xy[e[0]], b = xy[e[1]], m = opt.emark ? opt.emark(i) : ''; const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L; const x1 = a[0] + ux * 29, y1 = a[1] + uy * 29, x2 = b[0] - ux * 31, y2 = b[1] - uy * 31;
    h += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (m === 'hl' ? 'var(--main)' : m === 'ok' ? 'var(--l1)' : m === 'dim' ? 'var(--rule)' : 'var(--ink-3)') + '" stroke-width="' + (m === 'hl' || m === 'ok' ? 4 : 1.8) + '"' + (opt.directed ? ' marker-end="url(#arrowG)"' : '') + '/>';
    if (e[2] !== undefined) h += txt((a[0] + b[0]) / 2 - uy * 13, (a[1] + b[1]) / 2 + ux * 13 + 5, e[2], {s: 16, c: 'var(--ink-2)', w: 1}); });
  Object.keys(xy).forEach(v => { const [x, y] = xy[v], m = opt.mark ? opt.mark(v) : ''; h += '<circle cx="' + x + '" cy="' + y + '" r="28" fill="' + (m === 'hl' ? 'var(--main)' : m === 'ok' ? 'var(--l1)' : m === 'v' ? 'color-mix(in srgb,var(--ter) 30%,var(--card))' : m === 'q' ? 'color-mix(in srgb,var(--main) 15%,var(--card))' : 'var(--card)') + '" stroke="var(--ter)" stroke-width="1.6"' + (m === 'q' ? ' stroke-dasharray="4 3"' : '') + ' data-v="' + v + '" style="cursor:pointer"/>' + txt(x, y + 5.5, v, {s: 16, c: (m === 'hl' || m === 'ok') ? 'var(--paper)' : 'var(--ink)', halo: false, w: 1}); if (opt.label) { const l = opt.label(v); if (l !== '' && l != null) h += txt(x, y - 34, l, {s: 15, c: 'var(--main)', w: 1}); } });
  svg.innerHTML = h;
  if (opt.click && !svg._clk) { svg._clk = 1; svg.addEventListener('click', ev => { const c = ev.target.closest('[data-v]'); if (c) svg._onclick(c.dataset.v); }); }
  if (opt.click) svg._onclick = opt.click;
}
dev('#graphFig', fig => {
  const svg = $('svg.gview', fig), al = $('.adjl', fig), am = $('.adjm', fig), say = $('.say', fig), db = $('[data-x="dir"]', fig);
  let dir = false, sel = null;
  function draw(){
    const nb = v => ROADS.filter(e => e[0] === v || (!dir && e[1] === v)).map(e => e[0] === v ? [e[1], e[2]] : [e[0], e[2]]);
    drawGraph(svg, {directed: dir, mark: v => v === sel ? 'hl' : sel && nb(sel).some(x => x[0] === v) ? 'v' : '', emark: i => sel && (ROADS[i][0] === sel || (!dir && ROADS[i][1] === sel)) ? 'hl' : '', click: v => { sel = v; draw(); const n = nb(v); say.textContent = v + (dir ? ' 出发能直接到：' : ' 连着：') + (n.length ? n.map(x => x[0] + '（' + x[1] + '）').join('、') : '哪儿也去不了') + '。' + (dir ? '出度' : '度') + '是 ' + n.length + '。'; }});
    al.innerHTML = PLACES.map(v => '<div style="font-size:13.5px;font-family:var(--f-mono);' + (v === sel ? 'color:var(--main);font-weight:700' : '') + '">' + v + ' → ' + (nb(v).map(x => x[0] + ' ' + x[1]).join('，') || '∅') + '</div>').join('');
    const M = PLACES.map(a => PLACES.map(b => { const e = ROADS.find(x => (x[0] === a && x[1] === b) || (!dir && x[0] === b && x[1] === a)); return e ? e[2] : 0; }));
    am.innerHTML = '<table class="t c" style="font-family:var(--f-mono);font-size:12.5px"><tr><th></th>' + PLACES.map(p => '<th>' + p[0] + '</th>').join('') + '</tr>' + PLACES.map((p, i) => '<tr' + (p === sel ? ' style="background:var(--hl)"' : '') + '><th>' + p + '</th>' + M[i].map(v => '<td>' + (v || '·') + '</td>').join('') + '</tr>').join('') + '</table>';
  }
  db.addEventListener('click', () => { dir = !dir; db.textContent = '单行道：' + (dir ? '开' : '关'); draw(); say.textContent = dir ? '每条路只能顺着箭头走。表格不再对称：家→湖边有路，湖边→家没有。' : '无向图：表格沿对角线对称。'; });
  draw(); say.textContent = '点一个地方看看。';
});
