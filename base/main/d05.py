# 第 5 步新写的代码
# ---------- 第 5 步 · 文字：每个字一个编号 ----------
def text_to_bytes(s):
    out = []
    for c in s:
        if ord(c) > 127:
            print('小机只认 ASCII，这个字它不认识：', c)
            return out
        out.append(ord(c))
    return out


def bytes_to_text(bs):
    s = ''
    for b in bs:
        s = s + chr(b)
    return s


def demo():
    bs = text_to_bytes('HI!')
    print(bs)
    dump(bs)
    print(bytes_to_text([72, 73, 33]))
