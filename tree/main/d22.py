# 第 22 步新写的代码
# ---------- 第 22 步 · 动态规划：把算过的记下来 ----------
def knapsack(items, cap):
    """table[i][c]：只看前 i 样、背包能背 c 斤时，最多多有用"""
    n = len(items)
    table = [[0] * (cap + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        name, wt, val = items[i - 1]
        for c in range(cap + 1):
            table[i][c] = table[i - 1][c]                        # 不拿
            if wt <= c and table[i - 1][c - wt] + val > table[i][c]:
                table[i][c] = table[i - 1][c - wt] + val         # 拿
    pick, c = [], cap                                            # 倒着找出拿了哪些
    for i in range(n, 0, -1):
        if table[i][c] != table[i - 1][c]:
            pick.append(items[i - 1][0])
            c = c - items[i - 1][1]
    return pick[::-1], table[n][cap], table


def count_ways(grid, sx, sy, gx, gy):
    """只许往右、往下走，从 (sx, sy) 到 (gx, gy) 有几条路"""
    ways = {}
    for y in range(sy, gy + 1):
        for x in range(sx, gx + 1):
            if grid[y][x] not in '.:@':
                ways[(x, y)] = 0
            elif (x, y) == (sx, sy):
                ways[(x, y)] = 1
            else:
                ways[(x, y)] = ways.get((x - 1, y), 0) + ways.get((x, y - 1), 0)
    return ways[(gx, gy)]


def demo():
    pick, v, table = knapsack(ITEMS, BAG)
    print('动态规划：', pick, '有用程度', v, f'（表格 {len(table)}×{len(table[0])}，每格算一次）')
    grid = make_map(ISLAND)
    print('从 (2, 1) 只往右、往下走到 (13, 7)，有', count_ways(grid, 2, 1, 13, 7), '条路')
