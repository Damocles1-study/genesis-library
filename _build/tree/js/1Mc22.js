/* ---------- 第二十二章：爬楼梯；走格子；背包的表格 ---------- */
dev('#dpFig', fig => {
  const body = $('.dpbody', fig), say = $('.say', fig);
  function stairs(){
    body.innerHTML = '<label class="lab">台阶数 n = <b id="stNO"></b></label><input type="range" id="stN" min="1" max="40" value="10"><div class="cells" id="stT"></div><div class="kv"></div>';
    slider('stN', null, n => {
      const t = [0, 1, 2]; for (let i = 3; i <= n; i++) t.push(t[i - 1] + t[i - 2]);
      const calls = [0, 1, 1]; for (let i = 3; i <= n; i++) calls.push(1 + calls[i - 1] + calls[i - 2]);
      $('#stT').innerHTML = t.slice(1, n + 1).map((v, i) => '<span class="' + (i === n - 1 ? 'hl' : '') + '">' + v.toLocaleString('en-US') + '<small>第 ' + (i + 1) + ' 级</small></span>').join('');
      kv($('.kv', body), [['走法', t[n].toLocaleString('en-US')], ['直接递归调用', calls[n].toLocaleString('en-US') + ' 次'], ['填表算了', n + ' 格']]);
      say.textContent = n < 15 ? '每一格 = 前一格 + 前两格。' : '直接递归要调用 ' + calls[n].toLocaleString('en-US') + ' 次，填表只算 ' + n + ' 格。';
    });
  }
  function grid(){
    const H = 6, W = 8; let rock = {'2,1': 1, '4,3': 1, '6,2': 1};
    body.innerHTML = '<div class="isle" id="dpMap"></div><div class="btns"><button class="btn" data-g="fill">一格一格填</button><button class="btn" data-g="clr">拿掉石头</button></div>';
    const map = $('#dpMap', body); let timer = null;
    const calc = () => { const w = {}; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = x + ',' + y; w[k] = rock[k] ? 0 : (x === 0 && y === 0) ? 1 : (w[(x - 1) + ',' + y] || 0) + (w[x + ',' + (y - 1)] || 0); } return w; };
    const g = () => Array.from({length: H}, (_, y) => Array.from({length: W}, (_, x) => rock[x + ',' + y] ? '#' : '.'));
    const draw = upto => { const w = calc(); isleDraw(map, g(), {label: (x, y) => (upto === undefined || y * W + x <= upto) ? String(w[x + ',' + y]) : '', mark: (x, y) => upto !== undefined && y * W + x === upto ? 'hl' : '', click: (x, y) => { if (timer || (x === 0 && y === 0) || (x === W - 1 && y === H - 1)) return; const k = x + ',' + y; if (rock[k]) delete rock[k]; else rock[k] = 1; draw(); say.textContent = '右下角现在有 ' + calc()[(W - 1) + ',' + (H - 1)] + ' 条路。'; }}); };
    $('[data-g="fill"]', body).addEventListener('click', () => { if (timer) return; let i = 0; const w = calc(); const tick = () => { if (i >= W * H) { timer = null; draw(); say.textContent = '填完了：右下角有 ' + w[(W - 1) + ',' + (H - 1)] + ' 条路。'; return; } const x = i % W, y = Math.floor(i / W); draw(i); say.textContent = rock[x + ',' + y] ? '(' + x + ', ' + y + ') 是石头：0。' : x === 0 && y === 0 ? '起点：1 条。' : '(' + x + ', ' + y + ') = 左边 ' + (w[(x - 1) + ',' + y] || 0) + ' + 上面 ' + (w[x + ',' + (y - 1)] || 0) + ' = ' + w[x + ',' + y] + '。'; i++; timer = setTimeout(tick, 220); }; tick(); });
    $('[data-g="clr"]', body).addEventListener('click', () => { if (timer) return; rock = {}; draw(); say.textContent = '没有石头时，8 × 6 的格子从左上到右下有 ' + calc()[(W - 1) + ',' + (H - 1)] + ' 条路。'; });
    draw(); say.textContent = '点“一格一格填”，或者点格子放石头。右下角有 ' + calc()[(W - 1) + ',' + (H - 1)] + ' 条路。';
  }
  function knap(){
    const C = 8;
    body.innerHTML = '<p class="dim" style="font-size:13.5px;margin:.2em 0">背包最多 8 斤，物品就是第二十一章那六样。第 i 行第 c 列：只看前 i 样、能背 c 斤时最多多有用。点一格，看它是从哪两格算出来的。</p><div class="tbl scroll-x" id="kpT"></div>';
    const n = BAG_ITEMS.length, t = Array.from({length: n + 1}, () => Array(C + 1).fill(0));
    for (let i = 1; i <= n; i++) { const [, w, v] = BAG_ITEMS[i - 1]; for (let c = 0; c <= C; c++) { t[i][c] = t[i - 1][c]; if (w <= c && t[i - 1][c - w] + v > t[i][c]) t[i][c] = t[i - 1][c - w] + v; } }
    const draw = (si, sc) => { const from = {}; if (si) { from[(si - 1) + ',' + sc] = 1; const w = BAG_ITEMS[si - 1][1]; if (w <= sc) from[(si - 1) + ',' + (sc - w)] = 1; }
      $('#kpT', body).innerHTML = '<table class="t c" style="font-family:var(--f-mono);font-size:12.5px;min-width:340px"><tr><th></th>' + Array.from({length: C + 1}, (_, c) => '<th>' + c + '斤</th>').join('') + '</tr>' + t.map((row, i) => '<tr><th style="white-space:nowrap">' + (i ? BAG_ITEMS[i - 1][0] + ' ' + BAG_ITEMS[i - 1][1] + '/' + BAG_ITEMS[i - 1][2] : '不拿') + '</th>' + row.map((v, c) => '<td data-i="' + i + '" data-c="' + c + '" style="cursor:pointer;' + (i === si && c === sc ? 'background:var(--main);color:var(--paper)' : from[i + ',' + c] ? 'background:var(--hl)' : '') + '">' + v + '</td>').join('') + '</tr>').join('') + '</table>'; };
    $('#kpT', body).addEventListener('click', e => { const td = e.target.closest('td[data-i]'); if (!td) return; const i = +td.dataset.i, c = +td.dataset.c; draw(i, c); if (!i) { say.textContent = '第 0 行：什么都不看，有用程度都是 0。'; return; } const [nm, w, v] = BAG_ITEMS[i - 1]; say.textContent = '第 ' + i + ' 行第 ' + c + ' 列 = ' + t[i][c] + '：不拿' + nm + '是上一行同一列的 ' + t[i - 1][c] + (w <= c ? '；拿' + nm + '是上一行第 ' + (c - w) + ' 列的 ' + t[i - 1][c - w] + ' 加 ' + v + ' = ' + (t[i - 1][c - w] + v) : '；' + nm + '有 ' + w + ' 斤，背不下') + '。取大的。'; });
    draw(); say.textContent = '右下角 ' + t[n][C] + ' 就是答案：和回溯找到的一样，可是每格只算了一次（' + (n + 1) * (C + 1) + ' 格）。';
  }
  btnRow($('[data-m]', fig), ['爬楼梯', '走格子', '背包的表格（第二层）'], 0, i => [stairs, grid, knap][i]());
  stairs();
});
