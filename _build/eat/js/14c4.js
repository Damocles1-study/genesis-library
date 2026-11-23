/* ---------- 装置 5：李悝的账（《汉书·食货志》） ---------- */
dev('#lkFig', () => {
  const Y = slider('lkY', v => v.toFixed(1) + ' 石', () => draw());
  const T = slider('lkT', v => v === 10 ? '十一之税' : v + '%', () => draw());
  const N = slider('lkN', v => v + ' 口', () => draw());
  const P = slider('lkP', v => v + ' 钱', () => draw());
  function draw(){
    const crop = 100 * Y(), tax = crop * T() / 100, food = N() * 1.5 * 12;
    const left = crop - tax - food, cash = left * P();
    const rite = 300, cloth = N() * 300, bal = cash - rite - cloth;
    const mx = Math.max(crop * P(), 1);
    bars($('#lkBars'), [
      ['收成', crop * P(), Math.round(crop) + ' 石', 'var(--grn)'],
      ['交税', tax * P(), Math.round(tax) + ' 石', 'var(--red)'],
      ['口粮', food * P(), Math.round(food) + ' 石', 'var(--och)'],
      ['祭祀过节', rite, '', 'var(--ink-3)'],
      ['穿衣', cloth, '', 'var(--blu)'],
      [bal >= 0 ? '剩下' : '欠着', Math.abs(bal), '', bal >= 0 ? 'var(--grn)' : 'var(--red)']
    ], mx, v => Math.round(v) + ' 钱');
    const deflt = Y() === 1.5 && T() === 10 && N() === 5 && P() === 30;
    $('#lkSay').innerHTML = (left < 0 ? '连口粮都不够：还差 ' + Math.round(-left) + ' 石，这一家人只能借、只能卖地，或者饿着。' :
      bal < 0 ? '粮够吃，钱不够花：一年下来<b>欠 ' + Math.round(-bal) + ' 钱</b>。' : '一年下来<b>剩 ' + Math.round(bal) + ' 钱</b>，可以存一点防灾年。') +
      (deflt ? '这正是李悝的原账：“不足四百五十”。他由此主张国家丰年买进、荒年卖出，稳住粮价。' :
       P() <= 20 && left > 0 ? '粮价太贱，丰收也换不来钱，这就是“谷贱伤农”。' :
       P() >= 80 ? '粮价贵，种地的人卖粮划算了，可城里买粮吃的人要叫苦：李悝说“籴甚贵伤民，甚贱伤农”。' :
       T() >= 30 ? '税到了三成以上，同样的地、同样的人，日子就过不下去了。' : '');
  }
  draw();
});
