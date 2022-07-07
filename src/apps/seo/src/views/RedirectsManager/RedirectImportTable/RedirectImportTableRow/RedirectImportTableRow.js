import React, { useState } from "react";
import cx from "classnames";

import {
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { createRedirect } from "../../../../store/redirects";
import { importTarget } from "../../../../store/imports";
import { importQuery } from "../../../../store/imports";

import styles from "./RedirectImportTableRow.less";

function RedirectImportTableRow(props) {
  const [code, setCode] = useState(301); // Toggle defaults to 301
  const [type, setType] = useState("page");

  const handlePageTarget = (evt) => {
    const path = props.paths[evt.target.dataset.value];
    props.dispatch(importTarget(props.path, path.path_full, path.zuid));
  };

  const handlePathTarget = (evt) => {
    console.log("// TODO handlePathTarget", evt);
    // setType()
  };

  const handleQuery = (evt) => {
    props.dispatch(importQuery(props.path, evt.target.value));
  };

  const handleAddRedirect = (evt) => {
    props.dispatch(
      createRedirect({
        path: props.path,
        query_string: props.query_string,
        targetType: props.target_type,
        target: props.target_zuid || props.target,
        code, // API expects a 301/302 value
      })
    );
  };

  const handleToggle = (val) => {
    if (val === null) return;
    setCode(val);
  };

  return (
    <div className={styles.RedirectImportTableRow}>
      <span className={styles.RowCell}>{props.path}</span>

      <span className={styles.RedirectCreatorCell}>
        <ToggleButtonGroup
          color="secondary"
          value={code}
          size="small"
          exclusive
          onChange={(evt, val) => handleToggle(val)}
        >
          <ToggleButton value={302}>302</ToggleButton>
          <ToggleButton value={301}>301</ToggleButton>
        </ToggleButtonGroup>
      </span>

      <span className={styles.RowCell}>
        {props.target_type === "page" ? (
          <Select
            className={styles.selector}
            onChange={(evt) => handlePageTarget(evt.target.value)}
            size="small"
            fullWidth
          >
            {Object.keys(props.paths).map((key) => {
              let path = props.paths[key];

              if (path.path_full !== props.target) {
                return (
                  <MenuItem key={key} value={path.path_full}>
                    {path.path_full}
                  </MenuItem>
                );
              } else {
                return (
                  <MenuItem selected key={key} value={path.path_full}>
                    {path.path_full}
                  </MenuItem>
                );
              }
            })}
          </Select>
        ) : (
          <TextField
            onChange={handlePathTarget}
            defaultValue={props.target}
            size="small"
            variant="outlined"
            color="primary"
          />
        )}
        <TextField
          onChange={handleQuery}
          placeholder="Redirect query string"
          defaultValue={props.query_string}
          size="small"
          variant="outlined"
          color="primary"
        />
      </span>

      <span className={cx(styles.RowCell, styles.RedirectButton)}>
        <Button
          variant="contained"
          onClick={handleAddRedirect}
          startIcon={<AddIcon />}
        >
          Redirect
        </Button>
      </span>
    </div>
  );
}

export default RedirectImportTableRow;
