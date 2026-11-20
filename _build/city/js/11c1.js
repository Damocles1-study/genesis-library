/* ---------- 装置 2：悬河 ---------- */
dev('#xuanFig', fig => {
  const svg = $('#xuanSvg'), K = $('#xuanKV'), S = $('#xuanSay');
  const Y0 = 262, M = 9; // 原始地面的 y；每米多少像素
  let st;
  const yy = h => Y0 - (h - Math.max(0, st.L - 22)) * M; // 堤太高时整体往下挪
  const reset = () => { st = {t: 0, b: 0, L: 2.2, g: 0, lay: [], breaks: 0, R: rng(5)}; };
  reset();
  function draw(flash){
    const {b, L, g} = st;
    let s = '';
    // 天空与原始地面参照
    s += '<line x1="0" x2="600" y1="' + Y0 + '" y2="' + Y0 + '" stroke="var(--ink-3)" stroke-dasharray="3 4" stroke-width="1"/>';
    s += '<text x="596" y="' + (Y0 + 14) + '" font-size="11" text-anchor="end" fill="var(--ink-3)">最初的地面</text>';
    // 城这一侧的地层
    s += '<rect x="0" y="' + yy(g) + '" width="600" height="' + (300 - yy(g)) + '" fill="var(--och)" fill-opacity=".16"/>';
    st.lay.forEach((l, i) => {
      s += '<line x1="0" x2="340" y1="' + yy(l.h) + '" y2="' + yy(l.h) + '" stroke="var(--brk)" stroke-width="1.6" stroke-dasharray="6 3"/>';
      for (let k = 0; k < 6; k++) s += '<rect x="' + (30 + k * 46) + '" y="' + (yy(l.h) - 7) + '" width="' + (16 + (k * 7) % 9) + '" height="7" fill="var(--brk)" fill-opacity=".35"/>';
      s += '<text x="8" y="' + (yy(l.h) + 13) + '" font-size="11.5" fill="var(--brk)">第 ' + (i + 1) + ' 座城 · 第 ' + l.t + ' 年埋</text>';
    });
    // 地面上的城
    for (let k = 0; k < 7; k++) { const x = 24 + k * 42, h = 14 + (k * 13) % 12; s += '<rect x="' + x + '" y="' + (yy(g) - h) + '" width="28" height="' + h + '" fill="var(--card)" stroke="var(--ink)" stroke-width="1.3"/><path d="M' + (x - 3) + ',' + (yy(g) - h) + ' L' + (x + 14) + ',' + (yy(g) - h - 9) + ' L' + (x + 31) + ',' + (yy(g) - h) + '" fill="var(--card)" stroke="var(--ink)" stroke-width="1.3"/>'; }
    s += '<text x="170" y="' + (yy(g) - 34) + '" font-size="13" text-anchor="middle" fill="var(--ink)">城</text>';
    // 河这一侧：两岸的地也按 g 算，河槽里淤沙
    s += '<rect x="560" y="' + yy(g) + '" width="40" height="' + (300 - yy(g)) + '" fill="var(--och)" fill-opacity=".16"/>';
    s += '<rect x="380" y="' + yy(b) + '" width="140" height="' + (300 - yy(b)) + '" fill="var(--och)" fill-opacity=".38"/>';
    for (let k = 0; k < 14; k++) s += '<circle cx="' + (388 + (k * 37) % 128) + '" cy="' + (yy(b) + 6 + (k * 23) % Math.max(6, (yy(Math.min(b, g)) + 30 - yy(b)))) + '" r="1.2" fill="var(--och)"/>';
    // 水
    const wl = b + 1.6;
    s += '<rect x="380" y="' + yy(wl) + '" width="140" height="' + (yy(b) - yy(wl)) + '" fill="var(--wat)"/>';
    // 堤（梯形）
    const lev = (x1, x2) => '<path d="M' + (x1 - 26) + ',' + yy(g) + ' L' + x1 + ',' + yy(L) + ' L' + x2 + ',' + yy(L) + ' L' + (x2 + 26) + ',' + yy(g) + ' Z" fill="var(--brk)" fill-opacity=".28" stroke="var(--brk)" stroke-width="1.6"/>';
    s += lev(352, 380) + lev(520, 548);
    s += '<text x="450" y="' + (yy(wl) - 8) + '" font-size="13" text-anchor="middle" fill="var(--ink)">河</text>';
    // 标尺：河底比城里地面高多少
    if (b - g > 0.5) s += '<line x1="330" x2="330" y1="' + yy(g) + '" y2="' + yy(b) + '" stroke="var(--red)" stroke-width="1.5"/><text x="326" y="' + ((yy(g) + yy(b)) / 2 + 4) + '" font-size="12" text-anchor="end" fill="var(--red)">河底高 ' + f1(b - g) + ' 米</text>';
    if (flash) s += '<rect x="0" y="0" width="600" height="300" fill="var(--wat)" opacity=".45"/><text x="170" y="120" font-size="22" text-anchor="middle" fill="var(--ink)" font-weight="700">决口！</text>';
    svg.innerHTML = s;
    kv(K, [['过了', st.t + ' 年'], ['河底比城里地面高', f1(Math.max(0, b - g)) + ' 米'], ['堤顶比城里地面高', f1(L - g) + ' 米'], ['地下摞着的城', st.lay.length + ' 座']]);
  }
  function breach(auto){
    const drop = Math.max(0, st.b + 1.6 - st.g);
    const silt = 1.2 + drop * 0.38;
    st.lay.push({h: st.g, t: st.t});
    st.g += silt; st.b = Math.max(st.g - 0.2, st.b - 0.6); st.L = st.b + 2.6; st.breaks++;
    draw(true); setTimeout(() => draw(), 650);
    S.className = 'say bad';
    S.innerHTML = (auto ? '<b>堤没撑住，自己决口了。</b>' : '<b>决口。</b>') + '水从高出地面 ' + f1(drop) + ' 米的河槽里灌下来' + (drop > 6 ? '，像一堵墙压向城里' : drop > 3 ? '，城里转眼成了泽国' : '，城里水深没膝') + '。水退以后，城被埋在约 ' + f1(silt) + ' 米厚的泥沙下面。人们回来，在泥上盖起第 ' + (st.lay.length + 1) + ' 座城。' + (st.lay.length >= 3 ? '<br>地下已经摞了 ' + st.lay.length + ' 层，这就是开封“城摞城”的道理。' : '');
  }
  $('#xuanStep').addEventListener('click', () => {
    st.t += 50; st.b += 1.15 + st.R() * 0.3;
    const raise = $('#xuanRaise').checked;
    if (raise) st.L = Math.max(st.L, st.b + 2.8);
    const free = st.L - (st.b + 1.6), hang = st.b - st.g;
    const p = free < 0 ? 1 : clamp(0.04 + hang * 0.035 + (free < 1 ? 0.35 : 0), 0, 0.85);
    if (st.R() < p) { breach(true); return; }
    draw();
    S.className = 'say' + (hang > 6 ? ' bad' : '');
    S.innerHTML = raise ? '堤又加高了。河底比城里高出 <b>' + f1(Math.max(0, hang)) + ' 米</b>，这一回平安。可是堤越高，下次决口时水头就越猛。' + (hang > 5 ? '<br>你脚下的城，已经在河底下面了。' : '')
      : '这五十年没加高堤，河底又淤高了。堤顶只比水面高 <b>' + f1(free) + ' 米</b>，' + (free < 1 ? '再一场大水就要漫过去。' : '暂时还挡得住。');
  });
  $('#xuanBreak').addEventListener('click', () => breach(false));
  $('#xuanReset').addEventListener('click', () => { reset(); draw(); S.className = 'say'; S.textContent = '起点：河底和城一样高，堤只有一人多高。'; });
  draw();
});
