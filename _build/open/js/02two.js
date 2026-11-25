/* ---------- 第二部封面装置：一周一百六十八小时 ---------- */
dev('#weekFig', fig => {
  const svg = $('#wkSvg'), kvb = $('#wkKv'), say = $('#wkSay');
  const PRE = [['全职备考', 7.5, 2.5, 60, 14], ['上班', 7.5, 3, 45, 14], ['读研', 7.5, 2.5, 48, 14], ['三无，在家', 8, 2, 25, 16]];
  const ids = ['wkS', 'wkE', 'wkM', 'wkR'];
  const g = {}; let ready = false, mode = 0;
  function draw(){
    if (!ready) return;
    const sleep = g.s * 7, eat = g.e * 7, main = g.m, rest = g.r;
    const left = 168 - sleep - eat - main - rest;
    const parts = [['睡觉', sleep, 'var(--ink-3)'], ['吃饭洗漱通勤', eat, 'var(--rule)'], ['主线', main, 'var(--ter)'], ['休息运动陪人', rest, 'var(--och)'], ['剩下的', Math.max(0, left), 'var(--main)']];
    const W = 600, H = 92, L = 4, R = 4; let x = L, gg = '';
    const tot = parts.reduce((a, p) => a + p[1], 0);
    const scale = (W - L - R) / Math.max(168, tot);
    parts.forEach(p => { const w = p[1] * scale; if (w > 0) { gg += '<rect x="' + x.toFixed(1) + '" y="10" width="' + w.toFixed(1) + '" height="40" fill="' + p[2] + '" stroke="var(--card)" stroke-width="1.5"/>'; if (w > 60) gg += txt(x + w / 2, 37, p[0].slice(0, 4), {s: 17, c: 'var(--ink)'}); } x += w; });
    gg += '<line x1="' + (L + 168 * scale) + '" x2="' + (L + 168 * scale) + '" y1="4" y2="58" stroke="var(--ink)" stroke-width="1.5"/>' + txt(L + 168 * scale - 2, 76, '168 小时', {s: 15, a: 'end', c: 'var(--ink-2)'});
    if (left < 0) gg += txt(W / 2, 88, '超出了 ' + (-left).toFixed(1) + ' 小时：这一周排不下', {s: 15, c: 'var(--main)', w: 1});
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = gg;
    kv(kvb, [['睡觉', sleep.toFixed(1) + ' 小时'], ['主线', main + ' 小时'], ['剩下的', '<b class="' + (left >= 8 ? 'pos' : 'neg') + '">' + Math.max(0, left).toFixed(1) + ' 小时</b>'], ['平均每天', (Math.max(0, left) / 7).toFixed(1) + ' 小时']]);
    let s;
    if (left < 0) s = '这一周已经排不下了。最先被挤掉的通常是睡觉和运动，可它们是撑住主线的东西。';
    else if (g.m >= 55 && mode === 0) s = '全职备考的一周，剩下 ' + left.toFixed(1) + ' 小时。看上去还有一点，可备考要的不只是小时数，还有整块的、不被打断的心思。这一年最好的生意，是把考试考好。';
    else if (left < 8) s = '剩下不到八小时，一门小生意很难持续：接一个活，回客户消息、改需求，就能把这点时间吃光。先别开张，或者只做一件很小、随时能停的事。';
    else if (left < 20) s = '剩下 ' + left.toFixed(1) + ' 小时，大约每天一两个小时。够做一件小事：接一两个活、维护一个小工具、每周写一篇东西。要选能被打断、随时能停的。';
    else s = '剩下 ' + left.toFixed(1) + ' 小时，相当于半份工作。时间是够的，难的是把它用在“有人付钱”的事情上，而不是用在准备上（第十一章）。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('wkS', v => { g.s = v; return v + ' 小时'; }, go);
  slider('wkE', v => { g.e = v; return v + ' 小时'; }, go);
  slider('wkM', v => { g.m = v; return v + ' 小时'; }, go);
  slider('wkR', v => { g.r = v; return v + ' 小时'; }, go);
  btnRow($('#wkPre'), PRE.map(p => p[0]), 0, i => {
    mode = i; ready = false;
    ids.forEach((id, k) => { const r = $('#' + id); r.value = PRE[i][k + 1]; r.dispatchEvent(new Event('input')); });
    ready = true; draw();
  });
  ready = true; draw();
});
