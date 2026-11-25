/* ---------- 装置 20：一扇窗的热账 ---------- */
dev('#winFig', () => {
  const GL = [['单层玻璃', 5.8], ['普通中空', 2.8], ['低辐射中空', 1.8], ['三层玻璃', 1.0]];
  const CITY = [['哈尔滨', 5000], ['北京', 2700], ['上海', 1600], ['广州', 350]]; // 采暖度日数（18 °C），约数
  const UW = 0.45, AREA = 15, PRICE = 0.55;
  let g = 0, c = 1;
  btnRow($('#winBtns'), GL.map(x => x[0]), g, i => { g = i; draw(); });
  btnRow($('#winCity'), CITY.map(x => x[0]), c, i => { c = i; draw(); });
  const R = slider('winR', v => v + '%', () => draw());
  function loss(u, a){ return u * a * CITY[c][1] * 24 / 1000; } // 千瓦时
  function draw(){
    const r = R() / 100, Aw = AREA * r, Am = AREA - Aw;
    const qw = loss(GL[g][1], Aw), qm = loss(UW, Am), q = qw + qm;
    const q0 = loss(UW, AREA);
    const W = 600, H = 200;
    let s = '';
    /* 墙：5 m × 3 m，按比例画 */
    const wx = 20, wy = 20, ww = 250, wh = 150;
    s += '<rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" fill="var(--paper-2)" stroke="var(--ink-2)"/>';
    const fw = ww * Math.sqrt(r) * 0.98, fh = wh * Math.sqrt(r) * 0.98;
    const fx = wx + (ww - fw) / 2, fy = wy + (wh - fh) / 2;
    s += '<rect x="' + fx + '" y="' + fy + '" width="' + fw + '" height="' + fh + '" fill="var(--sea)" stroke="var(--main)" stroke-width="2"/>';
    for (let i = 1; i < 3; i++) s += '<line x1="' + (fx + fw * i / 3) + '" x2="' + (fx + fw * i / 3) + '" y1="' + fy + '" y2="' + (fy + fh) + '" stroke="var(--main)" stroke-width="' + (g + 1) + '"/>';
    s += txt(wx + ww / 2, wy + wh + 20, '一面 5 × 3 米的外墙', {s: 11, c: 'var(--ink-3)', halo: false});
    /* 热流横条 */
    const bx = 310, bw = 270, mx = Math.max(loss(5.8, AREA * 0.95) + loss(UW, AREA * 0.05), 1);
    const bar = (y, v, col, lab) => '<rect x="' + bx + '" y="' + y + '" width="' + Math.max(1, v / mx * bw) + '" height="22" rx="3" fill="' + col + '"/>' + txt(bx, y - 5, lab + '：' + Math.round(v) + ' 度', {s: 11.5, a: 'start', c: 'var(--ink-2)', halo: false});
    s += bar(40, qw, 'var(--red)', '窗漏掉');
    s += bar(95, qm, 'var(--och)', '墙漏掉');
    s += bar(150, q0, 'var(--grn)', '如果整面都是墙');
    const svg = $('#winSvg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = s;
    kv($('#winKv'), [['一个冬天漏掉', Math.round(q) + ' 度'], ['窗占了', Math.round(qw / q * 100) + '%'], ['电暖器补，电费约', Math.round(q * PRICE) + ' 元'], ['空调热泵补，电费约', Math.round(q * PRICE / 3) + ' 元']]);
    const say = $('#winSay');
    say.className = 'say' + (qw / q > 0.8 ? ' bad' : qw / q < 0.5 ? ' ok' : '');
    say.innerHTML = c === 3 ? '广州几乎不用采暖，冬天这笔账很小；那里的窗户要算的是夏天：大玻璃把太阳的热放进屋，空调得把它再搬出去。<b>南方的窗，遮阳比保温要紧</b>。' :
      '窗只占这面墙的 ' + Math.round(r * 100) + '%，却漏掉了 ' + Math.round(qw / q * 100) + '% 的热。' +
      (g === 0 ? '单层玻璃几乎不挡热，<b>同样面积的单层窗，漏热是保温墙的十几倍</b>。' : g === 3 ? '三层玻璃已经把窗的漏热压得很低，北欧和中国北方的超低能耗房子用的就是它。' : '换成更好的玻璃，或者把窗开小一点，都能省下一大截。') +
      (r > 0.6 ? '整面玻璃的房子，冬天要靠更多的暖气来补。' : '');
  }
  draw();
});
