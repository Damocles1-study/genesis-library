
/* ---------- 装置 13：百人队大会怎样投票 ---------- */
dev('#centFig', fig => {
  // 投票顺序：骑兵 18、第一等级 80（富人）；第二、三等级各 20（中等）；第四 20、第五 30、工匠号手 4、无产者 1（穷人）
  const G = [['骑兵', 18, 0], ['第一等级', 80, 0], ['第二等级', 20, 1], ['第三等级', 20, 1], ['第四等级', 20, 2], ['第五等级', 30, 2], ['工匠与号手', 4, 2], ['无产者（只登记人头）', 1, 2]];
  const HEAD = [0.10, 0.15, 0.75]; // 三拨人占公民人数的比例（示意）
  const C = []; G.forEach(g => { for (let i = 0; i < g[1]; i++) C.push({g: g[2], nm: g[0]}); });
  const grid = $('#ceGrid');
  grid.innerHTML = C.map((c, i) => '<span title="' + c.nm + ' · 第 ' + (i + 1) + ' 个百人队"></span>').join('');
  const cells = $$('span', grid);
  const S = ['#ceA', '#ceB', '#ceC'].map(s => $(s));
  S.forEach(s => s.addEventListener('input', go));
  function go(){
    const p = S.map(s => +s.value / 100);
    ['#ceAo', '#ceBo', '#ceCo'].forEach((o, i) => $(o).textContent = Math.round(p[i] * 100) + '%');
    const r = rng(193); let yes = 0, no = 0, stop = -1;
    C.forEach((c, i) => {
      const v = p[c.g] + gauss(r) * 0.06;            // 每个百人队里的赞成比例，围绕本等级上下浮动
      c.vote = v > 0.5 ? 1 : v < 0.5 ? 0 : (r() < .5 ? 1 : 0);
    });
    for (let i = 0; i < C.length; i++) { if (C[i].vote) yes++; else no++; if (yes >= 97 || no >= 97) { stop = i; break; } }
    cells.forEach((el, i) => { el.style.background = i <= stop ? (C[i].vote ? 'var(--ter)' : 'var(--main)') : 'var(--paper)'; el.style.borderColor = C[i].g === 0 ? 'var(--ink-3)' : 'var(--rule)'; });
    const pass = yes >= 97, voted = stop + 1;
    const head = HEAD[0] * p[0] + HEAD[1] * p[1] + HEAD[2] * p[2];
    const last = C[stop];
    kv($('#ceKV'), [['赞成 : 反对', yes + ' : ' + no], ['投了票的百人队', voted + ' / 193'], ['最后投票的是', last ? last.nm : '—'], ['一人一票的话', Math.round(head * 100) + '% 赞成']]);
    const poorVoted = C.slice(0, voted).some(c => c.g === 2);
    const say = $('#ceSay');
    say.className = 'say ' + ((head > .5) === pass ? 'ok' : 'bad');
    say.innerHTML = '<b>' + (pass ? '提案通过：开战。' : '提案否决：不打。') + '</b>' +
      (poorVoted ? '这一回，投票一直轮到了穷人那里。' : '<b>穷人一票也没投</b>，结果在他们之前就定了。') +
      ((head > .5) === pass ? '按人头算，结果也一样。' : '可要是按人头一人一票，结果正好<b>反过来</b>。') +
      '<br><small>富人约占公民的十分之一（示意），却握着 98 个百人队，一家就够过半。</small>';
  }
  go();
});
