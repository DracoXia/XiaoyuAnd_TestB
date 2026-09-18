import updates from '../../public/updates.json';

export type AppUpdate = {
  id: string;
  version: string;
  publishedAt: string;
  title: string;
  summary: string;
  details: string[];
};

export const UPDATE_READ_STORAGE_KEY = 'xiaoyu_last_seen_update_id_v1';

export const APP_UPDATES = updates satisfies AppUpdate[];

export const getSortedUpdates = () => [...APP_UPDATES].sort(
  (left, right) => right.publishedAt.localeCompare(left.publishedAt),
);
