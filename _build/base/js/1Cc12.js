/* ---------- 第十二章 ---------- */
dev('#ramFig', fig => {
  const cells = $('.ramcells', fig), say = $('.say', fig);
  const mem = [0x48, 0x65, 0x6C, 0x6C, 0x6F, 0, 0, 0, 0x2A, 0, 0, 0, 0, 0, 0xFF, 0x07];
  let hl = null;
  const draw = () => {
    const a = addr.get();
    cells.innerHTML = '<table class="t" style="font-size:13px"><tr><th>地址</th><th>译码</th><th>内容</th><th></th></tr>' + mem.map((v, i) => '<tr' + (i === a ? ' style="background:var(--hl)"' : '') + '><td class="m">' + bin(i, 4) + ' (' + i + ')</td><td>' + (i === a ? '<b style="color:var(--on)">●</b>' : '<span class="dim">○</span>') + '</td><td class="m"' + (hl === i ? ' style="font-weight:700;color:var(--main)"' : '') + '>' + bin(v, 8) + '</td><td class="m dim">' + (v >= 33 && v < 127 ? "'" + esc(String.fromCharCode(v)) + "'" : v) + '</td></tr>').join('') + '</table>';
  };
  const addr = bitRow($('.ramAddr', fig), {n: 4, val: 0, labels: i => 'A' + i, onChange: () => { hl = null; draw(); say.innerHTML = '地址 ' + bin(addr.get(), 4) + ' 送进译码器，第 ' + addr.get() + ' 根线亮起，选中这一格。'; }});
  const data = bitRow($('.ramData', fig), {n: 8, val: 0x41, labels: i => 'D' + i, onChange: () => { say.innerHTML = '数据线上现在是 ' + bin(data.get(), 8) + ' = ' + data.get() + '。点“写”才会进内存。'; }});
  $('.btns', fig).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const a = addr.get();
    if (b.dataset.x === 'w') { mem[a] = data.get(); hl = a; say.innerHTML = '<b>写</b>：把 ' + bin(data.get(), 8) + ' 放进第 ' + a + ' 格，原来的内容被覆盖了。'; }
    if (b.dataset.x === 'r') { data.set(mem[a]); hl = a; say.innerHTML = '<b>读</b>：第 ' + a + ' 格的内容 ' + bin(mem[a], 8) + ' 被送到数据线上。读不会改变内存里的内容（DRAM 内部其实是读出再写回，第二层）。'; }
    if (b.dataset.x === 'hi') { [72, 73, 33].forEach((c, k) => mem[(a + k) & 15] = c); hl = a; say.innerHTML = '从第 ' + a + ' 格开始连写三个字节：72、73、33，也就是 H、I、!（第五章的 ASCII）。字符串在内存里就是这样一格挨一格放的。'; }
    draw(); });
  draw(); say.textContent = '前五格里放着 hello 的 ASCII 码，你能认出来吗？';
});

dev('#expFig', fig => {
  const out = $('.kv', fig), tb = $('.expTable', fig), say = $('.say', fig);
  const WS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 1024], BS = [1, 4, 8, 16, 32];
  const wname = k => k >= 1024 ? (k / 1024) + 'M' : k + 'K';
  const fill = (id, arr, f, def) => { const s = $('#' + id); s.innerHTML = arr.map(x => '<option value="' + x + '"' + (x === def ? ' selected' : '') + '>' + f(x) + '</option>').join(''); s.style.flex = '0 0 auto'; s.style.width = 'auto'; return s; };
  const tw = fill('exTW', WS, wname, 8), tbS = fill('exTB', BS, x => x + ' 位', 8), cw = fill('exCW', WS, wname, 2), cb = fill('exCB', BS, x => x + ' 位', 4);
  function go(){
    const TW = +tw.value, TB = +tbS.value, CW = +cw.value, CB = +cb.value;
    if (CW > TW || CB > TB) { out.innerHTML = ''; tb.innerHTML = ''; say.textContent = '芯片比要拼的内存还大（字数或位数），换小一点的芯片。'; return; }
    const groups = TW / CW, per = TB / CB, total = groups * per;
    const A = Math.log2(TW * 1024), a = Math.log2(CW * 1024), sel = A - a;
    kv(out, [['总片数', groups + ' 组 × ' + per + ' 片 = ' + total], ['位扩展', per > 1 ? '每组 ' + per + ' 片并排，各管 ' + CB + ' 位' : '不需要'], ['字扩展', groups > 1 ? groups + ' 组' : '不需要'], ['地址线', A + ' 根（A' + (A - 1) + '—A0）'], ['进芯片', a + ' 根（A' + (a - 1) + '—A0）'], ['去片选', sel ? sel + ' 根（A' + (A - 1) + '—A' + a + '）→ ' + sel + '-' + (1 << sel) + ' 译码器' : '不需要']]);
    const H = Math.ceil(A / 4), hx = v => pad(v.toString(16).toUpperCase(), H) + 'H';
    const sz = CW * 1024;
    if (groups <= 64) tb.innerHTML = '<table class="t" style="min-width:360px;margin-top:6px"><tr><th>组</th><th>片选（高位地址）</th><th>地址范围</th></tr>' + Array.from({length: groups}, (_, g) => '<tr><td>第 ' + g + ' 组</td><td class="m">' + (sel ? bin(g, sel) : '—') + '</td><td class="m">' + hx(g * sz) + ' — ' + hx((g + 1) * sz - 1) + '</td></tr>').join('') + '</table>';
    else tb.innerHTML = '<p class="dim">一共 ' + groups + ' 组，太多了，不一一列出。</p>';
    say.innerHTML = '连线：每组里的 ' + per + ' 片共用地址线 A' + (a - 1) + '—A0 和同一个片选，数据线各接 ' + CB + ' 位' + (per > 1 ? '（第 0 片接 D' + (CB - 1) + '—D0，第 1 片接 D' + (2 * CB - 1) + '—D' + CB + '……）' : '') + '。' + (sel ? '高 ' + sel + ' 位地址送进译码器，译码器的第 g 个输出接第 g 组的片选，所以每次只有一组工作。' : '') + (TB === 8 ? ' 这里每字 8 位，地址就是字节地址。' : ' 每字 ' + TB + ' 位，这里的地址是“字地址”，按字节编址时要乘 ' + TB / 8 + '。');
  }
  [tw, tbS, cw, cb].forEach(s => s.addEventListener('input', go));
  go();
});
