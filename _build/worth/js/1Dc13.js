
/* ---------- 装置 16：你的账本 ---------- */
dev('#ldFig', fig => {
  const KEY = 'genesis-worth-ledger';
  const IDS = ['t', 'sr', 'ef', 'debt', 'sl', 'ex', 'fr', 'cmp', 'dq', 'dw', 'dd', 'stop', 'no'];
  const el = id => $('#ld_' + id);
  try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved) IDS.forEach(id => { if (saved[id] != null) el(id).value = saved[id]; }); } catch (e) { /* 浏览器不允许存储时，照常使用 */ }
  let lastText = '';
  function gen(){
    const v = {}; IDS.forEach(id => v[id] = el(id).value.trim());
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
    const n = id => +v[id] || 0;
    const warn = [];
    if (n('ef') < 3) warn.push(['钱', '应急金不到三个月。先把它攒起来，再考虑别的。（第七章）']);
    if (n('debt') > 0) warn.push(['钱', '有 ' + fmt(n('debt')) + ' 元高息或看不懂利率的债。先问清年化利率，优先还掉。（第七章）']);
    if (n('sr') < 5) warn.push(['钱', '每月存下的不到 5%。看看三大块（住、吃、行）里哪一块能动。（第七章）']);
    if (n('sl') < 7) warn.push(['身', '平均睡不到七小时。你多半觉得“还好”，可第十一章的实验说，觉得还好的人表现也在变差。']);
    if (n('ex') < 150) warn.push(['身', '每周运动不到 150 分钟。这是身体账户里少有的正利息。（第十一章）']);
    if (n('fr') < 2) warn.push(['人', '急事能打电话的人不到两个。朋友是时间换来的，从一顿饭开始。（第十一章）']);
    if (!v.stop) warn.push(['时', '还没写止损线。（第二章）']);
    const nos = v.no ? v.no.split(/[，,、；;]\s*/).filter(Boolean) : [];
    const today = new Date(); const ds = today.getFullYear() + ' 年 ' + (today.getMonth() + 1) + ' 月 ' + today.getDate() + ' 日';
    const rows = [
      ['时间', v.t ? '精力最好的时间给了：' + esc(v.t) : '（没填：精力最好的时间给了什么？）'],
      ['钱', '每月存 ' + n('sr') + '%；应急金 ' + n('ef') + ' 个月；高息债 ' + fmt(n('debt')) + ' 元'],
      ['身体', '每晚 ' + n('sl') + ' 小时；每周运动 ' + n('ex') + ' 分钟'],
      ['人情', '急事能打电话的人：' + n('fr') + ' 个'],
      ['心思', v.cmp ? '最常拿来比的：' + esc(v.cmp) : '（没填：最常拿来和自己比的是谁？）']
    ];
    let h = '<h6>我的账 · ' + ds + '</h6><table>' + rows.map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('') + '</table>';
    if (v.dq) h += '<p style="margin-top:.6em"><b>决定日记</b>：' + esc(v.dq) + '。最坏：' + (esc(v.dw) || '（没想好）') + '。回来看的日子：' + (esc(v.dd) || '（没定）') + '。</p>';
    h += '<p><b>止损线</b>：' + (esc(v.stop) || '（还没写）') + '</p>';
    if (nos.length) h += '<p><b>不做清单</b>：' + nos.map(esc).join('；') + '。</p>';
    h += warn.length ? '<p style="color:var(--red)"><b>该先看的几行</b></p><ul style="margin:0;padding-left:1.2em">' + warn.map(w => '<li><b>' + w[0] + '</b>：' + w[1] + '</li>').join('') + '</ul>' : '<p style="color:var(--grn)"><b>五个账户都没有亮红灯。</b>剩下的，留给那些算不清、却让你觉得值的事。</p>';
    $('#ldOut').innerHTML = h;
    lastText = '我的账 · ' + ds + '\n' + rows.map(r => r[0] + '：' + r[1].replace(/<[^>]+>/g, '')).join('\n') +
      (v.dq ? '\n决定日记：' + v.dq + '。最坏：' + (v.dw || '') + '。回来看：' + (v.dd || '') : '') + '\n止损线：' + (v.stop || '') + (nos.length ? '\n不做清单：' + nos.join('；') : '') +
      (warn.length ? '\n该先看的：\n' + warn.map(w => '- ' + w[0] + '：' + w[1]).join('\n') : '');
    $('#ldMsg').textContent = '';
  }
  $('#ldGo').addEventListener('click', gen);
  $('#ldCopy').addEventListener('click', async () => {
    if (!lastText) gen();
    try { await navigator.clipboard.writeText(lastText); $('#ldMsg').textContent = '已复制。'; }
    catch (e) { $('#ldMsg').textContent = '这个浏览器不允许自动复制，请手动选中上面的文字复制。'; }
  });
  $('#ldClear').addEventListener('click', () => {
    IDS.forEach(id => { if (el(id).type === 'number') el(id).value = ''; else el(id).value = ''; });
    try { localStorage.removeItem(KEY); } catch (e) {}
    $('#ldOut').innerHTML = ''; lastText = ''; $('#ldMsg').textContent = '已清空。';
  });
  gen();
});
