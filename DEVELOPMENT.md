# 白茶 (White Tea) - 开发文档

## 项目概述
本项目为「白茶」疗愈线香的移动端交互 Web App。设计旨在通过极简的视觉与听觉引导，帮助用户从点燃线香的仪式感过渡到内心的沉浸状态。

## 视觉与交互规范 (Design & Interaction)

### 1. 视觉体系 (Visual Identity)
*   **核心理念**: 极简主义、留白、东方美学 (Zen aesthetics)。
*   **字体**: 优先使用衬线体 (`Noto Serif SC`, `Source Han Serif SC`, `Songti SC`)，强调人文气息。
*   **动画**: 使用纯 CSS 动画 (`animate-mist`, `animate-float`) 模拟烟雾流动与光影变化，避免使用重型视频素材以保证加载速度。

### 2. 配色方案 (Color Palette)
| 色彩名称 | Hex Code | 用途 |
| :--- | :--- | :--- |
| **Zen White** | `#F9F9F7` | 沉浸页主背景，营造温暖纸张感 |
| **Pure Black** | `#000000` | 首屏背景，营造未推门前的幽暗 |
| **Ink Gray** | `#5E5A55` | 主要文字，模拟淡墨色 |
| **Zen Gray** | `#E0DFDB` | 分割线、边框 |
| **Ink Light** | `#9CA3AF` | 次要信息、注释 |

## 功能模块 (Features)

### 1. 首屏 (Landing)
*   **风格**: 全黑背景，白色细线按钮。
*   **入口**: 纯净背景，仅保留“推门，见山色”交互按钮。
*   **行为**: 点击后背景由黑转白 (Fade to White)，无缝切换至沉浸模式。

### 2. 沉浸页 (Immersion)
*   **核心体验**: 1分钟倒计时（测试用，模拟一炷香的时间）。
*   **内容展示**: 居中悬浮三段式意境文案，底部静态箭头提示下滑。
*   **交互**: 
    *   主屏无多余信息，仅有诗歌。
    *   下滑查看产品详情（毛玻璃效果）。
*   **音频控制**: 包含静音/播放切换及自定义音频链接入口。

### 3. 结束态 (Ending)
*   **触发**: 倒计时结束后自动触发。
*   **转场**: 
    *   背景压暗 (Backdrop blur)。
    *   音频在 5 秒内线性淡出 (Fade out)。
*   **内容**: 展示“制香师说”，支持点击展开阅读完整品牌故事。

## 技术栈 (Tech Stack)
*   **Framework**: React 18
*   **Styling**: Tailwind CSS (with custom config for colors and animations)
*   **Icons**: Lucide React
*   **Build**: Standard ES6 Modules

## 版本记录 (Changelog)

### v1.0.2 (2025-02-15) - The "Zen" Update
*   [Visual] 首屏改为全黑背景，实现点击后“由暗见明”的转场效果。
*   [Content] 沉浸页文案精简为三段式，意境更深远。
*   [Interaction] 简化下滑提示，移除文字与跳动动画，仅保留静态箭头，减少干扰。
*   [UI] Landing 页按钮适配黑色背景（白色样式）。

### v1.0.1 (2025-02-15)
*   [Content] 更新沉浸页意境文案，采用四段式诗歌排版。
*   [UI] 优化沉浸页文本行间距 (`space-y-6`) 与字体大小，增强移动端阅读体验。
*   [UI] 为文案添加交错浮动动画效果。

### v1.0.0 (Initial Release)
*   [Feature] 完成全链路交互开发 (Landing -> Immersion -> Ending)。
*   [UI] 实现动态烟雾与光影背景效果。
*   [Audio] 集成无UI音频播放器，支持平滑淡出效果。
*   [Audio] 增加自定义音频源 (URL) 设置功能。
*   [Responsive] 适配移动端与桌面端布局。

## 待办事项 (To-Do)
*   [ ] 优化音频在 iOS Safari 下的自动播放策略。
*   [ ] 增加更多预设环境音效（如雨声、林间）。
*   [ ] 考虑增加 Web Share API 分享功能。
