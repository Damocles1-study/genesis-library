/* ---------- 第二十五章：这一行会不会进内核 ---------- */
dev('#sysFig', fig => {
  const flow = $('.sysflow', fig), say = $('.say', fig);
  const L = [
    ['x = a + b;', 0, '', '', '只用到寄存器和自己的内存，处理器在用户态一条 add 就算完了，不需要麻烦内核。'],
    ['printf("hi\\n");', 1, 'write', 'write(1, "hi\\n", 3) = 3', 'C 库先在用户态把要打印的字排好，放进一个缓冲区；输出到终端时遇到换行就调用一次 write，请内核把这 3 个字节交给终端。1 是“标准输出”。'],
    ['FILE *f = fopen("a.txt", "r");', 1, 'openat', 'openat(AT_FDCWD, "a.txt", O_RDONLY) = 3', '打开文件要检查权限、在磁盘上找到它，只有内核能做。内核返回一个小整数 3（文件描述符），以后读写都用这个号码。'],
    ['char *p = malloc(16);', 2, '（多数时候没有）', 'brk(NULL) = 0x55…　　（只在第一次或要大块时出现）', '分配器手里通常有从内核批发来的存货，直接零售，不进内核；存货不够或者要一大块时，才用 brk 或 mmap 向内核批发（第二十一章）。'],
    ['sleep(1);', 1, 'clock_nanosleep', 'clock_nanosleep(CLOCK_REALTIME, 0, {tv_sec=1, …}, …) = 0', '“让我睡一秒”是对调度的请求：内核把这个程序挂起，一秒后再叫醒（下一章）。'],
    ['pid_t id = fork();', 1, 'clone', 'clone(…, flags=…|SIGCHLD, …) = 12346', '复制出一个新进程要内核来做（下一章）。Linux 上 C 库的 fork 是用 clone 系统调用实现的。'],
    ['exit(0);', 1, 'exit_group', 'exit_group(0) = ?', '程序结束也要告诉内核，由它收回内存、关掉文件，把退出码交给父进程。“= ?” 表示这个调用不会返回。']
  ];
  function show(i){
    const [code, k, sc, st, msg] = L[i];
    const lane = (t, on, sub) => '<div class="sl' + (on ? ' on' : '') + '"><b>' + t + '</b><small>' + sub + '</small></div>';
    flow.innerHTML = '<div class="slw">' + lane('你的代码', true, esc(code)) + '<span class="sa">→</span>' + lane('C 库（用户态）', k > 0, k ? '排版、缓冲、整理参数' : '用不上') + '<span class="sa">→</span>' + lane('内核（内核态）', k === 1, k === 1 ? '系统调用：' + sc : k === 2 ? '多数时候不来' : '不来') + '</div>' +
      (st ? '<div class="dim" style="font-size:12px;margin-top:8px">Linux 上 strace 看到的（示意）</div><pre class="out">' + esc(st) + '</pre>' : '');
    say.innerHTML = msg + (k === 1 ? '<br><span class="dim" style="font-size:13px">在 macOS 的 arm64 上，C 库会把系统调用号放进 x16、参数放进 x0 起的寄存器，再执行 <code>svc #0x80</code>；Linux 上是 x8 和 <code>svc #0</code>（第三层）。</span>' : '');
  }
  btnRow($('[data-m]', fig), L.map(x => x[0].length > 18 ? x[0].slice(0, 16) + '…' : x[0]), 1, show);
  show(1);
});
