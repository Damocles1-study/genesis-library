/* ---------- 第二章：插队；地图拉成一排 ---------- */
dev('#arrFig', fig => {
  const cells = $('#arCells'), say = $('.say', fig);
  const START = ['石', '沙', '木', '草', '花', '鸭'];
  const NEW = ['蛋', '桶', '镐', '灯', '书', '绳'];
  let arr, op = 0, busy = false, nk = 0;
  const OPS = ['读第 i 个', '在第 i 个插入', '删掉第 i 个', '加到最后'];
  btnRow($('[data-m]', fig), OPS, 0, i => { op = i; draw(); });
  const iv = slider('arI', null, () => draw());
  function draw(mark){
    if (!arr) return;
    mark = mark || {};
    cells.innerHTML = arr.map((v, k) => '<span class="' + (mark[k] || '') + '">' + (v || '·') + '<small>' + k + '</small></span>').join('') + (arr.length < 10 ? '<span class="dim">·<small>' + arr.length + '</small></span>' : '');
    $('#arI').max = Math.max(0, op === 1 ? arr.length : arr.length - 1);
  }
  function reset(){ arr = START.slice(); nk = 0; draw(); say.textContent = '快捷栏里有 6 样东西。选一种操作试试。'; }
  async function go(){
    if (busy) return;
    const i = Math.min(iv(), op === 1 ? arr.length : arr.length - 1);
    const wait = ms => new Promise(r => setTimeout(r, ms));
    if (op === 0) { if (!arr.length) return; draw({[i]: 'hl'}); say.textContent = '第 ' + i + ' 个是“' + arr[i] + '”。位置 = 开头 + ' + i + ' × 每格大小，一步就到，没有挪动任何东西。'; return; }
    if (op === 3) { if (arr.length >= 10) { say.textContent = '快捷栏满了（这个装置最多 10 格）。'; return; } arr.push(NEW[nk++ % NEW.length]); draw({[arr.length - 1]: 'hl'}); say.textContent = '加到最后：放进末尾的空格，挪了 0 次。'; return; }
    busy = true; let moves = 0;
    if (op === 1) {
      if (arr.length >= 10) { say.textContent = '快捷栏满了（这个装置最多 10 格）。'; busy = false; return; }
      const item = NEW[nk++ % NEW.length];
      arr.push(null);
      for (let k = arr.length - 1; k > i; k--) { arr[k] = arr[k - 1]; arr[k - 1] = null; moves++; draw({[k]: 'mv'}); say.textContent = '把第 ' + (k - 1) + ' 个往后挪到第 ' + k + ' 格……'; await wait(350); }
      arr[i] = item; draw({[i]: 'hl'}); say.textContent = '把“' + item + '”插在第 ' + i + ' 个：挪了 ' + moves + ' 次。' + (i === 0 ? '插在最前面，所有东西都要挪。' : '');
    } else {
      if (!arr.length) { busy = false; return; }
      const gone = arr[i]; arr[i] = null; draw({[i]: 'hl'}); await wait(350);
      for (let k = i; k < arr.length - 1; k++) { arr[k] = arr[k + 1]; arr[k + 1] = null; moves++; draw({[k]: 'mv'}); say.textContent = '把第 ' + (k + 1) + ' 个往前挪到第 ' + k + ' 格……'; await wait(350); }
      arr.pop(); draw(); say.textContent = '删掉了“' + gone + '”：后面的往前挪，挪了 ' + moves + ' 次。';
    }
    busy = false;
  }
  $('[data-x="go"]', fig).addEventListener('click', go);
  $('[data-x="reset"]', fig).addEventListener('click', () => { if (!busy) reset(); });
  reset();
});
dev('#flatFig', fig => {
  const map = $('#flMap'), say = $('.say', fig), r = $('#flI');
  const grid = isleGrid(ISLAND);
  let cur = 55;
  function show(i){
    cur = i; const x = i % 16, y = Math.floor(i / 16);
    isleDraw(map, grid, {px: 7, py: 3, mark: (a, b) => b * 16 + a === i ? 'hl' : b * 16 + a < i ? 'v' : '', click: (a, b) => { r.value = b * 16 + a; show(b * 16 + a); }});
    $('#flIO').textContent = i;
    say.textContent = '第 ' + i + ' 格 = (x=' + x + ', y=' + y + ')。' + y + ' × 16 + ' + x + ' = ' + i + '；反过来 ' + i + ' % 16 = ' + x + '，' + i + ' // 16 = ' + y + '。亮一点的格子是排在它前面的 ' + i + ' 格。';
  }
  r.addEventListener('input', () => show(+r.value));
  show(55);
});
