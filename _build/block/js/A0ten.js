/* ================= 第十部 · 程：各章装置 ================= */
const out1 = o => o.out.join('\n');
const hasOut = (o, s) => o.out.some(l => l.includes(s));
const noErr = o => !o.err;
dev('#playBox', box => pyBox(box, {world: true, code: '# 在小地上盖一座塔\nfor y in range(6):\n    setblock(4, y, 4, "stone")\nsetblock(4, 6, 4, "gold_block")\nprint("塔盖好了，一共", 7, "层")', ex: [
  ['你好', 'name = "小格"\nprint("你好，" + name)\nprint(f"{name} 今年 10 岁，明年 {10 + 1} 岁")'],
  ['一座塔', 'for y in range(6):\n    setblock(4, y, 4, "stone")\nsetblock(4, 6, 4, "gold_block")'],
  ['一面墙', 'for x in range(10):\n    for y in range(4):\n        setblock(x, y, 0, "oak_planks")'],
  ['彩虹', 'colors = ["red", "orange", "yellow", "lime", "light_blue", "blue", "purple"]\nfor i in range(len(colors)):\n    for x in range(10):\n        setblock(x, i, 9 - i, colors[i] + "_wool")'],
  ['金字塔', 'for level in range(5):\n    for x in range(level, 9 - level):\n        for z in range(level, 9 - level):\n            setblock(x, level, z, "sand")'],
  ['猜数', 'import random\nsecret = random.randint(1, 100)\nprint("我想好了一个 1 到 100 的数")\nlow, high = 1, 100\ntries = 0\nwhile True:\n    guess = (low + high) // 2\n    tries += 1\n    print("猜", guess)\n    if guess == secret:\n        break\n    elif guess < secret:\n        low = guess + 1\n    else:\n        high = guess - 1\nprint(f"猜中了！是 {secret}，一共猜了 {tries} 次")'],
  ['乘法表', 'for a in range(1, 10):\n    line = ""\n    for b in range(1, a + 1):\n        line = line + f"{b}×{a}={a*b} "\n    print(line)']
]}));
const host = (id, o) => dev(id, f => pyBox($('.pyhost', f), o));
const colCount = w => { let n = 0; w.blocks.forEach((v, k) => { if (v !== 'air' && k.startsWith('4,') && k.endsWith(',4')) n++; }); return n; };
const blkCount = w => { let n = 0; w.blocks.forEach(v => { if (v !== 'air') n++; }); return n; };

host('#py72', {code: 'coins = 10\nprint(coins)\ncoins = coins + 5\nprint(coins)\nname = "小格"\nprint(f"{name} 有 {coins} 个金币")', tasks: [
  {t: '建一个变量 <code>diamonds</code>，让它等于 3', ok: o => o.vars.diamonds === 3},
  {t: '让 <code>coins</code> 最后变成 100（用加法或者 +=）', ok: o => o.vars.coins === 100},
  {t: '算出 6 × 4，放进变量 <code>area</code>', ok: o => o.vars.area === 24},
  {t: '用 <code>int("64")</code> 把字符串变成数，乘以 9，打出 576', ok: o => hasOut(o, '576') && /int\(/.test(o.code)},
  {t: '用 f 字符串打出“我有 3 颗钻石”（3 要用变量 diamonds）', ok: o => /\{\s*diamonds\s*\}/.test(o.code) && o.out.some(l => /我有\s*3\s*颗钻石/.test(l))}
]});
host('#py73', {code: 'time = 14000\nif time < 12000:\n    print("白天")\nelif time < 13000:\n    print("傍晚")\nelse:\n    print("晚上，小心怪物")', tasks: [
  {t: '只改 time 的值，让它打出“白天”', ok: o => hasOut(o, '白天')},
  {t: '让它打出“傍晚”', ok: o => hasOut(o, '傍晚')},
  {t: '加一个变量 <code>light = 0</code>，如果 light 等于 0 就打出“会刷怪”', ok: o => hasOut(o, '会刷怪') && /==/.test(o.code)},
  {t: '<code>n = 64</code>，用 % 判断它是不是偶数，是就打出“偶数”', ok: o => hasOut(o, '偶数') && /%/.test(o.code)},
  {t: '用 and：晚上（time &gt; 13000）而且 light 是 0，打出“危险”', ok: o => hasOut(o, '危险') && /\band\b/.test(o.code)}
]});
host('#py74', {world: true, trace: true, code: 'for y in range(6):\n    setblock(4, y, 4, "stone")', tasks: [
  {t: '盖一座 8 层高的塔（小地最高 8 层）', ok: o => o.world && colCount(o.world) >= 8},
  {t: '用两层循环盖一面 10 宽、4 高的墙', ok: o => o.world && blkCount(o.world) >= 40 && (o.code.match(/\bfor\b/g) || []).length >= 2},
  {t: '把 1 到 100 加起来，打出 5050', ok: o => hasOut(o, '5050')},
  {t: '用 while 打出 0、10、20……60', ok: o => /\bwhile\b/.test(o.code) && hasOut(o, '60') && hasOut(o, '30')}
]});
host('#py75', {world: true, code: 'def tower(x, z, height):\n    for y in range(height):\n        setblock(x, y, z, "stone")\n\ntower(1, 1, 3)\ntower(5, 2, 6)', tasks: [
  {t: '再调用一次 tower，一共盖三座不同高度的塔', ok: o => (o.code.match(/\btower\(/g) || []).length >= 4 && noErr(o)},
  {t: '给 tower 加一个参数 block，让每座塔用不同的方块', ok: o => /def\s+tower\s*\([^)]*,[^)]*,[^)]*,[^)]*\)/.test(o.code) && noErr(o)},
  {t: '写 <code>def area(a, b)</code>，用 return 交回面积，打出 area(6, 4) 是 24', ok: o => /def\s+area/.test(o.code) && /return/.test(o.code) && hasOut(o, '24')},
  {t: '写 <code>def is_night(t)</code>：t ≥ 13000 时交回 True，打出 is_night(18000)', ok: o => /def\s+is_night/.test(o.code) && hasOut(o, 'True')}
]});
host('#py76', {code: 'hotbar = ["diamond_sword", "iron_pickaxe", "torch", "bread"]\nprint(hotbar[0])\nprint(len(hotbar))', tasks: [
  {t: '用负数下标打出最后一样东西', ok: o => /\[\s*-1\s*\]/.test(o.code) && hasOut(o, 'bread')},
  {t: '用 append 加上 "water_bucket"，让列表变成 5 样', ok: o => Array.isArray(o.vars.hotbar) && o.vars.hotbar.length === 5 && /append/.test(o.code)},
  {t: '用 for 把每一样都打出来，前面带编号（提示：range(len(hotbar))）', ok: o => /\bfor\b/.test(o.code) && o.out.some(l => /\b2\b.*torch|torch.*\b2\b/.test(l))},
  {t: '数一数 ["stone", "dirt", "stone", "stone"] 里有几个 stone，打出 3', ok: o => hasOut(o, '3') && /stone/.test(o.code) && (/count/.test(o.code) || /\bfor\b/.test(o.code))}
]});
host('#py77', {code: 'zh = {"stone": "石头", "dirt": "泥土", "sand": "沙子"}\nprint(zh["stone"])\nprint(len(zh))', tasks: [
  {t: '加上 "glass": "玻璃"，打出 zh["glass"]', ok: o => hasOut(o, '玻璃')},
  {t: '用 <code>for k, v in zh.items():</code> 打出每一对', ok: o => /\.items\(\)/.test(o.code) && hasOut(o, '泥土')},
  {t: '用 .get 查一个不存在的键，让它打出“不认识”', ok: o => /\.get\(/.test(o.code) && hasOut(o, '不认识')},
  {t: '用字典数出 <code>["stone", "dirt", "stone", "torch", "stone", "dirt"]</code> 里每种各几个', ok: o => o.out.some(l => l.includes("'stone': 3") && l.includes("'dirt': 2"))}
]});
const MAZE = 'maze = [\n    [0, 0, 0, 1, 0],\n    [1, 1, 0, 1, 0],\n    [0, 0, 0, 0, 0],\n    [0, 1, 1, 1, 0],\n    [0, 0, 0, 1, 0]]';
host('#py78', {code: '# 队列：先进先出\nq = []\nq.append("小格")\nq.append("豆子")\nq.append("妈妈")\nprint("队列先出来的：", q.pop(0))\n# 栈：后进先出\ns = ["第一步", "第二步", "第三步"]\nprint("撤销的是：", s.pop())\n\n# 广度优先：每一格要走几步（1 是墙）\n' + MAZE + '\ndist = []\nfor r in range(5):\n    dist.append([-1, -1, -1, -1, -1])\ndist[0][0] = 0\nqueue = [(0, 0)]\nwhile len(queue) > 0:\n    r, c = queue.pop(0)\n    for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:\n        nr, nc = r + dr, c + dc\n        if 0 <= nr < 5 and 0 <= nc < 5 and maze[nr][nc] == 0 and dist[nr][nc] == -1:\n            dist[nr][nc] = dist[r][c] + 1\n            queue.append((nr, nc))\nfor row in dist:\n    print(row)\nprint("走到右下角要", dist[4][4], "步")', tasks: [
  {t: '运行，看懂队列和栈各先出来哪一个', ok: o => hasOut(o, '小格') && hasOut(o, '第三步')},
  {t: '在迷宫里加一堵墙（把某个 0 改成 1），看看到右下角的步数变了没有', ok: o => noErr(o) && !o.code.includes(MAZE) && hasOut(o, '步')},
  {t: '把起点改到右下角 (4, 4)，算出每一格到右下角的步数', ok: o => noErr(o) && /dist\[4\]\[4\]\s*=\s*0/.test(o.code)}
]});
host('#py79', {code: 'def find(a, x):\n    for i in range(len(a)):\n        if a[i] == x:\n            return i\n    return -1\n\nprint(find([5, 3, 8], 3))', tasks: [
  {t: '打出 find([5, 3, 8], 8)，应该是 2', ok: o => o.out.includes('2')},
  {t: '找一个不在里面的数，看它交回 -1', ok: o => o.out.includes('-1')},
  {t: '写冒泡排序，把 [5, 2, 9, 1, 7] 排成 [1, 2, 5, 7, 9]（不许用 sort）', ok: o => hasOut(o, '[1, 2, 5, 7, 9]') && !/sort/.test(o.code)},
  {t: '数一数你的冒泡排序一共比较了几次，打出来', ok: o => /\+=\s*1/.test(o.code) && !/sort/.test(o.code) && hasOut(o, '[1, 2, 5, 7, 9]') && o.out.length >= 2}
]});
host('#py80', {code: 'def fact(n):\n    if n == 1:\n        return 1\n    return n * fact(n - 1)\n\nprint(fact(5))', tasks: [
  {t: '打出 fact(6)，应该是 720', ok: o => hasOut(o, '720')},
  {t: '写 countdown(n)：打出 n、n−1……1，最后打出“发射！”，要用递归（自己调用自己）', ok: o => /def\s+countdown/.test(o.code) && (o.code.match(/countdown\(/g) || []).length >= 3 && hasOut(o, '发射')},
  {t: '写 fib(n)：fib(1) = fib(2) = 1，后面每个是前两个之和；打出 fib(10) = 55', ok: o => /def\s+fib/.test(o.code) && hasOut(o, '55')},
  {t: '故意去掉停止条件，看看 RecursionError 长什么样', ok: o => o.err && o.err.type === 'RecursionError'}
]});
host('#bugFig', {code: '# 点上面的按钮，选一个有虫子的程序', ex: [
  ['虫子 1：for', '# 应该打出 0、1、2 三行\nfor i in range(3)\n    print(i)'],
  ['虫子 2：名字', '# 应该打出 15\ncoins = 10\nprint(Coins + 5)'],
  ['虫子 3：拼字', '# 应该打出：我有5个钻石\nn = 5\nprint("我有" + n + "个钻石")'],
  ['虫子 4：下标', '# 应该打出 a、b、c 三行\nhotbar = ["a", "b", "c"]\nfor i in range(1, 4):\n    print(hotbar[i])'],
  ['虫子 5：差一', '# 应该打出 5050（1 加到 100）\ntotal = 0\nfor i in range(1, 100):\n    total += i\nprint(total)']
], tasks: [
  {t: '修好虫子 1（打出 0、1、2）', ok: o => noErr(o) && out1(o) === '0\n1\n2'},
  {t: '修好虫子 2（打出 15）', ok: o => noErr(o) && out1(o) === '15'},
  {t: '修好虫子 3（打出 我有5个钻石）', ok: o => noErr(o) && out1(o) === '我有5个钻石'},
  {t: '修好虫子 4（打出 a、b、c）', ok: o => noErr(o) && out1(o) === 'a\nb\nc'},
  {t: '修好虫子 5（打出 5050）', ok: o => noErr(o) && out1(o) === '5050'}
]});

/* 第七十三章：真值表 */
dev('#truthFig', () => {
  let A = false, B = false; const T = v => v ? 'True' : 'False';
  const draw = () => { $('#tvA').textContent = 'A = ' + T(A); $('#tvB').textContent = 'B = ' + T(B); $('#tvA').classList.toggle('on', A); $('#tvB').classList.toggle('on', B);
    kv($('#tvKv'), [['A and B', T(A && B)], ['A or B', T(A || B)], ['not A', T(!A)]]);
    $('#tvTab').innerHTML = '<tr><th>A</th><th>B</th><th>A and B</th><th>A or B</th></tr>' + [[false, false], [false, true], [true, false], [true, true]].map(([a, b]) => '<tr' + (a === A && b === B ? ' style="background:var(--hl)"' : '') + '><td>' + T(a) + '</td><td>' + T(b) + '</td><td>' + T(a && b) + '</td><td>' + T(a || b) + '</td></tr>').join(''); };
  $('#tvA').addEventListener('click', () => { A = !A; draw(); }); $('#tvB').addEventListener('click', () => { B = !B; draw(); }); draw();
});

/* 第七十六章：快捷栏列表 */
dev('#hbFig', () => {
  let a = ['diamond_sword', 'iron_pickaxe', 'torch', 'bread'];
  const POOL = ['stone', 'water_bucket', 'apple', 'bow', 'oak_planks', 'compass', 'shield'];
  const draw = () => { $('#hbBar').innerHTML = Array.from({length: 9}, (_, i) => '<div class="slot' + (i < a.length ? '' : ' nil') + '"><i>' + i + '</i>' + (a[i] ? itemIcon(a[i]) + '<span class="nm2">' + a[i] + '</span>' : '') + '</div>').join(''); };
  const OPS = [['append', () => { if (a.length >= 9) return ['# 快捷栏只有 9 格，满了', '']; const x = pick(POOL); a.push(x); return ['hotbar.append("' + x + '")', '加在最后，下标是 ' + (a.length - 1)]; }],
    ['pop()', () => { if (!a.length) return ['hotbar.pop()  # IndexError: pop from empty list', '空的，拿不出来']; const x = a.pop(); return ['hotbar.pop()   # 交回 "' + x + '"', '拿走最后一个']; }],
    ['pop(0)', () => { if (!a.length) return ['hotbar.pop(0)  # IndexError', '空的']; const x = a.shift(); return ['hotbar.pop(0)  # 交回 "' + x + '"', '拿走第 0 个，后面的都往前挪了一格，编号全变了']; }],
    ['insert(1, …)', () => { if (a.length >= 9) return ['# 满了', '']; const x = pick(POOL); a.splice(1, 0, x); return ['hotbar.insert(1, "' + x + '")', '插在 1 号，原来 1 号以后的都往后挪了一格']; }],
    ['hotbar[0]', () => a.length ? ['print(hotbar[0])   # ' + a[0], '取第 0 个，列表不变'] : ['print(hotbar[0])  # IndexError', '空的']],
    ['hotbar[-1]', () => a.length ? ['print(hotbar[-1])  # ' + a[a.length - 1], '−1 是最后一个'] : ['# IndexError', '']],
    ['len', () => ['print(len(hotbar))  # ' + a.length, '一共几样']],
    ['"torch" in', () => ['print("torch" in hotbar)  # ' + (a.includes('torch') ? 'True' : 'False'), '问：里面有没有']],
    ['sort', () => { a.sort(); return ['hotbar.sort()', '按字母顺序排好了']; }]];
  $('#hbOps').innerHTML = OPS.map((x, i) => '<button class="btn" data-i="' + i + '">' + x[0] + '</button>').join('') + '<button class="btn" data-r>还原</button>';
  $('#hbOps').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.hasAttribute('data-r')) { a = ['diamond_sword', 'iron_pickaxe', 'torch', 'bread']; $('#hbCode').textContent = 'hotbar = ' + pyRepr(a); $('#hbSay').textContent = ''; draw(); return; } const r = OPS[+b.dataset.i][1](); $('#hbCode').textContent = r[0] + '\n# 现在 hotbar = ' + pyRepr(a); $('#hbSay').textContent = r[1]; draw(); });
  $('#hbCode').textContent = 'hotbar = ' + pyRepr(a); draw();
});

/* 第七十七章：一棵树 */
dev('#treeFig2', () => {
  const root = makeFS(), open = new Set(['/', '/Users', HOME]); const box = $('#tvTree');
  const walk = (n, path, d) => { const kids = n.k === 'd' ? n.c.filter(x => !x.hide || open.has(HOME + '/Library')) : []; const isOpen = open.has(path);
    let h = '<div class="tn" style="padding-left:' + d * 18 + 'px" data-p="' + esc(path) + '"><span class="ar">' + (n.k === 'd' ? (kids.length ? (isOpen ? '▾' : '▸') : '·') : ' ') + '</span>' + (n.k === 'd' ? '▤ ' : '▢ ') + esc(n.root ? '/' : n.n) + (n.zh ? '<small>（' + n.zh + '）</small>' : '') + '</div>';
    if (isOpen) kids.forEach(c => h += walk(c, (path === '/' ? '' : path) + '/' + c.n, d + 1)); return h; };
  const draw = () => box.innerHTML = walk(root, '/', 0);
  box.addEventListener('click', e => { const t = e.target.closest('.tn'); if (!t) return; const p = t.dataset.p; const r = resolvePath(root, '/', p); if (r.node.k === 'd') { if (open.has(p)) open.delete(p); else open.add(p); draw(); }
    const depth = p === '/' ? 0 : p.split('/').length - 1, leaf = r.node.k !== 'd' || !r.node.c.length;
    $('#tvSay2').innerHTML = '路径 <code>' + esc(p) + '</code>　第 ' + depth + ' 层　' + (p === '/' ? '这是<b>根</b>' : leaf ? '这是一片<b>叶子</b>（没有孩子）' : '这是一个<b>节点</b>，有 ' + r.node.c.length + ' 个孩子') + (p !== '/' ? '，它的父亲是 <code>' + esc(p.slice(0, p.lastIndexOf('/')) || '/') + '</code>' : ''); });
  draw(); $('#tvSay2').textContent = '点一个节点试试。';
});

/* 第七十八章：迷宫里的广度优先 */
dev('#bfsFig', () => {
  const W = 11, H = 9, S = 36, svg = $('#bfsSvg'); let wall, dist, par, q, done, cur;
  const MAZES = [['00010000000', '11010111110', '00000100010', '01111101010', '00000001010', '11111011010', '00001000010', '01101111110', '01000000000'], ['00000000000', '01111111110', '00000000010', '11111111010', '00000000010', '01111111110', '00000000000', '01111111111', '00000000000']];
  let mi = 0;
  const reset = () => { if (!wall) wall = MAZES[mi].map(r => [...r].map(c => c === '1')); dist = Array.from({length: H}, () => new Array(W).fill(-1)); par = {}; dist[0][0] = 0; q = [[0, 0]]; done = false; cur = null; draw(); $('#bfsSay').textContent = '起点放进了队列。点“走一步”。'; };
  const draw = () => { let g = '';
    const path = new Set(); if (done && dist[H - 1][W - 1] >= 0) { let k = (W - 1) + ',' + (H - 1); while (k) { path.add(k); k = par[k]; } }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = x + ',' + y, d = dist[y][x], inq = q.some(p => p[0] === x && p[1] === y);
      const fill = wall[y][x] ? 'var(--stn-2)' : path.has(k) ? 'var(--zhu)' : cur && cur[0] === x && cur[1] === y ? 'var(--gold)' : inq ? 'var(--water)' : d >= 0 ? 'var(--grass)' : 'var(--paper)';
      g += '<rect x="' + x * S + '" y="' + y * S + '" width="' + (S - 2) + '" height="' + (S - 2) + '" fill="' + fill + '" opacity="' + (d >= 0 && !path.has(k) && !inq ? .55 : 1) + '" data-x="' + x + '" data-y="' + y + '" style="cursor:pointer"/>';
      if (d >= 0) g += txt(x * S + S / 2 - 1, y * S + S / 2 + 4, d, {s: 12, c: path.has(k) ? '#fff' : 'var(--ink)', halo: false}); }
    g += txt(S / 2, S / 2 - 8, '起', {s: 10, w: true}) + txt((W - .5) * S, (H - .5) * S - 8, '终', {s: 10, w: true});
    svg.setAttribute('viewBox', '0 0 ' + W * S + ' ' + H * S); svg.innerHTML = g;
    $('#bfsQ').innerHTML = '队列（左边是队头）：' + (q.length ? q.map(p => '<span>(' + p[0] + ',' + p[1] + ')</span>').join('') : '<i>空</i>'); };
  const step = () => { if (done) return false; if (!q.length) { done = true; $('#bfsSay').textContent = '队列空了，终点走不到。'; draw(); return false; }
    cur = q.shift(); const [x, y] = cur; let added = [];
    [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H || wall[ny][nx] || dist[ny][nx] >= 0) return; dist[ny][nx] = dist[y][x] + 1; par[nx + ',' + ny] = x + ',' + y; q.push([nx, ny]); added.push('(' + nx + ',' + ny + ')'); });
    if (x === W - 1 && y === H - 1) { done = true; $('#bfsSay').innerHTML = '拿出了终点！最短的路要走 <b>' + dist[y][x] + '</b> 步，红线就是它。'; draw(); return false; }
    $('#bfsSay').textContent = '从队头拿出 (' + x + ',' + y + ')，它走了 ' + dist[y][x] + ' 步。' + (added.length ? '把邻居 ' + added.join(' ') + ' 放进队尾，标上 ' + (dist[y][x] + 1) + ' 步。' : '它没有新的邻居。'); draw(); return true; };
  let timer = null;
  $('#bfsStep').addEventListener('click', step);
  $('#bfsRun').addEventListener('click', () => { clearInterval(timer); timer = setInterval(() => { if (!step()) clearInterval(timer); }, 120); });
  $('#bfsReset').addEventListener('click', () => { clearInterval(timer); reset(); });
  $('#bfsMaze').addEventListener('click', () => { clearInterval(timer); mi = (mi + 1) % MAZES.length; wall = null; reset(); });
  svg.addEventListener('click', e => { const t = e.target.closest('rect[data-x]'); if (!t) return; const x = +t.dataset.x, y = +t.dataset.y; if ((x === 0 && y === 0) || (x === W - 1 && y === H - 1)) return; clearInterval(timer); wall[y][x] = !wall[y][x]; reset(); });
  reset();
});

/* 第七十九章：猜数 */
dev('#guessFig', () => {
  let secret, lo, hi, n, over;
  const bar = () => { $('#gsBar').innerHTML = '<div style="margin-left:' + (lo - 1) + '%;width:' + (hi - lo + 1) + '%"></div><span>还可能是 ' + lo + ' 到 ' + hi + '，一共 ' + (hi - lo + 1) + ' 个</span>'; };
  const start = () => { secret = 1 + Math.floor(Math.random() * 100); lo = 1; hi = 100; n = 0; over = false; bar(); $('#gsSay').className = 'say'; $('#gsSay').textContent = '想好了。猜吧！'; $('#gsIn').value = ''; };
  const guess = g => { if (over || isNaN(g)) return; n++; let msg;
    if (g === secret) { over = true; msg = '猜中了！是 ' + secret + '，你用了 ' + n + ' 次。' + (n <= 7 ? '在 7 次以内，漂亮！' : '每次猜正中间，7 次以内一定能猜中。'); lo = hi = g; }
    else if (g < secret) { lo = Math.max(lo, g + 1); msg = g + ' 小了。'; } else { hi = Math.min(hi, g - 1); msg = g + ' 大了。'; }
    bar(); $('#gsSay').className = 'say' + (over ? ' ok' : ''); $('#gsSay').textContent = '第 ' + n + ' 次：' + msg + (over ? '' : ' 正中间是 ' + Math.floor((lo + hi) / 2) + '。'); };
  const go = () => guess(parseInt($('#gsIn').value, 10));
  $('#gsGo').addEventListener('click', go); $('#gsIn').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  $('#gsNew').addEventListener('click', start);
  $('#gsAuto').addEventListener('click', () => { start(); const t = setInterval(() => { if (over) { clearInterval(t); return; } guess(Math.floor((lo + hi) / 2)); }, 700); });
  start();
});

/* 第七十九章：排序 */
dev('#sortFig', () => {
  const svg = $('#soSvg'); let a, gen, st, cmp = 0, swp = 0, alg = 0, timer;
  function* bubble(a){ for (let i = 0; i < a.length - 1; i++) for (let j = 0; j < a.length - 1 - i; j++) { cmp++; yield {c: [j, j + 1]}; if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; swp++; yield {s: [j, j + 1]}; } } }
  function* selection(a){ for (let i = 0; i < a.length - 1; i++) { let m = i; for (let j = i + 1; j < a.length; j++) { cmp++; yield {c: [m, j]}; if (a[j] < a[m]) m = j; } if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; swp++; yield {s: [i, m]}; } } }
  function* insertion(a){ for (let i = 1; i < a.length; i++) { let j = i; while (j > 0) { cmp++; yield {c: [j - 1, j]}; if (a[j - 1] > a[j]) { [a[j - 1], a[j]] = [a[j], a[j - 1]]; swp++; yield {s: [j - 1, j]}; j--; } else break; } } }
  const ALG = [['冒泡', bubble], ['选择', selection], ['插入', insertion]];
  const draw = () => { const n = a.length, W = 600, H = 200, bw = W / n; let g = '';
    a.forEach((v, i) => { const hi = st && st.c && st.c.includes(i) ? 'var(--gold)' : st && st.s && st.s.includes(i) ? 'var(--zhu)' : 'var(--main)'; g += '<rect x="' + (i * bw + 2) + '" y="' + (H - 18 - v * 2.6) + '" width="' + (bw - 4) + '" height="' + v * 2.6 + '" fill="' + hi + '"/>' + txt(i * bw + bw / 2, H - 4, v, {s: 11, c: 'var(--ink-2)', halo: false}); });
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g; kv($('#soKv'), [['算法', ALG[alg][0] + '排序'], ['比较了', cmp + ' 次'], ['交换了', swp + ' 次']]); };
  const fresh = () => { clearInterval(timer); a = Array.from({length: 12}, () => 4 + Math.floor(Math.random() * 60)); window._stOrig = a.slice(); restart(); };
  const restart = () => { clearInterval(timer); cmp = 0; swp = 0; st = null; gen = ALG[alg][1](a); draw(); };
  const step = () => { const r = gen.next(); if (r.done) { st = null; draw(); return false; } st = r.value; draw(); return true; };
  btnRow($('#soAlg'), ALG.map(x => x[0] + '排序'), 0, i => { alg = i; a = window._stOrig.slice(); restart(); });
  $('#soStep').addEventListener('click', step);
  $('#soRun').addEventListener('click', () => { clearInterval(timer); timer = setInterval(() => { if (!step()) clearInterval(timer); }, 60); });
  $('#soNew').addEventListener('click', fresh);
  fresh();
});

/* 第八十章：一层一层 */
dev('#fkFig', () => {
  let ev = [], k = 0;
  const build = n => { ev = []; for (let i = n; i >= 1; i--) ev.push(['call', i]); let v = 1; for (let i = 1; i <= n; i++) { v = i === 1 ? 1 : v * i; ev.push(['ret', i, v]); } k = 0; };
  const draw = () => { const n = +$('#fkN').value, frames = []; let say = '点“走一步”开始：先调用 fact(' + n + ')。';
    for (let i = 0; i < k; i++) { const e = ev[i]; if (e[0] === 'call') frames.push({n: e[1], v: null}); else { frames.pop(); if (frames.length) frames[frames.length - 1].got = e[2]; } }
    if (k > 0) { const e = ev[k - 1]; say = e[0] === 'call' ? (e[1] === 1 ? 'fact(1)：停止条件！直接交回 1，不再往下问。' : 'fact(' + e[1] + ') 不会直接算，它要先问 fact(' + (e[1] - 1) + ')。叠上一层。') : 'fact(' + e[1] + ') 算出来了：' + e[2] + '，交给下面那一层，拆掉这一层。'; }
    if (k >= ev.length) say = '全部算完：fact(' + n + ') = <b>' + ev[ev.length - 1][2] + '</b>。最后叫的 fact(1) 最先算完，这就是“栈”：后进先出。';
    $('#fkStack').innerHTML = frames.slice().reverse().map(f => '<div><code>fact(' + f.n + ')</code>' + (f.n === 1 ? ' → 1' : f.got ? ' = ' + f.n + ' × ' + f.got + ' = <b>' + f.n * f.got + '</b>' : ' = ' + f.n + ' × fact(' + (f.n - 1) + ') = ' + f.n + ' × ？') + '</div>').join('') || '<div class="dim">（栈是空的）</div>';
    $('#fkSay').innerHTML = say; };
  slider('fkN', v => v, n => { build(n); draw(); });
  $('#fkStep').addEventListener('click', () => { if (k < ev.length) k++; draw(); });
  $('#fkReset').addEventListener('click', () => { k = 0; draw(); });
});

/* 第八十章：汉诺塔 */
dev('#hanoiFig', () => {
  const svg = $('#hnSvg'); let P, n, sel = null, moves = 0, timer = null;
  const reset = () => { clearInterval(timer); n = +$('#hnN').value; P = [Array.from({length: n}, (_, i) => n - i), [], []]; sel = null; moves = 0; draw(); };
  const draw = () => { const W = 540, H = 200, PX = [90, 270, 450]; let g = '<rect y="' + (H - 14) + '" width="' + W + '" height="14" fill="var(--wood-2)"/>';
    PX.forEach((x, i) => { g += '<rect x="' + (x - 4) + '" y="30" width="8" height="' + (H - 44) + '" fill="var(--wood)"/><rect x="' + (x - 88) + '" y="20" width="176" height="' + (H - 20) + '" fill="transparent" data-p="' + i + '"/>';
      P[i].forEach((d, j) => { const w = 30 + d * 20, top = sel === i && j === P[i].length - 1; g += '<rect x="' + (x - w / 2) + '" y="' + (top ? 8 : H - 14 - (j + 1) * 18) + '" width="' + w + '" height="16" rx="4" fill="' + WCOL[WOOLC[(d * 3) % 16]] + '" stroke="var(--ink-2)" pointer-events="none"/>'; }); });
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const best = 2 ** n - 1, win = P[2].length === n; $('#hnSay').className = 'say' + (win ? ' ok' : ''); $('#hnSay').innerHTML = '走了 ' + moves + ' 步，最少要 2<sup>' + n + '</sup> − 1 = <b>' + best + '</b> 步。' + (win ? (moves === best ? ' 完美！' : ' 完成了！能不能更少？') : sel !== null ? ' 拿起了一个盘子，点另一根柱子放下。' : ''); };
  const move = (a, b) => { if (!P[a].length) return false; const d = P[a][P[a].length - 1]; if (P[b].length && P[b][P[b].length - 1] < d) return false; P[b].push(P[a].pop()); moves++; return true; };
  svg.addEventListener('click', e => { const t = e.target.closest('[data-p]'); if (!t) return; const p = +t.dataset.p; if (sel === null) { if (P[p].length) sel = p; } else { if (p !== sel && !move(sel, p)) $('#hnSay').textContent = '大盘子不能压在小盘子上。'; sel = null; } draw(); });
  slider('hnN', v => v + ' 个', () => reset());
  $('#hnReset').addEventListener('click', reset);
  $('#hnAuto').addEventListener('click', () => { reset(); const ms = []; const solve = (k, a, b, c) => { if (k === 0) return; solve(k - 1, a, c, b); ms.push([a, c]); solve(k - 1, b, a, c); }; solve(n, 0, 1, 2); let i = 0; timer = setInterval(() => { if (i >= ms.length) { clearInterval(timer); return; } move(ms[i][0], ms[i][1]); i++; draw(); }, Math.max(60, 500 - n * 60)); });
});

/* 第八十章：分叉的树 */
dev('#ftreeFig', () => {
  const svg = $('#ftSvg');
  const draw = () => { const N = +$('#ftN').value, A = +$('#ftA').value * DEG; let g = '', cnt = 0;
    const br = (x, y, ang, len, d) => { if (d === 0) return; const x2 = x + Math.sin(ang) * len, y2 = y - Math.cos(ang) * len; cnt++; g += '<line x1="' + x.toFixed(1) + '" y1="' + y.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + (d <= 2 ? 'var(--leaf)' : 'var(--wood-2)') + '" stroke-width="' + Math.max(1, d * 1.1) + '" stroke-linecap="round"/>'; br(x2, y2, ang - A, len * .74, d - 1); br(x2, y2, ang + A, len * .74, d - 1); };
    br(220, 330, 0, 80, N); svg.setAttribute('viewBox', '0 0 440 340'); svg.innerHTML = g;
    $('#ftNO').textContent = N + ' 层，' + cnt + ' 根'; };
  slider('ftN', v => v + ' 层', () => { if ($('#ftA')) draw(); });
  slider('ftA', v => v + '°', () => draw());
});

/* 第八十一章：错题本 */
dev('#bookFig', () => {
  const list = $('#bkList'), say = $('#bkSay');
  const draw = () => { list.innerHTML = G.d.bug.length ? G.d.bug.slice().reverse().map((b, ri) => { const i = G.d.bug.length - 1 - ri; return '<div class="bk"><b>' + esc(b.kind) + '</b><small>' + esc(b.date) + '</small><button class="btn" data-del="' + i + '">删掉</button><p><i>出了什么事</i>' + esc(b.what) + '</p><p><i>为什么</i>' + esc(b.why) + '</p><p><i>怎样修好</i>' + esc(b.fix) + '</p><p><i>学到了</i>' + esc(b.learn) + '</p></div>'; }).join('') : '<p class="dim">还没有记录。</p>'; };
  $('#bkAdd').addEventListener('click', () => { const b = {kind: $('#bkKind').value, what: $('#bkWhat').value.trim(), why: $('#bkWhy').value.trim(), fix: $('#bkFix').value.trim(), learn: $('#bkLearn').value.trim(), date: new Date().toLocaleDateString('zh-CN')};
    if (!b.what) { say.className = 'say bad'; say.textContent = '至少写一下“出了什么事”。'; return; } G.d.bug.push(b); G.save(); ['#bkWhat', '#bkWhy', '#bkFix', '#bkLearn'].forEach(s => $(s).value = ''); say.className = 'say ok'; say.textContent = '记下了。现在一共 ' + G.d.bug.length + ' 条。'; draw(); });
  $('#bkEx').addEventListener('click', () => { $('#bkKind').value = '编程'; $('#bkWhat').value = '打 print("我有" + n + "个") 出了 TypeError'; $('#bkWhy').value = 'n 是数，不能直接和字符串相加'; $('#bkFix').value = '改成 str(n)，或者用 f"我有{n}个"'; $('#bkLearn').value = '数和字要先转成同一种'; });
  list.addEventListener('click', e => { const b = e.target.closest('[data-del]'); if (!b) return; G.d.bug.splice(+b.dataset.del, 1); G.save(); draw(); });
  draw();
});

/* 第八十二章：成就墙 */
dev('#wallFig', () => {
  /* 每一部的任务和闯关个数（写书时数好的） */
  const TOT = {5: [9, 8], 6: [10, 10], 7: [8, 8], 8: [8, 8], 9: [5, 5], 10: [0, 11]};
  const partOf = id => { const m = id.match(/^[tq](\d+)/); return m ? chapPage['c' + m[1]] : null; };
  const cntT = {}, cntQ = {};
  Object.keys(G.d.task).forEach(k => { const p = partOf(k); if (p) cntT[p] = (cntT[p] || 0) + 1; });
  Object.keys(G.d.quiz).forEach(k => { const p = partOf(k); if (p) cntQ[p] = (cntQ[p] || 0) + 1; });
  $('#wlParts').innerHTML = [5, 6, 7, 8, 9, 10].map(p => { const [tt, tq] = TOT[p], dt = cntT[p] || 0, dq = cntQ[p] || 0, pct = Math.round((dt + dq) / Math.max(1, tt + tq) * 100);
    return '<a href="' + PURL[p] + '"><b>' + PARTS[p - 1].k + '</b><small>第' + CN[p - 1] + '部</small><span class="pbar"><i style="width:' + pct + '%"></i></span><small>' + (tt ? '任务 ' + dt + '/' + tt + ' · ' : '') + '闯关 ' + dq + '/' + tq + '</small></a>'; }).join('');
  const q = id => !!G.d.quiz[id], qs = (a, b) => { for (let i = a; i <= b; i++) if (!G.d.quiz['q' + i]) return false; return true; };
  const sure = Object.values(G.d.srs).filter(x => x.b >= 4).length, mapN = Object.keys(G.d.flag).filter(k => /^m\d+$/.test(k)).length;
  const B = [['⌘', '键盘手', '过了第 33、35 章的关', q('q33') && q('q35')], ['▤', '文件侦探', '过了第 36—38 章的关', qs(36, 38)], ['%', '终端新手', '过了第 39 章的关', q('q39')], ['✛', '坐标通', '坐标点点乐连对十题', !!G.d.flag.xyz], ['/', '命令师', '第六部十关全过', qs(41, 50)],
    ['A', '单词 50', '复习台里记牢 50 个词', sure >= 50], ['B', '单词 150', '记牢 150 个词', sure >= 150], ['∑', '数学地图', '在数学地图上打了 20 个勾', mapN >= 20], ['∠', '数学家', '第八部八关全过', qs(59, 66)], ['☼', '观察员', '第九部五关全过', qs(67, 71)],
    ['ƒ', '程序员', '过了第 72—75 章的关', qs(72, 75)], ['⇅', '算法', '过了第 79、80 章的关', q('q79') && q('q80')], ['✎', '捉虫人', '错题本里记了 3 条', G.d.bug.length >= 3], ['★', '自学者', '写下了下一个月的计划', !!G.d.flag.plan]];
  $('#wlBadges').innerHTML = B.map(b => '<div class="bd' + (b[3] ? ' on' : '') + '"><span>' + b[0] + '</span><b>' + b[1] + '</b><small>' + b[2] + '</small></div>').join('');
});
dev('#planFig', () => {
  const ids = ['mp1', 'mp2', 'mp3', 'mp4'], p = G.d.flag.plan || {};
  ids.forEach(i => { if (p[i]) $('#' + i).value = p[i]; });
  const text = () => '我的下一个月\n' + ids.slice(0, 3).map((i, k) => (k + 1) + '. ' + ($('#' + i).value || '……')).join('\n') + '\n怎样检查：' + ($('#mp4').value || '……');
  $('#mpSave').addEventListener('click', () => { const o = {}; ids.forEach(i => o[i] = $('#' + i).value.trim()); if (!o.mp1) { $('#mpSay').className = 'say bad'; $('#mpSay').textContent = '至少写一个目标。'; return; } G.d.flag.plan = o; G.save(); $('#mpSay').className = 'say ok'; $('#mpSay').textContent = '存好了。成就墙上的“自学者”亮了（刷新页面能看到）。'; });
  $('#mpCopy').addEventListener('click', () => { const t = text(); const ok = () => { $('#mpSay').className = 'say ok'; $('#mpSay').textContent = '拷贝好了，可以 ⌘V 粘贴到备忘录。'; }; if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(ok, () => { $('#mpSay').textContent = t; }); else $('#mpSay').textContent = t; });
});
