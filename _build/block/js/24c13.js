
/* ---------- 第十三章：一秒二十下 ---------- */
dev('#clockFig', () => {
  const lamps = $('#clkLamps'); let t = 0, timer = null, period = 4, count = 0;
  lamps.innerHTML = '<span class="clk"></span>'.repeat(5);
  function start(){
    clearInterval(timer); t = 0; count = 0;
    /* period 以红石刻（0.1 秒）计：亮一半、灭一半 */
    timer = setInterval(() => {
      t++; const on = (t % period) < period / 2;
      if (t % period === 0) count++;
      $$('.clk', lamps).forEach((e, i) => e.classList.toggle('on', ((t + i) % period) < period / 2));
    }, 100);
  }
  slider('clkP', v => (v / 10).toFixed(1) + ' 秒一次', v => {
    period = v; start();
    const hz = 10 / v;
    kv($('#clkKv'), [['一秒钟闪', (hz >= 1 ? hz.toFixed(hz % 1 ? 1 : 0) : hz.toFixed(2)) + ' 次'], ['一分钟闪', Math.round(hz * 60) + ' 次'], ['等于多少个游戏刻', v * 2 + ' 刻']]);
  });

  const M = [['你用笔算加法', 1, '大约一秒一道'], ['游戏里的红石电脑', 1, '大约每秒一步'], ['ENIAC（1946 年）', 5000, '每秒约五千次加法'], ['M1 芯片的一个核', 3.2e9, '每秒约三十二亿拍']];
  const lg = v => Math.log10(v) + 1;
  bars($('#clkBars'), M.map((m, i) => [m[0], lg(m[1]), m[2], i === 3 ? 'var(--main)' : i === 2 ? 'var(--blu)' : 'var(--zhu)']), lg(3.2e9) * 1.02, v => '');
  let who = 1;
  function say(){
    const s = 3.2e9 / M[who][1], yr = s / 3.156e7;
    $('#clkSay').innerHTML = 'M1 芯片一个核心一秒钟打的“拍子”，交给' + M[who][0] + '一拍一拍地做，要 ' +
      (yr >= 1 ? '<b>' + Math.round(yr) + ' 年</b>' : s >= 86400 ? '<b>' + (s / 86400).toFixed(1) + ' 天</b>' : '<b>' + Math.round(s) + ' 秒</b>') + '。' +
      (who < 2 ? '比一个人一辈子还长。' : '') + '（这里只比“拍子”，真的电脑每一拍能做的事也比红石电脑多得多。）';
  }
  btnRow($('#clkWho'), M.slice(0, 3).map(m => m[0]), 1, i => { who = i; say(); });
  say();
});
