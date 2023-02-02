import { replace, isEmpty } from "lodash";
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
}: getErrorMessageProps): string => {
  if (Array.isArray(value)) {
    // Flatten the array to an array of strings to easily check if there's empty fields, duplicates and character length
    const allValues = value.reduce(
      (acc: string[], curr: FieldSettingsOptions) => {
        let key,
          value = "";

        Object.entries(curr).forEach(([k, v]) => {
          key = k;
          value = v;
        });

        return [...acc, key, value];
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

    // if (allValues.some(value => isEmpty(value))) {
    //   return "This field is required";
    // }

    console.log(new Set(allKeys).size, allKeys.length);

    if (
      validate.includes("unique") &&
      new Set(allKeys).size !== allKeys.length
    ) {
      return "An option with this value already exists";
    }

    return "";
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
