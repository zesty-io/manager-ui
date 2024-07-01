import { CommentResourceType } from "../../services/types";

export const countCharUsage = (string: string, char: string) => {
  const regex = new RegExp(char, "g");
  return [...string.matchAll(regex)]?.length ?? 0;
};

export const getResourceTypeByZuid = (
  zuid: string
): CommentResourceType | "" => {
  switch (zuid?.split("-")?.[0]) {
    case "12":
      return "fields";

    default:
      return "";
  }
};
