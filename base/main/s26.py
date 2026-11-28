# 第 26 步（共 32 步）的完整代码：包含第 0—26 步
# 小机 · 一层一层《地基》主线
# 运行：在终端里  python3 这个文件的名字.py
# 这一步只有一件事：确认 Python 能跑起来。


def demo():
    print('小机，开工！')

# ---------- 第 1 步 · 开关排：数和二进制互相换 ----------
def bits(n, w=8):
    """把一个数写成 w 位二进制。bits(13) 得到 '00001101'"""
    s = ''
    weight = 2 ** (w - 1)        # 最大的砝码。8 位时是 128
    for i in range(w):
        if n >= weight:          # 放得下这个砝码
            s = s + '1'
            n = n - weight
        else:
            s = s + '0'
        weight = weight // 2     # 换下一个小一半的砝码
    return s


def num(s):
    """把 '1101' 这样的二进制变回数"""
    n = 0
    for c in s:
        n = n * 2 + int(c)       # 往左挪一位（乘 2），再加上这一位
    return n


def demo():
    for n in [0, 1, 5, 13, 255]:
        print(n, bits(n))
    print("num('1101') =", num('1101'))

# ---------- 第 2 步 · 十六进制显示 ----------
DIGITS = '0123456789ABCDEF'


def hx(b):
    """一个字节写成两位十六进制。hx(255) 得到 'FF'"""
    return DIGITS[b // 16] + DIGITS[b % 16]


def dump(mem):
    """像 xxd 一样，每行 8 个字节"""
    for i in range(0, len(mem), 8):
        row = ''
        for b in mem[i:i + 8]:
            row = row + hx(b) + ' '
        print(hx(i), ':', row)


def demo():
    print(hx(255), hx(16), hx(72))
    dump([104, 101, 108, 108, 111, 10])      # hello 加一个换行

# ---------- 第 3 步 · 8 位的钟面 ----------
def wrap(v):
    """只留 8 位：超过 255 就绕回 0，小于 0 就绕到 255。像钟面转一圈"""
    return v % 256


def signed(b):
    """把一个字节当补码读：128 到 255 是负数"""
    if b >= 128:
        return b - 256
    return b


def demo():
    print('255 + 1 =', wrap(255 + 1))
    print('0 - 1 =', wrap(0 - 1), '，当补码读是', signed(wrap(0 - 1)))
    print('127 + 1 当补码读是', signed(wrap(127 + 1)))

# ---------- 第 4 步 · 小机的规矩：只认整数 ----------
def to_cents(text):
    """'12.30' 元 → 1230 分。全程用整数，不碰小数"""
    if '.' in text:
        yuan, fen = text.split('.')
        fen = (fen + '00')[:2]           # 补够两位：'3' → '30'
    else:
        yuan, fen = text, '00'
    return int(yuan) * 100 + int(fen)


def demo():
    print('0.1 + 0.2 =', 0.1 + 0.2)
    a, b = to_cents('0.1'), to_cents('0.2')
    print('换成分来算：', a, '+', b, '=', a + b, '分')

# ---------- 第 5 步 · 文字：每个字一个编号 ----------
def text_to_bytes(s):
    out = []
    for c in s:
        if ord(c) > 127:
            print('小机只认 ASCII，这个字它不认识：', c)
            return out
        out.append(ord(c))
    return out


def bytes_to_text(bs):
    s = ''
    for b in bs:
        s = s + chr(b)
    return s


def demo():
    bs = text_to_bytes('HI!')
    print(bs)
    dump(bs)
    print(bytes_to_text([72, 73, 33]))

# ---------- 第 6 步 · 一块 8×8 的屏幕 ----------
SCREEN = []
for y in range(8):
    SCREEN.append([0] * 8)          # 8 行，每行 8 个像素，0 是黑


def plot(x, y, on=1):
    SCREEN[y][x] = on


def draw():
    for row in SCREEN:
        line = ''
        for p in row:
            if p:
                line = line + '██'
            else:
                line = line + '··'
        print(line)


def demo():
    for x, y in [(2, 2), (5, 2), (1, 5), (2, 6), (3, 6), (4, 6), (5, 6), (6, 5)]:
        plot(x, y)
    draw()

# ---------- 第 7 步 · 运算器（ALU） ----------
def alu(op, a, b):
    if op == 'ADD':
        return wrap(a + b)
    if op == 'SUB':
        return wrap(a - b)
    if op == 'AND':
        return a & b
    if op == 'OR':
        return a | b
    if op == 'XOR':
        return a ^ b
    if op == 'SHL':
        return wrap(a << 1)          # 左移一位：乘 2
    if op == 'SHR':
        return a >> 1                # 右移一位：除以 2
    print('运算器不会', op)
    return 0


def demo():
    for op in ['ADD', 'SUB', 'AND', 'OR', 'XOR', 'SHL', 'SHR']:
        print(op, bits(alu(op, 12, 10)))

# ---------- 第 8 步 · 校验位 ----------
def parity(b):
    """数一数有几个 1：奇数个得 1，偶数个得 0"""
    return bits(b).count('1') % 2


def seal(b):
    """存的时候多带一位校验位"""
    return [b, parity(b)]


def check(pair):
    return parity(pair[0]) == pair[1]


def demo():
    box = seal(72)
    print('存进去：', box, check(box))
    box[0] = box[0] ^ 4              # 假装一个比特被宇宙射线翻了
    print('翻了一位：', box, check(box))

# ---------- 第 9 步 · 只用与非门 ----------
def NAND(a, b):
    if a == 1 and b == 1:
        return 0
    return 1


def NOT(a):
    return NAND(a, a)


def AND(a, b):
    return NOT(NAND(a, b))


def OR(a, b):
    return NAND(NOT(a), NOT(b))


def XOR(a, b):
    n = NAND(a, b)
    return NAND(NAND(a, n), NAND(b, n))


def demo():
    print('A B 与 或 异或')
    for a in (0, 1):
        for b in (0, 1):
            print(a, b, AND(a, b), ' ', OR(a, b), ' ', XOR(a, b))

# ---------- 第 10 步 · 用门搭的 8 位加法器 ----------
def full_add(a, b, c):
    s1 = XOR(a, b)
    s = XOR(s1, c)
    carry = OR(AND(a, b), AND(s1, c))
    return s, carry


def add8(x, y):
    xb, yb = bits(x), bits(y)
    c = 0
    out = ''
    for i in range(7, -1, -1):           # 从最右边一位开始，进位往左传
        s, c = full_add(int(xb[i]), int(yb[i]), c)
        out = str(s) + out
    return num(out)


def demo():
    print('5 + 3 =', add8(5, 3), '   200 + 100 =', add8(200, 100))
    wrong = 0
    for x in range(256):
        for y in range(256):
            if add8(x, y) != wrap(x + y):
                wrong = wrong + 1
    print('256 × 256 道加法题，错了', wrong, '道')

# ---------- 第 11 步 · 寄存器和时钟 ----------
REG = {'d': 0, 'q': 0}      # d 是门口放着的数，q 是已经存进去的数


def tick():
    """时钟跳一下：这时才把门口的数存进去"""
    REG['q'] = REG['d']


def demo():
    for t in range(5):
        REG['d'] = add8(REG['q'], 1)     # 门口放“现在的数加一”
        print('跳之前', REG['q'], end='  ')
        tick()
        print('跳之后', REG['q'])

# ---------- 第 12 步 · 16 格内存 ----------
MEM = [0] * 16


def mem_read(a):
    return MEM[a]


def mem_write(a, v):
    MEM[a] = wrap(v)


def read(a):          # 小机读内存都走这里。后面的步子会换掉它
    return mem_read(a)


def write(a, v):
    mem_write(a, v)


def demo():
    write(3, 72)
    write(4, 73)
    print(read(3), read(4))
    dump(MEM)

# ---------- 第 13 步 · 小机的大脑：取指、译码、执行 ----------
NAMES = ['HLT', 'LDA', 'STA', 'ADD', 'SUB', 'LDI', 'JMP', 'JZ', 'JN', 'OUT']
CPU = {}
OPS = {}            # 第 18 步起，新指令登记在这里


def reset():
    CPU.clear()
    CPU.update({'pc': 0, 'acc': 0, 'ir': 0, 'run': True,
                'sp': 16,          # 第 20 步才用：栈从第 16 格往下长
                'count': 0, 'jumps': 0})   # 走了几条、跳了几次（第 15 步用）


def load(prog):
    for i in range(16):
        MEM[i] = 0
    for i in range(len(prog)):
        MEM[i] = prog[i]
    reset()


def output(v):
    print('OUT', signed(v))


def jump(a):
    CPU['pc'] = a
    CPU['jumps'] = CPU['jumps'] + 1


def step():
    ir = read(CPU['pc'])                  # 取指
    CPU['ir'] = ir
    CPU['pc'] = (CPU['pc'] + 1) % 16
    CPU['count'] = CPU['count'] + 1
    op = ir // 16                         # 译码：高 4 位是做什么
    a = ir % 16                           #       低 4 位是哪一格
    execute(op, a)                        # 执行


def execute(op, a):
    acc = CPU['acc']
    if op == 0:
        CPU['run'] = False
    elif op == 1:
        CPU['acc'] = read(a)
    elif op == 2:
        write(a, acc)
    elif op == 3:
        CPU['acc'] = alu('ADD', acc, read(a))
    elif op == 4:
        CPU['acc'] = alu('SUB', acc, read(a))
    elif op == 5:
        CPU['acc'] = a
    elif op == 6:
        jump(a)
    elif op == 7:
        if acc == 0:
            jump(a)
    elif op == 8:
        if acc >= 128:                    # 最高位是 1：负数
            jump(a)
    elif op == 9:
        output(acc)
    elif op in OPS:
        OPS[op](a)
    else:
        print('不认识的指令', op)
        CPU['run'] = False


def run(limit=1000):
    while CPU['run'] and limit > 0:
        step()
        limit = limit - 1


COUNTDOWN = [0x1F, 0x90, 0x4E, 0x75, 0x61, 0x00, 0, 0,
             0, 0, 0, 0, 0, 0, 1, 5]       # 倒数：5 4 3 2 1


def demo():
    load(COUNTDOWN)
    run()
    print('走了', CPU['count'], '条指令')

# ---------- 第 14 步 · 汇编器：写字母，不写数 ----------
def asm(text):
    """把汇编（每行一条）翻成 16 个字节。'14: 7' 表示把 7 放进第 14 格"""
    mem = [0] * 16
    p = 0
    for line in text.split('\n'):
        line = line.split(';')[0].strip()      # 分号后面是注释
        if line == '':
            continue
        if ':' in line:
            head, line = line.split(':', 1)
            p = int(head)
            line = line.strip()
        parts = line.split()
        if parts[0].isdigit():
            v = int(parts[0])
        else:
            op = NAMES.index(parts[0].upper())
            a = 0
            if len(parts) > 1:
                a = int(parts[1])
            v = op * 16 + a
        mem[p] = v
        p = p + 1
    return mem


def disasm(mem):
    for i in range(16):
        b = mem[i]
        op, a = b // 16, b % 16
        name = NAMES[op] if op < len(NAMES) else '?'
        print(f'{i:2}  {hx(b)}  {name} {a}')


PROG_ADD = '''
LDA 14   ; 把第 14 格装进 ACC
ADD 15   ; 加上第 15 格
OUT
HLT
14: 7
15: 5
'''


def demo():
    prog = asm(PROG_ADD)
    disasm(prog)
    load(prog)
    run()

# ---------- 第 15 步 · 数拍子：流水线能省多少 ----------
def beats():
    n, j = CPU['count'], CPU['jumps']
    plain = 3 * n                 # 一条做完三步，才开始下一条
    pipe = n + 2 + 2 * j          # 三条叠着做；每跳一次，白取的两条要扔掉
    return plain, pipe


def demo():
    load(COUNTDOWN)
    run()
    plain, pipe = beats()
    print('不叠着做：', plain, '拍；叠着做：', pipe, '拍')

# ---------- 第 16 步 · 缓存：手边的小抽屉 ----------
CACHE = {}                       # 格号 → 值
SIZE = {'n': 8}                  # 抽屉最多放几格
STAT = {'hit': 0, 'miss': 0}


def cache_read(a):
    if a in CACHE:
        STAT['hit'] = STAT['hit'] + 1
        return CACHE[a]
    STAT['miss'] = STAT['miss'] + 1
    v = mem_read(a)
    if len(CACHE) >= SIZE['n']:
        oldest = list(CACHE)[0]          # 最早放进来的先请出去
        del CACHE[oldest]
    CACHE[a] = v
    return v


def cache_write(a, v):
    mem_write(a, v)
    if a in CACHE:
        CACHE[a] = mem_read(a)


def read(a):          # 同名的 def 写在后面，会盖掉前面那个
    return cache_read(a)


def write(a, v):
    cache_write(a, v)


def demo():
    for n in [4, 8]:
        SIZE['n'] = n
        CACHE.clear()
        STAT['hit'], STAT['miss'] = 0, 0
        load(COUNTDOWN)
        run()
        print(f'抽屉放 {n} 格：命中', STAT['hit'], '次，没命中', STAT['miss'], '次')

# ---------- 第 17 步 · 给格子起名字：两遍的汇编器 ----------
def clean(text):
    out = []
    for line in text.split('\n'):
        line = line.split(';')[0].strip()
        if line != '':
            out.append(line)
    return out


def split_heads(line):
    """'loop: LDA x' → (['loop'], 'LDA x')；'12: c: 0' → (['12', 'c'], '0')"""
    heads = []
    while ':' in line:
        h, rest = line.split(':', 1)
        if ' ' in h.strip():
            break
        heads.append(h.strip())
        line = rest.strip()
    return heads, line


def value(word, labels):
    if word.isdigit():
        return int(word)
    return labels[word]


def asm(text):
    lines = clean(text)
    labels = {}
    p = 0
    for line in lines:                    # 第一遍：只记每个名字在第几格
        heads, body = split_heads(line)
        for h in heads:
            if h.isdigit():
                p = int(h)
            else:
                labels[h] = p
        if body != '':
            p = p + 1
    mem = [0] * 16
    p = 0
    for line in lines:                    # 第二遍：真的翻译
        heads, body = split_heads(line)
        for h in heads:
            if h.isdigit():
                p = int(h)
        if body == '':
            continue
        parts = body.split()
        if parts[0].upper() in NAMES:
            op = NAMES.index(parts[0].upper())
            a = 0
            if len(parts) > 1:
                a = value(parts[1], labels)
            mem[p] = op * 16 + a
        else:
            mem[p] = value(parts[0], labels)
        p = p + 1
    return mem


PROG_NAMES = '''
      LDA x
      ADD y
      OUT
      HLT
x:    3
y:    4
'''


def demo():
    prog = asm(PROG_NAMES)
    disasm(prog)
    load(prog)
    run()

# ---------- 第 18 步 · 指针：照着纸条去找 ----------
def op_ldp(a):        # LDP a：第 a 格里写着一个格号，去那一格拿数
    CPU['acc'] = read(read(a))


def op_stp(a):        # STP a：把 ACC 存到“第 a 格写着的那一格”
    write(read(a), CPU['acc'])


NAMES.append('LDP')   # 第 10 号指令
NAMES.append('STP')   # 第 11 号指令
OPS[10] = op_ldp
OPS[11] = op_stp

PROG_PTR = '''
      LDP p     ; p 里写着 9，于是去第 9 格拿
      OUT
      LDI 7
      STP p     ; 把 7 写到第 9 格
      LDA 9
      OUT
      HLT
p:    9
9:    42
'''


def demo():
    load(asm(PROG_PTR))
    run()

# ---------- 第 19 步 · 一串字：以 0 结尾 ----------
def output_char(v):
    print(chr(v), end='')


def op_outc(a):       # OUTC：把 ACC 当成一个字打印
    output_char(CPU['acc'])


NAMES.append('OUTC')  # 第 12 号指令
OPS[12] = op_outc

PROG_STR = '''
start: LDP p      ; 拿 p 指着的那个字
       JZ end     ; 是 0 就说明字串完了
       OUTC
       LDA p      ; p 加一，指向下一个字
       ADD one
       STA p
       JMP start
end:   HLT
p:     s
one:   1
s:     72         ; H
       73         ; I
       33         ; !
       0
'''


def demo():
    load(asm(PROG_STR))
    run()
    print()

# ---------- 第 20 步 · 栈：叠盘子 ----------
def op_call(a):       # CALL a：把“回来的地方”压到栈上，再跳过去
    CPU['sp'] = CPU['sp'] - 1
    write(CPU['sp'], CPU['pc'])
    jump(a)


def op_ret(a):        # RET：从栈顶拿出“回来的地方”，跳回去
    back = read(CPU['sp'])
    CPU['sp'] = CPU['sp'] + 1
    jump(back)


NAMES.append('CALL')  # 第 13 号指令
NAMES.append('RET')   # 第 14 号指令
OPS[13] = op_call
OPS[14] = op_ret

PROG_CALL = '''
      LDI 5
      CALL dbl    ; 去 dbl 把 ACC 翻倍，做完回来
      OUT
      CALL dbl
      OUT
      HLT
dbl:  STA t
      ADD t
      RET
t:    0
'''


def demo():
    load(asm(PROG_CALL))
    run()

# ---------- 第 21 步 · 堆：借地方和还地方 ----------
HEAP = [None] * 32        # 一块 32 格的大地方，None 表示空着


def alloc(n, who):
    """找 n 个连着的空格子借给 who，返回第一格的位置；找不到返回 -1"""
    run_len = 0
    for i in range(len(HEAP)):
        if HEAP[i] is None:
            run_len = run_len + 1
            if run_len == n:
                start = i - n + 1
                for k in range(start, i + 1):
                    HEAP[k] = who
                return start
        else:
            run_len = 0
    return -1


def free(who):
    for i in range(len(HEAP)):
        if HEAP[i] == who:
            HEAP[i] = None


def heap_map():
    line = ''
    for c in HEAP:
        line = line + (c if c else '.')
    print(line)


def demo():
    print(alloc(8, 'A'), alloc(8, 'B'), alloc(8, 'C'))
    heap_map()
    free('B')
    heap_map()
    print('借 10 格：', alloc(10, 'D'), '（空的加起来有 16 格，可是不连着）')
    print('借 6 格：', alloc(6, 'E'))
    heap_map()

# ---------- 第 22 步 · 链接器：两份程序拼成一份 ----------
def asm_part(text, start):
    """从第 start 格开始翻译一份程序，外面的名字先记下来，等链接器来填"""
    lines = clean(text)
    labels, p = {}, start
    for line in lines:
        heads, body = split_heads(line)
        for h in heads:
            labels[h] = p
        if body != '':
            p = p + 1
    code, need, p = [], [], start
    for line in lines:
        heads, body = split_heads(line)
        if body == '':
            continue
        parts = body.split()
        if parts[0].upper() in NAMES:
            op = NAMES.index(parts[0].upper())
            a = 0
            if len(parts) > 1:
                w = parts[1]
                if w.isdigit():
                    a = int(w)
                elif w in labels:
                    a = labels[w]
                else:
                    need.append((p, w))   # 不认识的名字：留给链接器
            code.append(op * 16 + a)
        else:
            code.append(value(parts[0], labels))
        p = p + 1
    return {'code': code, 'labels': labels, 'need': need}


def link(texts):
    parts, p = [], 0
    for t in texts:                       # 一份接一份往后放
        part = asm_part(t, p)
        parts.append(part)
        p = p + len(part['code'])
    table = {}                            # 全部名字的总表（符号表）
    for part in parts:
        table.update(part['labels'])
    mem, p = [0] * 16, 0
    for part in parts:
        for b in part['code']:
            mem[p] = b
            p = p + 1
    for part in parts:                    # 把空着的格号填上
        for pos, w in part['need']:
            if w not in table:
                print('链接失败：找不到', w)
                return None
            mem[pos] = mem[pos] + table[w]
    return mem


MAIN_S = '''
      LDI 6
      CALL dbl    ; dbl 不在这份程序里
      OUT
      HLT
'''

LIB_S = '''
dbl:  STA t
      ADD t
      RET
t:    0
'''


def demo():
    prog = link([MAIN_S, LIB_S])
    disasm(prog)
    load(prog)
    run()

# ---------- 第 23 步 · 装载器：把程序存成文件，再装回来 ----------
MAGIC = [88, 74]          # 'X' 'J'：文件开头的“魔数”


def save_prog(name, prog):
    with open(name, 'wb') as f:
        f.write(bytes(MAGIC + prog))


def load_file(name):
    with open(name, 'rb') as f:
        data = list(f.read())
    if data[:2] != MAGIC:
        print(name, '不是小机的程序')
        return False
    load(data[2:18])
    return True


def demo():
    save_prog('hi.xj', asm(PROG_STR))
    print('存好了 hi.xj，可以用  xxd hi.xj  看看')
    if load_file('hi.xj'):
        run()
        print()

# ---------- 第 24 步 · 调试器：一步一步看 ----------
BREAK = set()             # 断点：走到这些格就停下


def show():
    b = read(CPU['pc'])
    name = NAMES[b // 16] if b // 16 < len(NAMES) else '?'
    print(f"PC={CPU['pc']:2}  ACC={signed(CPU['acc']):4}  下一条：{name} {b % 16}")


def trace(limit=50):
    while CPU['run'] and limit > 0:
        show()
        step()
        limit = limit - 1
        if CPU['pc'] in BREAK:
            print('停在断点', CPU['pc'])
            return


def demo():
    load(COUNTDOWN)
    BREAK.add(4)
    trace()
    show()

# ---------- 第 25 步 · 内核：程序要办事，得去柜台 ----------
MODE = {'now': 'kernel'}            # kernel：内核；user：普通程序


def output(v):                      # 盖掉第 13 步的 output
    if MODE['now'] == 'user':
        print('\n[内核] 普通程序不许自己用 OUT，请用 SYS')
        CPU['run'] = False
        return
    print('OUT', signed(v))


def output_char(v):                 # 盖掉第 19 步的 output_char
    if MODE['now'] == 'user':
        print('\n[内核] 普通程序不许自己用 OUTC，请用 SYS')
        CPU['run'] = False
        return
    print(chr(v), end='')


def sys_print_num():
    print(signed(CPU['acc']))


def sys_print_char():
    print(chr(CPU['acc']), end='')


def sys_exit():
    CPU['run'] = False


SYSCALLS = {1: sys_print_num, 2: sys_print_char, 3: sys_exit}


def op_sys(a):        # SYS a：进内核，请它办第 a 号业务
    MODE['now'] = 'kernel'
    if a in SYSCALLS:
        SYSCALLS[a]()
    else:
        print('[内核] 没有第', a, '号业务')
        CPU['run'] = False
    MODE['now'] = 'user'


NAMES.append('SYS')   # 第 15 号指令，16 个操作码用完了
OPS[15] = op_sys


def run_user(prog):
    load(prog)
    MODE['now'] = 'user'
    run()
    MODE['now'] = 'kernel'


PROG_SYS = '''
      LDI 7
      SYS 1     ; 请内核打印 ACC
      OUT       ; 自己打印：不许
      HLT
'''


def demo():
    run_user(asm(PROG_SYS))

# ---------- 第 26 步 · 进程：几个程序轮流跑 ----------
PROCS = []
NOW = {'name': ''}


def spawn(name, prog):
    mem = [0] * 16
    for i in range(len(prog)):
        mem[i] = prog[i]
    cpu = {'pc': 0, 'acc': 0, 'ir': 0, 'run': True, 'sp': 16, 'count': 0, 'jumps': 0}
    PROCS.append({'name': name, 'mem': mem, 'cpu': cpu})


def switch_to(p):
    global MEM, CPU
    MEM = p['mem']        # 换上这个进程的内存
    CPU = p['cpu']        # 换上这个进程的寄存器
    NOW['name'] = p['name']
    CACHE.clear()         # 抽屉里是上一个进程的东西，清掉


def schedule(slice_len=3):
    """轮流：每个进程跑 slice_len 条指令，就换下一个"""
    MODE['now'] = 'user'
    while True:
        alive = [p for p in PROCS if p['cpu']['run']]
        if not alive:
            break
        for p in alive:
            switch_to(p)
            for k in range(slice_len):
                if CPU['run']:
                    step()
    MODE['now'] = 'kernel'
    PROCS.clear()


def sys_print_num():                # 打印时带上是谁说的
    print(f"[{NOW['name']}] {signed(CPU['acc'])}")


SYSCALLS[1] = sys_print_num

PROG_A = '''
      LDI 1
      SYS 1
      LDI 2
      SYS 1
      LDI 3
      SYS 1
      HLT
'''

PROG_B = '''
      LDI 7
      SYS 1
      LDI 8
      SYS 1
      LDI 9
      SYS 1
      HLT
'''


def demo():
    spawn('甲', asm(PROG_A))
    spawn('乙', asm(PROG_B))
    schedule(2)

if __name__ == '__main__':
    demo()
