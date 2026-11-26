
/* ---------- 第十一章：四位加法器 ---------- */
dev('#addFig', () => {
  const A = [0, 0, 0, 1], B = [0, 0, 0, 1], V = [8, 4, 2, 1];
  const box = $('#addBox');
  const num = a => a.reduce((s, b, i) => s + b * V[i], 0);
  function draw(){
    /* 从右往左（个位开始）一位一位加；cin[i] 是从右边一列进到第 i 列的 1 */
    const S = [0, 0, 0, 0], cin = [0, 0, 0, 0]; let c = 0;
    for (let i = 3; i >= 0; i--) { cin[i] = c; S[i] = A[i] ^ B[i] ^ c; c = (A[i] & B[i]) | (c & (A[i] ^ B[i])); }
    const btn = (v, k) => '<button class="bit in' + (v ? ' on' : '') + '" data-k="' + k + '" aria-label="' + k + '">' + v + '</button>';
    const out = v => '<div class="bit out' + (v ? ' on' : '') + '">' + v + '</div>';
    const cr = v => '<div class="cr' + (v ? ' on' : '') + '">' + (v ? '进 1' : '') + '</div>';
    let h = '<div class="lab">每格代表</div><div class="hd">16</div>' + V.map(v => '<div class="hd">' + v + '</div>').join('');
    h += '<div class="lab">A</div><div></div>' + A.map((v, i) => btn(v, 'A' + i)).join('');
    h += '<div class="lab">B</div><div></div>' + B.map((v, i) => btn(v, 'B' + i)).join('');
    h += '<div class="lab">进位</div>' + cr(c) + cin.map(cr).join('');
    h += '<div class="lab">和</div>' + out(c) + S.map(out).join('');
    box.innerHTML = h;
    const a = num(A), b = num(B), s = a + b;
    $('#addSay').innerHTML = 'A = <b>' + A.join('') + '</b>（' + a + '），B = <b>' + B.join('') + '</b>（' + b + '）。加起来是 <b>' + (c ? '1' : '') + S.join('') + '</b>，也就是 <b>' + s + '</b>。' +
      (s > 15 ? '超过 15 了，四格放不下，最左边多出来的那个 1 就是“进位”：真的电脑会把它交给下一组加法器。' : a === 1 && b === 1 ? '一加一，在二进制里写成 10：这一格满二就往左进一，和十进制满十进一是一个道理。' : '点一点 A、B 两行的格子，换两个数试试。');
  }
  box.addEventListener('click', e => { const b = e.target.closest('button.bit'); if (!b) return; const k = b.dataset.k, arr = k[0] === 'A' ? A : B; arr[+k[1]] ^= 1; draw(); });
  $('#addInc').addEventListener('click', () => { let a = (num(A) + 1) % 16; for (let i = 3; i >= 0; i--) { A[i] = a & 1; a >>= 1; } draw(); });
  $('#addClr').addEventListener('click', () => { A.fill(0); B.fill(0); draw(); });
  draw();
});
