# 第 8 步（共 15 步）的完整代码：包含第 0—8 步
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

# ---------- 第 4 步 · 栈：撤销和重做 ----------
UNDO = []          # 每做一件事，就把“怎样改回去”压进来
REDO = []


def change(grid, x, y, new):
    old = grid[y][x]
    grid[y][x] = new
    UNDO.append((x, y, old, new))      # 压栈
    REDO.clear()                       # 做了新的事，以前撤销掉的就不能重做了


def undo(grid):
    if not UNDO:
        print('没有可以撤销的了')
        return
    x, y, old, new = UNDO.pop()        # 弹栈：最后做的，最先撤销
    grid[y][x] = old
    REDO.append((x, y, old, new))


def redo(grid):
    if not REDO:
        return
    x, y, old, new = REDO.pop()
    grid[y][x] = new
    UNDO.append((x, y, old, new))


def demo():
    grid = make_map(ISLAND)
    change(grid, 8, 3, '#')            # 放一块石头
    change(grid, 9, 3, '#')            # 再放一块
    change(grid, 4, 3, '.')            # 挖掉一块石头
    print(''.join(grid[3]), ' 做了三件事')
    undo(grid)
    print(''.join(grid[3]), ' 撤销一次：石头回来了')
    undo(grid)
    print(''.join(grid[3]), ' 再撤销一次')
    redo(grid)
    print(''.join(grid[3]), ' 重做一次')

# ---------- 第 5 步 · 队列：水一圈一圈流开 ----------
from collections import deque


def pour(grid, sx, sy, rounds):
    """在 (sx, sy) 倒水，水每一轮往上下左右的草地流一格"""
    q = deque()
    q.append((sx, sy, 0))
    grid[sy][sx] = '~'
    while q:
        x, y, r = q.popleft()          # 先进先出：先到的先往外流
        if r == rounds:
            continue
        for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
            nx, ny = x + dx, y + dy
            if grid[ny][nx] == '.':
                grid[ny][nx] = '~'
                q.append((nx, ny, r + 1))


def demo():
    for r in [1, 3]:
        grid = make_map(ISLAND)
        pour(grid, 10, 6, r)
        print(f'倒水以后流了 {r} 轮：')
        show(grid)

# ---------- 第 6 步 · 字符串：在告示牌里找一个词 ----------
SIGNS = [
    'welcome to the grid island',
    'the lake is deep, do not swim',
    'ducks like the grass near the lake',
    'stone and sand make a good house',
]
COUNT = {'n': 0}


def find_slow(text, word):
    """笨办法：每个位置都从头比一遍"""
    for i in range(len(text) - len(word) + 1):
        k = 0
        while k < len(word):
            COUNT['n'] = COUNT['n'] + 1
            if text[i + k] != word[k]:
                break
            k = k + 1
        if k == len(word):
            return i
    return -1


def make_next(word):
    """next[k]：word 的前 k+1 个字里，既是开头又是结尾的那段最长有几个字"""
    nxt = [0] * len(word)
    j = 0
    for i in range(1, len(word)):
        while j > 0 and word[i] != word[j]:
            j = nxt[j - 1]
        if word[i] == word[j]:
            j = j + 1
        nxt[i] = j
    return nxt


def find_kmp(text, word):
    """KMP：比错了不从头来，靠 next 跳过已经知道的部分"""
    nxt = make_next(word)
    j = 0
    for i in range(len(text)):
        while True:
            COUNT['n'] = COUNT['n'] + 1
            if text[i] == word[j]:
                j = j + 1
                break
            if j == 0:
                break
            j = nxt[j - 1]
        if j == len(word):
            return i - j + 1
    return -1


def demo():
    for s in SIGNS:
        if find_slow(s, 'lake') >= 0:
            print('有 lake：', s)
    text, word = 'a' * 60 + 'b', 'a' * 9 + 'b'
    COUNT['n'] = 0
    find_slow(text, word)
    slow = COUNT['n']
    COUNT['n'] = 0
    find_kmp(text, word)
    print(f'在一长串 a 里找 aaaaaaaaab：笨办法比了 {slow} 次，KMP 比了 {COUNT["n"]} 次')
    print('next 数组：', make_next('abcabd'))

# ---------- 第 7 步 · 递归：油漆桶，把湖填成沙地 ----------
import sys


def fill(grid, x, y, old, new):
    """从 (x, y) 开始，把连着的 old 全换成 new。自己叫自己"""
    if y < 0 or y >= len(grid) or x < 0 or x >= len(grid[0]) or grid[y][x] != old:
        return 0           # 出了地图，或者不是要换的那种格子：这条路到头了
    grid[y][x] = new
    n = 1
    n = n + fill(grid, x + 1, y, old, new)
    n = n + fill(grid, x - 1, y, old, new)
    n = n + fill(grid, x, y + 1, old, new)
    n = n + fill(grid, x, y - 1, old, new)
    return n


def fill_stack(grid, x, y, old, new):
    """同一件事，不用递归：自己拿一个栈记着“还要去哪儿”"""
    todo = [(x, y)]
    n = 0
    while todo:
        x, y = todo.pop()
        if y < 0 or y >= len(grid) or x < 0 or x >= len(grid[0]) or grid[y][x] != old:
            continue
        grid[y][x] = new
        n = n + 1
        todo.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
    return n


def demo():
    grid = make_map(ISLAND)
    print('湖里有', fill(grid, 5, 5, '~', ':'), '格水，全填成了沙')
    show(grid)
    big = [['.'] * 200 for _ in range(200)]
    try:
        fill(big, 0, 0, '.', ':')
    except RecursionError:
        print('200×200 的草地：递归叠得太深，RecursionError')
    big = [['.'] * 200 for _ in range(200)]
    print('用自己的栈：填了', fill_stack(big, 0, 0, '.', ':'), '格')

# ---------- 第 8 步 · 树：合成配方 ----------
# 每样东西要什么原料、各几个。没写在这里的（木、石、沙）是挖来的“原料”。
RECIPES = {
    '小屋': [('石砖', 4), ('木板', 3), ('灯', 1)],
    '灯':   [('玻璃', 1), ('木棍', 1)],
    '镐':   [('石砖', 1), ('木棍', 2)],
    '石砖': [('石', 2)],
    '玻璃': [('沙', 2)],
    '木棍': [('木板', 1)],
    '木板': [('木', 1)],
}


def show_tree(item, depth=0, count=1):
    """把一样东西的配方画成一棵树：根在最上面，孩子往右缩进"""
    print('    ' * depth + f'{item} ×{count}')
    for child, n in RECIPES.get(item, []):
        show_tree(child, depth + 1, n)


def height(item):
    """树有多高：叶子是 1，别的是“最高的孩子 + 1”"""
    kids = RECIPES.get(item, [])
    if not kids:
        return 1
    return 1 + max(height(c) for c, n in kids)


def demo():
    show_tree('小屋')
    print('这棵树高', height('小屋'), '层')

if __name__ == '__main__':
    demo()
