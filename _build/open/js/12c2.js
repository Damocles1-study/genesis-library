/* ---------- 装置 3：雇几个人才能不干活（《资本论》第一卷的算例） ---------- */
dev('#eightFig', fig => {
  const px = $('#e8Px'), kvb = $('#e8Kv'), say = $('#e8Say');
  const g = {}; let ready = false;
  const man = (c, t) => '<span title="' + t + '" style="display:inline-grid;place-items:center;width:34px;height:42px;border-radius:6px;border:1px solid var(--rule);background:var(--paper)"><svg viewBox="0 0 20 26" width="20" height="26"><circle cx="10" cy="6" r="4" fill="' + c + '"/><path d="M3 25v-8q0-6 7-6t7 6v8z" fill="' + c + '"/></svg></span>';
  function draw(){
    if (!ready) return;
    const surplus = g.h - g.n;
    if (surplus <= 0) {
      px.innerHTML = man('var(--main)', '雇主');
      kv(kvb, [['每个工人每天的剩余', '0 小时']]);
      say.textContent = '工人干的时间全用来挣回自己的工资了，雇多少人雇主也拿不到剩余：这时谁也当不了“资本家”。';
      return;
    }
    const N = g.m * g.n / (surplus * (1 - g.r / 100));
    const n = Math.ceil(N - 1e-9);
    let h = man('var(--main)', '雇主');
    h += '<span style="align-self:center;color:var(--ink-3);font-size:14px">雇</span>';
    for (let i = 0; i < Math.min(n, 60); i++) h += man(i < 7 ? 'var(--ter)' : 'var(--och)', '第 ' + (i + 1) + ' 个工人');
    if (n > 60) h += '<span style="align-self:center;color:var(--ink-3)">……共 ' + n + ' 人</span>';
    px.innerHTML = h;
    kv(kvb, [['每个工人每天的剩余', surplus + ' 小时'], ['雇主要拿到', (g.m * g.n / (1 - g.r / 100)).toFixed(1) + ' 小时的价值'], ['算出来要雇', N.toFixed(2) + ' 人'], ['取整', '<b>' + n + ' 人</b>']]);
    let s = '';
    if (g.h === 12 && g.n === 8 && g.m === 2 && g.r === 50) s = '这就是《资本论》里那个算例的原数：8 个人。前七个是绿色的，第八个换了颜色：当年的“七上八下”，就是从这里来的。';
    else if (n <= 7) s = '换了这组假设，雇 ' + n + ' 个人就够了，没碰到“八”。可见这条线取决于你假设工人一天干多久、雇主想过多好的日子。';
    else s = '换了这组假设，要雇 ' + n + ' 个人。一条写进法规的数字线，背后是一组可以随便拨动的假设。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('e8H', v => { g.h = v; return v + ' 小时'; }, go);
  slider('e8N', v => { g.n = v; return v + ' 小时'; }, go);
  slider('e8M', v => { g.m = v; return v === 1 ? '和工人一样' : '好 ' + (v - 1) + ' 倍（工人的 ' + v + ' 倍）'; }, go);
  slider('e8R', v => { g.r = v; return v ? '剩余的 ' + v + '%' : '不扩大，全拿来过日子'; }, go);
  ready = true; draw();
});
