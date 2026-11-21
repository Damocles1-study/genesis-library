/* ---------- 装置 26：黑死病之后的工钱 ---------- */
dev('#wageFig', fig => {
  const M = $('#wgM'), E = $('#wgE');
  M.addEventListener('input', go); E.addEventListener('input', go);
  const bar = (nm, sub, v, max, c, lab) => '<div class="row"><span class="nm">' + nm + (sub ? '<small>' + sub + '</small>' : '') + '</span><span class="tr"><i style="width:' + clamp(v / max * 100, 0, 100) + '%;background:' + c + '"></i></span><span class="v">' + lab + '</span></div>';
  function go(){
    const m = +M.value / 100, e = +E.value / 100;
    $('#wgMo').textContent = Math.round(m * 100) + '%'; $('#wgEo').textContent = Math.round(e * 100) + '%';
    const L = 1 - m;
    const wMkt = Math.pow(L, -0.7);          // 市场工钱：人越少越高（示意弹性）
    const rent = Math.pow(L, 0.6);           // 每亩地租：人越少越低
    const paid = 1 + (wMkt - 1) * (1 - e * 0.8);   // 法令能压掉的部分（执行力再强也压不尽）
    const gap = Math.max(0, wMkt - paid) / wMkt;    // 被压下去的比例
    const flee = clamp(gap * 120 * (0.4 + m), 0, 100);         // 想跑的人（示意）
    const anger = clamp(gap * 100 + e * m * 60, 0, 100);         // 怨气（示意）
    $('#wgBars').innerHTML =
      bar('市场工钱', '没有法令时', wMkt * 100, 300, 'var(--grn)', Math.round(wMkt * 100)) +
      bar('实际到手', '法令压过以后', paid * 100, 300, 'var(--main)', Math.round(paid * 100)) +
      bar('每亩地租', '地主的收入', rent * 100, 300, 'var(--och)', Math.round(rent * 100)) +
      bar('想跑的人', '去别的庄园、进城', flee, 100, 'var(--ter)', Math.round(flee) + '%') +
      bar('怨气', '离造反有多远', anger, 100, 'var(--red)', Math.round(anger));
    kv($('#wgKV'), [['活下来的人', Math.round(L * 100) + '%'], ['工钱（瘟疫前 = 100）', Math.round(paid * 100)], ['被法令压掉的', Math.round(gap * 100) + '%']]);
    const say = $('#wgSay');
    say.className = 'say' + (anger > 55 ? ' bad' : wMkt > 1.3 && e < .3 ? ' ok' : '');
    say.innerHTML = m < .05 ? '没有瘟疫，一切照旧：人多地少，工钱低，地租高。十四世纪初的英格兰正是这样，人口多到连贫瘠的山地都开垦了。'
      : e < .15 ? '法令形同虚设。工钱涨到了瘟疫前的 <b>' + Math.round(wMkt * 100) + '</b>，地主的地租掉到 ' + Math.round(rent * 100) + '。这差不多就是十五世纪英格兰的实情：有人把它叫做“雇工的黄金时代”。'
      : anger > 55 ? '法令压得越狠，工钱和“该得的”差得越远。被压掉的那一截，变成了逃跑、怠工和怨气。再碰上一次加税，就是 1381 年。'
      : '法令压住了一部分，可压不住全部：地主们一边投票冻结工钱，一边偷偷多给，<em>因为不多给就没人干活</em>。';
  }
  go();
});
