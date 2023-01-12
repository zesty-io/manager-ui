export const stringStartsWithVowel = (string: string): boolean => {
  const firstLetter = string[0];

  return ["a", "e", "i", "o", "u"].includes(firstLetter.toLowerCase());
};
