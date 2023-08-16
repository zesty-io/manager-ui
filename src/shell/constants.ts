import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import { FileTable } from "@zesty-io/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";

export const MODEL_ICON = {
  templateset: DescriptionRoundedIcon,
  dataset: FileTable,
  pageset: FormatListBulletedRoundedIcon,
} as const;

export const MODEL_NAME = {
  templateset: "Single Page",
  dataset: "Dataset",
  pageset: "Multi Page",
} as const;
