import { FC } from "react";
import { Box } from "@mui/material";

import { LastUpdated } from "./LastUpdated";
import { ModelType } from "./ModelType";
import { People } from "./People";

interface Props {
  onFilterApplied: () => void;
}
export const Filters: FC<Props> = ({ onFilterApplied }) => {
  return (
    <Box display="flex" gap={1.5} mb={2}>
      <ModelType />
      <People />
      <LastUpdated />
    </Box>
  );
};
