
/* ---------- 装置 17：恺撒的账本 ---------- */
dev('#debtFig', fig => {
  // 每一关：年份、标题、说明、选项 [文字, 花费, 名声, 特殊]
  const ST = [
    {y: -69, t: '财务官', d: '三十一岁，阶梯的第一级。跟着总督去西班牙管军饷。你手里已经有一百塔兰特的旧债。',
      o: [['老老实实办差', 20, 5], ['请客送礼，广交朋友', 80, 15]]},
    {y: -65, t: '营造官', d: '要办节日赛会。国家给的钱远远不够，剩下的全得自己掏。赛会办得越大，选民记得越牢。',
      o: [['小办一场', 50, 10], ['办得像样些', 150, 25], ['三百二十对角斗士', 400, 45]]},
    {y: -63, t: '大祭司长', d: '老大祭司长死了，这是一个终身的职位。对手是两个德高望重的前执政官。',
      o: [['不去争', 0, 0], ['正常拉票', 100, 0, 'pm'], ['借一大笔钱拉票', 500, 0, 'pm2']]},
    {y: -61, t: '西班牙总督', d: '当完裁判官，抽到了远西班牙行省。可是债主们堵在门口，不还钱不让走。',
      o: [['规规矩矩当总督', 0, 5, 'sp1'], ['打几仗，狠狠捞一笔', 0, 15, 'sp2']]},
    {y: -60, t: '竞选执政官', d: '阶梯的顶点。当上执政官，卸任以后才能拿到一个大行省。',
      o: [['自己撒钱拉票', 300, 0, 'c1'], ['和庞培、克拉苏私下结盟', 50, 0, 'c2'], ['算了，不选了', 0, 0, 'quit']]},
    {y: -58, t: '高卢', d: '卸任执政官，拿到了两个高卢行省和伊利里库姆，任期五年，后来延长到十年。',
      o: [['守住行省，不惹事', 0, 5, 'g1'], ['打下整个高卢', 0, 50, 'g2']]},
    {y: -49, t: '卢比孔河', d: '兵权到期了。元老院要你先交出军队，再回罗马当一个普通公民。政敌已经放话：你一交兵权，就告你。',
      o: [['交出兵权，回罗马受审', 0, 0, 'give'], ['渡河', 0, 0, 'cross']]}
  ];
  let D, F, k, log, over;
  const stage = $('#dbStage'), btns = $('#dbBtns'), say = $('#dbSay');
  function reset(){ D = 100; F = 10; k = 0; over = false; log = [['前 70', '起点', '欠 100']]; draw(''); }
  function interest(y0, y1){ if (D > 0) D *= Math.pow(1.12, y1 - y0); }
  function end(msg, cls){ over = true; draw(msg, cls); }
  function choose(i){
    if (over) { reset(); return; }
    const s = ST[k], o = s.o[i], r = Math.random();
    let note = '';
    D += o[1]; F = clamp(F + o[2], 0, 100);
    if (o[3] === 'pm' || o[3] === 'pm2') {
      const p = o[3] === 'pm' ? F / 100 : Math.min(.95, F / 100 + .4);
      if (r < p) { F = clamp(F + 20, 0, 100); note = '你当选了大祭司长！终身职位，名声大涨。'; }
      else if (o[3] === 'pm2') { log.push([yr(s.y), o[0], '欠 ' + Math.round(D)]); return end('<b>落选了。</b>五百塔兰特打了水漂，债主们一拥而上。“今天你会看到你的儿子，要么是大祭司长，要么是流亡者”：你是后者。<br><small>当选的概率是 ' + Math.round(p * 100) + '%。真实的恺撒赌赢了。</small>', 'bad'); }
      else { F = clamp(F - 5, 0, 100); note = '落选了，好在花得不多。'; }
    }
    if (o[3] === 'sp1' || o[3] === 'sp2') {
      if (D > 600) {
        if (F < 50) { log.push([yr(s.y), '想去上任', '欠 ' + Math.round(D)]); return end('<b>走不了。</b>你欠了 ' + Math.round(D) + ' 塔兰特，债主们扣住了你的行李，没有一个大人物肯替你担保（你的名声还不够大）。你的政治生涯到此为止。', 'bad'); }
        note = '你欠了 ' + Math.round(D) + ' 塔兰特，债主不放人。首富克拉苏看中了你的前途，替你担保了一大笔。';
      }
      D -= o[3] === 'sp1' ? 400 : 1200;
      note += o[3] === 'sp2' ? ' 你在西班牙打了几仗，抢了几座城，回来时腰包鼓鼓。' : ' 你清清白白地回来了，钱不多。';
    }
    if (o[3] === 'quit') { log.push([yr(s.y), o[0], '欠 ' + Math.round(D)]); return end('你退出了。' + (D > 0 ? '剩下 ' + Math.round(D) + ' 塔兰特的债，够你还一辈子。' : '好在账已经平了，你可以去乡下的庄园写写诗。') + '<br><small>罗马有几百个这样的元老，没有人记得他们的名字。</small>'); }
    if (o[3] === 'c1' || o[3] === 'c2') {
      if (o[3] === 'c2' && F < 60) { D -= o[1]; F = clamp(F - o[2], 0, 100); draw('庞培和克拉苏看不上你：你的名声还不够（要 60，你只有 ' + F + '）。换个办法吧。', 'bad'); return; }
      const p = o[3] === 'c2' ? .95 : Math.min(.9, F / 100 + .2);
      if (r >= p) { log.push([yr(s.y), o[0], '欠 ' + Math.round(D)]); return end('<b>落选了。</b>当选概率 ' + Math.round(p * 100) + '%，你没赶上。没有执政官，就没有大行省，债越滚越大。', 'bad'); }
      note = o[3] === 'c2' ? '三个人加起来，元老院挡不住。你当选了执政官。' : '你当选了执政官，不过钱花得心惊肉跳。';
    }
    if (o[3] === 'g1' || o[3] === 'g2') {
      D -= o[3] === 'g1' ? 800 : 4500;
      note = o[3] === 'g2' ? '八年仗打下来，你成了罗马最富的人之一，手里有一支只认你的军队。高卢人死了不知多少。' : '你平平安安守了十年边，攒了些钱，罗马城里没什么人提起你。';
    }
    if (o[3] === 'give') { log.push([yr(s.y), o[0], '']); return end('你交出了兵权。政敌们把你告上法庭，罪名一大串：执政官任上违法、在高卢背信开战……你被判流放，财产充公。<br><small>' + (F >= 80 ? '这是你的士兵们最不愿意看到的结局：他们的地和赏钱，只有你能给。' : '') + '真实的恺撒没有选这条路。</small>', 'bad'); }
    if (o[3] === 'cross') { log.push([yr(s.y), o[0], '骰子已经掷出']); return end('<b>骰子已经掷出去了。</b>' + (F >= 80 ? '你的老兵们跟着你过了河。接下来是五年内战，然后是终身独裁官，然后是三月十五日。' : '可你的军队不够强、名声不够响，过了河也没几个人跟你。你成了“公敌”。') + '<br><small>从第一笔一百塔兰特的旧债算起，到这里，用了二十年。</small>', F >= 80 ? 'ok' : 'bad'); }
    log.push([yr(s.y), o[0], D > 0 ? '欠 ' + Math.round(D) : '存 ' + Math.round(-D)]);
    k++;
    interest(s.y, ST[k].y);
    draw(note);
  }
  function draw(note, cls){
    const s = ST[k];
    stage.innerHTML = over ? '' : '<div class="lab">第 ' + (k + 1) + ' 关 / ' + ST.length + ' · 前 ' + (-s.y) + ' 年 · 你 ' + (s.y + 100) + ' 岁</div><h4 style="margin:.1em 0 .3em">' + s.t + '</h4><p class="readout">' + s.d + '</p>';
    btns.innerHTML = over ? '<button class="btn pri">从头再来</button>' : s.o.map((o, i) => '<button class="btn" data-i="' + i + '">' + o[0] + (o[1] ? '（花 ' + o[1] + '）' : '') + '</button>').join('');
    kv($('#dbKV'), [['债', D > 0 ? Math.round(D) + ' 塔兰特' : '没有债'], ['名声', F + ' / 100'], ['每年利息', D > 0 ? Math.round(D * .12) + ' 塔兰特' : '—']]);
    say.className = 'say' + (cls ? ' ' + cls : '');
    say.innerHTML = note || '每年利息一分二，利滚利。选一个做法。';
    $('#dbLog').innerHTML = log.map(l => '<div class="row"><span class="y">' + l[0] + '</span><b>' + l[1] + '</b><span class="p">' + l[2] + '</span></div>').join('');
  }
  btns.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; choose(+b.dataset.i || 0); });
  reset();
});
