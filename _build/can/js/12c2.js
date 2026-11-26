
/* ---------- 装置 3：草酸遇到钙 ---------- */
dev('#oxFig', fig => {
  const dots = $('#oxDots'), kvb = $('#oxKv'), say = $('#oxSay'), cb = $('#oxB'), cm = $('#oxM');
  const g = {s: 200, t: 0};
  const N = 40;
  dots.innerHTML = '<i></i>'.repeat(N);
  function calc(s, t, blanch, milk){
    const O = 7 * s * (blanch ? 0.6 : 1);              // 毫克草酸
    const Ca = 1.5 * t + (milk ? 250 : 0);              // 毫克钙
    const bound = Math.min(O, 2.2 * 0.35 * Ca);         // 能结合的钙只算一部分
    const free = O - bound, abs = free * 0.1;           // 游离草酸大约一成被吸收
    return {O, Ca, bound, free, abs};
  }
  function draw(){
    const r = calc(g.s, g.t, cb.checked, cm.checked), base = calc(g.s, 0, false, false);
    const nb = Math.round(r.bound / base.O * N), na = Math.max(r.abs > 0 ? 1 : 0, Math.round(r.abs / base.O * N)), total = Math.round(r.O / base.O * N);
    $$('i', dots).forEach((d, i) => {
      d.style.background = i >= total ? 'transparent' : i < nb ? 'var(--ink-3)' : i >= total - na ? 'var(--red)' : 'var(--rule)';
      d.style.outline = i >= total ? '1px dashed var(--rule)' : 'none';
    });
    kv(kvb, [['吃进去的草酸', Math.round(r.O) + ' 毫克'], ['吃进去的钙', Math.round(r.Ca) + ' 毫克'], ['在肠子里被钙抓住', Math.round(r.bound) + ' 毫克'], ['进到血里、要过肾', '<span style="color:var(--red)">' + Math.round(r.abs) + ' 毫克</span>']]);
    const d = (1 - r.abs / base.abs) * 100;
    let s;
    if (!g.t && !cm.checked && !cb.checked) s = '只吃菠菜：钙很少，草酸大多是游离的，其中一部分会被吸收进血，最后从肾里走。<b>加一点豆腐试试</b>。';
    else if (d > 0) s = '和只吃这么多生菠菜比，进到血里的草酸<b>少了约 ' + Math.round(d) + '%</b>。挂图说“菠菜配豆腐会结石”，可在这顿饭里，豆腐（和牛奶、焯水）做的事正好相反：它让草酸在肠子里就被抓住、排掉了。';
    else s = '菠菜加得多，草酸更多了。豆腐和牛奶仍然在帮忙抓住一部分。';
    say.innerHTML = s;
  }
  slider('oxS', v => { g.s = v; return v + ' 克'; }, draw);
  slider('oxT', v => { g.t = v; return v ? v + ' 克' : '没有'; }, draw);
  cb.addEventListener('change', draw); cm.addEventListener('change', draw);
  draw();
});
