import { parseInt } from "lodash";
import { HeadTag } from "../../../../../../shell/services/types";

export type InstalledFont = {
  ZUID: string;
  family: string;
  variants: string[];
  href: string;
};

export type InstalledWebFont = {
  ZUID: string;
  href: string;
};

export type FontVariant = {
  id: string;
  weight: number;
  style: string;
};

export type InstalledLinkTags = {
  ZUID: string;
  type: string;
  attributes: {
    href: string;
    rel: string;
  };
  resourceZUID?: string;
  sort?: number;
  createdByUserZUID?: string;
  updatedByUserZUID?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const FONTWEIGHT_MAP: Record<string, string> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

export const FONT_QUERY_MAP: Record<string, string> = {
  "100": "0,100",
  "200": "0,200",
  "300": "0,300",
  "500": "0,500",
  "600": "0,600",
  "700": "0,700",
  "800": "0,800",
  "900": "0,900",
  regular: "0,400",
  italic: "1,400",
  "100italic": "1,100",
  "200italic": "1,200",
  "300italic": "1,300",
  "500italic": "1,500",
  "600italic": "1,600",
  "700italic": "1,700",
  "800italic": "1,800",
  "900italic": "1,900",
};

export const parseVariantString = (variant: string): FontVariant => {
  const matched = variant.match(/^(\d+)(\w+)?$/);

  if (!!matched) {
    return {
      id: variant,
      weight: parseInt(matched?.[1]),
      style: matched?.[2] || "normal",
    };
  }

  if (variant?.toLowerCase().trim() === "regular") {
    return {
      id: variant,
      weight: 400,
      style: "normal",
    };
  }
  if (variant?.toLowerCase().trim() === "italic") {
    return {
      id: variant,
      weight: 400,
      style: "italic",
    };
  }
  return {
    id: variant,
    weight: 400,
    style: "normal",
  };
};

export const parseInstalledFonts = (fonts: HeadTag[]): InstalledFont[] => {
  const filteredFonts = fonts?.filter(
    (item) =>
      item.type === "link" &&
      !!item.attributes.href &&
      // item.attributes.href.indexOf("https//fonts.googleapis.com") === 0
      item.attributes.href?.includes("//fonts.googleapis.com/")
  );

  const arrFonts = filteredFonts?.map((tag) => {
    const url = tag.attributes.href;

    const variants = url.split("=")[1].split(":")[1]
      ? url
          .split("=")[1]
          .split(":")[1]
          .split(",")
          .map((variant) => variant)
      : [];

    return {
      ZUID: tag.ZUID,
      href: tag.attributes.href,
      // family: url.split("=")[1].split(":")[0].replace(/\+/g, " "),
      family: url
        .split("=")[1]
        .split(":")[0]
        .replace(/[\+％＋]/g, " ")
        .trim(),
      variants,
    };
  });

  return arrFonts;
};
