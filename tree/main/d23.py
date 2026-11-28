# 第 23 步新写的代码
# ---------- 第 23 步 · 散列表：自己做一个背包 ----------
SIZE0 = 8


def h(name, size):
    """把名字变成格子号：每个字的编号乘上它的位置，加起来，再除以格子数取余"""
    total = 0
    for i, c in enumerate(name):
        total = total + ord(c) * (i + 1)
    return total % size


def ht_new(size=SIZE0):
    return {'slots': [[] for _ in range(size)], 'n': 0}


def ht_put(t, name, count):
    slot = t['slots'][h(name, len(t['slots']))]
    for pair in slot:
        if pair[0] == name:          # 已经有了：改个数
            pair[1] = count
            return
    slot.append([name, count])       # 没有：挂在这一格的链上
    t['n'] = t['n'] + 1
    if t['n'] > len(t['slots']) * 0.75:          # 太挤了：格子数翻倍，全部重新放
        old = t['slots']
        t['slots'] = [[] for _ in range(len(old) * 2)]
        t['n'] = 0
        for s in old:
            for k, v in s:
                ht_put(t, k, v)


def ht_get(t, name, default=0):
    for k, v in t['slots'][h(name, len(t['slots']))]:
        if k == name:
            return v
    return default


def ht_show(t):
    for i, s in enumerate(t['slots']):
        print(f'{i:2}:', ' → '.join(f'{k}×{v}' for k, v in s) or '（空）')


def demo():
    bag = ht_new()
    for name, n in [('石', 3), ('木', 2), ('沙', 5), ('灯', 1), ('镐', 1), ('面包', 4)]:
        ht_put(bag, name, n)
    ht_show(bag)
    print('沙有', ht_get(bag, '沙'), '个；船有', ht_get(bag, '船'), '个')
    for name, n in [('绳子', 1), ('地图', 1), ('花', 6)]:
        ht_put(bag, name, n)
    print('放了 9 样以后，格子数变成', len(bag['slots']))
