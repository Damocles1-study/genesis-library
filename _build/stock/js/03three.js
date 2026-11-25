
/* ---------- 第三部封面装置：一辈子挣的钱，分给了谁 ---------- */
dev('#lifeFig', fig => {
  const box = $('#lfBars'), say = $('#lfSay');
  let ready = false;
  function go(){
    if (!ready) return;
    const W = gW() * 12, g = gG() / 100, Y = gY(), H = gH() * 1e4, C = gC() * 1e4, E = gE() / 100;
    let inc = 0, w = W; for (let y = 0; y < Y; y++) { inc += w; w *= 1 + g; }
    const daily = inc * E, house = H * 1.3, car = C * Y, left = inc - daily - house - car;
    bars(box, [['一辈子到手', inc, Y + ' 年', 'var(--ink-3)'], ['日常开销', daily, Math.round(E * 100) + '%', 'var(--och)'], ['一套房（含利息）', house, Math.round(house / inc * 100) + '%', 'var(--up)'], ['一辈子养车', car, Math.round(car / inc * 100) + '%', 'var(--blu)'], ['剩下', Math.max(0, left), left < 0 ? '不够' : Math.round(left / inc * 100) + '%', left < 0 ? 'var(--dn)' : 'var(--grn)']], inc, v => fmt(v));
    let s = '按这组数，一辈子到手约 ' + yuan(inc) + '。一套房（加上利息）吃掉其中的 ' + Math.round(house / inc * 100) + '%，相当于 ' + (house / (W * 1)).toFixed(0) + ' 年的起始工资；一辈子养车吃掉 ' + Math.round(car / inc * 100) + '%。';
    s += left >= 0 ? ' 剩下约 ' + yuan(left) + '，是你养老、看病、给孩子、去看世界、留给自己自由的全部本钱。' : ' 钱不够了：要么开销降下来，要么房和车选小一点，要么收入要涨得更快。这正是很多人觉得“压力大”的那笔账。';
    s += ' 第三部要问的，就是剩下的那一截和前面几截之间，怎样分才不后悔。';
    say.textContent = s;
  }
  const gW = slider('lfW', v => v.toLocaleString() + ' 元', go), gG = slider('lfG', v => v + '%', go), gY = slider('lfY', v => v + ' 年', go), gH = slider('lfH', v => v ? v + ' 万' : '不买', go), gC = slider('lfC', v => v ? v + ' 万' : '不养车', go), gE = slider('lfE', v => v + '%', go);
  ready = true; go();
});
