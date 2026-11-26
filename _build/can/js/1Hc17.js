
/* ---------- 装置 18：瓶子里的氯 ---------- */
dev('#clFig', fig => {
  const svg = $('#clSvg'), kvb = $('#clKv'), say = $('#clSay');
  const BASE = [['八四原液 100 毫升', 1], ['兑好的消毒水 100 毫升（约 1:100）', 1 / 101]];
  const ADD = [['洁厕灵（盐酸）', 'hcl'], ['白醋（醋酸）', 'hac'], ['清水', 'w']];
  let bi = 0, ai = 0, vol = 50;
  const K1 = 4e-4, KA = Math.pow(10, -7.53), KAC = Math.pow(10, -4.76), KW = 1e-14;
  function solve(){
    const d = BASE[bi][1], V1 = 0.1, V2 = vol / 1000, Vt = V1 + V2;
    const T = 0.7 * d * V1 / Vt, Na = (0.7 + 0.7 + 0.05) * d * V1 / Vt;
    const clT = (0.7 * d * V1 + (ADD[ai][1] === 'hcl' ? 2.6 * V2 : 0)) / Vt;
    const acT = (ADD[ai][1] === 'hac' ? 0.67 * V2 : 0) / Vt;
    function sp(h){
      let cl = clT, hocl = 0, cl2 = 0, ocl = 0;
      for (let k = 0; k < 8; k++) { const r = h * cl / K1, s = KA / h; hocl = T / (1 + r + s); cl2 = r * hocl; ocl = s * hocl; cl = Math.max(1e-9, clT - cl2); }
      return {hocl, cl2, ocl, cl};
    }
    const f = pH => { const h = Math.pow(10, -pH), x = sp(h); return Na + h - KW / h - x.ocl - x.cl - acT * KAC / (KAC + h); };
    let lo = -1, hi = 14.5;
    for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; }
    const pH = (lo + hi) / 2, x = sp(Math.pow(10, -pH));
    const tot = x.hocl + x.cl2 + x.ocl || 1;
    const molCl2 = x.cl2 * Vt;                      // 此刻以氯气形式存在的
    const ppm = molCl2 * 24.5 / 5000 * 1e6;          // 5 立方米的小卫生间
    return {pH, fo: x.ocl / tot, fh: x.hocl / tot, fc: x.cl2 / tot, molCl2, ppm, g: molCl2 * 70.9};
  }
  const TH = [[0.3, '闻得到'], [3, '眼鼻刺痛'], [10, '“立即危及生命或健康”线'], [30, '剧烈咳嗽、胸闷'], [400, '半小时可能致命']];
  function draw(){
    const r = solve();
    const W = 600, H = 210, L = 20, R = 20;
    let g = txt(L, 18, '桶里的有效氯变成了什么', {s: 12, a: 'start', c: 'var(--ink-3)'});
    const segs = [[r.fo, '次氯酸根（在瓶里很安稳）', 'var(--ter)'], [r.fh, '次氯酸（消毒的主力）', 'var(--grn)'], [r.fc, '氯气', 'var(--red)']];
    let x = L; const bw = W - L - R;
    segs.forEach(s => { const w = s[0] * bw; if (w > 0.4) g += '<rect x="' + x.toFixed(1) + '" y="28" width="' + w.toFixed(1) + '" height="26" fill="' + s[2] + '" opacity=".8"/>'; if (w > 70) g += txt(x + w / 2, 46, Math.round(s[0] * 100) + '%', {s: 12, c: 'var(--paper)', halo: false, w: 1}); x += w; });
    segs.forEach((s, k) => { g += '<rect x="' + (L + k * 196) + '" y="62" width="11" height="11" fill="' + s[2] + '" opacity=".8"/>' + txt(L + 15 + k * 196, 72, s[1], {s: 11.5, a: 'start', c: 'var(--ink-2)', halo: false}); });
    /* ppm 对数尺 */
    const y0 = 150, X = p => L + (Math.log10(Math.max(p, 0.01)) + 2) / 5 * bw;
    g += txt(L, 104, '如果这些氯气全跑进一个约 5 立方米的小卫生间（对数刻度，ppm）', {s: 12, a: 'start', c: 'var(--ink-3)'});
    g += '<rect x="' + L + '" y="' + (y0 - 8) + '" width="' + bw + '" height="16" rx="8" fill="var(--paper-2)"/>';
    TH.forEach((t, k) => { const xx = X(t[0]); g += '<line x1="' + xx + '" x2="' + xx + '" y1="' + (y0 - 14) + '" y2="' + (y0 + 14) + '" stroke="var(--red)" stroke-dasharray="2 2"/>' + txt(xx, k % 2 ? y0 + 30 : y0 - 20, t[1], {s: 10.5, c: 'var(--red)'}); });
    [0.01, 0.1, 1, 10, 100, 1000].forEach(p => g += txt(X(p), y0 + 46, p >= 1 ? p : String(p), {s: 10.5, c: 'var(--ink-3)', halo: false}));
    const xp = X(r.ppm);
    g += '<rect x="' + L + '" y="' + (y0 - 8) + '" width="' + Math.max(0, xp - L) + '" height="16" rx="8" fill="var(--red)" opacity="' + (r.ppm > 0.3 ? .75 : .3) + '"/><circle cx="' + xp + '" cy="' + y0 + '" r="8" fill="var(--card)" stroke="var(--red)" stroke-width="3"/>';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const fp = p => p < 0.01 ? '不到 0.01' : p < 1 ? p.toFixed(2) : p < 100 ? p.toFixed(1) : Math.round(p).toLocaleString();
    kv(kvb, [['桶里的酸碱度', 'pH ' + r.pH.toFixed(1)], ['此刻以氯气形式存在', r.g < 0.01 ? '不到 0.01 克' : r.g.toFixed(2) + ' 克'], ['全跑出来的浓度', fp(r.ppm) + ' ppm']]);
    let s;
    if (vol === 0) s = '只有八四，碱性很强（pH 十二三），次氯酸钠几乎全以次氯酸根的形式安安稳稳地待着。拖地、擦桌子，按说明书兑好单独用就行。';
    else if (ADD[ai][1] === 'w') s = '兑清水只是变稀，碱性略降，氯还安稳。这就是说明书让你做的事。';
    else if (r.pH > 9) s = '倒进去的酸还不够把碱中和完，桶里还是碱性，暂时没放出多少氯气。可再多倒一点，或者局部没搅匀，酸碰到的那一小片就会冒气。';
    else if (r.ppm < 1) s = '酸性变强，次氯酸多了，氯气也开始出现了，量还小，但已经能闻到。这正是“兑点醋消毒更强”的偏方：消毒没强多少，先呛着自己。';
    else if (r.ppm < 30) s = '已经到了让眼睛、嗓子刺痛的程度，而且这只是全屋平均，弯腰凑在桶口的人吸到的要浓得多。转身出去，开窗。';
    else s = '<b>大部分有效氯变成了氯气</b>，全跑出来能到几十上百 ppm，足以伤肺。这就是每年都有人进医院的那种混法。人先出去，门带上，别回头收拾。';
    if (ADD[ai][1] === 'hac' && vol > 0) s += ' 和洁厕灵比一比：同样的量，白醋放的氯气少得多，因为醋酸是弱酸，pH 降不到那么低；少，但不是没有。';
    say.innerHTML = s;
  }
  btnRow($('#clBase'), BASE.map(b => b[0]), 0, i => { bi = i; draw(); });
  btnRow($('#clAdd'), ADD.map(b => '加' + b[0]), 0, i => { ai = i; draw(); });
  slider('clV', v => { vol = v; return v + ' 毫升'; }, draw);
});
