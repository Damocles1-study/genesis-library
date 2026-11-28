/* ---------- 第七章：油漆桶（递归、自己的栈、队列） ---------- */
dev('#fillFig', fig => {
  const map = $('#flMap7'), kvb = $('.kv', fig), say = $('.say', fig);
  let mode = 0, grid, order, timer = null, speed = 220;
  btnRow($('[data-m]', fig), ['递归', '自己的栈', '队列（一圈一圈）'], 0, i => { mode = i; reset(); });
  function reset(){ if (timer) clearTimeout(timer); timer = null; grid = isleGrid(ISLAND); order = {}; draw(); kv(kvb, [['涂了几格', 0], ['现在叠了几层', 0], ['最多叠了几层', 0]]); say.textContent = '点一格水（湖在左下）或者一块草地。'; }
  function draw(cur){ isleDraw(map, grid, {mark: (x, y) => cur && cur[0] === x && cur[1] === y ? 'hl' : '', label: (x, y) => order[x + ',' + y] || '', click: (x, y) => start(x, y)}); }
  // 先把整个过程算成一串“事件”，再一帧一帧放出来
  function start(x0, y0){
    if (timer) return;
    const old = grid[y0][x0];
    if (old !== '~' && old !== '.') { say.textContent = '点一格水或者草地。'; return; }
    const nw = old === '~' ? ':' : '#';
    const g = grid.map(r => r.slice()); const ev = []; let depth = 0, maxd = 0;
    const H = g.length, W = g[0].length;
    if (mode === 0) {
      const rec = (x, y) => { depth++; maxd = Math.max(maxd, depth); if (y >= 0 && y < H && x >= 0 && x < W && g[y][x] === old) { g[y][x] = nw; ev.push([x, y, depth]); rec(x + 1, y); rec(x - 1, y); rec(x, y + 1); rec(x, y - 1); } depth--; };
      rec(x0, y0);
    } else {
      const todo = [[x0, y0]];
      while (todo.length) {
        maxd = Math.max(maxd, todo.length);
        const [x, y] = mode === 1 ? todo.pop() : todo.shift();
        if (y < 0 || y >= H || x < 0 || x >= W || g[y][x] !== old) continue;
        g[y][x] = nw; ev.push([x, y, todo.length]);
        todo.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }
    let k = 0;
    const tick = () => {
      if (k >= ev.length) { timer = null; draw(); say.textContent = '涂完了：' + ev.length + ' 格。' + (mode === 0 ? '递归最多叠了 ' + maxd + ' 层（每一层是栈上的一个盘子，包括碰到终点马上回去的那些）。' : mode === 1 ? '自己的栈里最多同时放了 ' + maxd + ' 个格子。顺序和递归很像：一条路走到头再回来。' : '队列里最多同时排了 ' + maxd + ' 个格子。注意涂的顺序：一圈一圈往外，和第五章倒水一样。'); kv(kvb, [['涂了几格', ev.length], ['现在叠了几层', 0], [mode === 0 ? '最多叠了几层' : mode === 1 ? '栈里最多几个' : '队里最多几个', maxd]]); return; }
      const [x, y, d] = ev[k]; grid[y][x] = nw; order[x + ',' + y] = ++k;
      draw([x, y]);
      kv(kvb, [['涂了几格', k], [mode === 0 ? '现在叠了几层' : mode === 1 ? '栈里还有几个' : '队里还有几个', d], [mode === 0 ? '最多叠了几层' : mode === 1 ? '栈里最多几个' : '队里最多几个', maxd]]);
      timer = setTimeout(tick, speed);
    };
    say.textContent = (old === '~' ? '把连着的水涂成沙……' : '把连着的草地涂成石头……') + (mode === 0 ? '递归：每涂一格，就去叫右、左、下、上四个邻居。' : mode === 1 ? '自己的栈：后放进去的先拿出来。' : '队列：先放进去的先拿出来。');
    tick();
  }
  $('[data-x="fast"]', fig).addEventListener('click', () => { speed = speed > 60 ? 40 : 220; $('[data-x="fast"]', fig).textContent = speed > 60 ? '快一点' : '慢一点'; });
  $('[data-x="r"]', fig).addEventListener('click', reset);
  reset();
});
