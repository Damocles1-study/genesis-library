/* ---------- 第十九章：一字节一字节看内存 ---------- */
dev('#arrFig', fig => {
  const grid = $('.bytegrid', fig), out = $('.kv', fig), say = $('.say', fig);
  const BASE = 0x16fdff3a0, LO = -8, HI = 40;
  const B = {}, OWN = {};
  const put = (off, bytes, own, lab) => bytes.forEach((b, i) => { B[off + i] = b; OWN[off + i] = [own, lab ? lab(i) : '']; });
  put(-8, [0x00, 0x00, 0x00, 0x00, 0xa8, 0xf3, 0xdf, 0x6f], 'other', () => '别的');
  [10, 20, 30, 40].forEach((v, k) => put(k * 4, [v, 0, 0, 0], 'a', i => i ? '' : 'a[' + k + ']'));
  put(16, [72, 105, 33, 0], 's', i => ["s[0] 'H'", "s[1] 'i'", "s[2] '!'", "s[3] \\0"][i]);
  put(20, [0x5c, 0x01, 0x00, 0x00], 'gap', () => '空隙');
  put(24, [65], 'q', () => "q.tag 'A'"); put(25, [0xbe, 0xef, 0x11], 'pad', () => '填充');
  put(28, [7, 0, 0, 0], 'q', i => i ? '' : 'q.x'); put(32, [66], 'q', () => "q.y 'B'"); put(33, [0x02, 0x00, 0x00], 'pad', () => '填充');
  put(36, [0x30, 0xf4, 0xdf, 0x6f], 'other', () => '别的');
  const NAME = {a: '数组 a', s: '字符串 s', q: '结构体 q', pad: 'q 里的填充', gap: '变量之间的空隙', other: '不属于这几个变量的内存'};
  function draw(i){
    const st = 4 * i, sel = new Set([st, st + 1, st + 2, st + 3]);
    const W = grid.clientWidth < 520 ? 4 : 8;
    let h = '<table class="bg"><tr><th></th>' + Array.from({length: W}, (_, c) => '<th>+' + c + '</th>').join('') + '</tr>';
    for (let r = LO; r < HI; r += W) {
      h += '<tr><th class="m">' + ahex(BASE + r) + '</th>';
      for (let c = 0; c < W; c++) { const o = r + c, [own, lab] = OWN[o]; h += '<td class="bo-' + own + (sel.has(o) ? ' sel' : '') + '" title="' + esc(lab) + '"><b>' + hex2(B[o]) + '</b><small>' + esc(lab) + '</small></td>'; }
      h += '</tr>';
    }
    grid.innerHTML = h + '</table>';
    const inside = [...sel].every(o => o >= LO && o < HI);
    const val = inside ? ((B[st] | B[st + 1] << 8 | B[st + 2] << 16 | B[st + 3] << 24) | 0) : null;
    const owners = [...new Set([...sel].filter(o => OWN[o]).map(o => NAME[OWN[o][0]]))];
    kv(out, [['a[' + i + '] 的地址', ahex(BASE) + ' + ' + i + ' × 4 = ' + ahex(BASE + st)], ['读出来的 int', val === null ? '（超出这张图了）' : val], ['这 4 个字节属于', owners.join('、') || '（图外）']]);
    say.innerHTML = i >= 0 && i <= 3 ? '在数组里面，读到的就是 a[' + i + ']。' : '<b style="color:var(--red)">越界了。</b>C 照样按“首地址 + i × 4”算出地址去读，读到的是' + (owners.join('、') || '图外的内存') + '的字节，拼成了一个毫无意义的 int。如果是写，就会悄悄把那里改掉。' + (i === 4 ? '　a[4] 正好落在字符串 s 上：72、105、33、0 拼起来是 ' + val + '。' : '');
  }
  const get = slider('arI', null, draw);
  addEventListener('resize', () => draw(get()));
});
