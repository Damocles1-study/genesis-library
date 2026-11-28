/* ---------- 第十二章：堆，一棵树一排格子 ---------- */
dev('#heapFig', fig => {
  const svg = $('svg.heap', fig), arr = $('#hpArr'), say = $('.say', fig);
  const EVENTS = ['雨停了', '树苗长大', '鸭子下蛋', '天黑了', '灯亮了', '沙晒干', '团团醒了', '水退了', '船造好', '花开了', '早上好', '风来了'];
  let h, busy = false, ek = 0; const r = rng(12);
  const wait = ms => new Promise(res => setTimeout(res, ms));
  function draw(mark){
    mark = mark || {};
    const nodes = {}; h.forEach((e, i) => nodes[i] = {k: String(e[0]), l: 2 * i + 1 < h.length ? 2 * i + 1 : null, r: 2 * i + 2 < h.length ? 2 * i + 2 : null});
    drawBinTree(svg, nodes, h.length ? 0 : null, {W: 640, H: 210, mark: id => mark[id] || ''});
    arr.innerHTML = h.map((e, i) => '<span class="' + (mark[i] === 'hl' ? 'hl' : mark[i] ? 'mv' : '') + '">' + e[0] + '<small>[' + i + '] ' + e[1] + '</small></span>').join('') || '<span class="dim" style="border:0">空的</span>';
  }
  function reset(){ h = [[3, '雨停了'], [5, '树苗长大'], [12, '天黑了'], [8, '鸭子下蛋']]; ek = 4; draw(); say.textContent = '堆里有 4 件事，数字是“第几刻发生”。最早的在根上，也在数组的第 0 格。'; }
  $('[data-x="push"]', fig).addEventListener('click', async () => {
    if (busy) return; if (h.length >= 15) { say.textContent = '堆满了（这个装置最多 15 个），先拿走几个。'; return; }
    busy = true; const t = 1 + Math.floor(r() * 20), what = EVENTS[ek++ % EVENTS.length];
    h.push([t, what]); let i = h.length - 1; draw({[i]: 'hl'}); say.textContent = '新事件“' + what + '”（第 ' + t + ' 刻）放在数组末尾，第 ' + i + ' 格。'; await wait(600);
    while (i > 0) { const p = Math.floor((i - 1) / 2); if (h[i][0] < h[p][0]) { say.textContent = t + ' 比爸爸 ' + h[p][0] + ' 小：换上去。'; [h[i], h[p]] = [h[p], h[i]]; draw({[p]: 'hl', [i]: 'v'}); i = p; await wait(600); } else { say.textContent = t + ' 不比爸爸 ' + h[p][0] + ' 小：停在这里。'; break; } }
    if (i === 0) say.textContent = t + ' 浮到了根上：它现在是最早的事。';
    draw({[i]: 'hl'}); busy = false;
  });
  $('[data-x="pop"]', fig).addEventListener('click', async () => {
    if (busy || !h.length) { if (!h.length) say.textContent = '堆空了。'; return; }
    busy = true; const top = h[0]; const last = h.pop();
    if (!h.length) { draw(); say.textContent = '拿走了“' + top[1] + '”（第 ' + top[0] + ' 刻），堆空了。'; busy = false; return; }
    h[0] = last; draw({0: 'hl'}); say.textContent = '拿走根上的“' + top[1] + '”（第 ' + top[0] + ' 刻）。把最后一个（' + last[0] + '）搬到根上。'; await wait(800);
    let i = 0;
    while (true) { const L = 2 * i + 1, R = 2 * i + 2; let s = i; if (L < h.length && h[L][0] < h[s][0]) s = L; if (R < h.length && h[R][0] < h[s][0]) s = R; if (s === i) { say.textContent = h[i][0] + ' 比孩子都小（或者没有孩子了）：停。现在最早的是第 ' + h[0][0] + ' 刻的“' + h[0][1] + '”。'; break; } say.textContent = h[i][0] + ' 比更小的孩子 ' + h[s][0] + ' 大：换下去。'; [h[i], h[s]] = [h[s], h[i]]; draw({[s]: 'hl', [i]: 'v'}); i = s; await wait(700); }
    draw({[i]: 'hl'}); busy = false;
  });
  $('[data-x="r"]', fig).addEventListener('click', () => { if (!busy) reset(); });
  reset();
});
