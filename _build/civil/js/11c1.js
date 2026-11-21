
/* ---------- 装置 2：秦朝的收发室 ---------- */
dev('#qinFig', fig => {
  const box = $('#qinBox'), say = $('#qinSay'), log = $('#qinLog');
  const FROM = ['洞庭郡', '启陵乡', '贰春乡', '都乡', '少内', '仓', '司空', '尉', '酉阳县', '临沅县'];
  const WHAT = ['追捕逃亡者', '核对仓粮', '更名诏书', '上报户口', '征发徭役', '刑徒名籍', '借用船只', '钱粮出入', '迁徙户籍', '祠先农'];
  let st, r;
  function reset(){
    r = rng(7); st = {day: 0, docs: [], sent: 0, liu: 0, fine: 0, cap: 3, used: 0, id: 0};
    log.textContent = '';
    nextDay(true);
  }
  function newDocs(){
    const n = 2 + Math.floor(r() * 4) + (st.day > 6 ? 1 : 0);
    for (let i = 0; i < n; i++) st.docs.push({id: st.id++, urgent: r() < 0.35, from: FROM[Math.floor(r() * FROM.length)], what: WHAT[Math.floor(r() * WHAT.length)], age: 0});
  }
  function nextDay(first){
    if (!first) {
      // 结算今天：没发的急书和压过一天的不急书都算“留”
      let bad = [];
      st.docs.forEach(d => { if (d.urgent || d.age >= 1) bad.push(d); });
      bad.forEach(d => { st.liu++; st.fine += d.urgent ? 2 : 1; log.textContent = '第 ' + st.day + ' 日：' + d.from + '「' + d.what + '」' + (d.urgent ? '急书' : '压过一日') + '未发，留。' + (d.urgent ? '赀一甲。' : '赀一盾。') + '\n' + log.textContent; });
      st.docs = st.docs.filter(d => !(d.urgent || d.age >= 1));
      st.docs.forEach(d => d.age++);
      // 留下的急书视为已追发
    }
    if (st.day >= 10) { end(); return; }
    st.day++; st.used = 0;
    st.cap = 3 + (r() < 0.3 ? -1 : 0) + (r() < 0.2 ? 1 : 0);
    newDocs();
    render();
    say.className = 'say';
    say.innerHTML = '第 ' + st.day + ' 日。今天能派的邮人：<b>' + st.cap + '</b> 个' + (st.cap < 3 ? '（一个邮人被派去服徭役了）' : st.cap > 3 ? '（尉那边借来一个人）' : '') + '。案头文书 ' + st.docs.length + ' 件，其中急书 ' + st.docs.filter(d => d.urgent).length + ' 件、昨天压下的 ' + st.docs.filter(d => d.age >= 1).length + ' 件。';
  }
  function render(){
    kv($('#qinKv'), [['日子', st.day + ' / 10'], ['今天剩余邮人', (st.cap - st.used) + ' / ' + st.cap], ['已发', st.sent + ' 件'], ['被记“留”', st.liu + ' 次'], ['累计罚', Math.floor(st.fine / 2) + ' 甲 ' + (st.fine % 2) + ' 盾']]);
    box.innerHTML = st.docs.length ? st.docs.map(d => '<button class="btn" data-id="' + d.id + '" style="border-radius:4px;font-size:13px;line-height:1.4;padding:4px 8px;text-align:left;' + (d.urgent ? 'border-color:var(--zhu);color:var(--zhu)' : d.age >= 1 ? 'border-style:dashed' : '') + '"' + (st.used >= st.cap ? ' disabled' : '') + '>' + (d.urgent ? '急 · ' : d.age >= 1 ? '昨 · ' : '') + d.from + '<br><small>' + d.what + '</small></button>').join('') : '<span style="color:var(--ink-3);font-size:14px">案头空了。</span>';
  }
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || st.used >= st.cap) return;
    const id = +b.dataset.id, d = st.docs.find(x => x.id === id);
    st.docs = st.docs.filter(x => x.id !== id); st.used++; st.sent++;
    log.textContent = '第 ' + st.day + ' 日 水十一刻刻下' + (1 + Math.floor(r() * 9)) + '：' + d.from + '「' + d.what + '」' + (d.urgent ? '（急）' : '') + '，以邮行。\n' + log.textContent;
    render();
  });
  function end(){
    render();
    box.innerHTML = '';
    $('#qinNext').disabled = true;
    say.className = 'say ' + (st.liu > 4 ? 'bad' : 'ok');
    say.innerHTML = '十天过去。你发出 <b>' + st.sent + '</b> 件文书，被记“留” <b>' + st.liu + '</b> 次，累计罚 ' + Math.floor(st.fine / 2) + ' 甲 ' + (st.fine % 2) + ' 盾。' +
      (st.liu === 0 ? '一次没留，你是迁陵县的模范令史。' : st.liu > 4 ? '人手永远不够，文书永远在来，这是里耶秦简里的常态。<b>聪明的令史学会的第一件事是：先发急的，再发昨天压下的，最后才发今天新来的不急的。</b>' : '还行。注意到没有：<b>真正让你被罚的，往往不是急书，而是昨天顺手压下的那几件“不急”。</b>');
  }
  $('#qinNext').addEventListener('click', () => nextDay(false));
  $('#qinReset').addEventListener('click', () => { $('#qinNext').disabled = false; reset(); });
  reset();
});
