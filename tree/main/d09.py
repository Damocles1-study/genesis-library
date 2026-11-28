# 第 9 步新写的代码
# ---------- 第 9 步 · 遍历：算一算要挖多少原料 ----------
def raw(item, times=1, total=None):
    """后序遍历：先把孩子要的原料算清楚，再交给自己"""
    if total is None:
        total = {}
    kids = RECIPES.get(item, [])
    if not kids:                              # 叶子：原料
        total[item] = total.get(item, 0) + times
        return total
    for child, n in kids:
        raw(child, times * n, total)
    return total


def by_level(item):
    """层序遍历：一层一层，用队列"""
    q = deque([(item, 0)])
    levels = {}
    while q:
        name, d = q.popleft()
        levels.setdefault(d, []).append(name)
        for child, n in RECIPES.get(name, []):
            q.append((child, d + 1))
    return levels


def demo():
    print('造一间小屋要挖：', raw('小屋'))
    print('造一把镐要挖：', raw('镐'))
    for d, names in by_level('小屋').items():
        print('第', d, '层：', ' '.join(names))
