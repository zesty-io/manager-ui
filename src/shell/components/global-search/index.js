import React from "react";

import { Search } from "@zesty-io/core/Search";

import styles from "./styles.less";
export default React.memo(function GlobalSearch(props) {
  return (
    <div className={cx(styles.GlobalSearch, props.className)}>
      <h1 className={styles.InstanceName}>zesty.pw prod testing instance</h1>
      <Search placeholder="Globally search your entire instance" />
    </div>
  );
});
