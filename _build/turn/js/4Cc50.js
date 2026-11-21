/* ---------- 装置 51：选你的尺子 / 猜猜是谁 / 山顶上站了多久 ---------- */
dev('#rhymeFig', fig => {
  const W4 = [['美国', '#2a9d9a'], ['中国', '#c9573a'], ['欧盟', '#3a6ea5'], ['印度', '#e08a2e']];
  // [尺子, 单位, [美, 中, 欧盟, 印], 越小越好?]（2024 年前后约数）
  const R = [['人口', '亿人', [3.4, 14.1, 4.5, 14.4]], ['汇率GDP', '经济总量，按市场汇率，万亿美元', [29.2, 18.7, 19.4, 3.9]], ['购买力GDP', '经济总量，按购买力平价，万亿国际元', [29.2, 37.1, 28, 16]],
    ['制造业', '占世界制造业 %', [16, 29, 14, 3]], ['军费', '十亿美元', [997, 314, 350, 86]], ['储备货币', '占世界外汇储备 %', [58, 2, 20, 0.1]], ['年轻', '年龄中位数（岁）', [38.9, 39.5, 44.5, 28.4], 1]];
  let wt = R.map(() => 1), tab = 0;
  btnRow($('#rmTab'), ['选你的尺子', '猜猜是谁', '山顶上站了多久'], 0, i => { tab = i; go(); });
  const rul = $('#rmRulers'), sayBox = $('#rmSay');
  rul.innerHTML = R.map((r, i) => '<div class="ctl" style="grid-template-columns:5.5em minmax(0,1fr)"><span>' + r[0] + '</span><span class="btns" data-r="' + i + '" style="margin:0">' + ['不看', '一般', '看重'].map((t, k) => '<button class="btn' + (k === 1 ? ' on' : '') + '" data-k="' + k + '">' + t + '</button>').join('') + '</span></div>').join('');
  rul.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const g = b.parentNode; $$('button', g).forEach(x => x.classList.toggle('on', x === b)); wt[+g.dataset.r] = [0, 1, 2.5][+b.dataset.k]; go(); });
  // 猜猜是谁：[题面, 答案（0 雅典 1 罗马 2 英国 3 美国）, 解说]
  const Q = [
    ['盟友们每年交钱，它替大家出船打仗。后来有盟友想退出，它出兵把那座城围了下来，拆了城墙。', 0, '雅典：提洛同盟的纳克索斯和萨索斯（第五章）。两千多年后，美国在 1991 年把这件事倒过来做了一遍：它出兵，盟友出钱（第四十九章）。'],
    ['一个将军带着军队开进了自己的首都，贴出了一张名单，名单上的人谁都可以杀，财产拍卖。', 1, '罗马：苏拉（第十五章）。美国的建国者们最怕的就是这一幕，所以宪法把军队的指挥权交给了文职的总统（第四十章），杜鲁门撤了麦克阿瑟（第四十七章）。'],
    ['一个国王想离婚，教皇不批，他就让议会宣布自己是本国教会的最高首脑，然后解散了修道院，把它们的地卖了。', 2, '英国：亨利八世（第二十六章）。'],
    ['它的总统把军队开进了一块双方都说是自己的地方，等对方开了第一枪，就向国会报告：对方在我们的土地上流了我们的血。', 3, '美国：1846 年美墨战争（第四十一章）。罗马的祭司团也有一套“正义战争”的仪式（第十三章）。'],
    ['它在一场运动会上宣布：希腊人从此自由了，不驻军、不纳贡。几十年后，它派来了收税的人。', 1, '罗马：前 196 年弗拉米尼努斯的宣告（第十章）。'],
    ['它的议会说：不经我们同意，国王不能收税。八十多年后，它的殖民地拿同一句话来对付它。', 2, '英国：1689 年的《权利法案》（第二十九章），和 1765 年起的“无代表不纳税”（第三十九章）。'],
    ['它把盟邦共同的金库从一座小岛搬到了自己城里，用里面的钱修了一座大理石的神庙。', 0, '雅典：提洛同盟的金库和帕特农神庙（第五章）。'],
    ['钱不够用了，它让同样一枚银币里的银子越来越少。', 1, '罗马：三世纪的银币（第二十一章）。美国 1934 年把黄金从二十点六七美元提到三十五美元（第四十五章），1971 年干脆不兑了（第四十八章），是同一个思路的文明版本。'],
    ['它的一家公司快破产了，政府让这家公司直接把茶叶卖到海外的殖民地，结果茶叶被倒进了海里。', 2, '英国：东印度公司和 1773 年的波士顿倾茶事件（第三十二、三十九章）。'],
    ['它的最高法院一致判决：总统也必须交出证据。两个多星期后，总统辞职了。', 3, '美国：1974 年的水门事件（第四十八章）。'],
    ['一个七十岁的老人被五百个陪审员判了死刑，罪名是不敬城邦的神、败坏青年。他拒绝了朋友们安排的越狱。', 0, '雅典：苏格拉底（第八章）。'],
    ['它的第一个皇帝从来不让人叫他皇帝，自称“第一公民”，说自己“恢复了共和”。', 1, '罗马：奥古斯都（第十七章）。']
  ];
  let qi = 0, score = 0, answered = false;
  const HINT = '选一个霸主。很多事不止一个霸主干过，这里只算最典型的那一个。';
  function quiz(){
    const q = Q[qi], box = $('#rmQuiz');
    box.innerHTML = '<div class="say" style="border-left-color:var(--main)"><b>第 ' + (qi + 1) + ' / ' + Q.length + ' 题</b>（答对 ' + score + ' 题）<br>' + q[0] + '</div><div class="btns" data-role="ans">' + ['雅典', '罗马', '英国', '美国'].map((t, k) => '<button class="btn" data-k="' + k + '">' + t + '</button>').join('') + '</div><div class="btns"><button class="btn" data-role="next"' + (answered ? '' : ' disabled') + '>' + (qi < Q.length - 1 ? '下一题' : '再来一遍') + '</button></div>';
    const ans = box.querySelector('[data-role="ans"]'), nx = box.querySelector('[data-role="next"]');
    ans.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || answered) return; answered = true;
      const k = +b.dataset.k, ok = k === q[1]; if (ok) score++;
      $$('button', ans).forEach(x => { x.disabled = true; if (+x.dataset.k === q[1]) x.classList.add('on'); });
      sayBox.className = 'say' + (ok ? ' ok' : ' bad');
      sayBox.innerHTML = (ok ? '<b>对了。</b>' : '<b>不对。</b>') + q[2];
      nx.disabled = false;
    });
    nx.addEventListener('click', () => { if (qi < Q.length - 1) qi++; else { qi = 0; score = 0; } answered = false; sayBox.className = 'say'; sayBox.innerHTML = HINT; quiz(); });
  }
  // 山顶上站了多久：[名称, 起, 止, 颜色, 说明]
  const L = [['雅典', -479, -404, '#7d5ba6', '从萨拉米斯到投降斯巴达，约七十五年'], ['罗马（西）', -146, 410, '#c9573a', '从迦太基和科林斯被毁，到哥特人攻进罗马，约五百五十年'], ['罗马（东）', 410, 1453, '#a0785a', '君士坦丁堡又撑了一千年，大部分时间已经不是西边最强的了'], ['西班牙', 1550, 1640, '#e08a2e', '波托西的银子和无敌舰队，约九十年'], ['荷兰', 1600, 1672, '#d16b8f', '公司和交易所，约七十年'], ['英国', 1815, 1945, '#3a6ea5', '从滑铁卢到二战结束，约一百三十年（从 1763 年算则将近两百年）'], ['美国', 1945, 2025, '#2a9d9a', '从 1945 年算，到今天八十年，还在算']];
  function life(){
    const svg = $('#rmSvg'), W = 600, H = 40 + L.length * 34, X0 = 110, X1 = 560;
    const X = y => X0 + (y + 600) / 2650 * (X1 - X0);
    let g = '';
    [-500, 1, 500, 1000, 1500, 2000].forEach(y => g += '<line x1="' + X(y) + '" x2="' + X(y) + '" y1="20" y2="' + (H - 10) + '" stroke="var(--rule)"/>' + txt(X(y), 14, y === 1 ? '公元' : yr(y), {s: 10.5, c: 'var(--ink-3)', halo: false}));
    L.forEach((l, i) => {
      const y = 34 + i * 34, us = l[0] === '美国';
      g += txt(X0 - 8, y + 5, l[0], {s: 12.5, a: 'end', halo: false}) + '<rect x="' + X(l[1]) + '" y="' + (y - 9) + '" width="' + Math.max(3, X(l[2]) - X(l[1])) + '" height="18" rx="3" fill="' + l[3] + '"/>';
      g += (us ? txt(X(l[2]) + 6, y + 5, '？', {s: 15, a: 'start', w: 1}) : '') + txt(X(l[2]) + (us ? 22 : 6), y + 5, Math.round(l[2] - l[1]) + ' 年', {s: 11, a: 'start', c: 'var(--ink-2)', halo: false});
    });
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    sayBox.className = 'say';
    sayBox.innerHTML = '<b>寿命越来越短了吗？</b>看起来像：雅典七十多年，罗马五百多年，英国一百多年，美国八十年还在算。可是这张图很依赖“从哪年算到哪年”：英国如果从 1763 年七年战争的胜利算起，就是将近两百年；罗马如果只算到三世纪危机，就是四百年；雅典如果算上它在文化上的影响，至今没有结束。<em>年份是人挑的，挑法一变，规律就变</em>。所以“霸主的寿命越来越短”这种说法，本书只当作一个有趣的问题，不当作结论（<b>存疑</b>）。<br><small>' + L.map(l => '<b>' + l[0] + '</b>：' + l[4]).join('；') + '。</small>';
  }
  function go(){
    rul.style.display = tab === 0 ? '' : 'none';
    $('#rmBars').style.display = tab === 0 ? '' : 'none';
    $('#rmQuiz').style.display = tab === 1 ? '' : 'none';
    $('#rmSvg').parentNode.style.display = tab === 2 ? '' : 'none';
    if (tab === 1) { sayBox.className = 'say'; sayBox.innerHTML = HINT; quiz(); return; }
    if (tab === 2) { life(); return; }
    const sc = W4.map((w, j) => {
      let s = 0, tw = 0;
      R.forEach((r, i) => { const v = r[2], mx = Math.max(...v), mn = Math.min(...v); const p = r[3] ? mn / v[j] * 100 : v[j] / mx * 100; s += p * wt[i]; tw += wt[i]; });
      return tw ? s / tw : 0;
    });
    const order = W4.map((w, j) => [w, sc[j], j]).sort((a, b) => b[1] - a[1]);
    $('#rmBars').innerHTML = order.map(o => '<div class="row"><span class="nm">' + o[0][0] + '</span><span class="tr"><i style="width:' + o[1] + '%;background:' + o[0][1] + '"></i></span><span class="v">' + Math.round(o[1]) + ' 分</span></div>').join('') +
      '<div class="lab" style="margin-top:8px">原始数字</div>' + R.map(r => '<div style="font-size:12.5px;color:var(--ink-3);line-height:1.6">' + r[0] + '（' + r[1] + '）：' + W4.map((w, j) => w[0] + ' ' + r[2][j]).join(' · ') + '</div>').join('');
    const top = order[0][0][0], allOff = wt.every(x => x === 0);
    sayBox.className = 'say';
    sayBox.innerHTML = allOff ? '<b>你什么都不看，</b>那就谁都一样。这其实也是一种答案。'
      : '<b>按你选的尺子，排第一的是' + top + '。</b>' + ({'美国': '看重钱、军费和货币，美国遥遥领先：这是“单极还没有结束”的读法。', '中国': '看重制造业、购买力和人口规模，中国排在前面：这是“东边在上升”的读法。', '欧盟': '欧盟在很多尺子上都排第二第三，加起来可能很靠前：可它在军事和外交上不是一个整体。', '印度': '看重人口和年轻，印度会冒出来：这是一个“三十年后再看”的读法。'})[top] + '<em>换一把尺子，答案就换了</em>。现实里，人们争论的往往不是事实，而是该用哪把尺子；而尺子本身，常常是由现在的霸主定的。';
  }
  go();
});
