import { Stack, Box, Typography, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { useParams } from "react-router";

import { ContentInsights } from "./ItemSettings/ContentInsights";
import { useGetContentModelQuery } from "../../../../../../../shell/services/instance";

type MetaProps = {};
export const Meta = ({}: MetaProps) => {
  const { modelZUID } = useParams<{ modelZUID: string }>();
  const { data: model } = useGetContentModelQuery(modelZUID, {
    skip: !modelZUID,
  });

  return (
    <ThemeProvider theme={theme}>
      <Stack
        direction="row"
        gap={4}
        bgcolor="grey.50"
        pt={2.5}
        px={4}
        height="100%"
        color="text.primary"
      >
        <Box flex={1}>
          <Typography>Input fields</Typography>
        </Box>
        {model?.type !== "dataset" && (
          <Box flex={1}>
            <ContentInsights />
          </Box>
        )}
      </Stack>
    </ThemeProvider>
  );
};
