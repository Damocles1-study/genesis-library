# 第 27 步新写的代码
# ---------- 第 27 步 · 归并：把几张排好的榜合成一张 ----------
def merge(a, b):
    out, i, j = [], 0, 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:              # 一样大时先拿左边的：稳定
            out.append(a[i])
            i = i + 1
        else:
            out.append(b[j])
            j = j + 1
    return out + a[i:] + b[j:]


def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    return merge(merge_sort(a[:mid]), merge_sort(a[mid:]))


def external_sort(data, memory=4):
    """内存一次只装得下 memory 个：先切成小段各自排好，再多路归并"""
    runs = [sorted(data[k:k + memory]) for k in range(0, len(data), memory)]
    print('排好的小段：', runs)
    return list(heapq.merge(*runs))   # 第 12 步的堆做多路归并


def demo():
    print(merge([31, 42, 61], [35, 35, 50, 70]))
    print(merge_sort([42, 35, 50, 35, 61, 42, 31, 90, 12]))
    print('外部排序：', external_sort([42, 35, 50, 35, 61, 42, 31, 90, 12, 77, 8]))
