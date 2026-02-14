-- ============================================
-- 小屿和数据埋点系统 - 数据库建表脚本
-- ============================================
-- 在 Supabase SQL Editor 中执行此脚本
-- 路径: SQL Editor → New query → 粘贴以下内容 → Run

-- ============================================
-- 1. 用户表 (支持匿名用户)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  is_anonymous BOOLEAN DEFAULT TRUE,
  email TEXT
);

-- 索引：按设备ID快速查找
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);
-- 索引：按活跃时间查询
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at DESC);

-- ============================================
-- 2. 疗愈会话表
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fragrance_id TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('nfc', 'dashboard')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  audio_completed BOOLEAN,
  ambiance_mode TEXT,
  fragrance_switched BOOLEAN DEFAULT FALSE
);

-- 索引：按用户查询会话
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
-- 索引：按开始时间查询
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at DESC);
-- 索引：按香型统计
CREATE INDEX IF NOT EXISTS idx_sessions_fragrance ON sessions(fragrance_id);

-- ============================================
-- 3. 心情记录表
-- ============================================
CREATE TABLE IF NOT EXISTS mood_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mood_after TEXT NOT NULL,
  context TEXT,
  self_evaluation TEXT CHECK (self_evaluation IN ('much_better', 'better', 'same', 'worse')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引：按会话查询心情
CREATE INDEX IF NOT EXISTS idx_mood_session_id ON mood_records(session_id);
-- 索引：按用户查询心情历史
CREATE INDEX IF NOT EXISTS idx_mood_user_id ON mood_records(user_id);

-- ============================================
-- 4. 社交互动表
-- ============================================
CREATE TABLE IF NOT EXISTS social_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('medicine_submit', 'give_hug', 'receive_echo')),
  target_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引：按用户查询互动
CREATE INDEX IF NOT EXISTS idx_social_user_id ON social_interactions(user_id);
-- 索引：按互动类型统计
CREATE INDEX IF NOT EXISTS idx_social_type ON social_interactions(interaction_type);

-- ============================================
-- 5. 事件埋点表（通用）
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引：按事件类型查询
CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type);
-- 索引：按用户查询事件
CREATE INDEX IF NOT EXISTS idx_events_user_id ON analytics_events(user_id);
-- 索引：按时间查询
CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics_events(created_at DESC);
-- GIN 索引：JSONB 字段查询
CREATE INDEX IF NOT EXISTS idx_events_data ON analytics_events USING GIN (event_data);

-- ============================================
-- 6. Row Level Security (RLS) 策略
-- ============================================
-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 匿名用户可以插入自己的数据
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can insert own mood records" ON mood_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can insert own social interactions" ON social_interactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can insert own events" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- 允许公开读取（用于统计，生产环境应更严格）
CREATE POLICY "Public read access" ON analytics_events
  FOR SELECT USING (true);

-- ============================================
-- 7. 实用视图：每日统计
-- ============================================
CREATE OR REPLACE VIEW daily_stats AS
SELECT
  DATE(created_at) as date,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users
FROM analytics_events
GROUP BY DATE(created_at), event_type
ORDER BY date DESC;

-- ============================================
-- 8. 实用视图：会话漏斗统计
-- ============================================
CREATE OR REPLACE VIEW funnel_stats AS
WITH
  session_starts AS (
    SELECT COUNT(DISTINCT session_id) as count FROM analytics_events WHERE event_type = 'session_start'
  ),
  mood_selects AS (
    SELECT COUNT(DISTINCT session_id) as count FROM analytics_events WHERE event_type = 'mood_select'
  ),
  medicine_submits AS (
    SELECT COUNT(DISTINCT session_id) as count FROM analytics_events WHERE event_type = 'medicine_submit'
  ),
  give_hugs AS (
    SELECT COUNT(DISTINCT session_id) as count FROM analytics_events WHERE event_type = 'give_hug'
  )
SELECT
  (SELECT count FROM session_starts) as session_starts,
  (SELECT count FROM mood_selects) as mood_selects,
  (SELECT count FROM medicine_submits) as medicine_submits,
  (SELECT count FROM give_hugs) as give_hugs;

-- ============================================
-- 完成！
-- ============================================
-- 执行成功后，你应该能看到以下表：
-- - users
-- - sessions
-- - mood_records
-- - social_interactions
-- - analytics_events
-- 以及两个视图：
-- - daily_stats
-- - funnel_stats
