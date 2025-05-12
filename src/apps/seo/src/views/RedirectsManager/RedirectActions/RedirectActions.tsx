import { Box, Typography, Button } from "@mui/material";
import { CSVImporter } from "../../../store/imports";
import { RedirectFilter } from "./RedirectFilter";
import RedirectsImport from "./RedirectsImport";
import { useDispatch } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import { useRedirectsDialog } from "../../../app/components/RedirectsDialogProvider";

interface RedirectActionsProps {
  redirectsTotal: number;
}
export default function RedirectActions(props: RedirectActionsProps) {
  const dispatch = useDispatch();
  const { openCreateForm } = useRedirectsDialog();
  return (
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
        {props.redirectsTotal} Total Redirects
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
  );
}
