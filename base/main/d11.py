# 第 11 步新写的代码
# ---------- 第 11 步 · 寄存器和时钟 ----------
REG = {'d': 0, 'q': 0}      # d 是门口放着的数，q 是已经存进去的数


def tick():
    """时钟跳一下：这时才把门口的数存进去"""
    REG['q'] = REG['d']


def demo():
    for t in range(5):
        REG['d'] = add8(REG['q'], 1)     # 门口放“现在的数加一”
        print('跳之前', REG['q'], end='  ')
        tick()
        print('跳之后', REG['q'])
