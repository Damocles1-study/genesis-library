
/* ---------- 封面装置：这十五条，你信几条 ---------- */
dev('#quizFig', fig => {
  const box = $('#quizBox'), say = $('#quizSay');
  /* ok: true = 信是对的；false = 不信是对的 */
  const Q = [
    ['虾和维生素 C 一起吃，会在肚子里变成砒霜。', false, '假', 'c1', '海鲜里的砷几乎都是无毒的有机砷；就算往最坏里算，也要一顿吃一百多公斤虾。'],
    ['吃了头孢以后几天之内，不能喝酒。', true, '真', 'c4', '部分头孢会卡住身体拆乙醛的那一步，严重的会休克。说明书常写停药后七天内别喝。'],
    ['菠菜和豆腐一起吃，会得结石。', false, '假', 'c2', '正好相反：草酸在肠子里先和钙结合排掉，进到血里的更少。'],
    ['吃降压药期间喝西柚汁，只要和药隔开几个小时就没事。', false, '假', 'c5', '西柚会弄坏肠壁上拆药的酶，要一天以上才补得回来，隔几个小时没用。柚子也算。'],
    ['空腹一下子吃很多柿子，可能在胃里结成石头。', true, '真', 'c2', '鞣酸遇到胃酸会把食物粘成一团，胃做过手术的老人最容易出事。和螃蟹无关。'],
    ['生鸡下锅前用水冲一遍，更卫生。', false, '假', 'c3', '冲不掉细菌，只会把它溅到水槽和台面上。烧熟、焯水才杀菌。'],
    ['两种感冒药一起吃，好得更快。', false, '假', 'c7', '很多感冒药里都有同一种退烧成分，叠起来容易过量伤肝。叠之前先念成分。'],
    ['吃华法林的人，绿叶菜一口都不能碰。', false, '半真', 'c8', '菜和药确实有关系，可办法是吃得稳定，不是不吃；突然全停反而可能出血。'],
    ['喝酒脸红，说明酒量好。', false, '假', 'c4', '说明拆乙醛的酶天生慢，乙醛在身体里堆着。长期喝酒，食管癌风险更高。'],
    ['用牛奶送某些抗生素，会让药效变差。', true, '真', 'c6', '四环素类、沙星类遇到钙、铁、镁、铝会被“抓住”，吸收变少，要隔开两小时以上。'],
    ['吃完饭马上游泳，会抽筋淹死。', false, '假', 'c9', '查不到可靠的溺水病例；真正危险的是酒后下水。吃得太撑去剧烈游泳会不舒服，但谈不上淹死。'],
    ['隔夜菜都会致癌，一口都不能吃。', false, '看量', 'c13', '冷藏得当的剩菜，亚硝酸盐远不到出事的量；在室温下放了一夜的剩饭剩菜，才是真问题，问题主要是细菌。'],
    ['八四消毒液和洁厕灵不能混在一起用。', true, '真', 'c17', '一个含次氯酸钠，一个含盐酸，混在一起放出氯气。每年都有人在厕所里中毒。'],
    ['油锅着火了，赶紧泼水。', false, '假', 'c21', '水一碰到热油立刻变成蒸汽，把燃烧的油炸得满屋都是。关火，盖锅盖。'],
    ['流鼻血的时候，要仰起头。', false, '假', 'c23', '仰头会让血流进喉咙，可能呛到或吞下去引起呕吐。该坐直、身体稍微前倾，捏住鼻翼。']
  ];
  const ans = Q.map(() => null);
  const ch = id => chapPage[id] > READY ? '第' + ['', '一', '二', '三'][chapPage[id]] + '部（写作中）' : '<a href="' + href(id) + '">' + TOC.find(x => x.id === id).n + '</a>';
  box.innerHTML = Q.map((q, i) => '<div class="qi" data-i="' + i + '"><span>' + (i + 1) + '. ' + q[0] + '</span><span class="yn"><button data-a="1">信</button><button data-a="0">不信</button></span><div class="ans"><i class="st sm" data-v="' + q[2] + '">' + q[2] + '</i>' + q[4] + ' 见 ' + ch(q[3]) + '</div></div>').join('');
  box.addEventListener('click', e => {
    const b = e.target.closest('.yn button'); if (!b) return;
    const qi = b.closest('.qi'), i = +qi.dataset.i;
    ans[i] = b.dataset.a === '1';
    $$('.yn button', qi).forEach(x => x.classList.toggle('on', x === b));
    if (box.classList.contains('show')) grade();
    else { const n = ans.filter(a => a != null).length; say.textContent = '已经点了 ' + n + ' / ' + Q.length + ' 条。'; }
  });
  function grade(){
    let right = 0, done = 0, trustT = 0, trustF = 0;
    Q.forEach((q, i) => {
      const qi = box.children[i];
      qi.classList.remove('hit', 'miss');
      if (ans[i] == null) return;
      done++;
      const ok = ans[i] === q[1];
      if (ok) right++;
      if (ans[i] && !q[1]) trustF++;
      if (!ans[i] && q[1]) trustT++;
      qi.classList.add(ok ? 'hit' : 'miss');
    });
    let s = '点了 ' + done + ' 条，<b>答对 ' + right + ' 条</b>。';
    if (trustF) s += '有 ' + trustF + ' 条不太靠得住的话，你信了；';
    if (trustT) s += '有 ' + trustT + ' 条真的规矩，你没信：这几条是要命的那种，值得翻到那一章看看；';
    if (!trustF && !trustT && done === Q.length) s += '全对。你可以去家族群里当辟谣员了，不过先看看第一章，辟谣也要讲方法。';
    else if (done < Q.length) s += '还有 ' + (Q.length - done) + ' 条没点。';
    say.innerHTML = s.replace(/；$/, '。');
  }
  $('#quizGo').addEventListener('click', () => { box.classList.add('show'); grade(); });
  $('#quizReset').addEventListener('click', () => {
    ans.fill(null); box.classList.remove('show');
    $$('.qi', box).forEach(q => q.classList.remove('hit', 'miss'));
    $$('.yn button', box).forEach(b => b.classList.remove('on'));
    say.textContent = '还没开始。';
  });
});
