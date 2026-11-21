/* ================= 第三部 ================= */
/* ---------- 装置 25：养一个骑士 ---------- */
dev('#knightFig', fig => {
  // 《里普利安法》价目（单位：苏）。牛按 2 苏一头。
  const IT = [['战马', 12, 1], ['备用马', 12, 0], ['锁子甲', 12, 1], ['头盔', 6, 1], ['剑和剑鞘', 7, 1], ['护腿', 6, 1], ['长矛和盾', 2, 1]];
  const OX = 2, UPKEEP = 8, KEEP = 6;   // 每年：马料、侍从等 8 苏；骑士一家吃穿 6 苏（示意）
  const on = IT.map(x => !!x[2]);
  const box = $('#knBtns'), S = $('#knS'), Y = $('#knY'), svg = $('#knSvg');
  box.innerHTML = IT.map((x, i) => '<button class="btn' + (on[i] ? ' on' : '') + '" data-i="' + i + '">' + x[0] + ' · ' + x[1] + ' 苏</button>').join('');
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const i = +b.dataset.i; on[i] = !on[i]; b.classList.toggle('on', on[i]); go(); });
  S.addEventListener('input', go); Y.addEventListener('input', go);
  function house(x, y, c){ return '<path d="M' + x + ',' + (y + 7) + ' l7,-7 l7,7 v8 h-14 z" fill="' + c + '" stroke="var(--ink-3)" stroke-width=".8"/>'; }
  function go(){
    const eq = IT.reduce((s, x, i) => s + (on[i] ? x[1] : 0), 0);
    const s = +S.value, yrs = +Y.value;
    $('#knSo').textContent = s + ' 苏/年'; $('#knYo').textContent = yrs + ' 年';
    const need = eq / yrs + UPKEEP + KEEP, n = Math.ceil(need / s);
    // 画：左边一个骑士（盾牌 + 长矛），右边 n 座小房子
    const W = 600, cols = 20, rows = Math.max(2, Math.ceil(n / cols)), H = 40 + rows * 22;
    let g = '<g transform="translate(18,' + (H / 2 - 30) + ')"><circle cx="22" cy="10" r="8" fill="var(--ink-3)"/><path d="M12,20 h20 l4,26 h-28 z" fill="var(--ink-3)"/>' +
      (on[2] ? '<path d="M12,20 h20 l4,26 h-28 z" fill="none" stroke="var(--ink)" stroke-dasharray="1.5 1.5"/>' : '') +
      (on[6] ? '<path d="M2,24 q8,-4 14,0 v14 q-7,8 -14,0 z" fill="var(--ter)"/><line x1="40" y1="-6" x2="40" y2="58" stroke="var(--ink)" stroke-width="2"/>' : '') +
      (on[0] ? '<path d="M6,58 h40 l4,-10 h-48 z" fill="var(--och)" opacity=".7"/>' : '') + '</g>';
    g += txt(40, H - 8, '一个骑士', {s: 12, c: 'var(--ink-2)'});
    for (let i = 0; i < n; i++) g += house(100 + (i % cols) * 24, 20 + Math.floor(i / cols) * 22, i < Math.ceil((eq / yrs) / s) ? 'var(--och)' : i < Math.ceil((eq / yrs + UPKEEP) / s) ? 'var(--main)' : 'var(--grn)');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    kv($('#knKV'), [['一身装备', eq + ' 苏'], ['折合', (eq / OX).toFixed(1) + ' 头牛'], ['每年开销（示意）', need.toFixed(1) + ' 苏'], ['要供养他的农户', n + ' 户']]);
    const say = $('#knSay');
    say.className = 'say' + (n > 30 ? ' bad' : '');
    say.innerHTML = '<small><span style="color:var(--och)">■</span> 分摊装备　<span style="color:var(--main)">■</span> 马料、侍从　<span style="color:var(--grn)">■</span> 骑士一家的吃穿</small><br>' +
      (eq === 0 ? '什么都不买，那就不是骑士，是农民。' :
      eq >= 45 ? '一身全套行头 ' + eq + ' 苏，差不多是 ' + Math.round(eq / OX) + ' 头牛。美国历史学家林恩·怀特据此估算：一个骑兵的装备，值十户以上农民家里全部的耕牛。' + (on[1] ? '加一匹备用马，又是一大笔：战马在冲锋里最容易死。' : '') :
      '少了几件，便宜了不少。可上了战场，少的那一件常常就是要命的那一件。') +
      ' 按每户每年能交出 ' + s + ' 苏的余粮算，这个骑士背后要站着 <b>' + n + '</b> 户农民。';
  }
  go();
});
