/* ---------- 装置 16：写一张第一步的计划（只存在本机浏览器） ---------- */
dev('#planFig', fig => {
  const KEY = 'genesis-open-plan';
  const card = $('#plCard');
  const T = ['plWhat', 'plWho', 'plGo', 'plStop'];
  const g = {}; let ready = false;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
  T.forEach(id => { if (saved[id]) $('#' + id).value = saved[id]; });
  ['plH', 'plM', 'plW'].forEach(id => { if (saved[id] != null) $('#' + id).value = saved[id]; });
  const val = id => esc(($('#' + id).value || '').trim()) || '<span style="color:var(--ink-3)">（还没写）</span>';
  function draw(){
    if (!ready) return;
    const d = new Date(); d.setDate(d.getDate() + g.w * 7);
    const ds = d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
    card.innerHTML = '<span class="stampv">第一步</span><div class="who"><b>我的第一步</b>一页纸</div><dl>' +
      '<dt>做什么</dt><dd>' + val('plWhat') + '</dd>' +
      '<dt>卖给谁</dt><dd>' + val('plWho') + '</dd>' +
      '<dt>时间</dt><dd>每周最多 ' + g.h + ' 小时，到点就停</dd>' +
      '<dt>最多亏</dt><dd>' + (g.m ? yuan(g.m) : '一分钱也不亏') + '，不借钱，不囤货</dd>' +
      '<dt>检查日</dt><dd>' + ds + '（' + g.w + ' 周后）</dd>' +
      '<dt>继续</dt><dd>' + val('plGo') + '</dd>' +
      '<dt>立刻停</dt><dd>' + val('plStop') + '</dd></dl>';
    const o = {plH: g.h, plM: g.m, plW: g.w}; T.forEach(id => o[id] = $('#' + id).value);
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
  }
  const go = () => { if (ready) draw(); };
  slider('plH', v => { g.h = v; return v + ' 小时'; }, go);
  slider('plM', v => { g.m = v; return v ? yuan(v) : '零'; }, go);
  slider('plW', v => { g.w = v; return v + ' 周'; }, go);
  T.forEach(id => $('#' + id).addEventListener('input', go));
  $('#plClear').addEventListener('click', () => { T.forEach(id => $('#' + id).value = ''); try { localStorage.removeItem(KEY); } catch (e) {} draw(); });
  ready = true; draw();
});
