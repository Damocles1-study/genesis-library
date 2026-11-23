/* ---------- 装置 1：一天里几个钟头在给嘴干活 ---------- */
dev('#enFig', () => {
  const P = [
    ['中世纪英格兰工匠', 80, '经济史常用的一篮子权重'],
    ['1901 美国城市家庭', 42.5, '家庭支出'],
    ['1978 中国农村', 67.7, '居民恩格尔系数'],
    ['1978 中国城镇', 57.5, '居民恩格尔系数'],
    ['2023 中国全国', 29.8, '居民恩格尔系数，约数'],
    ['2020 年代美国', 11, '可支配收入，约数'],
    ['你', null, '自己拖滑块']
  ];
  let cur = 2;
  const h = slider('enH', v => v + ' 小时', () => draw());
  const me = slider('enMe', v => v + '%', () => draw());
  btnRow($('#enBtns'), P.map(p => p[0]), cur, i => { cur = i; draw(); });
  function draw(){
    const H = h(), share = i => P[i][1] == null ? me() : P[i][1];
    $('#enMeRow').style.display = P[cur][1] == null ? '' : 'none';
    bars($('#enBars'), P.map((p, i) => [p[0], share(i) / 100 * H, p[2], i === cur ? 'var(--main)' : 'var(--ink-3)']), H, v => v.toFixed(1) + ' 时');
    const s = share(cur), fh = s / 100 * H;
    const life = fh * 300 * 40;
    $('#enSay').innerHTML = '<b>' + P[cur][0] + '</b>：吃的钱约占 ' + s + '%。一天干 ' + H + ' 小时，其中约 <b>' + fh.toFixed(1) + ' 小时</b>是在给嘴干活，剩下 ' + (H - fh).toFixed(1) + ' 小时换来房子、衣服、灯油和其他一切。' +
      '按一年干三百天、干四十年算，一辈子约有 <b>' + fmt(life) + ' 小时</b>（约 ' + (life / 24 / 365).toFixed(1) + ' 年不睡觉的时间）是为了吃饭。' +
      (s >= 60 ? '这是农业社会的常态：几乎所有的剩余都被肚子吃掉了。' : s <= 15 ? '吃饭只占一点零头，这是人类历史上极少数人才有过的日子。' : '');
  }
  draw();
});
