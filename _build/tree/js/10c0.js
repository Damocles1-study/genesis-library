/* ---------- 第零章：格子的门牌号 ---------- */
dev('#gridFig', fig => {
  const map = $('#gdMap'), kvb = $('.kv', fig), say = $('.say', fig);
  const grid = isleGrid(ISLAND);
  let pick = null, quiz = null;
  const r = rng(7);
  function draw(){
    isleDraw(map, grid, {px: 7, py: 3, mark: (x, y) => pick && pick[0] === x && pick[1] === y ? 'hl' : '', click: (x, y) => {
      pick = [x, y];
      if (quiz) {
        const ok = x === quiz[0] && y === quiz[1];
        say.textContent = ok ? '对了！grid[' + y + '][' + x + ']：第 ' + y + ' 行、第 ' + x + ' 列。再点“出题”来一题。' : '这一格是 grid[' + y + '][' + x + ']。题目要的是 grid[' + quiz[1] + '][' + quiz[0] + ']：先往下数 ' + quiz[1] + ' 行，再往右数 ' + quiz[0] + ' 格（都从 0 数）。';
        if (ok) quiz = null;
      } else say.textContent = (x === 7 && y === 3 ? '这是你。' : '这一格是' + (TILE[grid[y][x]] || '') + '。') + '先往下数 ' + y + ' 行，再往右数 ' + x + ' 格。';
      kv(kvb, [['x（第几列）', x], ['y（第几行）', y], ['Python 写法', 'grid[' + y + '][' + x + ']'], ['里面是', grid[y][x] === '.' && x === 7 && y === 3 ? '@' : grid[y][x]]]);
      draw();
    }});
  }
  $('[data-x="q"]', fig).addEventListener('click', () => {
    quiz = [1 + Math.floor(r() * 14), 1 + Math.floor(r() * 8)];
    say.textContent = '请点 grid[' + quiz[1] + '][' + quiz[0] + ']。';
  });
  kv(kvb, [['x（第几列）', '—'], ['y（第几行）', '—'], ['Python 写法', '点一格看看'], ['里面是', '—']]);
  say.textContent = '点地图上的任意一格。';
  draw();
});
