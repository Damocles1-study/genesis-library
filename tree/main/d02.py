# 第 2 步新写的代码
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
