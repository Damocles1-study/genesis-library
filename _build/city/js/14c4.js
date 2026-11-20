/* ---------- 装置 5：切方格 ---------- */
dev('#gridFig', fig => {
  const PRE = [
    ['提姆加德', 22, 22, 6, '罗马为退伍兵建的小城，街区只有二十来米见方，像一块切得极碎的豆腐。'],
    ['波特兰', 61, 61, 20, '六十一米见方的小街区：路口密、街角多，走两步就是一个十字路口。'],
    ['巴塞罗那', 113, 113, 20, '塞尔达的扩展区：一百一十多米见方，四角切掉（图上没画），街区中间原本打算留成花园。'],
    ['曼哈顿', 240, 61, 20, '东西长、南北窄：南北向走很快，东西向要绕长长的一条街区。'],
    ['新城大街区', 420, 420, 50, '四五百米见方、五十米宽的马路。车开起来顺，人走起来远：从一个街区中间走到对面街区，可能要绕上一公里。'],
    ['唐长安的坊', 1000, 560, 45, '一个坊比很多现代小区还大，四周围着坊墙，只开几座门。坊里头另有自己的小巷，图上看不见。']
  ];
  const Bx = $('#gridBx'), By = $('#gridBy'), Wd = $('#gridW');
  let note = PRE[2][4];
  btnRow($('#gridPre'), PRE.map(p => p[0]), 2, i => { Bx.value = PRE[i][1]; By.value = PRE[i][2]; Wd.value = PRE[i][3]; note = PRE[i][4]; go(); });
  [Bx, By, Wd].forEach(el => el.addEventListener('input', () => { note = ''; go(); }));
  function go(){
    const bx = +Bx.value, by = +By.value, w = +Wd.value, S = 500, k = 250 / S;
    $('#gridBxO').textContent = bx + ' 米'; $('#gridByO').textContent = by + ' 米'; $('#gridWO').textContent = w + ' 米';
    // 画图：从左上角一条路开始
    let s = '<rect x="0" y="0" width="250" height="250" fill="var(--ink)" fill-opacity=".14"/>';
    for (let x = w / 2; x < S; x += bx + w) for (let y = w / 2; y < S; y += by + w) {
      const ww = Math.min(bx, S - x), hh = Math.min(by, S - y);
      if (ww > 0 && hh > 0) s += '<rect x="' + (x * k).toFixed(2) + '" y="' + (y * k).toFixed(2) + '" width="' + (ww * k).toFixed(2) + '" height="' + (hh * k).toFixed(2) + '" fill="var(--card)" stroke="var(--ink)" stroke-width=".5"/>';
    }
    // 比例尺
    s += '<line x1="8" x2="' + (8 + 100 * k) + '" y1="242" y2="242" stroke="var(--red)" stroke-width="2"/><text x="' + (10 + 100 * k) + '" y="245" font-size="9" fill="var(--red)" paint-order="stroke" stroke="var(--card)" stroke-width="3">100 米</text>';
    $('#gridSvg').innerHTML = s;
    const cell = (bx + w) * (by + w);
    const road = 1 - bx * by / cell;
    const inter = 1e6 / cell;                 // 每平方公里路口数
    const front = 2 * (bx + by) / cell * 1e4;  // 每公顷土地上的临街长度（米）
    const walk = (bx + by) / 4;               // 从街区边上随便一点走到最近路口的平均距离（粗算）
    kv($('#gridKV'), [['路占地', (road * 100).toFixed(0) + '%'], ['每平方公里路口', inter >= 10 ? Math.round(inter) : f1(inter)], ['每公顷临街门面', Math.round(front) + ' 米'], ['走到最近路口，平均', Math.round(walk) + ' 米']]);
    let t = note ? '<b>' + note + '</b><br>' : '';
    if (road > 0.4) t += '路占了四成以上的地，能盖房的地太少。小街区好走，但切得太碎就是浪费。';
    else if (inter > 80) t += '路口很密，人可以随时拐弯、抄近路，街角的小店会很多。';
    else if (inter < 6) t += '路口稀少。车开起来很顺，红绿灯也少；人要走很远才能到一个路口，过马路就更远了。';
    else t += '路、路口和门面都在中间。大多数让人觉得“好逛”的老城区，街区边长在六十到两百米之间。';
    $('#gridT').innerHTML = t;
  }
  go();
});
