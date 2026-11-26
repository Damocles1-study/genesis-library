/* ================= 第七部 · 词：各章装置 ================= */
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const CATZ = {block: '方块', item: '物品', tool: '工具和装备', mob: '生物', color: '颜色', biome: '群系', dir: '方向和位置', num: '数字', time: '时间', weather: '天气和天空', verb: '动词'};

/* 封面：一共有多少词 */
dev('#wcountFig', () => {
  const cnt = {}; WORDS.forEach(w => cnt[w[2]] = (cnt[w[2]] || 0) + 1);
  bars($('#wcBars'), Object.keys(CATZ).map(k => [CATZ[k], cnt[k] || 0]), Math.max(...Object.values(cnt)), v => v + ' 个');
  const show = () => { const w = pick(WORDS); $('#wcToday').innerHTML = '今天的词：<span class="en" data-say="' + esc(w[0]) + '" style="font-size:22px">' + esc(w[0]) + '</span>　' + w[1] + (w[3] ? '<br><small>' + w[3] + '</small>' : '') + '<br><small>一共 ' + WORDS.length + ' 个词。</small>'; };
  $('#wcNext').addEventListener('click', show); show();
});

/* 听音选词：box 里有 .lq */
function listenQuiz(fig, cats){
  const box = $('.lq', fig), pool = WORDS.filter(w => cats.includes(w[2]));
  let round = 0, right = 0, cur = null, locked = false;
  box.innerHTML = '<div class="btns" style="justify-content:center"><button class="btn pri" data-a="play">听</button><button class="btn" data-a="new">重新开始</button></div><div class="ops lqops"></div><div class="say"></div>';
  const ops = $('.lqops', box), say = $('.say', box);
  function next(){
    if (round >= 10) { say.innerHTML = '这一轮答对 <b>' + right + '</b> / 10。' + (right === 10 ? '全对！' : '答错的已经放进复习台了。') + ' 点“重新开始”再来一轮。'; ops.innerHTML = ''; cur = null; if (right >= 8) { G.d.flag['lq_' + fig.id] = 1; G.save(); } return; }
    cur = pick(pool); locked = false;
    const opts = shuffle([cur].concat(shuffle(pool.filter(w => w[1] !== cur[1])).slice(0, 3)));
    ops.innerHTML = opts.map(w => '<button data-en="' + esc(w[0]) + '">' + w[1] + '</button>').join('');
    say.textContent = '第 ' + (round + 1) + ' 题：听一听，选出它的意思。';
    setTimeout(() => speak(cur[0]), 150);
  }
  box.addEventListener('click', e => {
    const a = e.target.closest('[data-a]');
    if (a) { if (a.dataset.a === 'play' && cur) speak(cur[0]); if (a.dataset.a === 'new' || (a.dataset.a === 'play' && !cur)) { round = 0; right = 0; next(); } return; }
    const b = e.target.closest('.lqops button'); if (!b || locked || !cur) return;
    locked = true; const ok = b.dataset.en === cur[0];
    b.classList.add(ok ? 'right' : 'wrong');
    if (!ok) { $$('button', ops).forEach(x => { if (x.dataset.en === cur[0]) x.classList.add('right'); }); addSRS(cur[0], true); G.save(); }
    else right++;
    say.innerHTML = (ok ? '对了！' : '不对。') + '<span class="en" data-say="' + esc(cur[0]) + '">' + esc(cur[0]) + '</span> 是“' + cur[1] + '”。' + (cur[3] ? '<small>（' + cur[3] + '）</small>' : '');
    round++; setTimeout(next, ok ? 900 : 2200);
  });
  say.textContent = '点“听”开始。';
  box.classList.add('pass');
}
dev('#lq53', f => listenQuiz(f, ['block']));
dev('#lq54', f => listenQuiz(f, ['item', 'tool']));
dev('#lq55', f => listenQuiz(f, ['mob']));
dev('#lq57', f => listenQuiz(f, ['dir', 'num', 'time', 'weather', 'verb']));

/* 第五十一章：字母的声音 */
dev('#phonFig', () => {
  const SHORT = [['cat', 'a'], ['map', 'a'], ['bat', 'a'], ['axe', 'a'], ['sand', 'a'], ['bed', 'e'], ['red', 'e'], ['egg', 'e'], ['chest', 'e'], ['web', 'e'], ['pig', 'i'], ['stick', 'i'], ['fish', 'i'], ['brick', 'i'], ['milk', 'i'], ['dog', 'o'], ['log', 'o'], ['box', 'o'], ['block', 'o'], ['pot', 'o'], ['bug', 'u'], ['sun', 'u'], ['run', 'u'], ['jump', 'u'], ['dust', 'u']];
  const MAGIC = [['cake', 1], ['stone', 1], ['bone', 1], ['slime', 1], ['lime', 1], ['cape', 1], ['pine', 1], ['note', 1], ['cube', 1], ['kite', 1], ['cap', 0], ['pin', 0], ['not', 0], ['cub', 0], ['kit', 0], ['hop', 0]];
  let mode = 0, cur = null, done = false, n = 0, ok = 0;
  const word = $('#phWord'), opsB = $('#phOps'), say = $('#phSay');
  const hl = w => w.replace(/[aeiou]/, m => '<mark>' + m + '</mark>');
  function next(){
    done = false; cur = mode ? pick(MAGIC) : pick(SHORT);
    word.innerHTML = '?'; say.textContent = '听一听' + (mode ? '：元音是短的声音，还是念字母自己的名字？' : '：中间是哪个元音？');
    opsB.innerHTML = mode ? '<button class="btn" data-v="0">短的声音</button><button class="btn" data-v="1">念字母名字</button>' : ['a', 'e', 'i', 'o', 'u'].map(v => '<button class="btn" data-v="' + v + '">' + v + '</button>').join('');
    setTimeout(() => speak(cur[0], null, .7), 150);
  }
  opsB.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || done) return; done = true; n++; const r = mode ? +b.dataset.v === cur[1] : b.dataset.v === cur[1]; if (r) ok++; b.classList.add('on');
    word.innerHTML = '<span data-say="' + cur[0] + '">' + hl(cur[0]) + '</span>';
    say.className = 'say ' + (r ? 'ok' : 'bad');
    say.innerHTML = (r ? '对了！' : '不对。') + (mode ? (cur[1] ? cur[0] + ' 最后有一个不发音的 e，所以前面的元音念它的名字。' : cur[0] + ' 最后没有 e，元音发短的声音。加上 e 会变成 ' + cur[0] + 'e。') : cur[0] + ' 里的元音是 ' + cur[1] + '。') + '　（一共答对 ' + ok + ' / ' + n + '）'; });
  $('#phPlay').addEventListener('click', () => cur && speak(cur[0], null, .7));
  $('#phNext').addEventListener('click', next);
  btnRow($('#phMode'), ['五个短元音', '魔法 e'], 0, i => { mode = i; next(); });
  say.textContent = '点“下一个”开始（会念出声，打开音量）。';
});

/* 第五十一章：遗忘曲线（示意） */
dev('#curveFig', () => {
  const M = [['只背一次', []], ['第 1、2 天各复习一次', [1, 2]], ['隔 1、2、4、8 天', [1, 3, 7, 15]], ['每天都复习', Array.from({length: 29}, (_, i) => i + 1)]];
  const svg = $('#cvSvg');
  const curve = rev => { const pts = []; let S = 1.5, last = 0; for (let t = 0; t <= 30; t += .1) { const tt = Math.round(t * 10) / 10; if (rev.some(r => Math.abs(r - tt) < .05) && tt - last > .05) { S *= 2.5; last = tt; } pts.push([tt, Math.round(100 * (.15 + .85 * Math.exp(-(tt - last) / S)))]); } return pts; };
  btnRow($('#cvMode'), M.map(m => m[0]), 2, i => {
    const once = curve([]), mine = curve(M[i][1]);
    lineChart(svg, [{color: 'var(--ink-3)', pts: once, dash: '4 4'}, {color: 'var(--main)', pts: mine, w: 3}], {xmin: 0, xmax: 30, ymin: 0, ymax: 100, xt: [0, 5, 10, 15, 20, 25, 30], yt: [0, 25, 50, 75, 100], xf: v => '第 ' + v + ' 天', yf: v => v + '%', marks: M[i][1].length < 6 ? M[i][1].map(d => [d, '复习']) : []});
    const end = mine[mine.length - 1][1];
    $('#cvSay').innerHTML = M[i][0] + '：一共复习 ' + M[i][1].length + ' 次，第 30 天还记得大约 <b>' + end + '%</b>（只背一次的是 ' + once[once.length - 1][1] + '%）。' + (i === 2 ? '复习次数不多，可是每次都在快忘的时候，效果最划算。' : i === 3 ? '天天复习当然记得最牢，可是要花的时间是“隔 1、2、4、8 天”的七倍多。' : '');
  });
  $('#cvMode').children[2].click();
});

/* 第五十二章：拼词台 */
dev('#compFig', () => {
  const L = ['red', 'sand', 'cobble', 'glow', 'book', 'snow', 'mine', 'sun', 'gun', 'fire', 'bed', 'rain', 'cross'];
  const R = ['stone', 'shelf', 'ball', 'cart', 'flower', 'powder', 'work', 'rock', 'rise', 'set', 'bow'];
  const OK = {redstone: '红石', sandstone: '砂岩', cobblestone: '圆石', glowstone: '荧石', bookshelf: '书架', snowball: '雪球', minecart: '矿车', sunflower: '向日葵', gunpowder: '火药', firework: '烟花', bedrock: '基岩', sunrise: '日出', sunset: '日落', fireball: '火球（恶魂吐的那种）', rainbow: '彩虹', crossbow: '弩'};
  let l = null, r = null; const found = new Set();
  const draw = () => { $('#cpL').innerHTML = L.map(x => '<button class="btn' + (x === l ? ' on' : '') + '" data-l="' + x + '">' + x + '</button>').join(''); $('#cpR').innerHTML = R.map(x => '<button class="btn' + (x === r ? ' on' : '') + '" data-r="' + x + '">' + x + '</button>').join(''); kv($('#cpKv'), [['找到了', found.size + ' / 16'], ['找到的词', [...found].join(' ') || '—']]); };
  const check = () => { if (!l || !r) return; const w = l + r, say = $('#cpSay'); if (OK[w]) { found.add(w); say.className = 'say ok'; say.innerHTML = '<span class="en" data-say="' + w + '" style="font-size:20px">' + w + '</span> = ' + l + ' + ' + r + '：' + OK[w]; speak(w); } else { say.className = 'say bad'; say.textContent = w + '？游戏里（和英语里）没有这个词。换一块试试。'; } l = r = null; draw(); };
  $('#cpL').addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (b) { l = b.dataset.l; draw(); check(); } });
  $('#cpR').addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) { r = b.dataset.r; draw(); check(); } });
  draw(); $('#cpSay').textContent = '左边点一块，右边点一块。';
});

/* 第五十二章：前后缀工坊 */
dev('#affFig', () => {
  const ROOTS = {break: {able: ['breakable', '能打破的'], 'un|able': ['unbreakable', '打不破的'], er: ['breaker', '打破东西的人或东西'], ing: ['breaking', '正在打破']},
    play: {er: ['player', '玩家'], ing: ['playing', '正在玩'], 're|': ['replay', '再玩一次；重播'], ful: ['playful', '爱玩的']},
    spawn: {'re|': ['respawn', '重生'], er: ['spawner', '刷怪笼（生成东西的）'], ing: ['spawning', '正在生成']},
    name: {'re|': ['rename', '改名'], less: ['nameless', '没有名字的']},
    visible: {'in|': ['invisible', '看不见的']},
    craft: {ing: ['crafting', '合成'], er: ['crafter', '合成器（1.21 加的一种方块）'], y: ['crafty', '狡猾的、手巧的']},
    peace: {ful: ['peaceful', '和平的']},
    end: {less: ['endless', '没有尽头的'], er: ['ender', '末影（ender pearl 末影珍珠）']},
    snow: {y: ['snowy', '下雪的'], ing: ['snowing', '正在下雪']},
    cook: {ed: ['cooked', '熟了的'], ing: ['cooking', '做饭']},
    power: {ed: ['powered', '充能的'], ful: ['powerful', '强大的'], less: ['powerless', '没有力量的']}};
  let root = 'break', pre = '', suf = '';
  const PRE = ['', 'un', 're', 'in'], SUF = ['', 'er', 'ing', 'ed', 'y', 'ful', 'less', 'able'];
  const draw = () => {
    const key = (pre ? pre + '|' : '') + suf, hit = ROOTS[root][key];
    const shown = (pre || '') + root + (suf ? (suf === 'able' && root === 'break' ? 'able' : suf) : '');
    $('#afWord').innerHTML = hit ? '<span data-say="' + hit[0] + '">' + hit[0] + '</span>' : (pre || suf ? '<s>' + shown + '</s>' : '<span data-say="' + root + '">' + root + '</span>');
    $('#afSay').className = 'say ' + (hit ? 'ok' : pre || suf ? 'bad' : '');
    $('#afSay').innerHTML = hit ? hit[0] + '：' + hit[1] : pre || suf ? '英语里没有（或者不常用）这个组合。试试别的。这个词根能变出：' + Object.values(ROOTS[root]).map(v => v[0]).join('、') : '选一个前缀或后缀。这个词根能变出 ' + Object.keys(ROOTS[root]).length + ' 个词。';
  };
  btnRow($('#afRoot'), Object.keys(ROOTS), 0, i => { root = Object.keys(ROOTS)[i]; draw(); });
  btnRow($('#afPre'), PRE.map(p => p ? p + '-' : '（不加前缀）'), 0, i => { pre = PRE[i]; draw(); });
  btnRow($('#afSuf'), SUF.map(p => p ? '-' + p : '（不加后缀）'), 0, i => { suf = SUF[i]; draw(); });
  draw();
});

/* 第五十四章：工具拼图 */
dev('#toolFig', () => {
  const MAT = [['wooden', '木'], ['stone', '石'], ['iron', '铁'], ['golden', '金'], ['diamond', '钻石'], ['netherite', '下界合金']];
  const TL = [['sword', '剑'], ['pickaxe', '镐'], ['axe', '斧'], ['shovel', '锹'], ['hoe', '锄']];
  const tab = $('#ttTab'), say = $('#ttSay'); let quiz = null, qn = 0, qok = 0;
  tab.innerHTML = '<tr><th></th>' + TL.map(t => '<th><span class="en" data-say="' + t[0] + '">' + t[0] + '</span><br>' + t[1] + '</th>').join('') + '</tr>' + MAT.map(m => '<tr><th><span class="en" data-say="' + m[0] + '">' + m[0] + '</span><br>' + m[1] + '</th>' + TL.map(t => '<td><button class="btn" data-id="' + m[0] + '_' + t[0] + '" data-zh="' + m[1] + t[1] + '">' + m[1] + t[1] + '</button></td>').join('') + '</tr>').join('');
  tab.addEventListener('click', e => { const b = e.target.closest('button[data-id]'); if (!b) return; speak(b.dataset.id);
    if (quiz) { qn++; const ok = b.dataset.id === quiz; if (ok) qok++; say.className = 'say ' + (ok ? 'ok' : 'bad'); say.innerHTML = (ok ? '对了！' : '不对，那是 ' + b.dataset.id + '。') + ' （' + qok + ' / ' + qn + '）'; if (ok) setTimeout(ask, 900); }
    else { say.className = 'say'; say.innerHTML = b.dataset.zh + '：<code>' + b.dataset.id + '</code>　<code>/give @s ' + b.dataset.id + '</code>'; } });
  const ask = () => { const m = pick(MAT), t = pick(TL); quiz = m[0] + '_' + t[0]; say.className = 'say'; say.innerHTML = '找出：<b>' + m[1] + t[1] + '</b>（点格子）'; };
  $('#ttQuiz').addEventListener('click', () => { qn = 0; qok = 0; ask(); });
});

/* 第五十五章：一只变一群 */
dev('#plFig', () => {
  const P = [['pig', 'pigs'], ['cow', 'cows'], ['sheep', 'sheep'], ['wolf', 'wolves'], ['fox', 'foxes'], ['enderman', 'endermen'], ['bee', 'bees'], ['cat', 'cats'], ['horse', 'horses'], ['chicken', 'chickens'], ['fish', 'fish'], ['leaf', 'leaves'], ['torch', 'torches'], ['box', 'boxes'], ['villager', 'villagers'], ['bat', 'bats'], ['witch', 'witches'], ['golem', 'golems'], ['man', 'men'], ['mouse', 'mice']];
  let cur = null, n = 0, ok = 0;
  const q = $('#plQ'), inp = $('#plIn'), say = $('#plSay');
  const next = () => { cur = pick(P); q.innerHTML = 'one <span data-say="' + cur[0] + '">' + cur[0] + '</span> → three ____'; inp.value = ''; };
  const go = () => { if (!inp.value.trim()) return; n++; const r = norm(inp.value) === cur[1]; if (r) ok++; say.className = 'say ' + (r ? 'ok' : 'bad'); say.innerHTML = (r ? '对了！' : '是 <b>' + cur[1] + '</b>。') + ' three <span class="en" data-say="three ' + cur[1] + '">' + cur[1] + '</span>　（' + ok + ' / ' + n + '）'; speak('three ' + cur[1]); setTimeout(next, r ? 900 : 2000); };
  $('#plGo').addEventListener('click', go); inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  next();
});

/* 第五十六章：染料调色盘 */
dev('#dyeFig', () => {
  const MIX = {'red+white': 'pink', 'red+yellow': 'orange', 'blue+white': 'light_blue', 'green+white': 'lime', 'black+white': 'gray', 'gray+white': 'light_gray', 'blue+green': 'cyan', 'blue+red': 'purple', 'pink+purple': 'magenta'};
  const D = ['white', 'red', 'yellow', 'blue', 'green', 'black', 'gray', 'pink', 'purple', 'brown'];
  let sel = [];
  const ZH = {}; WORDS.filter(w => w[2] === 'color').forEach(w => ZH[w[0]] = w[1]);
  const sw = c => '<span class="swatch" style="background:' + WCOL[c] + '"></span>';
  const draw = () => {
    $('#dyeBtns').innerHTML = D.map(c => '<button class="btn' + (sel.includes(c) ? ' on' : '') + '" data-c="' + c + '">' + sw(c) + ' ' + c + '</button>').join('');
    const out = $('#dyeOut'), say = $('#dyeSay');
    if (sel.length < 2) { out.innerHTML = sel.map(c => sw(c) + ' ' + c).join(' + ') + (sel.length ? ' + ?' : ''); say.className = 'say'; say.textContent = '选两种染料。'; return; }
    const k = sel.slice().sort().join('+'), r = MIX[k];
    out.innerHTML = sel.map(c => sw(c) + ' ' + c).join(' + ') + ' = ' + (r ? sw(r) + ' <b data-say="' + r + '">' + r + '</b>' : '?');
    say.className = 'say ' + (r ? 'ok' : 'bad');
    say.innerHTML = r ? ZH[sel[0]] + ' + ' + ZH[sel[1]] + ' = ' + ZH[r] + '（<code>' + r + '_dye</code>）。' + (r === 'magenta' ? '品红还能用蓝 + 红 + 粉，或者蓝 + 两个红 + 白混出来。' : '') : '游戏里这两种染料不能直接合成新的颜色。' + (sel.includes('brown') ? '棕色染料是可可豆做的，不能混出来。' : '');
    if (r) speak(r);
    sel = [];
  };
  $('#dyeBtns').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; if (sel.length >= 2) sel = []; sel.push(b.dataset.c); if (sel.length === 2) { const keep = sel.slice(); draw(); sel = []; $$('#dyeBtns button').forEach(x => x.classList.toggle('on', keep.includes(x.dataset.c))); } else draw(); });
  draw();
});

/* 第五十七章：数字听写 */
dev('#numFig', () => {
  const GAME = [64, 16, 27, 36, 54, 20, 24000, 1000, 6000, 13000, 18000, -60, -64, 319, 320, 384, 63, 512, 15, 32768, 1200, 600, 100, -50, 200, -35, 120, 4];
  let mode = 0, cur = null, n = 0, ok = 0;
  const make = () => mode === 0 ? Math.floor(Math.random() * 21) : mode === 1 ? 21 + Math.floor(Math.random() * 80) : pick(GAME);
  const sayN = v => speak(v < 0 ? 'minus ' + (-v) : String(v), null, .8);
  const next = () => { cur = make(); $('#nmIn').value = ''; $('#nmSay').className = 'say'; $('#nmSay').textContent = '点“听”，然后写下数字。负数前面写减号。'; setTimeout(() => sayN(cur), 200); };
  const go = () => { const v = parseInt(($('#nmIn').value || '').replace(/[,\s]/g, '').replace(/[−—–]/g, '-'), 10); if (isNaN(v)) return; n++; const r = v === cur; if (r) ok++; $('#nmSay').className = 'say ' + (r ? 'ok' : 'bad'); $('#nmSay').innerHTML = (r ? '对了！' : '是 <b>' + cur + '</b>。') + '（' + ok + ' / ' + n + '）'; setTimeout(next, r ? 900 : 2200); };
  $('#nmPlay').addEventListener('click', () => { if (cur === null) next(); else sayN(cur); });
  $('#nmGo').addEventListener('click', go); $('#nmIn').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  btnRow($('#nmMode'), ['0—20', '21—100', '游戏里的数'], 0, i => { mode = i; cur = null; });
});

/* 第五十八章：加一个我的词 */
dev('#myFig', () => {
  const list = $('#myList'), say = $('#mySay');
  const draw = () => { list.innerHTML = G.d.custom.map(wordCard).join('') || '<p style="color:var(--ink-3)">还没有自己加的词。</p>'; };
  list.addEventListener('click', e => { const b = e.target.closest('button[data-srs]'); if (!b) return; const en = b.closest('.wc').dataset.en, on = !inSRS(en); addSRS(en, on); G.save(); b.classList.toggle('on', on); b.textContent = on ? '✓ 在复习台' : '+ 复习'; document.dispatchEvent(new Event('srs-refresh')); });
  $('#myAdd').addEventListener('click', () => {
    const en = $('#myEn').value.trim().toLowerCase().replace(/\s+/g, '_'), zh = $('#myZh').value.trim();
    if (!/^[a-z][a-z_'\-]*$/.test(en) || !zh) { say.className = 'say bad'; say.textContent = '英文只用字母（空格会变成下划线），中文也要写。'; return; }
    if (WORDS.some(w => w[0] === en) || G.d.custom.some(w => w[0] === en)) { say.className = 'say'; say.textContent = en + ' 已经在词表里了，帮你放进复习台。'; addSRS(en, true); G.save(); document.dispatchEvent(new Event('srs-refresh')); return; }
    G.d.custom.push([en, zh, 'my', '我自己加的']); addSRS(en, true); G.save(); draw(); document.dispatchEvent(new Event('srs-refresh'));
    say.className = 'say ok'; say.innerHTML = '加好了：<span class="en" data-say="' + en + '">' + en + '</span> ' + esc(zh) + '。它已经在复习台第 0 格里。'; $('#myEn').value = ''; $('#myZh').value = '';
  });
  draw();
});
