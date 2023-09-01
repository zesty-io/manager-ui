import { Box } from "@mui/material";
import { ActivityDetails } from "./ActivityDetails";
import { ModelDetails } from "./ModelDetails";
import { RelatedModels } from "./RelatedModels";

export const ModelInfo = () => {
  return (
    <Box px={4} pt={1} pb={2} sx={{ overflowY: "auto" }}>
      <Box display="flex" flexDirection={"column"} gap={4}>
        <ModelDetails />
        <RelatedModels />
        <ActivityDetails />
      </Box>
    </Box>
  );
};
