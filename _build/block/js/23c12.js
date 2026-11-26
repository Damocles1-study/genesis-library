
/* ---------- 第十二章：会记事的电路 ---------- */
dev('#latchFig', () => {
  const p = RS_PRESET.latch;
  const bd = Board($('#latchSvg'), {onChange: b => {
    const L = b.cell(8, 1).lit > 0, s = b.cell(1, 1).on > 0, r = b.cell(5, 0).on > 0;
    $('#latchSay').innerHTML = (s ? '你正按着“记”。' : r ? '你正按着“忘”。' : '现在两个按钮都没按。') + '灯<b>' + (L ? '亮着' : '灭着') + '</b>' + (!s && !r ? (L ? '：它记得你按过“记”。' : '：它记得你最后按的是“忘”（或者还没按过）。') : '。');
  }});
  bd.load(p);
  $('#latchSlow').addEventListener('click', e => { const on = e.target.classList.toggle('on'); bd.speed(on ? 600 : 100); });
});

dev('#memFig', () => {
  const IT = [['一个英文字母', 8], ['一个汉字', 24], ['这一章的全部文字', 6000 * 24], ['一张手机照片', 3e6 * 8], ['一首歌', 4e6 * 8], ['一部电影', 2e9 * 8], ['8 GB 内存（小格那台电脑）', 8 * 1073741824 * 8]];
  let it = 0;
  function draw(){
    const per = +$('#memPer').value, bits = IT[it][1], blocks = bits * per, side = Math.sqrt(blocks);
    const sideS = side >= 1000 ? (side / 1000).toFixed(side >= 1e4 ? 0 : 1) + ' 千米' : Math.round(side) + ' 米';
    kv($('#memKv'), [['要记住的“0 和 1”', fmt(bits) + ' 个'], ['需要的方块', '约 ' + fmt(blocks) + ' 块'], ['铺成一层正方形', '边长约 ' + sideS]]);
    const gugong = blocks / 720000, field = blocks / 7140;
    $('#memSay').innerHTML = '记住' + IT[it][0] + '，' + (blocks < 7140 ? '大概一间大教室的地面就铺得下。' : blocks < 720000 ? '要铺满大约 <b>' + field.toFixed(field < 10 ? 1 : 0) + '</b> 个足球场。' : '要铺满大约 <b>' + fmt(gugong) + '</b> 个故宫那么大的地。') +
      (it === 6 ? '真的内存条把这么多“记忆格子”挤进了指甲盖大小的芯片里，每一格比细菌还小得多。' : '');
  }
  btnRow($('#memIt'), IT.map(x => x[0]), 0, i => { it = i; draw(); });
  slider('memPer', v => '每格 ' + v + ' 块', draw);
});
