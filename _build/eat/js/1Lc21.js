/* ---------- 装置 22：分一分（NOVA） ---------- */
dev('#nvFig', () => {
  const G = [['一', '天然或稍加处理', '洗、切、晒干、冷冻、巴氏消毒，没加别的东西'], ['二', '烹饪用的原料', '从食物里提出来、做饭时用的：油、盐、糖、黄油'], ['三', '加工食品', '一二类加在一起做成的，配料表很短：奶酪、咸鸭蛋、罐头豆子、面包房的简单面包'], ['四', '超加工食品', '工厂配方，配料表长，有家里厨房不用的东西：香精、乳化剂、色素、改性淀粉']];
  const I = [['苹果', 1, '摘下来、洗过，就是第一类。'], ['大米', 1, '去壳、碾白，仍算稍加处理。'], ['速冻青豆', 1, '冷冻是简单的保存，没加别的。'], ['花生油', 2, '从花生里榨出来、做饭用的，第二类。'], ['白砂糖', 2, '从甘蔗或甜菜里提出来的烹饪原料。'], ['奶酪', 3, '牛奶加盐、凝乳酶和菌种，配料很短。'], ['咸鸭蛋', 3, '鸭蛋加盐腌的，第三类。'], ['可乐', 4, '糖、香精、色素、磷酸、咖啡因……典型的第四类。'], ['方便面', 4, '面饼加了改良剂，调料包里有香精、增味剂。'], ['火腿肠', 4, '肉加淀粉、大豆蛋白、卡拉胶、香精、色素。'], ['工厂切片面包', 4, '加了乳化剂、防腐剂的那种算第四类；面包房只用面粉水盐酵母的算第三类。'], ['风味酸奶', 4, '原味酸奶是第一类；加了香精、增稠剂、大量糖的风味酸奶是第四类。']];
  $('#nvKey').innerHTML = G.map(g => '<div class="cd"><b>第' + g[0] + '类 · ' + g[1] + '</b><small>' + g[2] + '</small></div>').join('');
  const ans = I.map(() => 0);
  const box = $('#nvQ');
  function list(){
    box.innerHTML = I.map((x, i) => '<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;background:var(--paper);border-radius:6px;padding:6px 10px;font-size:14.5px;line-height:1.55"><span><b style="font-family:var(--f-display);font-weight:400;font-size:17px">' + x[0] + '</b>' + (ans[i] ? '<br><small style="color:' + (ans[i] === x[1] ? 'var(--grn)' : 'var(--red)') + '">' + (ans[i] === x[1] ? '对了。' : '是第' + G[x[1] - 1][0] + '类。') + x[2] + '</small>' : '') + '</span><span class="btns" style="margin:0;flex-wrap:nowrap">' + [1, 2, 3, 4].map(k => '<button class="btn' + (ans[i] === k ? ' on' : '') + '" data-i="' + i + '" data-k="' + k + '" style="padding:2px 10px">' + G[k - 1][0] + '</button>').join('') + '</span></div>').join('');
  }
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; ans[+b.dataset.i] = +b.dataset.k; list(); say(); });
  function say(){
    const done = ans.filter(Boolean).length, ok = ans.filter((a, i) => a === I[i][1]).length;
    $('#nvSay').innerHTML = done < I.length ? '已分 ' + done + ' / ' + I.length + '。' :
      '分对了 <b>' + ok + ' / ' + I.length + '</b>。' + (ok >= 10 ? '你很会看配料表。' : '容易分错的多半是第三类和第四类：区别不在“加工没加工”，而在配料表里有没有家里厨房不用的东西。') + '一个简单的办法：<b>翻到配料表，看看有几样东西你叫不出名字</b>。';
  }
  list(); say();
});
