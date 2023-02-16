import { Dispatch, FC } from "react";
import { Box } from "@mui/material";

import { LastUpdated } from "./LastUpdated";
import { ModelType } from "./ModelType";
import { People } from "./People";
import { ModelFilter } from "../ModelsTable";

export interface FiltersProps {
  setActiveFilters: Dispatch<Partial<ModelFilter>>;
  activeFilters: ModelFilter;
}
export const Filters: FC<FiltersProps> = ({
  setActiveFilters,
  activeFilters,
}) => {
  return (
    <Box display="flex" gap={1.5} mb={2}>
      <ModelType
        setActiveFilters={setActiveFilters}
        activeFilters={activeFilters}
      />
      <People />
      <LastUpdated />
    </Box>
  );
};
