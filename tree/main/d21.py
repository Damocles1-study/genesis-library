# 第 21 步新写的代码
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
