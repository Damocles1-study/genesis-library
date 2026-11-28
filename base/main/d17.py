# 第 17 步新写的代码
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
