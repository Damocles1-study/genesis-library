/* ---------- 封面：先玩一玩方格岛 ---------- */
dev('#coverFig', fig => {
  const map = $('#cvMap'), bagEl = $('#cvBag'), say = $('.say', fig);
  let grid, px, py, mode, bag, undo, ducks, sel, busy;
  const MODES = ['走（第二章 · 数组）', '挖（第二十三章 · 散列表）', '放', '倒水（第五章 · 队列）', '撤销（第四章 · 栈）', '重来'];
  const NAMES = {'#': '石', 'T': '木', ':': '沙'};
  const BACK = {'石': '#', '木': 'T', '沙': ':'};
  function reset(){ grid = isleGrid(ISLAND); px = 7; py = 3; mode = 0; bag = {}; undo = []; ducks = [[6, 3], [5, 3], [5, 2]]; ducks = ducks.filter(d => grid[d[1]][d[0]] === '.'); sel = ''; busy = false; draw('你在岛上。用方向键走走看，三只小鸭子会跟着你（第三章 · 链表）。'); }
  function draw(msg){
    isleDraw(map, grid, {px, py, ducks});
    const ks = Object.keys(bag).filter(k => bag[k] > 0);
    if (!ks.includes(sel)) sel = ks[0] || '';
    bagEl.innerHTML = ks.length ? '背包：' + ks.map(k => '<span data-b="' + k + '" class="' + (k === sel ? 'on' : '') + '">' + k + ' × ' + bag[k] + '</span>').join('') : '<span class="dim" style="border:0">背包是空的</span>';
    if (msg) say.textContent = msg;
  }
  function step(dx, dy){
    if (busy) return;
    const nx = px + dx, ny = py + dy;
    if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) return;
    const t = grid[ny][nx];
    if (mode === 1) { // 挖
      if (!NAMES[t]) { draw('那里没有可以挖的东西。'); return; }
      undo.push({x: nx, y: ny, old: t, bag: NAMES[t], d: +1});
      grid[ny][nx] = '.'; bag[NAMES[t]] = (bag[NAMES[t]] || 0) + 1; sel = NAMES[t];
      draw('挖到一块' + NAMES[t] + '。背包是一个“名字 → 个数”的表：散列表。'); return;
    }
    if (mode === 2) { // 放
      if (!sel) { draw('背包是空的，先去挖点东西。'); return; }
      if (t !== '.' || (ducks.some(d => d[0] === nx && d[1] === ny))) { draw('只能放在空草地上。'); return; }
      undo.push({x: nx, y: ny, old: t, bag: sel, d: -1});
      grid[ny][nx] = BACK[sel]; bag[sel]--; draw('放下一块' + sel + '。'); return;
    }
    if (t !== '.' && t !== ':') { draw(t === '~' ? '前面是水，过不去。' : '前面是' + TILE[t] + '，过不去。换“挖”试试。'); return; }
    ducks.unshift([px, py]); ducks.pop();
    px = nx; py = ny;
    draw();
  }
  function pour(){
    if (busy) return;
    busy = true; undo.push({pour: grid.map(r => r.slice())});
    let q = [[px, py]], round = 0; const seen = {};
    seen[px + ',' + py] = 1;
    const tick = () => {
      if (!q.length || round >= 4) { busy = false; draw('水流了 ' + round + ' 圈。先到的先往外流：这就是队列，也是“广度优先”。'); return; }
      const nq = [];
      q.forEach(([x, y]) => { if (!(x === px && y === py)) grid[y][x] = '~'; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (!seen[k] && grid[ny] && grid[ny][nx] === '.' && !ducks.some(d => d[0] === nx && d[1] === ny)) { seen[k] = 1; nq.push([nx, ny]); } }); });
      q = nq; round++;
      isleDraw(map, grid, {px, py, ducks, mark: (x, y) => seen[x + ',' + y] && grid[y][x] !== '~' ? 'q' : ''});
      say.textContent = '第 ' + round + ' 圈：虚线框是排在队里、下一圈要流到的格子。';
      setTimeout(tick, 450);
    };
    tick();
  }
  function back(){
    if (busy) return;
    const u = undo.pop();
    if (!u) { draw('没有可以撤销的了。'); return; }
    if (u.pour) { grid = u.pour; draw('撤销了倒水。最后做的事最先撤销：这就是栈。'); return; }
    grid[u.y][u.x] = u.old; bag[u.bag] = (bag[u.bag] || 0) - u.d; draw('撤销了一步。最后做的事最先撤销：这就是栈。');
  }
  const mb = $('[data-m]', fig);
  mb.innerHTML = MODES.map((m, i) => '<button class="btn' + (i === 0 ? ' on' : '') + '" data-i="' + i + '">' + m + '</button>').join('');
  mb.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const i = +b.dataset.i;
    if (i === 3) { pour(); return; }
    if (i === 4) { back(); return; }
    if (i === 5) { reset(); $$('button', mb).forEach((x, k) => x.classList.toggle('on', k === 0)); return; }
    mode = i; $$('button', mb).forEach((x, k) => x.classList.toggle('on', k === i));
    draw(['走：方向键或按钮。', '挖：朝一块石头、树或沙走一步，就把它挖下来。', '放：朝一块空草地走一步，就把背包里选中的东西放下。点背包里的东西可以换一样。'][i]);
  });
  bagEl.addEventListener('click', e => { const s = e.target.closest('[data-b]'); if (s) { sel = s.dataset.b; draw(); } });
  $$('.pad button', fig).forEach(b => b.addEventListener('click', () => { const k = b.dataset.k; step(k === 'left' ? -1 : k === 'right' ? 1 : 0, k === 'up' ? -1 : k === 'down' ? 1 : 0); }));
  document.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    const r = fig.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const m = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1]}[e.key];
    if (m) { e.preventDefault(); step(m[0], m[1]); }
  });
  reset();
});
