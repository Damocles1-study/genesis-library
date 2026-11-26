/* ================= 第九部 · 理：各章装置 ================= */
/* 封面：游戏里 vs 真实世界 */
dev('#twoFig', () => {
  const T = [['东西往下掉', '每刻速度加 0.08 格、再乘 0.98，最快约每秒 78 格。', '每秒速度加 9.8 米/秒；有空气时跳伞的人最快约每秒 50 多米。', 'c67'],
    ['摔下来疼不疼', '伤害 = 掉落格数 − 3；掉进水里不疼。', '疼不疼看“停下来有多快”：软的东西让你慢慢停下。', 'c67'],
    ['光变暗', '每走一格亮度少 1，从 15 到 0。', '距离翻倍，亮度只剩四分之一（平方反比）。', 'c68'],
    ['声音高低', '音符盒 25 个音，右键一下升半音。', '振动越快音越高，高一个八度频率翻倍。', 'c69'],
    ['水流', '一格水源在平地上流 7 格。', '水往低处流，最后水面一样高（连通器）。', 'c70'],
    ['白天黑夜', '太阳绕着世界转，20 分钟一天，没有季节。', '地球自转 24 小时一天，绕太阳一年，有四季。', 'c71'],
    ['月亮', '8 种样子，8 天一轮。', '连续变化，约 29.5 天一轮。', 'c71'],
    ['指南针', '指着世界的出生点。', '指着磁北，和真正的北差一个小角度。', 'c71']];
  const box = $('#twBox');
  const show = i => { const t = T[i]; box.innerHTML = '<div><b>游戏里</b><p>' + t[1] + '</p></div><div class="hid"><b>真实世界</b><p>' + t[2] + '</p><button class="btn">先猜一猜，再点这里翻开</button></div><p class="ni" style="grid-column:1/-1;font-size:13.5px">详细的在 <a data-c="' + t[3] + '" href="' + href(t[3]) + '">第' + t[3].slice(1) + '章</a>。</p>'; $('.hid', box).addEventListener('click', e => e.currentTarget.classList.remove('hid')); };
  btnRow($('#twBtns'), T.map(t => t[0]), 0, show); show(0);
});

/* 第六十七章：跳下去 */
dev('#dropFig', () => {
  const ON = [['草地', 1], ['干草块', .2], ['水', 0], ['黏液块', 0]]; let on = 0;
  const sim = H => { let v = 0, d = 0, t = 0; const pts = [[0, 0]]; while (d < H && t < 2000) { v = (v + .08) * .98; d += v; t++; pts.push([t / 20, Math.min(d, H)]); } return {t: t / 20, v: v * 20, pts}; };
  const draw = () => { const H = +$('#drH').value, s = sim(H), real = Math.sqrt(2 * H / 9.8), dmg = Math.max(0, Math.round((H - 3) * ON[on][1]));
    const hp = Math.max(0, 20 - dmg); let h = ''; for (let i = 0; i < 10; i++) { const v = hp - i * 2; h += '<span class="ht' + (v >= 2 ? '' : v === 1 ? ' half' : ' empty') + '">♥</span>'; } $('#drHearts').innerHTML = h;
    kv($('#drKv'), [['游戏里掉多久', s.t.toFixed(2) + ' 秒'], ['落地时多快', s.v.toFixed(1) + ' 格/秒'], ['扣血', dmg + ' 点（' + dmg / 2 + ' 颗心）'], ['真实（无空气）', real.toFixed(2) + ' 秒']]);
    const rp = []; for (let t = 0; t <= real + .001; t += real / 40) rp.push([t, Math.min(H, 4.9 * t * t)]);
    lineChart($('#drSvg'), [{color: 'var(--main)', pts: s.pts, w: 3}, {color: 'var(--ter)', pts: rp, dash: '5 4'}], {xmin: 0, xmax: Math.max(s.t, real) * 1.05, ymin: 0, ymax: H, xt: [0, +(Math.max(s.t, real) / 2).toFixed(1), +Math.max(s.t, real).toFixed(1)], yt: [0, Math.round(H / 2), H], xf: v => v + ' 秒', yf: v => v + ' 格', H: 220});
    $('#drSay').innerHTML = '绿线：游戏；棕色虚线：真实世界没有空气时。' + (dmg >= 20 ? ' <b>这个高度没穿盔甲会死。</b>' : '') + (ON[on][1] === 0 ? ' 落在' + ON[on][0] + '上，不扣血。' : ON[on][1] < 1 ? ' 干草块把伤害减了 80%。' : ' 伤害 = ' + H + ' − 3 = ' + Math.max(0, H - 3) + ' 点。'); };
  btnRow($('#drOn'), ON.map(o => '落在' + o[0]), 0, i => { on = i; draw(); });
  slider('drH', v => v + ' 格', () => draw());
});

/* 第六十八章：插火把 */
dev('#lightFig', () => {
  const N = 15, svg = $('#ltSvg'); let tool = 0; const src = new Map(), wall = new Set();
  const TL = [['火把（14）', 14], ['荧石（15）', 15], ['墙', 0]];
  src.set('7,7', 14);
  const calc = () => { const L = Array.from({length: N}, () => new Array(N).fill(0)); const q = [];
    src.forEach((v, k) => { const [x, y] = k.split(',').map(Number); L[y][x] = v; q.push([x, y]); });
    while (q.length) { const [x, y] = q.shift(), v = L[y][x]; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N || wall.has(nx + ',' + ny)) return; if (v - 1 > L[ny][nx]) { L[ny][nx] = v - 1; q.push([nx, ny]); } }); }
    return L; };
  const draw = () => { const L = calc(), S = 28; let g = '', dark = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const k = x + ',' + y, v = L[y][x];
      if (wall.has(k)) { g += '<rect x="' + x * S + '" y="' + y * S + '" width="' + (S - 1) + '" height="' + (S - 1) + '" fill="var(--stn-2)"/>'; continue; }
      if (!v && !src.has(k)) dark++;
      g += '<rect x="' + x * S + '" y="' + y * S + '" width="' + (S - 1) + '" height="' + (S - 1) + '" fill="' + (v ? 'var(--gold)' : 'var(--zhu)') + '" opacity="' + (v ? (.08 + v / 15 * .8) : .35) + '"/>';
      g += src.has(k) ? '<rect x="' + (x * S + 11) + '" y="' + (y * S + 5) + '" width="6" height="18" fill="' + (src.get(k) === 15 ? '#ffe066' : '#8a5a2a') + '"/><rect x="' + (x * S + 10) + '" y="' + (y * S + 3) + '" width="8" height="7" fill="#ffcf3a"/>' : txt(x * S + S / 2, y * S + S / 2 + 4, v, {s: 11, c: 'var(--ink)', halo: false}); }
    svg.setAttribute('viewBox', '0 0 ' + N * S + ' ' + N * S); svg.innerHTML = g;
    kv($('#ltKv'), [['光源', src.size + ' 个'], ['墙', wall.size + ' 块'], ['亮度 0 的格子（会出怪）', dark]]); };
  svg.addEventListener('click', e => { const r = svg.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * N), y = Math.floor((e.clientY - r.top) / r.height * N), k = x + ',' + y;
    if (tool === 2) { if (wall.has(k)) wall.delete(k); else { wall.add(k); src.delete(k); } } else { if (src.has(k)) src.delete(k); else { src.set(k, TL[tool][1]); wall.delete(k); } } draw(); });
  btnRow($('#ltTool'), TL.map(t => t[0]), 0, i => tool = i);
  $('#ltClr').addEventListener('click', () => { src.clear(); wall.clear(); draw(); });
  $('#ltEx').addEventListener('click', () => { for (let y = 1; y < 12; y++) wall.add('10,' + y); draw(); });
  draw();
});
dev('#isqFig', () => {
  slider('isD', v => v + ' 格（米）', d => { const game = Math.max(0, 14 - d), real = 100 / (d * d);
    bars($('#isBars'), [['游戏火把', game / 14 * 100, '亮度 ' + game + ' / 14', 'var(--gold)'], ['真实的灯', real, '1 ÷ ' + d + '² = 1/' + d * d, 'var(--ter)']], 100, v => Math.round(v) + '%');
    $('#isSay').innerHTML = '离 ' + d + ' 格：游戏里还剩 ' + Math.round(game / 14 * 100) + '%，真实的灯只剩 ' + (Math.round(real * 10) / 10) + '%。' + (d >= 3 ? ' 真实的光暗得快得多。' : ''); });
});

/* 第六十九章：音符盒钢琴 */
dev('#pianoFig', () => {
  const NAMES = ['F♯', 'G', 'G♯', 'A', 'A♯', 'B', 'C', 'C♯', 'D', 'D♯', 'E', 'F'];
  const SOL = {6: 'do', 8: 're', 10: 'mi', 11: 'fa', 13: 'sol', 15: 'la', 17: 'si', 18: 'do'};
  const freq = n => 369.994 * Math.pow(2, (n - 12) / 12);
  const nm = n => NAMES[n % 12] + (3 + Math.floor((n + 6) / 12));
  const INST = [['竖琴 harp', 'triangle'], ['钟琴 bells', 'sine'], ['电子 bit', 'square'], ['贝斯 bass', 'sawtooth']]; let inst = 0;
  let ac = null; const audio = () => { if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (C) ac = new C(); } return ac; };
  const play = (n, t0) => { const a = audio(); if (!a) { $('#pnSay').textContent = '这个浏览器放不出声音。'; return; } const t = t0 || a.currentTime, o = a.createOscillator(), g = a.createGain();
    o.type = INST[inst][1]; o.frequency.value = freq(n) * (inst === 3 ? .5 : 1); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(inst === 2 ? .08 : .25, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + (inst === 1 ? 1.4 : .7));
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 1.5); };
  const keys = $('#pnKeys');
  keys.innerHTML = Array.from({length: 25}, (_, n) => '<button class="pk' + (NAMES[n % 12].includes('♯') ? ' bk' : '') + '" data-n="' + n + '"><small>' + n + '</small>' + (SOL[n] || '') + '</button>').join('');
  const show = n => kv($('#pnKv'), [['右键几下', n + ' 下'], ['音名', nm(n)], ['频率', freq(n).toFixed(1) + ' Hz'], ['唱名', SOL[n] || '—']]);
  let rec = null, recT = 0;
  const hit = n => { play(n); show(n); const b = $('[data-n="' + n + '"]', keys); b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 220); if (rec) { rec.push([n, performance.now() - recT]); } };
  keys.addEventListener('pointerdown', e => { const b = e.target.closest('.pk'); if (b) { e.preventDefault(); hit(+b.dataset.n); } });
  btnRow($('#pnInst'), INST.map(x => x[0]), 0, i => inst = i);
  const SONGS = [[6, 6, 13, 13, 15, 15, 13, -1, 11, 11, 10, 10, 8, 8, 6], [6, 8, 10, 6, 6, 8, 10, 6, 10, 11, 13, -1, 10, 11, 13]];
  const playSeq = seq => { let i = 0; const step = () => { if (i >= seq.length) return; const n = seq[i++]; if (n >= 0) hit(n); setTimeout(step, 420); }; step(); };
  $$('#pianoFig [data-song]').forEach(b => b.addEventListener('click', () => { const s = SONGS[+b.dataset.song]; $('#pnSay').innerHTML = '要右键的次数：' + s.filter(n => n >= 0).join('、') + '。在游戏里把一排音符盒照这个调好，就能弹出来。'; playSeq(s); }));
  $('#pnRec').addEventListener('click', e => { if (rec) { e.target.textContent = '录下我弹的'; $('#pnSay').textContent = '录好了 ' + rec.length + ' 个音。'; window._pnRec = rec; rec = null; } else { rec = []; recT = performance.now(); e.target.textContent = '停止录音'; $('#pnSay').textContent = '开始弹吧。'; } });
  $('#pnPlay').addEventListener('click', () => { const r = window._pnRec; if (!r || !r.length) { $('#pnSay').textContent = '还没有录。'; return; } r.forEach(([n, t]) => setTimeout(() => hit(n), t)); $('#pnSay').textContent = '要右键的次数：' + r.map(x => x[0]).join('、'); });
  lineChart($('#pnSvg'), [{color: 'var(--dia)', pts: Array.from({length: 25}, (_, n) => [n, freq(n)]), dots: true}], {xmin: 0, xmax: 24, ymin: 0, ymax: 800, xt: [0, 6, 12, 18, 24], yt: [0, 185, 370, 740], xf: v => v + ' 下', yf: v => v + ' Hz', marks: [[12, '高一个八度：频率×2'], [24, '再高一个八度']], H: 200});
  show(0);
});

/* 第七十章：跷跷板 */
dev('#leverFig', () => {
  const svg = $('#lvSvg'), W = new Array(11).fill(0); let goal = null; // 位置 −5…5
  const draw = () => { let tq = 0; W.forEach((w, i) => tq += w * (i - 5)); const ang = clamp(-tq * 2.2, -14, 14);
    const S = 40, cx = 260, cy = 150; let g = '<path d="M' + (cx - 18) + ',' + (cy + 40) + 'L' + cx + ',' + cy + 'L' + (cx + 18) + ',' + (cy + 40) + 'Z" fill="var(--ter)"/>';
    g += '<g transform="rotate(' + ang + ' ' + cx + ' ' + cy + ')"><rect x="' + (cx - 5.5 * S) + '" y="' + (cy - 8) + '" width="' + 11 * S + '" height="10" fill="var(--wood)"/>';
    for (let i = 0; i < 11; i++) { const x = cx + (i - 5) * S - S / 2; g += '<rect x="' + x + '" y="' + (cy - 8 - 4 * 22) + '" width="' + S + '" height="' + 4 * 22 + '" fill="transparent" data-i="' + i + '" style="cursor:pointer"/>' + txt(cx + (i - 5) * S, cy + 18, Math.abs(i - 5), {s: 11, c: 'var(--ink-3)', halo: false});
      for (let k = 0; k < W[i]; k++) g += '<rect x="' + (x + 4) + '" y="' + (cy - 8 - (k + 1) * 22) + '" width="' + (S - 8) + '" height="20" fill="var(--stn)" stroke="var(--ink-3)" pointer-events="none"/>'; }
    g += '</g>'; svg.setAttribute('viewBox', '0 0 520 220'); svg.innerHTML = g;
    const left = W.slice(0, 5).reduce((a, w, i) => a + w * (5 - i), 0), right = W.slice(6).reduce((a, w, i) => a + w * (i + 1), 0);
    $('#lvSay').className = 'say ' + (left === right && left ? 'ok' : '');
    $('#lvSay').innerHTML = '左边：' + (W.slice(0, 5).map((w, i) => w ? w + '×' + (5 - i) : '').filter(Boolean).join(' + ') || '0') + ' = <b>' + left + '</b>　右边：' + (W.slice(6).map((w, i) => w ? w + '×' + (i + 1) : '').filter(Boolean).join(' + ') || '0') + ' = <b>' + right + '</b>　' + (left === right ? (left ? '平衡了！' : '') : left > right ? '往左倒。' : '往右倒。') + (goal && left === right && left ? ' 挑战成功！' : ''); };
  svg.addEventListener('click', e => { const t = e.target.closest('[data-i]'); if (!t) return; const i = +t.dataset.i; if (i === 5) return; W[i] = (W[i] + 1) % 5; draw(); });
  $('#lvClr').addEventListener('click', () => { W.fill(0); goal = null; draw(); });
  $('#lvCh').addEventListener('click', () => { W.fill(0); W[3] = 3; goal = 1; draw(); $('#lvSay').innerHTML += '<br>左边在 2 格处叠了 3 块（3 × 2 = 6）。右边只放 1 块，要放在离支点几格？'; });
  draw();
});

/* 第七十章：水往哪儿流 */
dev('#waterFig', () => {
  const N = 15, svg = $('#wtSvg'); let tool = 0; const src = new Set(['7,7']), wall = new Set();
  const calc = () => { const L = Array.from({length: N}, () => new Array(N).fill(0)), q = [];
    src.forEach(k => { const [x, y] = k.split(',').map(Number); L[y][x] = 8; q.push([x, y]); });
    while (q.length) { const [x, y] = q.shift(), v = L[y][x]; if (v <= 1) continue; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N || wall.has(nx + ',' + ny)) return; if (v - 1 > L[ny][nx]) { L[ny][nx] = v - 1; q.push([nx, ny]); } }); }
    return L; };
  const draw = () => { const L = calc(), S = 28; let g = '', wet = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const k = x + ',' + y, v = L[y][x];
      if (wall.has(k)) { g += '<rect x="' + x * S + '" y="' + y * S + '" width="' + (S - 1) + '" height="' + (S - 1) + '" fill="var(--stn-2)"/>'; continue; }
      if (v) wet++;
      g += '<rect x="' + x * S + '" y="' + y * S + '" width="' + (S - 1) + '" height="' + (S - 1) + '" fill="' + (v ? 'var(--water)' : 'var(--grass)') + '" opacity="' + (v ? .25 + v / 8 * .7 : .55) + '"/>';
      if (v) g += txt(x * S + S / 2, y * S + S / 2 + 4, src.has(k) ? '源' : v - 1, {s: 11, c: '#fff', halo: false, w: src.has(k)}); }
    svg.setAttribute('viewBox', '0 0 ' + N * S + ' ' + N * S); svg.innerHTML = g;
    kv($('#wtKv'), [['水源', src.size], ['被水盖住的格子', wet]]); };
  svg.addEventListener('click', e => { const r = svg.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * N), y = Math.floor((e.clientY - r.top) / r.height * N), k = x + ',' + y;
    if (tool === 1) { if (wall.has(k)) wall.delete(k); else { wall.add(k); src.delete(k); } } else { if (src.has(k)) src.delete(k); else { src.add(k); wall.delete(k); } } draw(); });
  btnRow($('#wtTool'), ['水源', '墙'], 0, i => tool = i);
  $('#wtClr').addEventListener('click', () => { src.clear(); wall.clear(); draw(); });
  $('#wtMaze').addEventListener('click', () => { wall.clear(); src.clear(); for (let i = 0; i < 12; i++) { wall.add('4,' + i); wall.add('9,' + (14 - i)); } src.add('1,1'); draw(); });
  draw();
});

/* 第七十一章：月相 */
dev('#moonFig', () => {
  const top = $('#mnTop'), view = $('#mnView');
  const GP = ['满月', '渐亏凸月', '下弦月', '残月', '新月', '蛾眉月', '上弦月', '渐盈凸月'];
  $('#mnGame').innerHTML = GP.map((p, i) => { const f = [1, .75, .5, .25, 0, .25, .5, .75][i], wax = i > 4; return '<div><svg viewBox="-12 -12 24 24" width="40" height="40">' + moonShape(f, wax, 10) + '</svg><small>第 ' + (i + 1) + ' 晚<br>' + p + '</small></div>'; }).join('');
  function moonShape(lit, waxing, r){ // lit 0..1 亮的比例；waxing 亮的在右边
    const k = (1 - 2 * lit) * r; const side = waxing ? 1 : -1;
    return '<circle r="' + r + '" fill="#2a2f3a"/><path d="M0,' + (-r) + ' A' + r + ',' + r + ' 0 0,' + (side > 0 ? 1 : 0) + ' 0,' + r + ' A' + Math.abs(k) + ',' + r + ' 0 0,' + ((k > 0) === (side > 0) ? 0 : 1) + ' 0,' + (-r) + 'Z" fill="#f2efd8"/>';
  }
  slider('mnD', v => '第 ' + v + ' 天', d => {
    const a = d / 29.53 * 2 * Math.PI; // 0 = 新月（月亮在地球和太阳之间）
    const W = 300, C = 150, R = 90; let g = '<rect width="' + W + '" height="' + W + '" fill="#141a26" rx="6"/>';
    for (let i = 0; i < 8; i++) g += '<line x1="' + (W - 6) + '" x2="' + (W - 40) + '" y1="' + (40 + i * 30) + '" y2="' + (40 + i * 30) + '" stroke="#ffe066" stroke-width="2" opacity=".6"/>';
    g += txt(W - 10, 24, '太阳光 ←', {s: 11, a: 'end', c: '#ffe066', halo: false});
    g += '<circle cx="' + C + '" cy="' + C + '" r="' + R + '" fill="none" stroke="#3a4256" stroke-dasharray="3 4"/><circle cx="' + C + '" cy="' + C + '" r="16" fill="#3a78c0"/><path d="M' + C + ',' + (C - 16) + ' A16,16 0 0,0 ' + C + ',' + (C + 16) + 'Z" fill="#000" opacity=".55"/>' + txt(C, C + 32, '地球', {s: 11, c: '#cfd6e6', halo: false});
    const mx = C + Math.cos(a) * R, my = C - Math.sin(a) * R;
    g += '<circle cx="' + mx + '" cy="' + my + '" r="10" fill="#f2efd8"/><path d="M' + mx + ',' + (my - 10) + ' A10,10 0 0,0 ' + mx + ',' + (my + 10) + 'Z" fill="#000" opacity=".7"/>' + txt(mx, my - 15, '月亮', {s: 11, c: '#cfd6e6', halo: false});
    top.setAttribute('viewBox', '0 0 ' + W + ' ' + W); top.innerHTML = g;
    const lit = (1 - Math.cos(a)) / 2, waxing = d < 14.77;
    view.setAttribute('viewBox', '-60 -60 120 120'); view.innerHTML = '<rect x="-60" y="-60" width="120" height="120" fill="#141a26" rx="6"/>' + moonShape(lit, waxing, 44).replace(/<circle r="44" fill="#2a2f3a"\/>/, '<circle r="44" fill="#2a2f3a"/>');
    const name = lit < .04 ? '新月' : lit > .96 ? '满月' : Math.abs(lit - .5) < .06 ? (waxing ? '上弦月' : '下弦月') : lit < .5 ? (waxing ? '蛾眉月' : '残月') : (waxing ? '渐盈凸月' : '渐亏凸月');
    $('#mnSay').innerHTML = '第 ' + d + ' 天：我们看到亮的部分大约 <b>' + Math.round(lit * 100) + '%</b>，叫“' + name + '”。左图里，月亮亮的一半总是朝着右边的太阳；你从地球上看过去，看见的亮的部分在变。';
  });
});
/* 第七十一章：指南针 */
dev('#cmpsFig', () => {
  const svg = $('#csSvg'), R = 10, S = 18, W = (2 * R + 1) * S; let me = [4, 3], sp = [-5, -6], mode = 0;
  const X = x => (x + R) * S + S / 2, Z = z => (z + R) * S + S / 2;
  const needle = (cx, cy, ang, col) => { const dx = Math.sin(ang), dy = -Math.cos(ang); return '<circle cx="' + cx + '" cy="' + cy + '" r="22" fill="var(--card)" stroke="var(--ink-2)" stroke-width="2"/><line x1="' + (cx - dx * 17) + '" y1="' + (cy - dy * 17) + '" x2="' + (cx + dx * 17) + '" y2="' + (cy + dy * 17) + '" stroke="var(--ink-3)" stroke-width="3"/><line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + dx * 17) + '" y2="' + (cy + dy * 17) + '" stroke="' + col + '" stroke-width="4" stroke-linecap="round"/>'; };
  const draw = () => { let g = '<rect width="' + W + '" height="' + (W + 60) + '" fill="var(--paper)"/>';
    for (let i = 0; i <= 2 * R + 1; i++) g += '<line x1="' + i * S + '" x2="' + i * S + '" y1="0" y2="' + W + '" stroke="var(--rule)" stroke-width=".6"/><line y1="' + i * S + '" y2="' + i * S + '" x1="0" x2="' + W + '" stroke="var(--rule)" stroke-width=".6"/>';
    g += txt(W / 2, 12, '北', {s: 12, w: true});
    g += '<rect x="' + (X(sp[0]) - 8) + '" y="' + (Z(sp[1]) - 8) + '" width="16" height="16" fill="var(--gold)"/>' + txt(X(sp[0]), Z(sp[1]) - 12, '出生点', {s: 11, w: true});
    g += '<line x1="' + X(me[0]) + '" y1="' + Z(me[1]) + '" x2="' + X(sp[0]) + '" y2="' + Z(sp[1]) + '" stroke="var(--gold)" stroke-dasharray="4 4"/>';
    g += '<circle cx="' + X(me[0]) + '" cy="' + Z(me[1]) + '" r="8" fill="var(--main)"/>' + txt(X(me[0]), Z(me[1]) - 12, '你', {s: 11, w: true});
    const ang = Math.atan2(X(sp[0]) - X(me[0]), -(Z(sp[1]) - Z(me[1])));
    g += needle(W / 2 - 60, W + 32, ang, 'var(--zhu)') + txt(W / 2 - 60, W + 66, '游戏的指南针', {s: 11}) + needle(W / 2 + 60, W + 32, 0, 'var(--blu)') + txt(W / 2 + 60, W + 66, '真的指南针', {s: 11});
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + (W + 76)); svg.innerHTML = g;
    $('#csSay').textContent = mode ? '现在点网格，把出生点放过去。' : '游戏的指南针指着出生点（红针），真的指南针总指北（蓝针）。'; };
  svg.addEventListener('click', e => { const r = svg.getBoundingClientRect(), k = W / r.width, x = Math.floor((e.clientX - r.left) * k / S) - R, z = Math.floor((e.clientY - r.top) * k / S) - R; if (z > R) return; if (mode) { sp = [x, z]; mode = 0; } else me = [x, z]; draw(); });
  $('#csSpawn').addEventListener('click', () => { mode = 1; draw(); });
  draw();
});
