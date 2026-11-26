
/* ---------- 第六章：一棵家谱树 ---------- */
dev('#treeFig', () => {
  /* [名字, 开始, 结束(null=还在), 停了吗, 说明] */
  const L = [
    ['Java 版', 2009.4, null, 0, '最早的那个版本，用 Java 写的，在 Windows、苹果电脑和 Linux 上玩。模组最多。小格玩的就是它。'],
    ['手机版 → 基岩版', 2011.6, null, 0, '2011 年先出了手机版，用 C++ 重新写。2017 年和 Windows 10 版、Xbox 版合成“基岩版”，后来加上 Switch 和 PlayStation，能跨设备一起玩。豆子玩的是它。'],
    ['老游戏机版', 2012.35, 2018.9, 1, '2012 年起在老一代游戏机上出的版本，由另一家工作室做。后来大家都换到了基岩版，老版本不再更新。'],
    ['树莓派版', 2013.1, 2013.9, 1, '2013 年给一种很便宜的小电脑“树莓派”做的免费版本，只有创造模式，可以用 Python 写程序来盖东西。只出了很少几版就不再更新了，第二部会讲到它。'],
    ['故事模式', 2015.8, 2019.5, 1, '一个讲故事、靠选择推进剧情的游戏，由另一家公司做。那家公司关门以后，2019 年下架。'],
    ['教育版', 2016.85, null, 0, '给学校用的版本，老师可以布置任务，里面有化学实验和编程用的小机器人。第三部会细讲。'],
    ['中国版', 2017.3, null, 0, '网易在中国运营的版本，下载免费，要实名注册。'],
    ['我的世界：地球', 2019.5, 2021.5, 1, '拿着手机在真实的街道上找方块、放方块的游戏。疫情里大家很少出门，2021 年 6 月关闭。'],
    ['我的世界：地下城', 2020.4, null, 0, '几个人一起打地牢、闯关的游戏，画面是从斜上方往下看。'],
    ['我的世界：传奇', 2023.3, 2024.1, 1, '指挥一支队伍保卫村庄的策略游戏。2024 年初宣布不再加新内容。'],
    ['大电影', 2025.26, 2025.5, 0, '2025 年 4 月上映的真人电影，全世界票房约九亿多美元。']
  ];
  const sv = $('#treeSvg'), x0 = 132, x1 = 588, y0 = 30, rh = 24, X = y => x0 + (y - 2009) / (2027 - 2009) * (x1 - x0);
  let sel = -1;
  function draw(){
    const H = y0 + L.length * rh + 26;
    let g = '';
    [2009, 2012, 2015, 2018, 2021, 2024, 2027].forEach(y => g += '<line x1="' + X(y) + '" x2="' + X(y) + '" y1="' + (y0 - 8) + '" y2="' + (H - 22) + '" stroke="var(--rule)"/>' + txt(X(y), H - 8, y, {s: 11, c: 'var(--ink-3)', halo: false}));
    g += '<line x1="' + X(2014.7) + '" x2="' + X(2014.7) + '" y1="' + (y0 - 14) + '" y2="' + (H - 22) + '" stroke="var(--zhu)" stroke-dasharray="3 3"/>' + txt(X(2014.7) + 4, y0 - 16, '2014 微软买下', {s: 10.5, a: 'start', c: 'var(--zhu)'});
    L.forEach((l, i) => {
      const y = y0 + i * rh, end = l[2] == null ? 2026.9 : l[2], dead = l[3];
      g += '<g class="row" data-i="' + i + '" style="cursor:pointer"><rect x="0" y="' + (y - 2) + '" width="600" height="' + rh + '" fill="' + (i === sel ? 'color-mix(in srgb,var(--main) 12%,transparent)' : 'transparent') + '"/>';
      g += txt(x0 - 8, y + 14, l[0], {s: 12, a: 'end', c: dead ? 'var(--ink-3)' : 'var(--ink)'});
      g += '<rect x="' + X(l[1]) + '" y="' + (y + 4) + '" width="' + Math.max(5, X(end) - X(l[1])) + '" height="13" rx="2" fill="' + (dead ? 'var(--stone)' : 'var(--main)') + '" opacity="' + (dead ? .55 : .9) + '"/>';
      if (l[2] == null && l[0] !== '大电影') g += '<path d="M' + X(2026.9) + ',' + (y + 4) + 'l7,6.5l-7,6.5z" fill="var(--main)"/>';
      if (dead) g += txt(X(end) + 4, y + 15, '停', {s: 11, a: 'start', c: 'var(--zhu)'});
      g += '</g>';
    });
    sv.setAttribute('viewBox', '0 0 600 ' + H); sv.innerHTML = g;
  }
  sv.addEventListener('click', e => {
    const r = e.target.closest('.row'); if (!r) return;
    sel = +r.dataset.i; const l = L[sel];
    $('#treeSay').innerHTML = '<b>' + l[0] + '</b>（' + Math.floor(l[1]) + (l[2] == null ? ' 年至今' : l[0] === '大电影' ? ' 年' : '—' + Math.floor(l[2]) + ' 年') + '）：' + l[4];
    draw();
  });
  draw();
});
