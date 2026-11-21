
/* ---------- 装置 2：两份工作的真时薪 ---------- */
dev('#hwFig', fig => {
  const F = [['nm', '名字', 'text', '北京大厂', '省城国企'], ['inc', '到手年收入（万元）', 'number', 19, 8.5], ['wk', '每周工作小时（含加班）', 'number', 60, 40],
    ['cm', '每天通勤往返（分钟）', 'number', 80, 40], ['ex', '每月因它多花的钱（元）', 'number', 3500, 0], ['rc', '下班后缓过来（小时 / 天）', 'number', 1, 0]];
  const tab = $('#hwTab');
  tab.innerHTML += '<tr><th></th><th>工作 A</th><th>工作 B</th></tr>' + F.map(f => '<tr><td>' + f[1] + '</td>' + [3, 4].map(k => '<td><input type="' + f[2] + '" data-k="' + f[0] + '" data-j="' + (k - 3) + '" value="' + f[k] + '" ' + (f[2] === 'number' ? 'min="0" step="any" ' : '') + 'style="width:100%;min-width:0;border:1px solid var(--rule);border-radius:5px;background:var(--paper);padding:2px 6px"></td>').join('') + '</tr>').join('');
  const get = (k, j) => { const el = $('input[data-k="' + k + '"][data-j="' + j + '"]', tab); return k === 'nm' ? (el.value || (j ? 'B' : 'A')) : Math.max(0, +el.value || 0); };
  function go(){
    const r = [0, 1].map(j => {
      const hours = 50 * (get('wk', j) + 5 * get('cm', j) / 60 + 5 * get('rc', j));
      const net = get('inc', j) * 1e4 - 12 * get('ex', j);
      return {nm: esc(get('nm', j)), hours, net, hr: hours ? net / hours : 0, nom: get('wk', j) ? get('inc', j) * 1e4 / (50 * get('wk', j)) : 0};
    });
    kv($('#hwKv'), [[r[0].nm + ' 名义时薪', r[0].nom.toFixed(0) + ' 元'], [r[0].nm + ' 真时薪', r[0].hr.toFixed(0) + ' 元'], [r[1].nm + ' 名义时薪', r[1].nom.toFixed(0) + ' 元'], [r[1].nm + ' 真时薪', r[1].hr.toFixed(0) + ' 元']]);
    const [a, b] = r[0].net >= r[1].net ? r : [r[1], r[0]];
    const dn = a.net - b.net, dh = a.hours - b.hours;
    let s = '一年里，' + r[0].nm + ' 占去你约 <b>' + fmt(r[0].hours) + '</b> 小时，' + r[1].nm + ' 约 <b>' + fmt(r[1].hours) + '</b> 小时。';
    if (dh > 0 && dn > 0) s += a.nm + ' 多给你 <b>' + yuan(dn) + '</b>，多占你 <b>' + fmt(dh) + '</b> 小时：<b>多出来的每一小时，换来约 ' + (dn / dh).toFixed(0) + ' 元</b>。问问自己：如果有人出这个价，买你下班后、周末里的一小时，你卖不卖？';
    else if (dn > 0) s += a.nm + ' 钱多，占的时间还不比另一份多：只看这两项，它两头都占优。剩下要比的，是这张表里没有的东西：学得到什么、能干多久、喜不喜欢。';
    else s += '两份工作扣完成本，到手的钱差不多。';
    s += ' 名义时薪和真时薪差得越多，说明这份工作“看不见的成本”越大。';
    $('#hwSay').innerHTML = s;
  }
  tab.addEventListener('input', go); go();
});
