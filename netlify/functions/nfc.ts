/**
 * Netlify Function: NFC 统一入口
 *
 * NFC 芯片写入固定 URL: /api/nfc
 * 扫描时生成当前时间戳，重定向到 App 首页
 */

import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // 生成当前时间戳
  const timestamp = Date.now();

  // 构建重定向 URL
  const baseUrl = process.env.URL || 'https://xiaoyuandincense.netlify.app';
  const redirectUrl = `${baseUrl}/?nfc=1&t=${timestamp}`;

  // 记录 NFC 扫描事件
  console.log(`[NFC] Scan detected: timestamp=${timestamp}`);

  return {
    statusCode: 302,
    headers: {
      'Location': redirectUrl,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
    body: '',
  };
};
