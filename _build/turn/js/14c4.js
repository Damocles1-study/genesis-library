
/* ---------- 装置 5：劳里昂的银子 ---------- */
dev('#silverFig', fig => {
  const USE = [['分给每人十德拉克马', 70], ['造一百条船', 170], ['造两百条船', 270]];
  const SITE = [['开阔海面', 9999], ['萨拉米斯海峡', 90]];
  let u = -1, st = -1;
  btnRow($('#agUse'), USE.map(x => x[0]), -1, i => { u = i; });
  btnRow($('#agSite'), SITE.map(x => x[0]), -1, i => { st = i; });
  const P = $('#agP'); P.addEventListener('input', () => $('#agPO').textContent = P.value + ' 条');
  $('#agPO').textContent = P.value + ' 条';
  const svg = $('#agSvg'), say = $('#agSay');
  svg.setAttribute('viewBox', '0 0 600 150');
  // 其余盟邦约一百条；雅典原有约七十条，加上新造的
  function fight(){
    let g = USE[u][1] + 100, p = +P.value; const front = SITE[st][1], hist = [[g, p]];
    for (let r = 0; r < 40 && g > 0 && p > 0; r++) {
      const eg = Math.min(g, front), ep = Math.min(p, front * 1.1);
      const crowd = front < 999 ? clamp(p / (front * 3), 1, 4) : 1;   // 窄地方挤成一团，后面的船反而碍事
      const dp = eg * .12, dg = ep * .085 / crowd;
      g = Math.max(0, g - dg); p = Math.max(0, p - dp); hist.push([g, p]);
      if (p < +P.value * .45 || g < (USE[u][1] + 100) * .45) break;   // 损失过半的一方撤退
    }
    return hist;
  }
  $('#agGo').addEventListener('click', () => {
    if (u < 0 || st < 0) { say.className = 'say'; say.textContent = '先把两步都选好。'; return; }
    const h = fight(), g0 = h[0][0], p0 = h[0][1], end = h[h.length - 1];
    let k = 0;
    (function anim(){
      const c = h[Math.min(k, h.length - 1)];
      const bar = (y, n, n0, col, lab) => '<rect x="120" y="' + y + '" width="' + (n / 1200 * 460).toFixed(1) + '" height="26" fill="' + col + '" rx="3"/><rect x="120" y="' + y + '" width="' + (n0 / 1200 * 460).toFixed(1) + '" height="26" fill="none" stroke="' + col + '" stroke-dasharray="3 3" rx="3"/>' + txt(112, y + 18, lab, {s: 13, a: 'end'}) + txt(126 + n / 1200 * 460, y + 18, Math.round(n) + ' 条', {s: 12, a: 'start'});
      svg.innerHTML = bar(30, c[0], g0, 'var(--main)', '希腊联合舰队') + bar(86, c[1], p0, 'var(--red)', '波斯舰队') + (SITE[st][1] < 999 ? txt(300, 142, '海峡里一次只能摆开大约 ' + SITE[st][1] + ' 条船', {s: 11, c: 'var(--ink-3)'}) : '');
      if (++k < h.length) setTimeout(anim, 90);
    })();
    const win = end[1] / p0 < end[0] / g0;
    kv($('#agKV'), [['希腊战前', Math.round(g0) + ' 条'], ['其中雅典', USE[u][1] + ' 条'], ['希腊损失', Math.round(g0 - end[0]) + ' 条'], ['波斯损失', Math.round(p0 - end[1]) + ' 条']]);
    if (win && st === 1) { say.className = 'say ok'; say.innerHTML = '<b>希腊人赢了。</b>' + (u === 0 ? '居然只靠这么点船也赢了，说明你给的波斯舰队不算大。真实的历史里，没有地米斯托克利那两百条船，伯罗奔尼撒人多半早就撤回地峡了。' : '这差不多就是真实的萨拉米斯：船不如对方多，但把仗挪到了窄地方，人多的一方挤成一团，展不开。') + ' 每个雅典公民少拿了十德拉克马（大约是一个工匠十来天的工钱，按五世纪后期的工价粗算），换来了整个城邦。'; }
    else if (win) { say.className = 'say ok'; say.innerHTML = '<b>在开阔海面上也赢了</b>，因为你的船够多、波斯的船不够多。真实的波斯舰队比这大，希腊人不敢在开阔海面跟它硬拼，在阿提密喜安打了三天，只是平手。'; }
    else if (st === 0) { say.className = 'say bad'; say.innerHTML = '<b>希腊舰队被包围了。</b>在开阔海面上，人多的一方可以把阵线拉长，从两头绕过来。这正是希腊将领们最怕的，所以地米斯托克利拼了命也要把仗留在萨拉米斯的窄海峡里打。'; }
    else { say.className = 'say bad'; say.innerHTML = '<b>连海峡也救不了。</b>' + (u === 0 ? '银子分掉了，雅典只有七十来条旧船。每个人多了十德拉克马，然后城被烧了，钱也没处花。' : '波斯的船实在太多了。') + '试试把波斯舰队调小，或者换一种银子的用法。'; }
  });
});
