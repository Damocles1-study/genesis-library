
/* ---------- 第二十五章：数据包生成器 ---------- */
dev('#packFig', () => {
  const E = [
    {n: '打招呼', f: 'hello', tick: false, body: ['say 你好，工坊！', 'title @a title "欢迎来到工坊"'], say: '输入 <code>/function NS:hello</code>，聊天框里会出现一句话，屏幕中间会出现一行大字。'},
    {n: '脚下一块金子地', f: 'gold', tick: false, body: ['fill ~-3 ~-1 ~-3 ~3 ~-1 ~3 minecraft:gold_block', 'say 金子地铺好了'], say: '输入 <code>/function NS:gold</code>，你脚下会出现一块 7 × 7 的金块地。<code>~</code> 的意思是“以我站的地方为准”。'},
    {n: '一键盖塔', f: 'tower', tick: false, body: ['fill ~2 ~ ~2 ~6 ~11 ~6 minecraft:stone_bricks hollow', 'setblock ~4 ~ ~2 minecraft:air', 'setblock ~4 ~1 ~2 minecraft:air', 'say 一座空心的塔盖好了，门在朝北那一面'], say: '输入 <code>/function NS:tower</code>，旁边会出现一座 5 × 5、12 层高的空心石砖塔，还开好了门。'},
    {n: '走过的草地开花', f: 'tick', tick: true, body: ['execute as @a at @s if block ~ ~-1 ~ minecraft:grass_block if block ~ ~ ~ minecraft:air run setblock ~ ~ ~ minecraft:poppy'], say: '这个不用输入命令：<code>/reload</code> 以后，它每秒自己运行 20 次（第十三章的游戏刻）。你走到哪片草地，哪里就开出一朵花。'}
  ];
  let ei = 0, vi = 0;
  const box = $('#packOut'), nsIn = $('#packNs');
  function ns(){ const v = (nsIn.value || '').toLowerCase().replace(/[^a-z0-9_]/g, ''); return v || 'xiaoge'; }
  function draw(){
    const N = ns(), e = E[ei];
    const meta = vi === 0 ? '{\n  "pack": {\n    "description": "我的第一个数据包",\n    "pack_format": 48\n  }\n}' : '{\n  "pack": {\n    "description": "我的第一个数据包",\n    "min_format": [88, 0],\n    "max_format": [88, 0]\n  }\n}';
    const files = [['pack.mcmeta', meta]];
    files.push(['data/' + N + '/function/' + e.f + '.mcfunction', e.body.join('\n')]);
    if (e.tick) files.push(['data/minecraft/tags/function/tick.json', '{\n  "values": ["' + N + ':' + e.f + '"]\n}']);
    const tree = N + '_pack/\n' + files.map(f => '  ' + f[0]).join('\n');
    box.innerHTML = '<div class="lab">文件夹长这样（放进存档的 datapacks 文件夹里）</div><pre class="py">' + esc(tree) + '</pre>' +
      files.map(f => '<div class="lab">' + esc(f[0]) + '</div><pre class="py">' + esc(f[1]) + '</pre>').join('');
    $('#packSay').innerHTML = '名字空间是 <b>' + N + '</b>（只能用小写字母、数字和下划线，你输入的别的字会被去掉）。' + e.say.replace(/NS/g, N) + (vi === 0 ? ' pack.mcmeta 里的 48 是 1.21 和 1.21.1 的数字。' : ' 1.21.9 以后改成了两个数，这里的 88 是 1.21.9 和 1.21.10 的例子。') + '<b>你的游戏是别的版本，就要换成对应的数字</b>，去社区维基搜“数据包格式”查。';
  }
  btnRow($('#packE'), E.map(e => e.n), 0, i => { ei = i; draw(); });
  btnRow($('#packV'), ['老写法（1.21—1.21.8）', '新写法（1.21.9 以后）'], 0, i => { vi = i; draw(); });
  nsIn.addEventListener('input', draw);
  draw();
});
