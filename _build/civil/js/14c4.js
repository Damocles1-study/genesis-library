
/* ---------- 装置 5：一个读书人的一生 ---------- */
dev('#kjFig', fig => {
  const T = $('#kjT'), A = $('#kjA'), log = $('#kjLog'), say = $('#kjSay');
  $('#kjTO').textContent = T.value + '%'; $('#kjAO').textContent = A.value + ' 岁';
  T.addEventListener('input', () => { $('#kjTO').textContent = T.value + '%'; });
  A.addEventListener('input', () => { $('#kjAO').textContent = A.value + ' 岁'; });
  const P = {yuan: 0.015, xiang: 0.015, hui: 0.05};
  // 一生：从 14 岁开始，按年推进。院试每三年两次（年份 %3 != 2），乡试年份 %3 == 0，会试年份 %3 == 1
  function life(r, talent, stop, story){
    let age = 14, stage = 0, tries = [0, 0, 0], lines = [];
    const startYr = Math.floor(r() * 3);
    for (; age <= 80; age++) {
      const y = startYr + age;
      if (age > 20 && r() < 0.025) { lines.push(age + ' 岁：病故。'); return {stage, age, dead: true, lines, tries}; }
      if (age > stop && stage < 3) { lines.push(age + ' 岁：家里供不起了，不再考。' + (stage === 0 ? '回去学做生意。' : stage === 1 ? '以秀才身份坐馆教书。' : '以举人身份等大挑、做幕友。')); return {stage, age, quit: true, lines, tries}; }
      if (stage === 0 && y % 3 !== 2) { tries[0]++; if (r() < P.yuan * talent) { stage = 1; lines.push(age + ' 岁：第 ' + tries[0] + ' 次考院试，中秀才。'); } else if (story && tries[0] % 4 === 0) lines.push(age + ' 岁：院试又没中（第 ' + tries[0] + ' 次）。'); }
      else if (stage === 1 && y % 3 === 0) { tries[1]++; if (r() < P.xiang * talent) { stage = 2; lines.push(age + ' 岁：第 ' + tries[1] + ' 次乡试，中举！'); } else if (story) lines.push(age + ' 岁：乡试落第（第 ' + tries[1] + ' 次）。'); }
      else if (stage === 2 && y % 3 === 1) { tries[2]++; if (r() < P.hui * talent) { stage = 3; lines.push(age + ' 岁：第 ' + tries[2] + ' 次会试，中进士。'); return {stage, age, lines, tries}; } else if (story) lines.push(age + ' 岁：会试落第（第 ' + tries[2] + ' 次）。'); }
    }
    lines.push('八十岁，还在考。'); return {stage, age, lines, tries};
  }
  const SN = ['童生', '秀才', '举人', '进士'];
  let seed = 1;
  $('#kjOne').addEventListener('click', () => {
    const res = life(rng(seed++ * 7919), +T.value / 100, +A.value, true);
    log.textContent = res.lines.join('\n');
    say.className = 'say' + (res.stage === 3 ? ' ok' : res.stage === 0 ? ' bad' : '');
    say.innerHTML = '这一生的终点：<b>' + SN[res.stage] + '</b>' + (res.stage === 3 ? '，' + res.age + ' 岁。' : '。') + '一共考了院试 ' + res.tries[0] + ' 次、乡试 ' + res.tries[1] + ' 次、会试 ' + res.tries[2] + ' 次。';
  });
  $('#kjMany').addEventListener('click', () => {
    const r = rng(seed++ * 104729), t = +T.value / 100, st = +A.value;
    const cnt = [0, 0, 0, 0], ages = [];
    for (let i = 0; i < 10000; i++) { const res = life(r, t, st, false); cnt[res.stage]++; if (res.stage === 3) ages.push(res.age); }
    bars($('#kjBars'), SN.map((n, i) => [n, cnt[i] / 100, i === 0 ? '一辈子没中秀才' : i === 3 ? '终于' : '停在这一级', ['var(--ink-3)', 'var(--kraft)', 'var(--main)', 'var(--zhu)'][i]]), 100, v => v.toFixed(v < 1 ? 2 : 1) + '%');
    const avg = ages.length ? (ages.reduce((s, x) => s + x, 0) / ages.length).toFixed(1) : '—';
    log.textContent = '一万个读书人，天赋 ' + T.value + '%，家里供到 ' + st + ' 岁。';
    say.className = 'say';
    say.innerHTML = '一万人里，中进士的 <b>' + cnt[3] + '</b> 人，平均 ' + avg + ' 岁；中举人而止步的 ' + cnt[2] + ' 人；当了一辈子秀才的 ' + cnt[1] + ' 人；连秀才都没中的 <b>' + cnt[0] + '</b> 人。' +
      (st < 35 ? '把“供到几岁”往右拖拖看：<b>很多人不是考不上，是熬不到</b>。' : t > 1.5 ? '天赋翻倍，进士也只多了这么些。这条路的窄，不全是天赋能解决的。' : '这就是“三十老明经，五十少进士”背后的算术。');
  });
});
