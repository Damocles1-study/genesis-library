
/* ---------- 装置 8：雅典的钱袋 ---------- */
dev('#purseFig', fig => {
  const EV = [['plague', '前 430 年的瘟疫'], ['tax', '前 425 年把盟金加到一千多塔兰特'], ['peace', '前 421 年的尼西阿斯和约'], ['sicily', '前 415 年远征西西里'], ['decelea', '前 413 年斯巴达在狄凯里亚扎营'], ['persia', '前 412 年起波斯出钱给斯巴达']];
  const on = {}; EV.forEach(e => on[e[0]] = true);
  const box = $('#purseOpts');
  box.innerHTML = EV.map(e => '<label class="ck"><input type="checkbox" data-k="' + e[0] + '" checked>' + e[1] + '</label>').join('');
  box.addEventListener('change', e => { const c = e.target.closest('input'); if (!c) return; on[c.dataset.k] = c.checked; go(); });
  // 极粗的示意模型：每年 收入 − 支出
  function run(o){
    let R = 6000, lock = 1000, out = [[-431, R + lock]], dead = null;
    for (let y = -431; y < -404; y++) {
      let inc = 600 + 400, sp = 1300;                              // 盟金 + 本土收入；舰队与围城开支
      if (y >= -431 && y <= -429) sp += 700;                      // 围攻波提狄亚
      if (o.plague && y >= -430 && y <= -426) sp += 250;          // 人死了，要多花钱雇人
      if (y === -428) inc += 200;                                 // 第一次征收财产税
      if (o.tax && y >= -425) inc += 700;
      if (o.peace && y >= -421 && y <= -416) sp = 500;
      if (o.sicily && y >= -415 && y <= -413) sp += 1600;
      if (o.decelea && y >= -413) inc -= 450;
      if (o.persia && y >= -412) { inc -= 400; sp += 500; }
      if (y >= -412 && (o.sicily || o.persia)) sp += 200;          // 重建舰队
      R += inc - sp;
      if (R < 0 && lock > 0) { R += lock; lock = 0; }               // 动用“动了就判死刑”的那一千塔兰特
      if (R < 0) { if (dead === null) dead = y + 1; R = 0; }
      out.push([y + 1, R + lock]);
    }
    return {out, dead};
  }
  function go(){
    const base = run(Object.fromEntries(EV.map(e => [e[0], true]))), me = run(on);
    const ymax = Math.max(9000, Math.ceil(Math.max(...me.out.map(p => p[1])) / 3000) * 3000);
    lineChart($('#purseSvg'), [{color: 'var(--ink-3)', pts: base.out, w: 2, dash: '5 4'}, {color: 'var(--och)', pts: me.out, w: 3.2}],
      {xmin: -432, xmax: -403, ymin: 0, ymax, xt: [-431, -425, -421, -415, -410, -404], xf: v => '前' + (-v), yt: [0, ymax / 3, ymax * 2 / 3, ymax], yf: v => fmt(v),
       marks: [[-430, '瘟疫'], [-421, '和约'], [-415, '西西里'], [-412, '波斯出钱'], [-405, '羊河口']]});
    const s = $('#purseSay');
    if (me.dead === null) { s.className = 'say ok'; s.innerHTML = '到前 404 年，金库里还有大约 <b>' + fmt(me.out[me.out.length - 1][1]) + '</b> 塔兰特。按伯里克利的算盘，雅典撑得住，先撑不住的多半是斯巴达。' + (!on.sicily && !on.persia ? '<b>雅典的失败，在很大程度上是两件事的叠加：自己选择的远征，和对手找到的金主。</b>' : ''); }
    else if (me.dead <= -406) { s.className = 'say bad'; s.innerHTML = '金库在前 <b>' + (-me.dead) + '</b> 年见底。在真实的历史里，雅典在前 406 年前后熔化了卫城上的黄金胜利女神像来铸金币，还发行过镀银的铜币。阿里斯托芬在喜剧里抱怨，好钱都不见了，市面上流通的全是劣币。'; }
    else { s.className = 'say'; s.innerHTML = '金库在前 <b>' + (-me.dead) + '</b> 年见底，比真实的历史晚一点。钱不是唯一的问题：没了船、没了桨手，有钱也没处花。'; }
  }
  go();
});
