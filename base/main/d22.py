# 第 22 步新写的代码
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
