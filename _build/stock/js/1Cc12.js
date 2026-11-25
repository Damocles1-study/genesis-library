
/* ---------- 装置 13：你的损失厌恶 ---------- */
dev('#laFig', fig => {
  const box = $('#laQs'), say = $('#laSay');
  const WIN = [100, 150, 200, 250, 300, 400];
  function draw(){
    box.innerHTML = WIN.map((w, i) => '<div class="ctl" style="grid-template-columns:minmax(0,1fr) auto"><span>反面输 100，正面赢 <b>' + w + '</b> 元</span><span class="btns" style="margin:0" data-i="' + i + '"><button class="btn" data-v="1">玩</button><button class="btn" data-v="0">不玩</button></span></div>').join('') +
      '<div class="ctl" style="grid-template-columns:minmax(0,1fr)"><span>你急用一笔钱，要卖掉一只股票：A 比买入价涨了 30%，B 比买入价跌了 30%，两家公司的前景你判断差不多。卖哪只？</span><span class="btns" style="margin:0" data-i="s"><button class="btn" data-v="A">卖 A（赚的）</button><button class="btn" data-v="B">卖 B（亏的）</button></span></div>';
  }
  const ans = {};
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const g = b.parentNode; ans[g.dataset.i] = b.dataset.v;
    $$('button', g).forEach(x => x.classList.toggle('on', x === b));
  });
  $('#laGo').addEventListener('click', () => {
    const n = WIN.filter((w, i) => ans[i] != null).length;
    if (n < WIN.length) { say.className = 'say'; say.textContent = '还有 ' + (WIN.length - n) + ' 个赌局没选。'; return; }
    const acc = WIN.filter((w, i) => ans[i] === '1');
    let s;
    if (!acc.length) s = '六个赌局你一个都没玩，连赢四百输一百都不玩：你的损失厌恶系数大于 4，或者你根本不想在这件事上冒险。对一笔输不起的钱，这完全合理。';
    else {
      const lam = Math.min(...acc) / 100;
      s = '你最低在“赢 ' + Math.min(...acc) + '、输 100”时愿意玩，损失厌恶系数大约是 ' + lam.toFixed(1) + '。';
      s += lam <= 1 ? ' 你几乎没有损失厌恶，在期望为零的赌局里也愿意玩：小心，这在股市里通常表现为交易太多。' : lam < 2 ? ' 比大多数人更能承受损失。' : lam <= 2.5 ? ' 和研究里大多数人差不多：特沃斯基和卡尼曼 1992 年估计的平均值约为 2.25。' : ' 比大多数人更怕亏。';
      const incons = WIN.some((w, i) => ans[i] === '0' && w > Math.min(...acc));
      if (incons) s += ' 另外，你在更划算的赌局里反而选了“不玩”：人在一连串选择里常常并不一致，这也是真实的。';
    }
    if (ans.s === 'A') s += ' 卖股票那道题你选了卖赚的：这正是处置效应。在“前景差不多”的前提下，两只股票的未来和你的买入价毫无关系，卖哪只本该无所谓，可大多数人会本能地先卖赚的、留着亏的“等回本”。';
    else if (ans.s === 'B') s += ' 卖股票那道题你选了卖亏的：奥迪恩的研究里，被人们留下的亏钱股此后平均表现更差，所以这通常是更好的选择；可真到自己的账户里，大多数人做不到。';
    say.className = 'say ok'; say.textContent = s;
  });
  $('#laRe').addEventListener('click', () => { Object.keys(ans).forEach(k => delete ans[k]); draw(); say.className = 'say'; say.textContent = ''; });
  draw();
});
