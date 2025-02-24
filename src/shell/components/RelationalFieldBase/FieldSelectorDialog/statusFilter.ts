import { GridFilterOperator } from "@mui/x-data-grid-pro";

export const statusFilterOperator: GridFilterOperator = {
  label: "equals",
  value: "statusEquals",
  getApplyFilterFn: (filterItem) => {
    if (!filterItem.value) {
      return null;
    }

    return (params): boolean => {
      const version = params.value;
      const status = filterItem.value;

      if (status === "published") {
        return (
          version?.itemData?.publishing?.publishAt &&
          !version?.itemData?.scheduling?.publishAt
        );
      } else if (status === "scheduled") {
        return version?.itemData?.scheduling?.publishAt;
      } else if (status === "notPublished") {
        return (
          !version?.itemData?.publishing?.publishAt &&
          !version?.itemData?.scheduling?.publishAt
        );
      }
      return true;
    };
  },
};
