/* ================= 一台假的 Mac：文件夹、访达、终端 =================
   给第五部用。真名（终端里看到的）和中文名（访达里看到的）都写上。hide 是平时看不见的。 */
const D = (n, c, o) => Object.assign({n, k: 'd', c: c || []}, o || {});
const F = (n, o) => Object.assign({n, k: 'f'}, o || {});
function makeFS(){
  const world = (name, extra) => D(name, [F('level.dat', {kind: '世界的设置（种子、时间、游戏规则）', bin: 1}), F('icon.png', {kind: '世界列表里的小图'}),
    D('region', [F('r.0.0.mca', {bin: 1, kind: '一大片地的方块（32×32 个区块）'}), F('r.-1.0.mca', {bin: 1, kind: '西边那一大片地'}), F('r.0.-1.mca', {bin: 1, kind: '北边那一大片地'})], {zh: '', note: '地形和方块都存在这里'}),
    D('playerdata', [F('（一串字母数字）.dat', {bin: 1, kind: '玩家的位置、背包'})]), D('datapacks', extra || [], {note: '数据包放这里'}), D('advancements', [], {note: '进度'}), D('stats', [], {note: '统计'})]);
  const pack = D('xiaoge_pack', [F('pack.mcmeta', {txt: '{\n  "pack": {\n    "description": "小格的第一个数据包",\n    "pack_format": 48\n  }\n}'}), D('data', [D('xiaoge', [D('function', [F('hello.mcfunction', {txt: 'say 你好，工坊！\ntitle @a title "欢迎来到工坊"'})])])])]);
  const mc = D('minecraft', [
    D('saves', [world('gongfang', [pack]), world('我的第一个家'), world('跳跳乐')], {note: '所有的世界（存档）'}),
    D('screenshots', [F('2026-07-12_15.05.21.png', {kind: '游戏里按 fn + F2 截的图'}), F('2026-07-20_19.41.07.png', {kind: '游戏里按 fn + F2 截的图'})], {note: '游戏里的截图'}),
    D('backups', [F('2026-07-20_19-50-12_gongfang.zip', {kind: '游戏里“制作备份”做出来的压缩包'})], {note: '游戏里“制作备份”做出来的备份'}),
    D('resourcepacks', [], {note: '资源包（换材质、换声音）'}), D('logs', [F('latest.log', {txt: '[15:02:11] [Render thread/INFO]: Setting user: xiaoge\n[15:02:19] [Render thread/INFO]: Loaded 1290 recipes\n[15:03:40] [Server thread/INFO]: Preparing level "gongfang"\n[15:03:52] [Server thread/INFO]: xiaoge joined the game\n[15:05:21] [Render thread/INFO]: [System] Saved screenshot as 2026-07-12_15.05.21.png'}), F('2026-07-11-1.log.gz', {kind: '以前的日志，压缩过'})], {note: '日志：游戏一边运行一边写的“日记”'}),
    D('crash-reports', [], {note: '游戏崩溃时写的报告'}), D('versions', [D('1.21.11', [])], {note: '下载的各个游戏版本'}),
    F('options.txt', {txt: 'version:4440\nrenderDistance:8\nsimulationDistance:6\nmaxFps:60\nguiScale:0\nlang:zh_cn\nkey_key.inventory:key.keyboard.e\nkey_key.sprint:key.keyboard.left.control\nkey_key.jump:key.keyboard.space', kind: '你在“选项”里调的设置都写在这里'})
  ], {note: 'Java 版的游戏目录'});
  return D('', [
    D('Applications', [F('Minecraft.app', {kind: '应用程序（我的世界启动器）', app: 1}), F('Safari 浏览器.app', {app: 1, kind: '应用程序'}), F('文本编辑.app', {app: 1, kind: '应用程序', real: 'TextEdit.app'}), F('系统设置.app', {app: 1, kind: '应用程序', real: 'System Settings.app'}), D('Utilities', [F('终端.app', {app: 1, kind: '应用程序', real: 'Terminal.app'}), F('活动监视器.app', {app: 1, kind: '应用程序', real: 'Activity Monitor.app'})], {zh: '实用工具'})], {zh: '应用程序'}),
    D('Library', [D('Fonts', [], {zh: '字体'})], {zh: '资源库', note: '整台电脑共用的资源库，别动'}),
    D('System', [], {zh: '系统', note: '系统自己的文件，别动'}),
    D('Users', [
      D('xiaoge', [
        D('Desktop', [F('截屏2026-07-12 15.10.33.png', {kind: '按 ⇧⌘3 截的整个屏幕'}), F('暑假计划.txt', {txt: '1. 每天一个工坊项目\n2. 每天复习台 10 分钟\n3. 玩游戏前先定好闹钟'})], {zh: '桌面'}),
        D('Documents', [D('编程课', [F('小海龟.py', {txt: 'import turtle\nt = turtle.Turtle()\nfor i in range(4):\n    t.forward(100)\n    t.left(90)'}), F('第一课.sb3', {kind: 'Scratch 作品'})]), F('我的世界笔记.txt', {txt: '下界 1 格 = 主世界 8 格\n红石信号走 15 格\n一组 = 64 个'})], {zh: '文稿'}),
        D('Downloads', [F('server.jar', {kind: '官方服务器程序（第二十九章）', bin: 1})], {zh: '下载'}),
        D('Pictures', [], {zh: '图片'}), D('Music', [], {zh: '音乐'}), D('Movies', [], {zh: '影片'}),
        D('Library', [D('Application Support', [mc]), D('Preferences', [])], {zh: '资源库', hide: 1, note: '你自己的资源库：平时访达把它藏起来'}),
        F('.zshrc', {hide: 1, kind: '终端的设置文件（点开头的文件平时看不见）'})
      ], {home: 1})
    ], {zh: '用户'})
  ], {root: 1});
}
const HOME = '/Users/xiaoge';
const showName = (node, real) => real ? node.n : (node.zh || node.n);
/* 路径 → 节点。支持 ~、.、..、绝对和相对 */
function resolvePath(root, cwd, p){
  p = (p || '').trim();
  if (p === '' ) p = '~';
  if (p === '~' || p.startsWith('~/')) p = HOME + p.slice(1);
  const parts = (p.startsWith('/') ? [] : cwd.split('/').filter(Boolean)).concat(p.split('/').filter(Boolean));
  const stack = [];
  for (const s of parts) { if (s === '.') continue; if (s === '..') { stack.pop(); continue; } stack.push(s); }
  let node = root; const chain = [root];
  for (const s of stack) {
    if (node.k !== 'd') return {err: 'notdir', at: s};
    const nx = node.c.find(x => x.n === s || x.n.toLowerCase() === s.toLowerCase());
    if (!nx) return {err: 'nofile', at: s};
    node = nx; chain.push(node);
  }
  return {node, chain, path: '/' + chain.slice(1).map(x => x.n).join('/')};
}
const tilde = p => p === HOME ? '~' : p.startsWith(HOME + '/') ? '~' + p.slice(HOME.length) : p;
const kindOf = n => n.k === 'd' ? '文件夹' : n.kind || (/\.png$/.test(n.n) ? 'PNG 图片' : /\.txt$/.test(n.n) ? '纯文本文稿' : /\.py$/.test(n.n) ? 'Python 程序' : /\.mcfunction$/.test(n.n) ? '函数（纯文本）' : /\.mcmeta$/.test(n.n) ? '数据包身份证（纯文本）' : '文件');

/* ---------- 访达 ----------
   opts: {start, real(显示真名), tasks:[{t, p, file}], hidden(一开始就显示隐藏文件), go(显示“前往文件夹”)} */
function finder(box, opts){
  opts = opts || {};
  const root = makeFS();
  let cwd = opts.start || HOME, sel = null, showHidden = !!opts.hidden, real = !!opts.real;
  const hist = [cwd]; let hi = 0;
  const done = new Set();
  box.classList.add('sim', 'fdr'); box.tabIndex = 0;
  box.innerHTML = '<div class="sh"><i></i><i></i><i></i><span class="ttl"></span></div>' +
    '<div class="ftb"><button class="btn" data-a="back" title="后退 ⌘[">‹</button><button class="btn" data-a="fwd" title="前进 ⌘]">›</button>' +
    '<button class="btn" data-a="hid" title="显示/隐藏 隐藏文件 ⇧⌘.">⇧⌘. 隐藏文件</button><button class="btn" data-a="real">' + (real ? '显示中文名' : '显示真名') + '</button>' +
    (opts.go === false ? '' : '<span class="gobox"><input type="text" placeholder="⇧⌘G 前往文件夹，比如 ~/Library" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="前往文件夹"><button class="btn" data-a="go">前往</button></span>') + '</div>' +
    '<div class="fwin"><nav class="fside"></nav><div class="fcols"></div></div><div class="fpath"></div><div class="finfo say"></div>' +
    (opts.tasks ? '<ul class="goals"></ul>' : '');
  const side = $('.fside', box), cols = $('.fcols', box), pathbar = $('.fpath', box), info = $('.finfo', box), goals = $('.goals', box);
  const FAV = [['应用程序', '/Applications'], ['桌面', HOME + '/Desktop'], ['文稿', HOME + '/Documents'], ['下载', HOME + '/Downloads'], ['xiaoge', HOME], ['Macintosh HD', '/']];
  function nav(p, push){ const r = resolvePath(root, '/', p); if (r.err || r.node.k !== 'd') { info.textContent = '找不到这个文件夹：' + p; info.className = 'finfo say bad'; return false; } cwd = r.path || '/'; sel = null; if (push !== false) { hist.splice(hi + 1); hist.push(cwd); hi = hist.length - 1; } draw(); return true; }
  function check(){ if (!opts.tasks) return; opts.tasks.forEach((t, i) => { const here = sel ? (cwd === '/' ? '' : cwd) + '/' + sel : cwd; if (here === t.p) done.add(i); }); goals.innerHTML = opts.tasks.map((t, i) => '<li' + (done.has(i) ? ' class="ok"' : '') + '>' + t.t + '</li>').join(''); }
  function draw(){
    const r = resolvePath(root, '/', cwd);
    const ttl = r.node.root ? 'Macintosh HD' : showName(r.node, real);
    $('.ttl', box).textContent = ttl;
    side.innerHTML = '<b>个人收藏</b>' + FAV.map(f => '<a data-p="' + f[1] + '"' + (cwd === f[1] ? ' class="on"' : '') + '>' + f[0] + '</a>').join('');
    let h = '';
    r.chain.forEach((node, i) => {
      const next = r.chain[i + 1];
      const items = node.c.filter(x => showHidden || !x.hide || x === next).slice().sort((a, b) => (a.n[0] === '.') - (b.n[0] === '.') || a.n.localeCompare(b.n));
      h += '<ul class="fcol">' + items.map(x => {
        const on = next ? x === next : x.n === sel;
        return '<li data-d="' + i + '" data-n="' + esc(x.n) + '" class="' + (x.k === 'd' ? 'dir' : 'file') + (on ? ' on' : '') + (x.hide ? ' hid' : '') + '"><span class="ico">' + (x.k === 'd' ? '▤' : x.app ? '◆' : '▢') + '</span>' + esc(showName(x, real)) + (x.k === 'd' ? '<span class="ar">›</span>' : '') + '</li>';
      }).join('') + (items.length ? '' : '<li class="empty">（空的）</li>') + '</ul>';
    });
    if (sel) { const f = r.node.c.find(x => x.n === sel); if (f) h += '<div class="fprev"><b>' + esc(showName(f, real)) + '</b><span>' + kindOf(f) + '</span>' + (f.txt ? '<pre>' + esc(f.txt) + '</pre>' : '') + '</div>'; }
    cols.innerHTML = h;
    cols.scrollLeft = cols.scrollWidth;
    pathbar.innerHTML = r.chain.map((n, i) => '<a data-i="' + i + '">' + (n.root ? 'Macintosh HD' : esc(showName(n, real))) + '</a>').join('<span>›</span>') + (sel ? '<span>›</span><a class="cur">' + esc(sel) + '</a>' : '');
    const full = (cwd === '/' ? '' : cwd) + (sel ? '/' + sel : '');
    info.className = 'finfo say';
    info.innerHTML = '路径：<code>' + esc(full || '/') + '</code>' + (full.startsWith(HOME) ? '　也可以写成 <code>' + esc(tilde(full)) + '</code>' : '') + (r.node.note && !sel ? '<br>' + r.node.note : '');
    $('[data-a=hid]', box).classList.toggle('on', showHidden);
    check();
  }
  box.addEventListener('click', e => {
    const a = e.target.closest('[data-a]'), li = e.target.closest('.fcol li[data-n]'), fa = e.target.closest('.fside a'), pa = e.target.closest('.fpath a[data-i]');
    if (a) { const k = a.dataset.a;
      if (k === 'back' && hi > 0) { hi--; cwd = hist[hi]; sel = null; draw(); }
      if (k === 'fwd' && hi < hist.length - 1) { hi++; cwd = hist[hi]; sel = null; draw(); }
      if (k === 'hid') { showHidden = !showHidden; draw(); }
      if (k === 'real') { real = !real; a.textContent = real ? '显示中文名' : '显示真名'; draw(); }
      if (k === 'go') { const v = $('.gobox input', box).value; if (v.trim()) nav(v); }
    }
    if (li) { const r = resolvePath(root, '/', cwd), d = +li.dataset.d, parent = r.chain[d], node = parent.c.find(x => x.n === li.dataset.n);
      const base = '/' + r.chain.slice(1, d + 1).map(x => x.n).join('/');
      if (node.k === 'd') nav((base === '/' ? '' : base) + '/' + node.n); else { if (cwd !== base) nav(base); sel = node.n; draw(); } }
    if (fa) nav(fa.dataset.p);
    if (pa) { const r = resolvePath(root, '/', cwd); nav('/' + r.chain.slice(1, +pa.dataset.i + 1).map(x => x.n).join('/')); }
  });
  const gi = $('.gobox input', box); if (gi) gi.addEventListener('keydown', e => { if (e.key === 'Enter') { e.stopPropagation(); if (gi.value.trim()) nav(gi.value); } });
  box.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.metaKey && e.shiftKey && (e.key === '.' || e.key === '>')) { e.preventDefault(); showHidden = !showHidden; draw(); }
    if (e.metaKey && e.shiftKey && (e.key === 'g' || e.key === 'G') && gi) { e.preventDefault(); gi.focus(); gi.select(); }
    if (e.metaKey && e.key === '[') { e.preventDefault(); $('[data-a=back]', box).click(); }
    if (e.metaKey && e.key === ']') { e.preventDefault(); $('[data-a=fwd]', box).click(); }
  });
  draw();
  return {nav, get cwd(){ return cwd; }};
}

/* ---------- 终端 ----------
   一个模拟的终端：只认识少数几个安全的命令。opts: {start, tasks:[{t, ok:(cmd, cwd, out)=>bool}]} */
function terminal(box, opts){
  opts = opts || {};
  const root = makeFS();
  let cwd = opts.start || HOME; const hist = []; let hp = 0; const done = new Set();
  box.classList.add('sim', 'term');
  box.innerHTML = '<div class="sh"><i></i><i></i><i></i><span>xiaoge — -zsh — 终端（模拟）</span></div><div class="tout" aria-live="polite"></div><div class="tin"><span class="pr"></span><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="在终端里输入命令"></div>' + (opts.tasks ? '<ul class="goals"></ul>' : '');
  const out = $('.tout', box), inp = $('input', box), pr = $('.pr', box), goals = $('.goals', box);
  const prompt = () => 'xiaoge@MacBook-Air ' + (tilde(cwd) === '~' ? '~' : tilde(cwd).split('/').pop() || '/') + ' %';
  const put = (h, cls) => { out.insertAdjacentHTML('beforeend', '<div' + (cls ? ' class="' + cls + '"' : '') + '>' + h + '</div>'); out.scrollTop = out.scrollHeight; };
  function words(line){ const w = []; let cur = '', q = null, any = false; for (let i = 0; i < line.length; i++) { const ch = line[i]; if (q) { if (ch === q) q = null; else cur += ch; continue; } if (ch === '"' || ch === "'") { q = ch; any = true; continue; } if (ch === '\\' && i + 1 < line.length) { cur += line[++i]; any = true; continue; } if (/\s/.test(ch)) { if (cur || any) { w.push(cur); cur = ''; any = false; } continue; } cur += ch; } if (cur || any) w.push(cur); return {w, open: !!q}; }
  function run(line){
    put('<span class="pr">' + esc(prompt()) + '</span> ' + esc(line));
    const {w, open} = words(line); if (open) { put('（引号没有配对：少了一个 " 或 \'）', 'er'); return ''; }
    if (!w.length) return '';
    const [c, ...a] = w; let o = '';
    const flags = a.filter(x => x.startsWith('-')), args = a.filter(x => !x.startsWith('-'));
    const R = p => resolvePath(root, cwd, p);
    if (/[，。：“”（）]|　/.test(line)) { put('zsh: 这一行里有中文标点或全角空格。终端只认英文标点，按 control + 空格切到英文输入法再打。', 'er'); return 'cnpunct'; }
    switch (c) {
      case 'pwd': o = cwd; put(esc(o)); break;
      case 'whoami': put('xiaoge'); break;
      case 'ls': { const r = R(args[0] || '.'); if (r.err) { put('ls: ' + esc(args[0]) + ': No such file or directory（没有这个文件或文件夹）', 'er'); break; } if (r.node.k === 'f') { put(esc(r.node.n)); break; } const all = flags.some(f => f.includes('a')); const items = r.node.c.filter(x => all || x.n[0] !== '.'); o = (all ? ['.', '..'] : []).concat(items.map(x => x.n + (x.k === 'd' && flags.some(f => f.includes('F')) ? '/' : ''))).join('  '); put(items.length || all ? '<span class="ls">' + (all ? '<b>.</b>  <b>..</b>  ' : '') + items.map(x => x.k === 'd' ? '<b>' + esc(x.n) + '</b>' : esc(x.n)).join('  ') + '</span>' : '（空的）'); break; }
      case 'cd': { const r = R(args[0] || '~'); if (r.err) { put('cd: no such file or directory: ' + esc(args[0]) + '（没有这个文件夹。名字里有空格？要写成 Application\\ Support 或者加引号）', 'er'); break; } if (r.node.k !== 'd') { put('cd: not a directory: ' + esc(args[0]) + '（这是文件，不是文件夹）', 'er'); break; } cwd = r.path || '/'; break; }
      case 'open': { const r = R(args[0] || ''); if (!args[0]) { put('open 后面要写一个文件或文件夹，比如 open .', 'er'); break; } if (r.err) { put('The file ' + esc(args[0]) + ' does not exist.（没有这个文件）', 'er'); break; } put('（' + (r.node.k === 'd' ? '访达打开了文件夹 ' : '用默认的程序打开了 ') + esc(tilde(r.path || '/')) + '）', 'ok'); break; }
      case 'cat': { const r = R(args[0] || ''); if (!args[0] || r.err) { put('cat: ' + esc(args[0] || '') + ': No such file or directory', 'er'); break; } if (r.node.k === 'd') { put('cat: ' + esc(args[0]) + ': Is a directory（这是文件夹，cat 只能看文件）', 'er'); break; } if (r.node.bin) { put('（这是给电脑读的二进制文件，打出来是一堆乱码）', 'er'); break; } put('<pre>' + esc(r.node.txt || '（这个模拟文件里没有写内容）') + '</pre>'); o = 'cat:' + r.node.n; break; }
      case 'mkdir': { if (!args[0]) { put('usage: mkdir 文件夹名', 'er'); break; } const r = R('.'); if (r.node.c.find(x => x.n === args[0])) { put('mkdir: ' + esc(args[0]) + ': File exists（已经有了）', 'er'); break; } r.node.c.push(D(args[0])); put('（建好了 ' + esc(args[0]) + '。这只是模拟，关掉网页就没了）', 'ok'); break; }
      case 'echo': put(esc(args.join(' '))); break;
      case 'clear': out.innerHTML = ''; break;
      case 'exit': put('（真终端里，这会结束这个窗口里的 shell。模拟终端就不关了）', 'ok'); break;
      case 'date': put(new Date().toString()); break;
      case 'history': put(hist.map((h, i) => (i + 1) + '  ' + esc(h)).join('<br>')); break;
      case 'help': put('这个模拟终端认识：pwd  ls  ls -a  cd  open  cat  mkdir  echo  clear  whoami  date  history。<br>小窍门：按 tab 自动补全名字，按 ↑ 找回上一条命令。'); break;
      case 'rm': case 'sudo': case 'mv': put('这个模拟终端不提供 ' + esc(c) + '。' + (c === 'rm' ? 'rm 会直接删除，不进废纸篓，删了就找不回来。' : c === 'sudo' ? 'sudo 是用管理员的权限做事，输了密码电脑什么都听。' : 'mv 会移动或改名。') + '在真终端里，没有大人在旁边别用。', 'er'); break;
      case 'python3': case 'python': put('（真电脑上会进入 Python。第二十六章和第十部讲 Python，这里先不进去）', 'ok'); break;
      case 'java': put('（真电脑上要先装 Java。第二十九章讲过怎样用它开服务器）', 'ok'); break;
      default: put('zsh: command not found: ' + esc(c) + '（没有这个命令。拼对了吗？大小写对吗？打 help 看看认识哪些）', 'er'); o = 'nf';
    }
    return o;
  }
  function check(cmd, o){ if (!opts.tasks) return; opts.tasks.forEach((t, i) => { try { if (t.ok(cmd, cwd, o)) done.add(i); } catch (e) {} }); goals.innerHTML = opts.tasks.map((t, i) => '<li' + (done.has(i) ? ' class="ok"' : '') + '>' + t.t + '</li>').join(''); }
  function complete(){
    const v = inp.value; let i = v.length; while (i > 0 && !(v[i - 1] === ' ' && v[i - 2] !== '\\')) i--; const pre = v.slice(0, i), last = v.slice(i);
    const dirPart = last.includes('/') ? last.slice(0, last.lastIndexOf('/') + 1) : '', stem = last.slice(dirPart.length).replace(/\\ /g, ' ');
    const r = resolvePath(root, cwd, dirPart.replace(/\\ /g, ' ') || '.'); if (r.err || r.node.k !== 'd') return;
    const hits = r.node.c.filter(x => x.n.toLowerCase().startsWith(stem.toLowerCase()) && (stem.startsWith('.') || x.n[0] !== '.'));
    if (hits.length === 1) { const h = hits[0]; inp.value = pre + dirPart + h.n.replace(/ /g, '\\ ') + (h.k === 'd' ? '/' : ' '); }
    else if (hits.length > 1) { put('<span class="pr">' + esc(prompt()) + '</span> ' + esc(v)); put(hits.map(x => esc(x.n)).join('  ')); let p = hits[0].n; hits.forEach(x => { while (!x.n.toLowerCase().startsWith(p.toLowerCase())) p = p.slice(0, -1); }); if (p.length > stem.length) inp.value = pre + dirPart + p.replace(/ /g, '\\ '); }
  }
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const v = inp.value; inp.value = ''; if (v.trim()) { hist.push(v); } hp = hist.length; const o = run(v); pr.textContent = prompt(); check(v.trim(), o); }
    else if (e.key === 'Tab') { e.preventDefault(); complete(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (hp > 0) { hp--; inp.value = hist[hp]; } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (hp < hist.length) { hp++; inp.value = hist[hp] || ''; } }
    else if (e.key === 'c' && e.ctrlKey) { e.preventDefault(); put('<span class="pr">' + esc(prompt()) + '</span> ' + esc(inp.value) + '^C'); inp.value = ''; }
    else if (e.key === 'u' && e.ctrlKey) { e.preventDefault(); inp.value = ''; }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
  });
  box.addEventListener('click', e => { if (!e.target.closest('.goals') && !getSelection().toString()) inp.focus({preventScroll: true}); });
  pr.textContent = prompt();
  put('Last login: 这是一台模拟的终端，打 help 看看它认识哪些命令。', 'dim');
  check('', '');
  return {run: v => { const o = run(v); pr.textContent = prompt(); check(v, o); }};
}
