
/* ---------- 装置 5：哪一张是真的 ---------- */
dev('#walkFig', fig => {
  const grid = $('#wkGrid6'), say = $('#wkSay2');
  let seed = 20270104, fat = false, pick = -1, shown = false, charts = [];
  function series(r){
    const bars = []; let p = 10;
    for (let i = 0; i < 120; i++) {
      let z = gauss(r);
      if (fat) { const u = r(); z = z / Math.sqrt(Math.max(0.15, -2 * Math.log(u) / 3)); z = clamp(z, -6, 6); }
      const ret = z * 0.018, o = p, c = Math.max(0.5, o * (1 + ret));
      const h = Math.max(o, c) * (1 + Math.abs(gauss(r)) * 0.006), l = Math.min(o, c) * (1 - Math.abs(gauss(r)) * 0.006);
      bars.push({o, h, l, c}); p = c;
    }
    return bars;
  }
  // 粗糙的“形态识别”
  function patterns(b){
    const c = b.map(x => x.c), out = [];
    const ma = (n, i) => { let s = 0; for (let k = i - n + 1; k <= i; k++) s += c[k]; return s / n; };
    let cross = 0; for (let i = 21; i < c.length; i++) if (ma(5, i - 1) < ma(20, i - 1) && ma(5, i) >= ma(20, i)) cross++;
    if (cross) out.push('金叉 ' + cross + ' 次');
    // 双底：两个局部低点相差 3% 以内、间隔 15 天以上
    const lows = []; for (let i = 5; i < c.length - 5; i++) { let m = true; for (let k = i - 5; k <= i + 5; k++) if (c[k] < c[i]) m = false; if (m) lows.push(i); }
    for (let i = 0; i < lows.length; i++) for (let j = i + 1; j < lows.length; j++) if (lows[j] - lows[i] >= 15 && Math.abs(c[lows[j]] / c[lows[i]] - 1) < 0.03) { out.push('双底'); i = j = 1e9; }
    const highs = []; for (let i = 5; i < c.length - 5; i++) { let m = true; for (let k = i - 5; k <= i + 5; k++) if (c[k] > c[i]) m = false; if (m) highs.push(i); }
    for (let i = 0; i + 2 < highs.length; i++) { const a = c[highs[i]], h = c[highs[i + 1]], d = c[highs[i + 2]]; if (h > a * 1.03 && h > d * 1.03 && Math.abs(a / d - 1) < 0.04) { out.push('头肩顶'); break; } }
    let run = 0, best = 0; for (let i = 1; i < c.length; i++) { run = c[i] > c[i - 1] ? run + 1 : 0; best = Math.max(best, run); }
    if (best >= 6) out.push('连涨 ' + best + ' 天');
    return out;
  }
  function make(){
    const r = rng(seed); charts = [];
    for (let k = 0; k < 6; k++) charts.push(series(r));
    pick = -1; shown = false; draw();
    say.textContent = fat ? '现在用的是“肥尾的硬币”：大部分日子很平静，偶尔一天暴涨暴跌。挑一张你觉得最像真股票的。' : '挑一张你觉得最像真股票、最有规律的。';
  }
  function draw(){
    grid.innerHTML = charts.map((b, k) => '<div data-k="' + k + '"' + (k === pick ? ' class="pick"' : '') + '><small>' + String.fromCharCode(65 + k) + '</small><svg></svg><em>' + (shown ? (patterns(b).join(' · ') || '没找到形态') : '') + '</em></div>').join('');
    $$('svg', grid).forEach((s, k) => candles(s, charts[k], {W: 300, H: 150}));
  }
  grid.addEventListener('click', e => { const d = e.target.closest('[data-k]'); if (!d) return; pick = +d.dataset.k; draw(); if (!shown) say.textContent = '你选了 ' + String.fromCharCode(65 + pick) + '。按“揭晓”。'; });
  $('#wkShow').addEventListener('click', () => {
    shown = true; draw();
    const n = charts.reduce((s, b) => s + patterns(b).length, 0);
    say.textContent = '六张全是假的：每一根 K 线都是抛硬币抛出来的，今天和昨天毫无关系。' + (pick >= 0 ? '你选的 ' + String.fromCharCode(65 + pick) + ' 也不例外。' : '') + ' 可是一个很粗糙的程序，在这六张图里一共找到了 ' + n + ' 个“形态”。人的眼睛更厉害，能找到更多。';
  });
  $('#wkNew').addEventListener('click', () => { seed += 7919; make(); });
  $('#wkFat').addEventListener('click', e => { fat = !fat; e.target.textContent = fat ? '换回普通的硬币' : '换成肥尾的硬币'; make(); });
  make();
});
