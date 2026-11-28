# 第 9 步新写的代码
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
