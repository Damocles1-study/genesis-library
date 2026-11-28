# 第 14 步新写的代码
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
