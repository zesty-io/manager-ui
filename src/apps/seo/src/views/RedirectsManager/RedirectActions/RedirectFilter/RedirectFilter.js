import { useState } from "react";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

export function RedirectFilter(props) {
  const [filter, setFilter] = useState("");

  const handleFilter = (val) => {
    props.dispatch({
      type: "REDIRECT_FILTER",
      filter: val,
    });
    setFilter(val);
  };

  return (
    <TextField
      placeholder="Filter your redirects by url"
      type="search"
      variant="outlined"
      size="small"
      value={filter}
      InputProps={{
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
    />
  );
}
