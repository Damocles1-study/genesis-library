(function(){
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const fmt = n => n >= 1e8 ? (n / 1e8).toFixed(n >= 1e9 ? 0 : 1) + ' 亿' : n >= 1e4 ? (Math.round(n / 1e3) / 10).toLocaleString() + ' 万' : Math.round(n).toLocaleString();
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const btnRow = (box, items, cur, cb) => {
  box.innerHTML = items.map((t, i) => '<button class="btn' + (i === cur ? ' on' : '') + '" data-i="' + i + '">' + t + '</button>').join('');
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', box).forEach(x => x.classList.toggle('on', x === b)); cb(+b.dataset.i); });
};
const dev = (sel, fn) => { const el = $(sel); if (el) { try { fn(el); } catch (err) { console.error(sel, err); } } };
const kv = (box, rows) => { box.innerHTML = rows.map(r => '<div>' + r[0] + '<b>' + r[1] + '</b></div>').join(''); };
function txt(x, y, t, o){ o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.s || 13) + '" fill="' + (o.c || 'var(--ink)') + '" text-anchor="' + (o.a || 'middle') + '"' + (o.w ? ' font-weight="700"' : '') + (o.halo === false ? '' : ' paint-order="stroke" stroke="' + (o.hc || 'var(--card)') + '" stroke-width="3.5" stroke-linejoin="round"') + '>' + t + '</text>'; }
/* 滑块：初始化时调一次回调，所以回调里用到的变量要先定义 */
function slider(id, f, cb){ const r = $('#' + id), o = $('#' + id + 'O'); const go = () => { if (o) o.textContent = f ? f(+r.value) : r.value; if (cb) cb(+r.value); }; r.addEventListener('input', go); go(); return () => +r.value; }

/* ---------- 全书目录（三个网页共用） ---------- */
const PFILE = ['index', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const PAGE = (() => { const m = location.pathname.match(/\/(two|three|four|five|six|seven|eight|nine|ten)\.html/); return m ? PFILE.indexOf(m[1]) + 1 : 1; })();
const READY = 10; // 已经写好的部数
const PURL = {}; PFILE.forEach((f, i) => PURL[i + 1] = i ? f + '.html' : './');
/* 十部：前四部是故事，后六部是指南 */
const PARTS = [
  {k: '土', g: '故事', s: '一块方块从哪里来 · 九章'},
  {k: '电', g: '故事', s: '红线怎样变成电脑 · 八章'},
  {k: '门', g: '故事', s: '走出游戏 · 八章'},
  {k: '工', g: '故事', s: '动手的工坊 · 八章'},
  {k: '手', g: '指南', s: '把 Mac 摸熟：键盘、文件、终端 · 八章'},
  {k: '令', g: '指南', s: '指令大全：坐标、天气、给东西、变量和条件 · 十章'},
  {k: '词', g: '指南', s: '游戏里的英语：听、拼、词卡、复习台 · 八章'},
  {k: '数', g: '指南', s: '方块里的数学：负数到勾股定理 · 八章'},
  {k: '理', g: '指南', s: '方块里的物理：下落、光、声音、机械、天 · 五章'},
  {k: '程', g: '指南', s: '编程：变量到递归、调试、自学 · 十一章'}
];
const CN = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const TOC = [
  {p: 1, t: '第一部 · 土 —— 一块方块从哪里来'},
  {v: '序幕'},
  {id: 'c0', n: '块', t: '一格是一米', s: '方块世界有多大、一天多长、为什么全世界几亿人都在玩；一格有多大', r: '今天'},
  {v: '卷一 · 来历'},
  {id: 'c1', n: '积', t: '在它之前', s: '一块带小圆点的积木、屏幕上的小方格、一个矮人的要塞、一个四月份的挖矿游戏；从像素到方块', r: '1958—2009'},
  {id: 'c2', n: '人', t: '一个人和一周', s: '七岁学编程的瑞典男孩、一份上班的工作、“洞穴游戏”、论坛上的一个帖子；一个游戏怎样一版一版长大', r: '1979—2010'},
  {id: 'c3', n: '夜', t: '第一个夜晚', s: '生存模式、一只画错的猪、天黑以后出来的东西、饿肚子；第一夜', r: '2009—2011'},
  {v: '卷二 · 长大'},
  {id: 'c4', n: '卖', t: '十欧元一份', s: '先卖还没做完的游戏、被冻住的账户、一个人变成一家公司、拉斯维加斯的 1.0；卖了多少份', r: '2009—2026'},
  {id: 'c5', n: '高', t: '越长越高的世界', s: '下界和末地、村民、海洋和洞穴、投票选生物又不选了；世界变高了', r: '2010—2026'},
  {id: 'c6', n: '合', t: '二十五亿美元', s: '一家大公司买下小公司、两个版本、关掉的几款游戏、一部电影；一棵家谱树', r: '2011—2025'},
  {id: 'c7', n: '国', t: '来到中国', s: '网易代理、免费下载和皮肤、未成年人的游戏时间；一年有几个小时', r: '2016—今'},
  {id: 'c8', n: '群', t: '大家一起造', s: '模组、服务器、视频、维基、一个不存在的人、藏在模组里的病毒；真的假的', r: '2010—2023'},
  {p: 2, t: '第二部 · 电 —— 红石、电路和代码'},
  {v: '卷三 · 红石'},
  {id: 'c9', n: '线', t: '红色的粉末', s: '红石粉就是电线、拉杆和按钮、信号能走十五格；从一盏灯开始', r: '2010—今'},
  {id: 'c10', n: '门', t: '是和不是', s: '一根火把就是“非”、两个开关的“与”和“或”、一个美国学生的硕士论文；逻辑门', r: '1847—今'},
  {id: 'c11', n: '数', t: '只会数到一', s: '二进制、一加一等于十、半加器和全加器；用红石做一台加法器', r: '1679—今'},
  {id: 'c12', n: '记', t: '会记事的电路', s: '锁存器、开一下关一下、内存是什么；让灯记住你按过', r: '1918—今'},
  {id: 'c13', n: '钟', t: '一秒二十下', s: '游戏刻、红石刻、时钟电路、电脑的“主频”；一秒钟能做几件事', r: '1949—今'},
  {v: '卷四 · 机器和代码'},
  {id: 'c14', n: '机', t: '游戏里的电脑', s: '红石计算器、红石处理器、在我的世界里造我的世界、一个要想好几个小时的聊天机器人', r: '2010—2025'},
  {id: 'c15', n: '令', t: '命令方块', s: '一行字召唤一场雨、函数和数据包、小游戏地图是怎样做出来的', r: '2012—今'},
  {id: 'c16', n: '码', t: '用代码搭房子', s: '图形化编程、教育版里的小机器人、Python 一行盖一座塔', r: '2013—今'},
  {p: 3, t: '第三部 · 门 —— 走出游戏'},
  {v: '卷五 · 动手'},
  {id: 'c17', n: '本', t: '一台 MacBook Air', s: '哪个版本能在苹果电脑上玩、M1 芯片、键盘上的几个键、卡了怎么办、存档和备份；视野距离', r: '2020—今'},
  {id: 'c18', n: '课', t: '教室里的方块', s: '一位老师的改装版、教育版、一座藏在游戏里的图书馆、居民设计公园；方块数学课', r: '2011—今'},
  {id: 'c19', n: '图', t: '一比一的国家', s: '一个实习生和二百二十亿块方块、一比一的丹麦、把地球搬进去、方块世界有多大；比例尺', r: '2013—今'},
  {id: 'c20', n: '造', t: '从方块到真房子', s: '游戏变回积木、3D 打印、医院里的体素、游戏里的房子现实里能不能盖；方块变模型', r: '2011—今'},
  {v: '卷六 · 长大以后'},
  {id: 'c21', n: '安', t: '网上的陌生人', s: '四样不能说的东西、“免费送”的骗局、被骂被炸怎么办、遇到不舒服的事告诉谁；这条消息怎么办', r: '今天'},
  {id: 'c22', n: '时', t: '再玩五分钟', s: '为什么停不下来、不确定的奖励、什么才叫游戏障碍、开始前就想好怎么停；我们家的游戏公约', r: '2007—今'},
  {id: 'c23', n: '长', t: '长大以后做什么', s: '做一个游戏要多少种人、方块里练出来的本事、作品集；方块里藏着的二十种工作', r: '今天'},
  {v: '尾声'},
  {id: 'c24', n: '你', t: '你的世界', s: '妈妈第一次拿起鼠标、全书时间线、押韵的地方、如果只记六句；我的第一块', r: '1679—今'},
  {p: 4, t: '第四部 · 工 —— 动手的工坊'},
  {v: '卷七 · 码'},
  {id: 'c25', n: '包', t: '第一个数据包', s: '几个文件夹和两个文本文件、纯文本和后缀名、每秒二十次的函数、数字对不上怎么办；数据包生成器', r: '2017—今'},
  {id: 'c26', n: '蟒', t: '让 Python 替你写命令', s: '装上 Python、小海龟画画、勾股定理画一个球、一个程序写出几千行命令；Python 生成命令', r: '1991—今'},
  {v: '卷八 · 机'},
  {id: 'c27', n: '芯', t: '一块芯片里的电脑', s: 'CPU、GPU、内存和硬盘各管什么、活动监视器、做一次控制变量的实验；视野和帧数', r: '2020—今'},
  {id: 'c28', n: '网', t: '和豆子联机', s: '局域网、IP 地址和端口、小包裹和延迟、在终端里 ping 一下；延迟是什么感觉', r: '1969—今'},
  {id: 'c29', n: '服', t: '自己开一个服务器', s: '单人游戏里也藏着服务器、Java、终端里的一行命令、白名单、为什么不对整个互联网开放；服务器设置', r: '2012—今'},
  {v: '卷九 · 脑'},
  {id: 'c30', n: '算', t: '方块里的数学和物理', s: '下界的一比八、量一量走路多快、方块掉下去和石头掉下去、火把的光、五十块沙砾；掉下去要多久', r: '1590—今'},
  {id: 'c31', n: '问', t: '和 AI 一起学', s: '几岁能用、在大人的账号下、它会说错、让它讲道理而不是替你做、一起检查一段 AI 写的代码；怎样问 AI', r: '2022—今'},
  {id: 'c32', n: '路', t: '一张自学地图', s: '从现在到高中、免费的好地方、游戏外的创意、小格的局域网派对；我的技能树', r: '今天'},
  {p: 5, t: '第五部 · 手 —— 把 Mac 摸熟（指南）'},
  {v: '卷十 · 键'},
  {id: 'c33', n: '键', t: '键盘上的怪符号', s: '⌘ ⌥ ⌃ ⇧ fn、快捷键怎么读、三种截图、聚焦搜索当计算器、强制退出；MacBook Air 的键盘', r: '指南'},
  {id: 'c34', n: '指', t: '触控板、鼠标和输入法', s: '几根手指几种意思、接鼠标、中英文切换、中文标点让命令失败、每个字都是一个数；标点侦探', r: '指南'},
  {id: 'c35', n: '位', t: '游戏里的每一个键', s: '默认按键全表、改键、Mac 上的 fn、F3 调试屏幕和组合键；按键反应', r: '指南'},
  {v: '卷十一 · 树'},
  {id: 'c36', n: '树', t: '访达：文件夹就是一棵树', s: '边栏、四种看法、新建改名移动拷贝删除、后缀名；模拟访达', r: '指南'},
  {id: 'c37', n: '径', t: '路径：一串地址', s: '斜杠、中文名和真名、波浪号、藏起来的资源库、前往文件夹、绝对和相对；读路径', r: '指南'},
  {id: 'c38', n: '存', t: '游戏的东西都在哪儿', s: 'minecraft 文件夹地图、截图日志设置、三种备份、region 文件和向下取整', r: '指南'},
  {v: '卷十二 · 问'},
  {id: 'c39', n: '终', t: '终端：和电脑打字说话', s: '提示符、pwd ls cd open cat、tab 补全、空格和反斜杠、不能乱打的命令；模拟终端', r: '指南'},
  {id: 'c40', n: '问', t: '卡住了怎么办', s: '读试查问记、查版本、把问题说清楚、在维基上搜、和 AI 一起把 Mac 冷门变成优势；问题卡', r: '指南'},
  {p: 6, t: '第六部 · 令 —— 指令大全（指南）'},
  {v: '卷十三 · 位置'},
  {id: 'c41', n: '系', t: 'x、y、z', s: '三根轴、东西南北、正数负数、方块坐标和精确坐标', r: '指南'},
  {id: 'c42', n: '移', t: '/tp：瞬移', s: '绝对坐标、~ 相对坐标、^ 局部坐标、朝向和角度', r: '指南'},
  {v: '卷十四 · 世界'},
  {id: 'c43', n: '天', t: '/time 和 /weather', s: '游戏刻、一天 24000 刻、晴雨雷、天气的英文', r: '指南'},
  {id: 'c44', n: '模', t: '/gamemode 和游戏规则', s: '四种模式、难度、gamerule 的“是和否”', r: '指南'},
  {id: 'c45', n: '给', t: '/give：给东西', s: '物品 ID 就是英文单词、一组 64 个、物品栏是一排编号的格子', r: '指南'},
  {id: 'c46', n: '召', t: '/summon 和 /effect', s: '召唤生物、状态效果、等级从 0 数起', r: '指南'},
  {id: 'c47', n: '填', t: '/setblock 和 /fill', s: '长方体、体积、空心和外壳、方块状态', r: '指南'},
  {v: '卷十五 · 逻辑'},
  {id: 'c48', n: '选', t: '目标选择器', s: '@p @a @s @e @r、参数就是筛选条件', r: '指南'},
  {id: 'c49', n: '分', t: '/scoreboard：变量', s: '记分项、加减乘除、侧边栏', r: '指南'},
  {id: 'c50', n: '若', t: '/execute：如果……就……', s: '条件判断、以谁的身份在哪儿、做一个计时小游戏', r: '指南'},
  {p: 7, t: '第七部 · 词 —— 游戏里的英语（指南）'},
  {id: 'c51', n: '听', t: '怎样学单词', s: '把游戏换成英文、听和说、间隔重复', r: '指南'},
  {id: 'c52', n: '拼', t: '单词是拼起来的', s: '复合词、前缀后缀、命令就是祈使句', r: '指南'},
  {id: 'c53', n: '料', t: '方块和材料', s: '词卡', r: '指南'},
  {id: 'c54', n: '器', t: '物品和工具', s: '词卡', r: '指南'},
  {id: 'c55', n: '生', t: '生物', s: '词卡', r: '指南'},
  {id: 'c56', n: '色', t: '颜色和群系', s: '十六色羊毛、平原森林沙漠', r: '指南'},
  {id: 'c57', n: '方', t: '方向、数字、时间、天气', s: '词卡', r: '指南'},
  {id: 'c58', n: '复', t: '复习台', s: '间隔重复、自己出题', r: '指南'},
  {p: 8, t: '第八部 · 数 —— 方块里的数学（指南）'},
  {id: 'c59', n: '图', t: '学过的和要学的', s: '小学到初中的数学地图', r: '指南'},
  {id: 'c60', n: '负', t: '负数', s: 'y 坐标、海平面、数轴', r: '指南'},
  {id: 'c61', n: '乘', t: '乘法和 2 的幂', s: '一组 64、箱子 27 格、二进制', r: '指南'},
  {id: 'c62', n: '比', t: '分数和比例', s: '下界一比八、合成配方、地图比例尺', r: '指南'},
  {id: 'c63', n: '形', t: '面积、周长、体积', s: '盖房子要多少块', r: '指南'},
  {id: 'c64', n: '角', t: '角度和朝向', s: '一圈 360 度、量角器', r: '指南'},
  {id: 'c65', n: '率', t: '概率和统计', s: '掉落几率、平均数和中位数、统计图', r: '指南'},
  {id: 'c66', n: '速', t: '速度和勾股定理', s: '走、跑、矿车、直线距离', r: '指南'},
  {p: 9, t: '第九部 · 理 —— 方块里的物理（指南）'},
  {id: 'c67', n: '落', t: '重力和下落', s: '越掉越快、摔落伤害', r: '指南'},
  {id: 'c68', n: '光', t: '光', s: '一格暗一级、平方反比', r: '指南'},
  {id: 'c69', n: '音', t: '声音和音调', s: '音符盒、频率、八度', r: '指南'},
  {id: 'c70', n: '动', t: '简单机械和水', s: '杠杆、活塞、水流', r: '指南'},
  {id: 'c71', n: '转', t: '昼夜、月亮、指南针', s: '地球自转、八种月相、磁场', r: '指南'},
  {p: 10, t: '第十部 · 程 —— 编程（指南）'},
  {id: 'c72', n: '量', t: '变量', s: '贴了名字的盒子、两种等号、四种值、f 字符串；小蟒', r: '指南'},
  {id: 'c73', n: '判', t: '条件', s: 'if elif else、冒号和缩进、and or not、真值表', r: '指南'},
  {id: 'c74', n: '环', t: '循环', s: 'for 和 range、两层循环盖墙、1 加到 100、while、跟踪表', r: '指南'},
  {id: 'c75', n: '函', t: '函数', s: 'def、参数、return、局部变量；自己发明命令', r: '指南'},
  {id: 'c76', n: '组', t: '列表', s: '快捷栏 0—8 号、负数下标、append pop insert、二维列表', r: '指南'},
  {id: 'c77', n: '典', t: '字典和树', s: 'ID 对中文名、数一数每种几个、文件夹和进度都是树', r: '指南'},
  {id: 'c78', n: '队', t: '队列和广度优先', s: '先进先出和后进先出、一圈一圈往外找、迷宫最短路', r: '指南'},
  {id: 'c79', n: '找', t: '查找和排序', s: '猜数 7 次以内、二分查找、冒泡选择插入', r: '指南'},
  {id: 'c80', n: '归', t: '递归', s: '停止条件、阶乘一层一层、汉诺塔 2ⁿ − 1、分形树', r: '指南'},
  {id: 'c81', n: '错', t: '调试和错题本', s: '1947 年的飞蛾、读报错、砍一半找错、五只虫子、错题本', r: '指南'},
  {id: 'c82', n: '学', t: '怎样自学', s: '问查试记讲、小计划、和 AI 一起学的规矩、成就墙；尾声', r: '指南'}
];
const chapPage = {}; { let p = 1; TOC.forEach(x => { if (x.p) p = x.p; if (x.id) chapPage[x.id] = p; }); }
const href = id => (chapPage[id] === PAGE ? '' : PURL[chapPage[id]]) + '#' + id;
dev('.bar .parts', nav => { nav.innerHTML = PARTS.map((x, i) => (i === 4 ? '<span class="gsep" aria-hidden="true"></span>' : '') + '<a href="' + PURL[i + 1] + '" data-p="' + (i + 1) + '" title="第' + CN[i] + '部 · ' + x.k + '（' + x.g + '）">' + x.k + '</a>').join('');
  $$('a', nav).forEach(a => { const p = +a.dataset.p; a.classList.toggle('on', p === PAGE); if (p > READY) { a.removeAttribute('href'); a.style.opacity = .4; a.title = '写作中'; } });
  const on = $('a.on', nav); if (on) nav.scrollLeft = Math.max(0, on.offsetLeft - nav.clientWidth / 2); });
/* 封面的“十部”导航 */
$$('.partnav').forEach(box => { box.classList.add('ten'); box.innerHTML = ['故事', '指南'].map(g => '<div class="pg"><span class="pgh">' + (g === '故事' ? '故事 · 第一到四部' : '指南 · 第五到十部 · 照着做、能自测') + '</span>' + PARTS.map((x, i) => x.g !== g ? '' :
  '<a ' + (i + 1 > READY ? 'class="soon"' : 'href="' + PURL[i + 1] + '"' + (i + 1 === PAGE ? ' class="on"' : '')) + '><span class="k">第' + CN[i] + '部</span><b>' + x.k + '</b><small>' + x.s + (i + 1 > READY ? ' · 写作中' : '') + '</small></a>').join('') + '</div>').join(''); });

$('#drawerList').innerHTML = TOC.map(x => x.p ? '<li class="ph">' + x.t + '</li>' : x.v ? '<li class="vh">' + x.v + '</li>' :
  chapPage[x.id] > READY ? '<li><a style="opacity:.5;pointer-events:none"><span class="n">' + x.n + '</span><span>' + x.t + '<small>写作中</small></span></a></li>' :
  '<li><a href="' + href(x.id) + '"' + (chapPage[x.id] === PAGE ? ' class="here"' : '') + '><span class="n">' + x.n + '</span><span>' + x.t + '<small>' + x.s + '</small></span></a></li>').join('');
dev('#toc', ul => {
  ul.innerHTML = TOC.map(x => x.p ? '<li class="vh" style="color:var(--main)">' + x.t + '</li>' : x.v ? '<li class="vh">' + x.v + '</li>' :
    chapPage[x.id] > READY ? '<li class="soon"><div><span class="n">' + x.n + '</span><span class="t">' + x.t + '<small>' + x.s + '</small></span><span class="r">' + x.r + '</span></div></li>' :
    '<li' + (chapPage[x.id] === PAGE ? '' : ' class="away"') + '><a href="' + href(x.id) + '"><span class="n">' + x.n + '</span><span class="t">' + x.t + '<small>' + x.s + '</small></span><span class="r">' + x.r + '</span></a></li>').join('');
});
/* 页面里写 <a data-c="c12">…</a>，自动拼出跨页链接；没写好的部变灰 */
$$('a[data-c]').forEach(a => { const id = a.dataset.c; if (chapPage[id] > READY) { a.removeAttribute('href'); a.title = '写作中'; a.style.textDecorationStyle = 'dotted'; a.classList.add('soon'); } else a.href = href(id); });

/* ---------- 页眉：卷名、进度、目录抽屉 ---------- */
const barVol = $('#barVol'), prog = $('#prog');
const vols = $$('[data-vol]');
let ticking = false;
function onScroll(){
  ticking = false;
  const lim = innerHeight * 0.35; let cur = null;
  for (const e of vols) { if (e.getBoundingClientRect().top < lim) cur = e; else break; }
  barVol.textContent = cur ? cur.dataset.vol : '序';
  const H = document.documentElement.scrollHeight - innerHeight;
  prog.style.width = (H > 0 ? scrollY / H * 100 : 0) + '%';
}
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, {passive: true});
onScroll();
const drawer = $('#drawer');
function openD(on){ drawer.classList.toggle('on', on); drawer.setAttribute('aria-hidden', on ? 'false' : 'true'); }
$('#tocBtn').addEventListener('click', () => openD(true));
drawer.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target.closest('a')) openD(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') openD(false); });
$$('.toTop').forEach(a => a.addEventListener('click', e => { e.preventDefault(); scrollTo({top: 0, behavior: 'smooth'}); }));

/* 章首：物品栏五格 */
const INV = [['挖', '探索'], ['造', '建造'], ['电', '红石'], ['码', '编程'], ['人', '人和历史']];
$$('.inv').forEach(w => { const on = (w.dataset.a || '').split(/\s+/); w.innerHTML = INV.map(f => '<span' + (on.includes(f[0]) ? ' class="on"' : '') + '><b>' + f[0] + '</b>' + f[1] + '</span>').join(''); });
/* 年代条：1958—今，十一格 */
const ERA = [[1900, 1980, '1958'], [1980, 1995, '1980'], [1995, 2009, '2000'], [2009, 2010, '2009'], [2010, 2011, '2010'], [2011, 2012, '2011'], [2012, 2014, '2012'], [2014, 2017, '2014'], [2017, 2020, '2017'], [2020, 2024, '2020'], [2024, 2100, '今']];
$$('.yrs').forEach(w => { const a = +w.dataset.a, b = +(w.dataset.b || w.dataset.a); w.innerHTML = ERA.map(e => '<span' + (b >= e[0] && a < e[1] ? ' class="on"' : '') + '>' + e[2] + '</span>').join(''); w.title = a + (b !== a ? '—' + b : ''); });

/* ---------- 等距方块：自己画的示意，不是游戏原图 ----------
   每种方块三个面：顶、左、右；每个面切成 4×4 小格，颜色略有深浅，像像素。 */
const BT = {
  grass: {n: '草', top: ['--grass', '--grass-2'], side: ['--dirt', '--dirt-2'], fringe: ['--grass', '--grass-2']},
  dirt: {n: '土', top: ['--dirt', '--dirt-2'], side: ['--dirt', '--dirt-2']},
  stone: {n: '石', top: ['--stn', '--stn-2'], side: ['--stn', '--stn-2']},
  log: {n: '原木', top: ['--wood', '--sand'], side: ['--wood-2', '--wood'], ring: true},
  plank: {n: '木板', top: ['--wood', '--wood-2'], side: ['--wood', '--wood-2'], plank: true},
  leaf: {n: '树叶', top: ['--leaf', '--grass-2'], side: ['--leaf', '--grass-2']},
  sand: {n: '沙', top: ['--sand', '--wood'], side: ['--sand', '--wood']},
  water: {n: '水', top: ['--water', '--sky'], side: ['--water', '--blu'], alpha: .82},
  glass: {n: '玻璃', top: ['--sky', '--card'], side: ['--water', '--sky'], alpha: .6, glass: true},
  rs: {n: '红石', top: ['--stn', '--rs'], side: ['--stn', '--rs'], ore: true},
  dia: {n: '钻石', top: ['--stn', '--dia'], side: ['--stn', '--dia'], ore: true}
};
const SHADE = {top: 0, left: .16, right: .3};
function face(pts, cols, r, shade, o){
  /* pts: 四个角 [p00, p10, p11, p01]，在面上做 4×4 小格 */
  const at = (u, v) => { const a = pts[0], b = pts[1], c = pts[2], d = pts[3]; return [lerp(lerp(a[0], b[0], u), lerp(d[0], c[0], u), v), lerp(lerp(a[1], b[1], u), lerp(d[1], c[1], u), v)]; };
  let g = '';
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    let c = r() < .35 ? cols[1] : cols[0];
    if (o.fringe && j === 0) c = o.fringe[r() < .4 ? 1 : 0];
    if (o.fringe && j === 1 && r() < .4) c = o.fringe[0];
    if (o.ore) c = (r() < .18 && i > 0 && i < 3 && j > 0 && j < 3) ? cols[1] : (r() < .3 ? '--stn-2' : '--stn');
    if (o.ring && o.isTop) c = (i === 0 || i === 3 || j === 0 || j === 3) ? '--wood-2' : ((i === 1 || i === 2) && (j === 1 || j === 2) ? cols[1] : cols[0]);
    if (o.plank && !o.isTop) c = j % 2 ? cols[1] : cols[0];
    if (o.glass) c = (i === 0 || j === 0) ? '--card' : cols[0];
    const q = [at(i / 4, j / 4), at((i + 1) / 4, j / 4), at((i + 1) / 4, (j + 1) / 4), at(i / 4, (j + 1) / 4)];
    g += '<path d="M' + q.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + 'Z" fill="var(' + c + ')"/>';
  }
  const P = pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L');
  if (shade) g += '<path d="M' + P + 'Z" fill="#000" opacity="' + shade + '"/>';
  g += '<path d="M' + P + 'Z" fill="none" stroke="#000" stroke-opacity=".28" stroke-width=".8"/>';
  return g;
}
/* 画一块：原点 (ox, oy) 是这块顶面中心往上的投影基准，s 是边长 */
function cube(ox, oy, s, type, seed, faces){
  const t = BT[type] || BT.dirt, r = rng(seed || 7), w = s * 0.866, h = s * 0.5;
  faces = faces || {top: 1, left: 1, right: 1};
  const T = [ox, oy - s], L = [ox - w, oy - s + h], R = [ox + w, oy - s + h], B = [ox, oy - s + 2 * h];
  const Lb = [ox - w, oy + h], Rb = [ox + w, oy + h], Bb = [ox, oy + 2 * h];
  let g = '<g' + (t.alpha ? ' opacity="' + t.alpha + '"' : '') + '>';
  if (faces.left) g += face([L, B, Bb, Lb], t.side, r, SHADE.left, {fringe: t.fringe, ore: t.ore, plank: t.plank, glass: t.glass});
  if (faces.right) g += face([B, R, Rb, Bb], t.side, r, SHADE.right, {fringe: t.fringe, ore: t.ore, plank: t.plank, glass: t.glass});
  if (faces.top) g += face([T, R, B, L], t.top, r, 0, {ore: t.ore, ring: t.ring, isTop: true, glass: t.glass});
  return g + '</g>';
}
/* 等距坐标 → 屏幕：gx 往右下，gy 往左下，gz 往上 */
const isoXY = (gx, gy, gz, s, ox, oy) => [ox + (gx - gy) * s * 0.866, oy + (gx + gy) * s * 0.5 - gz * s];
function blockIcon(type, size){
  const s = 10; return '<svg viewBox="-10 -12 20 22" width="' + (size || 26) + '" height="' + (size || 26) + '" aria-hidden="true">' + cube(0, 0, s, type, 3) + '</svg>';
}
/* 卷首：一排方块 */
$$('svg.row').forEach((svg, k) => {
  const types = [['grass', 'dirt', 'stone', 'log'], ['rs', 'stone', 'rs', 'glass'], ['plank', 'glass', 'grass', 'leaf'], ['stone', 'dia', 'rs', 'plank']][k % 4];
  let g = ''; const s = 22;
  [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach((p, i) => { const q = isoXY(p[0], p[1], p[2], s, 100, 40); g += cube(q[0], q[1], s, types[i], 11 + i); });
  svg.setAttribute('viewBox', '30 0 140 110'); svg.innerHTML = g;
});

/* 通用小折线图：series=[{name,color,pts:[[x,y]...],dash,dots}]，opt={xmin,xmax,ymin,ymax,xt,yt,xf,yf,marks:[[x,label]],H} */
function lineChart(svg, series, opt){
  const W = 600, H = opt.H || 260, L = opt.L || 46, R = 14, T = 14, B = 30;
  const X = x => L + (x - opt.xmin) / (opt.xmax - opt.xmin) * (W - L - R);
  const Y = y => T + (1 - (y - opt.ymin) / (opt.ymax - opt.ymin)) * (H - T - B);
  let g = '';
  (opt.yt || []).forEach(v => g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--rule)"/>' + txt(L - 6, Y(v) + 4, opt.yf ? opt.yf(v) : v, {s: 11, a: 'end', c: 'var(--ink-3)', halo: false}));
  (opt.xt || []).forEach(v => g += txt(X(v), H - 10, opt.xf ? opt.xf(v) : v, {s: 11, c: 'var(--ink-3)', halo: false}));
  (opt.marks || []).forEach((m, i) => g += '<line x1="' + X(m[0]) + '" x2="' + X(m[0]) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--ink-3)" stroke-dasharray="2 3"/>' + txt(X(m[0]) + 3, T + 12 + (i % 3) * 14, m[1], {s: 11, a: 'start', c: 'var(--ink-2)'}));
  series.forEach(s => {
    const pts = s.pts.filter(p => p[1] != null);
    g += '<path d="M' + pts.map(p => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join('L') + '" fill="none" stroke="' + s.color + '" stroke-width="' + (s.w || 2.4) + '"' + (s.dash ? ' stroke-dasharray="' + s.dash + '"' : '') + ' stroke-linejoin="round"/>';
    if (s.dots) pts.forEach(p => g += '<circle cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="3.5" fill="' + s.color + '"/>');
  });
  g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '" stroke="var(--ink)" stroke-width="1.2"/>';
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
  return {X, Y, W, H, L, R, T, B};
}
/* 横条：rows=[[名字, 数值, 小字, 颜色]] */
function bars(box, rows, max, f){
  box.innerHTML = rows.map(r => '<div class="row"><span class="nm">' + r[0] + (r[2] ? '<small>' + r[2] + '</small>' : '') + '</span><span class="tr"><i style="width:' + clamp(r[1] / max * 100, 0, 100) + '%;' + (r[3] ? 'background:' + r[3] : '') + '"></i></span><span class="v">' + (f ? f(r[1]) : r[1]) + '</span></div>').join('');
}
