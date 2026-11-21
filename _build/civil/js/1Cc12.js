
/* ---------- 装置 13：流水的部长，铁打的秘书 ---------- */
dev('#tenFig', fig => {
  const svg = $('#tenSvg'), say = $('#tenSay');
  const Y0 = 1980, Y1 = 2020, W = 600, L = 70, R = 10;
  const X = y => L + (y - Y0) / (Y1 - Y0) * (W - L - R);
  let rows, seed = 5, pick = 2000;
  const SUR = '史布克罗韦哈特莫兰贝克福克斯格林伍兹霍尔肯特里德'.split('');
  function gen(){
    const r = rng(seed++);
    const seq = (mean, sd, minL) => { const out = []; let y = Y0 - r() * mean; while (y < Y1) { const len = Math.max(minL, mean + (r() - 0.5) * 2 * sd); out.push([y, y + len, SUR[Math.floor(r() * SUR.length)] + SUR[Math.floor(r() * SUR.length)]]); y += len; } return out; };
    rows = [{n: '部长', c: 'var(--zhu)', s: seq(2.1, 1.5, 0.4)}, {n: '常任秘书', c: 'var(--main)', s: seq(4.6, 1.8, 2)}, {n: '一位文官', c: 'var(--kraft)', s: [[1982, 2017, '何']]}];
    draw();
  }
  function draw(){
    let g = '';
    [1980, 1990, 2000, 2010, 2020].forEach(y => g += '<line x1="' + X(y) + '" x2="' + X(y) + '" y1="10" y2="150" stroke="var(--rule)" stroke-dasharray="2 3"/>' + txt(X(y), 166, y, {s: 11, c: 'var(--ink-3)', halo: false}));
    rows.forEach((row, i) => {
      const y = 18 + i * 44;
      g += txt(L - 8, y + 18, row.n, {s: 12.5, a: 'end', c: 'var(--ink-2)', halo: false});
      row.s.forEach((p, k) => { const a = Math.max(Y0, p[0]), b = Math.min(Y1, p[1]); if (b <= a) return; g += '<rect x="' + X(a).toFixed(1) + '" y="' + y + '" width="' + Math.max(1.5, X(b) - X(a) - 1.5).toFixed(1) + '" height="26" rx="3" fill="' + row.c + '" opacity="' + (k % 2 ? 0.55 : 0.85) + '"/>'; });
    });
    g += '<line x1="' + X(pick) + '" x2="' + X(pick) + '" y1="6" y2="152" stroke="var(--ink)" stroke-width="1.6"/>';
    g += '<rect x="' + L + '" y="0" width="' + (W - L - R) + '" height="172" fill="transparent" id="tenHit" style="cursor:pointer"/>';
    svg.setAttribute('viewBox', '0 0 ' + W + ' 176'); svg.innerHTML = g;
    const cnt = i => rows[i].s.filter(p => p[1] > Y0 && p[0] < Y1).length;
    const cur = i => rows[i].s.find(p => p[0] <= pick && p[1] > pick);
    const m = cur(0), ps = cur(1);
    const ym = m ? (pick - Math.max(Y0, m[0])).toFixed(1) : 0, yp = ps ? (pick - ps[0]).toFixed(1) : 0, yc = pick >= 1982 && pick < 2017 ? pick - 1982 : null;
    say.innerHTML = '这个部门四十年里换了 <b>' + cnt(0) + '</b> 位部长、<b>' + cnt(1) + '</b> 位常任秘书，那位普通文官只有一个。<br>' + Math.round(pick) + ' 年：现任部长来了 ' + ym + ' 年，常任秘书在位 ' + yp + ' 年' + (yc !== null ? '，那位文官已经在这里干了 <b>' + Math.round(yc) + '</b> 年。新部长想知道“上次这个办法为什么没成”，他只能去问后两个人。' : '，那位文官还没入职或已经退休了。');
    $('#tenHit').addEventListener('click', e => { const p = svgPt(svg, e); pick = clamp(Y0 + (p.x - L) / (W - L - R) * (Y1 - Y0), Y0, Y1 - 0.01); draw(); });
  }
  $('#tenNew').addEventListener('click', gen);
  gen();
});
