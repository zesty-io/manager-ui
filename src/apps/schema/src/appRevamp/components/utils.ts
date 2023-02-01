import { replace, isEmpty } from "lodash";

export const stringStartsWithVowel = (string: string): boolean => {
  if (!string) return;

  const firstLetter = string[0];

  return ["a", "e", "i", "o", "u"].includes(firstLetter.toLowerCase());
};

export const convertLabelValue = (string: string): string => {
  if (!string) return;

  return replace(string, /\W/g, "_").toLowerCase();
};

type getErrorMessageProps = {
  value: string;
  maxLength?: number;
  fieldNames?: string[];
};
export const getErrorMessage = ({
  value,
  maxLength = 0,
  fieldNames,
}: getErrorMessageProps): string => {
  if (isEmpty(value)) {
    return "This field is required";
  }

  if (fieldNames?.length && fieldNames.includes(value)) {
    return "Field name already exists";
  }

  if (maxLength && value.length > maxLength) {
    return `Value must not exceed ${maxLength} characters`;
  }

  return "";
};
