#!/usr/bin/env python3
"""从 a01–a10、b01–b10、c01–c10 每章末尾的“两本账”抽出文字，重写 js/29c29.js 开头的 SEALS 常量。
改了任何一章的 .seal 之后运行：python3 _build/civil/seals.py"""
import re, json, os
D = os.path.dirname(os.path.abspath(__file__))
files = ['a%02d.html' % i for i in range(1, 11)] + ['b%02d.html' % i for i in range(1, 11)] + ['c%02d.html' % i for i in range(1, 11)]
out = []
for f in files:
    s = open(os.path.join(D, f), encoding='utf-8').read()
    cid = re.search(r'<section class="chap" id="(c\d+)"', s).group(1)
    title = re.search(r'<h2>([^<]+)</h2>', s[s.index('class="chead"'):]).group(1)
    big = re.search(r'<div class="big">([^<]+)</div>', s).group(1)
    a, b = re.findall(r'<div class="seal">\s*<div><i>营盘的账<small>制度</small></i>(.*?)</div>\s*<div><i>你的账<small>生活</small></i>(.*?)</div>', s, re.S)[-1]
    out.append([cid, big, title, a.strip(), b.strip()])
p = os.path.join(D, 'js', '29c29.js')
js = open(p, encoding='utf-8').read()
js = re.sub(r'const SEALS = .*?;\n', lambda m: 'const SEALS = ' + json.dumps(out, ensure_ascii=False) + ';\n', js, count=1, flags=re.S)
open(p, 'w', encoding='utf-8').write(js)
print('seals', len(out))
