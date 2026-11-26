/* ================= 第五部 · 手：各章装置 ================= */
const lowk = e => (e.key || '').toLowerCase();
/* 第三十三章：键盘 */
dev('#kbBox', box => keyboard(box, {live: true, goals: [
  {t: '按 ⌘C（拷贝）', ok: e => e.metaKey && !e.shiftKey && lowk(e) === 'c'},
  {t: '按 ⌘V（粘贴）', ok: e => e.metaKey && !e.shiftKey && lowk(e) === 'v'},
  {t: '按 ⌘Z（撤销）', ok: e => e.metaKey && !e.shiftKey && lowk(e) === 'z'},
  {t: '按 ⇧⌘Z（重做）', ok: e => e.metaKey && e.shiftKey && lowk(e) === 'z'},
  {t: '按 ⌘A（全选）', ok: e => e.metaKey && lowk(e) === 'a'},
  {t: '单按一下 ⌥ option', ok: e => e.key === 'Alt'},
  {t: '单按一下 ⌃ control', ok: e => e.key === 'Control'},
  {t: '按住 shift，打一个大写字母', ok: e => e.shiftKey && !e.metaKey && /^[A-Z]$/.test(e.key)}
]}));

/* 第三十四章：手势练习板 */
dev('#padArea', pad => {
  const G0 = [['点一下', 'click'], ['快速点两下', 'dbl'], ['右键（两指点，或 control + 点）', 'ctx'], ['两指上下滑（或滚鼠标滚轮）', 'wy'], ['两指左右滑', 'wx'], ['两指捏合或分开（放大缩小）', 'pinch'], ['按住拖一段', 'drag']];
  const got = new Set(), ul = $('#padGoals');
  const draw = () => { ul.innerHTML = G0.map(g => '<li' + (got.has(g[1]) ? ' class="ok"' : '') + '>' + g[0] + '</li>').join(''); };
  let flashT = 0;
  const hit = (k, msg) => { got.add(k); draw(); pad.textContent = msg; pad.classList.add('hit'); clearTimeout(flashT); flashT = setTimeout(() => pad.classList.remove('hit'), 300); };
  let down = null, dragged = false;
  pad.addEventListener('click', e => { if (dragged) return; if (e.detail === 1) hit('click', '点一下 · click'); });
  pad.addEventListener('dblclick', () => hit('dbl', '点两下 · double-click'));
  pad.addEventListener('contextmenu', e => { e.preventDefault(); hit('ctx', '右键 · right-click：平时这里会弹出一个菜单'); });
  pad.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.ctrlKey) return hit('pinch', '捏合 · pinch：平时会放大缩小');
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2) hit('wx', '左右滑 · scroll sideways');
    else if (Math.abs(e.deltaY) > 2) hit('wy', '上下滑 · scroll：平时会滚动页面');
  }, {passive: false});
  ['gesturestart', 'gesturechange'].forEach(t => pad.addEventListener(t, e => { e.preventDefault(); hit('pinch', '捏合 · pinch：平时会放大缩小'); }));
  pad.addEventListener('pointerdown', e => { if (e.button === 0) { down = [e.clientX, e.clientY]; dragged = false; } });
  pad.addEventListener('pointermove', e => { if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 40) { dragged = true; hit('drag', '拖 · drag'); } });
  window.addEventListener('pointerup', () => { down = null; setTimeout(() => dragged = false, 0); });
  draw();
});

/* 第三十四章：标点侦探 */
dev('#puncFig', () => {
  const inp = $('#puncIn'), out = $('#puncOut'), say = $('#puncSay'), codes = $('#puncCodes');
  const MAP = {'　': ' ', '“': '"', '”': '"', '‘': "'", '’': "'", '、': ',', '。': '.', '【': '[', '】': ']', '《': '<', '》': '>', '…': '...', '—': '-', '·': '.'};
  const bad = ch => { const c = ch.codePointAt(0); return (c >= 0xFF01 && c <= 0xFF5E) || MAP[ch] !== undefined; };
  const fix = ch => { const c = ch.codePointAt(0); return c >= 0xFF01 && c <= 0xFF5E ? String.fromCodePoint(c - 0xFEE0) : MAP[ch] !== undefined ? MAP[ch] : ch; };
  const NAME = {'　': '全角空格', '，': '中文逗号', '：': '中文冒号', '；': '中文分号', '（': '中文括号', '）': '中文括号', '～': '中文波浪号', '“': '中文引号', '”': '中文引号', '。': '中文句号', '！': '中文叹号', '＠': '全角@', '／': '全角斜杠'};
  function draw(){
    const t = inp.value, chars = [...t];
    let n = 0, h = '';
    chars.forEach(ch => { if (bad(ch)) { n++; h += '<mark' + (ch === '　' ? ' class="sp"' : '') + ' title="' + (NAME[ch] || '全角字符') + '">' + (ch === '　' ? '&nbsp;' : esc(ch)) + '</mark>'; } else h += ch === ' ' ? '&nbsp;' : esc(ch); });
    out.innerHTML = h || '<span style="color:var(--ink-3)">（空的）</span>';
    const cjk = chars.filter(ch => /[一-鿿]/.test(ch)).length;
    say.className = 'say ' + (n ? 'bad' : 'ok');
    say.innerHTML = n ? '找到 <b>' + n + '</b> 个中文标点或全角字符（红色的）。命令里它们会让游戏看不懂。点“修好它”。' : '没有中文标点和全角空格，命令的“外壳”是干净的。' + (cjk ? '里面有 ' + cjk + ' 个汉字：如果它们在 /say 后面当作要说的话，没问题；如果是方块名、命令名，要换成英文。' : '');
    codes.innerHTML = chars.slice(0, 60).map(ch => { const c = ch.codePointAt(0); return '<span style="display:inline-block;margin:0 10px 2px 0;' + (bad(ch) ? 'color:var(--zhu);font-weight:700' : '') + '">' + (ch === ' ' ? '空格' : ch === '　' ? '宽空格' : esc(ch)) + '=' + c + '</span>'; }).join('') + (chars.length > 60 ? '……' : '');
  }
  inp.addEventListener('input', draw);
  $('#puncFix').addEventListener('click', () => { inp.value = [...inp.value].map(fix).join(''); draw(); });
  $('#puncEx1').addEventListener('click', () => { inp.value = '/tp @s ～　～5 ～'; draw(); });
  $('#puncEx2').addEventListener('click', () => { inp.value = '/summon minecraft：pig ~ ~ ~ {CustomName：“小猪”}'; draw(); });
  draw();
});

/* 第三十五章：游戏键位 */
dev('#gkBox', box => {
  const K = (t, code) => ({t, ok: e => !e.metaKey && e.code === code});
  keyboard(box, {mode: 2, live: true, goals: [K('打开物品栏', 'KeyE'), K('跳', 'Space'), K('潜行', 'ShiftLeft'), K('跑', 'ControlLeft'), K('扔掉手里的一个', 'KeyQ'), K('打开聊天框', 'KeyT'), K('直接打命令', 'Slash'), K('换到快捷栏第 5 格', 'Digit5'), K('和副手换东西', 'KeyF'), K('打开进度', 'KeyL')]});
});

/* 第三十五章：按键反应 */
dev('#rxFig', () => {
  const ACT = [['打开物品栏', 'Open Inventory', 'KeyE', 'E'], ['跳', 'Jump', 'Space', '空格'], ['潜行', 'Sneak', 'ShiftLeft', '左 shift'], ['扔掉手里的东西', 'Drop Selected Item', 'KeyQ', 'Q'], ['打开聊天框', 'Open Chat', 'KeyT', 'T'], ['打开进度', 'Advancements', 'KeyL', 'L'], ['和副手换东西', 'Swap Item With Offhand', 'KeyF', 'F'], ['往前走', 'Walk Forwards', 'KeyW', 'W'], ['往左走', 'Strafe Left', 'KeyA', 'A'], ['换到第 3 格', 'Hotbar Slot 3', 'Digit3', '3'], ['直接打命令', 'Open Command', 'Slash', '/'], ['往后退', 'Walk Backwards', 'KeyS', 'S']];
  const show = $('#rxShow'), say = $('#rxSay'), go = $('#rxGo');
  let run = false, round = 0, cur = null, t0 = 0, times = [], timer = 0, wrong = 0;
  function next(){
    cur = null; show.textContent = '……'; clearTimeout(timer);
    if (round >= 10) return end();
    timer = setTimeout(() => { cur = ACT[Math.floor(Math.random() * ACT.length)]; show.innerHTML = cur[0] + '<br><small style="font-size:15px;font-family:var(--f-mono)">' + cur[1] + '</small>'; t0 = performance.now(); }, 600 + Math.random() * 900);
  }
  function end(){
    run = false; go.textContent = '再来一次';
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    show.textContent = '平均 ' + Math.round(avg) + ' 毫秒';
    say.innerHTML = '十轮的时间加起来是 ' + Math.round(times.reduce((a, b) => a + b, 0)) + ' 毫秒，除以 10，平均 <b>' + Math.round(avg) + '</b> 毫秒。最快 ' + Math.round(Math.min(...times)) + '，最慢 ' + Math.round(Math.max(...times)) + '。按错了 ' + wrong + ' 次。（1000 毫秒 = 1 秒）';
    bars($('#rxBars'), times.map((t, i) => ['第 ' + (i + 1) + ' 轮', t, '', t > avg ? 'var(--ter)' : '']).concat([['平均', avg, '', 'var(--gold)']]), Math.max(...times), v => Math.round(v) + ' ms');
  }
  document.addEventListener('keydown', e => {
    if (!run) return;
    if (['Space', 'Slash', 'Quote', 'Tab'].includes(e.code)) e.preventDefault();
    if (!cur || e.metaKey || e.repeat) return;
    if (e.code === cur[2]) { const t = performance.now() - t0; times.push(t); round++; say.textContent = '第 ' + round + ' 轮：' + Math.round(t) + ' 毫秒。'; next(); }
    else { wrong++; const a = ACT.find(x => x[2] === e.code); say.textContent = '按错了：' + (a ? '那是“' + a[0] + '”。' : '这个键默认没有用处。') + '要按的是 ' + cur[3] + '。'; }
  });
  go.addEventListener('click', () => { run = true; round = 0; times = []; wrong = 0; $('#rxBars').innerHTML = ''; say.textContent = '把手放在键盘上，别用鼠标。'; go.textContent = '进行中……'; go.blur(); next(); });
});

/* 第三十六章：树图 */
dev('#fsTreeSvg', svg => {
  const N = [
    [300, 26, 'Macintosh HD  /', 'd'],
    [90, 92, '应用程序', 'd'], [230, 92, '用户 Users', 'd'], [370, 92, '资源库', 'd'], [500, 92, '系统', 'd'],
    [230, 156, 'xiaoge（家）', 'd'],
    [70, 224, '桌面', 'd'], [175, 224, '文稿', 'd'], [280, 224, '下载', 'd'], [395, 224, '资源库（藏着）', 'h'],
    [70, 290, '截屏.png', 'f'], [175, 290, '编程课', 'd'], [395, 290, 'minecraft…', 'h'],
    [175, 352, '小海龟.py', 'f']
  ];
  const E = [[0, 1], [0, 2], [0, 3], [0, 4], [2, 5], [5, 6], [5, 7], [5, 8], [5, 9], [6, 10], [7, 11], [9, 12], [11, 13]];
  let g = '';
  E.forEach(([a, b]) => { const p = N[a], q = N[b]; g += '<path d="M' + p[0] + ',' + (p[1] + 12) + ' C' + p[0] + ',' + (p[1] + 34) + ' ' + q[0] + ',' + (q[1] - 34) + ' ' + q[0] + ',' + (q[1] - 12) + '" fill="none" stroke="var(--ter)" stroke-width="2"/>'; });
  N.forEach(n => { const w = Math.max(64, n[2].length * 13 + 14); g += '<rect x="' + (n[0] - w / 2) + '" y="' + (n[1] - 13) + '" width="' + w + '" height="26" rx="' + (n[3] === 'f' ? 13 : 4) + '" fill="' + (n[3] === 'f' ? 'var(--grass)' : 'var(--card)') + '" stroke="' + (n[3] === 'h' ? 'var(--ink-3)' : 'var(--ink-2)') + '" stroke-width="1.5"' + (n[3] === 'h' ? ' stroke-dasharray="4 3"' : '') + '/>' + txt(n[0], n[1] + 5, n[2], {s: 12.5, c: n[3] === 'f' ? '#fff' : 'var(--ink)', halo: false}); });
  g += txt(560, 40, '根', {s: 13, c: 'var(--main)', w: true}) + txt(560, 230, '树枝', {s: 13, c: 'var(--main)', w: true}) + txt(560, 356, '叶子', {s: 13, c: 'var(--main)', w: true});
  svg.setAttribute('viewBox', '0 0 600 375'); svg.innerHTML = g;
});

/* 第三十六—三十八章：模拟访达 */
dev('#fd1', box => finder(box, {start: HOME + '/Desktop', tasks: [
  {t: '打开“文稿”', p: HOME + '/Documents'},
  {t: '找到“小海龟.py”，选中它', p: HOME + '/Documents/编程课/小海龟.py'},
  {t: '看一眼桌面上的“暑假计划.txt”', p: HOME + '/Desktop/暑假计划.txt'},
  {t: '在“应用程序”里的“实用工具”中找到“终端.app”', p: '/Applications/Utilities/终端.app'},
  {t: '用最下面的路径栏跳回 xiaoge（家）', p: HOME}
]}));
dev('#fd2', box => finder(box, {start: HOME + '/Desktop', tasks: [
  {t: '在“前往文件夹”里打 <code>~/Library</code>，回车', p: HOME + '/Library'},
  {t: '走到 minecraft 文件夹', p: HOME + '/Library/Application Support/minecraft'},
  {t: '打开 saves，看看有几个世界', p: HOME + '/Library/Application Support/minecraft/saves'},
  {t: '回到家，让隐藏文件露出来，选中 <code>.zshrc</code>', p: HOME + '/.zshrc'},
  {t: '点“显示真名”，去 <code>/Users</code> 看看“用户”的真名', p: '/Users'}
]}));
const MCP = HOME + '/Library/Application Support/minecraft';
dev('#fd3', box => finder(box, {start: MCP, real: true, tasks: [
  {t: '找到截图 2026-07-12_15.05.21.png', p: MCP + '/screenshots/2026-07-12_15.05.21.png'},
  {t: '打开日志 logs/latest.log，看看最后一行写了什么', p: MCP + '/logs/latest.log'},
  {t: '看 options.txt 里视野距离是多少', p: MCP + '/options.txt'},
  {t: '找到 gongfang 世界里的 hello.mcfunction', p: MCP + '/saves/gongfang/datapacks/xiaoge_pack/data/xiaoge/function/hello.mcfunction'},
  {t: '找到游戏里“制作备份”做出来的 zip', p: MCP + '/backups/2026-07-20_19-50-12_gongfang.zip'}
]}));

/* 第三十七章：读路径 */
dev('#pathFig', () => {
  const root = makeFS(), inp = $('#pathIn'), out = $('#pathOut'), say = $('#pathSay');
  const EX = ['~/Desktop', '/Users/xiaoge/Documents/编程课/小海龟.py', '~/Library/Application Support/minecraft/saves/gongfang', '~/Documents/../Desktop', '~/Library/Application Support/minecraft/screenshot', 'Documents/编程课'];
  $('#pathEx').innerHTML = EX.map((x, i) => '<button class="btn" data-i="' + i + '"><code>' + esc(x) + '</code></button>').join('');
  $('#pathEx').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; inp.value = EX[+b.dataset.i]; draw(); });
  function draw(){
    let p = inp.value.trim();
    if (!p) { out.innerHTML = ''; say.textContent = '打一个路径试试。'; return; }
    const notes = [];
    if (/[～，：]|　/.test(p)) notes.push('里面有中文标点或全角字符（～ ， ： 或宽空格），路径里要用英文的。');
    let full = p;
    if (p === '~' || p.startsWith('~/')) { full = HOME + p.slice(1); notes.push('开头的 ~ 是家，等于 <code>' + HOME + '</code>。'); }
    else if (!p.startsWith('/')) { full = HOME + '/' + p; notes.push('不以 / 或 ~ 开头，是<b>相对路径</b>：要看你现在在哪儿。这里假设你在家（~）里。'); }
    else notes.push('以 / 开头，是<b>绝对路径</b>：从根出发。');
    const segs = full.split('/').filter(Boolean);
    let node = root, stack = [root], h = '<span class="cb root">/ 根</span>', ok = true;
    segs.forEach(s => {
      if (!ok) { h += '<span class="sep">›</span><span class="cb no">' + esc(s) + '</span>'; return; }
      if (s === '.') { h += '<span class="sep">›</span><span class="cb dot">. 这里</span>'; return; }
      if (s === '..') { stack.pop(); node = stack[stack.length - 1] || root; h += '<span class="sep">›</span><span class="cb dot">.. 退回 ' + esc(node.root ? '/' : node.n) + '</span>'; return; }
      const nx = node.k === 'd' && node.c.find(x => x.n === s);
      if (!nx) { ok = false; h += '<span class="sep">›</span><span class="cb no">' + esc(s) + '<small>找不到</small></span>'; notes.push('在 <code>' + esc(node.root ? '/' : node.n) + '</code> 里找不到“' + esc(s) + '”。' + (node.k === 'd' ? '这里有：' + node.c.filter(x => !x.hide).slice(0, 8).map(x => '<code>' + esc(x.n) + '</code>').join(' ') : '它是文件，不能再往里走。')); return; }
      node = nx; stack.push(nx);
      h += '<span class="sep">›</span><span class="cb ' + (nx.k === 'd' ? 'd' : 'f') + (nx.hide ? ' h' : '') + '">' + esc(nx.n) + (nx.zh ? '<small>访达里叫“' + nx.zh + '”</small>' : nx.hide ? '<small>平时藏着</small>' : nx.k === 'f' ? '<small>文件</small>' : '') + '</span>';
    });
    out.innerHTML = h;
    say.className = 'say ' + (ok ? 'ok' : 'bad');
    say.innerHTML = (ok ? '找到了！一共 ' + segs.filter(s => s !== '.' && s !== '..').length + ' 级。' : '没找到。') + '<br>' + notes.join('<br>');
  }
  inp.addEventListener('input', draw); draw();
});

/* 第三十八章：这块地在哪个文件里 */
dev('#regFig', () => {
  const svg = $('#regSvg'); let x = 700, z = -20;
  const fl = Math.floor;
  function draw(){
    const W = 360, R = 3, cell = W / (2 * R); // 显示 −3…2 六个区域
    const X = v => (v / 512 + R) * cell, Z = v => (v / 512 + R) * cell;
    let g = '';
    for (let i = -R; i < R; i++) for (let j = -R; j < R; j++) {
      const on = i === fl(x / 512) && j === fl(z / 512);
      g += '<rect x="' + ((i + R) * cell) + '" y="' + ((j + R) * cell) + '" width="' + cell + '" height="' + cell + '" fill="' + (on ? 'var(--grass)' : 'var(--paper)') + '" fill-opacity="' + (on ? .5 : 1) + '" stroke="var(--rule)"/>' + txt((i + R + .5) * cell, (j + R + .5) * cell + 4, 'r.' + i + '.' + j, {s: 11, c: on ? 'var(--ink)' : 'var(--ink-3)', halo: false});
    }
    g += '<line x1="' + X(0) + '" x2="' + X(0) + '" y1="0" y2="' + W + '" stroke="var(--zhu)" stroke-width="1.5"/><line y1="' + Z(0) + '" y2="' + Z(0) + '" x1="0" x2="' + W + '" stroke="var(--blu)" stroke-width="1.5"/>';
    g += txt(W - 4, Z(0) - 5, 'x →', {s: 12, a: 'end', c: 'var(--zhu)', w: true}) + txt(X(0) + 5, W - 6, 'z ↓（南）', {s: 12, a: 'start', c: 'var(--blu)', w: true});
    g += '<circle cx="' + X(x) + '" cy="' + Z(z) + '" r="6" fill="var(--zhu)" stroke="var(--card)" stroke-width="2"/>';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + W); svg.innerHTML = g;
    const rx = fl(x / 512), rz = fl(z / 512), cx = fl(x / 16), cz = fl(z / 16);
    kv($('#regKv'), [['区块（x, z）', cx + ', ' + cz], ['region 文件', 'r.' + rx + '.' + rz + '.mca'], ['这个文件管的 x', rx * 512 + ' 到 ' + (rx * 512 + 511)], ['这个文件管的 z', rz * 512 + ' 到 ' + (rz * 512 + 511)]]);
    $('#regSay').innerHTML = 'x：' + x + ' ÷ 512 ≈ ' + (x / 512).toFixed(2) + '，往小取整 → <b>' + rx + '</b>。z：' + z + ' ÷ 512 ≈ ' + (z / 512).toFixed(2) + '，往小取整 → <b>' + rz + '</b>。' + ((x < 0 && x / 512 > -1) || (z < 0 && z / 512 > -1) ? ' 注意负数：比 0 小一点点，往小取就是 −1，不是 0。' : '');
  }
  slider('regX', v => v, v => { x = v; if (svg) draw(); });
  slider('regZ', v => v, v => { z = v; draw(); });
  svg.addEventListener('click', e => { const r = svg.getBoundingClientRect(), W = 360, k = W / r.width; x = Math.round(((e.clientX - r.left) * k / 60 - 3) * 512); z = Math.round(((e.clientY - r.top) * k / 60 - 3) * 512); $('#regX').value = x; $('#regZ').value = z; $('#regXO').textContent = x; $('#regZO').textContent = z; draw(); });
});

/* 第三十九章：模拟终端 */
dev('#term1', box => terminal(box, {tasks: [
  {t: '打 <code>pwd</code>，看看你在哪儿', ok: c => c === 'pwd'},
  {t: '在家里打 <code>ls</code>，看看有什么', ok: (c, w) => /^ls\b/.test(c) && w === HOME},
  {t: '<code>cd Documents</code> 走进文稿，再用 <code>cd ..</code> 退回家', ok: (c, w) => c === 'cd ..' && w === HOME},
  {t: '走进游戏目录 minecraft（用 tab 补全）', ok: (c, w) => /\/minecraft$/.test(w)},
  {t: '用 <code>cat</code> 看 options.txt 里的视野距离', ok: (c, w, o) => o === 'cat:options.txt'},
  {t: '在家里用 <code>ls -a</code> 找到藏起来的 .zshrc', ok: (c, w) => /^ls\s+-[a-zA-Z]*a/.test(c) && w === HOME},
  {t: '打 <code>open .</code>，用访达打开“这里”', ok: c => c === 'open .'}
]}));

/* 第四十章：问题卡生成器 */
dev('#qcardFig', () => {
  const F0 = [['want', '我想做什么'], ['did', '我做了哪几步（命令、按钮照抄）'], ['expect', '我以为会怎样'], ['saw', '实际怎样了（屏幕上的字照抄）'], ['tried', '我已经试过'], ['env', '电脑和版本']];
  const EX = {want: '用 /fill 在家下面挖一个 50×50 的大地下室', did: '站在家门口，按 / 打了 /fill ~ ~-1 ~ ~50 ~-20 ~50 air', expect: '脚下出现一个大坑', saw: '聊天框里出现红字，里面有 too many blocks', tried: '把 50 改成 20 就成功了', env: 'M1 MacBook Air（8 GB），Java 版 1.21.x'};
  const form = $('#qcForm');
  form.innerHTML = F0.map(f => '<label class="lab">' + f[1] + '<textarea rows="2" data-k="' + f[0] + '" autocomplete="off"></textarea></label>').join('');
  const out = $('#qcOut'), say = $('#qcSay');
  const val = k => $('textarea[data-k=' + k + ']', form).value.trim();
  function draw(){
    const miss = F0.filter(f => !val(f[0]));
    out.textContent = '你好，我遇到一个问题，请先解释原因，再告诉我怎样做。\n' + F0.map(f => '· ' + f[1].replace(/（.*）/, '') + '：' + (val(f[0]) || '（还没填）')).join('\n');
    say.className = 'say ' + (miss.length ? '' : 'ok');
    say.innerHTML = miss.length ? '还空着：' + miss.map(f => f[1].replace(/（.*）/, '')).join('、') + '。空着的越少，别人越不用回头再问你。' : '六样都填好了。很多时候，写到这儿你已经自己想到答案了。';
  }
  form.addEventListener('input', draw);
  $('#qcEx').addEventListener('click', () => { F0.forEach(f => $('textarea[data-k=' + f[0] + ']', form).value = EX[f[0]]); draw(); });
  $('#qcClr').addEventListener('click', () => { $$('textarea', form).forEach(t => t.value = ''); draw(); });
  $('#qcCopy').addEventListener('click', () => {
    const t = out.textContent;
    const done = () => { say.className = 'say ok'; say.textContent = '拷贝好了，可以 ⌘V 粘贴。'; };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, () => { const r = document.createRange(); r.selectNodeContents(out); getSelection().removeAllRanges(); getSelection().addRange(r); say.textContent = '已经选中了，按 ⌘C 拷贝。'; });
    else { const r = document.createRange(); r.selectNodeContents(out); getSelection().removeAllRanges(); getSelection().addRange(r); say.textContent = '已经选中了，按 ⌘C 拷贝。'; }
  });
  draw();
});
