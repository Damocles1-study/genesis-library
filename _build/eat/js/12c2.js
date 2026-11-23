/* ---------- 装置 3：分肉 ---------- */
dev('#shFig', () => {
  const N = 10, DAYS = 120, MEAT = 40, EAT = 4, CAP = 10, START = 5;
  let mode = 0, seed = 7;
  function run(p, g, share, r){
    const res = Array(N).fill(START), dead = Array(N).fill(0);
    for (let d = 1; d <= DAYS; d++) {
      const alive = []; for (let i = 0; i < N; i++) if (!dead[i]) alive.push(i);
      if (!alive.length) break;
      const kills = alive.filter(() => r() < p);
      alive.forEach(i => res[i] -= (1 - g));       // 植物补不上的缺口
      if (share) {
        const per = Math.min(EAT, kills.length * MEAT / alive.length);
        alive.forEach(i => res[i] = Math.min(CAP, res[i] + per));
      } else kills.forEach(i => res[i] = Math.min(CAP, res[i] + EAT));
      alive.forEach(i => { if (res[i] < 0) dead[i] = d; });
    }
    return dead;
  }
  const p = slider('shP', v => v + '%', () => draw());
  const g = slider('shG', v => v + '%', () => draw());
  btnRow($('#shMode'), ['各吃各的', '全部平分', '再来一次'], 0, i => { if (i === 2) { seed++; $$('#shMode button')[2].classList.remove('on'); $$('#shMode button')[mode].classList.add('on'); } else mode = i; draw(); });
  function stats(share){
    const r = rng(1234 + share), P = p() / 100, G = g() / 100; let tot = 0, all = 0;
    for (let t = 0; t < 400; t++) { const d = run(P, G, share, r); const s = d.filter(x => !x).length; tot += s; if (s === N) all++; }
    return [tot / 400, all / 4];
  }
  function draw(){
    const P = p() / 100, G = g() / 100;
    const one = run(P, G, mode === 1, rng(seed * 97 + mode));
    $('#shOne').innerHTML = one.map(d => '<span class="' + (d ? 'dead' : 'hit') + '">' + (d || DAYS) + '</span>').join('');
    const a = stats(false), b = stats(true);
    kv($('#shKv'), [['各吃各的 · 平均活下来', a[0].toFixed(1) + ' 人'], ['各吃各的 · 十人全活', a[1].toFixed(0) + '%'], ['全部平分 · 平均活下来', b[0].toFixed(1) + ' 人'], ['全部平分 · 十人全活', b[1].toFixed(0) + '%']]);
    const solo = P * EAT, need = 1 - G;
    $('#shSay').innerHTML = (b[0] - a[0] > 1.5 ? '平分的营地活下来的人明显多：<b>运气被摊平了</b>。各吃各的时候，一个人连着倒霉十几天就撑不住，而他打到肉的那天，吃不完的肉只能看着烂掉。' :
      b[0] >= 9.5 && a[0] >= 9.5 ? '打猎的机会够大、植物够多，怎么分都饿不死。这样的好地方不多。' :
      b[0] < 3 ? '机会太小、植物太少，怎么分都撑不住：这时候该做的不是改规矩，而是搬家。' : '平分比各吃各的好一些，但差得不算多。') +
      '（一个人平均每天能从自己的猎物里补 ' + solo.toFixed(2) + ' 天，缺口是 ' + need.toFixed(2) + ' 天。）';
  }
  draw();
});
