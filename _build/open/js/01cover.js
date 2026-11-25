/* ---------- 封面装置：一张岔路图 ---------- */
dev('#forkFig', fig => {
  const qs = $('#forkQs'), out = $('#forkOut');
  const ch = (id, t) => '<a data-c="' + id + '" href="' + href(id) + '">' + t + '</a>';
  /* 每一步：问题、选项（下一步或者终点） */
  const Q = {
    q1: {p: '2026 年 12 月，考研一战。', o: [['上岸', 'A'], ['没上', 'q2']]},
    q2: {p: '2027 年春天，先考一个事业编。', o: [['上岸', 'B'], ['没上', 'q3']]},
    q3: {p: '下半年准备二战和家乡的公务员。这一年怎么过？', o: [['在家全职备考', 'q4'], ['找份工作，边上班边考', 'q4w']]},
    q4: {p: '2027 年底到 2028 年春天，结果出来了。', o: [['二战上岸', 'A2'], ['公务员上岸', 'C'], ['都没上', 'q5']]},
    q4w: {p: '2027 年底到 2028 年春天，结果出来了。', o: [['二战上岸', 'A2'], ['公务员上岸', 'C'], ['都没上，但手里有份工作', 'D'], ['都没上，工作也没了', 'E']]},
    q5: {p: '这时手里有没有一份工作？', o: [['先找一份工作再说', 'D'], ['一时找不到，也没积蓄', 'E']]}
  };
  const R = {
    A: {t: '读研', first: '研一把课和导师的事顺下来；技术方向的人，有空把几个小项目做成能给人看的作品。', side: '可以做零成本的小项目、接一点不占整块时间的活，但先看学校和导师对兼职的规定；别让它拖延毕业。', worst: '最坏是副业拖了科研、延期毕业：亏的是时间，不是钱。', read: ['c6', 'c9', 'c11']},
    A2: {t: '晚一年读研', first: '空出来的这段时间，可以上一段班或者实习，把简历上那一年填上。', side: '同上：零成本、不占整块时间的小项目可以，开店、囤货、借钱都不必。', worst: '最坏是多花了一年：二十三四岁的一年，代价比四十岁的一年小得多。', read: ['c5', 'c13', 'c15']},
    B: {t: '在编（事业单位）', first: '先把试用期过了，把本职工作做熟。编制里最值钱的东西是“稳”，别为一点外快去碰它。', side: '多数事业单位不允许工作人员违规经商、办企业、兼职取酬，有的岗位可以按规定兼职，以本单位规定为准。能做的通常是学习、考证、业余的兴趣。', worst: '最坏是违规经营被处分，丢了编制：这一条亏得最多，一定先问清楚。', read: ['c13', 'c5']},
    C: {t: '公务员', first: '同上：试用期、本职、规矩。', side: '《公务员法》明确禁止公务员违反规定从事或者参与营利性活动、在企业兼职。副业这条路基本是关着的，想做生意，就要想清楚是不是离开这个系统。', worst: '最坏是违纪处分。想清楚以后再决定，别边在里面边偷偷做。', read: ['c13', 'c16']},
    D: {t: '先上班', first: '在一家公司里把一门本事学到能卖钱的程度：看清一个行业怎样赚钱、客户在哪里、钱怎样流。这是第五章讲的那条最常见的路。', side: '可以利用晚上和周末做零成本的小项目或接活，但先看劳动合同里有没有兼职和竞业限制的约定，别用公司的资源和客户。', worst: '最坏是副业没做起来：亏的是一些业余时间。主业的工资是你的安全垫。', read: ['c5', 'c6', 'c15']},
    E: {t: '三无：没工作、没积蓄、没门路', first: '先保住底线：吃饭、住处、社保不断。然后找一份能马上有收入的活（哪怕是临时的），同时选一门手艺往深里学。毕业两年内的择业期，有的考试还可以按应届生报名，别轻易放弃这个身份，具体看当年的公告。', side: '可以，而且只能做零成本的：接活、做服务、卖手艺，不囤货、不租铺面、不借钱。第一笔钱从别人付给你的钱里来，不从借来的钱里来。', worst: '最坏是一年没赚到钱：只要没借钱、没交加盟费，亏的就是一年时间和一点生活费，还能回头找工作、再考。', read: ['c14', 'c15', 'c3']}
  };
  let path = [];
  function render(){
    let html = '', key = 'q1', i = 0;
    while (key && Q[key]) {
      const q = Q[key], pick = path[i];
      html += '<div class="q"><p><b>' + (i + 1) + '.</b> ' + q.p + '</p><div class="btns">' + q.o.map((o, j) => '<button class="btn' + (pick === j ? ' on' : '') + '" data-i="' + i + '" data-j="' + j + '">' + o[0] + '</button>').join('') + '</div></div>';
      if (pick == null) { key = null; break; }
      key = q.o[pick][1]; i++;
    }
    qs.innerHTML = html;
    if (key && R[key]) {
      const r = R[key];
      let trail = '', k2 = 'q1';
      path.forEach((p, n) => { const o = Q[k2].o[p]; trail += '<span class="' + (/上岸|先找|手里有/.test(o[0]) ? 'o' : /没上|没了|找不到/.test(o[0]) ? 'x' : '') + '">' + o[0] + '</span>'; k2 = o[1]; });
      const full = path.length > 2 && Q.q3 && path[2] === 0;
      out.innerHTML = '<div class="road"><div class="trail">' + trail + '</div><h5>' + r.t + '</h5><dl>' +
        '<dt>第一步</dt><dd>' + r.first + '</dd>' +
        '<dt>顺带做点小生意？</dt><dd>' + r.side + '</dd>' +
        '<dt>最多亏多少</dt><dd>' + r.worst + '</dd>' +
        (full ? '<dt>全职备考那一年</dt><dd>别在这一年开张。生意和考试抢的是同一样东西：整块的时间和心思。</dd>' : '') +
        '<dt>读这几章</dt><dd>' + r.read.map(id => { const t = TOC.find(x => x.id === id); return ch(id, t.n + ' · ' + t.t); }).join('　') + '</dd></dl></div>';
      $$('a[data-c]', out).forEach(a => { if (chapPage[a.dataset.c] > READY) { a.removeAttribute('href'); a.title = '写作中'; a.style.textDecorationStyle = 'dotted'; } });
    } else out.innerHTML = '<div class="say">' + (path.length ? '接着往下点。' : '从第一步点起。') + '</div>';
  }
  qs.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const i = +b.dataset.i, j = +b.dataset.j; path = path.slice(0, i); path[i] = j; render(); });
  render();
});
