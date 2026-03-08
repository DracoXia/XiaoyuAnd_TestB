/**
 * 自定义歌单导入功能 - 类型定义
 * 支持平台：网易云音乐、朋友的礼物、小屿和音乐库
 */

/**
 * 支持的音乐平台
 */
export type MusicPlatform = 'netease' | 'gift' | 'xiaoyu';

/**
 * 音乐曲目信息
 */
export interface Track {
  /** 曲目 ID（平台唯一标识） */
  id: string;
  /** 曲目名称 */
  title: string;
  /** 艺术家名称 */
  artist: string;
  /** 专辑名称（可选） */
  album?: string;
  /** 时长（毫秒） */
  duration: number;
  /** 封面图片 URL */
  coverUrl?: string;
  /** 音频播放 URL（部分平台可用） */
  audioUrl?: string;
}

/**
 * 歌单信息
 */
export interface PlaylistInfo {
  /** 歌单 ID（平台唯一标识） */
  id: string;
  /** 所属平台 */
  platform: MusicPlatform;
  /** 歌单名称 */
  name: string;
  /** 歌单封面 URL */
  coverUrl: string;
  /** 歌单描述 */
  description?: string;
  /** 歌曲总数 */
  trackCount: number;
  /** 歌曲列表 */
  tracks: Track[];
  /** 创建者名称 */
  creator?: string;
  /** 同步时间 */
  syncedAt?: Date;
}

/**
 * 用户歌单配置（存储到数据库）
 */
export interface UserPlaylist {
  /** 用户歌单记录 ID */
  id?: string;
  /** 用户 ID */
  userId?: string;
  /** 所属平台 */
  platform: MusicPlatform;
  /** 平台歌单 ID */
  externalId: string;
  /** 歌单名称 */
  name: string;
  /** 歌单封面 */
  coverUrl: string;
  /** 歌曲总数 */
  trackCount: number;
  /** 歌曲列表（JSONB） */
  tracks: Track[];
  /** 是否启用自动播放 */
  autoPlay: boolean;
  /** 创建时间 */
  createdAt?: Date;
  /** 更新时间 */
  updatedAt?: Date;
}

/**
 * 链接解析结果
 */
export interface ParseResult {
  /** 是否解析成功 */
  success: boolean;
  /** 解析出的平台 */
  platform?: MusicPlatform;
  /** 解析出的歌单 ID */
  playlistId?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 歌单导入状态
 */
export type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * 引导页步骤
 */
export type GuideStep = 'welcome' | 'manage' | 'platform' | 'link' | 'xiaoyu-library' | 'success';

/**
 * Ambiance 模式扩展（新增 'mine' 模式）
 */
export type ExtendedAmbianceMode = 'original' | 'sleep' | 'meditate' | 'mine';

/**
 * 平台配置
 */
export interface PlatformConfig {
  id: MusicPlatform;
  name: string;
  icon: string;
  color: string;
  available: boolean;
  comingSoon?: boolean;
}

/**
 * 预设平台配置
 */
export const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: 'netease',
    name: '网易云音乐',
    icon: 'music',
    color: '#C20C0C',
    available: true,
  },
  {
    id: 'gift',
    name: '朋友的礼物',
    icon: 'gift',
    color: '#EC4899',
    available: false,
    comingSoon: true,
  },
  {
    id: 'xiaoyu',
    name: '小屿和音乐库',
    icon: 'sparkles',
    color: '#F59E0B',
    available: true,
    comingSoon: false,
  },
];

/**
 * 小屿和音乐库歌曲
 */
export interface XiaoyuSong {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

/**
 * 小屿和音乐库歌曲列表
 */
export const XIAOYU_SONGS: XiaoyuSong[] = [
  {
    id: '278972',
    name: '身体放松',
    description: '舒缓身心，释放压力',
    available: true,
  },
  {
    id: '',
    name: '深度睡眠',
    description: '助眠冥想，安然入梦',
    available: false,
  },
  {
    id: '',
    name: '清晨唤醒',
    description: '温柔唤醒，开启美好一天',
    available: false,
  },
  {
    id: '',
    name: '专注时刻',
    description: '提升专注，高效工作',
    available: false,
  },
];

/**
 * 内嵌播放器配置
 */
export interface EmbeddedPlayerConfig {
  platform: MusicPlatform;
  playlistId: string;
  autoPlay?: boolean;
  volume?: number;
}

/**
 * 网易云音乐链接正则
 */
export const NETEASE_PATTERNS = [
  /music\.163\.com\/#\/playlist\?id=(\d+)/,
  /music\.163\.com\/playlist\?id=(\d+)/,
  /y\.music\.163\.com\/m\/playlist\?id=(\d+)/,
  /music\.163\.com\/.*[?&]id=(\d+)/,
];

/**
 * 网易云音乐 iframe 嵌入代码正则
 */
export const NETEASE_IFRAME_PATTERNS = [
  /music\.163\.com\/outchain\/player\?[^"]*type=(\d+)[^"]*&id=(\d+)/,
  /music\.163\.com\/outchain\/player\?[^"]*id=(\d+)/,
];

/**
 * Apple Music 链接正则
 */
export const APPLE_PATTERNS = [
  /music\.apple\.com\/\w{2}\/playlist\/[^/]+\/pl\.([a-zA-Z0-9]+)/,
  /music\.apple\.com\/playlist\/[^/]+\/pl\.([a-zA-Z0-9]+)/,
];
