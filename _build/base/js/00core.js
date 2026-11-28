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
const PFILE = ['index', 'two', 'three', 'four'];
const PAGE = (() => { const m = location.pathname.match(/\/(two|three|four)\.html/); return m ? PFILE.indexOf(m[1]) + 1 : 1; })();
const READY = 2; // 已经写好的部数
const PURL = {}; PFILE.forEach((f, i) => PURL[i + 1] = i ? f + '.html' : './');
const PARTS = [
  {k: '位', s: '数据：数、字、图、声音都是比特 · 九章'},
  {k: '门', s: '硬件：从开关到处理器 · 八章'},
  {k: '程', s: '软件：C 程序怎样跑起来 · 八章'},
  {k: '系', s: '系统：操作系统和网络 · 八章'}
];
const CN = ['一', '二', '三', '四'];
const TOC = [
  {p: 1, t: '第一部 · 位 —— 一切都是比特'},
  {v: '序'},
  {id: 'c0', n: '楼', t: '五层楼', s: '一台计算机从上到下有几层；按下一个键以后发生了什么；这本书怎样分三层读；把 Mac 准备好'},
  {v: '卷一 · 数'},
  {id: 'c1', n: '开', t: '开和关', s: '一个比特、二进制怎样数数、位权；为什么偏偏是二进制；进制转换'},
  {id: 'c2', n: '字', t: '一个字节', s: '八个比特、十六进制、文件就是一串字节；KB 和 KiB；大端和小端；文件头的“魔数”'},
  {id: 'c3', n: '负', t: '负数', s: '原码、反码、补码，钟面和“模”；溢出；标志位、符号扩展；C 语言里有符号溢出为什么危险'},
  {id: 'c4', n: '点', t: '小数点', s: '二进制小数、0.1 写不尽；定点和浮点、IEEE 754；0.1 + 0.2；舍入、非规格化数和累加误差'},
  {v: '卷二 · 物'},
  {id: 'c5', n: '文', t: '文字', s: 'ASCII、国标码、Unicode 和 UTF-8；锟斤拷和烫烫烫；字符串的“长度”到底是多少'},
  {id: 'c6', n: '色', t: '图和声音', s: '像素和 RGB、分辨率；采样和量化、奈奎斯特；一张图、一首歌要多少字节；压缩'},
  {id: 'c7', n: '算', t: '位运算', s: '与、或、非、异或；布尔代数；掩码、移位；文件权限 rwx；几个常考的位技巧'},
  {id: 'c8', n: '错', t: '比特会翻', s: '噪声和奇偶校验；海明码；CRC 循环冗余校验；ECC 内存、二维码和宇宙射线'},
  {p: 2, t: '第二部 · 门 —— 从开关到处理器'},
  {v: '卷三 · 电路'},
  {id: 'c9', n: '管', t: '晶体管', s: '电压、电流和电阻；开关变成晶体管；CMOS 的非门、与非门；一块芯片里有多少个'},
  {id: 'c10', n: '合', t: '组合电路', s: '加法器、多路选择器、译码器、一个小 ALU；卡诺图'},
  {id: 'c11', n: '记', t: '时序电路', s: '锁存器、触发器、寄存器、时钟；有限状态机'},
  {v: '卷四 · 机器'},
  {id: 'c12', n: '存', t: '存储器', s: '地址和数据、内存怎样读写；字扩展和位扩展；SRAM 和 DRAM'},
  {id: 'c13', n: '机', t: '一台小机器', s: '取指、译码、执行；冯·诺依曼结构；一台只有十几条指令的模拟计算机'},
  {id: 'c14', n: '令', t: '指令和汇编', s: '指令格式和寻址方式；在 Mac 上看 arm64 汇编；精简和复杂指令集'},
  {id: 'c15', n: '流', t: '流水线', s: '五段流水线、冒险、分支预测'},
  {id: 'c16', n: '层', t: '存储层次', s: '局部性、缓存的三种映射；在 Mac 上测出缓存的大小'},
  {p: 3, t: '第三部 · 程 —— 程序怎样跑起来'},
  {v: '卷五 · C'},
  {id: 'c17', n: '始', t: '第一个 C 程序', s: 'clang、类型和 sizeof、printf'},
  {id: 'c18', n: '址', t: '地址和指针', s: '变量住在哪儿、取地址和解引用、指针的加减'},
  {id: 'c19', n: '组', t: '数组、字符串和结构体', s: '连续的内存、字符串结尾的 0、对齐'},
  {id: 'c20', n: '栈', t: '函数调用', s: '栈帧、参数和返回地址、递归为什么会爆栈'},
  {id: 'c21', n: '堆', t: '堆', s: 'malloc 和 free、内存泄漏、越界、用地址消毒器抓虫'},
  {v: '卷六 · 从源码到进程'},
  {id: 'c22', n: '译', t: '编译和链接', s: '预处理、编译、汇编、链接；符号表；静态库和动态库'},
  {id: 'c23', n: '载', t: '加载', s: '可执行文件的格式、程序怎样被放进内存、入口在哪儿'},
  {id: 'c24', n: '调', t: '调试', s: 'lldb：断点、单步、看寄存器和内存'},
  {p: 4, t: '第四部 · 系 —— 操作系统和网络'},
  {v: '卷七 · 操作系统'},
  {id: 'c25', n: '核', t: '内核和系统调用', s: '用户态和内核态、系统调用、在 Mac 上开一台 Linux'},
  {id: 'c26', n: '程', t: '进程和线程', s: '进程是什么、fork、调度'},
  {id: 'c27', n: '虚', t: '虚拟内存', s: '页和页表、地址翻译、缺页'},
  {id: 'c28', n: '档', t: '文件系统', s: 'inode、目录、APFS'},
  {id: 'c29', n: '并', t: '并发', s: '竞态、锁、死锁'},
  {v: '卷八 · 网络'},
  {id: 'c30', n: '包', t: '分层和包', s: '协议分层、ping 和 traceroute、抓包'},
  {id: 'c31', n: '址', t: 'IP、端口和 DNS', s: 'IP 地址、TCP 和 UDP、域名解析'},
  {v: '尾声'},
  {id: 'c32', n: '回', t: '按下回车以后', s: '在浏览器里输入网址按回车，全书走一遍；整张地图；下一本读什么'}
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
