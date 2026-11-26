#!/usr/bin/env python3
"""把 _build/<书>/ 下的分段源文件拼成网页。
只改 _build/<书>/*.html 和 app.js，然后运行：
    python3 _build/build.py          # 全部重建
    python3 _build/build.py yes      # 只建一本
    python3 _build/build.py power1 power2 power3   # 《谁说了算》三部
    python3 _build/build.py city1                  # 《城里城外》第一部
    python3 _build/build.py turn1 turn2 turn3 turn4   # 《轮到谁了》四部
    python3 _build/build.py civil1 civil2 civil3      # 《铁打的营盘》三部
    python3 _build/build.py worth1 worth2             # 《值不值》两部
    python3 _build/build.py eat1 eat2 eat3            # 《吃了吗》三部
    python3 _build/build.py beam1 beam2 beam3         # 《上梁》三部
    python3 _build/build.py stock1 stock2 stock3      # 《红与绿》三部
    python3 _build/build.py open1 open2 open3         # 《开张》三部
    python3 _build/build.py can1                      # 《能不能》第一部
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 书名: (源目录, 输出文件, 段落列表)
BOOKS = {
    'money': ('money', 'money/index.html', ['head.html'] + ['s%02d.html' % i for i in range(13)]),
    'yes': ('yes', 'yes/index.html', ['head.html'] + ['s%02d.html' % i for i in range(16)]),
    'reed': ('reed', 'reed/index.html', ['head.html'] + ['s%02d.html' % i for i in range(18)]),
    'finance': ('finance', 'finance/index.html', ['head.html'] + ['s%02d.html' % i for i in range(19)]),
    'walk': ('walk', 'walk/index.html', ['head.html'] + ['s%02d.html' % i for i in range(11)]),
    'time': ('time', 'time/index.html', ['head.html'] + ['s%02d.html' % i for i in range(14)]),
    # 《谁说了算》分三部三个网页，共用 css.html / bar.html / app.js
    'power1': ('power', 'power/index.html', ['top1.html', 'css.html', 'bar.html'] + ['a%02d.html' % i for i in range(12)]),
    'power2': ('power', 'power/two.html', ['top2.html', 'css.html', 'bar.html'] + ['b%02d.html' % i for i in range(14)]),
    'power3': ('power', 'power/three.html', ['top3.html', 'css.html', 'bar.html'] + ['c%02d.html' % i for i in range(14)]),
    # 《城里城外》也分三部，脚本拆在 _build/city/js/*.js，按文件名顺序拼接
    'city1': ('city', 'city/index.html', ['top1.html', 'css.html', 'bar.html'] + ['a%02d.html' % i for i in range(11)]),
    'city2': ('city', 'city/two.html', ['top2.html', 'css.html', 'bar.html'] + ['b%02d.html' % i for i in range(12)]),
    'city3': ('city', 'city/three.html', ['top3.html', 'css.html', 'bar.html'] + ['c%02d.html' % i for i in range(12)]),
    # 《轮到谁了》分四部（希腊 / 罗马 / 欧洲与英国 / 美国），脚本拆在 _build/turn/js/*.js
    'turn1': ('turn', 'turn/index.html', ['top1.html', 'css.html', 'bar.html'] + ['a%02d.html' % i for i in range(13)]),
    'turn2': ('turn', 'turn/two.html', ['top2.html', 'css.html', 'bar.html'] + ['b%02d.html' % i for i in range(15)]),
    'turn3': ('turn', 'turn/three.html', ['top3.html', 'css.html', 'bar.html'] + ['c%02d.html' % i for i in range(16)]),
    'turn4': ('turn', 'turn/four.html', ['top4.html', 'css.html', 'bar.html'] + ['d%02d.html' % i for i in range(15)]),
    # 《铁打的营盘》分三部（刀笔 / 机器 / 心法），脚本拆在 _build/civil/js/*.js
    'civil1': ('civil', 'civil/index.html', ['top1.html', 'css.html', 'bar.html'] + ['a%02d.html' % i for i in range(12)]),
    'civil2': ('civil', 'civil/two.html', ['top2.html', 'css.html', 'bar.html'] + ['b%02d.html' % i for i in range(12)]),
    'civil3': ('civil', 'civil/three.html', ['top3.html', 'css.html', 'bar.html'] + ['c%02d.html' % i for i in range(12)]),
    # 《值不值》分两部（算 / 人），脚本拆在 _build/worth/js/*.js
    'worth1': ('worth', 'worth/index.html', ['top1.html', 'css.html', 'bar.html'] + ['a%02d.html' % i for i in range(10)]),
    'worth2': ('worth', 'worth/two.html', ['top2.html', 'css.html', 'bar.html'] + ['b%02d.html' % i for i in range(8)]),
    # 《吃了吗》分三部（火与种 / 路与桌 / 厂与秤），脚本拆在 _build/eat/js/*.js
    'eat1': ('eat', 'eat/index.html', ['top1.html', 'css.html', 'bar.html'] + ['a%02d.html' % i for i in range(11)]),
    'eat2': ('eat', 'eat/two.html', ['top2.html', 'css.html', 'bar.html'] + ['b%02d.html' % i for i in range(10)]),
    'eat3': ('eat', 'eat/three.html', ['top3.html', 'css.html', 'bar.html'] + ['c%02d.html' % i for i in range(10)]),
    # 《上梁》分三部（土木 / 匠作 / 钢与玻璃），脚本拆在 _build/beam/js/*.js
    'beam1': ('beam', 'beam/index.html', ['top1.html', 'css.html', 'bar.html'] + ['a%02d.html' % i for i in range(11)]),
    'beam2': ('beam', 'beam/two.html', ['top2.html', 'css.html', 'bar.html'] + ['b%02d.html' % i for i in range(10)]),
    'beam3': ('beam', 'beam/three.html', ['top3.html', 'css.html', 'bar.html'] + ['c%02d.html' % i for i in range(10)]),
    # 《红与绿》分三部（盘 / 手 / 花），脚本拆在 _build/stock/js/*.js
    'stock1': ('stock', 'stock/index.html', ['top1.html', 'css.html', 'bar.html'] + ['a%02d.html' % i for i in range(11)]),
    'stock2': ('stock', 'stock/two.html', ['top2.html', 'css.html', 'bar.html'] + ['b%02d.html' % i for i in range(10)]),
    'stock3': ('stock', 'stock/three.html', ['top3.html', 'css.html', 'bar.html'] + ['c%02d.html' % i for i in range(10)]),
    # 《开张》分三部（摊 / 路 / 账），脚本拆在 _build/open/js/*.js
    'open1': ('open', 'open/index.html', ['top1.html', 'css.html', 'bar.html'] + ['a%02d.html' % i for i in range(11)]),
    'open2': ('open', 'open/two.html', ['top2.html', 'css.html', 'bar.html'] + ['b%02d.html' % i for i in range(10)]),
    'open3': ('open', 'open/three.html', ['top3.html', 'css.html', 'bar.html'] + ['c%02d.html' % i for i in range(10)]),
    # 《能不能》分三部（一起 / 接着 / 混用），脚本拆在 _build/can/js/*.js
    'can1': ('can', 'can/index.html', ['top1.html', 'css.html', 'bar.html'] + ['a%02d.html' % i for i in range(11)]),
}
DRAFT = '--draft' in sys.argv  # 写到一半时跳过缺失段落和锚点检查


def build(key):
    src_dir, out_rel, parts = BOOKS[key]
    src = os.path.join(ROOT, '_build', src_dir)
    if DRAFT:
        parts = [p for p in parts if os.path.exists(os.path.join(src, p))]
    html = ''.join(open(os.path.join(src, p), encoding='utf-8').read() for p in parts)
    jsdir = os.path.join(src, 'js')
    if os.path.isdir(jsdir):
        js = '\n'.join(open(os.path.join(jsdir, f), encoding='utf-8').read() for f in sorted(os.listdir(jsdir)) if f.endswith('.js'))
    else:
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
