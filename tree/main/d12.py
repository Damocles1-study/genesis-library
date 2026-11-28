# 第 12 步新写的代码
# ---------- 第 12 步 · 堆：按时间发生的事 ----------
HEAP = []        # 一个“小的在上面”的堆，存 (时刻, 事情)


def heap_push(item):
    HEAP.append(item)
    i = len(HEAP) - 1
    while i > 0:                              # 上浮：比爸爸小就换上去
        parent = (i - 1) // 2
        if HEAP[i] < HEAP[parent]:
            HEAP[i], HEAP[parent] = HEAP[parent], HEAP[i]
            i = parent
        else:
            break


def heap_pop():
    top = HEAP[0]
    last = HEAP.pop()
    if HEAP:
        HEAP[0] = last
        i = 0
        while True:                           # 下沉：和更小的孩子换
            l, r = 2 * i + 1, 2 * i + 2
            small = i
            if l < len(HEAP) and HEAP[l] < HEAP[small]:
                small = l
            if r < len(HEAP) and HEAP[r] < HEAP[small]:
                small = r
            if small == i:
                break
            HEAP[i], HEAP[small] = HEAP[small], HEAP[i]
            i = small
    return top


def demo():
    for t, what in [(8, '鸭子下了一个蛋'), (3, '雨停了'), (12, '天黑了，灯亮了'),
                    (5, '树苗长成了树'), (1, '早上好'), (5, '湖边的沙晒干了')]:
        heap_push((t, what))
    print('堆的样子（数组）：', [x[0] for x in HEAP])
    while HEAP:
        t, what = heap_pop()
        print(f'第 {t} 刻：{what}')
