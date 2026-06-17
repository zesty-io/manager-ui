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
    textKey: "common.today",
    value: "today",
  },
  {
    textKey: "common.yesterday",
    value: "yesterday",
  },
  {
    textKey: "common.last7Days",
    value: "last_7_days",
  },
  {
    textKey: "common.last30Days",
    value: "last_30_days",
  },
  {
    textKey: "common.last3Months",
    value: "last_3_months",
  },
  {
    textKey: "common.last12Months",
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
  content: "common.contentItems",
  schema: "common.models",
  code: "common.codeFiles",
  media: "common.media",
  block: "shell.navBlocks",
} as const;

interface SearchAccelerator {
  icon: SvgIconComponent;
  textKey: string;
}
export const SEARCH_ACCELERATORS: Record<ResourceType, SearchAccelerator> = {
  content: {
    icon: EditRounded,
    textKey: "common.content",
  },
  schema: {
    icon: Database as SvgIconComponent,
    textKey: "shell.navSchema",
  },
  media: {
    icon: ImageRounded,
    textKey: "common.media",
  },
  code: {
    icon: CodeRounded,
    textKey: "common.code",
  },
  block: {
    icon: CodeRounded,
    textKey: "shell.block",
  },
} as const;
