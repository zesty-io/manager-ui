import React, { useState } from "react";
import cx from "classnames";

import Button from "@mui/material/Button";

import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";

import { ToggleButton } from "@zesty-io/core/ToggleButton";
import { Select, Option } from "@zesty-io/core/Select";

import { createRedirect } from "../../../../store/redirects";
import { importTarget } from "../../../../store/imports";
import { importQuery } from "../../../../store/imports";

import styles from "./RedirectImportTableRow.less";

function RedirectImportTableRow(props) {
  const [code, setCode] = useState(1); // Toggle defaults to 301
  const [type, setType] = useState("page");

  const handleCode = (val) => {
    setCode(Number(val));
  };

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
        code: code === 1 ? 301 : 302, // API expects a 301/302 value
      })
    );
  };

  return (
    <div className={styles.RedirectImportTableRow}>
      <span className={styles.RowCell}>{props.path}</span>

      <span className={styles.RedirectCreatorCell}>
        <ToggleButton
          className={styles.code}
          name="redirectType"
          value={code}
          offValue="302"
          onValue="301"
          onChange={handleCode}
        />
      </span>

      <span className={styles.RowCell}>
        {props.target_type === "page" ? (
          <Select className={styles.selector} onSelect={handlePageTarget}>
            {Object.keys(props.paths).map((key) => {
              let path = props.paths[key];

              if (path.path_full !== props.target) {
                return (
                  <Option key={key} value={path.path_full}>
                    {path.path_full}
                  </Option>
                );
              } else {
                return (
                  <Option selected="true" key={key} value={path.path_full}>
                    {path.path_full}
                  </Option>
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
            sx={{ backgroundColor: "primary.contrastText" }}
          />
        )}
        <TextField
          onChange={handleQuery}
          placeholder="Redirect query string"
          defaultValue={props.query_string}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ backgroundColor: "primary.contrastText" }}
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
