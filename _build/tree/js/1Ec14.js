/* ---------- 第十四章：数岛（并查集） ---------- */
dev('#ufFig', fig => {
  const map = $('#ufMap'), kvb = $('.kv', fig), say = $('.say', fig);
  let grid, P, groups, steps;
  const key = (x, y) => y * 100 + x;
  const find = a => { let r = a, s = 0; while (P[r] !== r) { r = P[r]; s++; } while (P[a] !== r) { const t = P[a]; P[a] = r; a = t; } steps += s; return r; };
  const unite = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) { P[ra] = rb; groups--; return true; } return false; };
  const land = (x, y) => grid[y] && grid[y][x] !== undefined && grid[y][x] !== '~';
  function rebuild(){ P = {}; groups = 0; steps = 0; for (let y = 0; y < grid.length; y++) for (let x = 0; x < grid[0].length; x++) if (land(x, y)) { P[key(x, y)] = key(x, y); groups++; } for (let y = 0; y < grid.length; y++) for (let x = 0; x < grid[0].length; x++) if (land(x, y)) { if (land(x + 1, y)) unite(key(x, y), key(x + 1, y)); if (land(x, y + 1)) unite(key(x, y), key(x, y + 1)); } }
  function draw(hl){
    const roots = {}; let k = 0; const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let y = 0; y < grid.length; y++) for (let x = 0; x < grid[0].length; x++) if (land(x, y)) { const r = find(key(x, y)); if (!(r in roots)) roots[r] = L[k++ % 26]; }
    isleDraw(map, grid, {label: (x, y) => land(x, y) ? roots[find(key(x, y))] : '', mark: (x, y) => hl && hl[0] === x && hl[1] === y ? 'hl' : '', click});
    kv(kvb, [['岛的个数', groups], ['陆地格子', Object.keys(P).length]]);
  }
  function click(x, y){
    if (x === 0 || y === 0 || x === grid[0].length - 1 || y === grid.length - 1) { say.textContent = '最外面一圈是大海，留着吧。'; return; }
    if (grid[y][x] === '~') {
      grid[y][x] = '='; P[key(x, y)] = key(x, y); groups++; steps = 0; let joined = 0;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (land(x + dx, y + dy) && unite(key(x, y), key(x + dx, y + dy))) joined++; });
      draw([x, y]);
      say.textContent = '在 (' + x + ', ' + y + ') 搭了一块桥。它先自己成一座“岛”，再和四周的陆地合并：' + (joined === 0 ? '四周没有陆地，多了一座小岛。' : joined === 1 ? '接上了一座岛，个数不变。' : '把 ' + joined + ' 座岛连成了一座，少了 ' + (joined - 1) + ' 座！') + ' 一共只改了 ' + joined + ' 张纸条。';
    } else {
      grid[y][x] = '~'; rebuild(); draw([x, y]);
      say.textContent = '挖成了水。并查集不会“拆开”，只好全部重新合并一遍（真实程序里，挖比搭难办得多）。现在有 ' + groups + ' 座岛。';
    }
  }
  $('[data-x="river"]', fig).addEventListener('click', () => { for (let y = 1; y < grid.length - 1; y++) grid[y][9] = '~'; rebuild(); draw(); say.textContent = '在第 9 列从上到下挖了一条河：现在有 ' + groups + ' 座岛。点河上的一格搭座桥试试。'; });
  $('[data-x="r"]', fig).addEventListener('click', () => { grid = isleGrid(ISLAND); rebuild(); draw(); say.textContent = '现在有 ' + groups + ' 座岛（湖不算岛，湖周围的陆地连成一片）。'; });
  grid = isleGrid(ISLAND); rebuild(); draw(); say.textContent = '现在有 ' + groups + ' 座岛。点水格搭桥，点陆地挖成水。';
});
