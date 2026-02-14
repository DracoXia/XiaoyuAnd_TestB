<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 小屿和 (Xiaoyu And)

**版本**: v2.5.0 (Mood Recording Simplified)

> "和自己，好好在一起"

小屿和是一个智能疗愈伴侣应用，为渴望片刻喘息的都市岛民提供精神自留地。区别于传统 IoT 设备，我们强调**物理世界的优先性**——点一支香，App 自然唤醒，陪伴你度过一段疗愈时光。

## 核心理念

*   **Incense First (线香即入口)**: 物理点香动作触发数字体验，而非 App 遥控物理设备。
*   **One-Tap Connection (一触即连)**: NFC 极速唤醒，解决蓝牙配对痛点。
*   **Layered Immersion (分层沉浸)**: 叙事音频 (Layer 1) + 可调功能底噪 (Layer 2) 的双层听觉设计。
*   **Echo (同频回响)**: AI 治愈回信 + 匿名共鸣，提供安全的倾诉空间。

## 线香产品

> **品牌命名规范**: 详见 [brand_naming_specification.md](../../docs/brand_naming_specification.md)

采用"心理坐标"命名法，首发三款：

| 正式名称 | 心理坐标 | Slogan 延展 |
| :--- | :--- | :--- |
| **听荷** | 澄澈：独处的静谧时刻 | 和清静在一起 |
| **晚巷** | 安抚：卸下防备的温暖归途 | 和温柔在一起 |
| **小院** | 呼吸：都市中的自然野趣 | 和自在在一起 |

## 核心功能

### 1. 仪表盘 (Dashboard)
*   香型卡片入口：听荷、晚巷、小院
*   点击卡片直接进入沉浸体验

### 2. 沉浸式疗愈播放器 (Immersion)
*   **Layer 1 (场景音)**: 绑定香型的叙事背景音
*   **Layer 2 (功能底噪)**: 可调节的功能噪音层
    *   🍃 **本味**: 原始场景音
    *   🌙 **入眠**: 粉红噪音 (Pink Noise) - 更柔和的高频衰减
    *   💨 **冥想**: 棕色噪音 (Brown Noise) - 深度沉浸
*   **品牌诗歌**: "和自己，好好在一起"
*   **10分钟疗愈**: 自动淡出并引导至树洞

### 3. 树洞 (Treehole) - 情绪疗愈
*   **简化流程**: 心情选择 → 场景识别 → AI 回信 → 带着能量出发
*   **小屿的回信**: 基于 Google Gemini 模型生成治愈系回应（360 条预设回复）
*   **预设回复矩阵**: 6 种心情 × 6 种情景 = 36 个组合，每组 10 条精选文案

### 4. 仪式页 (Ritual) - 可选入口
*   Canvas 烟雾粒子动画引擎
*   上划交互模拟"点一支香"仪式
*   无缝淡入过渡到沉浸页

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 6 |
| UI 组件 | Lucide React (图标) |
| AI 服务 | Google Gemini API |
| 音频引擎 | HTML5 Audio API |
| 数据分析 | Supabase (PostgreSQL) |
| 托管平台 | Netlify (SPA + Functions) |

## 项目结构

```
xiaoyuAnd/
├── docs/                          # 产品文档
│   ├── xiaoyu_incense_prd_v2.0.md # 产品需求文档
│   └── brand_naming_specification.md # 品牌命名规范
├── Scent_V1.0/
│   ├── XiaoyuAnd/                 # 主应用
│   │   ├── App.tsx                # 主应用入口
│   │   ├── constants.ts           # 常量配置
│   │   ├── lib/
│   │   │   └── analytics/         # 数据埋点系统
│   │   │       ├── types.ts       # 类型定义
│   │   │       ├── analyticsService.ts  # 分析服务
│   │   │       ├── entryDetection.ts    # NFC 入口检测
│   │   │       └── userService.ts       # 用户服务
│   │   ├── netlify/
│   │   │   └── functions/
│   │   │       └── nfc.ts         # NFC 动态重定向
│   │   ├── netlify.toml           # Netlify 配置
│   │   └── components/
│   │       ├── AudioPlayer.tsx    # 音频播放器
│   │       ├── Dashboard.tsx      # 仪表盘
│   │       ├── Ritual.tsx         # 仪式页
│   │       └── GeminiService.ts   # AI 服务
│   └── Audio/                     # 本地音频资源
│       ├── low-pink-noise.mp3     # 粉红噪音 (入眠)
│       └── soft-brown-noise.mp3   # 棕色噪音 (冥想)
```

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in `.env.local`:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 版本历史

### v2.4.2 (Audio Mode Tracking)
*   [Feature] **音频模式追踪**:
    - 数据库新增 `sessions.audio_mode` 字段
    - 支持四种音频模式: `silent`(静默), `natural`(本味), `pink`(粉红噪音), `brown`(棕色噪音)
    - 新增 `updateAudioMode()` 方法用于实时更新
*   [Analytics] **埋点类型更新**:
    - 新增 `AudioMode` 类型定义
    - 新增 `audio_mode_change` 事件类型
    - `startSession()` 支持 `audioMode` 参数

### v2.4.1 (NFC Unified Entry)
*   [Refactor] **NFC 架构简化**:
    - 统一入口：从 `/api/nfc/{fragranceId}` 改为 `/api/nfc`
    - 移除香型特定 URL，简化 NFC 芯片写入
    - 使用 `nfc=1` 参数标识 NFC 扫描入口
*   [Feature] **入口检测验证**:
    - ✅ 有效 NFC 链接：正确识别为 `nfc` 入口
    - ✅ 过期链接（>5分钟）：自动识别为 `dashboard` 入口
    - ✅ 数据库记录正确存储 `entry_type` 字段

### v2.4.0 (Analytics & Tracking)
*   [Feature] **数据埋点系统**:
    - 基于 Supabase 的匿名用户追踪
    - 支持 NFC 入口 vs Dashboard 入口区分
    - 完整漏斗追踪: NFC 触发 → 香型确认 → 沉浸时长 → 心情记录 → 社交互动
*   [Feature] **NFC 入口检测**:
    - Netlify Functions 动态生成时间戳
    - 5 分钟时间窗口验证，防止书签误判
    - 自动清理 URL 参数
*   [Feature] **关键指标追踪**:
    - `fragrance_confirm`: 香型确认点击（漏斗关键节点）
    - `wasSwitched`: One-Tap Success 指标
    - `entryType`: 入口类型 (nfc/dashboard)
*   [Infra] **Netlify Functions**: NFC 动态重定向服务
*   [Docs] **RLS 策略**: 匿名用户 Supabase 访问权限配置

### v2.3.0 (Immersion Experience)
*   [UI] **大地色调系统**:
    - 全局背景: `#f7f5f2` (禅意背景)
    - 大地色系: taupe (`#8d7d77`), sage (`#949b8a`), sand (`#f2ede4`), clay (`#bfa594`)
    - 线香专属色 (低饱和度，保持区分度):
      - 听荷: lotus-pink (`#e8ccc8`) / lotus-pink-dark (`#c4908a`) - 莲粉
      - 晚巷: osmanthus-gold (`#e8dcc0`) / osmanthus-gold-dark (`#c4a060`) - 桂金
      - 小院: moss-green (`#d4ddd4`) / moss-green-dark (`#9aab9a`) - 苔绿
*   [UI] **Dashboard 卡片展开重构**: 移除底部浮动按钮，将功能整合到卡片内
*   [UI] **展开卡片内容简化**: 显示故事描述 + "点一支"主按钮 + 香方信息按钮
*   [UI] **"点一支"按钮样式**: 使用 Flame 图标，深棕黑色背景 (`#3a3530`)，米白色文字 (`#f2ede4`)
*   [UI] **香方详情弹窗重设计**: 统一香型主题色调，先展示"制香师说"，再展示"安心说明"
*   [UI] **香型材料标签**: 展开卡片顶部显示前两种香材成分
*   [Feature] **沉浸页静态渐变背景**: 根据香型显示对应的多层渐变色（听荷-莲粉、晚巷-桂金、小院-苔绿）
*   [Feature] **背景层叠效果**: 三层径向渐变叠加，营造深度感
*   [Feature] **文案呼吸动画增强**: 更明显的透明度和位移变化（4秒循环）
*   [Feature] **音频慢速淡入**: 进入沉浸页时音乐从 0 渐变到 90%，时长 8 秒
*   [Test] **TDD 测试覆盖**: Dashboard 展开卡片功能测试，所有测试用例通过

### v2.2.0 (Brand Aligned)
*   [Brand] **品牌命名规范**: 采用"心理坐标"命名法
*   [Brand] **线香重命名**: 听荷、晚巷、小院
*   [Brand] **Slogan 更新**: "和自己，好好在一起"
*   [Brand] **用词规范**: 使用"岛民"、"点一支香"、"带走"等品牌词汇

### v2.1.0 (Dual Layer Audio)
*   [Feature] 双层音频系统
*   [Feature] 三种氛围模式
*   [Refactor] 树洞流程简化

### v2.0.0 (Incense First)
*   [Core] 物理优先设计理念
*   [Feature] NFC 一触即连
*   [Feature] AI 树洞回信

---

<p align="center">
  小屿和 · 和自己，好好在一起
</p>
