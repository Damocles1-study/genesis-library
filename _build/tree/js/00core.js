(function(){
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
/* 按钮一排：初始化时不调回调 */
const btnRow = (box, items, cur, cb) => {
  box.innerHTML = items.map((t, i) => '<button class="btn' + (i === cur ? ' on' : '') + '" data-i="' + i + '">' + t + '</button>').join('');
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', box).forEach(x => x.classList.toggle('on', x === b)); cb(+b.dataset.i); });
};
const dev = (sel, fn) => { const el = $(sel); if (el) { try { fn(el); } catch (err) { console.error(sel, err); } } };
const kv = (box, rows) => { box.innerHTML = rows.map(r => '<div>' + r[0] + '<b>' + r[1] + '</b></div>').join(''); };
function txt(x, y, t, o){ o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.s || 13) + '" fill="' + (o.c || 'var(--ink)') + '" text-anchor="' + (o.a || 'middle') + '"' + (o.w ? ' font-weight="700"' : '') + (o.mono ? ' font-family="IBM Plex Mono,monospace"' : '') + (o.halo === false ? '' : ' paint-order="stroke" stroke="' + (o.hc || 'var(--card)') + '" stroke-width="3.5" stroke-linejoin="round"') + '>' + t + '</text>'; }
/* 滑块：初始化时调一次回调，所以回调里用到的变量要先定义 */
function slider(id, f, cb){ const r = $('#' + id), o = $('#' + id + 'O'); const go = () => { if (o) o.textContent = f ? f(+r.value) : r.value; if (cb) cb(+r.value); }; r.addEventListener('input', go); go(); return () => +r.value; }
const pad = (s, n, c) => { s = String(s); while (s.length < n) s = (c || '0') + s; return s; };
const bin = (v, n) => pad((v >>> 0).toString(2), n).slice(-n);
const hex2 = v => pad((v & 255).toString(16).toUpperCase(), 2);
const grp = (s, k) => s.replace(new RegExp('(.{' + (k || 4) + '})(?=.)', 'g'), '$1 ');

/* ---------- 全书目录（四个网页共用） ---------- */
const BOOK = 'tree';   // 系列共用的本机记录里，id 前缀是 tree-
const PFILE = ['index', 'two', 'three', 'four'];
const PAGE = (() => { const m = location.pathname.match(/\/(two|three|four)\.html/); return m ? PFILE.indexOf(m[1]) + 1 : 1; })();
const READY = 1; // 已经写好的部数
const PURL = {}; PFILE.forEach((f, i) => PURL[i + 1] = i ? f + '.html' : './');
const PARTS = [
  {k: '线', s: '一个接一个：复杂度、数组、链表、栈、队列、字符串、递归 · 八章'},
  {k: '树', s: '一层管一层：二叉树、遍历、搜索树、堆、哈夫曼、并查集、B 树 · 八章'},
  {k: '图', s: '四通八达：图、搜索、最短路、生成树、拓扑排序、贪心、动态规划 · 七章'},
  {k: '找', s: '找得快，排得齐：散列、二分、七种排序 · 六章 + 尾声'}
];
const CN = ['一', '二', '三', '四'];
const TOC = [
  {p: 1, t: '第一部 · 线 —— 一个接一个'},
  {v: '序'},
  {id: 'c0', n: '岛', t: '方格岛', s: '什么是数据结构和算法；这本书的主线：在小机的屏幕上做一个方格小游戏；把 Python 和 C 准备好'},
  {v: '卷一 · 量与排'},
  {id: 'c1', n: '步', t: '数步数', s: '同一件事，有快有慢；数一数要走几步；大 O：常数、线性、平方、对数；时间和空间复杂度'},
  {id: 'c2', n: '排', t: '数组', s: '一排挨着的格子；下标为什么快、插入为什么慢；二维数组和地图；会长大的数组；特殊矩阵的压缩'},
  {id: 'c3', n: '链', t: '链表', s: '用纸条串起来的一串；单链表、双链表、循环链表；头插、尾插、逆置、快慢指针'},
  {v: '卷二 · 进与出'},
  {id: 'c4', n: '栈', t: '栈', s: '后进先出；撤销和重做；括号配对、表达式求值；出栈序列和卡特兰数'},
  {id: 'c5', n: '队', t: '队列', s: '先进先出；循环队列怎样判满判空；水一圈一圈地流开：广度优先的第一次见面'},
  {id: 'c6', n: '串', t: '字符串', s: '在一句话里找一个词；笨办法和 KMP；next 数组；字符串哈希'},
  {id: 'c7', n: '递', t: '递归和分治', s: '自己叫自己；油漆桶填色；把递归改成栈；分而治之和递推式'},
  {p: 2, t: '第二部 · 树 —— 一层管一层'},
  {v: '卷三 · 枝'},
  {id: 'c8', n: '树', t: '树和二叉树', s: '根、叶、度、深度；二叉树的几条性质；用数组和用纸条存一棵树；合成配方是一棵树'},
  {id: 'c9', n: '遍', t: '遍历', s: '先序、中序、后序、层序；从两种遍历还原一棵树；表达式树；线索二叉树'},
  {id: 'c10', n: '查', t: '二叉搜索树', s: '左小右大；查找、插入、删除；为什么会退化成一根棍'},
  {id: 'c11', n: '衡', t: '平衡树', s: 'AVL 和四种旋转；红黑树的五条规矩；为什么数据库不用它们'},
  {v: '卷四 · 根'},
  {id: 'c12', n: '堆', t: '堆和优先队列', s: '最小的总在最上面；上浮和下沉；建堆为什么是线性的；定时事件和前 k 大'},
  {id: 'c13', n: '码', t: '哈夫曼编码', s: '常用的字用短码；贪心地合并；前缀码和带权路径长度；压缩一份存档'},
  {id: 'c14', n: '集', t: '并查集', s: '数一数有几座岛；查找和合并；路径压缩和按秩合并'},
  {id: 'c15', n: '页', t: 'B 树和 B+ 树', s: '硬盘喜欢一次读一大块；多路搜索树；分裂和合并；数据库和文件系统的索引'},
  {p: 3, t: '第三部 · 图 —— 四通八达'},
  {v: '卷五 · 网'},
  {id: 'c16', n: '图', t: '图怎样存', s: '点和边、有向和无向、带权；邻接矩阵和邻接表；方格地图也是一张图'},
  {id: 'c17', n: '搜', t: '广度和深度', s: '广度优先和深度优先；连通分量；最少几步走到'},
  {id: 'c18', n: '路', t: '最短路径', s: '迪杰斯特拉、弗洛伊德；负权边；A* 和启发式'},
  {id: 'c19', n: '桥', t: '最小生成树', s: '用最少的路把村子连起来；普里姆和克鲁斯卡尔'},
  {id: 'c20', n: '序', t: '拓扑排序和关键路径', s: '先做什么后做什么；有向无环图；最早和最晚开工时间'},
  {v: '卷六 · 招'},
  {id: 'c21', n: '贪', t: '贪心和回溯', s: '每一步拣眼前最好的；什么时候贪心是对的；走不通就退回来'},
  {id: 'c22', n: '规', t: '动态规划', s: '把算过的记下来；背包、最长公共子序列、走格子；面试最怕的题怎样拆'},
  {p: 4, t: '第四部 · 找 —— 找得快，排得齐'},
  {v: '卷七 · 找'},
  {id: 'c23', n: '散', t: '散列表', s: '把名字变成格子号；冲突怎么办；装填因子；Python 的字典'},
  {id: 'c24', n: '分', t: '查找', s: '顺序查找、二分查找、分块查找；平均查找长度；二分的边界怎样写对'},
  {v: '卷八 · 排'},
  {id: 'c25', n: '排', t: '简单排序', s: '插入、冒泡、选择、希尔；稳定不稳定；比较和交换各几次'},
  {id: 'c26', n: '快', t: '快速排序', s: '挑一个，分两边；最坏情况和随机化；第 k 小'},
  {id: 'c27', n: '归', t: '归并排序', s: '对半分，再合起来；外部排序：内存装不下怎么办'},
  {id: 'c28', n: '桶', t: '堆排序和不比较的排序', s: '堆排序；计数排序和基数排序；为什么比较排序最快也要 n log n'},
  {v: '尾声'},
  {id: 'c29', n: '回', t: '方格岛完工', s: '把所有零件装在一起；全书地图；面试题怎样答；下一本读什么'}
];
const chapPage = {}; { let p = 1; TOC.forEach(x => { if (x.p) p = x.p; if (x.id) chapPage[x.id] = p; }); }
const href = id => (chapPage[id] === PAGE ? '' : PURL[chapPage[id]]) + '#' + id;
const chapList = TOC.filter(x => x.id);
dev('.bar .parts', nav => { nav.innerHTML = PARTS.map((x, i) => '<a href="' + PURL[i + 1] + '" data-p="' + (i + 1) + '" title="第' + CN[i] + '部 · ' + x.k + '">' + x.k + '</a>').join('');
  $$('a', nav).forEach(a => { const p = +a.dataset.p; a.classList.toggle('on', p === PAGE); if (p > READY) { a.removeAttribute('href'); a.style.opacity = .4; a.title = '写作中'; } }); });
$$('.partnav').forEach(box => { box.innerHTML = PARTS.map((x, i) => '<a ' + (i + 1 > READY ? 'class="soon"' : 'href="' + PURL[i + 1] + '"' + (i + 1 === PAGE ? ' class="on"' : '')) + '><span class="k">第' + CN[i] + '部</span><b>' + x.k + '</b><small>' + x.s + (i + 1 > READY ? ' · 写作中' : '') + '</small></a>').join(''); });
$('#drawerList').innerHTML = TOC.map(x => x.p ? '<li class="ph">' + x.t + '</li>' : x.v ? '<li class="vh">' + x.v + '</li>' :
  chapPage[x.id] > READY ? '<li><a style="opacity:.5;pointer-events:none"><span class="n">' + x.n + '</span><span>' + x.t + '<small>写作中</small></span></a></li>' :
  '<li><a href="' + href(x.id) + '"' + (chapPage[x.id] === PAGE ? ' class="here"' : '') + '><span class="n">' + x.n + '</span><span>' + x.t + '<small>' + x.s + '</small></span></a></li>').join('');
dev('#toc', ul => {
  ul.innerHTML = TOC.map(x => x.p ? '<li class="vh" style="color:var(--main)">' + x.t + '</li>' : x.v ? '<li class="vh">' + x.v + '</li>' :
    chapPage[x.id] > READY ? '<li class="soon"><div><span class="n">' + x.n + '</span><span class="t">' + x.t + '<small>' + x.s + ' · 写作中</small></span></div></li>' :
    '<li' + (chapPage[x.id] === PAGE ? '' : ' class="away"') + '><a href="' + href(x.id) + '"><span class="n">' + x.n + '</span><span class="t">' + x.t + '<small>' + x.s + '</small></span></a></li>').join('');
});
/* 页面里写 <a data-c="c12">…</a>，自动拼出跨页链接；没写好的部变灰 */
$$('a[data-c]').forEach(a => { const id = a.dataset.c; if (chapPage[id] > READY) { a.removeAttribute('href'); a.title = '写作中'; a.style.textDecorationStyle = 'dotted'; } else a.href = href(id); });

/* ---------- 页眉：卷名、进度、目录抽屉 ---------- */
const barVol = $('#barVol'), prog = $('#prog');
const vols = $$('[data-vol]');
let ticking = false;
function onScroll(){
  ticking = false;
  const lim = innerHeight * 0.35; let cur = null;
  for (const e of vols) { if (e.getBoundingClientRect().top < lim) cur = e; else break; }
  barVol.textContent = cur ? cur.dataset.vol : '序';
  const H = document.documentElement.scrollHeight - innerHeight;
  prog.style.width = (H > 0 ? scrollY / H * 100 : 0) + '%';
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, {passive: true});
onScroll();
const drawer = $('#drawer');
function openD(on){ drawer.classList.toggle('on', on); drawer.setAttribute('aria-hidden', on ? 'false' : 'true'); }
$('#tocBtn').addEventListener('click', () => openD(true));
drawer.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target.closest('a')) openD(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') openD(false); });

/* ---------- 三层 ----------
   <section class="ly" data-l="2"><div class="lyh"><b>…</b><span class="tg">…</span><span class="tm">约 30 分钟</span><span class="sum">收起时显示的一句话</span></div><div class="lyb">…</div></section>
   html[data-depth] 决定默认展开到哪一层；没展开的层可以单独点开。 */
const LNAME = {1: '第一层 · 入门', 2: '第二层 · 本科', 3: '第三层 · 深入'};
function setDepth(d){ d = String(clamp(+d || 1, 1, 3)); document.documentElement.dataset.depth = d; try { localStorage.setItem('genesis-layer', d); } catch (e) {} $$('.who button').forEach(b => b.classList.toggle('on', b.dataset.d === d)); }
$$('.depth button').forEach(b => b.addEventListener('click', () => setDepth(b.dataset.d)));
$$('.who button').forEach(b => { b.classList.toggle('on', b.dataset.d === document.documentElement.dataset.depth); b.addEventListener('click', () => setDepth(b.dataset.d)); });
$$('.ly').forEach(ly => {
  const h = $('.lyh', ly); if (!h) return;
  const b = document.createElement('button'); b.className = 'open'; b.textContent = '展开这一层';
  b.addEventListener('click', () => { const on = !ly.classList.contains('open'); ly.classList.toggle('open', on); b.textContent = on ? '收起' : '展开这一层'; });
  h.appendChild(b);
});
/* 章首的“三层”小标签：点了跳到那一层并展开 */
$$('.lvs a[data-l]').forEach(a => a.addEventListener('click', () => { const t = $(a.getAttribute('href')); if (t && t.classList.contains('ly')) { t.classList.add('open'); const b = $('.lyh .open', t); if (b) b.textContent = '收起'; } }));
/* 第一层结尾的“可以停”：自动接上下一章 */
$$('.stop').forEach(s => {
  const sec = s.closest('.chap'); const i = chapList.findIndex(x => x.id === (sec && sec.id));
  const nx = chapList[i + 1];
  if (nx && chapPage[nx.id] <= READY) s.insertAdjacentHTML('beforeend', ' <a href="' + href(nx.id) + '">去下一章：' + nx.t + ' →</a>');
});
/* 代码框：复制按钮（只给要输入的框；输出框 .out 不加） */
$$('pre.sh, pre.code').forEach(p => {
  const b = document.createElement('button'); b.className = 'cp'; b.textContent = '复制'; b.type = 'button';
  b.addEventListener('click', () => {
    const lines = [...p.childNodes].filter(n => n !== b).map(n => n.textContent).join('');
    const t = p.classList.contains('sh') ? lines.split('\n').filter(l => /^\s*% /.test(l)).map(l => l.replace(/^\s*% /, '')).join('\n') || lines : lines;
    (navigator.clipboard ? navigator.clipboard.writeText(t.trim()) : Promise.reject()).then(() => { b.textContent = '已复制'; setTimeout(() => b.textContent = '复制', 1200); }, () => { b.textContent = '请手动选中'; });
  });
  p.appendChild(b);
});

/* ---------- 念英文 ---------- */
let enVoice = null;
const hasTTS = 'speechSynthesis' in window;
function pickVoice(){ if (!hasTTS) return; const vs = speechSynthesis.getVoices(); enVoice = vs.find(v => /en[-_]US/i.test(v.lang) && /Samantha|Google US|Aaron|Nicky/i.test(v.name)) || vs.find(v => /en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null; }
if (hasTTS) { pickVoice(); try { speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) {} }
function speak(text, el){
  if (!hasTTS) { if (el) el.title = '这个浏览器不会念'; return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(String(text)); u.lang = 'en-US'; if (enVoice) u.voice = enVoice; u.rate = .85;
  if (el) { el.classList.add('speaking'); u.onend = u.onerror = () => el.classList.remove('speaking'); }
  speechSynthesis.speak(u);
}
document.addEventListener('click', e => { const el = e.target.closest('[data-say]'); if (!el) return; e.preventDefault(); speak(el.dataset.say || el.textContent.trim(), el); });

/* ---------- 本机记录：任务、闯关（整个系列共用一个键） ---------- */
const GKEY = 'genesis-layer-log';
const TODAY = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
const G = (() => {
  let d = {};
  try { d = JSON.parse(localStorage.getItem(GKEY) || '{}') || {}; } catch (e) { d = {}; }
  ['task', 'quiz', 'flag'].forEach(k => { if (!d[k] || typeof d[k] !== 'object' || Array.isArray(d[k])) d[k] = {}; });
  const save = () => { try { localStorage.setItem(GKEY, JSON.stringify(d)); } catch (e) {} refreshAchv(); };
  return {d, save};
})();
$$('.task[data-id]').forEach(t => {
  const id = t.dataset.id, f = document.createElement('div'); f.className = 'tf';
  f.innerHTML = '<button class="btn">我做完了</button><small></small>';
  t.appendChild(f);
  const b = $('button', f), sm = $('small', f);
  const show = () => { const on = !!G.d.task[id]; t.classList.toggle('isdone', on); b.classList.toggle('done', on); b.textContent = on ? '✓ 做完了' : '我做完了'; sm.textContent = on ? '记在这台电脑的浏览器里，再点一下可以取消。' : '真的在电脑上做完了再点。'; };
  b.addEventListener('click', () => { if (G.d.task[id]) delete G.d.task[id]; else G.d.task[id] = TODAY(); G.save(); show(); });
  show();
});
/* 闯关：
   <div class="pass" data-id="base-q1a">
     <div class="qq" data-a="1"><p>题目</p><ol><li>选项0</li><li>选项1</li></ol><p class="ex">讲解</p></div>
     <div class="qq" data-in="答案|另一种写法"><p>填空题</p><p class="ex">讲解</p></div>
   </div> */
const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, ' ').replace(/[，]/g, ',').replace(/[（]/g, '(').replace(/[）]/g, ')').replace(/[－—]/g, '-');
$$('.pass[data-id]').forEach(box => {
  const id = box.dataset.id, qs = $$('.qq', box);
  const body = document.createElement('div'); body.className = 'pb';
  qs.forEach(q => body.appendChild(q));
  const ly = box.closest('.ly');
  box.innerHTML = '<div class="ph">闯关' + (ly ? ' · ' + LNAME[ly.dataset.l].split(' · ')[0] : '') + '<span class="sc"></span></div>';
  box.appendChild(body);
  const foot = document.createElement('div'); foot.className = 'pf'; box.appendChild(foot);
  const st = qs.map(() => ({done: false, first: null}));
  const upd = () => {
    const done = st.filter(x => x.done).length, first = st.filter(x => x.first === true).length;
    $('.sc', box).textContent = done + ' / ' + qs.length;
    if (done === qs.length) {
      if (!G.d.quiz[id] || (G.d.quiz[id].f || 0) < first) { G.d.quiz[id] = {n: qs.length, f: Math.max(first, (G.d.quiz[id] || {}).f || 0), d: TODAY()}; G.save(); }
      box.classList.add('ok');
      foot.innerHTML = '过关！第一次就答对 <b>' + first + '</b> 题，共 ' + qs.length + ' 题。' + (first === qs.length ? '全对。' : '答错的回正文找一找，过几天再做一遍。') + ' <button class="btn" data-re>再做一遍</button>';
    } else foot.innerHTML = (G.d.quiz[id] ? '以前过过这一关（第一次答对 ' + G.d.quiz[id].f + ' / ' + G.d.quiz[id].n + '）。' : '') + '答错了看讲解，再选一次。';
  };
  qs.forEach((q, i) => {
    const p = $('p', q); if (p) p.insertAdjacentHTML('afterbegin', '<b class="n">Q' + (i + 1) + '</b>');
    const ex = $('.ex', q);
    const finish = ok => { if (st[i].first === null) st[i].first = ok; if (ok) st[i].done = true; q.classList.add('shown'); upd(); };
    if (q.dataset.in !== undefined) {
      const ans = q.dataset.in.split('|').map(norm);
      const row = document.createElement('div'); row.className = 'inrow';
      row.innerHTML = '<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="在这里填答案"><button class="btn">对答案</button>';
      q.insertBefore(row, ex);
      const inp = $('input', row);
      const check = () => { if (st[i].done || !inp.value.trim()) return; const ok = ans.includes(norm(inp.value)); inp.classList.toggle('right', ok); inp.classList.toggle('wrong', !ok); finish(ok); };
      $('button', row).addEventListener('click', check);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    } else {
      const ol = $('ol', q), a = +q.dataset.a;
      const ops = document.createElement('div'); ops.className = 'ops';
      $$('li', ol).forEach((li, k) => { const b = document.createElement('button'); b.innerHTML = li.innerHTML; b.dataset.k = k; ops.appendChild(b); });
      ol.replaceWith(ops);
      ops.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || st[i].done || b.classList.contains('wrong')) return; const ok = +b.dataset.k === a; b.classList.add(ok ? 'right' : 'wrong'); finish(ok); });
    }
  });
  foot.addEventListener('click', e => { if (!e.target.closest('[data-re]')) return; st.forEach(x => { x.done = false; x.first = null; }); qs.forEach(q => { q.classList.remove('shown'); $$('.ops button', q).forEach(b => b.classList.remove('right', 'wrong')); const inp = $('input', q); if (inp) { inp.value = ''; inp.classList.remove('right', 'wrong'); } }); box.classList.remove('ok'); upd(); });
  upd();
});
function refreshAchv(){
  $$('.achv').forEach(box => {
    const tk = $$('.task[data-id]'), out = [];
    out.push('<div><b>' + tk.filter(t => G.d.task[t.dataset.id]).length + ' / ' + tk.length + '</b>这一部做完的任务</div>');
    [1, 2, 3].forEach(l => { const qz = $$('.ly[data-l="' + l + '"] .pass[data-id]'); if (qz.length) out.push('<div><b>' + qz.filter(q => G.d.quiz[q.dataset.id]).length + ' / ' + qz.length + '</b>这一部' + LNAME[l].split(' · ')[0] + '的关</div>'); });
    out.push('<div><b>' + Object.keys(G.d.quiz).length + '</b>整个系列过的关</div>');
    box.innerHTML = out.join('');
  });
}
refreshAchv();

/* 章首的课程标签：组成 系统 网络 结构 数学 物理 */
const COURSES = [['组成', '计算机组成'], ['系统', '操作系统'], ['网络', '计算机网络'], ['结构', '数据结构'], ['数学', '数学'], ['物理', '物理和电']];
$$('.crs').forEach(w => { const on = (w.dataset.c || '').split(/\s+/); w.innerHTML = '<span style="border:0;padding-left:0">对应：</span>' + COURSES.map(c => '<span' + (on.includes(c[0]) ? ' class="on"' : '') + ' title="' + c[1] + '">' + c[0] + '</span>').join(''); });

/* ---------- 装置小件 ---------- */
/* 一排可点的比特：opt = {n, val, labels(i)->小字, cls(i)->额外类名, onChange(val)}；返回 {get, set} */
function bitRow(box, opt){
  const n = opt.n; let v = opt.val || 0;
  const draw = () => { box.innerHTML = Array.from({length: n}, (_, k) => { const i = n - 1 - k, on = (v >>> i) & 1; return '<button class="bit' + (on ? ' on' : '') + (opt.cls ? ' ' + (opt.cls(i) || '') : '') + '" data-i="' + i + '" aria-label="第 ' + i + ' 位，现在是 ' + on + '"><b>' + on + '</b><small>' + (opt.labels ? opt.labels(i) : '') + '</small></button>'; }).join(''); };
  box.classList.add('bitrow');
  box.addEventListener('click', e => { const b = e.target.closest('.bit'); if (!b) return; v = (v ^ (1 << +b.dataset.i)) >>> 0; if (n < 32) v &= (2 ** n - 1); draw(); if (opt.onChange) opt.onChange(v); });
  draw();
  return {get: () => v, set: x => { v = n < 32 ? (x >>> 0) & (2 ** n - 1) : x >>> 0; draw(); }};
}

/* ---------- 方格岛：全书共用的地图 ---------- */
const ISLAND = [
  '~~~~~~~~~~~~~~~~',
  '~~....TT..::~~~~',
  '~...T.....:::~~~',
  '~..##..@...::~~~',
  '~..###......~~~~',
  '~~..~~~.....T.~~',
  '~~..~~~..T....~~',
  '~~~.......##..~~',
  '~~~~~::....~~~~~',
  '~~~~~~~~~~~~~~~~'
];
const TILE = {'~': '水', '.': '草', '#': '石', 'T': '树', ':': '沙', '=': '路', 'H': '屋'};
const isleGrid = rows => rows.map(r => r.replace('@', '.').split(''));
/* 画一张方格地图。opt：{px, py 你的位置, ducks:[[x,y]], mobs:[[x,y]], mark(x,y)->类名, label(x,y)->小字, click(x,y)} */
function isleDraw(box, grid, opt){
  opt = opt || {};
  const H = grid.length, W = grid[0].length;
  box.classList.add('isle'); box.style.setProperty('--w', W);
  const duck = {}, mob = {};
  (opt.ducks || []).forEach(d => duck[d[0] + ',' + d[1]] = 1);
  (opt.mobs || []).forEach(d => mob[d[0] + ',' + d[1]] = 1);
  let h = '';
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = grid[y][x], k = x + ',' + y;
    let cls = '', lab = '';
    if (opt.px === x && opt.py === y) { cls = 'me'; lab = '你'; }
    else if (duck[k]) { cls = 'duck'; lab = '鸭'; }
    else if (mob[k]) { cls = 'mob'; lab = '团'; }
    if (opt.mark) { const m = opt.mark(x, y); if (m) cls += ' ' + m; }
    if (opt.label) { const l = opt.label(x, y); if (l !== undefined && l !== null && l !== '') lab = l; }
    h += '<i data-t="' + (t === '"' ? '' : t) + '" data-x="' + x + '" data-y="' + y + '" class="' + cls + '" title="' + (TILE[t] || '') + ' (' + x + ', ' + y + ')">' + lab + '</i>';
  }
  box.innerHTML = h;
  if (opt.click && !box._clk) { box._clk = 1; box.classList.add('click'); box.addEventListener('click', e => { const c = e.target.closest('i[data-x]'); if (c) box._onclick(+c.dataset.x, +c.dataset.y); }); }
  if (opt.click) box._onclick = opt.click;
}
const isleLegend = keys => '<div class="legend">' + keys.map(k => '<span style="--c:var(' + ({'.': '--t-g', '~': '--t-w', '#': '--t-s', 'T': '--t-t', ':': '--t-d', '@': '--t-p', 'd': '--t-k', 'o': '--t-o', '=': '--t-r'}[k]) + ')">' + ({'@': '你', 'd': '鸭子', 'o': '团团'}[k] || TILE[k]) + '</span>').join('') + '</div>';
