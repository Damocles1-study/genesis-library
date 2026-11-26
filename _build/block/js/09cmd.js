/* ================= 命令练习台：一个简化的“我的世界”命令模拟器（第六部用） =================
   写法照 Java 版 1.21 系列，只实现一部分；报错是仿照游戏的意思写的，不是游戏原文。
   mcSim(box, {views:['map','sky','inv','iso','score','fx'], init(w), tasks:[{t, ok(w, line, res)}], ex:[[按钮名, 命令]], start:'/tp ...'}) */
const ITEMS = {
  stone: ['石头', 64, 'stone'], cobblestone: ['圆石', 64, 'stone'], dirt: ['泥土', 64, 'dirt'], grass_block: ['草方块', 64, 'grass'], sand: ['沙子', 64, 'sand'], gravel: ['沙砾', 64, 'stone'],
  oak_log: ['橡木原木', 64, 'log'], oak_planks: ['橡木木板', 64, 'plank'], oak_leaves: ['橡树树叶', 64, 'leaf'], glass: ['玻璃', 64, 'glass'], water: ['水', 64, 'water'], bricks: ['砖块', 64, '#9c4a3c'], obsidian: ['黑曜石', 64, '#2a1f3d'],
  torch: ['火把', 64, '#e0a030'], crafting_table: ['工作台', 64, 'plank'], furnace: ['熔炉', 64, 'stone'], chest: ['箱子', 64, 'plank'], tnt: ['TNT', 64, '#c0392b'], command_block: ['命令方块', 64, '#b07040'],
  redstone: ['红石粉', 64, '#c0362a'], redstone_torch: ['红石火把', 64, '#c0362a'], lever: ['拉杆', 64, 'stone'], stone_button: ['石质按钮', 64, 'stone'], piston: ['活塞', 64, 'plank'], note_block: ['音符盒', 64, 'plank'],
  ladder: ['梯子', 64, 'plank'], oak_door: ['橡木门', 64, 'plank'], diamond_ore: ['钻石矿石', 64, 'dia'], redstone_ore: ['红石矿石', 64, 'rs'], gold_block: ['金块', 64, '#e8c33a'], diamond_block: ['钻石块', 64, '#59c9c0'],
  bucket: ['铁桶', 16, '#b0b0b0'], water_bucket: ['水桶', 1, '#4f7fa8'], lava_bucket: ['熔岩桶', 1, '#e06020'],
  diamond: ['钻石', 64, '#59c9c0'], iron_ingot: ['铁锭', 64, '#c8c8c8'], gold_ingot: ['金锭', 64, '#e8c33a'], coal: ['煤炭', 64, '#333'], emerald: ['绿宝石', 64, '#2fae5a'], stick: ['木棍', 64, '#8a6a3a'], string: ['线', 64, '#ddd'],
  apple: ['苹果', 64, '#d23b2b'], bread: ['面包', 64, '#c8903e'], cooked_beef: ['牛排', 64, '#7a4027'], carrot: ['胡萝卜', 64, '#f08a1c'], cake: ['蛋糕', 1, '#f2e6d0'],
  egg: ['鸡蛋', 16, '#efe0c0'], snowball: ['雪球', 16, '#f4f8fb'], ender_pearl: ['末影珍珠', 16, '#1e7a6a'], arrow: ['箭', 64, '#999'], firework_rocket: ['烟花火箭', 64, '#c04060'],
  bow: ['弓', 1, '#8a6a3a'], shield: ['盾牌', 1, '#8a6a3a'], diamond_sword: ['钻石剑', 1, '#59c9c0'], diamond_pickaxe: ['钻石镐', 1, '#59c9c0'], iron_pickaxe: ['铁镐', 1, '#c8c8c8'], wooden_pickaxe: ['木镐', 1, '#8a6a3a'],
  stone_axe: ['石斧', 1, '#8f8b83'], iron_shovel: ['铁锹', 1, '#c8c8c8'], golden_hoe: ['金锄', 1, '#e8c33a'], diamond_helmet: ['钻石头盔', 1, '#59c9c0'], diamond_chestplate: ['钻石胸甲', 1, '#59c9c0'], elytra: ['鞘翅', 1, '#8a8aa8'],
  compass: ['指南针', 64, '#c03a2a'], clock: ['时钟', 64, '#e8c33a'], spyglass: ['望远镜', 1, '#b87333'], saddle: ['鞍', 1, '#7a4a22'], name_tag: ['命名牌', 64, '#ddd'], lead: ['拴绳', 64, '#b08850'], bone: ['骨头', 64, '#eee'], book: ['书', 64, '#7a4a22'], writable_book: ['书与笔', 1, '#7a4a22']
};
const WOOLC = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'];
const WOOLZ = ['白色', '橙色', '品红色', '淡蓝色', '黄色', '黄绿色', '粉红色', '灰色', '淡灰色', '青色', '紫色', '蓝色', '棕色', '绿色', '红色', '黑色'];
WOOLC.forEach((c, i) => { ITEMS[c + '_wool'] = [WOOLZ[i] + '羊毛', 64, WCOL[c]]; ITEMS[c + '_concrete'] = [WOOLZ[i] + '混凝土', 64, WCOL[c]]; });
const ENTS = {pig: ['猪', 0], cow: ['牛', 0], sheep: ['羊', 0], chicken: ['鸡', 0], horse: ['马', 0], wolf: ['狼', 0], cat: ['猫', 0], fox: ['狐狸', 0], bee: ['蜜蜂', 0], villager: ['村民', 0], iron_golem: ['铁傀儡', 0], armor_stand: ['盔甲架', 0], zombie: ['僵尸', 1], skeleton: ['骷髅', 1], spider: ['蜘蛛', 1], creeper: ['苦力怕', 1], lightning_bolt: ['闪电束', 0], player: ['玩家', 0]};
const EFX = {speed: '速度', slowness: '缓慢', haste: '急迫', jump_boost: '跳跃提升', night_vision: '夜视', invisibility: '隐身', regeneration: '生命恢复', strength: '力量', fire_resistance: '抗火', water_breathing: '水下呼吸', levitation: '飘浮', slow_falling: '缓降', glowing: '发光', resistance: '抗性提升', saturation: '饱和'};
const GMS = {survival: '生存模式', creative: '创造模式', adventure: '冒险模式', spectator: '旁观模式'};
const DIFS = {peaceful: '和平', easy: '简单', normal: '普通', hard: '困难'};
const snake = k => k.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
const RULES = {keepInventory: [0, false, '死了以后物品栏保留'], doDaylightCycle: [0, true, '时间往前走（白天黑夜轮换）'], doWeatherCycle: [0, true, '天气自己变'], doMobSpawning: [0, true, '生物自己生成'], mobGriefing: [0, true, '生物能破坏方块（苦力怕炸坑）'], doFireTick: [0, true, '火会蔓延'], doInsomnia: [0, true, '好几天不睡觉会有幻翼来']};
const RNUM = {randomTickSpeed: [0, 3, '随机刻速度：植物长多快'], playersSleepingPercentage: [0, 100, '百分之几的玩家睡觉就能跳过黑夜']};
const blockType = id => BTMAP[id] || (ITEMS[id] && BT[ITEMS[id][2]] ? ITEMS[id][2] : null);
const fmtN = v => (Math.round(v * 1000) / 1000).toString();
const facingOf = yaw => { const y = ((yaw + 180) % 360 + 360) % 360 - 180; return y >= -45 && y < 45 ? ['south', '南', '+z'] : y >= 45 && y < 135 ? ['west', '西', '−x'] : y >= -135 && y < -45 ? ['east', '东', '+x'] : ['north', '北', '−z']; };
const DEG = Math.PI / 180;

function mcWorld(){
  const me = {kind: 'player', type: 'player', name: 'xiaoge', x: 0.5, y: -60, z: 0.5, yaw: 0, pitch: 0, gm: 'creative', tags: new Set(), fx: {}};
  const dou = {kind: 'player', type: 'player', name: 'doudou', x: 6.5, y: -60, z: -4.5, yaw: 90, pitch: 0, gm: 'survival', tags: new Set(), fx: {}};
  return {me, ents: [me, dou], time: 1000, day: 0, gametime: 1000, weather: 'clear', wdur: 0, dif: 'normal', rules: {}, nums: {}, inv: new Array(36).fill(null), sel: 0, blocks: new Map(), objs: {}, scores: {}, side: null, said: [], nextId: 1, view: null};
}
/* ---------- 读命令 ---------- */
function mcTokens(s){
  const t = []; let cur = '', dep = 0, q = null;
  for (const ch of s) {
    if (q) { cur += ch; if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === '[' || ch === '{') dep++;
    if (ch === ']' || ch === '}') dep--;
    if (ch === ' ' && dep <= 0) { if (cur) t.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur) t.push(cur);
  return t;
}
function MCErr(msg, hint){ const e = new Error(msg); e.mc = 1; e.hint = hint; return e; }
const nsid = s => String(s || '').toLowerCase().replace(/^minecraft:/, '');
function rangeOk(v, r){ r = String(r); if (!r.includes('..')) return v === +r; const [a, b] = r.split('..'); return (a === '' || v >= +a) && (b === '' || v <= +b); }
function parseRange(r, what){ if (!/^-?\d*(\.\d+)?(\.\.-?\d*(\.\d+)?)?$/.test(r) || r === '..') throw MCErr('“' + r + '”不是一个范围', what + ' 要写成 5、..5、5.. 或 1..3'); return r; }
/* 坐标：x y z 三个，可以是数、~数、^数 */
function mcPos(tok, ctx, center){
  if (tok.length < 3 || tok.slice(0, 3).some(v => v === undefined)) throw MCErr('坐标不完整', '要写三个数：x y z');
  const t = tok.slice(0, 3);
  const caret = t.map(v => v[0] === '^');
  if (caret.some(Boolean) && !caret.every(Boolean)) throw MCErr('^ 不能和别的写法混着用', '要么三个都是 ^，要么一个都不是');
  const num = (s, ax) => { if (s === '' ) return 0; if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) throw MCErr('“' + s + '”不是数', ax + ' 那一格要写一个数'); return +s; };
  if (caret[0]) {
    const l = num(t[0].slice(1), '左右'), u = num(t[1].slice(1), '上下'), f = num(t[2].slice(1), '前后');
    const Y = ctx.rot[0] * DEG, P = ctx.rot[1] * DEG;
    const F = [-Math.sin(Y) * Math.cos(P), -Math.sin(P), Math.cos(Y) * Math.cos(P)], Lv = [Math.cos(Y), 0, Math.sin(Y)];
    const U = [F[1] * Lv[2] - F[2] * Lv[1], F[2] * Lv[0] - F[0] * Lv[2], F[0] * Lv[1] - F[1] * Lv[0]];
    return [0, 1, 2].map(i => ctx.pos[i] + Lv[i] * l + U[i] * u + F[i] * f);
  }
  return t.map((s, i) => {
    const ax = 'xyz'[i];
    if (s[0] === '~') return ctx.pos[i] + num(s.slice(1), ax);
    const v = num(s, ax);
    return center && i !== 1 && !s.includes('.') ? v + .5 : v;
  });
}
/* 目标选择器 */
function mcSel(w, s, ctx){
  if (!s) throw MCErr('少了目标', '要写一个玩家名字或者 @p、@a、@s、@e、@r');
  if (s[0] !== '@') { const p = w.ents.find(e => e.kind === 'player' && e.name.toLowerCase() === s.toLowerCase()); if (!p) throw MCErr('找不到玩家“' + s + '”', '这个世界里只有 xiaoge 和 doudou'); return [p]; }
  const m = s.match(/^@([parsen])(?:\[(.*)\])?$/);
  if (!m) throw MCErr('“' + s + '”不是有效的选择器', '只有 @p @a @s @e @r @n 六种');
  const k = m[1], args = {};
  if (m[2] !== undefined) m[2].split(',').filter(x => x.trim()).forEach(a => { const kv = a.split('='); if (kv.length < 2) throw MCErr('“' + a + '”少了等号', '参数写成 名字=值'); const key = kv[0].trim(), val = kv.slice(1).join('=').trim(); (args[key] = args[key] || []).push(val); });
  const known = ['type', 'distance', 'limit', 'sort', 'tag', 'name', 'x', 'y', 'z', 'gamemode', 'scores', 'dx', 'dy', 'dz'];
  Object.keys(args).forEach(a => { if (!known.includes(a)) throw MCErr('不认识参数“' + a + '”', '常用的有 type distance limit sort tag name gamemode scores'); });
  let pool = k === 's' ? (ctx.as ? [ctx.as] : []) : (k === 'e' || k === 'n') ? w.ents.slice() : w.ents.filter(e => e.kind === 'player');
  const ox = args.x ? +args.x[0] : ctx.pos[0], oy = args.y ? +args.y[0] : ctx.pos[1], oz = args.z ? +args.z[0] : ctx.pos[2];
  const dist = e => Math.hypot(e.x - ox, e.y - oy, e.z - oz);
  (args.type || []).forEach(v => { const neg = v[0] === '!', t = nsid(neg ? v.slice(1) : v); if (!ENTS[t]) throw MCErr('未知的实体类型“' + t + '”', '比如 pig、cow、zombie、player'); pool = pool.filter(e => (e.type === t) !== neg); });
  (args.distance || []).forEach(v => { parseRange(v, 'distance'); pool = pool.filter(e => rangeOk(dist(e), v.replace(/^(\d)/, '$1'))); });
  (args.tag || []).forEach(v => { const neg = v[0] === '!', t = neg ? v.slice(1) : v; pool = pool.filter(e => (t === '' ? e.tags.size > 0 : e.tags.has(t)) !== neg); });
  (args.name || []).forEach(v => { const neg = v[0] === '!', t = (neg ? v.slice(1) : v).replace(/^"|"$/g, ''); pool = pool.filter(e => ((e.name || '') === t) !== neg); });
  (args.gamemode || []).forEach(v => { const neg = v[0] === '!', t = neg ? v.slice(1) : v; if (!GMS[t]) throw MCErr('未知的游戏模式“' + t + '”', 'survival creative adventure spectator'); pool = pool.filter(e => (e.gm === t) !== neg); });
  if (args.scores) { const inner = args.scores[0].replace(/^\{|\}$/g, ''); inner.split(',').filter(Boolean).forEach(p => { const [o, r] = p.split('='); pool = pool.filter(e => { const v = ((w.scores[o.trim()] || {})[mcHolder(e)]); return v !== undefined && rangeOk(v, r.trim()); }); }); }
  let sort = args.sort ? args.sort[0] : (k === 'p' || k === 'n') ? 'nearest' : k === 'r' ? 'random' : 'arbitrary';
  if (sort === 'nearest') pool.sort((a, b) => dist(a) - dist(b)); else if (sort === 'furthest') pool.sort((a, b) => dist(b) - dist(a)); else if (sort === 'random') pool.sort(() => Math.random() - .5);
  let lim = args.limit ? +args.limit[0] : (k === 'p' || k === 'r' || k === 'n') ? 1 : Infinity;
  if (args.limit && !(lim >= 1)) throw MCErr('limit 至少是 1', '');
  return pool.slice(0, lim);
}
const mcHolder = e => e.kind === 'player' ? e.name : (e.name || e.type + '#' + e.id);
const entName = e => e.kind === 'player' ? e.name : (e.name ? '“' + e.name + '”' : ENTS[e.type][0]);
/* 物品栏 */
function giveItem(w, id, n){
  const max = ITEMS[id][1]; let left = n;
  for (let i = 0; i < 36 && left > 0; i++) { const s = w.inv[i]; if (s && s.id === id && s.n < max) { const k = Math.min(max - s.n, left); s.n += k; left -= k; } }
  for (let i = 0; i < 36 && left > 0; i++) { if (!w.inv[i]) { const k = Math.min(max, left); w.inv[i] = {id, n: k}; left -= k; } }
  return n - left;
}
/* ---------- 执行一条命令 ---------- */
function mcRun(w, line, ctx){
  ctx = ctx || {as: w.me, pos: [w.me.x, w.me.y, w.me.z], rot: [w.me.yaw, w.me.pitch]};
  let s = line.trim(); if (s[0] === '/') s = s.slice(1);
  if (/[，。：“”（）～＠]|　/.test(s)) throw MCErr('命令里有中文标点或全角字符', '切到英文输入法再打（第三十四章）');
  const t = mcTokens(s); if (!t.length) throw MCErr('什么也没写', '');
  const c = t[0].toLowerCase(), a = t.slice(1);
  const need = (n, how) => { if (a.length < n) throw MCErr('命令不完整', how); };
  const int = (v, what) => { if (!/^-?\d+$/.test(v || '')) throw MCErr('“' + (v || '') + '”不是整数', what + ' 要写一个整数'); return +v; };
  switch (c) {
    case 'tp': case 'teleport': {
      need(1, '写法：/tp x y z，或者 /tp 目标 x y z，或者 /tp 目标 另一个目标');
      let who = [ctx.as], rest = a;
      const looksPos = v => /^[~^]?-?(\d|\.|$)/.test(v);
      if (a.length === 1 || !looksPos(a[0])) { who = mcSel(w, a[0], ctx); rest = a.slice(1); if (!rest.length && a.length === 1) { who = [ctx.as]; rest = a; } }
      if (!who.length || !who[0]) throw MCErr('没有找到实体', '选择器没有选中任何东西');
      if (rest.length === 1) { const dst = mcSel(w, rest[0], ctx); if (!dst.length) throw MCErr('目的地的目标没找到', ''); who.forEach(e => { e.x = dst[0].x; e.y = dst[0].y; e.z = dst[0].z; }); return {msg: '把 ' + who.map(entName).join('、') + ' 传送到了 ' + entName(dst[0]) + ' 身边', n: who.length}; }
      const p = mcPos(rest, ctx, true);
      let rot = null;
      if (rest[3] === 'facing') { const f = mcPos(rest.slice(4), ctx, true), dx = f[0] - p[0], dy = f[1] - p[1], dz = f[2] - p[2]; rot = [Math.atan2(-dx, dz) / DEG, -Math.atan2(dy, Math.hypot(dx, dz)) / DEG]; }
      else if (rest.length >= 5) { const r = [rest[3], rest[4]].map((v, i) => { const base = i ? ctx.rot[1] : ctx.rot[0]; if (v[0] === '~') return base + (+(v.slice(1)) || 0); if (isNaN(+v)) throw MCErr('“' + v + '”不是角度', '朝向写两个数：水平角度 和 抬头低头的角度'); return +v; }); rot = [((r[0] + 180) % 360 + 360) % 360 - 180, clamp(r[1], -90, 90)]; }
      else if (rest.length === 4) throw MCErr('朝向要写两个数', '水平角度 和 抬头低头的角度，比如 /tp 0 -60 0 90 0');
      who.forEach(e => { e.x = p[0]; e.y = p[1]; e.z = p[2]; if (rot) { e.yaw = rot[0]; e.pitch = rot[1]; } });
      return {msg: '把 ' + who.map(entName).join('、') + ' 传送到了 ' + p.map(v => fmtN(v)).join(', ') + (rot ? '，朝向 ' + fmtN(rot[0]) + '° / ' + fmtN(rot[1]) + '°' : ''), n: who.length};
    }
    case 'time': {
      need(1, '写法：/time set day、/time add 1000、/time query daytime');
      const unit = v => { const m = String(v || '').match(/^(\d+(?:\.\d+)?)([tsd]?)$/); if (!m) throw MCErr('“' + (v || '') + '”不是时间', '写一个数，后面可以加 t（刻）、s（秒）、d（天）'); return Math.round(+m[1] * ({t: 1, '': 1, s: 20, d: 24000})[m[2]]); };
      const NAMED = {day: 1000, noon: 6000, night: 13000, midnight: 18000};
      if (a[0] === 'set') { need(2, '/time set 后面写 day、noon、night、midnight 或者一个数'); const v = a[1] in NAMED ? NAMED[a[1]] : unit(a[1]); w.time = v % 24000; if (v >= 24000) w.day += Math.floor(v / 24000); return {msg: '时间设为 ' + v + (a[1] in NAMED ? '（' + a[1] + '）' : '')}; }
      if (a[0] === 'add') { need(2, '/time add 后面写一个数'); const v = unit(a[1]); const tot = w.time + v; w.day += Math.floor(tot / 24000); w.time = tot % 24000; w.gametime += v; return {msg: '时间往前拨了 ' + v + ' 刻，现在是 ' + w.time}; }
      if (a[0] === 'query') { const q = a[1]; if (q === 'daytime') return {msg: '一天里的时间是 ' + w.time, val: w.time}; if (q === 'gametime') return {msg: '世界一共走了 ' + w.gametime + ' 刻', val: w.gametime}; if (q === 'day') return {msg: '今天是第 ' + w.day + ' 天', val: w.day}; throw MCErr('query 后面写 daytime、gametime 或 day', ''); }
      throw MCErr('“' + (a[0] || '') + '”不认识', 'time 后面接 set、add 或 query');
    }
    case 'weather': {
      need(1, '写法：/weather clear、/weather rain、/weather thunder');
      const k = a[0].toLowerCase(); if (!['clear', 'rain', 'thunder'].includes(k)) throw MCErr('不认识天气“' + a[0] + '”', '只有 clear（晴）、rain（雨）、thunder（雷雨）');
      w.weather = k; w.wdur = a[1] ? +String(a[1]).replace(/[tsd]$/, '') * (/s$/.test(a[1]) ? 20 : /d$/.test(a[1]) ? 24000 : 1) : 0;
      return {msg: {clear: '天晴了', rain: '下雨了', thunder: '打雷下雨了'}[k] + (a[1] ? '，持续 ' + w.wdur + ' 刻' : '')};
    }
    case 'gamemode': {
      need(1, '写法：/gamemode creative，或者 /gamemode creative 玩家');
      const g = a[0].toLowerCase(); if (!GMS[g]) throw MCErr('不认识游戏模式“' + a[0] + '”', '只有 survival creative adventure spectator（数字 0 1 2 3 的写法 Java 版早就不能用了）');
      const who = a[1] ? mcSel(w, a[1], ctx).filter(e => e.kind === 'player') : [ctx.as];
      who.forEach(e => e.gm = g); return {msg: who.map(entName).join('、') + ' 的游戏模式改成了' + GMS[g], n: who.length};
    }
    case 'difficulty': {
      if (!a[0]) return {msg: '现在的难度是' + DIFS[w.dif] + '（' + w.dif + '）'};
      const d = a[0].toLowerCase(); if (!DIFS[d]) throw MCErr('不认识难度“' + a[0] + '”', '只有 peaceful easy normal hard');
      w.dif = d; let gone = 0; if (d === 'peaceful') { const before = w.ents.length; w.ents = w.ents.filter(e => !(ENTS[e.type] && ENTS[e.type][1])); gone = before - w.ents.length; }
      return {msg: '难度改成了' + DIFS[d] + (gone ? '，' + gone + ' 只怪物消失了' : '')};
    }
    case 'gamerule': {
      need(1, '写法：/gamerule keepInventory true');
      const key = Object.keys(RULES).concat(Object.keys(RNUM)).find(k => k === a[0] || snake(k) === nsid(a[0]));
      if (!key) throw MCErr('不认识游戏规则“' + a[0] + '”', '比如 keepInventory、doDaylightCycle、doWeatherCycle、mobGriefing（新版本的名字可能改成了 keep_inventory 这样，以维基为准）');
      if (RULES[key]) { const cur = key in w.rules ? w.rules[key] : RULES[key][1]; if (a[1] === undefined) return {msg: key + '（' + RULES[key][2] + '）现在是 ' + cur, val: cur}; if (!['true', 'false'].includes(a[1])) throw MCErr('“' + a[1] + '”不是 true 或 false', '这条规则只有两种值：true（是）和 false（否）'); w.rules[key] = a[1] === 'true'; return {msg: key + ' 设成了 ' + a[1] + '：' + RULES[key][2] + (a[1] === 'true' ? '' : '——关掉了')}; }
      const cur = key in w.nums ? w.nums[key] : RNUM[key][1]; if (a[1] === undefined) return {msg: key + ' 现在是 ' + cur, val: cur}; w.nums[key] = int(a[1], key); return {msg: key + ' 设成了 ' + a[1]};
    }
    case 'give': {
      need(2, '写法：/give 目标 物品 数量，比如 /give @s diamond 3');
      const who = mcSel(w, a[0], ctx).filter(e => e.kind === 'player'); const id = nsid(a[1].replace(/\[.*$/, ''));
      if (!ITEMS[id]) throw MCErr('未知的物品“' + a[1] + '”', ITEMS[id + 's'] ? '是不是想写 ' + id + 's？' : '物品名要写英文 ID，小写，空格换成下划线，比如 diamond_sword');
      const n = a[2] === undefined ? 1 : int(a[2], '数量'); if (n < 1) throw MCErr('数量至少是 1', '');
      if (!who.length) throw MCErr('没有找到玩家', '');
      let got = 0; who.forEach(e => { if (e === w.me) got = giveItem(w, id, n); });
      return {msg: '给了 ' + who.map(entName).join('、') + ' ' + n + ' 个' + ITEMS[id][0] + (who.includes(w.me) && got < n ? '（你的物品栏满了，' + (n - got) + ' 个掉在了地上）' : ''), n: who.length};
    }
    case 'clear': {
      const who = a[0] ? mcSel(w, a[0], ctx) : [ctx.as]; const id = a[1] ? nsid(a[1]) : null; if (id && !ITEMS[id]) throw MCErr('未知的物品“' + a[1] + '”', '');
      let max = a[2] === undefined ? Infinity : int(a[2], '数量'), n = 0;
      if (who.includes(w.me)) for (let i = 0; i < 36; i++) { const s = w.inv[i]; if (s && (!id || s.id === id) && max > 0) { const k = Math.min(s.n, max); s.n -= k; max -= k; n += k; if (!s.n) w.inv[i] = null; } }
      return {msg: n ? '从物品栏里清掉了 ' + n + ' 个东西' : '没有可以清的东西', n};
    }
    case 'effect': {
      need(2, '写法：/effect give 目标 效果 秒数 等级，或者 /effect clear 目标');
      if (a[0] === 'clear') { const who = mcSel(w, a[1], ctx); who.forEach(e => { if (a[2]) delete e.fx[nsid(a[2])]; else e.fx = {}; }); return {msg: '清掉了 ' + who.map(entName).join('、') + ' 身上的效果'}; }
      if (a[0] !== 'give') throw MCErr('effect 后面接 give 或 clear', '老版本的写法 /effect 玩家 效果 已经不能用了（基岩版还是老写法）');
      need(3, '写法：/effect give @s speed 30 1');
      const who = mcSel(w, a[1], ctx), id = nsid(a[2]); if (!EFX[id]) throw MCErr('未知的效果“' + a[2] + '”', '比如 speed、jump_boost、night_vision、levitation');
      const sec = a[3] === undefined ? 30 : a[3] === 'infinite' ? Infinity : int(a[3], '秒数'), amp = a[4] === undefined ? 0 : int(a[4], '等级（放大器）');
      if (amp < 0 || amp > 255) throw MCErr('等级在 0 到 255 之间', '');
      who.forEach(e => e.fx[id] = {amp, sec});
      return {msg: '给 ' + who.map(entName).join('、') + ' 加上了“' + EFX[id] + ' ' + (amp + 1) + ' 级”，' + (sec === Infinity ? '一直有效' : sec + ' 秒'), n: who.length};
    }
    case 'summon': {
      need(1, '写法：/summon 生物 x y z');
      const t = nsid(a[0]); if (!ENTS[t] || t === 'player') throw MCErr('未知的实体“' + a[0] + '”', '比如 pig、cow、sheep、zombie、iron_golem');
      const p = a.length >= 4 ? mcPos(a.slice(1), ctx, true) : ctx.pos.slice();
      let name = null; const nbt = a.slice(4).join(' '); const m = nbt.match(/CustomName\s*:\s*['"]?([^'"}]+)['"]?/); if (m) name = m[1].replace(/^\{?"?text"?:?"?/, '');
      if (t === 'lightning_bolt') return {msg: '一道闪电劈在了 ' + p.map(v => fmtN(v)).join(', ')};
      if (w.dif === 'peaceful' && ENTS[t][1]) return {msg: '召唤出来的' + ENTS[t][0] + '马上消失了：和平难度不允许怪物存在', warn: 1};
      const e = {kind: 'ent', type: t, id: w.nextId++, x: p[0], y: p[1], z: p[2], yaw: 0, pitch: 0, name, tags: new Set(), fx: {}};
      w.ents.push(e); return {msg: '召唤了一只' + ENTS[t][0] + (name ? '，名字叫“' + name + '”' : '') + '，在 ' + p.map(v => fmtN(v)).join(', ')};
    }
    case 'kill': {
      const who = a[0] ? mcSel(w, a[0], ctx) : [ctx.as];
      const pl = who.filter(e => e.kind === 'player'); w.ents = w.ents.filter(e => e.kind === 'player' || !who.includes(e));
      pl.forEach(e => { e.x = .5; e.y = -60; e.z = .5; if (e === w.me && !(w.rules.keepInventory)) w.inv.fill(null); });
      return {msg: '消灭了 ' + who.length + ' 个实体' + (pl.length ? '（玩家会在出生点复活' + (pl.includes(w.me) && !w.rules.keepInventory ? '，物品掉光了；想保留，打开 keepInventory' : '') + '）' : ''), n: who.length};
    }
    case 'setblock': {
      need(4, '写法：/setblock x y z 方块');
      const p = mcPos(a, ctx).map(Math.floor), id = nsid(a[3].replace(/\[.*$/, '')); if (!ITEMS[id] && id !== 'air') throw MCErr('未知的方块“' + a[3] + '”', '比如 stone、oak_planks、glass、air（空气）');
      const key = p.join(','), had = w.blocks.get(key) || (p[1] <= -61 ? 'grass_block' : 'air'), mode = a[4] || 'replace';
      if (mode === 'keep' && had !== 'air') throw MCErr('那里已经有方块了', 'keep 只往空气里放');
      if (had === id) throw MCErr('那里本来就是' + (id === 'air' ? '空气' : ITEMS[id][0]), '方块没有变化');
      w.blocks.set(key, id); return {msg: '在 ' + p.join(', ') + ' 放了' + (id === 'air' ? '空气（挖掉了）' : ITEMS[id][0])};
    }
    case 'fill': {
      need(7, '写法：/fill x1 y1 z1 x2 y2 z2 方块');
      const p1 = mcPos(a, ctx).map(Math.floor), p2 = mcPos(a.slice(3), ctx).map(Math.floor), id = nsid(a[6].replace(/\[.*$/, ''));
      if (!ITEMS[id] && id !== 'air') throw MCErr('未知的方块“' + a[6] + '”', '比如 stone、glass、white_wool、air');
      const lo = [0, 1, 2].map(i => Math.min(p1[i], p2[i])), hi = [0, 1, 2].map(i => Math.max(p1[i], p2[i])), size = [0, 1, 2].map(i => hi[i] - lo[i] + 1), vol = size[0] * size[1] * size[2];
      if (vol > 32768) throw MCErr('一次要填 ' + vol + ' 格，太多了（最多 32768 格）', '分成几块来填，或者把范围改小');
      const mode = a[7] || 'replace', filt = mode === 'replace' && a[8] ? nsid(a[8]) : null; let n = 0;
      for (let x = lo[0]; x <= hi[0]; x++) for (let y = lo[1]; y <= hi[1]; y++) for (let z = lo[2]; z <= hi[2]; z++) {
        const edge = x === lo[0] || x === hi[0] || y === lo[1] || y === hi[1] || z === lo[2] || z === hi[2], key = x + ',' + y + ',' + z, had = w.blocks.get(key) || (y <= -61 ? 'grass_block' : 'air');
        let put = id;
        if (mode === 'hollow' && !edge) put = 'air';
        if (mode === 'outline' && !edge) continue;
        if (mode === 'keep' && had !== 'air') continue;
        if (filt && had !== filt) continue;
        if (had !== put) { w.blocks.set(key, put); n++; }
      }
      if (!n) throw MCErr('没有方块被改变', '那片地方本来就是这样了');
      return {msg: '填了 ' + n + ' 格（范围 ' + size.join(' × ') + ' = ' + vol + ' 格）', n, vol};
    }
    case 'say': return {msg: '[' + (ctx.as && ctx.as.kind === 'player' ? ctx.as.name : ctx.as ? entName(ctx.as) : '服务器') + '] ' + a.map(x => x[0] === '@' ? (mcSel(w, x, ctx).map(entName).join('、') || '（没有选中任何东西）') : x).join(' '), chat: 1};
    case 'title': {
      need(3, '写法：/title @a title "大字"'); const who = mcSel(w, a[0], ctx);
      if (!['title', 'subtitle', 'actionbar'].includes(a[1])) throw MCErr('title 后面接 title、subtitle 或 actionbar', '');
      const tx = a.slice(2).join(' ').replace(/^"|"$/g, ''); w.said.push(tx); return {msg: '屏幕中间出现' + (a[1] === 'title' ? '大字' : '小字') + '：' + tx + '（' + who.map(entName).join('、') + ' 看得到）', title: tx};
    }
    case 'tag': {
      need(2, '写法：/tag 目标 add 名字'); const who = mcSel(w, a[0], ctx);
      if (a[1] === 'add') { need(3, '/tag 目标 add 标签名'); who.forEach(e => e.tags.add(a[2])); return {msg: '给 ' + who.length + ' 个实体贴上了标签“' + a[2] + '”', n: who.length}; }
      if (a[1] === 'remove') { need(3, ''); who.forEach(e => e.tags.delete(a[2])); return {msg: '撕掉了 ' + who.length + ' 个实体的标签“' + a[2] + '”'}; }
      if (a[1] === 'list') return {msg: who.map(e => entName(e) + '：' + ([...e.tags].join('、') || '没有标签')).join('；')};
      throw MCErr('tag 后面接 add、remove 或 list', '');
    }
    case 'scoreboard': return mcScore(w, a, ctx);
    case 'execute': return mcExec(w, a, ctx);
    case 'help': return {msg: '这个练习台认识：tp time weather gamemode difficulty gamerule give clear effect summon kill setblock fill say title tag scoreboard execute'};
  }
  const lev = (x, y) => { const d = Array.from({length: x.length + 1}, (_, i) => [i]); for (let j = 1; j <= y.length; j++) d[0][j] = j; for (let i = 1; i <= x.length; i++) for (let j = 1; j <= y.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1)); return d[x.length][y.length]; };
  const near = ['tp', 'teleport', 'time', 'weather', 'gamemode', 'give', 'effect', 'summon', 'kill', 'setblock', 'fill', 'scoreboard', 'execute', 'difficulty', 'gamerule', 'clear', 'tag', 'say', 'title'].map(k => [k, lev(k, c)]).sort((p, q) => p[1] - q[1]).filter(p => p[1] <= 2)[0];
  throw MCErr('未知或不完整的命令“' + c + '”', near ? '是不是想写 ' + near[0] + '？' : '打 /help 看看这个练习台认识哪些命令');
}
function mcScore(w, a, ctx){
  const hint = '写法：/scoreboard objectives add 名字 dummy，或者 /scoreboard players set 目标 名字 数';
  if (a[0] === 'objectives') {
    if (a[1] === 'add') { if (!a[2] || !a[3]) throw MCErr('命令不完整', '/scoreboard objectives add 名字 dummy'); if (w.objs[a[2]]) throw MCErr('已经有一个叫“' + a[2] + '”的记分项了', ''); if (!/^[A-Za-z0-9_.+-]+$/.test(a[2])) throw MCErr('记分项名字只能用英文字母、数字和 _ . + -', ''); w.objs[a[2]] = {crit: a[3], disp: (a.slice(4).join(' ') || a[2]).replace(/^"|"$/g, '')}; w.scores[a[2]] = {}; return {msg: '新建了记分项“' + a[2] + '”（' + a[3] + '）'}; }
    if (a[1] === 'remove') { if (!w.objs[a[2]]) throw MCErr('没有记分项“' + a[2] + '”', ''); delete w.objs[a[2]]; delete w.scores[a[2]]; if (w.side === a[2]) w.side = null; return {msg: '删掉了记分项“' + a[2] + '”'}; }
    if (a[1] === 'list') return {msg: Object.keys(w.objs).length ? '记分项：' + Object.keys(w.objs).join('、') : '还没有任何记分项'};
    if (a[1] === 'setdisplay') { if (a[2] !== 'sidebar' && a[2] !== 'list' && a[2] !== 'belowName') throw MCErr('显示位置写 sidebar（右边栏）', ''); if (a[3] && !w.objs[a[3]]) throw MCErr('没有记分项“' + a[3] + '”', ''); w.side = a[3] || null; return {msg: a[3] ? '“' + a[3] + '”显示在了右边栏' : '右边栏清空了'}; }
    throw MCErr('objectives 后面接 add、remove、list 或 setdisplay', hint);
  }
  if (a[0] === 'players') {
    const op = a[1]; if (!['set', 'add', 'remove', 'get', 'reset', 'operation', 'list'].includes(op)) throw MCErr('players 后面接 set、add、remove、get、reset、operation', hint);
    if (op === 'list') return {msg: JSON.stringify(w.scores)};
    const who = a[2] === '*' ? [] : (a[2] && a[2][0] === '#' ? [{fake: a[2]}] : mcSel(w, a[2], ctx));
    const H = e => e.fake || mcHolder(e);
    const obj = a[3]; if (!obj) throw MCErr('少了记分项的名字', hint); if (!w.objs[obj]) throw MCErr('没有记分项“' + obj + '”', '先用 /scoreboard objectives add ' + obj + ' dummy 建一个');
    const S = w.scores[obj];
    if (op === 'get') { const v = S[H(who[0])]; if (v === undefined) throw MCErr(H(who[0]) + ' 在“' + obj + '”里还没有分数', '先 set 一个'); return {msg: H(who[0]) + ' 在“' + obj + '”里是 ' + v + ' 分', val: v}; }
    if (op === 'reset') { who.forEach(e => delete S[H(e)]); return {msg: '清掉了分数'}; }
    if (op === 'operation') {
      const opr = a[4], src = a[5] && a[5][0] === '#' ? [{fake: a[5]}] : mcSel(w, a[5], ctx), sobj = a[6];
      if (!sobj || !w.objs[sobj]) throw MCErr('operation 写法：目标 记分项 运算 来源 来源记分项', '比如 /scoreboard players operation @s 分数 += #十 常数');
      const sv = w.scores[sobj][H(src[0])]; if (sv === undefined) throw MCErr(H(src[0]) + ' 在“' + sobj + '”里没有分数', '');
      who.forEach(e => { const k = H(e), v = S[k] || 0; if ((opr === '/=' || opr === '%=') && sv === 0) throw MCErr('不能除以 0', '除数是 0 的时候，游戏会保留原来的数，这里直接报错提醒你');
      const r = opr === '=' ? sv : opr === '+=' ? v + sv : opr === '-=' ? v - sv : opr === '*=' ? v * sv : opr === '/=' ? Math.floor(v / sv) : opr === '%=' ? ((v % sv) + sv) % sv : opr === '<' ? Math.min(v, sv) : opr === '>' ? Math.max(v, sv) : undefined; if (r === undefined) throw MCErr('不认识运算“' + opr + '”', '可以用 = += -= *= /= %= < >'); S[k] = r; });
      return {msg: '算好了：' + who.map(e => H(e) + ' = ' + S[H(e)]).join('，')};
    }
    const nv = a[4]; if (!/^-?\d+$/.test(nv || '')) throw MCErr('“' + (nv || '') + '”不是整数', '分数只能是整数');
    who.forEach(e => { const k = H(e), v = S[k] || 0; S[k] = op === 'set' ? +nv : op === 'add' ? v + +nv : v - +nv; });
    return {msg: who.map(e => H(e) + ' 的“' + obj + '”现在是 ' + S[H(e)]).join('，'), n: who.length};
  }
  throw MCErr('scoreboard 后面接 objectives 或 players', hint);
}
function mcExec(w, a, ctx){
  let ctxs = [ctx], i = 0;
  const hint = '写法：/execute as … at … if … run 命令';
  while (i < a.length) {
    const k = a[i];
    if (k === 'run') { const sub = a.slice(i + 1).join(' '); if (!sub) throw MCErr('run 后面要写一条命令', ''); const res = []; ctxs.forEach(cx => { res.push(mcRun(w, sub, cx)); }); return {msg: ctxs.length ? res.map(r => r.msg).filter(Boolean).slice(0, 4).join('；') + (res.length > 4 ? '……（共 ' + res.length + ' 次）' : '') : '条件不成立，什么也没做', n: ctxs.length, runs: res.length}; }
    if (k === 'as') { const out = []; ctxs.forEach(cx => mcSel(w, a[i + 1], cx).forEach(e => out.push({as: e, pos: cx.pos, rot: cx.rot}))); ctxs = out; i += 2; continue; }
    if (k === 'at') { const out = []; ctxs.forEach(cx => mcSel(w, a[i + 1], cx).forEach(e => out.push({as: cx.as, pos: [e.x, e.y, e.z], rot: [e.yaw, e.pitch]}))); ctxs = out; i += 2; continue; }
    if (k === 'positioned') { ctxs = ctxs.map(cx => ({as: cx.as, pos: mcPos(a.slice(i + 1), cx), rot: cx.rot})); i += 4; continue; }
    if (k === 'if' || k === 'unless') {
      const neg = k === 'unless', kind = a[i + 1]; let test, step;
      if (kind === 'entity') { test = cx => mcSel(w, a[i + 2], cx).length > 0; step = 3; }
      else if (kind === 'block') { test = cx => { const p = mcPos(a.slice(i + 2), cx).map(Math.floor), id = nsid(a[i + 5]); return (w.blocks.get(p.join(',')) || (p[1] <= -61 ? 'grass_block' : 'air')) === id; }; step = 6; }
      else if (kind === 'score') {
        const tgt = a[i + 2], obj = a[i + 3]; if (!w.objs[obj]) throw MCErr('没有记分项“' + obj + '”', '');
        const val = cx => { const e = tgt[0] === '#' ? {fake: tgt} : mcSel(w, tgt, cx)[0]; return e ? w.scores[obj][e.fake || mcHolder(e)] : undefined; };
        if (a[i + 4] === 'matches') { const r = parseRange(a[i + 5], 'matches'); test = cx => { const v = val(cx); return v !== undefined && rangeOk(v, r); }; step = 6; }
        else { const op = a[i + 4], t2 = a[i + 5], o2 = a[i + 6]; test = cx => { const v = val(cx), e2 = t2[0] === '#' ? {fake: t2} : mcSel(w, t2, cx)[0], v2 = e2 && w.scores[o2] ? w.scores[o2][e2.fake || mcHolder(e2)] : undefined; if (v === undefined || v2 === undefined) return false; return {'<': v < v2, '<=': v <= v2, '=': v === v2, '>=': v >= v2, '>': v > v2}[op]; }; step = 7; }
      } else throw MCErr('if 后面接 entity、block 或 score', hint);
      ctxs = ctxs.filter(cx => test(cx) !== neg); i += step;
      if (i >= a.length) return {msg: ctxs.length ? '条件成立（' + ctxs.length + ' 次）' : '条件不成立', n: ctxs.length, test: ctxs.length > 0};
      continue;
    }
    throw MCErr('execute 里不认识“' + k + '”', '这个练习台认识 as at positioned if unless run');
  }
  throw MCErr('execute 最后要有 run 命令（或者以条件结尾）', hint);
}

/* ---------- 画面 ---------- */
function mcDrawMap(w, svg, o){
  const S = 15, R = o.r || 10, me = w.me, cx = o.center ? 0 : Math.round(me.x), cz = o.center ? 0 : Math.round(me.z);
  const W = (2 * R + 1) * S, X = x => (x - (cx - R - .5)) * S, Z = z => (z - (cz - R - .5)) * S;
  let g = '<rect width="' + W + '" height="' + W + '" fill="var(--paper)"/>';
  for (let i = -R; i <= R; i++) { const gx = cx + i, gz = cz + i; g += '<line x1="' + X(gx - .5) + '" x2="' + X(gx - .5) + '" y1="0" y2="' + W + '" stroke="var(--rule)" stroke-width=".6"/><line y1="' + Z(gz - .5) + '" y2="' + Z(gz - .5) + '" x1="0" x2="' + W + '" stroke="var(--rule)" stroke-width=".6"/>'; }
  w.blocks.forEach((id, k) => { const p = k.split(',').map(Number); if (id !== 'air' && id !== 'grass_block' && p[1] >= -61 && Math.abs(p[0] - cx) <= R && Math.abs(p[2] - cz) <= R) g += '<rect x="' + X(p[0] - .5) + '" y="' + Z(p[2] - .5) + '" width="' + S + '" height="' + S + '" fill="' + (ITEMS[id] && ITEMS[id][2][0] === '#' ? ITEMS[id][2] : 'var(--stn)') + '" opacity=".55"/>'; });
  if (Math.abs(cz) <= R) g += '<line x1="0" x2="' + W + '" y1="' + Z(0) + '" y2="' + Z(0) + '" stroke="var(--zhu)" stroke-width="1.6"/>' + txt(W - 3, Z(0) - 4, 'x 轴 →东', {s: 10.5, a: 'end', c: 'var(--zhu)', w: true});
  if (Math.abs(cx) <= R) g += '<line y1="0" y2="' + W + '" x1="' + X(0) + '" x2="' + X(0) + '" stroke="var(--blu)" stroke-width="1.6"/>' + txt(X(0) + 4, W - 4, 'z 轴 ↓南', {s: 10.5, a: 'start', c: 'var(--blu)', w: true});
  [[-R, 'start'], [R, 'end']].forEach(([d, an]) => { g += txt(X(cx + d) + (an === 'start' ? -5 : 5), 11, 'x=' + (cx + d), {s: 9.5, a: an, c: 'var(--ink-3)'}) + txt(3, Z(cz + d) + 3, 'z=' + (cz + d), {s: 9.5, a: 'start', c: 'var(--ink-3)'}); });
  g += txt(W / 2, 12, '北 N（−z）', {s: 11, c: 'var(--ink-2)', w: true}) + txt(W / 2, W - 3, '南 S（+z）', {s: 11, c: 'var(--ink-2)', w: true});
  w.ents.forEach(e => {
    if (Math.abs(e.x - cx) > R + .5 || Math.abs(e.z - cz) > R + .5) return;
    const px = X(e.x) - S / 2 + S / 2, pz = Z(e.z) - S / 2 + S / 2;
    if (w.hl && w.hl.has(e)) g += '<circle cx="' + px + '" cy="' + pz + '" r="' + (S * .85) + '" fill="none" stroke="var(--zhu)" stroke-width="2.5" stroke-dasharray="4 2"/>';
    if (e.kind === 'player') {
      const Y = e.yaw * DEG, fx = -Math.sin(Y), fz = Math.cos(Y), L = S * .9;
      g += '<g><circle cx="' + px + '" cy="' + pz + '" r="' + (S * .48) + '" fill="' + (e === me ? 'var(--main)' : 'var(--ter)') + '" stroke="var(--card)" stroke-width="1.5"/><line x1="' + px + '" y1="' + pz + '" x2="' + (px + fx * L) + '" y2="' + (pz + fz * L) + '" stroke="' + (e === me ? 'var(--main)' : 'var(--ter)') + '" stroke-width="3" stroke-linecap="round"/>' + txt(px, pz - S * .7, e === me ? '你' : '豆子', {s: 10, c: 'var(--ink)', w: true}) + '</g>';
    } else g += '<rect x="' + (px - S * .38) + '" y="' + (pz - S * .38) + '" width="' + (S * .76) + '" height="' + (S * .76) + '" rx="2" fill="' + (ENTS[e.type][1] ? 'var(--zhu)' : 'var(--gold)') + '"/>' + txt(px, pz + 3.5, ENTS[e.type][0][0], {s: 9, c: '#fff', halo: false});
  });
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + W); svg.innerHTML = g;
}
function mcF3(w){
  const m = w.me, f = facingOf(m.yaw);
  return '<b>XYZ:</b> ' + fmtN(m.x) + ' / ' + fmtN(m.y) + ' / ' + fmtN(m.z) + '<br><b>Block:</b> ' + Math.floor(m.x) + ' ' + Math.floor(m.y) + ' ' + Math.floor(m.z) + '<br><b>Facing:</b> ' + f[0] + ' (Towards ' + (f[2][0] === '+' ? 'positive' : 'negative') + ' ' + f[2][1].toUpperCase() + ') (' + fmtN(Math.round(m.yaw * 10) / 10) + ' / ' + fmtN(Math.round(m.pitch * 10) / 10) + ')<br><span style="color:var(--ink-3)">脸朝' + f[1] + '（' + f[2] + ' 方向）· 模式：' + GMS[m.gm] + '</span>';
}
function mcDrawSky(w, svg){
  const W = 600, H = 150, t = w.time, hour = ((t / 1000 + 6) % 24);
  const ang = (t / 24000) * 2 * Math.PI; // 0 刻：太阳刚升起（东边地平线）
  const night = t > 12500 && t < 23500, dusk = (t > 11500 && t <= 13500) || t >= 22500 || t < 500;
  const sky = night ? '#1c2238' : dusk ? '#d99a6c' : w.weather === 'clear' ? '#8ec5e6' : '#8a96a3';
  let g = '<rect width="' + W + '" height="' + H + '" fill="' + sky + '"/>';
  if (night) for (let i = 0; i < 26; i++) g += '<rect x="' + ((i * 97) % W) + '" y="' + ((i * 41) % 90) + '" width="2" height="2" fill="#fff" opacity=".8"/>';
  const cx = W / 2, cy = H - 26, rx = W * .42, ry = H * .72;
  const sx = cx - Math.cos(ang) * rx, sy = cy - Math.sin(ang) * ry, mx = cx + Math.cos(ang) * rx, my = cy + Math.sin(ang) * ry;
  g += '<rect x="' + (sx - 13) + '" y="' + (sy - 13) + '" width="26" height="26" fill="#ffe066" stroke="#e0a020" stroke-width="2"/>';
  g += '<rect x="' + (mx - 11) + '" y="' + (my - 11) + '" width="22" height="22" fill="#e8ecf4" stroke="#9aa3b5" stroke-width="2"/>';
  if (w.weather !== 'clear') { for (let i = 0; i < 46; i++) { const x = (i * 53) % W, y = (i * 37) % (H - 30); g += '<line x1="' + x + '" y1="' + y + '" x2="' + (x - 5) + '" y2="' + (y + 14) + '" stroke="#cfe3f5" stroke-width="1.5" opacity=".75"/>'; } }
  if (w.weather === 'thunder') g += '<path d="M410 6 L392 52 L408 52 L394 96 L430 40 L413 40 L426 6Z" fill="#fff6a0" stroke="#e0c030"/>';
  g += '<rect y="' + (H - 26) + '" width="' + W + '" height="26" fill="var(--grass)"/><rect y="' + (H - 12) + '" width="' + W + '" height="12" fill="var(--dirt)"/>';
  g += txt(16, H - 34, '东 · 太阳升起', {s: 11, a: 'start', c: '#fff', hc: 'rgba(0,0,0,.35)'}) + txt(W - 16, H - 34, '西 · 太阳落下', {s: 11, a: 'end', c: '#fff', hc: 'rgba(0,0,0,.35)'});
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
  const hh = Math.floor(hour), mm = Math.floor((hour - hh) * 60);
  return '一天里的时间 <b>' + t + '</b> 刻 · 大约 ' + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + ' · 第 ' + w.day + ' 天 · 天气 <b>' + w.weather + '</b>（' + {clear: '晴', rain: '雨', thunder: '雷雨'}[w.weather] + '）';
}
function itemIcon(id){
  const it = ITEMS[id]; if (!it) return '';
  const bt = blockType(id);
  if (bt) return blockIcon(bt, 30);
  return '<svg viewBox="0 0 20 20" width="30" height="30" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="2" fill="' + it[2] + '" stroke="var(--ink-3)" stroke-width="1"/></svg>';
}
function mcDrawInv(w, box){
  const cell = (s, i) => '<div class="slot' + (i === w.sel ? ' on' : '') + '" title="' + (s ? ITEMS[s.id][0] + ' · ' + s.id + ' · ' + s.n : '空') + '"><i>' + i + '</i>' + (s ? itemIcon(s.id) + '<span class="cnt">' + (s.n > 1 ? s.n : '') + '</span><span class="nm">' + ITEMS[s.id][0] + '</span>' : '') + '</div>';
  const fx = Object.keys(w.me.fx);
  box.innerHTML = '<div class="invlab">物品栏 9—35 号格（按 E 打开的那 27 格）</div><div class="invg">' + w.inv.slice(9).map((s, i) => cell(s, i + 9)).join('') + '</div><div class="invlab">快捷栏 0—8 号格（屏幕下面那 9 格，按 1—9 选）</div><div class="invg hot">' + w.inv.slice(0, 9).map(cell).join('') + '</div>' +
    (fx.length ? '<div class="invlab">身上的效果</div><div class="fxl">' + fx.map(k => '<span>' + EFX[k] + ' ' + (w.me.fx[k].amp + 1) + ' 级 · ' + (w.me.fx[k].sec === Infinity ? '∞' : w.me.fx[k].sec + ' 秒') + '<small>' + k + '</small></span>').join('') + '</div>' : '');
}
function mcDrawIso(w, svg){
  const X = 10, Y = 8, Z = 10, s = 16, Y0 = -60;
  const ox = Z * s * .866 + 30, oy = Y * s + 24;
  const night = w.time > 12500 && w.time < 23500;
  let g = '<rect x="-20" y="-20" width="2000" height="2000" fill="' + (night ? '#1c2238' : 'var(--sky)') + '" opacity="' + (night ? 1 : .5) + '"/>';
  for (let x = 0; x < X; x++) for (let z = 0; z < Z; z++) { const id = w.blocks.get(x + ',-61,' + z) || 'grass_block'; if (id === 'air') continue; const q = isoXY(x, z, -1, s, ox, oy); g += cube(q[0], q[1], s, blockType(id) || 'stone', x * 7 + z * 3, {top: 1, left: z === Z - 1, right: x === X - 1}); }
  const L = [];
  w.blocks.forEach((id, k) => { const p = k.split(',').map(Number); if (id !== 'air' && p[0] >= 0 && p[0] < X && p[2] >= 0 && p[2] < Z && p[1] >= Y0 && p[1] < Y0 + Y) L.push([p[0], p[1] - Y0, p[2], id]); });
  L.sort((a, b) => (a[0] + a[2]) - (b[0] + b[2]) || a[1] - b[1]);
  const has = (x, y, z) => { const id = w.blocks.get(x + ',' + (y + Y0) + ',' + z); return id && id !== 'air' && id !== 'glass' && id !== 'water'; };
  L.forEach(b => { const q = isoXY(b[0], b[2], b[1], s, ox, oy), bt = blockType(b[3]);
    if (bt) g += cube(q[0], q[1], s, bt, b[0] * 7 + b[1] * 13 + b[2] * 3, {top: !has(b[0], b[1] + 1, b[2]), left: !has(b[0], b[1], b[2] + 1), right: !has(b[0] + 1, b[1], b[2])});
    else { const c = ITEMS[b[3]][2], w8 = s * .866, h = s * .5; g += '<path d="M' + q[0] + ',' + (q[1] - s) + 'L' + (q[0] + w8) + ',' + (q[1] - s + h) + 'L' + q[0] + ',' + (q[1] - s + 2 * h) + 'L' + (q[0] - w8) + ',' + (q[1] - s + h) + 'Z" fill="' + c + '"/><path d="M' + (q[0] - w8) + ',' + (q[1] - s + h) + 'L' + q[0] + ',' + (q[1] - s + 2 * h) + 'L' + q[0] + ',' + (q[1] + 2 * h) + 'L' + (q[0] - w8) + ',' + (q[1] + h) + 'Z" fill="' + c + '"/><path d="M' + (q[0] - w8) + ',' + (q[1] - s + h) + 'L' + q[0] + ',' + (q[1] - s + 2 * h) + 'L' + q[0] + ',' + (q[1] + 2 * h) + 'L' + (q[0] - w8) + ',' + (q[1] + h) + 'Z" fill="#000" opacity=".16"/><path d="M' + q[0] + ',' + (q[1] - s + 2 * h) + 'L' + (q[0] + w8) + ',' + (q[1] - s + h) + 'L' + (q[0] + w8) + ',' + (q[1] + h) + 'L' + q[0] + ',' + (q[1] + 2 * h) + 'Z" fill="' + c + '"/><path d="M' + q[0] + ',' + (q[1] - s + 2 * h) + 'L' + (q[0] + w8) + ',' + (q[1] - s + h) + 'L' + (q[0] + w8) + ',' + (q[1] + h) + 'L' + q[0] + ',' + (q[1] + 2 * h) + 'Z" fill="#000" opacity=".3"/>'; } });
  w.ents.forEach(e => { if (e.x < 0 || e.x > X || e.z < 0 || e.z > Z) return; const q = isoXY(e.x - .5, e.z - .5, e.y - Y0, s, ox, oy); g += '<circle cx="' + q[0] + '" cy="' + (q[1] - s * .2) + '" r="' + (s * .32) + '" fill="' + (e === w.me ? 'var(--main)' : e.kind === 'player' ? 'var(--ter)' : ENTS[e.type][1] ? 'var(--zhu)' : 'var(--gold)') + '" stroke="var(--card)" stroke-width="1.5"/>'; });
  const a0 = isoXY(0, 0, 0, s, ox, oy), ax = isoXY(X, 0, 0, s, ox, oy), az = isoXY(0, Z, 0, s, ox, oy);
  g += txt(a0[0], a0[1] - 6, '(0, −60, 0)', {s: 10, c: 'var(--ink-2)'}) + txt(ax[0] + 6, ax[1] + 4, 'x→9', {s: 11, a: 'start', c: 'var(--zhu)', w: true}) + txt(az[0] - 6, az[1] + 4, '9←z', {s: 11, a: 'end', c: 'var(--blu)', w: true});
  svg.setAttribute('viewBox', '0 0 ' + (ox * 2) + ' ' + (oy + (X + Z) * s * .5 + 10)); svg.innerHTML = g;
}
function mcDrawScore(w, box){
  const o = w.side; const objs = Object.keys(w.objs);
  box.innerHTML = (o ? '<div class="sbar"><b>' + esc(w.objs[o].disp) + '</b>' + Object.entries(w.scores[o]).sort((p, q) => q[1] - p[1]).map(([k, v]) => '<div><span>' + esc(k) + '</span><span>' + v + '</span></div>').join('') + '</div>' : '<div class="sbar dim">右边栏还是空的（用 setdisplay sidebar 显示一个记分项）</div>') +
    (objs.length ? '<div class="stab">' + objs.map(k => '<div><b>' + esc(k) + '</b><small>' + esc(w.objs[k].crit) + '</small>' + (Object.entries(w.scores[k]).map(([h, v]) => '<span>' + esc(h) + ' = ' + v + '</span>').join('') || '<span class="dim">（还没有人有分数）</span>') + '</div>').join('') + '</div>' : '');
}
/* 语法提示 */
const MCSYN = {tp: '/tp <x> <y> <z> 　或　 /tp <目标> <x> <y> <z> [水平角度] [抬头角度]', teleport: '/teleport <目标> <x> <y> <z>', time: '/time set <day|noon|night|midnight|数> 　/time add <数> 　/time query <daytime|gametime|day>', weather: '/weather <clear|rain|thunder> [持续时间]', gamemode: '/gamemode <survival|creative|adventure|spectator> [目标]', difficulty: '/difficulty <peaceful|easy|normal|hard>', gamerule: '/gamerule <规则名> [true|false|数]', give: '/give <目标> <物品> [数量]', clear: '/clear [目标] [物品] [最多几个]', effect: '/effect give <目标> <效果> [秒] [等级-1] 　/effect clear [目标]', summon: '/summon <实体> [x y z]', kill: '/kill [目标]', setblock: '/setblock <x> <y> <z> <方块> [replace|keep|destroy]', fill: '/fill <x1> <y1> <z1> <x2> <y2> <z2> <方块> [replace|hollow|outline|keep]', tag: '/tag <目标> <add|remove|list> <标签>', title: '/title <目标> <title|subtitle|actionbar> "字"', scoreboard: '/scoreboard objectives add <名字> dummy 　/scoreboard players <set|add|remove|get> <目标> <名字> [数]', execute: '/execute <as|at|positioned|if|unless> … run <命令>', say: '/say <话>'};
function mcSim(box, o){
  o = o || {};
  const w = mcWorld(); if (o.init) o.init(w);
  const views = o.views || ['map'], done = new Set();
  box.classList.add('mcsim');
  box.innerHTML = '<div class="mcv">' + views.map(v => v === 'map' ? '<div class="vmap"><svg role="img" aria-label="从上往下看的地图"></svg><div class="f3"></div></div>' : v === 'sky' ? '<div class="vsky"><svg role="img" aria-label="天空"></svg><div class="skysay"></div></div>' : v === 'inv' ? '<div class="vinv"></div>' : v === 'iso' ? '<div class="viso"><svg role="img" aria-label="一块十乘十的小地"></svg></div>' : v === 'score' ? '<div class="vscore"></div>' : '').join('') + '</div>' +
    '<div class="mcin"><span class="sl">/</span><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="输入命令"><button class="btn pri">执行</button></div><div class="syn"></div>' +
    (o.ex ? '<div class="btns mcex">' + o.ex.map((e, i) => '<button class="btn" data-i="' + i + '" title="' + esc(e[1]) + '">' + e[0] + '</button>').join('') + '<button class="btn" data-reset>重来</button></div>' : '<div class="btns mcex"><button class="btn" data-reset>重来</button></div>') +
    (o.preview ? '<div class="selpv"><span>选择器预览：</span><input type="text" value="' + esc(o.preview) + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="输入一个选择器"><span class="pvsay"></span></div>' : '') +
    (o.loop ? '<div class="loopbox"><div class="invlab">循环型命令方块（每一刻都把下面每一行执行一遍）</div><textarea rows="' + Math.max(2, o.loop.length) + '" spellcheck="false" autocomplete="off">' + esc(o.loop.join('\n')) + '</textarea><div class="btns"><button class="btn" data-tk="1">走 1 刻</button><button class="btn" data-tk="20">走 1 秒（20 刻）</button><button class="btn" data-tk="200">走 10 秒</button><span class="lab tkc"></span></div></div>' : '') +
    '<ul class="cmdlog"></ul>' + (o.tasks ? '<ul class="goals"></ul>' : '');
  const inp = $('.mcin input', box), log = $('.cmdlog', box), syn = $('.syn', box), goals = $('.goals', box);
  const hist = []; let hp = 0;
  let draw = function(){
    views.forEach(v => {
      if (v === 'map') { mcDrawMap(w, $('.vmap svg', box), {r: o.r || 10, center: o.center}); $('.f3', box).innerHTML = mcF3(w); }
      if (v === 'sky') $('.skysay', box).innerHTML = mcDrawSky(w, $('.vsky svg', box));
      if (v === 'inv') mcDrawInv(w, $('.vinv', box));
      if (v === 'iso') mcDrawIso(w, $('.viso svg', box));
      if (v === 'score') mcDrawScore(w, $('.vscore', box));
    });
    if (goals) goals.innerHTML = o.tasks.map((t, i) => '<li' + (done.has(i) ? ' class="ok"' : '') + '>' + t.t + '</li>').join('');
  };
  function exec(line){
    if (!line.trim()) return;
    let res, err = null;
    try { res = mcRun(w, line); } catch (e) { if (!e.mc) { console.error(e); err = {message: '这个练习台出了点毛病：' + e.message}; } else err = e; }
    log.insertAdjacentHTML('afterbegin', '<li class="' + (err ? 'bad' : res.warn ? 'warn' : 'ok') + '"><code>' + esc(line.trim()[0] === '/' ? line.trim() : '/' + line.trim()) + '</code><span>' + (err ? '✗ ' + esc(err.message) + (err.hint ? '<small>' + esc(err.hint) + '</small>' : '') : esc(res.msg)) + '</span></li>');
    while (log.children.length > 7) log.lastChild.remove();
    if (!err && o.tasks) o.tasks.forEach((t, i) => { try { if (!done.has(i) && t.ok(w, line.trim().replace(/^\//, ''), res)) done.add(i); } catch (e) {} });
    if (!err && o.after) o.after(w, res);
    draw();
  }
  const go = () => { const v = inp.value; if (v.trim()) { hist.push(v); hp = hist.length; } exec(v); inp.select(); };
  $('.mcin button', box).addEventListener('click', go);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); else if (e.key === 'ArrowUp') { e.preventDefault(); if (hp > 0) inp.value = hist[--hp]; } else if (e.key === 'ArrowDown') { e.preventDefault(); if (hp < hist.length) inp.value = hist[++hp] || ''; } });
  inp.addEventListener('input', () => { const c = inp.value.replace(/^\//, '').split(' ')[0].toLowerCase(); syn.textContent = MCSYN[c] ? '写法：' + MCSYN[c] : ''; });
  $('.mcex', box).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.hasAttribute('data-reset')) { const n = mcWorld(); Object.keys(n).forEach(k => w[k] = n[k]); if (o.init) o.init(w); log.innerHTML = ''; draw(); return; } const ex = o.ex[+b.dataset.i]; inp.value = ex[1].replace(/^\//, ''); syn.textContent = ''; exec(ex[1]); });
  if (o.preview) { const pi = $('.selpv input', box), ps = $('.selpv .pvsay', box); const pv = () => { try { const r = mcSel(w, pi.value.trim(), {as: w.me, pos: [w.me.x, w.me.y, w.me.z], rot: [w.me.yaw, w.me.pitch]}); w.hl = new Set(r); ps.textContent = '选中了 ' + r.length + ' 个：' + r.slice(0, 8).map(entName).join('、') + (r.length > 8 ? '……' : ''); ps.className = 'pvsay'; } catch (e) { w.hl = null; ps.textContent = e.mc ? '✗ ' + e.message : ''; ps.className = 'pvsay bad'; } mcDrawMap(w, $('.vmap svg', box), {r: o.r || 10, center: o.center}); }; pi.addEventListener('input', pv); o._pv = pv; }
  if (o.loop) { let ticks = 0; const ta = $('.loopbox textarea', box), tkc = $('.tkc', box); $('.loopbox', box).addEventListener('click', e => { const b = e.target.closest('[data-tk]'); if (!b) return; const lines = ta.value.split('\n').map(x => x.trim()).filter(Boolean); const errs = new Set(); for (let k = 0; k < +b.dataset.tk; k++) { lines.forEach(l => { try { mcRun(w, l); } catch (er) { errs.add(l + ' → ' + er.message); } }); w.time = (w.time + 1) % 24000; w.gametime++; ticks++; } tkc.textContent = '一共走了 ' + ticks + ' 刻（' + (ticks / 20) + ' 秒）'; if (errs.size) log.insertAdjacentHTML('afterbegin', '<li class="bad"><code>循环方块</code><span>✗ ' + esc([...errs][0]) + '</span></li>'); if (o.tasks) o.tasks.forEach((t, i) => { try { if (!done.has(i) && t.ok(w, '', {tick: ticks})) done.add(i); } catch (er) {} }); draw(); }); }
  const _d = draw; draw = function(){ _d(); if (o._pv) o._pv(); };
  if (o.start) inp.value = o.start.replace(/^\//, '');
  draw();
  return {w, exec, draw};
}
