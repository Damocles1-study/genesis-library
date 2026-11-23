/* ---------- 装置 10：一路加价 ---------- */
dev('#ppFig', () => {
  /* 站：[名字, 是否收埃及关税] */
  const OLD = [['马拉巴尔的农民', 0], ['卡利卡特港商', 0], ['阿拉伯船主', 0], ['红海转运', 0], ['开罗与亚历山大', 1], ['威尼斯批发', 0], ['德意志、法、英商人', 0], ['贵族的厨房', 0]];
  const CAPE = [['马拉巴尔的农民', 0], ['葡萄牙代理商', 0], ['绕好望角的船', 0], ['里斯本王室商行', 0], ['安特卫普批发', 0], ['贵族的厨房', 0]];
  let route = 0;
  btnRow($('#ppRoute'), ['经红海和威尼斯（约 1450）', '绕好望角（约 1520）'], 0, i => { route = i; draw(); });
  const M = slider('ppM', v => v + '%', () => draw());
  const T = slider('ppT', v => v + '%', () => draw());
  const L = slider('ppL', v => v + '%', () => draw());
  function chain(r){
    const st = r ? CAPE : OLD, m = M() / 100, t = T() / 100, loss = L() / 100;
    let p = 1; const out = [[st[0][0], 1]];
    for (let i = 1; i < st.length; i++) {
      const legLoss = r === 1 && i === 2 ? loss * 2.2 : loss / (st.length - 1) * 1.6; // 绕非洲那一段最险
      const mm = r === 1 && i === 2 ? m * 2.5 : m;                                      // 远洋运费更贵
      p = p * (1 + mm) / Math.max(0.2, 1 - legLoss);
      if (st[i][1]) p *= 1 + t;
      out.push([st[i][0], p]);
    }
    return out;
  }
  function draw(){
    const a = chain(route), other = chain(1 - route);
    const fin = a[a.length - 1][1], fo = other[other.length - 1][1];
    bars($('#ppBars'), a.map((x, i) => [x[0], x[1], '', i === a.length - 1 ? 'var(--main)' : 'var(--och)']), Math.max(fin, fo), v => v.toFixed(v < 10 ? 1 : 0) + ' 倍');
    $('#ppSay').innerHTML = '到了贵族的厨房，这斤胡椒是产地价的 <b>' + fin.toFixed(1) + ' 倍</b>；换另一条路是 ' + fo.toFixed(1) + ' 倍。' +
      (route === 1 ? (fin < fo ? '绕好望角虽然路远、风险大，但甩掉了三四层中间人和埃及的关税，<b>还是更便宜</b>。这就是葡萄牙人拼命开辟航路的账。' : '这样设定下，绕远路反而更贵：远洋的损耗和运费吃掉了省下的中间环节。历史上，红海那条路在十六世纪也没有完全断掉，两条路竞争了好几十年。') :
      (T() >= 40 ? '埃及的关税一高，整条路的价钱都跟着涨。马穆鲁克苏丹和威尼斯人坐收其利，欧洲其他国家就想找别的路。' : '路上每多一个人，价钱就多乘一次。这不是谁特别贪心，是路太长。'));
  }
  draw();
});
