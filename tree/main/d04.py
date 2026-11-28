# 第 4 步新写的代码
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
