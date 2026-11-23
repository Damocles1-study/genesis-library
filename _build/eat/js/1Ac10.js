/* ---------- 装置 11：一公顷地的热量 ---------- */
dev('#hcFig', () => {
  /* [庄稼, 吨/公顷, 千卡/公斤, 能种的地（平 水 坡 冷）, 美洲来的?] */
  const C = [
    ['小麦', 0.8, 3300, 'plain slope cold', 0],
    ['稻米', 2.0 * 0.7, 3600, 'water', 0],
    ['玉米', 1.2, 3600, 'plain slope', 1],
    ['土豆', 8, 770, 'plain slope cold', 1],
    ['红薯', 7, 860, 'plain slope', 1],
    ['木薯', 10, 1500, 'slope', 1]
  ];
  const LAND = [['平原旱地', 'plain'], ['有水的平地', 'water'], ['山坡', 'slope'], ['寒冷高地', 'cold']];
  const YEAR = 730000;
  let land = 0;
  btnRow($('#hcLand'), LAND.map(l => l[0]), 0, i => { land = i; draw(); });
  function draw(){
    const L = LAND[land][1];
    const rows = C.map(c => { const ok = c[3].includes(L) || (L === 'water' && c[0] !== '木薯'); const ppl = ok ? c[1] * 1000 * c[2] / YEAR : 0; return [c[0], ppl, ok ? (c[4] ? '美洲来的' : '旧大陆的') : '这块地种不了', c[4] ? 'var(--red)' : 'var(--grn)']; });
    bars($('#hcBars'), rows, 22, v => v ? v.toFixed(1) + ' 人' : '—');
    const ok = rows.filter(r => r[1] > 0).sort((a, b) => b[1] - a[1]);
    const oldBest = rows.filter((r, i) => r[1] > 0 && !C[i][4]).sort((a, b) => b[1] - a[1])[0];
    const best = ok[0];
    $('#hcSay').innerHTML = (L === 'cold' ? '寒冷的高地上，麦子勉强能种，土豆却能养活两倍多的人：这就是土豆征服北欧、爱尔兰和安第斯山的原因。' :
      L === 'slope' ? '山坡旱地，稻子种不了，麦子产量低；玉米、红薯、木薯却长得不错。<b>美洲的庄稼让人能爬上原来养不活人的山</b>，下一章讲中国的山上发生了什么。' :
      L === 'water' ? '有水的平地，稻子最稳当：亩产高，营养也比块茎全面。美洲的块茎在这里有优势，但没有替代稻子。' :
      '平原旱地上，美洲的块茎热量最多。') +
      (best && oldBest ? '这块地上最能养人的是<b>' + best[0] + '</b>（' + best[1].toFixed(1) + ' 人），旧大陆原有的庄稼里最好的是' + oldBest[0] + '（' + oldBest[1].toFixed(1) + ' 人）。' : best ? '这块地上，只有美洲来的庄稼能种。' : '');
  }
  draw();
});
