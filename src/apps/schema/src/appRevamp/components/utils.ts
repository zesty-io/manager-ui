import { replace, isEmpty } from "lodash";
import { ContentModelField } from "../../../../../shell/services/types";

const ERROR_MESSAGES = Object.freeze({
  REQUIRED: "This field is required",
  ALREADY_EXISTS: "Field name already exists",
  CHARACTER_LIMIT: "Field value must not exceed ",
});

export const stringStartsWithVowel = (string: string): boolean => {
  if (!string) return;

  const firstLetter = string[0];

  return ["a", "e", "i", "o", "u"].includes(firstLetter.toLowerCase());
};

export const convertLabelValue = (string: string): string => {
  if (!string) return;

  return replace(string, /\W/g, "_");
};

export const getErrorMessage = (
  value: string,
  fieldNames?: string[]
): string => {
  if (isEmpty(value)) {
    return "This field is required";
  }

  if (fieldNames?.length && fieldNames.includes(value)) {
    return "Field name already exists";
  }

  return "";
};
