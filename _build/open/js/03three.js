/* ---------- 第三部封面装置：用哪种身份做生意 ---------- */
dev('#formFig', fig => {
  const qs = $('#fmQs'), out = $('#fmOut');
  const Q = [
    ['你现在在编制里，或者是公务员吗？', ['是', '不是']],
    ['收入是零星的几单，还是已经稳定、每个月都有？', ['零星的几单', '已经稳定']],
    ['客户要不要你开发票、签正式合同，或者你要开商户号收款？', ['不要', '要']],
    ['有没有合伙人，或者打算拿别人的投资？', ['没有，就我一个', '有']],
    ['生意会不会欠下大额的钱：大额进货、长租约、大合同的违约责任、雇好几个人？', ['不会，都是小额', '可能会']]
  ];
  const a = Q.map(() => null);
  const ch = (id, t) => '<a data-c="' + id + '" href="' + href(id) + '">' + t + '</a>';
  function render(){
    qs.innerHTML = Q.map((q, i) => '<div class="q' + (i > 0 && a[0] === 0 ? ' off' : '') + '"><p><b>' + (i + 1) + '.</b> ' + q[0] + '</p><div class="btns">' + q[1].map((o, j) => '<button class="btn' + (a[i] === j ? ' on' : '') + '" data-i="' + i + '" data-j="' + j + '">' + o + '</button>').join('') + '</div></div>').join('');
    let r = null;
    if (a[0] === 0) r = ['先别登记', '在编和公务员一般不能经商办企业（第十三章）。这时候的问题不是选哪种身份，而是先弄清你所在单位的规定；想做生意，要先想清楚是不是离开这个系统。', ['c13']];
    else if (a.every(x => x != null)) {
      if (a[3] === 1) r = ['有限责任公司', '有合伙人或者外部投资，用有限公司把每个人出多少、占多少、怎么退出写进章程；别用普通合伙（第八章）。注册资本按实际能缴的写，五年内要缴足。签字时留意个人担保和回购条款。', ['c18', 'c21', 'c8']];
      else if (a[4] === 1) r = ['一人有限责任公司', '一个人做、但可能欠下大额的钱，有限责任这道墙有用。前提是公司的账和你自己的账必须分得清清楚楚：一人公司的股东要证明公司财产独立于自己，否则要对公司的债务承担连带责任。', ['c18', 'c17']];
      else if (a[1] === 1 || a[2] === 1) r = ['个体工商户', '一个人、小额、收入稳定，或者要开票收款：个体户登记简单，可以开发票、开商户号，税收上常有优惠和核定的办法，注销也容易。记住它没有有限责任：债务由个人或家庭财产承担，所以别让它欠大钱。', ['c19', 'c2', 'c18']];
      else r = ['先不登记', '零星的几单、自己的手艺，按法律的零星小额和便民劳务豁免，可以先不办执照；对方付你的钱按劳务报酬，由付款方代扣个税或者你自己申报。等收入稳定、要开票收款时再办。准备考试的人，办之前先看公告（第十三章）。', ['c15', 'c19', 'c13']];
    }
    if (r) {
      out.innerHTML = '<div class="road"><h5>' + r[0] + '</h5><p style="margin:0 0 .4em;text-indent:0">' + r[1] + '</p><div class="trail">' + r[2].map(id => { const t = TOC.find(x => x.id === id); return '<span>' + ch(id, t.n + ' · ' + t.t) + '</span>'; }).join('') + '</div></div>';
      $$('a[data-c]', out).forEach(x => { if (chapPage[x.dataset.c] > READY) { x.removeAttribute('href'); x.title = '写作中'; } });
    } else out.innerHTML = '<div class="say">' + (a.some(x => x != null) ? '接着回答。' : '从第一个问题回答起。') + '</div>';
  }
  qs.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; a[+b.dataset.i] = +b.dataset.j; render(); });
  render();
});
