/**
 * 歌单链接解析器
 * 支持网易云音乐和 Apple Music 链接解析
 */

import {
  ParseResult,
  PlaylistInfo,
  MusicPlatform,
  NETEASE_PATTERNS,
  NETEASE_IFRAME_PATTERNS,
  APPLE_PATTERNS,
} from './types';

/**
 * 解析音乐链接，识别平台和歌单 ID
 * @param url 用户输入的音乐链接或 iframe 代码
 * @returns 解析结果
 */
export function parseMusicLink(url: string): ParseResult {
  // 空链接检查
  if (!url || url.trim() === '') {
    return {
      success: false,
      error: '请输入有效的音乐链接',
    };
  }

  // 尝试匹配网易云音乐 iframe 嵌入代码
  for (const pattern of NETEASE_IFRAME_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[2]) {
      // pattern with type and id: type=0&id=xxx
      return {
        success: true,
        platform: 'netease',
        playlistId: match[2],
      };
    }
    if (match && match[1]) {
      // pattern with only id: id=xxx
      return {
        success: true,
        platform: 'netease',
        playlistId: match[1],
      };
    }
  }

  // 尝试匹配网易云音乐 URL
  for (const pattern of NETEASE_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return {
        success: true,
        platform: 'netease',
        playlistId: match[1],
      };
    }
  }

  // 尝试匹配 Apple Music
  for (const pattern of APPLE_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return {
        success: true,
        platform: 'apple',
        playlistId: match[1],
      };
    }
  }

  // 不支持的平台
  return {
    success: false,
    error: '不支持的平台，请使用网易云音乐或 Apple Music 的歌单链接',
  };
}

/**
 * 从网易云音乐获取歌单信息
 * 注意：此功能需要后端代理或 NeteaseCloudMusicApi 服务
 * @param playlistId 歌单 ID
 * @returns 歌单信息
 */
export async function fetchNeteasePlaylist(playlistId: string): Promise<PlaylistInfo> {
  // TODO: 实现实际的 API 调用
  // 这里返回一个占位结构，实际需要调用后端代理
  throw new Error('NeteaseCloudMusicApi service not configured');
}

/**
 * 从 Apple Music 获取歌单信息
 * 需要 Apple Music API 配置
 * @param playlistId 歌单 ID
 * @returns 歌单信息
 */
export async function fetchApplePlaylist(playlistId: string): Promise<PlaylistInfo> {
  // TODO: 实现实际的 API 调用
  throw new Error('Apple Music API service not configured');
}

/**
 * 根据链接获取歌单信息（统一入口）
 * @param url 音乐链接
 * @returns 歌单信息
 */
export async function getPlaylistFromUrl(url: string): Promise<PlaylistInfo> {
  const parseResult = parseMusicLink(url);

  if (!parseResult.success || !parseResult.playlistId || !parseResult.platform) {
    throw new Error(parseResult.error || '无法解析链接');
  }

  switch (parseResult.platform) {
    case 'netease':
      return fetchNeteasePlaylist(parseResult.playlistId);
    case 'apple':
    case 'gift':
      return fetchApplePlaylist(parseResult.playlistId);
    case 'xiaoyu':
      throw new Error('小屿和音乐库 Coming Soon');
    default:
      throw new Error('不支持的平台');
  }
}

/**
 * 生成内嵌播放器 URL
 * @param platform 音乐平台
 * @param playlistId 歌单 ID
 * @returns 内嵌播放器 URL
 */
export function getEmbeddedPlayerUrl(platform: MusicPlatform, playlistId: string): string {
  switch (platform) {
    case 'netease':
      // 网易云音乐内嵌播放器
      // 参数: type=0 歌单, id=歌单ID, auto=自动播放
      // 强制使用 https 协议，避免在本地 http 环境下失败
      return `https://music.163.com/outchain/player?type=0&id=${playlistId}&auto=1&height=430`;

    case 'apple':
    case 'gift':
      // 朋友的礼物 - 使用网易云歌单播放器
      // 礼物歌单实际来自网易云，使用 type=0 歌单模式
      return `https://music.163.com/outchain/player?type=0&id=${playlistId}&auto=1&height=430`;

    case 'xiaoyu':
      // 小屿和音乐库 - 使用网易云音乐单曲播放器 (type=2)
      return `https://music.163.com/outchain/player?type=2&id=${playlistId}&auto=1&height=66`;

    default:
      throw new Error('不支持的平台');
  }
}
