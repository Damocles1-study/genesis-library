/* ---------- 第十七章：类型的尺子 ---------- */
dev('#typeFig', fig => {
  const inp = $('#tyIn'), bb = $('.tybytes', fig), out = $('.kv', fig), say = $('.say', fig);
  const T = [['char', 1, 1, 'i'], ['unsigned char', 1, 0, 'i'], ['short', 2, 1, 'i'], ['int', 4, 1, 'i'], ['unsigned int', 4, 0, 'i'], ['long', 8, 1, 'i'], ['float', 4, 1, 'f'], ['double', 8, 1, 'f']];
  let t = 3;
  function go(){
    const [name, n, sg, kind] = T[t], s = inp.value.trim();
    let bytes = [], back, rng, note = '';
    if (kind === 'i') {
      const N = BigInt(n * 8), M = 1n << N;
      const lo = sg ? -(M >> 1n) : 0n, hi = sg ? (M >> 1n) - 1n : M - 1n;
      rng = lo.toLocaleString() + ' 到 ' + hi.toLocaleString();
      let v; try { if (/^[+-]?\d+$/.test(s)) v = BigInt(s); else if (/^'.'$/.test(s)) v = BigInt(s.codePointAt(1)); else if (/^[+-]?\d*\.\d+$/.test(s)) { v = BigInt(Math.trunc(parseFloat(s))); note = '小数赋给整数类型，小数部分向零截掉了。'; } else throw 0; } catch (e) { say.textContent = '请输入一个整数（也可以写 \'A\' 这样的字符）。'; bb.innerHTML = ''; out.innerHTML = ''; return; }
      let u = ((v % M) + M) % M; for (let i = 0; i < n; i++) bytes.push(Number((u >> BigInt(8 * i)) & 255n));
      const r = sg && u >= (M >> 1n) ? u - M : u; back = r.toString();
      if (v < lo || v > hi) note += ' <b style="color:var(--red)">' + v + ' 超出了 ' + name + ' 的范围</b>，只留下低 ' + n * 8 + ' 位，读回来变成了 ' + back + '（第三章的“转过钟面”）。';
      if (n === 1 && r >= 32 && r < 127) note += ' 当字符看是 \'' + esc(String.fromCharCode(Number(r))) + '\'。';
    } else {
      const x = parseFloat(s); if (isNaN(x) && !/nan/i.test(s)) { say.textContent = '请输入一个数。'; bb.innerHTML = ''; out.innerHTML = ''; return; }
      const dv = new DataView(new ArrayBuffer(8)); if (n === 4) dv.setFloat32(0, x, true); else dv.setFloat64(0, x, true);
      for (let i = 0; i < n; i++) bytes.push(dv.getUint8(i));
      back = String(n === 4 ? dv.getFloat32(0, true) : dv.getFloat64(0, true)); rng = n === 4 ? '约 ±3.4 × 10^38，约 7 位有效数字' : '约 ±1.8 × 10^308，约 16 位有效数字';
      if (back !== String(x)) note = '存进去再读出来不完全一样：' + name + ' 的精度有限（第四章）。';
    }
    const base = 0x16fdff3a0;
    bb.innerHTML = '<div class="bitrow" style="gap:6px">' + bytes.map((b, i) => '<span class="bit on" style="width:auto;padding:4px 8px;cursor:default"><b style="font-size:17px">' + hex2(b) + '</b><small>0x' + (base + i).toString(16) + '</small></span>').join('') + '</div>';
    kv(out, [['sizeof(' + name + ')', n + ' 字节'], ['能装', rng], ['读回来', back]]);
    say.innerHTML = '在内存里从低地址到高地址依次是上面这些字节（小端：低位字节在前）。' + (note ? '<br>' + note : '');
  }
  btnRow($('[data-m]', fig), T.map(x => x[0]), 3, i => { t = i; go(); });
  inp.addEventListener('input', go); go();
});
