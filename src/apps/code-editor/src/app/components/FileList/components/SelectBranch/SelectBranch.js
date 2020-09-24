import React from "react";

import { Select, Option } from "@zesty-io/core/Select";

import styles from "./SelectBranch.less";
export const SelectBranch = React.memo(function SelectBranch(props) {
  return (
    <Select
      name="branch"
      className={styles.SelectBranch}
      value={props.branch}
      onChange={value => {
        props.setBranch(value);
      }}
    >
      <Option text="Dev" value="dev" />
      {/* <Option text="Stage" value="stage" />
    <Option text="Production" value="prod" />
    <Option text="fix/form-submission" value="1" />
    <Option text="feature/new-product" value="2" /> */}
    </Select>
  );
});
