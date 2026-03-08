
# 小屿和 - 开发文档

## 1. 项目概述

小屿和是一个智能疗愈伴侣应用，为渴望片刻喘息的都市岛民提供精神自留地。

**品牌 Slogan**: 和自己，好好在一起

**当前版本**: v2.6.0 (NFC Gift Feature)

**品牌命名规范**: 详见 [brand_naming_specification.md](../../docs/brand_naming_specification.md)

---

## 2. 线香产品规格

### 2.1 SKU 概览

首发 3 款线香，采用"心理坐标"命名法：

| 正式名称 | 内部代号 | 心理坐标 | Slogan 延展 |
| :--- | :--- | :--- | :--- |
| **听荷** | 莲蕊 | 澄澈：独处的静谧时刻 | 和清静在一起 |
| **晚巷** | 木樨 | 安抚：卸下防备的温暖归途 | 和温柔在一起 |
| **小院** | 绿薄荷 | 呼吸：都市中的自然野趣 | 和自在在一起 |

### 2.2 香型与音频映射

| 香型 | Layer 1 场景音 | 视觉色调 |
| :--- | :--- | :--- |
| **听荷** | 水滴声 + 晨间鸟鸣 | 🪷 莲粉 |
| **晚巷** | 秋雨声 + 晚风 | 🟡 桂金 |
| **小院** | 森林环境音 + 草叶沙沙 | 🟢 苔绿 |

---

## 3. 核心体验流程

### 3.0 仪表盘 (Dashboard) - 入口
*   **功能**: 展示香型卡片（听荷、晚巷、小院）
*   **交互**: 点击卡片直接进入沉浸页
*   **视觉**: 多巴胺配色卡片 + 品牌生活理念

### 3.1 仪式页 (Ritual) - 可选入口
*   **视觉风格**: 沉浸式暗色调 (`#121212`)
*   **交互**: 上划屏幕，模拟"点一支香"
*   **烟雾引擎**: Canvas 粒子系统

### 3.2 沉浸页 (Immersion)
*   **双层音频系统**:
    *   **Layer 1 (场景音)**: 基础白噪音背景 (`currentAudioUrl`)
    *   **Layer 2 (功能底噪)**: 可叠加的功能噪音 (`layer2AudioUrl`)
        | 模式 | ID | 音频类型 |
        |------|-----|---------|
        | 🍃 本味 | `original` | 无叠加 |
        | 🌙 入眠 | `sleep` | 粉红噪音 |
        | 💨 冥想 | `meditate` | 棕色噪音 |
*   **动态诗歌**: 根据所选香型显示对应场景描述诗歌
    | 香型 | 诗歌片段 |
    |------|----------|
    | **听荷** | 荷塘无声 / 晨露在碧绿的荷叶间 / 轻轻滚动 / 此间独坐 / 听荷声 / 见清静 |
    | **晚巷** | 老巷深处 / 秋雨过后，夕阳在青石板上 / 染了一层金 / 此间驻足 / 寻香去 / 见温柔 |
    | **小院** | 山间小院 / 苔藓在石阶上 / 静静生长 / 此间躺卧 / 听风过 / 见自在 |
*   **计时**: 10 分钟 (`IMMERSION_DURATION = 600,000ms`)

### 3.3 树洞页 (Treehole)
*   **简化流程**:
    1. 心情选择 (有点焦虑、有点累、有点乱、有点难过、想静静、小确幸)
    2. 场景识别 (工作/学业、感情、健康/身材、家庭、人际关系、说不清)
    3. 小屿的回信 (AI 生成)
    4. 同频回响 (匿名邻居分享)

---

## 4. 品牌用词规范

### 4.1 Do (提倡)

| 推荐用词 | 场景 |
| :--- | :--- |
| **岛民** | 称呼用户 |
| **邻居** | App 内其他用户 |
| **带走 / 请回** | 购买行为 |
| **点一支** | 使用线香 |
| **器物** | 产品统称 |

### 4.2 Don't (禁止)

| 禁止用词 | 替代建议 |
| :--- | :--- |
| 客户 | 岛民 |
| 下单 / 购买 | 带走 / 请回 |
| 燃烧 | 点燃 / 点一支 |
| 奢侈 / 顶级 / 极致 | 用产品故事替代 |

---

## 5. 技术架构

### 5.1 组件结构
```
App.tsx
├── Phase 状态管理 (AppPhase enum)
├── AudioPlayer (Layer 1)
├── AudioPlayer (Layer 2)
├── DynamicBackground
├── Ritual (条件渲染)
├── Immersion (内联渲染)
├── Treehole (内联渲染)
└── Dashboard
    └── AuthModal (登录 UI 展示)
```

### 5.2 目录结构
```
lib/
├── analytics/           # 数据埋点系统
│   ├── types.ts         # 事件类型定义
│   ├── analyticsService.ts
│   ├── entryDetection.ts
│   ├── userService.ts
│   └── supabaseClient.ts
├── user/                # 用户设置服务 (v2.5.1 新增)
│   └── userSettingsService.ts
├── gift/                # NFC 赠送功能 (v2.6.0 新增)
│   ├── types.ts         # 赠送类型定义
│   ├── api.ts           # 赠送 API 封装
│   └── index.ts         # 模块导出
├── nfc/                 # NFC 扫描工具 (v2.6.0 新增)
│   ├── reader.ts        # Web NFC API 封装
│   └── index.ts         # 模块导出
└── music/               # 歌单导入服务
    ├── types.ts
    └── parser.ts

components/
├── auth/                # 认证组件 (v2.5.1 新增)
│   └── AuthModal.tsx
├── GiftSetupModal.tsx   # 赠送设置弹窗 (v2.6.0 新增)
├── GiftReceivedModal.tsx # 接收礼物弹窗 (v2.6.0 新增)
├── PlaylistModal.tsx
├── Dashboard.tsx
└── ...
```

### 5.2 核心状态

| 状态 | 类型 | 说明 |
|------|------|------|
| `phase` | `AppPhase` | 当前页面阶段 |
| `currentAudioUrl` | `string` | Layer 1 音频 URL |
| `layer2AudioUrl` | `string` | Layer 2 音频 URL |
| `activeAmbianceId` | `string` | 当前氛围模式 ID |
| `aiResult` | `TreeholeResult` | AI 回复结果 |

---

## 6. 数据埋点系统

### 6.1 架构概览

```
lib/analytics/
├── types.ts              # 类型定义和事件接口
├── analyticsService.ts   # 核心分析服务
├── entryDetection.ts     # NFC 入口检测工具
├── userService.ts        # 匿名用户管理
├── supabaseClient.ts     # Supabase 客户端
└── index.ts              # 公共 API 导出
```

### 6.2 数据库表结构

| 表名 | 用途 | 关键字段 |
|------|------|---------|
| `users` | 匿名用户 | `device_id`, `is_anonymous`, `nfc_id` (v2.5.1+), `preferences` JSONB (v2.5.1+) |
| `sessions` | 疗愈会话 | `entry_type`, `fragrance_id`, `duration_seconds`, `audio_mode` |
| `mood_records` | 心情记录 | `mood_after`, `context`, `self_evaluation` |
| `social_interactions` | 社交互动 | `interaction_type` (give_hug, etc.) |
| `analytics_events` | 事件埋点 | `event_type`, `event_data` (JSONB) |
| `gifts` | NFC 赠送 (v2.6.0+) | `nfc_id`, `giver_name`, `message`, `playlist_url`, `playlist_id`, `playlist_name`, `status`, `redeemed_at` |

#### sessions.audio_mode 字段

| 值 | 含义 | 对应功能 |
|---|---|---|
| `silent` | 静默模式 | 关闭所有声音 |
| `natural` | 本味 | 仅 Layer 1 场景音（默认） |
| `pink` | 粉红噪音 | 入眠模式 |
| `brown` | 棕色噪音 | 冥想模式 |

### 6.3 事件类型

| 事件 | 触发时机 | 数据字段 |
|------|---------|---------|
| `fragrance_confirm` | 香型确认点击 | `fragranceId`, `entryType`, `wasSwitched` |
| `fragrance_switch` | 香型切换 | `fromFragranceId`, `toFragranceId` |
| `ritual_complete` | 仪式完成 | `fragranceId` |
| `audio_mode_change` | 音频模式切换 | `fromMode`, `toMode` (silent/natural/pink/brown) |
| `mood_select` | 心情选择 | `mood` |
| `context_select` | 场景选择 | `context`, `mood` |
| `give_hug` | 给予拥抱 | `targetEchoId` |
| `auth_modal_opened` | 打开登录弹窗 | - |
| `auth_phone_entered` | 输入手机号 | `phone` (脱敏) |
| `auth_dev_notice_shown` | 显示开发中提示 | `phone` (脱敏) |
| `auth_skip_clicked` | 点击稍后再说 | - |
| `nfc_user_created` | NFC 新用户创建 | `nfcId` |
| `nfc_user_restored` | NFC 老用户恢复 | `nfcId` |
| `preference_updated` | 偏好设置更新 | `key`, `value` |

### 6.4 NFC 入口检测

**架构**（统一入口）:
```
NFC 芯片 → /api/nfc → Netlify Function → 重定向（带时间戳）
```

**URL 格式**:
- NFC 写入（统一入口）: `https://xiaoyuandincense.netlify.app/api/nfc`
- 重定向后: `https://xiaoyuandincense.netlify.app/?nfc=1&t=1739534xxx`

**检测逻辑**:
- `nfc=1`: 标识来自 NFC 扫描
- `t`: 时间戳（毫秒），由 Netlify Function 动态生成
- 只有 5 分钟内的访问才被识别为 NFC 入口
- 过期链接/书签自动识别为 Dashboard 入口

**验证状态** (2026-02-14):
| 测试场景 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|------|
| 有效 NFC 链接 | `entry_type = 'nfc'` | ✅ 正确 | 通过 |
| 过期链接（>5分钟） | `entry_type = 'dashboard'` | ✅ 正确 | 通过 |
| 数据库记录 | 正确存储 entry_type | ✅ 正确 | 通过 |

**Netlify Function** (`netlify/functions/nfc.ts`):
```typescript
// NFC 扫描 → 生成时间戳 → 重定向
export const handler = async (event) => {
  const timestamp = Date.now();
  return {
    statusCode: 302,
    headers: { 'Location': `/?nfc=1&t=${timestamp}` }
  };
};
```

**使用方式**:
```typescript
import { detectEntryType } from './lib/analytics';

// 检测入口类型
const result = detectEntryType();
// { type: 'nfc', isFromNFC: true }
```

### 6.5 NFC 用户设置 (v2.5.1 新增)

**架构设计**:
```
NFC 芯片 (nfc_id: "nfc_abc123")
        │
        ▼
Supabase users 表
  ├── device_id (当前设备)
  ├── nfc_id (关联的 NFC 芯片)
  ├── preferences JSONB (用户偏好设置)
  │     ├── favorite_fragrance: "wanxiang"
  │     ├── audio_mode: "natural"
  │     ├── playlist: {...}
  │     └── notifications: true
  └── created_at
```

**核心服务** (`lib/user/userSettingsService.ts`):
| 方法 | 功能 |
|------|------|
| `getOrCreateUserByNFC(nfcId)` | 通过 NFC ID 获取或创建用户 |
| `getPreferences(userId)` | 获取用户偏好设置 |
| `updatePreference(userId, key, value)` | 更新单个偏好设置 |
| `linkNFCtoUser(userId, nfcId)` | 将 NFC 绑定到现有用户 |

**使用示例**:
```typescript
import { userSettingsService } from './lib/user/userSettingsService';

// NFC 扫描后获取/创建用户
const result = await userSettingsService.getOrCreateUserByNFC('nfc_abc123');
if (result.isNew) {
  // 首次扫描，创建新用户
  console.log('欢迎新岛民！');
} else {
  // 再次扫描，恢复设置
  const prefs = await userSettingsService.getPreferences(result.user.id);
  console.log('欢迎回来！您喜欢的香型是:', prefs.favorite_fragrance);
}
```

### 6.6 验证指标对照

| PRD 指标 | 数据库支持 | 查询方式 |
|---------|-----------|---------|
| NFC 激活率 | ✅ | `sessions WHERE entry_type='nfc'` |
| Session Duration | ✅ | `sessions.duration_seconds` |
| One-Tap Success | ✅ | `analytics_events` → `wasSwitched=false` |
| Audio Completion Rate | ✅ | `sessions.audio_mode` (静音率 = silent占比) |
| Mood Shift | ⚠️ 部分 | `mood_records.mood_after` (缺会前心情) |
| Echo Interaction | ✅ | `social_interactions WHERE type='give_hug'` |

**查询音频模式使用统计**:
```sql
SELECT
  audio_mode,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM sessions
GROUP BY audio_mode;
```

---

## 7. 资源配置

| 资源类型 | 用途 | 来源 |
| :--- | :--- | :--- |
| 背景图片 | 主背景 | 腾讯云 COS |
| 音频 (Layer 1) | 场景白噪音 | 腾讯云 COS |
| 音频 (Layer 2) | 粉噪/棕噪 | 本地 `/Audio` 目录 |
| 转场音效 | 页面切换 | Pixabay CDN |

---

## 8. 版本历史

### v2.6.0 (NFC Gift Feature) - Current
*   [Feature] **NFC 赠送功能**:
    - Dashboard 头部新增礼物图标按钮（替代原 Apple Music 入口）
    - 点击触发 GiftSetupModal 赠送设置弹窗
    - 支持设置：礼物名称、赠言、网易云歌单链接
    - 扫描 NFC 完成绑定，将礼物信息存储到 Supabase
    - 同一 NFC 芯片可被他人扫描，自动弹出 GiftReceivedModal 接收礼物
*   [Feature] **品牌化文案**:
    - 弹窗标题：「把一首歌，送给重要的人」
    - 表单标签：「这份礼物的名字」「想对TA说的话」「一首陪伴的歌」
    - 按钮：「保存到产品」
    - 符合品牌命名规范中的"心理坐标"命名法
*   [Tech] **NFC 扫描封装**:
    - `lib/nfc/reader.ts`: Web NFC API 封装
    - 支持开发环境模拟扫描 (`mockNFCScan`)
    - 自动检测设备 NFC 支持情况
*   [Database] **Supabase 迁移**:
    - `supabase/migrations/002_gifts.sql`: 新增 gifts 表
    - 字段：`nfc_id`, `giver_name`, `message`, `playlist_url`, `playlist_id`, `playlist_name`, `status`, `created_at`, `redeemed_at`
    - 状态：`pending`（待领取）/ `redeemed`（已领取）
*   [Files] **新增文件**:
    - `lib/gift/types.ts`: 赠送功能类型定义
    - `lib/gift/api.ts`: 赠送功能 API 封装
    - `lib/gift/index.ts`: 模块导出
    - `lib/nfc/reader.ts`: NFC 扫描工具
    - `lib/nfc/index.ts`: 模块导出
    - `components/GiftSetupModal.tsx`: 赠送设置弹窗
    - `components/GiftReceivedModal.tsx`: 接收礼物弹窗
    - `supabase/migrations/002_gifts.sql`: 数据库迁移脚本
*   [Files] **修改文件**:
    - `lib/music/types.ts`: `MusicPlatform` 从 `apple` 改为 `gift`
    - `lib/music/parser.ts`: 新增 `gift` 平台解析逻辑
    - `components/Dashboard.tsx`: 新增礼物按钮
    - `components/PlaylistModal.tsx`: 替换 Apple Music 为「朋友的礼物」
*   [Docs] **PRD 更新**: 新增 R013 (NFC 赠送功能)

### v2.5.1 (Login UI & NFC User Settings)
*   [Feature] **登录 UI 展示** (V1 MVP):
    - Dashboard 头部新增用户图标按钮
    - 点击触发 AuthModal 登录弹窗
    - 手机号格式验证 (中国大陆 11 位)
    - 点击"获取验证码"显示"功能开发中"提示
    - 支持"稍后再说"跳过登录
    - UI 风格与现有 App 保持统一 (圆角 2rem, dopamine-orange 主题)
*   [Feature] **NFC 用户设置**:
    - 数据库迁移: `users` 表新增 `nfc_id`, `preferences` 字段
    - 支持 NFC 芯片关联用户身份
    - JSONB 存储用户偏好设置
    - 同一 NFC 在不同设备可恢复设置
*   [Analytics] **埋点系统增强**:
    - 新增登录相关事件: `auth_modal_opened`, `auth_phone_entered`, `auth_dev_notice_shown`, `auth_skip_clicked`
    - 新增 NFC 用户事件: `nfc_user_created`, `nfc_user_restored`, `preference_updated`
*   [Files] **新增文件**:
    - `supabase/migrations/003_nfc_user_settings.sql`: 数据库迁移脚本
    - `lib/user/userSettingsService.ts`: NFC 用户设置服务
    - `lib/user/__tests__/userSettingsService.test.ts`: 单元测试 (3 tests)
    - `components/auth/AuthModal.tsx`: 登录 UI 组件
    - `components/auth/__tests__/AuthModal.test.tsx`: 组件测试 (11 tests)
*   [Docs] **PRD 更新**: 新增 R011 (登录 UI 展示), R012 (NFC 用户设置)

### v2.5.0 (Custom Playlist Integration)
*   [Feature] **用户歌单导入**:
    - 沉浸页 Ambiance Tuner 区域新增 "+" 按钮
    - 支持网易云音乐、Apple Music 歌单链接导入
    - 小屿和音乐库 (Coming Soon) 预留入口
*   [Feature] **"我的" 播放模式**:
    - 导入歌单后，Ambiance Tuner 显示 "我的" 模式按钮
    - 选择 "我的" 模式时，播放用户自定义歌单
    - 官方音频自动静音，避免冲突
*   [UI] **引导流程**:
    - 四步引导：欢迎页 → 平台选择 → 链接输入 → 成功确认
    - 品牌化文案：与疗愈调性一致
    - localStorage 持久化存储用户歌单
*   [Tech] **嵌入式播放器方案**:
    - 网易云：`//music.163.com/outchain/player?type=0&id={id}&auto=1`
    - Apple Music：`https://embed.music.apple.com/playlist/pl.{id}`
    - 隐藏 iframe 实现无侵入播放
*   [Files] **新增文件**:
    - `lib/music/types.ts`: 音乐平台类型定义
    - `lib/music/parser.ts`: 链接解析与播放器 URL 生成
    - `components/PlaylistModal.tsx`: 歌单导入弹窗组件
*   [Tests] **E2E 测试覆盖**:
    - `e2e/playlist.spec.ts`: 14 个测试用例
    - 覆盖完整导入流程、错误处理、持久化验证

### v2.4.2 (Audio Mode Tracking)
*   [Feature] **音频模式追踪**:
    - 数据库迁移: `sessions` 表新增 `audio_mode` 字段
    - 支持四种模式: `silent`, `natural`, `pink`, `brown`
    - 默认值: `natural`
*   [Analytics] **埋点系统更新**:
    - `types.ts`: 新增 `AudioMode` 类型
    - `types.ts`: 新增 `AudioModeChangeEventData` 事件接口
    - `analyticsService.ts`: `startSession()` 支持 `audioMode` 参数
    - `analyticsService.ts`: 新增 `updateAudioMode()` 方法
*   [Docs] **PRD 指标支持**: 现在可以追踪 Audio Completion Rate

### v2.4.1 (NFC Unified Entry)
*   [Refactor] **NFC 架构简化**:
    - 统一入口：从 `/api/nfc/{fragranceId}` 改为 `/api/nfc`
    - 移除 `fragranceId` 从 URL，简化 NFC 芯片写入流程
    - 使用 `nfc=1` 参数标识 NFC 扫描（替代 `nfc=fragranceId`）
*   [Fix] **Netlify redirects 顺序**:
    - 修复 `/api/nfc` 被 `/*` 通配符拦截的问题
    - API 路由必须放在 SPA 路由之前
*   [Fix] **音频 403 错误**:
    - 替换失效的 Pixabay CDN 链接
    - 暂时复用已有腾讯云 COS 音频
*   [Verify] **入口检测测试通过**:
    - ✅ 有效 NFC 链接正确识别
    - ✅ 过期链接正确识别为 dashboard
    - ✅ Supabase 数据记录正确

### v2.4.0 (Analytics & Tracking)
*   [Feature] **数据埋点系统**:
    - 基于 Supabase 的匿名用户追踪
    - 完整事件类型定义 (`types.ts`)
    - 分析服务封装 (`analyticsService.ts`)
*   [Feature] **NFC 入口检测** (`entryDetection.ts`):
    - Netlify Functions 动态时间戳生成
    - 时间窗口验证 (5 分钟)
    - URL 参数清理
*   [Feature] **关键埋点**:
    - `fragrance_confirm`: 香型确认（漏斗关键节点）
    - `entryType`: 区分 NFC/Dashboard 入口
    - `wasSwitched`: One-Tap Success 指标
*   [Infra] **Netlify Functions**: NFC 动态重定向 (`netlify/functions/nfc.ts`)
*   [Config] **Supabase RLS 策略**: 匿名用户 INSERT/UPDATE/SELECT 权限
*   [Docs] **PRD 指标核对**: 验证数据库配置与 PRD 关键指标匹配度

### v2.3.0 (Immersion Experience)
*   [UI] **大地色调系统**:
    - 全局背景: `#f7f5f2` (禅意背景)
    - 大地色系: taupe (`#8d7d77`), sage (`#949b8a`), sand (`#f2ede4`), clay (`#bfa594`)
    - 线香专属色 (低饱和度，保持区分度):
      - 听荷: lotus-pink (`#e8ccc8`) / lotus-pink-dark (`#c4908a`) - 莲粉
      - 晚巷: osmanthus-gold (`#e8dcc0`) / osmanthus-gold-dark (`#c4a060`) - 桂金
      - 小院: moss-green (`#d4ddd4`) / moss-green-dark (`#9aab9a`) - 苔绿
*   [UI] **Dashboard 卡片展开重构**:
    - 移除底部浮动按钮区域
    - 将"点一支"和"查看香方"按钮整合到展开的卡片内
    - 展开卡片显示：香材标签 + 香型名称 + 故事描述 + 操作按钮
*   [UI] **"点一支"按钮样式升级**:
    - 图标: `Flame` (火焰图标，符合燃香意境)
    - 背景: `#3a3530` (深棕黑色)
    - 文字: `#f2ede4` (米白色/沙色)
    - 字体: 衬线斜体 (`font-serif italic`)
*   [UI] **香方详情弹窗重设计**:
    - 统一使用香型主题色调
    - 内容顺序：先"制香师说"，后"安心说明"
    - 移除重复的香方详情列表
*   [Feature] **沉浸页静态渐变背景**:
    - 三层径向渐变叠加，营造深度感
    - 听荷: 莲粉渐变 (`primary: rgba(196,144,138,0.7)`, `secondary: rgba(232,204,200,0.6)`)
    - 晚巷: 桂金渐变 (`primary: rgba(196,160,96,0.7)`, `secondary: rgba(232,220,192,0.6)`)
    - 小院: 苔绿渐变 (`primary: rgba(154,171,154,0.65)`, `secondary: rgba(212,221,212,0.6)`)
*   [Feature] **文案呼吸动画**:
    - 动画名称: `textBreathe`
    - 周期: 4秒 (`ease-in-out infinite`)
    - 效果: 透明度 0.7 → 1.0，位移 Y: 0 → -3px
    - 错开延迟: 每行 0.8s
*   [Feature] **音频慢速淡入**:
    - 从 Dashboard 进入沉浸页时生效
    - 时长: 8秒
    - 目标音量: 90%
    - 实现方式: 160 步 × 50ms/步
*   [Test] **测试覆盖**:
    - 新增 Dashboard.test.tsx
    - TDD 开发流程
*   [Refactor] **组件更新**:
    - `App.tsx`: 添加 `scentId` 传递给 `DynamicBackground`，更新音频淡入逻辑
    - `Dashboard.tsx`: 展开卡片 UI 重构，按钮样式更新，大地色调适配
    - `DynamicBackground.tsx`: 新增 `scentId` prop，香型特定渐变色，移除动画
    - `constants.ts`: 更新 FRAGRANCE_LIST、DASHBOARD_DATA 配色
    - `index.html`: 添加大地色调变量，更新 `textBreathe` 动画

### v2.2.0 (Brand Aligned)
*   [Brand] **品牌命名规范**: 采用"心理坐标"命名法
*   [Brand] **线香重命名**: 听荷、晚巷、小院 (原：白茶、木樨、蔷薇)
*   [Brand] **Slogan 更新**: "和自己，好好在一起"
*   [Brand] **用词规范**: 使用"岛民"、"点一支香"、"带走"等品牌词汇
*   [Brand] **心情选项优化**: 有点累、有点乱、有点难过、想静静
*   [Feature] **沉浸页动态诗歌**: 每款香型拥有独特的场景描述诗歌
    - 听荷: "荷塘无声 / 晨露在碧绿的荷叶间 / 轻轻滚动..."
    - 晚巷: "老巷深处 / 秋雨过后，夕阳在青石板上 / 染了一层金..."
    - 小院: "山间小院 / 苔藓在石阶上 / 静静生长..."
*   [Refactor] **代码更新**: App.tsx 新增 `getImmersionPoem()` 动态诗歌选择函数
*   [Refactor] **常量更新**: constants.ts 更新 FRAGRANCE_LIST、TEXT_CONTENT 等配置

### v2.1.0 (Dual Layer Audio)
*   [Feature] 双层音频系统
*   [Feature] 三种氛围模式
*   [Refactor] 树洞流程简化

### v1.2.2 (Visual Polish)
*   沉浸式暗黑模式
*   烟雾粒子算法升级
*   无缝转场逻辑

---

## 9. 待办事项

### 优先级高
- [ ] **代码重构**: 将 App.tsx 拆分为自定义 Hooks 和子组件
- [ ] **类型完善**: 移除 `@ts-ignore` 注释
- [ ] **错误处理**: 添加音频加载失败的友好提示

### 优先级中
- [ ] 添加多语种诗歌支持
- [ ] 优化不同屏幕比例的背景图适配
- [ ] 完善品牌生活方式页面
- [ ] 添加本地音频文件的 CDN 支持
- [ ] 添加 `mood_before` 字段支持 Mood Shift 指标
- [ ] 添加购买数据表支持复购率追踪

### 优先级低
- [ ] PWA 支持（离线使用）
- [ ] 用户数据持久化

---

## 10. 开发指南

### 本地开发
```bash
npm install
npm run dev
```

### 环境变量
创建 `.env.local` 文件：
```
GEMINI_API_KEY=your_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 构建生产版本
```bash
npm run build
npm run preview
```

### Netlify 部署

**NFC API 路由**（统一入口）:
```
/api/nfc  →  Netlify Function  →  重定向到 /?nfc=1&t=时间戳
```

**netlify.toml 配置要点**:
- API 路由必须放在 SPA 路由（`/*`）之前
- 使用 `force = true` 确保重定向生效

**本地测试 Functions**:
```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 本地运行（包括 Functions）
netlify dev
```

**部署**:
- 推送到 main 分支自动部署
- PR 自动生成预览链接

### 验证数据埋点
```sql
-- 查看最近的 fragrance_confirm 事件
SELECT
  event_type,
  event_data->>'entryType' as entry_type,
  event_data->>'fragranceId' as fragrance_id,
  event_data->>'wasSwitched' as was_switched,
  created_at
FROM analytics_events
WHERE event_type = 'fragrance_confirm'
ORDER BY created_at DESC
LIMIT 10;
```

---

*小屿和 · 和自己，好好在一起*
