/* ---------- 第七章 ---------- */
dev('#bitopFig', fig => {
  const out = $('.kv', fig), say = $('.say', fig), rBox = $('.bR', fig);
  let op = 0;
  const OPS = [['A &amp; B', (a, b) => a & b, '与：B 是 1 的位置，A 原样透过来；B 是 0 的位置，结果一定是 0。B 就是“镂空模板”。'],
    ['A | B', (a, b) => a | b, '或：B 是 1 的位置，结果一定是 1；B 是 0 的位置，A 原样留下。用来“打开”某几位。'],
    ['A ^ B', (a, b) => a ^ b, '异或：B 是 1 的位置，A 被翻过来；B 是 0 的位置，A 原样留下。再异或一次 B 就还原。'],
    ['~A', a => ~a & 255, '非：A 的每一位都翻过来，B 不参与。在 8 位补码里，~A = −A − 1。'],
    ['A &lt;&lt; 1', a => (a << 1) & 255, '左移一位：每一位往左挪，右边补 0，最左边那位被挤掉。没挤掉 1 的话，就是乘 2。'],
    ['A &gt;&gt; 1', a => a >> 1, '右移一位（逻辑）：每一位往右挪，左边补 0，最右边那位被扔掉。就是除以 2 再扔掉余数。']];
  const MK = [['低 4 位 0x0F', 0x0F], ['高 4 位 0xF0', 0xF0], ['第 5 位 0x20', 0x20], ['第 0 位 0x01', 0x01], ['全 1 0xFF', 0xFF]];
  const show = () => {
    const a = A.get(), b = B.get(), r = OPS[op][1](a, b);
    rBox.innerHTML = '<div class="bitrow">' + Array.from({length: 8}, (_, k) => { const i = 7 - k, on = (r >> i) & 1; return '<span class="bit' + (on ? ' on' : '') + '" style="cursor:default"><b>' + on + '</b><small>' + i + '</small></span>'; }).join('') + '</div>';
    kv(out, [['A', a + ' = 0x' + hex2(a)], ['B', b + ' = 0x' + hex2(b)], ['结果', r + ' = 0x' + hex2(r)], ['结果当字符', r >= 33 && r < 127 ? "'" + esc(String.fromCharCode(r)) + "'" : '（不是可见字母）']]);
    let m = OPS[op][2];
    if (op === 2 && b === 0x20 && ((a >= 65 && a <= 90) || (a >= 97 && a <= 122))) m += ' 你正好把字母 ' + String.fromCharCode(a) + ' 变成了 ' + String.fromCharCode(r) + '：第五章的大小写把戏。';
    if (op === 4 && (a & 128)) m += ' <b>注意</b>：最高位的 1 被挤掉了，结果不再是 A × 2（溢出）。';
    say.innerHTML = m;
  };
  const A = bitRow($('.bA', fig), {n: 8, val: 0x61, labels: i => i, onChange: show});
  const B = bitRow($('.bB', fig), {n: 8, val: 0x20, labels: i => i, onChange: show});
  btnRow($('[data-op]', fig), OPS.map(o => o[0]), 2, i => { op = i; show(); });
  const mk = $('[data-mk]', fig); mk.innerHTML = '<span class="dim" style="font-size:13px">把 B 设成掩码：</span>' + MK.map((m, i) => '<button class="btn" data-i="' + i + '">' + m[0] + '</button>').join('');
  mk.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; B.set(MK[+b.dataset.i][1]); show(); });
  op = 2; show();
});

dev('#permFig', fig => {
  const box = $('.perm', fig), inp = $('#pmIn'), out = $('.kv', fig), say = $('.say', fig);
  let v = 0o644;
  const WHO = ['主人', '同组', '其他人'], WHAT = [['r', '读'], ['w', '写'], ['x', '执行']];
  function draw(){
    let h = '<table class="t c" style="max-width:420px;margin:0 auto"><tr><th></th>' + WHAT.map(w => '<th>' + w[1] + ' ' + w[0] + '</th>').join('') + '<th>八进制</th></tr>';
    WHO.forEach((w, g) => { const sh = (2 - g) * 3; h += '<tr><th>' + w + '</th>' + WHAT.map((x, k) => { const bit = sh + 2 - k, on = (v >> bit) & 1; return '<td><button class="bit' + (on ? ' on' : '') + '" data-b="' + bit + '" style="width:44px"><b>' + (on ? x[0] : '-') + '</b><small>' + (on ? 1 : 0) + '</small></button></td>'; }).join('') + '<td class="m" style="font-size:20px">' + ((v >> sh) & 7) + '</td></tr>'; });
    box.innerHTML = h + '</table>';
    const sym = WHO.map((_, g) => WHAT.map((x, k) => ((v >> ((2 - g) * 3 + 2 - k)) & 1) ? x[0] : '-').join('')).join('');
    const oct = v.toString(8).padStart(3, '0');
    if (document.activeElement !== inp) inp.value = oct;
    kv(out, [['ls -l 里的样子', '-' + sym], ['九个比特', grp(bin(v, 9), 3)], ['八进制', oct], ['命令', 'chmod ' + oct + ' 文件名']]);
    const can = g => { const p = (v >> ((2 - g) * 3)) & 7; return p ? WHAT.filter((_, k) => (p >> (2 - k)) & 1).map(x => x[1]).join('、') : '什么都不能做'; };
    say.innerHTML = WHO.map((w, g) => '<b>' + w + '</b>：' + can(g)).join('；') + '。' + (v === 0o777 ? ' 777 让任何人都能改你的文件，一般不该这样设。' : v === 0o755 ? ' 755 是程序和脚本最常见的权限。' : v === 0o644 ? ' 644 是普通文件最常见的权限。' : v === 0o600 ? ' 600 常用来保护私密文件，比如密钥。' : '');
  }
  box.addEventListener('click', e => { const b = e.target.closest('button[data-b]'); if (!b) return; v ^= 1 << +b.dataset.b; draw(); });
  inp.addEventListener('input', () => { if (/^[0-7]{3}$/.test(inp.value)) { v = parseInt(inp.value, 8); draw(); } });
  draw();
});
