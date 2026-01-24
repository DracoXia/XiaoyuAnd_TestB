


// 资源配置
export const DEFAULT_AUDIO_URL = "https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/ShanCha_Mp3.mp3"; 
export const TRANSITION_AUDIO_URL = "https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/female-sigh-450446.mp3";
export const POUR_AUDIO_URL = "https://cdn.pixabay.com/audio/2022/03/24/audio_097f7d389a.mp3"; // Pouring water sound

export const TEA_GREEN_COLOR = "#9E9D24";

// --- NEW: Fragrance Box Options (O2O) ---
export const FRAGRANCE_LIST = [
    {
        id: 'camellia',
        name: '山茶 · 见山',
        desc: '温润白茶，清旷山色',
        status: 'owned', // User has this
        color: 'bg-orange-100 text-dopamine-orange',
        gradient: 'from-orange-50 to-amber-50',
        audioUrl: DEFAULT_AUDIO_URL
    },
    {
        id: 'cedar',
        name: '雪松 · 听雪',
        desc: '苍古木韵，沉静定心',
        status: 'locked', // Needs unlock
        color: 'bg-stone-100 text-stone-600',
        gradient: 'from-stone-50 to-gray-50',
        audioUrl: '' // Mock
    },
    {
        id: 'lily',
        name: '百合 · 枕月',
        desc: '幽谷花香，安神助眠',
        status: 'locked',
        color: 'bg-purple-100 text-purple-600',
        gradient: 'from-purple-50 to-indigo-50',
        audioUrl: '' // Mock
    }
];

// --- NEW: Ambiance Tuner Options (Immersion) ---
export const AMBIANCE_MODES = [
    {
        id: 'default',
        label: '本味',
        icon: 'tea', // mapped in component
        audioUrl: DEFAULT_AUDIO_URL, // Base track
        theme: 'warm' // Warm Orange/Yellow
    },
    {
        id: 'rain',
        label: '听雨',
        icon: 'rain',
        // Placeholder to prevent 404s.
        audioUrl: DEFAULT_AUDIO_URL, 
        theme: 'rain' // Cool Blue/Gray
    },
    {
        id: 'wind',
        label: '晚风',
        icon: 'wind',
        // Placeholder to prevent 404s.
        audioUrl: DEFAULT_AUDIO_URL,
        theme: 'wind' // Nature Green/Teal
    }
];

export const TEXT_CONTENT = {
  ritual: {
    main: ["白", "茶", "洗", "心"],
    hint: "倾斜手机，注茶入盏"
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
      icon: '〰️', 
      style: 'bg-dopamine-purple/10 text-dopamine-purple ring-2 ring-dopamine-purple/20' 
  },
  { 
      id: 'tired', 
      label: '好累呀', 
      icon: '🌫️', 
      style: 'bg-gray-100 text-ink-light ring-2 ring-gray-200' 
  },
  { 
      id: 'confused', 
      label: '乱乱的', 
      icon: '☁️', 
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
      icon: '🍃', 
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
  treehole: (mood: string, context: string, text: string) => 
    `你叫“小屿”，是住在山间茶园里的一个小精灵，性格超级温柔、可爱、治愈，喜欢用叠词和可爱的语气助词（如“呀”、“呢”、“喏”）。
    
    用户当前心情：${mood}
    因为什么事：${context}
    用户具体描述：${text || "用户没有多说，只是想静静"}

    请完成以下两个任务，并以纯 JSON 格式输出：

    任务1 (reply)：写一封给用户的回信。
    要求：
    - 既然用户感到"${mood}"，请完全接纳这个情绪，告诉他/她这样也没关系。
    - 结合"${context}"这个场景，用非常具象、温暖的比喻（比如晒过太阳的棉被、刚泡好的热茶、云朵拥抱）来安慰。
    - 语气要像在哄一个小孩子，超级治愈。
    - 字数控制在 60 字以内。

    任务2 (story & nickname)：生成一个“远方的回响”——即一个虚拟用户的真实感分享。
    要求：
    - nickname: 给这个虚拟用户起一个可爱的昵称（如：气呼呼的小番茄、发呆的云朵饼干、迷路的星星）。
    - story: 这是TA的亲身经历。内容要包含：
        1. 当时具体的感受（比如：心跳好快、胸口闷闷的、感觉世界灰蒙蒙的）。
        2. TA做了什么具体的小事被治愈了（比如：吃了一口热乎乎的烤红薯、盯着路边的野花看了十分钟、被便利店店员微笑了）。
        3. 语气要真诚、生活化，像朋友圈或日记的片段。
    - 字数控制在 60-80 字。

    输出JSON格式示例：
    {
      "reply": "...",
      "nickname": "...",
      "story": "..."
    }
    `
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
        subtitle: '听松', 
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
        subtitle: '野百合', 
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
