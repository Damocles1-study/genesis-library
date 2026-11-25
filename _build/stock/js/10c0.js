
/* ---------- 装置 1：拆一张交割单 ---------- */
dev('#slipFig', fig => {
  const slip = $('#slSlip'), kvb = $('#slKv'), say = $('#slSay'), mn = $('#slMin');
  const f2 = x => x.toFixed(2).padStart(10);
  let P, Nh, C, G, T;
  function draw(){
    if (P == null) return;
    const sh = Nh * 100, buyAmt = P * sh, sellP = Math.round(P * (1 + G / 100) * 100) / 100, sellAmt = sellP * sh, c = C / 1e4;
    const com = a => mn.checked ? Math.max(5, a * c) : a * c;
    const bCom = com(buyAmt), bTr = buyAmt * 1e-5, sCom = com(sellAmt), sTr = sellAmt * 1e-5, sTax = sellAmt * 5e-4;
    const fee = bCom + bTr + sCom + sTr + sTax, feeR = fee / buyAmt;
    const pnl = sellAmt - buyAmt - fee;
    // 回本需要的涨幅（二分）
    let lo = 0, hi = 0.2; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2, sa = P * (1 + m) * sh; (sa - buyAmt - bCom - bTr - com(sa) - sa * 1e-5 - sa * 5e-4 > 0) ? hi = m : lo = m; }
    slip.textContent =
      '成交日期    业务     数量      成交价      成交金额\n' +
      '----------------------------------------------------\n' +
      'T 日        买入   ' + String(sh).padStart(6) + '  ' + P.toFixed(2).padStart(9) + '  ' + f2(buyAmt) + '\n' +
      '              佣金                        ' + f2(bCom) + '\n' +
      '              过户费                      ' + f2(bTr) + '\n' +
      'T+n 日      卖出   ' + String(sh).padStart(6) + '  ' + sellP.toFixed(2).padStart(9) + '  ' + f2(sellAmt) + '\n' +
      '              佣金                        ' + f2(sCom) + '\n' +
      '              过户费                      ' + f2(sTr) + '\n' +
      '              印花税                      ' + f2(sTax) + '\n' +
      '----------------------------------------------------\n' +
      '              费用合计                    ' + f2(fee) + '\n' +
      '              净盈亏                      ' + f2(pnl);
    const yearDrag = Math.pow(1 - feeR, T) - 1;
    kv(kvb, [['一来一回的费用', fee.toFixed(2) + ' 元'], ['占本金', (feeR * 100).toFixed(2) + '%'], ['回本要涨', (hi * 100).toFixed(2) + '%'], ['一年 ' + T + ' 次，费用吃掉', '<span class="dn">' + (yearDrag * 100).toFixed(1) + '%</span>']]);
    let s;
    if (mn.checked && bCom === 5 && buyAmt * c < 5) s = '这笔买卖太小，佣金被“最低五元”抬高了：本来按费率只要 ' + (buyAmt * c).toFixed(2) + ' 元。小额、频繁的交易，费用占比会高得吓人。';
    else if (feeR < 0.002) s = '一来一回的费用只占本金的千分之 ' + (feeR * 1000).toFixed(1) + '，单看一次几乎可以忽略。';
    else s = '一来一回的费用占本金的 ' + (feeR * 100).toFixed(2) + '%。';
    s += ' 但费用是每次都收的：如果一年像这样来回 ' + T + ' 次，光费用就让本金缩水 ' + (-yearDrag * 100).toFixed(1) + '%，你选的股票得先跑赢这一截。';
    say.textContent = s;
  }
  let ready = false;
  const go = () => { if (!ready) return; P = gP(); Nh = gN(); C = gC(); G = gG(); T = gT(); draw(); };
  const gP = slider('slP', v => v.toFixed(2) + ' 元', go);
  const gN = slider('slN', v => v + ' 手（' + v * 100 + ' 股）', go);
  const gC = slider('slC', v => '万分之 ' + v, go);
  const gG = slider('slG', v => (v > 0 ? '+' : '') + v + '%', go);
  const gT = slider('slT', v => v + ' 次', go);
  mn.addEventListener('change', go);
  ready = true; go();
});
