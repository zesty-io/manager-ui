import React from "react";
import { useDispatch } from "react-redux";
import cx from "classnames";

import { Search } from "@zesty-io/core/Search";
import { DownloadCSVButton } from "./DownloadCSVButton";
import { FormGroupSelector } from "./FormGroupSelector";
import { TableDateFilter } from "./TableDateFilter";

import { setFilterText } from "../../../store/filter";

import styles from "./LeadExporter.less";
export function LeadExporter() {
  const dispatch = useDispatch();

  return (
    <header className={styles.LeadExporter}>
      <div className={cx(styles.filter)}>
        <Search
          className={styles.Search}
          name="text-filter"
          placeholder="Search across all of your leads"
          onChange={(value) => {
            dispatch(setFilterText(value));
          }}
          onSubmit={(value) => {
            dispatch(setFilterText(value));
          }}
        />
      </div>
      <div className={cx(styles.filter, styles.Date)}>
        <TableDateFilter />
      </div>
      <div className={styles.filter}>
        <FormGroupSelector />
      </div>
      <div className={styles.filter}>
        <DownloadCSVButton />
      </div>
    </header>
  );
}
