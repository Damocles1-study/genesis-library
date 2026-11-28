/* ---------- 尾声：方格岛（完整版） ---------- */
dev('#gameFig', fig => {
  const map = $('#gmMap'), bagEl = $('#gmBag'), say = $('.say', fig), boardEl = $('#gmBoard');
  const DIG = {'#': '石', 'T': '木', ':': '沙'}, BACK = {'石': '#', '木': 'T', '沙': ':'};
  const NEED = {'镐': {'石': 2, '木': 2}, '灯': {'沙': 2, '木': 1}};
  const KEY = 'genesis-tree-board';
  let g, me, face, mob, turn, bag, undo, won;
  const loadBoard = () => { try { const b = JSON.parse(localStorage.getItem(KEY) || 'null'); if (Array.isArray(b)) return b; } catch (e) {} return [31, 35, 42, 50, 61]; };
  const saveBoard = b => { try { localStorage.setItem(KEY, JSON.stringify(b)); } catch (e) {} };
  function reset(){ g = isleGrid(ISLAND); me = [7, 3]; face = [1, 0]; mob = [12, 6]; turn = 0; bag = new Map(); undo = []; won = false; draw('造一把镐和一盏灯。先往左走，去挖那几块石头。'); }
  const showBoard = (hl) => { const b = loadBoard(); boardEl.innerHTML = '<span class="dim" style="border:0">排行榜（步数）：</span>' + b.map((v, i) => '<span class="' + (i === hl ? 'hl' : '') + '">' + v + '<small>第 ' + (i + 1) + '</small></span>').join(''); };
  function draw(msg){
    isleDraw(map, g, {px: me[0], py: me[1], mobs: [mob], mark: (x, y) => x === me[0] + face[0] && y === me[1] + face[1] ? 'hl' : ''});
    const items = [...bag.entries()].filter(e => e[1] > 0);
    bagEl.innerHTML = '第 ' + turn + ' 步 · 背包：' + (items.length ? items.map(([k, v]) => '<span>' + k + ' × ' + v + '</span>').join('') : '<span class="dim" style="border:0">空</span>');
    if (msg) say.textContent = msg;
  }
  function bfsNext(){ const q = [mob], came = {}; came[mob.join()] = null; while (q.length) { const c = q.shift(); if (c[0] === me[0] && c[1] === me[1]) break; gridNb(g, c[0], c[1]).forEach(n => { const k = n.join(); if (!(k in came)) { came[k] = c.join(); q.push(n); } }); } let k = me.join(); if (!(k in came)) return null; let prev = null; while (came[k] !== null) { prev = k; k = came[k]; } return prev ? prev.split(',').map(Number) : null; }
  function move(dx, dy){
    if (won) return;
    face = [dx, dy]; const nx = me[0] + dx, ny = me[1] + dy;
    if (g[ny] && (g[ny][nx] === '.') && !(nx === mob[0] && ny === mob[1])) me = [nx, ny];
    turn++; let msg = '';
    if (turn % 3 === 0) { const n = bfsNext(); if (n) mob = n; if (mob[0] === me[0] && mob[1] === me[1]) { let best = null, most = 0; bag.forEach((v, k) => { if (v > most && !NEED[k]) { best = k; most = v; } }); if (best) { bag.set(best, most - 1); msg = '团团追上你，抱走了一个' + best + '，跑回家了！'; } else msg = '团团追上你，可你背包里没有原料，它跑回家了。'; mob = [12, 6]; } }
    draw(msg || (g[ny] && DIG[g[ny][nx]] ? '面前是' + DIG[g[ny][nx]] + '，按“挖”。' : ''));
  }
  function dig(){
    if (won) return;
    const fx = me[0] + face[0], fy = me[1] + face[1], t = g[fy] && g[fy][fx];
    if (!DIG[t]) { draw('面前（亮框的那格）没有能挖的。'); return; }
    g[fy][fx] = '.'; bag.set(DIG[t], (bag.get(DIG[t]) || 0) + 1); undo.push([fx, fy, t]);
    draw('挖到一个' + DIG[t] + '。背包用名字找格子（散列表）。');
  }
  function back(){ const u = undo.pop(); if (!u) { draw('没有可以撤销的挖。'); return; } g[u[1]][u[0]] = u[2]; bag.set(DIG[u[2]], Math.max(0, (bag.get(DIG[u[2]]) || 0) - 1)); draw('撤销了一次挖：从栈顶拿下一张卡片。'); }
  function craft(item){
    if (won) return;
    const need = NEED[item], lack = Object.keys(need).filter(k => (bag.get(k) || 0) < need[k]);
    if (lack.length) { draw('造' + item + '要：' + Object.keys(need).map(k => k + need[k]).join('、') + '。还差：' + lack.map(k => k + (need[k] - (bag.get(k) || 0))).join('、') + '。'); return; }
    Object.keys(need).forEach(k => bag.set(k, bag.get(k) - need[k])); bag.set(item, 1); undo = [];
    if (bag.get('镐') && bag.get('灯')) {
      won = true; const b = loadBoard(); let lo = 0, hi = b.length; while (lo < hi) { const m = (lo + hi) >> 1; if (b[m] < turn) lo = m + 1; else hi = m; } b.splice(lo, 0, turn); saveBoard(b.slice(0, 12));
      draw('完工！用了 ' + turn + ' 步。二分查找：排行榜第 ' + (lo + 1) + ' 名。'); showBoard(lo); return;
    }
    draw('造好了' + item + '（配方树后序算原料，拓扑排序排先后）。还差' + (item === '镐' ? '灯' : '镐') + '。');
  }
  $$('.pad button', fig).forEach(b => b.addEventListener('click', () => { const k = b.dataset.k; move(k === 'left' ? -1 : k === 'right' ? 1 : 0, k === 'up' ? -1 : k === 'down' ? 1 : 0); }));
  document.addEventListener('keydown', e => { if (e.target.closest && e.target.closest('input,textarea')) return; const r = fig.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; const m = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]}[e.key]; if (m) { e.preventDefault(); move(m[0], m[1]); } else if (e.key === 'x' || e.key === ' ') { e.preventDefault(); dig(); } });
  $('[data-x="dig"]', fig).addEventListener('click', dig);
  $('[data-x="undo"]', fig).addEventListener('click', back);
  $('[data-x="pick"]', fig).addEventListener('click', () => craft('镐'));
  $('[data-x="lamp"]', fig).addEventListener('click', () => craft('灯'));
  $('[data-x="new"]', fig).addEventListener('click', reset);
  showBoard(-1); reset();
});
