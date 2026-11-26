/* ================= 第八部 · 数：各章装置 ================= */
const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const numIn = v => parseFloat(String(v || '').replace(/[−—–]/g, '-').replace(/[，,\s]/g, '').replace(/%$/, ''));

/* 封面：今天的方块题 */
dev('#dailyFig', () => {
  const T = {
    '乘法': [() => { const n = rint(2, 9); return {q: '一个箱子 27 格，装了 ' + n + ' 格满满的圆石（一格 64 个），一共多少个？', a: n * 64, h: n + ' × 64，可以拆成 ' + n + ' × 60 + ' + n + ' × 4。', ch: '第六十一章'}; },
      () => { const n = rint(70, 400); return {q: '/give @s stone ' + n + ' 会占物品栏几格？', a: Math.ceil(n / 64), h: n + ' ÷ 64，商 ' + Math.floor(n / 64) + ' 余 ' + (n % 64) + '，余数不是 0 就要多一格。', ch: '第四十五章'}; },
      () => { const k = rint(3, 10); return {q: '2 的 ' + k + ' 次方是多少？', a: 2 ** k, h: '从 2 开始一直乘 2，乘到第 ' + k + ' 个。', ch: '第六十一章'}; }],
    '负数': [() => { const a = rint(-60, 20), b = rint(5, 40); return {q: '你在 y = ' + a + '，往上爬 ' + b + ' 格，到了 y = ?', a: a + b, h: a + ' + ' + b + '。', ch: '第六十章'}; },
      () => { const a = rint(-60, -5), b = rint(40, 120); return {q: '钻石在 y = ' + a + '，你家门口在 y = ' + b + '，差几格？', a: b - a, h: b + ' − (' + a + ') = ' + b + ' + ' + (-a) + '。', ch: '第六十章'}; },
      () => { const x = rint(-600, -10); return {q: 'F3 上 x 是 ' + x + '.4，你脚下方块的 x 是多少？', a: x, h: '往小的方向取整：' + x + '.4 在 ' + x + ' 和 ' + (x + 1) + ' 之间。注意负数那边……', ch: '第四十一章'}; }],
    '比例': [() => { const n = rint(5, 120) * 8; return {q: '主世界 x = ' + n + '，下界里对应的 x 是多少？', a: n / 8, h: '除以 8。', ch: '第六十二章'}; },
      () => { const n = rint(-40, 40); return {q: '下界 z = ' + n + '，回到主世界是多少？', a: n * 8, h: '乘以 8。', ch: '第六十二章'}; },
      () => { const n = rint(2, 12) * 8; return {q: '要烧 ' + n + ' 块铁矿，用煤（一块烧 8 个），要几块煤？', a: n / 8, h: n + ' ÷ 8。', ch: '第六十二章'}; }],
    '形状': [() => { const a = rint(3, 12), b = rint(3, 12); return {q: a + ' × ' + b + ' 的地板，要几块方块？', a: a * b, h: '面积 = 长 × 宽。', ch: '第六十三章'}; },
      () => { const a = rint(2, 9), b = rint(2, 9), c = rint(2, 6); return {q: '/fill 0 0 0 ' + (a - 1) + ' ' + (c - 1) + ' ' + (b - 1) + ' glass 一共填几格？', a: a * b * c, h: '每一边是“大的 − 小的 + 1”：' + a + '、' + c + '、' + b + '。', ch: '第四十七章'}; },
      () => { const a = rint(3, 10), b = rint(3, 10); return {q: '用栅栏围住一块 ' + a + ' × ' + b + ' 的地（栅栏放在地外面一圈），要几根？', a: 2 * (a + b) + 4, h: '2 × (长 + 宽) + 4 个角。', ch: '第六十三章'}; }],
    '速度': [() => { const t = rint(2, 30) * 10; return {q: '矿车每秒 8 格，' + t + ' 秒能走多远？', a: t * 8, h: '路程 = 速度 × 时间。', ch: '第六十六章'}; },
      () => { const k = pick([[3, 4], [6, 8], [5, 12], [9, 12], [30, 40], [8, 15]]); return {q: '往东 ' + k[0] + ' 格、往北 ' + k[1] + ' 格，直线距离是几格？', a: Math.round(Math.hypot(k[0], k[1])), h: k[0] + '² + ' + k[1] + '² = ' + (k[0] * k[0] + k[1] * k[1]) + '，再找哪个数乘自己等于它。', ch: '第六十六章'}; },
      () => { const s = rint(1, 20) * 30; return {q: '游戏里过了 ' + s + ' 秒，是多少刻？', a: s * 20, h: '一秒 20 刻。', ch: '第四十三章'}; }]
  };
  const K = ['全部'].concat(Object.keys(T)); let kind = 0, cur = null, n = 0, ok = 0;
  const make = () => { const ks = kind ? [K[kind]] : Object.keys(T); cur = pick(T[pick(ks)])(); $('#dqQ').innerHTML = cur.q + ' <small style="color:var(--ink-3)">（' + cur.ch + '）</small>'; $('#dqIn').value = ''; $('#dqSay').className = 'say'; $('#dqSay').textContent = ''; };
  const go = () => { if (!cur) return; const v = numIn($('#dqIn').value); if (isNaN(v)) return; n++; const r = Math.abs(v - cur.a) < 1e-9; if (r) ok++; $('#dqSay').className = 'say ' + (r ? 'ok' : 'bad'); $('#dqSay').innerHTML = r ? '对了！' : '不对，答案是 <b>' + cur.a + '</b>。' + cur.h; kv($('#dqKv'), [['答对', ok + ' / ' + n]]); if (r) setTimeout(make, 1000); };
  btnRow($('#dqKind'), K, 0, i => { kind = i; make(); });
  $('#dqGo').addEventListener('click', go); $('#dqIn').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  $('#dqHint').addEventListener('click', () => { if (cur) { $('#dqSay').className = 'say'; $('#dqSay').textContent = '提示：' + cur.h; } });
  $('#dqNew').addEventListener('click', make);
  make(); kv($('#dqKv'), [['答对', '0 / 0']]);
});

/* 第五十九章：数学地图 */
dev('#mapFig', () => {
  const M = [
    [1, '20 以内加减', ['c43']], [1, '认识钟表', ['c43']], [1, '上下前后左右', ['c41', 'c57']], [1, '认识图形', ['c63']],
    [2, '乘法口诀', ['c45', 'c61']], [2, '有余数的除法', ['c45', 'c49']], [2, '角的初步认识', ['c64']], [2, '米和厘米', ['c0']], [2, '简单的统计表', ['c65']],
    [3, '时、分、秒', ['c43']], [3, '东南西北', ['c41', 'c64']], [3, '两位数乘两位数', ['c61']], [3, '长方形的周长', ['c63']], [3, '面积', ['c63', 'c47']], [3, '分数的初步认识', ['c62']],
    [4, '大数的认识', ['c61']], [4, '角的度量（量角器）', ['c64']], [4, '速度 × 时间 = 路程', ['c66']], [4, '乘法分配律', ['c61']], [4, '小数', ['c41']], [4, '平均数、条形图', ['c35', 'c65']],
    [5, '简易方程', ['c72']], [5, '因数与倍数', ['c61']], [5, '分数加减', ['c62']], [5, '长方体的体积', ['c47', 'c63']], [5, '可能性', ['c65']], [5, '折线统计图', ['c65']],
    [6, '分数乘除', ['c62']], [6, '比', ['c62']], [6, '圆和 π', ['c63']], [6, '百分数', ['c65']], [6, '负数', ['c60', 'c41']], [6, '比例和比例尺', ['c62']], [6, '北偏东几度', ['c64']],
    [7, '有理数、数轴、绝对值', ['c60']], [7, '乘方', ['c61']], [7, '平面直角坐标系', ['c41']], [7, '不等式', ['c48']], [7, '平方根', ['c66']],
    [8, '勾股定理', ['c66']], [8, '一次函数', ['c67']],
    [9, '概率初步', ['c65']], [9, '二次函数（抛物线）', ['c67']],
    [10, '指数函数', ['c51', 'c61']], [10, '向量', ['c42']], [10, '二进制（信息课）', ['c11', 'c61']]
  ];
  const GN = g => g === 10 ? '高中' : g <= 6 ? g + ' 年级' : '初' + ['一', '二', '三'][g - 7];
  const F = [['全部', () => true], ['1—4 年级', g => g <= 4], ['5—6 年级', g => g === 5 || g === 6], ['初中', g => g >= 7 && g <= 9], ['高中', g => g === 10]];
  let f = 0; const box = $('#mapBox');
  const CHN = id => { const t = TOC.find(x => x.id === id); return t ? '第' + id.slice(1) + '章' : id; };
  const draw = () => {
    const gs = [...new Set(M.map(m => m[0]))].filter(g => F[f][1](g));
    box.innerHTML = gs.map(g => '<div class="mrow"><b>' + GN(g) + '</b><div>' + M.map((m, i) => m[0] !== g ? '' : '<span class="mcell' + (G.d.flag['m' + i] ? ' ok' : '') + '"><label><input type="checkbox" data-i="' + i + '"' + (G.d.flag['m' + i] ? ' checked' : '') + '> ' + m[1] + '</label><small>' + m[2].map(c => '<a data-c="' + c + '" href="' + href(c) + '">' + CHN(c) + '</a>').join(' ') + '</small></span>').join('') + '</div></div>').join('');
    $$('a[data-c]', box).forEach(a => { if (chapPage[a.dataset.c] > READY) { a.removeAttribute('href'); a.classList.add('soon'); } });
    const done = M.filter((m, i) => G.d.flag['m' + i]).length;
    kv($('#mapKv'), [['已经打勾', done + ' / ' + M.length], ['这一段', M.filter(m => F[f][1](m[0])).length + ' 样']]);
  };
  box.addEventListener('change', e => { const c = e.target.closest('input[data-i]'); if (!c) return; if (c.checked) G.d.flag['m' + c.dataset.i] = 1; else delete G.d.flag['m' + c.dataset.i]; G.save(); draw(); });
  btnRow($('#mapF'), F.map(x => x[0]), 0, i => { f = i; draw(); });
  draw();
});

/* 第六十章：高度电梯 */
dev('#elevFig', () => {
  const svg = $('#elSvg'); let y = -60, goal = null;
  const LO = -70, HI = 90, H = 420, Y = v => 10 + (HI - v) / (HI - LO) * (H - 20);
  const draw = () => {
    let g = '';
    for (let v = LO; v <= HI; v += 10) g += '<line x1="40" x2="' + (v === 0 ? 100 : 56) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="' + (v === 0 ? 'var(--zhu)' : 'var(--ink-3)') + '" stroke-width="' + (v === 0 ? 2 : 1) + '"/>' + txt(36, Y(v) + 4, v, {s: 11, a: 'end', c: v < 0 ? 'var(--blu)' : 'var(--ink-2)', halo: false});
    g += '<line x1="48" x2="48" y1="' + Y(HI) + '" y2="' + Y(LO) + '" stroke="var(--ink-2)" stroke-width="2"/>' + txt(104, Y(0) + 4, '0', {s: 12, a: 'start', c: 'var(--zhu)', w: true}) + txt(104, Y(63) + 4, '海平面 63', {s: 11, a: 'start', c: 'var(--ink-3)'});
    if (goal !== null) g += '<rect x="60" y="' + (Y(goal) - 7) + '" width="14" height="14" fill="none" stroke="var(--gold)" stroke-width="2.5"/>' + txt(80, Y(goal) + 4, '目的地 ' + goal, {s: 11, a: 'start', c: 'var(--gold)', w: true});
    g += '<rect x="58" y="' + (Y(y) - 8) + '" width="16" height="16" fill="var(--main)"/>' + txt(80, Y(y) - 10, '你 y = ' + y, {s: 12, a: 'start', w: true});
    svg.setAttribute('viewBox', '0 0 200 ' + H); svg.innerHTML = g;
  };
  const move = d => { const ny = clamp(y + d, LO, HI); $('#elSay').innerHTML = '<code>' + y + ' ' + (d >= 0 ? '+ ' + d : '− ' + (-d)) + ' = ' + ny + '</code>' + (ny === LO || ny === HI ? '（到头了）' : '') + ((y < 0) !== (ny < 0) && y !== 0 && ny !== 0 ? '　穿过了 0！' : ''); y = ny; draw(); };
  $('#elBtns').innerHTML = [10, 5, 1, -1, -5, -10].map(d => '<button class="btn" data-d="' + d + '">' + (d > 0 ? '上 ' + d : '下 ' + (-d)) + '</button>').join('');
  $('#elBtns').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (b) move(+b.dataset.d); });
  $('#elGoal').addEventListener('click', () => { do { goal = rint(LO, HI); } while (goal === y); $('#elQ').className = 'say'; $('#elQ').innerHTML = '目的地是 y = <b>' + goal + '</b>。从 ' + y + ' 出发，要走几格？（往上写正数，往下写负数）'; draw(); });
  const go = () => { if (goal === null) return; const v = numIn($('#elIn').value); if (isNaN(v)) return; const need = goal - y, r = v === need; $('#elQ').className = 'say ' + (r ? 'ok' : 'bad'); $('#elQ').innerHTML = (r ? '对了！' : '不对，要走 <b>' + need + '</b>。') + '算式：' + goal + ' − (' + y + ') = ' + need; if (r) { y = goal; goal = null; draw(); } };
  $('#elGo').addEventListener('click', go); $('#elIn').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  draw();
});
dev('#cmpFig', () => {
  let a, b, n = 0, streak = 0;
  const next = () => { do { a = rint(-64, 40); b = rint(-64, 40); } while (a === b); $('#cmpOps').innerHTML = '<button class="btn" data-v="a">' + a + '</button><span style="align-self:center">和</span><button class="btn" data-v="b">' + b + '</button>'; };
  $('#cmpOps').addEventListener('click', e => { const bt = e.target.closest('[data-v]'); if (!bt) return; n++; const pickA = bt.dataset.v === 'a', r = pickA ? a > b : b > a; streak = r ? streak + 1 : 0; $('#cmpSay').className = 'say ' + (r ? 'ok' : 'bad'); $('#cmpSay').innerHTML = (r ? '对了！' : '不对。') + ' ' + Math.max(a, b) + ' &gt; ' + Math.min(a, b) + '：在数轴上 ' + Math.max(a, b) + ' 更靠上。　连对 ' + streak + ' / 10' + (streak >= 10 ? '，过关！' : ''); next(); });
  next(); $('#cmpSay').textContent = '点更大（更高）的那个。';
});

/* 第六十一章 */
dev('#fullFig', () => {
  const B = [['快捷栏', 9], ['物品栏', 36], ['箱子', 27], ['大箱子', 54], ['漏斗', 5], ['熔炉的一格', 1]], I = [['方块（64）', 64], ['鸡蛋（16）', 16], ['剑（1）', 1]];
  let b = 2, it = 0;
  const draw = () => { const n = B[b][1], m = I[it][1], t = n * m; const tens = Math.floor(n / 10) * 10, ones = n % 10;
    $('#fuSay').innerHTML = B[b][0] + ' ' + n + ' 格 × 每格 ' + m + ' 个 = <b>' + t + '</b> 个。' + (m === 64 && n >= 10 ? '<br>拆法一：' + n + ' × 64 = ' + n + ' × 60 + ' + n + ' × 4 = ' + n * 60 + ' + ' + n * 4 + ' = ' + t + '<br>拆法二：' + n + ' × 64 = ' + n + ' × 8 × 8 = ' + n * 8 + ' × 8 = ' + t + (ones && tens ? '<br>拆法三：' + n + ' × 64 = ' + tens + ' × 64 + ' + ones + ' × 64 = ' + tens * 64 + ' + ' + ones * 64 + ' = ' + t : '') : ''); };
  btnRow($('#fuBox'), B.map(x => x[0]), 2, i => { b = i; draw(); }); btnRow($('#fuItem'), I.map(x => x[0]), 0, i => { it = i; draw(); }); draw();
});
dev('#powFig', () => {
  const EX = {0: '1：一个', 1: '2', 2: '4：一个区块是 16 × 16，16 = 4 × 4', 3: '8：下界一格 = 主世界 8 格', 4: '16：区块的边长；鸡蛋、雪球一组 16 个', 5: '32：一个 region 是 32 × 32 个区块', 6: '64：一组', 7: '128：最小的地图边长；很早以前的世界高度', 8: '256：一个字节能表示 256 种不同的值；1.17 以前的世界高度', 9: '512：一个 region 文件管 512 × 512 格', 10: '1024：1 KB 大约是 1024 字节', 12: '4096：一个区块一层有 16 × 16 = 256 格，16 层是 4096 格', 15: '32768：/fill 一次最多填的格数', 16: '65536：一个 16 位的数能表示这么多种', 20: '1048576：大约一百万（1 MB 大约这么多字节）', 30: '1073741824：大约十亿（1 GB）', 31: '2147483648：计分板分数最大是它减 1'};
  slider('powN', v => '2^' + v, n => { const v = 2 ** n; kv($('#powKv'), [['2 的 ' + n + ' 次方', v.toLocaleString()], ['二进制', '1' + '0'.repeat(n)], ['十进制位数', String(v).length + ' 位']]); const near = Object.keys(EX).map(Number).filter(k => k <= n).pop(); $('#powSay').innerHTML = EX[n] ? '<b>' + EX[n] + '</b>' : '（游戏里不常见。比它小的最近一个：2^' + near + ' = ' + EX[near] + '）'; });
});
dev('#divFig', () => {
  const N = [64, 60, 27, 36, 54, 24000, 16, 100]; let n = 64;
  const draw = () => { const p = +$('#dvP').value, q = Math.floor(n / p), r = n % p, fac = []; for (let i = 1; i <= n; i++) if (n % i === 0) fac.push(i);
    $('#dvSay').innerHTML = n + ' 个分给 ' + p + ' 个人：每人 <b>' + q + '</b> 个，' + (r ? '还剩 <b>' + r + '</b> 个，分不完。' : '正好分完！' + p + ' 是 ' + n + ' 的因数。') + '<br>' + n + ' 的因数（' + fac.length + ' 个）：' + (fac.length > 40 ? fac.slice(0, 40).join('、') + '……' : fac.join('、')); };
  btnRow($('#dvN'), N.map(String), 0, i => { n = N[i]; draw(); });
  slider('dvP', v => v + ' 人', () => draw());
});

/* 第六十二章 */
dev('#netFig', () => {
  const ox = $('#ntOx'), oz = $('#ntOz'), nx = $('#ntNx'), nz = $('#ntNz'), say = $('#ntSay');
  const fromO = () => { const x = numIn(ox.value), z = numIn(oz.value); if (isNaN(x) || isNaN(z)) return; nx.value = Math.floor(x / 8); nz.value = Math.floor(z / 8); say.innerHTML = '主世界 → 下界：x = ' + x + ' ÷ 8 = ' + (x / 8) + (x % 8 ? ' → 取整 ' + Math.floor(x / 8) : '') + '；z = ' + z + ' ÷ 8 = ' + (z / 8) + (z % 8 ? ' → 取整 ' + Math.floor(z / 8) : '') + '。在下界走 ' + Math.round(Math.hypot(Math.floor(x / 8), Math.floor(z / 8))) + ' 格左右，相当于主世界 ' + Math.round(Math.hypot(x, z)) + ' 格。'; };
  const fromN = () => { const x = numIn(nx.value), z = numIn(nz.value); if (isNaN(x) || isNaN(z)) return; ox.value = x * 8; oz.value = z * 8; say.innerHTML = '下界 → 主世界：x = ' + x + ' × 8 = ' + x * 8 + '；z = ' + z + ' × 8 = ' + z * 8 + '。'; };
  [ox, oz].forEach(i => i.addEventListener('input', fromO)); [nx, nz].forEach(i => i.addEventListener('input', fromN)); fromO();
});
dev('#craftFig', () => {
  const K = ['火把', '木棍', '面包', '铁块'];
  let k = 0;
  const ce = (a, b) => Math.ceil(a / b);
  const draw = () => { const n = +$('#cfN').value; let h = '';
    if (k === 0) { const tb = ce(n, 4), sb = ce(tb, 4), pl = sb * 2, lg = ce(pl, 4); h = '想要 ' + n + ' 个火把：每次合成出 4 个，要合成 ' + n + ' ÷ 4 → <b>' + tb + '</b> 次，需要 ' + tb + ' 根木棍 + ' + tb + ' 块煤。<br>' + tb + ' 根木棍：每次 4 根，合成 ' + tb + ' ÷ 4 → ' + sb + ' 次，需要 ' + pl + ' 块木板。<br>' + pl + ' 块木板：每块原木 4 块，要 ' + pl + ' ÷ 4 → <b>' + lg + '</b> 块原木。<br>最后剩下：火把 ' + (tb * 4 - n) + ' 个，木棍 ' + (sb * 4 - tb) + ' 根，木板 ' + (lg * 4 - pl) + ' 块。'; }
    if (k === 1) { const sb = ce(n, 4), pl = sb * 2, lg = ce(pl, 4); h = '想要 ' + n + ' 根木棍：合成 ' + sb + ' 次，要 ' + pl + ' 块木板，要 <b>' + lg + '</b> 块原木。剩下木棍 ' + (sb * 4 - n) + ' 根、木板 ' + (lg * 4 - pl) + ' 块。<br>比：原木 : 木板 : 木棍 = 1 : 4 : 8。'; }
    if (k === 2) { h = '想要 ' + n + ' 个面包：每个 3 个小麦，要 ' + n + ' × 3 = <b>' + n * 3 + '</b> 个小麦。小麦 : 面包 = 3 : 1。'; }
    if (k === 3) { h = '想要 ' + n + ' 个铁块：每个 9 个铁锭，要 ' + n + ' × 9 = <b>' + n * 9 + '</b> 个铁锭，也就是 ' + Math.floor(n * 9 / 64) + ' 组又 ' + (n * 9 % 64) + ' 个。'; }
    $('#cfSay').innerHTML = h; };
  btnRow($('#cfK'), K, 0, i => { k = i; draw(); });
  slider('cfN', v => v + ' 个', () => draw());
});
dev('#fuelFig', () => {
  const K = [['煤', 8, '块'], ['木板', 1.5, '块'], ['木棍', .5, '根'], ['烈焰棒', 12, '根'], ['熔岩桶', 100, '桶']]; let k = 0;
  const fr = v => v === 1.5 ? '1½' : v === .5 ? '½' : v;
  const draw = () => { const n = +$('#flN').value, f = K[k], need = Math.ceil(n / f[1] - 1e-9), waste = need * f[1] - n;
    $('#flSay').innerHTML = '烧 ' + n + ' 个，用' + f[0] + '（一' + f[2] + '烧 ' + fr(f[1]) + ' 个）：' + n + ' ÷ ' + fr(f[1]) + ' = ' + (Math.round(n / f[1] * 100) / 100) + ' → 要 <b>' + need + '</b> ' + f[2] + '。' + (waste > 0 ? '最后一' + f[2] + '没烧完，浪费了能烧 ' + (Math.round(waste * 10) / 10) + ' 个的火。' : '正好烧完，一点不浪费。'); };
  btnRow($('#flK'), K.map(x => x[0]), 0, i => { k = i; draw(); });
  slider('flN', v => v + ' 个', () => draw());
});

/* 第六十三章 */
dev('#fenceFig', () => {
  const svg = $('#fcSvg'); let N = 40;
  const draw = () => { const half = (N - 4) / 2; const L = clamp(+$('#fcL').value, 1, half - 1); $('#fcL').max = half - 1; const W = half - L, area = L * W, best = Math.floor(half / 2) * Math.ceil(half / 2);
    $('#fcLO').textContent = L + ' 格';
    const S = Math.min(18, 380 / (L + 2), 240 / (W + 2)); let g = '';
    for (let i = 0; i < L + 2; i++) for (let j = 0; j < W + 2; j++) { const edge = i === 0 || j === 0 || i === L + 1 || j === W + 1; g += '<rect x="' + (i * S) + '" y="' + (j * S) + '" width="' + (S - 1) + '" height="' + (S - 1) + '" fill="' + (edge ? 'var(--wood-2)' : 'var(--grass)') + '" opacity="' + (edge ? 1 : .7) + '"/>'; }
    svg.setAttribute('viewBox', '0 0 ' + Math.max((L + 2) * S, 60) + ' ' + Math.max((W + 2) * S, 30)); svg.innerHTML = g;
    $('#fcSay').innerHTML = N + ' 根栅栏：围成 ' + L + ' × ' + W + '，里面的地有 <b>' + area + '</b> 格。' + (area === best ? ' 这是最大的了！长和宽最接近。' : ' 最大能围出 ' + best + ' 格。');
  };
  slider('fcN', v => v + ' 根', v => { N = v; draw(); });
  slider('fcL', v => v + ' 格', () => draw());
});
dev('#circFig', () => {
  const svg = $('#ciSvg');
  slider('ciR', v => v + ' 格', r => { const n = 2 * r + 1, S = 340 / n; let g = '', cnt = 0;
    for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) { const on = i * i + j * j <= r * r; if (on) cnt++; g += '<rect x="' + ((i + r) * S) + '" y="' + ((j + r) * S) + '" width="' + (S - .6) + '" height="' + (S - .6) + '" fill="' + (on ? 'var(--grass)' : 'var(--paper-2)') + '"/>'; }
    g += '<circle cx="' + (r + .5) * S + '" cy="' + (r + .5) * S + '" r="' + r * S + '" fill="none" stroke="var(--zhu)" stroke-width="1.5"/>';
    svg.setAttribute('viewBox', '0 0 ' + n * S + ' ' + n * S); svg.innerHTML = g;
    const pi = Math.PI * r * r; kv($('#ciKv'), [['方块数', cnt], ['π × r × r', pi.toFixed(1)], ['差', (cnt - pi).toFixed(1) + '（' + ((cnt - pi) / pi * 100).toFixed(1) + '%）'], ['方块数 ÷ (r × r)', (cnt / r / r).toFixed(3)]]); });
});

/* 第六十四章：方向盘 */
dev('#dialFig', () => {
  const svg = $('#dlSvg'), R = 120, C = 150; let yaw = -150, quiz = null;
  const bear = y => ((y + 180) % 360 + 360) % 360;
  const cn = b => { const N = ['北', '东', '南', '西']; if (b % 90 === 0) return '正' + N[b / 90]; const q = Math.floor(b / 90), r = b % 90; const P = [['北', '东'], ['东', '南'], ['南', '西'], ['西', '北']][q]; return r <= 45 ? P[0] + '偏' + P[1] + ' ' + r + '°' : P[1] + '偏' + P[0] + ' ' + (90 - r) + '°'; };
  const pt = (b, rr) => [C + Math.sin(b * DEG) * rr, C - Math.cos(b * DEG) * rr];
  const draw = () => { const b = bear(yaw); let g = '<circle cx="' + C + '" cy="' + C + '" r="' + R + '" fill="var(--paper)" stroke="var(--ink-2)" stroke-width="2"/>';
    for (let d = 0; d < 360; d += 15) { const a = pt(d, R), c = pt(d, R - (d % 90 ? 7 : 14)); g += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + c[0] + '" y2="' + c[1] + '" stroke="var(--ink-3)"/>'; }
    [['北 N', 0], ['东 E', 90], ['南 S', 180], ['西 W', 270]].forEach(l => { const p = pt(l[1], R + 18); g += txt(p[0], p[1] + 4, l[0], {s: 13, w: true}); });
    [['0', 180], ['90', 270], ['180', 0], ['−90', 90]].forEach(l => { const p = pt(l[1], R - 28); g += txt(p[0], p[1] + 4, l[0], {s: 10.5, c: 'var(--main)'}); });
    const tip = pt(b, R - 10); g += '<line x1="' + C + '" y1="' + C + '" x2="' + tip[0] + '" y2="' + tip[1] + '" stroke="var(--zhu)" stroke-width="4" stroke-linecap="round"/><circle cx="' + C + '" cy="' + C + '" r="6" fill="var(--zhu)"/>';
    if (b !== 0) { const a0 = pt(0, 40), a1 = pt(b, 40); g += '<path d="M' + C + ',' + C + ' L' + a0[0] + ',' + a0[1] + ' A40,40 0 ' + (b > 180 ? 1 : 0) + ',1 ' + a1[0] + ',' + a1[1] + ' Z" fill="var(--gold)" opacity=".35"/>'; }
    svg.setAttribute('viewBox', '0 0 300 300'); svg.innerHTML = g;
    kv($('#dlKv'), [['游戏角度', yaw + '°'], ['F3 Facing', facingOf(yaw)[0]], ['方位角', b + '°'], ['说法', cn(b)]]);
    $('#dlR').value = yaw; $('#dlRO').textContent = yaw + '°'; };
  slider('dlR', v => v + '°', v => { yaw = v; if (svg.innerHTML !== undefined) draw(); });
  const setFrom = e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 300 - C, y = (e.clientY - r.top) / r.height * 300 - C; let b = Math.round(Math.atan2(x, -y) / DEG); b = (b + 360) % 360; yaw = ((b - 180 + 540) % 360) - 180; draw(); };
  let drag = false; svg.addEventListener('pointerdown', e => { drag = true; setFrom(e); }); svg.addEventListener('pointermove', e => { if (drag) setFrom(e); }); window.addEventListener('pointerup', () => drag = false);
  $('#dlQ').addEventListener('click', () => { const b = pick([0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330]); quiz = b; $('#dlSay').className = 'say'; $('#dlSay').innerHTML = '把箭头转到：<b>' + cn(b) + '</b>，然后点“就是这个方向”。顺便想想它的游戏角度是多少。'; });
  $('#dlOk').addEventListener('click', () => { if (quiz === null) return; const b = bear(yaw), d = Math.min(Math.abs(b - quiz), 360 - Math.abs(b - quiz)), ok = d <= 5; $('#dlSay').className = 'say ' + (ok ? 'ok' : 'bad'); $('#dlSay').innerHTML = (ok ? '对了！' : '差了 ' + d + '°。') + ' ' + cn(quiz) + ' 是方位角 ' + quiz + '°，游戏角度 ' + (((quiz - 180 + 540) % 360) - 180) + '°。'; if (ok) quiz = null; });
  draw();
});

/* 第六十五章：扔鸡蛋 */
dev('#eggFig', () => {
  let thrown = 0, chicks = 0, hatched = 0, hist = [];
  const throwOne = () => { thrown++; if (Math.random() < 1 / 8) { hatched++; chicks += Math.random() < 1 / 32 ? 4 : 1; } hist.push([thrown, hatched / thrown * 100]); };
  const draw = () => { kv($('#egKv'), [['扔了', thrown + ' 个'], ['孵出过小鸡的蛋', hatched + ' 个'], ['小鸡一共', chicks + ' 只'], ['孵出比例', thrown ? (hatched / thrown * 100).toFixed(1) + '%' : '—']]);
    const pts = hist.length > 400 ? hist.filter((p, i) => i % Math.ceil(hist.length / 400) === 0 || i === hist.length - 1) : hist;
    lineChart($('#egLine'), [{color: 'var(--main)', pts: pts.length ? pts : [[0, 0]]}, {color: 'var(--zhu)', pts: [[0, 12.5], [Math.max(thrown, 16), 12.5]], dash: '5 4', w: 1.5}], {xmin: 0, xmax: Math.max(thrown, 16), ymin: 0, ymax: 50, yt: [0, 12.5, 25, 50], yf: v => v + '%', xt: [0, Math.max(thrown, 16)], H: 200}); };
  $$('#eggFig [data-e]').forEach(b => b.addEventListener('click', () => { const k = +b.dataset.e; if (!k) { thrown = chicks = hatched = 0; hist = []; } for (let i = 0; i < k; i++) throwOne(); draw(); $('#egSay').textContent = thrown >= 500 ? '扔得越多，折线越贴近那条 12.5% 的红虚线。' : '扔得少的时候，比例跳来跳去很正常。'; }));
  $('#egHist').addEventListener('click', () => { const c = new Array(9).fill(0); for (let t = 0; t < 300; t++) { let h = 0; for (let i = 0; i < 16; i++) if (Math.random() < 1 / 8) h++; c[Math.min(h, 8)]++; }
    bars($('#egBars'), c.map((v, i) => [(i === 8 ? '8 只以上' : i + ' 只'), v]), Math.max(...c), v => v + ' 次');
    $('#egSay').textContent = '300 次里，“一只都没有”出现了 ' + c[0] + ' 次（大约 ' + Math.round(c[0] / 3) + '%）。所以扔 16 个蛋一只都没孵出来，并不稀奇。最常见的是 2 只左右。'; });
  draw();
});
dev('#statFig', () => {
  const inp = $('#stIn');
  const draw = () => { const v = inp.value.split(/[,，\s]+/).map(numIn).filter(x => !isNaN(x)); if (!v.length) { kv($('#stKv'), [['', '写几个数']]); $('#stBars').innerHTML = ''; return; }
    const s = v.reduce((a, b) => a + b, 0), mean = s / v.length, so = v.slice().sort((a, b) => a - b), med = so.length % 2 ? so[(so.length - 1) / 2] : (so[so.length / 2 - 1] + so[so.length / 2]) / 2;
    const cnt = {}; v.forEach(x => cnt[x] = (cnt[x] || 0) + 1); const mx = Math.max(...Object.values(cnt)), mode = Object.keys(cnt).filter(k => cnt[k] === mx);
    kv($('#stKv'), [['个数', v.length], ['平均数', (Math.round(mean * 100) / 100)], ['中位数', med], ['众数', mx > 1 ? mode.join('、') : '没有（都只出现一次）'], ['最大 − 最小', so[so.length - 1] - so[0]]]);
    bars($('#stBars'), v.map((x, i) => ['第 ' + (i + 1) + ' 个', x, '', x > mean ? 'var(--ter)' : '']), Math.max(...v, 1), x => x);
    $('#stSay').innerHTML = '平均数 = ' + s + ' ÷ ' + v.length + ' ≈ ' + (Math.round(mean * 100) / 100) + '。排好队：' + so.join(', ') + '，中间的是 ' + med + '。' + (Math.abs(mean - med) > Math.max(1, Math.abs(med) * .3) ? ' 平均数和中位数差得比较多，说明有特别大或特别小的数。' : ''); };
  inp.addEventListener('input', draw); draw();
});

/* 第六十六章 */
const SPD = [['潜行', 1.31], ['走', 4.317], ['跑', 5.612], ['矿车', 8]];
dev('#raceFig', () => {
  const draw = () => { const d = +$('#rcD').value; bars($('#rcBars'), SPD.map(s => [s[0], d / s[1], s[1] + ' 格/秒']), d / SPD[0][1], v => v.toFixed(1) + ' 秒'); };
  slider('rcD', v => v + ' 格', draw);
  $('#rcGo').addEventListener('click', () => { const d = +$('#rcD').value, tr = $('#rcTrack'); tr.innerHTML = SPD.map(s => '<div class="lane"><span>' + s[0] + '</span><i></i></div>').join(''); const t0 = performance.now(), speedUp = Math.max(1, d / SPD[0][1] / 8);
    const step = () => { const t = (performance.now() - t0) / 1000 * speedUp; let all = true; $$('.lane i', tr).forEach((el, i) => { const p = Math.min(1, SPD[i][1] * t / d); if (p < 1) all = false; el.style.width = (p * 100) + '%'; el.textContent = p >= 1 ? (d / SPD[i][1]).toFixed(1) + ' 秒' : ''; }); if (!all) requestAnimationFrame(step); };
    requestAnimationFrame(step); });
});
dev('#proofFig', () => {
  const svg = $('#pfSvg'), K = [[3, 4], [6, 8], [5, 12], [2, 3], [1, 1], [8, 15]];
  const draw = k => {
    const [a, b] = k, c2 = a * a + b * b, c = Math.sqrt(c2), S = 10;
    const B = [0, 0], A = [0, -a * S], C = [-b * S, 0];
    let g = '';
    const cells = (x0, y0, n, col) => { for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) g += '<rect x="' + (x0 + i * S) + '" y="' + (y0 + j * S) + '" width="' + (S - .8) + '" height="' + (S - .8) + '" fill="' + col + '" opacity=".8"/>'; };
    cells(0, -a * S, a, 'var(--grass)');
    cells(-b * S, 0, b, 'var(--water)');
    g += txt(a * S / 2, -a * S / 2 + 4, a * a, {s: 12, w: true}) + txt(-b * S / 2, b * S / 2 + 4, b * b, {s: 12, w: true});
    const dx = A[0] - C[0], dy = A[1] - C[1], L = Math.hypot(dx, dy);
    let nx = -dy / L, ny = dx / L; const mx = (A[0] + C[0]) / 2, my = (A[1] + C[1]) / 2;
    if ((mx + nx - B[0]) ** 2 + (my + ny - B[1]) ** 2 < (mx - B[0]) ** 2 + (my - B[1]) ** 2) { nx = -nx; ny = -ny; }
    nx *= L; ny *= L;
    g += '<path d="M' + C[0] + ',' + C[1] + 'L' + A[0] + ',' + A[1] + 'L' + (A[0] + nx) + ',' + (A[1] + ny) + 'L' + (C[0] + nx) + ',' + (C[1] + ny) + 'Z" fill="var(--zhu)" opacity=".22" stroke="var(--zhu)" stroke-width="1.5"/>';
    g += '<path d="M' + A[0] + ',' + A[1] + 'L' + B[0] + ',' + B[1] + 'L' + C[0] + ',' + C[1] + 'Z" fill="var(--gold)" opacity=".6" stroke="var(--ink)" stroke-width="1.5"/>';
    g += txt(mx + nx / 2, my + ny / 2 + 4, c2, {s: 13, w: true, c: 'var(--zhu)'});
    const xs = [A[0], B[0], C[0], A[0] + nx, C[0] + nx, a * S], ys = [A[1], B[1], C[1], A[1] + ny, C[1] + ny, b * S];
    const x0 = Math.min(...xs) - 8, y0 = Math.min(...ys) - 8, x1 = Math.max(...xs) + 8, y1 = Math.max(...ys) + 8;
    svg.setAttribute('viewBox', x0 + ' ' + y0 + ' ' + (x1 - x0) + ' ' + (y1 - y0)); svg.innerHTML = g;
    $('#pfSay').innerHTML = '绿：' + a + ' × ' + a + ' = ' + a * a + '　蓝：' + b + ' × ' + b + ' = ' + b * b + '　加起来 ' + c2 + '。斜边上红色正方形的面积也是 ' + c2 + '，所以斜边 = √' + c2 + (Number.isInteger(c) ? ' = <b>' + c + '</b>，正好是整数。这样的三个数叫“勾股数”。' : ' ≈ ' + c.toFixed(2) + '，不是整数：方块拼不出这个正方形，可定理照样成立。');
  };
  btnRow($('#pfBtns'), K.map(k => k[0] + '、' + k[1]), 0, i => draw(K[i])); draw(K[0]);
});
dev('#distFig', () => {
  const svg = $('#dtSvg'), R = 10, S = 18, W = (2 * R + 1) * S; let P = [[-6, 5], [3, -7]], k = 0;
  const X = x => (x + R) * S + S / 2, Z = z => (z + R) * S + S / 2;
  const draw = () => { let g = '<rect width="' + W + '" height="' + W + '" fill="var(--paper)"/>';
    for (let i = 0; i <= 2 * R + 1; i++) g += '<line x1="' + i * S + '" x2="' + i * S + '" y1="0" y2="' + W + '" stroke="var(--rule)" stroke-width=".6"/><line y1="' + i * S + '" y2="' + i * S + '" x1="0" x2="' + W + '" stroke="var(--rule)" stroke-width=".6"/>';
    const [a, b] = P, dx = b[0] - a[0], dz = b[1] - a[1];
    g += '<path d="M' + X(a[0]) + ',' + Z(a[1]) + 'L' + X(b[0]) + ',' + Z(a[1]) + 'L' + X(b[0]) + ',' + Z(b[1]) + '" fill="none" stroke="var(--ter)" stroke-width="3" stroke-dasharray="6 3"/>';
    g += '<line x1="' + X(a[0]) + '" y1="' + Z(a[1]) + '" x2="' + X(b[0]) + '" y2="' + Z(b[1]) + '" stroke="var(--zhu)" stroke-width="3"/>';
    g += '<circle cx="' + X(a[0]) + '" cy="' + Z(a[1]) + '" r="7" fill="var(--main)"/><circle cx="' + X(b[0]) + '" cy="' + Z(b[1]) + '" r="7" fill="var(--gold)"/>' + txt(X(a[0]), Z(a[1]) - 10, '起点', {s: 11, w: true}) + txt(X(b[0]), Z(b[1]) - 10, '终点', {s: 11, w: true});
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + W); svg.innerHTML = g;
    const man = Math.abs(dx) + Math.abs(dz), eu = Math.hypot(dx, dz);
    kv($('#dtKv'), [['往东西走', Math.abs(dx) + ' 格'], ['往南北走', Math.abs(dz) + ' 格'], ['横平竖直', man + ' 格'], ['斜着直走', eu.toFixed(2) + ' 格'], ['省了', (man - eu).toFixed(2) + ' 格'], ['跑过去', (eu / 5.612).toFixed(1) + ' 秒']]);
    $('#dtSay').innerHTML = '√(' + Math.abs(dx) + '² + ' + Math.abs(dz) + '²) = √' + (dx * dx + dz * dz) + ' ≈ ' + eu.toFixed(2) + '。棕色虚线是先横后竖，红线是抄近路。点网格换点（先点的是起点）。'; };
  svg.addEventListener('click', e => { const r = svg.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * W / S) - R, z = Math.floor((e.clientY - r.top) / r.height * W / S) - R; P[k] = [x, z]; k = 1 - k; draw(); });
  draw();
});
