import { Dispatch, FC } from "react";
import { Box } from "@mui/material";

import {
  DateFilter,
  DateFilterValue,
} from "../../../../../../shell/components/Filters/DateFilter";
import { ModelType } from "./ModelType";
import { ModelFilter } from "../ModelsTable";
import { UserFilter } from "../../../../../../shell/components/Filters";
import { ModelType as ModelSetType } from "../../../../../../shell/services/types";

type FilterParam = string | ModelSetType | DateFilterValue;
export interface FiltersProps {
  onChange: Dispatch<Partial<ModelFilter>>;
  activeFilters: ModelFilter;
}
export const Filters: FC<FiltersProps> = ({ activeFilters, onChange }) => {
  const handleFilterChange = (
    type: "modelType" | "user" | "date",
    filter: FilterParam
  ) => {
    if (type === "date") {
      onChange({
        lastUpdated: filter as DateFilterValue,
      });
    } else {
      onChange({
        [type]: filter,
      });
    }
  };

  return (
    <Box display="flex" gap={1.5} mb={2}>
      <ModelType
        value={activeFilters.modelType}
        onChange={(filter) => handleFilterChange("modelType", filter)}
      />
      <UserFilter
        value={activeFilters.user}
        onChange={(filter) => handleFilterChange("user", filter)}
      />
      <DateFilter
        value={activeFilters.lastUpdated}
        onChange={(filter) => handleFilterChange("date", filter)}
      />
    </Box>
  );
};
