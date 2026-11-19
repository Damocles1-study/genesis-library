# 创世书房

几本讲“世界怎样被造出来”的网页书，配有可以动手玩的装置。手机、平板、电脑都能读。

在线阅读：https://damocles1-study.github.io/genesis-library/

| 书 | 路径 |
|---|---|
| 计算机创世记 · 上卷《一沙一世界》 | `computer/index.html` |
| 计算机创世记 · 下卷《第二次创世》 | `computer/second.html` |
| 点石成金 · 金钱创世记 | `money/index.html` |
| 是，大人 · 衙门里的处世术 | `yes/index.html` |

## 改书

《点石成金》和《是，大人》都是分段源文件拼出来的，别直接改生成页。只改 `_build/money/` 或 `_build/yes/` 下的源文件（`head.html` 样式、`sNN.html` 各段正文、`app.js` 装置脚本），然后运行：

    python3 _build/build.py          # 全部
    python3 _build/build.py yes      # 只建一本

脚本会检查重复 id 和失效锚点。《是，大人》的漫画人物是 `app.js` 里的 `fig()` 函数画的 SVG 线稿，每格画面在 `PANELS` 里，对白气泡是 HTML。

- 眉批 `<aside class="echo" data-k="轮回|讽刺|联系|存疑|生活" data-year data-pat data-title>` 会被尾声的时间轴自动收集。
- 对白 `.scene`、戏里戏外 `.drama`、带走一句 `.takeaway`。

计算机创世记迁自原仓库 computer-genesis，只加了回书房的链接。

纯静态网页，无框架，只从 Google Fonts 加载字体。正文由 Claude 协助写作，史实已尽量核对，争议之处列在《点石成金》书末。
