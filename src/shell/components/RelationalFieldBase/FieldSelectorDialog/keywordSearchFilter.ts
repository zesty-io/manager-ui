import { GridFilterOperator } from "@mui/x-data-grid-pro";
import moment from "moment";

export const keywordSearchFilterOperator: GridFilterOperator = {
  label: "contains",
  value: "keywordContains",
  getApplyFilterFn: (filterItem) => {
    if (!filterItem.value) {
      return null;
    }

    return (params): boolean => {
      const row = params.row;
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
      const createdAt = version?.itemData?.meta?.createdAt
        ? moment(version.itemData.meta.createdAt)
            .format("MMM D, YYYY h:mm A")
            .toLowerCase()
        : "";
      const updatedAt = version?.itemData?.meta?.updatedAt
        ? moment(version.itemData.meta.updatedAt)
            .format("MMM D, YYYY h:mm A")
            .toLowerCase()
        : "";

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
