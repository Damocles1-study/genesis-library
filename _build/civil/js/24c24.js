
/* ---------- 装置 25：稳定的收入能借多少 ---------- */
dev('#morFig', fig => {
  const A = $('#moA'), B = $('#moB'), U = $('#moU'), S = $('#moS');
  const f = () => { $('#moAO').textContent = (+A.value).toLocaleString() + ' 元'; $('#moBO').textContent = (+B.value).toLocaleString() + ' 元'; $('#moUO').textContent = '每年 ' + U.value + '%'; $('#moSO').textContent = S.value + ' 个月收入'; };
  [A, B, U, S].forEach(x => x.addEventListener('input', f)); f();
  // 给定月供 pay，一条收入路径是否断供
  function paths(base, stable, uRate, seed){
    const r = rng(seed), out = [];
    for (let k = 0; k < 600; k++) {
      const m = []; let inc = base;
      for (let y = 0; y < 30; y++) {
        const g = stable ? 0.03 : 0.05 + (r() - 0.5) * 0.16;
        inc = Math.max(base * 0.4, inc * (1 + g));
        const unemp = r() < uRate ? 3 + Math.floor(r() * 7) : 0;
        for (let mo = 0; mo < 12; mo++) {
          const bonus = stable ? 1 : 0.85 + r() * 0.3;
          m.push(mo < unemp ? inc * 0.15 : inc * bonus);
        }
      }
      out.push(m);
    }
    return out;
  }
  function fails(ps, pay, buf0){
    let bad = 0;
    for (const m of ps) {
      let buf = buf0, ok = true;
      for (const x of m) { buf += x * 0.6 - pay; if (buf < 0) { ok = false; break; } buf = Math.min(buf, buf0 * 3); }
      if (!ok) bad++;
    }
    return bad / ps.length;
  }
  function maxPay(ps, base, buf0){
    let lo = 0, hi = base * 0.9;
    for (let it = 0; it < 18; it++) { const mid = (lo + hi) / 2; if (fails(ps, mid, buf0) <= 0.05) lo = mid; else hi = mid; }
    return lo;
  }
  const loan = pay => { const i = 0.035 / 12, n = 360; return pay * (1 - Math.pow(1 + i, -n)) / i; };
  function run(){
    const a = +A.value, b = +B.value, u = +U.value / 100, s = +S.value;
    const pa = maxPay(paths(a, true, 0.002, 11), a, a * s);
    const pb = maxPay(paths(b, false, u, 23), b, b * s);
    const la = loan(pa), lb = loan(pb);
    bars($('#moBars'), [['体制内', la / 1e4, '月供约 ' + Math.round(pa).toLocaleString() + ' 元', 'var(--main)'], ['私营企业', lb / 1e4, '月供约 ' + Math.round(pb).toLocaleString() + ' 元', 'var(--kraft)']], Math.max(la, lb) / 1e4 * 1.1, v => '约 ' + Math.round(v) + ' 万');
    const say = $('#moSay');
    say.innerHTML = '在“三十年断供概率不超过 5%”的标准下：体制内月入 ' + a.toLocaleString() + ' 元，可以安全地借约 <b>' + Math.round(la / 1e4) + ' 万</b>；私企月入 ' + b.toLocaleString() + ' 元，约 <b>' + Math.round(lb / 1e4) + ' 万</b>。' +
      (lb < la ? '<br>私企的收入更高，安全的借款额却更低：<b>收入的稳定性，被折算成了借款能力</b>。' : '<br>私企收入高出足够多时，稳定性的优势会被抵消。试着提高失业风险或减少应急存款，看看差距怎样变化。') +
      (s < 3 ? ' 应急存款太少的时候，一次失业就可能断供，私企那一行对此最敏感。' : '');
  }
  $('#moGo').addEventListener('click', run); run();
});
