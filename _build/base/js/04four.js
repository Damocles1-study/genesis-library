/* ---------- 第四部封面：四楼在管什么 ---------- */
const OSMAP = [
  ['apps', '五楼 · 应用', '浏览器、音乐、终端、你写的程序……它们只能在“用户态”运行，想碰硬件必须请操作系统帮忙。', 'c25'],
  ['sys', '系统调用', '程序和操作系统之间的一扇窗口：“帮我读这个文件”“帮我开一个网络连接”“给我一块内存”。', 'c25'],
  ['proc', '进程和调度', '谁现在用处理器、用多久、下一个轮到谁。', 'c26'],
  ['mem', '虚拟内存', '给每个程序一张自己的地址空间，翻译成真正的物理内存，不够了就换到磁盘。', 'c27'],
  ['fs', '文件系统', '把磁盘上的一块块数据组织成文件和文件夹。', 'c28'],
  ['sync', '并发', '几个程序（或线程）同时改同一样东西时，怎样不乱。', 'c29'],
  ['net', '网络', '把比特打包，通过网卡送出这栋楼，送到另一台电脑。', 'c30'],
  ['hw', '三楼以下 · 硬件', '处理器、内存、硬盘、网卡、键盘屏幕（第二部）。只有内核能直接指挥它们。', 'c25']
];
dev('#osFig', fig => {
  const box = $('.osmap', fig), say = $('.say', fig);
  const btn = i => '<button class="om om-' + OSMAP[i][0] + '" data-i="' + i + '"><b>' + OSMAP[i][1] + '</b></button>';
  box.innerHTML = btn(0) + btn(1) + '<div class="omk"><div class="omkh">四楼 · 操作系统内核</div><div class="omg">' + [2, 3, 4, 5, 6].map(btn).join('') + '</div></div>' + btn(7);
  const pick = i => { const m = OSMAP[i]; $$('.om', box).forEach(b => b.classList.toggle('on', +b.dataset.i === i)); say.innerHTML = '<b>' + m[1] + '</b>：' + m[2] + ' <a>（' + TOC.find(x => x.id === m[3]).t + '）</a>'; const a = $('a', say); if (chapPage[m[3]] <= READY) a.href = href(m[3]); };
  box.addEventListener('click', e => { const b = e.target.closest('.om'); if (b) pick(+b.dataset.i); });
  pick(3);
});
