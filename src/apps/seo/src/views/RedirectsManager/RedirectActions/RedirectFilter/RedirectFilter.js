import { useState } from "react";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { useRedirectsTable } from "../../RedirectsTable/RedirectsTableContextProvider";

export function RedirectFilter(props) {
  const [filter, setFilter] = useState("");
  const { searchFilter, setSearchFilter } = useRedirectsTable();

  const handleFilter = (val) => {
    props.dispatch({
      type: "REDIRECT_FILTER",
      filter: val,
    });
    setFilter(val);
    setSearchFilter(val);
  };

  return (
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
      onChange={(evt) => {
        const term = evt.target.value.trim();
        handleFilter(term);
      }}
      sx={{
        width: "240px",
        "& .MuiOutlinedInput-notchedOutline": {
          border: 0,
        },
      }}
    />
  );
}
