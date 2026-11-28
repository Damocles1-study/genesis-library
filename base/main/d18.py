# 第 18 步新写的代码
# ---------- 第 18 步 · 指针：照着纸条去找 ----------
def op_ldp(a):        # LDP a：第 a 格里写着一个格号，去那一格拿数
    CPU['acc'] = read(read(a))


def op_stp(a):        # STP a：把 ACC 存到“第 a 格写着的那一格”
    write(read(a), CPU['acc'])


NAMES.append('LDP')   # 第 10 号指令
NAMES.append('STP')   # 第 11 号指令
OPS[10] = op_ldp
OPS[11] = op_stp

PROG_PTR = '''
      LDP p     ; p 里写着 9，于是去第 9 格拿
      OUT
      LDI 7
      STP p     ; 把 7 写到第 9 格
      LDA 9
      OUT
      HLT
p:    9
9:    42
'''


def demo():
    load(asm(PROG_PTR))
    run()
