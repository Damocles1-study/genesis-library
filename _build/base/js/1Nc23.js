/* ---------- 第二十三章：你的程序住在哪儿 ---------- */
dev('#loadFig', fig => {
  const ta = $('#ldIn'), map = $('.ldmap', fig), say = $('.say', fig);
  const EG = 'main   0x104b8be8c\nmsg    0x104b8bf9c\ng_init 0x104b90000\ng_zero 0x104b90004\nheap   0x600000c84000\nlocal  0x16b2772cc\nprintf 0x18c3a9a60';
  const KIND = {main: ['代码（__TEXT）', 'var(--main)'], msg: ['只读数据（字符串）', 'var(--ter)'], g_init: ['数据（__DATA）', 'var(--gold)'], g_zero: ['未初始化数据', 'var(--gold)'], heap: ['堆', 'var(--l2)'], local: ['栈', 'var(--l3)'], printf: ['系统库（共享缓存）', 'var(--grn)']};
  function draw(){
    const rows = ta.value.split('\n').map(l => l.trim().match(/^(\S+)\s+(0x[0-9a-f]+)/i)).filter(Boolean).map(m => ({n: m[1], a: BigInt(m[2])}));
    if (rows.length < 2) { map.innerHTML = ''; say.textContent = '至少要两行“名字 地址”。'; return; }
    rows.sort((x, y) => (y.a > x.a ? 1 : y.a < x.a ? -1 : 0));
    let h = '';
    rows.forEach((r, i) => {
      if (i) { const gap = rows[i - 1].a - r.a, d = gap > 0n ? gap.toString().length - 1 : 0; h += '<div class="ldgap" style="height:' + (16 + d * 5) + 'px"><span>相差约 10^' + d + ' 字节</span></div>'; }
      const k = KIND[r.n] || ['?', 'var(--ink-3)'];
      h += '<div class="ldrow" style="--c:' + k[1] + '"><b>' + esc(r.n) + '</b><span class="m">0x' + r.a.toString(16) + '</span><span>' + k[0] + '</span></div>';
    });
    map.innerHTML = '<div class="dim" style="font-size:12px">↑ 高地址</div>' + h + '<div class="dim" style="font-size:12px">↓ 低地址</div>';
    const g = n => rows.find(r => r.n === n);
    let m = '';
    if (g('main') && g('g_init')) m += 'main（代码）和全局变量离得很近，它们来自同一个可执行文件，被一起装进内存，只差几页。';
    if (g('heap') && g('local')) m += (g('heap').a > g('local').a ? ' 这台机器上堆在栈的上面，和教科书的图正好相反。' : ' 这台机器上栈在堆的上面，和教科书的图一样。');
    if (g('printf') && g('main')) m += ' printf 不在你的程序里，而在系统库的共享缓存那一片，离 main 很远。';
    say.innerHTML = m || '按地址从高到低排好了。';
  }
  $('.btns', fig).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.x === 'eg') ta.value = EG; draw(); });
  ta.value = EG; draw();
});
