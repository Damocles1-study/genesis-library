/* ---------- 第三章 ---------- */
const s8 = v => (v & 128) ? (v & 255) - 256 : v & 255;
function parseIntLoose(s){ s = String(s).trim().replace(/[_\s]/g, ''); let neg = false; if (s[0] === '-' || s[0] === '−') { neg = true; s = s.slice(1); } let v; if (/^0b[01]+$/i.test(s)) v = parseInt(s.slice(2), 2); else if (/^0x[0-9a-f]+$/i.test(s)) v = parseInt(s.slice(2), 16); else if (/^\d+$/.test(s)) v = parseInt(s, 10); else return null; return neg ? -v : v; }

/* 四位的钟面 */
dev('#wheelFig', fig => {
  const svg = $('svg', fig), say = $('.say', fig); let p = 5;
  const C = 180, R1 = 160, R2 = 118, R3 = 78;
  const ang = k => (k / 16) * 2 * Math.PI - Math.PI / 2;
  const P = (k, r) => [C + r * Math.cos(ang(k)), C + r * Math.sin(ang(k))];
  function draw(){
    let h = '';
    for (let k = 0; k < 16; k++) {
      const a0 = ang(k - .5), a1 = ang(k + .5), neg = k >= 8;
      const pt = (a, r) => (C + r * Math.cos(a)).toFixed(1) + ' ' + (C + r * Math.sin(a)).toFixed(1);
      h += '<path d="M' + pt(a0, R3 - 18) + ' L' + pt(a0, R1) + ' A' + R1 + ' ' + R1 + ' 0 0 1 ' + pt(a1, R1) + ' L' + pt(a1, R3 - 18) + ' A' + (R3 - 18) + ' ' + (R3 - 18) + ' 0 0 0 ' + pt(a0, R3 - 18) + 'Z" fill="' + (k === p ? 'var(--on)' : neg ? 'color-mix(in srgb,var(--l3) 14%,var(--paper))' : 'color-mix(in srgb,var(--l1) 14%,var(--paper))') + '" stroke="var(--rule)"/>';
      const [x1, y1] = P(k, R1 - 18), [x2, y2] = P(k, R2 - 6), [x3, y3] = P(k, R3);
      const on = k === p, ink = on ? '#fff' : 'var(--ink)';
      h += txt(x1, y1 + 4, bin(k, 4), {s: 11, mono: true, c: ink, halo: false});
      h += txt(x2, y2 + 5, k, {s: 14, c: on ? '#fff' : 'var(--ink-2)', halo: false});
      h += txt(x3, y3 + 5, s8(k << 4) >> 4, {s: 14, w: true, c: on ? '#fff' : neg ? 'var(--l3)' : 'var(--l1)', halo: false});
    }
    const [px, py] = P(p, R3 - 26);
    h += '<circle cx="' + C + '" cy="' + C + '" r="40" fill="var(--card)" stroke="var(--rule)"/><line x1="' + C + '" y1="' + C + '" x2="' + px + '" y2="' + py + '" stroke="var(--main)" stroke-width="4" stroke-linecap="round"/><circle cx="' + C + '" cy="' + C + '" r="6" fill="var(--main)"/>';
    h += txt(C, 16, '外圈：无符号　内圈：补码', {s: 11, c: 'var(--ink-3)'});
    svg.innerHTML = h;
  }
  const sv = k => (k >= 8 ? k - 16 : k);
  function move(d){
    const q = ((p + d) % 16 + 16) % 16, us = p + d, ss = sv(p) + d;
    let msg = '<b>' + bin(p, 4) + '</b> ' + (d >= 0 ? '+ ' + d : '− ' + (-d)) + ' → <b>' + bin(q, 4) + '</b>。当成无符号：' + p + (d >= 0 ? ' + ' : ' − ') + Math.abs(d) + ' = ' + q + '；当成补码：' + sv(p) + (d >= 0 ? ' + ' : ' − ') + Math.abs(d) + ' = ' + sv(q) + '。';
    const uo = us > 15 || us < 0, so = ss > 7 || ss < -8;
    if (uo) msg += ' <b style="color:var(--red)">无符号溢出</b>（真正的答案 ' + us + ' 放不进 0—15）。';
    if (so) msg += ' <b style="color:var(--red)">补码溢出</b>（真正的答案 ' + ss + ' 放不进 −8—7）。';
    if (!uo && !so) msg += ' 两种读法都没有溢出。';
    p = q; draw(); say.innerHTML = msg;
  }
  $('.btns', fig).addEventListener('click', e => { const b = e.target.closest('button'); if (b) move(+b.dataset.d); });
  draw(); say.innerHTML = '指针指着 <b>0101</b>：无符号是 5，补码也是 5。右半边（绿）的格子两种读法一样，左半边（紫）不一样。';
});

/* 八位加法器和标志位 */
dev('#flagsFig', fig => {
  const A = $('#flA'), B = $('#flB'), OP = $('#flOp'), box = $('.adder', fig), out = $('.kv', fig), say = $('.say', fig);
  const EX = [['100 + 50', 100, '+', 50], ['127 + 1', 127, '+', 1], ['−1 + 1', -1, '+', 1], ['200 + 100', 200, '+', 100], ['5 − 3', 5, '-', 3], ['3 − 5', 3, '-', 5], ['−128 − 1', -128, '-', 1]];
  const exb = $('[data-ex]', fig); exb.innerHTML = '<span class="dim" style="font-size:13px">试试：</span>' + EX.map((e, i) => '<button class="btn" data-i="' + i + '">' + e[0] + '</button>').join('');
  exb.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const x = EX[+b.dataset.i]; A.value = x[1]; OP.value = x[2]; B.value = x[3]; go(); });
  function go(){
    const ai = parseIntLoose(A.value), bi = parseIntLoose(B.value);
    if (ai === null || bi === null) { box.innerHTML = ''; out.innerHTML = ''; say.textContent = '请输入整数，比如 100、-3、0b1010、0x7F。'; return; }
    const a = ai & 255, b0 = bi & 255, sub = OP.value === '-';
    const b = sub ? (~b0) & 255 : b0, cin = sub ? 1 : 0;
    const car = [cin]; let r = 0;
    for (let i = 0; i < 8; i++) { const s = ((a >> i) & 1) + ((b >> i) & 1) + car[i]; r |= (s & 1) << i; car.push(s >> 1); }
    const c8 = car[8], c7 = car[7];
    const ZF = r === 0 ? 1 : 0, SF = (r >> 7) & 1, OF = c8 ^ c7, CF = sub ? (a < b0 ? 1 : 0) : c8;
    const row = (lab, v, cls) => '<tr><th>' + lab + '</th>' + Array.from({length: 8}, (_, k) => '<td class="m"' + (cls ? ' style="' + cls + '"' : '') + '>' + ((v >> (7 - k)) & 1) + '</td>').join('') + '</tr>';
    const crow = '<tr><th class="dim">进位</th>' + Array.from({length: 8}, (_, k) => { const i = 7 - k; return '<td class="m" style="color:var(--main);font-size:12px">' + car[i + 1] + '</td>'; }).join('') + '</tr>';
    box.innerHTML = '<table class="t c" style="min-width:290px;max-width:480px;margin:8px auto"><tr><th></th>' + [7, 6, 5, 4, 3, 2, 1, 0].map(i => '<th class="m">' + i + '</th>').join('') + '</tr>' + crow + row('A', a) + row(sub ? '取反 B' + (sub ? '，再 +1' : '') : 'B', b) + row('结果', r, 'font-weight:700;border-top:2px solid var(--ink-2)') + '</table>';
    const realU = sub ? a - b0 : a + b0, realS = sub ? s8(a) - s8(b0) : s8(a) + s8(b0);
    kv(out, [['当无符号', a + (sub ? ' − ' : ' + ') + b0 + ' → ' + r], ['当补码', s8(a) + (sub ? ' − ' : ' + ') + s8(b0) + ' → ' + s8(r)], ['ZF 零', ZF], ['SF 符号', SF], ['CF 进位/借位', CF], ['OF 溢出', OF]]);
    let m = '最高位的进位 C<sub>8</sub> = ' + c8 + '，次高位进到最高位的 C<sub>7</sub> = ' + c7 + '，所以 OF = C<sub>8</sub> ⊕ C<sub>7</sub> = ' + OF + '。';
    m += sub ? ' 减法在硬件里是“A 加上 B 取反再加一”；x86 的约定下 CF 表示无符号是否不够减（借位），' + (CF ? a + ' &lt; ' + b0 + '，有借位' : a + ' ≥ ' + b0 + '，没借位') + '。（ARM 的 C 正好相反，等于 C<sub>8</sub> = ' + c8 + '。）' : ' 加法的 CF 就是 C<sub>8</sub>。';
    m += '<br>当无符号：真正的答案是 ' + realU + (realU < 0 || realU > 255 ? '，<b style="color:var(--red)">放不下，CF = 1 告诉你了</b>' : '，没有溢出') + '。当补码：真正的答案是 ' + realS + (realS < -128 || realS > 127 ? '，<b style="color:var(--red)">放不下，OF = 1 告诉你了</b>' : '，没有溢出') + '。';
    if (ai !== s8(a) && ai !== a) m = '注意：' + ai + ' 超出了 8 位，只留下最低 8 位。<br>' + m;
    say.innerHTML = m;
  }
  [A, B, OP].forEach(el => el.addEventListener('input', go));
  go();
});
