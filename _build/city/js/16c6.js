/* ---------- 装置 7：城墙算账 ---------- */
dev('#wallFig', fig => {
  const PRE = [['乌鲁克', 9], ['西安明城墙', 13.7], ['北京内城', 23.5], ['巴黎梯也尔城墙', 33], ['南京明京城', 35.3]];
  const SH = ['圆', '方', '星形棱堡'];
  let sh = 0;
  const L = $('#wallL');
  btnRow($('#wallPre'), PRE.map(p => p[0]), -1, i => { L.value = PRE[i][1]; go(); });
  btnRow($('#wallShape'), SH, 0, i => { sh = i; go(); });
  L.addEventListener('input', go);
  // 单位周长的形状：返回顶点（以中心为原点）
  function shape(k){
    if (k === 0) return [...Array(72)].map((_, i) => [Math.cos(i / 72 * 2 * Math.PI), Math.sin(i / 72 * 2 * Math.PI)]);
    if (k === 1) return [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    const pts = []; for (let i = 0; i < 18; i++) { const a = i / 18 * 2 * Math.PI - Math.PI / 2, r = i % 2 ? 0.74 : 1; pts.push([r * Math.cos(a), r * Math.sin(a)]); } return pts;
  }
  const perim = p => p.reduce((s, q, i) => s + Math.hypot(q[0] - p[(i + 1) % p.length][0], q[1] - p[(i + 1) % p.length][1]), 0);
  const area = p => Math.abs(p.reduce((s, q, i) => s + q[0] * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * q[1], 0)) / 2;
  function go(){
    const len = +L.value; $('#wallLO').textContent = f1(len) + ' 公里';
    const p = shape(sh), k = len / perim(p);               // 缩放到真实周长（公里）
    const A = area(p) * k * k;                             // 平方公里
    const pop = A * 15000, guard = 4 * len * 1000 / 5.03;
    // 画：最大 40 公里的圆当参照
    const maxR = 40 / (2 * Math.PI), sc = 108 / maxR;
    let s = '<circle cx="120" cy="120" r="108" fill="none" stroke="var(--rule)" stroke-dasharray="3 4"/>';
    s += '<polygon points="' + p.map(q => (120 + q[0] * k * sc).toFixed(1) + ',' + (120 + q[1] * k * sc).toFixed(1)).join(' ') + '" fill="var(--och)" fill-opacity=".14" stroke="var(--brk)" stroke-width="3" stroke-linejoin="round"/>';
    s += '<text x="120" y="236" font-size="10" text-anchor="middle" fill="var(--ink-3)">虚线圈：周长 40 公里的圆</text>';
    $('#wallSvg').innerHTML = s;
    kv($('#wallKV'), [['围住的地', f1(A) + ' 平方公里'], ['能住的人（粗算）', fmt(pop)], ['守城要多少人', fmt(guard)], ['守城的人占全城', (guard / pop * 100).toFixed(1) + '%']]);
    const share = guard / pop;
    let t = share > 0.3 ? '城太小了：守城的人要占全城人口的三成以上，几乎人人上墙。小城修墙，是一笔压得人喘不过气的账。'
      : share > 0.1 ? '守城的人要占一成以上。真打起仗来，城里的青壮年差不多都得上墙。'
      : '城大了，墙的账就划算了：墙长一倍，地大四倍，守城的人占比越来越小。这是大城比小城更“安全”的一个原因，也是古代都城越修越大的原因之一。';
    if (sh === 2) t += '<br>星形棱堡同样长的墙，围住的地比圆小一截：尖角是为了消灭射击死角，代价是“浪费”了墙。';
    if (sh === 1) t += '<br>方形比圆形少围一些地，但好丈量、好画方格、好对齐城门和大路，所以中国的城大多是方的。';
    $('#wallT').innerHTML = t + '<br><small style="color:var(--ink-3)">真实的城不是标准的圆和方，人口密度也差得很远，这里只看数量级。</small>';
  }
  go();
});
