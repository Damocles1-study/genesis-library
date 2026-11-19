#!/usr/bin/env python3
"""把 _build/<书>/ 下的分段源文件拼成网页。
只改 _build/<书>/*.html 和 app.js，然后运行：
    python3 _build/build.py          # 全部重建
    python3 _build/build.py yes      # 只建一本
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 书名: (源目录, 输出文件, 段落列表)
BOOKS = {
    'money': ('money', 'money/index.html', ['head.html'] + ['s%02d.html' % i for i in range(13)]),
    'yes': ('yes', 'yes/index.html', ['head.html'] + ['s%02d.html' % i for i in range(16)]),
    'reed': ('reed', 'reed/index.html', ['head.html'] + ['s%02d.html' % i for i in range(18)]),
    'finance': ('finance', 'finance/index.html', ['head.html'] + ['s%02d.html' % i for i in range(19)]),
    'walk': ('walk', 'walk/index.html', ['head.html'] + ['s%02d.html' % i for i in range(8)]),
}
DRAFT = '--draft' in sys.argv  # 写到一半时跳过缺失段落和锚点检查


def build(key):
    src_dir, out_rel, parts = BOOKS[key]
    src = os.path.join(ROOT, '_build', src_dir)
    if DRAFT:
        parts = [p for p in parts if os.path.exists(os.path.join(src, p))]
    html = ''.join(open(os.path.join(src, p), encoding='utf-8').read() for p in parts)
    js = open(os.path.join(src, 'app.js'), encoding='utf-8').read()
    html += '\n<script>\n' + js + '\n</script>\n</body>\n</html>\n'

    # 简单自检：id 不重复、锚点都存在
    ids = re.findall(r'\sid="([^"]+)"', html)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    anchors = set(re.findall(r'href="#([^"]+)"', html))
    missing = sorted(a for a in anchors if a not in ids and a != 'top' and "'" not in a)
    if dup or (missing and not DRAFT):
        print(key, '重复 id:', dup); print(key, '缺失锚点:', missing); sys.exit(1)

    out = os.path.join(ROOT, out_rel)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(html)
    print('ok', out_rel, len(html.encode('utf-8')) // 1024, 'KB', '眉批', html.count('class="echo"'), '场戏', html.count('class="scene"'))


for k in ([a for a in sys.argv[1:] if not a.startswith('--')] or BOOKS):
    build(k)
