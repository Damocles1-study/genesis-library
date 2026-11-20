/* ---------- 装置 9：走一遍中轴 ---------- */
dev('#axisFig', fig => {
  // 左：《考工记》王城示意（方九里，旁三门，九经九纬，左祖右社，面朝后市）
  (function(){
    let s = '<rect x="20" y="20" width="200" height="200" fill="var(--paper)" stroke="var(--brk)" stroke-width="3"/>';
    for (let i = 1; i < 10; i++) { const p = 20 + i * 20; s += '<line x1="' + p + '" x2="' + p + '" y1="20" y2="220" stroke="var(--ink)" stroke-width="' + (i === 5 ? 1.6 : .45) + '" opacity=".6"/><line y1="' + p + '" y2="' + p + '" x1="20" x2="220" stroke="var(--ink)" stroke-width="' + (i === 5 ? 1.6 : .45) + '" opacity=".6"/>'; }
    [70, 120, 170].forEach(p => { s += '<rect x="' + (p - 5) + '" y="15" width="10" height="10" fill="var(--brk)"/><rect x="' + (p - 5) + '" y="215" width="10" height="10" fill="var(--brk)"/><rect x="15" y="' + (p - 5) + '" width="10" height="10" fill="var(--brk)"/><rect x="215" y="' + (p - 5) + '" width="10" height="10" fill="var(--brk)"/>'; });
    const B = (x, y, w, h, t, c) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="var(--card)" stroke="' + c + '" stroke-width="2"/><text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 4) + '" font-size="11" text-anchor="middle" fill="' + c + '">' + t + '</text>';
    s += B(98, 98, 44, 44, '宫', 'var(--main)') + B(98, 60, 44, 28, '市', 'var(--och)') + B(98, 152, 44, 28, '朝', 'var(--main)') + B(150, 104, 32, 32, '祖', 'var(--main)') + B(58, 104, 32, 32, '社', 'var(--main)');
    s += '<text x="120" y="12" font-size="10" text-anchor="middle" fill="var(--ink-3)">北</text><text x="120" y="238" font-size="10" text-anchor="middle" fill="var(--ink-3)">南 · 《考工记》示意</text>';
    s += '<text x="166" y="98" font-size="9" text-anchor="middle" fill="var(--ink-3)">东（左）</text><text x="74" y="98" font-size="9" text-anchor="middle" fill="var(--ink-3)">西（右）</text>';
    $('#axisIdeal').innerHTML = s;
  })();
  // 右：北京中轴（从北往南，示意）
  const P = [
    {y: 30, n: '钟楼 · 鼓楼', t: '中轴线北端。元代就在这一带设钟鼓楼，报时、管城门开关和宵禁。今天的建筑是明清重建的。', k: '“后市”：元大都最热闹的商业区就在钟鼓楼和积水潭一带。'},
    {y: 70, n: '万宁桥', t: '元代的石桥，至今还在用。桥下原是通惠河，南来的漕船经过这里驶进积水潭。', k: '“面朝后市”在元大都是真的：粮船和货船停在宫城北边。'},
    {y: 110, n: '景山', t: '明朝用挖护城河的土堆成的山，是老北京城的最高点。山顶的万春亭正好压在中轴线上。', k: '《考工记》没写山。这是风水上的“靠山”：宫殿背后要有山。'},
    {y: 170, n: '故宫（紫禁城）', t: '1420 年建成，明清两代二十四位皇帝住在这里。从午门到神武门，主要大殿全部排在中轴线上：前面是举行大典的三大殿，后面是皇帝和后妃居住的后三宫。', k: '“宫居中”“前朝后寝”：照着理想图来。'},
    {y: 235, n: '端门 · 天安门', t: '天安门原是皇城的正门，明代叫承天门。门前一道金水河，五座桥，中间那座只有皇帝能走。', k: '一道门比一道门威严，人走到这里还没进宫，就已经被“教育”过了。'},
    {y: 262, n: '太庙 · 社稷坛', l: 1, t: '天安门东边是太庙（今劳动人民文化宫），西边是社稷坛（今中山公园）。', k: '“左祖右社”：站在宫里朝南看，左手是东，太庙；右手是西，社稷坛。一丝不差。'},
    {y: 310, n: '天安门广场', t: '明清时这里是一条狭长的“T”形宫廷广场，两边是千步廊和中央衙署。二十世纪五十年代末扩建成今天的样子，面积四十多公顷，两侧是人民大会堂和国家博物馆，中间是人民英雄纪念碑，后来又建了毛主席纪念堂。', k: '“朝”在宫前：古代的衙署排在这里；今天的国家机构也在这里。轴线的意思变了，位置没变。'},
    {y: 360, n: '正阳门（前门）', t: '内城的正南门，城楼和箭楼至今都在。门外的前门大街、大栅栏是明清北京最热闹的商业区之一。', k: '《考工记》说“面朝后市”，可北京最旺的市后来长在了前门外：住不进内城的商人、会馆、戏园都挤在这里。理想图拗不过人流。'},
    {y: 425, n: '天坛 · 先农坛', l: 1, t: '外城南部，东边是天坛，皇帝祭天、祈谷；西边是先农坛，皇帝亲自扶犁耕一小块地，做给天下农民看。', k: '又一对左右对称。1553 年修外城，就是为了把它们圈进城里。'},
    {y: 490, n: '永定门', t: '外城的正南门，中轴线的南端。1950 年代城楼被拆，2004 年在原址重建。', k: '从这里往北走到钟鼓楼，约七点八公里。'}
  ];
  const svg = $('#axisBJ');
  function draw(cur){
    let s = '<rect x="60" y="150" width="180" height="60" fill="none" stroke="var(--brk)" stroke-width="1" stroke-dasharray="3 3"/><text x="64" y="146" font-size="9" fill="var(--ink-3)">紫禁城</text>';
    s += '<line x1="150" x2="150" y1="20" y2="505" stroke="var(--main)" stroke-width="3"/>';
    P.forEach((p, i) => {
      const on = i === cur;
      if (p.l) {
        s += '<circle cx="90" cy="' + p.y + '" r="' + (on ? 9 : 7) + '" fill="' + (on ? 'var(--main)' : 'var(--card)') + '" stroke="var(--main)" stroke-width="2" data-i="' + i + '" style="cursor:pointer"/><circle cx="210" cy="' + p.y + '" r="' + (on ? 9 : 7) + '" fill="' + (on ? 'var(--main)' : 'var(--card)') + '" stroke="var(--main)" stroke-width="2" data-i="' + i + '" style="cursor:pointer"/>';
        s += '<line x1="98" x2="202" y1="' + p.y + '" y2="' + p.y + '" stroke="var(--main)" stroke-width="1" stroke-dasharray="3 3"/>';
        const two = p.n.split(' · ');
        s += '<text x="210" y="' + (p.y + 22) + '" font-size="12" text-anchor="middle" fill="var(--ink)" data-i="' + i + '" style="cursor:pointer">' + (i === 5 ? two[0] : two[0]) + '</text><text x="90" y="' + (p.y + 22) + '" font-size="12" text-anchor="middle" fill="var(--ink)" data-i="' + i + '" style="cursor:pointer">' + two[1] + '</text>';
      } else {
        s += '<rect x="' + (150 - (on ? 11 : 9)) + '" y="' + (p.y - (on ? 11 : 9)) + '" width="' + (on ? 22 : 18) + '" height="' + (on ? 22 : 18) + '" fill="' + (on ? 'var(--main)' : 'var(--card)') + '" stroke="var(--main)" stroke-width="2" data-i="' + i + '" style="cursor:pointer"/>';
        s += '<text x="170" y="' + (p.y + 4) + '" font-size="12.5" fill="var(--ink)" data-i="' + i + '" style="cursor:pointer">' + p.n + '</text>';
      }
    });
    s += '<text x="150" y="12" font-size="10" text-anchor="middle" fill="var(--ink-3)">北</text><text x="150" y="518" font-size="10" text-anchor="middle" fill="var(--ink-3)">南</text>';
    s += '<text x="290" y="262" font-size="9" text-anchor="end" fill="var(--ink-3)">东</text><text x="10" y="262" font-size="9" fill="var(--ink-3)">西</text>';
    svg.innerHTML = s;
  }
  svg.addEventListener('click', e => {
    const t = e.target.closest('[data-i]'); if (!t) return;
    const i = +t.dataset.i, p = P[i]; draw(i);
    $('#axisSay').innerHTML = '<b>' + p.n + '</b>　' + p.t + '<br><span style="color:var(--main)">对照理想图：</span>' + p.k;
  });
  draw(-1);
});
