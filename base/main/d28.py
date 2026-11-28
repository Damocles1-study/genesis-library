# 第 28 步新写的代码
# ---------- 第 28 步 · 文件系统：名字和内容分开放 ----------
import json

DISK = {'next': 1, 'data': {}, 'dir': {}}     # data：编号 → 内容；dir：名字 → 编号


def fs_save(name, data):
    n = DISK['next']
    DISK['next'] = n + 1
    DISK['data'][str(n)] = list(data)
    DISK['dir'][name] = n


def fs_link(old, new):            # 再起一个名字，指向同一个编号
    DISK['dir'][new] = DISK['dir'][old]


def fs_rm(name):
    n = DISK['dir'].pop(name)
    if n not in DISK['dir'].values():         # 没有名字指着它了，才真的删
        del DISK['data'][str(n)]


def fs_read(name):
    return DISK['data'][str(DISK['dir'][name])]


def fs_ls():
    for name in sorted(DISK['dir']):
        n = DISK['dir'][name]
        print(f"{n:3}  {len(DISK['data'][str(n)]):3} 字节  {name}")


def fs_sync(path='disk.json'):    # 存到真的硬盘上，关了再开还在
    with open(path, 'w') as f:
        json.dump(DISK, f)


def fs_mount(path='disk.json'):
    try:
        with open(path) as f:
            DISK.update(json.load(f))
    except FileNotFoundError:
        pass


def demo():
    fs_save('a.xj', MAGIC + asm(PROG_A))
    fs_save('note.txt', text_to_bytes('hello'))
    fs_link('a.xj', 'count.xj')
    fs_ls()
    fs_rm('a.xj')
    print('删掉 a.xj 以后：')
    fs_ls()
