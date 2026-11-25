
/* ---------- 装置 18：一笔钱先放哪儿 ---------- */
dev('#wfFig', fig => {
  const box = $('#wfBars'), say = $('#wfSay'), ins = $('#wfI');
  let ready = false;
  function go(){
    if (!ready) return;
    const A = gA() * 1e4, M = gM(), E = gE(), D = gD() * 1e4, S = gS() / 100, insOk = ins.checked;
    let left = A; const rows = [], notes = [];
    const take = (name, need, note, col) => { const x = Math.max(0, Math.min(left, need)); left -= x; rows.push([name, x, note, col]); return x; };
    if (!insOk) { take('先交基本医保', 400, '居民医保一年约四百元', 'var(--main)'); notes.push('医保没交，先交上：一年几百元，盖住的是可能几十万的住院费（第十八章）。'); }
    const gap = Math.max(0, 3 - E) * M;
    const e = take('补足应急钱', gap, '目标三个月生活费', 'var(--och)');
    if (gap > 0) notes.push('应急钱从 ' + E + ' 个月补到 ' + (e >= gap ? '三个月' : (E + e / M).toFixed(1) + ' 个月') + '。');
    const d = take('还高息债', D, D ? '年化十几到二十几' : '没有', 'var(--dn)');
    if (D > 0) notes.push(d >= D ? '高息债全部还清，相当于拿到了一笔十几二十个点的稳赚收益。' : '高息债还了 ' + yuan(d) + '，还差 ' + yuan(D - d) + '，剩下的钱都该先给它。');
    const self = left * S, rest = left - self;
    rows.push(['投资自己', self, '学习、证书、做事的工具', 'var(--blu)']);
    rows.push(['经历和长期投资', rest, '旅行、体验、指数基金……', 'var(--up)']);
    bars(box, rows, A, v => yuan(v));
    let s = notes.join(' ');
    s += left > 0 ? ' 出局的坑都填上以后，还剩 ' + yuan(left) + '，这一截怎样分，就是第二十一章“旅游还是显卡”的问题，没有标准答案。' : ' 这笔钱全部用来填会让你出局的坑了。这不是坏事：它让你从此可以更从容地做别的选择。';
    say.textContent = s;
  }
  const gA = slider('wfA', v => v + ' 万', go), gM = slider('wfM', v => v.toLocaleString() + ' 元', go), gE = slider('wfE', v => v + ' 个月', go), gD = slider('wfD', v => v ? v + ' 万' : '没有', go), gS = slider('wfS', v => v + '%', go);
  ins.addEventListener('change', go);
  ready = true; go();
});
