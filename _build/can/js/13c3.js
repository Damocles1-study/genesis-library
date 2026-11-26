
/* ---------- 装置 4：厨房里的一粒菌 ---------- */
dev('#germFig', fig => {
  const svg = $('#gmSvg'), say = $('#gmSay');
  const st = {order: 1, board: 0, wash: 0, hand: 0, rinse: 1};
  const opt = (id, key, items) => btnRow($('#' + id), items, st[key], i => { st[key] = i; draw(); });
  opt('gmOrder', 'order', ['先拍黄瓜，再切鸡', '先切鸡，再拍黄瓜']);
  opt('gmBoard', 'board', ['一块板、一把刀', '生熟两块板、两把刀']);
  opt('gmWash', 'wash', ['水龙头下冲一下', '洗洁精加热水刷干净']);
  opt('gmHand', 'hand', ['擦擦就算了', '肥皂洗二十秒']);
  opt('gmRinse', 'rinse', ['不冲，直接切', '先在水龙头下冲一遍']);
  const f = n => n < 1 ? '几乎没有' : n < 10 ? '个位数' : '约 ' + (n >= 1e4 ? Math.round(n / 1e3) / 10 + ' 万' : Math.round(n / (n >= 1000 ? 100 : 10)) * (n >= 1000 ? 100 : 10)).toLocaleString();
  function draw(){
    const C0 = 1e5;                                   // 生鸡表面
    const splash = st.rinse ? C0 * 0.01 : 0;          // 冲水溅到台面
    const tool = C0 * 0.1;                            // 刀和板上
    const hand = C0 * 0.02 + splash * 0.3;            // 手上
    let fromTool = 0, fromHand = 0, fromSplash = 0;
    if (st.order === 1) {
      if (!st.board) fromTool = tool * (st.wash ? 0.001 : 0.1) * 0.3;
      fromHand = hand * (st.hand ? 0.01 : 1) * 0.3;
      fromSplash = splash * 0.1;
    } else {
      fromSplash = splash * 0.01;                     // 黄瓜已经装盘，放在旁边
    }
    const cuc = fromTool + fromHand + fromSplash;
    /* 画一条链 */
    const B = [
      {x: 70, y: 70, t: '生鸡表面', v: C0, c: 'var(--red)'},
      {x: 230, y: 30, t: '刀和板', v: st.order === 1 && !st.board ? tool : 0, c: 'var(--main)', sub: st.order === 0 ? '黄瓜先切，还干净' : st.board ? '生熟分开' : ''},
      {x: 230, y: 70, t: '手', v: st.order === 1 ? hand : 0, c: 'var(--main)', sub: st.order === 0 ? '还没碰鸡' : ''},
      {x: 230, y: 110, t: '水花', v: splash, c: 'var(--blu)', sub: st.rinse ? '' : '没冲'},
      {x: 470, y: 70, t: '拍黄瓜', v: cuc, c: cuc > 500 ? 'var(--red)' : cuc > 10 ? 'var(--och)' : 'var(--grn)'}
    ];
    let g = '';
    const link = (a, b, v) => { const w = v <= 0 ? 0.8 : Math.max(1.2, Math.min(9, Math.log10(v + 1) * 1.7)); g += '<path d="M' + (a.x + 58) + ' ' + a.y + ' C' + ((a.x + b.x) / 2 + 10) + ' ' + a.y + ' ' + ((a.x + b.x) / 2 - 10) + ' ' + b.y + ' ' + (b.x - 58) + ' ' + b.y + '" fill="none" stroke="' + (v > 0 ? 'var(--main)' : 'var(--rule)') + '" stroke-width="' + w + '" opacity="' + (v > 0 ? 0.55 : 1) + '"' + (v > 0 ? '' : ' stroke-dasharray="3 3"') + '/>'; };
    link(B[0], B[1], B[1].v); link(B[0], B[2], B[2].v); link(B[0], B[3], B[3].v);
    link(B[1], B[4], fromTool); link(B[2], B[4], fromHand); link(B[3], B[4], fromSplash);
    B.forEach(b => {
      g += '<rect x="' + (b.x - 58) + '" y="' + (b.y - 17) + '" width="116" height="34" rx="6" fill="var(--paper)" stroke="' + b.c + '" stroke-width="1.6"/>';
      g += txt(b.x, b.y - 2, b.t, {s: 12.5, halo: false});
      g += txt(b.x, b.y + 12, b.sub && !b.v ? b.sub : f(b.v), {s: 10.5, c: 'var(--ink-3)', halo: false});
    });
    svg.setAttribute('viewBox', '0 0 540 140'); svg.innerHTML = g;
    let s = '最后落到黄瓜上的细菌：<b>' + f(cuc) + '</b>。';
    if (cuc > 500) s += ' 这个量足以让一部分人上吐下泻。最大的一条路是' + (fromHand > fromTool && fromHand > fromSplash ? '<b>手</b>：切完生鸡洗个手，就能少一大截' : fromTool >= fromSplash ? '<b>刀和板</b>：换一块板，或者用洗洁精和热水刷' : '<b>冲鸡溅出的水花</b>：别冲生鸡') + '。';
    else if (cuc > 10) s += ' 不多，但不是零。看看还剩哪一条路没堵上。';
    else s += ' 几条路都堵上了。最省事的办法其实是第一个按钮：<b>先做凉菜，再碰生肉</b>。';
    say.innerHTML = s;
  }
  draw();
});
