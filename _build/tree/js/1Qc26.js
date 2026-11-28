/* ---------- 第二十六章：快速排序 ---------- */
dev('#quickFig', fig => {
  let pick = 'first';
  const v = sortViz(fig, ['标杆挑第一个', '标杆随便挑'], {
    pick: () => pick,
    hint: () => pick === 'first' ? '每一段都拿第一个当标杆。' : '每一段都随便挑一个当标杆（先换到最前面）。',
    end: (a, c) => pick === 'first' ? ' 换成“倒着的”数据，再看比较次数。' : ' 随便挑标杆，倒着的数据也不怕了。'
  });
  SORTS['标杆挑第一个'] = (a, E) => SORTS['快速'](a, E, 'first');
  SORTS['标杆随便挑'] = (a, E) => SORTS['快速'](a, E, 'random');
  $$('[data-a] button', fig).forEach((b, i) => b.addEventListener('click', () => { pick = i ? 'random' : 'first'; }, true));
  v.prep(true);
});
