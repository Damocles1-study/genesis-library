
/* ---------- 尾声：全书时间线 + 你的第一块 ---------- */
dev('#lineAllFig', () => {
  /* [年份, 事, 章] */
  const E = [
    [1679, '莱布尼茨写下只用 0 和 1 的数法', 'c11'], [1847, '布尔把“并且、或者、不”写成算式', 'c10'], [1918, '两只电子管做成第一个“触发器”', 'c12'],
    [1937, '香农用布尔代数设计开关电路', 'c10'], [1946, 'ENIAC 每秒做约五千次加法', 'c13'], [1958, '带小圆点的积木申请专利', 'c1'],
    [2009, '一个瑞典程序员在论坛上发帖：洞穴游戏', 'c2'], [2009, '十欧元一份的测试版开卖', 'c4'], [2010, '红石来了', 'c9'], [2010, '第一台红石运算器', 'c14'],
    [2010, '万圣节，下界开门', 'c5'], [2011, '拉斯维加斯，正式版 1.0', 'c4'], [2012, '命令方块', 'c15'], [2012, '和联合国一起，居民用方块设计公园', 'c18'],
    [2013, '树莓派上的免费版，能用 Python', 'c16'], [2013, '大不列颠岛被搬进游戏', 'c19'], [2014, '微软用二十五亿美元买下 Mojang', 'c6'], [2014, '一比一的丹麦', 'c19'],
    [2016, '网易代理中国版', 'c7'], [2016, '教育版上线', 'c18'], [2020, '一座藏着被禁文章的图书馆', 'c18'], [2021, '世界从 256 格长到 384 格高', 'c5'],
    [2022, 'Java 版原生支持苹果芯片', 'c17'], [2022, '在方块游戏里玩方块游戏', 'c14'], [2024, '不再投票选新生物', 'c5'], [2025, '一部电影', 'c6'],
    [2025, '会聊天的红石机器人', 'c14'], [2026, '卖出四亿两千五百万份', 'c0'], [2026, '你翻到了这一页', 'c24']
  ];
  const box = $('#allLine'); let part = 0;
  function draw(){
    const rows = E.filter(e => !part || chapPage[e[2]] === part);
    box.innerHTML = rows.map(e => '<li><span class="y">' + e[0] + '</span><span>' + e[1] + '</span><a data-c="' + e[2] + '" href="' + href(e[2]) + '">' + (TOC.find(x => x.id === e[2]) || {}).n + '</a></li>').join('');
  }
  btnRow($('#allPart'), ['全部', '第一部 · 土', '第二部 · 电', '第三部 · 门'], 0, i => { part = i; draw(); });
  draw();
});

dev('#firstFig', () => {
  const KEY = 'genesis-block-first';
  let st = {};
  try { st = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { st = {}; }
  const F = [['what', '我想做的第一件东西'], ['where', '在哪儿做（游戏里 / 纸上 / Scratch / 别的）'], ['first', '第一步，这个星期就能做的'], ['help', '要请谁帮忙'], ['show', '做好了，给谁看']];
  $('#firstForm').innerHTML = F.map(f => '<label class="lab">' + f[1] + '<input type="text" data-k="' + f[0] + '" maxlength="40" value="' + esc(st[f[0]] || '') + '"></label>').join('');
  function draw(){
    $('#firstCard').innerHTML = '<h5>我的第一块</h5>' + F.map(f => '<p><b>' + f[1].replace(/（.*）/, '') + '：</b>' + (esc(st[f[0]] || '') || '＿＿＿＿＿＿') + '</p>').join('');
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
  }
  $('#firstForm').addEventListener('input', e => { const k = e.target.dataset.k; if (k) { st[k] = e.target.value; draw(); } });
  draw();
});
