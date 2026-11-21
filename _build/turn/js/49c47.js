/* ---------- 装置 48：多米诺 ---------- */
dev('#domFig', fig => {
  // [名称, x, y, 实际（1975 年前后是否“倒”）]
  const N = [['越南', 330, 150, 1], ['老挝', 270, 110, 1], ['柬埔寨', 290, 190, 1], ['泰国', 210, 160, 0], ['缅甸', 150, 90, 0], ['马来西亚', 230, 260, 0], ['新加坡', 250, 300, 0], ['印度尼西亚', 300, 330, 0], ['菲律宾', 450, 180, 0], ['中国（已是）', 330, 40, 2]];
  const E = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [3, 4], [3, 5], [5, 6], [6, 7], [5, 7], [0, 8], [7, 8], [1, 4], [0, 9], [1, 9], [4, 9]];
  const nb = i => E.filter(e => e[0] === i || e[1] === i).map(e => e[0] === i ? e[1] : e[0]);
  const P = $('#dmP'), svg = $('#dmSvg');
  let state = N.map((n, i) => i === 9 ? 2 : 0), mode = 'sim', runs = [];
  P.addEventListener('input', () => { $('#dmPo').textContent = P.value + '%'; runs = []; });
  $('#dmPo').textContent = P.value + '%';
  $('#dmGo').addEventListener('click', () => { mode = 'sim'; simulate(); });
  $('#dmHist').addEventListener('click', () => { mode = 'hist'; draw(); });
  function simulate(){
    const p = +P.value / 100, r = rng(Date.now() & 0xffffffff);
    state = N.map((n, i) => i === 9 ? 2 : 0); state[0] = 1;
    let frontier = [0];
    while (frontier.length) { const nx = []; frontier.forEach(i => nb(i).forEach(j => { if (state[j] === 0 && r() < p) { state[j] = 1; nx.push(j); } })); frontier = nx; }
    runs.push(state.filter(s => s === 1).length);
    draw();
  }
  function draw(){
    const st = mode === 'hist' ? N.map(n => n[3]) : state;
    let g = '<rect width="520" height="385" fill="var(--sea)" fill-opacity=".35" rx="8"/>';
    E.forEach(e => { const a = N[e[0]], b = N[e[1]]; g += '<line x1="' + a[1] + '" y1="' + a[2] + '" x2="' + b[1] + '" y2="' + b[2] + '" stroke="var(--ink-3)" stroke-width="1.2" stroke-dasharray="3 3"/>'; });
    N.forEach((n, i) => {
      const s = st[i], fill = s === 2 ? 'var(--paper-2)' : s === 1 ? 'var(--red)' : 'var(--card)';
      g += '<g transform="translate(' + n[1] + ',' + n[2] + ')' + (s === 1 ? ' rotate(-18)' : '') + '"><rect x="-11" y="-20" width="22" height="40" rx="3" fill="' + fill + '" stroke="var(--ink)" stroke-width="1.4"/><circle cx="0" cy="-9" r="2.5" fill="var(--ink)"/><circle cx="0" cy="9" r="2.5" fill="var(--ink)"/></g>';
      g += txt(n[1], n[2] + 36, n[0], {s: 12, w: s === 1});
    });
    svg.setAttribute('viewBox', '0 0 520 385'); svg.innerHTML = g;
    const say = $('#dmSay');
    if (mode === 'hist') {
      say.className = 'say';
      say.innerHTML = '<b>实际发生的：倒了三块。</b>1975 年，南越、柬埔寨、老挝先后由共产党掌权。泰国、马来西亚、新加坡、印度尼西亚、菲律宾、缅甸都没有倒（印度尼西亚 1965 年反而发生了一场针对共产党人的大屠杀，几十万人被杀，<b>存疑</b>美国的角色）。倒下的三块很快自己打了起来：1978 年底越南出兵柬埔寨推翻了红色高棉，1979 年初中国和越南打了一仗。<em>骨牌不是骨牌，每一块都有自己的历史、自己的民族主义，和自己的邻居之间的旧账</em>。';
    } else if (!state.some(s => s === 1)) {
      say.className = 'say'; say.innerHTML = '按“推倒越南”开始。';
    } else {
      const k = state.filter(s => s === 1).length, avg = runs.reduce((a, b) => a + b, 0) / runs.length;
      say.className = 'say' + (k >= 6 ? ' bad' : '');
      say.innerHTML = '<b>这一次倒了 ' + k + ' 块。</b>' + (runs.length > 1 ? '按这个概率试了 ' + runs.length + ' 次，平均倒 ' + avg.toFixed(1) + ' 块。' : '') + (+P.value >= 70 ? '概率定得这么高，几乎一定会一路倒下去：这正是华盛顿当年的想象，所以它觉得必须在第一块那里不惜一切地挡住。' : +P.value <= 30 ? '概率低的时候，第一块倒下，后面的大多站得住。那么，为第一块付出五万八千条美国人的命和几百万越南人的命，值不值？' : '同样的概率，每次的结果差别很大。<em>模型的结论，几乎全由你填进去的那个概率决定</em>，而那个概率，当年没有人真正知道。');
    }
  }
  draw();
  // 美军人数（千人，年底，约）
  const TR = [[1960, .9], [1961, 3.2], [1962, 11.3], [1963, 16.3], [1964, 23.3], [1965, 184], [1966, 385], [1967, 486], [1968, 536], [1969, 475], [1970, 335], [1971, 157], [1972, 24], [1973, .05]];
  lineChart($('#dmTroop'), [{color: 'var(--red)', pts: TR, w: 2.6}], {H: 190, xmin: 1960, xmax: 1973, ymin: 0, ymax: 560, xt: [1960, 1962, 1964, 1966, 1968, 1970, 1972], yt: [0, 200, 400], yf: v => v + ' 千', marks: [[1964.6, '东京湾'], [1968.1, '春节攻势'], [1972.9, '撤军']]});
});
