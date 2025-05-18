import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useRedirectsDialog } from "../../../app/components/RedirectsDialogProvider";
import { useRedirectsTable } from "../RedirectsTable/RedirectsTableContextProvider";
import RedirectsDelete from "./RedirectsDelete";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import RedirectsImport from "./RedirectsImport";
import { ChangeEvent } from "react";

export default function RedirectActions() {
  const { openCreateForm } = useRedirectsDialog();
  const { selectedRedirects, redirects, searchFilter, setSearchFilter } =
    useRedirectsTable();
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
            <TextField
              placeholder="Filter Redirects"
              type="search"
              variant="outlined"
              size="small"
              value={searchFilter}
              InputProps={{
                sx: {
                  backgroundColor: "grey.50",
                  input: {
                    py: 0.75,
                  },
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={(evt: ChangeEvent<HTMLInputElement>) => {
                const term = evt.target.value.trim();
                setSearchFilter(term);
              }}
              sx={{
                width: "240px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "border",
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
