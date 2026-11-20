/* ---------- 装置 27：焚烧厂建在哪儿 ---------- */
dev('#nimFig', fig => {
  // 名字、离城公里、附近户数、地价（相对）、居民声音（0~1）
  const SITE = [
    ['城东高档小区旁', 4, 3000, 9, .95],
    ['老工业区边上', 7, 1500, 4, .45],
    ['城中村旁边', 6, 4000, 3, .15],
    ['远郊的村子', 25, 400, 1, .3],
    ['新区规划绿地', 12, 300, 5, .7],
    ['邻县的山谷', 40, 300, 1, .1]
  ];
  let si = 0;
  const C = $('#nimC');
  btnRow($('#nimSite'), SITE.map(s => s[0]), 0, i => { si = i; go(); });
  C.addEventListener('input', go);
  function calc(i, comp){
    const [n, km, hh, land, voice] = SITE[i];
    const truck = km * 2 * 20 * 1.2;        // 二十年的运费
    const landC = land * 25;
    const compC = hh * comp / 1000;
    const cross = i === 5 ? 60 : 0;          // 跨县协调、给邻县的补偿
    const total = truck + landC + compC + cross;
    const anger = clamp(Math.pow(hh / 3000, .7) * voice * (1.15 - comp / (comp + 25)) * 1.4, 0, 1);
    return {total, truck, landC, compC, cross, anger, hh, voice};
  }
  function go(){
    const comp = +C.value; $('#nimCO').textContent = comp + ' 万元/户';
    const r = calc(si, comp);
    const max = Math.max(...SITE.map((_, i) => calc(i, comp).total));
    const row = (nm, v, m, col, txt) => '<div class="row"><span class="nm">' + nm + '</span><span class="tr"><i style="width:' + (v / m * 100).toFixed(0) + '%;background:' + col + '"></i></span><span class="v">' + txt + '</span></div>';
    $('#nimBars').innerHTML = row('二十年运费', r.truck, max, 'var(--och)', Math.round(r.truck)) + row('买地', r.landC, max, 'var(--brk)', Math.round(r.landC)) + row('补偿', r.compC, max, 'var(--grn)', Math.round(r.compC)) + (r.cross ? row('跨县协调', r.cross, max, 'var(--ink-3)', r.cross) : '') + row('<b>总花费</b>', r.total, max, 'var(--main)', '<b>' + Math.round(r.total) + '</b>') + row('反对有多激烈', r.anger, 1, 'var(--red)', Math.round(r.anger * 100) + '%');
    const S = $('#nimSay');
    const t = {
      0: '离城近，运费省；可旁边是几千户有钱、有组织、认识人的居民。不给足补偿，抗议会非常激烈，项目很可能搁浅。',
      1: '老工业区旁边，居民习惯了烟囱，声音不大，地也便宜。这是很多城市最常见的选择。',
      2: '城中村旁边：人很多，可他们大多是租户和外来人口，没有房产、没有户口、没有组织，声音最小。账面上很划算。',
      3: '远郊的村子：人少、地便宜，可垃圾车每天要跑几十公里，二十年下来运费很可观。村民的意见常常没人问。',
      4: '新区的规划绿地：现在没什么人，可十年后旁边会住上几千户新业主，到时候吵的就是他们。',
      5: '邻县的山谷：本城没人反对，可要跟另一个县谈判、给钱，运费也最贵。第二十八章讲城和城外的关系，就是这种账。'
    }[si];
    S.className = 'say' + (r.anger > .6 ? ' bad' : r.anger < .2 ? ' ok' : '');
    S.innerHTML = t;
  }
  $('#nimCheap').addEventListener('click', () => {
    const comp = +C.value;
    // 墨只看账面：总花费最低，并且反对不太激烈
    let best = 0, bv = 1e18; SITE.forEach((_, i) => { const r = calc(i, comp); const v = r.total + r.anger * 120; if (v < bv) { bv = v; best = i; } });
    si = best; $$('#nimSite button').forEach((b, i) => b.classList.toggle('on', i === best)); go();
    $('#nimSay').innerHTML += '<br><b>只算钱和“会不会闹”，最后常常落在声音最小的人家旁边。</b>这就是环境正义研究者说的：邻避设施不是随机分布的。补偿定得越高，这个偏差就越小。';
  });
  go();
});
