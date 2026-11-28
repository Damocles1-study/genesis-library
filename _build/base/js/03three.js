/* ---------- 第三部封面：内存地图 ---------- */
const MEMMAP = [
  ['栈', 'stack', '高地址，往下长', '函数里的局部变量、参数、返回地址。每调用一个函数就往下长一截（一个“栈帧”），函数返回就退回去。大小有限（主线程默认约 8 MB），递归太深会撑爆。', 'c20', 'var(--l3)'],
  ['（空着）', 'gap', '', '栈和堆中间是一大片还没用的地址。64 位的地址空间极大，这片空地远比你的内存条大，因为它们是“虚拟地址”（第二十七章）。共享库（比如 printf 所在的系统库）也映射在这一带。', 'c27', 'var(--paper-2)'],
  ['堆', 'heap', '往上长', 'malloc 借来的内存。不会随函数返回自动消失，要自己 free；忘了还就是“内存泄漏”。Python 的列表、字典也都住在堆上。', 'c21', 'var(--l2)'],
  ['未初始化数据', 'bss', '', '没给初值的全局变量和静态变量，程序启动时统一清零。文件里不用存它们的内容，只记一个大小。', 'c23', 'var(--gold)'],
  ['已初始化数据', 'data', '', '给了初值的全局变量和静态变量，比如 int count = 10;。它们的初值存在可执行文件里，加载时抄进内存。', 'c23', 'var(--gold)'],
  ['只读数据', 'rodata', '', '字符串字面量（"你好"）和 const 常量。不许写，写了程序会崩。', 'c19', 'var(--ter)'],
  ['代码', 'text', '低地址', '编译出来的机器指令，也就是第十四章看到的那些。只读、可执行。main 函数就住在这里。', 'c22', 'var(--main)']
];
dev('#mapFig', fig => {
  const box = $('.memmap', fig), say = $('.say', fig);
  box.innerHTML = MEMMAP.map((m, i) => '<button class="mm mm-' + m[1] + '" data-i="' + i + '" style="--c:' + m[5] + '"><b>' + m[0] + '</b><span>' + m[2] + '</span></button>').join('');
  const pick = i => { const m = MEMMAP[i]; $$('.mm', box).forEach(b => b.classList.toggle('on', +b.dataset.i === i)); say.innerHTML = '<b>' + m[0] + '</b>：' + m[3] + ' <a data-c="' + m[4] + '">（' + TOC.find(x => x.id === m[4]).t + '）</a>'; const a = $('a', say); if (chapPage[m[4]] > READY) a.title = '写作中'; else a.href = href(m[4]); };
  box.addEventListener('click', e => { const b = e.target.closest('.mm'); if (b) pick(+b.dataset.i); });
  pick(0);
});
