
/* ---------- 装置 15：泡多久 ---------- */
dev('#soakFig', fig => {
  const svg = $('#skSvg'), say = $('#skSay');
  const TS = [['冰箱里', 4], ['凉水（冬天）', 10], ['凉水（春秋）', 16], ['室温', 22], ['夏天室温', 28], ['温水 / 闷热的厨房', 35]];
  const HS = []; for (let h = 0; h <= 48; h += 2) HS.push(h);
  const W0 = 600, L = 120, R = 12, T = 18, cw = (W0 - L - R) / HS.length, ch = 34, H = T + TS.length * ch + 30;
  const col = v => { const k = clamp((v - 2.8) / 3.5, 0, 1); return 'hsl(' + (130 - 125 * k) + ',' + (40 + 20 * k) + '%,' + (52 - 8 * k) + '%)'; };
  let sel = null;
  function draw(){
    let g = '';
    TS.forEach((t, i) => {
      const y = T + i * ch;
      g += txt(L - 8, y + ch / 2 + 4, t[0], {s: 12, a: 'end'});
      HS.forEach((h, j) => {
        const v = growLog(t[1], h), x = L + j * cw;
        g += '<rect data-i="' + i + '" data-j="' + j + '" x="' + (x + 1) + '" y="' + (y + 1) + '" width="' + (cw - 2) + '" height="' + (ch - 2) + '" rx="2" fill="' + col(v) + '" opacity="' + (sel && (sel[0] !== i || sel[1] !== j) ? 0.75 : 1) + '" style="cursor:pointer"' + (sel && sel[0] === i && sel[1] === j ? ' stroke="var(--ink)" stroke-width="2"' : '') + '/>';
      });
    });
    HS.forEach((h, j) => { if (h % 8 === 0) g += txt(L + j * cw + cw / 2, H - 10, h + '时', {s: 10.5, c: 'var(--ink-3)', halo: false}); });
    const xs = L + 1 * cw;
    g += '<line x1="' + xs + '" x2="' + xs + '" y1="' + (T - 4) + '" y2="' + (T + TS.length * ch + 4) + '" stroke="var(--ink)" stroke-width="1.6" stroke-dasharray="4 3"/>' + txt(xs + 4, T - 6, '木耳泡开（约 1—2 小时）', {s: 10.5, a: 'start', c: 'var(--ink)'});
    svg.setAttribute('viewBox', '0 0 ' + W0 + ' ' + H); svg.innerHTML = g;
  }
  svg.addEventListener('click', e => {
    const r = e.target.closest('rect[data-i]'); if (!r) return;
    const i = +r.dataset.i, j = +r.dataset.j; sel = [i, j]; draw();
    const t = TS[i], h = HS[j], v = growLog(t[1], h);
    let s = '<b>' + t[0] + '，泡了 ' + h + ' 小时</b>：';
    if (v < 3.2) s += '细菌几乎没怎么长。' + (h <= 4 ? '这是比较稳妥的泡法：泡开就做。' : '冷得够，长得慢；不过泡开以后也没必要一直泡着。');
    else if (v < 5) s += '细菌已经开始长了。泡开的木耳早就该下锅了，越往后越不划算。';
    else s += '在这个温度泡这么久，如果水里混进了产毒的细菌，它已经有足够的时间繁殖。米酵菌酸耐热、闻不出、没有解药：<b>整盆倒掉</b>。';
    say.innerHTML = s;
  });
  draw();
});
