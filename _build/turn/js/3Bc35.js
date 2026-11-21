/* ---------- 装置 36：两种选法 ---------- */
dev('#examFig', fig => {
  const MODES = ['荐举（看门路）', '公开考试（考古典学）', '考试 + 免费的公立中学'];
  const CL = [['绅士家庭', 'var(--pur)', .15, 2.2, 1.2], ['中等人家', 'var(--main)', .35, .6, .5], ['穷人家', 'var(--och)', .5, .05, 0]];  // [名, 色, 占比, 门路均值, 补习加分]
  let mode = 0, seed = 7, P = [];
  btnRow($('#exMode'), MODES, 0, i => { mode = i; draw(); });
  $('#exNew').addEventListener('click', () => { seed++; make(); draw(); });
  function make(){
    const r = rng(seed), g = () => { let s = 0; for (let i = 0; i < 6; i++) s += r(); return (s - 3) / Math.sqrt(.5); };
    P = [];
    for (let i = 0; i < 200; i++) { const u = r(), c = u < CL[0][2] ? 0 : u < CL[0][2] + CL[1][2] ? 1 : 2; P.push({c, ab: g(), con: CL[c][3] + g() * .6, luck: g()}); }
  }
  function score(p){
    if (mode === 0) return p.con + p.ab * .25;
    const coach = mode === 1 ? CL[p.c][4] : CL[p.c][4] * .35;
    return p.ab + coach + p.luck * .5;
  }
  function draw(){
    const idx = P.map((p, i) => [score(p), i]).sort((a, b) => b[0] - a[0]).slice(0, 20).map(x => x[1]);
    const pick = new Set(idx);
    const W = 600, cols = 25, H = 8 * 22 + 10;
    let g = '';
    const order = P.map((p, i) => i).sort((a, b) => P[a].c - P[b].c || P[b].ab - P[a].ab);
    order.forEach((i, k) => { const p = P[i], x = 14 + (k % cols) * 23.4, y = 14 + Math.floor(k / cols) * 22, rr = 4 + clamp((p.ab + 2.5) / 5, 0, 1) * 4; g += '<circle cx="' + x + '" cy="' + y + '" r="' + rr.toFixed(1) + '" fill="' + CL[p.c][1] + '" fill-opacity="' + (pick.has(i) ? 1 : .35) + '"' + (pick.has(i) ? ' stroke="var(--ink)" stroke-width="2"' : '') + '/>'; });
    const svg = $('#exSvg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const sorted = P.map(p => p.ab).sort((a, b) => a - b), pct = v => Math.round(sorted.filter(x => x < v).length / 2);
    const avg = idx.reduce((s, i) => s + pct(P[i].ab), 0) / idx.length;
    const mix = [0, 1, 2].map(c => idx.filter(i => P[i].c === c).length);
    const top20 = P.map((p, i) => [p.ab, i]).sort((a, b) => b[0] - a[0]).slice(0, 20).map(x => x[1]);
    const hit = idx.filter(i => top20.includes(i)).length;
    kv($('#exKV'), [['选中者的本事', '超过 ' + Math.round(avg) + '% 的人'], ['真正最有本事的 20 人里选中了', hit + ' 个'], ['绅士 / 中等 / 穷人', mix.join(' / ')]]);
    const say = $('#exSay');
    say.className = 'say' + (mode === 0 ? ' bad' : mode === 2 ? ' ok' : '');
    say.innerHTML = '<small>圆点越大，本事越大；颜色是出身。</small><br>' + (mode === 0 ? '荐举：选进来的几乎全是绅士家的子弟，本事有大有小。这就是 1854 年以前的白厅：“救济贵族的户外救济所”。'
      : mode === 1 ? '公开考试：选进来的人本事明显大了，可大多数还是绅士家的孩子，因为考的是希腊文和拉丁文，只有上得起公学、请得起家庭教师的人才学得好。这正是诺思科特和特里维廉想要的：<em>绅士里能干的那些</em>。'
      : '如果穷人家的孩子也能上好学校，考试的结果就更接近“谁有本事谁进来”。英国在 1870 年以后才开始建立普及的初等教育，到二十世纪才有免费的公立中学。考试是否公平，要看考试之前的那些年。');
  }
  make(); draw();
});
