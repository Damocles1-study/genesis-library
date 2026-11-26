
/* ---------- 第九章：信号走十五格 ---------- */
dev('#lineFig', () => {
  const sv = $('#lineSvg'); let rep = false;
  function draw(n){
    /* 序列：拉杆、n 格线（打开中继器时每 15 格线后插一个中继器）、灯 */
    const seq = [{t: 'L'}]; let s = 15, reps = 0, dead = false;
    for (let i = 0; i < n; i++) {
      if (rep && i > 0 && i % 15 === 0) { seq.push({t: 'R'}); reps++; s = 15; }
      seq.push({t: 'W', p: s > 0 ? s : 0}); if (s <= 0) dead = true; s--;
    }
    const last = seq[seq.length - 1], ok = n === 0 || last.p > 0;
    seq.push({t: 'P', lit: ok});
    const per = 10, C = 40, rows = Math.ceil(seq.length / per), W = per * C, H = rows * C + 8;
    const pos = i => { const r = (i / per) | 0, c = i % per; return [(r % 2 ? per - 1 - c : c) * C + C / 2, r * C + C / 2 + 4]; };
    let g = '';
    for (let i = 0; i < seq.length - 1; i++) { const a = pos(i), b = pos(i + 1), on = seq[i + 1].t === 'P' ? ok : (seq[i + 1].p > 0 || seq[i + 1].t === 'R'); g += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + (on ? 'var(--rs)' : 'var(--zhu)') + '" stroke-opacity="' + (on ? .7 : .2) + '" stroke-width="6" stroke-linecap="round"/>'; }
    seq.forEach((c, i) => {
      const p = pos(i), x = p[0], y = p[1];
      if (c.t === 'L') g += '<rect x="' + (x - 13) + '" y="' + (y - 13) + '" width="26" height="26" rx="4" fill="var(--stn)" stroke="var(--ink-3)"/>' + txt(x, y + 4, '开', {s: 12, w: true});
      else if (c.t === 'R') g += '<rect x="' + (x - 15) + '" y="' + (y - 9) + '" width="30" height="18" rx="3" fill="var(--card)" stroke="var(--rs)" stroke-width="2"/>' + txt(x, y + 4, '中继', {s: 10, w: true, c: 'var(--zhu)'});
      else if (c.t === 'P') g += (c.lit ? '<rect x="' + (x - 18) + '" y="' + (y - 18) + '" width="36" height="36" rx="6" fill="#f4c94a" fill-opacity=".35"/>' : '') + '<rect x="' + (x - 13) + '" y="' + (y - 13) + '" width="26" height="26" rx="3" fill="' + (c.lit ? '#f4c94a' : 'var(--stn-2)') + '" stroke="var(--ink-3)"/>';
      else { g += '<circle cx="' + x + '" cy="' + y + '" r="11" fill="' + (c.p > 0 ? 'var(--rs)' : 'var(--paper)') + '" fill-opacity="' + (c.p > 0 ? (.3 + .7 * c.p / 15).toFixed(2) : 1) + '" stroke="var(--zhu)" stroke-opacity=".5"/>' + txt(x, y + 4, c.p, {s: 11, w: true, c: c.p > 0 ? 'var(--ink)' : 'var(--ink-3)'}); }
    });
    sv.setAttribute('viewBox', '0 0 ' + W + ' ' + H); sv.innerHTML = g;
    $('#lineSay').innerHTML = n === 0 ? '一格线都没有，拉杆挨着灯，灯直接就亮。' :
      ok ? '铺了 <b>' + n + '</b> 格线，最后一格还剩 <b>' + last.p + '</b>，灯亮了。' + (reps ? '中间用了 ' + reps + ' 个中继器，每个让信号慢 0.1 秒，一共晚到 ' + (reps / 10).toFixed(1) + ' 秒。' : '红石线本身不花时间，一拉就到。')
      : '铺了 <b>' + n + '</b> 格线，到第 16 格信号就变成 0 了，灯<b>不亮</b>。打开“放中继器”试试。';
    $('#lineSay').className = 'say ' + (ok ? 'ok' : 'bad');
  }
  const get = slider('lineN', v => v + ' 格', draw);
  $('#lineRep').addEventListener('click', e => { rep = !rep; e.target.classList.toggle('on', rep); draw(get()); });
});
