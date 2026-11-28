/* ---------- 第二章 ---------- */
/* 像 xxd 一样排字节：bytes 是 Uint8Array 或数组，mark 是要高亮的下标集合 */
function hexDump(bytes, per, mark){
  const out = [];
  for (let o = 0; o < bytes.length; o += per) {
    let h = '<span class="a">' + pad(o.toString(16), 8) + ':</span> ', a = '';
    for (let i = 0; i < per; i++) {
      const k = o + i;
      if (k < bytes.length) { const b = bytes[k], s = pad(b.toString(16), 2); h += mark && mark.has(k) ? '<span class="k">' + s + '</span>' : s; a += b >= 32 && b < 127 ? esc(String.fromCharCode(b)) : '.'; }
      else h += '  ';
      if (i % 2 === 1) h += ' ';
    }
    out.push(h + ' <span class="s">' + a + '</span>');
  }
  return out.join('\n');
}
dev('#hexFig', fig => {
  const ta = $('#hexIn'), outEl = $('#hexOut'), say = $('.say', fig), info = $('#hexInfo'), fin = $('#hexFile');
  const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='), c => c.charCodeAt(0));
  const zip = [0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00, 0x21, 0x5A, 0x7C, 0x59, 0x00, 0x00];
  const macho = [0xCF, 0xFA, 0xED, 0xFE, 0x0C, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00];
  let mode = 0, fileBytes = null, fileName = '';
  const per = () => fig.clientWidth < 560 ? 8 : 16;
  function draw(){
    let bytes, mark = new Set(), msg = '';
    ta.style.display = mode === 0 ? '' : 'none';
    if (mode === 0) { bytes = new TextEncoder().encode(ta.value); const zh = [...ta.value].filter(c => c.codePointAt(0) > 127).length; msg = '一共 <b>' + bytes.length + '</b> 个字节。英文字母、数字、空格各占 1 个字节' + (zh ? '；你打的 ' + zh + ' 个非英文字符，每个占 2 到 4 个字节（第五章讲）' : '') + '。回车换行是 <code>0a</code>。'; }
    if (mode === 1) { bytes = png; for (let i = 0; i < 8; i++) mark.add(i); for (let i = 12; i < 16; i++) mark.add(i); msg = '一张只有 1 个像素的 PNG 图片，一共 ' + png.length + ' 个字节。高亮的前 8 个字节是 PNG 的“魔数”，中间能认出 <code>PNG</code> 三个字母；接着的 <code>IHDR</code> 是“文件头”这一块，后面跟着宽 1、高 1。第三层讲魔数。'; }
    if (mode === 2) { bytes = zip; for (let i = 0; i < 4; i++) mark.add(i); msg = 'ZIP 压缩包的开头（示意）。前两个字节是字母 <code>PK</code>。.docx、.xlsx 文件改名成 .zip 就能解压，看到的开头也是这个。'; }
    if (mode === 3) { bytes = macho; for (let i = 0; i < 4; i++) mark.add(i); msg = 'Mac 上一个 Apple Silicon 程序文件的开头（示意）。<code>cffa edfe</code> 是 Mach-O 格式的魔数；接着 <code>0c00 0001</code> 表示“ARM 64 位”。第二十三章细讲。'; }
    if (mode === 4) { if (!fileBytes) { outEl.textContent = '还没选文件。点上面的“选一个文件”。'; say.innerHTML = ''; return; } bytes = fileBytes; msg = '显示 <b>' + esc(fileName) + '</b> 的前 ' + bytes.length + ' 个字节。对照第三层的魔数表，认认它是什么格式。'; }
    outEl.innerHTML = hexDump(bytes, per(), mark) || ' ';
    say.innerHTML = msg;
  }
  btnRow($('[data-m]', fig), ['自己打字', '一张最小的 PNG', 'ZIP 的开头', 'Mac 程序的开头', '我选的文件'], 0, i => { mode = i; draw(); });
  ta.addEventListener('input', draw);
  fin.addEventListener('change', () => {
    const f = fin.files && fin.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { fileBytes = new Uint8Array(rd.result); fileName = f.name; info.textContent = f.name + '，共 ' + f.size.toLocaleString() + ' 字节，只看前 256 个'; mode = 4; $$('[data-m] button', fig).forEach((b, i) => b.classList.toggle('on', i === 4)); draw(); };
    rd.readAsArrayBuffer(f.slice(0, 256));
  });
  addEventListener('resize', () => { if (fig.offsetParent) draw(); });
  draw();
});

/* 大端还是小端 */
dev('#endianFig', fig => {
  const inp = $('#enIn'), wS = $('#enW'), aI = $('#enA'), box = $('.endian', fig), say = $('.say', fig);
  function go(){
    const w = +wS.value; let s = inp.value.trim().replace(/^0x/i, '').replace(/[\s_]/g, '').toUpperCase();
    let base = parseInt(aI.value.trim(), aI.value.trim().toLowerCase().startsWith('0x') ? 16 : 10); if (!isFinite(base) || base < 0) base = 0x100;
    if (!/^[0-9A-F]+$/.test(s)) { box.innerHTML = ''; say.textContent = '请输入十六进制数（0—9、A—F）。'; return; }
    if (s.length > w * 2) { say.textContent = '这个数要 ' + Math.ceil(s.length / 2) + ' 个字节才放得下，先换成更宽的类型。'; box.innerHTML = ''; return; }
    s = pad(s, w * 2); const B = []; for (let i = 0; i < w; i++) B.push(s.slice(i * 2, i * 2 + 2));
    const L = B.slice().reverse();
    const cell = (b, i) => '<td class="m" style="text-align:center">' + b + '</td>';
    box.innerHTML = '<table class="t c" style="min-width:' + (120 + w * 52) + 'px;margin:8px 0"><tr><th>地址</th>' + B.map((_, i) => '<th class="m">0x' + (base + i).toString(16).toUpperCase() + '</th>').join('') + '</tr>' +
      '<tr><th>大端</th>' + B.map(cell).join('') + '</tr><tr><th>小端</th>' + L.map(cell).join('') + '</tr></table>';
    say.innerHTML = '数 0x' + s + ' 的最高字节是 <b>' + B[0] + '</b>，最低字节是 <b>' + B[w - 1] + '</b>。大端把最高字节放在最小的地址 0x' + base.toString(16).toUpperCase() + '，小端放最低字节。<br>如果小端机器写进去、却按大端读出来，会读成 <b>0x' + L.join('') + '</b>，完全是另一个数。网络通信里不先约定字节序，就会出这种错。';
  }
  [inp, wS, aI].forEach(el => el.addEventListener('input', go));
  go();
});
