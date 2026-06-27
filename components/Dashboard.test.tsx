import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard';

vi.mock('../constants', () => ({
  MOOD_OPTIONS: [
    { id: 'quiet', label: '安静', icon: '·', style: 'bg-moss-green/50 text-moss-green-dark' },
  ],
  CONTEXT_OPTIONS: ['工作'],
  FRAGRANCE_LIST: [
    {
      id: 'tinghe',
      name: '听荷',
      desc: '和清静在一起',
      status: 'owned',
      color: 'bg-lotus-pink text-lotus-pink-dark',
      gradient: 'from-lotus-pink/30 to-earth-sand/50',
      audioUrl: 'tinghe.mp3',
      fullName: '小屿和·香 听荷',
      vibe: '澄澈：独处的静谧时刻',
      story: '荷塘清晨，露珠在碧绿的荷叶间轻轻滚动。',
      ingredients: ['九品香水莲', '斑斓叶'],
      colorCode: '莲粉',
    },
    {
      id: 'wanxiang',
      name: '晚巷',
      desc: '暮色浸染的木质微光',
      status: 'owned',
      color: 'bg-osmanthus-gold text-osmanthus-gold-dark',
      gradient: 'from-osmanthus-gold/30 to-earth-clay/40',
      audioUrl: 'wanxiang.mp3',
      fullName: '小屿和·香 晚巷',
      vibe: '安抚：卸下防备的温暖归途',
      story: '老巷深处，秋雨过后，夕阳在青石板上染了一层金。',
      ingredients: ['桂花', '苏合香'],
      colorCode: '桂金',
    },
    {
      id: 'xiaoyuan',
      name: '小院',
      desc: '青苔漫过石阶的呼吸',
      status: 'owned',
      color: 'bg-moss-green text-moss-green-dark',
      gradient: 'from-moss-green/30 to-earth-sage/50',
      audioUrl: 'xiaoyuan.mp3',
      fullName: '小屿和·香 小院',
      vibe: '呼吸：都市中的自然野趣',
      story: '山间小院，苔藓在石阶上静静生长。',
      ingredients: ['苔藓', '薄荷油'],
      colorCode: '苔绿',
    },
  ],
  TEXT_CONTENT: {
    product: {
      entryLabel: '关于这支香',
      common: {
        title: '安心入座的理由',
        origin: { part1: '', highlight: '', part2: '' },
        footer: '',
      },
      modal: {
        tinghe: {
          story: {
            content: [
              '长明岛有一片荷塘，清晨时分最是动人。',
              '薄雾还在水面萦绕，露珠已在荷叶上悄悄滚动。',
            ],
          },
        },
        wanxiang: {
          story: {
            content: [
              '老巷深处，秋雨过后，夕阳在青石板上染了一层金。',
              '那甜美的气息从某户人家飘出来，让人不由得停下脚步。',
            ],
          },
        },
        xiaoyuan: {
          story: {
            content: [
              '山间小院，苔藓在石阶上静静生长。',
              '薄荷与迷迭香随风摇曳，草叶沙沙。',
            ],
          },
        },
      },
    },
  },
  DASHBOARD_DATA: { scenarios: [], lifestyle: { title: '', subtitle: '', tag: '', action: '', slogan: '', categories: [] } },
}));

describe('Dashboard - v0.3 香味首页', () => {
  const mockOnScenarioClick = vi.fn();
  const mockOnPlaybackToggle = vi.fn();
  const mockOnMuteToggle = vi.fn();
  const mockOnClosePlayer = vi.fn();
  const mockOnTimerComplete = vi.fn();
  let localStorageStore: Record<string, string>;

  beforeEach(() => {
    localStorageStore = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageStore[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageStore[key];
        }),
        clear: vi.fn(() => {
          localStorageStore = {};
        }),
      },
      configurable: true,
    });
    mockOnScenarioClick.mockClear();
    mockOnPlaybackToggle.mockClear();
    mockOnMuteToggle.mockClear();
    mockOnClosePlayer.mockClear();
    mockOnTimerComplete.mockClear();
  });

  it('renders the v0.3 first-screen copy, weekly entry, and scent cards', () => {
    const { container } = render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

    const brandLogo = screen.getByAltText('小屿和品牌 Logo');
    expect(brandLogo).toBeInTheDocument();
    expect(brandLogo).toHaveAttribute('src', '/xiaoyuhe-logo.png');
    expect(brandLogo.className).toContain('w-[10.4rem]');
    expect(screen.queryByText('小屿和 · 香')).not.toBeInTheDocument();
    expect(screen.getByText('找到你手里的那支香')).toBeInTheDocument();
    expect(screen.getByText('每一支香，都有一段可打开的气味故事。')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /打开听荷/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /打开晚巷/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /打开小院/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看这一周的心绪' })).toBeInTheDocument();

    expect(screen.queryByText('确认今日香型')).not.toBeInTheDocument();
    expect(screen.queryByText('轻触确认，开启此刻的疗愈')).not.toBeInTheDocument();
    expect(screen.queryByText('点一支')).not.toBeInTheDocument();
    expect(screen.queryByText('心情足迹')).not.toBeInTheDocument();

    const tingheCard = screen.getByRole('button', { name: /打开听荷/ });
    const gradientBand = tingheCard.querySelector('div[style*="linear-gradient"]');
    expect(gradientBand?.getAttribute('style')).toContain('rgb(244, 225, 220)');
    expect(gradientBand?.querySelector('[class*="bg-white/45"]')).toBeNull();
    expect(container.textContent).not.toContain('“');
    expect(container.textContent).not.toContain('”');
    expect(container.innerHTML).toContain('rgba(226, 156, 146, 0.32)');
    expect(container.firstElementChild).toHaveClass('no-scrollbar');
  });

  it('starts the scent experience immediately when a scent card is clicked', async () => {
    const user = userEvent.setup();
    render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

    await user.click(screen.getByRole('button', { name: /打开听荷/ }));

    expect(mockOnScenarioClick).toHaveBeenCalledTimes(1);
    expect(mockOnScenarioClick).toHaveBeenCalledWith('tinghe');
    expect(screen.getByText('15:00')).toBeInTheDocument();
    expect(screen.queryByText('还剩')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '暂停播放' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '设置燃香时间' })).toBeInTheDocument();
  });

  it('renders the expanded player with focus copy and ingredient tags instead of the old timer ring', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Dashboard
        onScenarioClick={mockOnScenarioClick}
        activeScentId="tinghe"
        isPlaying
        isMuted={false}
        onPlaybackToggle={mockOnPlaybackToggle}
        onMuteToggle={mockOnMuteToggle}
        onClosePlayer={mockOnClosePlayer}
      />
    );

    expect(screen.getByText('听荷')).toBeInTheDocument();
    expect(screen.getByText('Listening to Lotus')).toBeInTheDocument();
    expect(screen.getByText('制香师说')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '关闭播放页' })).toBeInTheDocument();
    expect(container.querySelector('.lucide-message-circle-more')).not.toBeNull();
    expect(screen.getByText((content) => content.includes('长明岛有一片荷塘，清晨时分最是动人。'))).toBeInTheDocument();
    expect(screen.getByText('九品香水莲')).toBeInTheDocument();
    expect(screen.getByText('斑斓叶')).toBeInTheDocument();
    expect(screen.queryByText('正在打开这支香')).not.toBeInTheDocument();
    expect(container.querySelector('svg[viewBox="0 0 100 100"]')).toBeNull();
    expect(container.textContent).not.toContain('“');
    expect(container.textContent).not.toContain('”');

    await user.click(screen.getByText('制香师说'));

    const storyPanel = container.querySelector('[data-sheet-panel="story"][data-state="open"]');
    expect(storyPanel).not.toBeNull();
    expect(storyPanel).toHaveClass('no-scrollbar');
    expect(screen.getByText('和清净在一起')).toBeInTheDocument();
    expect(screen.queryByText('听荷的制香师说')).not.toBeInTheDocument();
    expect(screen.queryByText('和清静在一起')).not.toBeInTheDocument();
    expect(screen.getByText('[ 气味印象 ]')).toBeInTheDocument();
    expect(screen.getByText('[ 用了什么原材 ]')).toBeInTheDocument();
    expect(screen.getByText('[ 为什么这样调 ]')).toBeInTheDocument();
    expect(screen.getByText('[ 适合什么时候点 ]')).toBeInTheDocument();
    expect(screen.getByText('独处的静谧时刻')).toBeInTheDocument();
    const reasonSection = container.querySelector('[data-story-section="reason"]');
    const occasionSection = container.querySelector('[data-story-section="occasion"]');
    expect(reasonSection?.className).toContain('leading-7');
    expect(reasonSection?.className).toContain('tracking-[-0.03em]');
    expect(occasionSection?.className).toContain('leading-7');
    expect(occasionSection?.className).toContain('tracking-[-0.03em]');

    await user.click(screen.getByRole('button', { name: '关闭制香师说' }));
    await waitFor(() => {
      expect(container.querySelector('[data-sheet-panel="story"]')).toBeNull();
    });
  });

  it.each([
    ['wanxiang', '和温柔在一起'],
    ['xiaoyuan', '和自在在一起'],
  ])('uses a unified atmosphere title for %s story sheet', async (scentId, expectedTitle) => {
    const user = userEvent.setup();
    render(
      <Dashboard
        onScenarioClick={mockOnScenarioClick}
        activeScentId={scentId}
        isPlaying
        isMuted={false}
        onPlaybackToggle={mockOnPlaybackToggle}
        onMuteToggle={mockOnMuteToggle}
        onClosePlayer={mockOnClosePlayer}
      />
    );

    await user.click(screen.getByText('制香师说'));

    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
    expect(screen.queryByText(/的制香师说/)).not.toBeInTheDocument();
  });

  it('allows the incense duration to be changed from settings', async () => {
    const user = userEvent.setup();
    const { container } = render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

    await user.click(screen.getByRole('button', { name: /打开听荷/ }));
    await user.click(screen.getByRole('button', { name: '设置燃香时间' }));
    const timerSettingsPanel = container.querySelector('[data-sheet-panel="timer-settings"]');
    expect(timerSettingsPanel).not.toBeNull();
    expect(timerSettingsPanel?.className).toContain('bg-[#fffaf8]/98');
    expect(screen.getByText('想让这段声音陪你多久？')).toBeInTheDocument();
    expect(screen.getByText('这里只调整声音陪伴的时长，不影响你手中的香。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '20 分钟' }));
    await user.click(screen.getByRole('button', { name: '确认' }));

    expect(screen.getByText('20:00')).toBeInTheDocument();
    expect(screen.queryByText('想让这段声音陪你多久？')).not.toBeInTheDocument();
  });

  it('records the finished scent mood with related contexts in local storage', async () => {
    vi.useFakeTimers();

    try {
      render(
        <Dashboard
          onScenarioClick={mockOnScenarioClick}
          activeScentId="tinghe"
          isPlaying
          isMuted={false}
          onPlaybackToggle={mockOnPlaybackToggle}
          onMuteToggle={mockOnMuteToggle}
          onClosePlayer={mockOnClosePlayer}
          onTimerComplete={mockOnTimerComplete}
          initialRemainingSeconds={1}
        />
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockOnTimerComplete).toHaveBeenCalledTimes(1);
      expect(screen.getByText('你现在感受如何？')).toBeInTheDocument();
      expect(screen.getByText('现在的你，更接近哪一种？')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '平静' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '满足' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '轻松' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '疲惫' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '焦虑' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '低落' })).toBeInTheDocument();
      expect(screen.getByLabelText('心情气泡')).toHaveClass('overflow-visible');
      expect(screen.getByLabelText('心情气泡')).not.toHaveClass('overflow-auto');

      fireEvent.click(screen.getByRole('button', { name: '平静' }));

      expect(screen.getByText('这份感觉和什么有关？')).toBeInTheDocument();
      expect(screen.queryByText((content) => content.includes('最多选 3 个。'))).not.toBeInTheDocument();

      expect(screen.getByRole('button', { name: '跳过' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '记下这一刻' })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '工作' }));

      const storedRecords = JSON.parse(window.localStorage.getItem('xiaoyu_scent_mood_records_v1') ?? '[]');
      expect(storedRecords).toHaveLength(1);
      expect(storedRecords[0]).toMatchObject({
        version: 1,
        scentId: 'tinghe',
        scentName: '听荷',
        durationMinutes: 15,
        durationSeconds: 900,
        moodId: 'calm',
        mood: '平静',
        related: ['工作'],
      });
      expect(screen.getByText('已经记录')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '好，先这样' })).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(screen.queryByLabelText('记录此刻心情')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('can open directly into the related-context step for local preview and keep the timer paused', () => {
    render(
      <Dashboard
        onScenarioClick={mockOnScenarioClick}
        activeScentId="tinghe"
        isPlaying={false}
        isMuted={false}
        onPlaybackToggle={mockOnPlaybackToggle}
        onMuteToggle={mockOnMuteToggle}
        onClosePlayer={mockOnClosePlayer}
        previewMoodRecordStep="context"
        previewMoodRecordMoodId="anxious"
      />
    );

    expect(screen.getByText('这份感觉和什么有关？')).toBeInTheDocument();
    expect(screen.queryByText('你选了 焦虑')).not.toBeInTheDocument();
    expect(screen.queryByText('脑子和心都还有点悬着。')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '记下这一刻' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '跳过' })).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
    expect(mockOnTimerComplete).not.toHaveBeenCalled();
  });

  it('opens the weekly mood sheet with the latest local record details only', () => {
    const latestRecordDate = new Date();
    const earlierRecordDate = new Date(latestRecordDate.getTime() - 60 * 60 * 1000);

    localStorageStore.xiaoyu_scent_mood_records_v1 = JSON.stringify([
      {
        version: 1,
        id: 'record-latest',
        createdAt: latestRecordDate.toISOString(),
        scentId: 'wanxiang',
        scentName: '晚巷',
        durationMinutes: 10,
        durationSeconds: 600,
        moodId: 'calm',
        mood: '平静',
        related: ['房间'],
      },
      {
        version: 1,
        id: 'record-earlier',
        createdAt: earlierRecordDate.toISOString(),
        scentId: 'tinghe',
        scentName: '听荷',
        durationMinutes: 15,
        durationSeconds: 900,
        moodId: 'anxious',
        mood: '焦虑',
        related: ['工作'],
      },
    ]);

    render(<Dashboard onScenarioClick={mockOnScenarioClick} />);

    fireEvent.click(screen.getByRole('button', { name: '查看这一周的心绪' }));

    const sheet = screen.getByRole('dialog', { name: '这一周的心绪' });
    expect(within(sheet).getByText('这一周的心绪')).toBeInTheDocument();
    expect(within(sheet).getByText('最近 7 天，记录了 2 次。')).toBeInTheDocument();
    expect(within(sheet).getByText('最后一条')).toBeInTheDocument();
    expect(within(sheet).getByText('2 次')).toBeInTheDocument();
    expect(within(sheet).getByText('点了什么香')).toBeInTheDocument();
    expect(within(sheet).getByText('晚巷')).toBeInTheDocument();
    expect(within(sheet).getByText('点了多久')).toBeInTheDocument();
    expect(within(sheet).getByText('10 分钟')).toBeInTheDocument();
    expect(within(sheet).getByText('心情如何')).toBeInTheDocument();
    expect(within(sheet).getByText('平静')).toBeInTheDocument();
    expect(within(sheet).getByText('和什么有关')).toBeInTheDocument();
    expect(within(sheet).getByText('房间')).toBeInTheDocument();
    expect(within(sheet).queryByText('听荷')).not.toBeInTheDocument();
    expect(within(sheet).queryByText('15 分钟')).not.toBeInTheDocument();
    expect(within(sheet).queryByText('焦虑')).not.toBeInTheDocument();
    expect(within(sheet).queryByText('工作')).not.toBeInTheDocument();
    expect(within(sheet).queryByText(/推荐|建议|分析/)).not.toBeInTheDocument();
  });
});
