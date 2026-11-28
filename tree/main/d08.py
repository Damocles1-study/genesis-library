# 第 8 步新写的代码
# ---------- 第 8 步 · 树：合成配方 ----------
# 每样东西要什么原料、各几个。没写在这里的（木、石、沙）是挖来的“原料”。
RECIPES = {
    '小屋': [('石砖', 4), ('木板', 3), ('灯', 1)],
    '灯':   [('玻璃', 1), ('木棍', 1)],
    '镐':   [('石砖', 1), ('木棍', 2)],
    '石砖': [('石', 2)],
    '玻璃': [('沙', 2)],
    '木棍': [('木板', 1)],
    '木板': [('木', 1)],
}


def show_tree(item, depth=0, count=1):
    """把一样东西的配方画成一棵树：根在最上面，孩子往右缩进"""
    print('    ' * depth + f'{item} ×{count}')
    for child, n in RECIPES.get(item, []):
        show_tree(child, depth + 1, n)


def height(item):
    """树有多高：叶子是 1，别的是“最高的孩子 + 1”"""
    kids = RECIPES.get(item, [])
    if not kids:
        return 1
    return 1 + max(height(c) for c, n in kids)


def demo():
    show_tree('小屋')
    print('这棵树高', height('小屋'), '层')
