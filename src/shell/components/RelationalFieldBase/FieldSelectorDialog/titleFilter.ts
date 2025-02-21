import { GridFilterOperator } from "@mui/x-data-grid-pro";

export const titleFilterOperator: GridFilterOperator = {
  label: "contains",
  value: "titleContains",
  getApplyFilterFn: (filterItem) => {
    if (!filterItem.value) {
      return null;
    }

    return (params): boolean => {
      const title = params.value;
      const searchValue = filterItem.value.toLowerCase();

      if (!title) {
        return false;
      }

      if (typeof title === "object") {
        return (
          title.primary?.toLowerCase().includes(searchValue) ||
          title.secondary?.toLowerCase().includes(searchValue)
        );
      }

      return title.toString().toLowerCase().includes(searchValue);
    };
  },
};
