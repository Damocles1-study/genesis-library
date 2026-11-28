# 第 31 步新写的代码
# ---------- 第 31 步 · 地址、端口和名字 ----------
HOSTS = {'xiaoge': 1, 'jiujiu': 2}    # 名字 → 地址（小小的 DNS）
SERVICES = {}                         # (地址, 端口) → 一个函数


def resolve(name):
    return HOSTS[name]


def listen(addr, port, func):
    SERVICES[(addr, port)] = func


def ask(name, port, text):
    addr = resolve(name)
    if (addr, port) not in SERVICES:
        return f'{name}（地址 {addr}）的 {port} 号门没人开'
    send(0, addr, text)
    msg = receive(addr)
    return SERVICES[(addr, port)](msg)


def echo(msg):
    return msg


def shout(msg):
    return msg.upper() + '!'


def demo():
    listen(2, 7, echo)
    listen(2, 9, shout)
    print(ask('jiujiu', 7, 'hello'))
    print(ask('jiujiu', 9, 'hello'))
    print(ask('jiujiu', 80, 'hello'))
