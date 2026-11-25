/* ---------- 装置 5：一百家公司里赚钱的是谁 ---------- */
dev('#vcFig', fig => {
  const svg = $('#vcSvg'), kvb = $('#vcKv'), say = $('#vcSay');
  let seed = 11;
  function outcome(r){
    const u = r();
    if (u < 0.5) return 0;                               // 归零
    if (u < 0.8) return 0.2 + r() * 2.3;                  // 拿回零点几倍到两三倍
    if (u < 0.94) return 3 + r() * 7;                     // 三到十倍
    return 10 * Math.pow(1 - r(), -1 / 1.15);             // 幂律尾巴：十倍以上
  }
  function run(){
    const r = rng(seed++);
    const xs = []; for (let i = 0; i < 100; i++) xs.push(Math.min(outcome(r), 400));
    xs.sort((a, b) => b - a);
    const total = xs.reduce((a, b) => a + b, 0);
    const top5 = xs.slice(0, 5).reduce((a, b) => a + b, 0);
    const zero = xs.filter(x => x === 0).length, lose = xs.filter(x => x < 1).length;
    // 画柱：对数高度
    const W = 600, H = 220, L = 40, B = 26, T = 10, bw = (W - L - 10) / 100;
    const Y = v => T + (1 - Math.log10(1 + v) / Math.log10(401)) * (H - T - B);
    let g = '';
    [0, 1, 10, 100].forEach(v => { g += '<line x1="' + L + '" x2="' + (W - 10) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--rule)"/>' + txt(L - 5, Y(v) + 4, v + '×', {s: 11, a: 'end', c: 'var(--ink-3)', halo: false}); });
    xs.forEach((v, i) => { const y = Y(v); g += '<rect x="' + (L + i * bw + .5).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(1, bw - 1).toFixed(1) + '" height="' + Math.max(0.5, Y(0) - y).toFixed(1) + '" fill="' + (v === 0 ? 'var(--ink-3)' : v < 1 ? 'var(--och)' : i < 5 ? 'var(--main)' : 'var(--ter)') + '"/>'; });
    g += '<line x1="' + L + '" x2="' + (W - 10) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="var(--ink)" stroke-width="1.2"/>';
    g += txt(L + 2.5 * bw, H - 8, '前五家', {s: 11, c: 'var(--main)', halo: false}) + txt(W - 60, H - 8, '归零的', {s: 11, c: 'var(--ink-3)', halo: false});
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const mult = total / 100;
    kv(kvb, [['基金拿回', mult.toFixed(2) + ' 倍'], ['前五家贡献', Math.round(top5 / total * 100) + '%'], ['归零的公司', zero + ' 家'], ['没拿回本钱的', lose + ' 家']]);
    say.innerHTML = (mult >= 1 ? '这一次，基金整体拿回了 ' + mult.toFixed(1) + ' 倍，而其中 ' + Math.round(top5 / total * 100) + '% 来自最赚钱的五家。' : '这一次运气不好，基金整体没回本：最大的赢家不够大。') +
      ' 换到创始人的位置上：你只是这一百根柱子里的一根，<b>有 ' + lose + '% 的可能落在没拿回本钱的那一堆里，' + zero + '% 的可能归零</b>。基金可以再投一百家，你不能。';
  }
  $('#vcGo').addEventListener('click', run);
  run();
});
