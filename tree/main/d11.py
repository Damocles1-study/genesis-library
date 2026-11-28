# 第 11 步新写的代码
# ---------- 第 11 步 · 平衡树：排好序再插，图鉴会变成一根棍 ----------
def h(node):
    return node['h'] if node else 0


def fix(node):
    node['h'] = 1 + max(h(node['left']), h(node['right']))
    return node


def rot_right(y):
    x = y['left']
    y['left'] = x['right']
    x['right'] = y
    fix(y)
    return fix(x)


def rot_left(x):
    y = x['right']
    x['right'] = y['left']
    y['left'] = x
    fix(x)
    return fix(y)


def avl_insert(node, key):
    if node is None:
        return {'key': key, 'left': None, 'right': None, 'h': 1}
    if key < node['key']:
        node['left'] = avl_insert(node['left'], key)
    elif key > node['key']:
        node['right'] = avl_insert(node['right'], key)
    else:
        return node
    fix(node)
    bal = h(node['left']) - h(node['right'])
    if bal > 1 and key < node['left']['key']:          # 左左：右旋
        return rot_right(node)
    if bal < -1 and key > node['right']['key']:        # 右右：左旋
        return rot_left(node)
    if bal > 1:                                        # 左右：先左旋左孩子，再右旋
        node['left'] = rot_left(node['left'])
        return rot_right(node)
    if bal < -1:                                       # 右左
        node['right'] = rot_right(node['right'])
        return rot_left(node)
    return node


def bst_height(node):
    if node is None:
        return 0
    return 1 + max(bst_height(node['left']), bst_height(node['right']))


def demo():
    names = [f'n{i:03}' for i in range(100)]          # 已经排好序的 100 个名字
    plain, avl = None, None
    for k in names:
        plain = bst_insert(plain, k, '')
        avl = avl_insert(avl, k)
    print('排好序插进普通的二叉搜索树：高', bst_height(plain))
    print('插进 AVL 树：高', h(avl))
    print('找最后一个名字：普通树看', bst_find(plain, 'n099')[1], '个结点')
