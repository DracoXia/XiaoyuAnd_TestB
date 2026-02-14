/**
 * 入口检测工具
 * 用于区分 NFC 扫描入口和直接访问入口
 */

import type { EntryDetectionResult, EntryType } from './types';
import { NFC_VALID_WINDOW_MS } from './types';

/**
 * 检测当前访问的入口类型
 *
 * NFC URL 格式: ?nfc=wanxiang&t=1707900000
 * - nfc: 香型ID
 * - t: 时间戳（毫秒）
 *
 * 只有在有效时间窗口内（5分钟）的访问才被识别为 NFC 入口
 */
export function detectEntryType(): EntryDetectionResult {
  if (typeof window === 'undefined') {
    return { type: 'dashboard', isFromNFC: false };
  }

  const params = new URLSearchParams(window.location.search);
  const nfcId = params.get('nfc');
  const timestamp = params.get('t');

  // 没有 NFC 参数，直接访问
  if (!nfcId) {
    return { type: 'dashboard', isFromNFC: false };
  }

  // 有 NFC 参数但没有时间戳，可能是旧链接或书签
  if (!timestamp) {
    // 为了向后兼容，仍然识别为 NFC，但可以记录警告
    console.warn('[Analytics] NFC URL without timestamp, may be a bookmark');
    return { type: 'nfc', fragranceId: nfcId, isFromNFC: true };
  }

  // 检查时间戳是否在有效窗口内
  const scanTime = parseInt(timestamp, 10);
  const currentTime = Date.now();
  const isValid = currentTime - scanTime < NFC_VALID_WINDOW_MS;

  if (isValid) {
    return { type: 'nfc', fragranceId: nfcId, isFromNFC: true };
  }

  // 过期的 NFC 链接，视为直接访问
  return { type: 'dashboard', isFromNFC: false };
}

/**
 * 生成 NFC URL
 * @param fragranceId 香型ID
 * @param baseUrl 基础URL（可选，默认使用当前页面URL）
 */
export function generateNFCUrl(fragranceId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : '');

  const timestamp = Date.now();
  const separator = base.includes('?') ? '&' : '?';

  return `${base}${separator}nfc=${encodeURIComponent(fragranceId)}&t=${timestamp}`;
}

/**
 * 清除 URL 中的 NFC 参数（用于进入应用后清理地址栏）
 */
export function clearNFCParams(): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.delete('nfc');
  url.searchParams.delete('t');

  // 使用 replaceState 避免添加历史记录
  window.history.replaceState({}, '', url.toString());
}

/**
 * 检查并记录 NFC 入口（用于埋点）
 */
export function checkAndLogNFCEntry(): { isNFC: boolean; fragranceId?: string } {
  const result = detectEntryType();

  if (result.isFromNFC) {
    console.log('[Analytics] NFC entry detected:', {
      fragranceId: result.fragranceId,
      timestamp: new Date().toISOString()
    });
  }

  return {
    isNFC: result.isFromNFC,
    fragranceId: result.fragranceId
  };
}
