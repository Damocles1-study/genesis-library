/* ---------- 第六章：找词，笨办法和 KMP ---------- */
function pmTable(p){ const pm = Array(p.length).fill(0); let j = 0; for (let i = 1; i < p.length; i++) { while (j > 0 && p[i] !== p[j]) j = pm[j - 1]; if (p[i] === p[j]) j++; pm[i] = j; } return pm; }
dev('#kmpFig', fig => {
  const tIn = $('#kmT'), pIn = $('#kmP'), row = $('#kmRow'), kvb = $('.kv', fig), say = $('.say', fig);
  let mode = 0, ev = [], at = 0;
  btnRow($('[data-m]', fig), ['笨办法', 'KMP'], 0, i => { mode = i; build(); });
  function build(){
    const t = tIn.value, p = pIn.value; ev = []; at = 0;
    if (!p || p.length > t.length) { row.textContent = ''; say.textContent = '词要比句子短，而且不能是空的。'; kv(kvb, []); return; }
    if (mode === 0) {
      outer: for (let s = 0; s <= t.length - p.length; s++) {
        for (let k = 0; k < p.length; k++) { const ok = t[s + k] === p[k]; ev.push({s, k, kn: 0, ok}); if (!ok) continue outer; }
        ev.push({s, k: p.length, kn: 0, found: true}); break;
      }
    } else {
      const pm = pmTable(p); let j = 0, kn = 0;
      for (let i = 0; i < t.length; i++) {
        while (true) {
          const ok = t[i] === p[j]; ev.push({s: i - j, k: j, kn, ok});
          if (ok) { j++; break; }
          if (j === 0) { kn = 0; break; }
          j = pm[j - 1]; kn = j; ev[ev.length - 1].jump = j;
        }
        if (j === p.length) { ev.push({s: i - j + 1, k: p.length, kn, found: true}); break; }
      }
    }
    if (!ev.length || !ev[ev.length - 1].found) ev.push({s: -1, end: true});
    draw();
    const pm = pmTable(p);
    say.textContent = mode === 1 ? '词“' + p + '”的部分匹配表（0 下标）：' + pm.join(' ') + '。对上了 j 个字以后比错，就退回到词的第 pm[j−1] 个字接着比。' : '点“走一步”。';
  }
  function draw(){
    const t = tIn.value, p = pIn.value;
    const e = ev[Math.max(0, at - 1)];
    const cmp = ev.slice(0, at).filter(x => x.ok !== undefined).length;
    let top = '', bot = '';
    for (let i = 0; i < t.length; i++) top += '<b>' + t[i].replace(' ', '␣') + '</b>';
    if (at > 0 && e && e.s >= 0) {
      bot = '<b> </b>'.repeat(e.s);
      for (let k = 0; k < p.length; k++) {
        let c = '';
        if (e.found) c = 'ok';
        else if (k < e.kn) c = 'sk';
        else if (k < e.k) c = 'ok';
        else if (k === e.k) c = e.ok ? 'ok' : 'no';
        bot += '<b class="' + c + '">' + p[k].replace(' ', '␣') + '</b>';
      }
    } else bot = p.split('').map(c => '<b>' + c + '</b>').join('');
    row.innerHTML = top + '\n' + bot;
    kv(kvb, [['已经比了几次', cmp], ['一共要比', ev.filter(x => x.ok !== undefined).length + ' 次']]);
  }
  function step(){
    if (at >= ev.length) return false;
    at++; draw();
    const e = ev[at - 1], p = pIn.value;
    if (e.end) say.textContent = '比完了，句子里没有“' + p + '”。一共比了 ' + ev.filter(x => x.ok !== undefined).length + ' 次。';
    else if (e.found) say.textContent = '找到了！在第 ' + e.s + ' 个字（从 0 数）。一共比了 ' + ev.filter(x => x.ok !== undefined).length + ' 次。' + (mode === 0 ? '换成 KMP 再试试。' : '和笨办法比一比。');
    else if (e.ok) say.textContent = '第 ' + e.k + ' 个字对上了。';
    else if (mode === 0) say.textContent = '第 ' + e.k + ' 个字比错了。笨办法：纸条往右挪一格，从词的第一个字重新比。';
    else say.textContent = e.jump !== undefined ? '第 ' + e.k + ' 个字比错了。已经对上的 ' + e.k + ' 个字里，结尾有 ' + e.jump + ' 个和词的开头一样：纸条直接挪过去，灰色的 ' + e.jump + ' 个字不用再比。' : '词的第一个字就比错了：纸条往右挪一格。';
    return true;
  }
  $('[data-x="s"]', fig).addEventListener('click', step);
  $('[data-x="all"]', fig).addEventListener('click', () => { while (step()); });
  $('[data-x="r"]', fig).addEventListener('click', build);
  tIn.addEventListener('input', build); pIn.addEventListener('input', build);
  build();
});
