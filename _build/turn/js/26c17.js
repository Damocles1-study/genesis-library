
/* ---------- 装置 18：头衔拼图 ---------- */
dev('#crownFig', fig => {
  // [名称, 说明, 兵, 法, 钱, 神, 名, 扎眼, 奥古斯都拿了没有]
  const T = [
    ['年年当执政官', '前 31—前 23 年他年年当。管用，可太扎眼，还挡了元老们往上爬的路，前 23 年放下了。', 1, 2, 1, 0, 2, 3, false],
    ['有军团的行省的统帅权', '西班牙、高卢、叙利亚……“还不太平”的行省归他照看，十年一续。军团几乎全在这些行省。', 5, 0, 2, 0, 1, 1, true],
    ['更大的统治权', '在任何行省都高于当地总督。前 23 年起。', 2, 1, 0, 0, 1, 1, true],
    ['保民官的权力（但不当保民官）', '人身神圣、能否决任何官员、能召集元老院和人民大会。听上去是在“保护人民”。', 0, 4, 0, 0, 1, 0, true],
    ['元老院首席', '名单上排第一，开会第一个发言。共和国本来就有这个位子。', 0, 1, 0, 0, 2, 0, true],
    ['大祭司长', '终身的最高宗教职位。前 12 年。恺撒也当过，没人觉得奇怪。', 0, 0, 0, 5, 1, 0, true],
    ['“奥古斯都”这个名字', '“受尊崇的”。有神圣的味道，却不是国王，也不是独裁官。', 0, 0, 0, 1, 4, 1, true],
    ['国家之父', '前 2 年，元老院、骑士和人民一起献上。西塞罗也被这么叫过。', 0, 0, 0, 0, 4, 1, true],
    ['埃及（私人的）', '不归元老院，归他自己。派骑士去管，元老不许入境。埃及的粮和钱都是他的。', 1, 0, 4, 1, 0, 1, true],
    ['军事金库', '公元 6 年设立，靠遗产税和拍卖税补充，专给退伍老兵发退休金。士兵从此只认发钱的人。', 3, 0, 4, 0, 0, 0, true],
    ['终身独裁官', '恺撒的头衔。前 22 年罗马人求他当，他跪下来扯开衣服，宁死不当。', 4, 4, 2, 0, 2, 8, false],
    ['王冠', '“王”是罗马最脏的字。', 2, 2, 1, 1, 3, 10, false]
  ];
  const AX = [['兵', 'var(--red)'], ['法', 'var(--main)'], ['钱', 'var(--och)'], ['神', 'var(--pur)'], ['名', 'var(--grn)']];
  const list = $('#crList');
  list.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(15em,1fr));gap:2px 10px">' + T.map((t, i) => '<label class="ck" title="' + esc(t[1]) + '"><input type="checkbox" data-i="' + i + '">' + t[0] + '</label>').join('') + '</div>';
  const boxes = $$('input', list);
  boxes.forEach(b => b.addEventListener('change', go));
  btnRow($('#crBtns'), ['奥古斯都的拼法', '恺撒的拼法', '全部清空'], -1, i => {
    boxes.forEach((b, j) => b.checked = i === 0 ? T[j][8] : i === 1 ? [0, 1, 5, 10].includes(j) : false);
    go();
  });
  function go(){
    const on = boxes.filter(b => b.checked).map(b => T[+b.dataset.i]);
    const sum = AX.map((a, k) => Math.min(10, on.reduce((s, t) => s + t[2 + k], 0)));
    const vis = Math.min(10, on.reduce((s, t) => s + t[7], 0));
    $('#crBars').innerHTML = AX.map((a, k) => '<div class="row"><span class="nm">' + a[0] + '</span><span class="tr"><i style="width:' + sum[k] * 10 + '%;background:' + a[1] + '"></i></span><span class="v">' + sum[k] + ' / 10</span></div>').join('') +
      '<div class="row" style="margin-top:6px"><span class="nm"><b>像国王</b><small>扎眼程度</small></span><span class="tr"><i style="width:' + vis * 10 + '%;background:var(--red)"></i></span><span class="v">' + vis + ' / 10</span></div>';
    const power = sum.reduce((a, b) => a + b, 0), say = $('#crSay');
    const last = on.length ? on[on.length - 1] : null;
    let msg;
    if (!on.length) msg = '桌上的头衔一个也没拿。你是一个普通的元老，安全，也无足轻重。';
    else if (vis >= 8) msg = '<b>太扎眼了。</b>你的权力有 ' + power + ' 分，可在元老们眼里，你和一个国王已经没有分别。准备好过三月十五日吧。';
    else if (power >= 30 && vis <= 5) msg = '<b>拼成了。</b>兵、法、钱、神、名你都有了（' + power + ' 分），可每一块单独拿出来，共和国都有先例，看上去只有 ' + vis + ' 分像国王。这就是“第一公民”。';
    else if (sum[0] < 4) msg = '你有 ' + power + ' 分的权力，可<b>兵</b>不在你手里。名头再多，碰上一个带兵的将军，也只能听他的。';
    else msg = '你有 ' + power + ' 分的权力，扎眼程度 ' + vis + '。还差一点：试试把最扎眼的换成不扎眼的。';
    say.className = 'say ' + (vis >= 8 ? 'bad' : power >= 30 && vis <= 5 ? 'ok' : '');
    say.innerHTML = msg + (last ? '<br><small style="color:var(--ink-3)">' + last[0] + '：' + last[1] + '</small>' : '');
  }
  go();
});
