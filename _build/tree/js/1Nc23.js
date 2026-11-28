/* ---------- 第二十三章：名字放进哪一格 ---------- */
dev('#hashFig', fig => {
  const slotsEl = $('.hslots', fig), kvb = $('.kv', fig), say = $('.say', fig), inp = $('#hsIn');
  const M = 8; let mode = 0, fn = 0, T, last = null;
  const H = s => { if (fn === 1) return s.charCodeAt(0) % M; let t = 0; [...s].forEach((c, i) => t += c.codePointAt(0) * (i + 1)); return t % M; };
  btnRow($('[data-m]', fig), ['挂一串（拉链）', '往后找空位（线性探测）'], 0, i => { mode = i; clear(); });
  btnRow($('[data-f]', fig), ['每个字 × 位置，加起来', '只看第一个字（笨）'], 0, i => { fn = i; clear(); });
  function clear(){ T = mode === 0 ? Array.from({length: M}, () => []) : Array(M).fill(null); last = null; draw(); say.textContent = '空的。放几个名字进去。'; }
  function draw(probe){
    probe = probe || [];
    slotsEl.innerHTML = '<div class="cells" style="flex-direction:column;align-items:stretch;max-width:26rem;margin:.6em auto">' + Array.from({length: M}, (_, i) => {
      const items = mode === 0 ? T[i] : (T[i] ? [T[i]] : []);
      return '<span style="text-align:left;display:flex;gap:6px;align-items:center" class="' + (probe.includes(i) ? (probe[probe.length - 1] === i ? 'hl' : 'mv') : '') + '"><b style="font-family:var(--f-mono);color:var(--ink-3);width:1.4em">' + i + '</b>' + (items.length ? items.map(x => '<span style="border:1px solid var(--ter);border-radius:4px;padding:0 6px;min-width:0' + (x === last ? ';background:var(--hl)' : '') + '">' + x + '</span>').join('<span style="color:var(--ter)">→</span>') : '<span class="dim">空</span>') + '</span>';
    }).join('') + '</div>';
    const n = mode === 0 ? T.reduce((s, c) => s + c.length, 0) : T.filter(Boolean).length;
    const longest = mode === 0 ? Math.max(...T.map(c => c.length)) : 0;
    kv(kvb, [['放了几个', n], ['装填因子', (n / M).toFixed(2)], [mode === 0 ? '最长的一串' : '空格', mode === 0 ? longest : M - n]]);
  }
  function put(s){
    if (!s) return;
    const h = H(s);
    if (mode === 0) { if (T[h].includes(s)) { say.textContent = s + ' 已经在 ' + h + ' 号了。'; return; } const hit = T[h].length; T[h].push(s); last = s; draw([h]); say.textContent = '“' + s + '”算出 ' + h + ' 号。' + (hit ? '撞上了 ' + T[h].slice(0, -1).join('、') + '：挂在这一串的后面。' : '空的，直接放。'); return; }
    if (T.filter(Boolean).length >= M) { say.textContent = '满了！真实的散列表早该换大了。'; return; }
    const probe = []; let i = h; while (T[i] !== null) { if (T[i] === s) { say.textContent = s + ' 已经在 ' + i + ' 号了。'; return; } probe.push(i); i = (i + 1) % M; }
    probe.push(i); T[i] = s; last = s; draw(probe);
    say.textContent = '“' + s + '”算出 ' + h + ' 号。' + (probe.length > 1 ? '被占了，往后找：看了 ' + probe.length + ' 格，放在 ' + i + ' 号。' : '空的，直接放。');
  }
  function find(s){
    const h = H(s);
    if (mode === 0) { const k = T[h].indexOf(s); draw([h]); say.textContent = '算出 ' + h + ' 号，打开它，' + (k >= 0 ? '在这一串的第 ' + (k + 1) + ' 个找到了“' + s + '”。' : '这一串里没有“' + s + '”。'); return; }
    const probe = []; let i = h; while (T[i] !== null && probe.length < M) { probe.push(i); if (T[i] === s) { draw(probe); say.textContent = '算出 ' + h + ' 号，往后看了 ' + probe.length + ' 格，找到了“' + s + '”。'; return; } i = (i + 1) % M; }
    probe.push(i); draw(probe); say.textContent = '算出 ' + h + ' 号，一直往后看，碰到空格（' + i + ' 号）：没有“' + s + '”。看了 ' + probe.length + ' 格。';
  }
  $('[data-x="put"]', fig).addEventListener('click', () => put(inp.value.trim()));
  $('[data-x="find"]', fig).addEventListener('click', () => find(inp.value.trim()));
  $('[data-x="many"]', fig).addEventListener('click', () => { clear(); ['石', '木', '沙', '灯', '镐', '面包', '绳子'].forEach(put); say.textContent = (fn === 1 ? '只看第一个字时，' : '') + '放了 7 样。' + (mode === 1 ? '注意被占的格子连成了一长串：这就是“堆积”。' : '看看最长的一串有多长。'); });
  $('[data-x="clr"]', fig).addEventListener('click', clear);
  clear();
});
