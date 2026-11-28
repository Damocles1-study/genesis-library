# 第 13 步新写的代码
# ---------- 第 13 步 · 小机的大脑：取指、译码、执行 ----------
NAMES = ['HLT', 'LDA', 'STA', 'ADD', 'SUB', 'LDI', 'JMP', 'JZ', 'JN', 'OUT']
CPU = {}
OPS = {}            # 第 18 步起，新指令登记在这里


def reset():
    CPU.clear()
    CPU.update({'pc': 0, 'acc': 0, 'ir': 0, 'run': True,
                'sp': 16,          # 第 20 步才用：栈从第 16 格往下长
                'count': 0, 'jumps': 0})   # 走了几条、跳了几次（第 15 步用）


def load(prog):
    for i in range(16):
        MEM[i] = 0
    for i in range(len(prog)):
        MEM[i] = prog[i]
    reset()


def output(v):
    print('OUT', signed(v))


def jump(a):
    CPU['pc'] = a
    CPU['jumps'] = CPU['jumps'] + 1


def step():
    ir = read(CPU['pc'])                  # 取指
    CPU['ir'] = ir
    CPU['pc'] = (CPU['pc'] + 1) % 16
    CPU['count'] = CPU['count'] + 1
    op = ir // 16                         # 译码：高 4 位是做什么
    a = ir % 16                           #       低 4 位是哪一格
    execute(op, a)                        # 执行


def execute(op, a):
    acc = CPU['acc']
    if op == 0:
        CPU['run'] = False
    elif op == 1:
        CPU['acc'] = read(a)
    elif op == 2:
        write(a, acc)
    elif op == 3:
        CPU['acc'] = alu('ADD', acc, read(a))
    elif op == 4:
        CPU['acc'] = alu('SUB', acc, read(a))
    elif op == 5:
        CPU['acc'] = a
    elif op == 6:
        jump(a)
    elif op == 7:
        if acc == 0:
            jump(a)
    elif op == 8:
        if acc >= 128:                    # 最高位是 1：负数
            jump(a)
    elif op == 9:
        output(acc)
    elif op in OPS:
        OPS[op](a)
    else:
        print('不认识的指令', op)
        CPU['run'] = False


def run(limit=1000):
    while CPU['run'] and limit > 0:
        step()
        limit = limit - 1


COUNTDOWN = [0x1F, 0x90, 0x4E, 0x75, 0x61, 0x00, 0, 0,
             0, 0, 0, 0, 0, 0, 1, 5]       # 倒数：5 4 3 2 1


def demo():
    load(COUNTDOWN)
    run()
    print('走了', CPU['count'], '条指令')
