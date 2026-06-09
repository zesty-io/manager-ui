import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useRedirectsDialog } from "../../../app/components/RedirectsDialogProvider";
import { useRedirectsTable } from "../RedirectsTable/RedirectsTableContextProvider";
import { GridRowId } from "@mui/x-data-grid-pro";

type RedirectsDeleteProps = {
  selectedRedirects: GridRowId[];
};

const RedirectsDelete: FC<RedirectsDeleteProps> = ({ selectedRedirects }) => {
  const { t } = useTranslation();
  const { openDeleteDialog } = useRedirectsDialog();
  const { apiRef, redirects } = useRedirectsTable();

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
          onClick={() => apiRef.current?.setRowSelectionModel([])}
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
            apiRef.current?.setRowSelectionModel(
              redirects.map((row: any) => row.ZUID)
            )
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
          {t("delete", { defaultValue: "Delete" })}
        </Button>
      </Box>
    </Box>
  );
};

export default RedirectsDelete;
