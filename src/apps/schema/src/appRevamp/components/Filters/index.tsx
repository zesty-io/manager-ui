import { Box } from "@mui/material";

import { LastUpdated } from "./LastUpdated";
import { ModelType } from "./ModelType";
import { People } from "./People";

export const Filters = () => {
  return (
    <Box display="flex" gap={1.5} mb={2}>
      <ModelType />
      <People />
      <LastUpdated />
    </Box>
  );
};
