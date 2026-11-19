# 创世书房

几本讲“世界怎样被造出来”的网页书，配有可以动手玩的装置。手机、平板、电脑都能读。

在线阅读：https://damocles1-study.github.io/genesis-library/

| 书 | 路径 |
|---|---|
| 计算机创世记 · 上卷《一沙一世界》 | `computer/index.html` |
| 计算机创世记 · 下卷《第二次创世》 | `computer/second.html` |
| 点石成金 · 金钱创世记 | `money/index.html` |
| 是，大人 · 衙门里的处世术 | `yes/index.html` |
| 苇城书记 · 文字创世记（三卷：落笔、破译、开口） | `reed/index.html` |
| 柜台里外 · 金融创世记（四卷十六章加尾声） | `finance/index.html` |
| 回宿舍的路 · 路上聊（一百张卡片） | `walk/index.html` |
| 几点了 · 时间创世记（四卷十二章加尾声） | `time/index.html` |

## 改书

《点石成金》《是，大人》《苇城书记》《柜台里外》《回宿舍的路》《几点了》都是分段源文件拼出来的，别直接改生成页。只改 `_build/money/`、`_build/yes/`、`_build/reed/`、`_build/finance/`、`_build/walk/` 或 `_build/time/` 下的源文件（`head.html` 样式、`sNN.html` 各段正文、`app.js` 装置脚本），然后运行：

    python3 _build/build.py          # 全部
    python3 _build/build.py yes      # 只建一本
    python3 _build/build.py finance --draft   # 写到一半时：跳过缺失段落和锚点检查

脚本会检查重复 id 和失效锚点。《苇城书记》是平行世界故事传：蓝框 `.real` 里是真实历史，章末 `.ledger` 是“记一笔”凭证，卷末有故事与历史的对照表。《是，大人》的漫画人物是 `app.js` 里的 `fig()` 函数画的 SVG 线稿，每格画面在 `PANELS` 里，对白气泡是 HTML。

- 眉批 `<aside class="echo" data-k="轮回|讽刺|联系|存疑|生活" data-year data-pat data-title>` 会被尾声的时间轴自动收集。
- 对白 `.scene`、戏里戏外 `.drama`、带走一句 `.takeaway`。

《柜台里外》每章开头的虚线框「柜台前」是发生在真实年代的虚构小故事，“有人问”是读者的问题，`.word` 是“柜台词典”，卷末 `.bill` 是“结账”；装置 17 的轮回表自动收集全书眉批。

《回宿舍的路》的卡片写在 `_build/walk/src/t1.txt`…`t9.txt`（一种很简单的逐行格式，说明在 `gen.py` 开头），先跑 `python3 _build/walk/gen.py` 生成 `s01`–`s09.html`，再跑 `python3 _build/build.py walk`。每张卡是一个 `<article class="cd" data-t="主题" data-k="讲|猜|辩|假|玩" data-p="场景">`，`app.js` 负责抽卡、按主题/类型/地点筛选和“讲过了”（存在浏览器本地）；各卡的“存疑”会被自动汇总到书末“哪些是真的”。

《几点了》按十二时辰分章（`c1`–`c12` 对应子—亥，`c13` 尾声），每章：章首钟面 `.hour`（`svg.dial[data-h]` 由脚本画）→ 虚线框 `.now`“此刻 · 你的一天”（虚构）→ 朱红边 `.then`“那一刻”（真事，框底 `.fact` 写明真的部分）→ 正文、蓝框 `.box`、眉批 `.echo`、装置 → 章末 `.tick`“滴答”卡。

浅色模式统一用护眼暖色底（取值范围见项目须知）。

计算机创世记迁自原仓库 computer-genesis，只加了回书房的链接。

纯静态网页，无框架，只从 Google Fonts 加载字体。正文由 Claude 协助写作，史实已尽量核对，争议之处列在各书书末。
