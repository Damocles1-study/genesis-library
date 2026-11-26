
/* ---------- 装置 9：华法林的菠菜 ---------- */
dev('#wfFig', fig => {
  const svg = $('#wfSvg'), kvb = $('#wfKv'), say = $('#wfSay');
  /* 每天吃进去的维生素 K（相对值）：1 = 一小盘绿叶菜 */
  const PAT = [
    {n: '天天一小盘，很稳定', v: d => 1},
    {n: '平时几乎不吃，第 10 天起连吃三天大盘', v: d => d >= 10 && d < 13 ? 4 : 0.2},
    {n: '平时天天吃很多，第 15 天起听说“不能吃”全停了', v: d => d < 15 ? 3 : 0.1},
    {n: '平时少吃，周末才吃一大盘', v: d => ((d % 7 + 7) % 7 >= 5) ? 4 : 0.2}
  ];
  let p = 0;
  function sim(f){
    const D = 42, a = 0.9, tau = 3;
    let avg = f(-30), acc = 0;                       // 剂量是照着“平时”调的：先跑四周
    for (let d = -29; d < 0; d++) { avg += (f(d) - avg) / tau; if (d >= -7) acc += avg; }
    let dose = 1.5 * (1 + a * acc / 7);              // 让平时的 INR 在 2.5 上下
    const pts = [], checks = [];
    let low = 0, high = 0, maxI = 0;
    for (let d = 0; d <= D; d++) {
      avg += (f(d) - avg) / tau;
      const inr = 1 + dose / (1 + a * avg);
      pts.push([d, inr]);
      if (inr < 2) low++; if (inr > 3) high++; if (inr > maxI) maxI = inr;
      if (d > 0 && d % 7 === 0) { checks.push([d, inr]); dose *= 1 + 0.5 * ((2.5 - 1) / (inr - 1) - 1); }
    }
    return {pts, checks, low, high, maxI};
  }
  function draw(){
    const r = sim(PAT[p].v);
    const ymax = Math.max(4.5, r.maxI + 0.3);
    const c = lineChart(svg, [{pts: r.pts, color: 'var(--ter)', w: 2.6}], {xmin: 0, xmax: 42, ymin: 1, ymax: ymax, xt: [0, 7, 14, 21, 28, 35, 42], xf: v => '第 ' + v + ' 天', yt: [1, 2, 3, 4, 5, 6].filter(v => v <= ymax), H: 260});
    let band = '<rect x="' + c.L + '" y="' + c.Y(3) + '" width="' + (c.W - c.L - c.R) + '" height="' + (c.Y(2) - c.Y(3)) + '" fill="var(--grn)" opacity=".13"/>';
    band += txt(c.W - c.R - 4, c.Y(3) - 5, '↑ 出血风险', {s: 11, a: 'end', c: 'var(--red)'}) + txt(c.W - c.R - 4, c.Y(2) + 14, '↓ 血栓风险', {s: 11, a: 'end', c: 'var(--blu)'});
    svg.insertAdjacentHTML('afterbegin', band);
    let dots = '';
    r.checks.forEach(k => { dots += '<circle cx="' + c.X(k[0]) + '" cy="' + c.Y(k[1]) + '" r="4.5" fill="var(--card)" stroke="var(--ink)" stroke-width="1.6"/>'; });
    for (let d = 0; d <= 42; d++) { const v = PAT[p].v(d); if (v > 0.5) dots += '<rect x="' + (c.X(d) - 3) + '" y="' + (c.H - c.B - 2 - v * 3) + '" width="6" height="' + (v * 3) + '" fill="var(--grn)" opacity=".6"/>'; }
    svg.insertAdjacentHTML('beforeend', dots + txt(c.L + 4, c.T + 10, '○ 每周复查一次，医生据此微调剂量；底下的绿条是当天吃的绿叶菜', {s: 10.5, a: 'start', c: 'var(--ink-3)'}));
    kv(kvb, [['六周里在目标区间', (43 - r.low - r.high) + ' 天'], ['偏低（血栓风险）', r.low + ' 天'], ['偏高（出血风险）', r.high + ' 天'], ['最高的 INR', r.maxI.toFixed(1)]]);
    const S = ['饮食稳定，药和菜的拔河一直平衡，曲线安安稳稳待在绿带里。吃多少不是关键，稳才是。',
      '突然连吃几大盘，维生素 K 一多，INR 掉出绿带，防血栓的效果变差了几天；之后又慢慢回来。一顿两顿不用慌，但要告诉医生。',
      '这是最危险的一种：剂量是照着“天天吃很多”调的，菜一停，药就没了对手，INR 一路往上蹿，进了出血风险区，要等到复查才发现。它恰恰是被“吃华法林不能吃绿叶菜”这句话吓出来的。',
      '忽多忽少，曲线跟着一周一周地起伏，医生很难把剂量调准。改成每天吃差不多的量，会好管得多。'];
    say.innerHTML = S[p];
  }
  btnRow($('#wfPat'), PAT.map(x => x.n), 0, i => { p = i; draw(); });
  draw();
});

/* ---------- 部末：九章盖了多少个章 ---------- */
dev('#tallyFig', fig => {
  const box = $('#tlDots'), out = $('#tlSay'), btns = $('#tlBtns');
  const COL = {'真': 'var(--red)', '看量': 'var(--main)', '看人': 'var(--blu)', '半真': 'var(--pur)', '假': 'var(--ink-3)'};
  const items = $$('.vds li').map(li => {
    const st = li.querySelector('.st'), sec = li.closest('section.chap');
    return {v: st ? st.dataset.v : '', t: (li.querySelector('b') || {}).textContent || '', p: (li.querySelector('p') || {}).textContent || '', id: sec ? sec.id : '', ch: sec ? sec.querySelector('.chead .big').textContent : ''};
  }).filter(x => COL[x.v]);
  const n = {}; items.forEach(x => n[x.v] = (n[x.v] || 0) + 1);
  let f = '';
  btns.innerHTML = '<button class="btn on" data-v="">全部 ' + items.length + '</button>' + STV.filter(v => n[v]).map(v => '<button class="btn" data-v="' + v + '">' + v + ' ' + n[v] + '</button>').join('');
  btns.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; f = b.dataset.v; $$('button', btns).forEach(x => x.classList.toggle('on', x === b)); paint(); });
  box.innerHTML = items.map((x, i) => '<i data-i="' + i + '" title="' + esc(x.t) + '" style="cursor:pointer;border-radius:4px;background:' + COL[x.v] + '"></i>').join('');
  function paint(){ $$('i', box).forEach((d, i) => { d.style.opacity = !f || items[i].v === f ? 1 : 0.12; }); }
  box.addEventListener('click', e => { const d = e.target.closest('i'); if (!d) return; const x = items[+d.dataset.i]; out.innerHTML = '<i class="st sm" data-v="' + x.v + '">' + x.v + '</i> <b>' + esc(x.t) + '</b>　' + esc(x.p) + ' <a href="#' + x.id + '">' + esc(x.ch) + ' ↑</a>'; });
  const pct = v => Math.round((n[v] || 0) / items.length * 100);
  const tail = PAGE === 1 ? '第一卷里盖“真”的，不是柿子就是生熟，再就是指向药箱的两条，没有一条是挂图上的“相克”。'
    : PAGE === 2 ? '盖“假”的多半是“这样能解决”的偏方：泡澡醒酒、浓茶解酒、热透了就安全、冷冻能杀菌；盖“真”的多半是“要等”和“要有人看着”。' : '';
  out.innerHTML = '这一部一共 ' + items.length + ' 条判词：<b>假</b>占 ' + pct('假') + '%，<b>真</b>占 ' + pct('真') + '%，其余是看量、看人和半真。' + tail + '点一格看看。';
});
