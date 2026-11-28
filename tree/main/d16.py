# 第 16 步新写的代码
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
