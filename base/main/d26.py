# 第 26 步新写的代码
# ---------- 第 26 步 · 进程：几个程序轮流跑 ----------
PROCS = []
NOW = {'name': ''}


def spawn(name, prog):
    mem = [0] * 16
    for i in range(len(prog)):
        mem[i] = prog[i]
    cpu = {'pc': 0, 'acc': 0, 'ir': 0, 'run': True, 'sp': 16, 'count': 0, 'jumps': 0}
    PROCS.append({'name': name, 'mem': mem, 'cpu': cpu})


def switch_to(p):
    global MEM, CPU
    MEM = p['mem']        # 换上这个进程的内存
    CPU = p['cpu']        # 换上这个进程的寄存器
    NOW['name'] = p['name']
    CACHE.clear()         # 抽屉里是上一个进程的东西，清掉


def schedule(slice_len=3):
    """轮流：每个进程跑 slice_len 条指令，就换下一个"""
    MODE['now'] = 'user'
    while True:
        alive = [p for p in PROCS if p['cpu']['run']]
        if not alive:
            break
        for p in alive:
            switch_to(p)
            for k in range(slice_len):
                if CPU['run']:
                    step()
    MODE['now'] = 'kernel'
    PROCS.clear()


def sys_print_num():                # 打印时带上是谁说的
    print(f"[{NOW['name']}] {signed(CPU['acc'])}")


SYSCALLS[1] = sys_print_num

PROG_A = '''
      LDI 1
      SYS 1
      LDI 2
      SYS 1
      LDI 3
      SYS 1
      HLT
'''

PROG_B = '''
      LDI 7
      SYS 1
      LDI 8
      SYS 1
      LDI 9
      SYS 1
      HLT
'''


def demo():
    spawn('甲', asm(PROG_A))
    spawn('乙', asm(PROG_B))
    schedule(2)
