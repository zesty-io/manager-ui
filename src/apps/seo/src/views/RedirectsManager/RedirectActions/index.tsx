import { Box, Typography, Button } from "@mui/material";
import { CSVImporter } from "../../../store/imports";
import { RedirectFilter } from "./RedirectFilter";
import RedirectsImport from "./RedirectsImport";
import { useDispatch } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import { useRedirectsDialog } from "../../../app/components/RedirectsDialogProvider";
import { useRedirectsTable } from "../RedirectsTable/RedirectsTableContextProvider";
import RedirectsDelete from "./RedirectsDelete";

export default function RedirectActions() {
  const dispatch = useDispatch();
  const { openCreateForm } = useRedirectsDialog();
  const { selectedRedirects, redirects } = useRedirectsTable();
  return (
    <>
      {!!selectedRedirects?.length ? (
        <RedirectsDelete />
      ) : (
        <Box
          component="header"
          width="100%"
          sx={{
            backgroundColor: "background.paper",
            alignItems: "center",
            justifyContent: "space-between",
            display: "flex",
            top: "0",
            zIndex: 2,
          }}
        >
          <Typography variant="h3" fontWeight="700">
            {redirects?.length} Total Redirects
          </Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            columnGap={1}
          >
            <RedirectFilter dispatch={dispatch} />
            <RedirectsImport
              onChange={(evt: any) => {
                dispatch(CSVImporter(evt as any));
              }}
            />

            <Button
              data-cy="RedirectActionCreateButton"
              variant="contained"
              color="primary"
              size="small"
              onClick={() => openCreateForm()}
              startIcon={<AddIcon />}
            >
              Create
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
}
