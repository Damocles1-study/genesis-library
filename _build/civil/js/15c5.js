
/* ---------- 装置 6：一本报销账过户部 ---------- */
dev('#bfFig', fig => {
  const say = $('#bfSay'), log = $('#bfLog');
  const FAULT = ['石料单价比则例高了一钱二分', '土方数目有零头对不上', '一张收单的印没有盖清楚', '夫工日数和口粮数核算不符', '造册格式不合部式，须照新式重造', '去年同类工程的旧案未曾声明', '杉木尺寸未注明“围圆”', '册内“壹”字写作“一”，恐有涂改'];
  let st, r;
  function reset(){
    r = rng(1765); st = {m: 0, spent: 0, fee: 0, n: 0, done: false};
    log.textContent = '';
    probe();
  }
  function probe(){
    // 每次送部审核：书吏有一定概率挑出毛病；送过部费后基本不挑
    if (st.done) return;
    const p = st.fee ? 0.08 : 0.82;
    st.m += 2;
    if (r() < p) {
      st.cur = FAULT[Math.floor(r() * FAULT.length)];
      log.textContent = '第 ' + st.m + ' 个月：部驳——' + st.cur + '。\n' + log.textContent;
      say.className = 'say bad'; say.innerHTML = '户部书吏驳回：<b>' + st.cur + '</b>。你是照例重造，还是送部费？';
    } else {
      st.done = true;
      log.textContent = '第 ' + st.m + ' 个月：户部核准，准予开销。\n' + log.textContent;
      say.className = 'say ok';
      say.innerHTML = '账过了。用了 <b>' + st.m + '</b> 个月，重造花掉 ' + st.spent + ' 两，部费 ' + st.fee + ' 两，' + (st.fee ? '' : '一文部费没送，你运气真好，或者部里正好在查书吏。') +
        (st.fee ? '<br>注意：<b>部费比重造便宜，也比重造快</b>。所以几乎所有人都送。也正因为几乎所有人都送，书吏才有理由一直挑毛病。' : '');
    }
    if (st.m >= 36 && !st.done) {
      st.done = true;
      say.className = 'say bad';
      say.innerHTML = '三年任满，账还没过。你调走了，<b>一万两银子挂在你名下</b>，下一任知府可以不认这笔账。真实的清朝，这种“未完”的报销案拖上十几年、追到前任家里的，并不少见。';
    }
    render();
  }
  function render(){
    kv($('#bfKv'), [['已过去', st.m + ' 个月'], ['任期剩余', Math.max(0, 36 - st.m) + ' 个月'], ['重造花费', st.spent + ' 两'], ['部费', st.fee + ' 两'], ['被驳次数', st.n]]);
    $('#bfRedo').disabled = $('#bfPay').disabled = st.done;
    $('#bfPay').textContent = st.fee ? '再“补”一点部费' : '送部费（报销额的 3%）';
  }
  $('#bfRedo').addEventListener('click', () => {
    if (st.done) return;
    st.n++; const c = 40 + Math.floor(r() * 80), m = 2 + Math.floor(r() * 4);
    st.spent += c; st.m += m;
    log.textContent = '重造册籍：' + m + ' 个月，书办工食纸张 ' + c + ' 两。\n' + log.textContent;
    probe();
  });
  $('#bfPay').addEventListener('click', () => {
    if (st.done) return;
    st.n++; const f = st.fee ? 100 : 300;
    st.fee += f;
    log.textContent = '托京中熟人送部费 ' + f + ' 两。\n' + log.textContent;
    probe();
  });
  $('#bfReset').addEventListener('click', reset);
  reset();
});
