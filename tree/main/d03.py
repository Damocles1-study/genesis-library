# 第 3 步新写的代码
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
