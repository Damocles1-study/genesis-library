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
function wok(x, y, s, r){ return '<g transform="translate(' + x + ',' + y + ') rotate(' + (r || 0) + ') scale(' + (s || 1) + ')"><path d="M-40,0 Q-37,31 0,33 Q37,31 40,0 Z" fill="' + I0 + '" stroke="' + I0 + '" stroke-width="2"/><path d="M-26,12 Q-14,24 4,25" fill="none" stroke="' + P0 + '" stroke-width="2.2" stroke-linecap="round" opacity=".75"/><ellipse cx="0" cy="0" rx="40" ry="7"' + FP + '/><ellipse cx="0" cy="1" rx="33" ry="4.4" fill="' + I0 + '" opacity=".22"/><path d="M-40,1 q-11,-3 -13,6 M40,1 q11,-3 13,6"' + SK(3) + '/></g>'; }
Object.assign(PANELS, {
  g1: () => {
    let h = rain(0, 0, 300, 230, 46, 21);
    h += '<path d="M0,196 Q40,186 80,196 T160,196 T240,196 T320,196 L300,230 L0,230 Z" fill="' + I0 + '" opacity=".18"/>';
    h += fig('dr', {x: 30, y: 84, s: 1.42, expr: 'n'});
    h += wok(232, 150, 1.05, -10);
    return h;
  },
  g2: () => {
    let h = tone('tng2') + '<rect x="0" y="0" width="300" height="230" fill="url(#tng2)" opacity=".3"/>';
    h += fig('dr', {x: -14, y: 96, s: 1.25, expr: 'n'});
    h += fig('dr', {x: 168, y: 106, s: 1.2, expr: 'puzzled', flip: 1, nomus: 1, sweat: 1});
    h += wok(170, 196, .95, 6) + '<path d="M150,150 q10,-12 22,-4 M196,152 q-6,-14 -18,-10"' + SK(1.6) + '/>';
    return h;
  },
  g3: () => {
    let h = '';
    h += fig('dr', {x: -6, y: 104, s: 1.12, expr: 'puzzled', nomus: 1});
    h += wok(78, 200, .85, -4);
    h += fig('mo', {x: 178, y: 98, s: 1.18, expr: 'sly', flip: 1});
    h += fan(178, 186, -52, .95);
    h += '<path d="M150,150 L118,168" ' + SK(1.6) + '/><path d="M118,168 l9,-1 m-9,1 l4,-8"' + SK(1.6) + '/>';
    return h;
  },
  g4: () => {
    let h = tone('tng4') + '<rect x="0" y="0" width="300" height="230" fill="url(#tng4)" opacity=".35"/>';
    for (let i = 0; i < 6; i++) h += '<path d="M' + (i % 2 ? 0 : 230) + ',' + (60 + i * 26) + ' l70,0"' + SK(1) + '/>';
    h += fig('aj', {x: 82, y: 82, s: 1.32, expr: 'worry', sweat: 1});
    h += wok(150, 198, 1.15, 0);
    return h;
  },
  g5: () => {
    let h = '';
    h += '<path d="M0,120 L600,120"' + SK(1.4) + '/><path d="M300,120 L60,250 M300,120 L540,250 M300,120 L200,250 M300,120 L400,250"' + SK(1.2) + '/>';
    h += '<circle cx="470" cy="92" r="22"' + FP + '/>';
    for (let i = 0; i < 8; i++) { const a = Math.PI + i * Math.PI / 7; h += '<path d="M' + (470 + Math.cos(a) * 30).toFixed(1) + ',' + (92 + Math.sin(a) * 30).toFixed(1) + ' L' + (470 + Math.cos(a) * 40).toFixed(1) + ',' + (92 + Math.sin(a) * 40).toFixed(1) + '"' + SK(1.4) + '/>'; }
    h += '<path d="M130,112 L160,96 L186,110 M380,114 L400,104 L420,113"' + SK(1.2) + '/>';
    h += wok(302, 146, 2.0, 180);
    h += fig('aj', {x: 250, y: 112, s: 1.04, expr: 'worry', sweat: 1});
    h += '<path d="M226,236 q-10,4 -20,0 M378,236 q10,4 20,0"' + SK(1.4) + '/>';
    return h;
  },
  g6: () => {
    let h = '<path d="M0,232 L600,232"' + SK(2.4) + '/>';
    h += fig('dr', {x: 92, y: 88, s: 1.24, expr: 'n'});
    h += wok(196, 196, 1.05, -6);
    h += fig('aj', {x: 250, y: 104, s: 1.12, expr: 'shock'});
    h += fig('mo', {x: 380, y: 96, s: 1.14, expr: 'n', flip: 1});
    return h;
  }
});
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

/* ---------- 通用小测验：装置 5 / 10 / 13 ---------- */
function quiz(root, K, Q, ends){
  if (!root) return;
  const card = $('[data-q="card"]', root), sc = $('[data-q="score"]', root), bP = $('[data-q="prev"]', root), bN = $('[data-q="next"]', root);
  const ans = new Array(Q.length).fill(null);
  let k = 0;
  function draw(){
    const q = Q[k], a = ans[k];
    card.innerHTML = '<div class="qn">第 ' + (k + 1) + ' / ' + Q.length + ' 题</div><p class="qt">' + q[0] + '</p><div class="opts">' + K.map((t, i) => '<button data-i="' + i + '" class="' + (a === null ? '' : i === q[1] ? 'ok' : i === a ? 'bad' : '') + '"' + (a === null ? '' : ' disabled') + '>' + t + '</button>').join('') + '</div><p class="ex">' + (a === null ? '' : (a === q[1] ? '<b>对。</b>' : '<b>更像是“' + K[q[1]] + '”。</b>') + q[2]) + '</p>';
    const done = ans.filter(x => x !== null).length, right = ans.filter((x, i) => x === Q[i][1]).length;
    sc.textContent = '已答 ' + done + ' / ' + Q.length + ' · 答对 ' + right + (done === Q.length ? ' · ' + (right >= Q.length - 1 ? ends[0] : right >= Q.length / 2 ? ends[1] : ends[2]) : '');
    bP.disabled = k === 0; bN.disabled = k === Q.length - 1;
  }
  card.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (!b || ans[k] !== null) return; ans[k] = +b.dataset.i; draw(); });
  bP.addEventListener('click', () => { if (k > 0) { k--; draw(); } });
  bN.addEventListener('click', () => { if (k < Q.length - 1) { k++; draw(); } });
  draw();
}
quiz($('#fig-quiz'), ['拖字诀', '委员会', '官话', '诱导提问'], [
  ['小组作业，离截止还有三天。你问负责做 PPT 的队友进展如何，他说：“在弄了在弄了，我先把资料再找全一点。”', 0, '典型的“核”：资料永远找不全。应对：别问“做得怎么样”，问“今晚能先发前三页吗”。'],
  ['社团要换活动场地。社长说：“这事牵涉面广，我们拉个群，大家都说说意见。”两周后，群里还在讨论海报用什么颜色。', 1, '把一个问题换成一个群，又在最好聊的小事上花掉了所有时间：委员会加自行车棚。应对：“我先按 A 方案定，明晚之前没人反对就这么办。”'],
  ['实习公司发了封全员邮件：“为进一步提升组织效能，公司将对部分团队结构进行优化。”', 2, '没有主语、名词代替动词、大词套坏事。翻译：要裁员了。'],
  ['奶茶店店员把平板递过来：“您对今天的服务很满意吧？满意的话点个五星哦！”', 3, '答案已经藏在问题里了（“很满意吧”）。这样收来的五星，和王莽的四十八万封上书，是同一种民意。'],
  ['你提议宿舍周末来一次大扫除。室友们都说好主意，“不过这周大家都忙，等期中考完再说吧”。期中考完，变成了“等期末考完”。', 0, '“等”和“换”：每次都有理由，结论永远是“下次”。应对：定一个日子，再把第一步缩小到十分钟，“周六上午十点，每人只管自己的桌子”。'],
  ['班委发问卷：“1. 你希望班级活动更加丰富多彩吗？2. 你愿意为班级建设出一份力吗？3. 你同意每人交五十元班费吗？”', 3, '两个让人点头的铺垫，再问真正想问的。和汉弗莱给伯纳德的那套问题，结构一模一样。'],
  ['你问老师能不能晚两天交作业。老师回复：“原则上不行。你先把情况写清楚发给我。”', 2, '“原则上”是官话里最会变的词：“原则上同意”多半是不同意，“原则上不行”反倒常常有商量的余地。认真写清楚情况，可能就行了。'],
  ['学生会讨论今年晚会的两万元总预算，十分钟就通过了；接着为茶歇买哪种饼干争了一个小时。', 1, '帕金森的“自行车棚”：大事没几个人懂，所以很快通过；小事人人都懂，所以吵个没完。应对：开会前就写明这次只决定哪一件事。']
], ['莫师爷看了你一眼，有点不安。', '阿鉴说：比我强。', '没关系，莫师爷说他也是看了几十年才看明白的。']);
quiz($('#fig-quiz2'), ['年底花光', '考什么得什么', '地盘', '“不”的说法'], [
  ['十二月中旬，学院突然通知各班：班级活动经费年底清零，还没用的赶紧报销。班委连夜开会，决定给每人买一个保温杯。', 0, '规则奖励花钱，人就花钱。保温杯就是莫师爷的新木桶。'],
  ['学校规定每门课必须“课堂互动不少于十次”。于是有的老师每节课准时问十个“大家听懂了吗”。', 1, '考核“互动次数”，就得到次数，而不是互动。古德哈特定律的课堂版。'],
  ['小组里有个同学特别热心地要求“所有材料发给我，我来统一跟老师对接”，但他自己负责的那部分一直没写。', 2, '争的是经手，不是做事。谁跟老师对接，谁的说法就是老师听到的第一个说法。'],
  ['社团学长周五晚上让你周末帮忙排练。你回：“这周末我要回家，实在来不了；下周二晚上我可以，要不我先把台词对一遍发给你？”', 3, '明确的“不”、真实的理由、另一条路，三块都有。'],
  ['某健身软件按“连续打卡天数”发奖章。你发现自己有几天只是打开软件点了一下，就算打卡了。', 1, '你在收集老鼠尾巴。打卡数涨了，身体没变。'],
  ['公司换办公楼层，两个部门经理为了“离总经理办公室近一点”的那片工位争了一个星期。', 2, '第七案：一半是职位，一半是步数。'],
  ['室友问你借电脑打一晚上游戏，你第二天一早有课要用。你说：“行吧……”然后一晚上没睡好，第二天也没好意思要回来。', 3, '这是没说出口的“不”。说了“好”，心里是“不”，最后两个人都不舒服。下次试试：“今晚不行，我明早要用；周末可以借你。”'],
  ['部门年底发现预算还剩不少，经理说：“明年的数是按今年花的定的，省下来等于自己砍自己。”于是组织了一次外地考察。', 0, '这几乎是莫师爷的原话。规则不改，这种考察每年都会有。']
], ['莫师爷说：你可以去户房当差了。', '阿鉴说：我也是答到一半才明白的。', '多看几遍第五到第八案，再回来试试。']);
quiz($('#fig-quiz3'), ['揣摩上意', '背锅', '站队', '勇气'], [
  ['期末前，你听说老师喜欢在作业里看到她课上提过的那本书，于是每篇作业都硬塞进几句引用，不管跟题目有没有关系。', 0, '把“写得好不好”换成了“她喜不喜欢”。青词宰相的学生版。'],
  ['小组展示出了问题，组长在群里第一句话是：“这部分 PPT 是谁做的？”', 1, '出事后先问“谁弄的”而不是“怎么补救”，锅就开始往下走了。'],
  ['你的两个好朋友吵架了，其中一个对你说：“你要是还跟她玩，就别理我了。”', 2, '被要求站队。最好的位置往往是：两边都可以安慰，但不替任何一边传话、骂人。'],
  ['开会时大家都对一个明显有漏洞的方案点头。你举手说：“我觉得第三步可能有问题，我把原因发群里了。”', 3, '小一号的勇气：在所有人等别人先开口的时候，开口。而且对事不对人，有理有据。'],
  ['实习主管交代你一件事时只说了一句“你看着办”。你回去后发了条消息：“刚才的事我理解为……周三前交初稿，对吗？”', 1, '这是防锅：口头交代事后留字。莫师爷那份底稿，就是这个意思。'],
  ['学生会选主席，有个同学两边候选人的饭局都去，两边都说“我支持你”。', 2, '哈克在《党派之戏》里干过同样的事。两边都押，往往两边都不信你。'],
  ['你发现组员报告里的数据被人改得更好看了。你没有在群里公开指出，而是先私下找他：“这几个数我核了一下对不上，我们一起看看？”', 3, '勇气不等于不讲情面。先私下说、给对方改的机会，再考虑要不要公开。'],
  ['公司年会要每个部门出节目，经理说：“这是组织对新人的信任，就交给小王了。”小王是上周刚入职的。', 1, '苦差被包装成荣誉，和“滚钉板”一模一样。先问一句：为什么别人不干？']
], ['莫师爷把《办事须知》递给了你。', '阿鉴说：卷三最难，你已经很好了。', '没关系，衙门里的事，本来就要看很多年。']);

/* ---------- 装置 6：年底花光 ---------- */
(function(){
  const svg = $('#budSvg'), txt = $('#budTxt'), bS = $('#budSave'), bX = $('#budSpend'), R = $('#budRule');
  let rule = 'spend', S;
  function reset(){ const r = rng(Math.floor(Math.random() * 1e6)); S = {t: 0, B: 1000, need: Array.from({length: 6}, () => Math.round(800 + r() * 170)), hist: [], carry: 0}; draw(); }
  function draw(){
    let h = '<line x1="40" y1="160" x2="590" y2="160" stroke="var(--rule)" stroke-width="1.5"/>';
    const Y = v => 160 - v / 1300 * 140;
    [500, 1000].forEach(v => h += '<line x1="40" y1="' + Y(v) + '" x2="590" y2="' + Y(v) + '" stroke="var(--rule)" stroke-dasharray="3 4"/><text x="34" y="' + (Y(v) + 4) + '" text-anchor="end" font-size="11" fill="var(--ink-3)">' + v + '</text>');
    for (let i = 0; i < 5; i++) {
      const x = 70 + i * 104, row = S.hist[i];
      const B = row ? row.B : (i === S.t ? S.B : null);
      if (B !== null) h += '<rect x="' + x + '" y="' + Y(B) + '" width="54" height="' + (160 - Y(B)) + '" fill="none" stroke="var(--ink-3)" stroke-width="1.5"/>';
      if (row) {
        h += '<rect x="' + (x + 4) + '" y="' + Y(row.spend) + '" width="46" height="' + (160 - Y(row.spend)) + '" fill="' + (row.spend > row.need ? 'var(--zhu)' : 'var(--lan)') + '" opacity=".8"/>';
        h += '<line x1="' + (x - 6) + '" y1="' + Y(row.need) + '" x2="' + (x + 60) + '" y2="' + Y(row.need) + '" stroke="var(--ink)" stroke-width="2"/>';
      }
      h += '<text x="' + (x + 27) + '" y="178" text-anchor="middle" font-size="12" fill="var(--ink-2)">第' + (i + 1) + '年</text>';
    }
    h += '<rect x="44" y="6" width="12" height="10" fill="none" stroke="var(--ink-3)"/><text x="60" y="15" font-size="11" fill="var(--ink-2)">预算</text><rect x="100" y="6" width="12" height="10" fill="var(--lan)" opacity=".8"/><text x="116" y="15" font-size="11" fill="var(--ink-2)">花销</text><rect x="156" y="6" width="12" height="10" fill="var(--zhu)" opacity=".8"/><text x="172" y="15" font-size="11" fill="var(--ink-2)">花在不需要的地方</text><line x1="290" y1="11" x2="306" y2="11" stroke="var(--ink)" stroke-width="2"/><text x="310" y="15" font-size="11" fill="var(--ink-2)">实际需要</text>';
    svg.innerHTML = h;
    const waste = S.hist.reduce((a, r) => a + Math.max(0, r.spend - r.need), 0), short = S.hist.filter(r => r.need > r.B).length;
    if (S.t < 5) {
      txt.innerHTML = '第 ' + (S.t + 1) + ' 年：上峰给的预算 <b>' + S.B + '</b> 两。今年实际需要 <b>' + S.need[S.t] + '</b> 两' + (S.need[S.t] > S.B ? '，<b style="color:var(--zhu)">不够用</b>' : '') + '。年底了，你怎么办？';
      bS.disabled = bX.disabled = false;
    } else {
      bS.disabled = bX.disabled = true;
      txt.innerHTML = '五年过去。花在不需要的东西上：<b>' + waste + '</b> 两；钱不够用的年份：<b>' + short + '</b> 年。' + (rule === 'spend'
        ? (short > 0 && waste === 0 ? '<br>你一直省着用，结果预算越砍越少，最后真要用钱时不够了。这就是莫师爷说的“省钱等于砍自己”。' : waste > 0 && short === 0 ? '<br>你年年花光，预算稳稳上涨，从没缺过钱，只是每年都买了一批“新木桶”。在这条规则下，这是最“理性”的做法。' : '<br>在这条规则下，你要么浪费，要么挨饿，很难两全。换成规则二试试。')
        : '<br>在这条规则下，省下来的钱有一半能留着，明年的预算又按实际需要来定，“够用就好”不会吃亏。规则一变，同一个你，做出了不同的选择。');
    }
  }
  function step(spendAll){
    if (S.t >= 5) return;
    const need = S.need[S.t], B = S.B;
    const spend = spendAll ? B : Math.min(need, B);
    S.hist.push({B, need, spend});
    if (rule === 'spend') S.B = Math.round(spend * 1.03);
    else { S.carry = Math.round((B - spend) / 2); S.B = Math.round(S.need[S.t + 1] * 1.02) + S.carry; }
    S.t++; draw();
  }
  bS.addEventListener('click', () => step(false));
  bX.addEventListener('click', () => step(true));
  $('#budReset').addEventListener('click', reset);
  R.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (!b) return; rule = b.dataset.r; $$('[data-r]', R).forEach(x => x.classList.toggle('on', x === b)); reset(); });
  reset();
})();

/* ---------- 装置 7：老鼠尾巴（演示模型） ---------- */
(function(){
  const svg = $('#ratSvg'), inp = $('#ratB'), out = $('#ratBo'), txt = $('#ratTxt');
  let S;
  function reset(){ S = {m: 0, R: 10000, F: 0, hist: [{t: 0, r: 10000}], paid: 0}; draw(); }
  function step(){
    const b = +inp.value;
    const catchRate = Math.min(0.5, 0.08 * b);
    const caught = S.R * catchRate;
    const f = b >= 2 ? Math.min(0.85, 0.2 * (b - 1)) * Math.min(1, S.m / 4) : 0;
    if (b >= 3 && S.m >= 3) S.F += 300 * (b - 2);
    const tails = caught + S.F * 0.5;
    S.R = Math.max(0, S.R * 1.10 - caught * (1 - f) + S.F * 0.15);
    S.m++; S.paid += tails * b;
    S.hist.push({t: tails, r: S.R});
    draw();
  }
  function draw(){
    const b = +inp.value; out.textContent = b + ' 文';
    const H = S.hist, n = Math.max(12, H.length - 1);
    const mx = Math.max(12000, ...H.map(p => Math.max(p.t, p.r)));
    const X = i => 40 + i / n * 545, Y = v => 180 - v / mx * 160;
    let h = '<line x1="40" y1="180" x2="590" y2="180" stroke="var(--rule)"/><line x1="40" y1="20" x2="40" y2="180" stroke="var(--rule)"/>';
    h += '<text x="44" y="16" font-size="11" fill="var(--ink-3)">' + Math.round(mx).toLocaleString() + '</text><text x="586" y="196" text-anchor="end" font-size="11" fill="var(--ink-3)">第 ' + n + ' 个月</text>';
    const line = (k, c) => '<polyline fill="none" stroke="' + c + '" stroke-width="2.4" points="' + H.map((p, i) => X(i).toFixed(1) + ',' + Y(p[k]).toFixed(1)).join(' ') + '"/>';
    if (H.length > 1) h += line('t', 'var(--zhu)');
    h += line('r', 'var(--lan)');
    h += '<line x1="300" y1="12" x2="316" y2="12" stroke="var(--zhu)" stroke-width="2.4"/><text x="320" y="16" font-size="11" fill="var(--ink-2)">每月收上来的尾巴</text><line x1="440" y1="12" x2="456" y2="12" stroke="var(--lan)" stroke-width="2.4"/><text x="460" y="16" font-size="11" fill="var(--ink-2)">城里的老鼠</text>';
    svg.innerHTML = h;
    const last = H[H.length - 1], first = H[0];
    let msg = '第 ' + S.m + ' 个月：城里约 <b>' + Math.round(last.r).toLocaleString() + '</b> 只老鼠' + (S.m ? '，本月收尾巴 <b>' + Math.round(last.t).toLocaleString() + '</b> 条，累计赏钱 <b>' + Math.round(S.paid).toLocaleString() + '</b> 文。' : '。');
    if (S.m >= 6) {
      if (b === 0) msg += '<br>不悬赏，老鼠照常繁殖。';
      else if (last.r > first.r && last.t > 1500) msg += '<br><b>尾巴越收越多，老鼠也越来越多。</b>赏钱高到值得作弊：剪尾放生、专门养鼠。你奖励的是尾巴，得到的也是尾巴。';
      else if (last.r < first.r * 0.7) msg += '<br>这个赏钱不高不低，抓老鼠划算，养老鼠不划算，老鼠真的少了。指标还没被“玩坏”。';
      else msg += '<br>赏钱太低，没人上心，老鼠还在慢慢变多。';
    }
    txt.innerHTML = msg + '<br><span style="font-size:13px;color:var(--ink-3)">这是一个为演示而简化的模型，数字不是 1902 年的真实统计。</span>';
  }
  inp.addEventListener('input', () => { out.textContent = inp.value + ' 文'; });
  $('#ratGo').addEventListener('click', step);
  $('#ratSix').addEventListener('click', () => { for (let i = 0; i < 6; i++) step(); });
  $('#ratReset').addEventListener('click', reset);
  reset();
})();

/* ---------- 装置 8：秘书变宰相 ---------- */
(function(){
  const N = [
    ['汉', '尚书', '前 1 世纪起', '起初是少府手下管文书的小官，因为天天在皇帝身边收发奏章，汉武帝以后越来越受倚重。', '东汉时人说“虽置三公，事归台阁”：丞相、三公还在，实际政务都归尚书台。尚书台自己也长成了一个庞大的衙门。'],
    ['魏晋—唐', '中书', '3—7 世纪', '魏晋的皇帝嫌尚书台太大，转而倚重身边替自己起草诏令的中书。', '到隋唐，中书省与门下省、尚书省并列为三省，成了正式的宰相机构，有了自己的属官和程序。'],
    ['唐', '翰林学士', '8—9 世纪', '唐玄宗以后，皇帝把最机密的诏令交给身边的翰林学士起草，他们本来只是陪侍皇帝的文学之臣。', '中晚唐的翰林学士参与机要，被称为“内相”。宋以后，翰林成了清贵的正式官职。'],
    ['明', '内阁', '15—17 世纪', '明太祖废丞相后，皇帝身边设了几个大学士帮忙看奏章、拟意见，起初只是五品小官。', '一百多年后，内阁首辅成了实际上的宰相，严嵩、徐阶、张居正都坐过这个位子。另一条支线是司礼监：替皇帝批红的太监，比内阁离皇帝更近。'],
    ['清', '军机处', '1729—1911', '雍正为了西北用兵，在隆宗门旁设了几间值房，挑几个亲信大臣随时商量军务，起初只是临时机构。', '不久，军机处成了全国真正的中枢，原来的内阁被晾在一边。它一直存在到 1911 年，才被所谓的“责任内阁”取代。']
  ];
  const svg = $('#secSvg'), card = $('#secCard');
  let cur = 0;
  function draw(){
    let h = '<line x1="40" y1="60" x2="600" y2="60" stroke="var(--rule)" stroke-width="2"/>';
    N.forEach((n, i) => {
      const x = 60 + i * 130;
      h += '<g class="mapnode' + (i === cur ? ' on' : '') + '" data-i="' + i + '" tabindex="0" role="button" aria-label="' + n[1] + '"><circle cx="' + x + '" cy="60" r="' + (i === cur ? 15 : 12) + '" fill="' + (i === cur ? 'var(--zhu)' : 'var(--card)') + '" stroke="var(--ink)" stroke-width="2"/><text x="' + x + '" y="34" text-anchor="middle" font-size="15" fill="var(--ink)" style="font-family:var(--f-display)">' + n[1] + '</text><text x="' + x + '" y="98" text-anchor="middle" font-size="12" fill="var(--ink-3)">' + n[0] + '</text></g>';
      if (i < N.length - 1) h += '<path d="M' + (x + 20) + ',60 L' + (x + 110) + ',60" stroke="var(--zhu)" stroke-width="1.5" marker-end="url(#secArr)" opacity=".6"/>';
    });
    svg.innerHTML = '<defs><marker id="secArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="var(--zhu)"/></marker></defs>' + h;
    const n = N[cur];
    card.innerHTML = '<p class="k">' + n[0] + ' · ' + n[2] + '</p><h5>' + n[1] + '</h5><p><b>起初：</b>' + n[3] + '</p><p><b>后来：</b>' + n[4] + '</p>' + (cur < N.length - 1 ? '<p style="color:var(--ink-3);font-size:14px">然后，皇帝又在身边找了一批新的秘书……</p>' : '<p style="color:var(--ink-3);font-size:14px">两千年的轮回，到这里随着帝制一起结束。</p>');
    $$('.mapnode', svg).forEach(g => { const f = () => { cur = +g.dataset.i; draw(); }; g.addEventListener('click', f); g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); f(); } }); });
  }
  draw();
})();

/* ---------- 装置 9：拒绝练习 ---------- */
(function(){
  const SC = [
    ['社团学长周四找你：周末帮忙做活动海报。可你下周一有一门考试，还没复习完。', [
      ['“好啊好啊，我看看时间哈。”（然后一直没回）', -15, -6, '学长等到周六才发现你没空，只好临时找人。他记住的不是你没空，而是你没说。这是拖字诀。'],
      ['“考试周还找我？不行。”', -12, 8, '时间保住了，可那句“还找我”带着刺。拒绝的是事，伤到的是人。'],
      ['“这周末我要复习考试，实在抽不出来。下周二之后可以帮你改排版，或者我先把去年用的模板发你？”', 4, 10, '明确的“不”、真实的理由、另一条路。学长多半会说“好，模板发我”。'],
      ['“行，我熬夜弄。”', 8, -22, '学长很高兴，你周一考砸了。答应一件做不到的事，代价最后都是自己付。']]],
    ['同学第三次找你借五百块，前两次都拖了很久才还。', [
      ['“我最近手头也有点紧……再说吧。”', -6, -4, '含糊的“再说”，对方过几天还会再问。你还得再找一次借口。'],
      ['“你上两次都拖那么久，我凭什么再借？”', -18, 6, '说的是实话，可这么说，以后连同学都难做了。'],
      ['“这次我不借了。前两次还钱拖得有点久，我自己也会紧张。要是急用，我可以帮你问问学校的临时困难补助。”', 0, 12, '不借，理由是“我自己会紧张”，说的是自己的感受，不是指责对方。还给了一条别的路。'],
      ['“好吧，转你了。”', 5, -18, '又借出去五百块，接下来几个月你会一直惦记着它。']]],
    ['室友连着一周半夜打游戏开外放，你第二天早八有课。', [
      ['什么也不说，戴上耳塞忍着。', 0, -15, '关系没变，你的睡眠变差了。忍一周还行，忍一学期会忍出怨气。'],
      ['在宿舍群里发：“某些人能不能有点公德心？”', -20, 2, '点名不点名，大家都知道是谁。公开指责会让一件小事变成一场冷战。'],
      ['私下说：“我早八有课，十二点以后能不能戴耳机？你要开黑的话，我也可以给你推荐个便宜的耳机。”', 5, 12, '说清楚“不”（不要外放），说清楚理由（早八），给另一条路（耳机）。多数室友会接受。'],
      ['自己也开始熬夜，干脆一起打。', 6, -20, '关系是好了，早八也没了。']]],
    ['实习主管周五下午五点丢来一个活：“不急，下周一早上给我就行。”你周末已经约好了回家。', [
      ['“好的。”然后周末带着电脑回家，边陪家人边干。', 6, -16, '主管很满意，你的周末没了。下次他会觉得周末交活是正常的。'],
      ['“现在都五点了，我周末不加班。”', -14, 8, '立场没错，但说法太硬，主管会记住这一句。'],
      ['“我周末已经有安排了。周一上午十点前我先给您一个框架，下午交完整版，您看行吗？”', 3, 12, '把“不加班”换成了一个具体可行的时间表。主管要的是东西，不一定是周一早上。'],
      ['“好的”，然后周末一个字没动，周一说“还在弄”。', -16, 4, '这是最糟的一种：嘴上答应，实际拖。主管失去了对你的信任，你周一还得硬着头皮补。']]]
  ];
  const card = $('#noCard');
  let k, rel, self, picked;
  function bar(){ $('#noRel').style.width = rel + '%'; $('#noRelo').textContent = rel; $('#noSelf').style.width = self + '%'; $('#noSelfo').textContent = self; }
  function draw(){
    if (k >= SC.length) {
      card.innerHTML = '<p class="qt">四个场景结束。关系 <b>' + rel + '</b>，你自己 <b>' + self + '</b>。</p><p class="fb">' + (rel >= 60 && self >= 80 ? '你把“不”说得既干净又体面，莫师爷的第四种说法你学会了。' : self < 50 ? '你答应了太多做不到或不想做的事。别人一时高兴，你自己一直在付账。' : rel < 45 ? '你的“不”很坚决，只是有时太硬了。理由说成自己的感受，再给一条别的路，会好很多。' : '有得有失。可以回头看看每个场景里第三种说法：明确、真实、另一条路。') + '</p>';
      $('#noNext').disabled = true; bar(); return;
    }
    const s = SC[k];
    card.innerHTML = '<div class="qn">场景 ' + (k + 1) + ' / ' + SC.length + '</div><p class="qt">' + s[0] + '</p><div class="opts2">' + s[1].map((o, i) => '<button data-i="' + i + '"' + (picked !== null ? ' disabled' : '') + ' class="' + (picked === i ? 'pick' : '') + '">' + o[0] + '</button>').join('') + '</div>' + (picked !== null ? '<p class="fb">' + s[1][picked][3] + '</p>' : '');
    $('#noNext').disabled = picked === null;
    bar();
  }
  card.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (!b || picked !== null || k >= SC.length) return; picked = +b.dataset.i; const o = SC[k][1][picked]; rel = clampN(rel + o[1]); self = clampN(self + o[2]); draw(); });
  function clampN(v){ return Math.max(0, Math.min(100, v)); }
  $('#noNext').addEventListener('click', () => { if (picked === null) return; k++; picked = null; draw(); });
  function reset(){ k = 0; rel = 60; self = 60; picked = null; $('#noNext').disabled = true; draw(); }
  $('#noReset').addEventListener('click', reset);
  reset();
})();

/* ---------- 装置 11：报喜，还是报忧 ---------- */
(function(){
  const EV = [
    ['西段河堤有三处渗水，秋汛前要加固。', '照实说：“西段河堤三处渗水，请拨银加固。”', '挑好听的：“河堤总体稳固，个别地方略有湿润。”'],
    ['今年的秋粮，实收比上报的少了一成。', '照实说：“秋粮少收一成，上报的数要改。”', '挑好听的：“秋粮基本收齐，个别乡尚在催缴。”'],
    ['新开的粥厂，账目对不上二十两。', '照实说：“粥厂账目差二十两，正在查。”', '挑好听的：“粥厂运转良好，灾民交口称赞。”'],
    ['城东那伙劫道的，上个月又出现了。', '照实说：“城东劫匪复出，需增派捕快。”', '挑好听的：“本县治安平稳，盗案同比下降。”'],
    ['大人推荐来的那位远房外甥，办事不太靠谱。', '照实说：“令甥于钱谷之事尚欠历练，宜换个差事。”', '挑好听的：“令甥勤勉，假以时日必成大器。”'],
    ['上峰夸过的那座新桥，桥墩出现了裂缝。', '照实说：“新桥桥墩有裂缝，须封桥检修。”', '挑好听的：“新桥车马往来，一切如常。”']
  ];
  const card = $('#repCard');
  let k, fav, risk, log;
  function bars(){ $('#repFav').style.width = fav + '%'; $('#repFavo').textContent = fav; $('#repRisk').style.width = Math.min(100, risk) + '%'; $('#repRisko').textContent = risk; }
  function draw(){
    if (k >= EV.length) {
      const bad = risk >= 50;
      card.innerHTML = '<p class="qt">半年过去，秋汛来了。</p><p class="fb">' + (bad
        ? '大人这半年过得很舒心，一直觉得你最懂事。直到河堤决口、新桥封闭、劫匪抢了粮车，所有被说成“略有湿润”“一切如常”的事，在同一个月里一起冒了出来。上峰来问责，大人翻出你的那些报告，上面全是你的字。<b>报喜不报忧的人，最后往往是第一个背锅的人。</b>这正是下一案要讲的。'
        : fav < 35
        ? '你照实说了每一件坏事，大人这半年脸色不太好看，背后也有人说你“不会来事”。可秋汛平安过去了，新桥修好了，劫匪也抓了。大人后来想明白了：衙门里只有你从不让他意外。这就是魏征的位置。'
        : '你有时照实说，有时挑好听的。麻烦没有大到决堤，但也攒下了一些。往后哪一件冒出来，都会有人去翻当初的报告。') + '</p>';
      bars(); return;
    }
    const e = EV[k];
    card.innerHTML = '<div class="qn">第 ' + (k + 1) + ' / ' + EV.length + ' 件</div><p class="qt">' + e[0] + '</p><div class="opts2"><button data-c="1">' + e[1] + '</button><button data-c="0">' + e[2] + '</button></div>' + (log ? '<p class="fb">' + log + '</p>' : '');
    bars();
  }
  card.addEventListener('click', ev => {
    const b = ev.target.closest('[data-c]'); if (!b || k >= EV.length) return;
    if (b.dataset.c === '1') { fav = Math.max(0, fav - 9); log = '大人皱了皱眉：“知道了。”然后派人去办了。'; }
    else { fav = Math.min(100, fav + 8); risk += 17; log = '大人笑了：“好，好。”这件事在暗处又放了半个月。'; }
    k++; draw();
  });
  function reset(){ k = 0; fav = 50; risk = 0; log = ''; draw(); }
  $('#repReset').addEventListener('click', reset);
  reset();
})();

/* ---------- 装置 12：站队人生 ---------- */
(function(){
  const card = $('#deerCard'), log = $('#deerLog');
  const R = [
    {y: '1550 · 嘉靖二十九年', q: '严嵩当国，如日中天，依附他的人升得飞快。次辅徐阶在内阁里隐忍不发，处处顺着严嵩。你刚进京，同乡来劝你早做打算。', o: [['投靠严党', 'yan'], ['暗中亲近徐阶', 'xu'], ['谁也不靠，好好办差', 'mid']]},
    {y: '1567 · 隆庆元年', q: '嘉靖已经驾崩，新皇帝即位。徐阶是首辅，可阁臣高拱和他斗得越来越凶；另一位阁臣张居正年轻干练，与宫里的太监冯保交好。你……', o: [['跟高拱走', 'gao'], ['跟张居正走', 'zhang'], ['谁也不靠，好好办差', 'mid']]},
    {y: '1572 · 万历元年前后', q: '张居正成了首辅，推行考成法、清丈田亩，雷厉风行，权倾朝野。想要升迁，最快的路是紧跟张阁老。你……', o: [['紧跟张居正', 'zhang'], ['保持距离，只办分内事', 'mid']]}
  ];
  let st, out, score, path;
  function L(t){ log.insertAdjacentHTML('beforeend', '<div>' + t + '</div>'); }
  function settle(i, c){
    if (i === 0) {
      if (c === 'yan') { score += 2; L('<span class="me">1550—1562：</span>你跟着严党连升三级，好不风光。'); L('<span class="me">1562：</span>严嵩倒台，严党成批落马。<b>你被罢官回乡。</b>'); out = true; }
      else if (c === 'xu') { L('<span class="me">1550—1562：</span>严嵩当政的十二年里，你一直坐冷板凳。'); score += 3; L('<span class="me">1562：</span>严嵩倒台，徐阶成了首辅，你被重用，升了两级。'); }
      else { score += 1; L('<span class="me">1550—1562：</span>你按部就班地熬资历。严嵩倒台时，你两边都不沾，平安无事，还因为办事踏实升了一级。'); }
    } else if (i === 1) {
      if (path[0] === 'xu') L('<span class="me">1568：</span>徐阶被高拱一派攻击，告老还乡。你作为“徐阶的人”，在朝中处境尴尬。'), score -= 1;
      if (c === 'gao') { score += 2; L('<span class="me">1569—1572：</span>高拱复出主政，你跟着得势。'); L('<span class="me">1572：</span>隆庆帝去世，张居正联合冯保把高拱赶出了京城。<b>你被贬到边远地方。</b>'); out = true; }
      else if (c === 'zhang') { score += 3; L('<span class="me">1572：</span>高拱被逐，张居正成了首辅。你押对了，一路高升。'); }
      else { score += 1; L('<span class="me">1567—1572：</span>阁老们斗来斗去，你在部里管好自己的一摊事，没人想起你，也没人整你。'); }
    } else {
      if (c === 'zhang') { score += 3; L('<span class="me">1572—1582：</span>张居正当国十年，你是他的得力干将，官至侍郎。'); L('<span class="me">1582—1584：</span>张居正病逝，万历亲自清算，张家被抄，依附他的人纷纷被罢黜。<b>你被削去官籍。</b>'); out = true; }
      else { score += 1; L('<span class="me">1572—1582：</span>你认真执行考成法，但从不登张府的门。'); L('<span class="me">1582—1584：</span>张居正死后被清算，你因为“不是张党”逃过一劫，还被提拔了一级。'); }
    }
  }
  function ending(){
    const all = path.every(p => p === 'mid');
    card.innerHTML = '<p class="qt">' + (out ? '你的仕途在 ' + ['1562', '1572', '1584'][path.length - 1] + ' 年前后画上了句号。' : '你平安走完了这四十年。') + '</p><p class="fb">' + (all
      ? '你一次队也没站。没有大富贵，也没有大灾难，一级一级熬上来，还在每一次大清洗里全身而退。在那四十年里，这几乎是最稳的活法。'
      : out
      ? '每一次站对的人，往往就是下一次站错的人：严党的赢家输在 1562，高拱的赢家输在 1572，张居正的赢家输在 1584。站对一次靠眼光，连站对四十年，只能靠运气。'
      : '你站过队，也躲过了清算，运气不错。可回头看看：你平安，多半不是因为站得准，而是因为在最后一个关口退了一步。') + '</p>';
  }
  function draw(){
    if (out || st >= R.length) { ending(); return; }
    const r = R[st];
    card.innerHTML = '<div class="qn">' + r.y + '</div><p class="qt">' + r.q + '</p><div class="opts2">' + r.o.map(o => '<button data-c="' + o[1] + '">' + o[0] + '</button>').join('') + '</div>';
  }
  card.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b || out || st >= R.length) return; const c = b.dataset.c; path.push(c); settle(st, c); st++; draw(); });
  function reset(){ st = 0; out = false; score = 0; path = []; log.innerHTML = '<div class="sys">你中了进士，进京做官。</div>'; draw(); }
  $('#deerReset').addEventListener('click', reset);
  reset();
})();

/* ---------- 装置 14：押韵的衙门 ---------- */
(function(){
  const svg = $('#tlSvg'); if (!svg) return;
  const E = $$('.echo').map((el, k) => { el.id = el.id || 'echo-' + k; const ps = $$('p', el); return {id: el.id, y: +(el.dataset.year || 2026), kind: el.dataset.k, title: el.dataset.title, ry: ($('.ry', el) || {}).textContent || '', text: ps.slice(1).map(p => p.textContent).join(' ')}; }).sort((a, b) => a.y - b.y);
  const B = [[-300, 40], [0, 150], [600, 270], [1300, 410], [1550, 560], [1800, 690], [1950, 790], [2026, 870]];
  const X = y => { for (let i = 1; i < B.length; i++) if (y <= B[i][0]) { const [a, xa] = B[i - 1], [b, xb] = B[i]; return xa + (y - a) / (b - a) * (xb - xa); } return 870; };
  const col = {'轮回': 'var(--zhu)', '讽刺': 'var(--lan)', '存疑': 'var(--ink-3)', '联系': 'var(--moss)', '生活': 'var(--gold)'};
  const card = $('#tlCard'), F = $('#tlF');
  let cur = 'all';
  const kinds = Object.keys(col).filter(k => E.some(e => e.kind === k));
  F.innerHTML = '<button class="btn on" data-f="all">全部 ' + E.length + '</button>' + kinds.map(k => '<button class="btn" data-f="' + k + '">' + k + ' ' + E.filter(e => e.kind === k).length + '</button>').join('');
  function draw(){
    let h = '<line x1="30" y1="150" x2="880" y2="150" stroke="var(--rule)" stroke-width="1.5"/>';
    B.forEach(([y, x]) => h += '<line x1="' + x + '" y1="146" x2="' + x + '" y2="154" stroke="var(--ink-3)"/><text x="' + x + '" y="172" text-anchor="middle" font-size="11" fill="var(--ink-3)" font-family="IBM Plex Mono,monospace">' + (y < 0 ? '前' + (-y) : y) + '</text>');
    const used = [];
    E.forEach((e, k) => {
      const x = X(e.y); let lv = 0; while (used.some(u => u.lv === lv && Math.abs(u.x - x) < 15)) lv++; used.push({x, lv});
      const on = cur === 'all' || e.kind === cur, yy = 132 - lv * 17;
      h += '<g class="mapnode" data-k="' + k + '" tabindex="0" role="button" aria-label="' + e.title + '" opacity="' + (on ? 1 : .12) + '"><line x1="' + x + '" y1="150" x2="' + x + '" y2="' + yy + '" stroke="var(--rule)"/><circle cx="' + x + '" cy="' + yy + '" r="6.5" fill="' + col[e.kind] + '" stroke="var(--card)" stroke-width="1.5"/></g>';
    });
    Object.entries(col).forEach(([k, c], i) => h += '<circle cx="' + (40 + i * 70) + '" cy="14" r="5" fill="' + c + '"/><text x="' + (49 + i * 70) + '" y="18" font-size="12" fill="var(--ink-2)">' + k + '</text>');
    svg.innerHTML = h;
    $$('.mapnode', svg).forEach(g => { const f = () => pick(+g.dataset.k); g.addEventListener('click', f); g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); f(); } }); });
  }
  function pick(k){
    const e = E[k];
    card.innerHTML = '<p class="k">' + (e.ry || '') + ' · <span style="color:' + col[e.kind] + '">' + e.kind + '</span></p><p><b>' + e.title + '</b></p><p style="font-size:14.5px;color:var(--ink-2)">' + e.text + '</p><p><a href="#' + e.id + '">跳过去 →</a></p>';
  }
  F.addEventListener('click', ev => { const b = ev.target.closest('[data-f]'); if (!b) return; cur = b.dataset.f; $$('[data-f]', F).forEach(x => x.classList.toggle('on', x === b)); draw(); const first = E.findIndex(e => cur === 'all' || e.kind === cur); if (first >= 0) pick(first); });
  draw();
})();

})();
