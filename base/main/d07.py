# 第 7 步新写的代码
# ---------- 第 7 步 · 运算器（ALU） ----------
def alu(op, a, b):
    if op == 'ADD':
        return wrap(a + b)
    if op == 'SUB':
        return wrap(a - b)
    if op == 'AND':
        return a & b
    if op == 'OR':
        return a | b
    if op == 'XOR':
        return a ^ b
    if op == 'SHL':
        return wrap(a << 1)          # 左移一位：乘 2
    if op == 'SHR':
        return a >> 1                # 右移一位：除以 2
    print('运算器不会', op)
    return 0


def demo():
    for op in ['ADD', 'SUB', 'AND', 'OR', 'XOR', 'SHL', 'SHR']:
        print(op, bits(alu(op, 12, 10)))
