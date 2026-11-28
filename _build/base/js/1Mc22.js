/* ---------- 第二十二章：一个程序的四步 ---------- */
dev('#buildFig', fig => {
  const src = $('.bfsrc', fig), out = $('.bfout', fig), say = $('.say', fig);
  const FILES = '<div class="dim" style="font-size:12px">util.h</div><pre class="out">int square(int x);</pre><div class="dim" style="font-size:12px">util.c</div><pre class="out">#include "util.h"\nint square(int x) { return x * x; }</pre><div class="dim" style="font-size:12px">main.c</div><pre class="out">#include &lt;stdio.h&gt;\n#include "util.h"\n#define TIMES 3\nint main(void) {\n    printf("%d\\n", square(TIMES));\n    return 0;\n}</pre>';
  const ST = [
    ['源代码', '', '三个文件：util.h 只有一句声明，util.c 有 square 的定义，main.c 用到了 square 和 printf。', ''],
    ['① 预处理', '% clang -E main.c', '（前面几百行是 stdio.h 的内容）\n...\nint printf(const char * restrict, ...);\n...\n# 2 "main.c" 2\n# 1 "./util.h" 1\nint square(int x);\n# 3 "main.c" 2\n\nint main(void) {\n    printf("%d\\n", square(3));\n    return 0;\n}', '#include 被替换成了文件内容，TIMES 被替换成了 3，注释没了。以 # 和数字开头的行是给编译器的“这一段来自哪个文件第几行”的记号，报错时用得上。输出仍然是 C 代码。'],
    ['② 编译', '% clang -S main.c -o main.s', '_main:\n    stp   x29, x30, [sp, #-32]!\n    mov   x29, sp\n    mov   w0, #3\n    bl    _square          ; 调用 square：地址还不知道\n    …                      ; 把结果交给 printf\n    adrp  x0, l_.str@PAGE\n    add   x0, x0, l_.str@PAGEOFF\n    bl    _printf          ; 调用 printf：地址也不知道\n    mov   w0, #0\n    ldp   x29, x30, [sp], #32\n    ret\nl_.str:\n    .asciz "%d\\n"', 'C 变成了汇编（示意，不同版本的 clang 会有差别）。<code>bl _square</code>、<code>bl _printf</code> 只写了名字，因为编译 main.c 时根本看不到它们的代码。字符串 "%d\\n" 被放进了一个只读的数据节。'],
    ['③ 汇编', '% clang -c main.c util.c\n% nm main.o util.o', 'main.o:\n0000000000000000 T _main\n                 U _printf\n                 U _square\n\nutil.o:\n0000000000000000 T _square', '汇编变成了机器码，存进 main.o 和 util.o。nm 列出符号表：main.o 定义了 _main（T），却用到了两个它没有的符号 _printf 和 _square（U）。两个文件的地址都从 0 开始，因为还没排在一起。'],
    ['④ 链接', '% clang main.o util.o -o prog\n% nm prog\n% otool -L prog\n% ./prog', '0000000100000000 T __mh_execute_header\n0000000100003f50 T _main\n                 U _printf\n0000000100003f90 T _square\n\nprog:\n    /usr/lib/libSystem.B.dylib (…)\n\n9', '链接器把 main.o 和 util.o 排进同一个文件，给 _main、_square 分配了地址（示意），把 bl _square 里空着的地址填好。_printf 仍然是 U：它在系统的动态库 libSystem 里，要等程序运行时由 dyld 接上（下一章）。'],
    ['忘了链接 util.o', '% clang main.o -o prog', 'Undefined symbols for architecture arm64:\n  "_square", referenced from:\n      _main in main.o\nld: symbol(s) not found for architecture arm64\nclang: error: linker command failed with exit code 1', '链接器找遍你给的文件和系统库，没有一个定义 _square，只好报错。这不是语法错误，编译早就通过了；是“拼图少了一块”。解决：把 util.o 加上，或者检查函数名拼写、头文件里的声明和定义是否一致。']
  ];
  function show(i){
    const s = ST[i];
    src.innerHTML = FILES;
    out.innerHTML = i ? '<div class="dim" style="font-size:12px">命令</div><pre class="sh">' + esc(s[1]) + '</pre><div class="dim" style="font-size:12px">输出（示意）</div><pre class="out">' + esc(s[2]) + '</pre>' : '<p class="dim" style="font-size:14px">点上面的“① 预处理”开始。</p>';
    say.innerHTML = s[3] || s[2];
  }
  btnRow($('[data-m]', fig), ST.map(s => s[0]), 0, show);
  show(0);
});
