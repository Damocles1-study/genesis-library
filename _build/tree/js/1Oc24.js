/* ---------- 第二十四章：二分查找；判定树 ---------- */
dev('#bsFig', fig => {
  const body = $('.bsbody', fig), say = $('.say', fig);
  function search(){
    const A = [31, 35, 38, 42, 42, 47, 50, 56, 61, 70, 77, 85, 90, 96, 120];
    body.innerHTML = '<div class="row"><label class="dim" style="font-size:13px">你用了几步</label><input type="number" id="bsX" value="42" style="width:6em"><button class="btn pri" data-b="s">走一步</button><button class="btn" data-b="r">从头</button></div><div class="cells" id="bsArr"></div><div class="kv"></div>';
    let lo, hi, mid, looks, done;
    const draw = () => { $('#bsArr', body).innerHTML = A.map((v, i) => '<span class="' + (i === mid ? 'hl' : i < lo || i >= hi ? 'dim' : '') + '" style="' + (i === lo && !done ? 'border-color:var(--l2);' : '') + (i === hi - 1 && !done ? 'box-shadow:inset 0 -3px 0 var(--on);' : '') + '">' + v + '<small>' + i + (i === lo ? ' lo' : '') + (i === hi ? ' hi' : '') + '</small></span>').join('') + (hi === A.length ? '<span class="dim">·<small>' + A.length + ' hi</small></span>' : ''); kv($('.kv', body), [['lo', lo], ['hi', hi], ['看了几次', looks]]); };
    const reset = () => { lo = 0; hi = A.length; mid = -1; looks = 0; done = false; draw(); say.textContent = '答案一定在 [lo, hi] 里：比你少的人数在 0 到 ' + A.length + ' 之间。点“走一步”。'; };
    $('[data-b="r"]', body).onclick = reset; $('#bsX', body).oninput = reset;
    $('[data-b="s"]', body).onclick = () => {
      const x = +$('#bsX', body).value; if (done) return;
      if (lo >= hi) { done = true; mid = -1; draw(); say.textContent = 'lo 和 hi 碰到一起了：比你少的有 ' + lo + ' 个人，你用 ' + x + ' 步能排第 ' + (lo + 1) + ' 名。只看了 ' + looks + ' 次。'; return; }
      mid = Math.floor((lo + hi) / 2); looks++;
      if (A[mid] < x) { say.textContent = '中间第 ' + mid + ' 个是 ' + A[mid] + '，比 ' + x + ' 少：它和它左边的都比你少，lo = ' + (mid + 1) + '。'; lo = mid + 1; }
      else { say.textContent = '中间第 ' + mid + ' 个是 ' + A[mid] + '，不比 ' + x + ' 少：答案在它或它左边，hi = ' + mid + '。'; hi = mid; }
      draw();
    };
    reset();
  }
  function tree(){
    body.innerHTML = '<label class="lab">n = <b id="dtNO"></b></label><input type="range" id="dtN" min="1" max="20" value="12"><svg viewBox="0 0 640 220" role="img" aria-label="判定树"></svg><div class="kv"></div>';
    slider('dtN', null, n => {
      const nodes = {}; let sum = 0, fsum = 0;
      const build = (lo, hi, d) => { if (lo > hi) { fsum += d - 1; return null; } const m = Math.floor((lo + hi) / 2); sum += d; nodes[m] = {k: String(m), l: build(lo, m - 1, d + 1), r: build(m + 1, hi, d + 1)}; return m; };
      const root = build(1, n, 1);
      drawBinTree($('svg', body), nodes, root, {W: 640, H: 220});
      const g = (a, b) => { const r = (x, y) => y ? r(y, x % y) : x; const k = r(a, b); return (a / k) + '/' + (b / k); };
      kv($('.kv', body), [['高度', Math.ceil(Math.log2(n + 1))], ['成功 ASL', g(sum, n)], ['失败 ASL', g(fsum, n + 1)]]);
      say.textContent = '每个结点是一次比较的位置（下标从 1，mid = ⌊(low+high)/2⌋）。查找成功比较的次数是它的层数；失败停在某个空孩子上，比较次数是它双亲的层数。';
    });
  }
  btnRow($('[data-m]', fig), ['二分查找', '判定树（第二层）'], 0, i => [search, tree][i]());
  search();
});
