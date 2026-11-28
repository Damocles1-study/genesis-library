# 方格岛 · 一层一层《链与树》的主线项目
# 这个文件是“总稿”：每一段代码前面的  #>> 数字  表示它属于第几步。
# _build/tree/main/make.py 会把它切成 tree/main/s00.py … ：
# 第 N 步的文件，包含第 0 步到第 N 步的全部代码，可以直接运行。
#>> 0
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

#>> 1
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

#>> 2
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

#>> 3
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

#>> 4
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

#>> 5
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

#>> 6
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

#>> 7
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

#>> 8
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

#>> 9
# ---------- 第 9 步 · 遍历：算一算要挖多少原料 ----------
def raw(item, times=1, total=None):
    """后序遍历：先把孩子要的原料算清楚，再交给自己"""
    if total is None:
        total = {}
    kids = RECIPES.get(item, [])
    if not kids:                              # 叶子：原料
        total[item] = total.get(item, 0) + times
        return total
    for child, n in kids:
        raw(child, times * n, total)
    return total


def by_level(item):
    """层序遍历：一层一层，用队列"""
    q = deque([(item, 0)])
    levels = {}
    while q:
        name, d = q.popleft()
        levels.setdefault(d, []).append(name)
        for child, n in RECIPES.get(name, []):
            q.append((child, d + 1))
    return levels


def demo():
    print('造一间小屋要挖：', raw('小屋'))
    print('造一把镐要挖：', raw('镐'))
    for d, names in by_level('小屋').items():
        print('第', d, '层：', ' '.join(names))

#>> 10
# ---------- 第 10 步 · 二叉搜索树：图鉴 ----------
# 每个结点 {'key': 名字, 'info': 说明, 'left': 小的那边, 'right': 大的那边}
def bst_insert(node, key, info):
    if node is None:
        return {'key': key, 'info': info, 'left': None, 'right': None}
    if key < node['key']:
        node['left'] = bst_insert(node['left'], key, info)
    elif key > node['key']:
        node['right'] = bst_insert(node['right'], key, info)
    else:
        node['info'] = info
    return node


def bst_find(node, key):
    steps = 0
    while node is not None:
        steps = steps + 1
        if key == node['key']:
            return node['info'], steps
        node = node['left'] if key < node['key'] else node['right']
    return None, steps


def in_order(node, out):
    """中序遍历：左、自己、右。二叉搜索树的中序正好是从小到大"""
    if node is not None:
        in_order(node['left'], out)
        out.append(node['key'])
        in_order(node['right'], out)
    return out


# 图鉴按拼音排：ya 鸭、tuan 团团……
CREATURES = [('ya', '鸭子：跟着你走'), ('tuan', '团团：会追你'), ('shi', '石头：挖了能盖房'),
             ('cao', '草：可以走'), ('shu', '树：挖了得木'), ('sha', '沙：烧成玻璃'),
             ('shui', '水：会流开'), ('deng', '灯：晚上亮'), ('chuan', '船：过湖'), ('wu', '小屋')]


def demo():
    root = None
    for key, info in CREATURES:
        root = bst_insert(root, key, info)
    print('按顺序列出：', in_order(root, []))
    for key in ['sha', 'wu', 'long']:
        info, steps = bst_find(root, key)
        print(f'找 {key}：{info}（看了 {steps} 个结点）')

#>> 11
# ---------- 第 11 步 · 平衡树：排好序再插，图鉴会变成一根棍 ----------
def h(node):
    return node['h'] if node else 0


def fix(node):
    node['h'] = 1 + max(h(node['left']), h(node['right']))
    return node


def rot_right(y):
    x = y['left']
    y['left'] = x['right']
    x['right'] = y
    fix(y)
    return fix(x)


def rot_left(x):
    y = x['right']
    x['right'] = y['left']
    y['left'] = x
    fix(x)
    return fix(y)


def avl_insert(node, key):
    if node is None:
        return {'key': key, 'left': None, 'right': None, 'h': 1}
    if key < node['key']:
        node['left'] = avl_insert(node['left'], key)
    elif key > node['key']:
        node['right'] = avl_insert(node['right'], key)
    else:
        return node
    fix(node)
    bal = h(node['left']) - h(node['right'])
    if bal > 1 and key < node['left']['key']:          # 左左：右旋
        return rot_right(node)
    if bal < -1 and key > node['right']['key']:        # 右右：左旋
        return rot_left(node)
    if bal > 1:                                        # 左右：先左旋左孩子，再右旋
        node['left'] = rot_left(node['left'])
        return rot_right(node)
    if bal < -1:                                       # 右左
        node['right'] = rot_right(node['right'])
        return rot_left(node)
    return node


def bst_height(node):
    if node is None:
        return 0
    return 1 + max(bst_height(node['left']), bst_height(node['right']))


def demo():
    names = [f'n{i:03}' for i in range(100)]          # 已经排好序的 100 个名字
    plain, avl = None, None
    for k in names:
        plain = bst_insert(plain, k, '')
        avl = avl_insert(avl, k)
    print('排好序插进普通的二叉搜索树：高', bst_height(plain))
    print('插进 AVL 树：高', h(avl))
    print('找最后一个名字：普通树看', bst_find(plain, 'n099')[1], '个结点')

#>> 12
# ---------- 第 12 步 · 堆：按时间发生的事 ----------
HEAP = []        # 一个“小的在上面”的堆，存 (时刻, 事情)


def heap_push(item):
    HEAP.append(item)
    i = len(HEAP) - 1
    while i > 0:                              # 上浮：比爸爸小就换上去
        parent = (i - 1) // 2
        if HEAP[i] < HEAP[parent]:
            HEAP[i], HEAP[parent] = HEAP[parent], HEAP[i]
            i = parent
        else:
            break


def heap_pop():
    top = HEAP[0]
    last = HEAP.pop()
    if HEAP:
        HEAP[0] = last
        i = 0
        while True:                           # 下沉：和更小的孩子换
            l, r = 2 * i + 1, 2 * i + 2
            small = i
            if l < len(HEAP) and HEAP[l] < HEAP[small]:
                small = l
            if r < len(HEAP) and HEAP[r] < HEAP[small]:
                small = r
            if small == i:
                break
            HEAP[i], HEAP[small] = HEAP[small], HEAP[i]
            i = small
    return top


def demo():
    for t, what in [(8, '鸭子下了一个蛋'), (3, '雨停了'), (12, '天黑了，灯亮了'),
                    (5, '树苗长成了树'), (1, '早上好'), (5, '湖边的沙晒干了')]:
        heap_push((t, what))
    print('堆的样子（数组）：', [x[0] for x in HEAP])
    while HEAP:
        t, what = heap_pop()
        print(f'第 {t} 刻：{what}')

#>> 13
# ---------- 第 13 步 · 哈夫曼编码：把存档变小 ----------
def huffman(text):
    """常见的字用短码，少见的用长码"""
    count = {}
    for c in text:
        count[c] = count.get(c, 0) + 1
    import heapq
    pq = []
    k = 0
    for c, n in count.items():
        heapq.heappush(pq, (n, k, c))        # k 只是为了次数相同时好比较
        k = k + 1
    while len(pq) > 1:                       # 每次拿两个最少的，合成一个
        n1, _, a = heapq.heappop(pq)
        n2, _, b = heapq.heappop(pq)
        heapq.heappush(pq, (n1 + n2, k, (a, b)))
        k = k + 1
    codes = {}

    def walk(node, code):
        if isinstance(node, str):
            codes[node] = code or '0'
            return
        walk(node[0], code + '0')
        walk(node[1], code + '1')
    walk(pq[0][2], '')
    return codes, count


def demo():
    text = ''.join(ISLAND)
    codes, count = huffman(text)
    for c in sorted(codes, key=lambda c: -count[c]):
        print(f'{c!r} 出现 {count[c]:3} 次，码 {codes[c]}')
    bits = sum(len(codes[c]) for c in text)
    print('每个字 8 位：', len(text) * 8, '位；哈夫曼：', bits, '位')
    back = {v: k for k, v in codes.items()}
    enc = ''.join(codes[c] for c in text)
    cur, out = '', ''
    for b in enc:
        cur = cur + b
        if cur in back:
            out = out + back[cur]
            cur = ''
    print('解回来一样吗？', out == text)

#>> 14
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

#>> 15
# ---------- 第 15 步 · 分页的索引：存档变大以后 ----------
# 存档按区块存，每块有一个编号。索引分两层：页里放排好序的编号（最多 4 个），根里放每页的第一个编号。
import bisect
PAGES = [[]]
ROOT = []
READS = {'n': 0}


def idx_insert(key):
    i = max(0, bisect.bisect_right(ROOT, key) - 1) if ROOT else 0
    page = PAGES[i]
    bisect.insort(page, key)
    if len(page) > 4:                         # 页满了：从中间劈成两页
        left, right = page[:2], page[2:]
        PAGES[i:i + 1] = [left, right]
    ROOT[:] = [p[0] for p in PAGES]


def idx_find(key):
    READS['n'] = 1                            # 读根
    i = max(0, bisect.bisect_right(ROOT, key) - 1)
    READS['n'] = READS['n'] + 1               # 再读一页
    return key in PAGES[i]


def demo():
    import random
    random.seed(15)
    keys = random.sample(range(100), 20)
    for k in keys:
        idx_insert(k)
    print('根：', ROOT)
    for p in PAGES:
        print('  页：', p)
    print('找 42：', idx_find(42), '，读了', READS['n'], '次硬盘；找', keys[3], '：', idx_find(keys[3]))

#>> 16
# ---------- 第 16 步 · 图：岛上的地点和路 ----------
# 点：岛上的六个地方。边：两地之间有路，数字是要走几步。
PLACES = ['家', '湖边', '石山', '沙滩', '树林', '码头']
ROADS = [('家', '湖边', 4), ('家', '石山', 3), ('家', '树林', 5), ('湖边', '沙滩', 6),
         ('石山', '树林', 2), ('树林', '沙滩', 4), ('沙滩', '码头', 2), ('石山', '码头', 9)]


def build_graph(roads):
    """邻接表：每个地方 → [(邻居, 距离), …]"""
    g = {p: [] for p in PLACES}
    for a, b, w in roads:
        g[a].append((b, w))
        g[b].append((a, w))            # 无向图：两头都记
    return g


def build_matrix(roads):
    """邻接矩阵：m[i][j] 是第 i 个地方到第 j 个地方的距离，0 表示没有路"""
    n = len(PLACES)
    m = [[0] * n for _ in range(n)]
    for a, b, w in roads:
        i, j = PLACES.index(a), PLACES.index(b)
        m[i][j] = m[j][i] = w
    return m


def grid_neighbors(grid, x, y):
    """方格地图也是一张图：每块能走的地，和它上下左右能走的地之间有一条边"""
    out = []
    for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
        nx, ny = x + dx, y + dy
        if 0 <= ny < len(grid) and 0 <= nx < len(grid[0]) and grid[ny][nx] in '.:@=':
            out.append((nx, ny))
    return out


def demo():
    g = build_graph(ROADS)
    for p in PLACES:
        print(p, '→', ', '.join(f'{q}({w})' for q, w in g[p]), f'  度 {len(g[p])}')
    print('邻接矩阵：')
    for row in build_matrix(ROADS):
        print(' '.join(f'{v:2}' for v in row))
    grid = make_map(ISLAND)
    print('(7, 3) 能走到的邻居：', grid_neighbors(grid, 7, 3))

#>> 17
# ---------- 第 17 步 · 广度优先：团团来找你 ----------
def bfs_path(grid, start, goal):
    """从 start 一圈一圈往外找，第一次碰到 goal 时走的就是最少步数的路"""
    q = deque([start])
    came = {start: None}               # 每一格是从哪一格走来的
    while q:
        cur = q.popleft()
        if cur == goal:
            break
        for nb in grid_neighbors(grid, cur[0], cur[1]):
            if nb not in came:
                came[nb] = cur
                q.append(nb)
    if goal not in came:
        return None
    path = []
    cur = goal
    while cur is not None:             # 顺着“从哪来”倒着走回起点
        path.append(cur)
        cur = came[cur]
    return path[::-1]


def draw_path(grid, path, mark='*'):
    g = [[('.' if c == '@' else c) for c in row] for row in grid]
    for x, y in path[1:-1]:
        g[y][x] = mark
    sx, sy = path[0]
    gx, gy = path[-1]
    g[sy][sx] = 'o'                    # 团团
    g[gy][gx] = '@'
    show(g)


def demo():
    grid = make_map(ISLAND)
    path = bfs_path(grid, (12, 6), (7, 3))
    print('团团从 (12, 6) 到你那儿，最少走', len(path) - 1, '步：')
    draw_path(grid, path)

#>> 18
# ---------- 第 18 步 · 迪杰斯特拉：走最省力的路 ----------
import heapq
COST = {'.': 1, '@': 1, '=': 1, ':': 3}   # 草地 1，沙地走起来累，算 3


def dijkstra_path(grid, start, goal):
    dist = {start: 0}
    came = {start: None}
    pq = [(0, start)]
    done = set()
    while pq:
        d, cur = heapq.heappop(pq)      # 每次拿出“目前最近”的那一格
        if cur in done:
            continue
        done.add(cur)
        if cur == goal:
            break
        for nb in grid_neighbors(grid, cur[0], cur[1]):
            nd = d + COST[grid[nb[1]][nb[0]]]
            if nb not in dist or nd < dist[nb]:
                dist[nb] = nd
                came[nb] = cur
                heapq.heappush(pq, (nd, nb))
    path, cur = [], goal
    while cur is not None:
        path.append(cur)
        cur = came[cur]
    return path[::-1], dist[goal]


def effort(grid, path):
    return sum(COST[grid[y][x]] for x, y in path[1:])


def demo():
    grid = make_map(ISLAND)
    a, b = (8, 1), (13, 5)
    p1 = bfs_path(grid, a, b)
    p2, cost = dijkstra_path(grid, a, b)
    print(f'步数最少的路：{len(p1) - 1} 步，费力 {effort(grid, p1)}')
    draw_path(grid, p1)
    print(f'最省力的路：{len(p2) - 1} 步，费力 {cost}')
    draw_path(grid, p2)

#>> 19
# ---------- 第 19 步 · 最小生成树：用最少的路把村子连起来 ----------
VILLAGES = {'甲村': (2, 2), '乙村': (9, 1), '丙村': (12, 4), '丁村': (4, 6), '戊村': (10, 7)}


def kruskal(villages):
    names = list(villages)
    edges = []
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            (x1, y1), (x2, y2) = villages[names[i]], villages[names[j]]
            edges.append((abs(x1 - x2) + abs(y1 - y2), names[i], names[j]))
    edges.sort()                       # 从最短的路开始挑
    PARENT.clear()                     # 用第 14 步的并查集
    for n in names:
        PARENT[n] = n
    chosen = []
    for w, a, b in edges:
        if union(a, b):                # 两头还不连着，才修这条路
            chosen.append((a, b, w))
    return chosen


def demo():
    roads = kruskal(VILLAGES)
    for a, b, w in roads:
        print(f'修 {a}—{b}，长 {w}')
    print('一共修', len(roads), '条路，总长', sum(w for a, b, w in roads))

#>> 20
# ---------- 第 20 步 · 拓扑排序：先造什么，后造什么 ----------
def craft_order(goal):
    """把造 goal 要用到的东西排个先后：一样东西的材料都有了，才能造它"""
    need = {}
    stack = [goal]
    while stack:                       # 先找出要用到的所有东西
        item = stack.pop()
        if item in need:
            continue
        need[item] = [c for c, n in RECIPES.get(item, [])]
        stack.extend(need[item])
    indeg = {item: len(need[item]) for item in need}     # 还差几样材料
    users = {item: [] for item in need}
    for item in need:
        for c in need[item]:
            users[c].append(item)
    q = deque(sorted(i for i in need if indeg[i] == 0))  # 原料：不用等
    order = []
    while q:
        item = q.popleft()
        order.append(item)
        for u in users[item]:
            indeg[u] = indeg[u] - 1
            if indeg[u] == 0:
                q.append(u)
    if len(order) < len(need):
        return None                    # 有东西永远等不到材料：配方里有环
    return order


def demo():
    print('造小屋的顺序：', ' → '.join(craft_order('小屋')))
    RECIPES['木'] = [('木棍', 1)]       # 故意写错：木要用木棍造，木棍又要用木
    print('配方写成一个圈以后：', craft_order('小屋'))
    del RECIPES['木']

#>> 21
# ---------- 第 21 步 · 贪心和回溯：背包装什么 ----------
ITEMS = [('船桨', 5, 10), ('镐', 4, 7), ('灯', 4, 7), ('面包', 1, 1), ('绳子', 2, 2), ('地图', 1, 1)]
BAG = 8                                # 背包最多背 8 斤；每样是 (名字, 斤, 有用程度)


def greedy(items, cap):
    """贪心：先拿“每斤最有用”的，拿得动就拿"""
    pick, w, v = [], 0, 0
    for name, wt, val in sorted(items, key=lambda t: t[2] / t[1], reverse=True):
        if w + wt <= cap:
            pick.append(name)
            w, v = w + wt, v + val
    return pick, v


TRIED = {'n': 0}


def best(items, cap, i=0):
    """回溯：每样东西都试一试“拿”和“不拿”，走不通就退回来"""
    TRIED['n'] = TRIED['n'] + 1
    if i == len(items):
        return [], 0
    name, wt, val = items[i]
    skip_pick, skip_v = best(items, cap, i + 1)          # 不拿第 i 样
    if wt <= cap:
        take_pick, take_v = best(items, cap - wt, i + 1)  # 拿第 i 样
        if take_v + val > skip_v:
            return [name] + take_pick, take_v + val
    return skip_pick, skip_v


def demo():
    g, gv = greedy(ITEMS, BAG)
    print('贪心：', g, '有用程度', gv)
    b, bv = best(ITEMS, BAG)
    print('回溯：', b, '有用程度', bv, f'（试了 {TRIED["n"]} 次）')

#>> 22
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

#>> 0
if __name__ == '__main__':
    demo()
