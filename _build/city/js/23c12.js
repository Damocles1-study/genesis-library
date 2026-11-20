/* ---------- 装置 13：派出所放哪儿 ---------- */
dev('#copFig', fig => {
  const G = 20, NX = 30, NY = 16, svg = $('#copSvg'), LIM = 160; // 1 像素 ≈ 5 米；800 米 = 160 像素
  const id = (x, y) => y * NX + x, adj = [...Array(NX * NY)].map(() => []);
  const link = (a, b) => { adj[a].push(b); adj[b].push(a); };
  const R = rng(1829);
  // 左半：整齐方格
  for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
    if (x < 15) { if (x + 1 < 15 || (x + 1 === 15 && y % 4 === 1)) link(id(x, y), id(x + 1, y)); if (y + 1 < NY) link(id(x, y), id(x, y + 1)); }
  }
  // 右半：随机生长的树 + 少量回路（弯巷）
  const seen = new Set([id(15, 1), id(15, 5), id(15, 9), id(15, 13)]), st = [...seen].map(k => [k % NX, (k / NX) | 0]);
  while (st.length) {
    const j = Math.floor(R() * Math.min(st.length, 3)) + Math.max(0, st.length - 3), [x, y] = st[j];
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(d => [x + d[0], y + d[1]]).filter(p => p[0] >= 15 && p[0] < NX && p[1] >= 0 && p[1] < NY && !seen.has(id(p[0], p[1])));
    if (!nb.length) { st.splice(j, 1); continue; }
    const p = nb[Math.floor(R() * nb.length)]; seen.add(id(p[0], p[1])); link(id(x, y), id(p[0], p[1])); st.push(p);
  }
  for (let k = 0; k < 18; k++) { const x = 15 + Math.floor(R() * 14), y = Math.floor(R() * (NY - 1)); if (!adj[id(x, y)].includes(id(x, y + 1))) link(id(x, y), id(x, y + 1)); }
  // 住户
  const W = [...Array(NX * NY)].map((_, i) => { const x = i % NX; return x < 15 ? 3 : x < 23 ? 5 : 1; });
  const TOT = W.reduce((a, b) => a + b, 0);
  const DOTS = []; W.forEach((w, i) => { for (let k = 0; k < w; k++) DOTS.push([(i % NX) * G + 10 + (R() - .5) * 12, ((i / NX) | 0) * G + 10 + (R() - .5) * 12, i]); });
  let posts = [];
  function bfs(src){
    const d = new Float32Array(NX * NY).fill(1e9), q = [];
    src.forEach(s => { d[s] = 0; q.push(s); });
    for (let h = 0; h < q.length; h++) { const c = q[h]; adj[c].forEach(n => { if (d[n] > d[c] + G) { d[n] = d[c] + G; q.push(n); } }); }
    return d;
  }
  const cover = d => { let c = 0, s = 0; W.forEach((w, i) => { if (d[i] <= LIM) c += w; s += w * Math.min(d[i], 600); }); return {c, avg: s / TOT}; };
  function draw(){
    const d = posts.length ? bfs(posts) : null;
    let s = '<rect width="600" height="320" fill="var(--paper)"/><line x1="300" x2="300" y1="0" y2="320" stroke="var(--rule)" stroke-dasharray="4 4"/>';
    s += '<text x="8" y="316" font-size="11" fill="var(--ink-3)">老方格城</text><text x="308" y="316" font-size="11" fill="var(--ink-3)">弯巷</text><text x="520" y="316" font-size="11" fill="var(--ink-3)">新区</text>';
    adj.forEach((ns, a) => ns.forEach(b => { if (b > a) s += '<line x1="' + ((a % NX) * G + 10) + '" y1="' + (((a / NX) | 0) * G + 10) + '" x2="' + ((b % NX) * G + 10) + '" y2="' + (((b / NX) | 0) * G + 10) + '" stroke="' + (d && d[a] <= LIM && d[b] <= LIM ? 'var(--blu)' : 'var(--ink-3)') + '" stroke-width="' + (d && d[a] <= LIM && d[b] <= LIM ? 3 : 1.4) + '" opacity="' + (d && d[a] <= LIM && d[b] <= LIM ? .55 : .5) + '"/>'; }));
    DOTS.forEach(p => s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="1.6" fill="' + (d && d[p[2]] <= LIM ? 'var(--blu)' : 'var(--ink)') + '" opacity=".75"/>');
    posts.forEach(p => { const x = (p % NX) * G + 10, y = ((p / NX) | 0) * G + 10; s += '<path d="M' + (x - 9) + ',' + (y - 9) + ' h18 v8 c0,7 -9,11 -9,11 c0,0 -9,-4 -9,-11 Z" fill="var(--blu)" stroke="var(--card)" stroke-width="1.5"/>'; });
    svg.innerHTML = s;
    if (!d) { kv($('#copKV'), [['派出所', '0 / 4'], ['十分钟内能走到的住户', '0%'], ['平均路程', '—']]); return; }
    const c = cover(d);
    let lc = 0, lt = 0, rc = 0, rt = 0; W.forEach((w, i) => { if (i % NX < 15) { lt += w; if (d[i] <= LIM) lc += w; } else { rt += w; if (d[i] <= LIM) rc += w; } });
    kv($('#copKV'), [['派出所', posts.length + ' / 4'], ['十分钟内能走到的住户', Math.round(c.c / TOT * 100) + '%'], ['老方格城', Math.round(lc / lt * 100) + '%'], ['弯巷和新区', Math.round(rc / rt * 100) + '%']]);
    return {c, lc: lc / lt, rc: rc / rt};
  }
  function say(r, auto){
    const S = $('#copSay');
    if (!r) { S.className = 'say'; S.textContent = '点地图放下第一个派出所。'; return; }
    const pct = r.c.c / TOT;
    let t = auto ? '墨按“每放一个，都尽量多盖住一些住户”的办法摆了四个。' : '';
    t += pct > .85 ? '大部分住户都在十分钟以内。' : pct > .6 ? '盖住了一大半，还有一些角落要走很远。' : '还有很多住户走不到。';
    if (r.lc > r.rc + .15) t += ' 注意左右的差别：方格城里路四通八达，一个派出所能盖住一大片；弯巷里路绕，同样的直线距离要走两三倍的路，<b>得多放几个才盖得住</b>。';
    if (posts.length === 4 && pct < .8) t += ' 四个不够。真实城市里，警力和派出所数量是按辖区人口、面积和案件多少一起算的。';
    S.className = 'say' + (pct > .85 ? ' ok' : ''); S.innerHTML = t;
  }
  svg.addEventListener('click', e => {
    if (posts.length >= 4) { $('#copSay').textContent = '最多四个。按“清空”重来。'; return; }
    const p = svgPt(svg, e), x = clamp(Math.round((p.x - 10) / G), 0, NX - 1), y = clamp(Math.round((p.y - 10) / G), 0, NY - 1);
    posts.push(id(x, y)); say(draw());
  });
  $('#copClear').addEventListener('click', () => { posts = []; draw(); say(null); });
  $('#copAuto').addEventListener('click', () => {
    posts = [];
    for (let k = 0; k < 4; k++) { let best = 0, bv = -1; for (let i = 0; i < NX * NY; i++) { if (!adj[i].length) continue; const v = cover(bfs(posts.concat(i))).c; if (v > bv) { bv = v; best = i; } } posts.push(best); }
    say(draw(), true);
  });
  draw();
});
