/* ---------- 第九章：四种走法 ---------- */
dev('#travFig', fig => {
  const svg = $('svg.trav', fig), out = $('#trOut'), say = $('.say', fig);
  const TREES = [
    {name: '字母树', root: 'A', n: {A: {k: 'A', l: 'B', r: 'C'}, B: {k: 'B', l: 'D', r: 'E'}, C: {k: 'C', l: 'F', r: 'G'}, D: {k: 'D', l: null, r: 'H'}, E: {k: 'E', l: null, r: null}, F: {k: 'F', l: 'I', r: null}, G: {k: 'G', l: null, r: null}, H: {k: 'H', l: null, r: null}, I: {k: 'I', l: null, r: null}}},
    {name: '算式树', root: 'm', n: {m: {k: '×', l: 'p', r: 's'}, p: {k: '+', l: 'a', r: 'b'}, s: {k: '−', l: 'c', r: 'd'}, a: {k: '3', l: null, r: null}, b: {k: '4', l: null, r: null}, c: {k: '5', l: null, r: null}, d: {k: '2', l: null, r: null}}},
    {name: '自己画的树', root: 'A', n: {A: {k: 'A', l: 'B', r: 'C'}, B: {k: 'B', l: 'D', r: null}, C: {k: 'C', l: 'E', r: 'F'}, D: {k: 'D', l: null, r: null}, E: {k: 'E', l: null, r: null}, F: {k: 'F', l: null, r: null}}}
  ];
  const ORDERS = ['先序', '中序', '后序', '层序'];
  let ord = 0, ti = 0, seq = [], at = 0, vals = {};
  btnRow($('[data-m]', fig), ORDERS, 0, i => { ord = i; reset(); });
  btnRow($('[data-t]', fig), TREES.map(t => t.name), 0, i => { ti = i; reset(); });
  function build(){
    const T = TREES[ti], n = T.n, s = [];
    const pre = id => { if (!id) return; s.push(id); pre(n[id].l); pre(n[id].r); };
    const ino = id => { if (!id) return; ino(n[id].l); s.push(id); ino(n[id].r); };
    const post = id => { if (!id) return; post(n[id].l); post(n[id].r); s.push(id); };
    const lev = () => { const q = [T.root]; while (q.length) { const id = q.shift(); s.push(id); if (n[id].l) q.push(n[id].l); if (n[id].r) q.push(n[id].r); } };
    [pre, ino, post][ord] ? [pre, ino, post][ord](T.root) : lev();
    if (ord === 3) { s.length = 0; lev(); }
    return s;
  }
  function draw(){
    const T = TREES[ti], seen = {}; seq.slice(0, at).forEach(id => seen[id] = 1);
    const cur = at ? seq[at - 1] : null;
    drawBinTree(svg, T.n, T.root, {W: 640, H: 220, mark: id => id === cur ? 'hl' : seen[id] ? 'v' : '', sub: id => ti === 1 && vals[id] !== undefined && !/\d/.test(T.n[id].k) ? '= ' + vals[id] : ''});
    out.innerHTML = seq.map((id, k) => '<span class="' + (k === at - 1 ? 'hl' : k >= at ? 'dim' : '') + '">' + (k < at ? T.n[id].k : '?') + '<small>' + (k + 1) + '</small></span>').join('');
  }
  function reset(){ seq = build(); at = 0; vals = {}; draw(); say.textContent = ['先序：自己、左、右。', '中序：左、自己、右。', '后序：左、右、自己。', '层序：一层一层，从左到右。'][ord] + (ti === 1 && ord === 2 ? '后序走算式树：每走到一个运算符，它的两个孩子都已经算好了。' : ''); }
  function step(){
    if (at >= seq.length) return false;
    at++;
    const T = TREES[ti], id = seq[at - 1], nd = T.n[id];
    if (ti === 1 && ord === 2 && !/\d/.test(nd.k)) { const a = vals[nd.l] !== undefined ? vals[nd.l] : +T.n[nd.l].k, b = vals[nd.r] !== undefined ? vals[nd.r] : +T.n[nd.r].k; vals[id] = nd.k === '+' ? a + b : nd.k === '−' ? a - b : a * b; say.textContent = '走到“' + nd.k + '”：左边是 ' + a + '，右边是 ' + b + '，算出 ' + vals[id] + '。'; }
    else say.textContent = at === seq.length ? '走完了：' + seq.map(x => T.n[x].k).join(' ') + (ti === 1 ? (ord === 2 ? '。这就是第四章的后缀表达式，最后得 ' + vals[T.root] + '。' : ord === 0 ? '。这是前缀表达式。' : ord === 1 ? '。加上括号就是原来的算式 (3 + 4) × (5 − 2)。' : '。') : '。') : '看到 ' + nd.k + '。';
    draw(); return true;
  }
  $('[data-x="s"]', fig).addEventListener('click', step);
  $('[data-x="all"]', fig).addEventListener('click', () => { while (step()); });
  $('[data-x="r"]', fig).addEventListener('click', reset);
  reset();
});
