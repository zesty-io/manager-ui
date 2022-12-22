import { Box, Typography } from "@mui/material";
import { templateSettings } from "lodash";
import { useMemo } from "react";
import { useGetContentModelsQuery } from "../../../../../../shell/services/instance";
import { ModelList } from "./ModelList";

export const Sidebar = () => {
  const { data: models } = useGetContentModelsQuery();

  const collections = useMemo(
    () =>
      models?.filter(
        (model) => model.type === "templateset" || model.type === "dataset"
      ),
    [models]
  );
  const pages = useMemo(
    () => models?.filter((model) => model.type === "pageset"),
    [models]
  );

  return (
    <Box width={220} height="100%" display="flex" flexDirection="column">
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h4">Schema</Typography>
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
        <ModelList title="collections" models={collections || []} />
        <Box sx={{ mt: 1 }}>
          <ModelList title="single page" models={pages || []} />
        </Box>
      </Box>
    </Box>
  );
};
