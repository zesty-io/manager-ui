export default (word: string, count: number) => {
  return count > 1 ? `${word}s` : word;
};
