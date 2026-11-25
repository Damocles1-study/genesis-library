/* ---------- 装置 22：大楼里的摆 ---------- */
dev('#tmdFig', () => {
  const Z1 = 0.01;
  /* 复数 */
  const C = (re, im) => ({re, im});
  const add = (a, b) => C(a.re + b.re, a.im + b.im), sub = (a, b) => C(a.re - b.re, a.im - b.im);
  const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const div = (a, b) => { const d = b.re * b.re + b.im * b.im; return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
  const abs = a => Math.hypot(a.re, a.im);
  const Mu = slider('tmdM', v => v.toFixed(1) + '%', () => draw());
  const Fq = slider('tmdF', v => v.toFixed(3), () => draw());
  $('#tmdBtns').innerHTML = '<button class="btn" data-a="opt">调到最优节奏</button><button class="btn" data-a="none">去掉摆</button><button class="btn" data-a="off">节奏调歪</button>';
  $('#tmdBtns').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const m = $('#tmdM'), f = $('#tmdF');
    if (b.dataset.a === 'none') m.value = 0;
    if (b.dataset.a === 'opt') { if (+m.value === 0) m.value = 1.5; f.value = (1 / (1 + m.value / 100)).toFixed(3); }
    if (b.dataset.a === 'off') { if (+m.value === 0) m.value = 1.5; f.value = 1.12; }
    m.dispatchEvent(new Event('input')); f.dispatchEvent(new Event('input'));
  });
  function resp(r, mu, f){
    if (mu <= 0) return {x1: 1 / abs(C(1 - r * r, 2 * Z1 * r)), rel: 0};
    const za = Math.sqrt(3 * mu / (8 * Math.pow(1 + mu, 3)));
    const Z = C(mu * f * f, 2 * mu * f * za * r);
    const den2 = sub(Z, C(mu * r * r, 0));
    const D = sub(add(C(1 - r * r, 2 * Z1 * r), Z), div(mul(Z, Z), den2));
    const X1 = div(C(1, 0), D), X2 = div(mul(Z, X1), den2);
    return {x1: abs(X1), rel: abs(sub(X2, X1))};
  }
  function draw(){
    const mu = Mu() / 100, f = Fq();
    const rs = []; for (let r = 0.7; r <= 1.3001; r += 0.002) rs.push(r);
    const base = rs.map(r => [r, resp(r, 0, 1).x1]);
    const tm = rs.map(r => resp(r, mu, f));
    const pk0 = Math.max(...base.map(p => p[1]));
    let pk = 0, pr = 0, rel = 0; tm.forEach((v, i) => { if (v.x1 > pk) { pk = v.x1; pr = rs[i]; rel = v.rel; } });
    const ser = [{name: '没有摆', color: 'var(--ink-3)', pts: base, w: 1.8, dash: '4 3'}];
    if (mu > 0) ser.push({name: '挂了摆', color: 'var(--ter)', pts: rs.map((r, i) => [r, tm[i].x1]), w: 2.8});
    lineChart($('#tmdSvg'), ser, {xmin: 0.7, xmax: 1.3, ymin: 0, ymax: 55, xt: [0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3], xf: v => v === 1 ? '对上了' : v.toFixed(1), yt: [0, 10, 20, 30, 40, 50], yf: v => v + '×', H: 240});
    const red = mu > 0 ? (1 - pk / pk0) * 100 : 0;
    kv($('#tmdKv'), [['没有摆的最大放大', Math.round(pk0) + ' 倍'], ['现在的最大放大', Math.round(mu > 0 ? pk : pk0) + ' 倍'], ['晃动减少', Math.round(red) + '%'], ['摆自己荡的幅度', mu > 0 ? '楼的 ' + (rel / pk).toFixed(1) + ' 倍' : '—']]);
    const fo = 1 / (1 + mu), s = $('#tmdSay');
    s.className = 'say' + (red > 75 ? ' ok' : mu > 0 && red < 40 ? ' bad' : '');
    s.innerHTML = mu === 0 ? '没有阻尼器的楼，自身阻尼很小，风推的节奏一旦和它晃的节奏对上，晃动会被放大五十倍左右。<b>高楼不怕一阵大风，怕的是一阵一阵、节奏刚好对上的风</b>。' :
      Math.abs(f - fo) > 0.04 ? '摆的节奏没调准，尖峰只是挪了个地方，没压下去多少。<b>“调谐”两个字是关键</b>：摆要和大楼合拍，才能在大楼想往左的时候把它往右拽。试试“调到最优节奏”。' :
      '一个只占振型质量 ' + Mu().toFixed(1) + '% 的摆，把最大晃动压掉了 ' + Math.round(red) + '%，原来的一个尖峰变成了两个矮得多的小峰。代价是摆自己要荡得比楼厉害好几倍，所以台北 101 的钢球旁边留着很大的空间，还装了限位的缓冲器。' + (mu > 0.03 ? '摆越重效果越好，但楼要专门为它多扛几百上千吨。' : '');
  }
  draw();
});
