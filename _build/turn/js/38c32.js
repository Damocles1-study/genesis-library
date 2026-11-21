/* ---------- 装置 33：收成坏了，税不减 ---------- */
dev('#bengalFig', fig => {
  const H = $('#bgH'), Tx = $('#bgT');
  let mode = 0;
  btnRow($('#bgMode'), ['照常收（1770 年的做法）', '按收成减免', '减免 + 禁止囤积'], 0, i => { mode = i; go(); });
  H.addEventListener('input', go); Tx.addEventListener('input', go);
  const NEED = 52, SEED = 8;   // 一百户一年的口粮、种子（以正常年景的收成 = 100 计）
  const bar = (nm, sub, v, max, c, lab) => '<div class="row"><span class="nm">' + nm + (sub ? '<small>' + sub + '</small>' : '') + '</span><span class="tr"><i style="width:' + clamp(v / max * 100, 0, 100) + '%;background:' + c + '"></i></span><span class="v">' + lab + '</span></div>';
  function go(){
    const h = +H.value, t = +Tx.value;
    $('#bgHo').textContent = h + '%'; $('#bgTo').textContent = t;
    const tax = mode === 0 ? t : t * Math.min(1, h / 100);
    const hoard = mode === 2 ? 0 : h < 80 ? (80 - h) * 0.15 : 0;      // 歉收时被囤积、抬价吃掉的口粮（示意）
    const food = Math.max(0, h - tax - SEED - hoard);
    const def = Math.max(0, (NEED - food) / NEED);
    const mort = clamp(0.38 * Math.pow(def, 1.3), 0, 0.5);
    const got = mode === 0 ? Math.min(t, h - SEED * .5) : tax;          // 照常收时，连种子也要卖掉一部分来交税
    $('#bgBars').innerHTML =
      bar('收成', '正常年景 = 100', h, 110, 'var(--grn)', h) +
      bar('交税', mode === 0 ? '数目不变' : '跟着收成减', got, 110, 'var(--och)', Math.round(got)) +
      bar('种子', '明年还要种', SEED, 110, 'var(--ink-3)', SEED) +
      bar('囤积抬价', '粮商和公司代理人', hoard, 110, 'var(--ter)', Math.round(hoard)) +
      bar('剩下的口粮', '够吃要 ' + NEED, food, 110, food >= NEED ? 'var(--main)' : 'var(--red)', Math.round(food));
    kv($('#bgKV'), [['口粮缺口', Math.round(def * 100) + '%'], ['可能饿死（示意）', Math.round(mort * 100) + ' 人 / 每百人'], ['公司收到', Math.round(got) + '（正常 ' + t + '）']]);
    const say = $('#bgSay');
    say.className = 'say' + (mort > .15 ? ' bad' : mort < .02 ? ' ok' : '');
    say.innerHTML = h >= 90 ? '好年景。交完税、留够种子，村里勉强够吃。孟加拉的田赋本来就重，好年景也没有多少余粮。'
      : mode === 0 ? '收成只有 ' + h + '%，税一点不少。要交税，就得卖粮，甚至卖种子。剩下的口粮差了 ' + Math.round(def * 100) + '%。<b>公司的账本上，这一年的收入一切正常。</b>'
      : mode === 1 ? '税跟着收成减了，村里多留下了 ' + Math.round(t - tax) + ' 份粮。还是不够，可饿死的人少了很多。公司这一年的收入少了。'
      : '减了税，又不许囤积抬价。灾年还是灾年，但死亡被压到了最低。这需要有人愿意为孟加拉的农民少赚一点钱。';
  }
  go();
});
