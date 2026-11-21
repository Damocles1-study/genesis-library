
/* ---------- 装置 3：再投一个月吗 ---------- */
dev('#skFig', fig => {
  const H = 0.15, PAY = 20, COST = 1, MAXM = 24, NP = 5;
  const PG = 0.6, PB = 0.4; // 好 / 死项目报“有进展”的概率
  const say = $('#skSay'), log = $('#skLog'), btns = $('#skBtns'), show = $('#skShow');
  let st;
  function newGame(){
    const r = rng(Date.now() % 100003);
    const projs = Array.from({length: NP}, () => ({good: r() < 0.5, us: Array.from({length: MAXM}, r), ug: Array.from({length: MAXM}, r)}));
    st = {projs, k: 0, m: 0, sunk: 0, lg: 1, lb: 1, total: 0, over: 0, lastSig: null, done: false, res: []};
    log.textContent = ''; render();
  }
  const post = (lg, lb) => 0.5 * lg / (0.5 * lg + 0.5 * lb);
  const ev = p => p * H * PAY - COST;
  function step(s, p){ // 推进一个月，返回 {win, sig}
    const m = s.m;
    if (p.good && p.us[m] < H) return {win: true};
    const sig = p.ug[m] < (p.good ? PG : PB);
    s.lg *= (1 - H) * (sig ? PG : 1 - PG); s.lb *= (sig ? PB : 1 - PB);
    return {win: false, sig};
  }
  // 账房：同样的项目、同样的运气，只在今后期望为正时继续
  function clerk(p){
    const s = {m: 0, lg: 1, lb: 1}; let tot = 0;
    while (s.m < MAXM && ev(post(s.lg, s.lb)) > 0) { tot -= COST; const o = step(s, p); s.m++; if (o.win) return tot + PAY; }
    return tot;
  }
  function render(){
    if (st.done) return;
    const p = st.projs[st.k], P = post(st.lg, st.lb);
    kv($('#skKv'), [['项目', (st.k + 1) + ' / ' + NP], ['第几个月', st.m], ['<span style="font-size:15px">已经投进去</span>', '<span style="font-size:30px;color:var(--red)">' + st.sunk + ' 万</span>'], ['五个项目累计', (st.total >= 0 ? '+' : '') + st.total + ' 万']]);
    let s = st.m === 0 ? '新项目。是好是死，各一半可能。' : '本月报告：<b>' + (st.lastSig ? '有进展' : '没有进展') + '</b>。';
    if (show.checked) s += '<br><small>账房：好项目的概率约 <b>' + Math.round(P * 100) + '%</b>；再投一个月的期望收益 ' + (P * H * PAY).toFixed(2) + ' − 1 = <b>' + ev(P).toFixed(2) + ' 万</b>，' + (ev(P) > 0 ? '值得继续。' : '不值得继续了。') + '</small>';
    say.className = 'say'; say.innerHTML = s;
    btns.innerHTML = '<button class="btn pri" data-k="go">再投一个月（1 万）</button><button class="btn" data-k="stop">收手</button>';
  }
  function finish(win){
    const p = st.projs[st.k];
    const mine = (win ? PAY : 0) - st.sunk;
    st.total += mine;
    const c = clerk(p);
    st.res.push([mine, c]);
    log.textContent = '项目 ' + (st.k + 1) + '（' + (p.good ? '好项目' : '死项目') + '）：' + (win ? '第 ' + st.m + ' 个月做成了，' : '投了 ' + st.m + ' 个月收手，') + '你 ' + (mine >= 0 ? '+' : '') + mine + ' 万；账房 ' + (c >= 0 ? '+' : '') + c + ' 万。\n' + log.textContent;
    st.k++; st.m = 0; st.sunk = 0; st.lg = 1; st.lb = 1; st.lastSig = null;
    if (st.k >= NP) end(); else render();
  }
  function end(){
    st.done = true;
    const ct = st.res.reduce((a, r) => a + r[1], 0);
    kv($('#skKv'), [['你的总账', (st.total >= 0 ? '+' : '') + st.total + ' 万'], ['账房的总账', (ct >= 0 ? '+' : '') + ct + ' 万'], ['期望已为负还继续的月数', st.over + ' 个月']]);
    say.className = 'say ' + (st.over <= 2 ? 'ok' : 'bad');
    say.innerHTML = '五个项目做完。' + (st.over ? '有 <b>' + st.over + '</b> 个月，按今后的期望已经不值得再投了，你还是投了，多花了 ' + st.over + ' 万。' : '你没有在“不值得”的时候多投过一个月。') +
      ' 账房的规矩只有一条：<b>只看今后，不看已经投进去的数</b>。在这个模型里，“没有进展”的月份一多，好项目的概率就掉得很快，一旦掉到三分之一以下就该收手，不管那时候已经投了多少。<br><small>运气也有份：同一组项目，账房也可能比你亏得多。多玩几轮再比。</small>';
    btns.innerHTML = '<button class="btn pri" data-k="new">再来五个项目</button>';
  }
  btns.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k === 'new') return newGame();
    if (st.done) return;
    if (b.dataset.k === 'stop') return finish(false);
    if (st.m >= MAXM) return finish(false);
    if (ev(post(st.lg, st.lb)) <= 0) st.over++;
    st.sunk += COST;
    const o = step(st, st.projs[st.k]);
    st.m++;
    if (o.win) return finish(true);
    st.lastSig = o.sig;
    if (st.m >= MAXM) { log.textContent = '（满 24 个月，项目自动结束）\n' + log.textContent; return finish(false); }
    render();
  });
  show.addEventListener('change', render);
  newGame();
});
