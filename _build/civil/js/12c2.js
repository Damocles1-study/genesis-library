
/* ---------- 装置 3：孝廉名额与大姓 ---------- */
dev('#xlFig', fig => {
  const P = $('#xlP'), B = $('#xlB'), W = $('#xlW');
  // 返回每年的名额（可能是分数：两年一人 = 0.5）
  function quota(pop, border){
    if (border) return pop >= 10 ? Math.max(1, Math.floor(pop / 20)) : pop >= 5 ? 0.5 : 1 / 3;
    if (pop >= 20) return Math.floor(pop / 20);
    return pop >= 10 ? 0.5 : 1 / 3;
  }
  function qtxt(q){ return q >= 1 ? '每年 <b>' + q + '</b> 人' : q === 0.5 ? '<b>两年</b>一人' : '<b>三年</b>一人'; }
  function showQ(){
    const pop = +P.value, q = quota(pop, B.checked);
    $('#xlPO').textContent = pop + ' 万口';
    $('#xlQ').innerHTML = (B.checked ? '边郡' : '内郡') + '，人口 ' + pop + ' 万：' + qtxt(q) + '。' + (pop >= 140 && !B.checked ? '（丁鸿的奏文写到一百二十万六人为止，再往上按每二十万加一人推算。）' : '') + (B.checked && pop >= 10 && pop < 20 ? '（边郡十万以上每年一人，比内郡宽了一倍。）' : B.checked && pop < 10 ? '（边郡不满十万两年一人，五万以下三年一人。）' : '');
    return q;
  }
  P.addEventListener('input', showQ); B.addEventListener('change', showQ);
  $('#xlWO').textContent = W.value + '%';
  W.addEventListener('input', () => { $('#xlWO').textContent = W.value + '%'; });
  function run(){
    const q = showQ(), w = +W.value / 100, r = rng(132 + +W.value);
    // 100 户：0—9 是起初的大姓（各已有 2 个当官的），其余各 0
    const fam = Array.from({length: 100}, (_, i) => ({big: i < 10, off: i < 10 ? 2 : 0, got: 0}));
    let acc = 0;
    for (let y = 0; y < 50; y++) {
      acc += q; let k = Math.floor(acc); acc -= k;
      // 每户每年派一个候选人，才能随机
      while (k-- > 0) {
        let best = -1, bs = -1;
        fam.forEach((f, i) => { const merit = r(); const conn = Math.min(1, f.off / 12); const s = (1 - w) * merit + w * conn + (w > 0 ? r() * 0.05 : 0); if (s > bs) { bs = s; best = i; } });
        fam[best].off++; fam[best].got++;
      }
      // 当官的人会老去：每年每户有小概率少一个
      fam.forEach(f => { if (f.off > 0 && r() < 0.06) f.off--; });
    }
    const tot = fam.reduce((s, f) => s + f.got, 0) || 1;
    const big = fam.filter(f => f.big).reduce((s, f) => s + f.got, 0);
    const sorted = fam.map(f => f.got).sort((a, b) => b - a);
    const top5 = sorted.slice(0, 5).reduce((s, x) => s + x, 0);
    const nonzero = fam.filter(f => f.got > 0).length;
    bars($('#xlBars'), [
      ['十户老大姓', big / tot * 100, '起初就有人当官', 'var(--kraft)'],
      ['其余九十户', (tot - big) / tot * 100, '普通读书人家', 'var(--main)'],
      ['最多的五户', top5 / tot * 100, '不管原来是谁', 'var(--zhu)']
    ], 100, v => v.toFixed(0) + '%');
    $('#xlSay').className = 'say ' + (big / tot > 0.5 ? 'bad' : 'ok');
    $('#xlSay').innerHTML = '五十年里一共举了 <b>' + tot + '</b> 个孝廉，出自 <b>' + nonzero + '</b> 户人家。' +
      (w < 0.15 ? '太守只看才能：机会撒得很开，老大姓也没占到什么便宜。可惜现实里的太守很少这么干净。' :
       big / tot > 0.5 ? '十户老大姓拿走了一大半。<b>关系的权重不用很高，只要“已经有人当官”能加分，雪球就会自己滚起来</b>：当官的越多，下一个越容易是自家人。' :
       '老大姓占的比例已经明显高于它们只占一成的人口。再把“看关系”往右拖一点试试。');
  }
  $('#xlGo').addEventListener('click', run);
  showQ(); run();
});
