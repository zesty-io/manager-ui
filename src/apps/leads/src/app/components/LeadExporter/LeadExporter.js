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
          name="text-filter"
          placeholder="Search across all of your leads"
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
            const term = evt.target.value;

            dispatch(setFilterText(term));
          }}
        />
      </div>
    </header>
  );
}
