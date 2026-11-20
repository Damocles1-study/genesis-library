
/* ---------- 装置 7：抽签机 ---------- */
dev('#kleroFig', fig => {
  const C = 10, RW = 15, NW = 5, svg = $('#klSvg'), say = $('#klSay');
  const W = 600, CW = 40, RH = 22, X0 = 56, Y0 = 30;
  const LET = 'ΑΒΓΔΕΖΗΘΙΚ';
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + (Y0 + RW * RH + 16));
  let tgt = [3, 7], res = null, k = 0, timer = 0, n = 0, hit = 0;
  const pickT = () => { tgt = [Math.floor(Math.random() * C), Math.floor(Math.random() * RW)]; };
  function draw(){
    let g = '<rect x="' + (X0 - 12) + '" y="' + (Y0 - 22) + '" width="' + (C * CW + 16) + '" height="' + (RW * RH + 30) + '" rx="6" fill="color-mix(in srgb,var(--ink) 6%,var(--card))" stroke="var(--ink-3)"/>';
    for (let c = 0; c < C; c++) g += txt(X0 + c * CW + CW / 2 - 4, Y0 - 8, LET[c], {s: 12, c: 'var(--ink-3)', halo: false});
    for (let r = 0; r < RW; r++) {
      const st = res && r < k ? res[r] : null;
      for (let c = 0; c < C; c++) {
        const x = X0 + c * CW, y = Y0 + r * RH, isT = c === tgt[0] && r === tgt[1];
        g += '<rect x="' + (x + 3) + '" y="' + (y + 3) + '" width="' + (CW - 14) + '" height="' + (RH - 7) + '" rx="2" fill="' + (st === 1 ? 'var(--och)' : 'var(--card)') + '" fill-opacity="' + (st === 0 ? .25 : 1) + '" stroke="' + (isT ? 'var(--red)' : 'var(--ink-3)') + '" stroke-width="' + (isT ? 2.6 : .8) + '"/>';
      }
      g += txt(X0 - 22, Y0 + r * RH + 15, String(r + 1), {s: 10, c: 'var(--ink-3)', halo: false});
    }
    // 竖管和滚出来的方块
    const tx = X0 + C * CW + 30;
    g += '<rect x="' + (tx - 10) + '" y="' + (Y0 - 18) + '" width="20" height="' + (RW * RH + 14) + '" rx="10" fill="none" stroke="var(--ink-2)" stroke-width="1.5"/>';
    if (res) for (let r = 0; r < RW; r++) {
      const shown = r < k, y = Y0 + r * RH + 3;
      if (shown) g += '<rect x="' + (tx - 7) + '" y="' + y + '" width="14" height="14" fill="' + (res[r] ? 'var(--paper)' : 'var(--ink)') + '" stroke="var(--ink)" stroke-width="1.2"/><line x1="' + (tx - 12) + '" x2="' + (X0 + C * CW - 6) + '" y1="' + (y + 7) + '" y2="' + (y + 7) + '" stroke="' + (res[r] ? 'var(--och)' : 'var(--ink-3)') + '" stroke-dasharray="2 3" stroke-width=".8"/>';
    }
    g += txt(tx + 18, Y0 - 6, '竖管', {s: 11, a: 'start', c: 'var(--ink-3)', halo: false});
    svg.innerHTML = g;
  }
  function run(){
    clearTimeout(timer);
    const a = []; for (let i = 0; i < RW; i++) a.push(i < NW ? 1 : 0);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    res = a; k = 0; say.className = 'say'; say.textContent = '方块一个个滚出来……';
    (function tick(){ k++; draw(); if (k < RW) timer = setTimeout(tick, 160); else done(); })();
  }
  function done(){
    n++; const got = res[tgt[1]] === 1; if (got) hit++;
    const rows = res.map((v, i) => v ? i + 1 : 0).filter(Boolean);
    kv($('#klKV'), [['今天选中的排', rows.join('、')], ['选中的陪审员', NW * C + ' 人'], ['你抽了几次', n + ' 次'], ['红框那人被选中', hit + ' 次']]);
    say.className = got ? 'say bad' : 'say ok';
    say.innerHTML = (got ? '红框里那位今天<b>被选中了</b>。' : '红框里那位今天<b>没被选中</b>，收买他的钱白花了。') + ' 十五排里只有五排会被选中，谁也没法事先知道是哪五排；就算知道了某人会当陪审员，也不知道他会被分到哪个法庭、审哪个案子（那是下一轮抽签的事）。<b>想收买雅典的法庭，你得收买几百个随机的人。</b>';
  }
  $('#klGo').addEventListener('click', run);
  $('#klAgain').addEventListener('click', () => { pickT(); res = null; n = 0; hit = 0; $('#klKV').innerHTML = ''; say.className = 'say'; say.textContent = '换了一个人。再抽几次试试。'; draw(); });
  say.textContent = '点“倒进方块”。'; draw();
});
