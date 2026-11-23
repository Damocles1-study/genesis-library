/* ---------- 装置 1：一栋楼称一称 ---------- */
dev('#wtFig', () => {
  /* [名字, 每平方米吨数, 混凝土立方米/㎡, 钢 公斤/㎡, 说明, 最多层数] */
  const T = [
    ['土坯平房', 2.0, 0, 0, '墙厚，重量几乎全在墙上', 2],
    ['砖混楼', 1.3, 0.2, 20, '砖墙承重、混凝土楼板，多见于七层以下', 7],
    ['钢筋混凝土住宅', 1.4, 0.4, 50, '今天中国城市住宅最常见的做法', 100],
    ['钢结构写字楼', 0.9, 0.15, 110, '钢骨架加压型钢板楼面', 100],
    ['木结构（轻型 / 胶合木）', 0.35, 0.03, 8, '欧美独栋住宅和新一代木楼', 20]
  ];
  let cur = 2;
  btnRow($('#wtBtns'), T.map(t => t[0]), cur, i => { cur = i; const n = $('#wtN'); n.max = T[i][5]; if (+n.value > T[i][5]) n.value = T[i][5]; n.dispatchEvent(new Event('input')); });
  const A = slider('wtA', v => v + ' ㎡', () => draw());
  const N = slider('wtN', v => v + ' 层', () => draw());
  function draw(){
    const t = T[cur], area = A() * N(), mass = area * t[1];
    const conc = area * t[2], steel = area * t[3] / 1000;
    kv($('#wtKv'), [['建筑面积', fmt(area) + ' ㎡'], ['整栋重约', fmt(mass) + ' 吨'], ['混凝土', fmt(conc) + ' m³'], ['钢材', fmt(steel) + ' 吨'], ['搅拌车（每车约 10 m³）', fmt(Math.ceil(conc / 10)) + ' 车']]);
    const cmp = [['成年人（65 公斤）', mass / 0.065], ['非洲象（约 5 吨）', mass / 5], ['蓝鲸（约 150 吨）', mass / 150], ['万吨巨轮', mass / 10000], ['胡夫金字塔', mass / 6e6]];
    const logMax = Math.log10(Math.max(...cmp.map(c => c[1]), 10));
    bars($('#wtBars'), cmp.map(c => [c[0], Math.max(0, Math.log10(Math.max(c[1], 1))), '', 'var(--main)']), logMax, v => '');
    $$('#wtBars .row .v').forEach((el, i) => { const v = cmp[i][1]; el.textContent = v >= 1 ? fmt(v) + ' 个' : (v * 100).toFixed(v < 0.01 ? 2 : 1) + '%'; });
    const pyr = 6e6 / mass;
    $('#wtSay').innerHTML = t[0] + '：' + t[4] + '。这栋楼约 <b>' + fmt(mass) + ' 吨</b>，相当于 ' + fmt(mass / 5) + ' 头大象' +
      (pyr > 1 ? '；要 ' + fmt(pyr) + ' 栋这样的楼才抵得上一座胡夫金字塔。' : '，比胡夫金字塔还重。') +
      (cur === 2 && N() >= 20 ? ' 压在最底下那几根柱子上的，是上面每一户人家的重量加起来。' : '') +
      (cur === 4 ? ' 木头楼轻得多，地基和抗震都省事，但要对付防火和防潮。' : '');
  }
  draw();
});
