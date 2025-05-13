import RedirectImportTable from "./RedirectImportTable";
import { Box } from "@mui/material";
import RedirectsTable from "./RedirectsTable";
import RedirectActions from "./RedirectActions";

const RedirectsManager = (props: any) => {
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
        {Object.keys(props.imports).length ? (
          <RedirectImportTable {...props} />
        ) : (
          <RedirectsTable />
        )}
      </Box>
    </>
  );
};

export default RedirectsManager;
