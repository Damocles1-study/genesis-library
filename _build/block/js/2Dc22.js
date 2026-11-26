
/* ---------- 第二十二章：我的游戏公约（只存在你自己的浏览器里） ---------- */
dev('#pactFig', () => {
  const KEY = 'genesis-block-pact';
  const F = [
    {id: 'wd', t: '上学的日子', k: 'one', o: ['不玩', '每天 20 分钟', '每天 30 分钟', '每天 45 分钟', '只有周五玩 1 小时']},
    {id: 'we', t: '周末和假期', k: 'one', o: ['每天 1 小时', '每天 1 个半小时', '每天 2 小时', '一共 3 小时，自己分']},
    {id: 'before', t: '开始玩之前，先做完', k: 'many', o: ['作业', '阅读 20 分钟', '户外运动', '收拾书桌']},
    {id: 'where', t: '在哪儿玩', k: 'one', o: ['客厅', '书房，开着门', '大人在旁边的地方']},
    {id: 'stop', t: '怎样停下来', k: 'many', o: ['定一个闹钟', '提前 5 分钟提醒自己', '玩到一件事做完就停（盖完一面墙、到家门口）', '不在睡觉前一小时玩']},
    {id: 'who', t: '和谁一起玩', k: 'one', o: ['只和认识的同学、家人', '自己一个人玩', '公共服务器要先问大人']},
    {id: 'money', t: '花钱', k: 'one', o: ['不花钱', '每次都先和大人商量']},
    {id: 'miss', t: '如果没做到', k: 'one', o: ['第二天少玩一次', '一起坐下来重新商量', '先停一周，再试一次']}
  ];
  let st = {};
  try { st = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { st = {}; }
  F.forEach(f => { if (st[f.id] === undefined) st[f.id] = f.k === 'one' ? 1 : [0]; });
  if (st.kid === undefined) st.kid = ''; if (st.adult === undefined) st.adult = '';
  const form = $('#pactForm');
  form.innerHTML = F.map(f => '<div class="pf"><div class="lab">' + f.t + (f.k === 'many' ? '（可以选几样）' : '') + '</div><div class="btns" data-f="' + f.id + '">' + f.o.map((o, i) => '<button class="btn" data-i="' + i + '">' + o + '</button>').join('') + '</div></div>').join('') +
    '<div class="pf two"><label class="lab">我的名字<input id="pactKid" type="text" maxlength="12"></label><label class="lab">大人的名字<input id="pactAdult" type="text" maxlength="12"></label></div>';
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function draw(){
    F.forEach(f => $$('[data-f="' + f.id + '"] button', form).forEach((b, i) => b.classList.toggle('on', f.k === 'one' ? st[f.id] === i : st[f.id].includes(i))));
    const val = f => f.k === 'one' ? f.o[st[f.id]] : (st[f.id].length ? st[f.id].map(i => f.o[i]).join('；') : '（还没选）');
    $('#pactCard').innerHTML = '<h5>我们家的游戏公约</h5><ol>' + F.map(f => '<li><b>' + f.t + '：</b>' + val(f) + '</li>').join('') + '</ol><p class="sig">签名：' + (esc(st.kid) || '＿＿＿＿') + '　　' + (esc(st.adult) || '＿＿＿＿') + '</p><p class="small">这张公约可以随时一起改。一个月以后，坐下来看看哪一条好用、哪一条不好用。</p>';
    save();
  }
  form.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const id = b.parentNode.dataset.f, f = F.find(x => x.id === id), i = +b.dataset.i;
    if (f.k === 'one') st[id] = i; else { const a = st[id]; st[id] = a.includes(i) ? a.filter(x => x !== i) : a.concat(i).sort(); }
    draw();
  });
  const kid = $('#pactKid'), ad = $('#pactAdult'); kid.value = st.kid; ad.value = st.adult;
  kid.addEventListener('input', () => { st.kid = kid.value; draw(); }); ad.addEventListener('input', () => { st.adult = ad.value; draw(); });
  $('#pactClear').addEventListener('click', () => { try { localStorage.removeItem(KEY); } catch (e) {} st = {}; F.forEach(f => st[f.id] = f.k === 'one' ? 1 : [0]); st.kid = st.adult = ''; kid.value = ad.value = ''; draw(); });
  draw();
});
