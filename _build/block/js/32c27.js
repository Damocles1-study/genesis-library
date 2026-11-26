
/* ---------- 第二十七章：视野和帧数（控制变量的实验记录表） ---------- */
dev('#expFig', () => {
  const KEY = 'genesis-block-exp';
  /* 示意数据：不是真的测量结果，读者要换成自己测的 */
  const DEMO = [[4, 120, 118, 121], [8, 92, 95, 90], [12, 70, 72, 68], [16, 52, 50, 49], [24, 33, 35, 34], [32, 22, 21, 23]];
  let rows;
  try { rows = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { rows = null; }
  let demo = !rows; if (!rows) rows = DEMO.map(r => r.slice());
  const tb = $('#expTab');
  function table(){
    tb.innerHTML = '<tr><th>视野（区块）</th><th>第 1 次</th><th>第 2 次</th><th>第 3 次</th><th>平均</th></tr>' + rows.map((r, i) => '<tr>' + r.map((v, j) => '<td><input type="number" min="0" max="999" data-i="' + i + '" data-j="' + j + '" value="' + v + '" aria-label="第' + (i + 1) + '行第' + (j + 1) + '格"></td>').join('') + '<td class="avg"></td></tr>').join('');
  }
  function draw(){
    const av = rows.map(r => (r[1] + r[2] + r[3]) / 3);
    $$('td.avg', tb).forEach((td, i) => td.textContent = av[i].toFixed(1));
    const pts = rows.map((r, i) => [r[0], av[i]]).sort((a, b) => a[0] - b[0]);
    const ymax = Math.max(60, Math.ceil(Math.max(...av) / 20) * 20);
    lineChart($('#expSvg'), [{color: 'var(--main)', pts, dots: true}], {xmin: 0, xmax: 34, ymin: 0, ymax, xt: [2, 8, 12, 16, 24, 32], yt: [0, ymax / 4, ymax / 2, ymax * 3 / 4, ymax], H: 230, marks: [[12, '默认']]});
    $('#expSay').innerHTML = (demo ? '<b>现在显示的是编的示意数据</b>，不是真的测量结果。把表格换成你自己量的数字，图会跟着变。' : '这是你自己量的数字。') + '如果线是往下走的，说明视野越远，电脑一秒钟画的画面越少。帧数在 30 以上，一般就觉得流畅了。';
  }
  tb.addEventListener('input', e => { const t = e.target; if (!t.dataset.i) return; rows[+t.dataset.i][+t.dataset.j] = +t.value || 0; demo = false; try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch (er) {} draw(); });
  $('#expReset').addEventListener('click', () => { rows = DEMO.map(r => r.slice()); demo = true; try { localStorage.removeItem(KEY); } catch (er) {} table(); draw(); });
  table(); draw();
});
