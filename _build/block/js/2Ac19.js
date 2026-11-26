
/* ---------- 第十九章：比例尺 ---------- */
dev('#scaleFig', () => {
  /* [名字, 面积（平方米）, 最高处（米）, 说明] */
  const P = [['你的卧室', 14, 2.8, '约 4 × 3.5 米'], ['学校操场', 2e4, 15, '约 200 × 100 米，最高的是教学楼'], ['故宫', 7.2e5, 35, '约 961 × 753 米，最高的是太和殿'], ['一个县城', 5e7, 100, '约 50 平方千米，示意'], ['丹麦', 4.3e10, 171, '约 4.3 万平方千米，最高处约 171 米'], ['大不列颠岛及周边', 2.24e11, 1345, '约 22.4 万平方千米，最高的本尼维斯山约 1345 米'], ['中国', 9.6e12, 8849, '约 960 万平方千米，最高的珠穆朗玛峰约 8849 米'], ['整个地球表面', 5.1e14, 8849, '约 5.1 亿平方千米，包括海洋']];
  const S = [1, 10, 50, 1000];
  let pi = 2, si = 0;
  const WORLD = 6e7 * 6e7, HMAX = 384;
  function draw(){
    const p = P[pi], sc = S[si], ground = p[1] / (sc * sc), hgt = p[2] / sc, secs = ground;
    const t = secs < 3600 ? Math.round(secs / 60) + ' 分钟' : secs < 86400 * 2 ? (secs / 3600).toFixed(1) + ' 小时' : secs < 3.156e7 * 2 ? Math.round(secs / 86400) + ' 天' : fmt(secs / 3.156e7) + ' 年';
    kv($('#scaleKv'), [['地面要铺多少块', fmt(Math.max(1, Math.round(ground))) + ' 块'], ['一秒放一块，铺完要', ground < 60 ? Math.ceil(ground) + ' 秒' : t], ['最高处有多少格', (hgt < 10 ? hgt.toFixed(1) : Math.round(hgt)) + ' 格']]);
    const fitH = hgt <= HMAX, fitW = p[1] / (sc * sc) <= WORLD;
    $('#scaleSay').innerHTML = p[0] + '（' + p[3] + '），按 1 格 = ' + sc + ' 米来搭。' +
      (fitW ? '方块世界放得下。' : '方块世界都放不下！') +
      (fitH ? '' : ' 可是最高处要 ' + Math.round(hgt) + ' 格，比方块世界从底到顶的 384 格还高，<b>放不下</b>：要么把高度另外缩小，要么用特别的模组。') +
      (si === 0 && pi >= 4 ? ' 一比一的国家，只能让电脑程序根据地图数据自动生成，没有人能用手一块一块地放。' : '');
  }
  btnRow($('#scaleP'), P.map(p => p[0]), pi, i => { pi = i; draw(); });
  btnRow($('#scaleS'), S.map(s => '1 格 = ' + s + ' 米'), si, i => { si = i; draw(); });
  draw();
});
