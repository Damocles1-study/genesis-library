/* ---------- 装置 19：地里的氮账 ---------- */
dev('#nfFig', () => {
  const YMAX = 8, Y0 = 1.6, K = 0.018;        // 吨/公顷
  const yieldOf = n => YMAX - (YMAX - Y0) * Math.exp(-K * n);
  const UPT = 25;                               // 每吨粮带走约 25 公斤氮（含秸秆，粗略）
  const PRICE_N = 6, PRICE_G = 2.4;             // 元/公斤氮，元/公斤粮（示意）
  const N = slider('nfN', v => v + ' 公斤', () => draw());
  const M = slider('nfM', v => v + ' 公斤', () => draw());
  function draw(){
    const m = M(), n = N(), tot = n + m;
    const pts = [], lost = [];
    for (let x = 0; x <= 350; x += 10) { const y = yieldOf(x + m); pts.push([x, y]); lost.push([x, Math.max(0, (x + m) - y * UPT * 0.85) / 50]); }
    // 最划算：边际产量 × 粮价 = 肥价
    let opt = 0; for (let x = 0; x <= 350; x++) { const dy = (yieldOf(x + 1 + m) - yieldOf(x + m)) * 1000; if (dy * PRICE_G >= PRICE_N) opt = x; }
    const m2 = lineChart($('#nfChart'), [{pts, color: 'var(--grn)', w: 2.6}, {pts: lost, color: 'var(--red)', w: 2, dash: '5 4'}], {xmin: 0, xmax: 350, ymin: 0, ymax: 9, xt: [0, 50, 100, 150, 200, 250, 300, 350], yt: [0, 2, 4, 6, 8], xf: v => v, yf: v => v + ' 吨', H: 230,
      marks: [[opt, '最划算'], [n, '你']]});
    const y = yieldOf(tot), up = Math.min(tot, y * UPT * 0.85), loss = Math.max(0, tot - up);
    kv($('#nfKv'), [['产量', y.toFixed(1) + ' 吨/公顷'], ['约能养活', Math.round(y * 1000 * 3400 / 730000 * 0.7) + ' 人'], ['庄稼吸收', Math.round(up) + ' 公斤氮'], ['流失', Math.round(loss) + ' 公斤氮（' + (tot ? Math.round(loss / tot * 100) : 0) + '%）']]);
    $('#nfSay').innerHTML = n < 20 ? '几乎不施化肥：只靠粪肥和豆子，一公顷收 ' + y.toFixed(1) + ' 吨，这接近工业化以前的上限。' :
      n < opt - 40 ? '还没到“最划算”：再多施一些，产量还能明显往上走，庄稼也基本吃得完。（绿线是产量；红虚线是流失的氮，纵轴上的一格“2 吨”在这条线上代表一百公斤氮。）' :
      n <= opt + 20 ? '在“最划算”附近：多施一公斤氮换来的粮食，刚好值一公斤化肥的钱。这时产量已经接近天花板，流失也还不算太多。' :
      '已经超过了最划算的量：多撒的氮几乎不再增产，大部分流进了河里、地下水和空气。<b>' + Math.round(loss) + ' 公斤氮</b>白白流失，还要付肥料钱。“多施肥多打粮”在这里不成立了。';
  }
  draw();
});
