# 第 32 步新写的代码
# ---------- 第 32 步 · 外壳：一台能用的小机 ----------
INBOX = {}


def install():
    if 'hi.xj' not in DISK['dir']:
        fs_save('hi.xj', MAGIC + asm(PROG_HELLO))
        fs_save('count.xj', MAGIC + asm(PROG_A))
        fs_save('readme.txt', text_to_bytes('try: ls, run hi.xj, send jiujiu hello'))


PROG_HELLO = '''
start: LDP p
       JZ end
       SYS 2      ; 请内核打印一个字
       LDA p
       ADD one
       STA p
       JMP start
end:   HLT
p:     s
one:   1
s:     72
       73
       33
       10
       0
'''


def cmd_run(name):
    data = fs_read(name)
    if data[:2] != MAGIC:
        print(name, '不是程序')
        return
    FRAMES.clear()
    FRAMES.extend(range(8))
    spawn(name, data[2:18])
    schedule(3)


def shell():
    fs_mount()
    install()
    listen(2, 7, echo)
    print('小机外壳。输入 help 看能做什么。')
    while True:
        try:
            line = input('xiaoji% ').strip()
        except EOFError:
            break
        words = line.split()
        if not words:
            continue
        c = words[0]
        if c == 'help':
            print('ls  cat 文件  run 程序  rm 文件  send 名字 话  exit')
        elif c == 'ls':
            fs_ls()
        elif c == 'cat' and len(words) > 1:
            print(bytes_to_text(fs_read(words[1])))
        elif c == 'run' and len(words) > 1:
            cmd_run(words[1])
        elif c == 'rm' and len(words) > 1:
            fs_rm(words[1])
        elif c == 'send' and len(words) > 2:
            print('回信：', ask(words[1], 7, ' '.join(words[2:])))
        elif c == 'exit':
            break
        else:
            print('不认识：', c)
    fs_sync()
    print('再见。文件存在 disk.json 里，下次还在。')


def demo():
    shell()
