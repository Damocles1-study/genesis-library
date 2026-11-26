
/* ---------- 第十七章：视野距离 ---------- */
dev('#viewFig', () => {
  const sv = $('#viewSvg');
  slider('viewR', v => v + ' 个区块', r => {
    const n = 2 * r + 1, chunks = n * n, blocks = chunks * 16 * 16 * 384;
    const W = 300, c = W / 2, cell = (W - 20) / 65;
    let g = '<rect width="' + W + '" height="' + W + '" fill="var(--paper)"/>';
    const s = cell * n;
    g += '<rect x="' + (c - s / 2) + '" y="' + (c - s / 2) + '" width="' + s + '" height="' + s + '" fill="var(--grass)" fill-opacity=".55"/>';
    if (n <= 33) for (let i = 0; i <= n; i++) { const p = c - s / 2 + i * cell; g += '<line x1="' + p + '" y1="' + (c - s / 2) + '" x2="' + p + '" y2="' + (c + s / 2) + '" stroke="var(--ink-3)" stroke-opacity=".25" stroke-width=".5"/><line y1="' + p + '" x1="' + (c - s / 2) + '" y2="' + p + '" x2="' + (c + s / 2) + '" stroke="var(--ink-3)" stroke-opacity=".25" stroke-width=".5"/>'; }
    g += '<circle cx="' + c + '" cy="' + c + '" r="3.5" fill="var(--zhu)"/>' + txt(c, c - 8, '你', {s: 11, w: true});
    const b = cell * 65; g += '<rect x="' + (c - b / 2) + '" y="' + (c - b / 2) + '" width="' + b + '" height="' + b + '" fill="none" stroke="var(--ink-3)" stroke-dasharray="3 3"/>' + txt(c, 12, '最远能调到 32 个区块', {s: 10, c: 'var(--ink-3)'});
    sv.setAttribute('viewBox', '0 0 ' + W + ' ' + W); sv.innerHTML = g;
    kv($('#viewKv'), [['往四周能看多远', '约 ' + r * 16 + ' 米'], ['电脑要准备的区块', chunks.toLocaleString() + ' 个'], ['里面的方块格子', '约 ' + fmt(blocks) + ' 个']]);
    $('#viewSay').textContent = r <= 6 ? '视野比较近，远处会有一圈雾，可是电脑轻松得多。小格那台 8 GB 的 MacBook Air，可以先从这里开始试。' :
      r <= 12 ? '这是很多电脑的默认范围。如果游戏一卡一卡的，先把这个数调小。' : '视野很远，风景好看，可是电脑要同时准备' + chunks + '个区块，没有风扇的 MacBook Air 很快就会发烫、变慢。';
  });
});
