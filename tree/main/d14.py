# 第 14 步新写的代码
# ---------- 第 14 步 · 并查集：数一数有几座岛 ----------
PARENT = {}


def find(a):
    while PARENT[a] != a:
        PARENT[a] = PARENT[PARENT[a]]        # 路径压缩：顺手让它指向爷爷
        a = PARENT[a]
    return a


def union(a, b):
    ra, rb = find(a), find(b)
    if ra != rb:
        PARENT[ra] = rb
        return True
    return False


def count_islands(grid):
    PARENT.clear()
    land = [(x, y) for y in range(len(grid)) for x in range(len(grid[0])) if grid[y][x] != '~']
    for p in land:
        PARENT[p] = p
    groups = len(land)
    for x, y in land:
        for nx, ny in [(x + 1, y), (x, y + 1)]:
            if (nx, ny) in PARENT and union((x, y), (nx, ny)):
                groups = groups - 1
    return groups


def demo():
    grid = make_map(ISLAND)
    print('现在有', count_islands(grid), '座岛')
    for y in range(len(grid)):               # 挖一条从上到下的河
        grid[y][9] = '~'
    print('挖了一条河以后：', count_islands(grid), '座岛')
    grid[4][9] = '='                         # 搭一座桥
    print('搭了一座桥以后：', count_islands(grid), '座岛')
