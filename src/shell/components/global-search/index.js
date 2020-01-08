import React from "react";

import { Search } from "@zesty-io/core/Search";

import styles from "./styles.less";
export default React.memo(function GlobalSearch() {
  return (
    <div className={styles.GlobalSearch}>
      <Search placeholder="Search your whole instance" />
    </div>
  );
});
