/**
 * PlaylistModal 组件测试
 * TDD - RED Phase: 这些测试应该失败，因为组件还不存在
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import the component - this will fail because it doesn't exist yet
import PlaylistModal from './PlaylistModal';

// Mock the music module
vi.mock('../lib/music', () => ({
  PLATFORM_CONFIGS: [
    { id: 'netease', name: '网易云音乐', icon: 'music', color: '#C20C0C', available: true },
    { id: 'apple', name: 'Apple Music', icon: 'apple', color: '#FC3C44', available: true },
    { id: 'xiaoyu', name: '小屿和音乐库', icon: 'sparkles', color: '#F59E0B', available: false, comingSoon: true },
  ],
  parseMusicLink: vi.fn((url: string) => {
    if (url.includes('music.163.com')) {
      return { success: true, platform: 'netease', playlistId: '123456' };
    }
    if (url.includes('apple.com')) {
      return { success: true, platform: 'apple', playlistId: 'abc123' };
    }
    return { success: false, error: '不支持的平台' };
  }),
  getEmbeddedPlayerUrl: vi.fn((platform: string, id: string) => `//music.163.com/outchain/player?type=0&id=${id}`),
}));

describe('PlaylistModal', () => {
  const mockOnClose = vi.fn();
  const mockOnPlaylistSet = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnPlaylistSet.mockClear();
  });

  describe('欢迎页 (welcome step)', () => {
    it('应该渲染欢迎标题和描述', () => {
      render(
        <PlaylistModal
          isOpen={true}
          onClose={mockOnClose}
          onPlaylistSet={mockOnPlaylistSet}
        />
      );

      expect(screen.getByText(/喜欢的音乐/)).toBeInTheDocument();
      expect(screen.getByText(/疗愈时光/)).toBeInTheDocument();
    });

    it('应该显示"开始设置"按钮', () => {
      render(
        <PlaylistModal
          isOpen={true}
          onClose={mockOnClose}
          onPlaylistSet={mockOnPlaylistSet}
        />
      );

      expect(screen.getByRole('button', { name: /开始设置/ })).toBeInTheDocument();
    });

    it('应该显示"稍后再说"按钮', () => {
      render(
        <PlaylistModal
          isOpen={true}
          onClose={mockOnClose}
          onPlaylistSet={mockOnPlaylistSet}
        />
      );

      expect(screen.getByRole('button', { name: /稍后再说/ })).toBeInTheDocument();
    });

    it('点击"稍后再说"应该调用 onClose', async () => {
      const user = userEvent.setup();
      render(
        <PlaylistModal
          isOpen={true}
          onClose={mockOnClose}
          onPlaylistSet={mockOnPlaylistSet}
        />
      );

      await user.click(screen.getByRole('button', { name: /稍后再说/ }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('平台选择页 (platform step)', () => {
    it('应该显示三个平台选项', async () => {
      const user = userEvent.setup();
      render(
        <PlaylistModal
          isOpen={true}
          onClose={mockOnClose}
          onPlaylistSet={mockOnPlaylistSet}
        />
      );

      // 点击开始设置进入平台选择
      await user.click(screen.getByRole('button', { name: /开始设置/ }));

      expect(screen.getByText('网易云音乐')).toBeInTheDocument();
      expect(screen.getByText('Apple Music')).toBeInTheDocument();
      expect(screen.getByText('小屿和音乐库')).toBeInTheDocument();
    });

    it('小屿和音乐库应该显示 Coming Soon 标签', async () => {
      const user = userEvent.setup();
      render(
        <PlaylistModal
          isOpen={true}
          onClose={mockOnClose}
          onPlaylistSet={mockOnPlaylistSet}
        />
      );

      await user.click(screen.getByRole('button', { name: /开始设置/ }));
      expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument();
    });
  });

  describe('链接输入页 (link step)', () => {
    it('应该显示链接输入框', async () => {
      const user = userEvent.setup();
      render(
        <PlaylistModal
          isOpen={true}
          onClose={mockOnClose}
          onPlaylistSet={mockOnPlaylistSet}
        />
      );

      // 进入平台选择
      await user.click(screen.getByRole('button', { name: /开始设置/ }));
      // 选择网易云音乐
      await user.click(screen.getByText('网易云音乐'));

      // 应该有输入框
      expect(screen.getByPlaceholderText(/链接/)).toBeInTheDocument();
    });

    it('应该显示"如何获取歌单链接"提示', async () => {
      const user = userEvent.setup();
      render(
        <PlaylistModal
          isOpen={true}
          onClose={mockOnClose}
          onPlaylistSet={mockOnPlaylistSet}
        />
      );

      await user.click(screen.getByRole('button', { name: /开始设置/ }));
      await user.click(screen.getByText('网易云音乐'));

      expect(screen.getByText(/如何获取/)).toBeInTheDocument();
    });
  });

  describe('关闭功能', () => {
    it('应该显示关闭按钮（X）', () => {
      render(
        <PlaylistModal
          isOpen={true}
          onClose={mockOnClose}
          onPlaylistSet={mockOnPlaylistSet}
        />
      );

      // 找关闭按钮
      const closeButton = screen.getByRole('button', { name: '' });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('隐藏状态', () => {
    it('当 isOpen=false 时不应该渲染', () => {
      render(
        <PlaylistModal
          isOpen={false}
          onClose={mockOnClose}
          onPlaylistSet={mockOnPlaylistSet}
        />
      );

      expect(screen.queryByText(/喜欢的音乐/)).not.toBeInTheDocument();
    });
  });
});
