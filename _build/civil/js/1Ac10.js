
/* ---------- 装置 11：不领工资的见习 ---------- */
dev('#unpFig', fig => {
  const svg = $('#unpSvg'), Y = $('#unpY');
  const r = rng(1770);
  // 家境：对数正态，换算成能供养的年数
  const P = Array.from({length: 1000}, () => { const z = Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r()); return {w: Math.exp(z * 0.9), y: r(), exam: r(), q: r()}; });
  P.sort((a, b) => a.w - b.w);
  P.forEach((p, i) => { p.rank = i / 999; p.support = 1.2 * Math.log(1 + p.w * 3) * 3 + p.q * 1.5; });
  function draw(){
    const yrs = +Y.value;
    $('#unpYO').textContent = yrs + ' 年';
    const W = 600, H = 220, L = 20, B = 26;
    let g = '', fin = 0, finPoor = 0, drop = 0, fail = 0;
    P.forEach(p => {
      // 考试：三次，每次刷掉约 25%
      const passExam = p.exam > 0.58;
      const canWait = p.support >= yrs;
      let col, op = 0.85;
      if (!canWait) { col = 'var(--ink-3)'; op = 0.25; drop++; }
      else if (!passExam) { col = 'var(--kraft)'; op = 0.45; fail++; }
      else { col = 'var(--zhu)'; fin++; if (p.rank < 0.5) finPoor++; }
      g += '<circle cx="' + (L + p.rank * (W - L * 2)).toFixed(1) + '" cy="' + (8 + p.y * (H - B - 14)).toFixed(1) + '" r="2.6" fill="' + col + '" opacity="' + op + '"/>';
    });
    g += '<line x1="' + L + '" x2="' + (W - L) + '" y1="' + (H - B + 2) + '" y2="' + (H - B + 2) + '" stroke="var(--ink)"/>' + txt(L, H - 6, '← 穷', {s: 12, a: 'start', c: 'var(--ink-2)', halo: false}) + txt(W - L, H - 6, '富 →', {s: 12, a: 'end', c: 'var(--ink-2)', halo: false}) + txt(W / 2, H - 6, '家境（按排名）', {s: 11, c: 'var(--ink-3)', halo: false});
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    kv($('#unpKv'), [['熬不住退出', drop + ' 人'], ['考试没过', fail + ' 人'], ['成为官员', fin + ' 人'], ['其中家境在下半', fin ? Math.round(finPoor / fin * 100) + '%' : '—']]);
    const s = $('#unpSay'), share = fin ? finPoor / fin : 0;
    s.className = 'say ' + (share < 0.25 ? 'bad' : 'ok');
    s.innerHTML = yrs === 0 ? '见习期有工资：考试一视同仁，最后的官员里穷富各占一半左右，<b>和考生本身的分布一样</b>。' :
      share < 0.1 ? '考试一点没变，可最后的官员几乎全是富家子弟（红点都挤在右边）。<b>门槛不写在考卷上，写在“谁供得起”上</b>。' :
      '无薪的年数越长，左边掉队的灰点越多。考试没有偏袒任何人，筛掉穷人的是时间。';
  }
  Y.addEventListener('input', draw); draw();
});
