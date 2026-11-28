# 第 19 步新写的代码
# ---------- 第 19 步 · 最小生成树：用最少的路把村子连起来 ----------
VILLAGES = {'甲村': (2, 2), '乙村': (9, 1), '丙村': (12, 4), '丁村': (4, 6), '戊村': (10, 7)}


def kruskal(villages):
    names = list(villages)
    edges = []
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            (x1, y1), (x2, y2) = villages[names[i]], villages[names[j]]
            edges.append((abs(x1 - x2) + abs(y1 - y2), names[i], names[j]))
    edges.sort()                       # 从最短的路开始挑
    PARENT.clear()                     # 用第 14 步的并查集
    for n in names:
        PARENT[n] = n
    chosen = []
    for w, a, b in edges:
        if union(a, b):                # 两头还不连着，才修这条路
            chosen.append((a, b, w))
    return chosen


def demo():
    roads = kruskal(VILLAGES)
    for a, b, w in roads:
        print(f'修 {a}—{b}，长 {w}')
    print('一共修', len(roads), '条路，总长', sum(w for a, b, w in roads))
