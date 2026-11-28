/* ---------- 第十七章：团团来找你（BFS / DFS） ---------- */
const WALK = '.:=';
function gridNb(g, x, y){ const out = []; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (g[ny] && g[ny][nx] !== undefined && WALK.includes(g[ny][nx])) out.push([nx, ny]); }); return out; }
dev('#chaseFig', fig => {
  const map = $('#chMap'), kvb = $('.kv', fig), say = $('.say', fig);
  const S = [12, 6], T = [7, 3];
  let mode = 0, grid, order = {}, path = {}, timer = null;
  btnRow($('[data-m]', fig), ['广度优先（队列）', '深度优先（栈）'], 0, i => { mode = i; clearRun(); draw(); });
  function clearRun(){ if (timer) clearTimeout(timer); timer = null; order = {}; path = {}; }
  function draw(cur){ isleDraw(map, grid, {px: T[0], py: T[1], mobs: [S], label: (x, y) => order[x + ',' + y] && !(x === S[0] && y === S[1]) ? String(order[x + ',' + y]) : '', mark: (x, y) => (path[x + ',' + y] ? 'path' : '') + (cur && cur[0] === x && cur[1] === y ? ' hl' : ''), click: (x, y) => { if (timer) return; if ((x === S[0] && y === S[1]) || (x === T[0] && y === T[1])) return; if (grid[y][x] === '.') grid[y][x] = '#'; else if (grid[y][x] === '#' && ISLAND[y][x] !== '#') grid[y][x] = '.'; else return; clearRun(); draw(); say.textContent = '改了地图。再点“找”。'; }}); }
  function reset(){ clearRun(); grid = isleGrid(ISLAND); draw(); kv(kvb, [['看了几格', 0], ['找到的路', '—']]); say.textContent = '团团在 (12, 6)，你在 (7, 3)。点“找”。'; }
  function go(){
    if (timer) return; clearRun();
    const g = grid.map(r => r.slice()); g[T[1]][T[0]] = '.';
    const ev = [], came = {}; const k0 = S.join(','); came[k0] = null;
    if (mode === 0) { const q = [S]; while (q.length) { const c = q.shift(); ev.push(c); if (c[0] === T[0] && c[1] === T[1]) break; gridNb(g, c[0], c[1]).forEach(n => { const k = n.join(','); if (!(k in came)) { came[k] = c.join(','); q.push(n); } }); } }
    else { const st = [S]; const seen = {}; while (st.length) { const c = st.pop(); const k = c.join(','); if (seen[k]) continue; seen[k] = 1; ev.push(c); if (c[0] === T[0] && c[1] === T[1]) break; gridNb(g, c[0], c[1]).reverse().forEach(n => { const nk = n.join(','); if (!seen[nk]) { came[nk] = k; st.push(n); } }); } }
    let i = 0;
    const tick = () => {
      if (i >= ev.length) {
        const tk = T.join(',');
        if (!(tk in came) || !ev.some(c => c.join(',') === tk)) { say.textContent = '走遍了能走到的格子，也没找到你：路被堵死了。'; kv(kvb, [['看了几格', ev.length], ['找到的路', '没有']]); timer = null; return; }
        let c = tk, steps = 0; while (c) { path[c] = 1; c = came[c]; steps++; }
        draw(); timer = null;
        kv(kvb, [['看了几格', ev.length], ['找到的路', (steps - 1) + ' 步']]);
        say.textContent = mode === 0 ? '找到了！广度优先一圈一圈往外，第一次碰到你时走的就是最短的路：' + (steps - 1) + ' 步。红框是顺着“从哪来”倒着画出来的。' : '找到了，可是这条路 ' + (steps - 1) + ' 步：深度优先一条路走到黑，找到的路不一定最短。换成广度优先比一比。';
        return;
      }
      const c = ev[i]; order[c.join(',')] = ++i; draw(c);
      kv(kvb, [['看了几格', i], ['找到的路', '找着呢……']]);
      timer = setTimeout(tick, 90);
    };
    tick();
  }
  $('[data-x="go"]', fig).addEventListener('click', go);
  $('[data-x="r"]', fig).addEventListener('click', reset);
  reset();
});
