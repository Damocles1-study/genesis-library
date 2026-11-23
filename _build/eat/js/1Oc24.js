/* ---------- 装置 25：一盘菜的碳 ---------- */
dev('#co2Fig', () => {
  /* 公斤二氧化碳当量 / 公斤食物（普尔与内梅切克 2018，全球平均，约数） */
  const P = [['肉牛的牛肉', 99.5], ['羊肉', 39.7], ['养殖虾', 26.9], ['猪肉', 12.3], ['养殖鱼', 13.6], ['鸡肉', 9.9], ['鸡蛋', 4.7], ['豆腐', 3.2]];
  const S = [['米饭', 4.5], ['面条', 1.6], ['土豆', 0.5]];
  const VEG = 0.53;
  let p = 0, s = 0;
  btnRow($('#co2P'), P.map(x => x[0]), 0, i => { p = i; draw(); });
  btnRow($('#co2S'), S.map(x => x[0]), 0, i => { s = i; draw(); });
  const plate = (pi, si) => P[pi][1] * 0.1 + S[si][1] * 0.1 + VEG * 0.2;
  function draw(){
    const rows = P.map((x, i) => [x[0] + ' + ' + S[s][0], plate(i, s), '', i === p ? 'var(--main)' : 'var(--ink-3)']);
    bars($('#co2Bars'), rows, plate(0, s), v => v.toFixed(2) + ' kg');
    const v = plate(p, s), km = v / 0.17;
    const parts = [['主菜', P[p][1] * 0.1], ['主食', S[s][1] * 0.1], ['蔬菜', VEG * 0.2]];
    $('#co2Say').innerHTML = '这盘' + P[p][0] + '配' + S[s][0] + '，大约排放 <b>' + v.toFixed(2) + ' 公斤</b>二氧化碳当量，相当于开车约 ' + km.toFixed(km < 10 ? 1 : 0) + ' 公里；其中主菜占 ' + Math.round(parts[0][1] / v * 100) + '%。' +
      (p <= 1 ? '牛羊是反刍动物，胃里的微生物会产生大量甲烷，又要占很多草场和饲料地。<b>换成鸡肉或豆腐，同一盘饭的碳能少一大半</b>。' : p === 7 ? '豆腐这盘，排放只有牛肉那盘的几十分之一。' : '') +
      (s === 0 ? '米饭比面条高，是因为水田里会产生甲烷。' : '') + '这不是说谁都该吃素，只是说明：<b>盘子里的选择，在地球的账本上分量差别很大</b>。';
  }
  draw();
});

/* ---------- 尾声装置：你的小票 ---------- */
dev('#myFig', () => {
  const EXTRA = {
    coffee: ['咖啡', '埃塞俄比亚（饮用始于也门）', 38, 8, 550, '十五世纪也门的苏菲派开始喝', 0, '非'],
    cocoa: ['可可', '南美亚马孙上游', -78, -3, 5300, '约五千多年前；能嚼的巧克力 1847 年才有', 1, '美']
  };
  const DB = Object.assign({}, ING, EXTRA);
  const AL = [
    ['rice', '米饭 大米 粥 炒饭 盖饭 饭团 年糕 米粉 米线 寿司 饭'], ['wheat', '面条 面包 馒头 包子 饺子 面 饼 披萨 汉堡 蛋糕 饼干 馄饨 麦'],
    ['chicken', '鸡蛋 蛋 鸡'], ['pig', '猪 排骨 火腿 培根 红烧肉 回锅肉 叉烧 腊肉 香肠'], ['cattle', '牛肉 牛排 牛腩 汉堡 牛'],
    ['milk', '奶茶 牛奶 酸奶 奶酪 芝士 拿铁 奶'], ['tomato', '番茄 西红柿'], ['chili', '辣椒 青椒 剁椒 麻辣 辣'], ['potato', '土豆 马铃薯 薯条 洋芋 薯片'],
    ['maize', '玉米 爆米花'], ['sweet', '红薯 地瓜 番薯 粉丝 粉条 酸辣粉'], ['peanut', '花生'], ['cassava', '珍珠 木薯'], ['soy', '豆浆 黄豆 大豆 毛豆'],
    ['tofu', '豆腐 豆干 腐竹 豆皮'], ['sauce', '酱油 红烧 生抽 老抽 黄焖'], ['onion', '洋葱'], ['garlic', '蒜'], ['scallion', '葱'], ['ginger', '姜'],
    ['sichuan', '花椒 麻辣 麻婆'], ['coriander', '香菜'], ['lettuce', '生菜'], ['cabbage', '白菜'], ['sugar', '糖 奶茶 可乐 蛋糕 甜'], ['tea', '茶'],
    ['mung', '绿豆'], ['sesame', '芝麻 麻酱'], ['cola', '可乐'], ['pepper', '胡椒 黑椒'], ['coffee', '咖啡 拿铁 美式'], ['cocoa', '巧克力 可可']
  ].map(a => [a[0], a[1].split(' ')]);
  function go(){
    const raw = $('#myIn').value.trim();
    const toks = raw.split(/[、，,；;\s\/+和]+/).filter(Boolean);
    const got = [], miss = [];
    toks.forEach(t => {
      let hit = false;
      AL.forEach(a => { if (a[1].some(w => t.includes(w) && !(w === '饭' && /玉米/.test(t)))) { hit = true; if (!got.includes(a[0])) got.push(a[0]); } });
      if (!hit) miss.push(t);
    });
    const items = got.map(k => DB[k]).sort((a, b) => b[4] - a[4]);
    const d = new Date(), ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    if (!items.length) { $('#myBill').innerHTML = '<div class="say">没认出原料。试试写得具体一点，比如“米饭、番茄炒蛋、可乐”。</div>'; return; }
    const am = items.filter(x => x[6]), conts = new Set(items.map(x => x[7]));
    $('#myBill').innerHTML = '<div class="bill"><span class="fic">你的</span><div class="shop">你的饭桌</div><div class="sub">' + ds + ' · 你在的地方</div><div class="cut"></div>' +
      '<div class="meta"><span>点了</span><span>' + esc(raw) + '</span></div><div class="cut"></div><table>' +
      items.map(x => '<tr><td class="item">' + x[0] + '<small>' + x[1] + ' · ' + x[5] + '</small></td><td></td><td>' + ageTxt(x[4]) + '</td></tr>').join('') +
      '</table><div class="cut"></div><div class="tot"><span>合计</span><span>' + items.length + ' 样 · ' + conts.size + ' 个大洲</span></div>' +
      '<div class="ft">最老的是' + items[0][0] + '（' + ageTxt(items[0][4]) + '），最年轻的是' + items[items.length - 1][0] + '（' + ageTxt(items[items.length - 1][4]) + '）' + (am.length ? ' · 1500 年的中国人吃不到：' + am.map(x => x[0]).join('、') : '') + '</div>' +
      '<div class="real"><b>真的部分</b>这一顿是真的，你刚吃过（或者正要吃）。' + (miss.length ? '没认出来的：' + esc(miss.join('、')) + '。' : '') + '谢谢你读完这本书。吃了吗？</div></div>';
  }
  $('#myGo').addEventListener('click', go);
  $('#myIn').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  go();
});
