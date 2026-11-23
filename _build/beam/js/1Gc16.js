/* ---------- 装置 17：朝南的窗和一尺屋檐 ---------- */
dev('#cnFig', () => {
  const C = [['广州', 23.1], ['拉萨', 29.7], ['上海', 31.2], ['北京', 39.9], ['哈尔滨', 45.8], ['伦敦', 51.5]];
  const DAYS = [['冬至', -23.44], ['春分 / 秋分', 0], ['夏至', 23.44]];
  let c = 3, d = 0;
  btnRow($('#cnBtns'), C.map(x => x[0]), c, i => { c = i; draw(); });
  btnRow($('#cnDay'), DAYS.map(x => x[0]), d, i => { d = i; draw(); });
  const D = slider('cnD', v => v.toFixed(2) + ' 米', () => draw());
  const SILL = 0.9, TOP = 2.4, EAVE = 2.7;
  function shade(alt, dep){ // 窗户被遮住的比例、阳光照进屋里多深
    const t = Math.tan(alt), yS = EAVE - dep * t; // 屋檐影子落在墙上的高度
    const frac = clamp((TOP - yS) / (TOP - SILL), 0, 1);
    const litTop = Math.min(TOP, yS);
    const reach = litTop > SILL ? litTop / t : 0;
    return {frac, reach};
  }
  function draw(){
    const lat = C[c][1], dec = DAYS[d][1], alt = (90 - lat + dec) * Math.PI / 180, dep = D();
    const s = shade(alt, dep);
    const k = 66, wx = 360, base = 250, X = x => wx - x * k, Y = y => base - y * k; // x 向左是屋里
    let g = '<line x1="20" x2="580" y1="' + base + '" y2="' + base + '" stroke="var(--ink)"/>';
    g += '<rect x="' + wx + '" y="' + Y(EAVE + 0.1) + '" width="14" height="' + (EAVE + 0.1) * k + '" fill="var(--ink-3)" fill-opacity=".4"/>';
    g += '<rect x="' + wx + '" y="' + Y(TOP) + '" width="14" height="' + (TOP - SILL) * k + '" fill="var(--sea)" stroke="var(--blu)"/>';
    g += '<path d="M' + (wx + 14 + dep * k) + ',' + Y(EAVE) + 'L' + (wx - 60) + ',' + Y(EAVE + 0.5) + '" stroke="var(--ter)" stroke-width="5" stroke-linecap="round"/>';
    // 阳光：从右上方（南）射来
    const t = Math.tan(alt), cos = Math.cos(alt), sin = Math.sin(alt);
    for (let i = 0; i < 7; i++) {
      const yw = SILL + (TOP - SILL) * i / 6; // 打到窗面的高度
      const lit = yw <= EAVE - dep * t + 1e-9;
      const Ls = Math.min(3, (Y(yw) - 6) / (sin * k), (580 - wx - 14) / (cos * k)), sx = wx + 14 + Ls * cos * k, sy = Y(yw) - Ls * sin * k;
      if (lit) { const fx = wx - yw / t * k; g += '<line x1="' + sx.toFixed(1) + '" y1="' + sy.toFixed(1) + '" x2="' + Math.max(20, fx).toFixed(1) + '" y2="' + (fx < 20 ? Y(yw - (wx - 20) / k * t) : base).toFixed(1) + '" stroke="var(--och)" stroke-width="1.6" stroke-opacity=".8"/>'; }
      else g += '<line x1="' + sx.toFixed(1) + '" y1="' + sy.toFixed(1) + '" x2="' + (wx + 14 + dep * k).toFixed(1) + '" y2="' + (Y(yw) - (dep) * k * t + 0).toFixed(1) + '" stroke="var(--och)" stroke-width="1" stroke-opacity=".35" stroke-dasharray="3 3"/>';
    }
    if (s.reach > 0) g += '<line x1="' + wx + '" x2="' + Math.max(20, X(s.reach)) + '" y1="' + (base - 2) + '" y2="' + (base - 2) + '" stroke="var(--och)" stroke-width="5" stroke-opacity=".6"/>';
    g += txt(560, 60, '南 →', {s: 12, a: 'end', c: 'var(--ink-2)'}) + txt(40, 60, '← 屋里', {s: 12, a: 'start', c: 'var(--ink-2)'});
    g += txt(wx + 40, Y(EAVE) - 10, '屋檐 ' + dep.toFixed(2) + ' 米', {s: 11, a: 'start', c: 'var(--ter)'});
    const svg = $('#cnSvg'); svg.setAttribute('viewBox', '0 0 600 266'); svg.innerHTML = g;
    const aW = (90 - lat - 23.44) * Math.PI / 180, aS = (90 - lat + 23.44) * Math.PI / 180;
    const w = shade(aW, dep), su = shade(aS, dep);
    kv($('#cnKv'), [['正午太阳高度', ((90 - lat + dec)).toFixed(0) + '°'], ['这一天窗被遮住', Math.round(s.frac * 100) + '%'], ['冬至被遮', Math.round(w.frac * 100) + '%'], ['夏至被遮', Math.round(su.frac * 100) + '%'], ['阳光照进屋里', s.reach > 0 ? s.reach.toFixed(1) + ' 米' : '照不进']]);
    const good = w.frac < 0.2 && su.frac > 0.8;
    $('#cnSay').className = 'say' + (good ? ' ok' : '');
    $('#cnSay').innerHTML = C[c][0] + '（北纬 ' + lat + '°）' + DAYS[d][0] + '正午，太阳高 ' + (90 - lat + dec).toFixed(0) + '°。' +
      (good ? '这个屋檐两头兼顾：<b>冬至几乎不挡，夏至几乎全挡</b>。苏格拉底要的就是这个。' :
        w.frac >= 0.2 ? '屋檐太深了：冬至也挡掉了 ' + Math.round(w.frac * 100) + '% 的窗，冬天的太阳进不来。' :
        '屋檐太浅了：夏至只挡住 ' + Math.round(su.frac * 100) + '%，夏天正午的太阳照进屋里。') +
      (lat < 25 ? ' 在广州这样的低纬度，夏至的太阳几乎在头顶，屋檐很好挡；难挡的是西晒，所以南方老房子更爱用骑楼、冷巷和百叶。' : '') +
      (lat > 45 ? ' 纬度越高，冬天的太阳越低，屋檐稍微深一点就把它挡住了。' : '');
  }
  draw();
});
