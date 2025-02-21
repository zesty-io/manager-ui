import { GridFilterOperator } from "@mui/x-data-grid-pro";
import { getDateFilterFnByValues } from "../../Filters/DateFilter/getDateFilter";

export const dateFilterOperator: GridFilterOperator = {
  label: "dateFilter",
  value: "dateFilter",
  getApplyFilterFn: (filterItem) => {
    if (!filterItem.value) {
      return null;
    }

    return (params): boolean => {
      const version = params.value;
      const dateFilterFn = getDateFilterFnByValues(filterItem.value);

      if (!dateFilterFn || !version?.itemData?.meta?.updatedAt) {
        return false;
      }

      return dateFilterFn(version.itemData.meta.updatedAt);
    };
  },
};
