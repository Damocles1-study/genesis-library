
/* ---------- 装置 19：工资、查处和诱惑 ---------- */
dev('#payFig', fig => {
  const Wr = $('#payW'), Pr = $('#payP'), Br = $('#payB');
  const r = rng(1974);
  const greed = Array.from({length: 1000}, () => { const u = r(); return u < 0.25 ? 0 : Math.pow(r(), 0.7) * 3; }); // 四分之一天性正直，从不伸手
  function calc(){
    const w = +Wr.value / 100, p = +Pr.value / 100, b = +Br.value / 100;
    $('#payWO').textContent = Wr.value + '%'; $('#payPO').textContent = Pr.value + '%'; $('#payBO').textContent = Br.value + '% 年薪';
    // 被抓的损失：未来几年的工资溢价（相对去私营部门的差额，最低为 0）+ 罚没（按三年工资计）+ 名声
    const loss = Math.max(0, w - 1) * 3 + w * 0.3 + 0.2;
    const corrupt = greed.filter(g => g > 0 && b * g > p * loss).length;
    // 低工资时，体面的人会离开或去兼差，留下的人里贪心的比例上升
    const talent = clamp(Math.round(100 / (1 + Math.exp(-(w - 0.9) * 5))), 2, 98);
    bars($('#payBars'), [['会伸手的官员', corrupt / 10, '一千人中', 'var(--red)'], ['愿意进来的顶尖毕业生', talent, '相对比例', 'var(--grn)']], 100, v => Math.round(v) + '%');
    const s = $('#paySay');
    s.className = 'say ' + (corrupt > 400 ? 'bad' : corrupt < 150 && talent > 50 ? 'ok' : '');
    s.innerHTML = p === 0 ? '<b>查处概率为零</b>：不管工资多高，只要有人送钱、又不会被抓，贪心的人都会伸手。高薪在这里只是让他们多拿一份。' :
      w < 0.8 && p >= 0.25 ? '查得很严，可工资只有私营部门的' + Wr.value + '%：伸手的人少了，<b>可最能干的人也不来了</b>，或者干几年就走。这接近很多国家公务员“清苦”的状态。' :
      w >= 1.2 && p >= 0.15 ? '工资有竞争力，查处概率也高：伸手划不来，顶尖人才也愿意来。<b>这才是新加坡模式的完整版本</b>，两样缺一不可，而且贵。' :
      '试试把查处概率拖到零，再把工资拖到最高；然后反过来。看看哪一个滑块对“伸手”的影响更大。';
  }
  [Wr, Pr, Br].forEach(x => x.addEventListener('input', calc)); calc();
});
