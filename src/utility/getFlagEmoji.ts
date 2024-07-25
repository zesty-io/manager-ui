export default (countryCode: string) => {
  // Convert country code to flag emoji.
  // Unicode flag emojis are made up of regional indicator symbols, which are a sequence of two letters.
  const baseOffset = 0x1f1e6;
  return (
    String.fromCodePoint(baseOffset + (countryCode.charCodeAt(0) - 65)) +
    String.fromCodePoint(baseOffset + (countryCode.charCodeAt(1) - 65))
  );
};
