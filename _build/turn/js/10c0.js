
/* ---------- 装置 1：山把地切成几块 ---------- */
dev('#cutFig', fig => {
  const NX = 60, NY = 34, CS = 10;  // 每格示意 25 平方公里
  const MODES = ['希腊：山地破碎', '埃及：一条大河', '华北：一片大平原'];
  let mode = 0, seed = 5;
  const svg = $('#cutSvg'), R = $('#cutR');
  svg.setAttribute('viewBox', '0 0 ' + NX * CS + ' ' + NY * CS);
  btnRow($('#cutMode'), MODES.concat(['换一块地']), 0, i => { if (i === 3) { seed++; $$('#cutMode button')[3].classList.remove('on'); $$('#cutMode button')[mode].classList.add('on'); } else mode = i; go(); });
  R.addEventListener('input', go);
  function noise(sd, sc){
    const r = rng(sd), gw = Math.ceil(NX / sc) + 2, gh = Math.ceil(NY / sc) + 2, G = [];
    for (let i = 0; i < gw * gh; i++) G.push(r());
    const sm = t => t * t * (3 - 2 * t);
    return (x, y) => { const fx = x / sc, fy = y / sc, ix = Math.floor(fx), iy = Math.floor(fy), tx = sm(fx - ix), ty = sm(fy - iy);
      const a = G[iy * gw + ix], b = G[iy * gw + ix + 1], c = G[(iy + 1) * gw + ix], d = G[(iy + 1) * gw + ix + 1];
      return lerp(lerp(a, b, tx), lerp(c, d, tx), ty); };
  }
  function go(){
    const share = +R.value / 100;
    $('#cutO').textContent = Math.round(share * 100) + '% 是山';
    const sc = mode === 0 ? [4.5, 2.6, 1.5] : [9, 4, 2];
    const n1 = noise(seed * 7 + 1, sc[0]), n2 = noise(seed * 13 + 2, sc[1]), n3 = noise(seed * 3 + 5, sc[2]);
    const H = [];
    for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
      let h = n1(x, y) * .55 + n2(x, y) * .3 + n3(x, y) * .15;
      if (mode === 1) { const rv = NX / 2 + Math.sin(y / 5 + seed) * 4; h = h * .35 + Math.min(1, Math.abs(x - rv) / 14) * .65; }
      if (mode === 2) h = h * .25 + (Math.hypot((x - NX * .2) / NX, (y - NY * .15) / NY) < .25 ? .7 : 0) + Math.max(0, (x - NX * .82) / NX) * 3;
      H.push(h);
    }
    const sorted = H.slice().sort((a, b) => a - b), thr = sorted[Math.floor((1 - share) * (H.length - 1))];
    const lab = new Array(H.length).fill(-1), sizes = [];
    for (let i = 0; i < H.length; i++) {
      if (H[i] > thr || lab[i] >= 0) continue;
      const id = sizes.length, st = [i]; lab[i] = id; let n = 0;
      while (st.length) { const c = st.pop(); n++; const x = c % NX, y = (c / NX) | 0;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const xx = x + d[0], yy = y + d[1]; if (xx < 0 || yy < 0 || xx >= NX || yy >= NY) return; const j = yy * NX + xx; if (H[j] <= thr && lab[j] < 0) { lab[j] = id; st.push(j); } }); }
      sizes.push(n);
    }
    const MIN = 6, big = sizes.map((s, i) => [s, i]).filter(s => s[0] >= MIN).sort((a, b) => b[0] - a[0]);
    const hue = {}; big.forEach((b, k) => hue[b[1]] = (k * 137.5) % 360);
    let g = '';
    for (let i = 0; i < H.length; i++) {
      const x = (i % NX) * CS, y = ((i / NX) | 0) * CS;
      let f;
      if (H[i] > thr) { const t = clamp((H[i] - thr) / (sorted[sorted.length - 1] - thr + 1e-6), 0, 1); f = 'color-mix(in srgb,var(--ink) ' + Math.round(22 + t * 50) + '%,var(--land))'; }
      else if (hue[lab[i]] !== undefined) f = 'hsl(' + hue[lab[i]] + ' 45% 62% / .75)';
      else f = 'color-mix(in srgb,var(--ink) 8%,var(--land))';
      g += '<rect x="' + x + '" y="' + y + '" width="' + CS + '" height="' + CS + '" fill="' + f + '"/>';
    }
    // 给大盆地标上“城”
    big.slice(0, 40).forEach(b => { let sx = 0, sy = 0, n = 0; for (let i = 0; i < H.length; i++) if (lab[i] === b[1]) { sx += i % NX; sy += (i / NX) | 0; n++; }
      let cx = sx / n, cy = sy / n, best = 1e9, bi = 0; for (let i = 0; i < H.length; i++) if (lab[i] === b[1]) { const d = Math.hypot(i % NX - cx, ((i / NX) | 0) - cy); if (d < best) { best = d; bi = i; } }
      g += '<circle cx="' + ((bi % NX) * CS + 5) + '" cy="' + (((bi / NX) | 0) * CS + 5) + '" r="' + clamp(Math.sqrt(b[0]) * .8, 2.5, 9) + '" fill="var(--card)" stroke="var(--ink)" stroke-width="1.4"/>'; });
    svg.innerHTML = g;
    const low = H.filter(h => h <= thr).length, top = big.length ? big[0][0] : 0;
    kv($('#cutKV'), [['能住人的盆地', big.length + ' 块'], ['最大一块', Math.round(top / Math.max(1, low) * 100) + '% 的低地'], ['最大一块约养', fmt(top * 25 * 40) + ' 人'], ['最小一块约养', fmt((big.length ? big[big.length - 1][0] : 0) * 25 * 40) + ' 人']]);
    const s = $('#cutSay'), frac = top / Math.max(1, low);
    if (frac > .7) { s.className = 'say bad'; s.innerHTML = '低地连成了一大片，<b>谁占住了这块，谁就能轻松压住其余的人</b>。这是大河文明的地形：一条尼罗河、一片华北平原，天生适合一个王说了算。'; }
    else if (big.length >= 9) { s.className = 'say ok'; s.innerHTML = '地被切成了 <b>' + big.length + '</b> 块，每块都能养活一群人，又都不够大到吞掉其他块。这就是希腊：<b>每个盆地一个城邦</b>，翻山打仗太累，各管各的更划算。'; }
    else { s.className = 'say'; s.innerHTML = '几块大小差不多的盆地。它们大概会结盟、打仗、再结盟，几百年里谁也吃不掉谁，除非某一块突然出了一个特别能打或者特别有钱的。'; }
  }
  go();
});
