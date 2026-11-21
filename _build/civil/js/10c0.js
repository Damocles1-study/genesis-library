
/* ---------- 装置 1：平一本工日账 ---------- */
dev('#udFig', fig => {
  const T = $('#udT'), say = $('#udSay');
  let st;
  const nR = $('#udN');
  function reset(){
    st = {yr: 0, n: +nR.value, bal: 0, sick: 0, rows: [], r: rng(20 + +nR.value)};
    nR.disabled = false; $('#udA').disabled = $('#udB').disabled = false;
    render();
    say.className = 'say'; say.innerHTML = '总督府的规矩：每人每年 360 天，每 10 天休 1 天，剩下的天数全按定额折成“应完成”的工日。点上面的按钮开始过第一年。';
  }
  $('#udNO').textContent = nR.value + ' 人';
  nR.addEventListener('input', () => { $('#udNO').textContent = nR.value + ' 人'; reset(); });
  function year(hard){
    if (st.yr >= 5) return;
    nR.disabled = true;
    const r = st.r, n = st.n;
    const due = Math.round(n * 324);                         // 应完成：人数 × (360 − 36 天休息)
    // 实际：每人完成率受天气、生病、逃跑影响
    const flood = r() < 0.25, drought = !flood && r() < 0.2;
    let sickDays = 0, fled = 0, done = 0;
    for (let i = 0; i < n; i++) {
      let days = 324;
      const pSick = 0.25 + st.sick * 0.08 + (hard ? 0.05 : 0);
      if (r() < pSick) { const d = Math.round(10 + r() * 40); sickDays += d; days -= d; }
      if (r() < 0.03 + st.sick * 0.02) { fled++; days -= Math.round(r() * 200); }
      days = Math.max(0, days);
      const eff = (hard ? 1.12 : 0.97) * (flood ? 0.88 : drought ? 0.94 : 1) * (0.92 + r() * 0.1);
      done += days * eff;
    }
    done = Math.round(done);
    st.sick = hard ? Math.min(4, st.sick + 1) : Math.max(0, st.sick - 1);
    const diff = done - due;
    st.bal += diff; st.yr++;
    st.rows.push([st.yr, due, done, diff, st.bal, (flood ? '发大水；' : drought ? '天旱；' : '') + (fled ? '跑了 ' + fled + ' 人；' : '') + '病假约 ' + sickDays + ' 工日' + (hard ? '；逼紧了' : '')]);
    render();
    if (st.yr >= 5) {
      $('#udA').disabled = $('#udB').disabled = true;
      if (st.bal < 0) { say.className = 'say bad'; say.innerHTML = '五年下来，你一共欠总督府 <b>' + (-st.bal).toLocaleString() + '</b> 个工日，相当于 ' + (-st.bal / 324).toFixed(1) + ' 个人白干一整年。这笔账会一直挂在你名下。<b>别灰心，乌尔第三王朝的工头大多也是这样</b>：定额按“不下雨、不生病、没人跑”来定，现实没有一年配合。'; }
      else { say.className = 'say ok'; say.innerHTML = '五年下来，你的账上结余 <b>' + st.bal.toLocaleString() + '</b> 个工日。你是少见的好工头，或者运气好。真实的泥板上，能年年结余的工头不多；下一年，总督府很可能顺手把你的定额再提一提。'; }
    } else {
      say.className = 'say' + (diff < 0 ? ' bad' : ' ok');
      say.innerHTML = '第 ' + st.yr + ' 年：应完成 ' + due.toLocaleString() + '，已完成 ' + done.toLocaleString() + '，' + (diff < 0 ? '欠 ' + (-diff).toLocaleString() : '多出 ' + diff.toLocaleString()) + ' 个工日。' + (hard ? '你逼紧了，今年干得多，可手下的人累垮了，<b>明年病的跑的会更多</b>。' : st.sick > 0 ? '去年逼得太紧，伤还没养好。' : '');
    }
  }
  function render(){
    kv($('#udKv'), [['第几年', st.yr + ' / 5'], ['手下', st.n + ' 人'], ['累计结余', (st.bal >= 0 ? '+' : '') + st.bal.toLocaleString()], ['疲惫程度', ['好', '有点累', '累', '很累', '快垮了'][st.sick]]]);
    T.innerHTML = '<tr><th>年</th><th>应完成</th><th>已完成</th><th>本年差额</th><th>结转</th><th>备注</th></tr>' +
      st.rows.map(r => '<tr><td>' + r[0] + '</td><td>' + r[1].toLocaleString() + '</td><td>' + r[2].toLocaleString() + '</td><td style="color:' + (r[3] < 0 ? 'var(--red)' : 'var(--grn)') + '">' + (r[3] >= 0 ? '+' : '') + r[3].toLocaleString() + '</td><td>' + (r[4] >= 0 ? '+' : '') + r[4].toLocaleString() + '</td><td style="font-size:13px;color:var(--ink-3)">' + r[5] + '</td></tr>').join('');
  }
  $('#udA').addEventListener('click', () => year(false));
  $('#udB').addEventListener('click', () => year(true));
  $('#udR').addEventListener('click', reset);
  reset();
});
