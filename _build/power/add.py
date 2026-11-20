#!/usr/bin/env python3
"""把一段 JS 插进 app.js 的 /* @@DEVICES */ 标记前面。用法：python3 add.py 片段.js"""
import sys, os
here = os.path.dirname(os.path.abspath(__file__))
p = os.path.join(here, 'app.js')
s = open(p, encoding='utf-8').read()
frag = open(sys.argv[1], encoding='utf-8').read().rstrip() + '\n\n'
M = '/* @@DEVICES */'
assert M in s
s = s.replace(M, frag + M)
open(p, 'w', encoding='utf-8').write(s)
print('ok', len(frag), 'bytes ->', p)
