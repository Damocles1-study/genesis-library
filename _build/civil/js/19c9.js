
/* ---------- 装置 10：劈一根符木 ---------- */
dev('#tallyFig', fig => {
  const svg = $('#taSvg'), say = $('#taSay');
  const L = $('#taL'), S = $('#taS'), D = $('#taD');
  let split = false, cheat = false;
  // 把金额拆成缺口：[宽度, 深度, 名字]
  function notches(l, s, d){
    const n = [];
    const add = (k, w, dep, nm) => { for (let i = 0; i < k; i++) n.push([w, dep, nm]); };
    add(Math.floor(l / 1000), 34, 22, '千镑'); l %= 1000;
    add(Math.floor(l / 100), 16, 16, '百镑'); l %= 100;
    add(Math.floor(l / 20), 10, 12, '二十镑'); l %= 20;
    add(l, 5, 8, '镑');
    add(s, 3, 5, '先令');
    add(d, 0, 4, '便士');
    return n;
  }
  function draw(){
    const l = +L.value, s = +S.value, d = +D.value;
    $('#taLO').textContent = l + ' 镑'; $('#taSO').textContent = s + ' 先令'; $('#taDO').textContent = d + ' 便士';
    const N = notches(l, s, d);
    const W = 600, x0 = 40;
    // 计算总长度
    let len = 0; N.forEach(n => len += n[0] + 4); const stickL = Math.max(260, len + 60);
    const sc = Math.min(1, (W - 60) / stickL);
    const H = split ? 200 : 120;
    let g = '';
    const stick = (y, h, isStock, cut) => {
      // 上边缘带缺口
      let path = 'M' + x0 + ',' + y, x = x0 + 20 * sc;
      path += ' L' + x + ',' + y;
      N.forEach((n, i) => {
        const w = n[0] * sc, dep = n[1];
        if (cut && i === N.length - 1 - 0 && false) {}
        if (w > 0) { path += ' L' + x + ',' + (y + dep) + ' L' + (x + w) + ',' + (y + dep) + ' L' + (x + w) + ',' + y; }
        else { /* 便士：一道划痕 */ }
        x += w + 4 * sc;
      });
      const end = x0 + stickL * sc;
      path += ' L' + end + ',' + y + ' L' + end + ',' + (y + h) + ' L' + x0 + ',' + (y + h) + ' Z';
      let gg = '<path d="' + path + '" fill="color-mix(in srgb,var(--kraft) 30%,var(--card))" stroke="var(--kraft)" stroke-width="1.5"/>';
      // 便士划痕
      x = x0 + 20 * sc;
      N.forEach(n => { if (n[0] === 0) gg += '<line x1="' + (x + 1) + '" x2="' + (x + 1) + '" y1="' + y + '" y2="' + (y + 6) + '" stroke="var(--ink-2)" stroke-width="1.2"/>'; x += n[0] * sc + 4 * sc; });
      // 木纹
      for (let k = 1; k < 4; k++) gg += '<path d="M' + (x0 + 4) + ',' + (y + h * k / 4) + ' q' + (stickL * sc / 3) + ',' + (k % 2 ? 3 : -3) + ' ' + (stickL * sc - 8) + ',0" fill="none" stroke="var(--kraft)" stroke-opacity=".35"/>';
      if (cut) gg += '<path d="M' + (x0 + 20 * sc) + ',' + y + ' l26,0 l-6,14 l-20,0 Z" fill="var(--card)" stroke="var(--red)" stroke-width="1.5" stroke-dasharray="3 2"/>';
      gg += txt(x0 + stickL * sc + 8, y + h / 2 + 4, isStock === null ? '符木' : isStock ? '存根（郡长）' : '对根（国库）', {s: 12, a: 'start', c: 'var(--ink-2)'});
      return gg;
    };
    if (!split) g += stick(30, 50, null, false);
    else { g += stick(24, 46, true, cheat); g += stick(118, 30, false, false); g += txt(W / 2, 108, '— 劈开 —', {s: 11, c: 'var(--ink-3)', halo: false}); }
    svg.setAttribute('viewBox', '0 0 ' + Math.max(W, x0 + stickL * sc + 110) + ' ' + H); svg.innerHTML = g;
    const cnt = {}; N.forEach(n => cnt[n[2]] = (cnt[n[2]] || 0) + 1);
    return Object.entries(cnt).map(e => e[1] + ' 个' + e[0] + '缺口').join('，');
  }
  function upd(){ split = false; cheat = false; const t = draw(); say.className = 'say'; say.innerHTML = '刻好了：' + (t || '一个缺口也没有，郡长今天一文没交') + '。'; }
  [L, S, D].forEach(x => x.addEventListener('input', upd));
  $('#taSplit').addEventListener('click', () => { split = true; cheat = false; draw(); say.className = 'say ok'; say.innerHTML = '劈开了。长的一半（存根）郡长拿走当收据，短的一半（对根）锁进国库。英文“股票”“股东”里的 stock，一说就和这根“存根”有关（<b>存疑</b>）。'; });
  $('#taCheat').addEventListener('click', () => { if (!split) { split = true; } cheat = true; draw(); say.className = 'say bad'; say.innerHTML = '郡长回家后，想在存根上动点手脚，让它看起来像交得更多：他把第一个缺口削宽了一点（红色虚线）。'; });
  $('#taJoin').addEventListener('click', () => {
    if (!split) { say.className = 'say'; say.innerHTML = '还没劈开呢。'; return; }
    say.className = 'say ' + (cheat ? 'bad' : 'ok');
    say.innerHTML = cheat ? '对账：两半一合，<b>缺口对不上</b>，木纹也错开了。国库里的对根是铁证。郡长要为此付出代价。这根棍子不需要任何人识字，就能防伪。' : '对账：两半合在一起，缺口严丝合缝，木纹也连得上。账是真的。';
  });
  upd();
});
