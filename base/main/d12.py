# 第 12 步新写的代码
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
