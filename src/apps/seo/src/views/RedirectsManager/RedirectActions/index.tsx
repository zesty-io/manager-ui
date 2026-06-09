import { Box, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import { useRedirectsDialog } from "../../../app/components/RedirectsDialogProvider";
import { useRedirectsTable } from "../RedirectsTable/RedirectsTableContextProvider";
import RedirectsDelete from "./RedirectsDelete";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import RedirectsImport from "./RedirectsImport";
import SearchBox from "../../../../../../shell/components/SearchBox";
import { useEffect, useState } from "react";
import { GridRowId } from "@mui/x-data-grid-pro";

export default function RedirectActions() {
  const { t } = useTranslation();
  const { openCreateForm } = useRedirectsDialog();
  const { redirects, searchFilter, setSearchFilter, apiRef, isTableLoaded } =
    useRedirectsTable();
  const [selectedRedirects, setSelectedRedirects] = useState<GridRowId[]>([]);

  useEffect(() => {
    if (
      !isTableLoaded ||
      !apiRef.current ||
      !Object.keys(apiRef.current).length
    ) {
      return;
    }

    const handleSelectionChange = () => {
      setSelectedRedirects(
        Array.from(apiRef.current.getSelectedRows().keys() || [])
      );
    };

    return apiRef.current.subscribeEvent(
      "rowSelectionChange",
      handleSelectionChange
    );
  }, [apiRef.current, isTableLoaded]);

  return (
    <>
      {selectedRedirects?.length ? (
        <RedirectsDelete selectedRedirects={selectedRedirects} />
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
              {t("create", { defaultValue: "Create" })}
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
}
