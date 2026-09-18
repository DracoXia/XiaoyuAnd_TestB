import React from 'react';
import { Check, X } from 'lucide-react';
import { CONTEXT_OPTIONS, MOOD_OPTIONS, type MoodContextId, type MoodId } from '../lib/mood/options';

export type MoodRecorderStep = 'mood' | 'context' | 'feedback';

type MoodRecorderSheetProps = {
  step: MoodRecorderStep;
  selectedMoodId: MoodId | null;
  feedbackText: string | null;
  onMoodSelect: (moodId: MoodId) => void;
  onContextSelect: (contextId: MoodContextId) => void;
  onSkipContext: () => void;
  onBack: () => void;
  onClose: () => void;
  onCollect: () => void;
};

const MoodRecorderSheet: React.FC<MoodRecorderSheetProps> = ({
  step,
  selectedMoodId,
  feedbackText,
  onMoodSelect,
  onContextSelect,
  onSkipContext,
  onBack,
  onClose,
  onCollect,
}) => (
  <div
    data-sheet-overlay="mood-record"
    className="fixed inset-0 z-[70] flex items-end bg-[#fbf3f4]/70 backdrop-blur-[10px] animate-fade-in"
    onClick={onClose}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label="记录此刻心情"
      data-sheet-panel="mood-record"
      data-step={step}
      className="max-h-[94dvh] w-full overflow-y-auto rounded-t-[2rem] border border-white/80 bg-[#fffaf8] px-6 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] pt-6 shadow-[0_-28px_90px_rgba(94,69,72,0.12)] animate-fade-in-up"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-300/70" />

      {step === 'mood' && (
        <div className="mx-auto max-w-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">MOMENT CHECK</p>
              <h2 className="mt-2 text-2xl font-medium text-slate-800">你现在感受如何？</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">现在的你，更接近哪一种？</p>
            </div>
            <button type="button" aria-label="先不记" onClick={onClose} className="rounded-full bg-slate-900/5 p-2 text-slate-700">
              <X className="h-5 w-5" strokeWidth={1.6} />
            </button>
          </div>
          <div aria-label="心情气泡" data-tour-target="mood" className="relative mx-auto mt-6 h-[17rem] max-w-[330px] overflow-visible">
            {MOOD_OPTIONS.map((mood) => (
              <button key={mood.id} type="button" aria-label={mood.label} onClick={() => onMoodSelect(mood.id)} className={`group absolute flex flex-col items-center gap-2 text-slate-500 outline-none transition duration-500 active:scale-95 ${mood.positionClassName}`}>
                <span className={`block rounded-full border border-white/60 blur-[1px] shadow-xl transition duration-500 group-hover:scale-110 group-hover:blur-0 ${mood.orbClassName}`} />
                <span className={`relative z-10 text-sm font-medium tracking-[0.04em] text-slate-600 drop-shadow-[0_2px_10px_rgba(255,255,255,0.96)] ${mood.labelClassName ?? ''}`}>{mood.label}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} className="mx-auto mt-2 block rounded-full bg-white/55 px-5 py-3 text-sm font-medium text-slate-500">先不记</button>
        </div>
      )}

      {step === 'context' && selectedMoodId && (
        <div className="mx-auto max-w-md">
          <button type="button" onClick={onBack} className="mb-5 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">返回</button>
          <h2 className="mt-6 text-2xl font-medium text-slate-800">这份感觉和什么有关？</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">选一个此刻最靠近的因素。</p>
          <div data-tour-target="context" className="mt-5 flex flex-wrap gap-2.5">
            {CONTEXT_OPTIONS.map((context) => (
              <button key={context.id} type="button" onClick={() => onContextSelect(context.id)} className="inline-flex items-center rounded-full border border-white/70 bg-white/58 px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:border-[#d99b91]/40 hover:bg-white hover:text-[#7a4038] active:scale-95">
                {context.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={onSkipContext} className="mt-7 rounded-full bg-white/58 px-5 py-3 text-sm font-medium text-slate-500">跳过</button>
        </div>
      )}

      {step === 'feedback' && (
        <div className="mx-auto max-w-md py-7 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/80 bg-[#f4ddd8] text-[#7a4038] shadow-[0_18px_48px_rgba(217,155,145,0.22)]">
            <Check className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <h2 className="text-2xl font-medium text-slate-800">这一刻被记下来了</h2>
          <p className="mx-auto mt-5 max-w-sm text-[15px] leading-8 text-slate-600">{feedbackText}</p>
          <button type="button" data-tour-target="collect" onClick={onCollect} className="mt-8 rounded-full bg-[#6f5b68] px-8 py-3 text-sm font-medium text-white shadow-[0_12px_28px_rgba(111,91,104,0.2)] active:scale-95">收好</button>
        </div>
      )}
    </div>
  </div>
);

export default MoodRecorderSheet;
