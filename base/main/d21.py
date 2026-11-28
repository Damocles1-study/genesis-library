# 第 21 步新写的代码
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
