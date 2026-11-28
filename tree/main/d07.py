# 第 7 步新写的代码
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
