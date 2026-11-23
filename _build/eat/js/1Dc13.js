/* ---------- 装置 14：跑堂的记性 ---------- */
dev('#wtFig', () => {
  const NOODLE = ['插肉面', '大燠面', '桐皮面', '冷淘', '鸡丝面'];
  const ASK = ['要热的', '要冷的', '要温的', '绝冷', '精浇（瘦）', '膘浇（肥）'];
  const WHO = ['穿青衫的书生', '戴幞头的官人', '胖员外', '军爷', '老妈妈', '卖炭的', '和尚', '小娘子'];
  const LV = [['三位客人', 3, 6], ['五位客人', 5, 8], ['八位客人', 8, 10]];
  let lv = 0, orders = [], timer = null, r = rng(Date.now() % 100000);
  btnRow($('#wtLv'), LV.map(l => l[0]), 0, i => { lv = i; reset(); });
  function reset(){ clearInterval(timer); $('#wtShow').textContent = '点“开始”，菜单会亮几秒钟。'; $('#wtAns').innerHTML = ''; $('#wtCheck').disabled = true; $('#wtSay').textContent = ''; }
  const pick = a => a[Math.floor(r() * a.length)];
  $('#wtGo').addEventListener('click', () => {
    clearInterval(timer);
    const n = LV[lv][1], who = [...WHO].sort(() => r() - 0.5).slice(0, n);
    orders = who.map(w => [w, pick(NOODLE), pick(ASK)]);
    let left = LV[lv][2];
    const show = () => { $('#wtShow').textContent = orders.map(o => o[0] + '：' + o[1] + '，' + o[2]).join('\n') + '\n—— 还剩 ' + left + ' 秒'; };
    show(); $('#wtAns').innerHTML = ''; $('#wtCheck').disabled = true; $('#wtSay').textContent = '记！';
    timer = setInterval(() => {
      left--; if (left > 0) { show(); return; }
      clearInterval(timer);
      $('#wtShow').textContent = '（菜单收起来了。厨房在等你唱菜。）';
      $('#wtAns').innerHTML = orders.map((o, i) => '<label>' + o[0] + '<select data-k="n" data-i="' + i + '"><option value="">面？</option>' + NOODLE.map(x => '<option>' + x + '</option>').join('') + '</select><select data-k="a" data-i="' + i + '"><option value="">怎么做？</option>' + ASK.map(x => '<option>' + x + '</option>').join('') + '</select></label>').join('');
      $('#wtCheck').disabled = false; $('#wtSay').textContent = '凭记忆配好每个人的面，然后上菜。';
    }, 1000);
  });
  $('#wtCheck').addEventListener('click', () => {
    let ok = 0; const wrong = [];
    orders.forEach((o, i) => {
      const n = $('#wtAns select[data-k="n"][data-i="' + i + '"]').value, a = $('#wtAns select[data-k="a"][data-i="' + i + '"]').value;
      if (n === o[1] && a === o[2]) ok++; else wrong.push(o[0] + '要的是' + o[1] + '，' + o[2]);
    });
    $('#wtCheck').disabled = true;
    const all = orders.length;
    $('#wtSay').className = 'say ' + (ok === all ? 'ok' : 'bad');
    $('#wtSay').innerHTML = ok === all ? '全对！' + all + ' 碗面分毫不差。掌柜点了点头。宋朝的好跑堂一次要记二十来碗，你可以试试八位客人。' :
      '对了 ' + ok + ' / ' + all + ' 碗。' + wrong.join('；') + '。' + (ok <= all / 2 ? '照《东京梦华录》的规矩，这要“罚工价”了。' : '客人告诉了掌柜，挨了一顿骂。');
  });
  reset();
});
