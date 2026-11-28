/* ---------- 第二十八章：堆排序；按位分桶 ---------- */
dev('#heapSortFig', fig => {
  sortViz(fig, ['堆', '快速', '归并'], {
    hint: a => a === '堆' ? '堆排序：先把数组修成大根堆（红色是下沉时的交换），再把堆顶换到后面。' : '拿来比一比。',
    end: a => a === '堆' ? ' 堆排序的比较次数也几乎不随数据变化。' : ''
  }).prep(true);
});
dev('#radixFig', fig => {
  const line = $('#rdLine'), bk = $('#rdB'), say = $('.say', fig);
  const r = rng(28);
  let A, B, pos, stage;
  const NAME = ['个位', '十位', '百位'];
  const dig = (v, p) => Math.floor(v / Math.pow(10, p)) % 10;
  const pad3 = v => String(v).padStart(3, '0');
  function reset(first){ A = first ? [218, 504, 73, 916, 342, 85, 507, 260] : Array.from({length: 9}, () => 1 + Math.floor(r() * 999)); B = null; pos = 0; stage = 'd'; draw(); say.textContent = '先按个位分进桶里。'; }
  function draw(){
    line.innerHTML = A ? A.map(v => '<span>' + (pos < 3 ? pad3(v).split('').map((c, i) => i === 2 - pos ? '<b style="color:var(--main)">' + c + '</b>' : c).join('') : pad3(v)) + '</span>').join('') : '';
    bk.innerHTML = Array.from({length: 10}, (_, d) => '<div><b>' + d + ' 号</b>' + (B ? B[d].map(pad3).join('<br>') : '') + '</div>').join('');
  }
  $('[data-x="d"]', fig).addEventListener('click', () => {
    if (pos >= 3) { say.textContent = '三位都做完了，已经排好。'; return; }
    if (stage !== 'd') { say.textContent = '先把桶里的倒出来。'; return; }
    B = Array.from({length: 10}, () => []); A.forEach(v => B[dig(v, pos)].push(v)); A = null; stage = 'c'; draw();
    say.textContent = '按' + NAME[pos] + '分好了。每个桶是一个队列：先扔进去的在上面。';
  });
  $('[data-x="c"]', fig).addEventListener('click', () => {
    if (stage !== 'c') { say.textContent = '先分进桶里。'; return; }
    A = []; B.forEach(q => A.push(...q)); B = null; pos++; stage = 'd'; draw();
    say.textContent = pos < 3 ? '按 0 到 9 号桶的顺序倒出来了。现在按' + NAME[pos] + '再分一次。' : '三趟做完：' + A.join('、') + '。一次大小都没比，就排好了！';
  });
  $('[data-x="r"]', fig).addEventListener('click', () => reset(false));
  reset(true);
});
