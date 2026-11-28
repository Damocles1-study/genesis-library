# 第 29 步新写的代码
# ---------- 第 29 步 · 完工：一个能玩的方格岛 ----------
DIRS = {'w': (0, -1), 's': (0, 1), 'a': (-1, 0), 'd': (1, 0)}
DIG = {'#': '石', 'T': '木', ':': '沙'}
GOAL = ['镐', '灯']
BOARD = [31, 35, 38, 42, 47, 50, 56, 61, 70, 85]       # 排行榜：以前的人完工用了几步


def new_game():
    g = make_map(ISLAND)
    g[3][7] = '.'
    return {'grid': g, 'me': (7, 3), 'face': (1, 0), 'mob': (12, 6), 'turn': 0,
            'bag': ht_new(), 'undo': [], 'msg': '', 'won': False}


def mob_step(st):
    """团团用广度优先朝你走一步；每 3 步才动一次，追上了就抱走一样最多的东西，回家睡觉"""
    if st['turn'] % 3:
        return
    path = bfs_path(st['grid'], st['mob'], st['me'])
    if path and len(path) > 1:
        st['mob'] = path[1]
    if st['mob'] == st['me']:
        best, most = None, 0
        for s in st['bag']['slots']:
            for k, v in s:
                if v > most and k not in GOAL:
                    best, most = k, v
        if best:
            ht_put(st['bag'], best, most - 1)
            st['msg'] = f'团团抱走了一个{best}，跑回家了'
        st['mob'] = (12, 6)


def can_make(st, item):
    need = raw(item)                      # 第 9 步：后序遍历算原料
    return all(ht_get(st['bag'], k) >= n for k, n in need.items()), need


def act(st, cmd):
    st['msg'] = ''
    words = cmd.split()
    if not words:
        return
    c = words[0]
    g = st['grid']
    x, y = st['me']
    if c in DIRS:
        dx, dy = DIRS[c]
        st['face'] = (dx, dy)
        nx, ny = x + dx, y + dy
        if g[ny][nx] in '.=' and (nx, ny) != st['mob']:
            st['me'] = (nx, ny)
        st['turn'] = st['turn'] + 1
        mob_step(st)
    elif c == 'x':                         # 挖面前那一格
        fx, fy = x + st['face'][0], y + st['face'][1]
        t = g[fy][fx]
        if t in DIG:
            g[fy][fx] = '.'
            ht_put(st['bag'], DIG[t], ht_get(st['bag'], DIG[t]) + 1)
            st['undo'].append((fx, fy, t))      # 第 4 步：撤销栈
            st['msg'] = f'挖到一个{DIG[t]}'
        else:
            st['msg'] = '面前没有能挖的'
    elif c == 'z':
        if st['undo']:
            fx, fy, t = st['undo'].pop()
            g[fy][fx] = t
            ht_put(st['bag'], DIG[t], max(0, ht_get(st['bag'], DIG[t]) - 1))
            st['msg'] = '撤销了一次挖'
    elif c == 'c' and len(words) > 1:
        item = words[1]
        ok, need = can_make(st, item)
        if item not in RECIPES:
            st['msg'] = f'没有{item}的配方'
        elif ok:
            for k, n in need.items():
                ht_put(st['bag'], k, ht_get(st['bag'], k) - n)
            ht_put(st['bag'], item, ht_get(st['bag'], item) + 1)
            st['undo'].clear()
            st['msg'] = f'造好了{item}！顺序是：' + ' → '.join(craft_order(item))   # 第 20 步
        else:
            st['msg'] = f'造{item}要：' + '、'.join(f'{k}{n}' for k, n in need.items())
    if all(ht_get(st['bag'], k) > 0 for k in GOAL):
        st['won'] = True


def screen(st):
    g = [row[:] for row in st['grid']]
    mx, my = st['mob']
    g[my][mx] = 'o'
    x, y = st['me']
    g[y][x] = '@'
    show(g)
    items = [f'{k}{v}' for s in st['bag']['slots'] for k, v in s if v]
    print(f"第 {st['turn']} 步  背包：{' '.join(items) or '空'}  {st['msg']}")


def finish(st):
    r = rank(BOARD, st['turn'])           # 第 24 步：二分查名次
    BOARD.insert(r, st['turn'])
    print(f"完工！用了 {st['turn']} 步，排行榜第 {r + 1} 名：{BOARD}")


def play():
    st = new_game()
    print('目标：造一把镐和一盏灯。w a s d 走，x 挖面前一格，z 撤销，c 镐 / c 灯 造东西，q 不玩了')
    while not st['won']:
        screen(st)
        try:
            cmd = input('> ').strip()
        except EOFError:
            return
        if cmd == 'q':
            return
        act(st, cmd)
    screen(st)
    finish(st)


SCRIPT = ['a', 'a', 'x', 'a', 'x', 'w', 'x', 'w', 'w', 'd', 'x', 'd', 'x',
          'd', 'd', 'd', 'x', 'd', 'x', 'c 镐', 'c 灯']


def demo():
    if input('自己玩吗？(y/n) ').strip() == 'y':
        play()
        return
    st = new_game()
    for cmd in SCRIPT:
        act(st, cmd)
        if st['msg']:
            print(f"> {cmd:4} {st['msg']}")
    screen(st)
    if st['won']:
        finish(st)
