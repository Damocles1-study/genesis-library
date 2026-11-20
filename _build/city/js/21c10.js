/* ---------- 装置 11：斯诺的地图 ---------- */
dev('#snowFig', fig => {
  const svg = $('#snowSvg');
  const PUMPS = [{x: 300, y: 170, n: '宽街'}, {x: 120, y: 80, n: '北巷'}, {x: 470, y: 70, n: '教堂'}, {x: 520, y: 260, n: '市场'}, {x: 140, y: 290, n: '马厩'}, {x: 330, y: 320, n: '南街'}];
  const BREW = {x: 330, y: 110, w: 60, h: 34}, WORK = {x: 200, y: 150, w: 54, h: 50};
  const COL = ['var(--red)', 'var(--blu)', 'var(--grn)', 'var(--och)', 'var(--main)', 'var(--brk)'];
  const md = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const near = p => { let b = 0; PUMPS.forEach((q, i) => { if (md(p, q) < md(p, PUMPS[b])) b = i; }); return b; };
  const inR = (p, r) => p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;
  // 街：横竖各几条，房子沿街
  const HS = [40, 120, 200, 280, 340], VS = [50, 160, 260, 360, 450, 560];
  const R = rng(1854), D = [];
  let tries = 0;
  while (D.length < 260 && tries < 30000) {
    tries++;
    const onH = R() < .5;
    const p = onH ? {x: 20 + R() * 560, y: HS[Math.floor(R() * HS.length)] + (R() < .5 ? -7 : 7)} : {x: VS[Math.floor(R() * VS.length)] + (R() < .5 ? -7 : 7), y: 20 + R() * 320};
    if (inR(p, BREW) || inR(p, WORK)) continue;
    const k = near(p), d = md(p, PUMPS[k]);
    const prob = k === 0 ? Math.exp(-d / 110) : 0.025;
    if (R() < prob) D.push(p);
  }
  // 两个零星的例外：济贫院里几例
  D.push({x: 214, y: 168}, {x: 236, y: 186});
  let zone = false, odd = false, off = -1;
  function draw(){
    let s = '<rect width="600" height="360" fill="var(--paper)"/>';
    if (zone) for (let x = 0; x < 600; x += 12) for (let y = 0; y < 360; y += 12) s += '<rect x="' + x + '" y="' + y + '" width="12" height="12" fill="' + COL[near({x: x + 6, y: y + 6})] + '" opacity=".12"/>';
    HS.forEach(y => s += '<line x1="0" x2="600" y1="' + y + '" y2="' + y + '" stroke="var(--ink-3)" stroke-width="7" opacity=".35"/>');
    VS.forEach(x => s += '<line x1="' + x + '" x2="' + x + '" y1="0" y2="360" stroke="var(--ink-3)" stroke-width="7" opacity=".35"/>');
    const box = (r, t, on) => '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" fill="var(--card)" stroke="' + (on ? 'var(--grn)' : 'var(--ink-3)') + '" stroke-width="' + (on ? 2.5 : 1) + '"/><text x="' + (r.x + r.w / 2) + '" y="' + (r.y + r.h / 2 + 4) + '" font-size="11" text-anchor="middle" fill="var(--ink)">' + t + '</text>';
    s += box(BREW, '啤酒厂', odd) + box(WORK, '济贫院', odd);
    D.forEach(p => s += '<rect x="' + (p.x - 2.5) + '" y="' + (p.y - 2.5) + '" width="5" height="5" fill="var(--ink)"/>');
    PUMPS.forEach((q, i) => {
      s += '<g data-i="' + i + '" style="cursor:pointer"><rect x="' + (q.x - 9) + '" y="' + (q.y - 9) + '" width="18" height="18" fill="' + (off === i ? 'var(--card)' : 'var(--blu)') + '" stroke="var(--blu)" stroke-width="2.5"/>' + (off === i ? '<path d="M' + (q.x - 7) + ',' + (q.y - 7) + ' l14,14 M' + (q.x + 7) + ',' + (q.y - 7) + ' l-14,14" stroke="var(--red)" stroke-width="2.5"/>' : '') + '<text x="' + q.x + '" y="' + (q.y - 14) + '" font-size="12" text-anchor="middle" fill="var(--ink)" paint-order="stroke" stroke="var(--paper)" stroke-width="3">' + q.n + '</text></g>';
    });
    svg.innerHTML = s;
  }
  function bars(){
    const c = PUMPS.map(() => 0); D.forEach(p => c[near(p)]++);
    const m = Math.max(...c);
    $('#snowBars').innerHTML = PUMPS.map((q, i) => '<div class="row"><span class="nm">' + q.n + '水泵</span><span class="tr"><i style="width:' + (c[i] / m * 100) + '%;background:' + COL[i] + '"></i></span><span class="v">' + c[i] + ' 例</span></div>').join('');
  }
  $('#snowZone').addEventListener('click', e => { zone = !zone; e.target.classList.toggle('on', zone); draw(); if (zone) { bars(); const S = $('#snowSay'); S.className = 'say'; S.innerHTML = '按“谁家离哪个水泵最近”把街区分成六片，再数每一片里的死亡病例：几乎全部挤在<b>宽街水泵</b>那一片。这就是斯诺的办法，后人用同样的思路画出了“泰森多边形”。'; } else $('#snowBars').innerHTML = ''; });
  $('#snowOdd').addEventListener('click', e => { odd = !odd; e.target.classList.toggle('on', odd); draw(); if (odd) { const S = $('#snowSay'); S.className = 'say'; S.innerHTML = '<b>啤酒厂</b>就在宽街水泵旁边，工人一个都没死：他们喝的是厂里的啤酒，厂里还有自己的井。<b>济贫院</b>住着五百多人，只死了几个：院里有自己的井。反过来，几公里外有一位寡妇死了，她每天让人送一瓶宽街水泵的水。<br>离水泵近却没事，离水泵远却出事：<em>病跟着水走，不跟着空气走</em>。'; } });
  svg.addEventListener('click', e => {
    const g = e.target.closest('[data-i]'); if (!g) return;
    off = +g.dataset.i; draw();
    const S = $('#snowSay');
    if (off === 0) { S.className = 'say ok'; S.innerHTML = '你卸掉了<b>宽街水泵</b>的把手。新病例很快就少了下去。<br>（真实的情况更复杂：1854 年 9 月 8 日卸把手时，疫情已经在下降，很多居民已经逃离。但斯诺的推理是对的。后来人们找到了源头：水井旁一米来远的粪坑渗漏了。）'; }
    else { S.className = 'say bad'; S.innerHTML = '你卸掉了<b>' + PUMPS[off].n + '水泵</b>的把手。附近的居民只好走远路去别的水泵打水，有人就去了宽街……死亡还在继续。再看看地图上的黑点挤在哪里。'; }
  });
  draw();
});
