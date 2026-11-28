# 第 13 步新写的代码
# ---------- 第 13 步 · 哈夫曼编码：把存档变小 ----------
def huffman(text):
    """常见的字用短码，少见的用长码"""
    count = {}
    for c in text:
        count[c] = count.get(c, 0) + 1
    import heapq
    pq = []
    k = 0
    for c, n in count.items():
        heapq.heappush(pq, (n, k, c))        # k 只是为了次数相同时好比较
        k = k + 1
    while len(pq) > 1:                       # 每次拿两个最少的，合成一个
        n1, _, a = heapq.heappop(pq)
        n2, _, b = heapq.heappop(pq)
        heapq.heappush(pq, (n1 + n2, k, (a, b)))
        k = k + 1
    codes = {}

    def walk(node, code):
        if isinstance(node, str):
            codes[node] = code or '0'
            return
        walk(node[0], code + '0')
        walk(node[1], code + '1')
    walk(pq[0][2], '')
    return codes, count


def demo():
    text = ''.join(ISLAND)
    codes, count = huffman(text)
    for c in sorted(codes, key=lambda c: -count[c]):
        print(f'{c!r} 出现 {count[c]:3} 次，码 {codes[c]}')
    bits = sum(len(codes[c]) for c in text)
    print('每个字 8 位：', len(text) * 8, '位；哈夫曼：', bits, '位')
    back = {v: k for k, v in codes.items()}
    enc = ''.join(codes[c] for c in text)
    cur, out = '', ''
    for b in enc:
        cur = cur + b
        if cur in back:
            out = out + back[cur]
            cur = ''
    print('解回来一样吗？', out == text)
