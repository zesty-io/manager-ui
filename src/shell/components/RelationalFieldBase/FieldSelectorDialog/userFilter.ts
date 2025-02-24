import { GridFilterOperator } from "@mui/x-data-grid-pro";

export const userFilterOperator: GridFilterOperator = {
  label: "equals",
  value: "userEquals",
  getApplyFilterFn: (filterItem) => {
    if (!filterItem.value) {
      return null;
    }

    return (params): boolean => {
      const version = params.value;
      return version?.itemData?.meta?.createdByUserZUID === filterItem.value;
    };
  },
};
