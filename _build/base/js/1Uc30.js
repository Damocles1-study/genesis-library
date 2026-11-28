/* ---------- 第三十章：一层一层套信封 ---------- */
dev('#encapFig', fig => {
  const inp = $('#ecIn'), box = $('.encap', fig), out = $('.kv', fig), say = $('.say', fig);
  const L = [
    ['应用层', 0, 0, '', '你的程序（比如聊天 App）把要说的话交给系统。这一层的“首部”由应用自己约定，这里先不算。'],
    ['传输层 · TCP 首部', 20, 0, '源端口 52341　目的端口 443　序号 1001　确认号 7731　标志 ACK PSH　窗口 65535　校验和', 'TCP 加上 20 字节的首部：端口号说明交给对方电脑上的哪个程序，序号用来把包排好顺序、发现丢了哪个（下一章）。'],
    ['网络层 · IP 首部', 20, 0, '版本 4　首部长 20　总长度　TTL 64　协议 TCP　源 IP 192.168.1.23　目的 IP 17.253.144.10', 'IP 再加 20 字节：写着发件人和收件人的 IP 地址。TTL 每过一个路由器减 1，减到 0 就丢掉，防止包在网络里兜圈子（traceroute 正是利用它）。'],
    ['链路层 · 以太网帧', 14, 4, '目的 MAC 3c:22:fb:00:aa:01（你家路由器）　源 MAC a4:83:e7:12:34:56（你的 Mac）　类型 IPv4 …… 尾部：CRC-32 校验', '链路层加 14 字节的首部和 4 字节的尾部：MAC 地址只管“这一段”从谁到谁（你的 Mac 到路由器），每过一个路由器就换一次；尾部是第八章的 CRC，收方用它检查这一帧有没有被噪声打坏。（Wi-Fi 的帧首部更长，这里按以太网算。）'],
    ['物理层 · 比特', 0, 0, '', '最后整帧变成一串比特，变成网线上的电压、光纤里的光或者 Wi-Fi 的无线电波（第一章、第六章）。Wi-Fi 和以太网在前面还会加一段用来同步的“前导码”。']
  ];
  let k = 0;
  function draw(){
    const data = new TextEncoder().encode(inp.value || ' '), n = data.length;
    let hdr = 0, tl = 0; for (let i = 1; i <= Math.min(k, 3); i++) { hdr += L[i][1]; tl += L[i][2]; }
    let inner = '<div class="ec data"><b>数据</b><span>“' + esc(inp.value) + '”　' + n + ' 字节</span></div>';
    for (let i = 1; i <= Math.min(k, 3); i++) inner = '<div class="ec l' + i + '"><div class="eh"><b>' + L[i][0] + '（' + L[i][1] + ' 字节）</b><small>' + L[i][3] + '</small></div>' + inner + (L[i][2] ? '<div class="et">尾部 ' + L[i][2] + ' 字节</div>' : '') + '</div>';
    if (k === 4) { const frame = new Uint8Array(14 + 20 + 20 + n + 4); for (let i = 0; i < frame.length; i++) frame[i] = i < 54 ? (i * 37 + 11) & 255 : i < 54 + n ? data[i - 54] : 0xA5; inner += '<div class="ec bits"><b>物理层发出的比特（开头一段）</b><code>' + [...frame.slice(0, 8)].map(b => bin(b, 8)).join(' ') + ' …</code></div>'; }
    box.innerHTML = inner;
    const total = n + hdr + tl;
    kv(out, [['现在在', L[k][0].split(' · ')[0]], ['数据', n + ' 字节'], ['加上的首部和尾部', hdr + tl + ' 字节'], ['一共', total + ' 字节'], ['数据占', (n / total * 100).toFixed(0) + '%']]);
    say.innerHTML = L[k][4];
  }
  $('.btns', fig).addEventListener('click', e => { const b = e.target.closest('button[data-d]'); if (!b) return; const d = +b.dataset.d; k = d === 0 ? 0 : clamp(k + d, 0, 4); draw(); });
  inp.addEventListener('input', draw);
  draw();
});
