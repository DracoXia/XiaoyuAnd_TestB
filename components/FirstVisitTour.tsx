import React, { useLayoutEffect, useState } from 'react';
import { TOUR_COPY, type FirstVisitTourStep } from '../lib/onboarding/firstVisitTour';

type FirstVisitTourProps = {
  step: FirstVisitTourStep;
  onSkip: () => void;
};

type FocusRect = { top: number; left: number; right: number; bottom: number; width: number; height: number };

const PADDING = 8;

const FirstVisitTour: React.FC<FirstVisitTourProps> = ({ step, onSkip }) => {
  const [rect, setRect] = useState<FocusRect | null>(null);
  const copy = TOUR_COPY[step];

  useLayoutEffect(() => {
    const update = () => {
      const target = document.querySelector<HTMLElement>(`[data-tour-target="${copy.target}"]`);
      if (!target) {
        setRect(null);
        return;
      }
      const bounds = target.getBoundingClientRect();
      setRect({ top: bounds.top, left: bounds.left, right: bounds.right, bottom: bounds.bottom, width: bounds.width, height: bounds.height });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const timer = window.setTimeout(update, 260);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [copy.target]);

  if (!rect) return null;
  const holeTop = Math.max(0, rect.top - PADDING);
  const holeLeft = Math.max(0, rect.left - PADDING);
  const holeRight = Math.min(window.innerWidth, rect.right + PADDING);
  const holeBottom = Math.min(window.innerHeight, rect.bottom + PADDING);
  const showBelow = holeBottom < window.innerHeight * 0.58;
  const tooltipStyle: React.CSSProperties = showBelow
    ? { top: Math.min(window.innerHeight - 180, holeBottom + 16) }
    : { bottom: Math.min(window.innerHeight - 180, window.innerHeight - holeTop + 16) };

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-live="polite">
      <div className="pointer-events-auto absolute backdrop-blur-[1px]" style={{ inset: `0 0 auto 0`, height: holeTop, backgroundColor: 'rgba(23, 20, 27, 0.68)' }} />
      <div className="pointer-events-auto absolute backdrop-blur-[1px]" style={{ inset: `${holeBottom}px 0 0 0`, backgroundColor: 'rgba(23, 20, 27, 0.68)' }} />
      <div className="pointer-events-auto absolute backdrop-blur-[1px]" style={{ top: holeTop, left: 0, width: holeLeft, height: holeBottom - holeTop, backgroundColor: 'rgba(23, 20, 27, 0.68)' }} />
      <div className="pointer-events-auto absolute backdrop-blur-[1px]" style={{ top: holeTop, left: holeRight, right: 0, height: holeBottom - holeTop, backgroundColor: 'rgba(23, 20, 27, 0.68)' }} />
      <div
        data-testid="tour-focus-ring"
        className="pointer-events-none absolute rounded-[1.5rem] border-2 border-white/95 shadow-[0_0_0_4px_rgba(255,255,255,0.18),0_18px_55px_rgba(0,0,0,0.22)]"
        style={{ top: holeTop, left: holeLeft, width: holeRight - holeLeft, height: holeBottom - holeTop }}
      />
      <div
        role="dialog"
        aria-label="新手引导"
        className="pointer-events-none absolute left-4 right-4 rounded-[1.35rem] border border-white/70 bg-[#fffaf8] p-4 text-[#2d2730] shadow-[0_20px_60px_rgba(20,16,24,0.24)]"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#9b8795]">{copy.progress} · 快速认识小屿和</p>
            <h2 className="mt-2 text-lg font-medium">{copy.title}</h2>
            <p className="mt-1 text-sm leading-6 text-[#706672]">{copy.body}</p>
          </div>
          <button type="button" aria-label="跳过引导" onClick={onSkip} className="pointer-events-auto shrink-0 rounded-full px-2 py-1 text-xs text-[#8a7d86]">跳过</button>
        </div>
      </div>
    </div>
  );
};

export default FirstVisitTour;
