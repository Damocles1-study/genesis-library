# 第 2 步新写的代码
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
