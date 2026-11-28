/* ---------- 第二十八章：索引节点能装多大的文件 ---------- */
dev('#inodeFig', fig => {
  const box = $('.inode', fig), out = $('.kv', fig), say = $('.say', fig);
  const fill = (id, arr, f, def) => { const s = $('#' + id); s.innerHTML = arr.map(x => '<option value="' + x + '"' + (x === def ? ' selected' : '') + '>' + f(x) + '</option>').join(''); s.style.width = 'auto'; return s; };
  const sB = fill('inB', [512, 1024, 2048, 4096, 8192, 16384], x => x >= 1024 ? x / 1024 + ' KB' : x + ' B', 4096), sP = fill('inP', [2, 4, 8], x => x + ' 字节', 4), sL = fill('inL', [0, 1, 2, 3], x => x ? x + ' 级' : '没有', 3);
  const sD = $('#inD'), sO = $('#inO');
  const human = b => { const u = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB']; let i = 0, x = Number(b); while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; } return (x >= 100 ? x.toFixed(0) : x.toFixed(2).replace(/\.?0+$/, '')) + ' ' + u[i]; };
  function go(){
    const B = BigInt(sB.value), p = BigInt(sP.value), D = BigInt(Math.max(0, Math.min(16, parseInt(sD.value, 10) || 0))), L = +sL.value, n = B / p;
    const lv = [D]; for (let k = 1; k <= L; k++) lv.push(n ** BigInt(k));
    const total = lv.reduce((a, b) => a + b, 0n);
    box.innerHTML = '<div class="inbars">' + lv.map((c, k) => '<div><b>' + (k ? k + ' 级间接' : '直接') + '</b><span>' + c.toLocaleString() + ' 块</span><small>' + human(c * B) + '</small></div>').join('') + '</div>';
    let msg = '一个索引块放 ' + n + ' 个块号（' + B + ' ÷ ' + p + '）。';
    const off = /^\d+$/.test(sO.value.trim()) ? BigInt(sO.value.trim()) : null;
    if (off === null) msg += ' 偏移请写成整数字节数。';
    else {
      const blk = off / B; let acc = 0n, lvl = -1;
      for (let k = 0; k < lv.length; k++) { if (blk < acc + lv[k]) { lvl = k; break; } acc += lv[k]; }
      msg += '<br>偏移 ' + off.toLocaleString() + ' 在第 ' + blk.toLocaleString() + ' 块（从 0 数）。' + (lvl < 0 ? ' <b style="color:var(--red)">超出了最大文件长度。</b>' : ' 前面的范围加起来是 ' + acc.toLocaleString() + ' 块，所以它落在<b>' + (lvl ? lvl + ' 级间接' : '直接指针') + '</b>里：inode 在内存中时，要先读 ' + lvl + ' 个索引块，再读 1 个数据块，一共访问磁盘 <b>' + (lvl + 1) + '</b> 次。');
    }
    kv(out, [['最多能有', total.toLocaleString() + ' 块'], ['最大文件长度', human(total * B)]]);
    say.innerHTML = msg;
  }
  [sB, sP, sL, sD, sO].forEach(el => el.addEventListener('input', go));
  go();
});
