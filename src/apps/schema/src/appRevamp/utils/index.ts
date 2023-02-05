import { replace, isEmpty } from "lodash";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import { FileTable } from "@zesty-io/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";

export const modelIconMap = {
  templateset: DescriptionRoundedIcon,
  dataset: FileTable,
  pageset: FormatListBulletedRoundedIcon,
};

export const modelNameMap = {
  templateset: "Single Page",
  dataset: "Headless Dataset",
  pageset: "Multi Page",
};

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
