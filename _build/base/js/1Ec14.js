/* ---------- 第十四章 ---------- */
dev('#asmFig', fig => {
  const cBox = $('.asmC', fig), aBox = $('.asmA', fig), say = $('.say', fig);
  const EX = [
    ['add', ['int add(int a, int b) {', '    return a + b;', '}'], [
      ['_add:', 0, '函数的入口标签。调用 add 时处理器跳到这里，这时 a 已经在 w0 里，b 在 w1 里。'],
      ['    add   w0, w1, w0', 1, 'w0 = w1 + w0，也就是 b + a。结果正好放在返回值的位置 w0。'],
      ['    ret', 1, '返回：跳回调用它的地方（返回地址在 x30 里，第三层）。']]],
    ['max', ['int max(int a, int b) {', '    return a > b ? a : b;', '}'], [
      ['_max:', 0, '入口。a 在 w0，b 在 w1。'],
      ['    cmp   w0, w1', 1, '算 a − b，结果扔掉，只留下标志位 N Z C V（第三章）。'],
      ['    csel  w0, w0, w1, gt', 1, '条件选择：如果“有符号大于”（gt）成立，w0 = w0（a），否则 w0 = w1（b）。一次跳转都不用，流水线最喜欢这种（第十五章）。'],
      ['    ret', 1, '返回 w0。']]],
    ['sum', ['int sum(int *a, int n) {', '    int s = 0;', '    for (int i = 0; i < n; i++)', '        s += a[i];', '    return s;', '}'], [
      ['_sum:', 0, '入口。x0 是数组第一个元素的地址（64 位指针），w1 是 n。'],
      ['    cmp   w1, #1', 2, '把 n 和 1 比较。#1 表示立即数 1。'],
      ['    b.lt  LBB2_4', 2, '如果 n < 1（有符号的小于），循环一次也不用做，直接跳到后面返回 0。'],
      ['    mov   w8, w1', 2, '用 w8 记“还剩几次”。'],
      ['    mov   w0, #0', 1, 's = 0。s 直接放在 w0 里，最后正好当返回值。'],
      ['LBB2_2:', 2, '循环开始的标签，跳转用。'],
      ['    ldr   w9, [x0], #4', 3, '从 x0 指的地址读 4 个字节进 w9（这就是 a[i]），读完让 x0 加 4，指向下一个 int。'],
      ['    add   w0, w9, w0', 3, 's += a[i]。'],
      ['    subs  x8, x8, #1', 2, '还剩的次数减一，并设置标志位（subs 末尾的 s 就是这个意思）。'],
      ['    b.ne  LBB2_2', 2, '减完不是 0，就跳回循环开始。'],
      ['    ret', 4, '返回 s。'],
      ['LBB2_4:', 2, 'n &lt; 1 时跳到这里。'],
      ['    mov   w0, #0', 4, '返回 0。'],
      ['    ret', 4, '']]]
  ];
  let cur = 0;
  function draw(sel){
    const [, C, A] = EX[cur];
    cBox.innerHTML = '<div class="dim" style="font-size:12px">C</div><pre class="out">' + C.map((l, i) => '<span data-c="' + i + '" class="ln' + (sel && sel[0] === 'c' && sel[1] === i ? ' on' : sel && sel[0] === 'a' && A[sel[1]][1] === i ? ' on' : '') + '">' + esc(l) + '</span>').join('\n') + '</pre>';
    aBox.innerHTML = '<div class="dim" style="font-size:12px">arm64 汇编（clang -O1，大致如此）</div><pre class="out">' + A.map((l, i) => '<span data-a="' + i + '" class="ln' + (sel && ((sel[0] === 'c' && l[1] === sel[1]) || (sel[0] === 'a' && sel[1] === i)) ? ' on' : '') + '">' + esc(l[0]) + '</span>').join('\n') + '</pre>';
    if (!sel) say.innerHTML = cur === 2 ? '注意：C 里的变量 i 在汇编里不见了。编译器改成“倒着数还剩几次、指针一路往后走”，效果完全一样，还少用一个寄存器。' : '点一行看看。';
    else if (sel[0] === 'a') say.innerHTML = '<code>' + esc(A[sel[1]][0].trim()) + '</code>：' + (A[sel[1]][2] || '');
    else say.innerHTML = '这一行 C 对应右边亮起来的 ' + A.filter(l => l[1] === sel[1]).length + ' 行汇编。';
  }
  cBox.addEventListener('click', e => { const s = e.target.closest('[data-c]'); if (s) draw(['c', +s.dataset.c]); });
  aBox.addEventListener('click', e => { const s = e.target.closest('[data-a]'); if (s) draw(['a', +s.dataset.a]); });
  btnRow($('[data-m]', fig), EX.map(x => x[0]), 0, i => { cur = i; draw(); });
  draw();
});

dev('#eaFig', fig => {
  const out = $('.kv', fig), st = $('.eaState', fig), say = $('.say', fig), inp = $('#eaA');
  const M = [5, 11, 7, 13, 2, 0, 9, 4, 15, 3, 8, 1, 10, 6, 12, 14];
  const R = [2, 6, 9, 12], BR = 4, IX = 2, PC = 6, SP = 14;
  const MODES = ['立即', '直接', '间接', '寄存器', '寄存器间接', '基址', '变址', '相对', '堆栈'];
  let m = 1;
  function go(){
    const A = parseInt(inp.value, 10) || 0; let ea = null, opnd = null, acc = 0, how = '', mid = null;
    const okA = a => a >= 0 && a < 16;
    switch (m) {
      case 0: opnd = A; how = '操作数就是 A 本身，写在指令里。'; break;
      case 1: ea = A; how = 'EA = A = ' + A; acc = 1; break;
      case 2: if (okA(A)) { mid = A; ea = M[A]; how = 'EA = (A) = M[' + A + '] = ' + ea + '，先访存一次拿到地址'; acc = 2; } break;
      case 3: { const r = ((A % 4) + 4) % 4; opnd = R[r]; how = 'A 被当作寄存器号 R' + r + '，操作数 = (R' + r + ') = ' + R[r] + '，不访存。'; break; }
      case 4: { const r = ((A % 4) + 4) % 4; ea = R[r]; how = 'EA = (R' + r + ') = ' + ea; acc = 1; break; }
      case 5: ea = BR + A; how = 'EA = (BR) + A = ' + BR + ' + ' + A + ' = ' + ea; acc = 1; break;
      case 6: ea = IX + A; how = 'EA = (IX) + A = ' + IX + ' + ' + A + ' = ' + ea + '（A 当首地址，IX 当下标）'; acc = 1; break;
      case 7: ea = PC + A; how = 'EA = (PC) + A = ' + PC + ' + (' + A + ') = ' + ea + '（PC 已经指向下一条指令；A 可以是负数）'; acc = 1; break;
      case 8: ea = SP; how = 'EA 由栈指针隐含给出：EA = (SP) = ' + SP + '，指令里不用写地址'; acc = 1; break;
    }
    if (ea !== null && !okA(ea)) { kv(out, [['有效地址', ea], ['操作数', '越界']]); st.innerHTML = ''; say.textContent = '有效地址 ' + ea + ' 超出了这台机器的内存（0—15），换一个 A 试试。'; return; }
    if (m === 2 && mid === null) { say.textContent = '间接寻址时 A 要在 0—15 之间。'; return; }
    if (ea !== null) opnd = M[ea];
    st.innerHTML = '<table class="t c" style="min-width:560px;font-size:12.5px;margin:6px 0"><tr><th>地址</th>' + M.map((_, i) => '<th class="m">' + i + '</th>').join('') + '</tr><tr><th>内容</th>' + M.map((v, i) => '<td class="m" style="' + (i === ea ? 'background:color-mix(in srgb,var(--on) 30%,transparent);font-weight:700' : i === mid ? 'background:color-mix(in srgb,var(--l2) 20%,transparent)' : '') + '">' + v + '</td>').join('') + '</tr></table><p class="dim" style="font-size:12.5px;margin:2px 0">寄存器：R0=' + R[0] + '　R1=' + R[1] + '　R2=' + R[2] + '　R3=' + R[3] + '　基址寄存器 BR=' + BR + '　变址寄存器 IX=' + IX + '　PC=' + PC + '（这条指令在第 5 格）　SP=' + SP + '</p>';
    kv(out, [['寻址方式', MODES[m]], ['有效地址 EA', ea === null ? '（没有）' : ea], ['操作数', opnd], ['取操作数访存', acc + ' 次']]);
    say.innerHTML = how + (ea !== null ? '，操作数 = M[' + ea + '] = ' + opnd + '。' : '');
  }
  btnRow($('[data-m]', fig), MODES, 1, i => { m = i; go(); });
  inp.addEventListener('input', go); go();
});
