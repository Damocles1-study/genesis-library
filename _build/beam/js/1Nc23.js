/* ---------- 装置 24：流水线上的房子 ---------- */
dev('#lvFig', () => {
  const ST = [['地基', 2], ['墙架', 1.5], ['屋面', 2], ['门窗', 1], ['水电', 2], ['墙板', 2.5], ['地板', 1], ['油漆', 1.5]];
  const COL = ['var(--kraft)', 'var(--main)', 'var(--ter)', 'var(--blu)', 'var(--och)', 'var(--grn)', 'var(--pur)', 'var(--red)'];
  const K = ST.length;
  const MODE = ['一个班组包一栋', '一个班组只干一道'];
  let m = 1;
  btnRow($('#lvBtns'), MODE, m, i => { m = i; draw(); });
  const Hn = slider('lvH', v => v + ' 栋', () => draw());
  const Lr = slider('lvL', v => v + '%', () => draw());
  const dur = (base, rep, l) => base * Math.max(0.45, Math.pow(1 - l, Math.log2(rep))); // 第 rep 次干同样的活
  function sim(n, l, mode){
    const seg = []; // [house, step, start, end]
    if (mode === 0) {
      const free = new Array(K).fill(0), cnt = new Array(K).fill(0);
      for (let h = 0; h < n; h++) {
        const c = h % K; cnt[c]++; let t = free[c];
        for (let s = 0; s < K; s++) { const d = dur(ST[s][1] * 1.25, cnt[c], l) + 0.3; seg.push([h, s, t, t + d]); t += d; } // 样样都干的人慢一点，每换一道活要收拾工具、等料
        free[c] = t;
      }
    } else {
      const free = new Array(K).fill(0), done = new Array(n).fill(0);
      for (let h = 0; h < n; h++) for (let s = 0; s < K; s++) {
        const st = Math.max(free[s], done[h]), d = dur(ST[s][1], h + 1, l);
        seg.push([h, s, st, st + d]); free[s] = st + d; done[h] = st + d;
      }
    }
    const end = Math.max(...seg.map(x => x[3]));
    const busy = seg.reduce((a, x) => a + x[3] - x[2], 0);
    return {seg, end, busy};
  }
  function draw(){
    const n = Hn(), l = Lr() / 100, r = sim(n, l, m), o = sim(n, l, 1 - m);
    const W = 600, L = 50, R = 12, rowH = Math.max(3, Math.min(10, 300 / n)), H = 30 + n * rowH;
    const span = Math.max(r.end, o.end) * 1.02;
    const X = t => L + t / span * (W - L - R);
    let g = '';
    const step = span > 80 ? 20 : span > 40 ? 10 : 5;
    for (let t = 0; t <= span; t += step) g += '<line x1="' + X(t) + '" x2="' + X(t) + '" y1="4" y2="' + (H - 20) + '" stroke="var(--rule)"/>' + txt(X(t), H - 6, t + ' 天', {s: 10, c: 'var(--ink-3)', halo: false});
    r.seg.forEach(x => g += '<rect x="' + X(x[2]).toFixed(1) + '" y="' + (6 + x[0] * rowH) + '" width="' + Math.max(0.6, X(x[3]) - X(x[2])).toFixed(1) + '" height="' + Math.max(2, rowH - 1) + '" fill="' + COL[x[1]] + '" opacity=".85"/>');
    g += txt(L - 6, 14, '第 1 栋', {s: 10, a: 'end', c: 'var(--ink-3)', halo: false}) + txt(L - 6, 6 + n * rowH, '第 ' + n + ' 栋', {s: 10, a: 'end', c: 'var(--ink-3)', halo: false});
    g += '<line x1="' + X(o.end) + '" x2="' + X(o.end) + '" y1="4" y2="' + (H - 20) + '" stroke="var(--ink-2)" stroke-dasharray="4 3"/>' + txt(X(o.end) - 3, H - 24, '另一种办法', {s: 10, a: 'end', c: 'var(--ink-2)'});
    const svg = $('#lvSvg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g + '';
    const leg = ST.map((s, i) => '<span><i style="background:' + COL[i] + '"></i>' + s[0] + '</span>').join('');
    let lg = $('#lvLeg'); if (!lg) { $('#lvSvg').parentNode.insertAdjacentHTML('afterend', '<div class="legend" id="lvLeg"></div>'); lg = $('#lvLeg'); } lg.innerHTML = leg;
    const ends = r.seg.filter(x => x[1] === K - 1).map(x => x[3]).sort((a, b) => a - b);
    const tail = ends.slice(Math.floor(n / 2));
    const rate = tail.length > 1 ? (tail.length - 1) / (tail[tail.length - 1] - tail[0]) : 0;
    const idle = 1 - r.busy / (K * r.end);
    kv($('#lvKv'), [['全部盖完', r.end.toFixed(0) + ' 天'], ['后半程每天交', rate.toFixed(2) + ' 栋'], ['班组闲着的时间', Math.round(idle * 100) + '%'], ['另一种办法', o.end.toFixed(0) + ' 天']]);
    const s = $('#lvSay'), faster = r.end < o.end;
    s.className = 'say' + (faster ? ' ok' : '');
    s.innerHTML = m === 1 ? '每个班组只干一道活，一栋接一栋往前推，图上斜斜的一条条色带就是“流水”。' + (l > 0 ? '同样的活干了几十遍，班组越干越快，' : '') + (faster ? '<b>比“一个班组包一栋”早 ' + Math.round(o.end - r.end) + ' 天盖完</b>。' : '房子太少，流水线还没“热”起来，优势不明显。') + '代价是：最慢的那一道工序决定了整条线的速度，其他班组得等它（闲着的时间就是这么来的）。' :
      '每个班组从地基干到油漆，八个班组各盖各的。' + (faster ? '房子不多的时候，这样反而快。' : '每个人什么都得会，同样的活一年只干几遍，熟练得慢，' + '<b>比流水线晚 ' + Math.round(r.end - o.end) + ' 天</b>。') + '老式的营造厂和农村盖房子，多是这个办法。';
  }
  draw();
});
