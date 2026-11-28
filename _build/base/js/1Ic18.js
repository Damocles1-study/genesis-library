/* ---------- 第十八章起共用：内存跟踪器 ----------
   memTrace(fig, programs)：programs = [{name, code:[行], steps:[{line, groups:[{t, cells:[{a, n, ty, v, to, hl}]}], out, note}]}]
   cell.to 是指针指向的地址（会把那个格子标出来），hl 表示这一步刚改过。 */
const ahex = a => '0x' + a.toString(16);
function memTrace(fig, P){
  const box = $('.trace', fig);
  let pi = 0, k = 0;
  box.innerHTML = '<div class="trwrap"><div class="trcode"></div><div class="trmem"></div></div><div class="btns"><button class="btn" data-d="-1">上一步</button><button class="btn pri" data-d="1">下一步</button><button class="btn" data-d="0">从头</button><span class="dim trn" style="font-size:13px;align-self:center"></span></div><div class="say"></div>';
  const codeEl = $('.trcode', box), memEl = $('.trmem', box), say = $('.say', box), num = $('.trn', box);
  function draw(){
    const p = P[pi], s = p.steps[k];
    codeEl.innerHTML = '<pre class="out">' + p.code.map((l, i) => '<span class="ln' + (i === s.line ? ' on' : '') + '">' + esc(l) + '</span>').join('\n') + '</pre>';
    const targets = new Set(); s.groups.forEach(g => g.cells.forEach(c => { if (c.to !== undefined && c.to !== null) targets.add(c.to); }));
    memEl.innerHTML = s.groups.map(g => '<div class="trg"><div class="trgt">' + g.t + '</div><table class="t trt"><tr><th>地址</th><th>名字</th><th>类型</th><th>值</th></tr>' + g.cells.map(c => '<tr class="' + (targets.has(c.a) ? 'tgt ' : '') + (c.hl ? 'hl' : '') + '"><td class="m">' + ahex(c.a) + '</td><td class="m">' + esc(c.n) + '</td><td class="m dim">' + esc(c.ty) + '</td><td class="m">' + (c.to !== undefined && c.to !== null ? '<span class="ptr">' + ahex(c.to) + ' →</span>' : esc(String(c.v))) + '</td></tr>').join('') + '</table></div>').join('') + (s.out ? '<div class="trout"><span class="dim">屏幕上：</span><code>' + esc(s.out) + '</code></div>' : '');
    say.innerHTML = s.note || '';
    num.textContent = '第 ' + (k + 1) + ' / ' + p.steps.length + ' 步';
  }
  $('.btns', box).addEventListener('click', e => { const b = e.target.closest('button[data-d]'); if (!b) return; const d = +b.dataset.d; k = d === 0 ? 0 : clamp(k + d, 0, P[pi].steps.length - 1); draw(); });
  const m = $('[data-m]', fig); if (m && P.length > 1) btnRow(m, P.map(p => p.name), 0, i => { pi = i; k = 0; draw(); });
  draw();
}
/* 小工具：按顺序生成步骤。cells 用对象记，snap() 拍一张快照 */
function traceBuilder(){
  const groups = [], steps = []; let changed = new Set();
  return {
    group(t){ groups.push({t, cells: []}); return groups.length - 1; },
    drop(gi){ groups.splice(gi, 1); },
    set(gi, a, n, ty, v, to){ const g = groups[gi]; let c = g.cells.find(x => x.a === a); if (!c) { c = {a, n, ty}; g.cells.push(c); g.cells.sort((x, y) => y.a - x.a); } c.n = n; c.ty = ty; c.v = v; c.to = to; changed.add(a); },
    val(gi, a, v){ const c = groups[gi].cells.find(x => x.a === a); c.v = v; changed.add(a); },
    snap(line, note, out){ steps.push({line, note, out, groups: groups.map(g => ({t: g.t, cells: g.cells.map(c => Object.assign({}, c, {hl: changed.has(c.a)}))}))}); changed = new Set(); },
    steps
  };
}

dev('#ptrFig', fig => {
  const X = 0x16fdff3ac, Y = 0x16fdff3a8, PP = 0x16fdff3a0;
  let b = traceBuilder(), g = b.group('main 的局部变量（在栈上）');
  b.set(g, X, 'x', 'int', '?'); b.set(g, Y, 'y', 'int', '?'); b.set(g, PP, 'p', 'int *', '?');
  b.snap(0, '进入 main。三个局部变量已经有了位置，但还没赋值，里面是以前留下的随机数据（“?”）。读没初始化的变量是未定义行为。');
  b.val(g, X, 5); b.snap(1, 'x 的 4 个字节里写进 5。');
  b.set(g, PP, 'p', 'int *', null, X); b.snap(2, 'p 里存的是 x 的地址 ' + ahex(X) + '。高亮的那一行就是 p 指向的格子。');
  b.val(g, X, 9); b.snap(3, '*p = 9：顺着 p 找到 ' + ahex(X) + '，把 9 写进去。没有提到 x 的名字，x 却变了。');
  b.val(g, Y, 10); b.snap(4, '*p 读出 9，加 1 得 10，写进 y。');
  b.set(g, PP, 'p', 'int *', null, Y); b.snap(5, 'p 改成指向 y。指针可以随时改指别处。');
  b.val(g, Y, 20); b.snap(6, '*p = *p * 2：读出 y 的 10，乘 2，写回 y。');
  b.snap(7, '打印 x 和 y。', '9 20');
  const P1 = {name: '指针的基本用法', code: ['int main(void) {', '    int x = 5;', '    int *p = &x;', '    *p = 9;', '    int y = *p + 1;', '    p = &y;', '    *p = *p * 2;', '    printf("%d %d\\n", x, y);', '}'], steps: b.steps};

  b = traceBuilder(); const gm = b.group('main 的栈帧');
  b.set(gm, X, 'x', 'int', 1); b.set(gm, Y, 'y', 'int', 2); b.snap(3, 'main 里 x = 1，y = 2。');
  let gs = b.group('swap_bad 的栈帧'); b.set(gs, 0x16fdff37c, 'a', 'int', 1); b.set(gs, 0x16fdff378, 'b', 'int', 2); b.set(gs, 0x16fdff374, 't', 'int', '?');
  b.snap(0, '调用 swap_bad(x, y)：它有自己的栈帧，a、b 是 x、y 的<b>复印件</b>，住在别的地址。');
  b.val(gs, 0x16fdff374, 1); b.val(gs, 0x16fdff37c, 2); b.val(gs, 0x16fdff378, 1); b.snap(0, '函数体执行完：a 和 b 换了。可是 main 里的 x、y 一点没动。');
  b.drop(1); b.snap(4, 'swap_bad 返回，它的栈帧被收回，复印件连同交换结果一起消失。x 还是 1，y 还是 2。');
  gs = b.group('swap 的栈帧'); b.set(gs, 0x16fdff380, 'a', 'int *', null, X); b.set(gs, 0x16fdff378, 'b', 'int *', null, Y); b.set(gs, 0x16fdff374, 't', 'int', '?');
  b.snap(1, '调用 swap(&x, &y)：这次复印的是<b>地址</b>。a 指向 x，b 指向 y。');
  b.val(gs, 0x16fdff374, 1); b.val(gm, X, 2); b.val(gm, Y, 1); b.snap(1, 't = *a 取出 1；*a = *b 把 y 的 2 写进 x；*b = t 把 1 写进 y。改的是 main 里的原件。');
  b.drop(1); b.snap(5, 'swap 返回。x = 2，y = 1，真的换了。');
  const P2 = {name: 'swap 两种写法', code: ['void swap_bad(int a, int b) { int t = a; a = b; b = t; }', 'void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }', 'int main(void) {', '    int x = 1, y = 2;', '    swap_bad(x, y);', '    swap(&x, &y);', '}'], steps: b.steps};
  memTrace(fig, [P1, P2]);
});
