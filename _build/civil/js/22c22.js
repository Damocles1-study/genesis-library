
/* ---------- 装置 23：传话 ---------- */
dev('#relayFig', fig => {
  const Lr = $('#rlL'), Sr = $('#rlS'), Ar = $('#rlA');
  const LV = ['基层', '科', '县', '市', '省', '部', '更上'];
  function calc(){
    const L = +Lr.value, s = +Sr.value / 100, a = +Ar.value / 100;
    $('#rlLO').textContent = L + ' 级'; $('#rlSO').textContent = Sr.value + '%'; $('#rlAO').textContent = Ar.value + '%';
    const up = [], down = [];
    let v = 100; for (let i = 0; i <= L; i++) { up.push([LV[Math.min(i, 6)] + (i === 0 ? '（实情）' : ''), v, '', i === 0 ? 'var(--red)' : 'var(--main)']); v *= (1 - s); }
    let t = 80; const top = LV[Math.min(L, 6)];
    for (let i = L; i >= 0; i--) { down.push([LV[Math.min(i, 6)] + (i === L ? '（原始要求）' : ''), t, '', i === 0 ? 'var(--red)' : 'var(--kraft)']); t = Math.min(200, t * (1 + a)); }
    bars($('#rlUp'), up, 100, x => '严重度 ' + Math.round(x));
    bars($('#rlDown'), down, 200, x => Math.round(x) + '%');
    const topSees = up[up.length - 1][1], baseGets = down[down.length - 1][1];
    const say = $('#rlSay');
    say.className = 'say ' + (topSees < 40 || baseGets > 120 ? 'bad' : 'ok');
    say.innerHTML = '基层眼里严重度 100 的问题，传到' + top + '只剩 <b>' + Math.round(topSees) + '</b>；' + top + '要求完成 80%，传到基层变成 <b>' + Math.round(baseGets) + '%</b>' + (baseGets >= 100 ? '，超过了百分之百，只能靠“报数字”完成' : '') + '。' +
      (L >= 5 && s >= 0.2 ? '<br>级数一多，哪怕每一级只“润色”一点点，到顶上就面目全非了。这就是为什么很多组织要设专门的直报渠道、搞“四不两直”式的暗访。' : '');
  }
  [Lr, Sr, Ar].forEach(x => x.addEventListener('input', calc)); calc();
});
