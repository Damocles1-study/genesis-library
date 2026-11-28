/* ---------- 第三十一章 ---------- */
dev('#subnetFig', fig => {
  const ipIn = $('#snIP'), nIn = $('#snN'), ip2In = $('#snIP2'), bits = $('.snbits', fig), out = $('.kv', fig), say = $('.say', fig);
  const parse = s => { const m = String(s).trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/); if (!m) return null; const a = m.slice(1).map(Number); if (a.some(x => x > 255)) return null; return ((a[0] << 24) >>> 0) + (a[1] << 16) + (a[2] << 8) + a[3]; };
  const dot = v => [24, 16, 8, 0].map(s => (v >>> s) & 255).join('.');
  function go(){
    const ip = parse(ipIn.value), n = Math.max(0, Math.min(32, parseInt(nIn.value, 10) || 0));
    if (ip === null) { bits.innerHTML = ''; out.innerHTML = ''; say.textContent = '请输入形如 192.168.1.23 的 IPv4 地址。'; return; }
    const mask = n ? (0xFFFFFFFF << (32 - n)) >>> 0 : 0, net = (ip & mask) >>> 0, bc = (net | (~mask >>> 0)) >>> 0;
    const b = bin(ip, 32), mb = bin(mask, 32);
    const show = (lab, s, cut) => '<div class="snr"><span>' + lab + '</span><code>' + s.split('').map((c, i) => (i && i % 8 === 0 ? '.' : '') + '<i class="' + (i < cut ? 'nw' : 'ho') + '">' + c + '</i>').join('') + '</code></div>';
    bits.innerHTML = show('IP', b, n) + show('掩码', mb, n) + show('网络地址', bin(net, 32), n);
    const hosts = n >= 31 ? (n === 31 ? 2 : 1) : 2 ** (32 - n) - 2;
    kv(out, [['子网掩码', dot(mask)], ['网络地址', dot(net) + '/' + n], ['广播地址', dot(bc)], ['可用主机', n >= 31 ? '（特殊情况）' : dot(net + 1) + ' — ' + dot(bc - 1)], ['可用主机数', hosts.toLocaleString()]]);
    let m = '蓝色是网络号（前 ' + n + ' 位），灰色是主机号。IP 和掩码按位与，就把主机号清成了 0，得到网络地址；主机号全置 1 就是广播地址。';
    const ip2 = parse(ip2In.value);
    if (ip2 !== null) { const same = ((ip2 & mask) >>> 0) === net; m += '<br>' + ip2In.value + ' 的网络号是 ' + dot((ip2 & mask) >>> 0) + '，' + (same ? '<b>和第一个在同一个子网</b>，可以直接通信（链路层用 ARP 找到对方的 MAC 就行）。' : '<b style="color:var(--red)">不在同一个子网</b>，要先把包交给路由器（默认网关）转发。'); }
    say.innerHTML = m;
  }
  [ipIn, nIn, ip2In].forEach(el => el.addEventListener('input', go));
  go();
});

dev('#tcpFig', fig => {
  const svg = $('svg', fig), say = $('.say', fig);
  const M = [
    ['c', 'SYN', 'seq = 1000', '客户端想建立连接，发 SYN，随机选一个初始序号 1000。'],
    ['s', 'SYN + ACK', 'seq = 5000, ack = 1001', '服务器同意，也选自己的初始序号 5000；ack = 1001 表示“1000 号我收到了，下一个要 1001”（SYN 占一个序号）。'],
    ['c', 'ACK', 'seq = 1001, ack = 5001', '客户端确认服务器的 SYN。三次握手完成，双方都知道对方能收能发、也知道了对方的起始序号。'],
    ['c', '数据 100 字节', 'seq = 1001, ack = 5001', '客户端发 100 字节数据（比如一个网页请求），这些字节的编号是 1001 到 1100。'],
    ['s', 'ACK（加 300 字节数据）', 'seq = 5001, ack = 1101', '服务器确认收到 1100 及以前的所有字节（ack = 1101），顺便带上 300 字节的回复，编号 5001 到 5300。'],
    ['c', 'FIN', 'seq = 1101, ack = 5301', '客户端说完了，发 FIN（同样占一个序号）。ack = 5301 确认收到了服务器的 300 字节。'],
    ['s', 'ACK', 'seq = 5301, ack = 1102', '服务器确认客户端的 FIN。现在客户端到服务器这个方向关闭了，但服务器还可以继续发数据（半关闭）。'],
    ['s', 'FIN', 'seq = 5301, ack = 1102', '服务器也发完了，发 FIN。'],
    ['c', 'ACK', 'seq = 1102, ack = 5302', '客户端确认，然后进入 TIME_WAIT，等两倍的报文最长寿命（2MSL）才真正关闭，以防这个 ACK 丢了、服务器重发 FIN 时没人回应。']
  ];
  let k = 0;
  function draw(){
    let h = '<line x1="90" y1="40" x2="90" y2="320" stroke="var(--ink-3)" stroke-width="2"/><line x1="470" y1="40" x2="470" y2="320" stroke="var(--ink-3)" stroke-width="2"/>' + txt(90, 26, '客户端', {s: 14, w: true}) + txt(470, 26, '服务器', {s: 14, w: true});
    h += '<defs><marker id="ta" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="var(--main)"/></marker><marker id="tb" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="var(--rule)"/></marker></defs>';
    M.forEach((m, i) => {
      if (i > k) return; const y = 50 + i * 30, cur = i === k, c = m[0] === 'c';
      h += '<line x1="' + (c ? 92 : 468) + '" y1="' + y + '" x2="' + (c ? 466 : 94) + '" y2="' + (y + 22) + '" stroke="' + (cur ? 'var(--main)' : 'var(--rule)') + '" stroke-width="' + (cur ? 2.5 : 1.5) + '" marker-end="url(#' + (cur ? 'ta' : 'tb') + ')"/>';
      h += txt(280, y + 6, m[1] + '　' + m[2], {s: 11.5, c: cur ? 'var(--ink)' : 'var(--ink-3)', w: cur});
    });
    const st = k <= 1 ? '握手中' : k <= 4 ? '已建立连接' : k <= 7 ? '挥手中' : 'TIME_WAIT';
    h += txt(40, 300, '', {s: 1}) + txt(280, 322, '状态：' + st, {s: 12, c: 'var(--ter)'});
    svg.innerHTML = h;
    say.innerHTML = '<b>第 ' + (k + 1) + ' / ' + M.length + ' 步</b>　' + M[k][3];
  }
  $('.btns', fig).addEventListener('click', e => { const b = e.target.closest('button[data-d]'); if (!b) return; const d = +b.dataset.d; k = d === 0 ? 0 : clamp(k + d, 0, M.length - 1); draw(); });
  draw();
});
