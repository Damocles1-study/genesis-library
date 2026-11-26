
/* ---------- 第三十一章：怎样问 AI（拼一个好问题） ---------- */
dev('#askFig', () => {
  const P = [
    ['ver', '说清楚版本', '我玩的是 Mac 上的 Java 版（版本号写在启动器里，比如 1.21.1）。', '版本不一样，命令和文件夹的写法常常不一样，AI 不知道你的版本，就容易给你一个“过时”的答案。'],
    ['goal', '说清楚想做什么', '我想做一个数据包：每次我走到草地上，脚下就开出一朵花。', '“帮我做个好玩的”太含糊，AI 只能乱猜。'],
    ['have', '说清楚我已经做到哪儿', '我已经会写 /function 运行一个函数了，但不知道怎么让它自己一直运行。', '这样 AI 就不会从头讲起，也不会讲得太难。'],
    ['why', '要它讲道理', '请一行一行告诉我，每一部分是什么意思。', '只要答案不要道理，下次碰到一样的问题你还是不会。'],
    ['hint', '先给提示，别直接给答案', '先给我一个提示，让我自己试；我还不会，再告诉我答案。', '自己想出来的，记得最牢。'],
    ['check', '让它提醒你怎么检查', '告诉我怎样在一个测试世界里检查它对不对。', 'AI 会说错。会检查，比会问更重要。']
  ];
  const BAD = ['名字', '学校', '住址', '照片', '密码'];
  const on = new Set(['goal']);
  $('#askPick').innerHTML = P.map(p => '<label class="ck"><input type="checkbox" data-k="' + p[0] + '"' + (on.has(p[0]) ? ' checked' : '') + '> ' + p[1] + '</label>').join('');
  function draw(){
    const used = P.filter(p => on.has(p[0]));
    $('#askOut').textContent = used.length ? used.map(p => p[2]).join('\n') : '帮我做个好玩的。';
    const n = used.length;
    $('#askSay').innerHTML = '用了 ' + n + ' / 6 样。' + (n <= 1 ? '这个问题太含糊了，AI 会给你一个很笼统、很可能不适合你的回答。' : n <= 3 ? '好多了。再加上“要它讲道理”和“怎么检查”试试。' : n < 6 ? '这是一个很好的问题。' : '六样都有：这是一个会学习的人问出来的问题。') +
      '<br>还没用上的：' + (P.filter(p => !on.has(p[0])).map(p => '<b>' + p[1] + '</b>（' + p[3] + '）').join(' ') || '没有了。') +
      '<br>无论怎么问，都<b>不要</b>写上你的' + BAD.join('、') + '。';
  }
  $('#askPick').addEventListener('change', e => { const k = e.target.dataset.k; if (!k) return; e.target.checked ? on.add(k) : on.delete(k); draw(); });
  draw();
});
