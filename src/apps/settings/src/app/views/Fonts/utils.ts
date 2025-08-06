import { HeadTag } from "../../../../../../shell/services/types";
import { InstalledWebFont } from "./constants";

export type FontAndVariants = {
  family: string;
  variants: string[];
};

export const parseWebFonts = (fonts: HeadTag[]): InstalledWebFont[] => {
  const filteredFonts = fonts?.filter(
    (item) =>
      item.type === "link" &&
      !!item.attributes.href &&
      item.attributes.href?.includes("fonts.googleapis.com/")
  );

  return filteredFonts?.map((tag) => ({
    ZUID: tag?.ZUID,
    href: tag?.attributes?.href,
  }));
};

export const getWebFontFromUrl = (url: string): FontAndVariants => {
  const cleanFontUrl = url?.replace("https//", "https://");

  if (!cleanFontUrl)
    return {
      family: "",
      variants: [],
    };
  const fontUrlData = new URL(cleanFontUrl);
  const fontFamilyAndVariants = fontUrlData?.searchParams?.get("family");

  const [family, variantsString = ""] = fontFamilyAndVariants?.split(":") || [];
  const variants = variantsString?.split(",") || [];

  return {
    family,
    variants,
  };
};
