
/* ---------- 装置 19：一场大病的账 ---------- */
dev('#illFig', fig => {
  const box = $('#ilBars'), say = $('#ilSay');
  const cB = $('#ilB'), cD = $('#ilD'), cH = $('#ilH'), cM = $('#ilM');
  let ready = false;
  function go(){
    if (!ready) return;
    const T = gT() * 1e4, out = T * gO() / 100, inS = T - out, rate = gR() / 100;
    let basic = 0, big = 0, hui = 0, com = 0;
    if (cB.checked) basic = Math.min(200000, Math.max(0, inS - 1000) * rate);
    const selfIn = inS - basic; // 政策范围内自付
    if (cB.checked && cD.checked) big = Math.max(0, selfIn - 15000) * 0.6;
    let self = T - basic - big;
    if (cH.checked) { hui = Math.max(0, self - 20000) * 0.7; self -= hui; }
    if (cM.checked) { com = Math.max(0, self - 10000); self -= com; }
    bars(box, [['总花费', T, '', 'var(--ink-3)'], ['基本医保', basic, '', 'var(--blu)'], ['大病保险', big, '', 'var(--grn)'], ['补充保险', hui, '', 'var(--och)'], ['商业医疗险', com, '', 'var(--pur)'], ['自己掏', self, Math.round(self / T * 100) + '%', 'var(--main)']], T, v => yuan(v));
    let s = '一场 ' + yuan(T) + '的病，你自己要掏约 ' + yuan(self) + '，占 ' + Math.round(self / T * 100) + '%。';
    if (!cB.checked) s += ' 没有基本医保，全部自己扛：这就是“一病花光”最常见的样子。';
    else if (!cH.checked && !cM.checked && out > 0) s += ' 剩下的大头是目录外的 ' + yuan(out) + '：基本医保和大病保险都不管这一块，补充保险和商业医疗险主要补的就是它。';
    if (cM.checked) s += ' 商业医疗险把免赔额以上的部分几乎都接住了，可它要看健康告知、年纪越大越贵，这是“年轻时买最便宜”的原因。';
    say.textContent = s;
  }
  const gT = slider('ilT', v => v + ' 万', go), gO = slider('ilO', v => v + '%', go), gR = slider('ilR', v => v + '%', go);
  [cB, cD, cH, cM].forEach(c => c.addEventListener('change', go));
  ready = true; go();
});
