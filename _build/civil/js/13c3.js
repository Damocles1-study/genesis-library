
/* ---------- 装置 4：中正评品 ---------- */
dev('#zzFig', fig => {
  const svg = $('#zzSvg'), Wr = $('#zzW');
  const CAP = [2, 3, 4, 6, 8, 9, 9, 9, 10]; // 上上……下下，各品名额，合计 60
  const PN = ['上上', '上中', '上下', '中上', '中中', '中下', '下上', '下中', '下下'];
  const FC = ['var(--kraft)', 'var(--main)', 'var(--ink-3)'], FN = ['士族', '次门', '寒门'], FV = [1, 0.5, 0];
  let seed = 3, ppl;
  function make(){
    const r = rng(seed);
    ppl = Array.from({length: 60}, (_, i) => ({f: i < 9 ? 0 : i < 30 ? 1 : 2, t: r(), luck: r()}));
  }
  function draw(){
    const w = +Wr.value / 100;
    $('#zzWO').textContent = Wr.value + '%';
    const sc = ppl.map((p, i) => ({i, s: w * FV[p.f] + (1 - w) * p.t + 0.08 * p.luck}));
    sc.sort((a, b) => b.s - a.s);
    const grade = []; let k = 0;
    CAP.forEach((c, g) => { for (let j = 0; j < c; j++) grade[sc[k++].i] = g; });
    const W = 600, H = 9 * 30 + 20, L = 56;
    let g = '';
    PN.forEach((n, gi) => {
      const y = 14 + gi * 30;
      g += '<rect x="' + L + '" y="' + y + '" width="' + (W - L - 6) + '" height="26" rx="3" fill="' + (gi < 3 ? 'color-mix(in srgb,var(--zhu) 8%,var(--paper))' : 'var(--paper)') + '"/>' + txt(L - 8, y + 18, n, {s: 13, a: 'end', c: gi < 3 ? 'var(--zhu)' : 'var(--ink-2)', halo: false});
      const mem = ppl.map((p, i) => ({p, i})).filter(o => grade[o.i] === gi).sort((a, b) => a.p.f - b.p.f || b.p.t - a.p.t);
      mem.forEach((o, j) => { g += '<circle cx="' + (L + 16 + j * 26) + '" cy="' + (y + 13) + '" r="' + (3 + o.p.t * 8).toFixed(1) + '" fill="' + FC[o.p.f] + '" opacity=".9"><title>' + FN[o.p.f] + '，才能 ' + Math.round(o.p.t * 100) + '</title></circle>'; });
    });
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const top = ppl.map((p, i) => i).filter(i => grade[i] < 3);
    const hanTop = top.filter(i => ppl[i].f === 2).length;
    const shiLow = ppl.map((p, i) => i).filter(i => grade[i] > 5 && ppl[i].f === 0).length;
    const best10 = ppl.map((p, i) => i).sort((a, b) => ppl[b].t - ppl[a].t).slice(0, 10);
    const best10Top = best10.filter(i => grade[i] < 3).length;
    const best10Low = best10.filter(i => grade[i] > 5).length;
    kv($('#zzKv'), [['上品里的寒门', hanTop + ' / ' + top.length], ['下品里的士族', shiLow + ' / ' + ppl.filter(p => p.f === 0).length], ['最有才的十人进上品', best10Top + ' 人'], ['最有才的十人落下品', best10Low + ' 人']]);
    $('#zzSay').className = 'say ' + (w >= 0.6 ? 'bad' : 'ok');
    $('#zzSay').innerHTML = w >= 0.6 ? '上品无寒门，下品无势族。<b>才能还在，只是排不上号了</b>：最有才的十个人里，有 ' + best10Low + ' 个被评进了下品，这辈子大概只能做浊官。'
      : w >= 0.3 ? '家世开始占上风。注意上三品：九个位子里士族已经占了不少，而士族只占全郡人口的一成半。'
      : '中正只看才能，上品里各家都有。这是陈群设计这套制度时的理想，它大概只在最初几十年里接近过。';
  }
  Wr.addEventListener('input', draw);
  $('#zzNew').addEventListener('click', () => { seed++; make(); draw(); });
  make(); draw();
});
