/**
 * NFC 扫描工具
 * 使用 Web NFC API 读取 NFC 标签
 */

import type { NFCScanResult } from '../gift/types';

/**
 * 检查设备是否支持 NFC
 */
export function isNFCSupported(): boolean {
  return 'NDEFReader' in window;
}

/**
 * 扫描 NFC 标签
 * @returns NFC 标签 ID
 */
export async function scanNFC(): Promise<NFCScanResult> {
  // 检查支持性
  if (!isNFCSupported()) {
    return {
      success: false,
      error: '您的设备不支持 NFC 功能',
    };
  }

  try {
    // 请求 NFC 权限并扫描
    const reader = new NDEFReader();
    await reader.scan();

    return new Promise((resolve) => {
      reader.onreading = (event) => {
        // 从 NFC 标签获取唯一标识
        const serialNumber = event.serialNumber;

        if (serialNumber) {
          resolve({
            success: true,
            nfcId: serialNumber,
          });
        } else {
          // 如果没有序列号，尝试从 NDEF 消息生成 ID
          const message = event.message;
          const records = message.records;

          if (records.length > 0) {
            // 使用第一个记录的数据作为 ID
            const record = records[0];
            const data = new TextDecoder().decode(record.data);
            resolve({
              success: true,
              nfcId: `ndef-${hashString(data)}`,
            });
          } else {
            resolve({
              success: false,
              error: '无法读取 NFC 标签信息',
            });
          }
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'NFC 读取失败',
        });
      };
    });
  } catch (error) {
    // 处理权限拒绝等错误
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        return {
          success: false,
          error: '请允许访问 NFC 功能',
        };
      }
      if (error.name === 'NotSupportedError') {
        return {
          success: false,
          error: '您的设备不支持 NFC 功能',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'NFC 扫描失败',
    };
  }
}

/**
 * 简单的字符串哈希函数
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * 模拟 NFC 扫描（用于开发测试）
 * 仅在开发环境下使用
 */
export function mockNFCScan(): Promise<NFCScanResult> {
  if (!import.meta.env.DEV) {
    return Promise.resolve({
      success: false,
      error: '模拟扫描仅在开发环境可用',
    });
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        nfcId: `mock-nfc-${Date.now()}`,
      });
    }, 1000);
  });
}
