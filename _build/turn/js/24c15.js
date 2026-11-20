
/* ---------- 装置 16：名单为什么越拉越长 ---------- */
dev('#prosFig', fig => {
  const P = $('#prP'), B = $('#prB');
  [P, B].forEach(s => s.addEventListener('input', go));
  function go(){
    const price = +P.value / 100, bonus = +B.value;
    $('#prPo').textContent = '家产的 ' + P.value + '%';
    $('#prBo').textContent = bonus ? bonus + ' 塔兰特' : '没有赏金';
    const r = rng(82), N = 3000;
    // 三千户有钱人家，家产按对数正态分布（单位：万塞斯特斯）
    const H = []; for (let i = 0; i < N; i++) H.push({w: Math.exp(Math.log(40) + 1.0 * gauss(r)), on: false, foe: i < 80});
    const med = 40, days = [];
    H.filter(h => h.foe).forEach(h => h.on = true);
    let listed = 80; days.push(80);
    for (let d = 1; d < 14; d++) {
      let add = 0;
      // 名单越长，人们越觉得添名字是“正常”的（风气），也越多人想抢先告发别人以求自保
      const mood = Math.min(1, listed / 400);
      H.forEach(h => {
        if (h.on) return;
        const greed = (1 - price) * Math.pow(h.w / med, 0.8) * 0.012;   // 买主盯上了他的家产
        const snitch = bonus * 0.0016;                                   // 有人为了赏金告发
        if (r() < (greed + snitch) * (0.3 + mood)) { h.on = true; add++; }
      });
      listed += add; days.push(add);
    }
    const mx = Math.max(...days, 80);
    $('#prBars').innerHTML = days.map((n, i) => '<div class="row"><span class="nm">第 ' + (i + 1) + ' 天' + (i < 3 ? '<small>普鲁塔克：' + [80, 220, 220][i] + '</small>' : '') + '</span><span class="tr"><i style="width:' + (n / mx * 100) + '%;background:' + (i ? 'var(--red)' : 'var(--ink-3)') + '"></i></span><span class="v">' + n + ' 人</span></div>').join('');
    const L = H.filter(h => h.on), val = L.reduce((s, h) => s + h.w, 0);
    const extra = L.filter(h => !h.foe);
    kv($('#prKV'), [['名单上一共', L.length + ' 人'], ['其中真正的政敌', '80 人'], ['没收的家产', fmt(val * 1e4) + ' 塞斯特斯'], ['国库拍卖所得', fmt(val * price * 1e4)], ['买主白赚', fmt(val * (1 - price) * 1e4)]]);
    const rich = extra.length ? extra.reduce((s, h) => s + h.w, 0) / extra.length : 0;
    $('#prSay').className = 'say ' + (extra.length > 80 ? 'bad' : 'ok');
    $('#prSay').innerHTML = extra.length > 80
      ? '两周后，名单上的人有 <b>' + Math.round(extra.length / L.length * 100) + '%</b> 根本不是政敌。被添上去的人，平均家产是城里中等人家的 <b>' + (rich / med).toFixed(1) + '</b> 倍：<em>有钱，就是罪名</em>。'
      : '拍卖价接近市价、又没有赏金的时候，添名字没什么好处，名单就长不起来。可在恐怖里，谁敢出高价呢？';
  }
  go();
});
