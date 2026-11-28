/* ---------- 主线：方格岛，一章加一个功能 ----------
   每章末尾的 <div class="main" data-step="N"> 由 _build/tree/main/boxes.py 插入；
   分步代码由 _build/tree/main/make.py 生成到 tree/main/：sNN.py（第 0—N 步的完整文件）、dNN.py（第 N 步新写的）、oNN.txt（运行结果）。
   “做好了”记在系列共用的 genesis-layer-log 里：G.d.flag['tree-mN']。 */
const MAIN_N = 30;
const MAIN_PART = ['小岛地图', '计步器', '一长排格子', '鸭子队伍', '撤销和重做', '水流', '告示牌搜索', '油漆桶',
  '配方树', '算原料', '图鉴', '平衡的图鉴', '定时事件', '压缩存档', '数岛', '区块索引',
  '传送门', '团团追你', '省力的路', '修路', '合成顺序', '装背包', '最划算的背包',
  '自己的散列表', '查名次', '简单排序', '快速排序', '归并', '计数排序', '完工'];
const MAIN_SKIP = [];                 // 小学生可以先跳过的章
const MAIN_ADULT = [6, 11, 15];               // 第一层要大人陪着多一点的章
const MAIN_RAMP = [];                 // 第二层开头有“入门版”的章（这本书没有）
const mainDone = n => !!G.d.flag['tree-m' + n];
const mPad = n => (n < 10 ? '0' : '') + n;
function mainBar(me){ let h = ''; for (let i = 0; i < MAIN_N; i++) h += '<i class="' + (mainDone(i) ? 'on' : '') + (i === me ? ' me' : '') + '" title="第 ' + i + ' 步 · ' + MAIN_PART[i] + '"></i>'; return h; }
function mEsc(s){ return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
$$('.main[data-step]').forEach(box => {
  const n = +box.dataset.step;
  const done = () => Object.keys(G.d.flag).filter(k => /^tree-m\d+$/.test(k)).length;
  $('.mh', box).insertAdjacentHTML('beforeend', '<small>第 ' + n + ' / ' + (MAIN_N - 1) + ' 步</small>');
  const f = document.createElement('div'); f.className = 'mf';
  f.innerHTML = '<button class="btn" data-v="d">这一步的新代码</button><button class="btn" data-v="o">应该看到</button>' +
    '<a class="btn" href="main/s' + mPad(n) + '.py" download="island_s' + mPad(n) + '.py">到这一步的完整文件</a>' +
    '<button class="btn" data-x="done"></button><span class="mbar"></span><span class="mcnt"></span>';
  box.appendChild(f);
  const view = document.createElement('div'); view.className = 'mview'; view.hidden = true; box.appendChild(view);
  const b = $('[data-x="done"]', f);
  const show = () => { const on = mainDone(n); b.textContent = on ? '✓ 做好了' : '我做好了'; b.classList.toggle('done', on); $('.mbar', f).innerHTML = mainBar(n); $('.mcnt', f).textContent = '已做 ' + done() + ' / ' + MAIN_N; };
  box._show = show;
  b.addEventListener('click', () => { const k = 'tree-m' + n; if (G.d.flag[k]) delete G.d.flag[k]; else G.d.flag[k] = TODAY(); G.save(); });
  let cur = '';
  $$('[data-v]', f).forEach(btn => btn.addEventListener('click', () => {
    const v = btn.dataset.v;
    if (cur === v) { view.hidden = true; cur = ''; return; }
    cur = v; view.hidden = false; view.innerHTML = '<p class="dim" style="font-size:13px">读取中……</p>';
    const url = 'main/' + (v === 'd' ? 'd' : 'o') + mPad(n) + (v === 'd' ? '.py' : '.txt');
    fetch(url).then(r => { if (!r.ok) throw 0; return r.text(); }).then(t => {
      view.innerHTML = '<pre class="' + (v === 'd' ? 'code' : 'out') + '" data-k="' + (v === 'd' ? 'island.py · 第 ' + n + ' 步新加的' : '运行 island_s' + mPad(n) + '.py') + '">' + mEsc(t) + '</pre>';
      const pre = $('pre', view);
      if (v === 'd') { const c = document.createElement('button'); c.className = 'cp'; c.type = 'button'; c.textContent = '复制'; c.addEventListener('click', () => { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { c.textContent = '已复制'; setTimeout(() => c.textContent = '复制', 1200); }, () => { c.textContent = '请手动选中'; }); }); pre.appendChild(c); }
    }).catch(() => { view.innerHTML = '<p class="dim" style="font-size:14px">读不到这个文件（直接双击打开网页时会这样）。可以点“到这一步的完整文件”下载，或者去 <code>tree/main/</code> 文件夹里找。</p>'; });
  }));
  show();
});
/* 封面：方格岛的功能表 */
dev('#kitFig', box => {
  const rows = [[0, 7, '第一部 · 线'], [8, 15, '第二部 · 树'], [16, 22, '第三部 · 图'], [23, 29, '第四部 · 找']];
  const draw = () => {
    let h = '';
    rows.forEach(r => { h += '<div class="kh">' + r[2] + '</div>'; for (let i = r[0]; i <= r[1]; i++) h += chapPage['c' + i] > READY ? '<a class="soon" style="opacity:.5"><b>第 ' + i + ' 步</b>' + MAIN_PART[i] + '</a>' : '<a href="' + href('c' + i) + '" class="' + (mainDone(i) ? 'on' : '') + '"><b>第 ' + i + ' 步</b>' + MAIN_PART[i] + '</a>'; });
    box.innerHTML = h;
    const say = $('#kitSay'); if (say) { const k = Object.keys(G.d.flag).filter(x => /^tree-m\d+$/.test(x)).length; say.textContent = k ? '已经做好 ' + k + ' / ' + MAIN_N + ' 步。' + (k === MAIN_N ? '方格岛完工了！' : '') : '还没开始。从第零章末尾的“主线 · 第 0 步”开始。灰色的格子还在写。'; }
  };
  box._show = draw; draw();
});
/* 封面：读法里的章节小签 */
$$('.chips[data-route]').forEach(box => {
  const kind = box.dataset.route;
  box.innerHTML = chapList.map(x => {
    const n = +x.id.slice(1);
    let cls = 'k1', tag = '';
    if (kind === 'kid') { if (MAIN_SKIP.includes(n)) { cls = 'ks'; tag = ' · 先跳过'; } else if (MAIN_ADULT.includes(n)) { cls = 'ko'; tag = ' · 大人陪着'; } }
    if (kind === 'uni') { if (MAIN_RAMP.includes(n)) { cls = 'ko'; tag = ' · 先读入门版'; } else cls = ''; }
    return '<a class="' + cls + '" href="' + href(x.id) + '">' + n + ' ' + x.t + tag + '</a>';
  }).join('');
});
{ const _ra = refreshAchv; refreshAchv = function(){ _ra(); $$('.main[data-step]').forEach(b => b._show && b._show()); const k = $('#kitFig'); if (k && k._show) k._show(); }; }
