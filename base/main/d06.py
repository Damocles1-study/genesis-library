# 第 6 步新写的代码
# ---------- 第 6 步 · 一块 8×8 的屏幕 ----------
SCREEN = []
for y in range(8):
    SCREEN.append([0] * 8)          # 8 行，每行 8 个像素，0 是黑


def plot(x, y, on=1):
    SCREEN[y][x] = on


def draw():
    for row in SCREEN:
        line = ''
        for p in row:
            if p:
                line = line + '██'
            else:
                line = line + '··'
        print(line)


def demo():
    for x, y in [(2, 2), (5, 2), (1, 5), (2, 6), (3, 6), (4, 6), (5, 6), (6, 5)]:
        plot(x, y)
    draw()
