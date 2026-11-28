# 第 1 步新写的代码
# ---------- 第 1 步 · 数步数：找到“你”要看几格 ----------
def find_player(grid):
    """一格一格地找 @，顺便数一数看了几格"""
    looked = 0
    for y in range(len(grid)):
        for x in range(len(grid[0])):
            looked = looked + 1
            if grid[y][x] == '@':
                return x, y, looked
    return None, None, looked


def big_map(w, h):
    """造一张 w×h 的大地图，把 @ 放在最后一格：最坏的情况"""
    g = []
    for y in range(h):
        g.append(['.'] * w)
    g[h - 1][w - 1] = '@'
    return g


def demo():
    grid = make_map(ISLAND)
    x, y, looked = find_player(grid)
    print('你在', x, y, '，找了', looked, '格')
    for n in [10, 100, 1000]:
        x, y, looked = find_player(big_map(n, n))
        print(f'{n}×{n} 的地图，最坏要看 {looked} 格')
    PLAYER = {'x': 7, 'y': 3}          # 记住位置：以后只要看一次
    print('一直记着位置：只看 1 次 →', PLAYER)
