
/* ---------- 装置 2：方阵为什么往右偏 ---------- */
dev('#phalanxFig', fig => {
  const svg = $('#phSvg'), R = $('#phR'), say = $('#phSay');
  const W = 600, H = 300, N = 16, RK = 4, SP = 25, X0 = (W - (N - 1) * SP) / 2, T = 90;
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  let t = 0, raf = 0;
  const FEAR = ['不怕死（只在传说里有）', '很勇敢', '勇敢', '还行', '普通人', '普通人', '有点慌', '慌', '很慌', '腿软', '想跑'];
  R.addEventListener('input', () => { $('#phO').textContent = FEAR[+R.value]; if (!raf) { t = 0; draw(); } });
  // 第 i 列（从本军最右端数起，0 是排头兵）在时刻 t 往本军右边挪了多少
  const drift = (i, t) => +R.value * 0.11 * t * (1 + 0.5 * (1 - i / (N - 1)));
  function man(x, y, col, up){
    const s = up ? -1 : 1; // up：面朝上（红军）
    return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6" fill="var(--card)" stroke="' + col + '" stroke-width="1.6"/>' +
      '<path d="M' + (x - 9).toFixed(1) + ',' + (y + s * 6).toFixed(1) + ' q9,' + (s * 6) + ' 18,0" fill="none" stroke="' + col + '" stroke-width="3"/>' +
      '<line x1="' + (x + 4).toFixed(1) + '" x2="' + (x + 4).toFixed(1) + '" y1="' + y.toFixed(1) + '" y2="' + (y + s * 20).toFixed(1) + '" stroke="' + col + '" stroke-width="1"/>';
  }
  function draw(){
    const k = t / T, by = lerp(30, 104, k), ry = lerp(270, 196, k);
    let g = '<line x1="0" x2="' + W + '" y1="150" y2="150" stroke="var(--rule)" stroke-dasharray="3 4"/>';
    // 蓝军面朝下：它的右边在屏幕左边，排头兵是屏幕最左那一列
    const bx = [], rx = [];
    for (let c = 0; c < N; c++) { bx.push(X0 + c * SP - drift(c, t)); rx.push(X0 + c * SP + drift(N - 1 - c, t)); }
    const bMax = Math.max(...bx), bMin = Math.min(...bx), rMax = Math.max(...rx), rMin = Math.min(...rx);
    for (let c = 0; c < N; c++) for (let r = 0; r < RK; r++) {
      const outB = t >= T && bx[c] < rMin - SP / 2, outR = t >= T && rx[c] > bMax + SP / 2;
      g += man(bx[c], by - r * 18, outB ? 'var(--ter)' : 'var(--main)', false);
      g += man(rx[c], ry + r * 18, outR ? 'var(--ter)' : 'var(--red)', true);
    }
    g += txt(16, 22, '蓝军 ↓  它的右边 ←', {s: 12, a: 'start', c: 'var(--main)'}) + txt(W - 16, H - 8, '红军 ↑  它的右边 →', {s: 12, a: 'end', c: 'var(--red)'});
    svg.innerHTML = g;
    if (t >= T) {
      const nb = bx.filter(x => x < rMin - SP / 2).length, nr = rx.filter(x => x > bMax + SP / 2).length;
      if (nb + nr === 0) { say.className = 'say'; say.innerHTML = '两支军队正正地撞在一起，谁也没包抄谁。这种情况在真实战场上很少见，<b>因为没有一支军队真的不怕死</b>。'; }
      else { say.className = 'say bad'; say.innerHTML = '撞上的时候，蓝军的右翼多出了 <b>' + nb + '</b> 列人，红军的右翼多出了 <b>' + nr + '</b> 列人（陶土色）。这些人没有对手，会转过身去砍对方左翼的侧面。结果常常是：<b>两边的右翼各赢一半，两边的左翼各输一半</b>，修昔底德写的曼提尼亚战役，开头就是这么回事。'; }
    }
  }
  function step(){ t++; draw(); if (t < T) raf = requestAnimationFrame(step); else raf = 0; }
  $('#phGo').addEventListener('click', () => { cancelAnimationFrame(raf); t = 0; raf = requestAnimationFrame(step); });
  $('#phReset').addEventListener('click', () => { cancelAnimationFrame(raf); raf = 0; t = 0; draw(); say.className = 'say'; say.textContent = '两支方阵各十六列、四行。蓝色从上往下走，红色从下往上走。注意：蓝军面朝下，它的“右边”是屏幕的左边。'; });
  $('#phO').textContent = FEAR[+R.value];
  draw();
});
