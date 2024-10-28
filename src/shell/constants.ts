import ListRoundedIcon from "@mui/icons-material/ListRounded";
import { FileTable } from "@zesty-io/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ViewInArRoundedIcon from "@mui/icons-material/ViewInArRounded";

export const MODEL_ICON = {
  templateset: DescriptionRoundedIcon,
  dataset: FileTable,
  pageset: ListRoundedIcon,
  block: ViewInArRoundedIcon,
} as const;

export const MODEL_NAME = {
  templateset: "Single Page",
  dataset: "Dataset",
  pageset: "Multi Page",
  block: "Block",
} as const;
