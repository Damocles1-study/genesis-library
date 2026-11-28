/* ---------- 第二部封面：晶体管个数 ---------- */
const CHIPS = [[1971, 2300, 'Intel 4004', '第一块商用的单片微处理器，给一台计算器用'], [1978, 29000, 'Intel 8086', 'x86 这一家的祖先'], [1982, 134000, 'Intel 80286', ''], [1985, 275000, 'Intel 80386', '第一块 32 位的 x86'], [1989, 1200000, 'Intel 80486', '把浮点运算器做进了同一块芯片'],
  [1993, 3100000, 'Intel Pentium', ''], [2000, 42000000, 'Pentium 4', '主频冲到几 GHz，然后撞上了功耗墙'], [2006, 291000000, 'Core 2 Duo', '一块芯片里两个核'], [2013, 1000000000, 'Apple A7', '第一块 64 位的手机芯片，约十亿个'], [2020, 16000000000, 'Apple M1', 'MacBook Air M1 里的那块，约一百六十亿个'],
  [2022, 114000000000, 'Apple M1 Ultra', '两块 M1 Max 拼在一起'], [2023, 134000000000, 'Apple M2 Ultra', '约一千三百四十亿个']];
dev('#mooreFig', fig => {
  const svg = $('svg', fig), say = $('.say', fig);
  const X = y => 60 + (y - 1970) / 56 * 560, Y = n => 270 - (Math.log10(n) - 3) / 9 * 250;
  let h = '<rect x="60" y="20" width="560" height="250" fill="var(--paper)" stroke="var(--rule)"/>';
  for (let e = 3; e <= 12; e++) { const y = Y(10 ** e); h += '<line x1="60" x2="620" y1="' + y + '" y2="' + y + '" stroke="var(--rule)" stroke-dasharray="2 3"/>' + txt(56, y + 4, ['一千', '一万', '十万', '一百万', '一千万', '一亿', '十亿', '百亿', '千亿', '万亿'][e - 3], {s: 10, a: 'end', c: 'var(--ink-3)'}); }
  for (let yr = 1970; yr <= 2025; yr += 10) h += txt(X(yr), 288, yr, {s: 11, c: 'var(--ink-3)'});
  h += '<line x1="' + X(1971) + '" y1="' + Y(2300) + '" x2="' + X(2025) + '" y2="' + Y(2300 * 2 ** 27) + '" stroke="var(--ter)" stroke-dasharray="6 4" stroke-width="1.5"/>';
  CHIPS.forEach((c, i) => { h += '<circle cx="' + X(c[0]) + '" cy="' + Y(c[1]) + '" r="7" fill="var(--main)" stroke="var(--card)" stroke-width="2" data-i="' + i + '" style="cursor:pointer"/>'; });
  svg.innerHTML = h;
  const pick = i => { const c = CHIPS[i]; $$('circle', svg).forEach(el => el.setAttribute('r', +el.dataset.i === i ? 10 : 7)); say.innerHTML = '<b>' + c[2] + '</b>（' + c[0] + ' 年）：约 ' + c[1].toLocaleString() + ' 个晶体管。' + c[3] + (i ? '　是 4004 的 ' + Math.round(c[1] / 2300).toLocaleString() + ' 倍。' : ''); };
  svg.addEventListener('click', e => { const c = e.target.closest('circle[data-i]'); if (c) pick(+c.dataset.i); });
  pick(9);
});
