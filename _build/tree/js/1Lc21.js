/* ---------- 第二十一章：找零钱；装背包 ---------- */
const BAG_ITEMS = [['船桨', 5, 10], ['镐', 4, 7], ['灯', 4, 7], ['面包', 1, 1], ['绳子', 2, 2], ['地图', 1, 1]];
dev('#greedyFig', fig => {
  const body = $('.grbody', fig), say = $('.say', fig);
  function coins(){
    const SETS = [[10, 5, 1], [4, 3, 1], [10, 7, 1], [25, 10, 1]];
    let si = 0;
    body.innerHTML = '<div class="btns" data-c></div><label class="lab">要找 <b id="cnAO"></b> 元</label><input type="range" id="cnA" min="1" max="40" value="6"><div class="cells" id="cnG"></div><div class="cells" id="cnB"></div>';
    const run = () => {
      const S = SETS[si], a = +$('#cnA').value; $('#cnAO').textContent = a;
      const g = []; let r = a; S.forEach(c => { while (r >= c) { g.push(c); r -= c; } });
      const best = Array(a + 1).fill(Infinity), from = Array(a + 1).fill(0); best[0] = 0;
      for (let x = 1; x <= a; x++) S.forEach(c => { if (c <= x && best[x - c] + 1 < best[x]) { best[x] = best[x - c] + 1; from[x] = c; } });
      const b = []; let x = a; while (x > 0) { b.push(from[x]); x -= from[x]; }
      $('#cnG').innerHTML = '<span class="dim" style="border:0">贪心：</span>' + g.map(c => '<span>' + c + '</span>').join('') + '<span class="dim" style="border:0">' + g.length + ' 个</span>';
      $('#cnB').innerHTML = '<span class="dim" style="border:0">最少：</span>' + b.map(c => '<span class="hl">' + c + '</span>').join('') + '<span class="dim" style="border:0">' + b.length + ' 个</span>';
      say.textContent = g.length === b.length ? '这次贪心找对了。' : '贪心上当了！它先拿了最大的 ' + g[0] + '，结果多用了 ' + (g.length - b.length) + ' 个硬币。（“最少”是用下一章的动态规划算出来的。）';
    };
    btnRow($('[data-c]', body), SETS.map(s => s.join('、') + ' 元'), 0, i => { si = i; run(); });
    $('#cnA').addEventListener('input', run); run();
  }
  function bag(){
    let mine = {};
    body.innerHTML = '<div class="bgw"><p class="dim" style="font-size:13.5px;margin:.2em 0">背包最多 8 斤。点东西装进去或拿出来。</p><div class="bag" id="bgItems"></div><div class="btns"><button class="btn" data-b="g">贪心装</button><button class="btn" data-b="t">回溯找最好的</button><button class="btn" data-b="c">倒空</button></div><div class="kv"></div></div>';
    const show = (pick, msg) => {
      $('#bgItems').innerHTML = BAG_ITEMS.map(([n, w, v]) => '<span data-n="' + n + '" class="' + (pick[n] ? 'on' : '') + '" style="cursor:pointer">' + n + ' ' + w + '斤 · ' + v + '</span>').join('');
      const W = BAG_ITEMS.filter(i => pick[i[0]]).reduce((s, i) => s + i[1], 0), V = BAG_ITEMS.filter(i => pick[i[0]]).reduce((s, i) => s + i[2], 0);
      kv($('.kv', body), [['重量', W + ' / 8 斤'], ['有用程度', V]]);
      if (msg) say.textContent = msg; else say.textContent = W > 8 ? '背不动了！超了 ' + (W - 8) + ' 斤。' : '现在有用程度 ' + V + '。你能装到多少？';
    };
    $('.bgw', body).addEventListener('click', e => {
      const s = e.target.closest('[data-n]'); if (s) { mine[s.dataset.n] = !mine[s.dataset.n]; show(mine); return; }
      const b = e.target.closest('[data-b]'); if (!b) return;
      if (b.dataset.b === 'c') { mine = {}; show(mine); }
      if (b.dataset.b === 'g') { const pick = {}; let w = 0; const order = BAG_ITEMS.slice().sort((a, c) => c[2] / c[1] - a[2] / a[1]); const log = []; order.forEach(([n, wt, v]) => { if (w + wt <= 8) { pick[n] = true; w += wt; log.push(n + '（每斤 ' + (v / wt).toFixed(2) + '）拿'); } else log.push(n + ' 装不下'); }); mine = pick; show(pick, '贪心按“每斤多有用”从高到低：' + log.join('，') + '。'); }
      if (b.dataset.b === 't') { let best = -1, bestPick = null, tried = 0, cut = 0; const go = (i, w, v, pick) => { tried++; if (w > 8) { cut++; return; } if (i === BAG_ITEMS.length) { if (v > best) { best = v; bestPick = Object.assign({}, pick); } return; } go(i + 1, w, v, pick); pick[BAG_ITEMS[i][0]] = true; go(i + 1, w + BAG_ITEMS[i][1], v + BAG_ITEMS[i][2], pick); delete pick[BAG_ITEMS[i][0]]; }; go(0, 0, 0, {}); mine = bestPick; show(bestPick, '回溯把“每样拿不拿”都试了一遍：一共走了 ' + tried + ' 步，其中 ' + cut + ' 次一装就超重、马上退回来（剪枝）。最好的装法有用程度 ' + best + '。'); }
    });
    show(mine);
  }
  btnRow($('[data-m]', fig), ['找零钱', '装背包'], 0, i => [coins, bag][i]());
  coins();
});
