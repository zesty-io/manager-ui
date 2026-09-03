import { useDispatch } from "react-redux";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

import { DownloadCSVButton } from "./DownloadCSVButton";
import { FormGroupSelector } from "./FormGroupSelector";
import { TableDateFilter } from "./TableDateFilter";

import { setFilterText } from "../../../store/filter";

const filterSx = {
  minWidth: 300,
  mr: 1,
  mb: 1,
  "& input": { width: "100%" },
};

export function LeadExporter() {
  const dispatch = useDispatch();

  return (
    <Box
      component="header"
      data-cy="leadExporter"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        bgcolor: "leads.toolbar",
        px: 4,
        py: 2,
        "& span, & label": { color: "leads.toolbarLabel" },
      }}
    >
      <Box sx={{ ...filterSx, minWidth: 150 }}>
        <TableDateFilter />
      </Box>
      <Box sx={filterSx}>
        <FormGroupSelector />
      </Box>
      <Box sx={filterSx}>
        <DownloadCSVButton />
      </Box>
      <Box sx={{ ...filterSx, ml: "auto" }}>
        <TextField
          name="text-filter"
          placeholder="Search across all of your leads"
          type="search"
          variant="outlined"
          fullWidth
          size="small"
          data-cy="leadsTextFilter"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          onChange={(evt) => {
            const term = evt.target.value;

            dispatch(setFilterText(term));
          }}
        />
      </Box>
    </Box>
  );
}
