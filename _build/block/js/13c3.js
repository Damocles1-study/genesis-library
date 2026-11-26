
/* ---------- 第三章：第一夜（简化的原创规划小游戏） ---------- */
dev('#nightFig', () => {
  const DAY = 600;
  /* [名字, 秒, 需要(函数), 做完以后(函数), 说明] */
  const ACT = [
    ['砍一棵树', 60, b => true, b => { b.原木 += 4; }, '得到 4 块原木'],
    ['原木做成木板', 10, b => b.原木 >= 1, b => { b.原木 -= 1; b.木板 += 4; }, '1 原木 → 4 木板'],
    ['做一张工作台', 10, b => b.木板 >= 4 && !b.工作台, b => { b.木板 -= 4; b.工作台 = 1; }, '要 4 木板'],
    ['做一把木镐', 15, b => b.工作台 && b.木板 >= 5 && !b.木镐, b => { b.木板 -= 5; b.木镐 = 1; }, '要工作台和 5 木板'],
    ['挖泥土', 60, b => true, b => { b.泥土 += 32; }, '得到 32 块泥土'],
    ['挖石头', 90, b => b.木镐, b => { b.圆石 += 24; }, '要木镐，得到 24 圆石'],
    ['做一把石剑', 15, b => b.工作台 && b.圆石 >= 2 && b.木板 >= 1 && !b.石剑, b => { b.圆石 -= 2; b.木板 -= 1; b.石剑 = 1; }, '要工作台、2 圆石、1 木板'],
    ['找煤', 120, b => b.木镐, b => { b.煤 += 4; }, '要木镐，得到 4 块煤'],
    ['做火把', 10, b => b.煤 >= 1 && b.木板 >= 1, b => { b.煤 -= 1; b.木板 -= 1; b.火把 += 4; }, '1 煤 + 1 木板 → 4 火把'],
    ['盖一间土屋', 90, b => b.泥土 >= 32 && !b.屋, b => { b.泥土 -= 32; b.屋 = '土屋'; }, '要 32 泥土'],
    ['盖一间石屋', 120, b => b.圆石 >= 24 && b.木板 >= 2 && b.屋 !== '石屋', b => { b.圆石 -= 24; b.木板 -= 2; b.屋 = '石屋'; }, '要 24 圆石、2 木板（做门）'],
    ['找吃的', 90, b => true, b => { b.食物 += 3; }, '摘苹果、打猎，得到 3 份食物'],
    ['剪羊毛做床', 150, b => b.工作台 && b.木板 >= 3 && !b.床, b => { b.木板 -= 3; b.床 = 1; }, '要工作台、3 木板，还要找到羊']
  ];
  const NAMES = ['原木', '木板', '泥土', '圆石', '煤', '火把', '食物'];
  let bag, t, log, over;
  function reset(){ bag = {原木: 0, 木板: 0, 泥土: 0, 圆石: 0, 煤: 0, 火把: 0, 食物: 0, 工作台: 0, 木镐: 0, 石剑: 0, 床: 0, 屋: ''}; t = 0; log = []; over = false; render(); $('#nightSay').textContent = '太阳刚升起来。先做什么？'; }
  const box = $('#nightBtns');
  box.innerHTML = ACT.map((a, i) => '<button data-i="' + i + '">' + a[0] + '<small>' + a[1] + ' 秒 · ' + a[4] + '</small></button>').join('');
  function render(){
    $$('button', box).forEach((b, i) => { const a = ACT[i]; b.disabled = over || !a[2](bag) || t + a[1] > DAY; b.classList.toggle('done', log.includes(a[0])); });
    $('#nightHand').style.left = 'calc(' + (t / DAY * 100) + '% - 2px)';
    kv($('#nightKv'), [['已经过去', t + ' 秒'], ['离天黑还有', Math.max(0, DAY - t) + ' 秒'], ['做了几件事', log.length + ' 件']]);
    const items = NAMES.filter(k => bag[k] > 0).map(k => k + ' ×' + bag[k]);
    ['工作台', '木镐', '石剑', '床'].forEach(k => { if (bag[k]) items.push(k); });
    if (bag.屋) items.push(bag.屋);
    $('#nightBag').innerHTML = items.length ? items.map(x => '<span>' + x + '</span>').join('') : '<span>空的</span>';
  }
  function night(){
    over = true; render();
    let score = 0; const say = [];
    if (bag.床 && bag.屋) { score = 5; say.push('你在' + bag.屋 + '里放好了床，天一黑就睡下了，一觉睡到天亮。完美的第一夜！'); }
    else {
      if (!bag.屋) say.push('你没有盖屋子，只能站在外面过夜。四面八方的黑暗里都可能冒出怪物。');
      else { score += bag.屋 === '石屋' ? 2 : 1.5; say.push('你躲进了' + bag.屋 + (bag.屋 === '石屋' ? '，石头墙很结实。' : '，土墙不太结实，但能挡一挡。')); }
      if (bag.火把 > 0) { score += 1; say.push('屋里点着火把，亮的地方不会冒出怪物。'); } else if (bag.屋) say.push('可是屋里黑乎乎的，要是屋子大一点，角落里可能会冒出东西。');
      if (bag.石剑) { score += .5; say.push('手里有一把石剑，心里踏实一点。'); }
      if (bag.食物 > 0) { score += .5; say.push('还有 ' + bag.食物 + ' 份吃的，不会饿着。'); } else say.push('你什么都没吃，第二天早上肚子咕咕叫。');
      if (bag.床) { score += .5; say.push('你做了床，可是没有屋子，睡在外面不安全。'); }
    }
    const stars = Math.max(0, Math.min(5, Math.round(score)));
    $('#nightSay').innerHTML = '<b>' + '★'.repeat(stars) + '☆'.repeat(5 - stars) + '</b>　' + say.join('') + ' 你一共用了 ' + t + ' 秒，做了：' + (log.join('、') || '什么也没做') + '。';
    $('#nightSay').className = 'say ' + (stars >= 3 ? 'ok' : 'bad');
  }
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    const a = ACT[+b.dataset.i]; a[3](bag); t += a[1]; log.push(a[0]);
    $('#nightSay').className = 'say';
    $('#nightSay').textContent = a[0] + '，花了 ' + a[1] + ' 秒。' + (DAY - t < 90 ? '太阳快落山了！' : '');
    render();
    if (ACT.every(x => !x[2](bag) || t + x[1] > DAY)) night();
  });
  $('#nightEnd').addEventListener('click', () => { if (!over) night(); });
  $('#nightReset').addEventListener('click', () => { $('#nightSay').className = 'say'; reset(); });
  reset();
});
