export type MoodId = 'calm' | 'contented' | 'relaxed' | 'tired' | 'anxious' | 'low';
export type MoodContextId =
  | 'workload'
  | 'recognition'
  | 'manager'
  | 'colleagues'
  | 'fairness'
  | 'boundaries'
  | 'meaning'
  | 'career-future'
  | 'sleep'
  | 'body'
  | 'family'
  | 'unclear';

export type MoodOption = {
  id: MoodId;
  label: string;
  note: string;
  positionClassName: string;
  orbClassName: string;
  labelClassName?: string;
};

export type MoodContextOption = { id: MoodContextId; label: string };

export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'calm', label: '平静', note: '心里暂时没有那么多拉扯。', positionClassName: 'left-4 top-3 z-10 w-20', orbClassName: 'h-[4.75rem] w-[4.75rem] bg-[#e7f0dd] shadow-[#d8e9cd]/45', labelClassName: 'text-[15px] font-semibold text-slate-700' },
  { id: 'contented', label: '满足', note: '有一些事情，此刻是够的。', positionClassName: 'right-4 top-4 z-10 w-20', orbClassName: 'h-[4.75rem] w-[4.75rem] bg-[#f4eadb] shadow-[#ebddc4]/45', labelClassName: 'text-[15px] font-semibold text-slate-700' },
  { id: 'relaxed', label: '轻松', note: '绷着的地方松开了一点。', positionClassName: 'left-1/2 top-[4.75rem] z-10 w-20 -translate-x-1/2', orbClassName: 'h-[4.25rem] w-[4.25rem] bg-[#e1edf2] shadow-[#d4e6ed]/45', labelClassName: 'text-[15px] font-semibold text-slate-700' },
  { id: 'tired', label: '疲惫', note: '今天已经用掉了很多力气。', positionClassName: 'right-6 top-[9.75rem] z-0 w-[4.5rem]', orbClassName: 'h-16 w-16 bg-[#dbe5f3] shadow-[#d5deef]/45' },
  { id: 'anxious', label: '焦虑', note: '脑子和心里还有些悬着。', positionClassName: 'left-1/2 top-[11.25rem] z-0 w-[4.5rem] -translate-x-1/2', orbClassName: 'h-14 w-14 bg-[#f5dfd9] shadow-[#edd1c9]/45' },
  { id: 'low', label: '低落', note: '情绪像是往下沉了一些。', positionClassName: 'left-6 top-[9.75rem] z-0 w-[4.5rem]', orbClassName: 'h-16 w-16 bg-[#eee1ef] shadow-[#e6d5e7]/45' },
];
export const CONTEXT_OPTIONS: MoodContextOption[] = [
  { id: 'workload', label: '工作量' },
  { id: 'recognition', label: '评价认可' },
  { id: 'manager', label: '领导相处' },
  { id: 'colleagues', label: '同事关系' },
  { id: 'fairness', label: '规则公平' },
  { id: 'boundaries', label: '时间边界' },
  { id: 'meaning', label: '意义感' },
  { id: 'career-future', label: '职业未来' },
  { id: 'sleep', label: '睡眠' },
  { id: 'body', label: '身体' },
  { id: 'family', label: '家人关系' },
  { id: 'unclear', label: '说不清' },
];
