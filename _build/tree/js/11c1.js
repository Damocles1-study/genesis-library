/* ---------- 第一章：猜数字；五种做法比一比 ---------- */
dev('#guessFig', fig => {
  const inp = $('#gsIn'), bar = $('#gsBar'), say = $('.say', fig);
  const r = rng(Date.now() % 100000);
  let secret, lo, hi, tries;
  function reset(){ secret = 1 + Math.floor(r() * 100); lo = 1; hi = 100; tries = []; draw(); say.textContent = '我想好了。猜吧！'; inp.value = ''; }
  function draw(mark){
    let h = '';
    for (let v = 1; v <= 100; v++) {
      const out = v < lo || v > hi;
      h += '<span class="' + (out ? 'dim' : '') + (mark === v ? ' hl' : '') + '" style="min-width:1.9em;font-size:11px;padding:1px 2px">' + v + '</span>';
    }
    bar.innerHTML = h;
  }
  function guess(v){
    if (!(v >= 1 && v <= 100)) { say.textContent = '请猜 1 到 100 之间的整数。'; return; }
    tries.push(v);
    if (v === secret) { draw(v); say.textContent = '对了！就是 ' + v + '。你猜了 ' + tries.length + ' 次。' + (tries.length <= 7 ? '不超过 7 次，很好！' : '每次猜“还剩下的那段”的中间，最多 7 次。'); return; }
    if (v > secret) hi = Math.min(hi, v - 1); else lo = Math.max(lo, v + 1);
    draw(v);
    say.textContent = (v > secret ? '大了。' : '小了。') + '已经猜了 ' + tries.length + ' 次。还剩 ' + lo + ' 到 ' + hi + '，一共 ' + (hi - lo + 1) + ' 个数。中间那个是 ' + Math.floor((lo + hi) / 2) + '。';
  }
  $('[data-x="go"]', fig).addEventListener('click', () => guess(+inp.value));
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') guess(+inp.value); });
  $('[data-x="new"]', fig).addEventListener('click', reset);
  $('[data-x="half"]', fig).addEventListener('click', () => {
    let a = 1, b = 100; const seq = [];
    while (true) { const m = Math.floor((a + b) / 2); seq.push(m + '（剩 ' + (b - a + 1) + ' 个）'); if (m === secret) break; if (m > secret) b = m - 1; else a = m + 1; }
    say.textContent = '答案是 ' + secret + '。对半猜：' + seq.join(' → ') + '。一共 ' + seq.length + ' 次。';
  });
  reset();
});
dev('#growFig', fig => {
  const box = $('.growbars', fig), say = $('.say', fig);
  const NS = []; for (let k = 0; k <= 60; k++) NS.push(Math.round(Math.pow(10, k / 10)));
  const fmt = v => v < 1e4 ? String(Math.round(v)) : v < 1e8 ? (v / 1e4).toFixed(v < 1e5 ? 1 : 0) + ' 万' : v < 1e12 ? (v / 1e8).toFixed(v < 1e9 ? 1 : 0) + ' 亿' : v < 1e16 ? (v / 1e12).toFixed(v < 1e13 ? 1 : 0) + ' 万亿' : '约 10 的 ' + Math.floor(Math.log10(v)) + ' 次方';
  const time = v => { const s = v / 1e8; if (s < 1e-3) return '不到 1 毫秒'; if (s < 1) return Math.round(s * 1000) + ' 毫秒'; if (s < 60) return s.toFixed(1) + ' 秒'; if (s < 3600) return (s / 60).toFixed(1) + ' 分钟'; if (s < 86400) return (s / 3600).toFixed(1) + ' 小时'; if (s < 86400 * 365) return (s / 86400).toFixed(1) + ' 天'; const y = s / 86400 / 365; return y < 1e4 ? y.toFixed(0) + ' 年' : '比人类的历史还长'; };
  const F = [['常数 · 看一眼', n => 1], ['对数 · 对半猜', n => Math.max(1, Math.ceil(Math.log2(n + 1)))], ['线性 · 一个一个看', n => n], ['n log n · 好的排序', n => n * Math.max(1, Math.log2(n))], ['平方 · 两两握手', n => n * n], ['指数 · 每样选或不选', n => Math.pow(2, Math.min(n, 1100))]];
  slider('grN', k => NS[k].toLocaleString('en-US'), k => {
    const n = NS[k];
    box.innerHTML = F.map(([name, f]) => { const v = f(n); const L = Math.min(100, (Math.log10(Math.max(1, v)) / 16) * 100); return '<div class="gb"><span class="gn">' + name + '</span><span class="gt"><i style="width:' + Math.max(1, L) + '%"></i></span><span class="gv">' + fmt(v) + ' 步 · ' + time(v) + '</span></div>'; }).join('');
    say.textContent = n <= 30 ? 'n 很小的时候，大家都很快。往右拖。' : n <= 2000 ? '平方开始慢下来了，指数已经不能用了。' : '对数几乎不动，线性还行，平方要等很久。';
  });
});
