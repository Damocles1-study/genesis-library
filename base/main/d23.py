# 第 23 步新写的代码
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
