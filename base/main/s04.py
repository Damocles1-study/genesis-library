# 第 4 步（共 32 步）的完整代码：包含第 0—4 步
# 小机 · 一层一层《地基》主线
# 运行：在终端里  python3 这个文件的名字.py
# 这一步只有一件事：确认 Python 能跑起来。


def demo():
    print('小机，开工！')

# ---------- 第 1 步 · 开关排：数和二进制互相换 ----------
def bits(n, w=8):
    """把一个数写成 w 位二进制。bits(13) 得到 '00001101'"""
    s = ''
    weight = 2 ** (w - 1)        # 最大的砝码。8 位时是 128
    for i in range(w):
        if n >= weight:          # 放得下这个砝码
            s = s + '1'
            n = n - weight
        else:
            s = s + '0'
        weight = weight // 2     # 换下一个小一半的砝码
    return s


def num(s):
    """把 '1101' 这样的二进制变回数"""
    n = 0
    for c in s:
        n = n * 2 + int(c)       # 往左挪一位（乘 2），再加上这一位
    return n


def demo():
    for n in [0, 1, 5, 13, 255]:
        print(n, bits(n))
    print("num('1101') =", num('1101'))

# ---------- 第 2 步 · 十六进制显示 ----------
DIGITS = '0123456789ABCDEF'


def hx(b):
    """一个字节写成两位十六进制。hx(255) 得到 'FF'"""
    return DIGITS[b // 16] + DIGITS[b % 16]


def dump(mem):
    """像 xxd 一样，每行 8 个字节"""
    for i in range(0, len(mem), 8):
        row = ''
        for b in mem[i:i + 8]:
            row = row + hx(b) + ' '
        print(hx(i), ':', row)


def demo():
    print(hx(255), hx(16), hx(72))
    dump([104, 101, 108, 108, 111, 10])      # hello 加一个换行

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

if __name__ == '__main__':
    demo()
