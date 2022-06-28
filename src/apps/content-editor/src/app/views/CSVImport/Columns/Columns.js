import React from "react";

import cx from "classnames";

import { Select, MenuItem } from "@mui/material";

import { formatName } from "utility/formatName";

import styles from "./Columns.less";

export default function Columns(props) {
  const filterDeactivated = props.fields.filter((field) => !field.deletedAt);

  return (
    <header className={styles.TableHeader} style={props.style}>
      <span className={styles.wrap}>
        {props.cols.map((col, index) => {
          // Handles empty columns
          const colName = `${formatName(col)}-${index}`;
          return (
            <div key={index} className={styles.column}>
              <span className={cx(styles.Cell)}>{col.toUpperCase()}</span>
              <Select
                name={colName}
                onChange={(e) => {
                  props.handleMap(e.target.value, col);
                }}
                defaultValue="none"
                size="small"
              >
                <MenuItem value="none">none</MenuItem>
                {filterDeactivated.map((field) => (
                  <MenuItem key={field.name} value={field.name}>
                    {field.label}
                  </MenuItem>
                ))}
              </Select>
            </div>
          );
        })}
      </span>
    </header>
  );
}
