/* ---------- 第五章：倒一桶水（广度优先）；循环队列 ---------- */
dev('#pourFig', fig => {
  const map = $('#pfMap'), qb = $('#pfQ'), say = $('.say', fig);
  let grid, dist, q, src, done;
  function reset(){ grid = isleGrid(ISLAND); dist = {}; q = []; src = null; done = false; draw(); say.textContent = '点一块草地，在那里倒水。'; }
  function draw(cur){
    const inq = {}; q.forEach(c => inq[c[0] + ',' + c[1]] = 1);
    isleDraw(map, grid, {mark: (x, y) => (inq[x + ',' + y] ? 'q' : '') + (cur && cur[0] === x && cur[1] === y ? ' hl' : ''), label: (x, y) => dist[x + ',' + y] !== undefined ? String(dist[x + ',' + y]) : '', click: (x, y) => { if (src) return; if (grid[y][x] !== '.') { say.textContent = '要倒在草地上。'; return; } src = [x, y]; grid[y][x] = '~'; dist[x + ',' + y] = 0; q = [[x, y]]; draw(); say.textContent = '倒水的那一格变成水，排进队（第 0 圈）。点“走一步”。'; }});
    qb.innerHTML = q.length ? '<span class="dim" style="border:0">队头 →</span>' + q.slice(0, 18).map((c, k) => '<span class="' + (k === 0 ? 'hl' : '') + '">' + c[0] + ',' + c[1] + '<small>第 ' + dist[c[0] + ',' + c[1]] + ' 圈</small></span>').join('') + (q.length > 18 ? '<span class="dim">…还有 ' + (q.length - 18) + ' 个</span>' : '') : (src ? '<span class="dim" style="border:0">队列空了</span>' : '');
  }
  function step(){
    if (!src) { say.textContent = '先点一块草地倒水。'; return false; }
    if (!q.length) { if (!done) { done = true; say.textContent = '队列空了：所有连着的草地都变成了水。数字最大的格子离倒水点最远。'; } return false; }
    const [x, y] = q.shift(); const added = [];
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (grid[ny] && grid[ny][nx] === '.') { grid[ny][nx] = '~'; dist[nx + ',' + ny] = dist[x + ',' + y] + 1; q.push([nx, ny]); added.push(nx + ',' + ny); } });
    draw([x, y]);
    say.textContent = '从队头拿出 (' + x + ',' + y + ')（第 ' + dist[x + ',' + y] + ' 圈）。' + (added.length ? '它的草地邻居 ' + added.join('、') + ' 变成水，排到队尾。' : '它周围没有草地了。');
    return true;
  }
  $('[data-x="s"]', fig).addEventListener('click', step);
  $('[data-x="all"]', fig).addEventListener('click', () => { let k = 0; while (step() && k++ < 500); });
  $('[data-x="r"]', fig).addEventListener('click', reset);
  reset();
});
dev('#ringFig', fig => {
  const svg = $('svg.ring', fig), kvb = $('.kv', fig), say = $('.say', fig);
  const M = 8; let data, front, rear, nk;
  function reset(){ data = Array(M).fill(null); front = rear = 0; nk = 1; draw(); say.textContent = 'front = rear = 0：队列是空的。'; }
  function draw(){
    const cx = 150, cy = 105, R = 78; let h = '';
    for (let i = 0; i < M; i++) {
      const a0 = (i / M) * 2 * Math.PI - Math.PI / 2 - Math.PI / M, a1 = a0 + 2 * Math.PI / M;
      const p = (r, a) => (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1);
      const filled = data[i] !== null;
      h += '<path d="M' + p(R + 22, a0) + ' A' + (R + 22) + ',' + (R + 22) + ' 0 0 1 ' + p(R + 22, a1) + ' L' + p(R - 18, a1) + ' A' + (R - 18) + ',' + (R - 18) + ' 0 0 0 ' + p(R - 18, a0) + 'Z" fill="' + (filled ? 'color-mix(in srgb,var(--ter) 25%,var(--card))' : 'var(--card)') + '" stroke="var(--rule)"/>';
      const am = (a0 + a1) / 2;
      h += txt(cx + R * Math.cos(am), cy + R * Math.sin(am) + 5, filled ? data[i] : '', {s: 15, w: 1, mono: 1});
      h += txt(cx + (R + 34) * Math.cos(am), cy + (R + 34) * Math.sin(am) + 4, i, {s: 11, c: 'var(--ink-3)'});
    }
    const mark = (i, color, lab, dr) => { const am = (i / M) * 2 * Math.PI - Math.PI / 2; return '<circle cx="' + (cx + (R - 34 - dr) * Math.cos(am)).toFixed(1) + '" cy="' + (cy + (R - 34 - dr) * Math.sin(am)).toFixed(1) + '" r="9" fill="' + color + '"/>' + txt(cx + (R - 34 - dr) * Math.cos(am), cy + (R - 34 - dr) * Math.sin(am) + 4, lab, {s: 10, c: '#fff', halo: false, w: 1}); };
    h += mark(front, 'var(--l2)', 'f', 0) + mark(rear, 'var(--on)', 'r', front === rear ? 20 : 0);
    svg.innerHTML = h;
    const len = (rear - front + M) % M;
    kv(kvb, [['front', front], ['rear', rear], ['长度 (rear−front+8)%8', len], ['空？front==rear', front === rear ? '是' : '否'], ['满？(rear+1)%8==front', (rear + 1) % M === front ? '是' : '否']]);
  }
  $('[data-x="in"]', fig).addEventListener('click', () => { if ((rear + 1) % M === front) { say.textContent = '满了：rear 的下一个就是 front。还空着一格（第 ' + rear + ' 格），这就是“牺牲一个单元”：不然满和空都是 front == rear，分不清。'; return; } data[rear] = nk++; say.textContent = '把 ' + data[rear] + ' 放进第 ' + rear + ' 格，rear 往前走一格：(' + rear + ' + 1) % 8 = ' + ((rear + 1) % M) + '。'; rear = (rear + 1) % M; draw(); });
  $('[data-x="out"]', fig).addEventListener('click', () => { if (front === rear) { say.textContent = '空的：front == rear。'; return; } const v = data[front]; data[front] = null; say.textContent = '从第 ' + front + ' 格拿出 ' + v + '，front 往前走一格。'; front = (front + 1) % M; draw(); });
  $('[data-x="r"]', fig).addEventListener('click', reset);
  reset();
});
