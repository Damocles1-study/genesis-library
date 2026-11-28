/* ---------- 第四部封面：找一个名字，三种办法 ---------- */
dev('#findFig', fig => {
  const box = $('.growbars', fig), say = $('.say', fig);
  const NS = [10, 100, 1000, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10];
  const fmt = v => v >= 1e8 ? (v / 1e8) + ' 亿' : v >= 1e4 ? (v / 1e4) + ' 万' : String(v);
  slider('fdN', k => fmt(NS[k]), k => {
    const n = NS[k];
    const rows = [['一个一个看', n], ['对半猜（要先排好序）', Math.ceil(Math.log2(n + 1))], ['散列表（平均）', 1]];
    box.innerHTML = rows.map(([name, v]) => '<div class="gb"><span class="gn">' + name + '</span><span class="gt"><i style="width:' + Math.max(1, Math.log10(Math.max(1, v)) / 10 * 100) + '%"></i></span><span class="gv">最多看 ' + fmt(v) + ' 次</span></div>').join('');
    say.textContent = n <= 100 ? '名字少的时候，三种都很快。' : '一百亿个名字：一个一个看要看一百亿次，对半猜 34 次，散列表平均一两次就到。代价呢？第二十三、二十四章讲。';
  });
});
