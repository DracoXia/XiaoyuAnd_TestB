import type { PRDContent } from './types';

/**
 * 小屿和 PRD v2.3 展示内容
 * 数据来源: docs/xiaoyu_incense_prd_v2.0.md
 */
export const PRD_CONTENT: PRDContent = {
  // ==================== Hero Section ====================
  hero: {
    brandName: '小屿和',
    brandNameEn: 'Xiaoyu And',
    chineseName: '小屿和',
    tagline: '线香即入口',
    taglineEn: 'Incense First',
    version: 'v2.3',
    lastUpdated: '2026-02-13',
  },

  // ==================== Philosophy Section ====================
  philosophy: {
    title: '产品核心策略',
    subtitle: 'Incense First',
    description:
      '区别于传统IoT设备"App控制一切"的逻辑，本产品强调物理世界的优先性。用户的使用旅程始于"点烟"这一物理仪式，App仅作为增强体验的"伴侣"（Companion），而非遥控器。',
    contrastPoints: [
      {
        traditional: 'App 控制一切',
        ourApproach: '物理入口，App 为伴侣',
      },
      {
        traditional: '用户需要学习操作',
        ourApproach: '点香即开始，零学习成本',
      },
      {
        traditional: '数字优先的设计',
        ourApproach: '仪式感优先的设计',
      },
    ],
  },

  // ==================== Kano Model Section ====================
  kanoModel: {
    title: 'Kano模型需求分析',
    subtitle: '基于"焦虑都市白领"画像的需求验证',
    features: [
      {
        feature: 'NFC一触即连',
        category: 'must-be',
        psychology:
          '基础门槛。打破物理与数字的界限，必须做到"即扫即用"，任何延迟都会破坏体验。',
      },
      {
        feature: '线香品质/气味',
        category: 'one-dimensional',
        psychology: '核心复购逻辑。香味越高级，用户粘性越高。',
      },
      {
        feature: '"点火即入口"流程',
        category: 'delighter',
        psychology:
          '减法设计。消除"选择困难症"，保护用户极低的决策能量。',
      },
      {
        feature: '音频分层 (意境+底噪)',
        category: 'one-dimensional',
        psychology:
          '允许用户在"听故事"和"助眠/专注"之间无缝切换，一香多用。',
      },
      {
        feature: 'Zen Bottle (漂流瓶)',
        category: 'delighter',
        psychology: '极简社交。提供"我在场，但我互不打扰"的安全陪伴感。',
      },
      {
        feature: '传统社区 (点赞/发帖)',
        category: 'reverse',
        psychology: '也就是"负分项"。焦虑用户在疗愈时极度排斥社交评价压力。',
      },
    ],
  },

  // ==================== Hypotheses Section ====================
  hypotheses: {
    title: '核心假设与验证体系',
    subtitle: '任何创新产品都是建立在一系列"赌注"（假设）之上的',
    hypotheses: [
      {
        id: 'h1',
        type: 'behavioral',
        title: '行为假设',
        titleEn: 'The Behavioral Hypothesis',
        description:
          '用户愿意为了"听觉+视觉"的增强体验，多做一个"拿出手机-NFC扫码"的动作，而不是觉得麻烦直接点香就完事。',
        riskPoint:
          '这是最大的断点。如果用户觉得"我只想闻个味，不想拿手机"，App的日活（DAU）就会极低，沦为一次性工具。',
        metrics: [
          {
            name: 'NFC 激活率',
            definition: '(NFC扫码启动次数 / 线香实际消耗支数)',
            target: '体验装3支香至少1次启动',
          },
          {
            name: 'Session Duration',
            definition: '用户扫码后的平均停留时长',
            target: '> 5分钟',
          },
        ],
      },
      {
        id: 'h2',
        type: 'emotional',
        title: '情感假设',
        titleEn: 'The Emotional Hypothesis',
        description:
          '线香提供的"嗅觉"和App提供的"视听觉"结合，能产生比单点香更强的疗愈效果（1+1>2），从而让用户产生依赖。',
        riskPoint: '音频太鸡肋，或者和香味不搭，用户觉得"多此一举"。',
        metrics: [
          {
            name: '复购率',
            definition: '买了体验装的人，有多少买了正装',
            target: '> 15%',
          },
          {
            name: 'Audio Completion Rate',
            definition: '用户是否手动关闭了背景音',
            target: '< 30%',
          },
          {
            name: 'Mood Shift',
            definition: '"开始前心情"和"结束后心情"的变化差值',
            target: '80%的用户情绪改善',
          },
        ],
      },
      {
        id: 'h3',
        type: 'social',
        title: '社交假设',
        titleEn: 'The Social Hypothesis',
        description:
          '焦虑的都市人虽然社恐，但渴望"匿名的、安全的、同频的"陪伴（树洞/回响）。',
        riskPoint: '用户只想静静，极其反感在放松时候还要看别人的废话。',
        metrics: [
          {
            name: 'UGC 参与率',
            definition: '疗愈结束后，有多少人愿意写下感悟',
            target: '> 10%',
          },
          {
            name: 'Echo Interaction',
            definition: '有多少人点了"给予拥抱"',
            target: '> 5%',
          },
        ],
      },
    ],
  },

  // ==================== User Flow Section ====================
  userFlow: {
    title: '用户体验地图',
    flows: [
      {
        id: 'nfc',
        name: 'NFC 入口',
        nameEn: 'NFC Entry',
        steps: 6,
        ritualLevel: 5,
        stepsList: [
          {
            step: 1,
            action: '点燃线香',
            touchpoint: '物理线香 (火/烟)',
            expectation: '这个味道让我安心',
          },
          {
            step: 2,
            action: 'NFC 触碰',
            touchpoint: 'NFC 感应 → 香型确认页',
            expectation: '一触即连，直接开始',
          },
          {
            step: 3,
            action: '确认香型',
            touchpoint: '香型确认卡片',
            expectation: '选择我想要的味道',
          },
          {
            step: 4,
            action: '沉浸疗愈',
            touchpoint: '双层音频 + 视觉微光',
            expectation: '带我去森林/古寺/海岛',
          },
          {
            step: 5,
            action: '记录心情',
            touchpoint: '心情选择 + AI 回信',
            expectation: '有人懂我',
          },
          {
            step: 6,
            action: '收到回响',
            touchpoint: '同频回响',
            expectation: '我也能温暖别人',
          },
        ],
      },
      {
        id: 'dashboard',
        name: 'Dashboard 入口',
        nameEn: 'Dashboard Entry',
        steps: 5,
        ritualLevel: 3,
        stepsList: [
          {
            step: 1,
            action: '打开 App',
            touchpoint: 'Dashboard 场景卡片',
            expectation: '快速开始',
          },
          {
            step: 2,
            action: '选择场景',
            touchpoint: '一键进入',
            expectation: '直达沉浸',
          },
          {
            step: 3,
            action: '沉浸疗愈',
            touchpoint: '双层音频 + 氛围调节',
            expectation: '灵活调整氛围',
          },
          {
            step: 4,
            action: '记录心情',
            touchpoint: '心情/场景选择器',
            expectation: '简化倾诉流程',
          },
          {
            step: 5,
            action: '收到回响',
            touchpoint: 'AI 回信 + 同频回响',
            expectation: '社交情感连接',
          },
        ],
      },
    ],
  },

  // ==================== Product Lineup Section ====================
  productLineup: {
    title: '线香产品规格',
    subtitle: '首发3款线香，采用"心理坐标"命名法',
    products: [
      {
        id: 'wanxiang',
        name: '晚巷',
        nameEn: 'Evening Alley',
        internalCode: '木樨',
        vibe: '安抚：卸下防备的温暖归途',
        slogan: '和温柔在一起',
        ingredients: ['桂花', '苏合香', '安息香', '香草'],
        scentProfile: '甜美花果香、温暖、怀旧',
        inspiration:
          '儿时记忆中的老巷子，秋雨后的甜美气息，金色夕阳，童年记忆',
        mood: '秋雨后的老巷、金色夕阳、童年记忆',
        recommendedTime: '下午、夜晚',
        audioLayer1: '秋雨声 + 晚风',
        visualTone: '暖金色调',
        colorCode: '桂金',
        gradient: 'from-amber-50 to-yellow-50',
      },
      {
        id: 'tinghe',
        name: '听荷',
        nameEn: 'Listening to Lotus',
        internalCode: '莲蕊',
        vibe: '澄澈：独处的静谧时刻',
        slogan: '和清静在一起',
        ingredients: ['九品香水莲', '斑斓叶'],
        scentProfile: '清雅、水生花香、略带草木气息',
        inspiration: '长明岛荷塘，文人对莲的圣洁之爱',
        mood: '夏日荷塘、晨露、文人雅集',
        recommendedTime: '清晨、傍晚',
        audioLayer1: '水滴声 + 晨间鸟鸣',
        visualTone: '粉白渐变',
        colorCode: '莲粉',
        gradient: 'from-pink-50 to-rose-50',
      },
      {
        id: 'xiaoyuan',
        name: '小院',
        nameEn: 'Small Yard',
        internalCode: '绿薄荷',
        vibe: '呼吸：都市中的自然野趣',
        slogan: '和自在在一起',
        ingredients: ['苔藓', '薄荷油', '百里香', '迷迭香', '鼠尾草'],
        scentProfile: '清凉草本、绿意盎然、略带泥土气息',
        inspiration: '秦岭山居，清雅文人的草药庭院',
        mood: '山间庭院、苔藓石阶、夏日采摘',
        recommendedTime: '上午、下午',
        audioLayer1: '森林环境音 + 草叶沙沙',
        visualTone: '清新绿意',
        colorCode: '苔绿',
        gradient: 'from-green-50 to-emerald-50',
      },
    ],
  },

  // ==================== Strategy Section ====================
  strategy: {
    title: '三阶段假设验证路径',
    subtitle: '硬件即入口，流量带周边',
    stages: [
      {
        id: 'stage1',
        stage: 1,
        name: '点亮孤岛',
        nameEn: 'Early Stage',
        strategicGoal:
          '单品爆破，验证"物理入口"的有效性。在这个阶段，你不是在做一个品牌，而是在做一款必须要买的香插。',
        hypotheses: [
          {
            id: 'h1',
            content:
              '用户愿意为了"视听嗅"通感体验，养成"先扫NFC再点香"的新习惯',
            metric: 'NFC 激活率',
            target: '> 60%',
          },
          {
            id: 'h2',
            content:
              '用户认可线香的品质与情绪价值，会在用完体验装后复购官方线香',
            metric: '线香复购率',
            target: '> 25%',
          },
          {
            id: 'h3',
            content: '用户愿意为"智能+疗愈"支付比传统香插高3倍的价格',
            metric: '众筹/首发销量及转化率',
            target: '-',
          },
        ],
        keyActions: [
          {
            dimension: '硬件',
            action:
              '发布 小屿和·智能香插 (Gen 1)，极致打磨"点火-扫码-出声"的 3秒体验',
          },
          {
            dimension: '软件',
            action:
              '上线 App 1.0，核心功能仅保留：NFC唤醒、音频分层、基础心情日记',
          },
          {
            dimension: '耗材',
            action: '首发"晚巷、听荷、小院"三款核心线香',
          },
        ],
        milestones: [
          '获得 1,000 名种子用户，NFC 日活率达到 20%',
          '线香（耗材）的月复购金额开始覆盖 App 服务器与运营成本',
          '小红书上出现用户自发的"点香仪式感"视频笔记 > 100 篇',
        ],
      },
      {
        id: 'stage2',
        stage: 2,
        name: '连接群岛',
        nameEn: 'Middle Stage',
        strategicGoal:
          '品类扩张，验证"生活方式"的迁移能力。此阶段硬件开始退居幕后，成为流量的"水龙头"。',
        hypotheses: [
          {
            id: 'h1',
            content:
              '认可香插体验的用户，信任"小屿和"的审美，愿意购买非智能的疗愈周边',
            metric: '周边产品连带率',
            target: '> 15%',
          },
          {
            id: 'h2',
            content:
              '用户不仅在晚上点香，也愿意在睡眠、办公等场景使用 App 的软件功能',
            metric: '非NFC启动的 App 使用时长增长',
            target: '-',
          },
          {
            id: 'h3',
            content:
              'App 内的商城（小屿和·物）能成为比天猫店转化率更高的私域渠道',
            metric: 'App 内购买占比',
            target: '> 40%',
          },
        ],
        keyActions: [
          {
            dimension: '硬件',
            action:
              '推出 小屿和·助眠灯 (Gen 2) 或 便携香氛 (Lite)，覆盖卧室或通勤场景',
          },
          {
            dimension: '周边',
            action:
              '上线"小屿和·物"系列（如：印有Slogan的帆布袋、配套的茶具、冥想坐垫）',
          },
          {
            dimension: '软件',
            action:
              'App 2.0，上线"社区/回响"功能，增加"睡眠模式"和"专注模式"的纯软件入口',
          },
        ],
        milestones: [
          '拥有 2 款智能硬件 + 10 款生活周边 SKU',
          '非线香类的周边收入占比达到 30%',
          'App 注册用户突破 5 万，且 20% 的成交来自 App 内部',
        ],
      },
      {
        id: 'stage3',
        stage: 3,
        name: '构建屿宙',
        nameEn: 'Late Stage',
        strategicGoal:
          '生态闭环，类似"米家"但更聚焦精神疗愈。此时"小屿和"是一个IP，一种认证标准。',
        hypotheses: [
          {
            id: 'h1',
            content:
              '第三方疗愈品牌愿意接入"小屿和"生态，使用我们的 App 协议和音频内容',
            metric: 'B端合作意向',
            target: '-',
          },
          {
            id: 'h2',
            content:
              '基于用户长期的心情与生理数据，AI 能提供精准的身心健康解决方案',
            metric: 'AI 付费课程/服务订阅率',
            target: '-',
          },
          {
            id: 'h3',
            content:
              '"小屿和"成为一种生活风格的代名词，用户整屋的软装和氛围设备都倾向于选择该品牌',
            metric: '全屋套系购买率',
            target: '-',
          },
        ],
        keyActions: [
          {
            dimension: '开放生态',
            action:
              '发布 "Xiaoyu Link" 协议，允许第三方疗愈设备接入 App，共享"场景音"和"心情数据"',
          },
          {
            dimension: '内容付费',
            action:
              '推出大师级的冥想课程、心理咨询服务或定制化的 AI 音乐会员',
          },
          {
            dimension: '线下空间',
            action: '开设"小屿和·体验馆"，将线上的视听嗅体验搬到线下实体店',
          },
        ],
        milestones: [
          '拥有 > 5 家生态链合作伙伴',
          '积累了百万级的都市白领"焦虑-疗愈"行为数据，成为行业权威',
          '大众提到"疗愈家居"或"中式生活美学"，第一时间想到"小屿和"',
        ],
      },
    ],
  },

  // ==================== Roadmap Section ====================
  roadmap: {
    title: '功能开发路线图',
    subtitle: '需求池与决策逻辑',
    features: [
      {
        id: 'R001',
        name: 'NFC 唤醒',
        description: '手机触碰香插极速唤醒 App',
        priority: 'P0',
        status: 'completed',
        version: 'v2.0',
      },
      {
        id: 'R002',
        name: '双层音频系统',
        description: 'Layer 1 场景音 + Layer 2 底噪调节',
        priority: 'P0',
        status: 'completed',
        version: 'v2.1',
      },
      {
        id: 'R003',
        name: '静默模式',
        description: '一键关闭所有声音，仅保留视觉引导',
        priority: 'P0',
        status: 'completed',
        version: 'v2.1',
      },
      {
        id: 'R004',
        name: 'AI 治愈回信',
        description: '基于 Gemini 的心情回复',
        priority: 'P0',
        status: 'completed',
        version: 'v2.1',
      },
      {
        id: 'R005',
        name: '同频回响',
        description: '匿名用户分享匹配',
        priority: 'P1',
        status: 'completed',
        version: 'v2.1',
      },
      {
        id: 'R006',
        name: '开机祝福语',
        description: '送礼定制场景，收礼人首次扫码展示祝福',
        priority: 'P1',
        status: 'in-progress',
        version: 'v2.3',
      },
      {
        id: 'R007',
        name: '日签分享',
        description: '生成可分享的心情卡片',
        priority: 'P1',
        status: 'planned',
        version: 'v2.3',
      },
      {
        id: 'R008',
        name: '可赠送歌单',
        description: '分享自己喜欢的白噪音组合',
        priority: 'P2',
        status: 'planned',
        version: 'v2.5',
      },
      {
        id: 'R009',
        name: '更多香型',
        description: '扩展线香 SKU',
        priority: 'P2',
        status: 'planned',
        version: 'v3.0',
      },
      {
        id: 'R010',
        name: 'PWA 支持',
        description: '离线使用能力',
        priority: 'P3',
        status: 'planned',
        version: 'v3.0',
      },
      {
        id: 'R011',
        name: '外部歌单导入',
        description: '关联用户的网易云喜欢歌单',
        priority: 'P3',
        status: 'not-recommended',
        version: '-',
      },
      {
        id: 'R012',
        name: 'AI音乐生成',
        description: 'AI根据关键词生成当前心情音乐',
        priority: 'P3',
        status: 'not-recommended',
        version: '-',
      },
    ],
  },

  // ==================== Business Model Section ====================
  businessModel: {
    title: '商业模式',
    subtitle: '米家模式演变',
    summary:
      '硬件即入口，流量带周边。前期靠"硬"（极致的香插体验）把门打开，中期靠"软"（动人的生活方式）把人留住，后期靠"宽"（开放的生态链接）把钱赚到。',
    revenueStreams: [
      {
        id: 'stream1',
        name: '线香耗材',
        description: '高频复购，核心营收来源',
        type: 'consumable',
      },
      {
        id: 'stream2',
        name: '生活周边',
        description: '高毛利，品牌延伸（帆布袋、茶具、冥想坐垫等）',
        type: 'peripheral',
      },
      {
        id: 'stream3',
        name: '智能硬件',
        description: '第二款硬件覆盖更多场景（助眠灯、便携香氛）',
        type: 'hardware',
      },
      {
        id: 'stream4',
        name: '生态合作品牌',
        description: '第三方设备接入 Xiaoyu Link 协议',
        type: 'service',
      },
      {
        id: 'stream5',
        name: '内容/服务订阅',
        description: '冥想课程、心理咨询、AI 音乐会员',
        type: 'service',
      },
    ],
  },
};
