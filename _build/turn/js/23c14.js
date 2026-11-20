
/* ---------- 装置 15：兵从哪里来 ---------- */
dev('#soldFig', fig => {
  // 四个财产门槛（单位：阿斯）。前三个是古代史料里出现过的数字，年代与含义学界有争论；第四个是马略的“不设门槛”
  const TH = [[11000, '11000 阿斯（李维记的早期门槛）', 'var(--main)'], [4000, '4000 阿斯（波利比乌斯时代）', 'var(--och)'], [1500, '1500 阿斯（更晚的说法）', 'var(--ter)'], [0, '马略：不设门槛', 'var(--grn)']];
  const R = $('#soR'), svg = $('#soSvg');
  $('#soLeg').innerHTML = TH.map(t => '<span><i style="background:' + t[2] + '"></i>' + t[1] + '</span>').join('');
  R.addEventListener('input', go);
  function sim(d){
    const r = rng(133), F = [];
    for (let i = 0; i < 1000; i++) F.push({v: Math.exp(Math.log(9000) + 0.85 * gauss(r)), away: 0});
    const out = [];
    for (let y = -250; y <= -100; y++) {
      F.forEach(f => {
        if (f.away > 0) { f.away--; if (r() < 0.12) f.v *= 0.45; return; }         // 人在海外：地可能荒掉、抵债
        if (f.v > 1500 && r() < d) { f.away = 2 + Math.floor(r() * 5); return; }   // 够格的人才会被征召
        f.v = Math.min(f.v * 1.006, 60000);                                         // 在家种地：慢慢恢复
      });
      // 败落到一定程度，地就被大庄园买走，这户人家进城当穷人
      F.forEach(f => { if (f.v < 600 && f.v > 0 && r() < 0.3) f.v = 0; });
      if (y % 2 === 0 || y === -100) out.push([y, TH.map(t => t[0] ? F.filter(f => f.v >= t[0]).length : 1000)]);
    }
    return out;
  }
  function go(){
    const d = +R.value / 100;
    $('#soO').textContent = '每年 ' + R.value + '% 的人家';
    const out = sim(d);
    lineChart(svg, TH.map((t, i) => ({color: t[2], pts: out.map(p => [p[0], p[1][i]]), w: i === 3 ? 2 : 2.6, dash: i === 3 ? '5 4' : null})),
      {xmin: -250, xmax: -100, ymin: 0, ymax: 1000, xt: [-250, -218, -200, -168, -146, -133, -107], xf: v => '前' + (-v), yt: [0, 250, 500, 750, 1000], yf: v => v + ' 户', marks: [[-218, '汉尼拔'], [-133, '提比略'], [-107, '马略']]});
    const at = y => out.reduce((a, p) => Math.abs(p[0] - y) < Math.abs(a[0] - y) ? p : a)[1];
    const a = at(-250), b = at(-133);
    $('#soSay').className = 'say ' + (b[1] < a[1] * 0.6 ? 'bad' : 'ok');
    $('#soSay').innerHTML = '前 250 年，按 4000 阿斯的门槛，一千户里有 <b>' + a[1] + '</b> 户够格当兵；到前 133 年提比略当保民官时，剩下 <b>' + b[1] + '</b> 户。门槛降到 1500 阿斯，能多找回 ' + (b[2] - b[1]) + ' 户。' +
      (d === 0 ? '<br><small>不打仗，小农就不会成片败落。可罗马几乎年年在打仗。</small>' : b[1] < a[1] * 0.6 ? '<br><small>仗打得越远越久，够格的人家掉得越快，降门槛只是追着跑。马略干脆不要门槛了。</small>' : '<br><small>出征不多的年代，小农还撑得住。</small>');
  }
  go();
});
