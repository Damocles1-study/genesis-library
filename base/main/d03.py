# 第 3 步新写的代码
# ---------- 第 3 步 · 8 位的钟面 ----------
def wrap(v):
    """只留 8 位：超过 255 就绕回 0，小于 0 就绕到 255。像钟面转一圈"""
    return v % 256


def signed(b):
    """把一个字节当补码读：128 到 255 是负数"""
    if b >= 128:
        return b - 256
    return b


def demo():
    print('255 + 1 =', wrap(255 + 1))
    print('0 - 1 =', wrap(0 - 1), '，当补码读是', signed(wrap(0 - 1)))
    print('127 + 1 当补码读是', signed(wrap(127 + 1)))
