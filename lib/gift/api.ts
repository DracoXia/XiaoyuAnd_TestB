/**
 * NFC 赠送功能 - API 封装
 */

import { getSupabaseClient } from '../analytics/supabaseClient';
import type { Gift, CreateGiftRequest, GiftStatus } from './types';

const TABLE_NAME = 'gifts';

/**
 * 创建赠送记录
 */
export async function createGift(request: CreateGiftRequest): Promise<Gift> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      nfc_id: request.nfcId,
      giver_name: request.giverName,
      message: request.message,
      playlist_url: request.playlistUrl,
      playlist_id: request.playlistId,
      playlist_name: request.playlistName,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('[Gift] Create error:', error);
    throw new Error(`创建赠送失败: ${error.message}`);
  }

  return mapToGift(data);
}

/**
 * 根据 NFC ID 查询赠送记录
 */
export async function getGiftByNfcId(nfcId: string): Promise<Gift | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('nfc_id', nfcId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // 没有找到记录
      return null;
    }
    console.error('[Gift] Query error:', error);
    throw new Error(`查询赠送失败: ${error.message}`);
  }

  return data ? mapToGift(data) : null;
}

/**
 * 领取赠送
 */
export async function redeemGift(nfcId: string): Promise<Gift> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      status: 'redeemed',
      redeemed_at: new Date().toISOString(),
    })
    .eq('nfc_id', nfcId)
    .eq('status', 'pending') // 只能领取 pending 状态的
    .select()
    .single();

  if (error) {
    console.error('[Gift] Redeem error:', error);
    throw new Error(`领取赠送失败: ${error.message}`);
  }

  return mapToGift(data);
}

/**
 * 检查 NFC 是否已绑定赠送
 */
export async function checkNfcBound(nfcId: string): Promise<boolean> {
  const gift = await getGiftByNfcId(nfcId);
  return gift !== null;
}

/**
 * 将数据库记录映射为 Gift 类型
 */
function mapToGift(data: Record<string, unknown>): Gift {
  return {
    id: data.id as string,
    nfcId: data.nfc_id as string,
    giverName: data.giver_name as string,
    message: data.message as string,
    playlistUrl: data.playlist_url as string,
    playlistId: data.playlist_id as string,
    playlistName: data.playlist_name as string,
    status: data.status as GiftStatus,
    createdAt: new Date(data.created_at as string),
    redeemedAt: data.redeemed_at ? new Date(data.redeemed_at as string) : undefined,
  };
}
