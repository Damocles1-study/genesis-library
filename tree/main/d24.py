# 第 24 步新写的代码
# ---------- 第 24 步 · 二分查找：排行榜上第几名 ----------
LOOKS = {'n': 0}


def rank(scores, s):
    """scores 从小到大排好（用的步数，越少越好）。返回比 s 小的有几个：s 能排第几名就是它 + 1"""
    lo, hi = 0, len(scores)          # 答案在 [lo, hi] 之间
    while lo < hi:
        mid = (lo + hi) // 2
        LOOKS['n'] = LOOKS['n'] + 1
        if scores[mid] < s:
            lo = mid + 1
        else:
            hi = mid
    return lo


def demo():
    board = [31, 35, 38, 42, 42, 47, 50, 56, 61, 70, 77, 85, 90, 96, 120]
    for s in [40, 42, 20, 200]:
        LOOKS['n'] = 0
        r = rank(board, s)
        print(f'用 {s} 步完工：排第 {r + 1} 名（看了 {LOOKS["n"]} 次）')
    import random
    random.seed(24)
    big = sorted(random.sample(range(10 ** 6), 100000))
    LOOKS['n'] = 0
    rank(big, 500000)
    print('十万个成绩里查名次，看了', LOOKS['n'], '次')
