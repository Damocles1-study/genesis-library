
/* ---------- 装置 1：要吃多少才出事 ---------- */
dev('#doseFig', fig => {
  const svg = $('#dsSvg'), say = $('#dsSay');
  /* u 单位；norm 一次正常的份数；thr(W) 可能严重中毒的份数；amt 换算成好懂的量 */
  const IT = [
    {n: '白酒（52 度）', u: '两', norm: 1, thr: W => 3.0 * 0.65 * W / 20.5, amt: x => '约 ' + (x * 50).toFixed(0) + ' 毫升', c: 'var(--red)'},
    {n: '发绿发芽的土豆', u: '个', norm: 1, thr: W => 3 * W / 100, amt: x => '约 ' + (x * 200).toFixed(0) + ' 克', c: 'var(--red)'},
    {n: '对乙酰氨基酚', s: '0.5 克一片', u: '片', norm: 1, thr: W => 150 * W / 500, amt: x => '约 ' + (x * 0.5).toFixed(1) + ' 克', c: 'var(--main)'},
    {n: '含铁补充片', s: '每片 60 毫克铁', u: '片', norm: 1, thr: W => 60 * W / 60, amt: x => '约 ' + (x * 60 / 1000).toFixed(1) + ' 克铁', c: 'var(--main)'},
    {n: '普通的土豆', u: '个', norm: 1, thr: W => 3 * W / 15, amt: x => '约 ' + (x * 0.2).toFixed(1) + ' 公斤', c: 'var(--och)'},
    {n: '水（几小时内）', u: '杯', norm: 1, thr: W => 0.1 * W * 4, amt: x => '约 ' + (x / 4).toFixed(1) + ' 升', c: 'var(--blu)'},
    {n: '咖啡', s: '每杯约 100 毫克咖啡因', u: '杯', norm: 1, thr: W => 150 * W / 100, amt: x => '约 ' + (x / 10).toFixed(1) + ' 克咖啡因', c: 'var(--och)'},
    {n: '冷藏的隔夜青菜', s: '按亚硝酸盐偏高算', u: '盘', norm: 1, thr: W => 5 * W / 9, amt: x => '约 ' + (x * 0.3).toFixed(0) + ' 公斤', c: 'var(--grn)'},
    {n: '虾配维生素 C', s: '故意往最坏里算', u: '斤', norm: 0.5, thr: W => 1.5 * W / 0.25, amt: x => '约 ' + (x / 2).toFixed(0) + ' 公斤', c: 'var(--grn)'}
  ];
  const lo = -1, hi = 3.4, W0 = 600, L = 170, R = 74, T = 26, rowH = 36;
  const X = v => L + (Math.log10(Math.max(v, 0.1)) - lo) / (hi - lo) * (W0 - L - R);
  let W = 60;
  function draw(){
    const rows = IT.map(it => ({it, t: it.thr(W)})).sort((a, b) => a.t / a.it.norm - b.t / b.it.norm);
    const H = T + rows.length * rowH + 26;
    let g = '';
    [0.1, 1, 10, 100, 1000].forEach(v => { g += '<line x1="' + X(v) + '" x2="' + X(v) + '" y1="' + (T - 6) + '" y2="' + (H - 22) + '" stroke="var(--rule)"/>' + txt(X(v), H - 8, v >= 1 ? v : '0.1', {s: 11, c: 'var(--ink-3)', halo: false}); });
    g += txt(X(1), T - 10, '一次正常的量 ↓', {s: 11, c: 'var(--ink-3)', a: 'start', halo: false});
    rows.forEach((r, i) => {
      const y = T + i * rowH + rowH / 2, x0 = X(r.it.norm), x1 = X(r.t), m = r.t / r.it.norm;
      g += txt(L - 10, y + (r.it.s ? -2 : 4), r.it.n, {s: 13, a: 'end'});
      if (r.it.s) g += txt(L - 10, y + 12, r.it.s, {s: 10, a: 'end', c: 'var(--ink-3)'});
      g += '<rect x="' + x0 + '" y="' + (y - 6) + '" width="' + Math.max(1, x1 - x0) + '" height="12" rx="3" fill="' + r.it.c + '" opacity=".28"/>';
      g += '<line x1="' + x0 + '" x2="' + x0 + '" y1="' + (y - 10) + '" y2="' + (y + 10) + '" stroke="var(--ink)" stroke-width="2"/>';
      g += '<line x1="' + x1 + '" x2="' + x1 + '" y1="' + (y - 11) + '" y2="' + (y + 11) + '" stroke="var(--red)" stroke-width="2.4"/>';
      const narrow = x1 - x0 < 46, mt = '×' + (m >= 10 ? Math.round(m) : m.toFixed(1));
      const lab = (r.t >= 10 ? Math.round(r.t) : r.t.toFixed(1)) + ' ' + r.it.u + (narrow ? '　' + mt : '');
      g += txt(Math.min(x1 + 5, W0 - R + 2), y - 1, lab, {s: 11, a: 'start', c: 'var(--red)'});
      g += txt(Math.min(x1 + 5, W0 - R + 2), y + 12, r.it.amt(r.t), {s: 10, a: 'start', c: 'var(--ink-3)'});
      if (!narrow) g += txt((x0 + x1) / 2, y + 4, mt, {s: 11, w: 1});
    });
    svg.setAttribute('viewBox', '0 0 ' + W0 + ' ' + H); svg.innerHTML = g;
    const first = rows[0], last = rows[rows.length - 1];
    let s = '体重 ' + W + ' 公斤时，安全余量最小的是<b>' + first.it.n + '</b>（大约 ' + (first.t / first.it.norm).toFixed(1) + ' 倍），最大的是<b>' + last.it.n + '</b>（大约 ' + Math.round(last.t / last.it.norm) + ' 倍）。';
    if (W <= 20) s += ' 一个这么小的孩子，十几片含铁补充片、十来片大人的退烧药就可能出大事：这就是药瓶要放高、要有儿童安全盖的原因。';
    else s += ' 挂图上吓人的“虾配维生素 C”，排在最安全的一头；家家都有的酒和药箱里的药，排在最危险的一头。';
    say.innerHTML = s;
  }
  const pre = $('#dsPre'), PS = [[15, '三岁孩子 15 公斤'], [30, '小学生 30 公斤'], [60, '大人 60 公斤'], [80, '大人 80 公斤']];
  pre.innerHTML = PS.map(p => '<button class="btn" data-w="' + p[0] + '">' + p[1] + '</button>').join('');
  slider('dsW', v => { W = v; return v + ' 公斤'; }, () => { draw(); syncPre(); });
  pre.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const r = $('#dsW'); r.value = b.dataset.w; r.dispatchEvent(new Event('input')); });
  function syncPre(){ $$('button', pre).forEach(b => b.classList.toggle('on', +b.dataset.w === W)); }
  syncPre(); draw();
});
