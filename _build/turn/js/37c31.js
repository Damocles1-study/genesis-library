/* ---------- 装置 32：造一支舰队 ---------- */
dev('#navyFig', fig => {
  // [名称, 橡树（棵）, 船员, 造价（镑）]：取整的估计
  const T = [['一级舰', 6000, 850, 63000], ['七十四炮舰', 3400, 620, 45000], ['巡航舰', 1200, 260, 20000]];
  const S = [$('#nvA'), $('#nvB'), $('#nvC')], svg = $('#nvSvg');
  let lemon = 0;
  btnRow($('#nvLem'), ['不发柠檬汁（1795 年以前）', '定量发柠檬汁（1795 年以后）'], 0, i => { lemon = i; go(); });
  S.forEach(s => s.addEventListener('input', go));
  function tree(x, y, c){ return '<path d="M' + x + ',' + (y + 10) + ' v-4" stroke="var(--ink-3)" stroke-width="1.2"/><circle cx="' + x + '" cy="' + (y + 2) + '" r="4.2" fill="' + c + '"/>'; }
  function go(){
    const n = S.map(s => +s.value);
    S.forEach((s, i) => $('#nv' + 'ABC'[i] + 'o').textContent = n[i] + ' 艘');
    const trees = n.reduce((a, k, i) => a + k * T[i][1], 0), crew = n.reduce((a, k, i) => a + k * T[i][2], 0), cost = n.reduce((a, k, i) => a + k * T[i][3], 0);
    const acres = trees / 60, wage = crew * 12 * 1.2 + crew * 15;   // 年饷约 14 镑 + 伙食约 15 镑（示意）
    const scurvy = Math.round(crew * (lemon ? .01 : .12));          // 一次几个月的长航（示意）
    // 每个小树代表 1000 棵橡树
    const k = Math.ceil(trees / 1000), cols = 40, rows = Math.max(1, Math.ceil(k / cols)), W = 600, H = 16 + rows * 14;
    let g = '';
    for (let i = 0; i < k; i++) g += tree(14 + (i % cols) * 14.4, 6 + Math.floor(i / cols) * 14, 'var(--grn)');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    kv($('#nvKV'), [['橡树', trees.toLocaleString() + ' 棵'], ['森林', Math.round(acres).toLocaleString() + ' 英亩'], ['水手', crew.toLocaleString() + ' 人'], ['造价', fmtGBP(cost)], ['每年饷钱和伙食', fmtGBP(wage)], ['一次长航死于坏血病', scurvy.toLocaleString() + ' 人']]);
    const big = n[0] + n[1], say = $('#nvSay');
    say.className = 'say' + (!lemon && crew > 5000 ? ' bad' : big >= 27 ? ' ok' : '');
    say.innerHTML = '<small>每棵小树代表一千棵橡树。</small><br>' +
      (big === 0 ? '没有战列舰的舰队只能护航和巡逻，打不了大海战。' : big < 15 ? '一支分舰队的规模。纳尔逊在尼罗河有 13 艘战列舰。' : big < 30 ? '特拉法尔加的规模：纳尔逊有 27 艘战列舰。' : '1805 年前后，皇家海军在役的战列舰有一百多艘，水兵和陆战队员十几万人，比当时英国陆军还多。') +
      ' 要找 ' + crew.toLocaleString() + ' 个水手，' + (crew > 10000 ? '光靠自愿是不够的，强征队要上街了。' : '港口里的商船水手要被抽走一大批。') +
      (lemon ? '' : ' 不发柠檬汁，几个月的封锁或远航下来，可能有一成多的人死于坏血病（示意）。');
  }
  const fmtGBP = v => v >= 1e6 ? (v / 1e6).toFixed(1) + ' 百万镑' : Math.round(v / 1000) + ' 千镑';
  go();
});
