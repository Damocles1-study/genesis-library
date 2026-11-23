/* ---------- 封面装置：拆一份外卖 ---------- */
/* 原料：[名字, 出生地, 经度, 纬度, 大约多少年前, 说明, 是否 1500 年后才从美洲进中国, 大洲] */
const ING = {
  rice: ['稻米', '长江中下游', 120, 30, 9000, '约一万年前开始种，九千到七千年前慢慢驯化成', 0, '亚'],
  wheat: ['小麦', '新月沃地', 40, 37, 10500, '约一万年前驯化，约四千五百年前到中国', 0, '亚'],
  chicken: ['鸡', '东南亚大陆', 101, 16, 3500, '约三千五百年前；起初多半不是为了吃', 0, '亚'],
  pig: ['猪', '安纳托利亚 / 黄河流域', 112, 34, 9000, '约一万年前在西亚、约九千年前在中国各驯化一次', 0, '亚'],
  cattle: ['牛', '新月沃地', 41, 36, 10500, '约一万年前由野牛驯化', 0, '亚'],
  milk: ['牛奶', '西亚', 38, 38, 9000, '约九千年前的陶片上已有奶脂', 0, '亚'],
  tomato: ['番茄', '墨西哥（野生祖先在安第斯）', -97, 19, 2500, '驯化年代不详，至少两千多年前；中国人大量吃是二十世纪的事', 1, '美'],
  chili: ['辣椒', '墨西哥', -98, 21, 6000, '约六千年前；1591 年的中国书里第一次出现', 1, '美'],
  potato: ['土豆', '安第斯高原', -70, -15, 8000, '约八千年前；明末清初进中国', 1, '美'],
  maize: ['玉米', '墨西哥', -101, 18, 9000, '约九千年前由一种野草驯化', 1, '美'],
  sweet: ['红薯', '中美洲 / 南美北部', -84, 9, 5000, '五千年以上；1593 年由福建商人带回', 1, '美'],
  peanut: ['花生（油）', '南美', -60, -22, 7000, '约七千年前；明代进中国', 1, '美'],
  cassava: ['木薯（珍珠）', '亚马孙南缘', -58, -12, 8000, '约八千年前；十九世纪才到中国南方', 1, '美'],
  soy: ['大豆', '中国北方', 116, 37, 5000, '至少五千年前，东亚驯化', 0, '亚'],
  tofu: ['豆腐', '中国', 117, 32, 1000, '最晚宋代已很普遍；“淮南王发明”是传说', 0, '亚'],
  sauce: ['酱油', '中国', 114, 35, 800, '“酱”有三千年，“酱油”这个词宋代才见到', 0, '亚'],
  onion: ['洋葱', '中亚', 65, 40, 5000, '约五千年前；清代才在中国普及', 0, '亚'],
  garlic: ['大蒜', '中亚', 70, 41, 5000, '汉代以后进中原；“张骞带回”是后人附会', 0, '亚'],
  scallion: ['葱', '中国', 108, 36, 3000, '先秦已有', 0, '亚'],
  ginger: ['姜', '东南亚 / 华南', 110, 22, 2500, '《论语》说孔子“不撤姜食”', 0, '亚'],
  sichuan: ['花椒', '中国', 104, 31, 3000, '《诗经》里就有', 0, '亚'],
  coriander: ['香菜', '地中海', 25, 37, 3000, '汉晋以后进中国，旧名“胡荽”', 0, '欧'],
  lettuce: ['生菜', '埃及 / 地中海东岸', 31, 29, 4500, '古埃及墓画里就有', 0, '非'],
  cabbage: ['白菜', '中国江南', 120, 31, 600, '大白菜明清才普及；更早的主菜叫“葵”', 0, '亚'],
  sugar: ['糖', '新几内亚（甘蔗）', 145, -6, 8000, '甘蔗约八千年前在新几内亚种植；把它熬成糖是印度人的发明', 0, '洋'],
  tea: ['茶', '中国西南', 100, 24, 2000, '汉代已有买茶的记载', 0, '亚'],
  mung: ['绿豆', '印度', 78, 22, 4500, '约四千五百年前', 0, '亚'],
  sesame: ['芝麻', '印度河流域', 70, 27, 4500, '约四千五百年前；旧名“胡麻”', 0, '亚'],
  cola: ['可乐', '美国亚特兰大', -84, 34, 140, '1886 年一位药剂师调出来的', 0, '美'],
  pepper: ['胡椒', '印度西南海岸', 76, 11, 3200, '三千二百年前，法老的木乃伊鼻孔里塞着胡椒粒', 0, '亚']
};
const DISH = [
  ['黄焖鸡米饭', ['chicken', 'rice', 'potato', 'chili', 'sauce', 'ginger', 'scallion', 'sugar']],
  ['番茄炒蛋盖饭', ['tomato', 'chicken', 'rice', 'scallion', 'sugar', 'peanut']],
  ['麻辣烫', ['chili', 'sichuan', 'potato', 'tofu', 'soy', 'cabbage', 'sweet', 'cattle', 'sesame']],
  ['牛肉拉面', ['wheat', 'cattle', 'chili', 'coriander', 'garlic', 'scallion', 'pepper']],
  ['汉堡薯条可乐', ['wheat', 'cattle', 'lettuce', 'tomato', 'onion', 'milk', 'potato', 'cola', 'sugar']],
  ['煎饼果子', ['mung', 'wheat', 'chicken', 'scallion', 'coriander', 'sauce', 'sesame']],
  ['珍珠奶茶', ['tea', 'milk', 'sugar', 'cassava']]
];
const ageCol = y => y >= 8000 ? 'var(--grn)' : y >= 4000 ? 'var(--blu)' : y >= 1000 ? 'var(--och)' : 'var(--red)';
const ageTxt = y => y >= 10000 ? '约 ' + (y / 10000).toFixed(y % 10000 ? 2 : 0).replace(/0$/, '') + ' 万年' : y >= 1000 ? '约 ' + Math.round(y / 100) * 100 + ' 年' : '约 ' + y + ' 年';
dev('#cvFig', () => {
  const svg = $('#cvMap'), list = $('#cvList'), say = $('#cvSay');
  const m = worldMap({lon0: -125, lon1: 160, lat0: -38, lat1: 60, W: 600});
  svg.setAttribute('viewBox', '0 0 ' + m.W + ' ' + m.H);
  function show(i){
    const keys = DISH[i][1], items = keys.map(k => ING[k]);
    let g = m.svg;
    const home = m.P(114, 30);
    items.forEach((it, j) => {
      const p = m.P(it[2], it[3]);
      g += '<path d="M' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + 'Q' + ((p[0] + home[0]) / 2).toFixed(1) + ',' + (Math.min(p[1], home[1]) - 30).toFixed(1) + ' ' + home[0].toFixed(1) + ',' + home[1].toFixed(1) + '" fill="none" stroke="' + ageCol(it[4]) + '" stroke-width="1.2" stroke-opacity=".55"' + (it[6] ? ' stroke-dasharray="3 3"' : '') + '/>';
    });
    items.forEach((it, j) => {
      const p = m.P(it[2], it[3]);
      g += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="6.5" fill="' + ageCol(it[4]) + '" stroke="var(--card)" stroke-width="1.5"/>';
      g += txt(p[0] + 8, p[1] - 6 + (j % 2) * 19, it[0], {s: 15, a: 'start'});
    });
    g += '<circle cx="' + home[0] + '" cy="' + home[1] + '" r="4" fill="none" stroke="var(--ink)" stroke-width="1.5"/>';
    svg.innerHTML = g;
    list.innerHTML = items.map(it => '<div class="' + (it[6] ? 'new' : '') + '" style="--c:' + ageCol(it[4]) + '"><b>' + it[0] + '</b>' + ageTxt(it[4]) + '<small>' + it[1] + ' · ' + it[5] + '</small></div>').join('');
    const old = items.reduce((a, b) => a[4] >= b[4] ? a : b), young = items.reduce((a, b) => a[4] <= b[4] ? a : b);
    const am = items.filter(it => it[6]);
    const conts = new Set(items.map(it => it[7]));
    say.innerHTML = '一份' + DISH[i][0] + '，' + items.length + ' 样原料，来自' + conts.size + '个大洲（或大洋上的岛）。最老的是<b>' + old[0] + '</b>（' + ageTxt(old[4]) + '），最年轻的是<b>' + young[0] + '</b>（' + ageTxt(young[4]) + '）。' +
      (am.length ? '如果你活在 1500 年的中国，这份饭里的<b>' + am.map(x => x[0]).join('、') + '</b>你见都没见过，它们那时还在大洋另一边。' : '这份饭里没有美洲来的东西，1500 年的中国人大体也能吃到，不过多半没这么便宜。');
  }
  btnRow($('#cvBtns'), DISH.map(d => d[0]), 0, show);
  show(0);
  const leg = document.createElement('div'); leg.className = 'legend';
  leg.innerHTML = [['var(--grn)', '八千年以上'], ['var(--blu)', '四千到八千年'], ['var(--och)', '一千到四千年'], ['var(--red)', '一千年以内']].map(x => '<span><i style="background:' + x[0] + '"></i>' + x[1] + '</span>').join('') + '<span>虚线：1500 年后从美洲来的 · 黑圈：你（假设在中国）</span>';
  svg.parentNode.after(leg);
});
