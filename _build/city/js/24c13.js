/* ---------- 装置 14：划学区 ---------- */
dev('#schFig', fig => {
  const NX = 24, NY = 12, C = 25, svg = $('#schSvg');
  const S = [{x: 6, y: 4, n: 'A 名校'}, {x: 17, y: 3, n: 'B'}, {x: 12, y: 9, n: 'C'}];
  const P = $('#schP');
  let mode = 0;
  btnRow($('#schMode'), ['就近划片', '多校划片（摇号）'], 0, i => { mode = i; go(); });
  P.addEventListener('input', go);
  const md = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  function go(){
    const prem = +P.value / 100;
    $('#schPO').textContent = '+' + Math.round(prem * 100) + '%';
    const cells = [];
    for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
      const p = {x: x + .5, y: y + .5};
      const d = S.map(s => md(p, s)); const k = d.indexOf(Math.min(...d));
      // 进 A 的概率：就近 = 0/1；多校 = 离 A 不太远的几片按距离分摊
      let pa = k === 0 ? 1 : 0;
      if (mode === 1) pa = d[0] <= 9 ? clamp(0.55 - d[0] * 0.04, 0.12, 0.5) : 0;
      const base = 1 - 0.012 * Math.hypot(x - 12, y - 6); // 离市中心越远越便宜一点
      cells.push({x, y, k, pa, price: base * (1 + prem * pa)});
    }
    const mx = Math.max(...cells.map(c => c.price)), mn = Math.min(...cells.map(c => c.price));
    let s = '';
    cells.forEach(c => { const t = (c.price - mn) / (mx - mn || 1); s += '<rect x="' + c.x * C + '" y="' + c.y * C + '" width="' + C + '" height="' + C + '" fill="var(--och)" fill-opacity="' + (0.08 + t * 0.75).toFixed(2) + '" stroke="var(--card)" stroke-width="1"/>'; });
    if (mode === 0) cells.forEach(c => { const r = cells[c.y * NX + c.x + 1], b = cells[(c.y + 1) * NX + c.x]; if (r && c.x < NX - 1 && r.k !== c.k) s += '<line x1="' + (c.x + 1) * C + '" x2="' + (c.x + 1) * C + '" y1="' + c.y * C + '" y2="' + (c.y + 1) * C + '" stroke="var(--grn)" stroke-width="3"/>'; if (b && b.k !== c.k) s += '<line x1="' + c.x * C + '" x2="' + (c.x + 1) * C + '" y1="' + (c.y + 1) * C + '" y2="' + (c.y + 1) * C + '" stroke="var(--grn)" stroke-width="3"/>'; });
    else s += '<path d="' + (() => { let d = ''; cells.forEach(c => { if (c.pa > 0) { const r = cells[c.y * NX + c.x + 1], b = cells[(c.y + 1) * NX + c.x]; if (c.x === NX - 1 || !r || !(r.pa > 0)) d += 'M' + (c.x + 1) * C + ',' + c.y * C + 'v' + C; if (!b || !(b.pa > 0)) d += 'M' + c.x * C + ',' + (c.y + 1) * C + 'h' + C; const l = cells[c.y * NX + c.x - 1], t = cells[(c.y - 1) * NX + c.x]; if (c.x === 0 || !(l && l.pa > 0)) d += 'M' + c.x * C + ',' + c.y * C + 'v' + C; if (!t || !(t.pa > 0)) d += 'M' + c.x * C + ',' + c.y * C + 'h' + C; } }); return d; })() + '" stroke="var(--grn)" stroke-width="2.5" stroke-dasharray="5 3" fill="none"/>';
    S.forEach((q, i) => s += '<rect x="' + (q.x * C - 13) + '" y="' + (q.y * C - 11) + '" width="26" height="22" fill="' + (i === 0 ? 'var(--grn)' : 'var(--card)') + '" stroke="var(--grn)" stroke-width="2"/><text x="' + q.x * C + '" y="' + (q.y * C + 5) + '" font-size="12" text-anchor="middle" fill="' + (i === 0 ? 'var(--card)' : 'var(--grn)') + '" font-weight="700">' + q.n[0] + '</text>');
    svg.innerHTML = s;
    const inA = cells.filter(c => c.pa >= .99), near = cells.filter(c => c.pa > 0 && c.pa < .99), out = cells.filter(c => c.pa === 0);
    const avg = a => a.length ? a.reduce((p, c) => p + c.price, 0) / a.length : 0;
    const top = Math.max(...cells.map(c => c.price)), bot = Math.min(...cells.map(c => c.price));
    kv($('#schKV'), mode === 0 ? [['A 学区平均房价', avg(inA).toFixed(2)], ['其他地方平均', avg(out).toFixed(2)], ['A 学区贵出', Math.round((avg(inA) / avg(out) - 1) * 100) + '%'], ['最贵 ÷ 最便宜', (top / bot).toFixed(2)]]
      : [['能摇 A 的片区平均', avg(near).toFixed(2)], ['摇不到 A 的地方', avg(out).toFixed(2)], ['贵出', Math.round((avg(near) / avg(out) - 1) * 100) + '%'], ['最贵 ÷ 最便宜', (top / bot).toFixed(2)]]);
    const Sy = $('#schSay');
    Sy.innerHTML = mode === 0
      ? '绿线就是学区线。线这一边的房子能上 A，线那一边不能，<b>同样的房子，价钱一步之遥就跳了一截</b>。家长越看重名校，这道坎越高。'
      : '多校划片后，A 的名额分给了周围一大片，每一片只有一部分机会。“悬崖”变成了“缓坡”：最贵的房子没那么贵了，但能摇 A 的片区变大了，周围的房子也跟着涨了一些。<br>它没有消灭学区房，只是把它摊薄了。真正能让这道坡变平的，是让 B 和 C 也变成好学校。';
  }
  go();
});
