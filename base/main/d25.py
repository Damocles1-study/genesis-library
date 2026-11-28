# 第 25 步新写的代码
# ---------- 第 25 步 · 内核：程序要办事，得去柜台 ----------
MODE = {'now': 'kernel'}            # kernel：内核；user：普通程序


def output(v):                      # 盖掉第 13 步的 output
    if MODE['now'] == 'user':
        print('\n[内核] 普通程序不许自己用 OUT，请用 SYS')
        CPU['run'] = False
        return
    print('OUT', signed(v))


def output_char(v):                 # 盖掉第 19 步的 output_char
    if MODE['now'] == 'user':
        print('\n[内核] 普通程序不许自己用 OUTC，请用 SYS')
        CPU['run'] = False
        return
    print(chr(v), end='')


def sys_print_num():
    print(signed(CPU['acc']))


def sys_print_char():
    print(chr(CPU['acc']), end='')


def sys_exit():
    CPU['run'] = False


SYSCALLS = {1: sys_print_num, 2: sys_print_char, 3: sys_exit}


def op_sys(a):        # SYS a：进内核，请它办第 a 号业务
    MODE['now'] = 'kernel'
    if a in SYSCALLS:
        SYSCALLS[a]()
    else:
        print('[内核] 没有第', a, '号业务')
        CPU['run'] = False
    MODE['now'] = 'user'


NAMES.append('SYS')   # 第 15 号指令，16 个操作码用完了
OPS[15] = op_sys


def run_user(prog):
    load(prog)
    MODE['now'] = 'user'
    run()
    MODE['now'] = 'kernel'


PROG_SYS = '''
      LDI 7
      SYS 1     ; 请内核打印 ACC
      OUT       ; 自己打印：不许
      HLT
'''


def demo():
    run_user(asm(PROG_SYS))
