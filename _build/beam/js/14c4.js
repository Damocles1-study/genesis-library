/* ---------- 装置 5：砌一堵墙 ---------- */
dev('#bkFig', () => {
  /* 每种砌法：[名字, 每一皮的样式（循环）, 每平方米块数, 墙厚, 说明, 是否对缝] */
  const B = [
    ['全顺', ['s0', 's1'], 64, '120 毫米（半砖墙）', '每一皮都是顺砖，上下错开半块。墙只有半块砖厚，只能做隔墙。', 0],
    ['一顺一丁', ['s0', 'h'], 128, '240 毫米', '一皮顺砖、一皮丁砖交替。丁砖横穿墙身，把里外两层顺砖拉在一起，结实，北方最常见。', 0],
    ['三顺一丁', ['s0', 's1', 's0', 'h'], 128, '240 毫米', '三皮顺砖压一皮丁砖。顺砖多，砌得快，看着也整齐，中国南北都用。', 0],
    ['梅花丁', ['f0', 'f1'], 128, '240 毫米', '同一皮里顺砖和丁砖交替，上下皮的丁砖落在顺砖正中。竖缝错得最匀，墙面像撒了一层梅花，英国人叫“佛兰德斯砌法”。', 0],
    ['空斗墙', ['e', 'h'], 90, '240 毫米（中空）', '砖立起来砌成一个个空斗，中间填土或留空，隔一层平铺一皮“眠砖”。南方民居常用，省砖三成左右、更隔热，但不耐震、不能承重太多。', 0],
    ['对缝（错误）', ['s0', 's0'], 128, '240 毫米', '每一皮的竖缝都对在同一条线上，“通缝”从上到下。墙成了一根根互不相连的细砖柱，一推就裂。工地上这是要返工的。', 1]
  ];
  let cur = 1;
  btnRow($('#bkBtns'), B.map(b => b[0]), cur, i => { cur = i; draw(); });
  function draw(){
    const b = B[cur], k = 0.42, W = 600, wallW = 1300; // 毫米
    const L = 240, Wd = 115, Th = 53, J = 10;
    let y = 0, g = '<defs><clipPath id="bkClip"><rect x="0" y="0" width="' + wallW * k + '" height="400"/></clipPath></defs><g clip-path="url(#bkClip)">';
    const brick = (x, yy, w, h, tone) => '<rect x="' + (x * k).toFixed(1) + '" y="' + (yy * k).toFixed(1) + '" width="' + (w * k).toFixed(1) + '" height="' + (h * k).toFixed(1) + '" fill="var(--ter)" fill-opacity="' + tone + '" stroke="var(--ink-2)" stroke-width=".6"/>';
    const joints = [];
    let row = 0, H = 0;
    while (H < 820) {
      const t = b[1][row % b[1].length];
      if (t === 's0' || t === 's1') { const off = t === 's1' ? -(L + J) / 2 : 0; for (let x = off; x < wallW; x += L + J) { g += brick(x, H, L, Th, .55); joints.push([x + L + J / 2, H, Th]); } H += Th + J; }
      else if (t === 'h') { for (let x = row % 4 === 3 ? -(Wd + J) / 2 : 0; x < wallW; x += Wd + J) g += brick(x, H, Wd, Th, .8); H += Th + J; }
      else if (t === 'f0' || t === 'f1') { let x = t === 'f1' ? (L - Wd) / 2 - (L + Wd + 2 * J) : 0; let s = t !== 'f1'; while (x < wallW) { const w = s ? L : Wd; g += brick(x, H, w, Th, s ? .55 : .85); x += w + J; s = !s; } H += Th + J; }
      else if (t === 'e') { let x = 0, s = true; const eh = Wd; while (x < wallW) { const w = s ? L : Th; g += brick(x, H, w, eh, s ? .45 : .85); if (s) g += '<rect x="' + ((x + 20) * k).toFixed(1) + '" y="' + ((H + 25) * k).toFixed(1) + '" width="' + ((L - 40) * k).toFixed(1) + '" height="' + ((eh - 50) * k).toFixed(1) + '" fill="none" stroke="var(--ink-3)" stroke-dasharray="2 2" stroke-width=".6"/>'; x += w + J; s = !s; } H += eh + J; }
      row++;
    }
    g += '</g>';
    if (b[5]) { const xs = [...new Set(joints.map(j => Math.round(j[0])))].filter(x => x > 0 && x < wallW); xs.forEach(x => g += '<line x1="' + (x * k) + '" x2="' + (x * k) + '" y1="0" y2="' + (H * k) + '" stroke="var(--red)" stroke-width="2" stroke-dasharray="5 3"/>'); }
    g += txt(wallW * k + 8, 14, '1.3 米', {s: 11, a: 'start', c: 'var(--ink-3)', halo: false});
    const svg = $('#bkSvg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Math.ceil(H * k + 4)); svg.innerHTML = g;
    kv($('#bkKv'), [['墙厚', b[3]], ['每平方米约', b[2] + ' 块'], ['一面 3×10 米的墙', fmt(b[2] * 30) + ' 块'], ['竖缝', b[5] ? '通缝 ✗' : '错开 ✓']]);
    $('#bkSay').innerHTML = b[4];
    $('#bkSay').className = 'say' + (b[5] ? ' bad' : '');
  }
  draw();
});
