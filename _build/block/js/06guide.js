/* ================= 指南公共件（第五部起）=================
   G：本机记录（任务、闯关、复习卡、错题本），只存在这台电脑的浏览器里
   speak()：用浏览器自带的声音念英文
   .sub 科目条、.task 任务卡、.pass 闯关自测、.achv 成就条、.wgrid 词卡、.srsbox 复习台 */
const GKEY = 'genesis-block-guide';
const G = (() => {
  let d = {};
  try { d = JSON.parse(localStorage.getItem(GKEY) || '{}') || {}; } catch (e) { d = {}; }
  ['task', 'quiz', 'srs', 'flag'].forEach(k => { if (!d[k] || typeof d[k] !== 'object' || Array.isArray(d[k])) d[k] = {}; });
  if (!Array.isArray(d.bug)) d.bug = [];
  const save = () => { try { localStorage.setItem(GKEY, JSON.stringify(d)); } catch (e) {} refreshAchv(); };
  return {d, save};
})();
const TODAY = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);

/* ---------- 念英文 ---------- */
let enVoice = null;
const hasTTS = 'speechSynthesis' in window;
function pickVoice(){
  if (!hasTTS) return;
  const vs = speechSynthesis.getVoices();
  enVoice = vs.find(v => /en[-_]US/i.test(v.lang) && /Samantha|Google US|Aaron|Nicky/i.test(v.name)) || vs.find(v => /en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
}
if (hasTTS) { pickVoice(); try { speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) {} }
const sayText = t => String(t).replace(/^minecraft:/, '').replace(/[_]/g, ' ').replace(/^\//, '').replace(/[~^@]/g, ' ');
function speak(text, el, rate){
  if (!hasTTS) { if (el) { el.title = '这个浏览器不会念，换 Safari 或 Chrome 试试'; } return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(sayText(text));
  u.lang = 'en-US'; if (enVoice) u.voice = enVoice; u.rate = rate || .82;
  if (el) { el.classList.add('speaking'); u.onend = u.onerror = () => el.classList.remove('speaking'); }
  speechSynthesis.speak(u);
}
document.addEventListener('click', e => { const el = e.target.closest('[data-say]'); if (!el) return; e.preventDefault(); speak(el.dataset.say || el.textContent.trim(), el); });

/* ---------- 章首科目条 ---------- */
const SUBJ = [['机', 'Mac', '--stone'], ['令', '指令', '--main'], ['英', '英语', '--blu'], ['数', '数学', '--ter'], ['理', '物理', '--dia'], ['程', '编程', '--pur']];
$$('.sub').forEach(w => { const on = (w.dataset.s || '').split(/\s+/); w.innerHTML = SUBJ.map(f => '<span' + (on.includes(f[0]) ? ' class="on" style="--c:var(' + f[2] + ')"' : '') + '><b>' + f[0] + '</b>' + f[1] + '</span>').join(''); w.setAttribute('aria-label', '这一章能学到：' + SUBJ.filter(f => on.includes(f[0])).map(f => f[1]).join('、')); });

/* ---------- 任务卡 ---------- */
$$('.task[data-id]').forEach(t => {
  const id = t.dataset.id, f = document.createElement('div'); f.className = 'tf';
  f.innerHTML = '<button class="btn">我做完了</button><small></small>';
  t.appendChild(f);
  const b = $('button', f), sm = $('small', f);
  const show = () => { const on = !!G.d.task[id]; t.classList.toggle('isdone', on); b.classList.toggle('done', on); b.textContent = on ? '✓ 做完了' : '我做完了'; sm.textContent = on ? '记在这台电脑的浏览器里。再点一下可以取消。' : '真的在电脑上做完了再点。'; };
  b.addEventListener('click', () => { if (G.d.task[id]) delete G.d.task[id]; else G.d.task[id] = TODAY(); G.save(); show(); });
  show();
});

/* ---------- 闯关自测 ----------
   <div class="pass" data-id="q33">
     <div class="qq" data-a="1"><p>题目</p><ol><li>选项0</li><li>选项1</li></ol><p class="ex">讲解</p></div>
     <div class="qq" data-in="答案|另一种写法"><p>填空题</p><p class="ex">讲解</p></div>
   </div> */
const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, ' ').replace(/[，]/g, ',').replace(/[（]/g, '(').replace(/[）]/g, ')');
$$('.pass[data-id]').forEach(box => {
  const id = box.dataset.id, qs = $$('.qq', box);
  const body = document.createElement('div'); body.className = 'pb';
  qs.forEach(q => body.appendChild(q));
  box.innerHTML = '<div class="ph">闯关自测<span class="sc"></span></div>';
  box.appendChild(body);
  const foot = document.createElement('div'); foot.className = 'pf'; box.appendChild(foot);
  const st = qs.map(() => ({done: false, first: null}));
  const upd = () => {
    const done = st.filter(x => x.done).length, first = st.filter(x => x.first === true).length;
    $('.sc', box).textContent = done + ' / ' + qs.length;
    if (done === qs.length) {
      const best = Math.max(first, (G.d.quiz[id] || {}).f || 0);
      if (!G.d.quiz[id] || (G.d.quiz[id].f || 0) < first) { G.d.quiz[id] = {n: qs.length, f: best, d: TODAY()}; G.save(); }
      box.classList.add('ok');
      foot.innerHTML = '过关！第一次就答对 <b>' + first + '</b> 题，共 ' + qs.length + ' 题。' + (first === qs.length ? '全对，太厉害了。' : '答错的那几题，回到正文找一找，过几天再来做一遍。') + ' <button class="btn" data-re>再做一遍</button>';
    } else foot.innerHTML = (G.d.quiz[id] ? '以前过过这一关（第一次答对 ' + G.d.quiz[id].f + ' / ' + G.d.quiz[id].n + '）。' : '') + '答错了没关系，看讲解，再选一次。';
  };
  qs.forEach((q, i) => {
    const p = $('p', q); if (p) p.insertAdjacentHTML('afterbegin', '<b class="n">Q' + (i + 1) + '</b>');
    const ex = $('.ex', q);
    const finish = ok => { if (st[i].first === null) st[i].first = ok; if (ok) { st[i].done = true; } q.classList.add('shown'); upd(); };
    if (q.dataset.in !== undefined) {
      const ans = q.dataset.in.split('|').map(norm);
      const row = document.createElement('div'); row.className = 'inrow';
      row.innerHTML = '<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="在这里填答案"><button class="btn">对答案</button>';
      q.insertBefore(row, ex);
      const inp = $('input', row);
      const check = () => { if (st[i].done || !inp.value.trim()) return; const ok = ans.includes(norm(inp.value)); inp.classList.toggle('right', ok); inp.classList.toggle('wrong', !ok); finish(ok); if (!ok && ex && !ex.dataset.t) { ex.dataset.t = 1; } };
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

/* ---------- 成就条 ---------- */
function refreshAchv(){
  $$('.achv').forEach(box => {
    const tk = $$('.task[data-id]'), qz = $$('.pass[data-id]');
    const srs = Object.values(G.d.srs), sure = srs.filter(x => x.b >= 4).length;
    const pageT = tk.filter(t => G.d.task[t.dataset.id]).length, pageQ = qz.filter(q => G.d.quiz[q.dataset.id]).length;
    box.innerHTML = (tk.length ? '<div><b>' + pageT + ' / ' + tk.length + '</b>这一部做完的任务</div>' : '') + (qz.length ? '<div><b>' + pageQ + ' / ' + qz.length + '</b>这一部过的关</div>' : '') +
      '<div><b>' + Object.keys(G.d.task).length + '</b>全书做完的任务</div><div><b>' + Object.keys(G.d.quiz).length + '</b>全书过的关</div><div><b>' + srs.length + '</b>复习台里的单词</div><div><b>' + sure + '</b>记牢的单词</div>';
  });
}
refreshAchv();

/* ---------- 词卡 ----------
   WORDS 在 05words.js：[英文, 中文, 类别, 小字说明]
   <div class="wgrid" data-cat="block"></div>，前面可放 <div class="wtools" data-for="..."></div> */
const BTMAP = {grass_block: 'grass', dirt: 'dirt', stone: 'stone', oak_log: 'log', oak_planks: 'plank', oak_leaves: 'leaf', sand: 'sand', water: 'water', glass: 'glass', redstone_ore: 'rs', diamond_ore: 'dia'};
const WCOL = {white: '#e9ecec', orange: '#f07613', magenta: '#bd44b3', light_blue: '#3aafd9', yellow: '#f8c627', lime: '#70b919', pink: '#ed8dac', gray: '#3e4447', light_gray: '#8e8e86', cyan: '#158991', purple: '#792aac', blue: '#35399d', brown: '#724728', green: '#546d1b', red: '#a12722', black: '#141519'};
function inSRS(en){ return !!G.d.srs[en]; }
function addSRS(en, on){ if (on) { if (!G.d.srs[en]) G.d.srs[en] = {b: 0, due: TODAY()}; } else delete G.d.srs[en]; }
function wordCard(w){
  const en = w[0], col = WCOL[en.replace(/_(wool|dye|concrete)$/, '')];
  const ic = BTMAP[en] ? '<span class="ic">' + blockIcon(BTMAP[en], 26) + '</span>' : col && /_wool$|^[a-z_]+$/.test(en) && WCOL[en] ? '<span class="ic"><span class="swatch" style="background:' + col + ';width:22px;height:22px"></span></span>' : col ? '<span class="ic"><span class="swatch" style="background:' + col + ';width:22px;height:22px"></span></span>' : '';
  return '<div class="wc" data-en="' + esc(en) + '">' + ic + '<span class="w" data-say="' + esc(en) + '">' + esc(en) + '</span><span class="zh">' + w[1] + '</span>' + (w[3] ? '<span class="nt">' + w[3] + '</span>' : '') +
    '<span class="ac"><button data-srs class="' + (inSRS(en) ? 'on' : '') + '">' + (inSRS(en) ? '✓ 在复习台' : '+ 复习') + '</button></span></div>';
}
$$('.wgrid[data-cat]').forEach(g => {
  const cats = g.dataset.cat.split(/\s+/);
  const list = (typeof WORDS !== 'undefined' ? WORDS : []).filter(w => cats.includes(w[2]));
  g.innerHTML = list.map(wordCard).join('');
  g.addEventListener('click', e => {
    const b = e.target.closest('button[data-srs]');
    if (b) { const en = b.closest('.wc').dataset.en, on = !inSRS(en); addSRS(en, on); G.save(); b.classList.toggle('on', on); b.textContent = on ? '✓ 在复习台' : '+ 复习'; return; }
    const c = e.target.closest('.wc'); if (c && !e.target.closest('[data-say]')) c.classList.toggle('peek');
  });
  const tools = g.previousElementSibling && g.previousElementSibling.classList.contains('wtools') ? g.previousElementSibling : null;
  if (tools) {
    tools.innerHTML = '<span class="lab">共 ' + list.length + ' 个</span><button class="btn" data-t="read">从头念一遍</button><button class="btn" data-t="zh">遮住中文</button><button class="btn" data-t="en">遮住英文</button><button class="btn" data-t="all">全部放进复习台</button>';
    let reading = false;
    tools.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; const t = b.dataset.t;
      if (t === 'zh' || t === 'en') { const cls = t === 'zh' ? 'hidezh' : 'hideen'; const on = !g.classList.contains(cls); g.classList.toggle(cls, on); b.classList.toggle('on', on); b.textContent = (on ? '露出' : '遮住') + (t === 'zh' ? '中文' : '英文'); }
      if (t === 'all') { list.forEach(w => addSRS(w[0], true)); G.save(); $$('button[data-srs]', g).forEach(x => { x.classList.add('on'); x.textContent = '✓ 在复习台'; }); b.textContent = '都放进去了'; }
      if (t === 'read') {
        if (!hasTTS) { b.textContent = '这个浏览器不会念'; return; }
        if (reading) { reading = false; speechSynthesis.cancel(); b.textContent = '从头念一遍'; return; }
        reading = true; b.textContent = '停'; let k = 0; const els = $$('.w', g);
        const next = () => { if (!reading || k >= els.length) { reading = false; b.textContent = '从头念一遍'; return; } const el = els[k++]; el.scrollIntoView({block: 'nearest'}); const u = new SpeechSynthesisUtterance(sayText(el.dataset.say)); u.lang = 'en-US'; if (enVoice) u.voice = enVoice; u.rate = .8; el.classList.add('speaking'); u.onend = u.onerror = () => { el.classList.remove('speaking'); setTimeout(next, 450); }; speechSynthesis.speak(u); };
        speechSynthesis.cancel(); next();
      }
    });
  }
});

/* ---------- 复习台（间隔重复）----------
   一个词答对一次，就往右挪一格；第 0 格今天再看，第 1 格隔 1 天，第 2 格隔 2 天，然后 4、8、16 天。答错回到第 0 格。 */
const SRS_GAP = [0, 1, 2, 4, 8, 16];
function srsBox(box){
  const W = {}; (typeof WORDS !== 'undefined' ? WORDS : []).forEach(w => W[w[0]] = w);
  let mode = 0, cur = null, shown = false;
  box.innerHTML = '<div class="btns" data-m></div><div class="srs"><div class="boxes"></div><div class="card"></div><div class="btns" data-b style="justify-content:center"></div><div class="say"></div></div>';
  const card = $('.card', box), bts = $('[data-b]', box), sayEl = $('.say', box), boxes = $('.boxes', box);
  btnRow($('[data-m]', box), ['看英文，想中文', '听声音，想中文', '看中文，拼英文'], 0, i => { mode = i; next(); });
  function due(){ const t = TODAY(); return Object.keys(G.d.srs).filter(k => W[k] && G.d.srs[k].due <= t); }
  function drawBoxes(){ const c = [0, 0, 0, 0, 0, 0]; Object.keys(G.d.srs).forEach(k => { if (W[k]) c[Math.min(5, G.d.srs[k].b)]++; }); boxes.innerHTML = c.map((n, i) => '<div><b>' + n + '</b>第 ' + i + ' 格' + (i ? '<br>隔 ' + SRS_GAP[i] + ' 天' : '<br>今天') + '</div>').join(''); }
  function next(){
    drawBoxes(); shown = false;
    const q = due();
    if (!Object.keys(G.d.srs).length) { cur = null; card.innerHTML = '<div class="zh">复习台还是空的</div><div class="nt">去第七部的词卡上点“+ 复习”，或者点下面的按钮，先放进二十个最常用的词。</div>'; bts.innerHTML = '<button class="btn pri" data-x="starter">放进二十个常用词</button>'; return; }
    if (!q.length) { cur = null; card.innerHTML = '<div class="zh">今天的都复习完了</div><div class="nt">一共 ' + Object.keys(G.d.srs).length + ' 个词在复习台里。明天再来，到时候会有该复习的词。</div>'; bts.innerHTML = '<button class="btn" data-x="more">不过瘾？再加十个新词</button>'; return; }
    cur = q[Math.floor(Math.random() * q.length)];
    const w = W[cur];
    sayEl.textContent = '今天还剩 ' + q.length + ' 个。';
    if (mode === 0) { card.innerHTML = '<div class="w" data-say="' + esc(cur) + '">' + esc(cur) + '</div><div class="nt">想一想它是什么意思，再点“翻过来”。</div>'; bts.innerHTML = '<button class="btn pri" data-x="flip">翻过来</button>'; }
    if (mode === 1) { card.innerHTML = '<div class="w" style="font-size:22px"><button class="btn pri" data-say="' + esc(cur) + '">听</button></div><div class="nt">听不清就多点几下。想好了再翻过来。</div>'; bts.innerHTML = '<button class="btn pri" data-x="flip">翻过来</button>'; setTimeout(() => speak(cur), 200); }
    if (mode === 2) { card.innerHTML = '<div class="zh">' + w[1] + '</div><div class="nt">' + (w[3] || '') + '</div><div class="inrow" style="display:flex;gap:6px;justify-content:center"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" style="font-family:var(--f-mono);font-size:18px;padding:4px 8px;border:2px solid var(--rule);border-radius:4px;background:var(--card);max-width:14em;width:100%" aria-label="拼出英文"></div><div class="nt">写游戏里的英文名，空格写成下划线 _ 也行。</div>'; bts.innerHTML = '<button class="btn pri" data-x="check">对答案</button>'; const inp = $('input', card); inp.focus({preventScroll: true}); inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); }); }
  }
  function flip(){ const w = W[cur]; shown = true; card.innerHTML = '<div class="w" data-say="' + esc(cur) + '">' + esc(cur) + '</div><div class="zh">' + w[1] + '</div><div class="nt">' + (w[3] || '') + '</div>'; speak(cur); bts.innerHTML = '<button class="btn" data-x="no">忘了</button><button class="btn" data-x="soso">模糊</button><button class="btn pri" data-x="yes">记得</button>'; }
  function check(){ const inp = $('input', card); if (!inp) return; const v = norm(inp.value).replace(/ /g, '_'), ok = v === cur || v === cur.replace(/_/g, ''); grade(ok ? 'yes' : 'no', ok ? '对了！' : '正确的拼法是 ' + cur + '。'); if (!ok) { flip(); bts.innerHTML = '<button class="btn pri" data-x="next">下一个</button>'; } }
  function grade(k, msg){ const r = G.d.srs[cur]; if (!r) return; const t = TODAY(); if (k === 'yes') { r.b = Math.min(5, r.b + 1); r.due = t + SRS_GAP[r.b]; } else if (k === 'soso') { r.due = t + 1; } else { r.b = 0; r.due = t; } G.save(); sayEl.textContent = (msg || '') + ' 这个词现在在第 ' + r.b + ' 格，' + (r.due > t ? (r.due - t) + ' 天后再见。' : '今天还会再出现。'); if (k !== 'no' || mode !== 2) setTimeout(next, msg ? 900 : 300); }
  bts.addEventListener('click', e => { const b = e.target.closest('button[data-x]'); if (!b) return; const x = b.dataset.x;
    if (x === 'flip') flip(); else if (x === 'check') check(); else if (x === 'next') next();
    else if (x === 'yes' || x === 'soso' || x === 'no') grade(x);
    else if (x === 'starter' || x === 'more') { const pool = (typeof WORDS !== 'undefined' ? WORDS : []).filter(w => w[4] === 1 && !G.d.srs[w[0]]); const more = pool.length ? pool : WORDS.filter(w => !G.d.srs[w[0]]); more.slice(0, x === 'starter' ? 20 : 10).forEach(w => addSRS(w[0], true)); G.save(); next(); } });
  next();
}
$$('.srsbox').forEach(srsBox);
