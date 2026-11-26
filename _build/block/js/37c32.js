
/* ---------- 第三十二章：我的技能树（只存在你自己的浏览器里） ---------- */
dev('#treeFig', () => {
  const KEY = 'genesis-block-skills';
  /* [id, 名字, 一句话, 前置 id[], 列, 行, 章] */
  const T = [
    ['blk', '会搭方块', '盖一座自己的房子', [], 0, 0, 'c0'],
    ['rs', '红石灯', '拉杆、线和一盏灯', ['blk'], 1, 0, 'c9'],
    ['gate', '逻辑门', '用火把做出“与”', ['rs'], 2, 0, 'c10'],
    ['add', '加法器', '红石算出 1 + 1 = 10', ['gate'], 3, 0, 'c11'],
    ['cmd', '一行命令', '用 /fill 盖一座塔', ['blk'], 1, 1, 'c15'],
    ['pack', '数据包', '写一个自己的函数', ['cmd'], 2, 1, 'c25'],
    ['tick', '会自己跑的函数', '走过的草地开花', ['pack'], 3, 1, 'c25'],
    ['scr', 'Scratch', '做一个方块小游戏', ['blk'], 1, 2, 'c16'],
    ['py', 'Python', '小海龟画螺旋', ['scr'], 2, 2, 'c26'],
    ['gen', '程序写程序', 'Python 生成一个球', ['py', 'pack'], 3, 2, 'c26'],
    ['hw', '认识电脑', '活动监视器和帧数实验', ['blk'], 1, 3, 'c27'],
    ['lan', '局域网', '和朋友联机、ping 一下', ['hw'], 2, 3, 'c28'],
    ['srv', '服务器', '在自己电脑上开服', ['lan'], 3, 3, 'c29'],
    ['math', '方块数学', '面积、比例尺、一比八', ['blk'], 1, 4, 'c18'],
    ['phy', '方块物理', '量速度、比下落', ['math'], 2, 4, 'c30'],
    ['ai', '会问 AI', '和大人一起检查 AI 的代码', ['pack', 'py'], 4, 1, 'c31'],
    ['mine', '我的作品', '一个游戏外的创意做出来了', ['gen', 'srv', 'phy', 'ai', 'add'], 4, 3, 'c32']
  ];
  let done;
  try { done = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) { done = new Set(); }
  const sv = $('#treeSvg'), CW = 120, RH = 74, BW = 104, BH = 50;
  const byId = Object.fromEntries(T.map(t => [t[0], t]));
  const P = t => [16 + t[4] * CW, 14 + t[5] * RH];
  function draw(){
    let g = '';
    T.forEach(t => t[3].forEach(pid => { const a = P(byId[pid]), b = P(t); g += '<path d="M' + (a[0] + BW) + ',' + (a[1] + BH / 2) + 'C' + (a[0] + BW + 14) + ',' + (a[1] + BH / 2) + ' ' + (b[0] - 14) + ',' + (b[1] + BH / 2) + ' ' + b[0] + ',' + (b[1] + BH / 2) + '" fill="none" stroke="' + (done.has(pid) ? 'var(--main)' : 'var(--rule)') + '" stroke-width="2"/>'; }));
    T.forEach(t => {
      const p = P(t), ok = done.has(t[0]), ready = t[3].every(x => done.has(x));
      g += '<g class="node" data-id="' + t[0] + '" style="cursor:pointer"><rect x="' + p[0] + '" y="' + p[1] + '" width="' + BW + '" height="' + BH + '" rx="4" fill="' + (ok ? 'var(--main)' : 'var(--card)') + '" stroke="' + (ok ? 'var(--main)' : ready ? 'var(--ink-2)' : 'var(--rule)') + '" stroke-width="2"' + (ready || ok ? '' : ' stroke-dasharray="4 3"') + '/>' +
        txt(p[0] + BW / 2, p[1] + 20, (ok ? '✓ ' : '') + t[1], {s: 13, w: true, c: ok ? 'var(--paper)' : 'var(--ink)', halo: false}) + txt(p[0] + BW / 2, p[1] + 38, t[2].length > 9 ? t[2].slice(0, 9) + '…' : t[2], {s: 10, c: ok ? 'var(--paper)' : 'var(--ink-3)', halo: false}) + '</g>';
    });
    sv.setAttribute('viewBox', '0 0 ' + (16 + 5 * CW) + ' ' + (14 + 5 * RH)); sv.innerHTML = g;
    const next = T.filter(t => !done.has(t[0]) && t[3].every(x => done.has(x)));
    $('#treeSay').innerHTML = '点亮了 <b>' + done.size + '</b> / ' + T.length + ' 个。' + (next.length ? '现在可以去试：' + next.slice(0, 4).map(t => '<a data-c="' + t[6] + '" href="' + href(t[6]) + '">' + t[1] + '（' + t[2] + '）</a>').join('、') + '。' : '全部点亮了！去做一个只属于你的东西吧。');
    try { localStorage.setItem(KEY, JSON.stringify([...done])); } catch (e) {}
  }
  sv.addEventListener('click', e => { const n = e.target.closest('.node'); if (!n) return; const id = n.dataset.id; done.has(id) ? done.delete(id) : done.add(id); draw(); });
  $('#treeClear').addEventListener('click', () => { done.clear(); draw(); });
  draw();
});
