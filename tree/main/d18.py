# 第 18 步新写的代码
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
