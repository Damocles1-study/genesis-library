# 第 6 步新写的代码
# ---------- 第 6 步 · 字符串：在告示牌里找一个词 ----------
SIGNS = [
    'welcome to the grid island',
    'the lake is deep, do not swim',
    'ducks like the grass near the lake',
    'stone and sand make a good house',
]
COUNT = {'n': 0}


def find_slow(text, word):
    """笨办法：每个位置都从头比一遍"""
    for i in range(len(text) - len(word) + 1):
        k = 0
        while k < len(word):
            COUNT['n'] = COUNT['n'] + 1
            if text[i + k] != word[k]:
                break
            k = k + 1
        if k == len(word):
            return i
    return -1


def make_next(word):
    """next[k]：word 的前 k+1 个字里，既是开头又是结尾的那段最长有几个字"""
    nxt = [0] * len(word)
    j = 0
    for i in range(1, len(word)):
        while j > 0 and word[i] != word[j]:
            j = nxt[j - 1]
        if word[i] == word[j]:
            j = j + 1
        nxt[i] = j
    return nxt


def find_kmp(text, word):
    """KMP：比错了不从头来，靠 next 跳过已经知道的部分"""
    nxt = make_next(word)
    j = 0
    for i in range(len(text)):
        while True:
            COUNT['n'] = COUNT['n'] + 1
            if text[i] == word[j]:
                j = j + 1
                break
            if j == 0:
                break
            j = nxt[j - 1]
        if j == len(word):
            return i - j + 1
    return -1


def demo():
    for s in SIGNS:
        if find_slow(s, 'lake') >= 0:
            print('有 lake：', s)
    text, word = 'a' * 60 + 'b', 'a' * 9 + 'b'
    COUNT['n'] = 0
    find_slow(text, word)
    slow = COUNT['n']
    COUNT['n'] = 0
    find_kmp(text, word)
    print(f'在一长串 a 里找 aaaaaaaaab：笨办法比了 {slow} 次，KMP 比了 {COUNT["n"]} 次')
    print('next 数组：', make_next('abcabd'))
