import { FC } from "react";
import { Box, Typography, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useRedirectsDialog } from "../../../app/components/RedirectsDialogProvider";
import { useRedirectsTable } from "../RedirectsTable/RedirectsTableContextProvider";

type RedirectsDeleteProps = {};

const RedirectsDelete: FC<RedirectsDeleteProps> = () => {
  const { openDeleteDialog } = useRedirectsDialog();
  const { selectedRedirects, setSelectedRedirects, redirects } =
    useRedirectsTable();

  const handleDelete = () => {
    const deleteData = selectedRedirects.map((ZUID: any) => ({
      ZUID,
      path: redirects.find((row: any) => row.ZUID === ZUID)?.path,
    }));
    openDeleteDialog(deleteData);
  };

  return (
    <Box
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
        {selectedRedirects.length} Selected
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        columnGap={1}
      >
        <Button
          data-cy="RedirectActionDeselectAll"
          variant="outlined"
          color="inherit"
          size="small"
          disabled={!selectedRedirects?.length}
          onClick={() => setSelectedRedirects([])}
          startIcon={<ClearIcon />}
        >
          Deselect All
        </Button>
        <Button
          data-cy="RedirectActionSelectAll"
          variant="outlined"
          color="inherit"
          size="small"
          disabled={selectedRedirects?.length === redirects?.length}
          onClick={() =>
            setSelectedRedirects(redirects.map((row: any) => row.ZUID))
          }
          startIcon={<DoneAllIcon />}
        >
          Select All
        </Button>
        <Button
          data-cy="RedirectActionDeleteButton"
          variant="contained"
          color="error"
          size="small"
          onClick={() => handleDelete()}
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>
      </Box>
    </Box>
  );
};

export default RedirectsDelete;
