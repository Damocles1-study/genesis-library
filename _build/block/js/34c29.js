
/* ---------- 第二十九章：服务器设置 server.properties ---------- */
dev('#propFig', () => {
  /* [键, 中文, 选项[], 默认序号, 每个选项的解释[], 危险的选项序号] */
  const K = [
    ['white-list', '白名单', ['true', 'false'], 0, ['只有你写进名单的人才能进来。自己家开服，一定要开。', '谁知道地址都能进来。'], 1],
    ['online-mode', '正版验证', ['true', 'false'], 0, ['每个进来的人都要用真的账号登录，别人冒充不了你。', '不验证账号：任何人都能随便起个名字进来，甚至冒充你。'], 1],
    ['max-players', '最多几个人', ['3', '5', '10', '20'], 0, ['自己和两个朋友，8 GB 的电脑够用。', '五个人，电脑会忙一些。', '十个人，这台电脑会很吃力。', '二十个人，别在这台电脑上试。'], 3],
    ['difficulty', '难度', ['peaceful', 'easy', 'normal', 'hard'], 1, ['和平：没有怪物，适合一起盖房子。', '简单。', '普通。', '困难：饿了会饿死，怪物很凶。'], -1],
    ['gamemode', '模式', ['survival', 'creative'], 1, ['生存。', '创造：适合一起搭东西、测试数据包。'], -1],
    ['pvp', '玩家互相打', ['false', 'true'], 0, ['朋友之间不能互相伤害，少吵架。', '可以互相打。先说好规矩。'], -1],
    ['view-distance', '视野距离', ['6', '10', '16'], 0, ['6 个区块：电脑轻松（第十七章）。', '10 个区块。', '16 个区块：这台电脑会很累。'], 2]
  ];
  const st = K.map(k => k[3]);
  const box = $('#propCtl');
  box.innerHTML = K.map((k, i) => '<div class="pf"><div class="lab">' + k[1] + '（<code>' + k[0] + '</code>）</div><div class="btns" data-i="' + i + '">' + k[2].map((o, j) => '<button class="btn" data-j="' + j + '">' + o + '</button>').join('') + '</div></div>').join('');
  function draw(){
    K.forEach((k, i) => $$('[data-i="' + i + '"] button', box).forEach((b, j) => b.classList.toggle('on', st[i] === j)));
    $('#propFile').textContent = '# server.properties 里的几行（其余保持默认）\nmotd=小格的工坊\n' + K.map((k, i) => k[0] + '=' + k[2][st[i]]).join('\n');
    const warn = K.filter((k, i) => k[5] === st[i]);
    $('#propSay').innerHTML = K.map((k, i) => '<b>' + k[1] + '</b>：' + k[4][st[i]]).join(' ') + (warn.length ? '<br><b style="color:var(--zhu)">要小心：</b>' + warn.map(k => k[1]).join('、') + '。' : '<br>这一套设置适合在家里和熟人一起玩。');
    $('#propSay').className = 'say ' + (warn.length ? 'bad' : 'ok');
  }
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st[+b.parentNode.dataset.i] = +b.dataset.j; draw(); });
  draw();
});
