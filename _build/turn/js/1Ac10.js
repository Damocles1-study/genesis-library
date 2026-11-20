
/* ---------- 装置 11：埃拉托色尼量地球 ---------- */
dev('#eraFig', fig => {
  const ST = [['埃及斯塔迪昂（约 157.5 米）', 157.5], ['阿提卡斯塔迪昂（约 185 米）', 185]];
  let si = 0;
  btnRow($('#erS'), ST.map(s => s[0]), 0, i => { si = i; go(); });
  const A = $('#erA'), D = $('#erD'), svg = $('#erSvg');
  [A, D].forEach(e => e.addEventListener('input', go));
  svg.setAttribute('viewBox', '0 0 600 300');
  function go(){
    const ang = +A.value / 10, dist = +D.value, circ = dist * 360 / ang, km = circ * ST[si][1] / 1000, real = 40008;
    $('#erAO').textContent = ang.toFixed(1) + '°（' + (ang / 360 * 100).toFixed(2) + '% 圈）';
    $('#erDO').textContent = dist.toLocaleString() + ' 斯塔迪昂';
    // 画：地球圆心 (360,170)，半径 120；赛伊尼在正左（太阳直射），亚历山大里亚在其上方 ang 度（放大 3 倍方便看）
    const cx = 420, cy = 160, r = 132, show = ang * 3 * Math.PI / 180;
    const sy = [cx - r, cy], al = [cx - r * Math.cos(show), cy - r * Math.sin(show)];
    let g = '';
    for (let y = 40; y <= 280; y += 30) g += '<line x1="10" x2="' + (cx - Math.sqrt(Math.max(0, r * r - (y - cy) * (y - cy))) - 2) + '" y1="' + y + '" y2="' + y + '" stroke="var(--och)" stroke-width="1.2" stroke-dasharray="6 4"/>';
    g += txt(40, 26, '太阳光（平行）→', {s: 15, a: 'start', c: 'var(--och)'});
    g += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="var(--sea)" stroke="var(--ink)" stroke-width="1.5"/>';
    g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + sy[0] + '" y2="' + sy[1] + '" stroke="var(--ink)" stroke-dasharray="3 3"/><line x1="' + cx + '" y1="' + cy + '" x2="' + al[0] + '" y2="' + al[1] + '" stroke="var(--ink)" stroke-dasharray="3 3"/>';
    g += '<path d="M' + (cx - 34) + ',' + cy + ' A34,34 0 0 1 ' + (cx - 34 * Math.cos(show)) + ',' + (cy - 34 * Math.sin(show)) + '" fill="none" stroke="var(--red)" stroke-width="2"/>' + txt(cx - 50, cy - 10, ang.toFixed(1) + '°', {s: 15, c: 'var(--red)', hc: 'var(--sea)'});
    // 赛伊尼的井
    g += '<rect x="' + (sy[0] - 16) + '" y="' + (sy[1] - 4) + '" width="16" height="8" fill="var(--card)" stroke="var(--ink)"/>' + txt(sy[0] - 22, sy[1] + 24, '赛伊尼：井底照亮', {s: 15, a: 'end'});
    // 亚历山大里亚的木棍和影子
    const ux = -Math.cos(show), uy = -Math.sin(show), L = 44, top = [al[0] + ux * L, al[1] + uy * L];
    g += '<line x1="' + al[0] + '" y1="' + al[1] + '" x2="' + top[0] + '" y2="' + top[1] + '" stroke="var(--ink)" stroke-width="3"/>';
    const shLen = L * Math.tan(ang * Math.PI / 180) * 3, tx = -uy, ty = ux;
    g += '<line x1="' + al[0] + '" y1="' + al[1] + '" x2="' + (al[0] + tx * shLen) + '" y2="' + (al[1] + ty * shLen) + '" stroke="var(--ink)" stroke-width="4" opacity=".45"/>';
    g += '<line x1="' + (top[0] - 60) + '" y1="' + top[1] + '" x2="' + top[0] + '" y2="' + top[1] + '" stroke="var(--och)" stroke-width="1.5"/>';
    g += txt(top[0] - 10, top[1] - 10, '亚历山大里亚：木棍有影子', {s: 15, a: 'end'});
    g += txt(12, 292, '（图上的角度放大了三倍）', {s: 14, a: 'start', c: 'var(--ink-3)'});
    svg.innerHTML = g;
    kv($('#erKV'), [['地球周长', Math.round(circ).toLocaleString() + ' 斯塔迪昂'], ['换算成公里', Math.round(km).toLocaleString()], ['真实（经线一圈）', real.toLocaleString() + ' 公里'], ['误差', (km > real ? '+' : '') + ((km - real) / real * 100).toFixed(1) + '%']]);
    const e = Math.abs(km - real) / real, s = $('#erSay');
    if (+A.value === 72 && dist === 5000) { s.className = 'say ok'; s.innerHTML = '这就是埃拉托色尼当年的数字：五十分之一圈，五千斯塔迪昂，<b>二十五万斯塔迪昂</b>。换成公里是多少，取决于他用的斯塔迪昂有多长，学者们至今没吵出结果。'; }
    else if (e < .05) { s.className = 'say ok'; s.innerHTML = '误差不到百分之五。用一根木棍。'; }
    else { s.className = 'say'; s.innerHTML = '影子角度每差一度，算出来的地球就差上好几千公里。埃拉托色尼量角度的工具，据说是一种碗状的日晷，能量到大约五十分之一圈的精度，已经非常了不起。'; }
  }
  go();
});
