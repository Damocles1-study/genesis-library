
/* ---------- 装置 8：应急金撑得住吗 ---------- */
dev('#efFig', fig => {
  const LOSE = [.03, .10, .25];
  const go = () => {
    const M = +$('#efM').value, J = +$('#efJ').value, S = +$('#efS').value;
    const r = rng(2026 + J * 31 + M * 7 + Math.round(S * 100));
    const N = 1000, T = 120;
    let broke = 0, borrowSum = 0, worst = [];
    for (let i = 0; i < N; i++) {
      let fund = M, out = 0, owe = 0, hit = false, maxOwe = 0;
      for (let t = 0; t < T; t++) {
        let need = 0;
        if (out > 0) { need += 1; out--; }            // 失业：这个月的必要开支全靠自己
        else if (r() < LOSE[J] / 12) { out = 1 + Math.floor(r() * 6); need += 1; out--; }
        if (r() < .08 / 12) need += 1 + Math.floor(r() * 6);
        if (need > 0) { if (fund >= need) fund -= need; else { owe += need - fund; fund = 0; hit = true; } }
        else { // 平时：先还高息的钱，再补应急金
          let s = S; if (owe > 0) { const p = Math.min(owe, s); owe -= p; s -= p; owe *= 1 + .18 / 12; }
          fund = Math.min(M, fund + s);
        }
        if (owe > 0 && need > 0) owe *= 1 + .18 / 12;
        maxOwe = Math.max(maxOwe, owe);
      }
      if (hit) { broke++; borrowSum += maxOwe; worst.push(maxOwe); }
    }
    kv($('#efKv'), [['十年里至少借过一次高息钱', Math.round(broke / N * 100) + '%'], ['借过的人，最多时欠（月开销的几倍）', broke ? (borrowSum / broke).toFixed(1) + ' 倍' : '—'], ['最倒霉的一成人欠到', broke ? pct(worst, .9).toFixed(1) + ' 倍' : '—']]);
    $('#efSay').innerHTML = (M === 0 ? '一分应急金都没有：' : '应急金 ' + M + ' 个月：') + '一千个“你”里，有 <b>' + Math.round(broke / N * 100) + '%</b> 在十年里的某个时刻钱不够用，只能去借年利率 18% 左右的钱。' +
      (J === 2 ? ' 收入波动大的工作，同样的应急金，被逼借钱的机会大得多：要么多留，要么少一些固定开支。' : '') +
      (M >= 6 && J < 2 ? ' 留到六个月以上，再往上加，能多保护的人就越来越少了：多出来的钱，可以考虑别的用处。' : '') +
      ' 注意：这个模型没算失业补偿、失业保险和家人帮忙，现实中会好一些；但它也没算“一件事接着一件事”的坏年头。';
  };
  slider('efM', x => x + ' 个月开支', go); slider('efS', x => Math.round(x * 100) + '% 的月开支', go); $('#efJ').addEventListener('change', go); go();
});

/* ---------- 装置 9：分期的真实利率 ---------- */
dev('#irFig', fig => {
  function irr(P, pay, n){ let lo = 0, hi = 1; for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2; let pv = 0; for (let t = 1; t <= n; t++) pv += pay / Math.pow(1 + m, t); if (pv > P) lo = m; else hi = m; } return (lo + hi) / 2; }
  function go(){
    const P = Math.max(100, +$('#irP').value || 0), n = +$('#irN').value, r = Math.max(0, +$('#irR').value || 0) / 100;
    const pay = P / n + P * r, fee = P * r * n;
    const i = r > 0 ? irr(P, pay, n) : 0;
    const apr = i * 12, eff = Math.pow(1 + i, 12) - 1;
    kv($('#irKv'), [['每月还', pay.toFixed(0) + ' 元'], ['手续费合计', fee.toFixed(0) + ' 元'], ['心算的“年利率”', (r * 12 * 100).toFixed(1) + '%'], ['真实年利率', (apr * 100).toFixed(1) + '%'], ['按复利折算', (eff * 100).toFixed(1) + '%']]);
    // 每个月实际欠着多少本金 vs 每月手续费
    const W = 600, H = 170, L = 40, B = 24, T = 10;
    const bw = (W - L - 10) / n;
    let g = '';
    for (let t = 0; t < n; t++) {
      const owed = P * (1 - t / n), x = L + t * bw;
      const h = owed / P * (H - T - B);
      g += '<rect x="' + (x + 1).toFixed(1) + '" y="' + (H - B - h).toFixed(1) + '" width="' + Math.max(1, bw - 2).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="var(--main)" opacity=".55"/>';
    }
    g += '<line x1="' + L + '" x2="' + (W - 10) + '" y1="' + T + '" y2="' + T + '" stroke="var(--red)" stroke-width="2" stroke-dasharray="5 3"/>';
    g += txt(W - 12, T + 14, '手续费一直按这么多本金收', {s: 11.5, a: 'end', c: 'var(--red)'});
    g += txt(L + bw * n * .3, H - B - (H - T - B) * .2, '你实际欠着的本金', {s: 11.5, c: 'var(--ink)'});
    g += '<line x1="' + L + '" x2="' + (W - 10) + '" y1="' + (H - B) + '" y2="' + (H - B) + '" stroke="var(--ink)"/>';
    g += txt(L, H - 6, '第 1 期', {s: 11, a: 'start', c: 'var(--ink-3)', halo: false}) + txt(W - 10, H - 6, '第 ' + n + ' 期', {s: 11, a: 'end', c: 'var(--ink-3)', halo: false});
    $('#irSvg').setAttribute('viewBox', '0 0 ' + W + ' ' + H); $('#irSvg').innerHTML = g;
    $('#irSay').innerHTML = r === 0 ? '没有手续费，就没有利息。（注意：有的“免息”分期会把成本藏在商品价格里。）' :
      '心算的 ' + (r * 12 * 100).toFixed(1) + '%，真实的是 <b>' + (apr * 100).toFixed(1) + '%</b>，是心算的 <b>' + (apr / (r * 12)).toFixed(2) + '</b> 倍。原因就在图里：你欠的本金每个月都在变少（绿色），手续费却一直按全部本金收（红线）。按 72 法则，' + (apr * 100).toFixed(0) + '% 的利率大约 ' + (72 / (apr * 100)).toFixed(1) + ' 年就让一笔债翻倍。';
  }
  ['irP', 'irN', 'irR'].forEach(id => $('#' + id).addEventListener('input', go)); go();
});
