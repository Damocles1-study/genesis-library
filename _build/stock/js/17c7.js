
/* ---------- 装置 8：巴尔的摩的来信 ---------- */
dev('#baltFig', fig => {
  const box = $('#btBars'), kvb = $('#btKv'), say = $('#btSay');
  let seed = 1933, ready = false;
  function go(){
    if (!ready) return;
    const N = Math.round(Math.pow(10, gN())), W = gW(), S = gS() / 100, r = rng(seed);
    // 每个人的最长连对从第一周起算：只算“从头到尾一次没错”的人数，以及高手
    const streak = new Array(W + 1).fill(0); // streak[k] = 从第一周起连对至少 k 周的人数
    let hits = new Array(N);
    for (let i = 0; i < N; i++) { let k = 0; while (k < W && r() < 0.5) k++; for (let j = 0; j <= k; j++) streak[j]++; hits[i] = k; }
    let pro = 0; while (pro < W && r() < S) pro++;
    // 高手的总命中次数（不要求连续）
    let proTot = 0; for (let w = 0; w < W; w++) if (r() < S) proTot++;
    const rows = [];
    for (let k = 1; k <= W; k++) if (k <= 6 || k === W || k % 2 === 0) rows.push(['连对 ' + k + ' 周', streak[k], '', k === W ? 'var(--main)' : '']);
    bars(box, rows, Math.max(1, streak[1]), v => v.toLocaleString());
    const allRight = streak[W];
    kv(kvb, [['老师总数', N.toLocaleString()], [W + ' 周全对（纯运气）', allRight.toLocaleString() + ' 人'], ['理论值', (N / Math.pow(2, W)).toFixed(1) + ' 人'], ['高手', '从头连对 ' + pro + ' 周 · 共对 ' + proTot + '/' + W]]);
    let s = N.toLocaleString() + ' 个毫无本事的人，连猜 ' + W + ' 周，有 ' + allRight + ' 个人一次都没错过。';
    s += allRight > 0 ? ' 如果平台只把“全对”的人推给你，你看到的就是这 ' + allRight + ' 个“神人”。' : ' 这一次没有人全对，可只要把人数调大一点就会有。';
    s += ' 而那个真有 ' + Math.round(S * 100) + '% 命中率的高手，从头连对了 ' + pro + ' 周' + (pro < W ? '，在“连对榜”上排不过运气好的人' : '') + '。<b>短期的成绩单分不出本事和运气，要很长、很完整的记录才行。</b>';
    say.innerHTML = s;
  }
  const gN = slider('btN', v => Math.round(Math.pow(10, v)).toLocaleString() + ' 人', go);
  const gW = slider('btW', v => v + ' 周', go);
  const gS = slider('btS', v => v + '%', go);
  $('#btGo').addEventListener('click', () => { seed += 101; go(); });
  ready = true; go();
});
