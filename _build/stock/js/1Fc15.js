
/* ---------- 装置 16：一万个新币的一年 ---------- */
dev('#coinFig', fig => {
  const box = $('#cnBars'), kvb = $('#cnKv'), say = $('#cnSay');
  let seed = 2008, ready = false;
  function go(){
    if (!ready) return;
    const pd = gD() / 100, vol = gV() / 100, n = gN(), r = rng(seed), N = 10000;
    const ms = vol / Math.sqrt(12), drift = -ms * ms / 2; // 平均不涨不跌的波动
    const vals = [];
    for (let i = 0; i < N; i++) {
      let v = 1;
      for (let m = 0; m < 12; m++) { if (r() < pd) { v = 0; break; } v *= Math.exp(drift + ms * gauss(r)); }
      vals.push(v);
    }
    const dead = vals.filter(v => v === 0).length, x10 = vals.filter(v => v >= 10).length, x50 = vals.filter(v => v >= 50).length, half = vals.filter(v => v > 0 && v < 0.5).length, up = vals.filter(v => v >= 1).length;
    const mine = []; for (let k = 0; k < n; k++) mine.push(vals[Math.floor(r() * N)]);
    const myV = mine.reduce((a, b) => a + b, 0) / n;
    bars(box, [['归零', dead, '项目跑路、没人交易', 'var(--ink-3)'], ['还在但跌了一半以上', half, '', 'var(--dn)'], ['回本或赚了', up, '', 'var(--up)'], ['翻了十倍以上', x10, '', 'var(--main)'], ['翻了五十倍以上', x50, '', 'var(--main)']], N, v => v.toLocaleString());
    kv(kvb, [['一年后归零', (dead / N * 100).toFixed(0) + '%'], ['翻十倍以上', x10 + ' 个'], ['你买的 ' + n + ' 个', mine.map(v => v === 0 ? '0' : v.toFixed(1)).join(' · ')], ['你的本金变成', '<span class="' + (myV >= 1 ? 'up' : 'dn') + '">' + (myV * 100).toFixed(0) + '%</span>']]);
    let s = '一万个新币，一年后 ' + dead.toLocaleString() + ' 个归零，' + x10 + ' 个翻了十倍以上。';
    s += ' 你随机买了 ' + n + ' 个，最后剩下本金的 ' + (myV * 100).toFixed(0) + '%。';
    s += x10 > 0 ? ' 那 ' + x10 + ' 个十倍币的持有者会写帖子、拍视频、劝室友进场；归零的那 ' + dead.toLocaleString() + ' 个，没有人讲。你在网上看到的，几乎全是前者。' : '';
    say.textContent = s;
  }
  const gD = slider('cnD', v => v + '%', go), gV = slider('cnV', v => v + '%', go), gN = slider('cnN', v => v + ' 个', go);
  $('#cnRe').addEventListener('click', () => { seed += 13; go(); });
  ready = true; go();
});
