/* ---------- 装置 18：分路 ---------- */
dev('#roadFig', fig => {
  const TOTAL = 30;
  // 名字、宽度（米）、每条每小时运多少人、颜色
  const T = [
    {k: 'walk', n: '人行道', w: 3, p: 9000, c: 'var(--paper-2)'},
    {k: 'tree', n: '行道树', w: 1.5, p: 0, c: 'var(--grn)'},
    {k: 'bike', n: '自行车道', w: 2.5, p: 7500, c: 'var(--och)'},
    {k: 'park', n: '路边停车', w: 2.5, p: 0, c: 'var(--ink-3)'},
    {k: 'car', n: '小汽车道', w: 3.5, p: 1100, c: 'var(--ink)'},
    {k: 'bus', n: '公交专用道', w: 3.5, p: 6000, c: 'var(--red)'}
  ];
  const PRE = [
    ['汽车优先', {walk: 2, tree: 0, bike: 0, park: 2, car: 5, bus: 0}],
    ['公交优先', {walk: 2, tree: 2, bike: 0, park: 0, car: 2, bus: 2}],
    ['完整街道', {walk: 2, tree: 2, bike: 2, park: 0, car: 2, bus: 1}]
  ];
  let cnt = Object.assign({}, PRE[0][1]);
  btnRow($('#roadPre'), PRE.map(p => p[0]), 0, i => { cnt = Object.assign({}, PRE[i][1]); go(); });
  const ctl = $('#roadCtl');
  ctl.innerHTML = T.map(t => '<div style="display:grid;grid-template-columns:8.5em auto auto;gap:8px;align-items:center;font-size:14px;color:var(--ink-2);margin:3px 0"><span>' + t.n + ' <small style="color:var(--ink-3)">' + t.w + ' 米</small></span><span class="btns" style="margin:0"><button class="btn" data-k="' + t.k + '" data-d="-1">−</button><button class="btn" data-k="' + t.k + '" data-d="1">＋</button></span><output id="road_' + t.k + '" style="font-family:var(--f-mono);font-size:13px;color:var(--ink)"></output></div>').join('');
  ctl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const k = b.dataset.k, d = +b.dataset.d, t = T.find(x => x.k === k);
    if (d > 0 && used() + t.w > TOTAL + 1e-9) { $('#roadSay').innerHTML = '<b>放不下了。</b>三十米已经分完，要加一样，得先减一样。'; return; }
    cnt[k] = Math.max(0, (cnt[k] || 0) + d); go();
  });
  const used = () => T.reduce((s, t) => s + t.w * (cnt[t.k] || 0), 0);
  function go(){
    T.forEach(t => $('#road_' + t.k).textContent = '× ' + (cnt[t.k] || 0));
    // 横断面：人行道、树、停车、自行车放两侧，车道和公交道放中间
    const order = [];
    const side = k => { const n = cnt[k] || 0; return [Math.ceil(n / 2), Math.floor(n / 2)]; };
    const L = [], R = [];
    ['walk', 'tree', 'bike', 'park'].forEach(k => { const [a, b] = side(k); for (let i = 0; i < a; i++) L.push(k); for (let i = 0; i < b; i++) R.unshift(k); });
    const mid = []; const [ba, bb] = side('bus'); for (let i = 0; i < ba; i++) mid.push('bus'); for (let i = 0; i < (cnt.car || 0); i++) mid.push('car'); for (let i = 0; i < bb; i++) mid.push('bus');
    order.push(...L, ...mid, ...R);
    const sc = 580 / TOTAL; let x = 10, s = '';
    order.forEach(k => {
      const t = T.find(z => z.k === k), w = t.w * sc;
      s += '<rect x="' + x.toFixed(1) + '" y="40" width="' + w.toFixed(1) + '" height="60" fill="' + t.c + '" fill-opacity="' + (k === 'walk' ? 1 : k === 'tree' ? .35 : .22) + '" stroke="var(--card)" stroke-width="1"/>';
      if (k === 'tree') s += '<circle cx="' + (x + w / 2).toFixed(1) + '" cy="30" r="13" fill="var(--grn)" opacity=".55"/><line x1="' + (x + w / 2).toFixed(1) + '" x2="' + (x + w / 2).toFixed(1) + '" y1="40" y2="60" stroke="var(--grn)" stroke-width="2"/>';
      if (k === 'car' || k === 'park') s += '<rect x="' + (x + w * .18).toFixed(1) + '" y="60" width="' + (w * .64).toFixed(1) + '" height="22" rx="4" fill="var(--ink)" opacity=".5"/>';
      if (k === 'bus') s += '<rect x="' + (x + w * .1).toFixed(1) + '" y="48" width="' + (w * .8).toFixed(1) + '" height="38" rx="4" fill="var(--red)" opacity=".7"/>';
      if (k === 'bike') s += '<circle cx="' + (x + w * .32).toFixed(1) + '" cy="78" r="5" fill="none" stroke="var(--och)" stroke-width="1.6"/><circle cx="' + (x + w * .68).toFixed(1) + '" cy="78" r="5" fill="none" stroke="var(--och)" stroke-width="1.6"/>';
      if (k === 'walk') s += '<circle cx="' + (x + w / 2).toFixed(1) + '" cy="62" r="3.5" fill="var(--ink)"/><line x1="' + (x + w / 2).toFixed(1) + '" x2="' + (x + w / 2).toFixed(1) + '" y1="66" y2="82" stroke="var(--ink)" stroke-width="2"/>';
      s += '<text x="' + (x + w / 2).toFixed(1) + '" y="116" font-size="' + (w > 40 ? 11 : 9) + '" text-anchor="middle" fill="var(--ink-2)">' + t.n.replace('专用道', '').replace('小汽车道', '车道').replace('自行车道', '单车').replace('路边停车', '停车').replace('行道树', '树') + '</text>';
      x += w;
    });
    const left = TOTAL - used();
    if (left > 0.01) s += '<rect x="' + x.toFixed(1) + '" y="40" width="' + (left * sc).toFixed(1) + '" height="60" fill="none" stroke="var(--rule)" stroke-dasharray="3 3"/><text x="' + (x + left * sc / 2).toFixed(1) + '" y="74" font-size="10" text-anchor="middle" fill="var(--ink-3)">空着</text>';
    s += '<line x1="10" x2="590" y1="132" y2="132" stroke="var(--ink-3)"/><text x="300" y="146" font-size="11" text-anchor="middle" fill="var(--ink-3)">三十米</text>';
    $('#roadSvg').innerHTML = s;
    const per = {}; T.forEach(t => per[t.k] = t.p * (cnt[t.k] || 0));
    const sum = Object.values(per).reduce((a, b) => a + b, 0);
    const carW = (cnt.car || 0) * 3.5 + (cnt.park || 0) * 2.5;
    kv($('#roadKV'), [['每小时能运', fmt(sum) + ' 人'], ['其中小汽车', fmt(per.car) + ' 人'], ['分给汽车（含停车）的宽度', Math.round(carW / TOTAL * 100) + '%'], ['还空着', f1(left) + ' 米']]);
    const S = $('#roadSay');
    S.innerHTML = carW / TOTAL > .5 ? '一半以上的路面分给了小汽车和停车，可它们运的人只占一小部分：一条车道每小时大约只能过一千来人，路边停着的车一个人也不运。' : (cnt.bus || 0) + (cnt.bike || 0) > 0 ? '公交专用道和自行车道很“占便宜”：同样的宽度，运的人是小汽车道的好几倍。这就是很多城市在把车道改成公交道、自行车道的原因，虽然每改一次都会被开车的人骂。' : '试试把一条车道换成公交专用道或者自行车道。';
  }
  go();
});
