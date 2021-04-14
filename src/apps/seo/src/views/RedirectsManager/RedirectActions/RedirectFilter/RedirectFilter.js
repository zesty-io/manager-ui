import React, { useState } from "react";

import { Search } from "@zesty-io/core/Search";

import styles from "./RedirectFilter.less";

export function RedirectFilter(props) {
  const [filter, setFilter] = useState("");

  const handleFilter = val => {
    props.dispatch({
      type: "REDIRECT_FILTER",
      filter: val
    });
    setFilter(val);
  };

  return (
    <Search
      className={styles.filter}
      onChange={handleFilter}
      placeholder="Filter your redirects by url"
      value={filter}
    />
  );
}
