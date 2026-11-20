/* ---------- 装置 12：火烧连营 ---------- */
dev('#fireFig', fig => {
  const NX = 40, NY = 20, C = 15, svg = $('#fireSvg');
  let mat = 0, wind = 1, brk = 0, cell, timer = null, steps = 0;
  btnRow($('#fireMat'), ['全是木头房子', '一半砖房'], 0, i => { mat = i; reset(); });
  btnRow($('#fireWind'), ['无风', '西北风'], 1, i => { wind = i; });
  btnRow($('#fireBrk'), ['不防火', '每五户一道封火墙', '拆出一条火除地'], 0, i => { brk = i; reset(); });
  $('#fireReset').addEventListener('click', reset);
  // 0 空地/路 1 木 2 砖 3 墙 | 状态 b: 0 好 1..3 在烧 4 烧光
  function reset(){
    if (timer) { clearInterval(timer); timer = null; }
    const R = rng(66);
    cell = [];
    for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
      let t = (y === 6 || y === 13) ? 0 : (mat === 1 && R() < .5 ? 2 : 1);
      if (brk === 1 && x % 6 === 5 && t) t = 3;
      if (brk === 2 && x >= 19 && x <= 21) t = 0;
      cell.push({t, b: 0});
    }
    steps = 0; draw(); report();
  }
  const at = (x, y) => (x < 0 || y < 0 || x >= NX || y >= NY) ? null : cell[y * NX + x];
  function draw(){
    let s = '';
    cell.forEach((c, i) => {
      const x = (i % NX) * C, y = Math.floor(i / NX) * C;
      if (c.t === 0) return;
      let f = c.t === 2 ? 'var(--brk)' : c.t === 3 ? 'var(--ink)' : 'var(--och)', o = c.t === 1 ? .35 : c.t === 2 ? .45 : .8;
      if (c.b >= 1 && c.b <= 3) { f = 'var(--red)'; o = 1 - (c.b - 1) * .2; }
      if (c.b === 4) { f = 'var(--ink)'; o = .55; }
      s += '<rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="' + (c.t === 3 ? C * .45 : C - 2) + '" height="' + (C - 2) + '" fill="' + f + '" fill-opacity="' + o + '"' + (c.t !== 3 ? ' data-i="' + i + '"' : '') + '/>';
    });
    if (wind) s += '<g transform="translate(560,26)"><path d="M-14,-10 L10,8" stroke="var(--ink)" stroke-width="2"/><path d="M10,8 l-9,-1 l5,-6 z" fill="var(--ink)"/><text x="-20" y="22" font-size="10" fill="var(--ink)" paint-order="stroke" stroke="var(--card)" stroke-width="3">西北风</text></g>';
    svg.innerHTML = s;
  }
  function step(){
    const R = Math.random, nb = [];
    let burning = 0;
    cell.forEach((c, i) => {
      if (c.b < 1 || c.b > 3) return;
      burning++;
      const x = i % NX, y = Math.floor(i / NX);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const n = at(x + dx, y + dy); if (!n || n.b || n.t === 0 || n.t === 3) continue;
        let p = n.t === 1 ? .42 : .07;
        if (dx && dy) p *= .45;
        // 隔着墙不烧
        if (dx) { const w = at(x + dx, y); if (w && w.t === 3) continue; }
        if (wind) { const d = dx * 1 + dy * 1; p *= d > 0 ? 1.9 : d < 0 ? .35 : 1; } // 往东南烧得快
        if (R() < p) nb.push(n);
      }
    });
    nb.forEach(n => n.b = 1);
    cell.forEach(c => { if (c.b >= 1 && c.b <= 3 && !nb.includes(c)) c.b++; });
    if ($('#fireCrew').checked && steps > 3) cell.forEach(c => { if (c.b >= 1 && c.b <= 3 && Math.random() < .22) c.b = 4; });
    steps++; draw(); report();
    if (!burning) { clearInterval(timer); timer = null; report(true); }
  }
  function report(done){
    const houses = cell.filter(c => c.t === 1 || c.t === 2).length, burnt = cell.filter(c => c.b === 4).length, live = cell.filter(c => c.b >= 1 && c.b <= 3).length;
    kv($('#fireKV'), [['房子', houses + ' 间'], ['正在烧', live + ' 间'], ['烧光', burnt + ' 间'], ['烧掉了', houses ? Math.round((burnt + live) / houses * 100) + '%' : '0%']]);
    if (!done) return;
    const pct = (burnt) / houses, S = $('#fireSay');
    S.className = 'say' + (pct > .4 ? ' bad' : pct < .1 ? ' ok' : '');
    let t = pct > .6 ? '火烧掉了大半个街区。木头房子挨着木头房子、再加上风，这就是罗马、伦敦、江户的大火。' : pct > .25 ? '火烧掉了一大片，最后在某些地方停住了。' : '火被控制在了一小片里。';
    if (brk === 1) t += ' 封火墙一道道把火挡住：一户着火，最多烧掉“五户一伙”里的几间。这就是徽州马头墙的道理。';
    if (brk === 2) t += ' 那条拆出来的空地把火拦腰截断（除非风把火星吹过去）。江户的“火除地”和“广小路”就是这么用的。';
    if (mat === 1) t += ' 砖房很难点着，火只能沿着木房子一条条往前钻。伦敦 1666 年之后要求用砖石重建，图的就是这个。';
    if (wind) t += ' 风让火往下风处跑得飞快，往上风处几乎烧不动。';
    S.innerHTML = t;
  }
  svg.addEventListener('click', e => {
    const r = e.target.closest('[data-i]'); if (!r) return;
    const c = cell[+r.dataset.i]; if (c.b) return;
    c.b = 1; draw();
    $('#fireSay').className = 'say'; $('#fireSay').textContent = '烧起来了……';
    if (!timer) timer = setInterval(step, 140);
  });
  reset();
});
