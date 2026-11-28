# 第 30 步新写的代码
# ---------- 第 30 步 · 网络：一层一层套信封 ----------
import random

WIRE = []                 # 一根电线：上面跑着一个个“帧”


def make_frames(src, dst, text, size=4):
    data = text_to_bytes(text)
    frames = []
    for k in range(0, len(data), size):
        piece = data[k:k + size]
        packet = {'from': src, 'to': dst, 'seq': k // size,
                  'total': (len(data) + size - 1) // size, 'data': piece}
        frames.append({'packet': packet, 'check': sum(piece) % 256})   # 最外层带校验
    return frames


def send(src, dst, text):
    frames = make_frames(src, dst, text)
    random.shuffle(frames)            # 小包走不同的路，到的先后不一定
    WIRE.extend(frames)


def receive(me):
    got = {}
    for f in list(WIRE):
        p = f['packet']
        if p['to'] != me:
            continue
        WIRE.remove(f)
        if sum(p['data']) % 256 != f['check']:
            print('有一帧坏了，扔掉')
            continue
        got[p['seq']] = p['data']
    out = []
    for seq in sorted(got):           # 按编号排回原来的顺序
        out = out + got[seq]
    return bytes_to_text(out)


def demo():
    send('A', 'B', 'HELLO, XIAOJI!')
    print('电线上的第一帧：', WIRE[0])
    print('B 收到：', receive('B'))
