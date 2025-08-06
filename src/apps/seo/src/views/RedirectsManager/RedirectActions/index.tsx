import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useRedirectsDialog } from "../../../app/components/RedirectsDialogProvider";
import { useRedirectsTable } from "../RedirectsTable/RedirectsTableContextProvider";
import RedirectsDelete from "./RedirectsDelete";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import RedirectsImport from "./RedirectsImport";
import SearchBox from "../../../../../../shell/components/SearchBox";
import { useEffect, useState } from "react";

export default function RedirectActions() {
  const { openCreateForm } = useRedirectsDialog();
  const { redirects, searchFilter, setSearchFilter, apiRef } =
    useRedirectsTable();
  const [showDeleteHeader, setShowDeleteHeader] = useState(false);

  useEffect(() => {
    if (!apiRef.current || !Object.keys(apiRef.current).length) {
      return;
    }

    const handleSelectionChange = () => {
      setShowDeleteHeader(apiRef.current.getSelectedRows().size > 0);
    };

    return apiRef.current.subscribeEvent(
      "rowSelectionChange",
      handleSelectionChange
    );
  }, [apiRef.current]);

  return (
    <>
      {showDeleteHeader ? (
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
            <SearchBox
              placeholder="Filter Redirects"
              variant="outlined"
              size="small"
              value={searchFilter}
              InputProps={{
                sx: {
                  backgroundColor: "grey.50",
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                const term = evt.target.value.trim();
                setSearchFilter(term);
              }}
              sx={{
                width: "240px",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: 0,
                },
              }}
            />
            <RedirectsImport />
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
