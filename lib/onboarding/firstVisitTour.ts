export const FIRST_VISIT_TOUR_STORAGE_KEY = 'xiaoyu_first_visit_tour_v1';

export type FirstVisitTourStep =
  | 'scent'
  | 'timer'
  | 'timer-settings'
  | 'story'
  | 'story-close'
  | 'home'
  | 'weekly'
  | 'record'
  | 'mood'
  | 'context'
  | 'collect'
  | 'weekly-close'
  | 'notification';

const TOUR_SEQUENCE: FirstVisitTourStep[] = [
  'scent', 'timer', 'timer-settings', 'story', 'story-close', 'home', 'weekly',
  'record', 'mood', 'context', 'collect', 'weekly-close', 'notification',
];

export const TOUR_COPY: Record<FirstVisitTourStep, { target: string; title: string; body: string; progress: string }> = {
  scent: { target: 'scent', title: '先选一支香', body: '点击高亮的这支香，声音会随它一起开始。', progress: '1 / 5' },
  timer: { target: 'timer', title: '设置陪伴时间', body: '点击计时器，选择你喜欢的声音时长。', progress: '2 / 5' },
  'timer-settings': { target: 'timer-settings', title: '选一个喜欢的时长', body: '选择一个时长，再点击确认。', progress: '2 / 5' },
  story: { target: 'story', title: '认识这支香', body: '点击“制香师说”，看看这支香的气味故事。', progress: '3 / 5' },
  'story-close': { target: 'story-close', title: '看完后继续', body: '点击关闭，回到播放页。', progress: '3 / 5' },
  home: { target: 'home', title: '回到主页', body: '点击右上角关闭播放页。', progress: '4 / 5' },
  weekly: { target: 'weekly', title: '找到一周心绪', body: '点击“一周心绪”，留下你的第一条记录。', progress: '4 / 5' },
  record: { target: 'record', title: '记录此刻', body: '从这里开始添加第一份心情。', progress: '4 / 5' },
  mood: { target: 'mood', title: '选择此刻的感受', body: '点击一个最接近你现在状态的心情。', progress: '4 / 5' },
  context: { target: 'context', title: '看看它和什么有关', body: '选择一个因素；暂时说不清也可以跳过。', progress: '4 / 5' },
  collect: { target: 'collect', title: '收好这次记录', body: '点击“收好”，这条心绪会进入最近 7 天。', progress: '4 / 5' },
  'weekly-close': { target: 'weekly-close', title: '回到主页', body: '关闭一周心绪，完成最后一步。', progress: '5 / 5' },
  notification: { target: 'notification', title: '音乐结束时提醒你', body: '点击通知铃铛。你可以选择开启提醒，音乐结束后回来记录心情。', progress: '5 / 5' },
};

type ReadStorage = Pick<Storage, 'getItem'>;

export const getInitialTourStep = (storage: ReadStorage | null, isReviewMode: boolean): FirstVisitTourStep | null => {
  if (isReviewMode || !storage) return null;
  return storage.getItem(FIRST_VISIT_TOUR_STORAGE_KEY) === 'completed' ? null : 'scent';
};

export const nextTourStep = (current: FirstVisitTourStep): FirstVisitTourStep | null => {
  const index = TOUR_SEQUENCE.indexOf(current);
  return TOUR_SEQUENCE[index + 1] ?? null;
};
