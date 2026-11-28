# 第 4 步新写的代码
# ---------- 第 4 步 · 小机的规矩：只认整数 ----------
def to_cents(text):
    """'12.30' 元 → 1230 分。全程用整数，不碰小数"""
    if '.' in text:
        yuan, fen = text.split('.')
        fen = (fen + '00')[:2]           # 补够两位：'3' → '30'
    else:
        yuan, fen = text, '00'
    return int(yuan) * 100 + int(fen)


def demo():
    print('0.1 + 0.2 =', 0.1 + 0.2)
    a, b = to_cents('0.1'), to_cents('0.2')
    print('换成分来算：', a, '+', b, '=', a + b, '分')
