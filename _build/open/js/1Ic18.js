/* ---------- 装置 19：出了事，用谁的钱赔 ---------- */
dev('#wallFig', fig => {
  const box = $('#wlBars'), say = $('#wlSay'), mix = $('#wlMix');
  const F = ['个体户', '个人独资企业', '一人公司', '有限公司（几个股东）', '普通合伙（两人）'];
  const g = {f: 3}; let ready = false;
  function draw(){
    if (!ready) return;
    const D = g.d, A = Math.min(g.a, D), short = Math.max(0, D - A);
    let mine = 0, lost = 0, why = '';
    if (g.f <= 1) { mine = short; why = F[g.f] + '没有有限责任：生意还不上的 ' + yuan(short) + '，全部由你个人' + (g.f === 0 ? '（家庭经营的，用家庭财产）' : '') + '承担。'; }
    else if (g.f === 4) { mine = short; why = '普通合伙人对合伙企业的债务承担无限连带责任：债主可以找你要全部 ' + yuan(short) + '，你替合伙人还了的部分，再去找他追偿，追不追得回来另说。'; }
    else {
      const company = g.f === 2 && mix.checked ? '一人公司的股东要自己证明公司财产独立于个人财产；账混在一起，证明不了，' : mix.checked ? '账目混同，可能被认定滥用公司人格，' : '';
      if (mix.checked) { mine = short; why = company + '这道墙塌了：还不上的 ' + yuan(short) + ' 可能都要你承担连带责任。'; }
      else {
        const guar = Math.min(g.g, short), rest = short - guar;
        const unpaid = Math.min(g.u, rest);
        mine = guar + unpaid; lost = rest - unpaid;
        why = '有限责任这道墙在起作用。' + (guar ? '可你签了担保的 ' + yuan(guar) + '，银行直接找你。' : '') + (unpaid ? '注册资本里认缴了没缴的 ' + yuan(unpaid) + '，债主可以要求你提前缴上。' : '') + (lost ? '剩下的 ' + yuan(lost) + '，债主拿不到：这才是“有限责任”真正保护你的部分。' : '墙后面已经没有剩下的了：你个人要掏的，和无限责任差不多。');
      }
    }
    if (g.f <= 1 || g.f === 4) lost = 0;
    bars(box, [['公司或生意的财产', A, '先拿来还债', 'var(--ter)'], ['你个人掏', mine, '', 'var(--main)'], ['债主拿不到', lost, '', 'var(--ink-3)']], D, v => yuan(v));
    say.textContent = why;
  }
  const go = () => { if (ready) draw(); };
  slider('wlD', v => { g.d = v; return yuan(v); }, go);
  slider('wlA', v => { g.a = v; return yuan(v); }, go);
  slider('wlU', v => { g.u = v; return yuan(v); }, go);
  slider('wlG', v => { g.g = v; return v ? yuan(v) : '没签'; }, go);
  mix.addEventListener('change', go);
  btnRow($('#wlForm'), F, 3, i => { g.f = i; draw(); });
  ready = true; draw();
});
