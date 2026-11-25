/* ---------- 装置 19：钢筋放在哪儿 ---------- */
dev('#rcFig', () => {
  const L = 6, B = 250, Hh = 500, D = 450, FC = 30, FT = 3, FY = 400, AB = 491, XIB = 0.518; // 25 毫米钢筋
  const SELF = 0.25 * 0.5 * 25; // 自重 kN/m
  const MODE = ['不放钢筋', '放在下面', '放在上面'];
  let k = 1;
  btnRow($('#rcBtns'), MODE, k, i => { k = i; draw(); });
  const N = slider('rcN', v => v + ' 根', () => draw());
  const Wl = slider('rcW', v => v + ' kN/m', () => draw());
  function calc(){
    const n = N(), w = Wl() + SELF, M = w * L * L / 8;
    const Mcr = FT * B * Hh * Hh / 6 / 1e6;
    let Mu = Mcr, brittle = false, over = false;
    if (k === 1) {
      const As = n * AB, x = As * FY / (0.85 * FC * B);
      if (x / D > XIB) { over = true; const xb = XIB * D; Mu = 0.85 * FC * B * xb * (D - xb / 2) / 1e6; }
      else Mu = As * FY * (D - x / 2) / 1e6;
    }
    if (k !== 1) brittle = true;
    if (over) brittle = true;
    return {n, w, M, Mcr, Mu, brittle, over};
  }
  function draw(){
    const c = calc();
    const W = 600, H = 230, x0 = 50, x1 = 550, yT = 90, bh = 46;
    const state = c.M < c.Mcr ? 0 : c.M < c.Mu ? 1 : 2;
    const sag = state === 0 ? c.M / c.Mcr * 2 : state === 1 ? 2 + (c.M - c.Mcr) / (c.Mu - c.Mcr) * 14 : 26;
    let g = '';
    /* 荷载箭头 */
    const na = 11, al = 10 + Math.min(30, c.w / 3);
    for (let i = 0; i < na; i++) { const x = x0 + 10 + i * (x1 - x0 - 20) / (na - 1); g += '<line x1="' + x + '" x2="' + x + '" y1="' + (yT - al - 6) + '" y2="' + (yT - 6) + '" stroke="var(--ink-3)"/><path d="M' + (x - 3) + ',' + (yT - 10) + 'l3,4 3,-4" fill="none" stroke="var(--ink-3)"/>'; }
    g += txt(300, yT - al - 12, '均布荷载 ' + Math.round(c.w) + ' kN/m（含自重）', {s: 11.5, c: 'var(--ink-2)'});
    /* 弯下去的梁：用二次曲线 */
    const curve = dy => 'M' + x0 + ',' + (yT + dy) + 'Q300,' + (yT + dy + sag * 2) + ' ' + x1 + ',' + (yT + dy);
    if (state < 2 || !c.brittle) {
      g += '<path d="' + curve(0) + 'L' + x1 + ',' + (yT + bh) + 'Q300,' + (yT + bh + sag * 2) + ' ' + x0 + ',' + (yT + bh) + 'z" fill="var(--paper-2)" stroke="var(--ink)" stroke-width="1.4"/>';
    } else {
      /* 脆断：从中间断成两截 */
      g += '<path d="M' + x0 + ',' + yT + 'L296,' + (yT + 30) + 'L296,' + (yT + 30 + bh) + 'L' + x0 + ',' + (yT + bh) + 'z" fill="var(--paper-2)" stroke="var(--red)" stroke-width="1.4"/>';
      g += '<path d="M' + x1 + ',' + yT + 'L304,' + (yT + 30) + 'L304,' + (yT + 30 + bh) + 'L' + x1 + ',' + (yT + bh) + 'z" fill="var(--paper-2)" stroke="var(--red)" stroke-width="1.4"/>';
    }
    /* 钢筋 */
    if (k > 0 && !(state === 2 && c.brittle)) {
      const dy = k === 1 ? bh - 7 : 7;
      g += '<path d="' + curve(dy) + '" fill="none" stroke="var(--ter)" stroke-width="' + (1.5 + c.n * 0.5) + '"/>';
    }
    /* 裂缝 */
    if (state >= 1 && !(state === 2 && c.brittle)) {
      const nc = Math.min(15, 3 + Math.round((c.M - c.Mcr) / (c.Mu - c.Mcr + 1e-9) * 12));
      for (let i = 0; i < nc; i++) {
        const t = (i + 0.5) / nc, x = 300 + (t - 0.5) * (x1 - x0) * 0.75;
        const yb = yT + bh + sag * 2 * (1 - Math.pow((x - 300) / 250, 2));
        const len = 10 + 26 * (1 - Math.abs(t - 0.5) * 2) * Math.min(1, (c.M - c.Mcr) / (c.Mu - c.Mcr + 1e-9) + 0.3);
        g += '<path d="M' + x + ',' + yb + 'l' + ((t - 0.5) * 6) + ',' + (-len) + '" stroke="var(--red)" stroke-width="1.2"/>';
      }
    }
    if (state === 2 && !c.brittle) g += txt(300, yT + bh + sag * 2 + 22, '钢筋屈服，梁慢慢垂下来', {s: 12, c: 'var(--red)', w: 1});
    if (state === 2 && c.brittle) g += txt(300, yT + bh + 60, c.over ? '上面的混凝土突然压碎' : '下缘一裂，整根断开', {s: 12, c: 'var(--red)', w: 1});
    /* 支座 */
    g += '<path d="M' + x0 + ',' + (yT + bh) + 'l-10,16h20z" fill="var(--ink-3)"/><path d="M' + x1 + ',' + (yT + bh) + 'l-10,16h20z" fill="var(--ink-3)"/>';
    g += txt(300, H - 6, '跨度 6 米 · 截面 25 × 50 厘米', {s: 11, c: 'var(--ink-3)', halo: false});
    const svg = $('#rcSvg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const wcr = c.Mcr * 8 / (L * L) - SELF, wu = c.Mu * 8 / (L * L) - SELF;
    kv($('#rcKv'), [['开裂荷载', Math.max(0, wcr).toFixed(1) + ' kN/m'], ['破坏荷载', Math.max(0, wu).toFixed(1) + ' kN/m'], ['现在', ['完好', '开裂，还能扛', '坏了'][state]], ['破坏方式', k !== 1 ? '脆断' : c.over ? '压碎（突然）' : '钢筋屈服（有预兆）']]);
    const s = $('#rcSay');
    s.className = 'say' + (state === 2 ? ' bad' : state === 0 ? ' ok' : '');
    if (k === 0) s.innerHTML = '素混凝土梁：开裂的那一刻就是断的那一刻，扣掉自重，它几乎扛不了什么东西。<b>混凝土能压不能拉，这和石梁、铸铁梁是一个毛病</b>。';
    else if (k === 2) s.innerHTML = '钢筋放在上面，上面本来就是受压的，混凝土自己扛得住；拉开的是下面，那里没有钢筋。<b>放反了，和没放差不多</b>。悬挑阳台正好相反，它的钢筋要放在上面，装修时千万别凿。';
    else if (c.over) s.innerHTML = '钢筋放得太多：还没等钢筋拉到屈服，上面的混凝土先被压碎了。这种破坏没有预兆，来得突然，<b>规范里专门规定了钢筋的上限，宁可让钢筋先“软”下来</b>。';
    else s.innerHTML = state === 0 ? '荷载不大，混凝土还没裂。' + c.n + ' 根钢筋能让这根梁扛到约 ' + Math.round(wu) + ' kN/m，是素混凝土的 ' + Math.max(1, Math.round(wu / Math.max(0.5, wcr))) + ' 倍以上。' :
      state === 1 ? '下面已经裂出一道道细缝，可拉力交给了钢筋，梁照样站着。<b>钢筋混凝土梁本来就是“带缝工作”的</b>，细到头发丝那么宽的裂缝是正常的。' :
      '钢筋拉到屈服，梁会明显地弯下去、裂缝变宽，然后才断。这种破坏有预兆，人有时间跑。';
  }
  draw();
});
