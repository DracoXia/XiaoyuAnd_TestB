










// 资源配置
export const DEFAULT_AUDIO_URL = "https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/ShanCha_Mp3.mp3";
export const TRANSITION_AUDIO_URL = "https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/female-sigh-450446.mp3";
export const POUR_AUDIO_URL = "https://cdn.pixabay.com/audio/2022/03/24/audio_097f7d389a.mp3"; // Pouring water sound

export const TEA_GREEN_COLOR = "#9E9D24";

// --- NEW: Fragrance Box Options (O2O) ---
export const FRAGRANCE_LIST = [
  {
    id: 'white_tea',
    name: '白茶 · 见山',
    desc: '温润白茶，清旷山色',
    status: 'owned', // User has this
    color: 'bg-orange-100 text-dopamine-orange',
    gradient: 'from-orange-50 to-amber-50',
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 'osmanthus',
    name: '木樨 · 听秋',
    desc: '金桂飘香，秋意渐浓',
    status: 'locked', // Needs unlock
    color: 'bg-lime-100 text-lime-600',
    gradient: 'from-lime-50 to-green-50',
    audioUrl: '' // Mock
  },
  {
    id: 'rose',
    name: '蔷薇 · 枕月',
    desc: '蔷薇花开，温柔入梦',
    status: 'locked',
    color: 'bg-purple-100 text-purple-600',
    gradient: 'from-purple-50 to-indigo-50',
    audioUrl: '' // Mock
  }
];

// --- NEW: Ambiance Tuner Options (Immersion) ---
export const PINK_NOISE_URL = "https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/pink_noise.mp3"; // Placeholder - please replace with actual
export const BROWN_NOISE_URL = "https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/brown_noise.mp3"; // Placeholder - please replace with actual

export const AMBIANCE_MODES = [
  {
    id: 'original',
    label: '本味',
    icon: 'leaf',
    audioUrl: DEFAULT_AUDIO_URL, // White Noise / Original Track
    theme: 'warm'
  },
  {
    id: 'sleep',
    label: '入眠',
    icon: 'moon',
    audioUrl: PINK_NOISE_URL, // Pink Noise
    theme: 'night' // Darker/Blue
  },
  {
    id: 'meditate',
    label: '冥想',
    icon: 'wind',
    audioUrl: BROWN_NOISE_URL, // Brown Noise
    theme: 'nature' // Green/Brown
  }
];

export const TEXT_CONTENT = {
  ritual: {
    main: ["焚", "香", "静", "心"],
    hint: "上划屏幕，点燃线香"
  },
  immersion: [
    "庭院无声",
    "暖阳在白瓷杯盏间",
    "打了个盹",
    "",
    "浮动的茶烟",
    "唤醒了远方的山岚",
    "在清旷的留白里",
    "",
    "此间坐久",
    "见山色",
    "见清欢"
  ],
  product: {
    entryLabel: "溯源 · 安心",
    modal: {
      title: "安心入座的理由",
      origin: {
        title: "[ 关于这一缕香的由来 ]",
        part1: "摒弃化学香精的矫饰，唯留天然草木研磨后的真味。这一支香，由",
        highlight: "非遗传承人",
        part2: "亲手拣选、炮制，将古老的手艺化作指尖的温度。",
        part3: "每一道工序的严苛与纯净，皆已通过国家标准的安全验证。我们敬畏手艺，亦如我们珍视你的每一口呼吸。"
      },
      ingredients: {
        title: "[ 甄选 · 自然原材 ]",
        list: [
          { name: "白花银针", desc: "毫香蜜韵 · 茶骨" },
          { name: "山茶花", desc: "清雅幽寒 · 去燥" },
          { name: "白兰花", desc: "灵动鲜活 ·提神" },
          { name: "雪松", desc: "沉稳苍古 · 定心" }
        ]
      },
      // New Story Section
      story: {
        title: "制香师说",
        subtitle: "午后暖阳与一杯茶",
        content: [
          "做香之前，我开过茶楼。那几年，日子泡在茶汤里，每年都要去不同的茶山寻茶。",
          "2020年，我彻底迷上了白茶——原生种的菜茶，白花银针，那是一种清雅的、带有淡淡花香的骨气。",
          "这支香的灵感，便来自午后暖阳下的一杯清茶。",
          "我想记录下喝茶的全生命周期：从准备茶具，把桌椅搬到庭院里，认真对待每一片叶子。",
          "闻干茶的毫香，第一泡的鲜活花香，至四五泡后沉稳的草木香……",
          "我将这些时光的味道，都揉进了这支香里。"
        ]
      },
      reminder: {
        title: "[ 温柔提醒 ]",
        text: "见烟起时，请为空间留一道透气的缝隙。在流动的空气里，草木的韵味方能舒展，最是动人。"
      },
      footer: "( 请在通风处使用，并远离易燃物 )"
    }
  }
};

export const MOOD_OPTIONS = [
  {
    id: 'anxious',
    label: '有点焦虑',
    icon: '🌧️',
    style: 'bg-dopamine-purple/10 text-dopamine-purple ring-2 ring-dopamine-purple/20'
  },
  {
    id: 'tired',
    label: '好累呀',
    icon: '🥱',
    style: 'bg-gray-100 text-ink-light ring-2 ring-gray-200'
  },
  {
    id: 'confused',
    label: '乱乱的',
    icon: '🌫️',
    style: 'bg-dopamine-teal/10 text-dopamine-teal ring-2 ring-dopamine-teal/20'
  },
  {
    id: 'sad',
    label: '想哭',
    icon: '💧',
    style: 'bg-dopamine-blue/10 text-dopamine-blue ring-2 ring-dopamine-blue/20'
  },
  {
    id: 'calm',
    label: '发发呆',
    icon: '🌤️',
    style: 'bg-dopamine-green/10 text-dopamine-green ring-2 ring-dopamine-green/20'
  },
  {
    id: 'joy',
    label: '小确幸',
    icon: '✨',
    style: 'bg-dopamine-orange/10 text-dopamine-orange ring-2 ring-dopamine-orange/20'
  },
];

export const CONTEXT_OPTIONS = ['工作/学业', '感情', '健康/身材', '家庭', '人际关系', '说不清'];

export const AI_PROMPTS = {
  sign: (timeOfDay: string) => `你是白茶之灵。现在是${timeOfDay}。请生成一句不超过 10 个字的禅意短句，引导用户进入冥想。不要解释，直接输出句子。`,
  validate: (content: string) =>
    `你是一个内容审核助手。判断以下用户分享是否适合展示在疗愈社区的"治愈墙"上。
     
     适合标准 (PASS):
     1. 包含具体场景或画面（如"雨天"、"热茶"）。
     2. 传递平静、温暖或希望。
     3. 即使是痛苦，也有微小的自救动作。

     不适合标准 (REJECT):
     1. 纯粹负能量发泄（如"想死"、"没意思"）。
     2. 无意义灌水。
     3. 攻击性言论。

     用户内容: "${content}"

     请只回答 "PASS" 或 "REJECT"。`
};

// --- PRESET LOCAL REPLIES (Offline Mode) - Mood + Context Matrix ---
export const PRESET_NICKNAMES = [
  "路过的温暖小熊", "等雨停的蘑菇", "晒太阳的猫", "收集星星的人", "只有七秒记忆的鱼",
  "森林里的邮递员", "云朵观察员", "喜欢喝茶的兔子", "深夜的守夜人", "修补月亮的人"
];

export const PRESET_REPLIES: Record<string, Record<string, string[]>> = {
  '有点焦虑': {
    '工作/学业': ["深呼吸，把脚踩在地上，感受地面的支撑。此刻你只需要关注眼前这一件事。任务可以拆解，时间是流动的，你并没有被困住。", "试着问自己：最坏的结果真的会发生吗？通常不会。把注意力从未来的担忧拉回到现在的每一次呼吸上。你很安全。"],
    '感情': ["感情里的不确定性最让人抓狂。但请记得，你的价值不取决于对方的回应。先照顾好自己，花若盛开，蝴蝶自来。", "焦虑是因为太在意。试着把关注点收回到自己身上，做点喜欢的事，给自己煮杯茶。无论结果如何，你都拥有自己。"],
    '健康/身材': ["身体是你最好的朋友，它在努力维持平衡。别苛责它，给它多一点耐心和爱。每一次健康的饮食和休息，都是对它的感谢。", "焦虑不会让身体变好，但放松会。闭上眼，想象温暖的光流遍全身。你正在变好，身体都知道。"],
    '家庭': ["家是讲爱的地方，不是讲理的地方。如果感到压抑，允许自己暂时抽离，去楼下散个步。你有权利拥有属于自己的空间。", "把父母/家人的期待和作为独立个体的你分开。你不需要为所有人的情绪负责。先安顿好自己的心。"],
    '人际关系': ["不需要讨好所有人。真正的朋友会接纳你本来的样子。在关系中感到紧绷时，试着后退一步，在这个自我边界里，你是安全的。", "他人的评价只是他们的看法，不代表你的真相。你只需要对自己诚实。做个深呼吸，把那些杂音都吐出去。"],
    '说不清': ["莫名的焦虑是身体在提醒你该休息了。不需要找原因，只需要接受这份情绪，像看着一片云飘过。天总会亮的。", "闭上眼睛，想象把烦恼都装进气球放飞。虽然不知道在担心什么，但小屿会一直陪着你，直到你感觉好一点。"]
  },
  '好累呀': {
    '工作/学业': ["辛苦啦！今天的电量已经耗尽。允许自己像手机一样关机充电。工作永远做不完，但你可以选择现在就休息。", "你已经做得够好了。停下来不是放弃，是为了走更远的路。今晚不谈理想，只谈睡觉。"],
    '感情': ["爱人之前，先爱自己。如果这段关系让你感到疲惫，不妨先停下来，抱抱自己。你不需要时刻都懂事和坚强。", "感情是滋养，不该是消耗。累了就歇歇，不必急着要答案。好的关系，是可以在对方面前安然入睡的。"],
    '健康/身材': ["身体在喊累了，听听它的声音吧。今晚早点睡，梦里没有卡路里，只有软绵绵的云朵。", "不要和身体对抗。它是你灵魂的圣殿。给它一个热水澡，一次深长的呼吸，感谢它一直以来的支撑。"],
    '家庭': ["承载了太多期待，肩膀很酸吧？把重担先放下，此刻你只是你自己，不是谁的孩子或父母。晚安。", "家务琐事永远做不完。今天就偷个懒吧，点个外卖，或者把碗筷留到明天。照顾好自己的情绪最重要。"],
    '人际关系': ["维持关系如果让你感到累，说明该做减法了。低质量的社交不如高质量的独处。关上门，享受只属于你的宁静。", "戴着面具生活很辛苦吧？在小屿这里，你可以卸下所有防备，做回那个软绵绵的小朋友。"],
    '说不清': ["身心俱疲的时候，连说话的力气都没有。那就什么都别做，把自己裹进被子里。今晚，世界为你打烊。", "累了就躺平，这不丢人。就像冬天的树，落叶是为了更好地过冬。你正在积蓄能量呢。"]
  },
  '乱乱的': {
    '工作/学业': ["任务太多，不知道从何下手？试着只列出最重要的三件事，然后只做第一件。此时此地，专注当下的这一步。", "思绪像一团乱麻？去整理一下桌面，或者洗个杯子。手在动的时候，心会慢慢静下来。秩序感会回来的。"],
    '感情': ["心乱是因为在乎。如果不确定该进该退，那就先原地不动。时间是最好的过滤器，它会帮你沉淀出真心。", "情绪上头的时候，不要做决定。去跑跑步，或者写写日记。把心里的话倒出来，你会发现答案就在里面。"],
    '健康/身材': ["各种养生/减肥信息让你迷茫？回到最简单的：喝水，睡觉，晒太阳。身体的智慧远胜过所有攻略。", "不知道该怎么开始？那就从这一口深呼吸开始。不需要完美的计划，只需要微小的行动。"],
    '家庭': ["家里的事往往剪不断理还乱。别试图一下子解决所有问题。深呼吸，告诉自己：在这个当下，我是平静的。", "纷扰是外界的，心境是自己的。在心里修一道篱笆，把那些嘈杂挡在外面。守住内心的秩序。"],
    '人际关系': ["人心难测，别费力去猜。保持简单的善意，其他的交给时间。懂你的人，自然会懂。", "在复杂的关系网中迷失了？回到原点，问问自己：和谁在一起最舒服？那就多和谁在一起。"],
    '说不清': ["是不是感觉脑子里有无数只蜜蜂在叫？去做件不需要动脑的事吧，比如拼图或填色。让大脑放个假。", "混乱是重组的前奏。此时的迷茫，也许是为了打破旧的模式。别怕，小屿陪你在迷雾里坐一会儿。"]
  },
  '想哭': {
    '工作/学业': ["委屈了就哭出来，眼泪是排毒。你的努力小屿虽然没看见，但我知道你一定很不容易。抱抱。", "失败了也没关系，这只是一个事件，不代表你的全部。哭完擦干眼泪，你依然是那个勇敢的你。"],
    '感情': ["心碎的声音很疼吧？想哭就尽情哭，这是对过去的一种告别。眼泪流干了，心里就腾出地方装新的快乐了。", "被误解、被忽视的感觉真不好受。在小屿这里，你不需要伪装坚强。每一滴眼泪都值得被接住。"],
    '健康/身材': ["对身体的无力感让你难过？抱抱你。生病/不适不是你的错。请对自己温柔一点，像照顾最好的朋友那样照顾自己。", "讨厌现在的样子？可是现在的你也值得被爱呀。哭出来因为你在乎，在乎就是改变的开始。"],
    '家庭': ["家有时候是伤人的。如果感到受伤，请记得那是因为你还有期待。保护好心里那个受伤的小孩，告诉他：我长大了，我会保护你。", "在最亲近的人面前反而最脆弱。哭吧，不用解释。小屿在这里，安静地陪着你。"],
    '人际关系': ["感到孤独或被排挤？这真的让人很难过。但请相信，这世上总有懂你的频率。你很好，只是还没遇到对的人。", "被信任的人伤害了？哭出来是对自己的慈悲。吃一堑长一智，但也别忘了世界的温柔。"],
    '说不清': ["不知道为什么，就是想哭？没关系，这是情绪的雨季。雨停了，空气会变得清新。小屿给你撑伞。", "成年人的崩溃不需要理由。借你一个肩膀，哭吧。哭完了，今晚睡个好觉。"]
  },
  '发发呆': {
    '工作/学业': ["盯着屏幕久了，脑子需要空白。发呆是给大脑的氧气。看着光标闪烁，思绪飘到九霄云外，挺好的。", "什么都不想做？那就什么都别做。效率暂停一下，灵感也许就在这片空白里悄悄发芽。"],
    '感情': ["感情里也需要留白。不用时刻联系，不用时刻填满。发会儿呆，想念会在空气中慢慢发酵。", "两个人在一起，互不打扰地发呆，也是一种浪漫。享受这份不用说话的默契吧。"],
    '健康/身材': ["感受呼吸的一进一出，感受身体的重量。这种放空的状态，是身体在进行自我在修复。", "无论是瑜伽后的摊尸，还是单纯的躺平，发呆都是对身体最温柔的滋养。"],
    '家庭': ["在柴米油盐的间隙，给自己留几分钟的空白。这一刻，你不是谁的角色，只是一个看云的人。", "家里的空气安静下来了。看着窗外的树叶摇晃，享受这份难得的无所事事。"],
    '人际关系': ["不用费心找话题，不用担心冷场。自己和自己相处，是最高级的社交。享受这份孤独的自由。", "在人群中感到喧闹？那就把心门关上一会儿。在心里的安全岛上，晒晒太阳发发呆。"],
    '说不清': ["真好呀，像一只猫一样眯着眼睛。世界在忙碌，而你拥有此刻的宁静。这是最棒的超能力。", "时间好像变慢了。看着尘埃在光柱里飞舞，这种无意义的瞬间，藏着生活的诗意。"]
  },
  '小确幸': {
    '工作/学业': ["哇！这份成就感是你的勋章！记住这种心跳的感觉，它是你未来前行路上的一盏灯。", "是不是像解开了一道难题一样爽？给自己点个赞！每个小小的进步，都值得庆祝。"],
    '感情': ["好甜呀！这一刻的悸动，像气泡水一样咕噜咕噜冒出来。把这份甜蜜存进心里的罐头里吧。", "被人稳稳接住的感觉真好。愿这份温暖像涟漪一样，扩散到生活的每一个角落。"],
    '健康/身材': ["感觉到身体的轻盈了吗？这是它对你说谢谢呢！保持这份活力，去拥抱今天的阳光。", "无论是瘦了一斤由于睡个好觉，都是身体给你的礼物。好好享受这份掌控感。"],
    '家庭': ["家的温暖，由于一碗热汤，由于一盏留给你的灯。抓住这微小的幸福，它是抵御寒冷的火。", "看到家人的笑脸，心都化了吧？这些平凡的瞬间，构成了生活最温柔的底色。"],
    '人际关系': ["遇到同频的人，像在大海里遇到了另一只孤鲸。珍惜这份由于的懂得，它比金子还珍贵。", "被善意对待的瞬间，世界都变得可爱了。记得把这份善意传递下去哦，让温暖流动起来。"],
    '说不清': ["说不出的开心？那一定是灵魂在跳舞！跟着感觉走，今天你就是最幸运的小孩。", "嘴角忍不住上扬？那就尽情笑吧！快乐不需要理由，它就是生活给你最好的奖赏。"]
  }
};

// V3.2 Healing Medicine Wall Data (Categorized by Mood + Context)
// Structure: Record<Mood, Record<Context, Echo[]>>
export const MOCK_ECHOES_BY_MOOD: Record<string, Record<string, { id: string, content: string, nickname: string, hugs: number, isLiked: false }[]>> = {
  '有点焦虑': {
    '工作/学业': [{ id: 'ax_w_1', content: "明天就要汇报了，PPT改了第十版。看着窗外的灯一家家熄灭，觉得自己好渺小。希望能顺利过关。", nickname: "加班的灯", hugs: 128, isLiked: false }],
    '感情': [{ id: 'ax_l_1', content: "发出去的消息十分钟了还没回。理性告诉我他在忙，感性却在演一出大戏。我在等一个确定的答案。", nickname: "正在输入", hugs: 67, isLiked: false }],
    '健康/身材': [{ id: 'ax_h_1', content: "体检报告还没出来，心里七上八下的。发誓以后再也不熬夜了，希望身体能原谅我这一次。", nickname: "养生朋克", hugs: 89, isLiked: false }],
    '家庭': [{ id: 'ax_f_1', content: "那是我想去的一线城市，也是父母极力反对的远方。夹在梦想和孝顺之间，每一步都走得好沉重。", nickname: "候鸟", hugs: 156, isLiked: false }],
    '人际关系': [{ id: 'ax_s_1', content: "刚发的朋友圈没人点赞，是不是我说错话了？这种小心翼翼维持人设的感觉，真的好累。", nickname: "透明人", hugs: 45, isLiked: false }],
    '说不清': [{ id: 'ax_u_1', content: "没有具体的事，就是心慌，像暴雨前的低气压。可能只是太久没晒太阳了吧，明天要去见见光。", nickname: "阴天快乐", hugs: 112, isLiked: false }]
  },
  '好累呀': {
    '工作/学业': [{ id: 'tr_w_1', content: "刚下班，地铁上挤得脚不沾地。闭上眼听着歌，假装自己是在去海边的路上。好想关机三天。", nickname: "电池0%", hugs: 210, isLiked: false }],
    '感情': [{ id: 'tr_l_1', content: "维持一段需要时刻讨好的关系，比加一周班还累。今天不想懂事了，只想做个任性的小孩。", nickname: "不想说话", hugs: 99, isLiked: false }],
    '健康/身材': [{ id: 'tr_h_1', content: "减肥吃草的第三天，饿得头晕眼花。看到路边的炸鸡店，差点哭出来。做美女真的好难啊。", nickname: "吃草羊", hugs: 78, isLiked: false }],
    '家庭': [{ id: 'tr_f_1', content: "过年回家全是催婚催生。应付亲戚比应付客户还心累。好想回自己的出租屋躺着。", nickname: "春节逃兵", hugs: 145, isLiked: false }],
    '人际关系': [{ id: 'tr_s_1', content: "周末聚会回来，感觉身体被掏空。比起无效社交，我更想一个人宅着看猫和老鼠。", nickname: "社恐星人", hugs: 66, isLiked: false }],
    '说不清': [{ id: 'tr_u_1', content: "躺在床上连翻身的力气都没有。生活像一团湿棉花，堵得慌。今晚什么都不想做，允许自己摆烂。", nickname: "咸鱼", hugs: 133, isLiked: false }]
  },
  '乱乱的': {
    '工作/学业': [{ id: 'cf_w_1', content: "大家都在卷，只有我在想辞职去卖煎饼果子。是该坚持不喜欢但稳定的工作，还是冒险去追梦？", nickname: "煎饼摊主", hugs: 341, isLiked: false }],
    '感情': [{ id: 'cf_l_1', content: "理智说该分手，回忆说舍不得。心被拉扯成两半，像个坏掉的摆钟。到底该听谁的？", nickname: "左右", hugs: 88, isLiked: false }],
    '健康/身材': [{ id: 'cf_h_1', content: "这儿疼那儿痒，查了百度以为得了绝症。身体的信号太复杂了，我听不懂。谁来给我个说明书？", nickname: "百度医学生", hugs: 55, isLiked: false }],
    '家庭': [{ id: 'cf_f_1', content: "爸妈吵架，我成了传声筒。想逃离，又怕他们伤心。家本该是港湾，怎么成了战场？", nickname: "和平鸽", hugs: 90, isLiked: false }],
    '人际关系': [{ id: 'cf_s_1', content: "明明是好朋友，最近却感觉好远。不知道是哪里出了问题，想问又怕尴尬。友情也会过期吗？", nickname: "过期罐头", hugs: 42, isLiked: false }],
    '说不清': [{ id: 'cf_u_1', content: "房间乱，脑子也乱。像一团解不开的毛线球。也许我该先去洗个头，从头开始清醒。", nickname: "毛线球", hugs: 76, isLiked: false }]
  },
  '想哭': {
    '工作/学业': [{ id: 'sd_w_1', content: "努力了半年的项目被砍了。躲在楼梯间哭完，补好妆继续上班。成年人的崩溃都要调静音。", nickname: "静音模式", hugs: 232, isLiked: false }],
    '感情': [{ id: 'sd_l_1', content: "路过以前一起去的奶茶店，眼泪突然就下来了。原谅我还没法笑着祝福你。我真的很想你。", nickname: "念旧", hugs: 178, isLiked: false }],
    '健康/身材': [{ id: 'sd_h_1', content: "看到镜子里憔悴的脸，突然好心疼自己。生病的时候一个人去医院，那一刻真的觉得好孤单。", nickname: "孤独患者", hugs: 156, isLiked: false }],
    '家庭': [{ id: 'sd_f_1', content: "电话里听到妈妈咳嗽的声音，突然意识到他们老了。我在长大，他们在变老，时间能不能慢点？", nickname: "时光机", hugs: 199, isLiked: false }],
    '人际关系': [{ id: 'sd_s_1', content: "被信任的人背刺了。不是因为利益，是因为真心被践踏。原来人心真的隔肚皮。", nickname: "刺猬", hugs: 67, isLiked: false }],
    '说不清': [{ id: 'sd_u_1', content: "听着歌突然就泪流满面。没有具体原因，就是觉得心里下了一场大雨。借我一把伞好吗？", nickname: "大雨", hugs: 143, isLiked: false }]
  },
  '发发呆': {
    '工作/学业': [{ id: 'cl_w_1', content: "开会的时候看着窗外的鸽子飞过。它要去哪里呢？这一分钟，我的灵魂也飞走了，真好。", nickname: "摸鱼达人", hugs: 77, isLiked: false }],
    '感情': [{ id: 'cl_l_1', content: "两个人坐着不说话，各自看书，脚碰着脚。不需要刻意找话题，这种安静让我觉得很舒服。", nickname: "默契", hugs: 92, isLiked: false }],
    '健康/身材': [{ id: 'cl_h_1', content: "躺在瑜伽垫上，听着心跳声。吸气...呼气...感觉身体慢慢沉入地板，像一块融化的黄油。", nickname: "黄油", hugs: 61, isLiked: false }],
    '家庭': [{ id: 'cl_f_1', content: "周末午后，爸妈在午睡，猫在晒太阳。电风扇吱呀吱呀转。这就是我想要的生活吧。", nickname: "午后", hugs: 108, isLiked: false }],
    '人际关系': [{ id: 'cl_s_1', content: "一个人去咖啡馆坐了一下午，看路人来来往往。不用社交，只做个观察者，感觉真自在。", nickname: "隐形人", hugs: 54, isLiked: false }],
    '说不清': [{ id: 'cl_u_1', content: "看雨滴顺着玻璃滑落，看了一小时。什么都没想，脑子空空的，像被洗过一样干净。", nickname: "空白", hugs: 88, isLiked: false }]
  },
  '小确幸': {
    '工作/学业': [{ id: 'jy_w_1', content: "方案一次过！客户还夸我有灵气！今晚必须加个鸡腿，所有的熬夜都值了！", nickname: "过稿锦鲤", hugs: 56, isLiked: false }],
    '感情': [{ id: 'jy_l_1', content: "早起发现牙膏被他挤好了。这些微小的爱意，比一百句我爱你更让我心动。", nickname: "牙膏味", hugs: 120, isLiked: false }],
    '健康/身材': [{ id: 'jy_h_1', content: "昨晚睡了整整8小时，今天皮肤都在发光！早起跑了3公里，感觉自己能打死一头牛！", nickname: "生龙活虎", hugs: 42, isLiked: false }],
    '家庭': [{ id: 'jy_f_1', content: "回家吃到妈妈做的红烧肉，还是那个味儿！有什么比一顿家常饭更治愈的呢？", nickname: "红烧肉", hugs: 66, isLiked: false }],
    '人际关系': [{ id: 'jy_s_1', content: "收到很久没联系的朋友寄来的明信片。原来即使不常联系，也有人把你会放心上。", nickname: "见字如面", hugs: 39, isLiked: false }],
    '说不清': [{ id: 'jy_u_1', content: "刚出地铁就看到了双彩虹！旁边的小朋友兴奋地尖叫。今天的运气一定爆棚！", nickname: "彩虹糖", hugs: 77, isLiked: false }]
  }
};

export const DASHBOARD_DATA = {
  scenarios: [
    // Vibrant "Dopamine" Colors with gradients for new UI
    {
      id: 'relax',
      title: '放松',
      subtitle: '白茶',
      iconType: 'leaf',
      status: 'active',
      // Using gradient classes for the card background
      gradient: 'from-orange-50 to-amber-50',
      accent: 'text-dopamine-orange',
      shadow: 'shadow-orange-200/50',
      iconBg: 'bg-orange-100'
    },
    {
      id: 'focus',
      title: '专注',
      subtitle: '木樨',
      iconType: 'flame',
      status: 'locked',
      gradient: 'from-lime-50 to-green-50',
      accent: 'text-lime-600',
      shadow: 'shadow-lime-200/50',
      iconBg: 'bg-lime-100'
    },
    {
      id: 'sleep',
      title: '助眠',
      subtitle: '蔷薇',
      iconType: 'moon',
      status: 'locked',
      gradient: 'from-violet-50 to-purple-50',
      accent: 'text-violet-600',
      shadow: 'shadow-violet-200/50',
      iconBg: 'bg-violet-100'
    },
    {
      id: 'sos',
      title: '急救',
      subtitle: '山鬼',
      iconType: 'snowflake',
      status: 'locked',
      gradient: 'from-rose-50 to-pink-50',
      accent: 'text-rose-600',
      shadow: 'shadow-rose-200/50',
      iconBg: 'bg-rose-100'
    },
  ] as const,
  lifestyle: {
    title: "直面情绪 · 宠爱自己",
    subtitle: "关注内心的喜好，在衣食住行中学会自我疗愈。",
    tag: "小屿和生活",
    action: "探索品牌空间",
    slogan: "不开心也没关系呀 🧸\n换件舒服的衣服，吃口甜甜的茶食，\n做回那个被宠爱的小朋友吧 ✨",
    categories: ["衣", "食", "住", "行"]
  }
};

// 10 minutes in milliseconds for immersion time
export const IMMERSION_DURATION = 10 * 60 * 1000;