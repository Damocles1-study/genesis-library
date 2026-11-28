/* ---------- 第十三章：小机模拟器 ---------- */
const XJ_OPS = ['HLT', 'LDA', 'STA', 'ADD', 'SUB', 'LDI', 'JMP', 'JZ', 'JN', 'OUT'];
const XJ_NOARG = {HLT: 1, OUT: 1};
const XJ_MEAN = ['停机', '把第 a 格装进 ACC', '把 ACC 存进第 a 格', 'ACC 加上第 a 格', 'ACC 减去第 a 格', '把数 a 直接装进 ACC', '跳到第 a 格', 'ACC 是 0 就跳到第 a 格', 'ACC 是负数就跳到第 a 格', '打印 ACC'];
function xjDis(b){ const op = b >> 4, a = b & 15; if (op > 9) return '（不是指令）'; return XJ_OPS[op] + (XJ_NOARG[XJ_OPS[op]] ? '' : ' ' + a); }
function xjAsm(src){
  const mem = Array(16).fill(0); let p = 0; const errs = [];
  src.split('\n').forEach((raw, li) => {
    let s = raw.replace(/[;；#].*$/, '').trim(); if (!s) return;
    const m = s.match(/^(\d+)\s*[:：]\s*(.*)$/); if (m) { p = +m[1]; s = m[2].trim(); }
    if (p > 15) { errs.push('第 ' + (li + 1) + ' 行：地址超过 15'); return; }
    let v = null;
    if (/^(0x[0-9a-f]+|\d+)$/i.test(s)) v = s.toLowerCase().startsWith('0x') ? parseInt(s, 16) : parseInt(s, 10);
    else { const t = s.toUpperCase().split(/\s+/), op = XJ_OPS.indexOf(t[0]); if (op < 0) { errs.push('第 ' + (li + 1) + ' 行：不认识“' + t[0] + '”'); return; } let a = 0; if (!XJ_NOARG[t[0]]) { if (t[1] === undefined || !/^\d+$/.test(t[1]) || +t[1] > 15) { errs.push('第 ' + (li + 1) + ' 行：' + t[0] + ' 后面要跟 0—15 的数'); return; } a = +t[1]; } v = op * 16 + a; }
    if (v > 255 || v < 0) { errs.push('第 ' + (li + 1) + ' 行：数要在 0—255 之间'); return; }
    mem[p++] = v;
  });
  return {mem, errs};
}
dev('#cpuFig', fig => {
  const memEl = $('.cpumem', fig), regEl = $('.cpureg', fig), outEl = $('.cpuout', fig), say = $('.say', fig), src = $('#cpuSrc');
  const PROGS = [
    ['加法', 'LDA 14   ; 把第 14 格装进 ACC\nADD 15   ; 加上第 15 格\nOUT      ; 打印\nHLT\n14: 7\n15: 5'],
    ['倒数', 'LDA 15   ; ACC = 5\nOUT      ; 打印 ACC\nSUB 14   ; 减 1\nJZ 5     ; 减到 0 就跳到第 5 格（停机）\nJMP 1    ; 否则跳回第 1 格再打印\nHLT\n14: 1\n15: 5'],
    ['乘法 6 × 3', 'LDA 13   ; 积\nADD 15   ; 加一次 6\nSTA 13\nLDA 14   ; 还剩几次\nSUB 12   ; 减 1\nSTA 14\nJZ 8\nJMP 0\nLDA 13\nOUT\nHLT\n12: 1\n13: 0\n14: 3\n15: 6'],
    ['自己改自己', 'LDA 15   ; 第 15 格放的是 OUT 这条指令的编码\nSTA 3    ; 把它抄进第 3 格，盖掉原来的 HLT\nLDI 7\nHLT      ; 运行到这里时，它已经变成了 OUT\nHLT\n15: OUT']
  ];
  let S, prog = 1, timer = null;
  function reset(mem){ S = {mem: mem.slice(), init: mem.slice(), pc: 0, ir: 0, acc: 0, mar: 0, mdr: 0, phase: 0, halted: false, out: [], acc0: null, n: 0, hlPC: true, hlA: null}; }
  function load(i){ prog = i; src.value = PROGS[i][1]; const r = xjAsm(PROGS[i][1]); reset(r.mem); draw('装好了“' + PROGS[i][0] + '”。点“走一小步”。'); }
  const sgn = v => v >= 128 ? v - 256 : v;
  function draw(msg){
    memEl.innerHTML = '<table class="t"><tr><th>格</th><th>内容</th><th>二进制</th><th>当指令读</th></tr>' + S.mem.map((b, i) => '<tr class="' + (i === S.pc && !S.halted ? 'pc ' : '') + (i === S.hlA ? 'acc' : '') + '"><td class="m">' + i + '</td><td class="m">0x' + hex2(b) + ' <span class="dim">' + b + '</span></td><td class="m">' + grp(bin(b, 8)) + '</td><td class="m">' + xjDis(b) + '</td></tr>').join('') + '</table>';
    const ph = ['取指', '译码', '执行'][S.phase];
    regEl.innerHTML = '<div class="kv">' + [['下一阶段', S.halted ? '已停机' : ph], ['PC', S.pc], ['IR', '0x' + hex2(S.ir) + '<small> ' + bin(S.ir >> 4, 4) + '|' + bin(S.ir & 15, 4) + '</small>'], ['ACC', S.acc + '<small> （补码 ' + sgn(S.acc) + '）</small>'], ['标志 Z / N', (S.acc === 0 ? 1 : 0) + ' / ' + (S.acc >= 128 ? 1 : 0)], ['MAR / MDR', S.mar + ' / 0x' + hex2(S.mdr)]].map(r => '<div>' + r[0] + '<b>' + r[1] + '</b></div>').join('') + '</div>';
    outEl.innerHTML = '<div class="dim" style="font-size:12.5px">打印出来的：</div><div class="mono" style="font-size:20px;min-height:1.5em">' + (S.out.join('　') || '<span class="dim">（还没有）</span>') + '</div><div class="dim" style="font-size:12.5px">已经执行了 ' + S.n + ' 条指令</div>';
    if (msg !== undefined) say.innerHTML = msg;
  }
  function phase(){
    if (S.halted) { draw('已经停机了。点“重来”从头开始。'); return false; }
    let msg = '';
    if (S.phase === 0) {
      S.mar = S.pc; S.mdr = S.mem[S.mar]; S.ir = S.mdr; S.hlA = S.mar; const old = S.pc; S.pc = (S.pc + 1) & 15;
      msg = '<b>取指</b>：PC = ' + old + '，把第 ' + old + ' 格的 0x' + hex2(S.ir) + ' 取进 IR（经过 MAR、MDR），PC 加一变成 ' + S.pc + '。';
      S.phase = 1;
    } else if (S.phase === 1) {
      const op = S.ir >> 4, a = S.ir & 15; S.hlA = null;
      msg = '<b>译码</b>：IR = ' + bin(op, 4) + ' ' + bin(a, 4) + '。高 4 位 ' + op + (op > 9 ? '：不是小机认识的指令！' : ' 是 <b>' + XJ_OPS[op] + '</b>（' + XJ_MEAN[op].replace(/a/g, a) + '）') + (XJ_NOARG[XJ_OPS[op]] ? '，低 4 位用不上。' : '，低 4 位 a = ' + a + '。');
      S.phase = 2;
    } else {
      const op = S.ir >> 4, a = S.ir & 15; S.hlA = null; S.n++;
      switch (op) {
        case 0: S.halted = true; msg = '<b>执行</b>：HLT，停机。'; break;
        case 1: S.mar = a; S.mdr = S.mem[a]; S.acc = S.mdr; S.hlA = a; msg = '<b>执行</b>：读第 ' + a + ' 格，ACC = ' + S.acc + '。'; break;
        case 2: S.mar = a; S.mdr = S.acc; S.mem[a] = S.acc; S.hlA = a; msg = '<b>执行</b>：把 ACC（' + S.acc + '）写进第 ' + a + ' 格。' + (a < 12 ? '　注意：这一格原来是程序的一部分！' : ''); break;
        case 3: S.mar = a; S.mdr = S.mem[a]; S.hlA = a; S.acc = (S.acc + S.mdr) & 255; msg = '<b>执行</b>：ACC 加上第 ' + a + ' 格的 ' + S.mdr + '，ALU 算出 ' + S.acc + '。'; break;
        case 4: S.mar = a; S.mdr = S.mem[a]; S.hlA = a; S.acc = (S.acc - S.mdr) & 255; msg = '<b>执行</b>：ACC 减去第 ' + a + ' 格的 ' + S.mdr + '，ALU 算出 ' + S.acc + (S.acc === 0 ? '，是 0（Z = 1）' : '') + '。'; break;
        case 5: S.acc = a; msg = '<b>执行</b>：ACC = ' + a + '（数直接写在指令里，不用访存）。'; break;
        case 6: S.pc = a; msg = '<b>执行</b>：JMP，把 PC 改成 ' + a + '。下一条从第 ' + a + ' 格取。'; break;
        case 7: if (S.acc === 0) { S.pc = a; msg = '<b>执行</b>：ACC 是 0，跳！PC = ' + a + '。'; } else msg = '<b>执行</b>：ACC 是 ' + S.acc + '，不是 0，不跳，接着往下。'; break;
        case 8: if (S.acc >= 128) { S.pc = a; msg = '<b>执行</b>：ACC 最高位是 1（负数），跳！PC = ' + a + '。'; } else msg = '<b>执行</b>：ACC 不是负数，不跳。'; break;
        case 9: S.out.push(S.acc); msg = '<b>执行</b>：打印 ' + S.acc + '。'; break;
        default: S.halted = true; msg = '<b>执行</b>：操作码 ' + op + ' 小机不认识，只好停机。真正的处理器碰到这种情况会产生“非法指令”异常。';
      }
      S.phase = 0;
      if (S.n > 300 && !S.halted) { S.halted = true; msg += ' 已经执行了 300 条还没停，可能是死循环，先停下。'; }
    }
    draw(msg); return !S.halted;
  }
  const stop = () => { clearInterval(timer); timer = null; const b = $('[data-c="run"]', fig); b.textContent = '一直走'; b.classList.remove('on'); };
  $$('.btns', fig).forEach(row => row.addEventListener('click', e => {
    const b = e.target.closest('button[data-c]'); if (!b) return; const c = b.dataset.c;
    if (c === 'phase') { stop(); phase(); }
    if (c === 'inst') { stop(); do { if (!phase()) break; } while (S.phase !== 0); }
    if (c === 'run') { if (timer) stop(); else { b.textContent = '停'; b.classList.add('on'); timer = setInterval(() => { if (!phase()) stop(); }, 220); } }
    if (c === 'reset') { stop(); reset(S.init); draw('重来。内存恢复成装进去时的样子。'); }
    if (c === 'load') { stop(); const r = xjAsm(src.value); if (r.errs.length) { say.innerHTML = '<b style="color:var(--red)">装不进去：</b>' + r.errs.map(esc).join('；'); return; } reset(r.mem); draw('装好了你写的程序。'); }
  }));
  btnRow($('[data-p]', fig), PROGS.map(p => p[0]), 1, i => { stop(); load(i); });
  new IntersectionObserver(es => { if (!es[0].isIntersecting && timer) stop(); }).observe(fig);
  load(1);
});
