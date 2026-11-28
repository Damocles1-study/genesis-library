/* ---------- 第四章：一摞盘子（撤销、括号配对、出栈序列） ---------- */
dev('#stackFig', fig => {
  const body = $('.stkbody', fig), say = $('.say', fig);
  let mode = 0;
  const stackHtml = (arr, title) => '<div><h5>' + title + '</h5><div class="stackv">' + (arr.length ? arr.map((v, i) => '<span class="' + (i === arr.length - 1 ? 'top' : '') + '">' + v + '</span>').join('') : '<span class="dim" style="border-style:dashed">空</span>') + '</div></div>';
  /* 玩法一：撤销 */
  function undoMode(){
    let row = '..#..:..'.split(''), U = [], R = [];
    const draw = msg => {
      body.innerHTML = '<div class="isle" id="stRow"></div><div class="btns"><button class="btn" data-u="u">撤销</button><button class="btn" data-u="r">重做</button></div><div class="twocol">' + stackHtml(U.map(c => '(' + c[0] + ') ' + c[1] + '→' + c[2]), '撤销栈') + stackHtml(R.map(c => '(' + c[0] + ') ' + c[1] + '→' + c[2]), '重做栈') + '</div>';
      isleDraw($('#stRow', body), [row], {click: x => { const old = row[x], nw = old === '#' ? '.' : old === '.' ? '#' : '.'; row[x] = nw; U.push([x, TILE[old], TILE[nw]]); R = []; draw('在第 ' + x + ' 格把' + TILE[old] + '换成' + TILE[nw] + '：卡片压进撤销栈，重做栈清空。'); }});
      $('[data-u="u"]', body).onclick = () => { if (!U.length) { draw('撤销栈空了，没有可以撤销的。'); return; } const c = U.pop(); row[c[0]] = {'草': '.', '石': '#', '沙': ':'}[c[1]]; R.push(c); draw('从撤销栈顶拿下一张：第 ' + c[0] + ' 格改回' + c[1] + '。这张卡片放到重做栈上。'); };
      $('[data-u="r"]', body).onclick = () => { if (!R.length) { draw('重做栈空了。'); return; } const c = R.pop(); row[c[0]] = {'草': '.', '石': '#', '沙': ':'}[c[2]]; U.push(c); draw('从重做栈顶拿回一张：第 ' + c[0] + ' 格又变成' + c[2] + '。'); };
      if (msg) say.textContent = msg;
    };
    draw('点格子：草变石头，石头变回草。做几步，再试撤销和重做。');
  }
  /* 玩法二：括号配对 */
  function bracketMode(){
    body.innerHTML = '<div class="row"><input type="text" id="stIn" value="{[()()]}(" style="font-family:var(--f-mono);flex:1" aria-label="括号串"><button class="btn pri" data-b="s">走一步</button><button class="btn" data-b="r">从头</button></div><div class="cells" id="stStr"></div><div class="stkwrap"></div>';
    const inp = $('#stIn', body); let i, st, done;
    const pair = {')': '(', ']': '[', '}': '{'};
    const draw = () => { const s = inp.value; $('#stStr', body).innerHTML = [...s].map((c, k) => '<span class="' + (k === i - 1 ? 'hl' : k < i ? 'dim' : '') + '">' + c + '<small>' + k + '</small></span>').join(''); $('.stkwrap', body).innerHTML = stackHtml(st, '栈（最上面是栈顶）'); };
    const reset = () => { i = 0; st = []; done = false; draw(); say.textContent = '从左往右读。左括号压栈，右括号要和栈顶配对。'; };
    $('[data-b="r"]', body).onclick = reset; inp.oninput = reset;
    $('[data-b="s"]', body).onclick = () => {
      const s = inp.value; if (done) return;
      if (i >= s.length) { done = true; say.textContent = st.length ? '读完了，可栈里还剩 ' + st.join('') + '：有括号没关。不配对。' : '读完了，栈是空的：全部配对！'; return; }
      const c = s[i++];
      if ('([{'.includes(c)) { st.push(c); say.textContent = '“' + c + '”是左括号：压栈。'; }
      else if (pair[c]) { if (!st.length) { done = true; say.textContent = '“' + c + '”是右括号，可栈是空的：多了一个右括号。不配对。'; } else if (st[st.length - 1] !== pair[c]) { done = true; say.textContent = '“' + c + '”要配“' + pair[c] + '”，可栈顶是“' + st[st.length - 1] + '”。不配对。'; } else { st.pop(); say.textContent = '“' + c + '”和栈顶的“' + pair[c] + '”配上了：弹栈。'; } }
      else say.textContent = '“' + c + '”不是括号，跳过。';
      draw();
    };
    reset();
  }
  /* 玩法三：出栈序列（第二层） */
  function seqMode(){
    body.innerHTML = '<p class="dim" style="font-size:13.5px;margin:.2em 0">1, 2, 3, 4, 5 依次入栈。输入一个出栈序列（用空格隔开），看它能不能做到。</p><div class="row"><input type="text" id="sqIn" value="3 2 4 1 5" style="font-family:var(--f-mono);flex:1" aria-label="出栈序列"><button class="btn pri" data-q="go">模拟</button><button class="btn" data-q="all">列出全部 42 种</button></div><div class="stkwrap"></div>';
    const run = seq => { const st = []; let next = 1; const log = []; for (const x of seq) { while (next <= x) { st.push(next); log.push('入 ' + next); next++; } if (st[st.length - 1] !== x) return {ok: false, log, st: st.slice(), x}; st.pop(); log.push('出 ' + x); } return {ok: true, log}; };
    $('[data-q="go"]', body).onclick = () => {
      const seq = $('#sqIn', body).value.trim().split(/[\s,，]+/).map(Number);
      const sorted = seq.slice().sort((a, b) => a - b).join(',');
      if (sorted !== '1,2,3,4,5') { say.textContent = '请输入 1 到 5 的一个排列，每个数用一次。'; return; }
      const r = run(seq);
      $('.stkwrap', body).innerHTML = r.ok ? '' : stackHtml(r.st, '卡住时的栈');
      say.textContent = (r.ok ? '可以！' : '做不到：要出 ' + r.x + '，可它不在栈顶（栈顶是 ' + r.st[r.st.length - 1] + '）。') + ' 过程：' + r.log.join('，') + '。';
    };
    $('[data-q="all"]', body).onclick = () => {
      const all = [], perm = (pre, rest) => { if (!rest.length) { if (run(pre).ok) all.push(pre.join('')); return; } rest.forEach((v, k) => perm(pre.concat(v), rest.slice(0, k).concat(rest.slice(k + 1)))); };
      perm([], [1, 2, 3, 4, 5]);
      $('.stkwrap', body).innerHTML = '<div class="cells">' + all.map(s => '<span>' + s + '</span>').join('') + '</div>';
      say.textContent = '一共 ' + all.length + ' 种，正好是卡特兰数 C₅ = C(10,5)/6 = 42。全部 120 种排列里，其余 78 种都做不到。';
    };
    say.textContent = '试试 3 1 2 4 5，再试 4 5 3 2 1。';
  }
  btnRow($('[data-m]', fig), ['撤销', '括号配对', '出栈序列（第二层）'], 0, i => { mode = i; [undoMode, bracketMode, seqMode][i](); });
  undoMode();
});
