import { replace, isEmpty, toPairs } from "lodash";
import { FieldSettingsOptions } from "../../../../../shell/services/types";
import { Validation } from "../components/AddFieldModal/FieldFormInput";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import { FileTable, Block } from "@zesty-io/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import i18n from "shell/i18n";

export const modelIconMap = {
  templateset: DescriptionRoundedIcon,
  dataset: FileTable,
  pageset: FormatListBulletedRoundedIcon,
  block: Block,
};

export const modelNameMap = {
  templateset: "schema.modelNameSinglePage",
  dataset: "schema.modelNameDataset",
  pageset: "schema.modelNameMultiPage",
  block: "schema.modelNameBlock",
};

export const RESERVED_FIELD_NAMES = ["og_image"];

export const stringStartsWithVowel = (string: string): boolean => {
  if (!string) return;

  const firstLetter = string[0];

  return ["a", "e", "i", "o", "u"].includes(firstLetter.toLowerCase());
};

export const convertLabelValue = (string: string): string =>
  replace(string, /\W/g, "_").toLowerCase();

export const convertDropdownValue = (string: string): string => {
  if (!string) return;

  return replace(string, /[^a-zA-Z0-9_\s]/g, "_");
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
      allValues.forEach((outerValue, outerIndex) => {
        outerValue.forEach((innerValue, innerIndex) => {
          errors[outerIndex][innerIndex] =
            innerValue.length > maxLength
              ? i18n.t("schema.errorShortenToLess", {
                  maxLength,
                  currentLength: innerValue.length,
                })
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
          errors[index][0] = i18n.t("schema.errorOptionValueExists");
        }
      });
    }

    return errors;
  } else {
    if (validate.includes("required") && isEmpty(value)) {
      return i18n.t("schema.errorFieldIsRequired", { label });
    }

    if (
      validate.includes("unique") &&
      fieldNames?.length &&
      fieldNames.includes(value as string)
    ) {
      return i18n.t("schema.errorFieldReferenceExists");
    }

    if (validate.includes("length") && maxLength && value.length > maxLength) {
      return i18n.t("schema.errorShortenToLess", {
        maxLength,
        currentLength: value.length,
      });
    }

    // check for reserved field names
    if (RESERVED_FIELD_NAMES.includes(value)) {
      return i18n.t("schema.errorSystemReservedFieldName", { value });
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
    case "block_selector":
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
    case "uuid":
    case "integration":
    case "repeater":
      category = "options";
      break;

    default:
      category = "";
      break;
  }

  return category;
};
