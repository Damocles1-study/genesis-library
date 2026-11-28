/* ---------- 第零章：按下 A 键以后 ---------- */
dev('#keyFig', fig => {
  const FL = [['五楼 · 应用', '备忘录、浏览器、你的程序'], ['四楼 · 系统', 'macOS'], ['三楼 · 指令', '处理器执行的指令'], ['二楼 · 电路', '键盘芯片、接口、显示电路'], ['一楼 · 开关', '晶体管、按键下的触点']];
  /* [楼层下标(0=五楼), 说明, 比特, 章] */
  const ST = [
    [4, '你按下 A 键。键帽下面两片触点碰在一起，一个开关从“关”变成“开”。', '关 → 开', 'c9'],
    [3, '键盘里的小芯片每秒把整块键盘扫描很多遍，发现“第几行第几列”接通了，查表得到 A 键的按键码。USB 键盘的标准里，A 键的码是 4。', '00000100', 'c1'],
    [3, '按键码沿着 USB 线（或者蓝牙电波），按约定的格式一位一位送进电脑。', '…0 0 0 0 0 1 0 0…', 'c2'],
    [2, '电脑里的接口电路收到数据，打断处理器手上的事（这叫“中断”），处理器跳去执行一小段专门处理键盘的指令。', '中断', 'c13'],
    [1, 'macOS 把“A 键按下”包装成一个事件，交给你正在用的那个程序（比如备忘录）。中文输入法也在这一步插一脚。', '事件：keyDown A', 'c26'],
    [0, '备忘录决定在光标的位置插入字母 a。在内存里，它记下的不是形状，而是一个编号：97。', '01100001', 'c5'],
    [1, '备忘录从字体文件里找出 a 的形状，请系统把它画成一小片像素，写进专门放画面的内存。', '像素：(R, G, B)…', 'c6'],
    [3, '显示电路每秒把画面送给屏幕几十到一百多次，屏幕上每个像素的红、绿、蓝三个小点按数字亮起来。你看见了 a。', '每秒 60—120 次', 'c6']
  ];
  const box = $('.floors', fig), say = $('.say', fig);
  box.innerHTML = FL.map((f, i) => '<div class="fl" data-i="' + i + '"><b>' + f[0] + '</b><span>' + f[1] + '<span class="bits"></span></span></div>').join('');
  let k = -1;
  const show = () => {
    $$('.fl', box).forEach((el, i) => { const on = k >= 0 && ST[k][0] === i; el.classList.toggle('on', on); $('.bits', el).textContent = on ? ST[k][2] : ''; });
    if (k < 0) { say.innerHTML = '一共 ' + ST.length + ' 步。点“下一步”开始。'; return; }
    const s = ST[k];
    say.innerHTML = '<b>第 ' + (k + 1) + ' / ' + ST.length + ' 步 · ' + FL[s[0]][0] + '</b>　' + s[1] + ' <a data-c="' + s[3] + '" href="#' + s[3] + '">（' + TOC.find(x => x.id === s[3]).t + '）</a>';
    const a = $('a[data-c]', say); if (chapPage[s[3]] > READY) { a.removeAttribute('href'); a.title = '写作中'; } else a.href = href(s[3]);
  };
  $('.btns', fig).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const d = +b.dataset.k; k = d === 0 ? -1 : clamp(k + d, -1, ST.length - 1); show(); });
  show();
});
