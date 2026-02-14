import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard';

// Mock the constants module
vi.mock('../constants', () => ({
  MOOD_OPTIONS: [
    { id: 'calm', label: '想静静', icon: '🌤️', style: 'bg-moss-green/50 text-moss-green-dark' },
    { id: 'anxious', label: '有点焦虑', icon: '🌧️', style: 'bg-dopamine-purple/10 text-dopamine-purple' }
  ],
  CONTEXT_OPTIONS: ['工作/学业', '感情'],
  FRAGRANCE_LIST: [
    {
      id: 'tinghe',
      name: '听荷',
      desc: '和清静在一起',
      status: 'owned',
      color: 'bg-lotus-pink text-lotus-pink-dark',
      gradient: 'from-lotus-pink/30 to-earth-sand/50',
      audioUrl: 'test.mp3',
      fullName: '小屿和·香 听荷',
      vibe: '澄澈：独处的静谧时刻',
      story: '荷塘清晨，露珠在碧绿的荷叶间轻轻滚动。远处的鸟鸣穿透薄雾飘来，在清旷的留白里，此间独坐，听荷声，见清静。',
      ingredients: ['九品香水莲', '斑斓叶'],
      colorCode: '莲粉'
    },
    {
      id: 'wanxiang',
      name: '晚巷',
      desc: '和温柔在一起',
      status: 'owned',
      color: 'bg-osmanthus-gold text-osmanthus-gold-dark',
      gradient: 'from-osmanthus-gold/30 to-earth-clay/40',
      audioUrl: '',
      fullName: '小屿和·香 晚巷',
      vibe: '安抚：卸下防备的温暖归途',
      story: '老巷深处，秋雨过后，夕阳在青石板上染了一层金。',
      ingredients: ['桂花', '苏合香'],
      colorCode: '桂金'
    }
  ],
  TEXT_CONTENT: {
    product: {
      entryLabel: "关于这支香",
      common: {
        title: "安心入座的理由",
        origin: { title: "test", part1: 'test', highlight: 'test', part2: 'test', part3: 'test' },
        reminder: { title: "test", text: 'test' },
        footer: 'test'
      },
      modal: {
        tinghe: {
          ingredients: { title: 'test', list: [] },
          story: { title: 'test', subtitle: 'test', content: [] }
        },
        wanxiang: {
          ingredients: { title: 'test', list: [] },
          story: { title: 'test', subtitle: 'test', content: [] }
        },
        xiaoyuan: {
          ingredients: { title: 'test', list: [] },
          story: { title: 'test', subtitle: 'test', content: [] }
        }
      }
    }
  },
  DASHBOARD_DATA: { scenarios: [], lifestyle: { title: '', subtitle: '', tag: '', action: '', slogan: '', categories: [] } }
}));

describe('Dashboard - 香型卡片展开功能', () => {
  const mockOnScenarioClick = vi.fn();

  beforeEach(() => {
    mockOnScenarioClick.mockClear();
  });

  describe('初始渲染', () => {
    it('应该渲染所有香型卡片（收起状态）', () => {
      render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

      // 应该显示香型名称
      expect(screen.getByText('听荷')).toBeInTheDocument();
      expect(screen.getByText('晚巷')).toBeInTheDocument();
    });

    it('应该显示标题和副标题', () => {
      render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

      expect(screen.getByText('确认今日香型')).toBeInTheDocument();
      expect(screen.getByText('轻触确认，开启此刻的疗愈')).toBeInTheDocument();
    });
  });

  describe('展开/收起交互', () => {
    it('点击未展开的香型卡片应该展开该卡片', async () => {
      const user = userEvent.setup();
      render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

      // 找到听荷卡片并点击
      const tingheCard = screen.getByText('听荷').closest('div[class*="cursor-pointer"]');
      if (tingheCard) {
        await user.click(tingheCard);
      }

      // 展开后应该显示故事描述
      expect(screen.getByText(/荷塘清晨/)).toBeInTheDocument();
    });

    it('点击已展开的香型卡片应该收起该卡片', async () => {
      const user = userEvent.setup();
      render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

      // 展开卡片
      const tingheCard = screen.getByText('听荷').closest('div[class*="cursor-pointer"]');
      if (tingheCard) {
        await user.click(tingheCard);
      }

      // 验证已展开
      expect(screen.getByText(/荷塘清晨/)).toBeInTheDocument();

      // 再次点击收起
      if (tingheCard) {
        await user.click(tingheCard);
      }

      // 故事描述应该消失
      expect(screen.queryByText(/荷塘清晨/)).not.toBeInTheDocument();
    });

    it('展开一个卡片时，其他卡片应该自动收起', async () => {
      const user = userEvent.setup();
      render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

      // 首先展开听荷
      const tingheCard = screen.getByText('听荷').closest('div[class*="cursor-pointer"]');
      if (tingheCard) {
        await user.click(tingheCard);
      }

      // 听荷应该展开
      expect(screen.getByText(/荷塘清晨/)).toBeInTheDocument();

      // 然后展开晚巷 - 听荷应该自动收起
      const wanxiangCard = screen.getByText('晚巷').closest('div[class*="cursor-pointer"]');
      if (wanxiangCard) {
        await user.click(wanxiangCard);
      }

      // 听荷的故事应该消失（收起了）
      expect(screen.queryByText(/荷塘清晨/)).not.toBeInTheDocument();
      // 晚巷的故事应该出现
      expect(screen.getByText(/老巷深处/)).toBeInTheDocument();
    });

    it('已拥有的香型卡片应该可以展开', async () => {
      const user = userEvent.setup();
      render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

      // 晚巷现在是 owned 状态 - 可以点击展开
      const wanxiangCard = screen.getByText('晚巷').closest('div[class*="cursor-pointer"]');
      if (wanxiangCard) {
        await user.click(wanxiangCard);
      }

      // 展开后应该显示故事
      expect(screen.getByText(/老巷深处/)).toBeInTheDocument();
    });
  });

  describe('展开状态的内容', () => {
    it('展开后应该显示故事描述 (story)', async () => {
      const user = userEvent.setup();
      render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

      const tingheCard = screen.getByText('听荷').closest('div[class*="cursor-pointer"]');
      if (tingheCard) {
        await user.click(tingheCard);
      }

      expect(screen.getByText(/荷塘清晨/)).toBeInTheDocument();
    });

    it('展开后应该显示"点一支"按钮', async () => {
      const user = userEvent.setup();
      render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

      const tingheCard = screen.getByText('听荷').closest('div[class*="cursor-pointer"]');
      if (tingheCard) {
        await user.click(tingheCard);
      }

      // 应该显示点一支按钮
      const igniteButtons = screen.getAllByText(/点一支/);
      expect(igniteButtons.length).toBeGreaterThan(0);
    });
  });

  describe('展开卡片内的故事描述和按钮', () => {
    it('展开后应该显示完整的故事描述', async () => {
      const user = userEvent.setup();
      render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

      const tingheCard = screen.getByText('听荷').closest('div[class*="cursor-pointer"]');
      if (tingheCard) {
        await user.click(tingheCard);
      }

      // 应该显示故事描述
      expect(screen.getByText(/荷塘清晨/)).toBeInTheDocument();
      expect(screen.getByText(/露珠在碧绿的荷叶间/)).toBeInTheDocument();
    });

    it('展开后应该显示"点一支"按钮在卡片内', async () => {
      const user = userEvent.setup();
      render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

      const tingheCard = screen.getByText('听荷').closest('div[class*="cursor-pointer"]');
      if (tingheCard) {
        await user.click(tingheCard);
      }

      // 应该在展开的卡片内显示点一支按钮
      const igniteButtons = screen.getAllByText(/点一支/);
      expect(igniteButtons.length).toBeGreaterThan(0);
    });

    it('点击卡片内的"点一支"按钮应该调用 onScenarioClick', async () => {
      const user = userEvent.setup();
      render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

      // 展开卡片
      const tingheCard = screen.getByText('听荷').closest('div[class*="cursor-pointer"]');
      if (tingheCard) {
        await user.click(tingheCard);
      }

      // 找到卡片内的点一支按钮
      const igniteButtons = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.includes('点一支')
      );

      // 点击第一个点一支按钮（卡片内的）
      if (igniteButtons.length > 0) {
        await user.click(igniteButtons[0]);
      }

      expect(mockOnScenarioClick).toHaveBeenCalledWith('tinghe');
    });

    it('展开后应该显示 Info 按钮（查看香方）', async () => {
      const user = userEvent.setup();
      render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

      const tingheCard = screen.getByText('听荷').closest('div[class*="cursor-pointer"]');
      if (tingheCard) {
        await user.click(tingheCard);
      }

      // 应该显示 Info 按钮（点击查看香方详情）
      const buttons = screen.getAllByRole('button');
      const infoButton = buttons.find(btn => btn.querySelector('svg.lucide-info'));
      expect(infoButton).toBeInTheDocument();
    });
  });
});
