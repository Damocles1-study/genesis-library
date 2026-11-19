(function(){
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* ---------- 页眉：卷名、进度、目录 ---------- */
const barVol = $('#barVol'), prog = $('#prog');
const vols = $$('[data-vol]');
let tick = false;
function onScroll(){
  tick = false;
  const lim = innerHeight * 0.35; let cur = null;
  for (const e of vols) { if (e.getBoundingClientRect().top < lim) cur = e; else break; }
  barVol.textContent = cur ? cur.dataset.vol : '序';
  const H = document.documentElement.scrollHeight - innerHeight;
  prog.style.width = (H > 0 ? scrollY / H * 100 : 0) + '%';
}
window.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, {passive: true});
onScroll();
const drawer = $('#drawer');
$('#drawerList').innerHTML = $$('#toc a').map(a => '<li><a href="' + a.getAttribute('href') + '"><span class="n">' + $('.n', a).textContent + '</span><span>' + $('.t', a).innerHTML + '</span></a></li>').join('');
function openD(on){ drawer.classList.toggle('on', on); drawer.setAttribute('aria-hidden', on ? 'false' : 'true'); }
$('#tocBtn').addEventListener('click', () => openD(true));
drawer.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target.closest('a')) openD(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') openD(false); });
const toTop = $('#toTop'); if (toTop) toTop.addEventListener('click', e => { e.preventDefault(); scrollTo({top: 0, behavior: 'smooth'}); });

/* ---------- 人物线稿 ----------
   每个人物画在 100×100 的半身框里：头在上，肩膀到底边。
   fig(种类, {x, y, s, expr, flip, ink, paper, sweat, nomus}) 返回一段 SVG。 */
function fig(kind, o){
  const I = o.ink || 'var(--c-ink)', P = o.paper || 'var(--c-paper)';
  const W = 2.4, st = (w) => ' fill="none" stroke="' + I + '" stroke-width="' + (w || W) + '" stroke-linecap="round" stroke-linejoin="round"';
  const fp = ' fill="' + P + '" stroke="' + I + '" stroke-width="' + W + '" stroke-linejoin="round"';
  const e = o.expr || 'n';
  let g = '';
  // 身子：交领长衫
  g += '<path d="M12,101 C14,79 29,68 50,68 C71,68 86,79 88,101 Z"' + fp + '/>';
  g += '<path d="M41,69 L59,100 M59,69 L49.5,86"' + st(W * .8) + '/>';
  if (kind === 'mo') g += '<path d="M24,84 L24,101 M76,84 L76,101"' + st(W * .6) + '/>';
  g += '<path d="M44,55 L44,69 M56,55 L56,69"' + st() + '/>';
  // 耳朵
  g += '<path d="M32,40 q-6,0 -4,8 q1,3 5,2 M68,40 q6,0 4,8 q-1,3 -5,2"' + fp + '/>';
  if (kind === 'aj') {
    g += '<circle cx="50" cy="40" r="20"' + fp + '/>';
    g += '<path d="M30,41 C28,22 40,17 50,17 C60,17 72,22 70,41 C67,31 60,27 50,27 C41,27 33,31 30,41 Z" fill="' + I + '"/>';
    g += '<circle cx="50" cy="12" r="7" fill="' + I + '"/><path d="M44.5,17 L55.5,17" stroke="' + P + '" stroke-width="1.6"/>';
    const eyesN = '<ellipse cx="43" cy="42" rx="2.6" ry="3.4" fill="' + I + '"/><ellipse cx="57" cy="42" rx="2.6" ry="3.4" fill="' + I + '"/><circle cx="43.9" cy="40.9" r=".95" fill="' + P + '"/><circle cx="57.9" cy="40.9" r=".95" fill="' + P + '"/>';
    if (e === 'shock') {
      g += '<circle cx="43" cy="42" r="4.2"' + fp + '/><circle cx="57" cy="42" r="4.2"' + fp + '/><circle cx="43" cy="42" r="1.4" fill="' + I + '"/><circle cx="57" cy="42" r="1.4" fill="' + I + '"/>';
      g += '<path d="M38,32.5 q5,-3.5 9,-.5 M53,32 q4,-3 9,.5"' + st() + '/><ellipse cx="50" cy="52.5" rx="3.4" ry="4.4" fill="' + I + '"/>';
    } else if (e === 'happy') {
      g += '<path d="M39.5,43 q3.5,-4.5 7,0 M53.5,43 q3.5,-4.5 7,0"' + st() + '/><path d="M38.5,35 q4,-2 8,0 M53.5,35 q4,-2 8,0"' + st(W * .8) + '/><path d="M44,49 q6,8 12,0 Z" fill="' + I + '"/>';
    } else if (e === 'det') {
      g += eyesN + '<path d="M37.5,33.5 L47,36.5 M62.5,33.5 L53,36.5"' + st(W * 1.3) + '/><path d="M45,52.5 L55,52.5"' + st() + '/>';
    } else if (e === 'worry') {
      g += eyesN + '<path d="M38,36.5 L47,33.5 M62,36.5 L53,33.5"' + st() + '/><path d="M44.5,53 q2.75,-2.2 5.5,0 q2.75,2.2 5.5,0"' + st(W * .9) + '/>';
    } else {
      g += eyesN + '<path d="M39,35.5 q4,-2 8,0 M53,35.5 q4,-2 8,0"' + st(W * .9) + '/><path d="M46,51 q4,2.8 8,0"' + st() + '/>';
    }
  } else if (kind === 'mo') {
    g += '<ellipse cx="50" cy="41" rx="18" ry="21"' + fp + '/>';
    g += '<path d="M31,35 C31,15 69,15 69,35 Z" fill="' + I + '"/><path d="M50,16.5 L50,35 M40,19 L37,35 M60,19 L63,35" stroke="' + P + '" stroke-width="1.1"/><path d="M30,35.5 L70,35.5"' + st() + '/><circle cx="50" cy="14.5" r="3.2" fill="' + I + '"/>';
    g += '<path d="M50,44 q-2.2,5 1,6"' + st(W * .7) + '/>';
    if (e === 'stern') {
      g += '<circle cx="43" cy="43" r="1.9" fill="' + I + '"/><circle cx="57" cy="43" r="1.9" fill="' + I + '"/><path d="M37.5,38.5 L47.5,38.5 M52.5,38.5 L62.5,38.5"' + st(W * 1.1) + '/>';
    } else if (e === 'sly') {
      g += '<path d="M39,43 q4,-3.5 8,0"' + st() + '/><circle cx="57" cy="43" r="1.9" fill="' + I + '"/><path d="M37,38 q5,-3 10,-1 M52.5,36 q5,-2 10,1.5"' + st(W * 1.05) + '/>';
    } else {
      g += '<path d="M39,43 q4,-3.5 8,0 M53,43 q4,-3.5 8,0"' + st() + '/><path d="M37,38 q5,-3 10,-1 M53,37 q5,-2 10,1"' + st(W * 1.05) + '/><path d="M35.5,44.5 l-2.2,1.2 M64.5,44.5 l2.2,1.2"' + st(W * .6) + '/>';
    }
    g += '<path d="M41,55 C42,70 47,80 50,89 C53,80 58,70 59,55 C55,59 45,59 41,55 Z"' + fp + '/><path d="M46,61 q1,10 3,19 M54,61 q-1,10 -3,19"' + st(W * .55) + '/>';
    g += '<path d="M41,52.5 q4,-3 9,-1 q5,-2 9,1"' + st(W * 1.3) + '/>';
  } else { // dr：戴乌纱帽的官
    g += '<circle cx="50" cy="41" r="19"' + fp + '/>';
    g += '<path d="M40,25 C40,11 60,11 60,25 Z" fill="' + I + '"/><path d="M32.5,34 C32.5,21 67.5,21 67.5,34 Z" fill="' + I + '"/>';
    g += '<rect x="5" y="24.5" width="29" height="5" rx="2.5" fill="' + I + '"/><rect x="66" y="24.5" width="29" height="5" rx="2.5" fill="' + I + '"/>';
    g += '<path d="M50,44 q-2,4 1,5.5"' + st(W * .7) + '/>';
    if (e === 'shout') {
      g += '<circle cx="43" cy="42" r="2" fill="' + I + '"/><circle cx="57" cy="42" r="2" fill="' + I + '"/><path d="M37.5,35 L47,38.5 M62.5,35 L53,38.5"' + st(W * 1.4) + '/><path d="M43.5,52 q6.5,10 13,0 Z" fill="' + I + '"/>';
    } else if (e === 'eager') {
      g += '<ellipse cx="43" cy="42" rx="2.4" ry="3" fill="' + I + '"/><ellipse cx="57" cy="42" rx="2.4" ry="3" fill="' + I + '"/><circle cx="43.8" cy="41" r=".85" fill="' + P + '"/><circle cx="57.8" cy="41" r=".85" fill="' + P + '"/><path d="M38,35 q5,-3 9,-.5 M53,34.5 q4,-2.5 9,.5"' + st(W * 1.3) + '/><path d="M45,54 q5,4 10,0"' + st() + '/>';
    } else if (e === 'puzzled') {
      g += '<circle cx="43" cy="42" r="2" fill="' + I + '"/><circle cx="57" cy="42" r="2" fill="' + I + '"/><path d="M38,33.5 q5,-3.5 9,-.5 M53,37.5 L62,37.5"' + st(W * 1.3) + '/><circle cx="51" cy="55" r="1.8"' + st(W * .8) + '/>';
    } else {
      g += '<circle cx="43" cy="42" r="2" fill="' + I + '"/><circle cx="57" cy="42" r="2" fill="' + I + '"/><path d="M38,37 q5,-2 9,0 M53,37 q5,-2 9,0"' + st(W * 1.4) + '/><path d="M46,55 q4,2 8,0"' + st() + '/>';
    }
    if (!o.nomus) g += '<path d="M50,50 q-4,-2 -9,1 q-2,1 -4,-1 M50,50 q4,-2 9,1 q2,1 4,-1"' + st(W * .95) + '/>';
  }
  if (o.sweat) g += '<path d="M74,26 q-3.5,6 0,8 q3.5,-2 0,-8 Z"' + fp + '/>';
  const s = o.s || 1, x = o.x || 0, y = o.y || 0;
  const tf = o.flip ? 'translate(' + x + ',' + y + ') scale(' + (-s) + ',' + s + ') translate(-100,0)' : 'translate(' + x + ',' + y + ') scale(' + s + ')';
  return '<g transform="' + tf + '">' + g + '</g>';
}

// 小道具
const I0 = 'var(--c-ink)', P0 = 'var(--c-paper)';
const FP = ' fill="' + P0 + '" stroke="' + I0 + '" stroke-width="2.2" stroke-linejoin="round"';
const SK = (w) => ' fill="none" stroke="' + I0 + '" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round"';
function bucket(x, y, s){ s = s || 1; return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-14,0 L-11,22 L11,22 L14,0 Z"' + FP + '/><ellipse cx="0" cy="0" rx="14" ry="4"' + FP + '/><ellipse cx="0" cy="1" rx="10" ry="2.2" fill="' + I0 + '" opacity=".35"/><path d="M-12.5,9 L12.5,9 M-11.7,16 L11.7,16"' + SK(1) + '/></g>'; }
function drop(x, y, s){ s = s || 1; return '<path transform="translate(' + x + ',' + y + ') scale(' + s + ')" d="M0,0 q-3.6,6 0,8.5 q3.6,-2.5 0,-8.5 Z" fill="' + I0 + '"/>'; }
function fan(x, y, r, s){ return '<g transform="translate(' + x + ',' + y + ') rotate(' + (r || 0) + ') scale(' + (s || 1) + ')"><path d="M0,0 L-19,-31 A36,36 0 0 1 19,-31 Z"' + FP + '/><path d="M0,0 L-12,-34 M0,0 L-4,-35.5 M0,0 L4,-35.5 M0,0 L12,-34"' + SK(1) + '/><path d="M-13,-22 A26,26 0 0 1 13,-22"' + SK(1) + '/></g>'; }
function tone(id){ return '<defs><pattern id="' + id + '" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.05" fill="var(--c-tone)"/></pattern></defs>'; }
function speed(cx, cy, w, h, n, r0, seed){
  const R = rng(seed), L = Math.hypot(w, h);
  let p = '';
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, r = r0 + R() * r0 * .6, sw = .5 + R() * 2.2;
    p += '<path d="M' + (cx + Math.cos(a) * L).toFixed(1) + ',' + (cy + Math.sin(a) * L).toFixed(1) + ' L' + (cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1) + '"' + SK(sw.toFixed(2)) + '/>';
  }
  return p;
}
function rain(x0, y0, w, h, n, seed){ const R = rng(seed); let p = ''; for (let i = 0; i < n; i++) { const x = x0 + R() * w, y = y0 + R() * (h - 14); p += 'M' + x.toFixed(1) + ',' + y.toFixed(1) + ' l-4,13 '; } return '<path d="' + p + '"' + SK(1.1) + '/>'; }

/* ---------- 序：人物小像 ---------- */
$$('svg[data-char]').forEach(s => {
  const k = s.dataset.char;
  s.innerHTML = fig(k, {x: 0, y: 2, s: 1, expr: k === 'aj' ? 'happy' : k === 'dr' ? 'eager' : 'n', ink: 'var(--ink)', paper: 'var(--card)'});
});

/* ---------- 漫画《屋顶》 ---------- */
const PANELS = {
  1: () => {
    let h = tone('tn1');
    h += '<rect x="0" y="0" width="600" height="40" fill="url(#tn1)"/><path d="M0,40 L600,40"' + SK(3) + '/>';
    for (let x = 20; x < 600; x += 44) h += '<path d="M' + x + ',0 L' + x + ',40"' + SK(2) + '/>';
    h += '<path d="M232,40 l6,7 l-5,5 l7,6 M330,40 l-4,6 l6,6"' + SK(1.6) + '/>';
    h += '<rect x="20" y="62" width="104" height="128"' + FP + '/><path d="M72,62 L72,190 M20,126 L124,126"' + SK(2) + '/>' + rain(24, 66, 96, 120, 34, 11);
    h += '<path d="M0,226 L600,226"' + SK(2.4) + '/>';
    [[150, 198, .95], [190, 204, .9], [232, 198, 1], [276, 205, .85], [316, 199, .95], [352, 205, .85], [384, 200, .9]].forEach(b => h += bucket(b[0], b[1], b[2]));
    [[238, 62], [238, 100], [238, 150], [334, 70], [334, 118], [334, 160], [190, 120], [384, 92]].forEach(d => h += drop(d[0], d[1], 1.1));
    h += '<path d="M226,192 l-4,-6 M244,192 l4,-6 M322,193 l-4,-6 M346,193 l4,-6"' + SK(1.4) + '/>';
    h += fig('aj', {x: 402, y: 98, s: 1.32, expr: 'shock', sweat: 1});
    return h;
  },
  2: () => {
    let h = tone('tn2');
    h += '<path d="M150,0 L300,0 L300,230 L230,230 Z" fill="url(#tn2)" opacity=".7"/>';
    const R = rng(5); for (let i = 0; i < 9; i++) { const x = 175 + R() * 115, y = 15 + R() * 90, r = 4 + R() * 6; h += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '"' + FP + '/>'; }
    h += fig('mo', {x: 118, y: 44, s: 1.86, expr: 'n'});
    h += fan(150, 216, -28, 1.25);
    return h;
  },
  3: () => {
    let h = tone('tn3');
    h += '<rect x="0" y="0" width="300" height="104" fill="url(#tn3)" opacity=".45"/>';
    const ex = ['n', 'puzzled', 'n', 'eager', 'n'];
    [8, 63, 118, 173, 228].forEach((x, i) => h += fig('dr', {x: x, y: 108 + (i % 2) * 6, s: .62, expr: ex[i], nomus: i % 2}));
    h += '<path d="M12,170 L288,170 L300,230 L0,230 Z"' + FP + '/>';
    [[60, 182], [150, 186], [240, 182]].forEach(c => h += '<g transform="translate(' + c[0] + ',' + c[1] + ')"><path d="M-8,0 L-6,10 L6,10 L8,0 Z"' + FP + '/><path d="M-3,-4 q2,-4 0,-7 M3,-4 q2,-4 0,-7"' + SK(1) + '/></g>');
    h += '<rect x="96" y="196" width="40" height="26" transform="rotate(-6 116 209)"' + FP + '/><path d="M101,202 L130,199 M102,208 L131,205 M103,214 L124,212"' + SK(1) + '/>';
    return h;
  },
  4: () => {
    let h = tone('tn4');
    h += '<rect x="0" y="0" width="300" height="230" fill="url(#tn4)" opacity=".5"/>';
    h += speed(150, 150, 300, 230, 40, 70, 4);
    h += fig('dr', {x: 0, y: 112, s: 1.15, expr: 'shout'});
    h += fig('dr', {x: 186, y: 104, s: 1.15, expr: 'shout', flip: 1, nomus: 1});
    h += '<path d="M150,108 L140,138 L156,140 L144,172" fill="none" stroke="' + I0 + '" stroke-width="3.2" stroke-linejoin="miter"/>';
    return h;
  },
  5: () => {
    let h = '';
    h += '<path d="M120,128 L160,92 L186,112 L214,80 L250,118" ' + SK(1.3) + '/>';
    h += '<path d="M150,62 l5,4 l5,-4 M172,50 l4,3 l4,-3"' + SK(1.2) + '/>';
    // 名楼：飞檐
    h += '<path d="M206,170 L206,112 M274,170 L274,112 M240,170 L240,112"' + SK(2) + '/>';
    h += '<path d="M190,114 Q240,100 290,114 L296,104 Q240,92 184,104 Z"' + FP + '/><path d="M200,94 Q240,82 280,94 L286,84 Q240,70 194,84 Z"' + FP + '/><path d="M240,72 L240,62"' + SK(2) + '/>';
    h += '<path d="M180,170 L300,170"' + SK(2) + '/>';
    h += fig('mo', {x: 50, y: 84, s: 1.02, expr: 'n'});
    h += fan(138, 156, 32, .9);
    h += '<path d="M18,176 L262,176 L238,206 L44,206 Z"' + FP + '/><path d="M30,186 L250,186"' + SK(1.2) + '/>';
    for (let i = 0; i < 4; i++) { let p = ''; for (let x = 0; x <= 300; x += 10) p += (x ? ' Q' + (x - 5) + ',' + (212 + i * 6 + (x / 10 % 2 ? -3 : 3)) + ' ' : 'M') + x + ',' + (212 + i * 6); h += '<path d="' + p + '"' + SK(1.1) + '/>'; }
    return h;
  },
  6: () => {
    let h = tone('tn6');
    h += '<rect x="0" y="0" width="300" height="230" fill="url(#tn6)" opacity=".28"/>';
    const R = rng(9);
    for (let y = 222, i = 0; y > 36; y -= 6.5, i++) { const dx = (R() - .5) * 6; h += '<rect x="' + (160 + dx).toFixed(1) + '" y="' + y.toFixed(1) + '" width="84" height="6.5"' + FP + '/>'; }
    h += '<rect x="176" y="120" width="52" height="56"' + FP + '/><text x="202" y="141" text-anchor="middle" font-size="11" fill="' + I0 + '" style="font-family:var(--f-sans)">屋顶问题</text><text x="202" y="157" text-anchor="middle" font-size="11" fill="' + I0 + '" style="font-family:var(--f-sans)">初步报告</text><text x="202" y="170" text-anchor="middle" font-size="7.5" fill="' + I0 + '" style="font-family:var(--f-sans)">征求意见稿</text>';
    h += fig('aj', {x: 22, y: 116, s: 1.0, expr: 'worry', sweat: 1});
    [[140, 204, .85], [266, 206, .8], [287, 182, .65]].forEach(b => h += bucket(b[0], b[1], b[2]));
    [[140, 150], [266, 168], [287, 140]].forEach(d => h += drop(d[0], d[1], 1));
    return h;
  },
  7: () => {
    let h = '';
    h += '<rect x="112" y="24" width="76" height="92"' + FP + '/><path d="M150,24 L150,116 M112,70 L188,70"' + SK(2) + '/>' + rain(116, 28, 68, 84, 22, 7);
    h += bucket(150, 200, .9) + drop(150, 160, 1.1) + drop(150, 130, .9);
    h += fig('dr', {x: 0, y: 84, s: 1.32, expr: 'eager'});
    h += fig('mo', {x: 176, y: 110, s: 1.2, expr: 'n', flip: 1});
    return h;
  },
  8: () => {
    let h = tone('tn8');
    h += speed(310, 100, 600, 250, 70, 95, 8);
    h += fig('aj', {x: 246, y: 38, s: 1.24, expr: 'det'});
    h += '<path d="M338,128 Q366,112 380,86"' + SK(13) + '/><path d="M338,128 Q366,112 380,86" fill="none" stroke="' + P0 + '" stroke-width="8.5" stroke-linecap="round"/><circle cx="381" cy="84" r="6.5"' + FP + '/>';
    h += '<g transform="translate(381,84) rotate(28)"><path d="M0,0 L0,-34"' + SK(3.2) + '/><rect x="-11" y="-44" width="22" height="11" rx="2"' + FP + '/></g>';
    // 屋脊与瓦
    h += '<path d="M40,150 L560,150 L582,128 M40,150 L18,128"' + SK(3) + '/><path d="M40,150 L560,150 L600,250 L0,250 Z" fill="' + P0 + '" stroke="' + I0 + '" stroke-width="2.6"/>';
    h += '<rect x="40" y="146" width="520" height="10" fill="' + I0 + '"/>';
    for (let r = 0; r < 5; r++) { const y = 172 + r * 18, sp = 1 + r * .08; let p = ''; for (let x = 60 - r * 8; x < 560 + r * 8; x += 26 * sp) p += 'M' + x.toFixed(1) + ',' + y + ' q' + (13 * sp).toFixed(1) + ',8 ' + (26 * sp).toFixed(1) + ',0 '; h += '<path d="' + p + '"' + SK(1.6) + '/>'; }
    h += '<rect x="96" y="176" width="190" height="72" fill="url(#tn8)" opacity=".55"/>';
    h += bucket(176, 132, .95) + '<path d="M168,128 q8,-6 16,0"' + SK(1.4) + '/>';
    h += '<g transform="translate(430,120)"><path d="M0,30 L46,30 L46,22 L0,22 Z M3,22 L43,22 L43,14 L3,14 Z M6,14 L40,14 L40,6 L6,6 Z"' + FP + '/></g>';
    return h;
  },
  9: () => {
    let h = '';
    h += '<path d="M150,10 L120,24 M150,10 L280,24"' + SK(1.4) + '/><rect x="104" y="24" width="192" height="36"' + FP + '/><text x="200" y="47" text-anchor="middle" font-size="15" fill="' + I0 + '" style="font-family:var(--f-sans);font-weight:700">屋顶问题长效机制委员会</text>';
    h += '<rect x="470" y="84" width="88" height="110"' + FP + '/><path d="M514,84 L514,194 M470,139 L558,139"' + SK(2) + '/>';
    h += '<circle cx="536" cy="108" r="9"' + FP + '/><path d="M536,92 L536,96 M552,108 L548,108 M548,96 L545,99 M524,96 L527,99"' + SK(1.2) + '/>';
    h += '<path d="M0,232 L600,232"' + SK(2.4) + '/>';
    h += fig('aj', {x: 122, y: 104, s: 1.18, expr: 'shock', sweat: 1});
    h += fig('mo', {x: 304, y: 82, s: 1.32, expr: 'stern', flip: 1});
    h += '<g transform="translate(300,170) rotate(-10)"><rect x="0" y="0" width="44" height="56"' + FP + '/><path d="M7,10 L37,10 M7,18 L37,18 M7,26 L37,26 M7,34 L28,34"' + SK(1) + '/><circle cx="31" cy="46" r="6" fill="none" stroke="var(--zhu)" stroke-width="1.8"/></g>';
    return h;
  }
};
$$('svg[data-panel]').forEach(s => { const f = PANELS[s.dataset.panel]; if (f) s.innerHTML = f(); });

/* ---------- 序：呈文 ---------- */
(function(){
  const memo = $('#memo'), pi = $('#memoPi'), foot = $('#memoFoot'), btn = $('#memoBtn');
  const R = [
    ['是，大人。', '第一句。听上去是答应了。可屋顶没有人来修。'],
    ['此事需从长计议。', '“从长计议”，就是“不议了”。'],
    ['原则上同意。', '去掉“原则上”是同意；加上它，就是不同意。'],
    ['建议成立专门委员会研究。', '屋顶有了一个委员会。委员会没有屋顶。'],
    ['时机尚不成熟，容后再议。', '现在不是时候。什么时候是时候？不知道。'],
    ['知道了。', '“知道了”不是同意，也不是不同意，只是“我看过了”。']
  ];
  let k = 0;
  btn.addEventListener('click', () => {
    if (k >= R.length) { k = 0; memo.classList.remove('stamped'); pi.textContent = ''; foot.textContent = '呈文又送上去了。'; btn.textContent = '请师爷批示'; return; }
    pi.textContent = R[k][0]; foot.textContent = R[k][1]; k++;
    if (k === R.length) { memo.classList.add('stamped'); foot.textContent = '六句批复，没有一句是“不”，屋顶还在漏。这本书讲的就是这几句话。'; btn.textContent = '再送一次'; }
    else btn.textContent = '再催一次';
  });
})();

/* ---------- 装置 1：推一项新政 ---------- */
(function(){
  const ST = [
    {k: '等', say: '大人新到，千头万绪，钱粮、河工都在等着大人定夺。张榜这件事，是不是缓一缓，等上面有了明示再说？', o: [
      {t: '也好，先忙别的，过一阵子再说。', m: 6, r: '是，大人。（他在本子上记下：大人第一次提。）'},
      {t: '上面没说不许办。下月初一之前，你拿一份章程给我：谁贴、贴什么、贴在哪。', m: 1, adv: 1, r: '……是，大人。下官这就去拟。'},
      {t: '（拍桌子）我说办就办，哪来这么多理由！', m: 3, adv: 1, r: '大人的决心，下官钦佩。（他给你倒了杯茶。事情没有因此更快。）'}]},
    {k: '议', say: '章程拟好了。只是张榜一事牵涉户房、工房、刑房，按例须交各房会议，征求意见。', o: [
      {t: '好，那就开会，听听大家的意见。', m: 6, r: '是。第一次会议议定了会议的名称，第二次会议……还在约时间。'},
      {t: '意见可以收，限十日，书面交你汇总。逾期不交的，视为没有意见。', m: 1, adv: 1, r: '十日……是，大人。（第九天，各房陆续交来了“无意见”。）'},
      {t: '开什么会！本官一个人说了算。', m: 3, adv: 1, r: '是。只是各房日后若有怨言……（你听出了这句话后面的意思。）'}]},
    {k: '核', say: '各房提出，历年账目尚有几笔对不上。若贸然贴出去，被人挑出错来，反倒失信于民。是不是先把账核清楚？', o: [
      {t: '有道理，那就先把前三年的账都核一遍。', m: 9, r: '是。核账要去府里调档，府里说档案正在整理……'},
      {t: '先贴今年的。对不上的几笔标明“待核”，核清了再贴更正。', m: 1, adv: 1, r: '“待核”……这倒是没想到。是，大人。'},
      {t: '账有出入？那更说明要公开！', m: 2, adv: 1, r: '大人说得是。（他沉默了一会儿。这是谨慎的沉默。）'}]},
    {k: '请', say: '此事前所未有，本衙门从没贴过账。按例，须先报上峰核准。上峰公务繁忙，批复恐怕要些时日。', o: [
      {t: '那就报上去，等批复吧。', m: 9, r: '是。呈文已经送出。（它躺在上峰的抽屉里，和莫师爷的抽屉一样深。）'},
      {t: '把呈文给我，我明天亲自去见上峰，当面说。', m: 2, adv: 1, r: '大人亲自去？……是，大人。（上峰当面说了一句：“你看着办。”）'},
      {t: '上峰那里，你替我去说说。', m: 5, r: '是，大人。（球又回到了他手里。他说会“找个合适的时机”。）'}]},
    {k: '换', say: '大人，恕下官直言：大人任期已过大半。这件事开了头，万一做不完、留给后任，反倒不美。不如……', o: [
      {t: '你说得也对，留给后任吧。', m: 0, lose: 1, r: '大人深谋远虑。（他把呈文放回了抽屉最下面一格。）'},
      {t: '正因为任期不多了，明天就贴。贴出去就收不回来，后任也只能接着贴。', m: 1, win: 1, r: '……是，大人。'},
      {t: '本官会连任的，不必担心后任。', m: 6, back: 1, r: '那是自然。只是连任之前，还有几件要紧事……（他翻开了“等”那一页。）'}]}
  ];
  const T = 36;
  const cal = $('#stCal'), stage = $('#stStage'), say = $('#stSay'), opts = $('#stOpts'), end = $('#stEnd'), log = $('#stLog'), mon = $('#stMon');
  let S;
  function L(cls, t){ log.insertAdjacentHTML('afterbegin', '<div class="' + cls + '">' + t + '</div>'); }
  function draw(){
    let c = ''; for (let i = 0; i < 12; i++) c += '<i class="' + (i === 11 ? 'elec ' : '') + (S.m >= (i + 1) * 3 ? 'used' : '') + '"></i>';
    cal.innerHTML = c;
    mon.textContent = '已过 ' + Math.min(S.m, T) + ' 个月 / ' + T + ' 个月（红格是任满）';
    stage.innerHTML = ST.map((s, i) => '<span class="' + (i < S.st ? 'done' : i === S.st && !S.over ? 'on' : '') + '">' + (i + 1) + ' · ' + s.k + '</span>').join('');
    if (S.over) { say.innerHTML = ''; opts.innerHTML = ''; return; }
    const s = ST[S.st];
    say.innerHTML = '<b>莫师爷 · 第' + '一二三四五'[S.st] + '步“' + s.k + '”</b>' + s.say;
    opts.innerHTML = '';
    shuffle(s.o).forEach(o => { const b = document.createElement('button'); b.textContent = o.t; b.addEventListener('click', () => pick(o)); opts.appendChild(b); });
  }
  function finish(win, why){
    S.over = true; end.hidden = false;
    end.innerHTML = win
      ? '<b>第 ' + S.m + ' 个月，榜贴出来了。</b>百姓围着看了三天，有人指着一笔“修缮屋顶银五两”问：这屋顶不是还漏吗？莫师爷什么也没说，这是勇敢的沉默。<br>你赢在：每一步都把“尽快”换成了一个<em>日子</em>、一个<em>人</em>、一个<em>办法</em>，最后造成了收不回来的事实。'
      : '<b>' + why + '</b>新大人到任。莫师爷把你的呈文放进了抽屉最下面一格，和前任们的二十几份放在一起。<br>复盘一下：拖字诀最怕三样东西，<em>具体的日子、具体的人、自己跑腿</em>。“等批复”“先开会”“全核一遍”都很有道理，也都很花时间。';
    draw();
  }
  function pick(o){
    const s = ST[S.st];
    L('me', '大人：' + o.t); L('ms', '莫师爷：' + o.r);
    S.m += o.m;
    if (o.win) { draw(); return finish(true); }
    if (o.lose) { draw(); return finish(false, '你把它留给了后任。'); }
    if (S.m >= T) { S.m = T; draw(); return finish(false, '三年到了。'); }
    if (o.back) { S.st = 0; L('sys', '（回到第一步“等”。又过了 ' + o.m + ' 个月。）'); }
    else if (o.adv) { S.st++; L('sys', '（拖字诀“' + s.k + '”被破。用了 ' + o.m + ' 个月。）'); }
    else L('sys', '（还在“' + s.k + '”。又过了 ' + o.m + ' 个月。他会换个说法再来一遍。）');
    draw();
  }
  function reset(){ S = {m: 0, st: 0, over: false}; end.hidden = true; log.innerHTML = ''; L('sys', '你上任了。任期三年。'); draw(); }
  $('#stReset').addEventListener('click', reset);
  reset();
})();

/* ---------- 装置 2：委员会的线 ---------- */
(function(){
  const svg = $('#cmtSvg'), inp = $('#cmtN'), out = $('#cmtNo'), txt = $('#cmtTxt');
  function draw(){
    const n = +inp.value, R = 118, cx = 150, cy = 150;
    const pts = []; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i / n * Math.PI * 2; pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
    let h = '';
    const op = n > 14 ? .28 : n > 8 ? .45 : .7;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) h += '<line x1="' + pts[i][0].toFixed(1) + '" y1="' + pts[i][1].toFixed(1) + '" x2="' + pts[j][0].toFixed(1) + '" y2="' + pts[j][1].toFixed(1) + '" stroke="var(--lan)" stroke-width="1" opacity="' + op + '"/>';
    const r = n > 16 ? 6 : 9;
    pts.forEach(p => h += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + r + '" fill="var(--card)" stroke="var(--ink)" stroke-width="2"/>');
    svg.innerHTML = h;
    const L = n * (n - 1) / 2;
    out.textContent = n + ' 人';
    let c;
    if (n <= 3) c = '三个人以内，几乎不用开会，吃饭时就聊完了。';
    else if (n <= 6) c = '还能围一张桌子。开始需要有人记一下“谁负责什么”。';
    else if (n <= 9) c = '需要会议纪要了。每次开会，总有一两个人没跟上上次的进度。';
    else if (n <= 15) c = '开始出现“会前会”：几个人先私下商量好，再上会走个过场。';
    else if (n <= 19) c = '需要成立一个小组，来协调各个小组。';
    else c = '帕金森说，到这个人数，委员会基本办不成事了。真正的决定，会在会前由三四个人做好。';
    txt.innerHTML = n + ' 个人，两两之间共有 <b>' + L + '</b> 条线。<br>如果改成每个人只跟一个负责人沟通（星形），只要 <b>' + (n - 1) + '</b> 条。<br>' + c;
  }
  inp.addEventListener('input', draw);
  draw();
})();

/* ---------- 装置 3：官话翻译机 ---------- */
(function(){
  const D = [
    ['衙门', '原则上同意。', '不同意，但不想由我说出口。'],
    ['衙门', '研究研究。', '等你忘了。'],
    ['衙门', '从长计议。', '不议了。'],
    ['衙门', '请进一步完善后再报。', '改十遍也不批，除非风向变了。'],
    ['衙门', '此事关系重大。', '谁也不想在上面签字。'],
    ['衙门', '有关部门正在处理。', '不知道是谁在处理，或者知道但不能说。'],
    ['衙门', '知道了。', '我看过了。仅此而已。'],
    ['白厅', '您这样做，非常勇敢。', '这会断送你的前程。'],
    ['白厅', '这个提法很有新意。', '从来没人这么干过，因为这么干不行。'],
    ['白厅', '我们必须谨慎从事。', '我们不打算干。'],
    ['白厅', '恕我直言……', '接下来我要说你很蠢了。'],
    ['公司', '我们要优化一下团队结构。', '要裁员了。'],
    ['公司', '这个需求我们排一下期。', '不做。'],
    ['公司', '我们再对齐一下。', '你按我说的改。'],
    ['公司', '这是一个很好的学习机会。', '这活没人想干，也没有钱。'],
    ['日常', '下次一定。', '没有下次。'],
    ['日常', '改天请你吃饭。', '这顿饭会永远活在“改天”里。'],
    ['日常', '都行，你定。', '你定。但定得不好，我会不高兴。'],
    ['日常', '我考虑一下。', '我需要一个体面的方式说“不”。'],
    ['日常', '在弄了在弄了。', '还没开始。']
  ];
  const F = $('#dictF'), G = $('#dictG'), N = $('#dictN');
  const cats = ['全部', '衙门', '白厅', '公司', '日常'];
  let cur = '全部';
  F.innerHTML = cats.map(c => '<button class="btn' + (c === cur ? ' on' : '') + '" data-c="' + c + '">' + c + '</button>').join('');
  function draw(){
    const L = D.filter(d => cur === '全部' || d[0] === cur);
    G.innerHTML = L.map(d => '<button aria-pressed="false"><span class="o">“' + d[1] + '”</span><span class="src">' + d[0] + (d[0] === '白厅' ? ' · 化用自《是，大臣》系列的意思' : '') + '</span><span class="tr">' + d[2] + '</span></button>').join('');
    N.textContent = '共 ' + L.length + ' 句。点开的越多，你越难再被它们骗到。';
  }
  F.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; cur = b.dataset.c; $$('[data-c]', F).forEach(x => x.classList.toggle('on', x === b)); draw(); });
  G.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  draw();
})();

/* ---------- 装置 4：民调工厂 ---------- */
(function(){
  const Q = [
    ['您是否希望知道自己交的税花在了哪里？', 14],
    ['您是否认为官府应当对百姓负责？', 10],
    ['您是否听说过，有些衙门的账目不清不楚？', 9],
    ['您是否觉得，账目公开了，当官的会更谨慎？', 12],
    ['您是否担心账目被别有用心的人拿去做文章？', -13],
    ['您是否觉得衙门应当把精力放在办实事上，而不是贴告示？', -15],
    ['您是否觉得一大张账目，大多数人其实看不懂？', -10],
    ['您是否担心公开之后，衙门办事会更加缩手缩脚？', -11],
    ['您今年多大年纪？', 0]
  ];
  const box = $('#pollQs'), slot = $('#pollSlot'), msg = $('#pollMsg'), M = $('#pollMode');
  let mode = 'yes', picked = [];
  const order = shuffle(Q.map((q, i) => i));
  function draw(){
    box.innerHTML = order.map(i => '<button data-i="' + i + '" class="' + (picked.includes(i) ? 'pick' : '') + '">' + Q[i][0] + '</button>').join('');
    slot.innerHTML = picked.length ? '你的问卷：' + picked.map((i, k) => '<span>' + (k + 1) + '. ' + Q[i][0].replace(/^您/, '').slice(0, 12) + '…</span>').join('') + '<span>' + (picked.length + 1) + '. 支持张榜公示吗？</span>' : '你的问卷：（还没选铺垫问题，直接问最后一题）';
    let y = 52 + picked.reduce((a, i) => a + Q[i][1], 0);
    y = Math.max(6, Math.min(94, y));
    $('#pollY').style.width = y + '%'; $('#pollN').style.width = (100 - y) + '%';
    $('#pollYo').textContent = y + '%'; $('#pollNo').textContent = (100 - y) + '%';
    const ok = mode === 'yes' ? y >= 75 : y <= 25;
    if (ok) msg.innerHTML = '成了。明天的告示上会写：<b>“最新民调：百姓 ' + (mode === 'yes' ? y + '% 支持' : (100 - y) + '% 反对') + '张榜公示。”</b>只公布最后一题。没有人会知道前面问了什么。同一群人，同一天，同一个问题。';
    else if (picked.length >= 3) msg.innerHTML = '三个铺垫用完了，还没到你要的结果。看看哪一题在帮倒忙？';
    else msg.innerHTML = '目标：' + (mode === 'yes' ? '支持率到 75% 以上' : '反对率到 75% 以上') + '。还能选 ' + (3 - picked.length) + ' 题。';
  }
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-i]'); if (!b) return; const i = +b.dataset.i;
    if (picked.includes(i)) picked = picked.filter(x => x !== i);
    else if (picked.length < 3) picked.push(i);
    draw();
  });
  M.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; mode = b.dataset.m; $$('[data-m]', M).forEach(x => x.classList.toggle('on', x === b)); picked = []; draw(); });
  $('#pollReset').addEventListener('click', () => { picked = []; draw(); });
  draw();
})();

/* ---------- 装置 5：识破它 ---------- */
(function(){
  const K = ['拖字诀', '委员会', '官话', '诱导提问'];
  const Q = [
    ['小组作业，离截止还有三天。你问负责做 PPT 的队友进展如何，他说：“在弄了在弄了，我先把资料再找全一点。”', 0, '典型的“核”：资料永远找不全。应对：别问“做得怎么样”，问“今晚能先发前三页吗”。'],
    ['社团要换活动场地。社长说：“这事牵涉面广，我们拉个群，大家都说说意见。”两周后，群里还在讨论海报用什么颜色。', 1, '把一个问题换成一个群，又在最好聊的小事上花掉了所有时间：委员会加自行车棚。应对：“我先按 A 方案定，明晚之前没人反对就这么办。”'],
    ['实习公司发了封全员邮件：“为进一步提升组织效能，公司将对部分团队结构进行优化。”', 2, '没有主语、名词代替动词、大词套坏事。翻译：要裁员了。'],
    ['奶茶店店员把平板递过来：“您对今天的服务很满意吧？满意的话点个五星哦！”', 3, '答案已经藏在问题里了（“很满意吧”）。这样收来的五星，和王莽的四十八万封上书，是同一种民意。'],
    ['你提议宿舍周末来一次大扫除。室友们都说好主意，“不过这周大家都忙，等期中考完再说吧”。期中考完，变成了“等期末考完”。', 0, '“等”和“换”：每次都有理由，结论永远是“下次”。应对：定一个日子，再把第一步缩小到十分钟，“周六上午十点，每人只管自己的桌子”。'],
    ['班委发问卷：“1. 你希望班级活动更加丰富多彩吗？2. 你愿意为班级建设出一份力吗？3. 你同意每人交五十元班费吗？”', 3, '两个让人点头的铺垫，再问真正想问的。和汉弗莱给伯纳德的那套问题，结构一模一样。'],
    ['你问老师能不能晚两天交作业。老师回复：“原则上不行。你先把情况写清楚发给我。”', 2, '“原则上”是官话里最会变的词：“原则上同意”多半是不同意，“原则上不行”反倒常常有商量的余地。认真写清楚情况，可能就行了。'],
    ['学生会讨论今年晚会的两万元总预算，十分钟就通过了；接着为茶歇买哪种饼干争了一个小时。', 1, '帕金森的“自行车棚”：大事没几个人懂，所以很快通过；小事人人都懂，所以吵个没完。应对：开会前就写明这次只决定哪一件事。']
  ];
  const card = $('#qzCard'), sc = $('#qzScore'), bP = $('#qzPrev'), bN = $('#qzNext');
  const ans = new Array(Q.length).fill(null);
  let k = 0;
  function draw(){
    const q = Q[k], a = ans[k];
    card.innerHTML = '<div class="qn">第 ' + (k + 1) + ' / ' + Q.length + ' 题</div><p class="qt">' + q[0] + '</p><div class="opts">' + K.map((t, i) => '<button data-i="' + i + '" class="' + (a === null ? '' : i === q[1] ? 'ok' : i === a ? 'bad' : '') + '"' + (a === null ? '' : ' disabled') + '>' + t + '</button>').join('') + '</div><p class="ex">' + (a === null ? '' : (a === q[1] ? '<b>对。</b>' : '<b>更像是“' + K[q[1]] + '”。</b>') + q[2]) + '</p>';
    const done = ans.filter(x => x !== null).length, right = ans.filter((x, i) => x === Q[i][1]).length;
    sc.textContent = '已答 ' + done + ' / ' + Q.length + ' · 答对 ' + right + (done === Q.length ? (right >= 7 ? ' · 莫师爷看了你一眼，有点不安。' : right >= 5 ? ' · 阿鉴说：比我强。' : ' · 没关系，莫师爷说他也是看了几十年才看明白的。') : '');
    bP.disabled = k === 0; bN.disabled = k === Q.length - 1;
  }
  card.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (!b || ans[k] !== null) return; ans[k] = +b.dataset.i; draw(); });
  bP.addEventListener('click', () => { if (k > 0) { k--; draw(); } });
  bN.addEventListener('click', () => { if (k < Q.length - 1) { k++; draw(); } });
  draw();
})();

})();
