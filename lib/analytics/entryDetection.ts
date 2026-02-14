/**
 * 入口检测工具
 * 用于区分 NFC 扫描入口和直接访问入口
 */

import type { EntryDetectionResult, EntryType } from './types';
import { NFC_VALID_WINDOW_MS } from './types';

/**
 * 检测当前访问的入口类型
 *
 * NFC URL 格式: ?nfc=1&t=1707900000
 * - nfc=1: 标识来自 NFC 扫描
 * - t: 时间戳（毫秒），由 Netlify Function 动态生成
 *
 * 只有在有效时间窗口内（5分钟）的访问才被识别为 NFC 入口
 * 过期链接/书签自动识别为 Dashboard 入口
 */
export function detectEntryType(): EntryDetectionResult {
  if (typeof window === 'undefined') {
    return { type: 'dashboard', isFromNFC: false };
  }

  const params = new URLSearchParams(window.location.search);
  const nfcFlag = params.get('nfc');
  const timestamp = params.get('t');

  // 没有 NFC 参数，直接访问
  if (!nfcFlag) {
    return { type: 'dashboard', isFromNFC: false };
  }

  // 有 NFC 参数但没有时间戳，可能是旧链接或书签
  if (!timestamp) {
    // 向后兼容：仍然识别为 NFC 入口
    console.warn('[Analytics] NFC URL without timestamp, may be a bookmark');
    return { type: 'nfc', isFromNFC: true };
  }

  // 检查时间戳是否在有效窗口内
  const scanTime = parseInt(timestamp, 10);
  const currentTime = Date.now();
  const isValid = currentTime - scanTime < NFC_VALID_WINDOW_MS;

  if (isValid) {
    console.log('[Analytics] Valid NFC entry detected');
    return { type: 'nfc', isFromNFC: true };
  }

  // 过期的 NFC 链接，视为直接访问
  console.log('[Analytics] Expired NFC link, treating as dashboard entry');
  return { type: 'dashboard', isFromNFC: false };
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
export function checkAndLogNFCEntry(): { isNFC: boolean } {
  const result = detectEntryType();

  if (result.isFromNFC) {
    console.log('[Analytics] NFC entry detected at:', new Date().toISOString());
  }

  return {
    isNFC: result.isFromNFC
  };
}
