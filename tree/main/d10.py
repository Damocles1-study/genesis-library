# 第 10 步新写的代码
# ---------- 第 10 步 · 二叉搜索树：图鉴 ----------
# 每个结点 {'key': 名字, 'info': 说明, 'left': 小的那边, 'right': 大的那边}
def bst_insert(node, key, info):
    if node is None:
        return {'key': key, 'info': info, 'left': None, 'right': None}
    if key < node['key']:
        node['left'] = bst_insert(node['left'], key, info)
    elif key > node['key']:
        node['right'] = bst_insert(node['right'], key, info)
    else:
        node['info'] = info
    return node


def bst_find(node, key):
    steps = 0
    while node is not None:
        steps = steps + 1
        if key == node['key']:
            return node['info'], steps
        node = node['left'] if key < node['key'] else node['right']
    return None, steps


def in_order(node, out):
    """中序遍历：左、自己、右。二叉搜索树的中序正好是从小到大"""
    if node is not None:
        in_order(node['left'], out)
        out.append(node['key'])
        in_order(node['right'], out)
    return out


# 图鉴按拼音排：ya 鸭、tuan 团团……
CREATURES = [('ya', '鸭子：跟着你走'), ('tuan', '团团：会追你'), ('shi', '石头：挖了能盖房'),
             ('cao', '草：可以走'), ('shu', '树：挖了得木'), ('sha', '沙：烧成玻璃'),
             ('shui', '水：会流开'), ('deng', '灯：晚上亮'), ('chuan', '船：过湖'), ('wu', '小屋')]


def demo():
    root = None
    for key, info in CREATURES:
        root = bst_insert(root, key, info)
    print('按顺序列出：', in_order(root, []))
    for key in ['sha', 'wu', 'long']:
        info, steps = bst_find(root, key)
        print(f'找 {key}：{info}（看了 {steps} 个结点）')
