
/* ---------- 第十五章：一行命令（简化版，写法模仿游戏里的命令） ---------- */
dev('#cmdFig', () => {
  const X = 10, Y = 8, Z = 10, s = 17;
  let w, night = false, rain = false;
  const id = (x, y, z) => (y * Z + z) * X + x;
  const NAME = {grass_block: 'grass', grass: 'grass', '草': 'grass', '草方块': 'grass', dirt: 'dirt', '泥土': 'dirt', '土': 'dirt', stone: 'stone', '石头': 'stone', '石': 'stone',
    oak_planks: 'plank', planks: 'plank', '木板': 'plank', oak_log: 'log', log: 'log', '原木': 'log', oak_leaves: 'leaf', leaves: 'leaf', '树叶': 'leaf',
    glass: 'glass', '玻璃': 'glass', sand: 'sand', '沙子': 'sand', '沙': 'sand', water: 'water', '水': 'water', redstone_ore: 'rs', '红石矿': 'rs', diamond_ore: 'dia', '钻石矿': 'dia', air: '', '空气': ''};
  const sv = $('#cmdSvg'), log = $('#cmdLog'), inp = $('#cmdIn');
  function reset(){ w = new Array(X * Y * Z).fill(''); night = false; rain = false; draw(); }
  function draw(){
    const ox = Z * s * .866 + 34, oy = Y * s + 26;
    let g = '<rect x="-20" y="-20" width="2000" height="2000" fill="' + (night ? '#1c2238' : 'var(--sky)') + '" opacity="' + (night ? 1 : .55) + '"/>';
    if (night) for (let i = 0; i < 14; i++) g += '<rect x="' + (17 + i * 41 % 330) + '" y="' + (8 + i * 23 % 60) + '" width="2" height="2" fill="#fff" opacity=".8"/>';
    const P = (x, z) => isoXY(x, z, 0, s, ox, oy);
    const c = [P(0, 0), P(X, 0), P(X, Z), P(0, Z)];
    g += '<path d="M' + c.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + 'Z" fill="var(--paper)" fill-opacity=".6" stroke="var(--ink-3)" stroke-dasharray="3 3"/>';
    for (let i = 1; i < X; i++) { const a = P(i, 0), b = P(i, Z); g += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="var(--rule)" stroke-width=".6"/>'; }
    for (let i = 1; i < Z; i++) { const a = P(0, i), b = P(X, i); g += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="var(--rule)" stroke-width=".6"/>'; }
    const ax = P(X, 0), az = P(0, Z);
    g += txt(ax[0] + 4, ax[1] + 4, 'x→9', {s: 11, a: 'start', c: 'var(--zhu)', w: true}) + txt(az[0] - 4, az[1] + 4, '9←z', {s: 11, a: 'end', c: 'var(--blu)', w: true});
    const o0 = P(0, 0); g += txt(o0[0], o0[1] - 4, '0,0', {s: 10, c: 'var(--ink-3)'});
    const L = [];
    for (let y = 0; y < Y; y++) for (let z = 0; z < Z; z++) for (let x = 0; x < X; x++) if (w[id(x, y, z)]) L.push([x, y, z]);
    L.sort((a, b) => (a[0] + a[2]) - (b[0] + b[2]) || a[1] - b[1]);
    const has = (x, y, z) => x < X && y < Y && z < Z && w[id(x, y, z)] && w[id(x, y, z)] !== 'glass' && w[id(x, y, z)] !== 'water';
    L.forEach(b => { const q = isoXY(b[0], b[2], b[1], s, ox, oy);
      g += cube(q[0], q[1], s, w[id(b[0], b[1], b[2])], b[0] * 7 + b[1] * 13 + b[2] * 3, {top: !has(b[0], b[1] + 1, b[2]), left: !has(b[0], b[1], b[2] + 1), right: !has(b[0] + 1, b[1], b[2])}); });
    if (rain) for (let i = 0; i < 40; i++) { const x = (i * 37) % 340, y = (i * 53) % 300; g += '<line x1="' + x + '" y1="' + y + '" x2="' + (x - 4) + '" y2="' + (y + 12) + '" stroke="var(--water)" stroke-width="1.4" opacity=".7"/>'; }
    sv.setAttribute('viewBox', '0 0 ' + (ox * 2) + ' ' + (oy + (X + Z) * s * .5 + 8)); sv.innerHTML = g;
    $('#cmdCount').textContent = '方块数：' + w.filter(Boolean).length;
  }
  const inRange = (x, y, z) => x >= 0 && x < X && y >= 0 && y < Y && z >= 0 && z < Z;
  function run(line){
    const raw = line.trim(); if (!raw) return;
    const t = raw.replace(/^\//, '').split(/\s+/), cmd = t[0].toLowerCase();
    let ok = true, msg = '';
    const nums = a => a.map(v => Number(v));
    const blk = n => { const k = (n || '').toLowerCase().replace(/^minecraft:/, ''); return k in NAME ? NAME[k] : null; };
    if (cmd === 'setblock') {
      const [x, y, z] = nums(t.slice(1, 4)), b = blk(t[4]);
      if (t.length < 5 || [x, y, z].some(isNaN)) { ok = false; msg = '写法是：/setblock x y z 方块名'; }
      else if (b === null) { ok = false; msg = '不认识“' + esc(t[4]) + '”这种方块。试试 stone、oak_planks、glass、air。'; }
      else if (!inRange(x, y, z)) { ok = false; msg = '这块小地只有 x 0—9、y 0—7、z 0—9。'; }
      else { w[id(x, y, z)] = b; msg = b ? '在 (' + x + ', ' + y + ', ' + z + ') 放了一块。' : '把 (' + x + ', ' + y + ', ' + z + ') 那一块变成了空气。'; }
    } else if (cmd === 'fill') {
      const v = nums(t.slice(1, 7)), b = blk(t[7]);
      if (t.length < 8 || v.some(isNaN)) { ok = false; msg = '写法是：/fill x1 y1 z1 x2 y2 z2 方块名'; }
      else if (b === null) { ok = false; msg = '不认识“' + esc(t[7]) + '”这种方块。'; }
      else if (!inRange(v[0], v[1], v[2]) || !inRange(v[3], v[4], v[5])) { ok = false; msg = '有一个角超出了这块小地：x 0—9、y 0—7、z 0—9。'; }
      else { let n = 0; for (let x = Math.min(v[0], v[3]); x <= Math.max(v[0], v[3]); x++) for (let y = Math.min(v[1], v[4]); y <= Math.max(v[1], v[4]); y++) for (let z = Math.min(v[2], v[5]); z <= Math.max(v[2], v[5]); z++) { w[id(x, y, z)] = b; n++; } msg = '一下子' + (b ? '填了 ' : '挖空了 ') + n + ' 格。'; }
    } else if (cmd === 'time') {
      const v = (t[2] || '').toLowerCase();
      if (t[1] === 'set' && (v === 'night' || v === 'midnight')) { night = true; msg = '天黑了。'; } else if (t[1] === 'set' && (v === 'day' || v === 'noon')) { night = false; msg = '天亮了。'; } else { ok = false; msg = '试试 /time set day 或 /time set night'; }
    } else if (cmd === 'weather') {
      const v = (t[1] || '').toLowerCase();
      if (v === 'rain' || v === 'thunder') { rain = true; msg = '下雨了。'; } else if (v === 'clear') { rain = false; msg = '雨停了。'; } else { ok = false; msg = '试试 /weather rain 或 /weather clear'; }
    } else if (cmd === 'say') { msg = '你说：' + esc(t.slice(1).join(' ')); }
    else { ok = false; msg = '这个小玩具只认识 setblock、fill、time、weather、say 五个命令。'; }
    log.insertAdjacentHTML('afterbegin', '<li class="' + (ok ? 'ok' : 'bad') + '"><code>' + esc(raw) + '</code><span>' + msg + '</span></li>');
    while (log.children.length > 6) log.lastChild.remove();
    draw();
  }
  const PRE = [['铺草地', ['/fill 0 0 0 9 0 9 grass_block']], ['一大块木头', ['/fill 2 1 2 7 3 6 oak_planks']], ['挖空里面', ['/fill 3 1 3 6 3 5 air']], ['开一扇门', ['/fill 4 1 6 5 2 6 air']], ['玻璃屋顶', ['/fill 2 4 2 7 4 6 glass']], ['种一棵树', ['/fill 8 1 1 8 3 1 oak_log', '/fill 7 4 0 9 5 2 oak_leaves', '/setblock 8 6 1 oak_leaves']], ['天黑', ['/time set night']], ['下雨', ['/weather rain']]];
  $('#cmdPre').innerHTML = PRE.map((p, i) => '<button class="btn" data-i="' + i + '">' + p[0] + '</button>').join('');
  $('#cmdPre').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const p = PRE[+b.dataset.i]; inp.value = p[1][p[1].length - 1]; p[1].forEach(run); });
  $('#cmdGo').addEventListener('click', () => { run(inp.value); inp.select(); });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { run(inp.value); inp.select(); } });
  $('#cmdReset').addEventListener('click', () => { log.innerHTML = ''; reset(); });
  reset();
});
