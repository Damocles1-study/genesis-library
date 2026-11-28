/* ---------- 主线：一台小机，一章装一个零件（2026-11-28 加） ----------
   每章末尾的 <div class="main" data-step="N"> 由 _build/base/main/boxes.py 插入；
   分步代码由 _build/base/main/make.py 生成到 base/main/：sNN.py（第 0—N 步的完整文件）、dNN.py（第 N 步新写的）、oNN.txt（运行结果）。
   “装好了”记在系列共用的 genesis-layer-log 里：G.d.flag['base-mN']。 */
const MAIN_N = 33;
const MAIN_PART = ['工作台', '开关排', '十六进制屏', '8 位钟面', '只用整数', '字表 ASCII', '8×8 屏幕', '运算器', '校验位',
  '与非门', '加法器', '寄存器', '16 格内存', '控制器', '汇编器', '节拍计数', '缓存',
  '名字和标签', '指针指令', '字串', '栈', '堆', '链接器', '装载器', '调试器',
  '内核', '进程', '页表', '文件系统', '锁', '电线和帧', '地址簿', '外壳'];
const MAIN_SKIP = [22, 23, 27];                 // 小学生可以先跳过的章
const MAIN_ADULT = [3, 4, 10, 11, 13, 17, 18];  // 第一层要大人陪着多一点的章
const MAIN_RAMP = [9, 12, 14, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31]; // 第二层开头有“入门版”的章
const mainDone = n => !!G.d.flag['base-m' + n];
const mPad = n => (n < 10 ? '0' : '') + n;
function mainBar(me){ let h = ''; for (let i = 0; i < MAIN_N; i++) h += '<i class="' + (mainDone(i) ? 'on' : '') + (i === me ? ' me' : '') + '" title="第 ' + i + ' 步 · ' + MAIN_PART[i] + '"></i>'; return h; }
function mEsc(s){ return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
$$('.main[data-step]').forEach(box => {
  const n = +box.dataset.step;
  const done = () => Object.keys(G.d.flag).filter(k => /^base-m\d+$/.test(k)).length;
  $('.mh', box).insertAdjacentHTML('beforeend', '<small>第 ' + n + ' / ' + (MAIN_N - 1) + ' 步</small>');
  const f = document.createElement('div'); f.className = 'mf';
  f.innerHTML = '<button class="btn" data-v="d">这一步的新代码</button><button class="btn" data-v="o">应该看到</button>' +
    '<a class="btn" href="main/s' + mPad(n) + '.py" download="xiaoji_s' + mPad(n) + '.py">到这一步的完整文件</a>' +
    '<button class="btn" data-x="done"></button><span class="mbar"></span><span class="mcnt"></span>';
  box.appendChild(f);
  const view = document.createElement('div'); view.className = 'mview'; view.hidden = true; box.appendChild(view);
  const b = $('[data-x="done"]', f);
  const show = () => { const on = mainDone(n); b.textContent = on ? '✓ 装好了' : '我装好了'; b.classList.toggle('done', on); $('.mbar', f).innerHTML = mainBar(n); $('.mcnt', f).textContent = '已装 ' + done() + ' / ' + MAIN_N; };
  box._show = show;
  b.addEventListener('click', () => { const k = 'base-m' + n; if (G.d.flag[k]) delete G.d.flag[k]; else G.d.flag[k] = TODAY(); G.save(); });
  let cur = '';
  $$('[data-v]', f).forEach(btn => btn.addEventListener('click', () => {
    const v = btn.dataset.v;
    if (cur === v) { view.hidden = true; cur = ''; return; }
    cur = v; view.hidden = false; view.innerHTML = '<p class="dim" style="font-size:13px">读取中……</p>';
    const url = 'main/' + (v === 'd' ? 'd' : 'o') + mPad(n) + (v === 'd' ? '.py' : '.txt');
    fetch(url).then(r => { if (!r.ok) throw 0; return r.text(); }).then(t => {
      view.innerHTML = '<pre class="' + (v === 'd' ? 'code' : 'out') + '" data-k="' + (v === 'd' ? 'xiaoji.py · 第 ' + n + ' 步新加的' : '运行 xiaoji_s' + mPad(n) + '.py') + '">' + mEsc(t) + '</pre>';
      const pre = $('pre', view);
      if (v === 'd') { const c = document.createElement('button'); c.className = 'cp'; c.type = 'button'; c.textContent = '复制'; c.addEventListener('click', () => { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { c.textContent = '已复制'; setTimeout(() => c.textContent = '复制', 1200); }, () => { c.textContent = '请手动选中'; }); }); pre.appendChild(c); }
    }).catch(() => { view.innerHTML = '<p class="dim" style="font-size:14px">读不到这个文件（直接双击打开网页时会这样）。可以点“到这一步的完整文件”下载，或者去 <code>base/main/</code> 文件夹里找。</p>'; });
  }));
  show();
});
/* 封面：小机装配图 */
dev('#kitFig', box => {
  const rows = [[0, 8, '第一部 · 位：数据'], [9, 16, '第二部 · 门：硬件'], [17, 24, '第三部 · 程：程序'], [25, 32, '第四部 · 系：系统和网络']];
  const draw = () => {
    let h = '';
    rows.forEach(r => { h += '<div class="kh">' + r[2] + '</div>'; for (let i = r[0]; i <= r[1]; i++) h += '<a href="' + href('c' + i) + '" class="' + (mainDone(i) ? 'on' : '') + '"><b>第 ' + i + ' 步</b>' + MAIN_PART[i] + '</a>'; });
    box.innerHTML = h;
    const say = $('#kitSay'); if (say) { const k = Object.keys(G.d.flag).filter(x => /^base-m\d+$/.test(x)).length; say.textContent = k ? '已经装好 ' + k + ' / ' + MAIN_N + ' 个零件。' + (k === MAIN_N ? '小机装好了！下一本《链与树》，在它的屏幕上做一个游戏。' : '') : '还没开始。从第零章末尾的“主线 · 第 0 步”开始。'; }
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
