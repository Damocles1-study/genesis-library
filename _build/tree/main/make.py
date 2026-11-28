#!/usr/bin/env python3
"""把 island.py（总稿）切成 tree/main/s00.py …。
第 N 步的文件 = 总稿里属于第 0—N 步的段落，按原来的顺序。
用法：python3 _build/tree/main/make.py [--test]"""
import os, re, sys, subprocess, tempfile, shutil
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', '..', 'tree', 'main')
src = open(os.path.join(HERE, 'island.py'), encoding='utf-8').read().split('\n')
blocks, cur = [], None
for line in src:
    m = re.match(r'^#>> (\d+)\s*$', line)
    if m:
        cur = int(m.group(1)); blocks.append([cur, []]); continue
    if cur is not None:
        blocks[-1][1].append(line)
LAST = max(b[0] for b in blocks)
os.makedirs(OUT, exist_ok=True)
for n in range(LAST + 1):
    body = []
    for k, lines in blocks:
        if k <= n:
            body += lines
    text = '# 第 %d 步（共 %d 步）的完整代码：包含第 0—%d 步\n' % (n, LAST, n) + '\n'.join(body).strip('\n') + '\n'
    text = re.sub(r'\n{4,}', '\n\n\n', text)
    open(os.path.join(OUT, 's%02d.py' % n), 'w', encoding='utf-8').write(text)
    only = []
    for k, lines in blocks:
        if k == n:
            only += lines
    if n == 0:
        only = [l for l in only]
    open(os.path.join(OUT, 'd%02d.py' % n), 'w', encoding='utf-8').write('# 第 %d 步新写的代码\n' % n + re.sub(r'\n{4,}', '\n\n\n', '\n'.join(only).strip('\n')) + '\n')
print('ok', LAST + 1, '个文件 →', os.path.normpath(OUT))
INPUTS = {29: 'n\n'}   # 第几步要从键盘读命令：步号 → 测试时喂进去的输入
if '--test' in sys.argv:
    tmp = tempfile.mkdtemp()
    for n in range(LAST + 1):
        f = os.path.join(OUT, 's%02d.py' % n)
        inp = INPUTS.get(n, '')
        r = subprocess.run([sys.executable, f], input=inp, capture_output=True, text=True, cwd=tmp, timeout=60)
        open(os.path.join(OUT, 'o%02d.txt' % n), 'w', encoding='utf-8').write((('（交互：依次输入 ' + '、'.join(INPUTS[n].split()) + ' 以后）\n') if n in INPUTS else '') + r.stdout)
        print('=== s%02d' % n, 'rc', r.returncode)
        print((r.stdout + r.stderr)[-900:])
    shutil.rmtree(tmp)
