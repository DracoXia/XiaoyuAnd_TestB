# E2E Tests for XiaoyuAnd (小屿和香)

This directory contains End-to-End tests for the XiaoyuAnd application using Playwright.

## 数据验证闭环

E2E 测试与 Supabase 数据库形成完整的验证闭环：

```
┌─────────────────────────────────────────────────────────────┐
│                    E2E 测试流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. UI 操作 ──▶ 2. 网络请求 ──▶ 3. 数据库写入              │
│        │              │                │                    │
│        ▼              ▼                ▼                    │
│   Playwright     Supabase API      PostgreSQL              │
│   验证 UI        请求捕获          MCP 验证                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 验证层次

| 层次 | 工具 | 验证内容 |
|------|------|---------|
| UI 层 | Playwright | 用户流程、元素渲染、交互响应 |
| 网络层 | Playwright Network | HTTP 请求/响应、API 调用 |
| 数据层 | Supabase MCP | 数据库记录、数据完整性 |

## Test Structure

```
e2e/
├── pages/              # Page Object Model (POM) classes
│   ├── BasePage.ts     # Common page methods
│   ├── DashboardPage.ts
│   ├── ImmersionPage.ts
│   └── TreeholePage.ts
├── helpers/            # Test utilities and data
│   ├── test-data.ts    # Shared test data
│   ├── test-utils.ts   # Helper functions
│   └── supabase-verify.ts  # Supabase 验证辅助工具
├── dashboard.spec.ts   # Dashboard page tests
├── immersion.spec.ts   # Immersion page tests
├── treehole.spec.ts    # Treehole page tests
├── user-journey.spec.ts # Complete user flow tests
└── analytics.spec.ts    # Data tracking verification tests
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. 确保 `.env.local` 配置正确：
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests in UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### Run tests on specific browser
```bash
npm run test:e2e:chromium
```

### View test report
```bash
npm run test:e2e:report
```

## Test Coverage

### Dashboard Tests (`dashboard.spec.ts`)
- Display verification (greeting, title, scent cards)
- Card expansion and selection
- Session start (ignite button)
- Mood map modal
- Locked scent card handling
- Scent switching

### Immersion Tests (`immersion.spec.ts`)
- Poem display for each scent
- Ambiance mode switching (本味/入眠/冥想)
- Audio controls
- Navigation (mood entry, dashboard)
- Resident count display

### Treehole Tests (`treehole.spec.ts`)
- Mood selection
- Context selection
- AI reply generation
- Healing text submission
- Peer echo display
- Hug action
- Flow completion

### User Journey Tests (`user-journey.spec.ts`)
- Complete end-to-end flows
- Multiple scent scenarios
- All ambiance modes
- Various mood-context combinations
- Edge cases
- State preservation

### Analytics Tests (`analytics.spec.ts`)
- Session start tracking
- Scent switch tracking
- Ambiance mode change tracking
- Mood selection tracking
- Context selection tracking
- Healing submission tracking
- Hug action tracking
- Audio toggle tracking
- Session completion tracking

## Page Object Model

The tests use the Page Object Model pattern for maintainability:

```typescript
// Example: Using Page Objects
const dashboardPage = new DashboardPage(page);
await dashboardPage.goto();
await dashboardPage.igniteScent('tinghe');

const immersionPage = new ImmersionPage(page);
await immersionPage.waitForVisible();
await immersionPage.switchAmbianceMode('入眠');
```

## Supabase MCP 数据验证

### 测试后数据库验证

E2E 测试完成后，使用 Supabase MCP 工具验证数据是否正确写入：

#### 查看最近的会话
```sql
SELECT id, user_id, fragrance_id, entry_type, started_at, duration_seconds
FROM sessions
ORDER BY started_at DESC
LIMIT 10;
```

#### 查看最近的分析事件
```sql
SELECT event_type, event_data, created_at
FROM analytics_events
ORDER BY created_at DESC
LIMIT 20;
```

#### 查看心情记录
```sql
SELECT mood_after, context, self_evaluation, created_at
FROM mood_records
ORDER BY created_at DESC
LIMIT 10;
```

#### 统计各类型事件数量
```sql
SELECT event_type, COUNT(*) as count
FROM analytics_events
GROUP BY event_type
ORDER BY count DESC;
```

#### 漏斗分析
```sql
SELECT * FROM funnel_stats;
```

### 使用 Supabase Verifier

测试中可以使用 `SupabaseVerifier` 类来捕获和验证事件：

```typescript
import { createVerifier, verifyEventFlow } from './helpers/supabase-verify';

test('should track user actions', async ({ page }) => {
  const verifier = createVerifier(page);

  // 执行用户操作...

  // 打印事件摘要
  verifier.printSummary();

  // 验证事件流程
  const expectedEvents = ['session_start', 'mood_select', 'context_select'];
  const result = await verifyEventFlow(verifier, expectedEvents);
  console.log('Event flow:', result);
});
```

## Test Data

Shared test data is available in `helpers/test-data.ts`:

- `TEST_SCENTS`: Available scents with keywords
- `TEST_MOODS`: All mood options
- `TEST_CONTEXTS`: All context options
- `SAMPLE_HEALING_TEXTS`: Pre-written healing texts for testing

## Artifacts

Test artifacts are saved to:
- Screenshots: `test-results/screenshots/`
- Videos: `test-results/videos/`
- Traces: `test-results/traces/`
- HTML Report: `playwright-report/index.html`

## CI/CD Integration

The tests are configured to run in CI environments with:
- Automatic retries on failure
- Parallel test execution
- JUnit XML output
- HTML report generation

## Writing New Tests

1. Create a new spec file in `e2e/`
2. Import necessary Page Objects and SupabaseVerifier
3. Use `test.describe()` to group tests
4. Use semantic locators (data-testid attributes preferred)

Example:
```typescript
import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { createVerifier } from './helpers/supabase-verify';

test.describe('New Feature', () => {
  test('should do something', async ({ page }) => {
    const verifier = createVerifier(page);
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    // Your test code here
    verifier.printSummary();
  });
});
```

## Flaky Test Handling

If a test is flaky:
1. Run it multiple times: `npx playwright test --repeat-each=10`
2. Use `test.fixme()` to quarantine:
```typescript
test.fixme(true, 'Flaky - Issue #123')('flaky test', async ({ page }) => {
  // Test code
});
```

## Troubleshooting

### Tests timeout waiting for element
- Increase timeout in `playwright.config.ts`
- Check if element selector is correct
- Verify element has unique `data-testid` attribute

### Audio-related errors
- Audio is mocked in tests (see `test-utils.ts`)
- Tests verify visual state, not actual audio playback

### Video/screenshot not showing
- Ensure tests are not passing (only captured on failure by default)
- Change `screenshot: 'only-on-failure'` to `screenshot: 'always'` in config

### Supabase connection issues
- Check `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- Verify Supabase project is active
- Check RLS policies allow anonymous inserts

## Analytics Event Types

| 事件类型 | 触发时机 | 数据字段 |
|---------|---------|---------|
| `session_start` | 用户点击香型卡片 | fragranceId, entryType |
| `session_end` | 会话结束 | durationSeconds, audioCompleted |
| `fragrance_switch` | 切换香型 | fromFragranceId, toFragranceId |
| `ambiance_change` | 切换氛围模式 | fromMode, toMode |
| `audio_toggle` | 切换音频 | isPlaying, wasManuallyToggled |
| `mood_select` | 选择心情 | mood |
| `context_select` | 选择语境 | context, mood |
| `medicine_submit` | 提交疗愈内容 | contentLength |
| `give_hug` | 给予拥抱 | targetEchoId |
| `ritual_complete` | 仪式完成 | fragranceId |
