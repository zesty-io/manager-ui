import { Dispatch, FC } from "react";
import { Box } from "@mui/material";

import { LastUpdated } from "./LastUpdated";
import { ModelType } from "./ModelType";
import { ModelFilter } from "../ModelsTable";
import { UserFilter } from "../../../../../../shell/components/Filters";

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
      <UserFilter value={activeFilters} onChange={setActiveFilters} />
      <LastUpdated />
    </Box>
  );
};
