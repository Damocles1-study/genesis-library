/* ================= 一张 MacBook Air 的键盘 =================
   每个键：[显示的字, e.code, 宽度, Mac 里, 游戏里, 读音/英文名] */
const KB = [
  [['esc', 'Escape', 1.5, '取消；退出全屏', '暂停、打开菜单；关掉物品栏', 'escape'], ['F1', 'F1', 1, '调暗屏幕（按住 fn 才是 F1）', '隐藏界面，拍干净的风景照', ''], ['F2', 'F2', 1, '调亮屏幕', '截图（存在 screenshots 文件夹）', ''], ['F3', 'F3', 1, '调度中心：看所有窗口', '调试屏幕：坐标、朝向、帧数', ''], ['F4', 'F4', 1, '聚焦搜索', '', ''], ['F5', 'F5', 1, '听写（说话打字）', '换视角：第一人称 → 背后 → 前面', ''], ['F6', 'F6', 1, '勿扰模式', '', ''], ['F7', 'F7', 1, '上一首', '', ''], ['F8', 'F8', 1, '播放 / 暂停', '', ''], ['F9', 'F9', 1, '下一首', '', ''], ['F10', 'F10', 1, '静音', '', ''], ['F11', 'F11', 1, '调小音量', '全屏 / 退出全屏', ''], ['F12', 'F12', 1, '调大音量', '', ''], ['指纹', '', 1, '触控 ID：按一下锁屏，手指放上去解锁', '', 'Touch ID']],
  [['`', 'Backquote', 1, '反引号；按住 ⌘ 时在同一个程序的窗口之间切换', '', 'backquote'], ['1', 'Digit1', 1, '', '快捷栏第 1 格', 'one'], ['2', 'Digit2', 1, '', '快捷栏第 2 格', 'two'], ['3', 'Digit3', 1, '⇧⌘3 截整个屏幕', '快捷栏第 3 格', 'three'], ['4', 'Digit4', 1, '⇧⌘4 截一块地方', '快捷栏第 4 格', 'four'], ['5', 'Digit5', 1, '⇧⌘5 截图和录屏工具', '快捷栏第 5 格', 'five'], ['6', 'Digit6', 1, '', '快捷栏第 6 格', 'six'], ['7', 'Digit7', 1, '', '快捷栏第 7 格', 'seven'], ['8', 'Digit8', 1, '', '快捷栏第 8 格', 'eight'], ['9', 'Digit9', 1, '', '快捷栏第 9 格', 'nine'], ['0', 'Digit0', 1, '', '', 'zero'], ['-', 'Minus', 1, '⌘- 缩小', '', 'minus'], ['=', 'Equal', 1, '⌘= 放大（其实是 ⌘+）', '', 'equals'], ['delete', 'Backspace', 1.5, '删掉光标前面的一个字；⌘delete 把文件移到废纸篓', '', 'delete']],
  [['tab', 'Tab', 1.5, '跳到下一个格子；⌘tab 切换程序', '联机时看在线玩家；打命令时补全', 'tab'], ['Q', 'KeyQ', 1, '⌘Q 退出程序（小心！）', '扔掉手里的一个东西', 'Q'], ['W', 'KeyW', 1, '⌘W 关掉窗口或网页', '往前走；连按两下跑', 'W'], ['E', 'KeyE', 1, '', '打开物品栏', 'E'], ['R', 'KeyR', 1, '⌘R 刷新网页', '', 'R'], ['T', 'KeyT', 1, '⌘T 新标签页', '打开聊天框', 'T'], ['Y', 'KeyY', 1, '', '', 'Y'], ['U', 'KeyU', 1, '', '', 'U'], ['I', 'KeyI', 1, '⌘I 显示简介', '', 'I'], ['O', 'KeyO', 1, '⌘O 打开', '', 'O'], ['P', 'KeyP', 1, '⌘P 打印', '社交互动（联机时屏蔽别人）', 'P'], ['[', 'BracketLeft', 1, '⌘[ 后退', '', 'left bracket'], [']', 'BracketRight', 1, '⌘] 前进', '', 'right bracket'], ['\\', 'Backslash', 1, '反斜杠：终端里给空格“开路”', '', 'backslash']],
  [['中/英', 'CapsLock', 1.8, '中文 Mac 上：切换中文和英文（拼音输入法）；长按是大写锁定', '', 'caps lock'], ['A', 'KeyA', 1, '⌘A 全选', '往左走', 'A'], ['S', 'KeyS', 1, '⌘S 存储', '往后退', 'S'], ['D', 'KeyD', 1, '', '往右走', 'D'], ['F', 'KeyF', 1, '⌘F 查找', '把手里的东西换到另一只手', 'F'], ['G', 'KeyG', 1, '⇧⌘G 前往文件夹（在访达里）', '', 'G'], ['H', 'KeyH', 1, '⌘H 隐藏这个程序', '', 'H'], ['J', 'KeyJ', 1, '', '', 'J'], ['K', 'KeyK', 1, '', '', 'K'], ['L', 'KeyL', 1, '', '打开进度（成就树）', 'L'], [';', 'Semicolon', 1, '分号', '', 'semicolon'], ["'", 'Quote', 1, '单引号', '', 'quote'], ['return', 'Enter', 1.8, '换行；确定', '发送聊天、执行命令', 'return']],
  [['shift', 'ShiftLeft', 2.3, '按住打大写字母和上面那排符号', '潜行：走到边上不掉下去', 'shift'], ['Z', 'KeyZ', 1, '⌘Z 撤销，⇧⌘Z 重做', '', 'Z'], ['X', 'KeyX', 1, '⌘X 剪切', '创造模式：X + 数字 读出存好的快捷栏', 'X'], ['C', 'KeyC', 1, '⌘C 拷贝', '创造模式：C + 数字 存下快捷栏', 'C'], ['V', 'KeyV', 1, '⌘V 粘贴', '', 'V'], ['B', 'KeyB', 1, '', '', 'B'], ['N', 'KeyN', 1, '⌘N 新建', '', 'N'], ['M', 'KeyM', 1, '⌘M 把窗口缩到程序坞', '', 'M'], [',', 'Comma', 1, '⌘, 打开这个程序的设置', '', 'comma'], ['.', 'Period', 1, '⇧⌘. 显示隐藏文件（在访达里）', '', 'period'], ['/', 'Slash', 1, '斜杠：路径里分开每一层文件夹', '直接打开命令框，自带一个 /', 'slash'], ['shift', 'ShiftRight', 2.3, '和左边的 shift 一样', '', 'shift']],
  [['fn 🌐', '', 1, '按住它，最上面一排才变成 F1—F12；单按可以切换输入法（看设置）', '（游戏收不到它，它是给 Mac 用的）', 'function'], ['control', 'ControlLeft', 1.1, '⌃ 控制键。control + 点 = 右键；control + 空格 = 换输入法', '按住跑步', 'control'], ['option', 'AltLeft', 1.1, '⌥ 选项键：打特殊符号；按住它看菜单里藏着的命令', '', 'option'], ['command', 'MetaLeft', 1.4, '⌘ 命令键：Mac 上最常用的“快捷键键”', '', 'command'], ['', 'Space', 5, '空格；⌘空格 = 聚焦搜索；在访达里选中文件按空格 = 快速看一眼', '跳；创造模式连按两下 = 飞', 'space'], ['command', 'MetaRight', 1.4, '和左边的 ⌘ 一样', '', 'command'], ['option', 'AltRight', 1.1, '和左边的 ⌥ 一样', '', 'option'], ['←', 'ArrowLeft', 1, '光标往左；⌘← 跳到行首', '', 'left arrow'], ['↑↓', 'ArrowUp', 1, '光标上下；在终端里 ↑ 是上一条命令', '聊天框里 ↑ 找回上一条命令', 'up arrow'], ['→', 'ArrowRight', 1, '光标往右；⌘→ 跳到行尾', '', 'right arrow']]
];
const MODSYM = {command: '⌘', option: '⌥', control: '⌃', shift: '⇧', 'fn 🌐': 'fn'};
function keyboard(box, opts){
  opts = opts || {};
  let mode = opts.mode || 0; // 0 全部 1 Mac 2 游戏
  box.classList.add('kbwrap');
  box.innerHTML = '<div class="btns kbm"></div><div class="kb" role="group" aria-label="MacBook Air 键盘"></div><div class="say kbsay">点一个键，看看它是干什么的。' + (opts.live ? '也可以点“用真键盘”，然后按你电脑上的键。' : '') + '</div>' + (opts.live ? '<div class="btns"><button class="btn" data-live>用真键盘</button><span class="lab" style="align-self:center" data-mods></span></div>' : '') + (opts.goals ? '<ul class="goals"></ul>' : '');
  const kb = $('.kb', box), say = $('.kbsay', box), goals = $('.goals', box);
  const all = [];
  kb.innerHTML = KB.map((row, r) => '<div class="kr' + (r === 0 ? ' fr' : '') + '">' + row.map(k => { all.push(k); const i = all.length - 1; const sym = MODSYM[k[0]]; return '<button class="k' + (k[3] ? ' m' : '') + (k[4] ? ' g' : '') + (sym ? ' mod' : '') + '" style="flex:' + k[2] + ' 1 0" data-i="' + i + '" data-code="' + k[1] + '">' + (sym && sym !== 'fn' ? '<small>' + sym + '</small>' : '') + '<span>' + esc(k[0] || '空格') + '</span></button>'; }).join('') + '</div>').join('');
  const setMode = m => { mode = m; box.dataset.mode = m; };
  btnRow($('.kbm', box), ['全部', 'Mac 里的用处', '游戏里的用处'], mode, setMode); setMode(mode);
  function show(k){
    const sym = MODSYM[k[0]];
    say.innerHTML = '<b>' + esc(k[0] || '空格') + '</b>' + (sym ? '　符号 <kbd class="sym">' + sym + '</kbd>' : '') + (k[5] ? '　英文 <span class="en" data-say="' + esc(k[5]) + '">' + esc(k[5]) + '</span>' : '') +
      '<br><b style="color:var(--stone)">Mac 里</b>：' + (k[3] || '打字') + '<br><b style="color:var(--main)">游戏里</b>：' + (k[4] || '默认没有用处（可以在“按键绑定”里给它安排一个）');
  }
  kb.addEventListener('click', e => { const b = e.target.closest('.k'); if (!b) return; $$('.k', kb).forEach(x => x.classList.toggle('sel', x === b)); show(all[+b.dataset.i]); });
  /* 真键盘 */
  let live = false;
  const SAFE = {a: '全选', c: '拷贝', v: '粘贴', x: '剪切', z: '撤销', s: '存储', f: '查找', i: '显示简介'};
  const gl = opts.goals || [];
  const got = new Set();
  const drawGoals = () => { if (goals) goals.innerHTML = gl.map((g, i) => '<li' + (got.has(i) ? ' class="ok"' : '') + '>' + g.t + '</li>').join(''); };
  drawGoals();
  function onKey(e){
    if (!live) return;
    if (e.target.closest && e.target.closest('input,textarea') && !box.contains(e.target)) return;
    const b = $$('.k', kb).find(x => x.dataset.code && x.dataset.code === e.code) || (e.code === 'ArrowDown' ? $('.k[data-code=ArrowUp]', kb) : null);
    if (e.metaKey && SAFE[e.key && e.key.toLowerCase()]) e.preventDefault();
    if (!e.metaKey && ['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Slash', 'Quote', 'Backspace', 'F1', 'F3', 'F5', 'F11'].includes(e.code)) e.preventDefault();
    if (b) { b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 260); show(all[+b.dataset.i]); }
    const mods = [e.ctrlKey && '⌃ control', e.altKey && '⌥ option', e.shiftKey && '⇧ shift', e.metaKey && '⌘ command'].filter(Boolean);
    const md = $('[data-mods]', box); if (md) md.textContent = mods.length ? '正按着：' + mods.join(' + ') : '';
    if (e.metaKey && SAFE[e.key && e.key.toLowerCase()]) say.innerHTML += '<br>你按了 <kbd class="sym">⌘</kbd>' + (e.shiftKey ? '<kbd class="sym">⇧</kbd>' : '') + '<kbd>' + e.key.toUpperCase() + '</kbd>：' + (e.shiftKey && e.key.toLowerCase() === 'z' ? '重做' : SAFE[e.key.toLowerCase()]) + '（在这一页里被拦住了，没真的执行）';
    gl.forEach((g, i) => { if (!got.has(i) && g.ok(e)) { got.add(i); drawGoals(); } });
  }
  document.addEventListener('keydown', onKey);
  const lb = $('[data-live]', box);
  if (lb) lb.addEventListener('click', () => { live = !live; lb.classList.toggle('on', live); lb.textContent = live ? '真键盘：开着（再点关掉）' : '用真键盘'; say.textContent = live ? '现在按你电脑上的键试试。fn 键浏览器收不到，按了没反应是正常的。' : '真键盘关掉了。'; });
  return {show: i => show(all[i])};
}
