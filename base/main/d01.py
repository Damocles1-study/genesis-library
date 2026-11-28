# 第 1 步新写的代码
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
