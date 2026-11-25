/* ---------- 装置 17：该不该回去上班 ---------- */
dev('#backFig', fig => {
  const out = $('#bkOut');
  const g = {}; let ready = false;
  const CK = [['bkM', '主线被拖累了：这是最先该停的信号，小生意本来是长在主线旁边的。'], ['bkB', '想借钱来撑：这是红线。第零章说过，借来的钱会把“有上限的亏”变成“没有上限的亏”。'], ['bkP', '计划里写好的停止条件已经出现：按计划执行，这正是当初写它的原因。'], ['bkH', '身体或情绪出了持续的问题：先去看医生，生意可以停，身体不能透支。']];
  function draw(){
    if (!ready) return;
    const red = [], yel = [];
    if (g.s < 3) red.push('存款只够 ' + g.s + ' 个月，已经碰到了止损线。');
    else if (g.s < 6) yel.push('存款还够 ' + g.s + ' 个月，离止损线不远了。');
    if (g.l >= 6) red.push('连续 ' + g.l + ' 个月入不敷出。');
    else if (g.l >= 3) yel.push('连续 ' + g.l + ' 个月入不敷出，到检查点了。');
    if (g.z < 5.5) red.push('平均每晚只睡 ' + g.z + ' 小时。');
    else if (g.z < 6.5) yel.push('睡眠偏少。');
    CK.forEach(c => { if ($('#' + c[0]).checked) (c[0] === 'bkM' ? yel : red).push(c[1]); });
    let light, col, head;
    if (red.length) { light = '红灯'; col = 'var(--main)'; head = '该停下来，按计划回去上班或者回到主线。'; }
    else if (yel.length) { light = '黄灯'; col = 'var(--och)'; head = '到了该认真检查的时候：回去看你的计划，把这几样摆到桌上，和一个信得过的人说一说。'; }
    else { light = '绿灯'; col = 'var(--ter)'; head = '暂时没有危险信号。继续按计划走，到检查日再看。'; }
    out.style.borderColor = col;
    out.innerHTML = '<h5 style="color:' + col + '">' + light + '</h5><p style="margin:0 0 .4em;text-indent:0">' + head + '</p>' + (red.concat(yel).length ? '<ul class="plain" style="margin:0 0 .4em">' + red.map(x => '<li><b class="neg">●</b> ' + x + '</li>').join('') + yel.map(x => '<li><b style="color:var(--och)">●</b> ' + x + '</li>').join('') + '</ul>' : '');
  }
  const go = () => { if (ready) draw(); };
  slider('bkS', v => { g.s = v; return v + ' 个月'; }, go);
  slider('bkL', v => { g.l = v; return v ? v + ' 个月' : '没有'; }, go);
  slider('bkZ', v => { g.z = v; return v + ' 小时'; }, go);
  CK.forEach(c => $('#' + c[0]).addEventListener('change', go));
  ready = true; draw();
});
