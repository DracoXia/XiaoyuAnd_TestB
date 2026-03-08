-- ============================================
-- NFC 赠送功能 - 数据库建表脚本
-- ============================================
-- 在 Supabase SQL Editor 中执行此脚本
-- 路径: SQL Editor → New query → 粘贴以下内容 → Run

-- ============================================
-- 1. 赠送表
-- ============================================
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nfc_id TEXT UNIQUE NOT NULL,
  giver_name TEXT NOT NULL,
  message TEXT,
  playlist_url TEXT NOT NULL,
  playlist_id TEXT NOT NULL,
  playlist_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  redeemed_at TIMESTAMPTZ
);

-- 索引：按 NFC ID 快速查找
CREATE INDEX IF NOT EXISTS idx_gifts_nfc_id ON gifts(nfc_id);
-- 索引：按状态查询
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);
-- 索引：按创建时间查询
CREATE INDEX IF NOT EXISTS idx_gifts_created_at ON gifts(created_at DESC);

-- ============================================
-- 2. Row Level Security (RLS) 策略
-- ============================================
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- 允许公开插入（赠送者创建礼物）
CREATE POLICY "Anyone can create gifts" ON gifts
  FOR INSERT WITH CHECK (true);

-- 允许公开读取（接收者查询礼物）
CREATE POLICY "Anyone can read gifts" ON gifts
  FOR SELECT USING (true);

-- 允许公开更新（接收者领取礼物）
CREATE POLICY "Anyone can update gifts" ON gifts
  FOR UPDATE USING (true);

-- ============================================
-- 完成！
-- ============================================
-- 执行成功后，你应该能看到以下表：
-- - gifts
