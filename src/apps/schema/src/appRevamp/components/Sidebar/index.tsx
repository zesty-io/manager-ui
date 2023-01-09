import { Box, Typography } from "@mui/material";
import { templateSettings } from "lodash";
import { useMemo } from "react";
import { useGetContentModelsQuery } from "../../../../../../shell/services/instance";
import { ModelList } from "./ModelList";

export const Sidebar = () => {
  const { data: models } = useGetContentModelsQuery();

  return (
    <Box width={240} height="100%" display="flex" flexDirection="column">
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h4" fontWeight={600}>
          Schema
        </Typography>
      </Box>
      <Box
        sx={{
          borderStyle: "solid",
          borderWidth: 0,
          borderTopWidth: 1,
          borderColor: "border",
          px: 2,
          py: 1,
          overflowY: "scroll",
          height: "100%",
        }}
      >
        <ModelList
          title="single page"
          models={models?.filter((model) => model.type === "pageset") || []}
        />
        <Box sx={{ mt: 1 }}>
          <ModelList
            title="multi page"
            models={
              models?.filter((model) => model.type === "templateset") || []
            }
          />
        </Box>
        <Box sx={{ mt: 1 }}>
          <ModelList
            title="headless dataset"
            models={models?.filter((model) => model.type === "dataset") || []}
          />
        </Box>
      </Box>
    </Box>
  );
};
