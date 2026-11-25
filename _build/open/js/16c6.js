/* ---------- 装置 7：一千个铁杆粉丝 ---------- */
dev('#fanFig', fig => {
  const kvb = $('#fnKv'), say = $('#fnSay');
  const g = {}; let ready = false;
  function draw(){
    if (!ready) return;
    const fans = g.f * g.c / 100;
    const per = g.s * (1 - g.k / 100);
    const income = fans * per;
    const needFans = Math.ceil(g.t / per);
    const needFollow = Math.ceil(needFans / (g.c / 100));
    kv(kvb, [['铁杆粉丝', Math.round(fans).toLocaleString() + ' 人'], ['每人到你手里', per.toFixed(0) + ' 元 / 年'], ['一年收入', '<span class="' + (income >= g.t ? 'pos' : 'neg') + '">' + yuan(income) + '</span>'], ['达到目标要铁杆', needFans.toLocaleString() + ' 人'], ['也就是关注的人', needFollow.toLocaleString() + ' 人']]);
    let s;
    if (income >= g.t) s = '够了：' + Math.round(fans).toLocaleString() + ' 个铁杆粉丝，一年 ' + yuan(income) + '。可要记得，这一大群关注你的人，你是怎样攒起来的、花了几年。';
    else s = '还差 ' + yuan(g.t - income) + '。按这个比例，你需要 ' + needFollow.toLocaleString() + ' 个关注的人，才能攒出 ' + needFans.toLocaleString() + ' 个铁杆。“一千个”听起来不多，可它通常藏在一大群路人里面。试试把“每人每年花”往右拖：把价格定高一点、把东西做得更值，往往比涨粉更快。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('fnF', v => { g.f = v; return v.toLocaleString() + ' 人'; }, go);
  slider('fnC', v => { g.c = v; return v.toFixed(1) + '%'; }, go);
  slider('fnS', v => { g.s = v; return v + ' 元'; }, go);
  slider('fnK', v => { g.k = v; return v + '%'; }, go);
  slider('fnT', v => { g.t = v; return yuan(v); }, go);
  ready = true; draw();
});
