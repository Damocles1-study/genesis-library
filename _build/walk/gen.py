# -*- coding: utf-8 -*-
"""把 src/t*.txt 里的卡片源文件转成 s01.html … s09.html。

用法：python3 _build/walk/gen.py && python3 _build/build.py walk

源文件格式（一行一项，空行忽略，# 开头的行之外以 // 开头的是注释）：
  # 主题短名 | 栏目大标题 | 副标题 | 导语
  @card 类型 | 场景1 场景2 | 标题        类型：讲 猜 辩 假 玩
  > 开口
  p 正文一段（可写 HTML）
  q 猜的答案（折叠）
  s 左方|左方的话|右方|右方的话          辩
  x 存疑
  ? 抛给对方的问题
  @old w53 | 场景                        从 src/old.html 搬一张旧卡过来
场景：博物馆 园林 街上 动物园 夜空 饭桌 电影院 随时
"""
import os, re, glob

HERE = os.path.dirname(os.path.abspath(__file__))
PLACES = ['博物馆', '园林', '街上', '动物园', '夜空', '饭桌', '电影院', '随时']
CN = '零一二三四五六七八九十'


def cn(n):
    if n <= 10: return CN[n]
    if n < 20: return '十' + CN[n - 10]
    return CN[n // 10] + '十' + (CN[n % 10] if n % 10 else '')


old = {}
for a in re.findall(r'<article class="cd".*?</article>', open(os.path.join(HERE, 'src/old.html'), encoding='utf-8').read(), re.S):
    old[re.search(r'id="(w\d+)"', a).group(1)] = a

num = 0
doubts = []
files = sorted(glob.glob(os.path.join(HERE, 'src/t*.txt')))
for fi, path in enumerate(files, 1):
    theme = title = sub = lede = None
    cards = []
    cur = None
    for raw in open(path, encoding='utf-8'):
        line = raw.rstrip('\n')
        if not line.strip() or line.startswith('//'):
            continue
        if line.startswith('# '):
            theme, title, sub, lede = [x.strip() for x in line[2:].split('|')]
            continue
        if line.startswith('@card ') or line.startswith('@old '):
            cur = {'p': [], 'turn': []}
            cards.append(cur)
            if line.startswith('@old '):
                wid, places = [x.strip() for x in line[5:].split('|')]
                cur['old'] = wid
            else:
                kind, places, h3 = [x.strip() for x in line[6:].split('|')]
                assert kind in '讲猜辩假玩', (path, line)
                cur['kind'], cur['h3'] = kind, h3
            ps = places.split()
            for p in ps:
                assert p in PLACES, (path, line, p)
            cur['places'] = ' '.join(ps)
            continue
        tag, _, rest = line.partition(' ')
        rest = rest.strip()
        if tag == '>': cur['hook'] = rest
        elif tag == 'p': cur['p'].append(('p', rest))
        elif tag == 'q': cur['p'].append(('q', rest))
        elif tag == 's': cur['p'].append(('s', rest.split('|')))
        elif tag == 'x': cur['p'].append(('x', rest))
        elif tag == '?': cur['turn'].append(rest)
        else: raise SystemExit('看不懂这一行：%s\n%s' % (path, line))

    out = ['<section class="deck g" id="t%d" data-theme="%s">' % (fi, theme),
           '<div class="wide">',
           '<div class="deck-h"><h2>%s</h2><span>%s张 · %s</span></div>' % (title, cn(len(cards)), sub),
           '<p class="lede">%s</p>' % lede,
           '<div class="grid">', '']
    for c in cards:
        num += 1
        wid = 'w%02d' % num
        if 'old' in c:
            a = old[c['old']]
            a = re.sub(r'id="w\d+"', 'id="%s"' % wid, a, 1)
            a = a.replace('data-t="书外"', 'data-t="%s" data-p="%s"' % (theme, c['places']), 1)
            a = a.replace('<span class="th">书外</span>', '<span class="th">%s</span>' % theme, 1)
            a = re.sub(r'<span class="no">\d+</span>', '<span class="no">%d</span>' % num, a, 1)
            d = re.search(r'class="doubt">(.*?)</p>', a)
            if d: doubts.append((num, re.search(r'<h3>(.*?)</h3>', a).group(1), d.group(1)))
            out += [a, '']
            continue
        o = ['<article class="cd" id="%s" data-t="%s" data-k="%s" data-p="%s">' % (wid, theme, c['kind'], c['places']),
             '<header class="cd-h"><span class="th">%s</span><span class="kd">%s</span><span class="no">%d</span></header>' % (theme, c['kind'], num),
             '<h3>%s</h3>' % c['h3'],
             '<p class="hook">%s</p>' % c['hook'],
             '<div class="body">']
        for t, v in c['p']:
            if t == 'p': o.append('<p>%s</p>' % v)
            elif t == 'q': o.append('<details class="guess"><summary>先让对方猜</summary><div class="ans">%s</div></details>' % v)
            elif t == 's': o.append('<div class="sides"><div><b>%s</b>%s</div><div><b>%s</b>%s</div></div>' % tuple(v))
            elif t == 'x':
                o.append('<p class="doubt">%s</p>' % v)
                doubts.append((num, c['h3'], v))
        o.append('</div>')
        o.append('<div class="turn"><b>抛给对方</b><ul>')
        o += ['<li>%s</li>' % q for q in c['turn']]
        o.append('</ul></div>')
        o.append('</article>')
        out += o + ['']
    out += ['</div>', '</div>', '</section>', '']
    open(os.path.join(HERE, 's%02d.html' % fi), 'w', encoding='utf-8').write('\n'.join(out))
    print('s%02d.html  %s  %d 张' % (fi, theme, len(cards)))
print('共', num, '张')

# 把所有“存疑”汇总进 s10.html 的“哪些是真的”
p10 = os.path.join(HERE, 's10.html')
t = open(p10, encoding='utf-8').read()
li = '\n'.join('    <li><b>%02d %s</b>：%s</li>' % d for d in doubts)
t = re.sub(r'(<!--doubts-->).*?(<!--/doubts-->)', lambda m: m.group(1) + '\n' + li + '\n    ' + m.group(2), t, flags=re.S)
open(p10, 'w', encoding='utf-8').write(t)
print('存疑', len(doubts), '条')
