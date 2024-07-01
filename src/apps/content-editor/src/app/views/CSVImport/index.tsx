import { Box, Typography, ThemeProvider, Stack } from "@mui/material";
import { useParams as useRouterParams } from "react-router";
import { theme } from "@zesty-io/material";

import { useGetContentModelQuery } from "../../../../../../shell/services/instance";
import { ContentBreadcrumbs } from "../../components/ContentBreadcrumbs";
import { ItemListActions } from "../ItemList/ItemListActions";
import CSVImportBody from "./CSVImportBody";

export const CSVImport = ({ ...routerProps }) => {
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const { data: model } = useGetContentModelQuery(modelZUID);

  return (
    <>
      <ThemeProvider theme={theme}>
        <Stack
          direction="row"
          px={4}
          pt={4}
          pb={2}
          justifyContent="space-between"
          alignItems="start"
          color="text.primary"
        >
          <Stack>
            <ContentBreadcrumbs />
            <Typography
              variant="h3"
              mt={0.25}
              fontWeight={700}
              sx={{
                display: "-webkit-box",
                "-webkit-line-clamp": "2",
                "-webkit-box-orient": "vertical",
                wordBreak: "break-word",
                wordWrap: "break-word",
                hyphens: "auto",
                overflow: "hidden",
              }}
            >
              {model?.label}
            </Typography>
          </Stack>
          <ItemListActions />
        </Stack>
      </ThemeProvider>
      <Box px={4} pt={2} bgcolor="grey.50">
        <CSVImportBody {...routerProps} />
      </Box>
    </>
  );
};
