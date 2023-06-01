import {
  PresetType,
  DateFilterModalType,
} from "../../../components/Filters/DateFilter/types";

interface PresetDate {
  text: string;
  value: PresetType;
}
export const PRESET_DATES: PresetDate[] = [
  {
    text: "Today",
    value: "today",
  },
  {
    text: "Yesterday",
    value: "yesterday",
  },
  {
    text: "Last 7 days",
    value: "last_7_days",
  },
  {
    text: "Last 30 days",
    value: "last_30_days",
  },
  {
    text: "Last 3 months",
    value: "last_3_months",
  },
  {
    text: "Last 12 months",
    value: "last_12_months",
  },
];

interface CustomDate {
  text: string;
  value: DateFilterModalType;
}
export const CUSTOM_DATES: CustomDate[] = [
  {
    text: "On...",
    value: "on",
  },
  {
    text: "Before...",
    value: "before",
  },
  {
    text: "After...",
    value: "after",
  },
  {
    text: "Custom date range",
    value: "daterange",
  },
];

interface ResourceType {
  content: string;
  schema: string;
}
export const RESOURCE_TYPES: ResourceType = {
  content: "Content Items",
  schema: "Models",
};
