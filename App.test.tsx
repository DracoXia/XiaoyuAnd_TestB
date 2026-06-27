import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const startSessionMock = vi.fn().mockResolvedValue(undefined);
const endSessionMock = vi.fn();
const updateAudioModeMock = vi.fn();
const trackEventMock = vi.fn();
const recordMoodMock = vi.fn();

vi.mock('./constants', () => ({
  TEXT_CONTENT: {},
  DEFAULT_AUDIO_URL: 'default.mp3',
  TRANSITION_AUDIO_URL: 'transition.mp3',
  IMMERSION_DURATION: 15 * 60 * 1000,
  MOOD_OPTIONS: [],
  CONTEXT_OPTIONS: [],
  AMBIANCE_MODES: [],
  FRAGRANCE_LIST: [
    {
      id: 'tinghe',
      name: '听荷',
      audioUrl: 'tinghe.mp3',
    },
  ],
  MOCK_ECHOES_BY_MOOD: {},
  PINK_NOISE_URL: 'pink.mp3',
  BROWN_NOISE_URL: 'brown.mp3',
}));

vi.mock('./components/DynamicBackground', () => ({
  default: () => <div data-testid="dynamic-background" />,
}));

vi.mock('./components/AudioPlayer', () => ({
  default: ({ url, isPlaying, volume }: { url: string; isPlaying: boolean; volume: number }) => (
    <div
      data-testid="audio-player"
      data-url={url}
      data-playing={String(isPlaying)}
      data-volume={String(volume)}
    />
  ),
}));

vi.mock('./components/Ritual', () => ({
  default: () => <div data-testid="ritual-layer" />,
}));

vi.mock('./components/Dashboard', () => ({
  default: ({
    activeScentId,
    isPlaying,
    onScenarioClick,
    onClosePlayer,
    onTimerComplete,
    previewMoodRecordStep,
    previewMoodRecordMoodId,
  }: {
    activeScentId?: string | null;
    isPlaying?: boolean;
    onScenarioClick: (id: string) => void;
    onClosePlayer?: () => void;
    onTimerComplete?: () => void;
    previewMoodRecordStep?: 'mood' | 'context' | null;
    previewMoodRecordMoodId?: string | null;
  }) => (
    <div>
      <button type="button" onClick={() => onScenarioClick('tinghe')}>
        open-scent
      </button>
      {activeScentId && (
        <>
          <button type="button" onClick={onClosePlayer}>
            close-scent
          </button>
          <button type="button" onClick={onTimerComplete}>
            complete-scent
          </button>
        </>
      )}
      <div
        data-testid="dashboard-state"
        data-active-scent={activeScentId ?? ''}
        data-playing={String(Boolean(isPlaying))}
        data-preview-step={previewMoodRecordStep ?? ''}
        data-preview-mood={previewMoodRecordMoodId ?? ''}
      />
    </div>
  ),
}));

vi.mock('./components/PlaylistModal', () => ({
  default: () => null,
}));

vi.mock('./components/GeminiService', () => ({
  GeminiService: {
    getDailySign: vi.fn().mockResolvedValue(''),
    getTreeHoleReply: vi.fn(),
    validateHealingContent: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('./hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    startSession: startSessionMock,
    endSession: endSessionMock,
    updateAudioMode: updateAudioModeMock,
    trackEvent: trackEventMock,
    recordMood: recordMoodMock,
    getCurrentSessionId: () => 'session-1',
  }),
}));

vi.mock('./lib/analytics/entryDetection', () => ({
  detectEntryType: () => ({ type: 'dashboard', isFromNFC: false }),
  clearNFCParams: vi.fn(),
}));

const getAudioState = (url: string) => {
  const element = screen
    .getAllByTestId('audio-player')
    .find((audio) => audio.getAttribute('data-url') === url);

  if (!element) {
    throw new Error(`Audio player with url "${url}" was not rendered.`);
  }

  return {
    element,
    isPlaying: element.getAttribute('data-playing'),
    volume: Number(element.getAttribute('data-volume')),
  };
};

describe('App dashboard close fade-out', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.history.replaceState({}, '', '/');
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      configurable: true,
    });
    startSessionMock.mockClear();
    endSessionMock.mockClear();
    updateAudioModeMock.mockClear();
    trackEventMock.mockClear();
    recordMoodMock.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('fades the scent audio out before stopping when closing the dashboard player', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'open-scent' }));

    expect(screen.getByTestId('dashboard-state')).toHaveAttribute('data-active-scent', 'tinghe');
    expect(getAudioState('tinghe.mp3').isPlaying).toBe('true');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const volumeBeforeClose = getAudioState('tinghe.mp3').volume;
    expect(volumeBeforeClose).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'close-scent' }));

    expect(screen.getByTestId('dashboard-state')).toHaveAttribute('data-active-scent', '');
    expect(getAudioState('tinghe.mp3').isPlaying).toBe('true');

    act(() => {
      vi.advanceTimersByTime(180);
    });

    const volumeDuringFade = getAudioState('tinghe.mp3').volume;
    expect(volumeDuringFade).toBeLessThan(volumeBeforeClose);
    expect(volumeDuringFade).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(220);
    });

    expect(getAudioState('tinghe.mp3').isPlaying).toBe('false');
    expect(getAudioState('tinghe.mp3').volume).toBe(0);
  });

  it('keeps the dashboard player mounted while fading audio after dashboard timer completion', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'open-scent' }));

    expect(screen.getByTestId('dashboard-state')).toHaveAttribute('data-active-scent', 'tinghe');
    expect(getAudioState('tinghe.mp3').isPlaying).toBe('true');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const volumeBeforeCompletion = getAudioState('tinghe.mp3').volume;
    expect(volumeBeforeCompletion).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'complete-scent' }));

    expect(endSessionMock).toHaveBeenCalledWith('session-1', expect.any(Number), true);
    expect(updateAudioModeMock).toHaveBeenCalledWith('session-1', 'silent');
    expect(screen.getByTestId('dashboard-state')).toHaveAttribute('data-active-scent', 'tinghe');
    expect(getAudioState('tinghe.mp3').isPlaying).toBe('true');

    act(() => {
      vi.advanceTimersByTime(450);
    });

    const volumeDuringFade = getAudioState('tinghe.mp3').volume;
    expect(volumeDuringFade).toBeLessThan(volumeBeforeCompletion);
    expect(volumeDuringFade).toBeGreaterThan(0);
    expect(screen.getByTestId('dashboard-state')).toHaveAttribute('data-active-scent', 'tinghe');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTestId('dashboard-state')).toHaveAttribute('data-active-scent', 'tinghe');
    expect(getAudioState('tinghe.mp3').isPlaying).toBe('false');
    expect(getAudioState('tinghe.mp3').volume).toBe(0);
  });

  it('opens the dashboard mood-context preview from the local query params without auto-playing', () => {
    window.history.replaceState({}, '', '/?preview=mood-context&scent=tinghe&mood=anxious');

    render(<App />);

    expect(screen.getByTestId('dashboard-state')).toHaveAttribute('data-active-scent', 'tinghe');
    expect(screen.getByTestId('dashboard-state')).toHaveAttribute('data-preview-step', 'context');
    expect(screen.getByTestId('dashboard-state')).toHaveAttribute('data-preview-mood', 'anxious');
    expect(getAudioState('tinghe.mp3').isPlaying).toBe('false');
    expect(getAudioState('tinghe.mp3').volume).toBe(1);
  });
});
