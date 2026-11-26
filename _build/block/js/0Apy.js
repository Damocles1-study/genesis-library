/* ================= 小蟒：网页里的一个迷你 Python（第十部用） =================
   只实现 Python 的一小部分：数、字符串、True/False/None、列表、元组、字典、
   + - * / // % **、比较、and or not、in、if/elif/else、while、for、break、continue、
   def/return（可递归）、print、len、range、str、int、float、abs、min、max、sum、sorted、
   list、round、random.randint/choice、f"..."；还有 setblock(x, y, z, "stone") 在小地上放方块。
   一步一步运行：语句用生成器写，每执行一句 yield 一次。 */
class PyFloat { constructor(v){ this.v = v; } }
class PyTuple { constructor(a){ this.a = a; } }
class PyDict { constructor(){ this.m = new Map(); } key(k){ return (typeof k) + ':' + pyRepr(k); } get(k){ const e = this.m.get(this.key(k)); return e ? e[1] : undefined; } set(k, v){ this.m.set(this.key(k), [k, v]); } has(k){ return this.m.has(this.key(k)); } del(k){ this.m.delete(this.key(k)); } keys(){ return [...this.m.values()].map(e => e[0]); } vals(){ return [...this.m.values()].map(e => e[1]); } }
class PyFn { constructor(name, params, defs, body, g){ Object.assign(this, {name, params, defs, body, g}); } }
class PyErr extends Error { constructor(type, msg, line){ super(msg); this.type = type; this.line = line; } }
const ERRZH = {NameError: '用了一个还没有定义（赋值）过的名字。拼对了吗？大小写对吗？', SyntaxError: '写法不对：少了冒号、括号没配对、缩进不对，或者有中文标点。', IndentationError: '缩进不对：同一层的代码要对齐，冒号后面的那几行要往里缩 4 个空格。', TypeError: '类型不对：比如把数字和字符串直接相加，要先用 str() 或 int() 转一下。', IndexError: '下标超出范围：列表有 n 个，下标只能是 0 到 n − 1。', KeyError: '字典里没有这个键。', ZeroDivisionError: '除以 0 了。', ValueError: '值不对：比如 int("abc")。', RecursionError: '递归太深了：函数一直调用自己，没有停下来的条件。', TimeoutError: '运行了太多步还没结束，可能是死循环（while 的条件一直成立）。', AttributeError: '这个东西没有这个方法。'};
const isF = x => x instanceof PyFloat, nv = x => isF(x) ? x.v : x === true ? 1 : x === false ? 0 : x;
const isNum = x => typeof x === 'number' || isF(x) || typeof x === 'boolean';
function pyRepr(x, inner){
  if (x === null || x === undefined) return 'None';
  if (x === true) return 'True'; if (x === false) return 'False';
  if (typeof x === 'number') return String(x);
  if (isF(x)) { const v = x.v; if (!isFinite(v)) return v > 0 ? 'inf' : '-inf'; if (Number.isInteger(v) && Math.abs(v) < 1e16) return v + '.0'; return String(+v.toPrecision(15)); }
  if (typeof x === 'string') return inner ? "'" + x.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'" : x;
  if (Array.isArray(x)) return '[' + x.map(v => pyRepr(v, 1)).join(', ') + ']';
  if (x instanceof PyTuple) return '(' + x.a.map(v => pyRepr(v, 1)).join(', ') + (x.a.length === 1 ? ',' : '') + ')';
  if (x instanceof PyDict) return '{' + [...x.m.values()].map(e => pyRepr(e[0], 1) + ': ' + pyRepr(e[1], 1)).join(', ') + '}';
  if (x instanceof PyFn) return '<function ' + x.name + '>';
  if (typeof x === 'function') return '<built-in function ' + (x.pyname || 'f') + '>';
  if (x && x.__mod) return '<module ' + x.__mod + '>';
  return String(x);
}
const pyType = x => x === null ? 'NoneType' : typeof x === 'boolean' ? 'bool' : typeof x === 'number' ? 'int' : isF(x) ? 'float' : typeof x === 'string' ? 'str' : Array.isArray(x) ? 'list' : x instanceof PyTuple ? 'tuple' : x instanceof PyDict ? 'dict' : x instanceof PyFn || typeof x === 'function' ? 'function' : 'object';
const truthy = x => !(x === null || x === false || x === 0 || x === '' || (isF(x) && x.v === 0) || (Array.isArray(x) && !x.length) || (x instanceof PyTuple && !x.a.length) || (x instanceof PyDict && !x.m.size));

/* ---------- 词法 ---------- */
function pyLex(src){
  const T = [], lines = src.replace(/\r/g, '').replace(/\t/g, '    ').split('\n'); const ind = [0]; let depth = 0;
  const KW = new Set(['if', 'elif', 'else', 'while', 'for', 'in', 'def', 'return', 'break', 'continue', 'pass', 'and', 'or', 'not', 'True', 'False', 'None', 'import', 'from', 'is', 'global', 'del']);
  lines.forEach((ln, li) => {
    const line = li + 1;
    if (depth === 0) {
      if (/^\s*(#.*)?$/.test(ln)) return;
      const sp = ln.match(/^ */)[0].length;
      if (sp > ind[ind.length - 1]) { ind.push(sp); T.push({t: 'INDENT', line}); }
      while (sp < ind[ind.length - 1]) { ind.pop(); T.push({t: 'DEDENT', line}); }
      if (sp !== ind[ind.length - 1]) throw new PyErr('IndentationError', 'unindent does not match any outer indentation level', line);
    }
    let i = depth ? 0 : ln.match(/^ */)[0].length;
    while (i < ln.length) {
      const c = ln[i];
      if (c === ' ') { i++; continue; }
      if (c === '#') break;
      if (/[　，。：；（）“”‘’【】]/.test(c)) throw new PyErr('SyntaxError', 'invalid character \'' + c + '\' (U+' + c.codePointAt(0).toString(16).toUpperCase() + ')', line);
      let m;
      if ((m = ln.slice(i).match(/^(\d+\.\d*|\.\d+|\d+)/))) { T.push({t: 'NUM', v: m[0].includes('.') ? new PyFloat(+m[0]) : +m[0], line}); i += m[0].length; continue; }
      if ((m = ln.slice(i).match(/^([fF]?)(['"])/))) {
        const q = m[2], f = !!m[1]; let j = i + m[0].length, s = '';
        while (j < ln.length && ln[j] !== q) { if (ln[j] === '\\' && j + 1 < ln.length) { const n = ln[j + 1]; s += n === 'n' ? '\n' : n === 't' ? '\t' : n; j += 2; } else s += ln[j++]; }
        if (j >= ln.length) throw new PyErr('SyntaxError', 'unterminated string literal（引号没有配对）', line);
        T.push({t: f ? 'FSTR' : 'STR', v: s, line}); i = j + 1; continue;
      }
      if ((m = ln.slice(i).match(/^[A-Za-z_一-鿿][A-Za-z0-9_一-鿿]*/))) { T.push({t: KW.has(m[0]) ? m[0] : 'NAME', v: m[0], line}); i += m[0].length; continue; }
      if ((m = ln.slice(i).match(/^(\*\*=|\/\/=|\*\*|\/\/|==|!=|<=|>=|\+=|-=|\*=|\/=|%=|[-+*/%<>=()[\]{}:,.])/))) { const o = m[0]; if ('([{'.includes(o)) depth++; if (')]}'.includes(o)) depth = Math.max(0, depth - 1); T.push({t: o, line}); i += o.length; continue; }
      throw new PyErr('SyntaxError', 'invalid syntax：不认识“' + c + '”', line);
    }
    if (depth === 0) T.push({t: 'NL', line});
  });
  while (ind.length > 1) { ind.pop(); T.push({t: 'DEDENT', line: lines.length}); }
  T.push({t: 'EOF', line: lines.length});
  return T;
}
/* ---------- 语法 ---------- */
function pyParse(src){
  const T = pyLex(src); let p = 0;
  const peek = (o) => T[p + (o || 0)], at = t => T[p].t === t, eat = t => { if (T[p].t !== t) throw new PyErr('SyntaxError', 'expected \'' + t + '\'' + (t === ':' ? '（这一行最后是不是少了冒号？）' : '') + '，got ' + (T[p].t === 'NL' ? '行尾' : T[p].t === 'EOF' ? '文件结尾' : '\'' + (T[p].v || T[p].t) + '\''), T[p].line); return T[p++]; }, opt = t => at(t) ? T[p++] : null;
  function block(){ eat(':'); if (!at('NL')) { const s = simple(); return [s]; } eat('NL'); if (!at('INDENT')) throw new PyErr('IndentationError', 'expected an indented block（冒号后面那几行要往里缩进）', T[p].line); eat('INDENT'); const b = []; while (!at('DEDENT') && !at('EOF')) b.push(stmt()); opt('DEDENT'); return b; }
  function stmt(){
    const tk = T[p], line = tk.line;
    if (tk.t === 'if') { p++; const br = [[expr(), block()]]; let els = null; while (at('elif')) { p++; br.push([expr(), block()]); } if (at('else')) { p++; els = block(); } return {k: 'if', br, els, line}; }
    if (tk.t === 'while') { p++; const c = expr(); return {k: 'while', c, body: block(), line}; }
    if (tk.t === 'for') { p++; const tgt = targets(); eat('in'); const it = expr(); return {k: 'for', tgt, it, body: block(), line}; }
    if (tk.t === 'def') { p++; const name = eat('NAME').v; eat('('); const params = [], defs = []; while (!at(')')) { params.push(eat('NAME').v); if (opt('=')) defs.push(expr()); else defs.push(undefined); if (!opt(',')) break; } eat(')'); return {k: 'def', name, params, defs, body: block(), line}; }
    const s = simple(); return s;
  }
  function simple(){
    const tk = T[p], line = tk.line; let s;
    if (tk.t === 'return') { p++; s = {k: 'return', e: at('NL') ? null : exprList(), line}; }
    else if (tk.t === 'break' || tk.t === 'continue' || tk.t === 'pass') { p++; s = {k: tk.t, line}; }
    else if (tk.t === 'import') { p++; const n = eat('NAME').v; s = {k: 'import', n, line}; }
    else if (tk.t === 'from') { p++; const n = eat('NAME').v; eat('import'); const names = []; if (opt('*')) names.push('*'); else { names.push(eat('NAME').v); while (opt(',')) names.push(eat('NAME').v); } s = {k: 'from', n, names, line}; }
    else if (tk.t === 'global') { p++; eat('NAME'); while (opt(',')) eat('NAME'); s = {k: 'pass', line}; }
    else if (tk.t === 'del') { p++; s = {k: 'del', e: expr(), line}; }
    else {
      const e = exprList();
      if (at('=')) { const tg = [e]; let v; while (opt('=')) { v = exprList(); tg.push(v); } v = tg.pop(); s = {k: 'assign', tg, v, line}; }
      else if (['+=', '-=', '*=', '/=', '//=', '%=', '**='].includes(T[p].t)) { const op = T[p++].t.slice(0, -1); s = {k: 'aug', tg: e, op, v: expr(), line}; }
      else s = {k: 'expr', e, line};
    }
    if (!at('EOF')) { if (at('DEDENT')) return s; eat('NL'); }
    return s;
  }
  function targets(){ const a = [primary()]; while (opt(',')) a.push(primary()); return a.length > 1 ? {k: 'tuple', a} : a[0]; }
  function exprList(){ const a = [expr()]; if (!at(',')) return a[0]; while (opt(',')) { if (at('NL') || at('=') || at(')')) break; a.push(expr()); } return {k: 'tuple', a}; }
  function expr(){ return orE(); }
  function orE(){ let l = andE(); while (at('or')) { p++; l = {k: 'or', l, r: andE()}; } return l; }
  function andE(){ let l = notE(); while (at('and')) { p++; l = {k: 'and', l, r: notE()}; } return l; }
  function notE(){ if (at('not')) { p++; return {k: 'not', e: notE()}; } return cmp(); }
  function cmp(){ let l = add(); const ops = [], rs = []; for (;;) { let op = null; if (['==', '!=', '<', '>', '<=', '>='].includes(T[p].t)) op = T[p++].t; else if (at('in')) { p++; op = 'in'; } else if (at('not') && peek(1).t === 'in') { p += 2; op = 'not in'; } else if (at('is')) { p++; op = opt('not') ? 'is not' : 'is'; } if (!op) break; ops.push(op); rs.push(add()); } return ops.length ? {k: 'cmp', l, ops, rs} : l; }
  function add(){ let l = mul(); while (at('+') || at('-')) { const op = T[p++].t; l = {k: 'bin', op, l, r: mul()}; } return l; }
  function mul(){ let l = unary(); while (at('*') || at('/') || at('//') || at('%')) { const op = T[p++].t; l = {k: 'bin', op, l, r: unary()}; } return l; }
  function unary(){ if (at('-') || at('+')) { const op = T[p++].t; return {k: 'neg', op, e: unary()}; } return pow(); }
  function pow(){ const b = primary(); if (at('**')) { p++; return {k: 'bin', op: '**', l: b, r: unary()}; } return b; }
  function primary(){
    let e = atom();
    for (;;) {
      if (at('(')) { const line = T[p].line; p++; const args = []; while (!at(')')) { args.push(expr()); if (!opt(',')) break; } eat(')'); e = {k: 'call', f: e, args, line}; }
      else if (at('[')) { p++; let a = null, b = null, sl = false; if (!at(':')) a = expr(); if (opt(':')) { sl = true; if (!at(']')) b = expr(); } eat(']'); e = sl ? {k: 'slice', e, a, b} : {k: 'idx', e, i: a}; }
      else if (at('.')) { p++; e = {k: 'attr', e, n: eat('NAME').v}; }
      else return e;
    }
  }
  function atom(){
    const tk = T[p];
    if (tk.t === 'NUM') { p++; return {k: 'lit', v: tk.v}; }
    if (tk.t === 'STR') { p++; let v = tk.v; while (at('STR')) v += T[p++].v; return {k: 'lit', v}; }
    if (tk.t === 'FSTR') { p++; return {k: 'fstr', s: tk.v, line: tk.line}; }
    if (tk.t === 'True' || tk.t === 'False') { p++; return {k: 'lit', v: tk.t === 'True'}; }
    if (tk.t === 'None') { p++; return {k: 'lit', v: null}; }
    if (tk.t === 'NAME') { p++; return {k: 'name', n: tk.v, line: tk.line}; }
    if (tk.t === '(') { p++; if (opt(')')) return {k: 'tuple', a: []}; const e = expr(); if (at(',')) { const a = [e]; while (opt(',')) { if (at(')')) break; a.push(expr()); } eat(')'); return {k: 'tuple', a}; } eat(')'); return e; }
    if (tk.t === '[') { p++; const a = []; while (!at(']')) { a.push(expr()); if (!opt(',')) break; } eat(']'); return {k: 'list', a}; }
    if (tk.t === '{') { p++; const a = []; while (!at('}')) { const k = expr(); eat(':'); a.push([k, expr()]); if (!opt(',')) break; } eat('}'); return {k: 'dict', a}; }
    throw new PyErr('SyntaxError', 'invalid syntax：这里不该出现“' + (tk.v || tk.t) + '”', tk.line);
  }
  const prog = []; while (!at('EOF')) { if (opt('NL')) continue; prog.push(stmt()); }
  return prog;
}
/* ---------- 运行 ---------- */
class BreakSig {} class ContSig {} class RetSig { constructor(v){ this.v = v; } }
function pyRun(src, io){
  io = io || {};
  const out = io.out || (() => {}), G = new Map();
  let steps = 0, depth = 0, curLine = 0; const LIMIT = io.limit || 300000;
  const err = (t, m) => { throw new PyErr(t, m, curLine); };
  const num = (x, op) => { if (!isNum(x)) err('TypeError', "unsupported operand type(s) for " + op + ": '" + pyType(x) + "'"); return nv(x); };
  const mk = (v, flt) => flt ? new PyFloat(v) : v;
  function binop(op, a, b){
    if (op === '+') { if (typeof a === 'string' && typeof b === 'string') return a + b; if (Array.isArray(a) && Array.isArray(b)) return a.concat(b); if (typeof a === 'string' || typeof b === 'string') err('TypeError', 'can only concatenate str (not "' + pyType(typeof a === 'string' ? b : a) + '") to str（数字和字符串不能直接相加，用 str() 转一下）'); }
    if (op === '*') { if (typeof a === 'string' && typeof b === 'number') return a.repeat(Math.max(0, b)); if (typeof b === 'string' && typeof a === 'number') return b.repeat(Math.max(0, a)); if (Array.isArray(a) && typeof b === 'number') { let r = []; for (let i = 0; i < b; i++) r = r.concat(a); return r; } }
    if (op === '%' && typeof a === 'string') err('TypeError', '这个小蟒不支持用 % 格式化字符串，请用 f"..."');
    const x = num(a, op), y = num(b, op), fl = isF(a) || isF(b);
    switch (op) {
      case '+': return mk(x + y, fl); case '-': return mk(x - y, fl); case '*': return mk(x * y, fl);
      case '/': if (y === 0) err('ZeroDivisionError', 'division by zero'); return new PyFloat(x / y);
      case '//': if (y === 0) err('ZeroDivisionError', 'integer division or modulo by zero'); return mk(Math.floor(x / y), fl);
      case '%': if (y === 0) err('ZeroDivisionError', 'integer modulo by zero'); return mk(((x % y) + y) % y, fl);
      case '**': return mk(Math.pow(x, y), fl || y < 0);
    }
  }
  function eq(a, b){ if (isNum(a) && isNum(b)) return nv(a) === nv(b); if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => eq(v, b[i])); if (a instanceof PyTuple && b instanceof PyTuple) return eq(a.a, b.a); return a === b; }
  function compare(op, a, b){
    if (op === '==') return eq(a, b); if (op === '!=') return !eq(a, b);
    if (op === 'in' || op === 'not in') { let r; if (typeof b === 'string') { if (typeof a !== 'string') err('TypeError', "'in <string>' requires string as left operand"); r = b.includes(a); } else if (Array.isArray(b)) r = b.some(v => eq(v, a)); else if (b instanceof PyTuple) r = b.a.some(v => eq(v, a)); else if (b instanceof PyDict) r = b.has(a); else err('TypeError', "argument of type '" + pyType(b) + "' is not iterable"); return op === 'in' ? r : !r; }
    if (op === 'is') return a === b; if (op === 'is not') return a !== b;
    let x, y; if (typeof a === 'string' && typeof b === 'string') { x = a; y = b; } else if (isNum(a) && isNum(b)) { x = nv(a); y = nv(b); } else err('TypeError', "'" + op + "' not supported between instances of '" + pyType(a) + "' and '" + pyType(b) + "'");
    return op === '<' ? x < y : op === '>' ? x > y : op === '<=' ? x <= y : x >= y;
  }
  const iter = x => { if (Array.isArray(x)) return x.slice(); if (x instanceof PyTuple) return x.a.slice(); if (typeof x === 'string') return [...x]; if (x instanceof PyDict) return x.keys(); err('TypeError', "'" + pyType(x) + "' object is not iterable"); };
  const idxN = (n, len) => { if (typeof n !== 'number') err('TypeError', 'list indices must be integers, not ' + pyType(n)); const i = n < 0 ? len + n : n; if (i < 0 || i >= len) err('IndexError', 'list index out of range（下标 ' + n + '，可是只有 ' + len + ' 个，下标是 0 到 ' + (len - 1) + '）'); return i; };
  /* 内置函数 */
  const B = new Map(); const bf = (n, f) => { f.pyname = n; B.set(n, f); };
  bf('print', (...a) => { out(a.map(v => pyRepr(v)).join(' ')); return null; });
  bf('len', x => { if (typeof x === 'string' || Array.isArray(x)) return x.length; if (x instanceof PyTuple) return x.a.length; if (x instanceof PyDict) return x.m.size; err('TypeError', "object of type '" + pyType(x) + "' has no len()"); });
  bf('range', (a, b, c) => { let s = 0, e = a, st = 1; if (b !== undefined) { s = a; e = b; } if (c !== undefined) st = c; if ([s, e, st].some(v => typeof v !== 'number')) err('TypeError', 'range() 里只能写整数'); if (st === 0) err('ValueError', 'range() arg 3 must not be zero'); const r = []; for (let i = s; st > 0 ? i < e : i > e; i += st) { r.push(i); if (r.length > 100000) err('ValueError', 'range 太大了'); } return r; });
  bf('str', x => x === undefined ? '' : pyRepr(x));
  bf('int', x => { if (typeof x === 'string') { if (!/^\s*[-+]?\d+\s*$/.test(x)) err('ValueError', "invalid literal for int() with base 10: '" + x + "'"); return parseInt(x, 10); } return Math.trunc(num(x, 'int')); });
  bf('float', x => { if (typeof x === 'string') { const v = parseFloat(x); if (isNaN(v)) err('ValueError', "could not convert string to float: '" + x + "'"); return new PyFloat(v); } return new PyFloat(num(x, 'float')); });
  bf('abs', x => isF(x) ? new PyFloat(Math.abs(x.v)) : Math.abs(num(x, 'abs')));
  bf('round', (x, n) => n === undefined ? Math.round(num(x, 'round')) : new PyFloat(Math.round(num(x, 'round') * 10 ** n) / 10 ** n));
  const mm = (f, n) => (...a) => { const xs = a.length === 1 ? iter(a[0]) : a; if (!xs.length) err('ValueError', n + '() arg is an empty sequence'); return xs.reduce((m, v) => compare(f, v, m) ? v : m); };
  bf('min', mm('<', 'min')); bf('max', mm('>', 'max'));
  bf('sum', x => { const xs = iter(x); let s = 0; xs.forEach(v => s = binop('+', s, v)); return s; });
  bf('sorted', (x, rev) => { const a = iter(x).slice().sort((p, q) => compare('<', p, q) ? -1 : compare('>', p, q) ? 1 : 0); return rev === true ? a.reverse() : a; });
  bf('list', x => x === undefined ? [] : iter(x)); bf('tuple', x => new PyTuple(x === undefined ? [] : iter(x)));
  bf('dict', () => new PyDict()); bf('type', x => "<class '" + pyType(x) + "'>");
  bf('input', q => { const v = (typeof window !== 'undefined' && window.prompt) ? window.prompt(q === undefined ? '' : pyRepr(q)) : ''; return v === null ? '' : v; });
  bf('enumerate', x => iter(x).map((v, i) => new PyTuple([i, v])));
  if (io.setblock) bf('setblock', (x, y, z, b) => { io.setblock(nv(x), nv(y), nv(z), b === undefined ? 'stone' : b); return null; });
  if (io.extra) Object.keys(io.extra).forEach(k => bf(k, io.extra[k]));
  const RND = {__mod: 'random', randint: (a, b) => a + Math.floor(Math.random() * (b - a + 1)), choice: a => { const xs = iter(a); return xs[Math.floor(Math.random() * xs.length)]; }, random: () => new PyFloat(Math.random()), shuffle: a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return null; }};
  const MATH = {__mod: 'math', sqrt: x => new PyFloat(Math.sqrt(nv(x))), floor: x => Math.floor(nv(x)), ceil: x => Math.ceil(nv(x)), pi: new PyFloat(Math.PI)};
  const MODS = {random: RND, math: MATH};
  /* 方法 */
  function method(o, n){
    if (Array.isArray(o)) { const M = {append: v => { o.push(v); return null; }, pop: i => { if (!o.length) err('IndexError', 'pop from empty list'); return i === undefined ? o.pop() : o.splice(idxN(i, o.length), 1)[0]; }, insert: (i, v) => { o.splice(i < 0 ? Math.max(0, o.length + i) : Math.min(i, o.length), 0, v); return null; }, remove: v => { const i = o.findIndex(x => eq(x, v)); if (i < 0) err('ValueError', 'list.remove(x): x not in list'); o.splice(i, 1); return null; }, index: v => { const i = o.findIndex(x => eq(x, v)); if (i < 0) err('ValueError', pyRepr(v, 1) + ' is not in list'); return i; }, count: v => o.filter(x => eq(x, v)).length, sort: () => { o.sort((p, q) => compare('<', p, q) ? -1 : compare('>', p, q) ? 1 : 0); return null; }, reverse: () => { o.reverse(); return null; }, copy: () => o.slice(), clear: () => { o.length = 0; return null; }}; if (M[n]) return M[n]; }
    if (typeof o === 'string') { const M = {upper: () => o.toUpperCase(), lower: () => o.toLowerCase(), strip: () => o.trim(), split: s => s === undefined ? o.trim().split(/\s+/).filter(Boolean) : o.split(s), join: a => iter(a).map(v => { if (typeof v !== 'string') err('TypeError', 'join 里每一项都要是字符串'); return v; }).join(o), replace: (a, b) => o.split(a).join(b), startswith: s => o.startsWith(s), endswith: s => o.endsWith(s), count: s => o.split(s).length - 1, find: s => o.indexOf(s), isdigit: () => /^\d+$/.test(o)}; if (M[n]) return M[n]; }
    if (o instanceof PyDict) { const M = {keys: () => o.keys(), values: () => o.vals(), items: () => [...o.m.values()].map(e => new PyTuple([e[0], e[1]])), get: (k, d) => o.has(k) ? o.get(k) : (d === undefined ? null : d), pop: k => { if (!o.has(k)) err('KeyError', pyRepr(k, 1)); const v = o.get(k); o.del(k); return v; }}; if (M[n]) return M[n]; }
    if (o && o.__mod) { if (n in o) return o[n]; err('AttributeError', "module '" + o.__mod + "' has no attribute '" + n + "'"); }
    err('AttributeError', "'" + pyType(o) + "' object has no attribute '" + n + "'");
  }
  /* 求值 */
  function lookup(n, env){ if (env.l && env.l.has(n)) return env.l.get(n); if (G.has(n)) return G.get(n); if (B.has(n)) return B.get(n); err('NameError', "name '" + n + "' is not defined"); }
  function ev(e, env){
    switch (e.k) {
      case 'lit': return e.v;
      case 'name': return lookup(e.n, env);
      case 'fstr': return e.s.replace(/\{\{|\}\}|\{([^}]*)\}/g, (m, x) => m === '{{' ? '{' : m === '}}' ? '}' : pyRepr(ev(pyParse(x.replace(/:.*$/, ''))[0].e, env)));
      case 'list': return e.a.map(x => ev(x, env));
      case 'tuple': return new PyTuple(e.a.map(x => ev(x, env)));
      case 'dict': { const d = new PyDict(); e.a.forEach(([k, v]) => d.set(ev(k, env), ev(v, env))); return d; }
      case 'or': { const l = ev(e.l, env); return truthy(l) ? l : ev(e.r, env); }
      case 'and': { const l = ev(e.l, env); return truthy(l) ? ev(e.r, env) : l; }
      case 'not': return !truthy(ev(e.e, env));
      case 'neg': { const v = ev(e.e, env); if (e.op === '+') return v; return isF(v) ? new PyFloat(-v.v) : -num(v, '-'); }
      case 'bin': return binop(e.op, ev(e.l, env), ev(e.r, env));
      case 'cmp': { let l = ev(e.l, env); for (let i = 0; i < e.ops.length; i++) { const r = ev(e.rs[i], env); if (!compare(e.ops[i], l, r)) return false; l = r; } return true; }
      case 'idx': { const o = ev(e.e, env), i = ev(e.i, env); if (Array.isArray(o) || typeof o === 'string') return o[idxN(i, o.length)]; if (o instanceof PyTuple) return o.a[idxN(i, o.a.length)]; if (o instanceof PyDict) { if (!o.has(i)) err('KeyError', pyRepr(i, 1) + '（字典里没有这个键）'); return o.get(i); } err('TypeError', "'" + pyType(o) + "' object is not subscriptable"); }
      case 'slice': { const o = ev(e.e, env), L = (Array.isArray(o) || typeof o === 'string') ? o.length : 0; let a = e.a ? ev(e.a, env) : 0, b = e.b ? ev(e.b, env) : L; if (a < 0) a += L; if (b < 0) b += L; return o.slice(a, b); }
      case 'attr': { const o = ev(e.e, env); return method(o, e.n); }
      case 'call': { curLine = e.line || curLine; const f = ev(e.f, env), args = e.args.map(x => ev(x, env)); return call(f, args); }
    }
    err('SyntaxError', '不支持的写法');
  }
  function call(f, args){
    if (typeof f === 'function') return f(...args) ?? null;
    if (f instanceof PyFn) {
      if (args.length > f.params.length) err('TypeError', f.name + '() takes ' + f.params.length + ' positional arguments but ' + args.length + ' were given');
      const l = new Map(); f.params.forEach((pn, i) => { if (i < args.length) l.set(pn, args[i]); else if (f.defs[i] !== undefined) l.set(pn, ev(f.defs[i], {l: null})); else err('TypeError', f.name + "() missing required argument: '" + pn + "'"); });
      if (++depth > 200) { depth = 0; err('RecursionError', 'maximum recursion depth exceeded'); }
      const env = {l, fn: f.name}; const saved = curLine;
      try { const g = execBlock(f.body, env); for (let r = g.next(); !r.done; r = g.next()) {} } catch (s) { if (s instanceof RetSig) { depth--; curLine = saved; return s.v; } depth--; throw s; }
      depth--; curLine = saved; return null;
    }
    err('TypeError', "'" + pyType(f) + "' object is not callable");
  }
  function assign(t, v, env){
    if (t.k === 'name') { (env.l || G).set(t.n, v); return; }
    if (t.k === 'tuple' || t.k === 'list') { const vs = iter(v); if (vs.length !== t.a.length) err('ValueError', '要拆成 ' + t.a.length + ' 个，可是有 ' + vs.length + ' 个'); t.a.forEach((x, i) => assign(x, vs[i], env)); return; }
    if (t.k === 'idx') { const o = ev(t.e, env), i = ev(t.i, env); if (Array.isArray(o)) { o[idxN(i, o.length)] = v; return; } if (o instanceof PyDict) { o.set(i, v); return; } err('TypeError', "'" + pyType(o) + "' object does not support item assignment"); }
    err('SyntaxError', 'cannot assign to expression（等号左边只能是名字、下标）');
  }
  function* execBlock(body, env){ for (const s of body) yield* exec(s, env); }
  function* exec(s, env){
    curLine = s.line; if (++steps > LIMIT) err('TimeoutError', '运行了 ' + LIMIT + ' 步还没停');
    if (io.step) yield {line: s.line, env};
    switch (s.k) {
      case 'expr': ev(s.e, env); return;
      case 'assign': { const v = ev(s.v, env); s.tg.forEach(t => assign(t, v, env)); return; }
      case 'aug': { const cur = ev(s.tg, env); assign(s.tg, binop(s.op, cur, ev(s.v, env)), env); return; }
      case 'if': { for (const [c, b] of s.br) if (truthy(ev(c, env))) { yield* execBlock(b, env); return; } if (s.els) yield* execBlock(s.els, env); return; }
      case 'while': while (truthy(ev(s.c, env))) { try { yield* execBlock(s.body, env); } catch (x) { if (x instanceof BreakSig) break; if (x instanceof ContSig) continue; throw x; } curLine = s.line; if (++steps > LIMIT) err('TimeoutError', '运行了 ' + LIMIT + ' 步还没停'); } return;
      case 'for': { const xs = iter(ev(s.it, env)); for (const x of xs) { assign(s.tgt, x, env); try { yield* execBlock(s.body, env); } catch (q) { if (q instanceof BreakSig) break; if (q instanceof ContSig) continue; throw q; } } return; }
      case 'def': (env.l || G).set(s.name, new PyFn(s.name, s.params, s.defs, s.body)); return;
      case 'return': throw new RetSig(s.e ? ev(s.e, env) : null);
      case 'break': throw new BreakSig(); case 'continue': throw new ContSig(); case 'pass': return;
      case 'import': if (!MODS[s.n]) err('ModuleNotFoundError', "No module named '" + s.n + "'（这个小蟒只有 random 和 math）"); (env.l || G).set(s.n, MODS[s.n]); return;
      case 'from': { const m = MODS[s.n]; if (!m) err('ModuleNotFoundError', "No module named '" + s.n + "'"); (s.names[0] === '*' ? Object.keys(m).filter(k => k !== '__mod') : s.names).forEach(n => (env.l || G).set(n, method(m, n))); return; }
      case 'del': { const t = s.e; if (t.k === 'idx') { const o = ev(t.e, env), i = ev(t.i, env); if (Array.isArray(o)) o.splice(idxN(i, o.length), 1); else if (o instanceof PyDict) o.del(i); } else if (t.k === 'name') (env.l || G).delete(t.n); return; }
    }
  }
  let prog;
  try { prog = pyParse(src); } catch (e) { return {gen: null, error: e, G}; }
  const top = {l: null};
  const gen = (function* (){ try { yield* execBlock(prog, top); } catch (e) { if (e instanceof RetSig) throw new PyErr('SyntaxError', "'return' outside function", curLine); if (e instanceof BreakSig || e instanceof ContSig) throw new PyErr('SyntaxError', "'break' outside loop", curLine); throw e; } })();
  return {gen, G, line: () => curLine, steps: () => steps};
}
const pyVars = G => [...G.entries()].filter(([k, v]) => !(v instanceof PyFn) && typeof v !== 'function' && !(v && v.__mod));

/* ---------- 编辑和运行的外框 ----------
   pyBox(box, {code, world, trace, tasks:[{t, ok(o)}]（o = {out, vars, world, err}）, ex:[[名字, 代码]], extra}) */
function pyBox(box, o){
  o = o || {};
  box.classList.add('pybox');
  box.innerHTML = (o.ex ? '<div class="btns pyex">' + o.ex.map((e, i) => '<button class="btn" data-i="' + i + '">' + e[0] + '</button>').join('') + '</div>' : '') +
    '<div class="pyed"><div class="pyln" aria-hidden="true"></div><textarea spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Python 代码"></textarea></div>' +
    '<div class="btns"><button class="btn pri" data-a="run">▶ 运行</button><button class="btn" data-a="step">一步一步</button><button class="btn" data-a="reset">还原</button><span class="lab pystat"></span></div>' +
    '<div class="pyout"><div class="pyo" aria-live="polite"></div>' + (o.world ? '<svg class="pyw" role="img" aria-label="小地上的方块"></svg>' : '') + '</div>' +
    '<div class="pyvars"></div>' + (o.trace ? '<div class="scroll-x"><table class="t pytr"></table></div>' : '') + (o.tasks ? '<ul class="goals"></ul>' : '');
  const ta = $('textarea', box), ln = $('.pyln', box), outEl = $('.pyo', box), vars = $('.pyvars', box), stat = $('.pystat', box), goals = $('.goals', box), tr = $('.pytr', box);
  const done = new Set(); let stepper = null, world = null, outLines = [], trace = [];
  ta.value = o.code || '';
  const lines = () => { const n = ta.value.split('\n').length; ln.innerHTML = Array.from({length: n}, (_, i) => '<span>' + (i + 1) + '</span>').join(''); ta.rows = Math.max(4, Math.min(22, n + 1)); };
  ta.addEventListener('input', () => { lines(); stepper = null; stat.textContent = ''; });
  ta.addEventListener('scroll', () => ln.scrollTop = ta.scrollTop);
  ta.addEventListener('keydown', e => {
    if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('    ', s, ta.selectionEnd, 'end'); lines(); }
    if (e.key === 'Enter') { const s = ta.selectionStart, before = ta.value.slice(0, s), cur = before.split('\n').pop(), ind = cur.match(/^ */)[0] + (/:\s*$/.test(cur) ? '    ' : ''); e.preventDefault(); ta.setRangeText('\n' + ind, s, ta.selectionEnd, 'end'); lines(); }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); runAll(); }
  });
  const newWorld = () => { world = o.world ? mcWorld() : null; if (world) world.ents = []; };
  const drawWorld = () => { if (!world) return; const sv = $('.pyw', box); mcDrawIso(world, sv); sv.innerHTML = sv.innerHTML.replace('(0, −60, 0)', '(0, 0, 0)'); };
  const io = () => ({out: s => { outLines.push(s); }, setblock: o.world ? (x, y, z, b) => { const id = String(b).replace(/^minecraft:/, ''); if (!ITEMS[id] && id !== 'air') throw new PyErr('ValueError', "不认识方块 '" + b + "'（试试 stone、glass、oak_planks、gold_block、red_wool）", 0); world.blocks.set(Math.floor(x) + ',' + (Math.floor(y) - 60) + ',' + Math.floor(z), id); } : null, extra: o.extra});
  const showOut = err => { outEl.innerHTML = outLines.slice(-200).map(s => '<div>' + esc(s) + '</div>').join('') + (err ? '<div class="pyerr">' + esc((err.line ? 'File "main.py", line ' + err.line + '\n' : '') + (err.type || 'Error') + ': ' + err.message) + '<small>' + (ERRZH[err.type] || '') + (err.line ? ' 看看第 ' + err.line + ' 行。' : '') + '</small></div>' : '') || '<div class="dim">（没有输出）</div>'; outEl.scrollTop = outEl.scrollHeight; };
  const showVars = (G, env) => { const vs = pyVars(G).concat(env && env.l ? [...env.l.entries()].map(([k, v]) => [k + '（' + env.fn + ' 里的）', v]) : []); vars.innerHTML = vs.length ? '<b>变量</b>' + vs.map(([k, v]) => '<span><code>' + esc(k) + '</code> = <code>' + esc(pyRepr(v, 1)).slice(0, 120) + '</code><small>' + pyType(v) + '</small></span>').join('') : ''; };
  const check = (G, err) => { if (!o.tasks) return; const ob = {out: outLines, vars: G ? Object.fromEntries(pyVars(G)) : {}, world, err, code: ta.value}; o.tasks.forEach((t, i) => { try { if (!done.has(i) && t.ok(ob)) done.add(i); } catch (e) {} }); goals.innerHTML = o.tasks.map((t, i) => '<li' + (done.has(i) ? ' class="ok"' : '') + '>' + t.t + '</li>').join(''); };
  function runAll(){
    stepper = null; outLines = []; newWorld(); trace = [];
    const r = pyRun(ta.value, io()); let err = r.error || null;
    if (!err) { try { for (let x = r.gen.next(); !x.done; x = r.gen.next()) {} } catch (e) { err = e instanceof PyErr ? e : new PyErr('Error', e.message, r.line()); } }
    showOut(err); showVars(r.G); drawWorld(); stat.textContent = err ? '出错了' : '运行完了' + (r.steps ? '，一共 ' + r.steps() + ' 步' : ''); if (tr) tr.innerHTML = ''; check(r.G, err);
  }
  function step(){
    if (!stepper) { outLines = []; newWorld(); trace = []; const r = pyRun(ta.value, Object.assign(io(), {step: true})); if (r.error) { showOut(r.error); stat.textContent = '出错了'; return; } stepper = r; }
    let x; try { x = stepper.gen.next(); } catch (e) { const err = e instanceof PyErr ? e : new PyErr('Error', e.message, stepper.line()); showOut(err); showVars(stepper.G); stepper = null; stat.textContent = '出错了'; return; }
    if (x.done) { showOut(); showVars(stepper.G); drawWorld(); stat.textContent = '运行完了'; check(stepper.G, null); stepper = null; return; }
    const L = x.value.line, code = ta.value.split('\n')[L - 1] || '';
    stat.innerHTML = '下一句：第 ' + L + ' 行 <code>' + esc(code.trim()) + '</code>';
    [...ln.children].forEach((c, i) => c.classList.toggle('on', i === L - 1));
    showOut(); showVars(stepper.G, x.value.env); drawWorld();
    if (tr) { const vs = pyVars(stepper.G).concat(x.value.env && x.value.env.l ? [...x.value.env.l.entries()] : []); trace.push([L, vs.map(([k, v]) => k + '=' + pyRepr(v, 1)).join('　'), outLines.length ? outLines[outLines.length - 1] : '']); tr.innerHTML = '<tr><th>第几步</th><th>行</th><th>这时的变量</th><th>最后一行输出</th></tr>' + trace.slice(-40).map((t, i) => '<tr><td>' + (trace.length > 40 ? trace.length - 40 + i + 1 : i + 1) + '</td><td>' + t[0] + '</td><td><code>' + esc(t[1]) + '</code></td><td>' + esc(t[2]) + '</td></tr>').join(''); }
  }
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'run') runAll(); if (b.dataset.a === 'step') step();
    if (b.dataset.a === 'reset') { ta.value = o.code || ''; lines(); stepper = null; outEl.innerHTML = ''; vars.innerHTML = ''; stat.textContent = ''; newWorld(); drawWorld(); [...ln.children].forEach(c => c.classList.remove('on')); }
    if (b.dataset.i !== undefined && b.closest('.pyex')) { ta.value = o.ex[+b.dataset.i][1]; lines(); stepper = null; runAll(); } });
  lines(); newWorld(); drawWorld(); if (goals) check(null, null);
  return {run: runAll, ta};
}
