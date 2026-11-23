/* ---------- 装置 16：你敢吃吗 ---------- */
dev('#dgFig', () => {
  /* [食物, 说明, 在哪儿是家常, 中国常见?] */
  const F = [
    ['皮蛋', '鸭蛋用碱和盐裹几个星期，蛋白变成黑色透明的冻', '中国各地，配豆腐、熬粥', 1],
    ['臭豆腐', '豆腐泡进发酵的卤水，闻着臭、吃着香', '长沙、绍兴、台湾的夜市', 1],
    ['蓝纹奶酪', '奶酪里特意种上青霉菌，一道道蓝绿色的霉纹', '法国、英国、意大利', 0],
    ['瑞典鲱鱼罐头', '鲱鱼在罐子里继续发酵，罐子会鼓起来，开罐要在户外', '瑞典北部，夏末的聚会', 0],
    ['炸蚕蛹', '缫丝剩下的蚕蛹，油炸或爆炒', '东北、山东、江浙', 1],
    ['焗蜗牛', '蜗牛加黄油、大蒜、香芹，放回壳里烤', '法国，节日的前菜', 0],
    ['凤爪', '鸡爪卤、蒸或泡椒', '广东早茶、全国的卤味店', 1],
    ['牛蛙 / 青蛙腿', '炒、烤、干锅', '中国南方；法国人吃青蛙腿', 1],
    ['羊杂碎布丁', '羊心、肝、肺切碎，加燕麦和板油，塞进羊胃里煮', '苏格兰，彭斯之夜必吃', 0],
    ['发酵鲨鱼肉', '格陵兰鲨鱼肉本身有毒，埋起来发酵几个月再风干', '冰岛，冬季的传统宴席', 0],
    ['炸蜂蛹', '蜂巢里的幼虫和蛹，油炸后撒盐', '云南、贵州；日本长野', 1],
    ['卡苏马苏奶酪', '让苍蝇在羊奶酪里产卵，幼虫把奶酪“吃软”，带着活的幼虫吃', '意大利撒丁岛（受卫生法规限制）', 0]
  ];
  const ans = F.map(() => null);
  const box = $('#dgQ');
  function list(){
    box.innerHTML = F.map((f, i) => '<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;background:var(--paper);border-radius:6px;padding:6px 10px;font-size:14.5px;line-height:1.55"><span><b style="font-family:var(--f-display);font-weight:400;font-size:17px">' + f[0] + '</b><br><small style="color:var(--ink-3)">' + f[1] + (ans[i] != null ? ' · <b style="color:var(--ink-2)">' + f[2] + '</b>' : '') + '</small></span><span class="btns" style="margin:0;flex-wrap:nowrap"><button class="btn' + (ans[i] === 1 ? ' on' : '') + '" data-i="' + i + '" data-v="1">敢</button><button class="btn' + (ans[i] === 0 ? ' on' : '') + '" data-i="' + i + '" data-v="0">不敢</button></span></div>').join('');
  }
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; ans[+b.dataset.i] = +b.dataset.v; list(); say(); });
  function say(){
    const done = ans.filter(a => a != null).length;
    if (done < F.length) { $('#dgSay').textContent = '还剩 ' + (F.length - done) + ' 样。'; return; }
    const no = F.filter((f, i) => ans[i] === 0);
    const cnNo = F.filter((f, i) => f[3] && ans[i] === 0).length, cnAll = F.filter(f => f[3]).length;
    const fNo = no.length - cnNo, fAll = F.length - cnAll;
    $('#dgSay').innerHTML = (no.length ? '你拒绝了 <b>' + no.length + '</b> 样：' + no.map(f => f[0] + '（' + f[2] + '）').join('；') + '。每一样，都有人从小吃到大，觉得香。' : '十二样全敢，你是天生的旅行家。') +
      (no.length ? '<br>中国常见的 ' + cnAll + ' 样里你拒绝了 ' + cnNo + ' 样，外国的 ' + fAll + ' 样里拒绝了 ' + fNo + ' 样。' + (fNo / fAll > cnNo / cnAll + 0.15 ? '<b>越是没见过的，越觉得恶心</b>：这正是罗津说的，恶心是跟着身边的人学来的。一个瑞典人做这份测验，结果多半正好反过来。' : '你对家乡的和外国的东西差不多一样挑剔，或者一样大胆。') : '');
  }
  list(); say();
});
