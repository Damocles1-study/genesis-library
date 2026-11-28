# 第 5 步新写的代码
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
