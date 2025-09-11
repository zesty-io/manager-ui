import { Box } from "@mui/material";

import RedirectActions from "./RedirectActions";
import RedirectsTable from "./RedirectsTable";
import RedirectImportTable from "./RedirectImportTable";

const RedirectsManager = () => {
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        px={4}
        pt={4}
        pb={1.75}
        sx={{
          borderBottom: (theme) => `2px solid ${theme.palette.border}`,
          backgroundColor: "background.paper",
        }}
      >
        <RedirectActions />
      </Box>
      <Box
        flexGrow={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="flex-start"
        px={4}
        boxSizing="border-box"
        position="relative"
        sx={{
          height: `calc(100% - 68px - 40px)`,
        }}
      >
        <RedirectsTable />
        <RedirectImportTable />
      </Box>
    </>
  );
};

export default RedirectsManager;
