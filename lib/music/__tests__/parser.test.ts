/**
 * 歌单解析器测试
 * TDD - 测试覆盖：链接解析、播放器URL生成、错误处理
 */

import {
  parseMusicLink,
  getEmbeddedPlayerUrl,
} from '../parser';

describe('parseMusicLink', () => {
  describe('网易云音乐链接解析', () => {
    it('应该解析标准歌单链接 music.163.com/#/playlist?id=xxx', () => {
      const url = 'https://music.163.com/#/playlist?id=123456789';
      const result = parseMusicLink(url);

      expect(result.success).toBe(true);
      expect(result.platform).toBe('netease');
      expect(result.playlistId).toBe('123456789');
      expect(result.error).toBeUndefined();
    });

    it('应该解析不带 # 的歌单链接', () => {
      const url = 'https://music.163.com/playlist?id=987654321';
      const result = parseMusicLink(url);

      expect(result.success).toBe(true);
      expect(result.platform).toBe('netease');
      expect(result.playlistId).toBe('987654321');
    });

    it('应该解析移动端分享链接 y.music.163.com', () => {
      const url = 'https://y.music.163.com/m/playlist?id=111222333';
      const result = parseMusicLink(url);

      expect(result.success).toBe(true);
      expect(result.platform).toBe('netease');
      expect(result.playlistId).toBe('111222333');
    });

    it('应该解析带额外参数的链接', () => {
      const url = 'https://music.163.com/#/playlist?id=123456789&userid=xxx';
      const result = parseMusicLink(url);

      expect(result.success).toBe(true);
      expect(result.platform).toBe('netease');
      expect(result.playlistId).toBe('123456789');
    });

    it('应该解析 HTTP 链接', () => {
      const url = 'http://music.163.com/#/playlist?id=555666777';
      const result = parseMusicLink(url);

      expect(result.success).toBe(true);
      expect(result.platform).toBe('netease');
      expect(result.playlistId).toBe('555666777');
    });

    it('应该解析 iframe 嵌入代码 (type=0 歌单)', () => {
      const iframe = '<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=450 src="//music.163.com/outchain/player?type=0&id=39141518&auto=1&height=430"></iframe>';
      const result = parseMusicLink(iframe);

      expect(result.success).toBe(true);
      expect(result.platform).toBe('netease');
      expect(result.playlistId).toBe('39141518');
    });

    it('应该解析 iframe 嵌入代码 (type=1 专辑)', () => {
      const iframe = '<iframe src="//music.163.com/outchain/player?type=1&id=12345678&auto=1"></iframe>';
      const result = parseMusicLink(iframe);

      expect(result.success).toBe(true);
      expect(result.platform).toBe('netease');
      expect(result.playlistId).toBe('12345678');
    });
  });

  describe('Apple Music 链接解析', () => {
    it('应该解析标准 Apple Music 歌单链接', () => {
      const url = 'https://music.apple.com/cn/playlist/my-playlist/pl.abc123def456';
      const result = parseMusicLink(url);

      expect(result.success).toBe(true);
      expect(result.platform).toBe('apple');
      expect(result.playlistId).toBe('abc123def456');
    });

    it('应该解析不同地区的 Apple Music 链接', () => {
      const url = 'https://music.apple.com/us/playlist/chill-mix/pl.xyz789';
      const result = parseMusicLink(url);

      expect(result.success).toBe(true);
      expect(result.platform).toBe('apple');
      expect(result.playlistId).toBe('xyz789');
    });

    it('应该解析日本地区的 Apple Music 链接', () => {
      const url = 'https://music.apple.com/jp/playlist/test/pl.jp123';
      const result = parseMusicLink(url);

      expect(result.success).toBe(true);
      expect(result.platform).toBe('apple');
      expect(result.playlistId).toBe('jp123');
    });
  });

  describe('无效链接处理', () => {
    it('应该拒绝非音乐平台链接', () => {
      const url = 'https://www.youtube.com/watch?v=xxx';
      const result = parseMusicLink(url);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('不支持的平台');
    });

    it('应该拒绝空链接', () => {
      const result = parseMusicLink('');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('请输入');
    });

    it('应该拒绝纯空格链接', () => {
      const result = parseMusicLink('   ');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该拒绝格式错误的网易云链接（缺少歌单ID）', () => {
      const url = 'https://music.163.com/#/playlist?name=test';
      const result = parseMusicLink(url);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该拒绝无效 URL 字符串', () => {
      const result = parseMusicLink('not-a-valid-url');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该拒绝 Spotify 链接', () => {
      const url = 'https://open.spotify.com/playlist/xxx';
      const result = parseMusicLink(url);

      expect(result.success).toBe(false);
      expect(result.error).toContain('不支持');
    });

    it('应该拒绝 QQ 音乐链接', () => {
      const url = 'https://y.qq.com/n/ryqq/playlist/xxx';
      const result = parseMusicLink(url);

      expect(result.success).toBe(false);
      expect(result.error).toContain('不支持');
    });
  });
});

describe('getEmbeddedPlayerUrl', () => {
  describe('网易云音乐', () => {
    it('应该生成网易云内嵌播放器 URL', () => {
      const url = getEmbeddedPlayerUrl('netease', '123456789');

      expect(url).toContain('music.163.com');
      expect(url).toContain('123456789');
      expect(url).toContain('outchain');
    });

    it('应该包含自动播放参数', () => {
      const url = getEmbeddedPlayerUrl('netease', '123456789');

      expect(url).toContain('auto=1');
    });

    it('应该设置正确的播放器类型', () => {
      const url = getEmbeddedPlayerUrl('netease', '123456789');

      expect(url).toContain('type=0'); // 0 = 歌单
    });
  });

  describe('Apple Music', () => {
    it('应该生成 Apple Music 内嵌播放器 URL', () => {
      const url = getEmbeddedPlayerUrl('apple', 'abc123def456');

      expect(url).toContain('apple.com');
      expect(url).toContain('abc123def456');
    });

    it('应该使用 embed 子域名', () => {
      const url = getEmbeddedPlayerUrl('apple', 'xyz789');

      expect(url).toContain('embed.music.apple.com');
    });
  });

  describe('小屿和音乐库', () => {
    it('应该生成小屿和音乐库播放器 URL', () => {
      const url = getEmbeddedPlayerUrl('xiaoyu', '278972');
      expect(url).toContain('music.163.com');
      expect(url).toContain('type=2'); // 单曲播放器
      expect(url).toContain('id=278972');
      expect(url).toContain('auto=1');
    });
  });

  describe('无效平台', () => {
    it('应该抛出不支持平台错误', () => {
      expect(() => {
        getEmbeddedPlayerUrl('invalid' as any, 'xxx');
      }).toThrow('不支持的平台');
    });
  });
});
