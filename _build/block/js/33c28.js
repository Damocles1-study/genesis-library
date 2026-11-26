
/* ---------- 第二十八章：延迟是什么感觉 ---------- */
dev('#pingFig', () => {
  const sv = $('#pingSvg'); let ping = 50, t0 = performance.now(), raf = 0, vis = true;
  const W = 600, H = 200;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) loop(); }).observe(sv);
  function pos(t){ return 60 + (Math.sin(t / 900) * .5 + .5) * (W - 120); }
  function loop(){
    cancelAnimationFrame(raf);
    const t = performance.now() - t0;
    const me = pos(t), srv = pos(t - ping), other = pos(t - 2 * ping);
    let g = '<rect width="' + W + '" height="' + H + '" fill="var(--paper)"/>';
    const row = (y, label, x, col, note) => '<line x1="40" x2="' + (W - 40) + '" y1="' + y + '" y2="' + y + '" stroke="var(--rule)"/>' + txt(40, y - 14, label, {s: 12, a: 'start', c: 'var(--ink-2)'}) + '<rect x="' + (x - 9) + '" y="' + (y - 9) + '" width="18" height="18" fill="' + col + '" stroke="var(--ink-3)"/>' + txt(W - 40, y - 14, note, {s: 11, a: 'end', c: 'var(--ink-3)'});
    g += row(45, '你自己的屏幕上，你在这儿', me, 'var(--main)', '马上就动');
    g += row(105, '服务器知道的你', srv, 'var(--blu)', '晚 ' + ping + ' 毫秒');
    g += row(165, '豆子屏幕上的你', other, 'var(--zhu)', '晚 ' + 2 * ping + ' 毫秒');
    sv.setAttribute('viewBox', '0 0 ' + W + ' ' + H); sv.innerHTML = g;
    if (vis) raf = requestAnimationFrame(loop);
  }
  slider('pingMs', v => v + ' 毫秒', v => {
    ping = v;
    const ticks = v / 50;
    kv($('#pingKv'), [['单程延迟', v + ' 毫秒'], ['相当于几个游戏刻', ticks.toFixed(1) + ' 刻'], ['豆子看到你，晚了', (2 * v / 1000).toFixed(2) + ' 秒']]);
    $('#pingSay').textContent = v <= 30 ? '同一个 Wi-Fi 下的局域网，延迟通常就这么小，几乎感觉不到。' : v <= 120 ? '隔着一座城、一个国家联机，大概是这样。打怪时会觉得稍微有点“慢半拍”。' : '延迟很大：你明明躲开了，豆子的屏幕上你还站在原地。玩家说的“卡”“瞬移”“橡皮筋”，很多就是这个。';
    loop();
  });
});
