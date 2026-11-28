/* ---------- 第二十章：栈的一生 ---------- */
dev('#stackFig', fig => {
  const code1 = ['int fact(int n) {', '    if (n <= 1) return 1;', '    return n * fact(n - 1);', '}', 'int main(void) {', '    int r = fact(3);', '    printf("%d\\n", r);', '}'];
  const R = 0x16fdff3ac, top = 0x16fdff390;
  const frame = (b, k, n, ret) => { const base = top - k * 32, gi = b.group('fact(' + n + ') 的栈帧 · sp = ' + ahex(base)); b.set(gi, base + 24, '返回地址', '（存的 x30）', ret); b.set(gi, base + 16, '旧帧指针', '（存的 x29）', ahex(k ? top - (k - 1) * 32 + 16 : 0x16fdff3c0)); b.set(gi, base + 12, 'n', 'int', n); return gi; };
  let b = traceBuilder(); const gm = b.group('main 的栈帧 · sp = 0x16fdff3a0');
  b.set(gm, R, 'r', 'int', '?'); b.snap(5, '程序从 main 开始，栈上只有 main 的栈帧。它要调用 fact(3)。');
  frame(b, 0, 3, 'main 第 6 行'); b.snap(0, '调用 fact(3)：栈往下长出一个新栈帧，存进“做完回到 main 第 6 行”（返回地址）、调用者的帧指针，以及参数 n = 3。');
  frame(b, 1, 2, 'fact 第 3 行'); b.snap(2, 'n = 3 不 ≤ 1，要算 3 × fact(2)，先调用 fact(2)：又叠一层。注意这一层的返回地址是“回到 fact 的第 3 行”，它有自己的 n = 2。');
  frame(b, 2, 1, 'fact 第 3 行'); b.snap(2, '同样，调用 fact(1)，叠第三层。现在栈上有四个栈帧，最上面（地址最低）的是最新的。');
  b.snap(1, 'n = 1，到终点了，返回 1。这是第一次“揭掉盘子”。');
  b.drop(3); b.snap(2, 'fact(1) 的栈帧被收回，回到 fact(2) 的第 3 行：2 × 1 = 2，返回 2。');
  b.drop(2); b.snap(2, '回到 fact(3)：3 × 2 = 6，返回 6。');
  b.drop(1); b.val(gm, R, 6); b.snap(5, '最后一个 fact 的栈帧也收回了，回到 main 第 6 行，r = 6。栈又只剩 main 的栈帧。');
  b.snap(6, '打印结果。', '6');
  const P1 = {name: '递归求阶乘', code: code1, steps: b.steps};

  const code2 = ['void dive(int n) {', '    dive(n + 1);      /* 忘了写终点 */', '}', 'int main(void) {', '    dive(1);', '}'];
  b = traceBuilder(); b.group('main 的栈帧'); b.snap(4, '调用 dive(1)。');
  for (let k = 0; k < 4; k++) { const base = top - k * 32, gi = b.group('dive(' + (k + 1) + ') · sp = ' + ahex(base)); b.set(gi, base + 24, '返回地址', '', k ? 'dive 第 2 行' : 'main 第 5 行'); b.set(gi, base + 12, 'n', 'int', k + 1); b.snap(1, k ? '又调用自己，再叠一层。sp 又往下走了 32 字节。' : '进入 dive(1)，它马上调用 dive(2)……'); }
  b.snap(1, '……就这样叠了二十几万层（8 MB ÷ 每层 32 字节 ≈ 26 万）。');
  b.snap(1, '<b style="color:var(--red)">sp 越过了栈的底线</b>，碰到了一片故意不映射的“警戒区”。系统立刻终止程序：Segmentation fault（在 Xcode 里显示 EXC_BAD_ACCESS）。这就是栈溢出。');
  const P2 = {name: '没有终点的递归', code: code2, steps: b.steps};
  memTrace(fig, [P1, P2]);
});
