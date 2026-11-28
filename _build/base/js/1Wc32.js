/* ---------- 尾声：按下回车以后 ---------- */
dev('#enterFig', fig => {
  const fl = $('.enfl', fig), stepEl = $('.enstep', fig), say = $('.say', fig);
  const FL = ['楼外 · 网络', '五楼 · 应用', '四楼 · 系统', '三楼 · 指令', '二楼 · 电路', '一楼 · 开关'];
  /* [楼层下标, 标题, 说明, 章节们] */
  const ST = [
    [5, '回车键的开关合上', '键帽下的触点接通，键盘芯片扫描到它，把按键码按 USB 或蓝牙的格式一位一位送进电脑。', ['c1', 'c9']],
    [2, '中断', '接口电路打断处理器，内核的中断处理程序收下这个按键，变成一个事件。', ['c25']],
    [1, '浏览器收到事件', '浏览器是一个（其实是好几个）进程，它的界面线程收到“按下回车”，读出地址栏里的字符（UTF-8 编码），解析出协议 https、域名 www.apple.com、路径 /。', ['c26', 'c5']],
    [0, '查 DNS', '先看缓存；没有的话，通过 UDP 53 号端口问 DNS 服务器，一路问到负责 apple.com 的服务器，得到一个 IP 地址。', ['c31']],
    [2, '系统调用：建立连接', '浏览器调用 socket、connect，请内核建立到那个 IP 的 443 号端口的连接。', ['c25']],
    [0, 'TCP 三次握手，TLS 握手', 'SYN、SYN + ACK、ACK；接着 TLS：服务器出示证书，双方协商出加密用的密钥。', ['c31']],
    [1, '发出 HTTP 请求', '浏览器写好请求“GET / HTTP/2 ……”，交给内核。', ['c30']],
    [2, '一层一层套信封', '内核的网络协议栈加上 TCP 首部、IP 首部，网卡驱动再加上链路层的首部和 CRC。', ['c30', 'c8']],
    [4, '变成无线电波', 'Wi-Fi 芯片把比特变成电磁波；每个符号带几个比特，受噪声和带宽的限制。', ['c1', 'c6']],
    [0, '路由器一站一站转', '家里的路由器把私有地址换成公网地址（NAT），之后每个路由器按目的 IP 查表、往下一站转，可能穿过海底光缆。', ['c31', 'c30']],
    [2, '服务器那边', '服务器的网卡收到包、内核拆开信封交给服务进程；服务进程的某个线程（加着锁）从文件系统或缓存里拿出网页，写回去。', ['c26', 'c28', 'c29']],
    [0, '回来的包', '网页被切成很多包回来，TCP 按序号排好、确认、丢了就重传，拥塞控制决定发多快。', ['c31']],
    [1, '解析网页', '浏览器解析 HTML 和 CSS，在堆上建起几万个对象；用到的内存页第一次被碰到时，内核才分配页框。', ['c21', 'c27']],
    [3, '执行 JavaScript', '脚本先被解释执行，常用的部分被即时编译成 arm64 机器指令（要遵守 W^X），在流水线上乱序执行，数据尽量待在缓存里。', ['c13', 'c14', 'c15', 'c16']],
    [1, '解码图片、排版文字', 'JPEG、PNG 解码成像素；字体的轮廓被光栅化成带抗锯齿的像素。', ['c6']],
    [4, '画到屏幕上', 'GPU 把像素写进帧缓冲，显示电路每秒刷新几十到一百多次，几百万个像素的红绿蓝小点按数字亮起来。网页出现了。', ['c6', 'c0']]
  ];
  fl.innerHTML = FL.map((f, i) => '<div class="fl" data-i="' + i + '"><b>' + f + '</b><span></span></div>').join('');
  let k = -1;
  function show(){
    $$('.fl', fl).forEach((el, i) => el.classList.toggle('on', k >= 0 && ST[k][0] === i));
    if (k < 0) { stepEl.innerHTML = '<p class="dim">一共 ' + ST.length + ' 步。点“下一步”，按下回车。</p>'; say.textContent = ''; return; }
    const s = ST[k];
    stepEl.innerHTML = '<div class="dim" style="font-size:12px">第 ' + (k + 1) + ' / ' + ST.length + ' 步 · ' + FL[s[0]] + '</div><h4 style="margin:.2em 0">' + s[1] + '</h4><p style="margin:0;font-size:15px">' + s[2] + '</p>';
    say.innerHTML = '复习：' + s[3].map(id => { const t = TOC.find(x => x.id === id); return '<a href="' + href(id) + '">' + t.n + ' · ' + t.t + '</a>'; }).join('　');
  }
  $('.btns', fig).addEventListener('click', e => { const b = e.target.closest('button[data-d]'); if (!b) return; const d = +b.dataset.d; k = d === 0 ? -1 : clamp(k + d, -1, ST.length - 1); show(); });
  show();
});
