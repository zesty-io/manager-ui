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
import { importCode } from "../../../../store/imports";
import { importTargetType } from "../../../../store/imports";

import styles from "./RedirectImportTableRow.less";

function RedirectImportTableRow(props) {
  const handleCode = (val) => {
    props.dispatch(importCode(props.path, val));
  };

  const handlePathTarget = (evt) => {
    // const path = props.paths[evt.target.dataset.value];
    props.dispatch(importTarget(props.path, evt.target.value, ""));
  };

  const handleTargetType = (evt) => {
    props.dispatch(importTargetType(props.path, evt.target.value));
  };

  const handleQuery = (evt) => {
    props.dispatch(importQuery(props.path, evt.target.value));
  };

  const handleAddRedirect = (evt) => {
    props.dispatch(
      createRedirect({
        path: props.path,
        query_string: props.query_string,
        targetType: props.targetType,
        target: props.target_zuid || props.target,
        code: Number(props.code), // API expects a 301/302 numeric value
      })
    );
  };

  const handleToggle = (val) => {
    if (val === null) return;
    handleCode(val);
  };

  return (
    <div className={styles.RedirectImportTableRow}>
      <span className={styles.RowCell}>{props.path}</span>

      <span className={styles.RedirectCreatorCell}>
        <ToggleButtonGroup
          color="secondary"
          value={props.code}
          size="small"
          exclusive
          onChange={(evt, val) => handleToggle(val)}
        >
          <ToggleButton value={"302"}>302</ToggleButton>
          <ToggleButton value={"301"}>301</ToggleButton>
        </ToggleButtonGroup>
      </span>

      <span className={styles.RowCell}>
        <Select
          onChange={handleTargetType}
          size="small"
          fullWidth
          value={props.targetType}
        >
          <MenuItem value={"path"}>Wildcard</MenuItem>
          <MenuItem value={"page"}>Internal</MenuItem>
          <MenuItem value={"external"}>External</MenuItem>
        </Select>
      </span>

      <span className={styles.RowCell}>
        {/* {props.target_type === "page" ? (
          <Select
            className={styles.selector}
            onChange={(evt) => handlePathTarget(evt.target.value)}
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
        ) : ( */}
        <TextField
          onChange={handlePathTarget}
          defaultValue={props.target}
          size="small"
          variant="outlined"
          color="primary"
        />
        {/* )} */}
        {props.targetType === "path" && (
          <TextField
            onChange={handleQuery}
            placeholder="Redirect query string"
            defaultValue={props.query_string}
            size="small"
            variant="outlined"
            color="primary"
          />
        )}
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
