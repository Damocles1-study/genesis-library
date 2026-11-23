/* ---------- 装置 18：腐坏时钟 ---------- */
dev('#spFig', () => {
  /* [吃的, 起始菌量(每克), 该扔的门槛, 说明] */
  const F = [['剩米饭', 1e2, 1e5, '米饭里常有蜡样芽孢杆菌，菌多了会产生加热也破坏不了的毒素'], ['生鸡肉', 1e4, 1e7, '生肉本来就带菌，坏之前先发黏、发臭'], ['开了盒的牛奶', 1e3, 1e7, '变酸、结块'], ['剩炒菜', 1e3, 1e6, '夹过几筷子以后，菌就多了']];
  const T = [['夏天的桌上', 32], ['春秋的桌上', 20], ['冰箱冷藏', 4], ['冷冻', -18]];
  let f = 0, t = 0;
  btnRow($('#spF'), F.map(x => x[0]), 0, i => { f = i; draw(); });
  btnRow($('#spT'), T.map(x => x[0] + ' ' + x[1] + '℃'), 0, i => { t = i; draw(); });
  const mu = c => c <= -3 ? 0 : Math.pow(0.0357 * (Math.min(c, 38) + 3), 2);      // 每小时，自然对数
  const lag = c => c <= -3 ? Infinity : 2 + 40 / (c + 4);                          // 小时
  function draw(){
    const fd = F[f], c = T[t][1], m = mu(c), L = lag(c);
    const hrs = m ? L + Math.log(fd[2] / fd[1]) / m : Infinity;
    const H = isFinite(hrs) ? Math.min(Math.max(hrs * 1.3, 12), 24 * 30) : 24 * 30;
    const pts = [];
    for (let i = 0; i <= 120; i++) { const h = H * i / 120; const n = h < L || !m ? fd[1] : Math.min(1e9, fd[1] * Math.exp(m * (h - L))); pts.push([h, Math.log10(n)]); }
    const lg = Math.log10;
    lineChart($('#spChart'), [{pts, color: 'var(--red)', w: 2.6}, {pts: [[0, lg(fd[2])], [H, lg(fd[2])]], color: 'var(--ink-3)', dash: '4 4', w: 1.4}], {xmin: 0, xmax: H, ymin: 1, ymax: 9, xt: [0, H / 4, H / 2, H * 3 / 4, H].map(x => Math.round(x)), yt: [2, 4, 6, 8], xf: v => v >= 48 ? (v / 24).toFixed(0) + ' 天' : v + ' 时', yf: v => '10^' + v, H: 220});
    const ht = !isFinite(hrs) ? '几乎不长' : hrs < 48 ? '约 ' + hrs.toFixed(hrs < 10 ? 1 : 0) + ' 小时' : '约 ' + (hrs / 24).toFixed(hrs < 240 ? 1 : 0) + ' 天';
    const dbl = m ? Math.log(2) / m : Infinity;
    kv($('#spKv'), [['细菌翻一倍', isFinite(dbl) ? (dbl < 2 ? Math.round(dbl * 60) + ' 分钟' : dbl.toFixed(0) + ' 小时') : '停住了'], ['到“该扔”大约', ht]]);
    $('#spSay').innerHTML = c >= 30 ? fd[0] + '放在夏天的桌上，细菌半小时左右就翻一倍，<b>' + ht + '</b>就到了该扔的地步，可这时候闻起来常常还没坏。' + (f === 0 ? '剩米饭尤其要当心：毒素一旦产生，再热也没用。' : '') :
      c >= 15 ? '室温下慢一些，但一个晚上足够出事。“放凉了再进冰箱”的说法让很多剩菜在桌上多待了几个小时，其实稍微放凉就该冷藏。' :
      c > 0 ? '冰箱没有杀死细菌，只是让它们慢下来：要 <b>' + ht + '</b>。冰箱不是保险箱，剩菜一两天内吃完。' :
      '冻上以后，细菌几乎停止繁殖，但没有死；化冻以后，它们接着长。这就是伯宰的速冻改变世界的原因：时间被按了暂停键。';
  }
  draw();
});
