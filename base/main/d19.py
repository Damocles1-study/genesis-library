# 第 19 步新写的代码
# ---------- 第 19 步 · 一串字：以 0 结尾 ----------
def output_char(v):
    print(chr(v), end='')


def op_outc(a):       # OUTC：把 ACC 当成一个字打印
    output_char(CPU['acc'])


NAMES.append('OUTC')  # 第 12 号指令
OPS[12] = op_outc

PROG_STR = '''
start: LDP p      ; 拿 p 指着的那个字
       JZ end     ; 是 0 就说明字串完了
       OUTC
       LDA p      ; p 加一，指向下一个字
       ADD one
       STA p
       JMP start
end:   HLT
p:     s
one:   1
s:     72         ; H
       73         ; I
       33         ; !
       0
'''


def demo():
    load(asm(PROG_STR))
    run()
    print()
