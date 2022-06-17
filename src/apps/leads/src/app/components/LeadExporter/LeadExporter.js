import { useDispatch } from "react-redux";
import cx from "classnames";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

import { DownloadCSVButton } from "./DownloadCSVButton";
import { FormGroupSelector } from "./FormGroupSelector";
import { TableDateFilter } from "./TableDateFilter";

import { setFilterText } from "../../../store/filter";

import styles from "./LeadExporter.less";
export function LeadExporter() {
  const dispatch = useDispatch();

  return (
    <header className={styles.LeadExporter}>
      <div className={cx(styles.filter, styles.Date)}>
        <TableDateFilter />
      </div>
      <div className={styles.filter}>
        <FormGroupSelector />
      </div>
      <div className={styles.filter}>
        <DownloadCSVButton />
      </div>
      <div className={cx(styles.filter, styles.SearchEnd)}>
        <TextField
          id="filled-search"
          placeholder="Filter file list by name, zuid or code"
          type="search"
          variant="outlined"
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          onChange={(evt) => {
            let term = evt.target.value;
            if (term === null) return;
            dispatch(setFilterText(term));
          }}
        />
      </div>
    </header>
  );
}
