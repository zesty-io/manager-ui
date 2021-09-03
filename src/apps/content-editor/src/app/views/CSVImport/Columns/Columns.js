import React from "react";

import cx from "classnames";

import { Select, Option } from "@zesty-io/core";

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
                onSelect={(value) => {
                  props.handleMap(value, col);
                }}
                value="none"
              >
                <Option text="none" value="none" />
                {filterDeactivated.map((field) => (
                  <Option
                    key={field.name}
                    text={field.label}
                    value={field.name}
                  />
                ))}
              </Select>
            </div>
          );
        })}
      </span>
    </header>
  );
}
