import { useMemo } from "react";

export const getCountryCode = (langCode: string) => {
  if (!langCode) return "";

  const splitTag = langCode.split("-");
  const countryCode =
    splitTag.length === 2 ? splitTag[1] : langCode.toUpperCase();

  return countryCode;
};

export const Flag = ({ countryCode }: { countryCode: string }) => {
  const flagEmoji = useMemo(() => {
    if (!countryCode) {
      return null;
    }

    if (countryCode.length !== 2) {
      throw new Error(
        `Country code must be exactly 2 characters, instead received "${countryCode}".`
      );
    }

    // Convert country code to flag emoji.
    // Unicode flag emojis are made up of regional indicator symbols, which are a sequence of two letters.
    const baseOffset = 0x1f1e6;

    return (
      String.fromCodePoint(baseOffset + (countryCode.charCodeAt(0) - 65)) +
      String.fromCodePoint(baseOffset + (countryCode.charCodeAt(1) - 65))
    );
  }, [countryCode]);

  return <>{flagEmoji}</>;
};
