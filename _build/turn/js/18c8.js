
/* ---------- 装置 9：苏格拉底的审判 ---------- */
dev('#trialFig', fig => {
  const OPT = [
    ['“请城邦供我在市政厅吃饭”', 360, '这是史书里的真实结果：赞成死刑的票，比判他有罪的还多了八十张左右。一个本来有机会活下来的人，用一句话把八十个同情他的人推到了对面。后来他改口提三十明那的罚款，但大家已经被气着了。', true],
    ['一开始就老老实实提三十明那罚款', 300, '本书的猜测：三十明那是一笔大钱（一个工匠干好几年），有朋友担保，态度也算端正。可陪审员已经判了他有罪，一笔罚款对一个“败坏青年”的罪名来说太轻。他多半还是会死，只是票数没那么难看。'],
    ['提出自愿流放，离开雅典', 225, '本书的猜测：这大概是原告们最希望的结局，他们未必真想要一个七十岁老人的命，只想让他闭嘴、离开。流放是雅典人很熟悉的惩罚，判有罪的二百八十人里，有不少人会觉得这就够了。<b>他很可能活下来。</b>可苏格拉底在法庭上明说了：离开雅典、到别的城去，他还是会照样提问，照样被赶走，那样活着没有意义。'],
    ['带着三个儿子上庭，哭着求情', 200, '本书的猜测：这是当时被告的常规操作，陪审员也习惯了吃这一套。他很可能活下来。苏格拉底在申辩里特意说了，他有三个儿子，但他不会把他们带上来；他认为这样做既不体面，也是在要求陪审员违背誓言、凭同情而不是凭正义来投票。'],
    ['什么都不提，坚持自己无罪', 380, '本书的猜测：在陪审员看来，这等于藐视法庭。比真实的结果还糟。']
  ];
  const svg = $('#trSvg'), say = $('#trSay'), N = 501, COLS = 38, S = 15;
  const rows = Math.ceil(N / COLS);
  svg.setAttribute('viewBox', '0 0 ' + (COLS * S + 10) + ' ' + (rows * S + 34));
  let timer = 0;
  function draw(death, k){
    let g = '';
    for (let i = 0; i < N; i++) {
      const x = 5 + (i % COLS) * S + S / 2, y = 5 + Math.floor(i / COLS) * S + S / 2;
      const col = i < k ? (i < death ? 'var(--red)' : 'var(--main)') : 'var(--rule)';
      g += '<circle cx="' + x + '" cy="' + y + '" r="5.2" fill="' + col + '"/>';
    }
    const shown = Math.min(k, N), d = Math.min(shown, death), l = Math.max(0, shown - death);
    g += txt(5, rows * S + 26, '死刑 ' + d, {s: 14, a: 'start', c: 'var(--red)', w: 1}) + txt(COLS * S + 5, rows * S + 26, '替代刑罚 ' + l, {s: 14, a: 'end', c: 'var(--main)', w: 1});
    svg.innerHTML = g;
  }
  btnRow($('#trOpt'), OPT.map(o => o[0]), -1, i => {
    clearTimeout(timer); const o = OPT[i]; let k = 0;
    say.className = 'say'; say.textContent = '计票中……';
    (function tick(){ k += 17; draw(o[1], k); if (k < N) timer = setTimeout(tick, 30); else { const dead = o[1] > N / 2; say.className = dead ? 'say bad' : 'say ok'; say.innerHTML = '<b>' + (dead ? '判处死刑' : '采用替代刑罚，苏格拉底活了下来') + '：' + o[1] + ' 比 ' + (N - o[1]) + '。</b>' + o[2]; } })();
  });
  draw(0, 0);
});
