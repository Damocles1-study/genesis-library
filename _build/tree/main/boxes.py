#!/usr/bin/env python3
"""把“主线 · 第 N 步”框插进《链与树》各章（放在“这一章的新词”前面）。可以反复运行：旧框会被换掉。
用法：python3 _build/tree/main/boxes.py
框的页脚（看代码、下载、做好了、进度条）由 js/05main.js 生成。写新的一部时，往 S 里加步子。"""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)

# 步号: (标题, 这一步给方格岛加了什么, 正文, 第二层)
S = {
0: ('小岛地图', '一张 16×10 的地图',
    '把小岛写成 10 行字，用 <code>make_map</code> 变成“列表的列表”，用 <code>show</code> 打出来，再看看 <code>grid[3][7]</code> 是不是你。文件叫 <code>island.py</code>，以后每一步都往里加一段，加在最后那两行 <code>if __name__ …</code> 的上面；每一步的 <code>demo()</code> 会盖掉上一步的。',
    '用 C 的 <code>char grid[10][16]</code> 存地图（本章第二层），写 <code>show()</code>；建一个 git 仓库，每做完一步提交一次。'),
1: ('计步器', '找到“你”要看几格',
    '<code>find_player</code> 一格一格地找 @，顺便数一数看了几格；再造 10×10、100×100、1000×1000 的大地图，看最坏要看多少格。最后用一个变量一直记着位置：只看 1 次。',
    '用 C 写同样的扫描，用 <code>clock()</code> 量 n 从 1000 到 8000 的时间，画出“n² 格子数—时间”的关系；说明为什么记着位置是 O(1)。'),
2: ('一长排格子', '地图拉成一排、快捷栏插队',
    '<code>CELLS</code> 把地图拉成一长排，<code>at(x, y)</code> 和 <code>put(x, y, t)</code> 用 <code>y × 16 + x</code> 找格子；<code>hotbar_insert</code> 往快捷栏里插东西，数一数后面的挪了几次。',
    '在 C 里 <code>malloc(W * H)</code> 一块，写 <code>AT(x, y)</code> 宏；实现顺序表的 insert 和 delete，随机插入一万次，统计平均移动次数，和 n/2 比较。'),
3: ('鸭子队伍', '跟着你走的链表',
    '每只鸭子是一个字典结点 <code>{x, y, next}</code>。你走一步：<code>add_duck</code> 在你原来的位置头插一只新鸭子，<code>drop_last</code> 拿走最后一只，队伍就跟上了。',
    '<code>drop_last</code> 现在是 O(n)。用 C 写一个带尾指针的双链表，让它变成 O(1)；再想一想：为什么单链表加了尾指针还不够？'),
4: ('撤销和重做', '两个栈',
    '<code>change</code> 每改一格，就把 (x, y, 旧, 新) 压进 <code>UNDO</code>，并清空 <code>REDO</code>；<code>undo</code> 从 UNDO 弹出、改回去、压进 REDO；<code>redo</code> 反过来。',
    '用 C 写顺序栈，元素是结构体。只许撤销最近 100 步：满了要丢掉最旧的一步，这时栈还够用吗？（提示：最旧的在栈底，要换成第五章的循环队列或双端队列。）'),
5: ('水流', '一圈一圈流开的队列',
    '<code>pour</code> 用 <code>deque</code> 做队列：倒水的格子先入队，每次从队头拿一格，把它的草地邻居变成水、排到队尾，最多流 <code>rounds</code> 圈。',
    '用 C 的循环队列实现 <code>pour</code>。队列开多大才一定够？（提示：每一格最多入队一次。）再让它返回每一格的圈数（最短距离）。'),
6: ('告示牌搜索', '笨办法和 KMP',
    '<code>find_slow</code> 滑着比，<code>make_next</code> 算部分匹配表，<code>find_kmp</code> 比错了不从头来。demo 在一长串 a 里找 aaaaaaaaab，两种办法各比了几次。',
    '用 C 写 408 约定（下标从 1）的 next 和 nextval，对一千个随机短串和这里的 0 下标表互相核对；统计两种办法在随机文本上的平均比较次数。'),
7: ('油漆桶', '递归填湖，和自己的栈',
    '<code>fill</code> 用递归把连着的水涂成沙；在 200×200 的草地上它会报 RecursionError，<code>fill_stack</code> 自己拿一个栈，填满了 40000 格。',
    '用 C 写递归版，用 <code>ulimit -s</code> 查栈的大小，找出多大的地图会段错误；改成显式栈；再把栈换成队列，比较两种填法的访问顺序和最大占用。'),
8: ('配方树', '一棵合成配方的树',
    '<code>RECIPES</code> 写着每样东西要什么原料、各几个。<code>show_tree</code> 从“小屋”开始一层一层往下画，孩子往右缩进；<code>height</code> 用递归算出这棵树有几层。',
    '用 C 的“孩子兄弟表示法”存配方树（每个结点一个 first_child、一个 next_sibling 指针），写先根遍历打印；说出它对应的二叉树长什么样。'),
9: ('算原料', '后序遍历和层序遍历',
    '<code>raw</code> 用后序遍历算出造一样东西要挖多少原料，数量一层一层乘起来；<code>by_level</code> 用队列一层一层列出配方树的结点。',
    '把 raw 改成非递归：用栈模拟后序遍历；再用记忆化（第二十二章）避免对同一种材料重复展开，比较两种写法的调用次数。'),
10: ('图鉴', '二叉搜索树',
    '十样东西按拼音插进一棵搜索树（<code>bst_insert</code>），<code>in_order</code> 按顺序列出来，<code>bst_find</code> 查找并数一数看了几个结点。',
    '用 C 写搜索树的插入、查找和三种情况的删除；随机插入一千个数，统计平均查找长度，和 1.39 log₂n 比较。'),
11: ('平衡的图鉴', 'AVL 树',
    '<code>avl_insert</code> 每插一个就检查平衡，歪了就用 <code>rot_left</code>、<code>rot_right</code> 转回来。100 个排好序的名字：普通搜索树高 100，AVL 树高 7。',
    '给 C 版 AVL 树加上删除；写一个检查函数，递归验证每个结点的平衡因子和搜索树性质，插删各一万次后跑一遍。'),
12: ('定时事件', '自己写的堆',
    '<code>heap_push</code> 放在末尾再上浮，<code>heap_pop</code> 把最后一个搬到根再下沉。六件事乱着放进去，按时间顺序一件一件拿出来。',
    '用 C 写数组上的二叉堆，实现自底向上建堆；数一数建堆时的比较次数，验证它不超过 2n。'),
13: ('压缩存档', '哈夫曼编码',
    '<code>huffman</code> 数出地图里每个字出现几次，用小根堆每次合并最少的两个，再从树上读出编码。地图从 1280 位压到 281 位，解回来一模一样。',
    '把编码结果真的按位写进一个二进制文件（8 位一组拼成字节），再读回来解码；比较文件大小，并算出地图的信息熵。'),
14: ('数岛', '并查集',
    '<code>count_islands</code> 给每块陆地一个队长，相邻的陆地合并，最后数有几个队长。挖一条河变成 2 座岛，搭一座桥又变回 1 座。',
    '用 C 写按大小合并加路径压缩的并查集；在 1000×1000 的随机地图上数岛，和油漆桶的做法比较时间。'),
15: ('区块索引', '两层的分页索引',
    '存档按区块编号存。<code>idx_insert</code> 把编号放进排好序的页（每页最多 4 个），页满了从中间劈开；根记着每页的第一个编号。<code>idx_find</code> 只读两次：根一次，页一次。',
    '把它扩展成真正的 B+ 树（任意层数、叶子链表）；把每页写成一个文件，统计查找时打开文件的次数。'),

}
KID_SKIP = set()


def box(n):
    t, part, body, l2 = S[n]
    k1 = '自己打：点下面的“这一步的新代码”，照着加进 island.py（加在最后那两行的上面），运行，和“应该看到”对一对。打错了找不出来，就下载“到这一步的完整文件”。'
    return ('  <div class="main" data-step="%d">\n'
            '    <div class="mh"><b>主线 · 第 %d 步</b><span>%s</span></div>\n'
            '    <div class="mb">\n'
            '      <p class="part-of">这一步给方格岛加上：<i>%s</i></p>\n'
            '      <p>%s</p>\n'
            '      <div class="who1"><b>第一层</b>%s</div>\n'
            '      <div class="who2"><b>第二层</b>%s</div>\n'
            '    </div>\n'
            '  </div>\n') % (n, n, t, part, body, k1, l2)


def fname(n):
    if n <= 7:
        return 'a%02d.html' % (n + 1)
    if n <= 15:
        return 'b%02d.html' % (n - 7)
    if n <= 22:
        return 'c%02d.html' % (n - 15)
    return 'd%02d.html' % (n - 22)


for n in S:
    p = os.path.join(BASE, fname(n))
    s = open(p, encoding='utf-8').read()
    s = re.sub(r'  <div class="main" data-step="\d+">.*?\n  </div>\n(?=  <div class="words">)', '', s, flags=re.S)
    assert ('id="c%d"' % n) in s, (n, p)
    k = s.index('  <div class="words">')
    s = s[:k] + box(n) + s[k:]
    open(p, 'w', encoding='utf-8').write(s)
print('ok', len(S), '个框')
