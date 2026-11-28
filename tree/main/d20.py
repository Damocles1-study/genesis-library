# 第 20 步新写的代码
# ---------- 第 20 步 · 拓扑排序：先造什么，后造什么 ----------
def craft_order(goal):
    """把造 goal 要用到的东西排个先后：一样东西的材料都有了，才能造它"""
    need = {}
    stack = [goal]
    while stack:                       # 先找出要用到的所有东西
        item = stack.pop()
        if item in need:
            continue
        need[item] = [c for c, n in RECIPES.get(item, [])]
        stack.extend(need[item])
    indeg = {item: len(need[item]) for item in need}     # 还差几样材料
    users = {item: [] for item in need}
    for item in need:
        for c in need[item]:
            users[c].append(item)
    q = deque(sorted(i for i in need if indeg[i] == 0))  # 原料：不用等
    order = []
    while q:
        item = q.popleft()
        order.append(item)
        for u in users[item]:
            indeg[u] = indeg[u] - 1
            if indeg[u] == 0:
                q.append(u)
    if len(order) < len(need):
        return None                    # 有东西永远等不到材料：配方里有环
    return order


def demo():
    print('造小屋的顺序：', ' → '.join(craft_order('小屋')))
    RECIPES['木'] = [('木棍', 1)]       # 故意写错：木要用木棍造，木棍又要用木
    print('配方写成一个圈以后：', craft_order('小屋'))
    del RECIPES['木']
