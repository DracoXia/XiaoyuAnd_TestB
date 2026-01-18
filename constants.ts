// 使用腾讯云 COS 加载音频资源
export const DEFAULT_AUDIO_URL = "https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/ShanCha_Mp3.mp3";
export const TRANSITION_AUDIO_URL = "https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/female-sigh-450446.mp3";

export const TEXT_CONTENT = {
  landing: "推门，见山色",
  immersion: [
    "庭院无声",
    "暖阳在白瓷杯盏间",
    "打了个盹",
    "", // Spacer
    "浮动的茶烟",
    "唤醒了远方的山岚",
    "在清旷的留白里",
    "", // Spacer
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
  },
  ending: {
    title: "制香师说",
    quote: "「香为茶之神，茶为香之骨。」",
    body: [
      "曾经营茶楼数载",
      "深感一泡茶的生命转瞬即逝",
      "遂取“菜茶”原生种之野气",
      "合白兰之清芬",
      "雪松之坚韧",
      "",
      "苏轼有云",
      "“焚香引幽步，酌茗开净筵”",
      "",
      "我不愿这支香",
      "只是室内的一种味道",
      "我希望它是一场",
      "『对花独酌，焚香默坐』",
      "的基本归心"
    ],
    cta: "加入小屿和香的社群"
  }
};

// 10 minutes in milliseconds for immersion time
export const IMMERSION_DURATION = 10 * 60 * 1000;