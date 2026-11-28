/* ---------- 第八章：配方树；完全二叉树的编号 ---------- */
const RECIPES = {'小屋': [['石砖', 4], ['木板', 3], ['灯', 1]], '灯': [['玻璃', 1], ['木棍', 1]], '镐': [['石砖', 1], ['木棍', 2]], '石砖': [['石', 2]], '玻璃': [['沙', 2]], '木棍': [['木板', 1]], '木板': [['木', 1]], '船': [['木板', 3], ['木棍', 1]]};
/* 一般的树：nodes [{id, label, kids:[id], parent}]；返回位置 */
function drawTree(svg, nodes, opt){
  opt = opt || {};
  const W = 640, byId = {}; nodes.forEach(n => byId[n.id] = n);
  let leaf = 0; const pos = {}; let maxd = 0;
  const walk = (id, d) => { const n = byId[id]; maxd = Math.max(maxd, d); if (!n.kids.length) { pos[id] = {x: leaf++, d}; return; } n.kids.forEach(k => walk(k, d + 1)); pos[id] = {x: (pos[n.kids[0]].x + pos[n.kids[n.kids.length - 1]].x) / 2, d}; };
  walk(nodes[0].id, 0);
  const dx = Math.min(80, (W - 60) / Math.max(1, leaf - 1)), dy = 46;
  const H = 30 + maxd * dy + 30; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  const ox = (W - (leaf - 1) * dx) / 2, P = id => ({x: ox + pos[id].x * dx, y: 20 + pos[id].d * dy});
  let h = '';
  nodes.forEach(n => n.kids.forEach(k => { const a = P(n.id), b = P(k); h += '<line x1="' + a.x + '" y1="' + (a.y + 10) + '" x2="' + b.x + '" y2="' + (b.y - 10) + '" stroke="var(--ink-3)" stroke-width="1.3"/>'; if (opt.edge) { const t = opt.edge(n.id, k); if (t) h += txt((a.x + b.x) / 2 + 8, (a.y + b.y) / 2 + 4, t, {s: 10.5, c: 'var(--ink-3)'}); } }));
  nodes.forEach(n => { const a = P(n.id), m = opt.mark ? opt.mark(n.id) : ''; const w = Math.max(30, n.label.length * 15 + 12);
    h += '<rect x="' + (a.x - w / 2) + '" y="' + (a.y - 11) + '" width="' + w + '" height="22" rx="5" fill="' + (m === 'hl' ? 'var(--main)' : m === 'v' ? 'color-mix(in srgb,var(--main) 18%,var(--card))' : 'var(--card)') + '" stroke="' + (n.kids.length ? 'var(--ter)' : 'var(--l1)') + '" stroke-width="1.6" data-id="' + n.id + '" style="cursor:pointer"/>';
    h += txt(a.x, a.y + 4.5, n.label, {s: 12.5, c: m === 'hl' ? 'var(--paper)' : 'var(--ink)', halo: false}); });
  svg.innerHTML = h;
  if (opt.click && !svg._clk) { svg._clk = 1; svg.addEventListener('click', e => { const c = e.target.closest('[data-id]'); if (c) svg._onclick(c.dataset.id); }); }
  if (opt.click) svg._onclick = opt.click;
}
function recipeNodes(item){
  const nodes = []; let k = 0;
  const add = (name, cnt, parent, d) => { const id = 'r' + k++; const n = {id, name, cnt, parent, d, kids: [], label: name + (cnt > 1 ? '×' + cnt : '')}; nodes.push(n); (RECIPES[name] || []).forEach(([c, m]) => n.kids.push(add(c, m, id, d + 1))); return id; };
  add(item, 1, null, 0);
  return nodes;
}
dev('#recipeFig', fig => {
  const svg = $('svg.rtree', fig), kvb = $('.kv', fig), say = $('.say', fig);
  const ITEMS = ['小屋', '镐', '灯', '船'];
  let nodes;
  const ht = (id) => { const n = nodes.find(x => x.id === id); return n.kids.length ? 1 + Math.max(...n.kids.map(ht)) : 1; };
  function show(item){
    nodes = recipeNodes(item);
    drawTree(svg, nodes, {click: pick});
    kv(kvb, [['结点数', nodes.length], ['叶子（原料）', nodes.filter(n => !n.kids.length).length], ['整棵树高', ht(nodes[0].id) + ' 层']]);
    say.textContent = '绿边框的是叶子（要挖的原料），蓝边框的有孩子。点一个结点看看。';
  }
  function pick(id){
    const n = nodes.find(x => x.id === id), path = {}; let p = n; while (p) { path[p.id] = 1; p = p.parent ? nodes.find(x => x.id === p.parent) : null; }
    drawTree(svg, nodes, {click: pick, mark: x => x === id ? 'hl' : path[x] ? 'v' : ''});
    const par = n.parent ? nodes.find(x => x.id === n.parent) : null;
    kv(kvb, [['名字', n.name], ['父结点', par ? par.name : '没有（它是根）'], ['孩子', n.kids.length ? n.kids.map(k => nodes.find(x => x.id === k).name).join('、') : '没有（它是叶子）'], ['深度', n.d], ['子树高', ht(id) + ' 层']]);
    say.textContent = '浅色的是从根走到它的路：走了 ' + n.d + ' 步，所以深度是 ' + n.d + '。';
  }
  btnRow($('[data-m]', fig), ITEMS, 0, i => show(ITEMS[i]));
  show('小屋');
});
dev('#cbtFig', fig => {
  const svg = $('svg', fig), arr = $('#cbArr'), kvb = $('.kv', fig), say = $('.say', fig);
  let n = 10, sel = null;
  function draw(){
    const nodes = {}; for (let i = 1; i <= n; i++) nodes[i] = {k: String(i), l: 2 * i <= n ? 2 * i : null, r: 2 * i + 1 <= n ? 2 * i + 1 : null};
    const rel = {}; if (sel) { rel[sel] = 'hl'; if (sel > 1) rel[Math.floor(sel / 2)] = 'v'; if (2 * sel <= n) rel[2 * sel] = 'ok'; if (2 * sel + 1 <= n) rel[2 * sel + 1] = 'ok'; }
    drawBinTree(svg, nodes, 1, {mark: id => rel[id] || '', click: id => { sel = +id; draw(); }});
    arr.innerHTML = Array.from({length: n}, (_, k) => '<span class="' + (rel[k + 1] === 'hl' ? 'hl' : rel[k + 1] ? 'mv' : '') + '">' + (k + 1) + '<small>[' + (k + 1) + ']</small></span>').join('');
    const h = Math.floor(Math.log2(n)) + 1;
    if (sel) kv(kvb, [['结点', sel], ['双亲 ⌊i/2⌋', sel > 1 ? Math.floor(sel / 2) : '无（根）'], ['左孩子 2i', 2 * sel <= n ? 2 * sel : '无'], ['右孩子 2i+1', 2 * sel + 1 <= n ? 2 * sel + 1 : '无'], ['叶子？i > ⌊n/2⌋', sel > Math.floor(n / 2) ? '是' : '否']]);
    else kv(kvb, [['n', n], ['高度 ⌊log₂n⌋+1', h], ['叶子 n − ⌊n/2⌋', n - Math.floor(n / 2)], ['度为 1 的结点', n % 2 === 0 ? 1 : 0]]);
    say.textContent = sel ? '浅色是双亲，绿色是孩子。数组里它们的下标正好是 ⌊i/2⌋、2i、2i+1：不用指针也能找到。' : '点一个结点看看它的亲戚。';
  }
  slider('cbN', null, v => { n = v; if (sel > n) sel = null; draw(); });
});
