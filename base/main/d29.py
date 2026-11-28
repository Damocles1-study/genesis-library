# 第 29 步新写的代码
# ---------- 第 29 步 · 锁：一次只许一个人 ----------
LOCK = {'owner': None}


def sys_lock():
    if LOCK['owner'] in (None, NOW['name']):
        LOCK['owner'] = NOW['name']
    else:
        CPU['pc'] = CPU['pc'] - 1        # 拿不到锁：下次再来这条，原地等


def sys_unlock():
    LOCK['owner'] = None


SYSCALLS[4] = sys_lock
SYSCALLS[5] = sys_unlock

PROG_RACE = '''
      LDA c
      ADD one
      STA c
      LDA c
      ADD one
      STA c
      HLT
11:   one: 1
12:   c: 0
'''

PROG_SAFE = '''
      SYS 4     ; 上锁
      LDA c
      ADD one
      STA c
      SYS 5     ; 开锁
      SYS 4
      LDA c
      ADD one
      STA c
      SYS 5
      HLT
11:   one: 1
12:   c: 0
'''


def share(name_a, name_b, page):
    """让两个进程的某一页指向同一个页框：共享内存"""
    a = [p for p in PROCS if p['name'] == name_a][0]
    b = [p for p in PROCS if p['name'] == name_b][0]
    FRAMES.append(b['cpu']['pt'][page])
    b['cpu']['pt'][page] = a['cpu']['pt'][page]
    return a['cpu']['pt'][page] * PAGE


def race(src):
    FRAMES.clear()
    FRAMES.extend(range(8))
    spawn('甲', asm(src))
    spawn('乙', asm(src))
    base = share('甲', '乙', 3)
    schedule(2)
    return PHYS[base]                # 第 12 格（第 3 页的开头）就是 c


def demo():
    print('不上锁：两人各加 2 次，结果', race(PROG_RACE))
    print('上了锁：两人各加 2 次，结果', race(PROG_SAFE))
