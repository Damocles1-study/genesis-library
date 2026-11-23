/* ---------- 装置 17：格雷戈里·金的表 ---------- */
dev('#kgFig', () => {
  const K = [[0, 0], [10, 30], [20, 80], [30, 160], [40, 280], [50, 450]];
  const inc = d => { d = clamp(d, 0, 50); for (let i = 1; i < K.length; i++) if (d <= K[i][0]) { const a = K[i - 1], b = K[i], t = (d - a[0]) / (b[0] - a[0]); return lerp(a[1], b[1], t * t * (3 - 2 * t) * 0.35 + t * 0.65); } return 450; };
  const D = slider('kgD', v => '少了 ' + v + '%', () => draw());
  const R = slider('kgR', v => v ? v + '%' : '没有仓', () => draw());
  function draw(){
    const d = D(), eff = Math.max(0, d - R()), up = inc(eff), P = 1 + up / 100;
    const pts = []; for (let x = 0; x <= 50; x++) pts.push([x, inc(x)]);
    const m = lineChart($('#kgChart'), [{pts, color: 'var(--red)', w: 2.4}, {pts: K, color: 'var(--ink)', w: 0, dots: true}], {xmin: 0, xmax: 50, ymin: 0, ymax: 460, xt: [0, 10, 20, 30, 40, 50], yt: [0, 100, 200, 300, 400], xf: v => '少' + v + '%', yf: v => '+' + v + '%', H: 230, L: 52});
    $('#kgChart').insertAdjacentHTML('beforeend', '<circle cx="' + m.X(eff) + '" cy="' + m.Y(up) + '" r="7" fill="none" stroke="var(--main)" stroke-width="2.5"/>');
    const eat = 1.2 / P;
    kv($('#kgKv'), [['实际缺口', eff + '%'], ['粮价', '涨 ' + Math.round(up) + '%'], ['短工的工钱能买到', Math.round(eat * 100) + '% 的口粮']]);
    $('#kgSay').innerHTML = (eff === 0 ? (d ? '仓里放出的粮把缺口补上了，粮价稳住：这就是常平仓的本意。前提是仓里真的有粮，账上的数字不算。' : '平常年景。短工的工钱够一家人吃，还能剩一点。') :
      eat >= 1 ? '粮价涨了，短工一家还勉强吃得饱，但已经没有余钱了。' :
      eat >= 0.6 ? '收成只少了 ' + eff + '%，粮价却涨了 ' + Math.round(up) + '%：短工的工钱只够一家人吃个半饱，开始卖家当、借高利贷。' :
      '粮价涨了 ' + Math.round(up) + '%，短工的工钱连一家人六成的口粮都买不到。<b>地里只少了 ' + eff + '% 的粮，他家却少了一大半</b>。这就是森说的“交换权利”崩溃。') +
      (R() && d > R() ? '仓里放出 ' + R() + '% 的粮，粮价从涨 ' + Math.round(inc(d)) + '% 降到涨 ' + Math.round(up) + '%，放一点点，效果比看上去大得多。' : '');
  }
  draw();
});
