/* ---------- 装置 23：一公顷地怎么盖 ---------- */
dev('#denFig', fig => {
  // 名字、层数、建筑覆盖率、栋数（剖面上画几栋）、说明
  const F = [
    ['四合院', 1, .6, 5, '一层，院子围在中间。容积率很低，一公顷只住得下几十户；空地全在各家院子里，是私人的。'],
    ['里弄 · 联排', 3, .6, 6, '三层，一排排挨着。不高，但挤得很满，容积率接近二，一公顷能住两百来户。'],
    ['巴黎街坊', 6, .65, 3, '六七层，沿街围成一圈，中间是内院。楼不高，容积率却接近四，比很多高层小区还密。巴黎市区是欧洲人口密度最高的城市之一。'],
    ['板楼小区', 11, .22, 3, '十一层左右的板楼，楼间距按日照拉开（第二章）。容积率二点几，空地很多，但大多是楼与楼之间的绿化和停车。'],
    ['塔楼小区', 30, .12, 2, '三十层的塔楼，占地很小，四周留出大片空地。容积率三点几，和巴黎街坊差不多，楼却高了好几倍。'],
    ['九龙城寨', 13, .95, 6, '十几层的楼挤满了整块地，几乎没有空地，也没有阳光。容积率超过十，一公顷能住上千户、几千人。']
  ];
  let k = 2;
  btnRow($('#denPre'), F.map(f => f[0]), k, i => { k = i; go(); });
  function go(){
    const [n, fl, cov, cnt, note] = F[k];
    const far = fl * cov, hh = Math.round(far * 10000 / 90), ppl = hh * 3;
    // 剖面：100 米宽画成 560 像素，每层 3 米；最高 30 层
    const sc = 560 / 100, G = 200, fh = Math.min(5.6, 170 / (fl * 3)) ;
    let s = '<line x1="20" x2="580" y1="' + G + '" y2="' + G + '" stroke="var(--ink)" stroke-width="1.5"/>';
    const w = 100 * cov / cnt, gap = (100 - 100 * cov) / cnt;
    for (let i = 0; i < cnt; i++) {
      const x = 20 + (gap / 2 + i * (w + gap)) * sc, h = fl * 3 * fh;
      s += '<rect x="' + x.toFixed(1) + '" y="' + (G - h).toFixed(1) + '" width="' + (w * sc).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="var(--main)" fill-opacity=".18" stroke="var(--main)" stroke-width="1.4"/>';
      if (fl > 1 && h / fl > 3) for (let f = 1; f < fl; f++) s += '<line x1="' + x.toFixed(1) + '" x2="' + (x + w * sc).toFixed(1) + '" y1="' + (G - f * 3 * fh).toFixed(1) + '" y2="' + (G - f * 3 * fh).toFixed(1) + '" stroke="var(--main)" stroke-width=".4" opacity=".6"/>';
    }
    s += '<text x="300" y="215" font-size="11" text-anchor="middle" fill="var(--ink-3)">一百米（剖面示意，高度按比例缩放）</text>';
    $('#denSvg').innerHTML = s;
    kv($('#denKV'), [['层数', fl + ' 层'], ['建筑覆盖率', Math.round(cov * 100) + '%'], ['容积率', far.toFixed(1)], ['约住多少户', hh + ' 户 · ' + ppl + ' 人'], ['空地', Math.round((1 - cov) * 100) + '%']]);
    $('#denSay').innerHTML = '<b>' + n + '</b>　' + note;
  }
  go();
});
