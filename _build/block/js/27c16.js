
/* ---------- 第十六章：几行代码盖一座塔（写法参考 MakeCode，细节以官方为准） ---------- */
dev('#codeFig', () => {
  const X = 10, Y = 8, Z = 10, s = 16;
  const MAT = [['石头', 'stone', 'STONE'], ['木板', 'plank', 'PLANKS_OAK'], ['玻璃', 'glass', 'GLASS'], ['沙子', 'sand', 'SAND']];
  const P = [
    {n: '一座塔', k: '高', lo: 1, hi: 8, v: 5, list: n => { const r = []; for (let i = 0; i < n; i++) r.push([4, i, 4]); return r; },
      blk: (n, m) => '<div class="cb loop">重复 <b>' + n + '</b> 次（每次 i 加 1）<div class="in"><div class="cb put">放一块 <b>' + m + '</b> 在 (4, <b>i</b>, 4)</div></div></div>',
      py: (n, M) => 'for i in range(' + n + '):\n    blocks.place(' + M + ', world(4, i, 4))'},
    {n: '一堵墙', k: '长', lo: 2, hi: 10, v: 6, list: n => { const r = []; for (let y = 0; y < 3; y++) for (let x = 0; x < n; x++) r.push([x, y, 5]); return r; },
      blk: (n, m) => '<div class="cb loop">重复 <b>3</b> 次（每次 y 加 1）<div class="in"><div class="cb loop">重复 <b>' + n + '</b> 次（每次 x 加 1）<div class="in"><div class="cb put">放一块 <b>' + m + '</b> 在 (<b>x</b>, <b>y</b>, 5)</div></div></div></div></div>',
      py: (n, M) => 'for y in range(3):\n    for x in range(' + n + '):\n        blocks.place(' + M + ', world(x, y, 5))'},
    {n: '一座金字塔', k: '层数', lo: 1, hi: 5, v: 4, list: n => { const r = []; for (let k = 0; k < n; k++) for (let x = k; x <= 2 * n - 2 - k; x++) for (let z = k; z <= 2 * n - 2 - k; z++) r.push([x, k, z]); return r; },
      blk: (n, m) => '<div class="cb loop">重复 <b>' + n + '</b> 次（每次 k 加 1）<div class="in"><div class="cb put">用 <b>' + m + '</b> 填满从 (<b>k</b>, <b>k</b>, <b>k</b>) 到 (<b>' + (2 * n - 2) + '−k</b>, <b>k</b>, <b>' + (2 * n - 2) + '−k</b>) 的一层</div></div></div>',
      py: (n, M) => 'for k in range(' + n + '):\n    blocks.fill(' + M + ', world(k, k, k),\n                world(' + (2 * n - 2) + ' - k, k, ' + (2 * n - 2) + ' - k))'},
    {n: '一段楼梯', k: '级数', lo: 2, hi: 8, v: 6, list: n => { const r = []; for (let i = 0; i < n; i++) for (let y = 0; y <= i; y++) r.push([i + 1, y, 3]); return r; },
      blk: (n, m) => '<div class="cb loop">重复 <b>' + n + '</b> 次（每次 i 加 1）<div class="in"><div class="cb loop">重复 <b>i + 1</b> 次（每次 y 加 1）<div class="in"><div class="cb put">放一块 <b>' + m + '</b> 在 (<b>i</b> + 1, <b>y</b>, 3)</div></div></div></div></div>',
      py: (n, M) => 'for i in range(' + n + '):\n    for y in range(i + 1):\n        blocks.place(' + M + ', world(i + 1, y, 3))'}
  ];
  let pi = 0, mi = 0, timer = null, shown = [];
  const sv = $('#codeSvg');
  function render(list, type){
    const ox = Z * s * .866 + 12, oy = Y * s + 20;
    const iso = (x, z, y) => isoXY(x, z, y, s, ox, oy);
    let g = '';
    const c = [iso(0, 0, 0), iso(X, 0, 0), iso(X, Z, 0), iso(0, Z, 0)];
    g += '<path d="M' + c.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + 'Z" fill="var(--grass)" fill-opacity=".35" stroke="var(--ink-3)" stroke-dasharray="3 3"/>';
    const set = new Set(list.map(b => b.join(',')));
    const has = (x, y, z) => type !== 'glass' && set.has(x + ',' + y + ',' + z);
    list.slice().sort((a, b) => (a[0] + a[2]) - (b[0] + b[2]) || a[1] - b[1]).forEach(b => {
      const q = iso(b[0], b[2], b[1]);
      g += cube(q[0], q[1], s, type, b[0] * 5 + b[1] * 11 + b[2] * 3, {top: !has(b[0], b[1] + 1, b[2]), left: !has(b[0], b[1], b[2] + 1), right: !has(b[0] + 1, b[1], b[2])});
    });
    sv.setAttribute('viewBox', '0 0 ' + ox * 2 + ' ' + (oy + (X + Z) * s * .5 + 6)); sv.innerHTML = g;
  }
  function show(){
    clearInterval(timer);
    const p = P[pi], n = +$('#codeN').value, m = MAT[mi], list = p.list(n);
    $('#codeBlk').innerHTML = '<div class="cb hat">当程序开始时</div>' + p.blk(n, m[0]);
    $('#codePy').textContent = p.py(n, m[2]);
    shown = list; render(list, m[1]);
    const lines = p.py(n, m[2]).split('\n').length;
    $('#codeSay').innerHTML = '程序只有 <b>' + lines + '</b> 行，放了 <b>' + list.length + '</b> 块。' + (list.length > 20 ? '要是用手一块一块点，得点 ' + list.length + ' 下。' : '把数字改大一点试试：代码几乎不用改，房子就大了。');
  }
  function play(){
    clearInterval(timer);
    const list = P[pi].list(+$('#codeN').value), type = MAT[mi][1]; let k = 0;
    render([], type);
    timer = setInterval(() => { k++; render(list.slice(0, k), type); $('#codeSay').innerHTML = '电脑正在一行一行地照做：已经放了 <b>' + k + '</b> / ' + list.length + ' 块。'; if (k >= list.length) { clearInterval(timer); $('#codeSay').innerHTML += ' 做完了。'; } }, list.length > 60 ? 40 : 120);
  }
  function setRange(){ const p = P[pi], r = $('#codeN'); r.min = p.lo; r.max = p.hi; r.value = p.v; $('#codeNL').textContent = p.k; }
  btnRow($('#codePick'), P.map(p => p.n), 0, i => { pi = i; setRange(); $('#codeNO').textContent = $('#codeN').value; show(); });
  btnRow($('#codeMat'), MAT.map(m => m[0]), 0, i => { mi = i; show(); });
  setRange();
  slider('codeN', v => v, show);
  $('#codeRun').addEventListener('click', play);
});
