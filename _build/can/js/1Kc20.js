
/* ---------- 装置 21：一个插排上插了什么 ---------- */
dev('#plugFig', fig => {
  const box = $('#plugApp'), svg = $('#plugSvg'), say = $('#plugSay');
  const AP = [['电暖器', 2000], ['电水壶', 1800], ['电磁炉', 2100], ['电吹风', 1200], ['电饭煲', 800], ['电脑', 150], ['电视', 100], ['手机充电', 20], ['台灯', 10], ['路由器', 10]];
  const on = new Set([5, 7, 8]);
  let chain = 0;
  box.innerHTML = AP.map((a, i) => '<button data-i="' + i + '">' + a[0] + '<small style="opacity:.7"> ' + a[1] + 'W</small></button>').join('');
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const i = +b.dataset.i; on.has(i) ? on.delete(i) : on.add(i); draw(); });
  function draw(){
    $$('button', box).forEach(b => b.classList.toggle('on', on.has(+b.dataset.i)));
    const list = [...on].sort((a, b) => AP[b][1] - AP[a][1]);
    const Wt = list.reduce((s, i) => s + AP[i][1], 0), I = Wt / 220, ra = I / 10;
    const heat = ra * ra * (chain ? 1.35 : 1);
    const need = list.length > 4;
    let g = '';
    /* 插排的样子 */
    const strips = chain || need ? 2 : 1;
    for (let k = 0; k < strips; k++) {
      const x0 = 30 + k * 290, y0 = 28;
      g += '<rect x="' + x0 + '" y="' + y0 + '" width="250" height="54" rx="10" fill="var(--card)" stroke="var(--ink)" stroke-width="1.6"/>';
      for (let j = 0; j < 4; j++) {
        const idx = list[k * 4 + j], cx = x0 + 34 + j * 60;
        g += '<rect x="' + (cx - 20) + '" y="' + (y0 + 10) + '" width="40" height="34" rx="6" fill="' + (idx != null ? (AP[idx][1] >= 1000 ? 'var(--red)' : 'var(--ter)') : 'var(--paper-2)') + '" opacity="' + (idx != null ? .8 : 1) + '"/>';
        if (idx != null) g += txt(cx, y0 + 32, AP[idx][0].slice(0, 2), {s: 11.5, c: 'var(--paper)', halo: false, w: 1});
      }
      if (k === 0) g += '<path d="M' + x0 + ' ' + (y0 + 27) + 'h-20" stroke="var(--ink)" stroke-width="3"/>' + txt(x0 - 10, y0 + 70, '墙上', {s: 11, c: 'var(--ink-3)', halo: false});
      else g += '<path d="M' + (x0 - 40) + ' ' + (y0 + 27) + 'h40" stroke="var(--red)" stroke-width="3" stroke-dasharray="5 3"/>' + txt(x0 - 20, y0 + 70, '串接', {s: 11, c: 'var(--red)', halo: false});
    }
    /* 电流条和发热条 */
    const X0 = 30, bw = 540, mx = 3;
    const bar = (y, v, lab, val, col) => '<rect x="' + X0 + '" y="' + y + '" width="' + bw + '" height="16" rx="8" fill="var(--paper-2)"/><rect x="' + X0 + '" y="' + y + '" width="' + (Math.min(v, mx) / mx * bw).toFixed(1) + '" height="16" rx="8" fill="' + col + '" opacity=".8"/>' + txt(X0, y - 7, lab, {s: 12, a: 'start', c: 'var(--ink-2)', halo: false}) + txt(X0 + bw, y - 7, val, {s: 12.5, a: 'end', c: 'var(--ink)', halo: false, w: 1});
    const col = v => v > 1.5 ? 'var(--red)' : v > 1 ? 'var(--main)' : 'var(--grn)';
    g += bar(128, ra, '总电流 ÷ 额定 10 安', I.toFixed(1) + ' 安（' + Wt + ' 瓦）', col(ra));
    g += bar(180, heat, '第一个插头的发热 ÷ 额定时的发热', '× ' + heat.toFixed(1), col(heat));
    g += '<line x1="' + (X0 + bw / mx) + '" x2="' + (X0 + bw / mx) + '" y1="112" y2="204" stroke="var(--ink)" stroke-dasharray="3 3"/>' + txt(X0 + bw / mx, 222, '额定', {s: 11.5, c: 'var(--ink-2)', halo: false});
    svg.setAttribute('viewBox', '0 0 600 232'); svg.innerHTML = g;
    let s;
    if (!list.length) s = '什么都没插。';
    else if (ra <= 0.5) s = '一共 ' + Wt + ' 瓦，不到额定的一半，这样用很宽裕。';
    else if (ra <= 1) s = '一共 ' + Wt + ' 瓦，在额定之内，但已经不少了。插头要插紧，长时间用的时候摸一摸别发烫。';
    else if (ra <= 1.5) s = '<b>超了</b>：' + Wt + ' 瓦，电流约 ' + I.toFixed(1) + ' 安，插头的发热是额定时的 ' + heat.toFixed(1) + ' 倍。不一定马上出事，但插头、插座会被一点点烤坏。大功率的那一样，单独插墙上。';
    else s = '<b>超得很多</b>：电流约 ' + I.toFixed(1) + ' 安，插头发热是额定的 ' + heat.toFixed(1) + ' 倍。' + (on.has(0) && on.has(1) ? '来电的那位姑娘就在这一格：电暖器加电水壶。' : '');
    if (need && !chain) s += ' 另外，一个插排只有四个孔，插这么多只能再串一个。';
    if (chain) s += ' 串接以后，所有电流仍然挤过第一个插头，中间又多了一处接触点在发热。';
    say.innerHTML = s;
  }
  btnRow($('#plugChain'), ['只用一个插排', '再串一个插排'], 0, i => { chain = i; draw(); });
  draw();
});
