/* ---------- 装置 12：换一把尺子 ---------- */
dev('#czFig', () => {
  const U = [['埃及王室腕尺', 52.4], ['秦汉尺', 23.1], ['唐尺', 30], ['宋尺', 31.2], ['清营造尺', 32], ['市尺', 100 / 3], ['英尺', 30.48], ['米', 100]];
  const P = [['一扇门宽', 90], ['层高', 300], ['一开间', 360], ['帕特农神庙正面', 3090], ['太和殿面阔', 6001], ['胡夫金字塔底边', 23030]];
  const toV = cm => Math.round(Math.log10(cm / 10) / Math.log10(3000) * 1000);
  const toCm = v => 10 * Math.pow(3000, v / 1000);
  btnRow($('#czBtns'), P.map(p => p[0]), -1, i => { $('#czL').value = toV(P[i][1]); $('#czL').dispatchEvent(new Event('input')); });
  const fmtL = cm => cm >= 100 ? (cm / 100).toFixed(cm >= 1000 ? 1 : 2) + ' 米' : cm.toFixed(0) + ' 厘米';
  const Ls = slider('czL', v => fmtL(toCm(v)), () => draw());
  const Dd = slider('czD', v => v + ' 厘米', () => door());
  const fmtN = x => x >= 100 ? Math.round(x).toLocaleString() : x >= 10 ? x.toFixed(1) : x.toFixed(2);
  function draw(){
    const cm = toCm(Ls());
    bars($('#czBars'), U.map(u => [u[0], u[1], '一单位约 ' + (u[1] >= 100 ? '1 米' : u[1].toFixed(1) + ' 厘米'), u[0] === '米' ? 'var(--ink-3)' : 'var(--main)']), 100, () => '');
    $$('#czBars .row .v').forEach((el, i) => el.textContent = fmtN(cm / U[i][1]));
    const han = cm / 23.1, qing = cm / 32;
    $('#czSay').innerHTML = fmtL(cm) + '：用秦汉尺量是 ' + fmtN(han) + ' 尺，用清营造尺量只有 ' + fmtN(qing) + ' 尺，差了四成。' + (cm > 20000 ? ' 金字塔的边长正好约四百四十腕尺：用当时的尺子量，数字往往很“整”。' : '') + door(true);
  }
  const WORD = ['财', '病', '离', '义', '官', '劫', '害', '本'], GOOD = [1, 0, 0, 1, 1, 0, 0, 1], CHI = 46.08, CUN = CHI / 8;
  function door(ret){
    const w = Dd(), whole = Math.floor(w / CHI), rem = w - whole * CHI, idx = Math.min(7, Math.floor(rem / CUN));
    const svg = $('#czSvg'), X0 = 20, Wd = 560;
    let g = '';
    WORD.forEach((t, i) => { const x = X0 + i * Wd / 8; g += '<rect x="' + x + '" y="10" width="' + (Wd / 8 - 2) + '" height="40" rx="4" fill="' + (i === idx ? (GOOD[i] ? 'var(--grn)' : 'var(--red)') : 'var(--paper)') + '" fill-opacity="' + (i === idx ? .8 : 1) + '" stroke="var(--rule)"/>' + txt(x + Wd / 16, 37, t, {s: 18, c: i === idx ? 'var(--card)' : (GOOD[i] ? 'var(--grn)' : 'var(--ink-3)'), halo: false}); });
    const px = X0 + rem / CHI * Wd;
    g += '<path d="M' + px + ',54l-6,10h12z" fill="var(--ink)"/>' + txt(px, 78, '门宽落在这里', {s: 11, c: 'var(--ink-2)'});
    svg.setAttribute('viewBox', '0 0 600 84'); svg.innerHTML = g;
    const msg = ' 门宽 ' + w + ' 厘米 = ' + whole + ' 门光尺多一点，落在“' + WORD[idx] + '”字上，' + (GOOD[idx] ? '按老讲究是吉。' : '按老讲究要避开，木匠会把门改宽或改窄一点。');
    if (ret) return msg;
    draw();
  }
  draw();
});
