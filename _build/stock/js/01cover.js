
/* ---------- 封面装置：哪一年进场，哪一年离场 ---------- */
dev('#triFig', fig => {
  const svg = $('#triSvg'), kvb = $('#triKv'), say = $('#triSay'), divCk = $('#triDiv');
  const Y0 = 1990, Y1 = 2025, N = Y1 - Y0 + 1;
  let idx = 0, sel = [2007, 2025];
  const DATA = [SH, SP], NAME = ['上证综指', '标普 500'];
  const ann = (a, b) => { const d = DATA[idx]; return Math.pow(d[b] / d[a], 1 / (b - a)) - 1 + (divCk.checked ? 0.02 : 0); };
  const tot = (a, b) => DATA[idx][b] / DATA[idx][a] * (divCk.checked ? Math.pow(1.02, b - a) : 1) - 1;
  function draw(){
    const L = 44, T = 10, cs = 15, W = L + (N - 1) * cs + 10, H = T + (N - 1) * cs + 34;
    let g = '';
    for (let i = 0; i < N - 1; i++) for (let j = i + 1; j < N; j++) {
      const a = Y0 + i, b = Y0 + j, r = ann(a, b), k = Math.min(1, Math.abs(r) / 0.22), m = Math.round(12 + k * 82);
      const col = r >= 0 ? 'var(--up)' : 'var(--dn)', on = sel[0] === a && sel[1] === b;
      g += '<rect x="' + (L + (j - 1) * cs) + '" y="' + (T + i * cs) + '" width="' + (cs - 1) + '" height="' + (cs - 1) + '" style="fill:color-mix(in srgb,' + col + ' ' + m + '%,var(--card))' + (on ? ';stroke:var(--ink);stroke-width:2' : '') + '" data-a="' + a + '" data-b="' + b + '"><title>' + a + ' 年底买，' + b + ' 年底卖：年化 ' + pc(r) + '</title></rect>';
    }
    for (let i = 0; i < N - 1; i += 5) g += txt(L - 5, T + i * cs + 11, Y0 + i, {s: 10.5, a: 'end', c: 'var(--ink-3)', halo: false});
    for (let j = 1; j < N; j++) if ((Y0 + j) % 5 === 0) g += txt(L + (j - 1) * cs + 7, T + (N - 1) * cs + 12, Y0 + j, {s: 10.5, c: 'var(--ink-3)', halo: false});
    g += txt(L + (N - 1) * cs / 2, H - 4, '卖出的年份（年底）→', {s: 11.5, c: 'var(--ink-2)', halo: false});
    g += '<text x="12" y="' + (T + (N - 1) * cs / 2) + '" font-size="11.5" fill="var(--ink-2)" text-anchor="middle" transform="rotate(-90 12 ' + (T + (N - 1) * cs / 2) + ')">买进的年份（年底）→</text>';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.style.minWidth = '460px'; svg.innerHTML = g;
    readout();
  }
  function readout(){
    const [a, b] = sel, d = DATA[idx], r = ann(a, b), t = tot(a, b);
    let win = 0, all = 0, win10 = 0, all10 = 0;
    for (let x = Y0; x < Y1; x++) for (let y = x + 1; y <= Y1; y++) { const z = ann(x, y); all++; if (z > 0) win++; if (y - x >= 10) { all10++; if (z > 0) win10++; } }
    kv(kvb, [['买进 · ' + a + ' 年底', d[a].toFixed(2)], ['卖出 · ' + b + ' 年底', d[b].toFixed(2)], ['总涨跌', '<span class="' + (t >= 0 ? 'up' : 'dn') + '">' + pc(t) + '</span>'], ['年化', '<span class="' + (r >= 0 ? 'up' : 'dn') + '">' + pc(r) + '</span>']]);
    let s = NAME[idx] + '：' + a + ' 年底买、拿 ' + (b - a) + ' 年，';
    s += t >= 0 ? '赚了 ' + pc(t).slice(1) + '。' : '亏了 ' + pc(t).slice(1) + '。';
    s += '这张图里一共 ' + all + ' 种“哪年买、哪年卖”的组合，' + Math.round(win / all * 100) + '% 是赚的；只看拿满十年以上的，' + Math.round(win10 / all10 * 100) + '% 是赚的。';
    let w2 = 0, a2 = 0; for (let x = 2000; x < Y1; x++) for (let y = x + 1; y <= Y1; y++) { a2++; if (ann(x, y) > 0) w2++; }
    s += '只看 2000 年以后买进的组合，赚的占 ' + Math.round(w2 / a2 * 100) + '%' + (idx === 0 ? '：上证的总数被九十年代初一百多点的起点抬高了不少。' : '。');
    if (idx === 0 && a === 2007) s += ' 2007 年底正是那一轮大牛市的山顶附近，“十几年还在三千点”说的多半是从山顶算起的账。';
    if (idx === 0 && a === 2005) s += ' 2005 年底是那一轮熊市的谷底附近，从这里算，同一个指数就成了“好市场”。';
    say.textContent = s;
  }
  btnRow($('#triIdx'), NAME, 0, i => { idx = i; draw(); });
  divCk.addEventListener('change', draw);
  svg.addEventListener('click', e => { const r = e.target.closest('rect'); if (!r) return; sel = [+r.dataset.a, +r.dataset.b]; draw(); });
  draw();
});
