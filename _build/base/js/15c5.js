/* ---------- 第五章 ---------- */
const utf8 = s => [...new TextEncoder().encode(s)];
const hexs = arr => arr.map(b => hex2(b)).join(' ');
let GBK = null;
function gbkMap(){
  if (GBK) return GBK; GBK = new Map(); const dec = new TextDecoder('gbk');
  for (let a = 0x81; a <= 0xFE; a++) for (let b = 0x40; b <= 0xFE; b++) { if (b === 0x7F) continue; const c = dec.decode(new Uint8Array([a, b])); if (c.length === 1 && c !== '�' && !GBK.has(c)) GBK.set(c, [a, b]); }
  return GBK;
}
function gbkEncode(s){ const m = gbkMap(), out = []; for (const ch of s) { const c = ch.codePointAt(0); if (c < 128) out.push(c); else if (m.has(ch)) out.push(...m.get(ch)); else out.push(0x3F); } return out; }

dev('#encFig', fig => {
  const inp = $('#encIn'), box = $('.enc', fig), out = $('.kv', fig), say = $('.say', fig); let sel = 2;
  const TPL = [[0x7F, ['0xxxxxxx']], [0x7FF, ['110xxxxx', '10xxxxxx']], [0xFFFF, ['1110xxxx', '10xxxxxx', '10xxxxxx']], [0x10FFFF, ['11110xxx', '10xxxxxx', '10xxxxxx', '10xxxxxx']]];
  function explain(ch){
    const cp = ch.codePointAt(0), t = TPL.find(x => cp <= x[0])[1], nx = t.join('').split('x').length - 1;
    let bits = pad(cp.toString(2), nx), k = 0;
    const filled = t.map(p => p.replace(/x/g, () => '<b style="color:var(--main)">' + bits[k++] + '</b>'));
    let m = '<b>' + esc(ch) + '</b> 的码位 U+' + pad(cp.toString(16).toUpperCase(), 4) + ' = 二进制 ' + grp(pad(cp.toString(2), Math.ceil(cp.toString(2).length / 4) * 4)) + '。它在 ' + (t.length === 1 ? '0—7F' : t.length === 2 ? '80—7FF' : t.length === 3 ? '800—FFFF' : '10000 以上') + ' 这一段，UTF-8 用 ' + t.length + ' 个字节，模板是 <code>' + t.join(' ') + '</code>，一共 ' + nx + ' 个 x。把码位补成 ' + nx + ' 位，从左到右填进去：<br><code style="font-size:14px">' + filled.join(' ') + '</code> = <b class="mono">' + hexs(utf8(ch)) + '</b>';
    if (cp > 0xFFFF) { const v = cp - 0x10000, hi = 0xD800 + (v >> 10), lo = 0xDC00 + (v & 0x3FF); m += '<br>UTF-16 放不下，要用代理对：' + cp.toString(16).toUpperCase() + ' − 10000 = ' + v.toString(16).toUpperCase() + '，高 10 位加 D800 得 <b class="mono">' + hi.toString(16).toUpperCase() + '</b>，低 10 位加 DC00 得 <b class="mono">' + lo.toString(16).toUpperCase() + '</b>。'; }
    return m;
  }
  function go(){
    const chars = [...inp.value];
    if (!chars.length) { box.innerHTML = ''; out.innerHTML = ''; say.textContent = '打几个字试试。'; return; }
    sel = Math.min(sel, chars.length - 1);
    box.innerHTML = '<table class="t" style="min-width:420px;margin:8px 0"><tr><th>字</th><th>码位</th><th>UTF-8 字节</th><th>UTF-16 单元</th></tr>' + chars.map((c, i) => { const cp = c.codePointAt(0); const u16 = []; for (let j = 0; j < c.length; j++) u16.push(pad(c.charCodeAt(j).toString(16).toUpperCase(), 4)); return '<tr data-i="' + i + '" style="cursor:pointer' + (i === sel ? ';background:var(--hl)' : '') + '"><td style="font-size:20px">' + (c === ' ' ? '␠' : esc(c)) + '</td><td class="m">U+' + pad(cp.toString(16).toUpperCase(), 4) + '</td><td class="m">' + hexs(utf8(c)) + '</td><td class="m">' + u16.join(' ') + '</td></tr>'; }).join('') + '</table>';
    const u8 = utf8(inp.value).length; let u16 = 0; for (const c of chars) u16 += c.length * 2;
    kv(out, [['码位个数（Python 的 len）', chars.length], ['UTF-16 单元（JS 的 length）', inp.value.length], ['UTF-8 字节数', u8], ['UTF-16 字节数', u16]]);
    say.innerHTML = explain(chars[sel]);
  }
  box.addEventListener('click', e => { const tr = e.target.closest('tr[data-i]'); if (tr) { sel = +tr.dataset.i; go(); } });
  inp.addEventListener('input', go); go();
});

dev('#mojiFig', fig => {
  const inp = $('#mjIn'), out = $('.kv', fig), say = $('.say', fig); let mode = 0;
  const dec = (enc, bytes) => new TextDecoder(enc).decode(new Uint8Array(bytes));
  function go(){
    const s = inp.value; let w, r, m;
    if (mode === 0) { w = utf8(s); r = dec('gbk', w); m = 'UTF-8 的字节被 GBK 两个一组地读。网页声明的编码和文件实际的编码不一致时，就会这样。'; kv(out, [['原文', esc(s)], ['UTF-8 写成', hexs(w)], ['GBK 读出', esc(r)]]); }
    if (mode === 1) { w = gbkEncode(s); r = dec('utf-8', w); m = 'GBK 的字节大多不符合 UTF-8 的规则，读的程序只好换成替换字符 �。用老的中文 Windows 软件存的文件，在 Mac 上打开常常是这样。'; kv(out, [['原文', esc(s)], ['GBK 写成', hexs(w)], ['UTF-8 读出', esc(r)]]); }
    if (mode === 2) { w = utf8(s); r = dec('windows-1252', w); m = '西欧的单字节编码把每个字节都当成一个字母，汉字的每个字节都变成一个带帽子的拉丁字母。邮件和老网页里常见。'; kv(out, [['原文', esc(s)], ['UTF-8 写成', hexs(w)], ['西欧编码读出', esc(r)]]); }
    if (mode === 3) { const g = gbkEncode(s), u = dec('utf-8', g), w2 = utf8(u), r2 = dec('gbk', w2); m = '先用 GBK 写、UTF-8 读，读不懂的地方变成 �；再把这些 � 用 UTF-8 存回去（每个是 EF BF BD），最后又被当成 GBK 读：<b>锟斤拷</b>就这样诞生了。'; kv(out, [['① GBK 写成', hexs(g)], ['② UTF-8 读出', esc(u)], ['③ 再用 UTF-8 存', hexs(w2.slice(0, 18)) + (w2.length > 18 ? ' …' : '')], ['④ 当 GBK 读', esc(r2)]]); }
    say.innerHTML = m;
  }
  btnRow($('[data-m]', fig), ['UTF-8 写，GBK 读', 'GBK 写，UTF-8 读', 'UTF-8 写，西欧编码读', '锟斤拷是怎样炼成的'], 0, i => { mode = i; go(); });
  inp.addEventListener('input', go); go();
});
