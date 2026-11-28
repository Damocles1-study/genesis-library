/* ---------- 第三部封面：七座桥 ---------- */
dev('#bridgeFig', fig => {
  const svg = $('svg', fig), say = $('.say', fig);
  const LAND = {A: [320, 50, '北岸'], B: [320, 250, '南岸'], C: [180, 150, '岛'], D: [500, 150, '东边']};
  const BASE = [['A', 'C', -30], ['A', 'C', 30], ['B', 'C', -30], ['B', 'C', 30], ['A', 'D', 0], ['B', 'D', 0], ['C', 'D', 0]];
  let E, used, at, trail;
  function reset(extra){ E = BASE.map(e => e.slice()); if (extra) E.push(['A', 'B', 0]); used = E.map(() => false); at = null; trail = []; draw(); say.textContent = extra ? '加了一座北岸到南岸的桥，现在是八座。选一块地出发。' : '先点一块地（圆）当起点。'; }
  const deg = k => E.filter(e => e[0] === k || e[1] === k).length;
  function draw(){
    let h = '<path d="M0,115 C160,95 220,120 320,115 C420,110 520,130 640,110 L640,185 C520,200 420,180 320,185 C220,190 160,205 0,185 Z" fill="color-mix(in srgb,var(--t-w) 40%,transparent)"/>';
    E.forEach((e, i) => { const a = LAND[e[0]], b = LAND[e[1]]; const mx = (a[0] + b[0]) / 2 + e[2] * (a[1] === b[1] ? 0 : 1), my = (a[1] + b[1]) / 2 + (a[1] === b[1] ? e[2] : 0); h += '<path d="M' + a[0] + ',' + a[1] + ' Q' + (mx + (e[2] ? e[2] : 0)) + ',' + my + ' ' + b[0] + ',' + b[1] + '" fill="none" stroke="' + (used[i] ? 'var(--main)' : 'var(--ink-3)') + '" stroke-width="' + (used[i] ? 6 : 4) + '" stroke-dasharray="' + (used[i] ? '0' : '2 0') + '" data-e="' + i + '" style="cursor:pointer"/>'; h += '<path d="M' + a[0] + ',' + a[1] + ' Q' + (mx + (e[2] ? e[2] : 0)) + ',' + my + ' ' + b[0] + ',' + b[1] + '" fill="none" stroke="transparent" stroke-width="18" data-e="' + i + '" style="cursor:pointer"/>'; });
    Object.keys(LAND).forEach(k => { const [x, y, n] = LAND[k]; h += '<circle cx="' + x + '" cy="' + y + '" r="24" fill="' + (at === k ? 'var(--main)' : 'var(--t-g)') + '" stroke="var(--ink-3)" data-l="' + k + '" style="cursor:pointer"/>' + txt(x, y + 4, n, {s: 12, c: at === k ? 'var(--paper)' : 'var(--t-ink)', halo: false, w: 1}) + txt(x + 34, y - 18, deg(k) + ' 座桥', {s: 11, c: 'var(--ink-3)'}); });
    svg.innerHTML = h;
  }
  svg.addEventListener('click', ev => {
    const l = ev.target.closest('[data-l]'), b = ev.target.closest('[data-e]');
    if (l && at === null) { at = l.dataset.l; trail = [LAND[at][2]]; draw(); say.textContent = '从' + LAND[at][2] + '出发。点一座连着它的桥。'; return; }
    if (b) {
      if (at === null) { say.textContent = '先点一块地当起点。'; return; }
      const i = +b.dataset.e, e = E[i];
      if (used[i]) { say.textContent = '这座桥已经走过了。'; return; }
      if (e[0] !== at && e[1] !== at) { say.textContent = '这座桥不连着你现在站的' + LAND[at][2] + '。'; return; }
      used[i] = true; at = e[0] === at ? e[1] : e[0]; trail.push(LAND[at][2]); draw();
      const left = used.filter(u => !u).length;
      const can = E.some((x, k) => !used[k] && (x[0] === at || x[1] === at));
      say.textContent = trail.join(' → ') + '。' + (left === 0 ? '每座桥都正好走了一次！' : can ? '还剩 ' + left + ' 座桥。' : '走不下去了：' + LAND[at][2] + '连着的桥都走过了，还剩 ' + left + ' 座没走。点“重来”换个走法，或者点“为什么走不成”。');
    }
  });
  $('[data-x="r"]', fig).addEventListener('click', () => reset(E.length > 7));
  $('[data-x="add"]', fig).addEventListener('click', () => reset(true));
  $('[data-x="why"]', fig).addEventListener('click', () => { const odd = Object.keys(LAND).filter(k => deg(k) % 2); say.textContent = '欧拉的想法：每路过一块地，总是走进去一座桥、走出来一座桥，要用掉两座。所以除了起点和终点，每块地连着的桥数都必须是双数。现在连着单数座桥的地有 ' + odd.length + ' 块（' + odd.map(k => LAND[k][2]).join('、') + '）。' + (odd.length === 0 ? '一块都没有：从哪儿出发都能走完，还能回到起点。' : odd.length === 2 ? '正好两块：从其中一块出发，到另一块结束，就能走完。' : '超过两块，怎么走都走不成。这是图论的第一个定理：只看“点”和“线”，不看地有多大、桥有多长。'); });
  reset(false);
});
