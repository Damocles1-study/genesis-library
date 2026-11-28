/* ---------- 第二十四章：模拟 lldb ---------- */
dev('#lldbFig', fig => {
  const SRC = ['#include <stdio.h>', 'int sum(int *a, int n) {', '    int s = 0;', '    for (int i = 0; i <= n; i++)', '        s += a[i];', '    return s;', '}', 'int main(void) {', '    int a[4] = {3, 1, 4, 1};', '    int total = sum(a, 4);', '    printf("平均 %d\\n", total / 4);', '    return 0;', '}'];
  const srcEl = $('.lldbsrc', fig), outEl = $('.lldbout', fig), inp = $('#lldbCmd'), say = $('.say', fig);
  const A = [3, 1, 4, 1], JUNK = 32760, AADDR = '0x000000016fdff3a0';
  /* 事件：程序停在“即将执行某一行”时的状态 */
  const EV = []; const push = (fn, line, v) => EV.push({fn, line, v: Object.assign({}, v)});
  push('main', 9, {a: null, total: null});
  push('main', 10, {a: A, total: null});
  let s = null, i = null; push('sum', 3, {s, i}); s = 0; push('sum', 4, {s, i});
  for (i = 0; ; ) { push('sum', 5, {s, i}); s += i < 4 ? A[i] : JUNK; push('sum', 4, {s, i}); i++; if (!(i <= 4)) break; }
  push('sum', 6, {s, i: null}); const total = s;
  push('main', 11, {a: A, total}); push('main', 12, {a: A, total});
  const OUTPUT_AT = EV.length - 1; // 执行完第 11 行时打印
  let bps = [], pos = -1, done = false, printed = false;
  const pid = 4242;
  const log = t => { outEl.textContent += t + '\n'; outEl.scrollTop = outEl.scrollHeight; };
  function showSrc(){ const cur = pos >= 0 && !done ? EV[pos].line : -1; srcEl.innerHTML = SRC.map((l, k) => { const n = k + 1; return '<span class="ln' + (n === cur ? ' on' : '') + '">' + (bps.includes(n) ? '●' : ' ') + String(n).padStart(3) + '  ' + esc(l) + '</span>'; }).join('\n'); }
  const frameLine = e => e.fn === 'sum' ? 'frame #0: 0x0000000100003e' + (60 + e.line * 4).toString(16) + ' avg`sum(a=' + AADDR + ', n=4) at avg.c:' + e.line : 'frame #0: 0x0000000100003f' + (10 + e.line * 4).toString(16) + ' avg`main at avg.c:' + e.line;
  function stopReport(why){
    const e = EV[pos];
    log('Process ' + pid + ' stopped\n* thread #1, queue = \'com.apple.main-thread\', stop reason = ' + why + '\n    ' + frameLine(e));
    for (let n = Math.max(1, e.line - 2); n <= Math.min(SRC.length, e.line + 2); n++) log((n === e.line ? '-> ' : '   ') + String(n).padStart(3) + '   ' + SRC[n - 1]);
  }
  function advance(to, why){
    if (pos < OUTPUT_AT && to >= OUTPUT_AT && !printed) { log('平均 ' + Math.trunc(total / 4)); printed = true; }
    if (to >= EV.length) { pos = EV.length - 1; done = true; log('Process ' + pid + ' exited with status = 0 (0x00000000)'); showSrc(); return; }
    pos = to; stopReport(why); showSrc();
  }
  const depth = k => EV[k].fn === 'sum' ? 1 : 0;
  function nextIdx(pred){ for (let k = pos + 1; k < EV.length; k++) if (pred(k)) return k; return EV.length; }
  function val(name){
    const e = EV[pos], v = e.v;
    let m;
    if ((m = name.match(/^([a-z]+)\s*\[\s*(\w+)\s*\]$/))) {
      const base = m[1], idx = /^\d+$/.test(m[2]) ? +m[2] : v[m[2]];
      if (base !== 'a') return null; if (idx === null || idx === undefined) return 'error: use of undeclared identifier \'' + m[2] + '\'';
      if (e.fn === 'main' && !v.a) return '(int) ' + (idx < 4 ? 0 : JUNK);
      return '(int) ' + (idx >= 0 && idx < 4 ? A[idx] : idx === 4 ? JUNK : 1769235297);
    }
    if (e.fn === 'sum') {
      if (name === 'a') return '(int *) ' + AADDR; if (name === 'n') return '(int) 4';
      if (name === 's') return '(int) ' + (v.s === null ? 1 : v.s);
      if (name === 'i') return v.i === null ? (e.line === 6 ? 'error: use of undeclared identifier \'i\'（i 只在 for 循环里有）' : '(int) 0') : '(int) ' + v.i;
      if (name === '*a') return '(int) 3';
    } else {
      if (name === 'a') return '(int[4]) ' + (v.a ? '([0] = 3, [1] = 1, [2] = 4, [3] = 1)' : '([0] = 0, [1] = 0, [2] = 0, [3] = 0)');
      if (name === 'total') return '(int) ' + (v.total === null ? 0 : v.total);
    }
    return 'error: use of undeclared identifier \'' + name + '\'';
  }
  function exec(cmd){
    cmd = cmd.trim(); if (!cmd) return; log('(lldb) ' + cmd);
    const [c0, ...rest] = cmd.split(/\s+/), arg = rest.join(' ');
    const running = pos >= 0 && !done;
    if (c0 === 'restart') { reset(); return; }
    if (['help', 'h'].includes(c0)) { log('本模拟支持：b <行号或函数名>、run (r)、next (n)、step (s)、continue (c)、finish、p <变量或 a[下标]>、frame variable (v)、bt、list (l)、breakpoint list、quit (q)'); return; }
    if (['b', 'br', 'break', 'breakpoint'].includes(c0)) {
      let line = null; const a2 = arg.replace(/^set\s+(--line|-l)\s+/, '').replace(/^set\s+(--name|-n)\s+/, '');
      if (arg === 'list') { log(bps.length ? bps.map((n, k) => (k + 1) + ': file = \'avg.c\', line = ' + n).join('\n') : 'No breakpoints currently set.'); return; }
      if (/^\d+$/.test(a2)) line = +a2; else if (a2 === 'main') line = 9; else if (a2 === 'sum') line = 3;
      if (!line || line < 1 || line > SRC.length) { log('error: 没找到这个位置。试试 b 5 或 b sum'); return; }
      const ok = EV.some(e => e.line === line); if (!bps.includes(line)) bps.push(line);
      log('Breakpoint ' + bps.length + ': ' + (ok ? 'where = avg`' + (line < 8 ? 'sum' : 'main') + ' at avg.c:' + line + ', address = 0x0000000100003' + (line < 8 ? 'e' : 'f') + (60 + line * 4).toString(16) : 'no locations (pending).（这一行没有可执行的代码）'));
      showSrc(); return;
    }
    if (['r', 'run', 'process'].includes(c0)) {
      if (running) { log('（程序已经在运行。想从头来，点“重来”）'); return; }
      pos = -1; done = false; printed = false; log('Process ' + pid + ' launched: \'/Users/you/base/avg\' (arm64)');
      const k = nextIdx(k => bps.includes(EV[k].line)); advance(k, 'breakpoint ' + (bps.indexOf(EV[Math.min(k, EV.length - 1)].line) + 1) + '.1'); return;
    }
    if (!running && ['n', 'next', 's', 'step', 'c', 'continue', 'finish', 'p', 'print', 'v', 'frame', 'bt', 'thread'].includes(c0)) { log('error: Command requires a process which is currently stopped.（先 run）'); return; }
    if (['n', 'next'].includes(c0)) { const d = depth(pos); advance(nextIdx(k => depth(k) <= d), 'step over'); return; }
    if (['s', 'step'].includes(c0)) { advance(pos + 1, 'step in'); return; }
    if (['finish'].includes(c0)) { const d = depth(pos); if (!d) { log('error: 已经在最外层的 main 里了'); return; } advance(nextIdx(k => depth(k) < d), 'step out'); if (!done) log('Return value: (int) $0 = ' + total); return; }
    if (['c', 'continue'].includes(c0)) { log('Process ' + pid + ' resuming'); advance(nextIdx(k => bps.includes(EV[k].line)), 'breakpoint'); return; }
    if (['p', 'print', 'po', 'expr'].includes(c0)) { const r = val(arg); log(r === null ? 'error: 本模拟只认识变量名和 a[下标]' : r); hint(arg); return; }
    if (['v', 'frame'].includes(c0)) { const e = EV[pos]; log(e.fn === 'sum' ? '(int *) a = ' + AADDR + '\n(int) n = 4\n(int) s = ' + (e.v.s ?? 1) + (e.v.i !== null ? '\n(int) i = ' + e.v.i : '') : '(int[4]) a = ' + val('a').slice(8) + '\n(int) total = ' + (e.v.total ?? 0)); return; }
    if (['bt', 'thread'].includes(c0)) { const e = EV[pos]; log('* thread #1, queue = \'com.apple.main-thread\'\n  * ' + frameLine(e) + (e.fn === 'sum' ? '\n    frame #1: 0x0000000100003f38 avg`main at avg.c:10\n    frame #2: 0x000000018c2b3154 dyld`start + 2476' : '\n    frame #1: 0x000000018c2b3154 dyld`start + 2476')); return; }
    if (['l', 'list'].includes(c0)) { SRC.forEach((l, k) => log(String(k + 1).padStart(3) + '   ' + l)); return; }
    if (['q', 'quit', 'exit'].includes(c0)) { log('（真的 lldb 会退出。这里点“重来”从头开始）'); return; }
    log('error: \'' + c0 + '\' is not a valid command.（输入 help 看本模拟支持的命令）');
  }
  function hint(arg){
    const e = EV[pos];
    if (/a\s*\[\s*4\s*\]/.test(arg)) say.innerHTML = 'a[4] 越界了，读到的是数组后面的内存里碰巧留着的数（这里是 ' + JUNK + '），它被加进了 s。问题出在第 4 行的条件 <code>i &lt;= n</code>，应该是 <code>i &lt; n</code>。';
    else if (e.fn === 'sum' && e.line === 5 && e.v.i === 4) say.innerHTML = '<b>抓住了！</b>i 已经是 4，下一步要读 a[4]，可是 a 只有 a[0] 到 a[3]。试试 <code>p a[4]</code> 看看读到了什么。问题出在第 4 行的条件 <code>i &lt;= n</code>，应该是 <code>i &lt; n</code>。';
  }
  function reset(){ bps = []; pos = -1; done = false; printed = false; outEl.textContent = '(lldb) target create "avg"\nCurrent executable set to \'/Users/you/base/avg\' (arm64).\n'; showSrc(); say.innerHTML = '提示：先设断点，再 run。停下以后用 p 看变量，用 continue 跑到下一次断点。'; }
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { exec(inp.value); inp.value = ''; } });
  $('.btns', fig).addEventListener('click', e => { const b = e.target.closest('button[data-c]'); if (b) { exec(b.dataset.c); inp.focus({preventScroll: true}); } });
  reset();
});
