
/* ---------- 装置 7：药盒上的时间表 ---------- */
dev('#schFig', fig => {
  const svg = $('#schSvg'), say = $('#schSay'), ctl = $('#schCtl');
  const IT = [['早饭', 7.5, 'var(--kraft)'], ['牛奶', 7.5, 'var(--blu)'], ['咖啡', 8, 'var(--och)'], ['钙片', 8, 'var(--ter)'], ['铁片', 13, 'var(--pur)']];
  const tm = IT.map(x => x[1]);
  /* 每种药：几次、第一次几点、对每样东西的禁区 [前, 后]（小时），null = 不冲突 */
  const DR = [
    {n: '多西环素（四环素类）', doses: [0, 12], first: 8, rule: [null, [2, 2], null, [2, 2], [2, 2]], why: '钙、铁会抓住药，前后隔开约两小时。'},
    {n: '左氧氟沙星（沙星类）', doses: [0], first: 9, rule: [null, [2, 2], null, [2, 2], [2, 2]], why: '钙、铁会抓住药，前后隔开约两小时。'},
    {n: '左甲状腺素', doses: [0], first: 7, rule: [[2, 0.75], [2, 0.75], [2, 0.75], [4, 4], [4, 4]], why: '要空腹：吃药前两小时内最好没吃东西，吃完至少半小时到一小时再吃早饭、喝咖啡牛奶；钙铁隔开约四小时。'}
  ];
  let d = 0, first = DR[0].first;
  ctl.innerHTML = '<div class="ctl"><span>药（第一次）</span><input type="range" id="schD" min="6" max="22" step="0.5"><output id="schDO"></output></div>' +
    IT.map((x, i) => '<div class="ctl"><span>' + x[0] + '</span><input type="range" id="schI' + i + '" min="6" max="23" step="0.5" value="' + x[1] + '"><output id="schI' + i + 'O"></output></div>').join('');
  const hm = v => Math.floor(v) + ':' + (v % 1 ? '30' : '00');
  const dosesAt = () => DR[d].doses.map(o => first + o).filter(t => t <= 23.5);
  function draw(){
    const W = 600, L = 64, R = 16, T = 22, rowH = 28, H = T + (IT.length + 1) * rowH + 24;
    const X = t => L + (t - 6) / 18 * (W - L - R);
    const ds = dosesAt(), rule = DR[d].rule;
    let g = '', bad = [];
    for (let h = 6; h <= 24; h += 2) g += '<line x1="' + X(h) + '" x2="' + X(h) + '" y1="' + (T - 6) + '" y2="' + (H - 22) + '" stroke="var(--rule)"/>' + txt(X(h), H - 8, h + ':00', {s: 10.5, c: 'var(--ink-3)', halo: false});
    /* 药那一行 */
    const y0 = T + rowH / 2;
    g += txt(L - 8, y0 + 4, '药', {s: 13, a: 'end', w: 1, c: 'var(--main)'});
    ds.forEach(t => { g += '<rect x="' + (X(t) - 7) + '" y="' + (y0 - 8) + '" width="14" height="16" rx="7" fill="var(--main)"/>' + txt(X(t), y0 - 12, hm(t), {s: 10.5, c: 'var(--main)'}); });
    IT.forEach((x, i) => {
      const y = T + (i + 1) * rowH + rowH / 2, r = rule[i];
      g += txt(L - 8, y + 4, x[0], {s: 12.5, a: 'end'});
      g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" stroke="var(--rule)" stroke-dasharray="1 3"/>';
      let hit = false;
      if (r) ds.forEach(t => {
        const a = Math.max(6, t - r[0]), b = Math.min(24, t + r[1]);
        g += '<rect x="' + X(a) + '" y="' + (y - 9) + '" width="' + (X(b) - X(a)) + '" height="18" rx="3" fill="var(--red)" opacity=".16"/>';
        if (tm[i] > t - r[0] && tm[i] < t + r[1]) hit = true;
      });
      if (hit) bad.push(x[0]);
      g += '<circle cx="' + X(tm[i]) + '" cy="' + y + '" r="7" fill="' + (hit ? 'var(--red)' : x[2]) + '" stroke="var(--card)" stroke-width="2"/>';
      if (hit) g += txt(X(tm[i]) + 11, y + 4, '撞上了', {s: 10.5, a: 'start', c: 'var(--red)', w: 1});
    });
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    say.className = 'say ' + (bad.length ? 'bad' : 'ok');
    say.innerHTML = (bad.length ? '<b>' + bad.join('、') + '</b> 落进了红色区间。' : '<b>都错开了。</b>') + ' ' + DR[d].why + (d === 0 && ds.some(t => t >= 21.5) ? ' 另外，第二次吃得太晚，吃完马上躺下，药片容易卡在食管里：睡前至少半小时吃。' : '');
  }
  btnRow($('#schDrug'), DR.map(x => x.n), 0, i => { d = i; const r = $('#schD'); r.value = DR[i].first; r.dispatchEvent(new Event('input')); });
  IT.forEach((x, i) => slider('schI' + i, v => { tm[i] = v; return hm(v); }, () => draw()));
  $('#schD').value = first;
  slider('schD', v => { first = v; return hm(v) + (DR[d].doses.length > 1 ? ' · ' + hm(Math.min(23.5, v + 12)) : ''); }, () => draw());
});
