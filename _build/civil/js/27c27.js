
/* ---------- 装置 28：什么时候动 ---------- */
dev('#whenFig', fig => {
  const say = $('#whSay');
  const gauss = r => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
  const err = t => 3 / (1 + t * 0.9);         // 第 t 年估计的误差标准差
  const close = t => Math.min(0.85, 0.15 + t * 0.1); // 第 t 年窗口关闭的概率
  let st, R = rng(Date.now() % 7777);
  function fresh(){
    st = {v: 0.4 + gauss(R) * 2, t: 0, done: false};
    st.est = st.v + gauss(R) * err(0);
    show('一个机会出现了。');
  }
  function show(msg){
    kv($('#whKv'), [['已经等了', st.t + ' 年'], ['你看到的估计', (st.est >= 0 ? '+' : '') + st.est.toFixed(1)], ['估计的误差', '± ' + err(st.t).toFixed(1)], ['今年窗口关闭的可能', Math.round(close(st.t) * 100) + '%']]);
    say.className = 'say'; say.innerHTML = msg + '估计值越大越好，负数说明这个机会可能是个坑。';
    $('#whWait').disabled = $('#whGo').disabled = st.done;
  }
  $('#whNew').addEventListener('click', fresh);
  $('#whWait').addEventListener('click', () => {
    if (st.done) return;
    if (R() < close(st.t)) { st.done = true; say.className = 'say bad'; say.innerHTML = '你又等了一年，<b>窗口关了</b>：被别人拿走了，或者你过了年龄线。它的真实价值其实是 ' + st.v.toFixed(1) + '。' + (st.v > 0 ? '可惜了。' : '不过它本来就是个坑，等对了。'); $('#whWait').disabled = $('#whGo').disabled = true; return; }
    st.t++; st.est = st.v + gauss(R) * err(st.t); show('又等了一年，信息多了一些。');
  });
  $('#whGo').addEventListener('click', () => {
    if (st.done) return; st.done = true;
    say.className = 'say ' + (st.v > 0 ? 'ok' : 'bad');
    say.innerHTML = '你在第 ' + st.t + ' 年出手。这个机会的真实价值是 <b>' + (st.v >= 0 ? '+' : '') + st.v.toFixed(1) + '</b>，你当时看到的估计是 ' + st.est.toFixed(1) + '。' + (st.v > 0 ? '动对了。' : '这是个坑，估计骗了你。') ;
    $('#whWait').disabled = $('#whGo').disabled = true;
  });
  $('#whSim').addEventListener('click', () => {
    const S = [['马上动', 0], ['等一年，看到正就动', 1], ['等两年，看到正就动', 2], ['等四年，看到正就动', 4]];
    const r = rng(2025), res = S.map(() => 0);
    for (let k = 0; k < 1000; k++) {
      const v = 0.4 + gauss(r) * 2, noise = Array.from({length: 8}, () => gauss(r)), cl = Array.from({length: 8}, () => r());
      S.forEach((s, i) => {
        let got = 0;
        for (let t = 0; t < 8; t++) {
          if (t > 0 && cl[t - 1] < close(t - 1)) { got = 0; break; }
          const est = v + noise[t] * err(t);
          if (t >= s[1] && (s[1] === 0 || est > 0)) { got = v; break; }
          if (t === 7) got = 0;
        }
        res[i] += got;
      });
    }
    const avg = res.map(x => x / 1000);
    const best = avg.indexOf(Math.max(...avg));
    bars($('#whBars'), S.map((s, i) => [s[0], Math.max(0, avg[i]), '平均 ' + avg[i].toFixed(2), i === best ? 'var(--zhu)' : 'var(--main)']), Math.max(...avg) * 1.2, v => v.toFixed(2));
    say.className = 'say';
    say.innerHTML = '一千个机会，四种策略。平均收益最高的是<b>“' + S[best][0] + '”</b>。马上动，会掉进不少坑；等太久，好机会被窗口关掉了。<b>最好的时机，在“看得足够清楚”和“窗口还开着”之间</b>。';
  });
  fresh();
});
