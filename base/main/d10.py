# 第 10 步新写的代码
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
