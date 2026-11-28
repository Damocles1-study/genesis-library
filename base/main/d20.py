# 第 20 步新写的代码
# ---------- 第 20 步 · 栈：叠盘子 ----------
def op_call(a):       # CALL a：把“回来的地方”压到栈上，再跳过去
    CPU['sp'] = CPU['sp'] - 1
    write(CPU['sp'], CPU['pc'])
    jump(a)


def op_ret(a):        # RET：从栈顶拿出“回来的地方”，跳回去
    back = read(CPU['sp'])
    CPU['sp'] = CPU['sp'] + 1
    jump(back)


NAMES.append('CALL')  # 第 13 号指令
NAMES.append('RET')   # 第 14 号指令
OPS[13] = op_call
OPS[14] = op_ret

PROG_CALL = '''
      LDI 5
      CALL dbl    ; 去 dbl 把 ACC 翻倍，做完回来
      OUT
      CALL dbl
      OUT
      HLT
dbl:  STA t
      ADD t
      RET
t:    0
'''


def demo():
    load(asm(PROG_CALL))
    run()
