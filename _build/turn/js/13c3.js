
/* ---------- 装置 4：洗牌：十个部落 ---------- */
dev('#shuffleFig', fig => {
  const REG = [['城区', 'var(--main)'], ['海岸', 'var(--och)'], ['内陆', 'var(--grn)']];
  const HERO = ['厄瑞克透斯', '埃勾斯', '潘狄翁', '勒俄斯', '阿卡玛斯', '俄纽斯', '刻克洛普斯', '希波托翁', '埃阿斯', '安提俄科斯'];
  const svg = $('#shSvg'), W = 600, CW = 58, TH = 46, X0 = 10, Y0 = 34;
  svg.setAttribute('viewBox', '0 0 ' + W + ' 210');
  let grid = [], sel = -1, seed = 1;
  function regional(){ const s = []; for (let r = 0; r < 3; r++) for (let k = 0; k < 10; k++) s.push(r); grid = []; for (let t = 0; t < 10; t++) grid.push([s[t * 3], s[t * 3 + 1], s[t * 3 + 2]]); }
  function cleis(){ grid = []; for (let t = 0; t < 10; t++) grid.push([0, 1, 2]); const r = rng(seed++); grid.forEach(c => { for (let i = 2; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } }); }
  btnRow($('#shMode'), ['按地盘分（老办法）', '克里斯提尼的分法', '再洗一次'], 0, i => { sel = -1; if (i === 0) regional(); else cleis(); if (i === 2) { $$('#shMode button')[2].classList.remove('on'); $$('#shMode button')[1].classList.add('on'); } draw(); });
  svg.addEventListener('click', e => {
    const p = svgPt(svg, e), t = Math.floor((p.x - X0) / CW), r = Math.floor((p.y - Y0) / TH);
    if (t < 0 || t > 9 || r < 0 || r > 2) return;
    const id = t * 3 + r;
    if (sel < 0) sel = id; else { const a = [Math.floor(sel / 3), sel % 3]; [grid[a[0]][a[1]], grid[t][r]] = [grid[t][r], grid[a[0]][a[1]]]; sel = -1; $$('#shMode button').forEach(b => b.classList.remove('on')); }
    draw();
  });
  function draw(){
    let g = '';
    grid.forEach((c, t) => {
      const x = X0 + t * CW;
      g += txt(x + CW / 2 - 2, 22, String(t + 1), {s: 13, c: 'var(--ink-2)', halo: false});
      c.forEach((r, k) => { const id = t * 3 + k; g += '<rect x="' + (x + 2) + '" y="' + (Y0 + k * TH + 2) + '" width="' + (CW - 8) + '" height="' + (TH - 6) + '" rx="5" fill="' + REG[r][1] + '" fill-opacity=".8" stroke="' + (id === sel ? 'var(--ter)' : 'var(--card)') + '" stroke-width="' + (id === sel ? 4 : 1.5) + '"/>' + txt(x + CW / 2 - 2, Y0 + k * TH + 28, REG[r][0], {s: 12, c: 'var(--paper)', halo: false}); });
      const pure = c[0] === c[1] && c[1] === c[2];
      if (pure) g += txt(x + CW / 2 - 2, Y0 + 3 * TH + 18, '一家独大', {s: 11, c: 'var(--red)'});
    });
    svg.innerHTML = g;
    const pure = grid.filter(c => c[0] === c[1] && c[1] === c[2]).length;
    const mixed = grid.filter(c => new Set(c).size === 3).length;
    // 议事会：每个部落 50 席；某派在部落里占多数（≥2 个三一区），就能把这个部落的席位多数拉走
    const ctrl = [0, 0, 0]; grid.forEach(c => { const n = [0, 0, 0]; c.forEach(r => n[r]++); const m = n.indexOf(Math.max(...n)); if (n[m] >= 2) ctrl[m]++; });
    kv($('#shKV'), [['被一个派系包下的部落', pure + ' 个'], ['三种人都有的部落', mixed + ' 个'], ['城区派能控制的部落', ctrl[0] + ' 个'], ['没有哪派过半的部落', (10 - ctrl[0] - ctrl[1] - ctrl[2]) + ' 个']]);
    const s = $('#shSay');
    if (pure >= 3) { s.className = 'say bad'; s.innerHTML = '每个部落差不多就是一个派系。平原的大地主管着城区那三个部落，山里的头领管着内陆那三个，<b>部落团打仗时跟着地方老大走，议事会里也是三派各自抱团</b>。这正是克里斯提尼之前雅典的样子。'; }
    else if (mixed === 10) { s.className = 'say ok'; s.innerHTML = '十个部落，每个都混着城里人、海边人和山里人，<b>没有哪个派系能独占一个部落</b>。想在议事会里拉到多数，就得跨地区去拉人。部落团里，城里的陶匠和山里的牧羊人站在同一排，打完几仗，就成了“自己人”。'; }
    else { s.className = 'say'; s.innerHTML = '你调出了一个“半洗”的雅典：有 ' + pure + ' 个部落还被一个派系包着。克里斯提尼要的是十个部落全都三样齐全，少一个都会给地方老大留下一块地盘。'; }
  }
  regional(); draw();
});
