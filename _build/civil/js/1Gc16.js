
/* ---------- 装置 17：同期二十四人 ---------- */
dev('#dkFig', fig => {
  const svg = $('#dkSvg'), say = $('#dkSay');
  const LV = ['课长补佐', '课长', '审议官', '局长', '事务次官'];
  const CAP = [24, 14, 7, 3, 1]; // 每一级能容纳的同期人数
  const AT = [0, 15, 22, 27, 30]; // 入省第几年升到这一级
  let st, me = -1;
  function reset(){
    const r = rng(Date.now() % 9999);
    st = {y: 0, ppl: Array.from({length: 24}, (_, i) => ({i, lv: 0, out: 0, score: r(), luck: r()})), r};
    me = -1; draw();
  }
  function step(){
    if (st.y >= 30) return;
    st.y += 5;
    LV.forEach((n, k) => {
      if (k === 0 || st.y < AT[k]) return;
      const cand = st.ppl.filter(p => !p.out && p.lv === k - 1).sort((a, b) => (b.score + b.luck * 0.4) - (a.score + a.luck * 0.4));
      const need = CAP[k] - st.ppl.filter(p => !p.out && p.lv >= k).length;
      cand.forEach((p, j) => { if (j < need) p.lv = k; else if (st.y >= AT[k]) { p.out = st.y; p.tie = Math.floor(st.r() * 3) + 1 + (p.lv >= 2 ? 1 : 0); } });
      st.ppl.forEach(p => p.luck = st.r());
    });
    if (st.y >= 30) st.ppl.forEach(p => { if (!p.out && p.lv < 4) { p.out = 30; p.tie = 3 + (p.lv >= 3 ? 1 : 0); } });
    draw();
  }
  function draw(){
    const W = 600, H = 250, L = 80;
    let g = '';
    LV.forEach((n, k) => { const y = H - 30 - k * 44; g += '<line x1="' + L + '" x2="' + (W - 10) + '" y1="' + y + '" y2="' + y + '" stroke="var(--rule)"/>' + txt(L - 8, y + 4, n, {s: 12, a: 'end', c: 'var(--ink-2)', halo: false}); });
    g += txt(W - 12, 16, '入省第 ' + st.y + ' 年', {s: 13, a: 'end', c: 'var(--ink)', halo: false});
    st.ppl.forEach((p, j) => {
      const x = L + 14 + j * ((W - L - 30) / 23), y = H - 30 - p.lv * 44;
      const col = p.out ? 'var(--kraft)' : p.lv === 4 ? 'var(--zhu)' : 'var(--main)';
      g += '<circle cx="' + x.toFixed(1) + '" cy="' + (p.out ? y + 14 : y) + '" r="' + (p.i === me ? 8 : 6) + '" fill="' + col + '" opacity="' + (p.out ? 0.45 : 0.9) + '" stroke="' + (p.i === me ? 'var(--ink)' : 'none') + '" stroke-width="2" data-i="' + p.i + '" style="cursor:pointer"/>';
      if (p.out) g += txt(x, y + 32, '降', {s: 10, c: 'var(--kraft)', halo: false});
    });
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const out = st.ppl.filter(p => p.out), ties = out.reduce((s, p) => s + (p.tie || 0), 0);
    kv($('#dkKv'), [['入省', st.y + ' 年'], ['还在省里', (24 - out.length) + ' 人'], ['已“天降”', out.length + ' 人'], ['退职金领取次数', ties + ' 次']]);
    const m = me >= 0 ? st.ppl[me] : null;
    say.innerHTML = st.y === 0 ? '二十四个人，同一天进省，同一个起跑线。' + (m ? '你选中了一位，跟着他看。' : '点一个圆点选一个人。') :
      st.y >= 30 ? '三十年后：一人当上事务次官（红色），其余二十三人全部离开，一共领了约 <b>' + ties + '</b> 次退职金。' + (m ? (m.lv === 4 ? '<b>你跟着的那位，就是次官。</b>' : '你跟着的那位最后做到' + LV[m.lv] + '，第 ' + m.out + ' 年离开，“渡”了 ' + m.tie + ' 个地方。') : '') :
      '第 ' + st.y + ' 年。' + (m ? '你跟着的那位现在是' + LV[m.lv] + (m.out ? '，已于第 ' + m.out + ' 年离开，去了第一个“天降”的地方。' : '，还在。') : '');
  }
  svg.addEventListener('click', e => { const c = e.target.closest('circle[data-i]'); if (c) { me = +c.dataset.i; draw(); } });
  $('#dkGo').addEventListener('click', step);
  $('#dkReset').addEventListener('click', reset);
  reset();
});
