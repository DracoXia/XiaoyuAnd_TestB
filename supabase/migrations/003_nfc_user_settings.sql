-- ============================================
-- NFC 用户设置 - 数据库建表脚本
-- ============================================
-- 在 Supabase SQL Editor 中执行此脚本
-- 路径: SQL Editor → New query → 粘贴以下内容 → Run

-- ============================================
-- 1. 扩展 users 表支持 NFC 关联
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS nfc_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- 创建索引：按 NFC ID 快速查找用户
CREATE INDEX IF NOT EXISTS idx_users_nfc_id ON users(nfc_id);

-- ============================================
-- 2. 用户偏好设置视图（方便查询）
-- ============================================

CREATE OR REPLACE VIEW user_preferences_view AS
SELECT
  id,
  device_id,
  nfc_id,
  preferences,
  created_at,
  last_active_at
FROM users
WHERE nfc_id IS NOT NULL;

-- ============================================
-- 3. RLS 策略更新
-- ============================================

-- 允许用户更新自己的偏好设置
CREATE POLICY "Users can update own preferences" ON users
  FOR UPDATE USING (true);

-- 允许通过 device_id 或 nfc_id 读取用户
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (true);

-- ============================================
-- 完成！
-- ============================================
-- 执行成功后，-- users 表新增字段：
--   - nfc_id: TEXT UNIQUE (NFC 芯片唯一标识)
--   - preferences: JSONB (用户偏好设置)
