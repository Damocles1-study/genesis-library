/* ---------- 第八章 ---------- */
const bitBtns = (arr, o) => '<div class="bitrow">' + arr.map((b, i) => '<button class="bit' + (b ? ' on' : '') + (o.cls ? ' ' + (o.cls(i) || '') : '') + '" data-i="' + i + '"' + (o.static ? ' style="cursor:default"' : '') + '><b>' + b + '</b><small>' + (o.lab ? o.lab(i) : '') + '</small></button>').join('') + '</div>';

dev('#parityFig', fig => {
  const dBox = $('.pData', fig), rBox = $('.pRecv', fig), say = $('.say', fig);
  let data = [1, 0, 1, 1, 0, 0, 1], sent = null, recv = null;
  const drawD = () => { dBox.innerHTML = bitBtns(data, {lab: i => 'D' + (i + 1)}); };
  const drawR = () => {
    if (!recv) { rBox.innerHTML = '<p class="dim" style="text-align:center;font-size:14px">还没发。</p>'; say.textContent = ''; return; }
    rBox.innerHTML = bitBtns(recv, {lab: i => i === 7 ? '校验' : 'D' + (i + 1), cls: i => (i === 7 ? 'par' : '') + (recv[i] !== sent[i] ? ' err' : '')});
    const ones = recv.reduce((a, b) => a + b, 0), flips = recv.filter((b, i) => b !== sent[i]).length;
    let m = '收方数了数：8 位里有 <b>' + ones + '</b> 个 1，' + (ones % 2 ? '是奇数，<b style="color:var(--red)">发现出错了！</b>请对方重发。' : '是偶数，认为没有错。');
    if (flips && ones % 2 === 0) m += ' <b style="color:var(--red)">可实际上有 ' + flips + ' 位被翻了，没发现。</b>这就是奇偶校验的弱点。';
    if (flips && ones % 2) m += '（实际被翻了 ' + flips + ' 位。它知道有错，但不知道是哪一位。）';
    if (!flips) m += ' 点“收到的”一排里的比特，模拟噪声。';
    say.innerHTML = m;
  };
  dBox.addEventListener('click', e => { const b = e.target.closest('.bit'); if (!b) return; data[+b.dataset.i] ^= 1; drawD(); });
  rBox.addEventListener('click', e => { const b = e.target.closest('.bit'); if (!b || !recv) return; recv[+b.dataset.i] ^= 1; drawR(); });
  $('.btns', fig).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.x === 'rand') { data = data.map(() => Math.random() < .5 ? 1 : 0); drawD(); } const p = data.reduce((a, c) => a ^ c, 0); sent = data.concat([p]); recv = sent.slice(); drawR(); });
  drawD(); drawR();
});

dev('#hamFig', fig => {
  const dBox = $('.hData', fig), sBox = $('.hSend', fig), rBox = $('.hRecv', fig), out = $('.kv', fig), say = $('.say', fig);
  let d = [1, 0, 1, 1], code = null, recv = null;
  const NAME = ['P1', 'P2', 'D1', 'P4', 'D2', 'D3', 'D4'];
  const encode = () => { const [d1, d2, d3, d4] = d; const p1 = d1 ^ d2 ^ d4, p2 = d1 ^ d3 ^ d4, p4 = d2 ^ d3 ^ d4; return [p1, p2, d1, p4, d2, d3, d4]; };
  const cover = k => [1, 2, 3, 4, 5, 6, 7].filter(p => p & k).join(' ');
  function draw(){
    dBox.innerHTML = bitBtns(d, {lab: i => 'D' + (i + 1)});
    sBox.innerHTML = bitBtns(code, {static: true, lab: i => (i + 1) + ' ' + NAME[i], cls: i => [0, 1, 3].includes(i) ? 'par' : ''});
    rBox.innerHTML = bitBtns(recv, {lab: i => (i + 1) + ' ' + NAME[i], cls: i => ([0, 1, 3].includes(i) ? 'par' : '') + (recv[i] !== code[i] ? ' err' : '')});
    const S = [1, 2, 4].map(k => [1, 2, 3, 4, 5, 6, 7].filter(p => p & k).reduce((a, p) => a ^ recv[p - 1], 0));
    const syn = S[2] * 4 + S[1] * 2 + S[0];
    kv(out, [['P1 管', '位置 ' + cover(1)], ['P2 管', '位置 ' + cover(2)], ['P4 管', '位置 ' + cover(4)], ['重算三组', 'S4=' + S[2] + ' S2=' + S[1] + ' S1=' + S[0]], ['校正因子', '' + S[2] + S[1] + S[0] + ' = ' + syn]]);
    const flips = recv.map((b, i) => b !== code[i] ? i + 1 : 0).filter(Boolean);
    let m;
    if (!syn) m = flips.length ? '<b style="color:var(--red)">校正因子是 0，却有 ' + flips.length + ' 位出错（位置 ' + flips.join('、') + '）</b>：错误太多，海明码没发现。' : '校正因子是 000：没有错。点“收到的”那一排任意一位，让它出错。';
    else { const fixed = recv.slice(); fixed[syn - 1] ^= 1; const ok = fixed.every((b, i) => b === code[i]); m = '校正因子 ' + S[2] + S[1] + S[0] + ' = <b>' + syn + '</b>，说明第 ' + syn + ' 位（' + NAME[syn - 1] + '）错了，把它翻回来。' + (ok ? ' <b style="color:var(--l1)">改对了！</b>取出位置 3、5、6、7 就是原来的数据 ' + d.join('') + '。' : ' <b style="color:var(--red)">可实际出错的是位置 ' + flips.join('、') + '</b>：错了两位以上时，海明码会“改错”，改得更糟。加一个总校验位（第二层的 SECDED）就能发现这种情况。'); }
    say.innerHTML = m;
  }
  dBox.addEventListener('click', e => { const b = e.target.closest('.bit'); if (!b) return; d[+b.dataset.i] ^= 1; code = encode(); recv = code.slice(); draw(); });
  rBox.addEventListener('click', e => { const b = e.target.closest('.bit'); if (!b) return; recv[+b.dataset.i] ^= 1; draw(); });
  code = encode(); recv = code.slice(); draw();
});

function mod2div(bits, g){
  const a = bits.slice(), r = g.length - 1, steps = [];
  for (let i = 0; i + r < a.length; i++) { if (!a[i]) continue; const before = a.slice(i, i + r + 1).join(''); for (let k = 0; k <= r; k++) a[i + k] ^= g[k]; steps.push([i, before, a.slice(i, i + r + 1).join('')]); }
  return {rem: a.slice(a.length - r), steps};
}
dev('#crcFig', fig => {
  const dIn = $('#crcD'), gIn = $('#crcG'), box = $('.crcdiv', fig), rBox = $('.cRecv', fig), say = $('.say', fig);
  let frame = null, sentF = null, nData = 0, r = 0, G = null;
  function go(){
    const ds = dIn.value.replace(/\s/g, ''), gs = gIn.value.replace(/\s/g, '');
    if (!/^[01]+$/.test(ds) || !/^1[01]*1$/.test(gs) || gs.length < 2 || ds.length > 32 || gs.length > 17) { box.textContent = '数据和生成多项式都要写成 0 和 1；生成多项式要以 1 开头、以 1 结尾，至少两位。数据最多 32 位。'; rBox.innerHTML = ''; say.textContent = ''; return; }
    const D = [...ds].map(Number); G = [...gs].map(Number); r = G.length - 1; nData = D.length;
    const res = mod2div(D.concat(Array(r).fill(0)), G);
    const lines = ['<span class="a">被除数（数据后面补 ' + r + ' 个 0）</span>', ds + '<span class="s">' + '0'.repeat(r) + '</span>'];
    res.steps.forEach(([i, b, a]) => { const sp = ' '.repeat(i); lines.push(sp + b + '  <span class="a">← 当前最高位是 1</span>', sp + gs + '  <span class="a">异或上生成多项式</span>', sp + '-'.repeat(gs.length), sp + a); });
    lines.push('<span class="a">余数（CRC 校验码）：</span><span class="k">' + res.rem.join('') + '</span>');
    box.innerHTML = lines.join('\n');
    sentF = D.concat(res.rem); frame = sentF.slice(); drawR();
  }
  function drawR(){
    rBox.innerHTML = bitBtns(frame, {cls: i => (i >= nData ? 'par' : '') + (frame[i] !== sentF[i] ? ' err' : '')});
    const rem = mod2div(frame, G).rem, zero = rem.every(b => !b), flips = frame.filter((b, i) => b !== sentF[i]).length;
    say.innerHTML = '发送的帧 = 数据 + CRC（紫框）= <code>' + sentF.join('') + '</code>。收方用 ' + G.join('') + ' 去除收到的整串，余数 <b class="mono">' + rem.join('') + '</b>：' + (zero ? (flips ? '<b style="color:var(--red)">余数是 0，可实际错了 ' + flips + ' 位，正好被整除，漏检了。</b>换个更长的生成多项式会好得多。' : '是 0，认为没有错。点一下帧里的比特制造错误。') : '<b style="color:var(--red)">不是 0，发现出错了</b>（错了 ' + flips + ' 位）。CRC 不告诉你错在哪，只能请对方重发。');
  }
  rBox.addEventListener('click', e => { const b = e.target.closest('.bit'); if (!b || !frame) return; frame[+b.dataset.i] ^= 1; drawR(); });
  [dIn, gIn].forEach(el => el.addEventListener('input', go));
  go();
});
