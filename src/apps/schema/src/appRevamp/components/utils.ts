import { replace, isEmpty, toPairs } from "lodash";
import { FieldSettingsOptions } from "../../../../../shell/services/types";
import { Validation } from "./AddFieldModal/FieldFormInput";

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
  value: string | FieldSettingsOptions[];
  maxLength?: number;
  fieldNames?: string[];
  label?: string;
  validate?: Validation[];
};
export const getErrorMessage = ({
  value,
  maxLength = 0,
  fieldNames,
  label = "",
  validate = [],
}: getErrorMessageProps): string | [string, string][] => {
  if (Array.isArray(value)) {
    let errors: [string, string][] = [];

    const allValues = value.reduce(
      (acc: [string, string][], curr: FieldSettingsOptions, index) => {
        errors[index] = ["", ""];

        return [...acc, ...toPairs(curr)];
      },
      []
    );

    // Collect all keys, since these need to be unique
    const allKeys = value.reduce(
      (acc: string[], curr: FieldSettingsOptions) => {
        return [...acc, ...Object.keys(curr)];
      },
      []
    );

    // Validate char length
    if (validate.includes("length")) {
      allValues.forEach((value, outerIndex) => {
        value.forEach((v, innerIndex) => {
          errors[outerIndex][innerIndex] =
            v.length > maxLength
              ? `Shorten to less than ${maxLength} characters`
              : "";
        });
      });
    }

    // Validate key uniqueness
    if (validate.includes("unique")) {
      let seenKeys: string[] = [];

      allKeys.forEach((key, index) => {
        if (!seenKeys.includes(key)) {
          seenKeys.push(key);
        } else {
          errors[index][0] = "An option with this value already exists";
        }
      });
    }

    return errors;
  } else {
    if (validate.includes("required") && isEmpty(value)) {
      return `${label} is required`;
    }

    if (
      validate.includes("unique") &&
      fieldNames?.length &&
      fieldNames.includes(value as string)
    ) {
      return "A field with this API/Parsley Reference already exists";
    }

    if (validate.includes("length") && maxLength && value.length > maxLength) {
      return `Shorten to less than ${maxLength} characters`;
    }

    return "";
  }
};

export const getCategory = (type: string) => {
  let category = "";

  switch (type) {
    case "text":
    case "textarea":
    case "wysiwyg_basic":
    case "markdown":
      category = "text";
      break;

    case "images":
      category = "media";
      break;

    case "one_to_one":
    case "one_to_many":
    case "link":
    case "internal_link":
      category = "relationship";
      break;

    case "number":
    case "currency":
      category = "numeric";
      break;

    case "date":
    case "datetime":
      category = "dateandtime";
      break;

    case "yes_no":
    case "dropdown":
    case "color":
    case "sort":
      category = "options";
      break;

    default:
      category = "";
      break;
  }

  return category;
};
