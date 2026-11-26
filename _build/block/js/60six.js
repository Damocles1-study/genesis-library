/* ================= 第六部 · 令：各章装置 ================= */
const mePos = w => [Math.floor(w.me.x), Math.floor(w.me.y), Math.floor(w.me.z)];
const dou = w => w.ents.find(e => e.name === 'doudou');
const cnt = (w, id) => w.inv.reduce((a, s) => a + (s && s.id === id ? s.n : 0), 0);
const slots = (w, id) => w.inv.filter(s => s && s.id === id).length;
const addEnt = (w, type, x, z, name) => w.ents.push({kind: 'ent', type, id: w.nextId++, x: x + .5, y: -60, z: z + .5, yaw: 0, pitch: 0, name: name || null, tags: new Set(), fx: {}});

/* 封面：一条命令的样子 */
dev('#anatFig', () => {
  const C = [
    ['/give @p diamond_sword 3', [['give', '动词：给', 'v'], ['@p', '给谁：离得最近的玩家', 'w'], ['diamond_sword', '给什么：钻石剑', 'o'], ['3', '给几个', 'n']], 'Give the nearest player three diamond swords.', '给最近的玩家三把钻石剑。'],
    ['/tp @s 0 -60 0', [['tp', '动词：传送（teleport）', 'v'], ['@s', '谁：我自己', 'w'], ['0 -60 0', '去哪儿：x y z', 'p']], 'Teleport yourself to 0, minus 60, 0.', '把我自己传送到 (0, −60, 0)。'],
    ['/time set noon', [['time', '管什么：时间', 'v'], ['set', '动作：改成', 'v'], ['noon', '改成什么：正午', 'o']], 'Set the time to noon.', '把时间改成正午。'],
    ['/summon pig ~ ~ ~', [['summon', '动词：召唤', 'v'], ['pig', '什么：一头猪', 'o'], ['~ ~ ~', '在哪儿：我这儿', 'p']], 'Summon a pig right here.', '就在这儿召唤一头猪。'],
    ['/effect give @a speed 30 1', [['effect give', '动词：给效果', 'v'], ['@a', '给谁：所有玩家', 'w'], ['speed', '什么效果：速度', 'o'], ['30', '多久：30 秒', 'n'], ['1', '等级：写 1 是二级', 'n']], 'Give all players Speed Two for thirty seconds.', '给所有玩家三十秒的速度二级。'],
    ['/kill @e[type=zombie]', [['kill', '动词：消灭', 'v'], ['@e[type=zombie]', '对谁：所有实体里，种类是僵尸的', 'w']], 'Kill all zombies.', '消灭所有僵尸。']
  ];
  const box = $('#anatCmd'), say = $('#anatSay');
  const show = i => { const c = C[i]; box.innerHTML = '<span class="sl">/</span>' + c[1].map((t, k) => '<button class="tk ' + t[2] + '" data-k="' + k + '">' + esc(t[0]) + '</button>').join(''); say.innerHTML = '英文：<span class="en" data-say="' + esc(c[2]) + '">' + esc(c[2]) + '</span><br>中文：' + c[3] + '<br><small>点上面的每一段，看它是句子里的哪个部分。</small>'; box.onclick = e => { const b = e.target.closest('.tk'); if (!b) return; const t = c[1][+b.dataset.k]; say.innerHTML = '<b>' + esc(t[0]) + '</b>：' + t[1] + '<br>英文：<span class="en" data-say="' + esc(c[2]) + '">' + esc(c[2]) + '</span><br>中文：' + c[3]; }; };
  btnRow($('#anatBtns'), C.map(c => c[0].split(' ')[0]), 0, show); show(0);
});

/* 第四十一章：坐标点点乐 */
dev('#xyzFig', () => {
  const svg = $('#xyzSvg'), ask = $('#xyzAsk'), R = 10, S = 18, W = (2 * R + 1) * S;
  let mode = 0, tx = 0, tz = 0, streak = 0, right = 0, tries = 0, mark = null;
  const X = x => (x + R) * S, Z = z => (z + R) * S;
  function draw(){
    let g = '<rect width="' + W + '" height="' + W + '" fill="var(--paper)"/>';
    for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) g += '<rect x="' + X(i) + '" y="' + Z(j) + '" width="' + S + '" height="' + S + '" fill="none" stroke="var(--rule)" stroke-width=".6" data-x="' + i + '" data-z="' + j + '"/>';
    g += '<rect x="0" y="' + Z(0) + '" width="' + W + '" height="' + S + '" fill="var(--zhu)" opacity=".12"/><rect x="' + X(0) + '" y="0" width="' + S + '" height="' + W + '" fill="var(--blu)" opacity=".12"/>';
    g += '<rect x="' + X(0) + '" y="' + Z(0) + '" width="' + S + '" height="' + S + '" fill="var(--gold)" opacity=".6"/>';
    [-10, -5, 5, 10].forEach(v => { g += txt(X(v) + S / 2, Z(0) + S / 2 + 4, v, {s: 9.5, c: 'var(--zhu)'}) + txt(X(0) + S / 2, Z(v) + S / 2 + 4, v, {s: 9.5, c: 'var(--blu)'}); });
    g += txt(W - 4, Z(0) - 4, '东 +x →', {s: 11, a: 'end', c: 'var(--zhu)', w: true}) + txt(X(0) + S + 4, W - 4, '南 +z ↓', {s: 11, a: 'start', c: 'var(--blu)', w: true}) + txt(X(0) + S + 4, 12, '北', {s: 11, a: 'start', c: 'var(--blu)'}) + txt(4, Z(0) - 4, '← 西', {s: 11, a: 'start', c: 'var(--zhu)'});
    if (mode === 1) g += '<rect x="' + X(tx) + '" y="' + Z(tz) + '" width="' + S + '" height="' + S + '" fill="var(--zhu)"/>';
    if (mark) g += '<rect x="' + X(mark[0]) + '" y="' + Z(mark[1]) + '" width="' + S + '" height="' + S + '" fill="' + (mark[2] ? 'var(--main)' : 'var(--ink-3)') + '" opacity=".85"/>';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + W); svg.innerHTML = g;
  }
  function next(){ do { tx = Math.floor(Math.random() * 21) - 10; tz = Math.floor(Math.random() * 21) - 10; } while (tx === 0 && tz === 0); mark = null; $('#xyzIn').style.display = mode ? 'flex' : 'none'; ask.className = 'say'; ask.innerHTML = mode ? '红方块的坐标是多少？' : '点出这一格：<b>x = ' + tx + '，z = ' + tz + '</b>（' + (tx > 0 ? '往东 ' + tx : tx < 0 ? '往西 ' + (-tx) : '东西不动') + '，' + (tz > 0 ? '往南 ' + tz : tz < 0 ? '往北 ' + (-tz) : '南北不动') + '）'; if (mode) { $('#xyzX').value = ''; $('#xyzZ').value = ''; } draw(); kvs(); }
  function kvs(){ kv($('#xyzKv'), [['连续答对', streak + ' / 10'], ['一共答对', right + ' / ' + tries]]); }
  function judge(ok, gx, gz){ tries++; if (ok) { right++; streak++; } else streak = 0; ask.className = 'say ' + (ok ? 'ok' : 'bad'); ask.innerHTML = ok ? (streak >= 10 ? '连对十题，过关！' : '对了！') : '不对：你' + (mode ? '写' : '点') + '的是 (' + gx + ', ' + gz + ')，正确的是 (' + tx + ', ' + tz + ')。' + (Math.sign(gx) !== Math.sign(tx) && gx !== 0 ? ' 看看 x 的正负：东正西负。' : Math.sign(gz) !== Math.sign(tz) && gz !== 0 ? ' 看看 z 的正负：南正北负。' : ''); if (streak >= 10) G.d.flag.xyz = 1, G.save(); kvs(); setTimeout(next, ok ? 700 : 1800); }
  svg.addEventListener('click', e => { if (mode) return; const r = svg.getBoundingClientRect(), k = W / r.width, gx = Math.floor((e.clientX - r.left) * k / S) - R, gz = Math.floor((e.clientY - r.top) * k / S) - R; mark = [gx, gz, gx === tx && gz === tz]; draw(); judge(mark[2], gx, gz); });
  const go = () => { const gx = parseInt(($('#xyzX').value || '').replace(/[−—–]/g, '-'), 10), gz = parseInt(($('#xyzZ').value || '').replace(/[−—–]/g, '-'), 10); if (isNaN(gx) || isNaN(gz)) { ask.textContent = '两个格子都要填一个整数，负数前面写减号。'; return; } judge(gx === tx && gz === tz, gx, gz); };
  $('#xyzGo').addEventListener('click', go); [$('#xyzX'), $('#xyzZ')].forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') go(); }));
  btnRow($('#xyzMode'), ['找点：照坐标点格子', '读点：写出红方块的坐标'], 0, i => { mode = i; streak = 0; next(); });
  next();
});

/* 第四十一章：高度尺 */
dev('#yFig', () => {
  const svg = $('#ySvg'), say = $('#ySay');
  const L = [[319, '建筑上限（最高能放方块的一层）'], [192, '云（大约在这附近）'], [63, '海平面'], [0, '0：往下石头变成深板岩'], [-58, '据维基：钻石大约在这一带最多'], [-60, '超平坦世界的地面（你脚在这儿）'], [-64, '最底层：基岩']];
  const H = 520, T = 14, B = 14, Y = y => T + (319 - y) / (383) * (H - T - B);
  function draw(y){
    let g = '<rect x="60" y="' + T + '" width="70" height="' + (Y(63) - T) + '" fill="var(--sky)"/><rect x="60" y="' + Y(63) + '" width="70" height="' + (Y(0) - Y(63)) + '" fill="var(--stn)"/><rect x="60" y="' + Y(0) + '" width="70" height="' + (Y(-64) - Y(0)) + '" fill="var(--stn-2)"/><rect x="60" y="' + Y(63) + '" width="70" height="6" fill="var(--water)"/>';
    for (let v = -64; v <= 319; v += 32) { g += '<line x1="52" x2="60" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--ink-3)"/>' + txt(48, Y(v) + 4, v, {s: 10, a: 'end', c: 'var(--ink-3)', halo: false}); }
    g += '<line x1="56" x2="138" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="var(--zhu)" stroke-width="2"/>';
    L.forEach((l, i) => g += '<line x1="130" x2="150" y1="' + Y(l[0]) + '" y2="' + Y(l[0]) + '" stroke="var(--ink-2)"/>' + txt(154, Y(l[0]) + 4 + (l[0] === -60 ? 9 : l[0] === -58 ? -5 : 0), 'y = ' + l[0] + '　' + l[1], {s: 11.5, a: 'start'}));
    g += '<rect x="86" y="' + (Y(y) - 16) + '" width="16" height="16" fill="var(--main)" stroke="var(--card)" stroke-width="2"/>';
    svg.setAttribute('viewBox', '0 0 460 ' + H); svg.innerHTML = g;
    const near = L.slice().sort((a, b) => Math.abs(a[0] - y) - Math.abs(b[0] - y))[0];
    say.innerHTML = '你在 y = <b>' + y + '</b>：' + (y > 0 ? '比 0 高 ' + y + ' 格' : y < 0 ? '比 0 低 ' + (-y) + ' 格（负数）' : '正好是 0') + '；离最底层 −64 有 ' + (y - (-64)) + ' 格，离最高的 319 还有 ' + (319 - y) + ' 格。最近的地标：' + near[1] + '。';
  }
  slider('yR', v => 'y = ' + v, draw);
});

/* 第四十二章：瞬移 */
dev('#tpSim', box => mcSim(box, {views: ['map'], r: 10, start: '/tp 10 -60 -5', ex: [['去 (10, −60, −5)', '/tp 10 -60 -5'], ['往东 3', '/tp ~3 ~ ~'], ['往上 10', '/tp ~ ~10 ~'], ['转身朝北', '/tp ~ ~ ~ 180 0'], ['往前 5', '/tp ^ ^ ^5'], ['去豆子那儿', '/tp doudou'], ['看着原点', '/tp ~ ~ ~ facing 0 -60 0']], tasks: [
  {t: '传送到 (10, −60, −5)', ok: w => { const p = mePos(w); return p[0] === 10 && p[1] === -60 && p[2] === -5; }},
  {t: '用 <code>~</code> 往东挪 3 格', ok: (w, l) => /^(tp|teleport)\s+(@s\s+)?~3\s+~0?\s+~0?$/.test(l)},
  {t: '用 <code>~</code> 往上飞 10 格', ok: (w, l) => /^(tp|teleport)\s+(@s\s+)?~0?\s+~10\s+~0?$/.test(l)},
  {t: '转身，让 F3 写着 north（朝北）', ok: w => facingOf(w.me.yaw)[0] === 'north'},
  {t: '用 <code>^</code> 往脸朝的方向走 5 格', ok: (w, l) => /\^0?\s+\^0?\s+\^5$/.test(l)},
  {t: '把自己传到豆子身边', ok: w => { const d = dou(w); return Math.hypot(d.x - w.me.x, d.z - w.me.z) < .01; }},
  {t: '把豆子传到你身边（谁 → 去谁那儿）', ok: (w, l) => /^(tp|teleport)\s+doudou\s+(@s|xiaoge|~\s+~\s+~)$/i.test(l)}
]}));

/* 第四十三章：刻和钟点 */
dev('#tickFig', () => {
  slider('tickR', v => v + ' 刻', t => {
    const h = (t / 1000 + 6) % 24, hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
    const nm = t < 500 ? '日出' : t < 5500 ? '上午' : t < 6500 ? '正午（noon）' : t < 11500 ? '下午' : t < 13000 ? '傍晚、日落' : t < 17500 ? '夜里（night）' : t < 18500 ? '半夜（midnight）' : t < 23000 ? '后半夜' : '快天亮了';
    kv($('#tickKv'), [['游戏里的钟', String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0')], ['离日出过了', (t / 20) + ' 秒'], ['是一天的', Math.round(t / 240) + '%'], ['名字', nm]]);
    $('#tickSay').innerHTML = t + ' 刻 ÷ 20 = ' + (t / 20) + ' 秒 = ' + (t / 1200).toFixed(1) + ' 分钟（现实时间）。' + (t >= 13000 && t <= 23000 ? ' 这时候天黑，怪物会出来。' : '');
  });
});
dev('#skySim', box => mcSim(box, {views: ['sky'], start: '/time set noon', ex: [['正午', '/time set noon'], ['半夜', '/time set midnight'], ['拨一小时', '/time add 1000'], ['几点了', '/time query daytime'], ['雷雨', '/weather thunder'], ['晴天', '/weather clear'], ['时间停住', '/gamerule doDaylightCycle false']], tasks: [
  {t: '把时间设成正午（6000）', ok: w => w.time === 6000},
  {t: '设成半夜（midnight）', ok: w => w.time === 18000},
  {t: '用 add 往前拨 1000 刻', ok: (w, l) => /^time\s+add\s/.test(l)},
  {t: '用 query 问现在是第几刻', ok: (w, l) => /^time\s+query\s+daytime/.test(l)},
  {t: '让它打雷下雨', ok: w => w.weather === 'thunder'},
  {t: '再让天晴', ok: (w, l) => w.weather === 'clear' && /^weather/.test(l)},
  {t: '让时间停住（doDaylightCycle false）', ok: w => w.rules.doDaylightCycle === false}
]}));

/* 第四十四章：模式和规则 */
dev('#gmSim', box => {
  let wasSpec = false;
  mcSim(box, {views: ['map', 'inv'], r: 8, init: w => { addEnt(w, 'zombie', 4, 3); addEnt(w, 'creeper', -5, 2); addEnt(w, 'pig', -2, -4); }, ex: [['旁观模式', '/gamemode spectator'], ['创造模式', '/gamemode creative'], ['豆子变冒险', '/gamemode adventure doudou'], ['和平难度', '/difficulty peaceful'], ['死了不掉东西', '/gamerule keepInventory true'], ['查随机刻', '/gamerule randomTickSpeed'], ['给一颗钻石', '/give @s diamond'], ['消灭自己', '/kill @s']], tasks: [
    {t: '变成旁观模式', ok: w => { if (w.me.gm === 'spectator') wasSpec = true; return wasSpec; }},
    {t: '再变回创造模式', ok: w => wasSpec && w.me.gm === 'creative'},
    {t: '把豆子变成冒险模式', ok: w => dou(w).gm === 'adventure'},
    {t: '把难度改成和平，看怪物消失', ok: w => w.dif === 'peaceful'},
    {t: '打开 keepInventory', ok: w => w.rules.keepInventory === true},
    {t: '查一查 randomTickSpeed 现在是多少', ok: (w, l) => /^gamerule\s+(randomTickSpeed|random_tick_speed)$/.test(l)},
    {t: '给自己一颗钻石，再 <code>/kill @s</code>，看看钻石还在不在', ok: (w, l) => /^kill\s+@s$/.test(l) && cnt(w, 'diamond') > 0}
  ]});
});

/* 第四十五章：装几格 */
dev('#stackFig', () => {
  const K = [['石头（64 一组）', 64], ['鸡蛋（16 一组）', 16], ['钻石剑（1 个一格）', 1]];
  let k = 0;
  const draw = () => {
    const n = +$('#stackN').value, m = K[k][1], q = Math.floor(n / m), r = n % m, sl = Math.ceil(n / m);
    kv($('#stackKv'), [['装满的格子', q], ['余下的', r + ' 个'], ['一共要几格', sl], ['几个箱子（27 格）', Math.ceil(sl / 27)], ['几个大箱子（54 格）', Math.ceil(sl / 54)]]);
    $('#stackSay').innerHTML = n + ' ÷ ' + m + ' = ' + q + (r ? ' 余 ' + r + '，余数不是 0，要 ' + q + ' + 1 = <b>' + sl + '</b> 格。' : '，正好除尽，<b>' + sl + '</b> 格。') + (sl > 36 ? ' 你的物品栏只有 36 格，放不下了，多出来的会掉在地上。' : '');
  };
  btnRow($('#stackKind'), K.map(x => x[0]), 0, i => { k = i; draw(); });
  slider('stackN', v => v + ' 个', draw);
});
dev('#giveSim', box => mcSim(box, {views: ['inv'], start: '/give @s diamond_sword', ex: [['钻石剑', '/give @s diamond_sword'], ['200 个石头', '/give @s stone 200'], ['20 个鸡蛋', '/give @s egg 20'], ['给豆子面包', '/give doudou bread 5'], ['清掉石头', '/clear @s stone'], ['带名字空间', '/give @s minecraft:compass']], tasks: [
  {t: '给自己一把钻石剑', ok: w => cnt(w, 'diamond_sword') > 0},
  {t: '给自己 200 个石头，数一数占了几格（应该是 4 格）', ok: w => slots(w, 'stone') === 4},
  {t: '给自己 20 个鸡蛋，看看为什么占 2 格', ok: w => cnt(w, 'egg') >= 20},
  {t: '给豆子 5 个面包', ok: (w, l) => /^give\s+doudou\s+(minecraft:)?bread\s+5$/.test(l)},
  {t: '清掉所有石头', ok: (w, l) => /^clear/.test(l) && cnt(w, 'stone') === 0},
  {t: '用 <code>minecraft:</code> 开头的写法给自己一个指南针', ok: (w, l) => /minecraft:compass/.test(l)}
]}));

/* 第四十六章：召唤 */
dev('#sumSim', box => mcSim(box, {views: ['map', 'inv'], r: 8, ex: [['一头猪', '/summon pig'], ['东边 3 格的牛', '/summon cow ~3 ~ ~'], ['猫“小花”', '/summon cat ~ ~ ~2 {CustomName:"小花"}'], ['速度二级', '/effect give @s speed 60 1'], ['一直夜视', '/effect give @s night_vision infinite'], ['去掉效果', '/effect clear @s'], ['只消灭猪', '/kill @e[type=pig]']], tasks: [
  {t: '召唤一头猪', ok: w => w.ents.some(e => e.type === 'pig')},
  {t: '在你东边 3 格召唤一头牛', ok: w => w.ents.some(e => e.type === 'cow' && Math.abs(e.x - w.me.x - 3) < .01)},
  {t: '召唤一只叫“小花”的猫', ok: w => w.ents.some(e => e.type === 'cat' && e.name === '小花')},
  {t: '给自己速度二级，60 秒（等级写几？）', ok: w => w.me.fx.speed && w.me.fx.speed.amp === 1 && w.me.fx.speed.sec === 60},
  {t: '给自己一直有效的夜视', ok: w => w.me.fx.night_vision && w.me.fx.night_vision.sec === Infinity},
  {t: '把身上的效果都去掉', ok: (w, l) => /^effect\s+clear/.test(l) && !Object.keys(w.me.fx).length},
  {t: '只消灭所有的猪，牛和猫留着', ok: w => !w.ents.some(e => e.type === 'pig') && w.ents.some(e => e.type === 'cow' || e.type === 'cat')}
]}));

/* 第四十七章：体积计算器 */
dev('#volFig', () => {
  let a = 10, b = 10, c = 5;
  const draw = () => {
    const v = a * b * c, inner = a > 2 && b > 2 && c > 2 ? (a - 2) * (b - 2) * (c - 2) : 0, sh = v - inner;
    kv($('#volKv'), [['实心', v + ' 块'], ['里面能挖掉', inner + ' 块'], ['空心（hollow）', sh + ' 块'], ['一次能填完吗', v <= 32768 ? '能' : '不能，超过 32768']]);
    $('#volSay').innerHTML = '实心：' + a + ' × ' + b + ' × ' + c + ' = ' + v + '。空心：' + v + ' − ' + (inner ? (a - 2) + ' × ' + (b - 2) + ' × ' + (c - 2) + ' = ' + v + ' − ' + inner : '0（太薄了，挖不出里面）') + ' = <b>' + sh + '</b>。用 /fill 时，第二个角 = 第一个角 + (长 − 1, 高 − 1, 宽 − 1)：比如从 0 -60 0 填到 ' + (a - 1) + ' ' + (-60 + c - 1) + ' ' + (b - 1) + '。';
  };
  slider('volA', v => v + ' 格', v => { a = v; draw(); });
  slider('volB', v => v + ' 格', v => { b = v; draw(); });
  slider('volC', v => v + ' 格', v => { c = v; draw(); });
});
dev('#fillSim', box => mcSim(box, {views: ['iso'], start: '/setblock 0 -60 0 gold_block', ex: [['一块金块', '/setblock 0 -60 0 gold_block'], ['石头地面', '/fill 0 -61 0 9 -61 9 stone'], ['空心玻璃房', '/fill 2 -60 2 6 -57 6 glass hollow'], ['开门', '/fill 4 -60 2 4 -59 2 air'], ['玻璃换羊毛', '/fill 0 -60 0 9 -53 9 white_wool replace glass'], ['只填空的', '/fill 0 -60 8 9 -60 9 oak_planks keep'], ['全清掉', '/fill 0 -60 0 9 -53 9 air']], tasks: [
  {t: '在 (0, −60, 0) 放一块金块', ok: w => w.blocks.get('0,-60,0') === 'gold_block'},
  {t: '把 10 × 10 的地面换成石头（y = −61 那一层）', ok: w => { let n = 0; for (let x = 0; x < 10; x++) for (let z = 0; z < 10; z++) if (w.blocks.get(x + ',-61,' + z) === 'stone') n++; return n === 100; }},
  {t: '盖一个 5 × 4 × 5 的空心玻璃房（hollow）', ok: (w, l, r) => /\bglass\s+hollow$/.test(l) && r.vol === 100},
  {t: '用 keep 只往空的地方放方块', ok: (w, l) => /\skeep$/.test(l)},
  {t: '用 replace 把玻璃换成一种颜色的羊毛', ok: (w, l) => /_wool\s+replace\s+(minecraft:)?glass$/.test(l)}
]}));

/* 第四十八章：选择器 */
dev('#selSim', box => mcSim(box, {views: ['map'], r: 9, preview: '@e[type=pig]', init: w => {
  [[2, 1], [-3, 4], [6, -2], [-7, -6], [1, 7]].forEach(p => addEnt(w, 'pig', p[0], p[1]));
  [[4, 4], [-5, -1], [7, 6]].forEach(p => addEnt(w, 'cow', p[0], p[1]));
  addEnt(w, 'sheep', -1, -3); addEnt(w, 'zombie', 8, -7); addEnt(w, 'zombie', -8, 7); addEnt(w, 'creeper', 3, -8);
}, ex: [['看看选中谁', '/say @e[type=pig]'], ['最近的猪贴标签', '/tag @e[type=pig,limit=1,sort=nearest] add near'], ['5 格内贴标签', '/tag @e[distance=..5] add close'], ['只消灭僵尸', '/kill @e[type=zombie]'], ['牛都过来', '/tp @e[type=cow] @s'], ['不是玩家的都消灭', '/kill @e[type=!player]']], tasks: [
  {t: '用 say 说出所有的猪（看看选中了几头）', ok: (w, l) => /^say\s+@e\[type=pig\]$/.test(l)},
  {t: '给离你最近的那头猪贴上标签 near', ok: w => w.ents.filter(e => e.tags.has('near')).length === 1 && w.ents.find(e => e.tags.has('near')).type === 'pig'},
  {t: '给 5 格以内的所有实体贴上标签 close', ok: (w, l) => /distance=\.\.5/.test(l) && /^tag/.test(l)},
  {t: '只消灭僵尸，苦力怕和动物留着', ok: w => !w.ents.some(e => e.type === 'zombie') && w.ents.some(e => e.type === 'creeper')},
  {t: '把所有的牛传送到你身边', ok: w => { const c = w.ents.filter(e => e.type === 'cow'); return c.length > 0 && c.every(e => Math.hypot(e.x - w.me.x, e.z - w.me.z) < .01); }},
  {t: '消灭所有不是玩家的实体', ok: w => w.ents.every(e => e.kind === 'player')}
]}));

/* 第四十九章：计分板 */
dev('#sbSim', box => mcSim(box, {views: ['score'], ex: [['建 coins', '/scoreboard objectives add coins dummy "金币"'], ['显示在右边', '/scoreboard objectives setdisplay sidebar coins'], ['设成 10', '/scoreboard players set @s coins 10'], ['加 5', '/scoreboard players add @s coins 5'], ['给豆子 3', '/scoreboard players set doudou coins 3'], ['查一查', '/scoreboard players get @s coins'], ['建常数', '/scoreboard objectives add const dummy'], ['#two = 2', '/scoreboard players set #two const 2'], ['乘以 2', '/scoreboard players operation @s coins *= #two const']], tasks: [
  {t: '新建一个 dummy 记分项 coins', ok: w => !!w.objs.coins},
  {t: '把它显示在右边栏', ok: w => w.side === 'coins'},
  {t: '把你的 coins 设成 10', ok: w => w.scores.coins && w.scores.coins.xiaoge !== undefined},
  {t: '再加 5（应该变成 15）', ok: w => w.scores.coins && w.scores.coins.xiaoge === 15},
  {t: '给豆子 3 个金币', ok: w => w.scores.coins && w.scores.coins.doudou === 3},
  {t: '建一个 const 记分项，让 #two 等于 2，再把你的金币乘以 2（应该是 30）', ok: w => w.scores.coins && w.scores.coins.xiaoge === 30},
  {t: '自己动手：用两个假玩家 #a = 17、#b = 5 和 <code>%=</code> 算出余数 2', ok: (w, l) => /%=/.test(l) && Object.values(w.scores).some(o => Object.values(o).includes(2) && /%=/.test(l))}
]}));

/* 第五十章：条件和循环 */
dev('#exSim', box => mcSim(box, {views: ['map', 'score'], r: 6, init: w => {
  ['time', 'sec', 'const', 'coins'].forEach(k => { w.objs[k] = {crit: 'dummy', disp: {time: '剩余刻', sec: '剩余秒', const: 'const', coins: '金币'}[k]}; w.scores[k] = {}; });
  w.scores.const['#20'] = 20; w.scores.coins.xiaoge = 12; w.side = 'sec';
  [[2, 1], [-3, 2], [1, -4]].forEach(p => addEnt(w, 'pig', p[0], p[1]));
}, loop: ['execute if score @p time matches 1 run title @p title "时间到"', 'execute if score @p time matches 1.. run scoreboard players remove @p time 1', 'scoreboard players operation @p sec = @p time', 'scoreboard players operation @p sec /= #20 const'],
  start: '/scoreboard players set @s time 600',
  ex: [['开始：time = 600', '/scoreboard players set @s time 600'], ['金币够 10 吗', '/execute if score @s coins matches 10.. run say 我有十个金币了'], ['每头猪脚下放金块', '/execute at @e[type=pig] run setblock ~ ~-1 ~ gold_block'], ['没僵尸就说安全', '/execute unless entity @e[type=zombie] run say 安全了'], ['每头猪说话', '/execute as @e[type=pig] run say 哼哼']],
  tasks: [
    {t: '开始倒计时：把你的 time 设成 600', ok: w => w.scores.time.xiaoge >= 580},
    {t: '点“走 1 秒”，看右边栏变成 29', ok: w => w.scores.sec.xiaoge === 29},
    {t: '一直走到“时间到”（time 变成 0）', ok: w => w.scores.time.xiaoge === 0 && w.said.includes('时间到')},
    {t: '写一句 execute if：如果你的金币 ≥ 10，就 say 一句话', ok: (w, l) => /^execute\s+if\s+score\s+@s\s+coins\s+matches\s+10\.\.\s+run\s+say/.test(l)},
    {t: '用 execute at，在每一头猪脚下放一块金块', ok: w => w.ents.filter(e => e.type === 'pig').every(e => w.blocks.get(Math.floor(e.x) + ',-61,' + Math.floor(e.z)) === 'gold_block')},
    {t: '用 unless：一只僵尸都没有，就说“安全了”', ok: (w, l) => /^execute\s+unless\s+entity/.test(l)}
  ]}));
