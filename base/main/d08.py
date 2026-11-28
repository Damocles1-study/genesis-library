# 第 8 步新写的代码
# ---------- 第 8 步 · 校验位 ----------
def parity(b):
    """数一数有几个 1：奇数个得 1，偶数个得 0"""
    return bits(b).count('1') % 2


def seal(b):
    """存的时候多带一位校验位"""
    return [b, parity(b)]


def check(pair):
    return parity(pair[0]) == pair[1]


def demo():
    box = seal(72)
    print('存进去：', box, check(box))
    box[0] = box[0] ^ 4              # 假装一个比特被宇宙射线翻了
    print('翻了一位：', box, check(box))
