import { CONTEXT_OPTIONS, MOOD_OPTIONS, type MoodContextId, type MoodId } from './options';

type FeedbackStorage = Pick<Storage, 'getItem' | 'setItem'>;
type FeedbackItem = { id: string; text: string };

const ROTATION_STORAGE_KEY = 'xiaoyu_mood_feedback_rotation_v1';

const MOOD_OPENINGS: Record<MoodId, string[]> = {
  calm: ['你注意到此刻是平静的', '这一刻，心里的拉扯少了一些', '你记录下了这份平静', '现在的你，似乎有了一点安稳的余地', '此刻没有那么多声音挤在一起'],
  contented: ['你注意到此刻有一份满足', '这一刻，有些事情显得刚刚好', '你记录下了这份够用的感觉', '现在的你，感到了一点具体的满足', '此刻有一部分期待已经落了地'],
  relaxed: ['你注意到自己轻松了一些', '这一刻，绷着的地方松开了一点', '你记录下了这份松动', '现在的你，似乎少背了一点重量', '此刻的呼吸和心绪都宽了一些'],
  tired: ['你注意到自己已经很疲惫', '这一刻，消耗感很清楚', '你记录下了今天用掉的力气', '现在的你，正感觉到累积的疲惫', '此刻的疲惫没有被忽略'],
  anxious: ['你注意到自己仍有些焦虑', '这一刻，心里还有东西悬着', '你记录下了这份不安', '现在的你，正感到一些持续的牵动', '此刻的焦虑有了一个清楚的名字'],
  low: ['你注意到情绪正在往下沉', '这一刻，低落的感觉很具体', '你记录下了这份沉重', '现在的你，正感到情绪失去了一些亮度', '此刻的低落被如实留下了'],
};

const CONTEXT_LINKS: Record<MoodContextId, string[]> = {
  workload: ['它可能和工作量持续占据你的精力有关', '这份感觉也许与事情太多、节奏太紧有关', '工作任务对注意力的占用，可能正影响着此刻', '它像是在显出工作负荷留下的痕迹', '这份情绪可能与投入的力气和可用精力之间的落差有关'],
  recognition: ['它可能和自己的付出有没有被准确看见有关', '评价与认可，似乎仍牵动着你对这段经历的感受', '这份情绪也许连着投入与实际反馈之间的距离', '它像是在显出你对公平评价和具体认可的在意', '别人的判断可能仍占据着你的一部分注意力'],
  manager: ['它可能和与领导相处时的压力或不确定有关', '这份感觉也许连着权力关系中的谨慎与消耗', '你与领导之间的互动，可能仍影响着此刻', '它像是在显出那段上下级关系留下的张力', '这份情绪可能与表达空间和回应方式有关'],
  colleagues: ['它可能和同事之间的距离、配合或误解有关', '这份感觉也许连着工作关系中的靠近与防备', '同事互动留下的东西，可能仍停在此刻', '它像是在显出合作中没有说清或没有接住的部分', '这份情绪可能与自己在团队里的位置感有关'],
  fairness: ['它可能和规则是否一致、对待是否公平有关', '这份感觉也许连着你对公平和秩序的期待', '规则与实际经历之间的落差，可能仍影响着此刻', '它像是在显出那些难以解释的不一致', '这份情绪可能与付出和对待之间的不对等有关'],
  boundaries: ['它可能和工作侵入个人时间的程度有关', '这份感觉也许连着自己的时间能否由自己安排', '边界被占用或被保留下来，可能正影响着此刻', '它像是在显出工作与生活之间仍未落稳的位置', '这份情绪可能与答应、拒绝和保留空间有关'],
  meaning: ['它可能和这份工作为何值得投入有关', '这份感觉也许连着努力与意义之间的关系', '工作是否仍有意义，可能正影响着此刻', '它像是在显出你对投入方向的重新判断', '这份情绪可能与自己是否认同正在做的事有关'],
  'career-future': ['它可能和下一步会走向哪里有关', '这份感觉也许连着职业道路中的不确定', '对未来位置和选择的判断，可能正影响着此刻', '它像是在显出你对继续、改变或离开的考虑', '这份情绪可能与安全感和可能性之间的拉扯有关'],
  sleep: ['它可能和最近睡眠带来的恢复程度有关', '这份感觉也许连着没有真正休息下来的夜晚', '睡眠的长度和质量，可能正影响着此刻', '它像是在显出身体没有补回来的那部分精力', '这份情绪可能与夜里仍在运转的思绪有关'],
  body: ['它可能和身体已经承受的紧绷或消耗有关', '这份感觉也许连着身体发出的具体信号', '身体的舒适与不适，可能正影响着此刻', '它像是在显出那些被忙碌延后的感受', '这份情绪可能与身体可用的力气有关'],
  family: ['它可能和家人之间的期待、距离或牵挂有关', '这份感觉也许连着家人关系里的责任与需要', '家人互动留下的感受，可能仍停在此刻', '它像是在显出关系中想靠近又需要空间的部分', '这份情绪可能与自己在家人面前承担的位置有关'],
  unclear: ['它暂时还没有清楚的来源，但这份感觉本身已经被看见', '现在还说不清并不等于它没有来处，这份记录先留下了它', '它可能连着几件还没有分开的事情，此刻无需替它下结论', '这份感觉的边界还不清楚，但它已经不再完全模糊', '它也许需要更多片段才能显出关联，现在留下的是第一条线索'],
};

const NO_CONTEXT_LINKS = [
  '它的来源暂时没有被指定，这次记录只忠实留下你的状态',
  '此刻不必把原因说完整，这份情绪已经有了位置',
  '它可能连着不止一件事，现在的记录没有替你下结论',
  '这一次只记录感受本身，也足以成为一条清楚的痕迹',
  '原因仍可以留白，而你此刻的状态已经被看见',
];

export const FEEDBACK_LIBRARY: Record<string, string[]> = Object.fromEntries(
  MOOD_OPTIONS.flatMap((mood) => {
    const withContexts = CONTEXT_OPTIONS.map((context) => [
      `${mood.id}:${context.id}`,
      MOOD_OPENINGS[mood.id].map((opening, index) => `${opening}。${CONTEXT_LINKS[context.id][index]}。`),
    ]);
    return [
      ...withContexts,
      [`${mood.id}:none`, MOOD_OPENINGS[mood.id].map((opening, index) => `${opening}。${NO_CONTEXT_LINKS[index]}。`)],
    ];
  }),
);

const defaultStorage = (): FeedbackStorage | null => typeof window === 'undefined' ? null : window.localStorage;

export const getFeedbackById = (feedbackId: string): FeedbackItem | null => {
  const match = feedbackId.match(/^(.+)-([^-]+(?:-[^-]+)?)-(\d+)$/);
  if (!match) return null;
  const [, moodId, contextId, indexText] = match;
  const key = `${moodId}:${contextId}`;
  const index = Number(indexText) - 1;
  const text = FEEDBACK_LIBRARY[key]?.[index];
  return text ? { id: feedbackId, text } : null;
};

export const getNextFeedback = (
  moodId: MoodId,
  contextId: MoodContextId | null,
  storage: FeedbackStorage | null = defaultStorage(),
): FeedbackItem => {
  const key = `${moodId}:${contextId ?? 'none'}`;
  const messages = FEEDBACK_LIBRARY[key];
  let rotation: Record<string, number> = {};
  if (storage) {
    try {
      rotation = JSON.parse(storage.getItem(ROTATION_STORAGE_KEY) ?? '{}');
    } catch {
      rotation = {};
    }
  }
  const index = Math.max(0, rotation[key] ?? 0) % messages.length;
  if (storage) {
    rotation[key] = (index + 1) % messages.length;
    storage.setItem(ROTATION_STORAGE_KEY, JSON.stringify(rotation));
  }
  return { id: `${moodId}-${contextId ?? 'none'}-${index + 1}`, text: messages[index] };
};
