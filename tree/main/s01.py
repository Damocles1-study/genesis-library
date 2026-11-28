# 第 1 步（共 22 步）的完整代码：包含第 0—1 步
# 方格岛 · 一层一层《链与树》主线
# 运行：在终端里  python3 这个文件的名字.py
# 上一本《地基》给小机装了一块 8×8 的屏幕。这一本把它放大成一座 16×10 的小岛。

ISLAND = [
    '~~~~~~~~~~~~~~~~',
    '~~....TT..::~~~~',
    '~...T.....:::~~~',
    '~..##..@...::~~~',
    '~..###......~~~~',
    '~~..~~~.....T.~~',
    '~~..~~~..T....~~',
    '~~~.......##..~~',
    '~~~~~::....~~~~~',
    '~~~~~~~~~~~~~~~~',
]
NAME = {'~': '水', '.': '草', '#': '石', 'T': '树', ':': '沙', '@': '你'}


def make_map(rows):
    """把一行一行的字，变成一个“列表的列表”：grid[y][x] 是第 y 行第 x 列"""
    grid = []
    for row in rows:
        grid.append(list(row))
    return grid


def show(grid):
    for row in grid:
        print(''.join(row))


def demo():
    grid = make_map(ISLAND)
    show(grid)
    print('宽', len(grid[0]), '高', len(grid), '，第 3 行第 7 列是', NAME[grid[3][7]])

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

if __name__ == '__main__':
    demo()
