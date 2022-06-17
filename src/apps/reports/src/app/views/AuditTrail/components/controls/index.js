import { memo } from "react";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

import { Search } from "@zesty-io/core/Search";

import styles from "./styles.less";
export default memo(function AuditControls(props) {
  return (
    <header className={styles.auditControls}>
      <ButtonGroup variant="contained">
        <Button
          color={props.filter === 1 ? "secondary" : "primary"}
          onClick={() => {
            if (props.filter === 1) {
              props.setFilter(-1);
            } else {
              props.setFilter(1);
            }
          }}
        >
          Today
        </Button>
        <Button
          color={props.filter === 7 ? "secondary" : "primary"}
          onClick={() => {
            if (props.filter === 7) {
              props.setFilter(-1);
            } else {
              props.setFilter(7);
            }
          }}
        >
          Last Week
        </Button>
        <Button
          color={props.filter === 30 ? "secondary" : "primary"}
          onClick={() => {
            if (props.filter === 30) {
              props.setFilter(-1);
            } else {
              props.setFilter(30);
            }
          }}
        >
          Last Month
        </Button>
      </ButtonGroup>

      <TextField
        placeholder="Search AuditTrail Logs"
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
          let term = evt.target.value.trim().toLowerCase();
          if (term === null) return;
          props.setSearch(term);
        }}
        sx={{ maxWidth: "400px", marginLeft: "auto" }}
      />
    </header>
  );
});
