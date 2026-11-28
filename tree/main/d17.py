# 第 17 步新写的代码
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
