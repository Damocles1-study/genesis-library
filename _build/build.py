#!/usr/bin/env python3
"""把 _build/money/ 下的分段源文件拼成 money/index.html。
只改 _build/money/*.html 和 app.js，然后运行：python3 _build/build.py
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, '_build', 'money')

parts = ['head.html'] + ['s%02d.html' % i for i in range(13)]
html = ''.join(open(os.path.join(SRC, p), encoding='utf-8').read() for p in parts)
js = open(os.path.join(SRC, 'app.js'), encoding='utf-8').read()
html += '\n<script>\n' + js + '\n</script>\n</body>\n</html>\n'

# 简单自检：id 不重复、锚点都存在
ids = re.findall(r'\sid="([^"]+)"', html)
dup = sorted({i for i in ids if ids.count(i) > 1})
anchors = set(re.findall(r'href="#([^"]+)"', html))
missing = sorted(a for a in anchors if a not in ids and a != 'top' and "'" not in a)
if dup or missing:
    print('重复 id:', dup); print('缺失锚点:', missing); sys.exit(1)

os.makedirs(os.path.join(ROOT, 'money'), exist_ok=True)
out = os.path.join(ROOT, 'money', 'index.html')
open(out, 'w', encoding='utf-8').write(html)
print('ok', out, len(html.encode('utf-8')) // 1024, 'KB', '眉批', html.count('class="echo"'), '场戏', html.count('class="scene"'))
