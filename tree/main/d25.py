# 第 25 步新写的代码
# ---------- 第 25 步 · 简单排序：插入、冒泡、选择 ----------
def insertion(a):
    a = a[:]
    cmp = 0
    for i in range(1, len(a)):
        x = a[i]
        j = i - 1
        while j >= 0:
            cmp = cmp + 1
            if a[j][1] > x[1]:         # 比 x 大的往后挪
                a[j + 1] = a[j]
                j = j - 1
            else:
                break
        a[j + 1] = x
    return a, cmp


def bubble(a):
    a = a[:]
    cmp = 0
    for end in range(len(a) - 1, 0, -1):
        swapped = False
        for i in range(end):
            cmp = cmp + 1
            if a[i][1] > a[i + 1][1]:
                a[i], a[i + 1] = a[i + 1], a[i]
                swapped = True
        if not swapped:                # 一趟都没换：已经排好了
            break
    return a, cmp


def selection(a):
    a = a[:]
    cmp = 0
    for i in range(len(a) - 1):
        m = i
        for j in range(i + 1, len(a)):
            cmp = cmp + 1
            if a[j][1] < a[m][1]:
                m = j
        a[i], a[m] = a[m], a[i]
    return a, cmp


PLAYERS = [('小格', 42), ('豆子', 35), ('阿蓝', 50), ('小米', 35), ('舅舅', 61), ('团团', 42), ('阿圆', 31)]


def demo():
    for f in [insertion, bubble, selection]:
        out, cmp = f(PLAYERS)
        print(f'{f.__name__:9}', ' '.join(f'{n}{s}' for n, s in out), f'比了 {cmp} 次')
    print('注意：豆子和小米都是 35，选择排序把他们的先后换了（不稳定）')
