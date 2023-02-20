import { Dispatch, FC } from "react";
import { Box } from "@mui/material";

import { DateFilter } from "../../../../../../shell/components/Filters/DateFilter";
import { ModelType } from "./ModelType";
import { ModelFilter } from "../ModelsTable";
import { UserFilter } from "../../../../../../shell/components/Filters";

export interface FiltersProps {
  onChange: Dispatch<Partial<ModelFilter>>;
  activeFilters: ModelFilter;
}
export const Filters: FC<FiltersProps> = ({ activeFilters, onChange }) => {
  return (
    <Box display="flex" gap={1.5} mb={2}>
      <ModelType value={activeFilters.modelType} onChange={onChange} />
      <UserFilter value={activeFilters.user} onChange={onChange} />
      <DateFilter value={activeFilters.lastUpdated} onChange={onChange} />
    </Box>
  );
};
