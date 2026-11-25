/* ---------- 装置 10：阿姆达尔的账 ---------- */
dev('#amdFig', fig => {
  const rowsBox = $('#amdRows'), svg = $('#amdSvg'), kvb = $('#amdKv'), say = $('#amdSay');
  // [名字, 原来的小时, AI 默认快几倍, 最大倍数]
  const T = [['弄清店主要什么', 6, 1, 3], ['设计页面', 6, 3, 10], ['写代码', 30, 5, 20], ['测试和改错', 10, 2, 10], ['上线、接支付、资质', 8, 1, 3], ['找到愿意付钱的店', 12, 1, 3], ['教店主用、售后、催款', 10, 1.2, 3]];
  rowsBox.innerHTML = T.map((t, i) => '<div class="ctl"><span>' + t[0] + '<br><small style="color:var(--ink-3)">原来 ' + t[1] + ' 小时</small></span><input type="range" id="am' + i + '" min="1" max="' + t[3] + '" step="0.5" value="' + t[2] + '"><output id="am' + i + 'O"></output></div>').join('');
  const sp = T.map(t => t[2]); let ready = false;
  function draw(){
    if (!ready) return;
    const before = T.reduce((a, t) => a + t[1], 0);
    const after = T.map((t, i) => t[1] / sp[i]);
    const tot = after.reduce((a, b) => a + b, 0);
    const W = 600, rowH = 26, L = 150, H = T.length * rowH + 30, max = Math.max(...T.map(t => t[1]));
    const X = v => L + v / max * (W - L - 50);
    let g = '';
    T.forEach((t, i) => {
      const y = 8 + i * rowH;
      g += txt(L - 8, y + 15, t[0], {s: 12, a: 'end', c: 'var(--ink-2)', halo: false});
      g += '<rect x="' + L + '" y="' + (y + 3) + '" width="' + (X(t[1]) - L).toFixed(1) + '" height="16" fill="var(--rule)"/>';
      g += '<rect x="' + L + '" y="' + (y + 3) + '" width="' + Math.max(1, X(after[i]) - L).toFixed(1) + '" height="16" fill="' + (sp[i] <= 1.2 ? 'var(--main)' : 'var(--ter)') + '"/>';
      g += txt(X(t[1]) + 4, y + 16, after[i].toFixed(1) + 'h', {s: 11, a: 'start', c: 'var(--ink-2)', halo: false});
    });
    g += txt(L, H - 6, '灰色：原来的小时　青色：AI 加速后　红色：几乎没被加速', {s: 11, a: 'start', c: 'var(--ink-3)', halo: false});
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    // 卡脖子的一截
    let k = 0; after.forEach((v, i) => { if (v > after[k]) k = i; });
    const slow = T.reduce((a, t, i) => a + (sp[i] <= 1.2 ? after[i] : 0), 0);
    const limit = before / slow;
    kv(kvb, [['原来一共', before + ' 小时'], ['用 AI 以后', tot.toFixed(1) + ' 小时'], ['整体快了', (before / tot).toFixed(2) + ' 倍'], ['最慢的一截', T[k][0]], ['就算 AI 无限快', isFinite(limit) ? '最多 ' + limit.toFixed(1) + ' 倍' : '—']]);
    say.textContent = '写代码快了 ' + sp[2] + ' 倍，整件事只快了 ' + (before / tot).toFixed(1) + ' 倍。现在最费时间的是“' + T[k][0] + '”，花了 ' + after[k].toFixed(1) + ' 小时。' + (isFinite(limit) ? '只要那几截见人、等人、担责任的活还是原样，就算能加速的部分快到无穷，整件事也最多快 ' + limit.toFixed(1) + ' 倍。这就是阿姆达尔定律。' : '');
  }
  T.forEach((t, i) => slider('am' + i, v => { sp[i] = v; return v <= 1 ? '帮不上' : '快 ' + v + ' 倍'; }, () => { if (ready) draw(); }));
  ready = true; draw();
});
