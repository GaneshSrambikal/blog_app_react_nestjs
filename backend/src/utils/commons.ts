export const getReadingTime = (content: String) => {
  const wordsPerMinute: number = 200;
  const wordsCount: number = content.split(/\s+/).length;
  const minutes: number = Math.ceil(wordsCount / wordsPerMinute);

  return minutes;
};
