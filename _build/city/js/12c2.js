/* ---------- 装置 3：楼间距 ---------- */
dev('#sunFig', fig => {
  const CITY = [['新加坡', 1.3], ['广州', 23.1], ['上海', 31.2], ['北京', 39.9], ['哈尔滨', 45.8], ['伦敦', 51.5]];
  const HR = [['只要正午晒到', 0], ['冬至晒满 1 小时', 1], ['冬至晒满 2 小时', 2], ['冬至晒满 3 小时', 3]];
  let ci = 3, hi = 2;
  const D2R = Math.PI / 180, DEC = -23.44;
  btnRow($('#sunCity'), CITY.map(c => c[0]), ci, i => { ci = i; go(); });
  btnRow($('#sunHr'), HR.map(h => h[0]), hi, i => { hi = i; go(); });
  const F = $('#sunF');
  F.addEventListener('input', go);
  // 太阳在时角 h（度）时的高度角和方位角（从正南起算）
  function sun(lat, h){
    const p = lat * D2R, d = DEC * D2R, H = h * D2R;
    const sa = Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(H);
    const alt = Math.asin(sa);
    const cosA = (Math.sin(alt) * Math.sin(p) - Math.sin(d)) / (Math.cos(alt) * Math.cos(p));
    return {alt, az: Math.acos(clamp(cosA, -1, 1))};
  }
  // 要让后排楼一楼窗台（离地 0.9 米）在正午前后共 n 小时都晒到，需要的南北间距
  function need(lat, H, n){
    const h = n * 15 / 2; // 正午前后各 n/2 小时
    const s = sun(lat, h);
    if (s.alt <= 0.01) return Infinity;
    return (H - 0.9) / Math.tan(s.alt) * Math.cos(s.az);
  }
  function go(){
    const lat = CITY[ci][1], fl = +F.value, H = fl * 3;
    $('#sunFO').textContent = fl + ' 层 · ' + H + ' 米';
    const noon = sun(lat, 0), altDeg = noon.alt / D2R;
    const sp = need(lat, H, HR[hi][1]);
    const coef = sp / H;
    // 画剖面：南在左，北在右
    const W = 600, G = 210, sc = Math.min(150 / H, 520 / (sp + 24));
    const x1 = 30, bw = 14 * sc + 8, x2 = x1 + bw + sp * sc;
    let s = '<line x1="0" x2="600" y1="' + G + '" y2="' + G + '" stroke="var(--ink)" stroke-width="1.5"/>';
    s += '<text x="8" y="' + (G + 22) + '" font-size="12" fill="var(--ink-3)">南</text><text x="592" y="' + (G + 22) + '" font-size="12" text-anchor="end" fill="var(--ink-3)">北</text>';
    const bld = (x, lab) => { let g = '<rect x="' + x + '" y="' + (G - H * sc) + '" width="' + bw + '" height="' + H * sc + '" fill="var(--card)" stroke="var(--ink)" stroke-width="1.5"/>'; for (let k = 1; k < fl && fl <= 33; k++) if (H * sc / fl > 3) g += '<line x1="' + x + '" x2="' + (x + bw) + '" y1="' + (G - k * 3 * sc) + '" y2="' + (G - k * 3 * sc) + '" stroke="var(--ink)" stroke-width=".4" opacity=".5"/>'; return g + '<text x="' + (x + bw / 2) + '" y="' + (G + 16) + '" font-size="12" text-anchor="middle" fill="var(--ink)">' + lab + '</text>'; };
    s += bld(x1, '前排') + (isFinite(sp) && x2 < W - 10 ? bld(x2, '后排') : '');
    // 阳光：从前排楼顶擦过，落到后排一楼窗台
    if (isFinite(sp) && x2 < W - 10) {
      s += '<line x1="' + (x1 + bw) + '" y1="' + (G - H * sc) + '" x2="' + x2 + '" y2="' + (G - 0.9 * sc) + '" stroke="var(--och)" stroke-width="2" stroke-dasharray="6 3"/>';
      s += '<path d="M' + (x1 + bw) + ',' + G + ' L' + (x1 + bw) + ',' + (G - H * sc) + ' L' + x2 + ',' + (G - 0.9 * sc) + ' L' + x2 + ',' + G + ' Z" fill="var(--ink)" opacity=".07"/>';
      s += '<line x1="' + (x1 + bw) + '" x2="' + x2 + '" y1="' + (G + 30) + '" y2="' + (G + 30) + '" stroke="var(--red)" stroke-width="1.2"/><text x="' + ((x1 + bw + x2) / 2) + '" y="' + (G + 26) + '" font-size="12.5" text-anchor="middle" fill="var(--red)">楼间距 ' + Math.round(sp) + ' 米</text>';
    }
    // 太阳
    const sx = 40 + 40 * Math.cos(noon.alt), sy = G - 160 * Math.sin(noon.alt) - 10;
    s += '<circle cx="' + Math.max(18, x1 - 6) + '" cy="' + Math.max(16, sy) + '" r="9" fill="var(--och)" opacity=".85"/>';
    $('#sunSvg').innerHTML = s;
    const rows = isFinite(sp) ? Math.max(1, Math.floor((120 + sp) / (sp + 14))) : 1;
    kv($('#sunKV'), [['冬至正午太阳高度', altDeg.toFixed(1) + '°'], ['需要的楼间距', isFinite(sp) ? Math.round(sp) + ' 米' : '晒不到'], ['间距 ÷ 楼高', isFinite(sp) ? coef.toFixed(2) : '—'], ['120 米进深能排几排', rows + ' 排 · ' + rows * fl + ' 层楼']]);
    const say = $('#sunSay');
    let t = '';
    if (lat < 10) t = '赤道附近，冬至的太阳也高高挂着，楼距几乎不受日照限制，反倒要想办法<b>遮阳</b>。新加坡的组屋可以盖得又高又密。';
    else if (coef < 1.1) t = '太阳够高，楼与楼之间留出一个楼高左右就够了。南方城市的小区常常显得“挤”，原因之一就在这里。';
    else if (coef < 1.9) t = '太阳不算高，要留出一倍半上下的楼高。这大致是中国中部、北部城市小区的样子。';
    else t = '冬天的太阳很低，楼距要留出将近两倍甚至更多的楼高。楼盖得越高，空地就得越大，<b>多盖几层并不能多赚多少</b>。这就是北方城市板楼成排、空地成片的原因。';
    if (lat > 50) t += '伦敦纬度比哈尔滨还高，冬至正午太阳只有十几度。英国的规划不按这么严的冬季日照来算，否则市中心几乎什么都盖不了。';
    say.innerHTML = t;
  }
  go();
});
