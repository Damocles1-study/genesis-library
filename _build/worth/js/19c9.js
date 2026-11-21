
/* ---------- 装置 11：十年三条路 ---------- */
dev('#pathFig', fig => {
  const CITY = [
    {n: '一线城市', pay: 1.6, rent: 4.2, live: 3.6, learn: .03},
    {n: '省会城市', pay: 1.0, rent: 2.0, live: 2.8, learn: .015},
    {n: '老家县城', pay: .6, rent: .6, live: 2.0, learn: 0}
  ];
  const PATH = [
    {n: '稳', base: 9, raise: .04, shock: .02, cut: .9, gap: 0, side: false, c: 'var(--blu)'},
    {n: '快', base: 12, raise: .07, shock: null, cut: .7, gap: .6, side: false, c: 'var(--red)'},
    {n: '稳＋小路', base: 9, raise: .04, shock: .02, cut: .9, gap: 0, side: true, c: 'var(--grn)'}
  ];
  let city = 1;
  btnRow($('#pathCity'), CITY.map(c => c.n), 1, i => { city = i; run(); });
  function sim(p, c, vol, r){
    let pay = p.base * c.pay, tot = 0, neg = false, hit = false;
    for (let y = 0; y < 10; y++) {
      let inc = pay;
      const sp = p.shock == null ? vol : p.shock;
      if (r() < sp) { inc = pay * (1 - p.gap); pay *= p.cut; }
      if (p.side && !hit && r() < .04) hit = true;
      if (hit) inc *= 1.5;
      const save = inc - c.rent - c.live;
      if (save < 0) neg = true;
      tot += save;
      pay *= 1 + p.raise + c.learn * (p.n === '快' ? 1.5 : 1);
    }
    return {tot, neg};
  }
  function run(){
    const vol = +$('#pathV').value / 100, c = CITY[city];
    const res = PATH.map((p, k) => { const r = rng(99 + k * 17 + city * 5 + Math.round(vol * 100)); const xs = []; let neg = 0; for (let i = 0; i < 500; i++) { const o = sim(p, c, vol, r); xs.push(o.tot); if (o.neg) neg++; } return {p, lo: pct(xs, .1), med: pct(xs, .5), hi: pct(xs, .9), neg: neg / 5, mean: xs.reduce((a, b) => a + b, 0) / xs.length}; });
    const mx = Math.max(...res.map(r => r.hi), 10), mn = Math.min(0, ...res.map(r => r.lo));
    const pos = v => ((v - mn) / (mx - mn) * 100).toFixed(1);
    $('#pathOut').innerHTML = res.map(r => '<div style="display:grid;grid-template-columns:5.5em minmax(0,1fr);gap:8px;align-items:center;margin:8px 0;font-size:13.5px"><span>' + r.p.n + '</span><div style="position:relative;height:30px;background:var(--paper);border-radius:4px">' +
      (mn < 0 ? '<i style="position:absolute;left:' + pos(0) + '%;top:0;bottom:0;border-left:1px dashed var(--ink-3)"></i>' : '') +
      '<i style="position:absolute;left:' + pos(r.lo) + '%;width:' + (pos(r.hi) - pos(r.lo)).toFixed(1) + '%;top:8px;height:14px;background:' + r.p.c + ';opacity:.35;border-radius:3px"></i>' +
      '<i style="position:absolute;left:' + pos(r.med) + '%;top:3px;height:24px;border-left:3px solid ' + r.p.c + '"></i></div></div>' +
      '<div style="font-size:12.5px;color:var(--ink-3);margin:-4px 0 6px 6.2em">最差一成 ' + r.lo.toFixed(0) + ' 万 · 中位数 <b style="color:var(--ink)">' + r.med.toFixed(0) + ' 万</b> · 最好一成 ' + r.hi.toFixed(0) + ' 万 · 有入不敷出年份的 ' + r.neg.toFixed(0) + '%</div>').join('');
    const [s, f, sp] = res;
    $('#pathSay').innerHTML = '在<b>' + c.n + '</b>，十年攒下的钱（中位数）：稳 ' + s.med.toFixed(0) + ' 万，快 ' + f.med.toFixed(0) + ' 万，稳＋小路 ' + sp.med.toFixed(0) + ' 万。' +
      ' 快的路最好的一成能到 ' + f.hi.toFixed(0) + ' 万，最差的一成只有 ' + f.lo.toFixed(0) + ' 万：<b>条子越长，你越要先问自己掉到左边那一头时扛不扛得住</b>。' +
      ' “小路”的中位数和“稳”差不多，因为大多数小路做不成；它的价值在右边那一截：花的是业余时间，输了也不出局。' +
      (city === 0 ? ' 一线城市房租高，头几年攒得少，可“学习溢价”让后几年涨得快；把行业风浪调高，看看快的路最差那一成会怎样。' : city === 2 ? ' 县城攒钱不比大城市少多少，因为房租和开销低；但收入涨得慢，十年后的“本事”差距，这张图里看不见。' : '');
  }
  slider('pathV', x => x + '% / 年', run);
});
