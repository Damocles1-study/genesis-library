
/* ---------- 装置 3：斯巴达人还剩多少 ---------- */
dev('#spartaFig', fig => {
  const T = $('#spT'), Nn = $('#spN'), D = $('#spD'), Wr = $('#spW'), Q = $('#spQ');
  const HIST = [[-480, 8000, '希罗多德：约八千'], [-371, 1200, '留克特拉前后：一千多（推算）'], [-330, 1000, '亚里士多德：不到一千'], [-244, 700, '普鲁塔克：约七百']];
  const DEF = {t: 6, n: 0, d: 40, w: 12, q: true};
  [T, Nn, D, Wr, Q, $('#spE')].forEach(e => e.addEventListener('input', go));
  $('#spReset').addEventListener('click', () => { T.value = DEF.t; Nn.value = DEF.n; D.value = DEF.d; Wr.value = DEF.w; Q.checked = DEF.q; $('#spE').checked = false; go(); });
  function sim(){
    const r = rng(42), thr = +T.value * 0.1, dShare = +D.value / 100, war = +Wr.value / 100, add = +Nn.value;
    const gauss = () => { let u = 0, v = 0; while (!u) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    let fam = []; for (let i = 0; i < 8000; i++) fam.push(Math.exp(gauss() * .45 - .1));
    const out = [[-480, 8000]];
    for (let g = 1; g <= 8; g++) {
      const year = -480 + g * 30;
      let loss = war + (Q.checked && g === 1 ? .2 : 0);
      let pool = 0, next = [];
      for (const w of fam) {
        if (r() < loss) { pool += w; continue; }                // 战死、无后：地流进“嫁妆池”
        const u = r(), sons = u < .2 ? 0 : u < .55 ? 1 : u < .85 ? 2 : 3;
        if (!sons) { pool += w; continue; }                      // 没儿子：地随女儿嫁走
        const keep = w * (1 - dShare); pool += w * dShare;       // 女儿的嫁妆
        for (let s = 0; s < sons; s++) next.push(keep / sons);
      }
      // 嫁妆和绝户的地：富家更容易娶到女继承人（按地的平方加权）
      if (next.length) {
        const cum = []; let tot = 0; for (const w of next) { tot += Math.pow(w, 1.3) + .05; cum.push(tot); }
        const chunk = .25; let k = Math.floor(pool / chunk);
        while (k-- > 0) { const x = r() * tot; let lo = 0, hi = cum.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < x) lo = m + 1; else hi = m; } next[lo] += chunk; }
      }
      if ($('#spE').checked && next.length) {                  // 重分土地：全体平分；分不够就只保留养得起的户数
        const tot = next.reduce((a, b) => a + b, 0), n = thr > 0 ? Math.min(next.length, Math.floor(tot / thr)) : next.length;
        next = new Array(n).fill(tot / Math.max(1, n));
      }
      fam = next.filter(w => w >= thr);                        // 交不起口粮的掉出去
      for (let i = 0; i < add; i++) fam.push(1);
      if (fam.length > 60000) fam = fam.slice(0, 60000);
      out.push([year, fam.length]);
    }
    return {out, fam};
  }
  function go(){
    $('#spTO').textContent = +T.value === 0 ? '没有门槛' : '要 ' + (+T.value * 10) + '% 份地';
    $('#spNO').textContent = +Nn.value ? fmt(+Nn.value) + ' 户' : '一个不收';
    $('#spDO').textContent = D.value + '%';
    $('#spWO').textContent = Wr.value + '% / 代';
    const {out, fam} = sim(), last = out[out.length - 1][1];
    const ymax = Math.max(10000, Math.ceil(Math.max(...out.map(p => p[1])) / 2000) * 2000);
    const ch = lineChart($('#spSvg'), [{color: 'var(--ter)', pts: out, w: 3}], {xmin: -490, xmax: -230, ymin: 0, ymax, xt: [-480, -420, -360, -300, -240], xf: v => '前' + (-v), yt: [0, ymax / 4, ymax / 2, ymax * 3 / 4, ymax], yf: v => fmt(v)});
    const svg = $('#spSvg'); let g = '';
    HIST.forEach(h => g += '<circle cx="' + ch.X(h[0]) + '" cy="' + ch.Y(h[1]) + '" r="4.5" fill="var(--ink)"><title>' + h[2] + '</title></circle>');
    svg.insertAdjacentHTML('beforeend', g);
    const sorted = fam.slice().sort((a, b) => b - a), top = sorted.slice(0, Math.max(1, Math.round(sorted.length / 10))).reduce((s, w) => s + w, 0), all = sorted.reduce((s, w) => s + w, 0) || 1;
    const s = $('#spSay');
    if (last < 1500) { s.className = 'say bad'; s.innerHTML = '到前 240 年，只剩 <b>' + fmt(last) + '</b> 户公民，最富的一成人家占了 <b>' + Math.round(top / all * 100) + '%</b> 的地。这就是斯巴达真实走过的路：没有输掉哪一场决定性的战争，就先把自己“算”没了。'; }
    else if (last < 6000) { s.className = 'say'; s.innerHTML = '前 240 年还剩 <b>' + fmt(last) + '</b> 户。比真实的斯巴达好得多，但依然在缩。'; }
    else { s.className = 'say ok'; s.innerHTML = '前 240 年有 <b>' + fmt(last) + '</b> 户，斯巴达撑住了。前三世纪后期，斯巴达国王阿基斯四世和克莱奥梅尼三世真的试过这几招：免债、重分土地、吸收边民入籍。阿基斯被处死，克莱奥梅尼的改革也随着他兵败而告终。'; }
  }
  go();
});
