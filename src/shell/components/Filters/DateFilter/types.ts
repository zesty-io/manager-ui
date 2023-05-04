export type PresetType =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_3_months"
  | "last_12_months";
export type DateFilterModalType = "on" | "before" | "after" | "daterange" | "";
export interface DateRangeFilterValue {
  from: string | null;
  to: string | null;
}

export interface DateFilterValue {
  type: "preset" | DateFilterModalType;
  value: PresetType | DateRangeFilterValue | string;
}
