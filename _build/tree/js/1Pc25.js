/* ---------- 第二十五—二十八章共用：排序的动画 ----------
   每个算法是一个生成器函数 gen(a, E)：直接改数组 a，同时往 E 里记事件：
   ['c', i, j] 比较；['s', i, j] 交换；['w', i, v] 写入；['k', i] 这一格排好了；['r', lo, hi] 正在处理的范围；['p', i] 标杆 */
const SORTS = {
  '插入': (a, E) => { for (let i = 1; i < a.length; i++) { const x = a[i]; let j = i - 1; while (j >= 0) { E.push(['c', j, j + 1]); if (a[j] > x) { a[j + 1] = a[j]; E.push(['w', j + 1, a[j]]); j--; } else break; } a[j + 1] = x; E.push(['w', j + 1, x]); } },
  '冒泡': (a, E) => { for (let end = a.length - 1; end > 0; end--) { let sw = false; for (let i = 0; i < end; i++) { E.push(['c', i, i + 1]); if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; E.push(['s', i, i + 1]); sw = true; } } E.push(['k', end]); if (!sw) break; } },
  '选择': (a, E) => { for (let i = 0; i < a.length - 1; i++) { let m = i; for (let j = i + 1; j < a.length; j++) { E.push(['c', m, j]); if (a[j] < a[m]) m = j; } if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; E.push(['s', i, m]); } E.push(['k', i]); } },
  '希尔': (a, E) => { for (let g = Math.floor(a.length / 2); g > 0; g = Math.floor(g / 2)) { for (let i = g; i < a.length; i++) { const x = a[i]; let j = i - g; while (j >= 0) { E.push(['c', j, j + g]); if (a[j] > x) { a[j + g] = a[j]; E.push(['w', j + g, a[j]]); j -= g; } else break; } a[j + g] = x; E.push(['w', j + g, x]); } } },
  '快速': (a, E, pick) => { const q = (lo, hi) => { if (lo >= hi) { if (lo === hi) E.push(['k', lo]); return; } E.push(['r', lo, hi]); if (pick === 'random') { const k = lo + Math.floor(Math.random() * (hi - lo + 1)); [a[lo], a[k]] = [a[k], a[lo]]; E.push(['s', lo, k]); } const p = a[lo]; E.push(['p', lo]); let i = lo, j = hi; while (i < j) { while (i < j) { E.push(['c', j, -1]); if (a[j] >= p) j--; else break; } a[i] = a[j]; E.push(['w', i, a[j]]); while (i < j) { E.push(['c', i, -1]); if (a[i] <= p) i++; else break; } a[j] = a[i]; E.push(['w', j, a[i]]); } a[i] = p; E.push(['w', i, p]); E.push(['k', i]); q(lo, i - 1); q(i + 1, hi); }; q(0, a.length - 1); },
  '归并': (a, E) => { const ms = (lo, hi) => { if (lo >= hi) return; const m = Math.floor((lo + hi) / 2); ms(lo, m); ms(m + 1, hi); E.push(['r', lo, hi]); const t = []; let i = lo, j = m + 1; while (i <= m && j <= hi) { E.push(['c', i, j]); if (a[i] <= a[j]) t.push(a[i++]); else t.push(a[j++]); } while (i <= m) t.push(a[i++]); while (j <= hi) t.push(a[j++]); t.forEach((v, k) => { a[lo + k] = v; E.push(['w', lo + k, v]); }); }; ms(0, a.length - 1); },
  '堆': (a, E) => { const n = a.length; const sink = (k, n) => { while (2 * k + 1 < n) { let c = 2 * k + 1; if (c + 1 < n) { E.push(['c', c, c + 1]); if (a[c + 1] > a[c]) c++; } E.push(['c', k, c]); if (a[k] >= a[c]) break; [a[k], a[c]] = [a[c], a[k]]; E.push(['s', k, c]); k = c; } }; for (let k = Math.floor(n / 2) - 1; k >= 0; k--) sink(k, n); for (let end = n - 1; end > 0; end--) { [a[0], a[end]] = [a[end], a[0]]; E.push(['s', 0, end]); E.push(['k', end]); sink(0, end); } E.push(['k', 0]); }
};
function sortViz(fig, names, opt){
  opt = opt || {};
  const box = $('.bars', fig), kvb = $('.kv', fig), say = $('.say', fig);
  let alg = names[0], data = 0, base, a, E, at, timer = null, cmp, wr, done, rng0 = rng(25);
  const N = opt.n || 16;
  const DATA = ['随机', '几乎排好', '倒着的', '很多一样的'];
  const make = () => { const r = []; for (let i = 0; i < N; i++) r.push(data === 0 ? 5 + Math.floor(rng0() * 95) : data === 1 ? 6 * i + 5 : data === 2 ? 100 - 6 * i : 10 + 20 * Math.floor(rng0() * 4)); if (data === 1) { const i = Math.floor(rng0() * (N - 1)); [r[i], r[i + 1]] = [r[i + 1], r[i]]; } return r; };
  function prep(fresh){ if (timer) clearInterval(timer); timer = null; if (fresh) base = make(); a = base.slice(); E = []; const t = a.slice(); SORTS[alg](t, E, opt.pick && opt.pick()); at = 0; cmp = 0; wr = 0; done = {}; draw(); say.textContent = (opt.hint && opt.hint(alg)) || '点“走一步”或“自己跑”。'; }
  function draw(hi){ hi = hi || {}; const mx = Math.max(...a, 1); box.innerHTML = a.map((v, i) => '<div class="br' + (hi[i] ? ' ' + hi[i] : '') + (done[i] ? ' ok' : '') + '" style="height:' + (10 + v / mx * 90) + '%"><span>' + v + '</span></div>').join(''); kv(kvb, [['比较', cmp], ['挪动（交换算两次）', wr], ['一共要', E.filter(e => e[0] === 'c').length + ' 次比较']]); }
  function step(){
    if (at >= E.length) { a.forEach((_, i) => done[i] = 1); draw(); say.textContent = '排好了：比较 ' + cmp + ' 次，挪动 ' + wr + ' 次。' + ((opt.end && opt.end(alg, cmp)) || ''); return false; }
    const e = E[at++], hi = {};
    if (e[0] === 'c') { cmp++; hi[e[1]] = 'cmp'; if (e[2] >= 0) hi[e[2]] = 'cmp'; }
    if (e[0] === 's') { [a[e[1]], a[e[2]]] = [a[e[2]], a[e[1]]]; wr += 2; hi[e[1]] = 'sw'; hi[e[2]] = 'sw'; }
    if (e[0] === 'w') { a[e[1]] = e[2]; wr++; hi[e[1]] = 'sw'; }
    if (e[0] === 'k') done[e[1]] = 1;
    if (e[0] === 'p') hi[e[1]] = 'piv';
    if (e[0] === 'r') { for (let i = e[1]; i <= e[2]; i++) hi[i] = 'rng'; }
    draw(hi); return true;
  }
  btnRow($('[data-a]', fig), names, 0, i => { alg = names[i]; prep(false); });
  btnRow($('[data-d]', fig), DATA, 0, i => { data = i; prep(true); });
  $('[data-x="s"]', fig).addEventListener('click', () => { if (!timer) step(); });
  $('[data-x="run"]', fig).addEventListener('click', () => { if (timer) { clearInterval(timer); timer = null; return; } timer = setInterval(() => { if (!step()) { clearInterval(timer); timer = null; } }, opt.speed || 70); });
  $('[data-x="r"]', fig).addEventListener('click', () => prep(true));
  return {prep, setAlg: n => { alg = n; prep(false); }};
}
dev('#sort1Fig', fig => {
  sortViz(fig, ['插入', '冒泡', '选择', '希尔'], {
    hint: a => ({'插入': '插入：像整理手里的牌，把每张牌往左插到合适的位置。', '冒泡': '冒泡：相邻两个比，大的往后换，每一趟把最大的“冒”到最后。', '选择': '选择：每一趟挑出最小的，放到前面。', '希尔': '希尔：先让隔得远的几个排一排，再缩小间隔，最后一趟就是普通的插入排序。'})[a],
    end: (a, c) => a === '选择' ? ' 选择排序不管数据长什么样，比较次数都一样。' : a === '插入' ? ' 换成“几乎排好”的数据再试，插入排序会快得多。' : ''
  }).prep(true);
});
