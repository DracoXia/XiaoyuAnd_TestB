/**
 * NFC 赠送功能 - 类型定义
 */

/**
 * 赠送状态
 */
export type GiftStatus = 'pending' | 'redeemed';

/**
 * 赠送信息
 */
export interface Gift {
  /** 赠送记录 ID */
  id: string;
  /** NFC 标签 ID */
  nfcId: string;
  /** 赠送者自定义名称 */
  giverName: string;
  /** 赠言 */
  message: string;
  /** 网易云歌单链接 */
  playlistUrl: string;
  /** 解析后的歌单 ID */
  playlistId: string;
  /** 歌单名称 */
  playlistName: string;
  /** 赠送状态 */
  status: GiftStatus;
  /** 创建时间 */
  createdAt: Date;
  /** 领取时间 */
  redeemedAt?: Date;
}

/**
 * 创建赠送请求
 */
export interface CreateGiftRequest {
  nfcId: string;
  giverName: string;
  message: string;
  playlistUrl: string;
  playlistId: string;
  playlistName: string;
}

/**
 * 赠送设置表单数据
 */
export interface GiftFormData {
  giverName: string;
  message: string;
  playlistUrl: string;
}

/**
 * NFC 扫描结果
 */
export interface NFCScanResult {
  success: boolean;
  nfcId?: string;
  error?: string;
}
