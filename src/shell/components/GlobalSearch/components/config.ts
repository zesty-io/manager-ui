import {
  SvgIconComponent,
  EditRounded,
  CodeRounded,
  ImageRounded,
} from "@mui/icons-material";
import { Database, Block } from "@zesty-io/material";

import {
  PresetType,
  DateFilterModalType,
} from "../../../components/Filters/DateFilter/types";
import { ResourceType } from "../../../services/types";

// These maps live at module level, where t() can't run, so labels are stored
// as translation keys and resolved with t() at the render site.
interface PresetDate {
  textKey: string;
  value: PresetType;
}
export const PRESET_DATES: readonly PresetDate[] = [
  {
    textKey: "shell.dateToday",
    value: "today",
  },
  {
    textKey: "shell.dateYesterday",
    value: "yesterday",
  },
  {
    textKey: "shell.dateLast7Days",
    value: "last_7_days",
  },
  {
    textKey: "shell.dateLast30Days",
    value: "last_30_days",
  },
  {
    textKey: "shell.dateLast3Months",
    value: "last_3_months",
  },
  {
    textKey: "shell.dateLast12Months",
    value: "last_12_months",
  },
] as const;

interface CustomDate {
  textKey: string;
  value: DateFilterModalType;
}
export const CUSTOM_DATES: readonly CustomDate[] = [
  {
    textKey: "shell.dateOn",
    value: "on",
  },
  {
    textKey: "shell.dateBefore",
    value: "before",
  },
  {
    textKey: "shell.dateAfter",
    value: "after",
  },
  {
    textKey: "shell.customDateRange",
    value: "daterange",
  },
] as const;

export const RESOURCE_TYPES: Record<ResourceType, string> = {
  content: "shell.contentItems",
  schema: "shell.models",
  code: "shell.codeFiles",
  media: "shell.navMedia",
  block: "shell.navBlocks",
} as const;

interface SearchAccelerator {
  icon: SvgIconComponent;
  textKey: string;
}
export const SEARCH_ACCELERATORS: Record<ResourceType, SearchAccelerator> = {
  content: {
    icon: EditRounded,
    textKey: "shell.navContent",
  },
  schema: {
    icon: Database as SvgIconComponent,
    textKey: "shell.navSchema",
  },
  media: {
    icon: ImageRounded,
    textKey: "shell.navMedia",
  },
  code: {
    icon: CodeRounded,
    textKey: "shell.navCode",
  },
  block: {
    icon: CodeRounded,
    textKey: "shell.block",
  },
} as const;
