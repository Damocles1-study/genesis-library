
/* ---------- 第十章：逻辑门 ---------- */
dev('#gateFig', () => {
  const G = ['not', 'and', 'or', 'nand', 'nor'];
  const F = {not: a => !a[0], and: a => a[0] && a[1], or: a => a[0] || a[1], nand: a => !(a[0] && a[1]), nor: a => !(a[0] || a[1])};
  let cur = 'not';
  function table(b){
    const p = RS_PRESET[cur], ins = p.ins.map(c => b.cell(c[0], c[1]).on > 0), out = b.cell(p.out[0], p.out[1]).lit > 0;
    const n = p.ins.length, rows = [];
    for (let m = 0; m < (1 << n); m++) { const a = []; for (let j = 0; j < n; j++) a.push(!!(m >> (n - 1 - j) & 1)); rows.push(a); }
    const yn = v => v ? '<b class="y1">1 有</b>' : '<b class="y0">0 没有</b>';
    $('#gateTab').innerHTML = '<table class="t tt"><tr>' + (n === 1 ? '<th>拉杆</th>' : '<th>拉杆 A（上）</th><th>拉杆 B（下）</th>') + '<th>灯</th></tr>' +
      rows.map(a => '<tr' + (a.every((v, j) => v === ins[j]) ? ' class="now"' : '') + '>' + a.map(v => '<td>' + yn(v) + '</td>').join('') + '<td>' + yn(F[cur](a)) + '</td></tr>').join('') + '</table>';
    $('#gateSay').innerHTML = '现在：' + (n === 1 ? '拉杆' + (ins[0] ? '开' : '关') : 'A ' + (ins[0] ? '开' : '关') + '，B ' + (ins[1] ? '开' : '关')) + '，灯<b>' + (out ? '亮' : '灭') + '</b>。' + p.say;
  }
  const bd = Board($('#gateSvg'), {onChange: table});
  btnRow($('#gatePick'), G.map(k => RS_PRESET[k].n), 0, i => { cur = G[i]; bd.load(RS_PRESET[cur]); });
  bd.load(RS_PRESET.not);
});
