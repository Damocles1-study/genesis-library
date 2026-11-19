/* 回宿舍的路：抽卡、筛选、讲过了。记号存在 localStorage，读写都包 try/catch。 */
(function () {
  var D = document;
  D.documentElement.classList.add('js');

  var KEY = 'genesis-walk-told';
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var cards = [].slice.call(D.querySelectorAll('.grid article.cd'));
  var byId = {};
  cards.forEach(function (c) { byId[c.id] = c; });
  var told = {};
  load(KEY, []).forEach(function (id) { if (byId[id]) told[id] = 1; });

  var THEMES = [['全部', ''], ['机器', '--c-jq'], ['钱', '--c-q'], ['衙门', '--c-ym'], ['字与话', '--c-zi'], ['柜台', '--c-gt'], ['书外', '--c-sw']];
  var KINDS = [['全部'], ['讲', '一个故事'], ['猜', '先让对方猜'], ['辩', '各执一词'], ['假', '假如'], ['玩', '小游戏']];
  var st = { t: '全部', k: '全部', skip: load(KEY + '-skip', true), queue: [], qi: 0 };

  // 每张卡估一个讲述时长：边讲边停，每分钟约 150 字；聊的时间另算
  cards.forEach(function (c) {
    var b = c.querySelector('.body'), n = b ? b.textContent.replace(/\s+/g, '').length : 300;
    var m = Math.max(1, Math.min(4, Math.round(n / 150)));
    var h = c.querySelector('.cd-h .no');
    var s = D.createElement('span'); s.className = 'min'; s.textContent = '讲约 ' + m + ' 分钟';
    h.parentNode.insertBefore(s, h);
    c.tabIndex = 0;
    c.setAttribute('role', 'button');
    c.setAttribute('aria-label', '翻开：' + c.querySelector('h3').textContent);
    c.addEventListener('click', function (e) { if (e.target.closest('a,summary')) return; openOne(c); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openOne(c); } });
  });

  var stage = D.getElementById('stage'), snav = D.getElementById('snav'), pos = D.getElementById('pos');
  var bPrev = D.getElementById('prev'), bNext = D.getElementById('next'), bTold = D.getElementById('told');
  var skipBox = D.getElementById('skip'), stat = D.getElementById('stat');
  skipBox.checked = !!st.skip;

  function ok(c) { return (st.t === '全部' || c.dataset.t === st.t) && (st.k === '全部' || c.dataset.k === st.k); }
  function pool() { return cards.filter(function (c) { return ok(c) && !(st.skip && told[c.id]); }); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // 筛选按钮
  function chips(box, list, key, label) {
    list.forEach(function (it) {
      var b = D.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.dataset.v = it[0];
      if (key === 't' && it[1]) b.style.setProperty('--cc', 'var(' + it[1] + ')');
      b.innerHTML = (key === 'k' && it[1] ? it[1] : it[0]) + '<i></i>';
      b.setAttribute('aria-pressed', it[0] === st[key] ? 'true' : 'false');
      b.addEventListener('click', function () {
        st[key] = it[0];
        [].forEach.call(box.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        refresh();
      });
      box.appendChild(b);
    });
  }
  chips(D.getElementById('fT'), THEMES, 't');
  chips(D.getElementById('fK'), KINDS, 'k');

  function refresh() {
    var nTold = Object.keys(told).length, p = pool().length;
    var filtered = cards.filter(ok).length;
    stat.textContent = '讲过 ' + nTold + ' / ' + cards.length + ' 张 · 当前可抽 ' + p + ' 张';
    // 每个按钮上的数字：在另一维筛选下还剩几张
    [].forEach.call(D.querySelectorAll('#fT .chip'), function (b) {
      var v = b.dataset.v, n = cards.filter(function (c) { return (v === '全部' || c.dataset.t === v) && (st.k === '全部' || c.dataset.k === st.k); }).length;
      b.querySelector('i').textContent = n;
    });
    [].forEach.call(D.querySelectorAll('#fK .chip'), function (b) {
      var v = b.dataset.v, n = cards.filter(function (c) { return (v === '全部' || c.dataset.k === v) && (st.t === '全部' || c.dataset.t === st.t); }).length;
      b.querySelector('i').textContent = n;
    });
    cards.forEach(function (c) {
      c.classList.toggle('told', !!told[c.id]);
      c.style.display = ok(c) ? '' : 'none';
    });
    [].forEach.call(D.querySelectorAll('.deck'), function (d) {
      d.style.display = d.querySelector('.grid article.cd:not([style*="none"])') ? '' : 'none';
    });
    if (filtered === 0) stat.textContent += '（这个组合没有卡）';
  }

  function empty(title, msg) {
    stage.innerHTML = '<div class="empty"><b>' + title + '</b>' + msg + '</div>';
    snav.classList.remove('on');
  }

  function render() {
    var c = st.queue[st.qi];
    if (!c) return;
    var k = c.cloneNode(true);
    k.removeAttribute('id'); k.removeAttribute('tabindex'); k.removeAttribute('role'); k.removeAttribute('aria-label');
    k.style.display = '';
    k.classList.toggle('told', !!told[c.id]);
    stage.innerHTML = '';
    stage.appendChild(k);
    snav.classList.add('on');
    var road = st.queue.length > 1;
    pos.textContent = road ? '一条路 · 第 ' + (st.qi + 1) + ' / ' + st.queue.length + ' 张' : '第 ' + c.querySelector('.no').textContent + ' 号卡';
    bPrev.style.display = road ? '' : 'none';
    bPrev.disabled = st.qi === 0;
    bNext.textContent = road && st.qi < st.queue.length - 1 ? '下一张' : '再抽一张';
    bTold.setAttribute('aria-pressed', told[c.id] ? 'true' : 'false');
    bTold.textContent = told[c.id] ? '✓ 讲过了' : '讲过了';
    try { history.replaceState(null, '', '#' + c.id); } catch (e) {}
  }

  function showStage() {
    var bar = D.querySelector('.bar'), y = stage.getBoundingClientRect().top + window.pageYOffset - (bar ? bar.offsetHeight : 0) - 12;
    if (Math.abs(window.pageYOffset - y) > 40) window.scrollTo({ top: y, behavior: 'smooth' });
  }

  function drawOne() {
    var cur = st.queue[st.qi], p = pool();
    if (p.length > 1 && cur) p = p.filter(function (c) { return c !== cur; });
    if (!p.length) return nothing();
    st.queue = [p[Math.floor(Math.random() * p.length)]]; st.qi = 0;
    render();
  }

  function drawRoad() {
    var p = shuffle(pool());
    if (!p.length) return nothing();
    var out = [], seen = {};
    p.forEach(function (c) { if (out.length < 3 && !seen[c.dataset.t]) { seen[c.dataset.t] = 1; out.push(c); } });
    p.forEach(function (c) { if (out.length < 3 && out.indexOf(c) < 0) out.push(c); });
    st.queue = out; st.qi = 0;
    render();
  }

  function nothing() {
    st.queue = [];
    var any = cards.filter(ok).length;
    if (any && st.skip) empty('这一类都讲过了', '换个主题或类型，取消“跳过讲过的”，或者清空记号从头再来。');
    else empty('没有这样的卡', '换一个主题和类型的组合试试。');
  }

  function openOne(c) { st.queue = [c]; st.qi = 0; render(); showStage(); }

  D.getElementById('btnOne').addEventListener('click', drawOne);
  D.getElementById('btnRoad').addEventListener('click', drawRoad);
  bPrev.addEventListener('click', function () { if (st.qi > 0) { st.qi--; render(); } });
  bNext.addEventListener('click', function () {
    if (st.queue.length > 1 && st.qi < st.queue.length - 1) { st.qi++; render(); } else drawOne();
  });
  bTold.addEventListener('click', function () {
    var c = st.queue[st.qi]; if (!c) return;
    if (told[c.id]) delete told[c.id]; else told[c.id] = 1;
    save(KEY, Object.keys(told));
    refresh(); render();
  });
  skipBox.addEventListener('change', function () { st.skip = skipBox.checked; save(KEY + '-skip', st.skip); refresh(); });
  D.getElementById('reset').addEventListener('click', function () {
    var n = Object.keys(told).length;
    if (!n) return;
    if (!window.confirm('清空 ' + n + ' 张卡的“讲过了”记号？')) return;
    told = {}; save(KEY, []); refresh(); if (st.queue.length) render();
  });

  // 到楼下了：替我挑一句
  var closeList = [].slice.call(D.querySelectorAll('#closeList li')), lastClose = -1;
  D.getElementById('btnClose').addEventListener('click', function () {
    var i; do { i = Math.floor(Math.random() * closeList.length); } while (i === lastClose && closeList.length > 1);
    lastClose = i;
    closeList.forEach(function (li, j) { li.classList.toggle('pick', j === i); });
    closeList[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  refresh();
  // 链接里带了卡号（#w12）就直接翻开那张
  var h = (location.hash || '').slice(1);
  if (byId[h]) { st.queue = [byId[h]]; st.qi = 0; render(); setTimeout(showStage, 60); }
})();
