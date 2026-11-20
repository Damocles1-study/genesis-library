
/* 正态随机数（第二部的几个模拟会用到） */
function gauss(r){ let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
/* 直方图：vals 数组 → svg；opt = {lo, hi, bins, mark, markLabel, xf} */
function hist(svg, vals, opt){
  const W = 600, H = 220, L = 14, R = 14, T = 14, B = 30, n = opt.bins || 30;
  const cnt = new Array(n).fill(0), w = (opt.hi - opt.lo) / n;
  vals.forEach(v => { const k = Math.floor((v - opt.lo) / w); cnt[clamp(k, 0, n - 1)]++; });
  const mx = Math.max(...cnt, 1), X = x => L + (x - opt.lo) / (opt.hi - opt.lo) * (W - L - R);
  let g = '';
  cnt.forEach((c, i) => {
    const x0 = opt.lo + i * w, h = c / mx * (H - T - B);
    g += '<rect x="' + (X(x0) + 1).toFixed(1) + '" y="' + (H - B - h).toFixed(1) + '" width="' + (X(x0 + w) - X(x0) - 2).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + (opt.mark != null && x0 >= opt.mark ? 'var(--ter)' : 'var(--main)') + '" opacity=".85"/>';
  });
  g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '" stroke="var(--ink)" stroke-width="1.2"/>';
  (opt.xt || []).forEach(v => g += txt(X(v), H - 10, opt.xf ? opt.xf(v) : v, {s: 11, c: 'var(--ink-3)', halo: false}));
  if (opt.mark != null) g += '<line x1="' + X(opt.mark) + '" x2="' + X(opt.mark) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--ter)" stroke-width="2" stroke-dasharray="4 3"/>' + txt(X(opt.mark) - 4, T + 12, opt.markLabel || '', {s: 12, a: 'end', c: 'var(--ter)'});
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
}

/* ---------- 装置 12：七个王，够不够二百四十四年 ---------- */
dev('#kingFig', fig => {
  const REF = [['明朝 · 约 17 年', 17], ['英格兰 1066 年以来 · 约 23 年', 23], ['法国卡佩直系 · 约 23 年', 23], ['罗马传说 · 约 35 年', 35]];
  const TRAD = [['罗慕路斯', 37], ['努马', 43], ['图卢斯', 31], ['安库斯', 24], ['老塔克文', 38], ['塞尔维乌斯', 44], ['高傲者塔克文', 25]];
  const R = $('#kgR'), svg = $('#kgSvg');
  $('#kgBars').innerHTML = TRAD.map(t => '<div class="row"><span class="nm">' + t[0] + '</span><span class="tr"><i style="width:' + (t[1] / 50 * 100) + '%;background:var(--ink-3)"></i></span><span class="v">' + t[1] + ' 年</span></div>').join('') +
    '<div class="row"><span class="nm"><b>合计</b><small>传统年份</small></span><span class="tr"></span><span class="v">≈ 244 年</span></div>';
  btnRow($('#kgBtns'), REF.map(r => r[0]), 1, i => { R.value = REF[i][1]; go(); });
  R.addEventListener('input', go);
  function go(){
    const m = +R.value, r = rng(753), S = [];
    $('#kgO').textContent = '每王 ' + m + ' 年';
    // 每个王的在位年数取对数正态分布，离散程度和真实王朝差不多（变异系数约 0.75）
    const sg = 0.68, mu = Math.log(m) - sg * sg / 2;
    for (let k = 0; k < 1000; k++) { let s = 0; for (let j = 0; j < 7; j++) s += Math.exp(mu + sg * gauss(r)); S.push(s); }
    const hit = S.filter(s => s >= 244).length;
    hist(svg, S, {lo: 0, hi: 480, bins: 32, mark: 244, markLabel: '244 年', xt: [0, 100, 200, 300, 400], xf: v => v + ' 年'});
    const p = hit / 10;
    $('#kgSay').className = 'say ' + (p < 10 ? 'bad' : 'ok');
    $('#kgSay').innerHTML = '一千个随机的七代王朝里，有 <b>' + hit + '</b> 个撑过了 244 年（约 ' + (p < 1 && hit ? '不到 1' : Math.round(p)) + '%）。七个王加起来平均约 ' + Math.round(7 * m) + ' 年。' +
      (m <= 24 ? '<br><small>按真实王朝的节奏，罗马的传统年表很难凑齐。何况传说里七个王有五个不得善终。</small>' : m >= 33 ? '<br><small>要每个王都在位三十多年才凑得上。这在真实的王朝里极少见。</small>' : '');
  }
  go();
});
