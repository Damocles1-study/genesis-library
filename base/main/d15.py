# 第 15 步新写的代码
# ---------- 第 15 步 · 数拍子：流水线能省多少 ----------
def beats():
    n, j = CPU['count'], CPU['jumps']
    plain = 3 * n                 # 一条做完三步，才开始下一条
    pipe = n + 2 + 2 * j          # 三条叠着做；每跳一次，白取的两条要扔掉
    return plain, pipe


def demo():
    load(COUNTDOWN)
    run()
    plain, pipe = beats()
    print('不叠着做：', plain, '拍；叠着做：', pipe, '拍')
