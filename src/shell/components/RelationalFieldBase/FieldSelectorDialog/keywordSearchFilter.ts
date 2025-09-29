import { GridFilterOperator } from "@mui/x-data-grid-pro";
import { format, isValid } from "date-fns";

export const keywordSearchFilterOperator: GridFilterOperator = {
  label: "contains",
  value: "keywordContains",
  getApplyFilterFn: (filterItem) => {
    if (!filterItem.value) {
      return null;
    }

    const fmtLower = (value?: string) => {
      if (!value) return "";
      const d = new Date(value);
      return isValid(d) ? format(d, "MMM d, yyyy h:mm a").toLowerCase() : "";
    };

    return (params): boolean => {
      const row = params;
      const searchValue = filterItem.value.toLowerCase();

      // Check title
      const title = row.title;
      const titleMatch =
        title?.primary?.toString()?.toLowerCase().includes(searchValue) ||
        title?.secondary?.toString()?.toLowerCase().includes(searchValue) ||
        false;

      // Check version
      const version = row.version;
      const createdBy = version?.itemData?.createdByName?.toLowerCase() || "";
      const publishedBy =
        version?.publishData?.publishedByName?.toLowerCase() || "";
      const scheduledBy =
        version?.scheduleData?.scheduledByName?.toLowerCase() || "";

      const createdAt = fmtLower(version?.itemData?.meta?.createdAt);
      const updatedAt = fmtLower(version?.itemData?.meta?.updatedAt);

      const versionMatch =
        createdBy.includes(searchValue) ||
        publishedBy.includes(searchValue) ||
        scheduledBy.includes(searchValue) ||
        createdAt.includes(searchValue) ||
        updatedAt.includes(searchValue);

      return titleMatch || versionMatch;
    };
  },
};
