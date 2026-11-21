
/* ---------- 装置 12：庞氏能撑多久 ---------- */
dev('#pzFig', fig => {
  function run(){
    const r = +$('#pzR').value / 100, g = +$('#pzG').value / 100, skim = +$('#pzS').value / 100;
    const POP = 100000, EACH = 2, T = 72; // 潜在客户 10 万人，每人 2 万
    let adopted = 50, pool = 0, total = 0, owed = 0, out = 0;
    const cohorts = []; // [进来的月份, 人数, 还在里面的人数]
    const S = [], TOT = [], NEED = [];
    let boom = -1;
    for (let t = 0; t < T; t++) {
      const newP = t === 0 ? adopted : Math.min(POP - adopted, g * adopted * (1 - adopted / POP));
      adopted += t === 0 ? 0 : newP;
      const inflow = newP * EACH;
      total += inflow; pool += inflow * (1 - skim);
      cohorts.push([t, newP, newP]);
      const active = cohorts.reduce((a, c) => a + c[2], 0);
      const interest = active * EACH * r;
      const quit = cohorts.reduce((a, c) => a + c[2] * .02, 0) * EACH; // 每月 2% 的人取回本金
      const need = interest + quit;
      NEED.push([t, need]); TOT.push([t, total]);
      if (pool < need) { boom = t; S.push([t, Math.max(0, pool)]); break; }
      pool -= need; cohorts.forEach(c => c[2] *= .98);
      S.push([t, pool]);
    }
    const end = boom < 0 ? T - 1 : boom;
    const ymax = Math.max(...TOT.map(p => p[1])) * 1.1 || 1;
    lineChart($('#pzSvg'), [{color: 'var(--och)', pts: TOT, w: 2}, {color: 'var(--main)', pts: S, w: 2.6}, {color: 'var(--red)', pts: NEED, w: 2}],
      {xmin: 0, xmax: Math.max(12, end + 2), ymin: 0, ymax, xt: [0, Math.round((end + 2) / 2), end + 2].filter((v, i, a) => a.indexOf(v) === i), xf: v => '第 ' + v + ' 月', yt: [0, ymax / 2, ymax].map(v => +v.toPrecision(2)), yf: v => fmt(v * 1e4), marks: boom >= 0 ? [[boom, '爆雷']] : []});
    // 谁拿回了本钱：在里面待得够久、利息累计 ≥ 本金的人
    const need0 = Math.ceil(1 / Math.max(r, 1e-9));
    const back = cohorts.filter(c => end - c[0] >= need0).reduce((a, c) => a + c[1], 0);
    const all = cohorts.reduce((a, c) => a + c[1], 0);
    kv($('#pzKv'), [['撑了', boom < 0 ? '超过 ' + T + ' 个月' : (boom + 1) + ' 个月'], ['累计进来', fmt(total * 1e4) + ' 元'], ['参与人数', fmt(all) + ' 人'], ['靠利息拿回本钱的人', Math.round(back / Math.max(all, 1) * 100) + '%']]);
    $('#pzSay').innerHTML = (boom < 0 ? '六年里还没爆雷：承诺的回报低、口碑扩散慢，它可以装成正经生意很久。这正是麦道夫的样子：<b>不惊人，所以没人查</b>。但它从第一天起就是一个窟窿，只是窟窿长得慢。' :
      '第 ' + (boom + 1) + ' 个月爆雷。<b>每月 ' + (r * 100).toFixed(1) + '%</b>，也就是一年约 ' + ((Math.pow(1 + r, 12) - 1) * 100).toFixed(0) + '%，要拿回本钱得在里面待满 ' + need0 + ' 个月；这样的人只占约 ' + Math.round(back / Math.max(all, 1) * 100) + '%，而且大多是最早进来、帮它做了口碑的那批人。') +
      ' 口碑传得越快，进来的钱越多，爆得也越早：<b>扩张最猛的时候，往往离崩溃最近</b>。';
  }
  slider('pzR', x => x + '% / 月', run); slider('pzG', x => x + '% / 月', run); slider('pzS', x => x + '%', run);
});

/* ---------- 装置 13：红灯 ---------- */
dev('#rfFig', fig => {
  const Q = [
    ['“恭喜您获得 618 大促免单资格！点击链接填写银行卡号和验证码即可领取。”', 1, '稀缺、互惠；任何要验证码的“领奖”都是红灯。正规平台不会通过陌生链接要你的验证码。'],
    ['“下周三下午两点，三号会议室开项目复盘会，请提前看一下附件里的数据。”', 0, '正常的工作通知：有时间地点、有具体事项，不要钱，也不催你马上做决定。'],
    ['“我们团队在做跨境电商，月入过万很轻松。先交 3980 元加盟费，送全套培训和货源。”', 1, '先交钱、收益夸张、“很轻松”。要你先付钱才能“上岗”的工作，十有八九是在卖“上岗”本身。'],
    ['“这只基金过去五年年化 7%，也有过一年跌 20% 的时候，风险等级中高，适合能承受波动的人。”', 0, '讲了收益也讲了亏损和风险等级。这不代表它适合你，但说法本身是正常的。'],
    ['“哥，我是你表弟的同学，最近急用钱，先借我五千，下周一定还，别告诉我表弟。”', 1, '喜好（攀关系）、急、要求保密。先打电话给“表弟”核实。'],
    ['“老师您好，我是出版社编辑，看了您的作品，想约稿，稿费和合同下周寄给您看。”', 0, '先给你看合同、不要你先交钱，是正常的约稿流程。（如果下一步是“先交审稿费、出版费”，那就变红了。）'],
    ['“内部消息，这只股票下周要重组，跟着老师买，保证翻倍。群里已经有三百多人赚了。”', 1, '权威（老师）、社会认同（三百人）、保证翻倍、内部消息。荐股群是证监会反复提醒的骗局形式。'],
    ['“您的快递丢失，我们将双倍理赔。请下载这个会议软件，开启屏幕共享，我教您操作退款。”', 1, '互惠（双倍理赔）、要你共享屏幕。屏幕共享能让对方看到你的验证码和银行页面。'],
    ['“下个月起房租每月涨 200 元，合同到期前可以提出异议，附上了周边同类房源的价格。”', 0, '有期限也有异议渠道，给了比较的依据。你可以不接受，但它不是骗局。'],
    ['“我是公安局的，你的账户涉嫌洗钱，为配合调查，请把资金转到我们的安全账户，并对家人保密。”', 1, '权威、恐惧、保密、转账到“安全账户”。公安机关不会通过电话要你转账，所谓“安全账户”一律是诈骗。']
  ];
  let i = 0, right = 0;
  const q = $('#rfQ'), b = $('#rfBtns'), sc = $('#rfScore');
  function show(){
    if (i >= Q.length) { q.className = 'say ' + (right >= 8 ? 'ok' : 'bad'); q.innerHTML = '十条做完，判断对了 <b>' + right + '</b> 条。现实中最难的不是这十条，而是来自你喜欢、信任的人的那一条。'; b.innerHTML = '<button class="btn pri">再做一遍</button>'; sc.textContent = ''; return; }
    q.className = 'say'; q.innerHTML = '第 ' + (i + 1) + ' 条：' + Q[i][0];
    b.innerHTML = '<button class="btn" data-a="1">可疑</button><button class="btn" data-a="0">看起来正常</button>';
    sc.textContent = '已答对 ' + right + ' / ' + i;
  }
  b.addEventListener('click', e => {
    const x = e.target.closest('button'); if (!x) return;
    if (i >= Q.length) { i = 0; right = 0; return show(); }
    if (x.dataset.a == null) { i++; return show(); }
    const ok = +x.dataset.a === Q[i][1]; if (ok) right++;
    q.className = 'say ' + (ok ? 'ok' : 'bad'); q.innerHTML = (ok ? '对。' : '再想想。') + (Q[i][1] ? '这条可疑：' : '这条看起来正常：') + Q[i][2];
    b.innerHTML = '<button class="btn pri">下一条</button>';
    sc.textContent = '已答对 ' + right + ' / ' + (i + 1);
  });
  show();
});
