/* ---------- 装置 13：红灯还是绿灯 ---------- */
dev('#redFig', fig => {
  const box = $('#redQs'), say = $('#redSay');
  const OPT = ['可以做', '别做', '先弄清规定'];
  // [情境, 答案序号, 理由]
  const Q = [
    ['朋友说借你的银行卡“走几天流水”，你不用操作，给你五百块。', 1, '这是帮信罪最常见的样子。即使没被判刑，账户也可能五年不能用手机支付和网上转账。'],
    ['用 AI 帮学校周边的小店写菜单文案和活动海报，按次收费。', 0, '正常的服务。东西要自己看过，别用别人的商标和明星的脸。'],
    ['同学出八百块，让你用 AI 替他写毕业论文。', 1, '《学位法》规定利用人工智能代写属于学术不端，可以不授予或撤销学位；替人代写的在校生同样可能受处分。'],
    ['写一个爬虫，把某个平台上商家的手机号抓下来，卖给做推广的人。', 1, '抓取、出售个人信息可能构成侵犯公民个人信息罪；绕过防护抓数据还可能构成非法获取计算机信息系统数据罪。'],
    ['买几个境外大模型的账号，自己搭个网站，转卖给国内用户使用。', 1, '私自搭建跨境通道、转卖服务，会碰到网络管理、数据出境和生成式 AI 服务备案方面的规定，风险高、说不清。'],
    ['给自己的网店刷几十条好评，让新店看起来热闹一点。', 1, '《电子商务法》禁止编造用户评价，平台查到会降权、扣保证金甚至封店。'],
    ['用 AI 生成一位明星的脸和声音，给一家店拍带货视频。', 1, '没有授权，侵犯肖像权和声音权益；合成内容还要按规定标识。'],
    ['做一个 AI 画图小工具，对全网开放、按次收费。', 2, '向公众提供生成式 AI 服务有安全评估、备案和内容标识的要求；收钱还需要合适的经营主体和支付渠道。先弄清楚再上线。'],
    ['在二手平台上卖掉自己用过的旧显卡。', 0, '个人卖自己的闲置物品是正常的。如实描述成色，别卖来路不明的东西。'],
    ['花一千九百八十元报名“AI 副业训练营”，号称二十一天月入过万、不回本全退。', 1, '一般不违法，但多半是坑。看清退款条件，问一句：老师的钱是靠做这件事赚的，还是靠教这件事赚的？'],
    ['用 AI 帮人改简历、做求职用的 PPT，收几十块。', 0, '正常的服务。别编造对方的经历。'],
    ['你考上了事业编，晚上给朋友的公司写代码，按月拿报酬。', 2, '多数事业单位不允许违规兼职取酬，有的岗位可以按规定兼职。先看单位的规定，问清楚再说（第十三章）。']
  ];
  const ans = Q.map(() => null);
  box.innerHTML = Q.map((q, i) => '<div class="qa" data-i="' + i + '"><p style="margin:.6em 0 .2em;text-indent:0"><b>' + (i + 1) + '.</b> ' + q[0] + '</p><div class="btns">' + OPT.map((o, j) => '<button class="btn" data-j="' + j + '">' + o + '</button>').join('') + '</div><p class="why" style="display:none;margin:.3em 0 .6em;font-size:14.5px;color:var(--ink-2);text-indent:0"></p></div>').join('');
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const wrap = b.closest('.qa'), i = +wrap.dataset.i, j = +b.dataset.j;
    ans[i] = j;
    $$('button', wrap).forEach(x => { const k = +x.dataset.j; x.classList.toggle('on', k === j); x.style.borderColor = k === Q[i][1] ? 'var(--ter)' : (k === j ? 'var(--main)' : ''); });
    const w = $('.why', wrap); w.style.display = 'block';
    w.innerHTML = (j === Q[i][1] ? '<b class="pos">对。</b>' : '<b class="neg">答案是“' + OPT[Q[i][1]] + '”。</b>') + Q[i][2];
    const done = ans.filter(a => a != null).length, right = ans.filter((a, k) => a === Q[k][1]).length;
    say.textContent = done < Q.length ? '已答 ' + done + ' 题，答对 ' + right + ' 题。' : '十二题答对 ' + right + ' 题。' + (right >= 10 ? '你对坑的嗅觉不错。最危险的那几个，都长着“只赚不亏的小钱”的样子。' : '没关系，记住最要紧的一条：钱从哪里来、为什么给你，说不清的不碰。');
  });
});
