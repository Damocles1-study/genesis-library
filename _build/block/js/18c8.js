
/* ---------- 第八章：真的假的 ---------- */
dev('#quizFig', () => {
  /* [说法, 答案(true=真), 解释, 章 id] */
  const Q = [
    ['游戏里一格就是一米。', true, '做游戏的人说过，一块方块就是一立方米。', 'c0'],
    ['方块世界是无限大的。', false, '它非常大，但有边界，大约在离中心三千万格的地方。', 'c0'],
    ['游戏的名字来自“挖矿”和“手艺”两个英文词。', true, 'mine 是挖矿，craft 是手艺。', 'top'],
    ['第一版做了好几年才做出来。', false, '从开工到在论坛上发帖，大约一个星期。', 'c2'],
    ['苦力怕是从一只画错的猪变来的。', true, '据 Notch 自己说，他把猪的高和长写反了。', 'c3'],
    ['游戏一开始就有下界和末地。', false, '下界是 2010 年万圣节加的，末地是 2011 年底。', 'c5'],
    ['2024 年起，不再每年投票选新生物了。', true, '2024 年 9 月 Mojang 宣布取消。', 'c5'],
    ['微软买下 Mojang 花了二十五亿美元。', true, '2014 年 9 月宣布。', 'c6'],
    ['中国版和国际版可以一起联机。', false, '两边的账号和服务器是分开的，不能一起玩。', 'c7'],
    ['游戏里藏着一个白眼睛的人。', false, '这是 2010 年网上编出来的故事，从来没有加进游戏。', 'c8'],
    ['网上能下载的模组都是安全的。', false, '2023 年就有人把病毒藏进了模组里。下载前要让大人一起看。', 'c8'],
    ['有人用红石在游戏里造出了一个会聊天的小人工智能。', true, '2025 年，一位玩家用几亿块方块造了一个，回答一句话要好几个小时。第二部会讲。', 'c14']
  ];
  const box = $('#quizBox'); let pick = [];
  const link = id => id === 'top' ? '<a href="#top">封面</a>' : '<a data-c="' + id + '" href="' + href(id) + '">' + (TOC.find(x => x.id === id) || {}).n + '</a>';
  function build(){
    pick = Q.map(() => null); box.classList.remove('shown');
    box.innerHTML = Q.map((q, i) => '<div class="qi" data-i="' + i + '">' + (i + 1) + '. ' + q[0] + '<div class="bt"><button class="btn" data-v="1">真</button><button class="btn" data-v="0">假</button></div><div class="ex"><b>' + (q[1] ? '真' : '假') + '。</b>' + q[2] + ' 见' + link(q[3]) + '。</div></div>').join('');
    $$('a[data-c]', box).forEach(a => { if (chapPage[a.dataset.c] > READY) { a.removeAttribute('href'); a.title = '写作中'; a.style.textDecorationStyle = 'dotted'; } });
    $('#quizSay').textContent = '还没开始。';
  }
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || box.classList.contains('shown')) return;
    const qi = b.closest('.qi'), i = +qi.dataset.i; pick[i] = b.dataset.v === '1';
    $$('button', qi).forEach(x => x.classList.toggle('on', x === b));
    const n = pick.filter(x => x !== null).length;
    $('#quizSay').textContent = '已经答了 ' + n + ' / ' + Q.length + ' 题。';
  });
  $('#quizGo').addEventListener('click', () => {
    if (pick.some(x => x === null)) { $('#quizSay').textContent = '还有 ' + pick.filter(x => x === null).length + ' 题没答，答完再揭晓。'; return; }
    box.classList.add('shown'); let ok = 0;
    $$('.qi', box).forEach((qi, i) => { const r = pick[i] === Q[i][1]; ok += r; qi.classList.add(r ? 'right' : 'wrong'); });
    $('#quizSay').innerHTML = '答对 <b>' + ok + '</b> / ' + Q.length + ' 题。' + (ok === Q.length ? '全对！你可以去给同学当“查证员”了。' : ok >= 9 ? '很厉害。答错的那几题，点后面的链接再读一遍。' : '没关系，这些都是网上常听到的说法，现在你知道怎么查了。');
  });
  $('#quizReset').addEventListener('click', build);
  build();
});
