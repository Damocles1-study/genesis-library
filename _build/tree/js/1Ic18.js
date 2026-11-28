/* ---------- 第十八章：迪杰斯特拉一步一步 ---------- */
dev('#dijFig', fig => {
  const svg = $('svg.dij', fig), tab = $('#djTab'), say = $('.say', fig);
  const adj = {}; PLACES.forEach(p => adj[p] = []); ROADS.forEach(([a, b, w]) => { adj[a].push([b, w]); adj[b].push([a, w]); });
  let dist, prev, done, rows, pick, cur;
  function reset(){ dist = {}; prev = {}; done = {}; PLACES.forEach(p => { dist[p] = Infinity; prev[p] = null; }); dist['家'] = 0; rows = []; cur = null; pick = null; draw(); say.textContent = '起点“家”写 0，别的都写 ∞。点“下一步”。'; }
  const fmt = v => v === Infinity ? '∞' : String(v);
  function draw(){
    const onPath = {}; const pathE = {};
    if (pick && dist[pick] < Infinity) { let p = pick; while (prev[p]) { onPath[p] = 1; pathE[[p, prev[p]].sort().join()] = 1; p = prev[p]; } onPath['家'] = 1; }
    drawGraph(svg, {mark: v => v === cur ? 'hl' : done[v] ? 'ok' : dist[v] < Infinity ? 'q' : '', label: v => fmt(dist[v]), emark: i => { const e = ROADS[i]; if (pick) return pathE[[e[0], e[1]].sort().join()] ? 'hl' : 'dim'; return (cur && (e[0] === cur || e[1] === cur)) ? 'hl' : ''; }, click: v => { if (Object.keys(done).length < PLACES.length) { say.textContent = '先把所有地方都定下来。'; return; } pick = v; draw(); let p = v, path = []; while (p) { path.unshift(p); p = prev[p]; } say.textContent = '家到' + v + '最短 ' + dist[v] + ' 步：' + path.join(' → ') + '。'; }});
    tab.innerHTML = '<table class="t c" style="font-size:13px"><tr><th>第几步</th><th>定下</th>' + PLACES.map(p => '<th>' + p + '</th>').join('') + '</tr>' + rows.map((r, k) => '<tr><td>' + (k + 1) + '</td><td><b>' + r.pick + '</b></td>' + PLACES.map(p => '<td' + (r.fix[p] ? ' style="color:var(--l1);font-weight:700"' : '') + '>' + r.d[p] + '</td>').join('') + '</tr>').join('') + '</table>';
  }
  function step(){
    const left = PLACES.filter(p => !done[p]);
    if (!left.length) { say.textContent = '全部定下了。点一个地方看最短的路。'; return; }
    let u = left[0]; left.forEach(p => { if (dist[p] < dist[u]) u = p; });
    done[u] = true; cur = u; const changed = [];
    adj[u].forEach(([v, w]) => { if (!done[v] && dist[u] + w < dist[v]) { changed.push(v + ' ' + fmt(dist[v]) + '→' + (dist[u] + w)); dist[v] = dist[u] + w; prev[v] = u; } });
    const d = {}, fix = {}; PLACES.forEach(p => { d[p] = done[p] && p !== u ? '—' : fmt(dist[p]) + (prev[p] && p !== '家' && !done[p] ? '（' + prev[p][0] + '）' : ''); fix[p] = p === u; });
    d[u] = fmt(dist[u]);
    rows.push({pick: u, d, fix}); pick = null; draw();
    say.textContent = '没定下的里面，' + u + ' 最小（' + dist[u] + '），定下它。' + (changed.length ? '经过它更近的：' + changed.join('，') + '。' : '经过它没有让谁更近。') + (Object.keys(done).length === PLACES.length ? ' 全部定下了，点一个地方看路。' : '');
  }
  $('[data-x="s"]', fig).addEventListener('click', step);
  $('[data-x="r"]', fig).addEventListener('click', reset);
  reset();
});
