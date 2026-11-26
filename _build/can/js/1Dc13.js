
/* ---------- 细菌生长的示意模型（第十三、十四章共用） ---------- */
/* 返回 t 小时后的 log10(每克细菌数)；T 摄氏度；起点约 10^2.5，上限 10^9 */
function growRate(T){ if (T <= 5 || T >= 50) return 0; const r = Math.LN2 / 0.33 * Math.pow((Math.min(T, 40) - 5) / 35, 2); return T > 40 ? r * (50 - T) / 10 : r; }
function growLog(T, t){
  if (T >= 60) return Math.max(-1, 2.5 - t * 3);
  const r = growRate(T); if (!r) return 2.5;
  const lag = 1.2 / r;
  return Math.min(9, 2.5 + Math.max(0, t - lag) * r / Math.LN10);
}

/* ---------- 装置 14：常温放多久 ---------- */
dev('#growFig', fig => {
  const svg = $('#grSvg'), say = $('#grSay'), btn = $('#grHeat');
  const PL = [['冰箱冷藏室', 4], ['凉快的屋里', 15], ['空调房', 22], ['夏天的屋里', 28], ['车里 / 外卖袋里', 35], ['保温（60 度以上）', 65]];
  let ti = 3, hrs = 8, heated = false;
  const TOX = 5;
  function toxin(T, t){ let a = 0; for (let x = 0; x <= t; x += 0.1) a += Math.max(0, growLog(T, x) - TOX) * 0.1; return a; }
  function draw(){
    const T = PL[ti][1];
    const pts = []; for (let t = 0; t <= 24.001; t += 0.25) pts.push([t, growLog(T, t)]);
    const c = lineChart(svg, [{pts: pts.filter(p => p[0] <= hrs), color: 'var(--red)', w: 2.8}, {pts: pts.filter(p => p[0] >= hrs), color: 'var(--rule)', w: 1.6, dash: '3 3'}], {xmin: 0, xmax: 24, ymin: -1, ymax: 10, xt: [0, 2, 4, 6, 8, 12, 16, 20, 24], xf: v => v + ' 时', yt: [0, 2, 4, 6, 8], yf: v => '10^' + v, H: 250});
    let ex = '<line x1="' + c.L + '" x2="' + (c.W - c.R) + '" y1="' + c.Y(TOX) + '" y2="' + c.Y(TOX) + '" stroke="var(--red)" stroke-dasharray="5 4" opacity=".8"/>' + txt(c.W - c.R - 4, c.Y(TOX) - 5, '超过这里开始积累毒素（示意）', {s: 11, a: 'end', c: 'var(--red)'});
    ex += '<line x1="' + c.X(2) + '" x2="' + c.X(2) + '" y1="' + c.T + '" y2="' + (c.H - c.B) + '" stroke="var(--grn)" stroke-dasharray="3 3"/>' + txt(c.X(2) + 4, c.T + 12, '两小时', {s: 11, a: 'start', c: 'var(--grn)'});
    const now = growLog(T, hrs), tx = toxin(T, hrs);
    const shown = heated ? -1 : now;
    ex += '<circle cx="' + c.X(hrs) + '" cy="' + c.Y(shown) + '" r="6" fill="' + (heated ? 'var(--ter)' : 'var(--red)') + '"/>';
    if (heated) ex += txt(c.X(hrs) + 8, c.Y(-1) - 6, '热透：细菌没了', {s: 11, a: 'start', c: 'var(--ter)', w: 1});
    ex += txt(c.L + 4, c.T + 12, '每克米饭里的细菌（对数刻度）', {s: 11, a: 'start', c: 'var(--ink-3)'});
    const bw = Math.min(140, tx * 18);
    ex += '<rect x="' + (c.W - c.R - 150) + '" y="' + (c.T + 24) + '" width="150" height="14" rx="3" fill="var(--paper)" stroke="var(--rule)"/><rect x="' + (c.W - c.R - 150) + '" y="' + (c.T + 24) + '" width="' + bw + '" height="14" rx="3" fill="var(--main)"/>' + txt(c.W - c.R - 154, c.T + 35, '毒素', {s: 11, a: 'end', c: 'var(--main)'});
    svg.insertAdjacentHTML('beforeend', ex);
    let s = '在' + PL[ti][0] + '（约 ' + T + ' 度）放了 ' + hrs + ' 小时：';
    if (T >= 60) s += '保温在六十度以上，细菌长不起来，反而在减少。所以宴席上的菜要么保持滚烫，要么尽快冷藏，别在中间的温度待着。';
    else if (T <= 5) s += '冷藏室里细菌几乎不长。剩菜就该待在这里，三四天内吃完。';
    else if (tx <= 0) s += '细菌还没长到产毒的程度。' + (hrs > 2 ? '不过已经过了两小时，趁现在放进冰箱。' : '两小时内放进冰箱就好。');
    else s += heated ? '<b>热透以后细菌被杀掉了，可毒素一点没少</b>（右上角那一条）。这就是“热透了还会吐”。' : '细菌已经长过了那条线，毒素在积累。按“热透了再吃”试试。';
    say.innerHTML = s;
    btn.textContent = heated ? '撤销加热' : '热透了再吃';
  }
  btn.addEventListener('click', () => { heated = !heated; draw(); });
  slider('grT', v => { ti = v; heated = false; return PL[v][0] + ' · ' + PL[v][1] + '℃'; }, draw);
  slider('grH', v => { hrs = v; heated = false; return v + ' 小时'; }, draw);
});
