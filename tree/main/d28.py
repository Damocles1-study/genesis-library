# 第 28 步新写的代码
# ---------- 第 28 步 · 堆排序和计数排序 ----------
def heap_sort(a):
    a = a[:]
    n = len(a)

    def sink(k, n):
        while 2 * k + 1 < n:
            c = 2 * k + 1
            if c + 1 < n and a[c + 1] > a[c]:
                c = c + 1
            if a[k] >= a[c]:
                break
            a[k], a[c] = a[c], a[k]
            k = c
    for k in range(n // 2 - 1, -1, -1):  # 建大根堆
        sink(k, n)
    for end in range(n - 1, 0, -1):      # 把最大的换到最后，再把剩下的修成堆
        a[0], a[end] = a[end], a[0]
        sink(0, end)
    return a


def counting_sort(a, top=150):
    """步数都在 0 到 top 之间：数一数每个数出现几次，再按顺序写出来。一次都不比较"""
    cnt = [0] * (top + 1)
    for x in a:
        cnt[x] = cnt[x] + 1
    out = []
    for v in range(top + 1):
        out.extend([v] * cnt[v])
    return out


def demo():
    import random
    random.seed(28)
    data = [random.randint(20, 120) for _ in range(15)]
    print('堆排序：  ', heap_sort(data))
    print('计数排序：', counting_sort(data))
    print('和 sorted 一样吗？', heap_sort(data) == counting_sort(data) == sorted(data))
