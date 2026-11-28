# 第 27 步新写的代码
# ---------- 第 27 步 · 页表：每个程序都以为自己从 0 号开始 ----------
PAGE = 4                          # 一页 4 格；小机的 16 格 = 4 页
PHYS = [0] * 32                   # 真正的内存：32 格 = 8 个页框
FRAMES = list(range(8))           # 还空着的页框


def translate(a):
    page, off = a // PAGE, a % PAGE
    frame = CPU['pt'][page]
    if frame is None:
        print(f"\n[内核] {NOW['name']} 碰了没给它的第 {page} 页，结束它")
        CPU['run'] = False
        return None
    return frame * PAGE + off


def read(a):
    p = translate(a)
    if p is None:
        return 0
    return cache_read(p)


def write(a, v):
    p = translate(a)
    if p is not None:
        cache_write(p, v)


def spawn(name, prog, pages=(0, 1, 2, 3)):
    global MEM
    MEM = PHYS                    # 从现在起，大家共用一块真内存
    pt = [None, None, None, None]
    for page in pages:            # 只给它要的那几页
        pt[page] = FRAMES.pop(0)
        for off in range(PAGE):
            a = page * PAGE + off
            PHYS[pt[page] * PAGE + off] = prog[a] if a < len(prog) else 0
    cpu = {'pc': 0, 'acc': 0, 'ir': 0, 'run': True, 'sp': 16,
           'count': 0, 'jumps': 0, 'pt': pt}
    PROCS.append({'name': name, 'mem': PHYS, 'cpu': cpu})


def phys_map():
    owner = ['.'] * 8
    for p in PROCS:
        for f in p['cpu']['pt']:
            if f is not None:
                owner[f] = p['name']
    print('页框：', ' '.join(owner))


PROG_BAD = '''
      LDI 5
      SYS 1
      LDA 9     ; 第 9 格在第 2 页，没给它
      SYS 1
      HLT
'''


def demo():
    spawn('甲', asm(PROG_A), (0, 1))
    spawn('乙', asm(PROG_B), (0, 1))
    spawn('丙', asm(PROG_BAD), (0, 1))
    phys_map()
    schedule(2)
