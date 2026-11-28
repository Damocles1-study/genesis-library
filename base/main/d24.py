# 第 24 步新写的代码
# ---------- 第 24 步 · 调试器：一步一步看 ----------
BREAK = set()             # 断点：走到这些格就停下


def show():
    b = read(CPU['pc'])
    name = NAMES[b // 16] if b // 16 < len(NAMES) else '?'
    print(f"PC={CPU['pc']:2}  ACC={signed(CPU['acc']):4}  下一条：{name} {b % 16}")


def trace(limit=50):
    while CPU['run'] and limit > 0:
        show()
        step()
        limit = limit - 1
        if CPU['pc'] in BREAK:
            print('停在断点', CPU['pc'])
            return


def demo():
    load(COUNTDOWN)
    BREAK.add(4)
    trace()
    show()
