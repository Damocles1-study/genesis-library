/* ---------- 装置 22：一片老厂区的三十年 ---------- */
dev('#gentFig', fig => {
  const T = $('#gentT'), P = $('#gentP');
  [T, P].forEach(e => e.addEventListener('input', go)); P.addEventListener('change', go);
  const sig = x => 1 / (1 + Math.exp(-x));
  function mix(t, prot){
    const art = (prot ? .3 : .35) * sig((t - 6) / 1.5) * (1 - (prot ? .45 : .85) * sig((t - 18) / 2.5));
    const white = (prot ? .38 : .7) * sig((t - 15) / 2.5);
    const old = Math.max(0, 1 - art - white);
    const rent = .6 + (prot ? 1.3 : 2.6) * sig((t - 14) / 3);
    return {old, art, white, rent};
  }
  function go(){
    const t = +T.value, prot = P.checked;
    $('#gentTO').textContent = '第 ' + t + ' 年';
    const X = y => 40 + y / 30 * 510, Y = v => 200 - v * 175, Yr = r => 200 - r / 3.4 * 175;
    let s = '<line x1="40" x2="550" y1="200" y2="200" stroke="var(--ink)"/><line x1="40" x2="40" y1="25" y2="200" stroke="var(--ink)"/><line x1="550" x2="550" y1="25" y2="200" stroke="var(--red)" opacity=".6"/>';
    for (let y = 0; y <= 30; y += 5) s += '<text x="' + X(y) + '" y="216" font-size="11" text-anchor="middle" fill="var(--ink-3)">' + y + '</text>';
    s += '<text x="36" y="30" font-size="10" text-anchor="end" fill="var(--ink-3)">100%</text><text x="554" y="30" font-size="10" fill="var(--red)">房租</text>';
    // 堆叠面积
    const layer = (lo, hi, col) => { let d = ''; for (let y = 0; y <= 30; y += .5) { const m = mix(y, prot); d += (d ? ' L' : 'M') + X(y).toFixed(1) + ',' + Y(hi(m)).toFixed(1); } for (let y = 30; y >= 0; y -= .5) { const m = mix(y, prot); d += ' L' + X(y).toFixed(1) + ',' + Y(lo(m)).toFixed(1); } return '<path d="' + d + ' Z" fill="' + col + '" opacity=".55"/>'; };
    s += layer(m => 0, m => m.old, 'var(--och)') + layer(m => m.old, m => m.old + m.art, 'var(--grn)') + layer(m => m.old + m.art, m => 1, 'var(--main)');
    let rd = ''; for (let y = 0; y <= 30; y += .5) rd += (rd ? ' L' : 'M') + X(y).toFixed(1) + ',' + Yr(mix(y, prot).rent).toFixed(1);
    s += '<path d="' + rd + '" fill="none" stroke="var(--red)" stroke-width="2.5"/>';
    s += '<line x1="' + X(t) + '" x2="' + X(t) + '" y1="25" y2="200" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="4 3"/>';
    $('#gentSvg').innerHTML = s;
    const m = mix(t, prot);
    const stage = t < 4 ? '工厂刚关门，工人下岗或随厂搬走，街区空了一半，房租跌到谷底。留下来的是老住户和老人。'
      : t < 10 ? '画家、乐手、小剧团发现了这里：又大又便宜的厂房。他们搬进来，开工作室，办展览。'
      : t < 16 ? '咖啡馆、画廊、设计公司跟着来了，周末有人专门来逛。媒体开始报道“城市新地标”，房租往上走。'
      : t < 22 ? '开发商和大公司来了，老厂房改成写字楼、公寓和商场。房租涨得飞快，最早的那批艺术家开始搬走。'
      : '这里成了一个整洁、昂贵的“创意街区”。住在这里的大多是新来的白领，老住户和艺术家只剩少数。';
    $('#gentSay').innerHTML = '<b>第 ' + t + ' 年</b>　' + stage + '<br>老住户 ' + Math.round(m.old * 100) + '%　艺术家和小店主 ' + Math.round(m.art * 100) + '%　新住户 ' + Math.round(m.white * 100) + '%　房租是工厂关门前的 ' + m.rent.toFixed(1) + ' 倍' + (prot && t > 15 ? '<br>留出来的保障房和低租金工作室，让一部分老住户和艺术家留了下来，街区的房租也涨得慢一些。代价是开发商少赚一些，政府要多出一些。' : '');
  }
  go();
});
