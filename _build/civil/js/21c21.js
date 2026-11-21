
/* ---------- 装置 22：会签 ---------- */
dev('#hqFig', fig => {
  const svg = $('#hqSvg'), N = $('#hqN');
  function calc(){
    const n = +N.value;
    $('#hqNO').textContent = n + ' 个部门';
    const days = 1 + n * 1.25 + 0.5;
    // 每个签字人发现某个错误的概率，随人数增加而下降
    const p1 = n === 0 ? 0 : 0.45 / (1 + 0.28 * (n - 1));
    const base = 0.35; // 经办人自己和签发领导发现的概率合计
    const catchOne = 1 - (1 - base) * Math.pow(1 - p1, n);
    const catchAll = Math.pow(catchOne, 3);
    const share = 1 / (n + 2);
    // 曲线：0..10 的 catchAll
    const pts = [], dpts = [];
    for (let k = 0; k <= 10; k++) { const q = k === 0 ? 0 : 0.45 / (1 + 0.28 * (k - 1)); const c = 1 - (1 - base) * Math.pow(1 - q, k); pts.push([k, Math.pow(c, 3) * 100]); dpts.push([k, (1.5 + k * 1.25) * 6]); }
    const ch = lineChart(svg, [{color: 'var(--grn)', pts, w: 2.6, dots: true}, {color: 'var(--zhu)', pts: dpts, dash: '5 4'}], {xmin: 0, xmax: 10, ymin: 0, ymax: 100, yt: [0, 50, 100], yf: v => v + '%', xt: [0, 2, 4, 6, 8, 10], xf: v => v + ' 个', H: 200, marks: [[n, '你选的']]});
    kv($('#hqKv'), [['走多少天', days.toFixed(1) + ' 天'], ['三个错误全挑出', (catchAll * 100).toFixed(0) + '%'], ['出事时每人责任', (share * 100).toFixed(0) + '%']]);
    const s = $('#hqSay');
    s.innerHTML = '<span style="color:var(--grn)">实线</span>：三个错误全被挑出的概率；<span style="color:var(--zhu)">虚线</span>：走的天数（×6）。' +
      (n === 0 ? '不会签：最快，但只靠经办人和领导两双眼睛，错误很容易漏过去。' :
       n <= 3 ? '会签几个真正相关的部门，挑错的概率上升得最快，时间也还能接受。<b>这是会签最有用的区间</b>。' :
       '再往后，每多一个部门，时间照样增加，挑错的概率却几乎不涨了，因为每个人都觉得“前面的人看过了”。<b>增加的只剩一样东西：每个人身上的责任变小了</b>。');
  }
  N.addEventListener('input', calc); calc();
});
