# 第 15 步新写的代码
# ---------- 第 15 步 · 分页的索引：存档变大以后 ----------
# 存档按区块存，每块有一个编号。索引分两层：页里放排好序的编号（最多 4 个），根里放每页的第一个编号。
import bisect
PAGES = [[]]
ROOT = []
READS = {'n': 0}


def idx_insert(key):
    i = max(0, bisect.bisect_right(ROOT, key) - 1) if ROOT else 0
    page = PAGES[i]
    bisect.insort(page, key)
    if len(page) > 4:                         # 页满了：从中间劈成两页
        left, right = page[:2], page[2:]
        PAGES[i:i + 1] = [left, right]
    ROOT[:] = [p[0] for p in PAGES]


def idx_find(key):
    READS['n'] = 1                            # 读根
    i = max(0, bisect.bisect_right(ROOT, key) - 1)
    READS['n'] = READS['n'] + 1               # 再读一页
    return key in PAGES[i]


def demo():
    import random
    random.seed(15)
    keys = random.sample(range(100), 20)
    for k in keys:
        idx_insert(k)
    print('根：', ROOT)
    for p in PAGES:
        print('  页：', p)
    print('找 42：', idx_find(42), '，读了', READS['n'], '次硬盘；找', keys[3], '：', idx_find(keys[3]))
