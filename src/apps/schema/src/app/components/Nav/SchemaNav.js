import { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import cx from "classnames";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

import { Nav } from "@zesty-io/core/Nav";
import { Search } from "@zesty-io/core/Search";

import styles from "./SchemaNav.less";
export default function SchemaNav(props) {
  const history = useHistory();
  const location = useLocation();

  const [nav, setNav] = useState(props.nav);
  const [selected, setSelected] = useState(location.pathname);

  useEffect(() => {
    setNav(props.nav);
  }, [props.nav]);

  useEffect(() => {
    setSelected(location.pathname);
  }, [location.pathname]);

  return (
    <nav className={cx("SchemaNav", styles.SchemaNav)}>
      <div className={styles.Actions}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => history.push("/schema/new")}
          startIcon={<AddIcon />}
          sx={{
            justifyContent: "flex-start",
          }}
        >
          Create Model
        </Button>

        <TextField
          name="filter_schema"
          placeholder="Filter model list"
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
            if (term) {
              setNav(
                props.nav.filter(
                  (m) =>
                    m.label.toLowerCase().includes(term) ||
                    m.name.includes(term)
                )
              );
            } else {
              setNav(props.nav);
            }
          }}
          sx={{ mt: 1 }}
        />
      </div>

      <div className={styles.ModelList}>
        <h1 className={styles.NavTitle}>Content Model List</h1>
        <Nav
          className={styles.PageSets}
          id="pagesets"
          lightMode="true"
          name="pagesets"
          selected={selected}
          tree={nav}
        />
      </div>
    </nav>
  );
}
