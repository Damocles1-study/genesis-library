
/* ---------- 装置 8：药箱里的对乙酰氨基酚 ---------- */
dev('#apFig', fig => {
  const list = $('#apList'), bx = $('#apBars'), say = $('#apSay');
  const PR = [
    {n: '退烧片', s: '每片：对乙酰氨基酚 0.5 克', ap: 500, u: '片', k: 2},
    {n: '某复方感冒片', s: '每片：对乙酰氨基酚 0.325 克 ＋ 伪麻黄碱 ＋ 氯苯那敏', ap: 325, pse: 1, cpm: 1, u: '片', k: 0},
    {n: '某感冒颗粒（中西复方）', s: '每袋：对乙酰氨基酚 0.2 克 ＋ 氯苯那敏 ＋ 咖啡因 ＋ 中药提取物', ap: 200, cpm: 1, u: '袋', k: 1},
    {n: '某日夜感冒片 · 夜片', s: '每片：对乙酰氨基酚 0.5 克 ＋ 苯海拉明', ap: 500, cpm: 1, u: '片', k: 0},
    {n: '布洛芬缓释胶囊', s: '每粒：布洛芬 0.3 克', nsaid: 1, u: '粒', k: 0},
    {n: '某止咳糖浆', s: '每次 10 毫升：右美沙芬 ＋ 愈创甘油醚', u: '次', k: 0}
  ];
  list.innerHTML = '<div class="cards">' + PR.map((p, i) => '<div class="cd" data-i="' + i + '"><b>' + p.n + '</b><small>' + p.s + '</small><div class="btns" style="margin-top:6px;align-items:center"><button class="btn" data-d="-1">−</button><span class="mono" data-c style="min-width:4.5em;text-align:center">0 ' + p.u + '</span><button class="btn" data-d="1">＋</button></div></div>').join('') + '</div>';
  list.addEventListener('click', e => { const b = e.target.closest('button[data-d]'); if (!b) return; const i = +b.closest('.cd').dataset.i; PR[i].k = clamp(PR[i].k + +b.dataset.d, 0, 12); draw(); });
  function draw(){
    let ap = 0, cpm = 0, pse = 0, ns = 0, srcAp = 0;
    PR.forEach((p, i) => {
      const cd = list.querySelector('.cd[data-i="' + i + '"]');
      cd.querySelector('[data-c]').textContent = p.k + ' ' + p.u;
      cd.classList.toggle('on', p.k > 0);
      if (!p.k) return;
      if (p.ap) { ap += p.ap * p.k; srcAp++; }
      if (p.cpm) cpm++; if (p.pse) pse++; if (p.nsaid) ns++;
    });
    const g = ap / 1000;
    bars(bx, [
      ['对乙酰氨基酚', g, srcAp + ' 种药里有它', g > 4 ? 'var(--red)' : g > 2 ? 'var(--main)' : 'var(--ter)'],
      ['自行用药上限', 2, '常见的说明书写法', 'var(--rule)'],
      ['成人最大量', 4, '医生指导下', 'var(--rule)']
    ], 6, v => v.toFixed(2) + ' 克');
    let s = '这二十四小时里，对乙酰氨基酚一共 <b>' + g.toFixed(2) + ' 克</b>，来自 ' + srcAp + ' 种药。';
    if (g > 4) s += ' <b>已经超过成人常见的最大量</b>。现实中遇到这种情况，不要等症状，带上所有药盒去医院：肝损伤要一两天才显出来，解药越早用越好。';
    else if (g > 2) s += ' 超过了很多非处方说明书写的自行用药上限。别再加任何含它的药，有疑问打电话问药师或去医院。';
    else if (srcAp >= 2) s += ' 量还在范围内，但它来自不止一盒药：这正是最容易不知不觉超量的情形。';
    if (cpm >= 2) s += ' 让人犯困的抗过敏成分（氯苯那敏、苯海拉明）也叠了 ' + cpm + ' 层，别开车。';
    if (pse >= 2) s += ' 收缩血管的伪麻黄碱叠了 ' + pse + ' 层，高血压的人当心。';
    if (ns && srcAp) s += ' 布洛芬和对乙酰氨基酚是两种不同的药，不算叠加；但别再加第二种布洛芬类的止痛药。';
    if (!ap && !ns) s = '还没吃任何药。按“＋”记下吃了什么。';
    say.innerHTML = s;
  }
  draw();
});
