import { GridFilterOperator } from "@mui/x-data-grid-pro";
import moment from "moment";

export const versionFilterOperator: GridFilterOperator = {
  label: "contains",
  value: "versionContains",
  getApplyFilterFn: (filterItem) => {
    if (!filterItem.value) {
      return null;
    }

    return (params): boolean => {
      const version = params.value;
      const searchValue = filterItem.value.toLowerCase();

      if (!version) {
        return false;
      }

      // Search through version data: created by, published by, scheduled by, dates
      const createdBy = version.itemData?.createdByName?.toLowerCase() || "";
      const publishedBy =
        version.publishData?.publishedByName?.toLowerCase() || "";
      const scheduledBy =
        version.scheduleData?.scheduledByName?.toLowerCase() || "";

      // Format dates for searching
      const createdAt = version.itemData?.meta?.createdAt
        ? moment(version.itemData.meta.createdAt)
            .format("MMM D, YYYY h:mm A")
            .toLowerCase()
        : "";
      const updatedAt = version.itemData?.meta?.updatedAt
        ? moment(version.itemData.meta.updatedAt)
            .format("MMM D, YYYY h:mm A")
            .toLowerCase()
        : "";

      return (
        createdBy.includes(searchValue) ||
        publishedBy.includes(searchValue) ||
        scheduledBy.includes(searchValue) ||
        createdAt.includes(searchValue) ||
        updatedAt.includes(searchValue)
      );
    };
  },
};
