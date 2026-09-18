export const getTimerEndedUrl = (scentId: string) => (
  `/?preview=timer-ended&scent=${encodeURIComponent(scentId)}`
);

export const getUpdateCenterUrl = () => '/?open=updates';
