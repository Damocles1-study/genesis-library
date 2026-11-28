/* ---------- 封面：系列路线图 ---------- */
const SERIES = [
  {no: 1, k: '地基', s: '程序员眼中的一台计算机', st: '已完结', dep: [], d: '比特和数据的表示、逻辑门到处理器、C 和内存、编译链接、操作系统和网络的总图。后面每一本都会回到这里的某一章往深处挖。'},
  {no: 2, k: '链与树', s: '数据结构与算法', st: '已完结', dep: [1], d: '数组、链表、栈、队列、树、图、查找、排序、复杂度。入门层用 Python 和可视化，本科层对照 408 数据结构、配手写代码题，深入层讲工程里的实现和真实软件里的做法；主线是在小机的屏幕上做一个方格小游戏。紧接着《地基》读：写代码的本事越早练越值钱，后面的操作系统也要用到队列和树。'},
  {no: 3, k: '芯', s: '计算机组成', st: '计划', dep: [1], d: '把《地基》第二部的门、存储器、处理器、流水线、缓存挖深：数据通路、控制器、中断、总线和输入输出。对照 408 计算机组成原理。'},
  {no: 4, k: '调度', s: '操作系统', st: '计划', dep: [1, 2, 3], d: '进程和线程、调度、同步和死锁、内存管理、文件系统、输入输出。要用到组成里的中断和地址翻译、数据结构里的队列和树。对照 408 操作系统，在 Mac 上开 Linux 做实验。'},
  {no: 5, k: '包', s: '计算机网络', st: '计划', dep: [1, 4], d: '分层、链路、IP、路由、TCP、应用层，自己抓包、写一个小服务器。对照 408 计算机网络。放在最后，是因为它离硬件最远，又要用到操作系统里的套接字和进程。'},
  {no: 6, k: '算筹', s: '计算机里的数学', st: '计划', dep: [1], d: '离散数学（逻辑、集合、图、数论）、概率、线性代数，各挑计算机真正要用的部分。前几本里的“过渡”框只讲个大概，想系统补一遍就读这本；可以和第 2—5 本并行，按需查。'},
  {no: 7, k: '翻译', s: '编译原理（选修）', st: '以后', dep: [2, 3], d: '词法、语法、语义、中间代码、优化、生成汇编；自己写一个小语言的编译器。'},
  {no: 8, k: '表', s: '数据库（选修）', st: '以后', dep: [2, 4], d: '关系模型、SQL、索引（B+ 树）、事务和并发控制。'},
  {no: 0, k: '补遗', s: '系列补充说明与勘误', st: '随写随更', dep: [], d: '后来发现要补的、要改的，都收在这里；原书在对应位置只留一句指引，读过的人不用回头重读。'}
];
dev('#roadFig', fig => {
  const road = $('.road', fig), say = $('.say', fig);
  road.innerHTML = SERIES.map(b => '<button class="bk' + (b.no === 1 ? ' here' : '') + '" data-no="' + b.no + '"><span class="no">' + (b.no || '·') + '</span><span><b>《' + b.k + '》</b>' + b.s + '<span class="st">' + b.st + '</span><span class="d">' + b.d + '</span></span></button>').join('');
  const pick = no => {
    const b = SERIES.find(x => x.no === no);
    $$('.bk', road).forEach(el => { const n = +el.dataset.no, x = SERIES.find(y => y.no === n); el.classList.toggle('open', n === no); el.classList.toggle('req', b.dep.includes(n)); el.classList.toggle('dep', x.dep.includes(no)); });
    const req = b.dep.map(n => '《' + SERIES.find(x => x.no === n).k + '》'), sons = SERIES.filter(x => x.dep.includes(no)).map(x => '《' + x.k + '》');
    say.innerHTML = '<b>《' + b.k + '》</b>' + (req.length ? '先读：' + req.join('、') + '。' : '不需要先读别的书。') + (sons.length ? '它是' + sons.join('、') + '的前置。' : '');
  };
  road.addEventListener('click', e => { const el = e.target.closest('.bk'); if (el) pick(+el.dataset.no); });
  pick(1);
});
