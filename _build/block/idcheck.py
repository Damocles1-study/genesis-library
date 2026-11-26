#!/usr/bin/env python3
"""查各部之间重复的 id：所有部共用一份脚本，同一个 id 出现在两个部里，一个部的装置代码会去动另一个部的元素。"""
import re, glob, os, collections
os.chdir(os.path.dirname(os.path.abspath(__file__)))
seen = collections.defaultdict(set)
for f in glob.glob('[a-j][0-9][0-9].html') + glob.glob('top*.html'):
    g = f[0] if not f.startswith('top') else 'top'
    for i in re.findall(r'\sid="([^"]+)"', open(f, encoding='utf-8').read()):
        seen[i].add(g)
ok = {'top', 'toc', 'drawerList', 'barVol', 'prog', 'drawer', 'tocBtn'}
bad = {i: sorted(v) for i, v in seen.items() if len(v - {'top'}) > 1 and i not in ok}
print('跨部重复的 id:', bad or '无')
