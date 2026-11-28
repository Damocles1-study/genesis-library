# 第 3 步（共 7 步）的完整代码：包含第 0—3 步
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

# ---------- 第 2 步 · 数组：地图是一长排格子 ----------
W, H = 16, 10
CELLS = []                 # 一长排：第 i 格就是 (i % W, i // W)
for row in ISLAND:
    CELLS.extend(list(row))


def at(x, y):
    return CELLS[y * W + x]        # 行优先：先跳过 y 整行，再走 x 格


def put(x, y, t):
    CELLS[y * W + x] = t


HOTBAR = ['石', '沙', '木']        # 快捷栏也是一个数组
MOVES = {'n': 0}                   # 插队时，后面的人挪了几步


def hotbar_insert(i, item):
    HOTBAR.append(None)            # 先在最后加一个空位
    k = len(HOTBAR) - 1
    while k > i:                   # 从后往前，一个一个往后挪
        HOTBAR[k] = HOTBAR[k - 1]
        MOVES['n'] = MOVES['n'] + 1
        k = k - 1
    HOTBAR[i] = item


def demo():
    print('第 3 行第 7 列：', at(7, 3), '，它是一长排里的第', 3 * W + 7, '格')
    put(8, 3, '#')
    print(''.join(CELLS[3 * W: 4 * W]))
    hotbar_insert(0, '花')
    print(HOTBAR, '，插到最前面，挪了', MOVES['n'], '次')

# ---------- 第 3 步 · 链表：跟着你走的小鸭子 ----------
# 每只鸭子是一个“结点”：{'x':…, 'y':…, 'next': 下一只}。HEAD 指着第一只。
DUCKS = {'head': None, 'size': 0}


def add_duck(x, y):
    """头插：新鸭子排到最前面"""
    node = {'x': x, 'y': y, 'next': DUCKS['head']}
    DUCKS['head'] = node
    DUCKS['size'] = DUCKS['size'] + 1


def drop_last():
    """去掉最后一只：要从头一只一只走到倒数第二只"""
    node = DUCKS['head']
    if node is None or node['next'] is None:
        DUCKS['head'] = None
        DUCKS['size'] = 0
        return
    while node['next']['next'] is not None:
        node = node['next']
    node['next'] = None
    DUCKS['size'] = DUCKS['size'] - 1


def duck_list():
    out = []
    node = DUCKS['head']
    while node is not None:
        out.append((node['x'], node['y']))
        node = node['next']
    return out


def walk(grid, px, py, dx, dy):
    """你走一步：你原来站的地方来了一只新的“头鸭子”，最后一只走掉，队伍就跟上了"""
    add_duck(px, py)
    drop_last()
    return px + dx, py + dy


def draw_with_ducks(grid, px, py):
    g = [row[:] for row in grid]
    for y in range(len(g)):
        for x in range(len(g[0])):
            if g[y][x] == '@':
                g[y][x] = '.'
    for x, y in duck_list():
        g[y][x] = 'd'
    g[py][px] = '@'
    show(g)


def demo():
    grid = make_map(ISLAND)
    px, py = 7, 3
    for k in range(3):                     # 一开始，三只鸭子排在你左边
        add_duck(px - 3 + k, py)
    for step in [(1, 0), (1, 0), (0, 1), (0, 1)]:
        px, py = walk(grid, px, py, step[0], step[1])
    draw_with_ducks(grid, px, py)
    print('鸭子从头到尾：', duck_list())

if __name__ == '__main__':
    demo()
