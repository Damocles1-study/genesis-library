# 第 26 步新写的代码
# ---------- 第 26 步 · 快速排序 ----------
QCMP = {'n': 0}


def quick(a, lo=0, hi=None, pick='first'):
    if hi is None:
        hi = len(a) - 1
    if lo >= hi:
        return a
    if pick == 'random':
        import random
        k = random.randint(lo, hi)
        a[lo], a[k] = a[k], a[lo]
    pivot = a[lo]                    # 挑一个当标杆
    i, j = lo, hi
    while i < j:                     # 小的放左边，大的放右边
        while i < j and a[j] >= pivot:
            QCMP['n'] = QCMP['n'] + 1
            j = j - 1
        a[i] = a[j]
        while i < j and a[i] <= pivot:
            QCMP['n'] = QCMP['n'] + 1
            i = i + 1
        a[j] = a[i]
    a[i] = pivot                     # 标杆站到它最终的位置
    quick(a, lo, i - 1, pick)
    quick(a, i + 1, hi, pick)
    return a


def demo():
    import random
    random.seed(26)
    data = [random.randint(1, 100) for _ in range(12)]
    print('排之前：', data)
    print('排之后：', quick(data[:]))
    for name, arr in [('乱的', [random.randint(1, 10000) for _ in range(500)]), ('排好的', list(range(500)))]:
        QCMP['n'] = 0
        quick(arr[:])
        first = QCMP['n']
        QCMP['n'] = 0
        quick(arr[:], pick='random')
        print(f'500 个{name}数：标杆挑第一个，比了 {first} 次；随便挑，比了 {QCMP["n"]} 次')
