/**
 * Test Data Helpers
 * Shared test data for E2E tests
 */

export const TEST_SCENTS = {
  tinghe: {
    id: 'tinghe',
    name: '听荷',
    keyword: '荷塘',
    desc: '和清静在一起',
  },
  wanxiang: {
    id: 'wanxiang',
    name: '晚巷',
    keyword: '老巷',
    desc: '和温柔在一起',
  },
  xiaoyuan: {
    id: 'xiaoyuan',
    name: '小院',
    keyword: '山间',
    desc: '和自在在一起',
  },
} as const;

export const TEST_MOODS = [
  '有点焦虑',
  '有点累',
  '有点乱',
  '有点难过',
  '想静静',
  '小确幸',
] as const;

export const TEST_CONTEXTS = [
  '工作/学业',
  '感情',
  '健康/身材',
  '家庭',
  '人际关系',
  '说不清',
] as const;

export const TEST_AMBIANCE_MODES = ['本味', '入眠', '冥想'] as const;

export const SAMPLE_HEALING_TEXTS = [
  '今天天气真好，和朋友喝了咖啡，感觉很温暖。',
  '下班路上的晚霞很美，突然觉得疲惫都被治愈了。',
  '周末和家人一起做饭，简单却很幸福。',
  '完成了今天的工作，感觉很有成就感！',
  '雨天的午后，窝在沙发上看书，感觉很平静。',
] as const;

export function getRandomScentId() {
  const ids = Object.keys(TEST_SCENTS);
  return ids[Math.floor(Math.random() * ids.length)];
}

export function getRandomMood() {
  return TEST_MOODS[Math.floor(Math.random() * TEST_MOODS.length)];
}

export function getRandomContext() {
  return TEST_CONTEXTS[Math.floor(Math.random() * TEST_CONTEXTS.length)];
}

export function getRandomHealingText() {
  return SAMPLE_HEALING_TEXTS[Math.floor(Math.random() * SAMPLE_HEALING_TEXTS.length)];
}
