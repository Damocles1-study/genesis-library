#!/usr/bin/env python3
"""把第一、二部各章的判词抽出来，写进 js/1Oc24.js 的 ALLV（尾声的全书判词表用）。
第三部的判词在页面上直接读，不用抽。改了第一、二部的判词要重跑：python3 _build/can/vds.py"""
import os, re, json, html
D = os.path.dirname(os.path.abspath(__file__))
out = []
for part, pre, n in [(1, 'a', 11), (2, 'b', 10)]:
    for i in range(n):
        s = open(os.path.join(D, '%s%02d.html' % (pre, i)), encoding='utf-8').read()
        for sec in re.finditer(r'<section class="chap" id="(c\d+)"(.*?)</section>', s, re.S):
            cid, body = sec.group(1), sec.group(2)
            big = re.search(r'<div class="big">(.*?)</div>', body)
            for li in re.finditer(r'<li><b>(.*?)</b><i class="st" data-v="(.*?)">.*?</i><p>(.*?)</p></li>', body, re.S):
                t = lambda x: html.unescape(re.sub(r'<[^>]+>', '', x)).strip()
                out.append([part, cid, big.group(1) if big else '', li.group(2), t(li.group(1)), t(li.group(3))])
p = os.path.join(D, 'js', '1Oc24.js')
js = open(p, encoding='utf-8').read()
data = 'const ALLV = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';'
js = re.sub(r'/\* @@VDS \*/.*?/\* @@END \*/', lambda m: '/* @@VDS */\n' + data + '\n/* @@END */', js, flags=re.S)
open(p, 'w', encoding='utf-8').write(js)
print(len(out), '条判词（第一、二部）')
