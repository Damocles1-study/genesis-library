
/* ---------- 装置 21：批还是不批 ---------- */
dev('#apvFig', fig => {
  const say = $('#apvSay'), log = $('#apvLog'), box = $('#apvBtns');
  const KIND = ['一家小厂的扩建', '一种新药的上市', '一座桥的施工方案', '一项农业补贴', '一个养老院的执照', '一条公交线路', '一笔科研经费', '一家诊所的开业'];
  let st;
  function reset(){
    const r = rng(Date.now() % 99991);
    const apps = Array.from({length: 20}, () => { const good = r() < 0.7; const sc = clamp(Math.round((good ? 66 : 42) + (r() - 0.5) * 50), 5, 98); return {good, sc, k: KIND[Math.floor(r() * KIND.length)], delays: 0}; });
    st = {apps, i: 0, career: 0, social: 0, ok: 0, no: 0, wait: 0, r};
    log.textContent = ''; show();
  }
  function show(){
    if (st.i >= st.apps.length) return end();
    const a = st.apps[st.i];
    kv($('#apvKv'), [['第几份', (st.i + 1) + ' / 20'], ['初审评分', a.sc], ['已拖次数', a.delays], ['批 / 不批 / 拖', st.ok + ' / ' + st.no + ' / ' + st.wait]]);
    say.className = 'say';
    say.innerHTML = '申请：<b>' + a.k + '</b>，初审评分 <b>' + a.sc + '</b>' + (a.delays ? '（补充材料后，评分更准了一些）' : '') + '。你怎么办？';
    box.innerHTML = '<button class="btn pri" data-k="0">批</button><button class="btn" data-k="1">不批</button><button class="btn" data-k="2"' + (a.delays >= 2 ? ' disabled' : '') + '>再要材料</button>';
  }
  box.addEventListener('click', e => {
    const b = e.target.closest('button[data-k]'); if (!b || st.i >= 20) return;
    const k = +b.dataset.k, a = st.apps[st.i];
    if (k === 2) { a.delays++; st.wait++; st.social -= 1; a.sc = clamp(Math.round(a.sc * 0.5 + (a.good ? 80 : 25) * 0.5), 5, 98); log.textContent = '#' + (st.i + 1) + ' ' + a.k + '：要求补充材料（申请人又等了一个月）。\n' + log.textContent; show(); return; }
    if (k === 0) { st.ok++; if (a.good) { st.social += 3; log.textContent = '#' + (st.i + 1) + ' 批了，事后证明是好项目。没人记得你。\n' + log.textContent; } else { st.social -= 10; st.career -= 10; log.textContent = '#' + (st.i + 1) + ' 批了，事后出了问题。你被问责。\n' + log.textContent; } }
    else { st.no++; if (a.good) { st.social -= 3; log.textContent = '#' + (st.i + 1) + ' 没批，其实是好项目。没人知道。\n' + log.textContent; } else { log.textContent = '#' + (st.i + 1) + ' 没批，确实是坏项目。\n' + log.textContent; } }
    st.i++; show();
  });
  function end(){
    const goodN = st.apps.filter(a => a.good).length;
    kv($('#apvKv'), [['仕途分', st.career], ['社会分', st.social], ['批 / 不批', st.ok + ' / ' + st.no], ['其中真好项目', goodN + ' 份']]);
    box.innerHTML = '<button class="btn pri" id="apvAgain">再办一批</button>';
    $('#apvAgain').addEventListener('click', reset);
    say.className = 'say ' + (st.social > 10 ? 'ok' : 'bad');
    say.innerHTML = '二十份办完。你的仕途分 <b>' + st.career + '</b>，社会分 <b>' + st.social + '</b>。' +
      (st.ok <= 3 ? '你几乎什么都没批：仕途分接近满分，<b>社会却为此付了 ' + (-st.social) + ' 分</b>，十几个好项目没做成，而且没有人会因此找你。这就是“不求有功，但求无过”的算术。' :
       st.career < -15 ? '你批得很大胆，社会分' + (st.social > 0 ? '不错' : '一般') + '，可你被问责了 ' + (-st.career / 10) + ' 次。在真实的单位里，你大概已经被调离窗口了。' :
       '你在两个分数之间找了一个平衡。注意：<b>真实的制度只看仕途分</b>，社会分是这个装置额外替你算的。');
  }
  reset();
});
