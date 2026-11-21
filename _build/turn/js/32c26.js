/* ---------- 装置 27：印多少本才划算 ---------- */
dev('#pressFig', fig => {
  const P = $('#psP'), N = $('#psN'), svg = $('#psSvg');
  const SCRIBE = 2.5;      // 抄写员：每天约 2—3 页（书法体）
  const SET = 2;           // 排字工：每天约排 2 页（含校对、拆版）
  const SHOP = 60;         // 每一版分摊的作坊本钱（铸字、压印机、房租），折合工日（示意）
  const PRESS = 1300;      // 一台压印机两个人一天约印 1300 印次（一张纸的一面）
  const nOf = v => Math.round(Math.pow(10, v / 100 * Math.log10(2000)));   // 1 … 2000（对数刻度）
  P.addEventListener('input', go); N.addEventListener('input', go);
  function go(){
    const p = +P.value, n = Math.max(1, nOf(+N.value));
    $('#psPo').textContent = p + ' 页'; $('#psNo').textContent = n + ' 本';
    const scribe = p / SCRIBE;
    const setup = p / SET + SHOP, run = (p / 4) / PRESS * 2;   // 四开本：一面四页
    const press = k => setup / k + run;
    // 对数坐标图
    const W = 600, H = 250, L = 52, R = 14, T = 14, B = 34;
    const lx = k => L + Math.log10(k) / Math.log10(2000) * (W - L - R);
    const ymin = 0.01, ymax = Math.max(1000, scribe * 2);
    const ly = v => T + (1 - (Math.log10(clamp(v, ymin, ymax)) - Math.log10(ymin)) / (Math.log10(ymax) - Math.log10(ymin))) * (H - T - B);
    let g = '';
    [0.01, 0.1, 1, 10, 100, 1000].forEach(v => { if (v <= ymax) g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + ly(v) + '" y2="' + ly(v) + '" stroke="var(--rule)"/>' + txt(L - 6, ly(v) + 4, v >= 1 ? v : v, {s: 11, a: 'end', c: 'var(--ink-3)', halo: false}); });
    [1, 10, 100, 1000].forEach(k => g += txt(lx(k), H - 12, k + ' 本', {s: 11, c: 'var(--ink-3)', halo: false}));
    g += txt(L - 6, T + 2, '工日/本', {s: 10.5, a: 'end', c: 'var(--ink-3)', halo: false});
    g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + ly(scribe) + '" y2="' + ly(scribe) + '" stroke="var(--ter)" stroke-width="2.6"/>' + txt(W - R - 4, ly(scribe) - 7, '抄写', {s: 12.5, a: 'end', c: 'var(--ter)', w: true});
    let d = ''; for (let i = 0; i <= 120; i++) { const k = Math.pow(2000, i / 120); d += (i ? 'L' : 'M') + lx(k).toFixed(1) + ',' + ly(press(k)).toFixed(1); }
    g += '<path d="' + d + '" fill="none" stroke="var(--main)" stroke-width="2.6"/>' + txt(W - R - 4, ly(press(2000)) - 7, '印刷', {s: 12.5, a: 'end', c: 'var(--main)', w: true});
    g += '<line x1="' + lx(n) + '" x2="' + lx(n) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--ink-3)" stroke-dasharray="2 3"/><circle cx="' + lx(n) + '" cy="' + ly(press(n)) + '" r="5" fill="var(--main)"/><circle cx="' + lx(n) + '" cy="' + ly(scribe) + '" r="5" fill="var(--ter)"/>';
    g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '" stroke="var(--ink)" stroke-width="1.2"/>';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const even = Math.ceil(setup / (scribe - run));
    const pc = press(n), ratio = scribe / pc;
    kv($('#psKV'), [['抄一本', scribe.toFixed(0) + ' 工日'], ['印一本（摊下来）', pc < 1 ? pc.toFixed(2) + ' 工日' : pc.toFixed(1) + ' 工日'], ['印到第几本开始划算', even + ' 本'], ['抄写的人工是印刷的', ratio < 1 ? '更便宜' : ratio.toFixed(ratio < 10 ? 1 : 0) + ' 倍']]);
    const say = $('#psSay');
    say.className = 'say' + (ratio > 20 ? ' ok' : '');
    say.innerHTML = n < even ? '只要 ' + n + ' 本，不如请抄写员：排版和作坊的本钱摊不开。十五世纪末，小批量的书、私人订制的祈祷书，很多还是抄的。'
      : '印 ' + n + ' 本，每本的人工只有抄写的 <b>' + (100 / ratio).toFixed(ratio > 100 ? 2 : 1) + '%</b>。' + (p >= 800 ? '一部厚厚的《圣经》，抄写员要干一年多。' : '') +
        '<br><small>只算人工。真实的书价没掉这么多：纸张、装订、运输、卖不掉的库存和书商的利润都要算进去。可在五十年里，书价确实大跌，一本书从贵族的财产，变成了教师和商人买得起的东西。</small>';
  }
  go();
});
