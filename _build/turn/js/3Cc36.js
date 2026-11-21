/* ---------- 装置 37：用尺子分地 ---------- */
dev('#rulerFig', fig => {
  const C = 30, R = 20, N = 13;
  const PAL = ['#c9a36b', '#9fb87a', '#d7a08c', '#a6b7c9', '#c7b28a', '#b49cc0', '#8fb5a6', '#d1b06a', '#a9a07e', '#c49a9a', '#93a9b9', '#b8c08a', '#c4a4b8'];
  const COL = ['var(--ter)', 'var(--main)', 'var(--pur)'];
  const MODES = ['按经纬线画直线', '沿着河，再补几条直线', '按民族的分布画'];
  let mode = 0, seed = 3, grp, seeds, river;
  btnRow($('#ruMode'), MODES, 0, i => { mode = i; draw(); });
  $('#ruNew').addEventListener('click', () => { seed++; make(); draw(); });
  function make(){
    const r = rng(seed * 97);
    seeds = []; for (let i = 0; i < N; i++) seeds.push([r() * C, r() * R, .7 + r() * .8]);
    grp = []; for (let y = 0; y < R; y++) { grp.push([]); for (let x = 0; x < C; x++) { let b = 0, bd = 1e9; seeds.forEach((s, i) => { const d = Math.hypot(x + .5 - s[0], (y + .5 - s[1]) * 1.1) / s[2] + (r() - .5) * .9; if (d < bd) { bd = d; b = i; } }); grp[y].push(b); } }
    const a = r() * 4, ph = r() * 6; river = []; for (let x = 0; x <= C; x++) river.push(R * .5 + Math.sin(x / 4 + ph) * (2 + a));
  }
  function colonyOf(x, y){
    if (mode === 0) return x < 11 ? 0 : x < 21 ? (y < 9 ? 1 : 2) : (y < 13 ? 1 : 0);
    if (mode === 1) { const ry = river[x]; return y + .5 < ry ? (x < 16 ? 0 : 1) : 2; }
    // 按民族：把每个民族整块分给离它最近的“中心”
    const s = seeds[grp[y][x]], cs = [[5, 10], [24, 5], [22, 16]];
    let b = 0, bd = 1e9; cs.forEach((c, i) => { const d = Math.hypot(s[0] - c[0], s[1] - c[1]); if (d < bd) { bd = d; b = i; } }); return b;
  }
  function draw(){
    const cw = 20, W = C * cw, H = R * cw;
    let g = '';
    const col = []; for (let y = 0; y < R; y++) { col.push([]); for (let x = 0; x < C; x++) col[y].push(colonyOf(x, y)); }
    for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) g += '<rect x="' + x * cw + '" y="' + y * cw + '" width="' + cw + '" height="' + cw + '" fill="' + PAL[grp[y][x]] + '"/>';
    // 民族之间的细线
    let thin = '', thick = '';
    for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
      if (x < C - 1) { if (grp[y][x] !== grp[y][x + 1]) thin += 'M' + (x + 1) * cw + ',' + y * cw + 'v' + cw; if (col[y][x] !== col[y][x + 1]) thick += 'M' + (x + 1) * cw + ',' + y * cw + 'v' + cw; }
      if (y < R - 1) { if (grp[y][x] !== grp[y + 1][x]) thin += 'M' + x * cw + ',' + (y + 1) * cw + 'h' + cw; if (col[y][x] !== col[y + 1][x]) thick += 'M' + x * cw + ',' + (y + 1) * cw + 'h' + cw; }
    }
    g += '<path d="' + thin + '" stroke="#5b5146" stroke-opacity=".35" stroke-width="1"/>';
    g += '<path d="M' + river.map((v, x) => (x * cw).toFixed(1) + ',' + (v * cw).toFixed(1)).join('L') + '" fill="none" stroke="#4f7fa8" stroke-width="4" stroke-linecap="round"/>';
    g += '<path d="' + thick + '" stroke="#211d1a" stroke-width="4" stroke-linecap="round"/>';
    // 殖民地编号
    [0, 1, 2].forEach(c => { let sx = 0, sy = 0, n = 0; for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) if (col[y][x] === c) { sx += x; sy += y; n++; } if (n) g += txt((sx / n + .5) * cw, (sy / n + .5) * cw + 6, '殖民地 ' + 'ABC'[c], {s: 15, w: true, c: '#211d1a', hc: '#f3ebda'}); });
    const svg = $('#ruSvg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    // 统计
    const split = []; for (let i = 0; i < N; i++) { const s = new Set(); for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) if (grp[y][x] === i) s.add(col[y][x]); if (s.size) split.push(s.size); }
    const nSplit = split.filter(v => v > 1).length;
    const per = [0, 1, 2].map(c => { const s = new Set(); for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) if (col[y][x] === c) s.add(grp[y][x]); return s.size; });
    kv($('#ruKV'), [['被边界切开的民族', nSplit + ' / ' + split.length], ['每块殖民地里的民族', per.join(' / ')]]);
    const say = $('#ruSay');
    say.className = 'say' + (nSplit > 4 ? ' bad' : nSplit === 0 ? ' ok' : '');
    say.innerHTML = mode === 0 ? '在柏林或伦敦的办公室里，拿尺子沿着经线和纬线画，最省事，也最不需要知道那里住着谁。结果，' + nSplit + ' 个民族被切开了。'
      : mode === 1 ? '河流是很自然的边界，在地图上一眼就能看到。可对住在河两岸的人来说，河常常不是分界，而是他们一起打鱼、一起用水的地方。'
      : '按民族画，没有一个民族被切开。可每块殖民地里还是有好几个民族，而且这需要先派人去调查谁住在哪里，<em>当年几乎没有人愿意花这个工夫</em>。即便这样画了，独立以后的国家也很难只有一个民族。';
  }
  make(); draw();
});
