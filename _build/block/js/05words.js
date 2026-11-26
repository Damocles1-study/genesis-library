/* ================= 词表（第七部的词卡和复习台用） =================
   [英文（游戏里的 ID 或普通单词）, 中文（Java 版简体中文的名字）, 类别, 小字说明, 常用=1]
   类别：block 方块 item 物品 tool 工具和装备 mob 生物 color 颜色 biome 群系 dir 方向和位置 num 数字 time 时间 weather 天气 verb 动词 */
const WORDS = [
  /* ---- 方块 ---- */
  ['grass_block', '草方块', 'block', 'grass 草 + block 方块', 1], ['dirt', '泥土', 'block', '', 1], ['stone', '石头', 'block', '', 1], ['cobblestone', '圆石', 'block', 'cobble 鹅卵石 + stone'], ['deepslate', '深板岩', 'block', 'deep 深 + slate 板岩；y = 0 以下'],
  ['bedrock', '基岩', 'block', 'bed 底 + rock 岩石；挖不动'], ['sand', '沙子', 'block', '', 1], ['red_sand', '红沙', 'block', ''], ['gravel', '沙砾', 'block', '挖了有时掉燧石'], ['clay', '黏土块', 'block', ''],
  ['oak_log', '橡木原木', 'block', 'oak 橡树 + log 原木', 1], ['oak_planks', '橡木木板', 'block', 'plank 木板，复数 planks', 1], ['oak_leaves', '橡树树叶', 'block', 'leaf 叶子 → 复数 leaves'], ['spruce_log', '云杉原木', 'block', 'spruce 云杉'], ['birch_log', '白桦原木', 'block', 'birch 白桦'],
  ['glass', '玻璃', 'block', '', 1], ['glass_pane', '玻璃板', 'block', 'pane 一块窗玻璃'], ['sandstone', '砂岩', 'block', 'sand + stone'], ['bricks', '砖块', 'block', 'brick 砖'], ['stone_bricks', '石砖', 'block', ''],
  ['obsidian', '黑曜石', 'block', '水浇在熔岩上变成的'], ['ice', '冰', 'block', ''], ['snow_block', '雪块', 'block', ''], ['water', '水', 'block', '', 1], ['lava', '熔岩', 'block', ''],
  ['coal_ore', '煤矿石', 'block', 'ore 矿石'], ['iron_ore', '铁矿石', 'block', ''], ['gold_ore', '金矿石', 'block', ''], ['diamond_ore', '钻石矿石', 'block', '', 1], ['redstone_ore', '红石矿石', 'block', ''],
  ['emerald_ore', '绿宝石矿石', 'block', ''], ['lapis_ore', '青金石矿石', 'block', ''], ['copper_ore', '铜矿石', 'block', 'copper 铜'], ['netherrack', '下界岩', 'block', 'nether 下界 + rack'], ['glowstone', '荧石', 'block', 'glow 发光 + stone'],
  ['end_stone', '末地石', 'block', 'end 尽头'], ['crafting_table', '工作台', 'block', 'craft 手工做', 1], ['furnace', '熔炉', 'block', '', 1], ['chest', '箱子', 'block', '本来是“胸口”，也是大箱子', 1], ['bookshelf', '书架', 'block', 'book + shelf 架子'],
  ['torch', '火把', 'block', '', 1], ['ladder', '梯子', 'block', ''], ['oak_door', '橡木门', 'block', 'door 门'], ['tnt', 'TNT', 'block', '一种炸药的缩写'], ['piston', '活塞', 'block', ''],
  ['note_block', '音符盒', 'block', 'note 音符'], ['jukebox', '唱片机', 'block', ''], ['white_bed', '白色的床', 'block', 'bed 床'], ['cactus', '仙人掌', 'block', ''], ['pumpkin', '南瓜', 'block', ''],
  ['melon', '西瓜', 'block', ''], ['sugar_cane', '甘蔗', 'block', 'sugar 糖 + cane 茎'], ['poppy', '虞美人', 'block', '一种红花'], ['dandelion', '蒲公英', 'block', ''], ['sunflower', '向日葵', 'block', 'sun + flower'],
  ['anvil', '铁砧', 'block', ''], ['beacon', '信标', 'block', ''], ['enchanting_table', '附魔台', 'block', 'enchant 施魔法'], ['spawner', '刷怪笼', 'block', 'spawn 生成 + -er'], ['command_block', '命令方块', 'block', 'command 命令'],
  ['hopper', '漏斗', 'block', ''], ['lever', '拉杆', 'block', ''], ['redstone_lamp', '红石灯', 'block', 'lamp 灯'],
  /* ---- 物品 ---- */
  ['diamond', '钻石', 'item', '', 1], ['iron_ingot', '铁锭', 'item', 'iron 铁 + ingot 锭', 1], ['gold_ingot', '金锭', 'item', ''], ['copper_ingot', '铜锭', 'item', ''], ['coal', '煤炭', 'item', '', 1],
  ['charcoal', '木炭', 'item', 'char 烧焦 + coal'], ['emerald', '绿宝石', 'item', '村民交易用'], ['lapis_lazuli', '青金石', 'item', ''], ['redstone', '红石粉', 'item', 'red + stone', 1], ['netherite_ingot', '下界合金锭', 'item', ''],
  ['stick', '木棍', 'item', '', 1], ['string', '线', 'item', '蜘蛛掉的'], ['feather', '羽毛', 'item', ''], ['leather', '皮革', 'item', ''], ['bone', '骨头', 'item', ''],
  ['gunpowder', '火药', 'item', 'gun 枪 + powder 粉'], ['paper', '纸', 'item', ''], ['book', '书', 'item', ''], ['apple', '苹果', 'item', '', 1], ['bread', '面包', 'item', '', 1],
  ['carrot', '胡萝卜', 'item', ''], ['potato', '马铃薯', 'item', ''], ['baked_potato', '烤马铃薯', 'item', 'bake 烤 → baked 烤过的'], ['wheat', '小麦', 'item', ''], ['wheat_seeds', '小麦种子', 'item', 'seed 种子'],
  ['egg', '鸡蛋', 'item', '一组 16 个'], ['milk_bucket', '奶桶', 'item', 'milk 牛奶'], ['cooked_beef', '牛排', 'item', 'cook 煮 → cooked；beef 牛肉'], ['cooked_chicken', '熟鸡肉', 'item', ''], ['cake', '蛋糕', 'item', ''],
  ['cookie', '曲奇', 'item', ''], ['ender_pearl', '末影珍珠', 'item', 'pearl 珍珠'], ['eye_of_ender', '末影之眼', 'item', 'eye 眼睛 + of 的'], ['snowball', '雪球', 'item', 'snow + ball'], ['firework_rocket', '烟花火箭', 'item', 'fire + work；rocket 火箭'],
  ['minecart', '矿车', 'item', 'mine 矿 + cart 小车'], ['oak_boat', '橡木船', 'item', 'boat 船'], ['totem_of_undying', '不死图腾', 'item', 'un- 不 + dying 死'], ['enchanted_book', '附魔书', 'item', 'enchanted 被施了魔法的'], ['potion', '药水', 'item', ''],
  ['glass_bottle', '玻璃瓶', 'item', 'bottle 瓶子'], ['saddle', '鞍', 'item', ''], ['lead', '拴绳', 'item', '也是“带领”'], ['name_tag', '命名牌', 'item', 'name + tag 标签'], ['map', '地图', 'item', '（游戏里叫“空地图”）'],
  /* ---- 工具和装备 ---- */
  ['wooden_pickaxe', '木镐', 'tool', 'wooden 木头做的 + pickaxe', 1], ['stone_axe', '石斧', 'tool', 'axe 斧'], ['iron_shovel', '铁锹', 'tool', 'shovel 锹'], ['golden_hoe', '金锄', 'tool', 'golden 金做的 + hoe 锄'], ['diamond_sword', '钻石剑', 'tool', 'sword 剑', 1],
  ['diamond_pickaxe', '钻石镐', 'tool', '', 1], ['bow', '弓', 'tool', ''], ['arrow', '箭', 'tool', ''], ['crossbow', '弩', 'tool', 'cross 十字 + bow'], ['shield', '盾牌', 'tool', ''],
  ['trident', '三叉戟', 'tool', 'tri- 三'], ['fishing_rod', '钓鱼竿', 'tool', 'fish 钓鱼 + rod 杆'], ['flint_and_steel', '打火石', 'tool', 'flint 燧石 and steel 钢'], ['shears', '剪刀', 'tool', '总是复数'], ['bucket', '铁桶', 'tool', '空桶，一组 16 个'],
  ['water_bucket', '水桶', 'tool', ''], ['compass', '指南针', 'tool', ''], ['clock', '时钟', 'tool', ''], ['spyglass', '望远镜', 'tool', 'spy 侦察 + glass'], ['iron_helmet', '铁头盔', 'tool', 'helmet 头盔'],
  ['iron_chestplate', '铁胸甲', 'tool', 'chest 胸 + plate 板'], ['iron_leggings', '铁护腿', 'tool', 'leg 腿'], ['iron_boots', '铁靴子', 'tool', 'boot 靴子'], ['elytra', '鞘翅', 'tool', '能滑翔的翅膀'], ['netherite_sword', '下界合金剑', 'tool', ''],
  /* ---- 生物 ---- */
  ['pig', '猪', 'mob', '', 1], ['cow', '牛', 'mob', '', 1], ['sheep', '羊', 'mob', '复数还是 sheep', 1], ['chicken', '鸡', 'mob', '', 1], ['horse', '马', 'mob', ''],
  ['donkey', '驴', 'mob', ''], ['rabbit', '兔子', 'mob', ''], ['wolf', '狼', 'mob', '复数 wolves'], ['cat', '猫', 'mob', '', 1], ['fox', '狐狸', 'mob', '复数 foxes'],
  ['parrot', '鹦鹉', 'mob', ''], ['bee', '蜜蜂', 'mob', ''], ['turtle', '海龟', 'mob', ''], ['dolphin', '海豚', 'mob', ''], ['squid', '鱿鱼', 'mob', ''],
  ['axolotl', '美西螈', 'mob', ''], ['frog', '青蛙', 'mob', ''], ['goat', '山羊', 'mob', ''], ['panda', '熊猫', 'mob', ''], ['polar_bear', '北极熊', 'mob', 'polar 极地的 + bear 熊'],
  ['llama', '羊驼', 'mob', ''], ['camel', '骆驼', 'mob', ''], ['villager', '村民', 'mob', 'village 村子 + -er 人', 1], ['wandering_trader', '流浪商人', 'mob', 'wander 闲逛 + trade 交易 + -er'], ['iron_golem', '铁傀儡', 'mob', 'golem 泥人'],
  ['snow_golem', '雪傀儡', 'mob', ''], ['bat', '蝙蝠', 'mob', ''], ['zombie', '僵尸', 'mob', '', 1], ['skeleton', '骷髅', 'mob', '', 1], ['spider', '蜘蛛', 'mob', '', 1],
  ['creeper', '苦力怕', 'mob', 'creep 悄悄爬 + -er', 1], ['enderman', '末影人', 'mob', 'end + man；复数 endermen'], ['slime', '史莱姆', 'mob', '黏液'], ['witch', '女巫', 'mob', ''], ['drowned', '溺尸', 'mob', 'drown 淹 → drowned 淹死的'],
  ['husk', '尸壳', 'mob', ''], ['phantom', '幻翼', 'mob', '幽灵'], ['pillager', '掠夺者', 'mob', 'pillage 抢劫 + -er'], ['ghast', '恶魂', 'mob', ''], ['blaze', '烈焰人', 'mob', '火焰'],
  ['piglin', '猪灵', 'mob', ''], ['wither_skeleton', '凋灵骷髅', 'mob', 'wither 枯萎'], ['ender_dragon', '末影龙', 'mob', 'dragon 龙'], ['warden', '监守者', 'mob', '看守的人'], ['allay', '悦灵', 'mob', ''],
  /* ---- 颜色 ---- */
  ['white', '白色', 'color', '', 1], ['orange', '橙色', 'color', '也是“橙子”'], ['magenta', '品红色', 'color', ''], ['light_blue', '淡蓝色', 'color', 'light 浅的 + blue'], ['yellow', '黄色', 'color', '', 1],
  ['lime', '黄绿色', 'color', '也是“青柠”'], ['pink', '粉红色', 'color', ''], ['gray', '灰色', 'color', '英国写 grey'], ['light_gray', '淡灰色', 'color', ''], ['cyan', '青色', 'color', ''],
  ['purple', '紫色', 'color', ''], ['blue', '蓝色', 'color', '', 1], ['brown', '棕色', 'color', ''], ['green', '绿色', 'color', '', 1], ['red', '红色', 'color', '', 1], ['black', '黑色', 'color', '', 1],
  /* ---- 群系 ---- */
  ['plains', '平原', 'biome', 'plain 平的；复数'], ['forest', '森林', 'biome', ''], ['birch_forest', '白桦森林', 'biome', ''], ['dark_forest', '黑森林', 'biome', 'dark 暗的'], ['taiga', '针叶林', 'biome', ''],
  ['snowy_plains', '雪原', 'biome', 'snow + -y'], ['desert', '沙漠', 'biome', ''], ['savanna', '热带草原', 'biome', ''], ['jungle', '丛林', 'biome', ''], ['swamp', '沼泽', 'biome', ''],
  ['badlands', '恶地', 'biome', 'bad + lands'], ['mushroom_fields', '蘑菇岛', 'biome', 'mushroom 蘑菇 + fields 田野'], ['ocean', '海洋', 'biome', ''], ['deep_ocean', '深海', 'biome', ''], ['river', '河流', 'biome', ''],
  ['beach', '沙滩', 'biome', ''], ['meadow', '草甸', 'biome', ''], ['cherry_grove', '樱花树林', 'biome', 'cherry 樱桃 + grove 小树林'], ['stony_peaks', '裸岩山峰', 'biome', 'stony 多石的 + peak 山尖'], ['lush_caves', '繁茂洞穴', 'biome', 'lush 茂盛的 + cave 洞'],
  ['dripstone_caves', '溶洞', 'biome', 'drip 滴 + stone'], ['deep_dark', '深暗之域', 'biome', ''], ['nether_wastes', '下界荒地', 'biome', 'waste 荒地'], ['overworld', '主世界', 'biome', 'over 上面 + world'], ['the_end', '末地', 'biome', ''],
  /* ---- 方向和位置 ---- */
  ['north', '北', 'dir', '−z', 1], ['south', '南', 'dir', '+z', 1], ['east', '东', 'dir', '+x', 1], ['west', '西', 'dir', '−x', 1], ['up', '上', 'dir', '', 1],
  ['down', '下', 'dir', '', 1], ['left', '左', 'dir', ''], ['right', '右', 'dir', '也是“对的”'], ['forward', '向前', 'dir', ''], ['back', '向后', 'dir', ''],
  ['above', '在……上面', 'dir', ''], ['below', '在……下面', 'dir', ''], ['inside', '在里面', 'dir', 'in + side'], ['outside', '在外面', 'dir', 'out + side'], ['near', '近', 'dir', ''],
  ['far', '远', 'dir', ''], ['top', '顶上', 'dir', ''], ['bottom', '底下', 'dir', ''], ['middle', '中间', 'dir', ''], ['corner', '角落', 'dir', ''],
  /* ---- 数字 ---- */
  ['zero', '零', 'num', '0'], ['one', '一', 'num', '1', 1], ['two', '二', 'num', '2', 1], ['three', '三', 'num', '3', 1], ['four', '四', 'num', '4'],
  ['five', '五', 'num', '5'], ['six', '六', 'num', '6'], ['seven', '七', 'num', '7'], ['eight', '八', 'num', '8'], ['nine', '九', 'num', '9'],
  ['ten', '十', 'num', '10'], ['eleven', '十一', 'num', '11'], ['twelve', '十二', 'num', '12'], ['thirteen', '十三', 'num', '13，-teen 是十几'], ['sixteen', '十六', 'num', '16：一组鸡蛋'],
  ['twenty', '二十', 'num', '20，-ty 是几十；一秒 20 刻'], ['thirty', '三十', 'num', '30'], ['sixty-four', '六十四', 'num', '64：一组'], ['hundred', '百', 'num', '100'], ['thousand', '千', 'num', '1000'],
  ['million', '百万', 'num', '1 000 000'], ['first', '第一', 'num', '1st'], ['second', '第二；秒', 'num', '2nd；也是“秒”'], ['third', '第三', 'num', '3rd'], ['half', '一半', 'num', ''],
  /* ---- 时间 ---- */
  ['day', '白天；一天', 'time', '', 1], ['night', '夜晚', 'time', '', 1], ['morning', '早上', 'time', ''], ['noon', '正午', 'time', '6000 刻'], ['afternoon', '下午', 'time', 'after + noon'],
  ['evening', '傍晚', 'time', ''], ['midnight', '半夜', 'time', 'mid 中间 + night'], ['sunrise', '日出', 'time', 'sun + rise 升'], ['sunset', '日落', 'time', 'sun + set 落'], ['today', '今天', 'time', ''],
  ['tomorrow', '明天', 'time', ''], ['yesterday', '昨天', 'time', ''], ['minute', '分钟', 'time', ''], ['hour', '小时', 'time', ''], ['week', '星期', 'time', ''],
  ['month', '月', 'time', 'moon 月亮'], ['year', '年', 'time', ''], ['tick', '刻', 'time', '游戏的一拍'],
  /* ---- 天气 ---- */
  ['weather', '天气', 'weather', ''], ['clear', '晴朗；清除', 'weather', '/weather clear、/clear'], ['sunny', '阳光好的', 'weather', 'sun + n + y'], ['cloudy', '多云的', 'weather', 'cloud + y'], ['rain', '雨；下雨', 'weather', '', 1],
  ['snow', '雪；下雪', 'weather', ''], ['thunder', '雷', 'weather', ''], ['lightning', '闪电', 'weather', ''], ['storm', '暴风雨', 'weather', ''], ['wind', '风', 'weather', ''],
  ['moon', '月亮', 'weather', ''], ['sun', '太阳', 'weather', ''], ['star', '星星', 'weather', ''], ['cloud', '云', 'weather', ''], ['rainbow', '彩虹', 'weather', 'rain + bow 弓'],
  /* ---- 动词 ---- */
  ['give', '给', 'verb', '/give', 1], ['take', '拿', 'verb', ''], ['kill', '杀死；消灭', 'verb', '/kill'], ['summon', '召唤', 'verb', '/summon'], ['fill', '填满', 'verb', '/fill'],
  ['set', '设置；放', 'verb', '/time set'], ['say', '说', 'verb', '/say'], ['tell', '告诉', 'verb', '/tell'], ['teleport', '传送', 'verb', 'tele 远 + port 运', 1], ['place', '放置', 'verb', ''],
  ['break', '打破', 'verb', ''], ['build', '建造', 'verb', '', 1], ['dig', '挖', 'verb', ''], ['mine', '采矿', 'verb', '也是“矿井”'], ['craft', '合成；手工做', 'verb', '', 1],
  ['smelt', '冶炼', 'verb', '在熔炉里烧'], ['cook', '烹饪', 'verb', ''], ['eat', '吃', 'verb', ''], ['drink', '喝', 'verb', ''], ['jump', '跳', 'verb', '', 1],
  ['run', '跑；运行', 'verb', '/execute … run'], ['walk', '走', 'verb', ''], ['sneak', '潜行', 'verb', ''], ['fly', '飞', 'verb', ''], ['swim', '游泳', 'verb', ''],
  ['attack', '攻击', 'verb', ''], ['open', '打开', 'verb', ''], ['close', '关上', 'verb', ''], ['drop', '扔下', 'verb', ''], ['use', '使用', 'verb', ''],
  ['enchant', '附魔', 'verb', ''], ['trade', '交易', 'verb', ''], ['ride', '骑', 'verb', ''], ['sleep', '睡觉', 'verb', ''], ['spawn', '生成；出生', 'verb', '']
];
