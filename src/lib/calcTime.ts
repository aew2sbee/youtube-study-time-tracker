export const calcStudyTime = (start: Date, end: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  const safeDiffMs = Math.max(diffMs, 0); // マイナスにならないように
  return Math.floor(safeDiffMs / 1000);
};

export const calcTime = (seconds: number): string => {
  if (seconds === 0) return '0h 00min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString()}h ${minutes.toString().padStart(2, '0')}min`;
};

export const convertHHMMSS = (publishedAt: string) =>
  new Date(publishedAt).toLocaleTimeString('ja-JP', {
    hour12: false,
    timeZone: 'Asia/Tokyo',
  });
