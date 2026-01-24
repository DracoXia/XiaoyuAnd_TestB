
# 小屿和香 - 山茶 (ShanCha) - 产品开发文档

## 1. 项目概述
本项目为「小屿和香」品牌旗下「山茶」系列线香的移动端数字化体验 Web App。设计旨在通过极简的东方美学视觉与听觉引导，营造“推门见山”的意境，陪伴用户度过 10 分钟的燃香冥想时光。

## 2. 核心体验流程

### 2.1 引导页 (Landing Phase)
*   **视觉**: 全屏背景图（山色），叠加动态雾气效果 (`DynamicBackground`)。
*   **交互**: 
    *   中心按钮：“推门，见山色”。
    *   点击反馈：播放转场音效（呼吸/叹息声），界面产生模糊与放大动效，平滑过渡至沉浸态。

### 2.2 沉浸页 (Immersion Phase)
*   **核心功能**: 
    *   **白噪音**: 自动播放定制的山茶主题背景音（循环）。
    *   **诗歌动画**: 11 行诗歌配合呼吸节奏缓缓浮现 (`animate-float`)。
    *   **溯源入口**: 底部“溯源 · 安心”按钮，点击弹出产品成分（白花银针、山茶花等）与安全说明。
*   **计时逻辑**: 
    *   持续 **10 分钟** (`IMMERSION_DURATION = 600,000ms`)。
    *   倒计时结束后，触发音频淡出并转场。

### 2.3 结束页 (Ending Phase)
*   **视觉**: 背景压暗，显示“制香师说”卡片。
*   **音频处理**: 背景音乐执行 **5 秒线性淡出** (Fade-out)，实现无痕静音，避免突然中断的突兀感。
*   **内容**: 
    *   核心金句：“香为茶之神，茶为香之骨。”
    *   交互：点击引用语或箭头可展开完整品牌故事。
    *   行动点 (CTA)：加入社群。

## 3. 视觉与交互规范

*   **色彩体系**:
    *   Zen White: `#F9F9F7` (卡片背景)
    *   Ink Gray: `#5E5A55` (文字主色)
    *   Ink Light: `#9CA3AF` (辅助文字)
    *   Dopamine Colors: 引入多巴胺色系（橙、绿、蓝等）用于情绪表达与仪表盘。
*   **字体**: 宋体/衬线体优先 (`Noto Serif SC`, `Source Han Serif SC`)。
*   **动效**: 
    *   `mist`: 背景云雾的双层反向流动。
    *   `float`: 文字上下浮动，模拟呼吸感。

## 4. 资源配置 (Assets Configuration)

目前核心媒体资源配置如下：

| 资源类型 | 用途 | URL 地址 |
| :--- | :--- | :--- |
| **图片** | 背景主图 | `https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/BG%20%281%29.png` |
| **图片** | 仪表盘-生活Banner | `https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/xiaoyuAnd.jpg` |
| **音频** | 背景白噪音 | `https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/ShanCha_Mp3.mp3` |
| **音频** | 转场音效 | `https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/female-sigh-450446.mp3` |
| **音频** | 倒水音效 | `https://cdn.pixabay.com/audio/2022/03/24/audio_097f7d389a.mp3` |

## 5. 版本记录 (Changelog)

### v1.2.0 (Current - Dashboard & Healing Update)
*   [Feature] **树洞升级**: AI 回复逻辑重构，支持 JSON 结构化输出。新增“远方的回响”模块，提供虚拟用户的相似经历与治愈故事，增强社群陪伴感。
*   [UI] **仪表盘重构**: 采用“多巴胺”配色体系，优化卡片视觉层级；新增“小屿和生活”运营板块。
*   [Asset] **素材更新**: 更新 Dashboard 生活板块 Banner 图与主背景音频配置。

### v1.1.1 (Fix)
*   [Fix] **Audio URL**: 修复 `DEFAULT_AUDIO_URL` 404 错误，替换为可用的冥想白噪音占位符。

### v1.1.0
*   [Infra] **CDN 迁移**: 静态资源全面迁移至腾讯云 COS。
*   [Audio] 更新转场音效与背景音乐源文件。

### v1.0.3
*   [UX] 沉浸时间设定为 10 分钟。
*   [UI] 优化沉浸页文案排版，增加顶部留白。
*   [Audio] 实现 Session 结束时的 5 秒音频自动淡出功能。

### v1.0.2
*   [Feature] 新增“溯源·安心”产品成分弹窗。
*   [Visual] 引入动态云雾背景。

## 6. 待办事项 (To-Do)
*   [ ] 增加多语种诗歌支持。
*   [ ] 优化不同屏幕比例下的背景图适配（Object-fit 策略）。
*   [ ] 完善“小屿和生活”子页面的详细内容开发。
